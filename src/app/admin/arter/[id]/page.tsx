import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  draftCardAction,
  fetchPhotosAction,
  saveSpeciesAction,
  setStatusAction,
  uploadPhotoAction,
} from "@/app/admin/actions";
import {
  Button,
  Checkbox,
  FieldSet,
  Notice,
  Select,
  TextArea,
  TextField,
} from "@/components/admin/forms";
import { PhotoCard } from "@/components/admin/PhotoCard";
import { PageTitle } from "@/components/ui";
import { optionLabel } from "@/domain/labels";
import {
  CARD_STATUSES,
  cardStatusOptions,
  difficultyOptions,
  FILTER_TRAITS,
  type FilterTrait,
  filterTraitLabels,
  filterValueLabels,
  hardnessOptions,
  launchWaveOptions,
  photoSlotOptions,
  sourceFieldOptions,
  useOptions,
} from "@/domain/options";
import { adminQuery } from "@/lib/admin/convex";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ gemt?: string; fejl?: string }>;
};

/** Empty source rows offered below the existing ones. */
const BLANK_SOURCES = 3;

const da = (options: { value: string; label: { da: string } }[]) =>
  options.map((option) => ({ value: option.value, label: option.label.da }));

export default async function SpeciesEditorPage({
  params,
  searchParams,
}: Props) {
  const { id: rawId } = await params;
  const id = rawId as Id<"species">;
  const { gemt, fejl } = await searchParams;
  const t = await getTranslations("Admin");
  const tCard = await getTranslations("Card");

  const data = await adminQuery(api.admin.species.get, { id });
  if (!data) notFound();
  const photos = await adminQuery(api.admin.photos.forSpecies, {
    speciesId: id,
  });
  const { species, blockers, jobs } = data;
  const returnTo = `/admin/arter/${id}`;
  const features = species.idFeatures ?? {};
  const sources = [
    ...(species.sources ?? []),
    ...Array.from({ length: BLANK_SOURCES }, () => null),
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Link href="/admin" className="text-accent hover:underline">
          {t("back")}
        </Link>
        <PageTitle>{species.name.da}</PageTitle>
        <p className="text-lg italic text-ink-muted">{species.latinName}</p>
        <Notice saved={gemt === "1"} error={fejl} savedText={t("saved")} />
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <h2 className="font-display text-xl font-bold">
            {t("status")}:{" "}
            {optionLabel(cardStatusOptions, species.status, "da")}
          </h2>
          {blockers.length > 0 ? (
            <div>
              <p className="font-semibold">{t("blockersHeading")}</p>
              <ul className="list-disc pl-6">
                {blockers.map((blocker) => (
                  <li key={blocker}>{blocker}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="font-semibold text-plate">{t("readyToPublish")}</p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <span>{t("setStatus")}</span>
            {CARD_STATUSES.filter((status) => status !== species.status).map(
              (status) => (
                <form
                  key={status}
                  action={setStatusAction.bind(null, id, status)}
                >
                  <Button tone={status === "published" ? "plate" : "quiet"}>
                    {optionLabel(cardStatusOptions, status, "da")}
                  </Button>
                </form>
              ),
            )}
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="font-display text-xl font-bold">{t("jobsHeading")}</h2>
          <div className="flex flex-wrap gap-2">
            <form action={fetchPhotosAction.bind(null, id)}>
              <Button>{t("fetchPhotos")}</Button>
            </form>
            <form action={draftCardAction.bind(null, id)}>
              <Button>{t("draftCard")}</Button>
            </form>
          </div>
          {jobs.length === 0 ? (
            <p className="text-ink-muted">{t("noJobs")}</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {jobs.map((job) => (
                <li key={job.id}>
                  {t(`jobKind.${job.kind}` as "jobKind.fetchPhotos")}:{" "}
                  {t(`jobStatus.${job.status}` as "jobStatus.done")}
                  {job.error ? (
                    <span className="text-warning"> · {job.error}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-bold">{t("photosHeading")}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {photos.map((photo) => (
            <PhotoCard key={photo.id} photo={photo} returnTo={returnTo} />
          ))}
        </div>
        <form
          action={uploadPhotoAction.bind(null, id)}
          className="flex flex-wrap items-end gap-3"
        >
          <label className="block space-y-1 font-display font-semibold">
            <span>{t("uploadHeading")}</span>
            <input
              type="file"
              name="file"
              accept="image/*"
              className="block font-body font-normal"
            />
          </label>
          <Select
            label={t("slot")}
            name="slot"
            options={da(photoSlotOptions)}
          />
          <TextField label={t("author")} name="author" />
          <Button tone="quiet">{t("upload")}</Button>
        </form>
      </section>

      <form action={saveSpeciesAction.bind(null, id)} className="space-y-8">
        <FieldSet legend={t("basics")}>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label={t("nameDa")}
              name="name"
              defaultValue={species.name.da}
            />
            <TextField
              label={t("latinName")}
              name="latinName"
              defaultValue={species.latinName}
            />
            <Select
              label={t("wave")}
              name="launchWave"
              defaultValue={species.launchWave}
              options={da(launchWaveOptions)}
            />
          </div>
          <Checkbox
            label={t("isWarning")}
            name="isWarning"
            defaultChecked={species.isWarning}
          />
          <TextField
            label={t("warningReason")}
            name="warningReason"
            defaultValue={species.warningReason?.da}
          />
        </FieldSet>

        <FieldSet legend={t("carving")}>
          <p className="text-sm text-ink-muted">{t("markdownHint")}</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <Select
              label={tCard("greenCarving")}
              name="greenCarving"
              defaultValue={species.greenCarving}
              options={da(difficultyOptions)}
              emptyLabel={t("none")}
            />
            <Select
              label={tCard("dryHardness")}
              name="dryHardness"
              defaultValue={species.dryHardness}
              options={da(hardnessOptions)}
              emptyLabel={t("none")}
            />
            <TextField
              label={t("jankaN")}
              name="jankaN"
              type="number"
              defaultValue={species.jankaN}
            />
          </div>
          <TextArea
            label={tCard("grainTexture")}
            name="grainTexture"
            defaultValue={species.grainTexture?.da}
          />
          <TextArea
            label={tCard("colourSmell")}
            name="colourSmell"
            defaultValue={species.colourSmell?.da}
          />
          <fieldset className="space-y-2">
            <legend className="font-display font-semibold">
              {tCard("goodFor")}
            </legend>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {useOptions.map((option) => (
                <Checkbox
                  key={option.value}
                  label={option.label.da}
                  name="goodForTags"
                  value={option.value}
                  defaultChecked={species.goodForTags?.includes(option.value)}
                />
              ))}
            </div>
          </fieldset>
          <TextArea
            label={tCard("goodFor")}
            name="goodFor"
            defaultValue={species.goodFor?.da}
          />
          <TextArea
            label={tCard("riving")}
            name="riving"
            defaultValue={species.riving?.da}
          />
          <TextArea
            label={tCard("drying")}
            name="drying"
            defaultValue={species.drying?.da}
          />
        </FieldSet>

        <FieldSet legend={t("safety")}>
          <TextArea
            label={tCard("foodSafety")}
            name="foodSafety"
            defaultValue={species.foodSafety?.da}
          />
          <Checkbox
            label={t("foodSafetyChecked")}
            name="foodSafetyChecked"
            defaultChecked={species.foodSafetyChecked}
          />
        </FieldSet>

        <FieldSet legend={t("identification")}>
          {(
            [
              ["id_shape", "wholeTree", features.shape?.da],
              ["id_leaf", "leaf", features.leaf?.da],
              ["id_bark", "bark", features.bark?.da],
              ["id_twig", "winterTwig", features.twig?.da],
              ["id_cutWood", "cutWood", features.cutWood?.da],
            ] as const
          ).map(([name, slot, value]) => (
            <TextArea
              key={name}
              label={optionLabel(photoSlotOptions, slot, "da")}
              name={name}
              defaultValue={value}
              rows={3}
            />
          ))}
        </FieldSet>

        <FieldSet legend={t("traits")}>
          {(Object.keys(FILTER_TRAITS) as FilterTrait[]).map((trait) => (
            <fieldset key={trait} className="space-y-1">
              <legend className="font-display font-semibold">
                {filterTraitLabels[trait].da}
              </legend>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {FILTER_TRAITS[trait].map((value) => (
                  <Checkbox
                    key={value}
                    label={filterValueLabels[value]?.da ?? value}
                    name={`trait_${trait}`}
                    value={value}
                    defaultChecked={(
                      species.filterTraits?.[trait] as string[] | undefined
                    )?.includes(value)}
                  />
                ))}
              </div>
            </fieldset>
          ))}
        </FieldSet>

        <FieldSet legend={t("sources")}>
          {sources.map((source, index) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: rows are positional form fields
              key={index}
              className="grid gap-3 sm:grid-cols-[2fr_3fr_1fr]"
            >
              <TextField
                label={t("sourceTitle")}
                name={`source_title_${index}`}
                defaultValue={source?.title}
              />
              <TextField
                label={t("sourceUrl")}
                name={`source_url_${index}`}
                type="url"
                defaultValue={source?.url}
              />
              <Select
                label={t("sourceField")}
                name={`source_field_${index}`}
                defaultValue={source?.field ?? "general"}
                options={da(sourceFieldOptions)}
              />
            </div>
          ))}
        </FieldSet>

        <FieldSet legend={t("reviewNotes")}>
          <TextArea
            label={t("reviewNotes")}
            name="reviewNotes"
            defaultValue={species.reviewNotes}
            rows={3}
          />
        </FieldSet>

        <Button tone="plate">{t("save")}</Button>
      </form>
    </div>
  );
}
