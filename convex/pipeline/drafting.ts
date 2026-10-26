"use node";

import { v } from "convex/values";
import { createDraftClient, draftSection } from "../../src/lib/drafting/claude";
import { DRAFT_SECTIONS } from "../../src/lib/drafting/sections";
import {
  buildDraftUpdate,
  type CurrentCard,
} from "../../src/lib/drafting/submission";
import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";

/**
 * Drafts a card with Claude, one section at a time: carving, safety, then
 * identification, each saved before the next starts. The card's text before
 * the draft is kept as a revision. Needs ANTHROPIC_API_KEY in the Convex
 * environment.
 */
export const draftCard = internalAction({
  args: { jobId: v.id("jobs") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const job = await ctx.runQuery(internal.pipeline.data.jobContext, args);
    if (!job) return null;
    if (!job.draftable) {
      await ctx.runMutation(internal.pipeline.data.markFinished, {
        ...args,
        error: "Kortet er godkendt eller udgivet og bliver ikke skrevet om.",
      });
      return null;
    }
    await ctx.runMutation(internal.pipeline.data.markRunning, args);
    try {
      const client = createDraftClient();
      await ctx.runMutation(internal.pipeline.data.saveDraftRevision, {
        speciesId: job.speciesId,
      });
      for (const section of DRAFT_SECTIONS) {
        const { input } = await draftSection(client, section, job);
        const current = JSON.parse(
          await ctx.runQuery(internal.pipeline.data.draftContext, {
            speciesId: job.speciesId,
          }),
        ) as CurrentCard;
        const applied = await ctx.runMutation(
          internal.pipeline.data.applyDraft,
          {
            speciesId: job.speciesId,
            updateJson: JSON.stringify(
              buildDraftUpdate(section, input, current),
            ),
          },
        );
        if (!applied) break;
      }
      await ctx.runMutation(internal.pipeline.data.markFinished, args);
    } catch (error) {
      await ctx.runMutation(internal.pipeline.data.markFinished, {
        ...args,
        error: error instanceof Error ? error.message : String(error),
      });
    }
    return null;
  },
});
