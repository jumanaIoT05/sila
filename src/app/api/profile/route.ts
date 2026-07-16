import type { NextRequest } from "next/server";
import { z } from "zod";
import { handle, ok } from "@/server/http";
import { requireUser } from "@/server/auth/session";
import { getProfile, updateName } from "@/server/services/profile.service";

const nameSchema = z.object({ fullName: z.string().min(1, "Name is required").max(100) });

// GET /api/profile -> { fullName, phoneNumber } for the signed-in user.
export function GET(req: NextRequest) {
  return handle(async () => {
    const { userId } = requireUser(req);
    return ok(await getProfile(userId));
  });
}

// PATCH /api/profile { fullName } -> save the user's name.
export function PATCH(req: NextRequest) {
  return handle(async () => {
    const { userId } = requireUser(req);
    const { fullName } = nameSchema.parse(await req.json());
    return ok(await updateName(userId, fullName));
  });
}
