// =============================================================
// Budget service (FR-10).
// Smart Budgets are a separate entity (one user -> many category budgets).
// Provides budget-vs-actual status and auto-suggestion from spending history.
// =============================================================

import { prisma } from "../db/prisma";
import { toNumber, round2 } from "../util/money";
import { categorySpendingThisMonth } from "./analysis.service";
import { startOfPreviousMonth, startOfMonth } from "../util/dates";
import { recalculate } from "./recalc.service";
import { AppError } from "../http";
import type { BudgetDTO } from "@/types";

export async function getBudgetStatus(userId: number): Promise<BudgetDTO[]> {
  const [budgets, actualByCat] = await Promise.all([
    prisma.smartBudget.findMany({ where: { userId }, include: { category: true } }),
    categorySpendingThisMonth(userId),
  ]);

  return budgets.map((b) => {
    const actual = round2(actualByCat.get(b.spendingCategoryId) ?? 0);
    const recommended = toNumber(b.recommendedAmount);
    return {
      budgetId: b.budgetId,
      category: b.category.categoryName,
      spendingCategoryId: b.spendingCategoryId,
      recommendedAmount: recommended,
      actualSpending: actual,
      remaining: round2(recommended - actual),
      overBudget: actual > recommended,
    };
  });
}

// Manually create a budget for a category (one budget per category — if one
// already exists it is updated). Recalculates (budgets feed the score/AI).
export async function createBudget(
  userId: number,
  spendingCategoryId: number,
  recommendedAmount: number
): Promise<BudgetDTO[]> {
  const category = await prisma.spendingCategory.findUnique({ where: { spendingCategoryId } });
  if (!category) throw new AppError("Invalid category", 422);

  const existing = await prisma.smartBudget.findFirst({
    where: { userId, spendingCategoryId },
  });
  if (existing) {
    await prisma.smartBudget.update({
      where: { budgetId: existing.budgetId },
      data: { recommendedAmount: recommendedAmount.toFixed(2) },
    });
  } else {
    await prisma.smartBudget.create({
      data: { userId, spendingCategoryId, recommendedAmount: recommendedAmount.toFixed(2) },
    });
  }
  await recalculate(userId); // FR-13
  return getBudgetStatus(userId);
}

export async function updateBudget(
  userId: number,
  budgetId: number,
  recommendedAmount: number
): Promise<BudgetDTO[]> {
  const existing = await prisma.smartBudget.findFirst({ where: { budgetId, userId } });
  if (!existing) throw new AppError("Budget not found", 404);
  await prisma.smartBudget.update({
    where: { budgetId },
    data: { recommendedAmount: recommendedAmount.toFixed(2) },
  });
  await recalculate(userId); // FR-13
  return getBudgetStatus(userId);
}

export async function deleteBudget(userId: number, budgetId: number): Promise<BudgetDTO[]> {
  const existing = await prisma.smartBudget.findFirst({ where: { budgetId, userId } });
  if (!existing) throw new AppError("Budget not found", 404);
  await prisma.smartBudget.delete({ where: { budgetId } });
  await recalculate(userId); // FR-13
  return getBudgetStatus(userId);
}

// Auto-suggest budgets from the previous month's spending per category
// (FR-10). Upserts one smart_budget row per category the user spent in.
export async function suggestBudgets(userId: number): Promise<BudgetDTO[]> {
  const prevStart = startOfPreviousMonth();
  const monthStart = startOfMonth();

  const txns = await prisma.transaction.findMany({
    where: { userId, transactionDate: { gte: prevStart, lt: monthStart } },
    include: { transactionType: true },
  });

  const byCat = new Map<number, number>();
  for (const t of txns) {
    if (t.transactionType.typeName.toLowerCase() === "salary") continue;
    byCat.set(t.spendingCategoryId, (byCat.get(t.spendingCategoryId) ?? 0) + toNumber(t.amount));
  }

  // Recommend last month's spend rounded up to a tidy target (+10% headroom).
  for (const [categoryId, spent] of byCat.entries()) {
    const recommended = round2(spent * 1.1);
    const existing = await prisma.smartBudget.findFirst({
      where: { userId, spendingCategoryId: categoryId },
    });
    if (existing) {
      await prisma.smartBudget.update({
        where: { budgetId: existing.budgetId },
        data: { recommendedAmount: recommended.toFixed(2) },
      });
    } else {
      await prisma.smartBudget.create({
        data: { userId, spendingCategoryId: categoryId, recommendedAmount: recommended.toFixed(2) },
      });
    }
  }

  await recalculate(userId); // FR-13
  return getBudgetStatus(userId);
}
