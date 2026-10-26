import type { Metadata } from "next";
import { Figtree, Gabarito } from "next/font/google";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { isSignedIn } from "@/lib/admin/session";
import { signOutAction } from "./actions";
import "@/styles/globals.css";

const sign = Gabarito({ subsets: ["latin"], variable: "--font-sign" });
const text = Figtree({ subsets: ["latin"], variable: "--font-text" });

export const metadata: Metadata = {
  title: "Treefinder admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const t = await getTranslations("Admin");
  const signedIn = await isSignedIn();

  return (
    <html lang="da" className={`${sign.variable} ${text.variable}`}>
      <body className="min-h-dvh text-body antialiased">
        <header className="bg-ink text-surface">
          <nav
            aria-label={t("title")}
            className="mx-auto flex max-w-page flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 font-display font-semibold"
          >
            <span>{t("title")}</span>
            {signedIn ? (
              <>
                <AdminLink href="/admin">{t("species")}</AdminLink>
                <AdminLink href="/admin/gennemgang">{t("review")}</AdminLink>
                <AdminLink href="/admin/sider/about">
                  {t("pageAbout")}
                </AdminLink>
                <AdminLink href="/admin/sider/whereToGetWood">
                  {t("pageGetWood")}
                </AdminLink>
                <AdminLink href="/">{t("toSite")}</AdminLink>
                <form action={signOutAction} className="sm:ml-auto">
                  <button type="submit" className="hover:underline">
                    {t("signOut")}
                  </button>
                </form>
              </>
            ) : null}
          </nav>
        </header>
        <main className="mx-auto max-w-page px-4 pt-6 pb-16">{children}</main>
      </body>
    </html>
  );
}

function AdminLink({ href, children }: { href: string; children: string }) {
  return (
    <Link href={href} className="hover:underline">
      {children}
    </Link>
  );
}
