import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("NotFound");

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">{t("heading")}</h1>
      <Link className="underline" href="/">
        {t("backHome")}
      </Link>
    </section>
  );
}
