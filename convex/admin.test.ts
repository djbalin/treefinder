/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");
const SECRET = "test-admin-secret";
const admin = { adminSecret: SECRET };

beforeEach(() => {
  vi.stubEnv("ADMIN_SECRET", SECRET);
});
afterEach(() => {
  vi.unstubAllEnvs();
});

const SLOTS = ["wholeTree", "leaf", "bark", "winterTwig"] as const;

function first<T>(items: T[]): T {
  const item = items[0];
  if (item === undefined) throw new Error("expected an item");
  return item;
}

async function setup() {
  const t = convexTest(schema, modules);
  const id = await t.run((ctx) =>
    ctx.db.insert("species", {
      slug: "lind",
      name: { da: "Lind" },
      latinName: "Tilia cordata",
      isWarning: false,
      launchWave: "launch",
      status: "approved",
      greenCarving: "easy",
      dryHardness: "soft",
      grainTexture: { da: "Fin." },
      goodFor: { da: "Skeer." },
      drying: { da: "Hurtigt." },
      foodSafety: { da: "Sikker." },
      foodSafetyChecked: true,
      sources: [
        { title: "Kilde", url: "https://example.com", field: "general" },
      ],
    }),
  );
  return { t, id };
}

async function addPhotos(
  t: Awaited<ReturnType<typeof setup>>["t"],
  speciesId: Id<"species">,
  status: "selected" | "candidate",
  poster = status === "selected",
) {
  return t.run(async (ctx) => {
    const ids: Id<"photos">[] = [];
    for (const slot of SLOTS) {
      ids.push(
        await ctx.db.insert("photos", {
          speciesId,
          slot,
          status,
          poster,
          source: "upload",
          license: "own",
          author: "A",
          attribution: `A, ${slot}, ${status}`,
        }),
      );
    }
    return ids;
  });
}

describe("admin access", () => {
  it("refuses callers without the admin role or the secret", async () => {
    const { t, id } = await setup();
    await expect(t.query(api.admin.species.list, {})).rejects.toThrow(/adgang/);
    await expect(
      t.query(api.admin.species.list, { adminSecret: "wrong" }),
    ).rejects.toThrow(/adgang/);
    await expect(
      t.mutation(api.admin.species.setStatus, { id, status: "published" }),
    ).rejects.toThrow(/adgang/);
    await expect(
      t.withIdentity({ subject: "someone" }).query(api.admin.species.list, {}),
    ).rejects.toThrow(/adgang/);
  });

  it("lets a signed-in user with the admin role in", async () => {
    const { t } = await setup();
    const identity = t.withIdentity({ subject: "maintainer" });
    await t.run(async (ctx) => {
      await ctx.db.insert("users", {
        tokenIdentifier: "https://convex.test|maintainer",
        role: "admin",
      });
    });
    const list = await identity.query(api.admin.species.list, {});
    expect(list.map((item) => item.slug)).toEqual(["lind"]);
  });

  it("accepts the interim secret", async () => {
    const { t } = await setup();
    const list = await t.query(api.admin.species.list, admin);
    expect(list).toHaveLength(1);
  });
});

describe("publishing", () => {
  it("refuses to publish a card that breaks a rule", async () => {
    const { t, id } = await setup();
    await expect(
      t.mutation(api.admin.species.setStatus, {
        ...admin,
        id,
        status: "published",
      }),
    ).rejects.toThrow(/Mangler plakatfoto/);
  });

  it("publishes once every rule holds", async () => {
    const { t, id } = await setup();
    await addPhotos(t, id, "selected");
    await t.mutation(api.admin.species.setStatus, {
      ...admin,
      id,
      status: "published",
    });
    const card = await t.query(api.species.getPublishedBySlug, {
      slug: "lind",
      locale: "da",
    });
    expect(card?.name).toBe("Lind");
  });

  it("needs a poster, not just a selected photo, in each required slot", async () => {
    const { t, id } = await setup();
    await addPhotos(t, id, "selected", false);
    await expect(
      t.mutation(api.admin.species.setStatus, {
        ...admin,
        id,
        status: "published",
      }),
    ).rejects.toThrow(/Mangler plakatfoto/);
  });

  it("keeps a published card's required photos", async () => {
    const { t, id } = await setup();
    const photo = first(await addPhotos(t, id, "selected"));
    await t.mutation(api.admin.species.setStatus, {
      ...admin,
      id,
      status: "published",
    });
    await expect(
      t.mutation(api.admin.photos.reject, { ...admin, photoId: photo }),
    ).rejects.toThrow(/Kan ikke udgive/);
  });
});

describe("photos", () => {
  it("keeps the other selected photos when one is added", async () => {
    const { t, id } = await setup();
    const previous = first(await addPhotos(t, id, "selected"));
    const next = first(await addPhotos(t, id, "candidate"));
    await t.mutation(api.admin.photos.select, {
      ...admin,
      photoId: next,
      slot: "wholeTree",
    });
    const statuses = await t.run(async (ctx) => [
      (await ctx.db.get("photos", previous))?.status,
      (await ctx.db.get("photos", next))?.status,
    ]);
    expect(statuses).toEqual(["selected", "selected"]);
  });

  it("allows one poster per slot", async () => {
    const { t, id } = await setup();
    const previous = first(await addPhotos(t, id, "selected"));
    const next = first(await addPhotos(t, id, "selected", false));
    await t.mutation(api.admin.photos.setPoster, { ...admin, photoId: next });
    const posters = await t.run(async (ctx) => [
      (await ctx.db.get("photos", previous))?.poster,
      (await ctx.db.get("photos", next))?.poster,
    ]);
    expect(posters).toEqual([false, true]);
  });

  it("only stars photos in the gallery", async () => {
    const { t, id } = await setup();
    const candidate = first(await addPhotos(t, id, "candidate"));
    await expect(
      t.mutation(api.admin.photos.setPoster, { ...admin, photoId: candidate }),
    ).rejects.toThrow(/galleriet/);
  });
});

describe("jobs", () => {
  it("queues a catalog fetch for one slot and records it", async () => {
    vi.useFakeTimers();
    const { t, id } = await setup();
    const jobId = await t.mutation(api.admin.jobs.fetchCatalog, {
      ...admin,
      speciesId: id,
      slot: "bark",
    });
    const job = await t.run((ctx) => ctx.db.get("jobs", jobId));
    expect(job).toMatchObject({
      kind: "fetchCatalog",
      slot: "bark",
      status: "queued",
    });
    vi.useRealTimers();
  });

  it("refuses to draft an approved card", async () => {
    const { t, id } = await setup();
    await expect(
      t.mutation(api.admin.jobs.draftCard, { ...admin, speciesId: id }),
    ).rejects.toThrow(/Kun AI-udkast/);
  });
});
