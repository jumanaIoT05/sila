import type { NextRequest } from "next/server";
import { handle, ok } from "@/server/http";
import { requireUser } from "@/server/auth/session";
import { suggestBudgets } from "@/server/services/budget.service";

// POST /api/budgets/suggest -> auto-suggest budgets from last month's spending
export function POST(req: NextRequest) {
  return handle(async () => {
    const { userId } = requireUser(req);
    return ok(await suggestBudgets(userId), 201);
  });
}
