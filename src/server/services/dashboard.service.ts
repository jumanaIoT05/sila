// =============================================================
// Dashboard service (FR-6).
// Aggregates the Smart Dashboard payload for a period (monthly by default):
// total balance across accounts, top spending categories, period comparison,
// dynamically-computed saving %, an overall summary, the latest transactions,
// and live AI highlights. Read-only (nothing persisted).
// =============================================================

import { computeFinancials, type Period } from "./analysis.service";
import { listAccounts, getTotalBalance } from "./account.service";
import { listTransactions } from "./transaction.service";
import { periodHighlights } from "./ai.service";
import { round2 } from "../util/money";
import type { DashboardDTO } from "@/types";

export async function getDashboard(
  userId: number,
  period: Period = "monthly"
): Promise<DashboardDTO> {
  const [financials, accounts, totalBalance, aiHighlights, recentTransactions] =
    await Promise.all([
      computeFinancials(userId, period),
      listAccounts(userId),
      getTotalBalance(userId),
      periodHighlights(userId, period),
      listTransactions(userId, { limit: 3 }),
    ]);

  const cmp = financials.monthlyComparison;
  const change = cmp.changePercent;
  const trendWord = !cmp.hasComparison
    ? "flat"
    : change > 0
      ? `up ${change}%`
      : change < 0
        ? `down ${Math.abs(change)}%`
        : "flat";

  const summary =
    `You have ${totalBalance.toLocaleString()} SAR across ${accounts.length} account(s). ` +
    `${financials.periodLabel[0].toUpperCase()}${financials.periodLabel.slice(1)} you saved ` +
    `${financials.savingPercentage}% of income` +
    (cmp.hasComparison ? `; spending is ${trendWord} ${cmp.comparisonLabel}.` : ".");

  // Discrete bullet lines for the Home "Summary" card.
  const summaryPoints = [
    `You have ${round2(totalBalance).toLocaleString()} SAR across ${accounts.length} account(s).`,
    `You saved ${financials.savingPercentage}% of income ${financials.periodLabel}.`,
    cmp.hasComparison
      ? `Spending is ${trendWord} ${cmp.comparisonLabel}.`
      : `Spending totals ${round2(financials.spending).toLocaleString()} SAR ${financials.periodLabel}.`,
  ];

  return {
    totalBalance,
    accounts,
    topCategories: financials.topCategories,
    monthlyComparison: cmp,
    savingPercentage: financials.savingPercentage,
    income: financials.income,
    spending: financials.spending,
    summary,
    summaryPoints,
    period: financials.period,
    periodLabel: financials.periodLabel,
    aiHighlights,
    recentTransactions,
  };
}
