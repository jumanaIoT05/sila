import type { NextRequest } from "next/server";
import { handle, ok, AppError } from "@/server/http";
import { requireUser } from "@/server/auth/session";
import { updateBudgetSchema } from "@/server/validation/schemas";
import { updateBudget, deleteBudget } from "@/server/services/budget.service";

// PATCH /api/budgets/:id { recommendedAmount } -> edit a budget
export function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  return handle(async () => {
    const { userId } = requireUser(req);
    const budgetId = Number(params.id);
    if (!Number.isInteger(budgetId)) throw new AppError("Invalid budget id", 400);
    const { recommendedAmount } = updateBudgetSchema.parse(await req.json());
    return ok(await updateBudget(userId, budgetId, recommendedAmount));
  });
}

// DELETE /api/budgets/:id -> remove a budget
export function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return handle(async () => {
    const { userId } = requireUser(req);
    const budgetId = Number(params.id);
    if (!Number.isInteger(budgetId)) throw new AppError("Invalid budget id", 400);
    return ok(await deleteBudget(userId, budgetId));
  });
}
