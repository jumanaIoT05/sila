import type { NextRequest } from "next/server";
import { handle, ok } from "@/server/http";
import { requireUser } from "@/server/auth/session";
import { createGoalSchema } from "@/server/validation/schemas";
import { getGoalsOverview, createGoal } from "@/server/services/goal.service";

// GET /api/goals -> { goals, totalAllocated, totalBalance, overAllocated } (FR-12)
export function GET(req: NextRequest) {
  return handle(async () => {
    const { userId } = requireUser(req);
    return ok(await getGoalsOverview(userId));
  });
}

// POST /api/goals -> create goal (saving_driven or deadline_driven)
export function POST(req: NextRequest) {
  return handle(async () => {
    const { userId } = requireUser(req);
    const input = createGoalSchema.parse(await req.json());
    return ok(await createGoal(userId, input), 201);
  });
}
