import type { TaskConfig, WorkflowConfig } from "payload";
import { draftSpeciesSection } from "@/lib/drafting";
import { DRAFT_SECTIONS, type DraftSection } from "@/lib/drafting/sections";

type SectionTask = TaskConfig<{
  input: { species: number };
  output: { drafted: boolean };
}>;

const LABELS: Record<DraftSection, string> = {
  carving: "Skriv snitning, hårdhed og tørring",
  safety: "Skriv fødevaresikkerhed",
  identification: "Skriv kendetegn og navne",
};

function taskSlug(section: DraftSection) {
  return `draft${section[0]?.toUpperCase()}${section.slice(1)}` as const;
}

/** One task per section, each a single Claude call (architecture spec §5). */
export const draftSectionTasks: SectionTask[] = DRAFT_SECTIONS.map(
  (section) => ({
    slug: taskSlug(section),
    label: LABELS[section],
    inputSchema: [{ name: "species", type: "number", required: true }],
    outputSchema: [{ name: "drafted", type: "checkbox", required: true }],
    retries: 1,
    handler: async ({ input, req }) => {
      const outcome = await draftSpeciesSection(
        { payload: req.payload, req },
        input.species,
        section,
      );
      return { output: { drafted: outcome.drafted } };
    },
  }),
);

export const draftCardWorkflow: WorkflowConfig<{ species: number }> = {
  slug: "draftCard",
  label: "Skriv AI-udkast til kort",
  inputSchema: [{ name: "species", type: "number", required: true }],
  handler: async ({ job, tasks }) => {
    const species = job.input.species;
    await tasks.draftCarving("carving", { input: { species } });
    await tasks.draftSafety("safety", { input: { species } });
    await tasks.draftIdentification("identification", { input: { species } });
  },
};
