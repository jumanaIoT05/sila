"use client";

import Link from "next/link";
import { useApi } from "@/hooks/useApi";
import { EmptyState } from "@/components/ui/EmptyState";
import { Loading, ErrorState } from "@/components/ui/State";
import type { NotificationDTO } from "@/types";

// Smart notifications list. Only important financial notifications appear.
export default function NotificationsPage() {
  const { data, loading, error } = useApi<NotificationDTO[]>("/notifications");

  return (
    <div>
      <div className="mb-5 flex items-center gap-3">
        <Link
          href="/dashboard"
          aria-label="Back"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-primary"
        >
          ←
        </Link>
        <div>
          <p className="text-xs text-navy/60">Smart alerts</p>
          <h1 className="text-lg font-bold text-navy">Notifications</h1>
        </div>
      </div>

      {loading && <Loading />}
      {error && <ErrorState message={error} />}
      {data && data.length === 0 && (
        <EmptyState emoji="🔔" title="You're all caught up" subtitle="No important alerts right now." />
      )}

      <div className="flex flex-col gap-2">
        {data?.map((n) => (
          <div key={n.id} className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-sm">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface text-lg">
              {n.icon}
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-navy">{n.title}</p>
              <p className="mt-0.5 text-sm text-navy/60">{n.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
