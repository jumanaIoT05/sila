"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getToken } from "@/lib/auth-storage";
import { BottomNav } from "@/components/layout/BottomNav";

// Client-side auth guard for all authenticated pages. Redirects to /login
// if no JWT is present (token lives in localStorage, not a cookie).
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
    } else {
      setReady(true);
    }
  }, [router]);

  if (!ready) return <div className="p-10 text-center text-navy">Loading…</div>;

  return (
    <div className="min-h-screen pb-24">
      {/* key by pathname so a subtle fade+rise replays on each tab change */}
      <main key={pathname} className="page-in p-5">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
