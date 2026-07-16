import type { NextRequest } from "next/server";
import { handle, ok } from "@/server/http";
import { requireUser } from "@/server/auth/session";
import { getNotifications } from "@/server/services/notification.service";

// GET /api/notifications -> dynamically-generated smart notifications
export function GET(req: NextRequest) {
  return handle(async () => {
    const { userId } = requireUser(req);
    return ok(await getNotifications(userId));
  });
}
