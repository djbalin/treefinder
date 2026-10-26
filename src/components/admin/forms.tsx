import type { ReactNode } from "react";

/*
 * Small form pieces for the admin, styled from the design tokens. The admin
 * is a desktop tool built from plain server-rendered forms.
 */

export function Notice({
  saved,
  error,
  savedText,
}: {
  saved?: boolean;
  error?: string;
  savedText: string;
}) {
  if (error) {
    return (
      <p
        role="alert"
        className="rounded-panel bg-warning-surface px-3 py-2 font-semibold text-warning"
      >
        {error}
      </p>
    );
  }
  if (saved) {
    return (
      <p role="status" className="font-semibold text-plate">
        {savedText}
      </p>
    );
  }
  return null;
}

export function FieldSet({
  legend,
  children,
}: {
  legend: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="space-y-4 border-t-2 border-accent pt-4">
      <legend className="pr-2 font-display text-xl font-bold">{legend}</legend>
      {children}
    </fieldset>
  );
}

const inputClass =
  "block w-full rounded-control border-2 border-accent bg-surface px-3 py-2 font-body font-normal";

export function TextField({
  label,
  name,
  defaultValue,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  type?: "text" | "number" | "url";
}) {
  return (
    <label className="block space-y-1 font-display font-semibold">
      <span>{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        className={inputClass}
      />
    </label>
  );
}

export function TextArea({
  label,
  name,
  defaultValue,
  rows = 4,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  rows?: number;
}) {
  return (
    <label className="block space-y-1 font-display font-semibold">
      <span>{label}</span>
      <textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue ?? ""}
        className={inputClass}
      />
    </label>
  );
}

export function Select({
  label,
  name,
  defaultValue,
  options,
  emptyLabel,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  options: { value: string; label: string }[];
  emptyLabel?: string;
}) {
  return (
    <label className="block space-y-1 font-display font-semibold">
      <span>{label}</span>
      <select
        name={name}
        defaultValue={defaultValue ?? ""}
        className={inputClass}
      >
        {emptyLabel ? <option value="">{emptyLabel}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Checkbox({
  label,
  name,
  value,
  defaultChecked,
}: {
  label: string;
  name: string;
  value?: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-2">
      <input
        type="checkbox"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        className="size-4 accent-accent"
      />
      <span>{label}</span>
    </label>
  );
}

export function Button({
  children,
  tone = "accent",
}: {
  children: ReactNode;
  tone?: "accent" | "plate" | "quiet" | "warning";
}) {
  const tones = {
    accent: "bg-accent text-accent-ink hover:bg-plate",
    plate: "bg-plate text-plate-ink hover:bg-accent",
    quiet: "border-2 border-accent text-accent hover:bg-surface-muted",
    warning: "border-2 border-warning text-warning hover:bg-warning-surface",
  };
  return (
    <button
      type="submit"
      className={`rounded-control px-3 py-1.5 font-display font-bold ${tones[tone]}`}
    >
      {children}
    </button>
  );
}
