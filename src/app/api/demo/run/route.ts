import type { NextRequest } from "next/server";
import { z } from "zod";
import { handle, ok } from "@/server/http";
import { requireUser } from "@/server/auth/session";
import { runScenario } from "@/server/services/demo.service";

const schema = z.object({ scenario: z.string().min(1) });

// POST /api/demo/run { scenario } -> replay the scenario's SMS through the
// real ingestion pipeline (presentation only).
export function POST(req: NextRequest) {
  return handle(async () => {
    const { userId } = requireUser(req);
    const { scenario } = schema.parse(await req.json());
    return ok(await runScenario(userId, scenario), 201);
  });
}
