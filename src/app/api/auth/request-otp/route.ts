import type { NextRequest } from "next/server";
import { handle, ok } from "@/server/http";
import { phoneSchema } from "@/server/validation/schemas";
import { requestOtp } from "@/server/services/auth.service";

// POST /api/auth/request-otp  { phoneNumber }
export function POST(req: NextRequest) {
  return handle(async () => {
    const { phoneNumber } = phoneSchema.parse(await req.json());
    const result = await requestOtp(phoneNumber);
    return ok(result);
  });
}
