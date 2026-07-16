"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useApi } from "@/hooks/useApi";
import { Header } from "@/components/layout/Header";
import { Card, SectionTitle } from "@/components/ui/Card";
import { WalletCard } from "@/components/dashboard/WalletCard";
import { TransactionRow } from "@/components/dashboard/TransactionRow";
import { Welcome } from "@/components/dashboard/Welcome";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { Walkthrough } from "@/components/onboarding/Walkthrough";
import { DonutChart } from "@/components/charts/DonutChart";
import { Loading, ErrorState } from "@/components/ui/State";
import { categoryColor } from "@/lib/categoryColors";
import { sar } from "@/lib/format";
import type { DashboardDTO, ProfileDTO } from "@/types";

const WALKTHROUGH_KEY = "sila_walkthrough_seen";

function greetingWord(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 18) return "Good Afternoon";
  return "Good Evening";
}

// FR-6: Smart Dashboard (Home), scoped to the current month.
export default function DashboardPage() {
  const { data, loading, error } = useApi<DashboardDTO>("/dashboard");
  const { data: profile } = useApi<ProfileDTO>("/profile");

  // First-time walkthrough (shown once, persisted in localStorage).
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  useEffect(() => {
    if (!localStorage.getItem(WALKTHROUGH_KEY)) setShowWalkthrough(true);
  }, []);
  function finishWalkthrough() {
    localStorage.setItem(WALKTHROUGH_KEY, "1");
    setShowWalkthrough(false);
  }

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} />;
  if (!data) return null;

  const firstName = (profile?.fullName || "there").split(" ")[0];
  const isEmpty =
    data.recentTransactions.length === 0 && data.income === 0 && data.spending === 0;

  const greeting = (
    <span>
      {greetingWord()}, <span className="text-gold-dark">{firstName}</span>
    </span>
  );

  return (
    <div>
      {showWalkthrough && <Walkthrough onDone={finishWalkthrough} />}

      <Header title={greeting} subtitle="Here's your Sila overview" rightExtra={<NotificationBell />} />

      {isEmpty ? (
        <Welcome />
      ) : (
        <>
          {/* Total Balance wallet */}
          <WalletCard totalBalance={data.totalBalance} accounts={data.accounts} />

          {/* Top Insights */}
          <div className="mb-4 mt-5 flex items-center justify-between">
            <SectionTitle>Top Insights</SectionTitle>
            <Link href="/insights" className="text-xs font-medium text-primary">
              View more →
            </Link>
          </div>
          <Card className="mb-5 grid grid-cols-3 divide-x divide-light-gray">
            <Insight label="Income" value={sar(data.income)} />
            <Insight label="Saving Rate" value={`${data.savingPercentage}%`} center />
            <Insight label="Spending" value={sar(data.spending)} right />
          </Card>

          {/* Top Category / Last Month */}
          <div className="mb-5 grid grid-cols-2 gap-4">
            <TileStat
              tag="Top Category"
              value={data.topCategories[0]?.category ?? "—"}
              sub={
                data.income > 0 && data.topCategories[0]
                  ? `Using ${Math.round((data.topCategories[0].total / data.income) * 100)}% of income`
                  : ""
              }
            />
            <TileStat
              tag="Last Month"
              value={sar(data.monthlyComparison.previousMonthSpending)}
              sub={lastMonthSub(
                data.monthlyComparison.currentMonthSpending,
                data.monthlyComparison.previousMonthSpending
              )}
            />
          </div>

          {/* Recent Transactions preview */}
          <div className="mb-3 flex items-center justify-between">
            <SectionTitle>Recent Transactions</SectionTitle>
            <Link href="/transactions" className="text-xs font-medium text-primary">
              View all →
            </Link>
          </div>
          <div className="mb-5 flex flex-col gap-2">
            {data.recentTransactions.map((t) => (
              <TransactionRow key={t.transactionId} t={t} />
            ))}
          </div>

          {/* Top Spending Categories */}
          <Card className="mb-5">
            <SectionTitle>Top Spending Categories</SectionTitle>
            <DonutChart data={data.topCategories} />
            <ul className="mt-3 space-y-2">
              {data.topCategories.map((c) => {
                const pct = data.spending > 0 ? Math.round((c.total / data.spending) * 100) : 0;
                return (
                  <li key={c.category} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span
                        className="inline-block h-3 w-3 rounded-full"
                        style={{ backgroundColor: categoryColor(c.category) }}
                      />
                      <span className="text-navy/70">{c.category}</span>
                      <span className="text-xs text-navy/40">{pct}%</span>
                    </span>
                    <span className="font-semibold text-navy">{sar(c.total)}</span>
                  </li>
                );
              })}
            </ul>
          </Card>

          {/* AI Insights */}
          {data.aiHighlights.length > 0 && (
            <>
              <SectionTitle>AI Insights · {data.periodLabel}</SectionTitle>
              <div className="mb-5 flex flex-col gap-2">
                {data.aiHighlights.map((h, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-light-gray bg-white p-3.5 text-sm text-navy/80"
                  >
                    {h}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Summary */}
          <SectionTitle>Summary</SectionTitle>
          <Card className="bg-surface/60">
            <ul className="list-disc space-y-1 pl-4 text-sm text-navy/80">
              {data.summaryPoints.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </Card>
        </>
      )}
    </div>
  );
}

function Insight({
  label,
  value,
  center,
  right,
}: {
  label: string;
  value: string;
  center?: boolean;
  right?: boolean;
}) {
  return (
    <div className={`px-2 ${center ? "text-center" : right ? "text-right" : ""}`}>
      <p className="text-[11px] text-navy/50">{label}</p>
      <p className="mt-1 text-base font-bold text-navy">{value}</p>
    </div>
  );
}

function TileStat({ tag, value, sub }: { tag: string; value: string; sub: string }) {
  return (
    <div>
      <span className="inline-block rounded-full bg-surface px-2.5 py-0.5 text-[11px] font-medium text-navy/60">
        {tag}
      </span>
      <p className="mt-2 text-xl font-bold text-navy">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-navy/50">{sub}</p>}
    </div>
  );
}

function lastMonthSub(current: number, previous: number): string {
  if (current <= 0) return "";
  const diff = Math.round(((current - previous) / current) * 100);
  if (diff > 0) return `${diff}% lower than this month`;
  if (diff < 0) return `${-diff}% higher than this month`;
  return "Same as this month";
}
