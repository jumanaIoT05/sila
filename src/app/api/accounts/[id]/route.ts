import type { NextRequest } from "next/server";
import { handle, ok, AppError } from "@/server/http";
import { requireUser } from "@/server/auth/session";
import { removeAccount } from "@/server/services/account.service";

// DELETE /api/accounts/:id -> soft-remove the account (stops SMS tracking;
// keeps all historical transactions & analytics).
export function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return handle(async () => {
    const { userId } = requireUser(req);
    const accountId = Number(params.id);
    if (!Number.isInteger(accountId)) throw new AppError("Invalid account id", 400);
    return ok(await removeAccount(userId, accountId));
  });
}
