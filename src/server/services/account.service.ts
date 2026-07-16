// =============================================================
// Account service (FR-2, FR-4).
// Account listing, manual add (fallback), total balance, and manual
// balance adjustment which triggers a full recalculation (FR-13).
// Only last-4 digits are stored — never full account numbers.
// =============================================================

import { prisma } from "../db/prisma";
import { toNumber, round2 } from "../util/money";
import { AppError } from "../http";
import { recalculate } from "./recalc.service";
import type { AccountDTO } from "@/types";

function toDTO(a: {
  accountId: number;
  bankId: number;
  bank: { bankName: string };
  lastFourDigits: string;
  currentBalance: unknown;
  isManuallyAdded: boolean;
}): AccountDTO {
  return {
    accountId: a.accountId,
    bankId: a.bankId,
    bankName: a.bank.bankName,
    lastFourDigits: a.lastFourDigits,
    currentBalance: toNumber(a.currentBalance as never),
    isManuallyAdded: a.isManuallyAdded,
  };
}

// Active accounts only (removed accounts are hidden from the list & balance).
export async function listAccounts(userId: number): Promise<AccountDTO[]> {
  const accounts = await prisma.account.findMany({
    where: { userId, isActive: true },
    include: { bank: true },
    orderBy: { accountId: "asc" },
  });
  return accounts.map(toDTO);
}

export async function getTotalBalance(userId: number): Promise<number> {
  const accounts = await prisma.account.findMany({ where: { userId, isActive: true } });
  return round2(accounts.reduce((sum, a) => sum + toNumber(a.currentBalance), 0));
}

// Soft-remove: stops future SMS tracking for the account but PRESERVES all
// historical transactions & analytics. Recalculates derived data (FR-13).
export async function removeAccount(userId: number, accountId: number): Promise<AccountDTO[]> {
  const account = await prisma.account.findFirst({ where: { accountId, userId } });
  if (!account) throw new AppError("Account not found", 404);

  await prisma.account.update({
    where: { accountId },
    data: { isActive: false },
  });

  await recalculate(userId); // FR-13
  return listAccounts(userId);
}

export async function addManualAccount(
  userId: number,
  input: { bankId: number; lastFourDigits: string; currentBalance: number }
): Promise<AccountDTO> {
  const account = await prisma.account.create({
    data: {
      userId,
      bankId: input.bankId,
      lastFourDigits: input.lastFourDigits,
      currentBalance: input.currentBalance.toFixed(2),
      isManuallyAdded: true,
    },
    include: { bank: true },
  });
  return toDTO(account);
}

// Manual balance adjustment (FR-4). Recalculates all affected derived data.
export async function updateBalance(
  userId: number,
  accountId: number,
  currentBalance: number
): Promise<AccountDTO> {
  const account = await prisma.account.findFirst({ where: { accountId, userId } });
  if (!account) throw new AppError("Account not found", 404);

  const updated = await prisma.account.update({
    where: { accountId },
    data: { currentBalance: currentBalance.toFixed(2) },
    include: { bank: true },
  });

  await recalculate(userId); // FR-13
  return toDTO(updated);
}
