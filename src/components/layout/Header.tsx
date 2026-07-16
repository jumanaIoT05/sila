"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { clearSession } from "@/lib/auth-storage";

// App header (per new UI): Profile (person) on the LEFT, Logout on the RIGHT.
// `title` accepts a ReactNode so the Home screen can render a rich greeting.
export function Header({
  title,
  subtitle,
  align = "left",
  rightExtra,
}: {
  title: ReactNode;
  subtitle?: string;
  align?: "left" | "center";
  rightExtra?: ReactNode; // e.g. the notifications bell on Home
}) {
  const router = useRouter();

  function logout() {
    clearSession();
    router.replace("/login");
  }

  return (
    <header className="mb-5 flex items-center justify-between gap-3">
      <Link
        href="/profile"
        aria-label="Profile"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface text-lg text-primary transition-transform active:scale-95"
        title="Profile"
      >
        👤
      </Link>

      <div className={`flex-1 ${align === "center" ? "text-center" : ""}`}>
        {subtitle && <p className="text-xs text-navy/60">{subtitle}</p>}
        <div className="text-lg font-bold text-navy">{title}</div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {rightExtra}
        <button
          aria-label="Log out"
          onClick={logout}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-lg text-primary transition-transform active:scale-95"
          title="Log out"
        >
          ⏻
        </button>
      </div>
    </header>
  );
}
