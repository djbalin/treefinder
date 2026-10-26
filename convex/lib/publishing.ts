import { ConvexError } from "convex/values";
import type { PhotoSlot } from "../../src/domain/options";
import {
  describeBlockers,
  getPublishBlockers,
  type PublishBlocker,
} from "../../src/domain/publishRules";
import type { Doc } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";

/** Slots that have a selected photo for the species. */
export async function selectedSlots(
  ctx: QueryCtx,
  species: Doc<"species">,
): Promise<PhotoSlot[]> {
  const photos = await ctx.db
    .query("photos")
    .withIndex("by_species_and_status", (q) =>
      q.eq("speciesId", species._id).eq("status", "selected"),
    )
    .take(10);
  return photos.flatMap((photo) => (photo.slot ? [photo.slot] : []));
}

/** What stops the card from being published (product spec §7.3), in Danish. */
export async function publishBlockers(
  ctx: QueryCtx,
  species: Doc<"species">,
): Promise<PublishBlocker[]> {
  return getPublishBlockers(
    {
      name: species.name.da,
      greenCarving: species.greenCarving,
      dryHardness: species.dryHardness,
      grainTexture: species.grainTexture?.da,
      goodFor: species.goodFor?.da,
      drying: species.drying?.da,
      foodSafety: species.foodSafety?.da,
      foodSafetyChecked: species.foodSafetyChecked,
      isWarning: species.isWarning,
      warningReason: species.warningReason?.da,
      sources: species.sources,
    },
    await selectedSlots(ctx, species),
  );
}

/** Throws a Danish error when a published card would break a rule. */
export async function assertPublishable(
  ctx: QueryCtx,
  species: Doc<"species">,
): Promise<void> {
  if (species.status !== "published") return;
  const blockers = await publishBlockers(ctx, species);
  if (blockers.length > 0) {
    throw new ConvexError(`Kan ikke udgive: ${describeBlockers(blockers)}`);
  }
}
