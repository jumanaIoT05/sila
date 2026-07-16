"use client";

import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  fullWidth?: boolean;
}

const variants: Record<Variant, string> = {
  primary: "bg-navy text-white hover:opacity-90",
  secondary: "bg-lavender text-navy hover:opacity-90",
  ghost: "bg-transparent text-navy hover:bg-lavender/50",
};

export function Button({
  variant = "primary",
  loading = false,
  fullWidth = false,
  className = "",
  children,
  disabled,
  ...rest
}: Props) {
  return (
    <button
      className={`rounded-xl px-5 py-3 text-sm font-semibold transition active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 ${
        variants[variant]
      } ${fullWidth ? "w-full" : ""} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? "Please wait…" : children}
    </button>
  );
}
