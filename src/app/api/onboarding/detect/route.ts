import type { NextRequest } from "next/server";
import { handle, ok } from "@/server/http";
import { requireUser } from "@/server/auth/session";
import { detectAccountsFromSms } from "@/server/services/onboarding.service";
import { z } from "zod";

const schema = z.object({ bankIds: z.array(z.number().int().positive()).min(1) });

// POST /api/onboarding/detect { bankIds } -> detected accounts from SMS (mock)
export function POST(req: NextRequest) {
  return handle(async () => {
    requireUser(req);
    const { bankIds } = schema.parse(await req.json());
    const detected = await detectAccountsFromSms(bankIds);
    return ok(detected);
  });
}
