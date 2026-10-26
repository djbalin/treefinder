/**
 * Seeds the species list from specs/species.md (idempotent: existing species
 * keep their card content) and, optionally, the first admin user.
 *
 *   pnpm seed
 *   SEED_ADMIN_EMAIL=me@example.com SEED_ADMIN_PASSWORD=... pnpm seed
 */
import "dotenv/config";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import config from "@payload-config";
import { getPayload, type Payload } from "payload";
import { richTextFromParagraphs } from "@/domain/richText";
import { parseSpeciesTable, type SpeciesSeed } from "@/domain/speciesList";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function main() {
  const payload = await getPayload({ config });
  const markdown = await readFile(path.join(root, "specs/species.md"), "utf8");
  const seeds = parseSpeciesTable(markdown);

  const ids = new Map<string, number>();
  for (const seed of seeds) {
    ids.set(seed.slug, await upsertSpecies(payload, seed));
  }
  await linkLookAlikes(payload, seeds, ids);
  await seedPages(payload);
  await seedAdmin(payload);

  payload.logger.info(`Seeded ${seeds.length} species.`);
  process.exit(0);
}

async function upsertSpecies(
  payload: Payload,
  seed: SpeciesSeed,
): Promise<number> {
  const existing = await payload.find({
    collection: "species",
    where: { slug: { equals: seed.slug } },
    limit: 1,
    depth: 0,
  });
  const base = {
    latinName: seed.latinName,
    launchWave: seed.launchWave,
    isWarning: seed.isWarning,
    localNames: { da: [seed.nameDa], en: [seed.nameEn] },
  };

  const found = existing.docs[0];
  const doc = found
    ? await payload.update({
        collection: "species",
        id: found.id,
        data: base,
        locale: "da",
      })
    : await payload.create({
        collection: "species",
        data: {
          ...base,
          slug: seed.slug,
          name: seed.nameDa,
          status: "aiDraft",
        },
        locale: "da",
      });

  await payload.update({
    collection: "species",
    id: doc.id,
    data: { name: seed.nameEn },
    locale: "en",
  });
  return doc.id;
}

async function linkLookAlikes(
  payload: Payload,
  seeds: SpeciesSeed[],
  ids: Map<string, number>,
) {
  const byEnglishName = new Map(
    seeds.map((seed) => [seed.nameEn.toLowerCase(), seed.slug]),
  );

  for (const seed of seeds) {
    if (!seed.lookAlikeOf) continue;
    const otherSlug = byEnglishName.get(seed.lookAlikeOf.toLowerCase());
    const id = ids.get(seed.slug);
    const otherId = otherSlug ? ids.get(otherSlug) : undefined;
    if (!id || !otherId) {
      payload.logger.warn(
        `Unknown look-alike "${seed.lookAlikeOf}" for ${seed.slug}.`,
      );
      continue;
    }
    // Look-alikes go both ways.
    await addLookAlike(payload, id, otherId);
    await addLookAlike(payload, otherId, id);
  }
}

async function addLookAlike(payload: Payload, id: number, otherId: number) {
  const doc = await payload.findByID({ collection: "species", id, depth: 0 });
  const current = (doc.lookAlikes ?? []).map((item) =>
    typeof item === "object" ? item.id : item,
  );
  if (current.includes(otherId)) return;
  await payload.update({
    collection: "species",
    id,
    data: { lookAlikes: [...current, otherId] },
  });
}

/**
 * Starter text for the static pages, in Danish only. The admin edits it in
 * Payload; the seed never overwrites a page that already has a title.
 */
const PAGE_SEEDS = [
  {
    slug: "whereToGetWood",
    titleDa: "Skaf træ",
    titleEn: "Where to get wood",
    paragraphs: [
      "Du må ikke bare fælde eller skære grene af træer, du finder. Her er de lovlige veje til friskt træ at snitte i.",
      "Træplejere og anlægsgartnere fælder og beskærer træer hver uge og skal ofte af med veddet. Spørg dem, du ser arbejde i nærheden, eller ring til et lokalt firma.",
      "Stormfald: efter en storm ligger der væltede træer i haver, parker og langs veje. Spørg altid ejeren, før du tager noget.",
      "Haver: naboer, kolonihaver og familie beskærer frugttræer og hække om vinteren. Æble, pære og kirsebær er gode at snitte i.",
      "Sankekort: i statsskovene kan du købe et sankekort hos Naturstyrelsen, som giver lov til at samle løst træ som grene og kvas fra skovbunden. Uden kort må du kun samle små kviste til eget brug.",
      "Selvskovning: nogle skovejere og Naturstyrelsen lader dig fælde udpegede træer mod betaling. Træerne er som regel mærket på forhånd.",
      "Sankning og selvskovning foregår ofte kun i vinterhalvåret. Tjek reglerne for den enkelte skov.",
    ],
  },
  {
    slug: "about",
    titleDa: "Om Treefinder",
    titleEn: "About Treefinder",
    paragraphs: [
      "Treefinder er et gratis opslagsværk for træskærere. Hvert træ har et kort med, hvordan det er at snitte i, hvad det egner sig til, hvordan du tørrer det, og hvordan du kender det.",
      "Alle oplysninger har en kilde, og kortene bliver gennemgået, før de bliver udgivet.",
    ],
  },
] as const;

async function seedPages(payload: Payload) {
  for (const page of PAGE_SEEDS) {
    const current = await payload.findGlobal({ slug: page.slug, locale: "da" });
    if (current.title) continue;
    await payload.updateGlobal({
      slug: page.slug,
      data: {
        title: page.titleDa,
        content: richTextFromParagraphs([...page.paragraphs]),
      },
      locale: "da",
    });
    await payload.updateGlobal({
      slug: page.slug,
      data: { title: page.titleEn },
      locale: "en",
    });
  }
}

async function seedAdmin(payload: Payload) {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password) return;

  const existing = await payload.find({
    collection: "users",
    where: { email: { equals: email } },
    limit: 1,
  });
  if (existing.docs.length > 0) return;
  await payload.create({ collection: "users", data: { email, password } });
  payload.logger.info(`Created admin ${email}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
