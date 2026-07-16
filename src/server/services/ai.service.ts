// =============================================================
// AI service (FR-7, FR-8-tips, FR-11).
// Builds the financial context, calls the active AI provider, and
// PERSISTS every output through the generic ai_output entity,
// discriminated by ai_output_type (RECOMMENDATION / INSIGHT / SCORE_TIP).
// =============================================================

import { prisma } from "../db/prisma";
import { getAIProvider, type AiContext } from "../ai";
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

// Live, NON-persisted AI highlights for a given period. Used by the dashboard
// so its AI insight updates as the user switches period tabs, without polluting
// the persisted ai_output history (which stays the monthly running record).
export async function periodHighlights(userId: number, period: Period): Promise<string[]> {
  const provider = getAIProvider();
  const ctx = await buildContext(userId, period);
  const [insights, recs] = await Promise.all([
    provider.generateInsights(ctx),
    provider.generateRecommendations(ctx),
  ]);
  const combined = [...insights.slice(0, 2), ...recs.slice(0, 1)];
  // Dedupe while preserving order.
  return [...new Set(combined)];
}

// Regenerates all AI outputs for the user (called by recalc on every change).
// Replaces the current live set but keeps history is optional; here we append
// fresh outputs so ai_output serves as a running history (FR: persist for history).
export async function regenerateAiOutputs(userId: number): Promise<void> {
  const provider = getAIProvider();
  const ctx = await buildContext(userId);

  const [recs, insights, tip] = await Promise.all([
    provider.generateRecommendations(ctx),
    provider.generateInsights(ctx),
    provider.generateScoreTip(ctx),
  ]);

  const [recTypeId, insightTypeId, tipTypeId] = await Promise.all([
    aiTypeId("RECOMMENDATION"),
    aiTypeId("INSIGHT"),
    aiTypeId("SCORE_TIP"),
  ]);

  const rows = [
    ...recs.map((content) => ({ userId, aiOutputTypeId: recTypeId, content })),
    ...insights.map((content) => ({ userId, aiOutputTypeId: insightTypeId, content })),
    { userId, aiOutputTypeId: tipTypeId, content: tip },
  ];

  await prisma.aiOutput.createMany({ data: rows });
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
