import { PrismaClient } from "@prisma/client";

// Singleton PrismaClient — avoids exhausting DB connections during
// Next.js dev hot-reload. This is the ONLY module that instantiates Prisma;
// every service imports `prisma` from here and nothing else touches the DB.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
