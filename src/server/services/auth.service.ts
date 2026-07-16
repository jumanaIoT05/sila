// =============================================================
// Auth service (FR-1).
// Phone + OTP login, JWT session issuance.
// OTP is mocked for dev (no OTP column in schema by design): the
// verify step accepts MOCK_OTP_CODE. requestOtp ensures the user
// exists and logs the code to the server console.
// =============================================================

import { prisma } from "../db/prisma";
import { signToken } from "../auth/jwt";
import { AppError } from "../http";

const MOCK_OTP = process.env.MOCK_OTP_CODE ?? "123456";

export async function requestOtp(phoneNumber: string): Promise<{ sent: true }> {
  // Upsert user so first-time and returning users both work.
  await prisma.appUser.upsert({
    where: { phoneNumber },
    update: {},
    create: { phoneNumber },
  });

  // Dev: "send" the OTP by logging it. Replace with a real SMS gateway later.
  console.log(`[auth] OTP for ${phoneNumber}: ${MOCK_OTP}`);
  return { sent: true };
}

export async function verifyOtp(
  phoneNumber: string,
  code: string
): Promise<{ token: string; userId: number; isNewUser: boolean; hasName: boolean }> {
  if (code !== MOCK_OTP) {
    throw new AppError("Invalid OTP code", 401);
  }

  const user = await prisma.appUser.findUnique({ where: { phoneNumber } });
  if (!user) {
    throw new AppError("No account found for this phone number. Request an OTP first.", 404);
  }

  const token = signToken({ userId: user.userId, phoneNumber: user.phoneNumber });

  // Onboarding state drives new-user routing: name → walkthrough → banks.
  const accountCount = await prisma.account.count({ where: { userId: user.userId } });

  return {
    token,
    userId: user.userId,
    isNewUser: accountCount === 0, // no linked accounts yet
    hasName: !!user.fullName,
  };
}
