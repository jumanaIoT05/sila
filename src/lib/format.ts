// Formatting helpers (SAR currency, dates, percentages).

export function sar(amount: number): string {
  return `${amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} SAR`;
}

export function percent(value: number): string {
  return `${value > 0 ? "+" : ""}${value.toFixed(0)}%`;
}

export function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Unambiguous month label, e.g. "Jul '26" (the 26 is the year, not the day).
export function monthLabel(iso: string): string {
  const d = new Date(iso);
  const month = d.toLocaleDateString("en-US", { month: "short" });
  const year = d.toLocaleDateString("en-US", { year: "2-digit" });
  return `${month} '${year}`;
}
