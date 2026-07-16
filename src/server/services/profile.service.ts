// =============================================================
// Profile service.
// Returns the signed-in user's basic profile (full name + phone).
// =============================================================

import { prisma } from "../db/prisma";
import { AppError } from "../http";
import type { ProfileDTO } from "@/types";

export async function getProfile(userId: number): Promise<ProfileDTO> {
  const user = await prisma.appUser.findUnique({ where: { userId } });
  if (!user) throw new AppError("User not found", 404);
  return {
    fullName: user.fullName ?? null,
    phoneNumber: user.phoneNumber,
  };
}
