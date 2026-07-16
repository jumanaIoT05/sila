import type { NextRequest } from "next/server";
import { handle, ok } from "@/server/http";
import { requireUser } from "@/server/auth/session";
import {
  getLatestScore,
  getScoreHistory,
  getLatestHealth,
} from "@/server/services/score.service";

// GET /api/scores -> latest financial score, history, and latest health (FR-8/9)
export function GET(req: NextRequest) {
  return handle(async () => {
    const { userId } = requireUser(req);
    const [latest, history, health] = await Promise.all([
      getLatestScore(userId),
      getScoreHistory(userId),
      getLatestHealth(userId),
    ]);
    return ok({ latest, history, health });
  });
}
