// =============================================================
// Sila — shared domain constants.
// Single source of truth for lookup-table values, used by both
// the seed script and the app (categorization, dropdowns, etc.).
// =============================================================

export const BANKS = ["Al Rajhi Bank", "SNB", "Alinma Bank", "Riyad Bank"] as const;

// Transaction TYPE (what kind of movement) — distinct from category.
export const TRANSACTION_TYPES = [
  "Salary",
  "Transfer",
  "Purchase",
  "Bill Payment",
  "Cash Withdrawal",
] as const;

// Spending CATEGORY (what the money was for) — set alongside a type.
// When the parser can't confidently classify a transaction (incl. cash
// withdrawals), it falls back to "Other", which the user can edit anytime.
// "Income" is used for salary/deposits.
export const SPENDING_CATEGORIES = [
  "Restaurants",
  "Shopping",
  "Transportation",
  "Bills",
  "Groceries",
  "Subscriptions",
  "Transfer",
  "Entertainment",
  "Health",
  "Income",
  "Other",
] as const;

// Categories offered in the manual category picker (any transaction).
export const CATEGORIZABLE_CATEGORIES = [
  "Restaurants",
  "Shopping",
  "Bills",
  "Transportation",
  "Groceries",
  "Subscriptions",
  "Transfer",
  "Other",
] as const;

// Fallback category when classification is uncertain.
export const FALLBACK_CATEGORY = "Other" as const;

// "Transfer" is NEUTRAL: money moving between the user's own accounts. Neutral
// transactions are excluded from every financial aggregation (income, spending,
// saving, score, budgets, analytics, charts, AI) — see analysis.service.
export const NEUTRAL_CATEGORY = "Transfer" as const;

// Categories a user can set a budget for (a neutral Transfer budget is
// meaningless, so it's excluded here).
export const BUDGETABLE_CATEGORIES = [
  "Restaurants",
  "Shopping",
  "Bills",
  "Transportation",
  "Groceries",
  "Subscriptions",
  "Other",
] as const;

// Generic AI output discriminator (FR-7, FR-8, FR-11 all persist here).
export const AI_OUTPUT_TYPES = ["RECOMMENDATION", "INSIGHT", "SCORE_TIP"] as const;

// Financial Health bands (FR-9).
export const HEALTH_STATUSES = ["Excellent", "Average", "Needs Improvement"] as const;

// Goal calculation modes (FR-12).
export const GOAL_CALCULATION_MODES = ["saving_driven", "deadline_driven"] as const;

export type BankName = (typeof BANKS)[number];
export type TransactionTypeName = (typeof TRANSACTION_TYPES)[number];
export type SpendingCategoryName = (typeof SPENDING_CATEGORIES)[number];
export type AiOutputTypeName = (typeof AI_OUTPUT_TYPES)[number];
export type HealthStatusName = (typeof HEALTH_STATUSES)[number];
export type GoalCalculationModeName = (typeof GOAL_CALCULATION_MODES)[number];
