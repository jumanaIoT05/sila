import type { NextRequest } from "next/server";
import { z } from "zod";
import { handle, ok, AppError } from "@/server/http";
import { requireUser } from "@/server/auth/session";
import { categorizeTransaction } from "@/server/services/transaction.service";

const schema = z.object({ spendingCategoryId: z.number().int().positive() });

// PATCH /api/transactions/:id/category { spendingCategoryId }
// Manually categorize a transaction (e.g. how withdrawn cash was spent).
export function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  return handle(async () => {
    const { userId } = requireUser(req);
    const transactionId = Number(params.id);
    if (!Number.isInteger(transactionId)) throw new AppError("Invalid transaction id", 400);
    const { spendingCategoryId } = schema.parse(await req.json());
    return ok(await categorizeTransaction(userId, transactionId, spendingCategoryId));
  });
}
