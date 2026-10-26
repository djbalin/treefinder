import type { ReactNode } from "react";
import { slugify } from "@/domain/slug";

/*
 * Shared UI primitives in the field guide world. Every visual value comes
 * from the tokens in src/styles/tokens.css.
 */

export function Tag({ children }: { children: ReactNode }) {
  return <span className="font-label text-sm text-ink-muted">{children}</span>;
}

/** The number that keys a plate photo to its identification text. */
export function PlateNumber({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex size-6 shrink-0 items-center justify-center bg-surface font-label text-sm font-bold text-accent ${className}`}
    >
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
  const id = `warning-${slugify(title)}`;
  return (
    <section
      aria-labelledby={id}
      className="border-y-2 border-warning bg-warning-surface px-4 py-3 text-warning"
    >
      <h2 id={id} className="font-label font-bold uppercase tracking-wide">
        {title}
      </h2>
      <div className="mt-1 font-medium">{children}</div>
    </section>
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
    <section aria-labelledby={id} className="space-y-3">
      <h2
        id={id}
        className="border-t border-line pt-3 font-display text-2xl font-semibold leading-tight"
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

export function PageTitle({ children }: { children: ReactNode }) {
  return (
    <h1 className="text-balance font-display text-title font-bold">
      {children}
    </h1>
  );
}

export function Muted({ children }: { children: ReactNode }) {
  return <p className="text-ink-muted">{children}</p>;
}
