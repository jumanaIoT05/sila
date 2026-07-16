import type { NextRequest } from "next/server";
import { handle, ok } from "@/server/http";
import { requireUser } from "@/server/auth/session";
import { listAiOutputs, regenerateAiOutputs } from "@/server/services/ai.service";

// GET /api/ai?type=RECOMMENDATION|INSIGHT|SCORE_TIP -> AI outputs (FR-7/11)
export function GET(req: NextRequest) {
  return handle(async () => {
    const { userId } = requireUser(req);
    const type = new URL(req.url).searchParams.get("type") ?? undefined;
    return ok(await listAiOutputs(userId, type));
  });
}

// POST /api/ai -> force regenerate AI outputs, then return the latest set
export function POST(req: NextRequest) {
  return handle(async () => {
    const { userId } = requireUser(req);
    await regenerateAiOutputs(userId);
    return ok(await listAiOutputs(userId), 201);
  });
}
