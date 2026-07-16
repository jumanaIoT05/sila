import type { NextRequest } from "next/server";
import { handle, ok } from "@/server/http";
import { requireUser } from "@/server/auth/session";
import { listScenarios } from "@/server/services/demo.service";

// GET /api/demo -> available demo scenarios (metadata only)
export function GET(req: NextRequest) {
  return handle(async () => {
    requireUser(req);
    return ok(listScenarios());
  });
}
