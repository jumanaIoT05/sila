"use client";

import { useState } from "react";
import { useApi } from "@/hooks/useApi";
import { api } from "@/lib/api-client";
import { Header } from "@/components/layout/Header";
import { Card, SectionTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loading, ErrorState, Empty } from "@/components/ui/State";
import type { AiOutputDTO } from "@/types";

// FR-7 / FR-11: AI Recommendations + Insights (generic ai_output).
export default function InsightsPage() {
  const recs = useApi<AiOutputDTO[]>("/ai?type=RECOMMENDATION");
  const insights = useApi<AiOutputDTO[]>("/ai?type=INSIGHT");
  const [busy, setBusy] = useState(false);

  async function regenerate() {
    setBusy(true);
    try {
      await api.post("/ai");
      await Promise.all([recs.refetch(), insights.refetch()]);
    } finally {
      setBusy(false);
    }
  }

  const loading = recs.loading || insights.loading;
  const error = recs.error || insights.error;

  return (
    <div>
      <Header title="AI Insights" subtitle="Powered by Sila AI" />

      <div className="mb-4">
        <Button onClick={regenerate} loading={busy} variant="secondary" fullWidth>
          🔄 Regenerate
        </Button>
      </div>

      {loading && <Loading />}
      {error && <ErrorState message={error} />}

      <Card className="mb-4">
        <SectionTitle>Recommendations</SectionTitle>
        {recs.data && recs.data.length === 0 && <Empty label="No recommendations yet" />}
        <ul className="space-y-2">
          {recs.data?.map((r) => (
            <li key={r.aiOutputId} className="rounded-xl bg-gradient-purple p-4 text-sm text-white">
              {r.content}
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <SectionTitle>Insights</SectionTitle>
        {insights.data && insights.data.length === 0 && <Empty label="No insights yet" />}
        <ul className="space-y-2">
          {insights.data?.map((i) => (
            <li key={i.aiOutputId} className="rounded-xl bg-lavender p-4 text-sm text-navy/80">
              ✨ {i.content}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
