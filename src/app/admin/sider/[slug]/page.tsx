import { api } from "@convex/_generated/api";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { savePageAction } from "@/app/admin/actions";
import { Button, Notice, TextArea, TextField } from "@/components/admin/forms";
import { PageTitle } from "@/components/ui";
import { adminQuery } from "@/lib/admin/convex";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ gemt?: string; fejl?: string }>;
};

/** Edits a static page's Danish title and text. */
export default async function PageEditorPage({ params, searchParams }: Props) {
  const { slug } = await params;
  if (slug !== "about" && slug !== "whereToGetWood") notFound();
  const { gemt, fejl } = await searchParams;
  const t = await getTranslations("Admin");
  const page = await adminQuery(api.admin.pages.get, { slug });

  return (
    <div className="max-w-reading space-y-5">
      <PageTitle>
        {slug === "about" ? t("pageAbout") : t("pageGetWood")}
      </PageTitle>
      <Notice saved={gemt === "1"} error={fejl} savedText={t("saved")} />
      <form action={savePageAction.bind(null, slug)} className="space-y-4">
        <TextField
          label={t("pageTitle")}
          name="title"
          defaultValue={page.title}
        />
        <p className="text-sm text-ink-muted">{t("markdownHint")}</p>
        <TextArea
          label={t("pageContent")}
          name="content"
          defaultValue={page.content}
          rows={16}
        />
        <Button tone="plate">{t("save")}</Button>
      </form>
    </div>
  );
}
