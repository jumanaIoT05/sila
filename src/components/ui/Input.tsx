import type { InputHTMLAttributes, SelectHTMLAttributes, ReactNode } from "react";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-navy">{label}</span>
      {children}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-light-gray bg-white px-4 py-3 text-sm outline-none focus:border-navy ${
        props.className ?? ""
      }`}
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded-xl border border-light-gray bg-white px-4 py-3 text-sm outline-none focus:border-navy ${
        props.className ?? ""
      }`}
    />
  );
}
