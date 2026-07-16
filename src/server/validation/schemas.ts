import { z } from "zod";
import { GOAL_CALCULATION_MODES } from "@/config/constants";

// Request validation (Zod) — one schema per mutating endpoint.

export const phoneSchema = z.object({
  phoneNumber: z
    .string()
    .min(9, "Phone number is too short")
    .max(20, "Phone number is too long"),
});

export const verifyOtpSchema = phoneSchema.extend({
  code: z.string().min(4, "OTP code is required"),
});

export const manualAccountSchema = z.object({
  bankId: z.number().int().positive(),
  lastFourDigits: z.string().regex(/^\d{4}$/, "Last four digits must be exactly 4 digits"),
  currentBalance: z.number().nonnegative(),
});

export const confirmAccountsSchema = z.object({
  accounts: z
    .array(
      z.object({
        bankId: z.number().int().positive(),
        lastFourDigits: z.string().regex(/^\d{4}$/),
        currentBalance: z.number().nonnegative(),
        isManuallyAdded: z.boolean().optional(),
      })
    )
    .min(1, "At least one account is required"),
});

export const updateBalanceSchema = z.object({
  currentBalance: z.number().nonnegative(),
});

export const createTransactionSchema = z.object({
  accountId: z.number().int().positive(),
  transactionTypeId: z.number().int().positive(),
  spendingCategoryId: z.number().int().positive(),
  amount: z.number().positive(),
  transactionDate: z.string().datetime().optional(),
});

export const ingestSmsSchema = z.object({
  message: z.string().min(5, "SMS message is required"),
});

export const createBudgetSchema = z.object({
  spendingCategoryId: z.number().int().positive(),
  recommendedAmount: z.number().positive(),
});

export const updateBudgetSchema = z.object({
  recommendedAmount: z.number().positive(),
});

export const allocateGoalSchema = z.object({
  amount: z.number(), // may be negative to de-allocate
});

export const createGoalSchema = z
  .object({
    goalType: z.string().min(1, "Goal type is required").max(255),
    targetAmount: z.number().positive(),
    calculationMode: z.enum(GOAL_CALCULATION_MODES),
    // saving_driven -> provide monthlySavingAmount
    monthlySavingAmount: z.number().positive().optional(),
    // deadline_driven -> provide deadlineMonths
    deadlineMonths: z.number().int().positive().optional(),
  })
  .refine(
    (d) => (d.calculationMode === "saving_driven" ? d.monthlySavingAmount != null : true),
    { message: "monthlySavingAmount is required for saving_driven goals", path: ["monthlySavingAmount"] }
  )
  .refine(
    (d) => (d.calculationMode === "deadline_driven" ? d.deadlineMonths != null : true),
    { message: "deadlineMonths is required for deadline_driven goals", path: ["deadlineMonths"] }
  );
