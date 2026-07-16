import type { ReactNode } from "react";

// Friendly illustrated empty state for new users / no-data screens.
export function EmptyState({
  emoji = "🌱",
  title,
  subtitle,
  action,
}: {
  emoji?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-white px-6 py-10 text-center shadow-sm">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-lavender text-3xl">
        {emoji}
      </div>
      <p className="font-semibold text-navy">{title}</p>
      {subtitle && <p className="mt-1 max-w-xs text-sm text-navy/60">{subtitle}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
