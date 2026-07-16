"use client";

import Link from "next/link";
import { useApi } from "@/hooks/useApi";
import type { NotificationDTO } from "@/types";

// Notifications bell for the Home header. Shows an unread-style count badge and
// links to the full notifications list.
export function NotificationBell() {
  const { data } = useApi<NotificationDTO[]>("/notifications");
  const count = data?.length ?? 0;

  return (
    <Link
      href="/notifications"
      aria-label={`Notifications${count ? ` (${count})` : ""}`}
      className="relative flex h-10 w-10 items-center justify-center rounded-full bg-surface text-lg text-primary transition-transform active:scale-95"
      title="Notifications"
    >
      🔔
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-primary">
          {count}
        </span>
      )}
    </Link>
  );
}
