"use client";

import type { ButtonHTMLAttributes } from "react";

type Props = {
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const styles = {
  primary:
    "bg-brand-600 text-white shadow-[0_8px_20px_-8px_rgba(25,67,220,0.75)] hover:bg-brand-700 active:bg-brand-800",
  secondary:
    "border border-hairline bg-white text-navy hover:border-brand-300 hover:text-brand-700",
  ghost: "text-brand-600 hover:bg-brand-50",
} as const;

export default function Button({
  variant = "primary",
  loading = false,
  disabled,
  children,
  className,
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`inline-flex h-12 items-center justify-center gap-2 rounded-full px-6
        text-[15px] font-bold tracking-[-0.01em] transition
        disabled:cursor-not-allowed disabled:opacity-55
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600
        ${styles[variant]} ${className ?? ""}`}
    >
      {loading ? (
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : null}
      {children}
    </button>
  );
}
