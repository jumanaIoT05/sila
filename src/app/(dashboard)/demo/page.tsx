"use client";

import { useState } from "react";
import Link from "next/link";
import { useApi } from "@/hooks/useApi";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";
import { Loading, ErrorState } from "@/components/ui/State";

interface Scenario {
  key: string;
  title: string;
  description: string;
  icon: string;
  messageCount: number;
}

// Demo Mode (presentation / hackathon only). Replays predefined bank SMS
// scenarios through the real ingestion pipeline. Reached only from Settings,
// so it stays out of the normal user workflow.
export default function DemoPage() {
  const { data, loading, error } = useApi<Scenario[]>("/demo");
  const toast = useToast();
  const [running, setRunning] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  async function run(s: Scenario) {
    setRunning(s.key);
    setResult(null);
    try {
      const res = await api.post<{ scenario: string; added: number }>("/demo/run", {
        scenario: s.key,
      });
      setResult(`✅ ${res.scenario}: ${res.added} transactions processed. Everything updated.`);
      toast.success("Scenario Complete");
    } catch (e) {
      setResult(e instanceof Error ? `⚠️ ${e.message}` : "⚠️ Failed");
    } finally {
      setRunning(null);
    }
  }

  return (
    <div>
      {/* Header (kept simple — this is a utility screen, back to Settings) */}
      <div className="mb-5 flex items-center gap-3">
        <Link
          href="/profile"
          aria-label="Back"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-primary"
        >
          ←
        </Link>
        <div>
          <p className="text-xs text-navy/60">Presentation tools</p>
          <h1 className="text-lg font-bold text-navy">Demo Mode</h1>
        </div>
      </div>

      {/* Separation banner */}
      <div className="mb-5 rounded-2xl border border-gold/40 bg-gold/10 p-4 text-sm text-navy/80">
        🎬 <b>For demos &amp; presentations.</b> Each scenario replays realistic bank SMS through
        the same parser the app uses — generating real transactions that update your Dashboard,
        Activity, Budgets, Scores, Goals and AI Insights.
      </div>

      {loading && <Loading />}
      {error && <ErrorState message={error} />}

      <div className="flex flex-col gap-3">
        {data?.map((s) => (
          <div key={s.key} className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface text-xl">
                {s.icon}
              </span>
              <div className="flex-1">
                <p className="font-semibold text-navy">{s.title}</p>
                <p className="mt-0.5 text-xs text-navy/60">{s.description}</p>
                <p className="mt-1 text-[11px] text-navy/40">{s.messageCount} messages</p>
              </div>
            </div>
            <button
              onClick={() => run(s)}
              disabled={!!running}
              className="mt-3 w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-white transition active:scale-[0.99] disabled:opacity-50"
            >
              {running === s.key ? "Processing messages…" : "Run scenario"}
            </button>
          </div>
        ))}
      </div>

      {result && (
        <div className="mt-4 rounded-2xl bg-surface p-4 text-sm text-navy/80">{result}</div>
      )}

      <p className="mt-4 text-center text-xs text-navy/50">
        Tip: open Home or Activity after running to see the changes.
      </p>
    </div>
  );
}
