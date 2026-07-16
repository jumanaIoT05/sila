"use client";

import Link from "next/link";
import { sar } from "@/lib/format";
import type { AccountDTO } from "@/types";

// Total Balance "wallet" card (per new UI). Shows the aggregate balance with a
// fanned stack of the linked bank cards and an "+ Add Account" action. Tapping
// the card (or Add Account) opens the Accounts page — the app's accounts entry
// point now that there is no Accounts nav tab.
export function WalletCard({
  totalBalance,
  accounts,
}: {
  totalBalance: number;
  accounts: AccountDTO[];
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-navy p-5 text-white shadow-sm">
      {/* decorative glow */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

      <div className="mb-8 flex items-start justify-between">
        <Link
          href="/accounts"
          className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium transition active:scale-95 hover:bg-white/25"
        >
          <span className="text-sm leading-none">＋</span> Add Account
        </Link>

        {/* fanned bank cards */}
        <Link href="/accounts" aria-label="Manage accounts" className="flex -space-x-3">
          {accounts.slice(0, 3).map((a, i) => (
            <span
              key={a.accountId}
              className="flex h-9 w-7 items-center justify-center rounded-md border border-white/30 bg-white/15 text-[10px] font-semibold backdrop-blur-sm"
              style={{ transform: `translateY(${i * 2}px)` }}
              title={`${a.bankName} ••${a.lastFourDigits}`}
            >
              🏦
            </span>
          ))}
        </Link>
      </div>

      <Link href="/accounts" className="block">
        <p className="text-sm font-medium opacity-80">Total Balance</p>
        <p className="mt-1 text-3xl font-bold tracking-tight">{sar(totalBalance)}</p>
      </Link>
    </div>
  );
}
