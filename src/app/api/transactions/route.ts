import type { NextRequest } from "next/server";
import { handle, ok } from "@/server/http";
import { requireUser } from "@/server/auth/session";
import { createTransactionSchema } from "@/server/validation/schemas";
import { listTransactions, createTransaction } from "@/server/services/transaction.service";

// GET /api/transactions -> recent transactions
export function GET(req: NextRequest) {
  return handle(async () => {
    const { userId } = requireUser(req);
    const limit = Number(new URL(req.url).searchParams.get("limit")) || undefined;
    return ok(await listTransactions(userId, { limit }));
  });
}

// POST /api/transactions -> create manual transaction (+ balance + recalc)
export function POST(req: NextRequest) {
  return handle(async () => {
    const { userId } = requireUser(req);
    const input = createTransactionSchema.parse(await req.json());
    return ok(await createTransaction(userId, input), 201);
  });
}
