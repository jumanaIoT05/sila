import type { NextRequest } from "next/server";
import { handle, ok, AppError } from "@/server/http";
import { requireUser } from "@/server/auth/session";
import { createGoalSchema } from "@/server/validation/schemas";
import { updateGoal, deleteGoal } from "@/server/services/goal.service";

// PATCH /api/goals/:id -> edit a goal (recomputes the saving plan)
export function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  return handle(async () => {
    const { userId } = requireUser(req);
    const goalId = Number(params.id);
    if (!Number.isInteger(goalId)) throw new AppError("Invalid goal id", 400);
    const input = createGoalSchema.parse(await req.json());
    return ok(await updateGoal(userId, goalId, input));
  });
}

// DELETE /api/goals/:id -> remove a goal
export function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return handle(async () => {
    const { userId } = requireUser(req);
    const goalId = Number(params.id);
    if (!Number.isInteger(goalId)) throw new AppError("Invalid goal id", 400);
    await deleteGoal(userId, goalId);
    return ok({ deleted: true });
  });
}
