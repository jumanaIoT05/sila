// =============================================================
// Onboarding service (FR-2).
// Bank list, SMS-based account detection (mock), and account
// confirmation with one-time balance entry.
// =============================================================

import { prisma } from "../db/prisma";
import { parseSms } from "../sms/parser";
import { SAMPLE_SMS } from "../sms/samples";

export async function listBanks() {
  return prisma.bank.findMany({ orderBy: { bankName: "asc" } });
}

// Mock "detect accounts from SMS": parse sample messages, group by last-4.
// In production this would read the device SMS inbox. Returns candidate
// accounts (last four + guessed bank) for the user to confirm.
export async function detectAccountsFromSms(selectedBankIds: number[]) {
  const banks = await prisma.bank.findMany({ where: { bankId: { in: selectedBankIds } } });
  const bankByName = new Map(banks.map((b) => [b.bankName.toLowerCase(), b]));

  const detected = new Map<string, { bankId: number; bankName: string; lastFourDigits: string }>();

  for (const sms of SAMPLE_SMS) {
    const parsed = parseSms(sms);
    if (!parsed.lastFourDigits) continue;

    // Match a selected bank by name mention in the SMS.
    const matchedBank = banks.find((b) => sms.toLowerCase().includes(b.bankName.toLowerCase()));
    if (!matchedBank) continue;

    const key = `${matchedBank.bankId}-${parsed.lastFourDigits}`;
    if (!detected.has(key)) {
      detected.set(key, {
        bankId: matchedBank.bankId,
        bankName: matchedBank.bankName,
        lastFourDigits: parsed.lastFourDigits,
      });
    }
  }

  return [...detected.values()];
}

// Confirm accounts + one-time balance entry (FR-2.5). Creates account rows.
export async function confirmAccounts(
  userId: number,
  accounts: Array<{
    bankId: number;
    lastFourDigits: string;
    currentBalance: number;
    isManuallyAdded?: boolean;
  }>
) {
  await prisma.account.createMany({
    data: accounts.map((a) => ({
      userId,
      bankId: a.bankId,
      lastFourDigits: a.lastFourDigits,
      currentBalance: a.currentBalance.toFixed(2),
      isManuallyAdded: a.isManuallyAdded ?? false,
    })),
  });
  return prisma.account.findMany({ where: { userId }, include: { bank: true } });
}
