"use client";

import { categoryColor } from "@/lib/categoryColors";
import { sar, shortDate } from "@/lib/format";
import type { TransactionDTO } from "@/types";

// Compact transaction row, reused on the Home preview and the Activity list.
export function TransactionRow({
  t,
  children,
}: {
  t: TransactionDTO;
  children?: React.ReactNode; // optional trailing controls (e.g. edit)
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white p-3.5 shadow-sm">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
          style={{ backgroundColor: categoryColor(t.category) }}
        >
          🏦
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold text-navy">{t.category}</p>
          <p className="truncate text-xs text-navy/50">
            ••{t.lastFourDigits} · {t.transactionType} · {shortDate(t.transactionDate)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 pl-2">
        <span
          className={`whitespace-nowrap font-bold ${
            t.direction === "in" ? "text-gold-dark" : "text-navy"
          }`}
        >
          {t.direction === "in" ? "+ " : "− "}
          {sar(t.amount)}
        </span>
        {children}
      </div>
    </div>
  );
}
