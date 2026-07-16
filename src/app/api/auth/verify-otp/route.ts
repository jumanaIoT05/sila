import type { NextRequest } from "next/server";
import { handle, ok } from "@/server/http";
import { verifyOtpSchema } from "@/server/validation/schemas";
import { verifyOtp } from "@/server/services/auth.service";

// POST /api/auth/verify-otp  { phoneNumber, code }  -> { token, userId, isNewUser }
export function POST(req: NextRequest) {
  return handle(async () => {
    const { phoneNumber, code } = verifyOtpSchema.parse(await req.json());
    const result = await verifyOtp(phoneNumber, code);
    return ok(result);
  });
}
