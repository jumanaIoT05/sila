import type { NextRequest } from "next/server";
import { handle, ok, AppError } from "@/server/http";
import { requireUser } from "@/server/auth/session";
import { allocateGoalSchema } from "@/server/validation/schemas";
import { allocateToGoal } from "@/server/services/goal.service";

// POST /api/goals/:id/allocate { amount } -> allocate (or de-allocate) toward a
// goal. Budgeting decision only — no real money is moved.
export function POST(req: NextRequest, { params }: { params: { id: string } }) {
  return handle(async () => {
    const { userId } = requireUser(req);
    const goalId = Number(params.id);
    if (!Number.isInteger(goalId)) throw new AppError("Invalid goal id", 400);
    const { amount } = allocateGoalSchema.parse(await req.json());
    return ok(await allocateToGoal(userId, goalId, amount));
  });
}
