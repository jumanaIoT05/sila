import type { NextRequest } from "next/server";
import { handle, ok } from "@/server/http";
import { requireUser } from "@/server/auth/session";
import { createBudgetSchema } from "@/server/validation/schemas";
import { getBudgetStatus, createBudget } from "@/server/services/budget.service";

// GET /api/budgets -> budget vs actual (FR-10)
export function GET(req: NextRequest) {
  return handle(async () => {
    const { userId } = requireUser(req);
    return ok(await getBudgetStatus(userId));
  });
}

// POST /api/budgets { spendingCategoryId, recommendedAmount } -> create/update a budget
export function POST(req: NextRequest) {
  return handle(async () => {
    const { userId } = requireUser(req);
    const { spendingCategoryId, recommendedAmount } = createBudgetSchema.parse(await req.json());
    return ok(await createBudget(userId, spendingCategoryId, recommendedAmount), 201);
  });
}
