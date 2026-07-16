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
// "Today at 4:35 PM" / "Yesterday at 9:02 AM" / "Jul 3 at 2:10 PM".
export function lastAnalyzedLabel(d: Date): string {
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();
  if (sameDay) return `Today at ${time}`;
  if (isYesterday) return `Yesterday at ${time}`;
  return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })} at ${time}`;
}

export function monthLabel(iso: string): string {
  const d = new Date(iso);
  const month = d.toLocaleDateString("en-US", { month: "short" });
  const year = d.toLocaleDateString("en-US", { year: "2-digit" });
  return `${month} '${year}`;
}
