import type { NextRequest } from "next/server";
import { handle, ok } from "@/server/http";
import { requireUser } from "@/server/auth/session";
import { manualAccountSchema } from "@/server/validation/schemas";
import { listAccounts, addManualAccount } from "@/server/services/account.service";

// GET /api/accounts -> user's accounts
export function GET(req: NextRequest) {
  return handle(async () => {
    const { userId } = requireUser(req);
    return ok(await listAccounts(userId));
  });
}

// POST /api/accounts { bankId, lastFourDigits, currentBalance } -> manual add
export function POST(req: NextRequest) {
  return handle(async () => {
    const { userId } = requireUser(req);
    const input = manualAccountSchema.parse(await req.json());
    return ok(await addManualAccount(userId, input), 201);
  });
}
