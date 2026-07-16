import type { NextRequest } from "next/server";
import { handle, ok, AppError } from "@/server/http";
import { requireUser } from "@/server/auth/session";
import { updateBalanceSchema } from "@/server/validation/schemas";
import { updateBalance } from "@/server/services/account.service";

// PATCH /api/accounts/:id/balance { currentBalance } -> manual adjust + recalc
export function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  return handle(async () => {
    const { userId } = requireUser(req);
    const accountId = Number(params.id);
    if (!Number.isInteger(accountId)) throw new AppError("Invalid account id", 400);
    const { currentBalance } = updateBalanceSchema.parse(await req.json());
    return ok(await updateBalance(userId, accountId, currentBalance));
  });
}
