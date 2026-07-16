import { Prisma } from "@prisma/client";

// Prisma returns money columns as Decimal. Convert to plain numbers (SAR)
// for computation and JSON. Rounding to 2 decimals keeps SAR precision.
export function toNumber(value: Prisma.Decimal | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  const n = typeof value === "number" ? value : value.toNumber();
  return Math.round(n * 100) / 100;
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
