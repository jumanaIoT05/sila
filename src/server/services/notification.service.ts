// =============================================================
// Notification service (in-app smart notifications).
// Notifications are generated DYNAMICALLY from the user's current financial
// state (no notification table). Rules are kept small and important-only so
// the list never overcrowds. Adding a new notification type = adding a rule.
// =============================================================

import { prisma } from "../db/prisma";
import { getBudgetStatus } from "./budget.service";
import { startOfMonth } from "../util/dates";
import { toNumber } from "../util/money";
import type { NotificationDTO } from "@/types";

const sar = (n: number) => `${Math.round(n).toLocaleString()} SAR`;

export async function getNotifications(userId: number): Promise<NotificationDTO[]> {
  const monthStart = startOfMonth();
  const [budgets, monthTxns] = await Promise.all([
    getBudgetStatus(userId),
    prisma.transaction.findMany({
      where: { userId, transactionDate: { gte: monthStart } },
      include: { transactionType: true, category: true },
      orderBy: { transactionDate: "desc" },
    }),
  ]);

  const out: NotificationDTO[] = [];

  // Rule: budget almost reached / exceeded.
  for (const b of budgets) {
    if (b.overBudget) {
      out.push({
        id: `budget-over-${b.budgetId}`,
        type: "budget",
        icon: "⚠️",
        title: `${b.category} budget exceeded`,
        message: `You've spent ${sar(b.actualSpending)} of your ${sar(b.recommendedAmount)} budget.`,
      });
    } else if (b.recommendedAmount > 0 && b.actualSpending / b.recommendedAmount >= 0.8) {
      out.push({
        id: `budget-near-${b.budgetId}`,
        type: "budget",
        icon: "⚠️",
        title: `${b.category} budget almost reached`,
        message: `${Math.round((b.actualSpending / b.recommendedAmount) * 100)}% used — ${sar(b.remaining)} left.`,
      });
    }
  }

  // Rule: salary detected this month.
  const salary = monthTxns.find((t) => t.transactionType.typeName.toLowerCase() === "salary");
  if (salary) {
    out.push({
      id: `salary-${salary.transactionId}`,
      type: "income",
      icon: "💰",
      title: "Salary detected",
      message: `A deposit of ${sar(toNumber(salary.amount))} was received this month.`,
    });
  }

  // Rule: subscriptions renewed this month.
  const subs = monthTxns.filter((t) => t.category.categoryName === "Subscriptions");
  if (subs.length > 0) {
    const total = subs.reduce((s, t) => s + toNumber(t.amount), 0);
    out.push({
      id: "subs-month",
      type: "subscription",
      icon: "📺",
      title: "Subscriptions renewed",
      message: `${subs.length} subscription${subs.length > 1 ? "s" : ""} renewed this month (${sar(total)}).`,
    });
  }

  return out;
}
