import type { Metadata } from "next";
import { Archivo, Source_Serif_4 } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { routing } from "@/i18n/routing";
import "@/styles/globals.css";

const serif = Source_Serif_4({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-serif",
});

const sans = Archivo({
  subsets: ["latin"],
  variable: "--font-sans",
});

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <html lang={locale} className={`${serif.variable} ${sans.variable}`}>
      <body className="min-h-dvh text-body antialiased">
        <NextIntlClientProvider>
          <SiteHeader />
          <main
            id="content"
            className="mx-auto max-w-page px-4 pt-6 pb-16 sm:pt-10"
          >
            {children}
          </main>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
