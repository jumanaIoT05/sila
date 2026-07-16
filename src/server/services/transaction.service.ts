// =============================================================
// Transaction service (FR-3, FR-4, FR-5, FR-13).
// Create transactions (manual or from SMS), auto-apply to the account
// balance, and trigger recalculation. Every transaction carries BOTH a
// transaction type and a spending category (independent fields).
// =============================================================

import { prisma } from "../db/prisma";
import { toNumber } from "../util/money";
import { AppError } from "../http";
import { parseSms } from "../sms/parser";
import { recalculate } from "./recalc.service";
import type { TransactionDTO } from "@/types";

function isIncome(typeName: string): boolean {
  return typeName.toLowerCase() === "salary";
}

export async function listTransactions(
  userId: number,
  opts: { limit?: number } = {}
): Promise<TransactionDTO[]> {
  const txns = await prisma.transaction.findMany({
    where: { userId },
    include: { transactionType: true, category: true, account: { include: { bank: true } } },
    orderBy: { transactionDate: "desc" },
    take: opts.limit ?? 50,
  });

  return txns.map((t) => ({
    transactionId: t.transactionId,
    accountId: t.accountId,
    accountLabel: `${t.account.bank.bankName} ••${t.account.lastFourDigits}`,
    bankName: t.account.bank.bankName,
    lastFourDigits: t.account.lastFourDigits,
    transactionType: t.transactionType.typeName,
    category: t.category.categoryName,
    amount: toNumber(t.amount),
    direction: isIncome(t.transactionType.typeName) ? "in" : "out",
    transactionDate: t.transactionDate.toISOString(),
  }));
}

// Manual categorization (FR-5): assign how withdrawn cash (or any uncategorized
// transaction) was actually spent. Recalculates all derived data (FR-13).
export async function categorizeTransaction(
  userId: number,
  transactionId: number,
  spendingCategoryId: number
): Promise<TransactionDTO> {
  const txn = await prisma.transaction.findFirst({ where: { transactionId, userId } });
  if (!txn) throw new AppError("Transaction not found", 404);

  const category = await prisma.spendingCategory.findUnique({
    where: { spendingCategoryId },
  });
  if (!category) throw new AppError("Invalid spending category", 422);

  await prisma.transaction.update({
    where: { transactionId },
    data: { spendingCategoryId },
  });

  await recalculate(userId); // FR-13: budgets, scores, insights all update

  const list = await listTransactions(userId, { limit: 100 });
  return list.find((t) => t.transactionId === transactionId)!;
}

// Applies a transaction's effect to the account balance:
// income adds, everything else subtracts.
async function applyToBalance(accountId: number, amount: number, typeName: string) {
  const delta = isIncome(typeName) ? amount : -amount;
  await prisma.account.update({
    where: { accountId },
    data: { currentBalance: { increment: delta } },
  });
}

export async function createTransaction(
  userId: number,
  input: {
    accountId: number;
    transactionTypeId: number;
    spendingCategoryId: number;
    amount: number;
    transactionDate?: string;
  }
): Promise<TransactionDTO> {
  const account = await prisma.account.findFirst({
    where: { accountId: input.accountId, userId },
  });
  if (!account) throw new AppError("Account not found for this user", 404);

  const type = await prisma.transactionType.findUnique({
    where: { transactionTypeId: input.transactionTypeId },
  });
  if (!type) throw new AppError("Invalid transaction type", 422);

  const created = await prisma.transaction.create({
    data: {
      userId,
      accountId: input.accountId,
      transactionTypeId: input.transactionTypeId,
      spendingCategoryId: input.spendingCategoryId,
      amount: input.amount.toFixed(2),
      transactionDate: input.transactionDate ? new Date(input.transactionDate) : new Date(),
    },
  });

  await applyToBalance(input.accountId, input.amount, type.typeName);
  await recalculate(userId); // FR-13

  const [dto] = await listTransactions(userId, { limit: 1 });
  return dto ?? {
    transactionId: created.transactionId,
    accountId: created.accountId,
    accountLabel: "",
    bankName: "",
    lastFourDigits: "",
    transactionType: type.typeName,
    category: "",
    amount: input.amount,
    direction: isIncome(type.typeName) ? "in" : "out",
    transactionDate: created.transactionDate.toISOString(),
  };
}

// Ingest a raw bank SMS (FR-3): parse -> resolve account by last-4 ->
// resolve lookup ids -> create transaction (which recalculates).
export async function ingestSms(userId: number, message: string): Promise<TransactionDTO> {
  const parsed = parseSms(message);

  // Resolve target account by last-4 (fall back to the user's first account).
  let account = parsed.lastFourDigits
    ? await prisma.account.findFirst({
        where: { userId, lastFourDigits: parsed.lastFourDigits },
      })
    : null;
  if (!account) {
    account = await prisma.account.findFirst({ where: { userId }, orderBy: { accountId: "asc" } });
  }
  if (!account) throw new AppError("No account found to attach this transaction to.", 404);

  const [type, category] = await Promise.all([
    prisma.transactionType.findFirst({ where: { typeName: parsed.transactionType } }),
    prisma.spendingCategory.findFirst({ where: { categoryName: parsed.category } }),
  ]);
  if (!type || !category) throw new AppError("Lookup values missing — run the seed.", 500);

  return createTransaction(userId, {
    accountId: account.accountId,
    transactionTypeId: type.transactionTypeId,
    spendingCategoryId: category.spendingCategoryId,
    amount: parsed.amount,
    transactionDate: parsed.transactionDate.toISOString(),
  });
}
