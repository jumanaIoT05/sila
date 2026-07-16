"use client";

import Link from "next/link";
import { SilaLogo } from "@/components/brand/Logo";

// Empty-dashboard welcome (per new UI). Shown when a user has no financial
// data yet — replaces an empty dashboard with a clear call to onboard.
export function Welcome() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <SilaLogo size={64} />
      <div className="mt-2">
        <p className="text-lg font-bold text-navy">📊 Welcome to Sila</p>
        <p className="mt-1 max-w-xs text-sm text-navy/60">
          Connect your SMS and start tracking your finances.
        </p>
      </div>
      <Link
        href="/banks"
        className="mt-2 rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-white shadow-sm transition active:scale-95"
      >
        Get Started
      </Link>
    </div>
  );
}
