import type { ReactNode } from "react";
import { slugify } from "@/domain/slug";

/*
 * Placeholder UI primitives. Every visual value comes from the tokens in
 * src/styles/tokens.css; the impeccable design pass restyles these in one
 * place.
 */

export function Badge({ label, value }: { label: string; value: ReactNode }) {
  return (
    <span className="inline-flex items-baseline gap-1 rounded-control border border-line bg-surface-muted px-2 py-1 text-sm">
      <span className="text-ink-muted">{label}</span>
      <span className="font-medium">{value}</span>
    </span>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-control bg-surface-muted px-2 py-0.5 text-sm text-ink-muted">
      {children}
    </span>
  );
}

export function WarningBanner({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div
      role="alert"
      className="rounded-panel border border-warning bg-warning-surface p-4 text-warning"
    >
      <p className="font-semibold">{title}</p>
      <div>{children}</div>
    </div>
  );
}

export function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const id = `section-${slugify(title)}`;
  return (
    <section aria-labelledby={id} className="space-y-2">
      <h2 id={id} className="font-display text-xl font-semibold">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function PageTitle({ children }: { children: ReactNode }) {
  return (
    <h1 className="font-display text-3xl font-semibold leading-tight">
      {children}
    </h1>
  );
}

export function Muted({ children }: { children: ReactNode }) {
  return <p className="text-ink-muted">{children}</p>;
}
