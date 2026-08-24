"use client";

import type { InputHTMLAttributes, ReactNode } from "react";

type FieldProps = {
  label: string;
  error?: string;
  hint?: ReactNode;
  /** Rendered inside the input on the right — brand badges, icons, etc. */
  adornment?: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>;

export function Field({
  label,
  error,
  hint,
  adornment,
  className,
  id,
  ...rest
}: FieldProps) {
  const inputId = id ?? rest.name;
  return (
    <label className={`block ${className ?? ""}`} htmlFor={inputId}>
      <span className="mb-1.5 block text-[13px] font-semibold text-navy">
        {label}
      </span>
      <span className="relative block">
        <input
          id={inputId}
          {...rest}
          aria-invalid={error ? true : undefined}
          className={`h-12 w-full rounded-xl border bg-white px-3.5 text-[15px] text-ink outline-none transition
            placeholder:text-muted/55
            focus:border-brand-600 focus:ring-4 focus:ring-brand-600/12
            ${adornment ? "pr-24" : ""}
            ${error ? "border-red-400 focus:border-red-500 focus:ring-red-500/12" : "border-hairline"}`}
        />
        {adornment ? (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            {adornment}
          </span>
        ) : null}
      </span>
      {error ? (
        <span className="mt-1.5 block text-[12.5px] font-medium text-red-600">
          {error}
        </span>
      ) : hint ? (
        <span className="mt-1.5 block text-[12.5px] text-muted">{hint}</span>
      ) : null}
    </label>
  );
}
