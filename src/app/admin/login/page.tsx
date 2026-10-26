import { getTranslations } from "next-intl/server";
import { PageTitle } from "@/components/ui";
import { signInAction } from "../actions";

type Props = { searchParams: Promise<{ fejl?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const t = await getTranslations("Admin");
  const { fejl } = await searchParams;

  return (
    <div className="max-w-sm space-y-5">
      <PageTitle>{t("loginHeading")}</PageTitle>
      <p className="text-sm text-ink-muted">{t("loginInterim")}</p>
      {fejl ? (
        <p role="alert" className="font-semibold text-warning">
          {t("loginFailed")}
        </p>
      ) : null}
      <form action={signInAction} className="space-y-4">
        <Field label={t("username")} name="username" autoComplete="username" />
        <Field
          label={t("password")}
          name="password"
          type="password"
          autoComplete="current-password"
        />
        <button
          type="submit"
          className="rounded-control bg-accent px-4 py-2 font-display font-bold text-accent-ink hover:bg-plate"
        >
          {t("loginSubmit")}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete: string;
}) {
  return (
    <label className="block space-y-1 font-display font-semibold">
      <span>{label}</span>
      <input
        name={name}
        type={type}
        required
        autoComplete={autoComplete}
        className="block w-full rounded-control border-2 border-accent bg-surface px-3 py-2 font-body font-normal"
      />
    </label>
  );
}
