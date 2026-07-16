// =============================================================
// Sila — database seed.
// Populates the 6 lookup tables + a rich demo dataset for one user
// so the dashboard, scores, budgets, goals and AI outputs are
// fully populated on first run.
//
// Run with: npm run db:seed   (or `prisma db seed`)
// =============================================================

import { PrismaClient } from "@prisma/client";
import {
  BANKS,
  TRANSACTION_TYPES,
  SPENDING_CATEGORIES,
  AI_OUTPUT_TYPES,
  HEALTH_STATUSES,
  GOAL_CALCULATION_MODES,
} from "../src/config/constants";

const prisma = new PrismaClient();

const DEMO_PHONE = "0500000000";

async function seedLookups() {
  // Idempotent-ish: seed only when empty, so re-running after a reset is clean.
  await prisma.bank.createMany({ data: BANKS.map((bankName) => ({ bankName })) });
  await prisma.transactionType.createMany({
    data: TRANSACTION_TYPES.map((typeName) => ({ typeName })),
  });
  await prisma.spendingCategory.createMany({
    data: SPENDING_CATEGORIES.map((categoryName) => ({ categoryName })),
  });
  await prisma.aiOutputType.createMany({
    data: AI_OUTPUT_TYPES.map((outputTypeName) => ({ outputTypeName })),
  });
  await prisma.healthStatus.createMany({
    data: HEALTH_STATUSES.map((statusName) => ({ statusName })),
  });
  await prisma.goalCalculationMode.createMany({
    data: GOAL_CALCULATION_MODES.map((modeName) => ({ modeName })),
  });
}

async function main() {
  console.log("🌱 Seeding Sela database...");

  // --- 1. Lookups -------------------------------------------------
  await seedLookups();

  // Build name → id maps for readable references below.
  const banks = await prisma.bank.findMany();
  const types = await prisma.transactionType.findMany();
  const cats = await prisma.spendingCategory.findMany();
  const aiTypes = await prisma.aiOutputType.findMany();
  const health = await prisma.healthStatus.findMany();
  const modes = await prisma.goalCalculationMode.findMany();

  const bankId = (n: string) => banks.find((b) => b.bankName === n)!.bankId;
  const typeId = (n: string) => types.find((t) => t.typeName === n)!.transactionTypeId;
  const catId = (n: string) => cats.find((c) => c.categoryName === n)!.spendingCategoryId;
  const aiTypeId = (n: string) => aiTypes.find((a) => a.outputTypeName === n)!.aiOutputTypeId;
  const healthId = (n: string) => health.find((h) => h.statusName === n)!.healthStatusId;
  const modeId = (n: string) => modes.find((m) => m.modeName === n)!.calculationModeId;

  // --- 2. Demo user ----------------------------------------------
  const user = await prisma.appUser.create({
    data: { phoneNumber: DEMO_PHONE, fullName: "Mayar Turki" },
  });
  console.log(`   • demo user #${user.userId} (${DEMO_PHONE})`);

  // --- 3. Accounts (across multiple banks) -----------------------
  const rajhi = await prisma.account.create({
    data: {
      userId: user.userId,
      bankId: bankId("Al Rajhi Bank"),
      lastFourDigits: "4821",
      currentBalance: "12450.00",
      isManuallyAdded: false,
    },
  });
  const snb = await prisma.account.create({
    data: {
      userId: user.userId,
      bankId: bankId("SNB"),
      lastFourDigits: "7735",
      currentBalance: "5300.00",
      isManuallyAdded: false,
    },
  });
  const alinma = await prisma.account.create({
    data: {
      userId: user.userId,
      bankId: bankId("Alinma Bank"),
      lastFourDigits: "1092",
      currentBalance: "1875.50",
      isManuallyAdded: true,
    },
  });
  const accounts = [rajhi, snb, alinma];

  // --- 4. Transactions (3 months of realistic activity) ----------
  // Deterministic pseudo-data: monthly salary + recurring bills +
  // varied purchases across categories.
  type TxSeed = {
    account: typeof rajhi;
    type: string;
    category: string;
    amount: string;
    monthsAgo: number; // 0 = current calendar month
    day: number; // day-of-month
  };

  const purchaseCats: Array<[string, string]> = [
    ["Restaurants", "72.00"],
    ["Restaurants", "145.50"],
    ["Shopping", "320.00"],
    ["Shopping", "89.99"],
    ["Transportation", "55.00"],
    ["Transportation", "40.00"],
    ["Groceries", "210.75"],
    ["Groceries", "163.20"],
    ["Entertainment", "60.00"],
    ["Health", "130.00"],
  ];

  const txSeeds: TxSeed[] = [];

  // 3 calendar-month cycles (current + 2 previous): salary, bills, purchases.
  // Anchoring to calendar months (not rolling "days ago") keeps the current
  // month populated regardless of which day the seed is run.
  //
  // A per-month spending multiplier makes each month differ, so trends,
  // month-over-month comparisons and AI insights look dynamic in demos.
  const monthFactor = [1.0, 0.78, 0.9]; // current, last month, two months ago

  // Rotate purchases across all linked banks so Activity looks realistic.
  const accountCycle = [rajhi, snb, alinma];

  // Recurring subscriptions (constant each month), spread across banks.
  const subscriptions: Array<[string, string, typeof rajhi]> = [
    ["Netflix", "55.00", alinma],
    ["Spotify", "21.99", snb],
    ["Shahid", "35.00", alinma],
  ];

  for (let monthsAgo = 0; monthsAgo < 3; monthsAgo++) {
    const factor = monthFactor[monthsAgo];

    // Salary → Al Rajhi (constant)
    txSeeds.push({ account: rajhi, type: "Salary", category: "Income", amount: "8000.00", monthsAgo, day: 1 });

    // Recurring bills (constant), across two banks
    txSeeds.push({ account: rajhi, type: "Bill Payment", category: "Bills", amount: "450.00", monthsAgo, day: 3 });
    txSeeds.push({ account: alinma, type: "Bill Payment", category: "Bills", amount: "120.00", monthsAgo, day: 5 });

    // Recurring subscriptions (constant)
    subscriptions.forEach(([name, amount, acct], i) => {
      txSeeds.push({ account: acct, type: "Bill Payment", category: "Subscriptions", amount, monthsAgo, day: 12 + i });
    });

    // A transfer between own use (constant)
    txSeeds.push({ account: snb, type: "Transfer", category: "Other", amount: "500.00", monthsAgo, day: 7 });

    // Discretionary purchases, scaled by the month factor, rotated across banks
    purchaseCats.forEach(([category, amount], i) => {
      txSeeds.push({
        account: accountCycle[i % accountCycle.length],
        type: "Purchase",
        category,
        amount: (Number(amount) * factor).toFixed(2),
        monthsAgo,
        day: 2 + i * 2,
      });
    });

    // Current month extras: a shopping/dining splurge so a discretionary
    // category clearly leads, plus a cash withdrawal left UNCATEGORIZED to
    // demo the manual categorization flow.
    if (monthsAgo === 0) {
      txSeeds.push({ account: alinma, type: "Purchase", category: "Shopping", amount: "350.00", monthsAgo, day: 9 });
      txSeeds.push({ account: snb, type: "Purchase", category: "Restaurants", amount: "195.00", monthsAgo, day: 11 });
      txSeeds.push({ account: rajhi, type: "Cash Withdrawal", category: "Other", amount: "300.00", monthsAgo, day: 16 });
    }
  }

  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const nowDate = new Date();

  // Places a transaction on a given day of a past/current calendar month.
  // Future days (later this month) are clamped to today so the current
  // month always has data.
  function dateInMonth(monthsAgo: number, day: number): Date {
    const d = new Date(nowDate.getFullYear(), nowDate.getMonth() - monthsAgo, day, 12, 0, 0);
    return d > nowDate ? nowDate : d;
  }

  await prisma.transaction.createMany({
    data: txSeeds.map((t) => ({
      userId: user.userId,
      accountId: t.account.accountId,
      transactionTypeId: typeId(t.type),
      spendingCategoryId: catId(t.category),
      amount: t.amount,
      transactionDate: dateInMonth(t.monthsAgo, t.day),
    })),
  });
  console.log(`   • ${txSeeds.length} transactions`);

  // --- 5. Smart Budgets (per category) ---------------------------
  const budgetSeeds: Array<[string, string]> = [
    ["Restaurants", "600.00"],
    ["Shopping", "800.00"],
    ["Transportation", "300.00"],
    ["Groceries", "900.00"],
    ["Subscriptions", "150.00"],
    ["Entertainment", "250.00"],
  ];
  await prisma.smartBudget.createMany({
    data: budgetSeeds.map(([category, amount]) => ({
      userId: user.userId,
      spendingCategoryId: catId(category),
      recommendedAmount: amount,
    })),
  });
  console.log(`   • ${budgetSeeds.length} smart budgets`);

  // --- 6. Financial Goals (both calculation modes) ---------------
  await prisma.financialGoal.create({
    data: {
      userId: user.userId,
      calculationModeId: modeId("saving_driven"),
      goalType: "Emergency Fund",
      targetAmount: "15000.00",
      monthlySavingAmount: "1500.00",
      estimatedMonths: 10, // 15000 / 1500
      savedAmount: "4500.00", // 30% allocated
    },
  });
  await prisma.financialGoal.create({
    data: {
      userId: user.userId,
      calculationModeId: modeId("deadline_driven"),
      goalType: "New Laptop",
      targetAmount: "6000.00",
      monthlySavingAmount: "1000.00", // 6000 / 6 months
      estimatedMonths: 6,
      savedAmount: "2580.00", // 43% allocated
    },
  });
  console.log("   • 2 financial goals");

  // --- 7. Score snapshots (history for trend charts) -------------
  const scoreHistory = [62, 68, 71, 74];
  await prisma.financialScoreSnapshot.createMany({
    data: scoreHistory.map((scoreValue, i) => ({
      userId: user.userId,
      scoreValue,
      snapshotDate: new Date(now - (scoreHistory.length - 1 - i) * 30 * dayMs),
    })),
  });

  const healthHistory = ["Average", "Average", "Excellent"];
  await prisma.healthScoreSnapshot.createMany({
    data: healthHistory.map((status, i) => ({
      userId: user.userId,
      healthStatusId: healthId(status),
      snapshotDate: new Date(now - (healthHistory.length - 1 - i) * 30 * dayMs),
    })),
  });
  console.log("   • score + health snapshots");

  // --- 8. AI outputs (generic entity: recs, insights, tips) ------
  await prisma.aiOutput.createMany({
    data: [
      // Generic starter outputs. These are replaced by precise, data-driven
      // versions from the AI provider whenever recalc runs (any transaction,
      // SMS ingest or balance change).
      {
        userId: user.userId,
        aiOutputTypeId: aiTypeId("RECOMMENDATION"),
        content:
          "Automating a small monthly transfer to savings is an easy way to lift your saving rate.",
      },
      {
        userId: user.userId,
        aiOutputTypeId: aiTypeId("INSIGHT"),
        content:
          "Reviewing recurring subscriptions is a common quick win for reducing monthly outflow.",
      },
      {
        userId: user.userId,
        aiOutputTypeId: aiTypeId("SCORE_TIP"),
        content:
          "Keeping spending under budget across all categories for a full month steadily raises your score.",
      },
    ],
  });
  console.log("   • 3 AI outputs");

  console.log("✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
