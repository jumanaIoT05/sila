// =============================================================
// AI service (FR-7, FR-8-tips, FR-11).
// Builds the ALREADY-COMPUTED financial context, hands it to the active AI
// provider, and PERSISTS the returned natural-language text through the
// generic ai_output entity (RECOMMENDATION / INSIGHT / SCORE_TIP).
//
// Two hard rules:
//  1. The provider NEVER computes financial values — it only analyzes the
//     numbers the app already computed (AiContext) and returns text.
//  2. AI runs ONLY on explicit request (regenerateAiOutputs). It is best-effort:
//     a provider failure must never break the caller. Reads (dashboard, lists)
//     use PERSISTED outputs and never call the provider.
// =============================================================

import { prisma } from "../db/prisma";
import { getAIProvider, type AiContext, type AiAnalysis } from "../ai";
import { computeFinancials, type Period } from "./analysis.service";
import { getBudgetStatus } from "./budget.service";
import { getLatestScore } from "./score.service";
import type { AiOutputDTO } from "@/types";

async function aiTypeId(name: string): Promise<number> {
  const t = await prisma.aiOutputType.findFirst({ where: { outputTypeName: name } });
  if (!t) throw new Error(`Missing ai_output_type '${name}' — run the seed.`);
  return t.aiOutputTypeId;
}

// Assembles the grounded context handed to the provider, scoped to a period.
export async function buildContext(
  userId: number,
  period: Period = "monthly"
): Promise<AiContext> {
  const [financials, budgets, latestScore] = await Promise.all([
    computeFinancials(userId, period),
    getBudgetStatus(userId),
    getLatestScore(userId),
  ]);

  return {
    income: financials.income,
    spending: financials.spending,
    savingPercentage: financials.savingPercentage,
    topCategories: financials.topCategories,
    monthlyChangePercent: financials.monthlyComparison.changePercent,
    financialScore: latestScore?.scoreValue ?? 0,
    overBudgetCategories: budgets.filter((b) => b.overBudget).map((b) => b.category),
  };
}

// Dashboard AI highlights — read from PERSISTED outputs only (no provider
// call). This keeps the dashboard instant and ensures AI is invoked strictly
// on explicit user request, not on every page load.
export async function getLatestHighlights(userId: number): Promise<string[]> {
  const [insights, recs] = await Promise.all([
    listAiOutputs(userId, "INSIGHT"),
    listAiOutputs(userId, "RECOMMENDATION"),
  ]);
  const combined = [
    ...insights.slice(0, 2).map((o) => o.content),
    ...recs.slice(0, 1).map((o) => o.content),
  ];
  return [...new Set(combined)];
}

// Runs an AI analysis for the user — called ONLY on explicit request
// (POST /api/ai). One provider call returns every section. The provider never
// throws (Gemini falls back to Mock internally), so this never breaks the
// caller. Insights / recommendations / financial-health are also persisted to
// ai_output so the dashboard highlights and Score tip stay populated.
export async function analyzeFinances(userId: number): Promise<AiAnalysis> {
  const provider = getAIProvider();
  const ctx = await buildContext(userId);

  let analysis: AiAnalysis;
  try {
    analysis = await provider.analyze(ctx);
  } catch (e) {
    // Extra safety net — providers already guard, but never let AI break here.
    console.error("[ai] analyze failed unexpectedly — returning empty analysis:", e);
    analysis = { financialHealth: "", insights: [], recommendations: [], goalAdvice: [], budgetSuggestions: [] };
  }

  const [recTypeId, insightTypeId, tipTypeId] = await Promise.all([
    aiTypeId("RECOMMENDATION"),
    aiTypeId("INSIGHT"),
    aiTypeId("SCORE_TIP"),
  ]);

  const rows = [
    ...analysis.recommendations.map((content) => ({ userId, aiOutputTypeId: recTypeId, content })),
    ...analysis.insights.map((content) => ({ userId, aiOutputTypeId: insightTypeId, content })),
    ...(analysis.financialHealth
      ? [{ userId, aiOutputTypeId: tipTypeId, content: analysis.financialHealth }]
      : []),
  ];
  if (rows.length > 0) await prisma.aiOutput.createMany({ data: rows });

  return analysis;
}

// Returns the most recent outputs, optionally filtered by type.
// The DB keeps the full history (outputs are appended on every recalc), but
// the UI wants the current distinct set — so we dedupe by content, keeping
// the most recent occurrence of each.
export async function listAiOutputs(userId: number, type?: string): Promise<AiOutputDTO[]> {
  const outputs = await prisma.aiOutput.findMany({
    where: {
      userId,
      ...(type ? { outputType: { outputTypeName: type } } : {}),
    },
    include: { outputType: true },
    orderBy: { generatedAt: "desc" },
    take: 60,
  });

  const seen = new Set<string>();
  const distinct: AiOutputDTO[] = [];
  for (const o of outputs) {
    const key = `${o.outputType.outputTypeName}:${o.content}`;
    if (seen.has(key)) continue;
    seen.add(key);
    distinct.push({
      aiOutputId: o.aiOutputId,
      type: o.outputType.outputTypeName,
      content: o.content,
      generatedAt: o.generatedAt.toISOString(),
    });
  }
  return distinct.slice(0, 12);
}
