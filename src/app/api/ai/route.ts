import type { NextRequest } from "next/server";
import { handle, ok } from "@/server/http";
import { requireUser } from "@/server/auth/session";
import { listAiOutputs, analyzeFinances } from "@/server/services/ai.service";

// GET /api/ai?type=RECOMMENDATION|INSIGHT|SCORE_TIP -> persisted AI outputs
// (used by the Score page tip and the dashboard highlights source).
export function GET(req: NextRequest) {
  return handle(async () => {
    const { userId } = requireUser(req);
    const type = new URL(req.url).searchParams.get("type") ?? undefined;
    return ok(await listAiOutputs(userId, type));
  });
}

// POST /api/ai -> run an on-demand AI analysis and return every section
// (financial health, insights, recommendations, goal advice, budget
// suggestions). Explicit user request only.
export function POST(req: NextRequest) {
  return handle(async () => {
    const { userId } = requireUser(req);
    return ok(await analyzeFinances(userId), 201);
  });
}
