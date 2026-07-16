"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Bottom navigation (per new UI): Home · Activity · Budget · Insights · Score.
// Accounts is reached from the Total Balance wallet card on Home/Activity.
const items = [
  { href: "/dashboard", label: "Home", icon: "🏠" },
  { href: "/transactions", label: "Activity", icon: "💳" },
  { href: "/budgets", label: "Budget", icon: "🎯" },
  { href: "/insights", label: "Insights", icon: "✨" },
  { href: "/score", label: "Score", icon: "🏅" },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto flex max-w-md items-center justify-around border-t border-light-gray bg-white px-2 py-2">
      {items.map((it) => {
        const active = pathname === it.href;
        return (
          <Link
            key={it.href}
            href={it.href}
            className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1 text-xs transition-transform active:scale-95 ${
              active ? "font-semibold text-primary" : "text-navy/45"
            }`}
          >
            <span className={`text-lg transition-transform ${active ? "scale-110" : ""}`}>
              {it.icon}
            </span>
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
