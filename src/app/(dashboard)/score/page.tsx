"use client";

import { useApi } from "@/hooks/useApi";
import { Header } from "@/components/layout/Header";
import { Card, SectionTitle } from "@/components/ui/Card";
import { StatCard } from "@/components/dashboard/StatCard";
import { TrendChart } from "@/components/charts/TrendChart";
import { Loading, ErrorState } from "@/components/ui/State";
import { monthLabel } from "@/lib/format";
import type { FinancialScoreDTO, HealthScoreDTO, AiOutputDTO } from "@/types";

interface ScoresPayload {
  latest: FinancialScoreDTO | null;
  history: FinancialScoreDTO[];
  health: HealthScoreDTO | null;
}

const healthTone: Record<string, string> = {
  Excellent: "text-green-600",
  Average: "text-amber-500",
  "Needs Improvement": "text-pink-purple",
};

// FR-8 / FR-9: Financial Score + Health Score with trend + tips.
export default function ScorePage() {
  const { data, loading, error } = useApi<ScoresPayload>("/scores");
  const { data: tips } = useApi<AiOutputDTO[]>("/ai?type=SCORE_TIP");

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} />;

  const score = data?.latest?.scoreValue ?? 0;
  const health = data?.health?.status ?? "—";
  const trend = (data?.history ?? []).map((s) => ({
    label: monthLabel(s.snapshotDate),
    value: s.scoreValue,
  }));

  return (
    <div>
      <Header title="Financial Score" subtitle="Your health" />

      <div className="mb-4 grid grid-cols-2 gap-4">
        <StatCard tone="navy" label="Financial Score" value={`${score}/100`} />
        <Card className="flex flex-col justify-center">
          <p className="text-sm text-navy/60">Health</p>
          <p className={`mt-2 text-2xl font-bold ${healthTone[health] ?? "text-navy"}`}>
            {health}
          </p>
        </Card>
      </div>

      <Card className="mb-4">
        <SectionTitle>Score trend</SectionTitle>
        <TrendChart data={trend} />
      </Card>

      <Card>
        <SectionTitle>Tips to improve</SectionTitle>
        <ul className="space-y-2">
          {(tips ?? []).slice(0, 3).map((t) => (
            <li key={t.aiOutputId} className="rounded-xl bg-lavender p-3 text-sm text-navy/80">
              💡 {t.content}
            </li>
          ))}
          {(!tips || tips.length === 0) && (
            <li className="text-sm text-navy/50">No tips yet.</li>
          )}
        </ul>
      </Card>
    </div>
  );
}
