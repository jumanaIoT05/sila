import type { NextRequest } from "next/server";
import { handle, ok } from "@/server/http";
import { requireUser } from "@/server/auth/session";
import { getDashboard } from "@/server/services/dashboard.service";
import { normalizePeriod } from "@/server/services/analysis.service";

// GET /api/dashboard?period=all|days|monthly|yearly
// Aggregated Smart Dashboard payload (FR-6), scoped to the selected period.
export function GET(req: NextRequest) {
  return handle(async () => {
    const { userId } = requireUser(req);
    const period = normalizePeriod(new URL(req.url).searchParams.get("period"));
    return ok(await getDashboard(userId, period));
  });
}
