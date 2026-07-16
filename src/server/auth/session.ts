import type { NextRequest } from "next/server";
import { verifyToken } from "./jwt";
import { AppError } from "../http";
import type { AuthTokenPayload } from "@/types";

// Extracts and verifies the JWT from the Authorization header.
// Throws 401 if missing/invalid — call from any protected route/service entry.
export function requireUser(req: NextRequest): AuthTokenPayload {
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) throw new AppError("Missing authentication token", 401);

  const payload = verifyToken(token);
  if (!payload) throw new AppError("Invalid or expired token", 401);
  return payload;
}
