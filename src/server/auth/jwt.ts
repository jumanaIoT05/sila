import jwt, { type SignOptions } from "jsonwebtoken";
import type { AuthTokenPayload } from "@/types";

const SECRET = process.env.JWT_SECRET ?? "dev-insecure-secret";
const EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "7d";

export function signToken(payload: AuthTokenPayload): string {
  // expiresIn accepts a number (seconds) or a vercel/ms string like "7d".
  const options = { expiresIn: EXPIRES_IN } as SignOptions;
  return jwt.sign(payload, SECRET, options);
}

export function verifyToken(token: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, SECRET) as AuthTokenPayload;
  } catch {
    return null;
  }
}
