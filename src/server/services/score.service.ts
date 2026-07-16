// =============================================================
// Score service (FR-8, FR-9).
// Financial Score (0-100) and Financial Health Score (Excellent /
// Average / Needs Improvement). Both persist as periodic SNAPSHOTS
// for trend history.
// =============================================================

import { prisma } from "../db/prisma";
import { computeFinancials, type UserFinancials } from "./analysis.service";
import { getBudgetStatus } from "./budget.service";
import type { FinancialScoreDTO, HealthScoreDTO } from "@/types";

// Deterministic 0-100 score from saving rate, budget adherence and trend.
export function calcFinancialScore(
  financials: UserFinancials,
  budgetOverCount: number,
  budgetTotalCount: number
): number {
  const base = 30;

  // Saving rate contributes up to 30 points.
  const savingScore = Math.min(Math.max(financials.savingPercentage, 0), 30);

  // Budget adherence contributes up to 20 points.
  const adherence =
    budgetTotalCount > 0 ? (budgetTotalCount - budgetOverCount) / budgetTotalCount : 1;
  const budgetScore = adherence * 20;

  // Spending trend contributes up to 20 points (flat/down = full).
  const change = financials.monthlyComparison.changePercent;
  const trendScore = change <= 0 ? 20 : Math.max(0, 20 - change * 0.5);

  return Math.round(Math.min(100, Math.max(0, base + savingScore + budgetScore + trendScore)));
}

export function scoreToHealthStatus(score: number): string {
  if (score >= 75) return "Excellent";
  if (score >= 50) return "Average";
  return "Needs Improvement";
}

// Computes and SNAPSHOTS both scores. Returns the fresh values.
export async function computeAndSnapshotScores(
  userId: number
): Promise<{ financialScore: number; healthStatus: string }> {
  const financials = await computeFinancials(userId);
  const budgets = await getBudgetStatus(userId);
  const overCount = budgets.filter((b) => b.overBudget).length;

  const financialScore = calcFinancialScore(financials, overCount, budgets.length);
  const healthStatus = scoreToHealthStatus(financialScore);

  // Persist snapshots (FR-8 / FR-9 historical trend).
  await prisma.financialScoreSnapshot.create({
    data: { userId, scoreValue: financialScore },
  });

  const status = await prisma.healthStatus.findFirst({ where: { statusName: healthStatus } });
  if (status) {
    await prisma.healthScoreSnapshot.create({
      data: { userId, healthStatusId: status.healthStatusId },
    });
  }

  return { financialScore, healthStatus };
}

export async function getLatestScore(userId: number): Promise<FinancialScoreDTO | null> {
  const snap = await prisma.financialScoreSnapshot.findFirst({
    where: { userId },
    orderBy: { snapshotDate: "desc" },
  });
  return snap
    ? { scoreValue: snap.scoreValue, snapshotDate: snap.snapshotDate.toISOString() }
    : null;
}

// Trend history for the chart. A fresh snapshot is written on every recalc,
// so the raw table can hold many same-day rows. For a clean trend we collapse
// to ONE point per calendar month — the latest score in that month.
export async function getScoreHistory(userId: number): Promise<FinancialScoreDTO[]> {
  const snaps = await prisma.financialScoreSnapshot.findMany({
    where: { userId },
    orderBy: { snapshotDate: "asc" },
  });

  const latestPerMonth = new Map<string, (typeof snaps)[number]>();
  for (const s of snaps) {
    const d = s.snapshotDate;
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    latestPerMonth.set(key, s); // ascending order -> last write wins = latest
  }

  return [...latestPerMonth.values()].map((s) => ({
    scoreValue: s.scoreValue,
    snapshotDate: s.snapshotDate.toISOString(),
  }));
}

export async function getLatestHealth(userId: number): Promise<HealthScoreDTO | null> {
  const snap = await prisma.healthScoreSnapshot.findFirst({
    where: { userId },
    orderBy: { snapshotDate: "desc" },
    include: { status: true },
  });
  return snap
    ? { status: snap.status.statusName, snapshotDate: snap.snapshotDate.toISOString() }
    : null;
}
