import type { NextRequest } from "next/server";
import { handle, ok } from "@/server/http";
import { requireUser } from "@/server/auth/session";
import { getProfile } from "@/server/services/profile.service";

// GET /api/profile -> { fullName, phoneNumber } for the signed-in user.
export function GET(req: NextRequest) {
  return handle(async () => {
    const { userId } = requireUser(req);
    return ok(await getProfile(userId));
  });
}
