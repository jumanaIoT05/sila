import type { NextRequest } from "next/server";
import { handle, ok } from "@/server/http";
import { requireUser } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";

// GET /api/lookups -> banks, transaction types, categories, goal modes.
// Powers form dropdowns on the frontend.
export function GET(req: NextRequest) {
  return handle(async () => {
    requireUser(req);
    const [banks, transactionTypes, categories, goalModes] = await Promise.all([
      prisma.bank.findMany({ orderBy: { bankName: "asc" } }),
      prisma.transactionType.findMany(),
      prisma.spendingCategory.findMany(),
      prisma.goalCalculationMode.findMany(),
    ]);
    return ok({ banks, transactionTypes, categories, goalModes });
  });
}
