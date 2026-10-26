/**
 * Starter text for the static pages, in Danish with English titles. The
 * admin edits it later; the seed never overwrites a page that exists.
 */
export const PAGE_SEEDS = [
  {
    slug: "whereToGetWood",
    title: { da: "Skaf træ", en: "Where to get wood" },
    content: [
      "Du må ikke bare fælde eller skære grene af træer, du finder. Her er de lovlige veje til friskt træ at snitte i.",
      "**Træplejere og anlægsgartnere** fælder og beskærer træer hver uge og skal ofte af med veddet. Spørg dem, du ser arbejde i nærheden, eller ring til et lokalt firma.",
      "**Stormfald:** efter en storm ligger der væltede træer i haver, parker og langs veje. Spørg altid ejeren, før du tager noget.",
      "**Haver:** naboer, kolonihaver og familie beskærer frugttræer og hække om vinteren. Æble, pære og kirsebær er gode at snitte i.",
      "**Sankekort:** i statsskovene kan du købe et sankekort hos Naturstyrelsen, som giver lov til at samle løst træ som grene og kvas fra skovbunden. Uden kort må du kun samle små kviste til eget brug.",
      "**Selvskovning:** nogle skovejere og Naturstyrelsen lader dig fælde udpegede træer mod betaling. Træerne er som regel mærket på forhånd.",
      "Sankning og selvskovning foregår ofte kun i vinterhalvåret. Tjek reglerne for den enkelte skov.",
    ].join("\n\n"),
  },
  {
    slug: "about",
    title: { da: "Om Treefinder", en: "About Treefinder" },
    content: [
      "Treefinder er et gratis opslagsværk for træskærere. Hvert træ har et kort med, hvordan det er at snitte i, hvad det egner sig til, hvordan du tørrer det, og hvordan du kender det.",
      "Alle oplysninger har en kilde, og kortene bliver gennemgået, før de bliver udgivet.",
    ].join("\n\n"),
  },
] as const;
