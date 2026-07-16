// Date-window helpers for analytics (period windows, comparisons).

export function startOfMonth(d = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function startOfPreviousMonth(d = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth() - 1, 1);
}

export function startOfYear(d = new Date()): Date {
  return new Date(d.getFullYear(), 0, 1);
}

export function startOfPreviousYear(d = new Date()): Date {
  return new Date(d.getFullYear() - 1, 0, 1);
}

export function daysAgo(n: number, from = new Date()): Date {
  return new Date(from.getTime() - n * 24 * 60 * 60 * 1000);
}

// Inclusive-start, exclusive-end range check.
export function isInRange(date: Date, start: Date, end: Date): boolean {
  return date >= start && date < end;
}
