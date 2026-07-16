"use client";

import { useState } from "react";
import { api } from "@/lib/api-client";
import { Header } from "@/components/layout/Header";
import { Card, SectionTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Empty } from "@/components/ui/State";
import { lastAnalyzedLabel } from "@/lib/format";
import type { AiAnalysisDTO } from "@/types";

// Insights — on-demand financial analysis. "Analyze My Finances" runs the
// analysis; results are shown as clean cards. If the smart analysis is
// unavailable it transparently falls back to the built-in analysis; the
// experience is identical to the user (no technical details exposed).
export default function InsightsPage() {
  const [analysis, setAnalysis] = useState<AiAnalysisDTO | null>(null);
  const [analyzedAt, setAnalyzedAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    try {
      const res = await api.post<AiAnalysisDTO>("/ai");
      setAnalysis(res);
      setAnalyzedAt(new Date());
    } finally {
      setLoading(false);
    }
  }

  const hasAnalysis = !!analysis;

  return (
    <div>
      <Header title="AI Insights" subtitle="Powered by Sila" />

      {/* Primary action — until the first analysis exists */}
      {!hasAnalysis && (
        <Card className="mb-4 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-navy text-2xl">
            ✨
          </div>
          <SectionTitle>Analyze My Finances</SectionTitle>
          <p className="mx-auto max-w-xs text-sm text-navy/60">
            Get a personalized breakdown of your spending, saving, budgets and goals.
          </p>
          <Button fullWidth loading={loading} disabled={loading} onClick={run} className="mt-4">
            Analyze My Finances
          </Button>
        </Card>
      )}

      {/* Loading skeleton (shimmer) */}
      {loading && <AnalysisSkeleton />}

      {/* Results */}
      {!loading && analysis && (
        <div className="flex flex-col gap-4">
          {/* Financial Health (headline) */}
          <div className="rounded-2xl bg-gradient-navy p-5 text-white shadow-sm">
            <p className="mb-1 flex items-center gap-2 text-sm font-semibold opacity-90">
              ❤️ Financial Health
            </p>
            <p className="text-sm leading-relaxed opacity-95">
              {analysis.financialHealth || "Not enough data to assess yet."}
            </p>
          </div>

          <ListCard title="AI Insights" icon="✨" items={analysis.insights} />
          <ListCard title="AI Recommendations" icon="💡" items={analysis.recommendations} />
          <ListCard title="Goal Advisor" icon="🎯" items={analysis.goalAdvice} />
          <ListCard title="Budget Suggestions" icon="🧾" items={analysis.budgetSuggestions} />

          {analyzedAt && (
            <p className="text-center text-xs text-navy/50">
              Last analyzed: {lastAnalyzedLabel(analyzedAt)}
            </p>
          )}

          <Button variant="secondary" fullWidth onClick={run} disabled={loading}>
            🔄 Refresh Analysis
          </Button>
        </div>
      )}
    </div>
  );
}

function ListCard({
  title,
  icon,
  items,
}: {
  title: string;
  icon: string;
  items: string[];
}) {
  return (
    <Card className="animate-rise">
      <SectionTitle>
        {icon} {title}
      </SectionTitle>
      {items.length === 0 ? (
        <Empty label="Not enough data yet." />
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((t, i) => (
            <li
              key={i}
              className="rounded-xl bg-surface/60 p-3 text-sm leading-relaxed text-navy/80"
            >
              {t}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

// Shimmer placeholder using the shared skeleton style, shaped like the results.
function AnalysisSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="skeleton h-24 w-full" />
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="skeleton mb-3 h-4 w-32" />
          <div className="skeleton mb-2 h-10 w-full" />
          <div className="skeleton h-10 w-full" />
        </div>
      ))}
    </div>
  );
}
