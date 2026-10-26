import { after } from "next/server";
import {
  addDataAndFileToRequest,
  type Endpoint,
  type PayloadRequest,
} from "payload";
import { PHOTO_SLOTS, type PhotoSlot } from "@/domain/options";
import { rejectPhoto, selectPhoto } from "@/lib/photos";

function requireAdmin(req: PayloadRequest): Response | null {
  return req.user
    ? null
    : Response.json({ error: "Kun for administratorer." }, { status: 401 });
}

function idParam(req: PayloadRequest): number | null {
  const id = Number(req.routeParams?.id);
  return Number.isInteger(id) ? id : null;
}

/** Queues a workflow for a species and runs it after the response is sent. */
function queueSpeciesWorkflow(
  workflow: "fetchPhotoCandidates" | "draftCard",
): Endpoint["handler"] {
  return async (req) => {
    const denied = requireAdmin(req);
    if (denied) return denied;
    const species = idParam(req);
    if (species === null) {
      return Response.json({ error: "Ugyldigt id." }, { status: 400 });
    }

    const job = await req.payload.jobs.queue({
      workflow,
      input: { species },
      req,
    });
    const { payload } = req;
    after(async () => {
      await payload.jobs.runByID({ id: job.id });
    });
    return Response.json({ jobId: job.id }, { status: 202 });
  };
}

/**
 * POST /api/species/:id/draft-card. Queues the card drafting workflow
 * (product spec §7.4) and runs it after the response.
 */
export const draftCardEndpoint: Endpoint = {
  path: "/:id/draft-card",
  method: "post",
  handler: queueSpeciesWorkflow("draftCard"),
};

/**
 * POST /api/species/:id/fetch-photos. Queues the photo workflow and runs it
 * right after the response is sent (architecture spec §5, runtime model).
 */
export const fetchPhotosEndpoint: Endpoint = {
  path: "/:id/fetch-photos",
  method: "post",
  handler: queueSpeciesWorkflow("fetchPhotoCandidates"),
};

/** POST /api/photos/:id/select with `{ "slot": "bark" }`. */
export const selectPhotoEndpoint: Endpoint = {
  path: "/:id/select",
  method: "post",
  handler: async (req) => {
    const denied = requireAdmin(req);
    if (denied) return denied;
    const id = idParam(req);
    await addDataAndFileToRequest(req);
    const slot = req.data?.slot as PhotoSlot | undefined;
    if (id === null || !slot || !PHOTO_SLOTS.includes(slot)) {
      return Response.json(
        { error: "Ugyldigt foto eller plads." },
        { status: 400 },
      );
    }

    try {
      const photo = await selectPhoto({ payload: req.payload, req }, id, slot);
      return Response.json({
        id: photo.id,
        status: photo.status,
        slot: photo.slot,
      });
    } catch (error) {
      return Response.json(
        { error: (error as Error).message },
        { status: 422 },
      );
    }
  },
};

/** POST /api/photos/:id/reject */
export const rejectPhotoEndpoint: Endpoint = {
  path: "/:id/reject",
  method: "post",
  handler: async (req) => {
    const denied = requireAdmin(req);
    if (denied) return denied;
    const id = idParam(req);
    if (id === null)
      return Response.json({ error: "Ugyldigt id." }, { status: 400 });

    const photo = await rejectPhoto({ payload: req.payload, req }, id);
    return Response.json({ id: photo.id, status: photo.status });
  },
};
