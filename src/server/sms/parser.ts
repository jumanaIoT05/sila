// =============================================================
// Mock SMS parser (FR-3, FR-5).
// Turns a raw bank SMS string into a structured transaction draft.
// This is the "SMS analysis instead of bank integration" core:
// rule-based extraction of amount, type, category and last-4 digits.
//
// In production this seam could be replaced by an ML/LLM extractor,
// but the output contract stays identical.
// =============================================================

import {
  TRANSACTION_TYPES,
  SPENDING_CATEGORIES,
  type TransactionTypeName,
  type SpendingCategoryName,
} from "@/config/constants";

export interface ParsedSms {
  amount: number;
  transactionType: TransactionTypeName;
  category: SpendingCategoryName;
  lastFourDigits: string | null;
  transactionDate: Date;
  raw: string;
}

// Keyword → transaction type. Order matters (first match wins).
// Cash withdrawal is detected BEFORE purchase so ATM/withdrawal SMS are
// classified as a withdrawal (and left uncategorized), not a purchase.
const TYPE_RULES: Array<[RegExp, TransactionTypeName]> = [
  [/salary|payroll|راتب|deposit|deposited|credited/i, "Salary"],
  [/atm|cash withdrawal|withdrawal|withdrawn|withdraw|سحب نقدي|سحب|صراف/i, "Cash Withdrawal"],
  [/transfer|حوالة|sent to|received from/i, "Transfer"],
  [/bill|invoice|فاتورة|stc|electricity|water/i, "Bill Payment"],
  [/purchase|payment|pos|شراء|point of sale|bought/i, "Purchase"],
];

// Keyword → spending category.
// Subscriptions are matched BEFORE Bills so streaming/services land in
// their own category rather than generic Bills.
const CATEGORY_RULES: Array<[RegExp, SpendingCategoryName]> = [
  [/salary|payroll|راتب|deposit/i, "Income"],
  [/netflix|spotify|shahid|osn|apple music|prime video|amazon prime|youtube premium|disney|subscription|اشتراك/i, "Subscriptions"],
  [/restaurant|cafe|coffee|mcdonald|starbucks|مطعم|food/i, "Restaurants"],
  [/grocery|supermarket|panda|tamimi|carrefour|بقالة|hyper/i, "Groceries"],
  [/uber|careem|fuel|petrol|gas station|transport|مواصلات|parking/i, "Transportation"],
  [/stc|mobily|zain|electricity|water|internet|bill|فاتورة/i, "Bills"],
  [/cinema|game|entertainment|ترفيه|movie|concert/i, "Entertainment"],
  [/pharmacy|hospital|clinic|nahdi|صيدلية|dental|medical/i, "Health"],
  [/amazon|noon|mall|store|shopping|zara|ikea|jarir|extra|lulu|تسوق/i, "Shopping"],
];

const DEFAULT_TYPE: TransactionTypeName = "Purchase";
const DEFAULT_CATEGORY: SpendingCategoryName = "Other";

function matchType(text: string): TransactionTypeName {
  for (const [re, type] of TYPE_RULES) if (re.test(text)) return type;
  return DEFAULT_TYPE;
}

function matchCategory(text: string): SpendingCategoryName {
  for (const [re, cat] of CATEGORY_RULES) if (re.test(text)) return cat;
  return DEFAULT_CATEGORY;
}

// Extract the first monetary amount. Handles "45 SAR", "SAR 45.50", "45.00 ر.س".
function extractAmount(text: string): number | null {
  const m = text.match(/(?:sar|ر\.?س\.?)?\s*([\d,]+(?:\.\d{1,2})?)\s*(?:sar|ر\.?س\.?)?/i);
  if (!m) return null;
  const amount = Number(m[1].replace(/,/g, ""));
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

// Extract last 4 digits from patterns like "account ****4821" or "card ending 4821".
function extractLastFour(text: string): string | null {
  const m = text.match(/(?:\*{2,}|ending|acct|account|card|x{2,})\D*(\d{4})\b/i);
  return m ? m[1] : null;
}

export function parseSms(raw: string, receivedAt: Date = new Date()): ParsedSms {
  const text = raw.trim();
  const amount = extractAmount(text);
  if (amount === null) {
    throw new Error("Could not extract an amount from the SMS message.");
  }
  const transactionType = matchType(text);

  // Classification defaults:
  //  • Transfer → "Transfer" (neutral). We can't confidently tell internal vs
  //    external from a single SMS, so per the rules we default to the neutral
  //    Transfer category; the user can re-categorize it to an expense if needed.
  //  • Cash withdrawal (and anything the rules can't classify) → "Other".
  const category: SpendingCategoryName =
    transactionType === "Transfer"
      ? "Transfer"
      : transactionType === "Cash Withdrawal"
        ? "Other"
        : matchCategory(text);

  return {
    amount,
    transactionType,
    category,
    lastFourDigits: extractLastFour(text),
    transactionDate: receivedAt,
    raw: text,
  };
}

export const KNOWN_TYPES = TRANSACTION_TYPES;
export const KNOWN_CATEGORIES = SPENDING_CATEGORIES;
