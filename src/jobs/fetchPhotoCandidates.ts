import type { TaskConfig, WorkflowConfig } from "payload";
import { collectCommons, collectInaturalist } from "@/lib/photos";

const speciesInput = [
  { name: "species", type: "number", required: true },
] as const;
const countOutput = [
  { name: "added", type: "number", required: true },
] as const;

/**
 * One task per source, so a cut-off run resumes at the source that failed
 * (architecture spec §5, runtime model).
 */
export const fetchCommonsTask: TaskConfig<{
  input: { species: number };
  output: { added: number };
}> = {
  slug: "fetchCommonsPhotos",
  label: "Hent fotokandidater fra Wikimedia Commons",
  inputSchema: [...speciesInput],
  outputSchema: [...countOutput],
  retries: 2,
  handler: async ({ input, req }) => ({
    output: {
      added: await collectCommons({ payload: req.payload, req }, input.species),
    },
  }),
};

export const fetchInaturalistTask: TaskConfig<{
  input: { species: number };
  output: { added: number };
}> = {
  slug: "fetchInaturalistPhotos",
  label: "Hent fotokandidater fra iNaturalist",
  inputSchema: [...speciesInput],
  outputSchema: [...countOutput],
  retries: 2,
  handler: async ({ input, req }) => ({
    output: {
      added: await collectInaturalist(
        { payload: req.payload, req },
        input.species,
      ),
    },
  }),
};

export const fetchPhotoCandidatesWorkflow: WorkflowConfig<{ species: number }> =
  {
    slug: "fetchPhotoCandidates",
    label: "Hent fotokandidater",
    inputSchema: [...speciesInput],
    handler: async ({ job, tasks }) => {
      const species = job.input.species;
      await tasks.fetchCommonsPhotos("commons", { input: { species } });
      await tasks.fetchInaturalistPhotos("inaturalist", { input: { species } });
    },
  };
