// =============================================================
// Goal service (FR-12).
// Financial goals with two calculation modes:
//   • saving_driven  : user gives monthly saving -> compute months
//   • deadline_driven: user gives deadline months -> compute monthly saving
// Progress is tracked via `savedAmount` — an amount the user ALLOCATES toward
// the goal as a budgeting decision. No real money is moved or reserved.
// =============================================================

import { prisma } from "../db/prisma";
import { toNumber, round2 } from "../util/money";
import { AppError } from "../http";
import { getTotalBalance } from "./account.service";
import type { GoalDTO, GoalsOverviewDTO } from "@/types";
import type { GoalCalculationModeName } from "@/config/constants";

function toDTO(g: {
  goalId: number;
  goalType: string;
  mode: { modeName: string };
  targetAmount: unknown;
  monthlySavingAmount: unknown;
  estimatedMonths: number;
  savedAmount: unknown;
}): GoalDTO {
  const target = toNumber(g.targetAmount as never);
  const saved = toNumber(g.savedAmount as never);
  return {
    goalId: g.goalId,
    goalType: g.goalType,
    calculationMode: g.mode.modeName,
    targetAmount: target,
    monthlySavingAmount: toNumber(g.monthlySavingAmount as never),
    estimatedMonths: g.estimatedMonths,
    savedAmount: saved,
    progressPercent: target > 0 ? Math.min(100, round2((saved / target) * 100)) : 0,
  };
}

export async function listGoals(userId: number): Promise<GoalDTO[]> {
  const goals = await prisma.financialGoal.findMany({
    where: { userId },
    include: { mode: true },
    orderBy: { goalId: "desc" },
  });
  return goals.map(toDTO);
}

// Goals + allocation overview. `overAllocated` drives the smart warning that
// recent spending may affect what the user allocated toward their goals.
export async function getGoalsOverview(userId: number): Promise<GoalsOverviewDTO> {
  const [goals, totalBalance] = await Promise.all([listGoals(userId), getTotalBalance(userId)]);
  const totalAllocated = round2(goals.reduce((s, g) => s + g.savedAmount, 0));
  return {
    goals,
    totalAllocated,
    totalBalance,
    overAllocated: totalAllocated > totalBalance,
  };
}

// Derives the saving plan (monthly amount + months) from the calculation mode.
function derivePlan(input: {
  targetAmount: number;
  calculationMode: GoalCalculationModeName;
  monthlySavingAmount?: number;
  deadlineMonths?: number;
}): { monthlySavingAmount: number; estimatedMonths: number } {
  if (input.calculationMode === "saving_driven") {
    if (!input.monthlySavingAmount || input.monthlySavingAmount <= 0) {
      throw new AppError("monthlySavingAmount is required for saving_driven goals", 422);
    }
    const monthlySavingAmount = round2(input.monthlySavingAmount);
    return { monthlySavingAmount, estimatedMonths: Math.ceil(input.targetAmount / monthlySavingAmount) };
  }
  if (!input.deadlineMonths || input.deadlineMonths <= 0) {
    throw new AppError("deadlineMonths is required for deadline_driven goals", 422);
  }
  return {
    monthlySavingAmount: round2(input.targetAmount / input.deadlineMonths),
    estimatedMonths: input.deadlineMonths,
  };
}

export async function createGoal(
  userId: number,
  input: {
    goalType: string;
    targetAmount: number;
    calculationMode: GoalCalculationModeName;
    monthlySavingAmount?: number;
    deadlineMonths?: number;
  }
): Promise<GoalDTO> {
  const mode = await prisma.goalCalculationMode.findFirst({
    where: { modeName: input.calculationMode },
  });
  if (!mode) throw new AppError("Invalid calculation mode", 422);

  const plan = derivePlan(input);
  const goal = await prisma.financialGoal.create({
    data: {
      userId,
      calculationModeId: mode.calculationModeId,
      goalType: input.goalType,
      targetAmount: input.targetAmount.toFixed(2),
      monthlySavingAmount: plan.monthlySavingAmount.toFixed(2),
      estimatedMonths: plan.estimatedMonths,
    },
    include: { mode: true },
  });
  return toDTO(goal);
}

export async function updateGoal(
  userId: number,
  goalId: number,
  input: {
    goalType: string;
    targetAmount: number;
    calculationMode: GoalCalculationModeName;
    monthlySavingAmount?: number;
    deadlineMonths?: number;
  }
): Promise<GoalDTO> {
  const existing = await prisma.financialGoal.findFirst({ where: { goalId, userId } });
  if (!existing) throw new AppError("Goal not found", 404);

  const mode = await prisma.goalCalculationMode.findFirst({
    where: { modeName: input.calculationMode },
  });
  if (!mode) throw new AppError("Invalid calculation mode", 422);

  const plan = derivePlan(input);
  const goal = await prisma.financialGoal.update({
    where: { goalId },
    data: {
      calculationModeId: mode.calculationModeId,
      goalType: input.goalType,
      targetAmount: input.targetAmount.toFixed(2),
      monthlySavingAmount: plan.monthlySavingAmount.toFixed(2),
      estimatedMonths: plan.estimatedMonths,
    },
    include: { mode: true },
  });
  return toDTO(goal);
}

// Allocate (or de-allocate with a negative amount) toward a goal. Clamped to
// [0, targetAmount]. This is a budgeting choice only — no real funds move.
export async function allocateToGoal(
  userId: number,
  goalId: number,
  amount: number
): Promise<GoalDTO> {
  const existing = await prisma.financialGoal.findFirst({
    where: { goalId, userId },
    include: { mode: true },
  });
  if (!existing) throw new AppError("Goal not found", 404);

  const target = toNumber(existing.targetAmount);
  const current = toNumber(existing.savedAmount);
  const next = Math.min(Math.max(0, round2(current + amount)), target);

  const goal = await prisma.financialGoal.update({
    where: { goalId },
    data: { savedAmount: next.toFixed(2) },
    include: { mode: true },
  });
  return toDTO(goal);
}

export async function deleteGoal(userId: number, goalId: number): Promise<void> {
  const existing = await prisma.financialGoal.findFirst({ where: { goalId, userId } });
  if (!existing) throw new AppError("Goal not found", 404);
  await prisma.financialGoal.delete({ where: { goalId } });
}
