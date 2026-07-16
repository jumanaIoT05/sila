import type { NextRequest } from "next/server";
import { handle, ok } from "@/server/http";
import { requireUser } from "@/server/auth/session";
import { confirmAccountsSchema } from "@/server/validation/schemas";
import { confirmAccounts } from "@/server/services/onboarding.service";
import { recalculate } from "@/server/services/recalc.service";

// POST /api/onboarding/confirm { accounts[] } -> creates accounts (one-time balance)
export function POST(req: NextRequest) {
  return handle(async () => {
    const { userId } = requireUser(req);
    const { accounts } = confirmAccountsSchema.parse(await req.json());
    const created = await confirmAccounts(userId, accounts);
    await recalculate(userId); // seed initial scores/AI outputs (FR-13)
    return ok(created, 201);
  });
}
