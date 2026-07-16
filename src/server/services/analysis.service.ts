// =============================================================
// Analysis service (FR-5, FR-6, FR-13 core).
// Central analytics reused by dashboard, budgets, scores and AI.
// Classifies income vs spending, aggregates by category, and computes
// the dynamically-derived saving percentage — over a selectable PERIOD
// (all / days / monthly / yearly) with an adaptive comparison window.
// =============================================================

import { prisma } from "../db/prisma";
import { toNumber, round2 } from "../util/money";
import {
  startOfMonth,
  startOfPreviousMonth,
  startOfYear,
  startOfPreviousYear,
  daysAgo,
  isInRange,
} from "../util/dates";
import type { CategoryTotal, MonthlyComparison } from "@/types";

// Selectable dashboard period. Defaults to "monthly" everywhere it's omitted.
export type Period = "all" | "days" | "monthly" | "yearly";

export function normalizePeriod(raw?: string | null): Period {
  const v = (raw ?? "").toLowerCase();
  return v === "all" || v === "days" || v === "yearly" ? v : "monthly";
}

interface PeriodWindow {
  currentStart: Date;
  currentEnd: Date;
  prevStart: Date;
  prevEnd: Date;
  hasComparison: boolean;
  comparisonLabel: string; // e.g. "vs last month"
  periodLabel: string; // e.g. "this month"
  previousLabel: string; // e.g. "Last month"
}

// Resolves the current + previous windows for a period, anchored at `now`.
function windowFor(period: Period, now = new Date()): PeriodWindow {
  switch (period) {
    case "days": {
      const currentStart = daysAgo(7, now);
      return {
        currentStart,
        currentEnd: now,
        prevStart: daysAgo(14, now),
        prevEnd: currentStart,
        hasComparison: true,
        comparisonLabel: "vs previous 7 days",
        periodLabel: "in the last 7 days",
        previousLabel: "Prev. 7 days",
      };
    }
    case "yearly": {
      const currentStart = startOfYear(now);
      return {
        currentStart,
        currentEnd: now,
        prevStart: startOfPreviousYear(now),
        prevEnd: currentStart,
        hasComparison: true,
        comparisonLabel: "vs last year",
        periodLabel: "this year",
        previousLabel: "Last year",
      };
    }
    case "all": {
      return {
        currentStart: new Date(0),
        currentEnd: now,
        prevStart: new Date(0),
        prevEnd: new Date(0),
        hasComparison: false,
        comparisonLabel: "all time",
        periodLabel: "all time",
        previousLabel: "—",
      };
    }
    case "monthly":
    default: {
      const currentStart = startOfMonth(now);
      return {
        currentStart,
        currentEnd: now,
        prevStart: startOfPreviousMonth(now),
        prevEnd: currentStart,
        hasComparison: true,
        comparisonLabel: "vs last month",
        periodLabel: "this month",
        previousLabel: "Last month",
      };
    }
  }
}

// A transaction counts as income when its type is "Salary"; everything
// else (Purchase, Bill Payment, Transfer) is treated as spending.
function isIncomeType(typeName: string): boolean {
  return typeName.toLowerCase() === "salary";
}

export interface UserFinancials {
  period: Period;
  periodLabel: string;
  income: number;
  spending: number;
  savingPercentage: number;
  topCategories: CategoryTotal[];
  categoryTotals: CategoryTotal[];
  monthlyComparison: MonthlyComparison;
}

async function loadTransactions(userId: number) {
  return prisma.transaction.findMany({
    where: { userId },
    include: { transactionType: true, category: true },
    orderBy: { transactionDate: "desc" },
  });
}

export async function computeFinancials(
  userId: number,
  period: Period = "monthly"
): Promise<UserFinancials> {
  const txns = await loadTransactions(userId);
  const w = windowFor(period);

  let income = 0;
  let spending = 0;
  let prevSpending = 0;
  const categoryMap = new Map<string, number>();

  for (const t of txns) {
    const amount = toNumber(t.amount);
    const date = t.transactionDate;
    const income_ = isIncomeType(t.transactionType.typeName);

    // Current window: [currentStart, currentEnd]
    if (date >= w.currentStart && date <= w.currentEnd) {
      if (income_) {
        income += amount;
      } else {
        spending += amount;
        categoryMap.set(
          t.category.categoryName,
          (categoryMap.get(t.category.categoryName) ?? 0) + amount
        );
      }
    } else if (w.hasComparison && !income_ && isInRange(date, w.prevStart, w.prevEnd)) {
      prevSpending += amount;
    }
  }

  const categoryTotals: CategoryTotal[] = [...categoryMap.entries()]
    .map(([category, total]) => ({ category, total: round2(total) }))
    .sort((a, b) => b.total - a.total);

  const savingPercentage = income > 0 ? round2(((income - spending) / income) * 100) : 0;

  const changePercent =
    w.hasComparison && prevSpending > 0
      ? round2(((spending - prevSpending) / prevSpending) * 100)
      : 0;

  return {
    period,
    periodLabel: w.periodLabel,
    income: round2(income),
    spending: round2(spending),
    savingPercentage,
    topCategories: categoryTotals.slice(0, 5),
    categoryTotals,
    monthlyComparison: {
      currentMonthSpending: round2(spending),
      previousMonthSpending: round2(prevSpending),
      changePercent,
      comparisonLabel: w.comparisonLabel,
      previousLabel: w.previousLabel,
      hasComparison: w.hasComparison,
    },
  };
}

// Current-month actual spending per category (budget vs actual — always
// monthly, since budgets are defined per calendar month).
export async function categorySpendingThisMonth(userId: number): Promise<Map<number, number>> {
  const monthStart = startOfMonth();
  const txns = await prisma.transaction.findMany({
    where: { userId, transactionDate: { gte: monthStart } },
    include: { transactionType: true },
  });
  const byCat = new Map<number, number>();
  for (const t of txns) {
    if (isIncomeType(t.transactionType.typeName)) continue;
    byCat.set(t.spendingCategoryId, (byCat.get(t.spendingCategoryId) ?? 0) + toNumber(t.amount));
  }
  return byCat;
}
