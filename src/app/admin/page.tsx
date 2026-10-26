import { api } from "@convex/_generated/api";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { PageTitle } from "@/components/ui";
import { optionLabel } from "@/domain/labels";
import {
  cardStatusOptions,
  launchWaveOptions,
  REQUIRED_PHOTO_SLOTS,
} from "@/domain/options";
import { adminQuery } from "@/lib/admin/convex";

export const dynamic = "force-dynamic";

/** Every species with its card status and photo progress. */
export default async function AdminSpeciesPage() {
  const t = await getTranslations("Admin");
  const species = await adminQuery(api.admin.species.list, {});

  return (
    <div className="space-y-5">
      <PageTitle>{t("species")}</PageTitle>
      <table className="w-full border-collapse text-left">
        <thead className="font-display text-sm text-ink-muted">
          <tr className="border-b-2 border-accent">
            <th className="py-2 pr-3">{t("name")}</th>
            <th className="py-2 pr-3">{t("status")}</th>
            <th className="py-2 pr-3">{t("photos")}</th>
            <th className="py-2 pr-3">{t("wave")}</th>
          </tr>
        </thead>
        <tbody>
          {species.map((item) => (
            <tr key={item.id} className="border-b border-surface-muted">
              <td className="py-2 pr-3">
                <Link
                  href={`/admin/arter/${item.id}`}
                  className="font-display font-bold text-accent hover:underline"
                >
                  {item.name}
                </Link>{" "}
                <span className="text-sm italic text-ink-muted">
                  {item.latinName}
                </span>
                {item.isWarning ? (
                  <span className="ml-2 text-sm font-bold text-warning">
                    {t("warning")}
                  </span>
                ) : null}
              </td>
              <td className="py-2 pr-3">
                {optionLabel(cardStatusOptions, item.status, "da")}
              </td>
              <td className="py-2 pr-3 tabular-nums">
                {item.selectedSlots}/{REQUIRED_PHOTO_SLOTS.length}
              </td>
              <td className="py-2 pr-3">
                {optionLabel(launchWaveOptions, item.launchWave, "da")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
