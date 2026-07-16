import type { NextRequest } from "next/server";
import { handle, ok } from "@/server/http";
import { requireUser } from "@/server/auth/session";
import { ingestSmsSchema } from "@/server/validation/schemas";
import { ingestSms } from "@/server/services/transaction.service";

// POST /api/transactions/ingest { message } -> parse bank SMS -> transaction
export function POST(req: NextRequest) {
  return handle(async () => {
    const { userId } = requireUser(req);
    const { message } = ingestSmsSchema.parse(await req.json());
    return ok(await ingestSms(userId, message), 201);
  });
}
