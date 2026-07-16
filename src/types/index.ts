// =============================================================
// Shared DTO types (frontend <-> backend contract).
// Money is exchanged as `number` (SAR) in JSON; the DB stores Decimal(14,2).
// =============================================================

export interface AuthTokenPayload {
  userId: number;
  phoneNumber: string;
}

export interface AccountDTO {
  accountId: number;
  bankId: number;
  bankName: string;
  lastFourDigits: string;
  currentBalance: number;
  isManuallyAdded: boolean;
}

export interface TransactionDTO {
  transactionId: number;
  accountId: number;
  accountLabel: string; // e.g. "Al Rajhi ••4821"
  bankName: string;
  lastFourDigits: string;
  transactionType: string;
  category: string;
  amount: number;
  direction: "in" | "out";
  transactionDate: string; // ISO
}

export interface ProfileDTO {
  fullName: string | null;
  phoneNumber: string;
}

export interface CategoryTotal {
  category: string;
  total: number;
}

export interface MonthlyComparison {
  currentMonthSpending: number;
  previousMonthSpending: number;
  changePercent: number; // + = spending increased
  comparisonLabel: string; // e.g. "vs last month" / "vs previous 7 days"
  previousLabel: string; // e.g. "Last month" / "Prev. 7 days"
  hasComparison: boolean; // false for the "all time" period
}

export interface DashboardDTO {
  totalBalance: number;
  accounts: AccountDTO[];
  topCategories: CategoryTotal[];
  monthlyComparison: MonthlyComparison;
  savingPercentage: number; // computed dynamically (not persisted)
  income: number;
  spending: number;
  summary: string;
  summaryPoints: string[]; // summary as discrete bullet lines (Home)
  period: string; // active period: all | days | monthly | yearly
  periodLabel: string; // e.g. "this month" / "this year" / "in the last 7 days"
  aiHighlights: string[]; // live, period-aware AI insight lines (not persisted)
  recentTransactions: TransactionDTO[]; // latest 3 for the Home preview
}

export interface BudgetDTO {
  budgetId: number;
  category: string;
  spendingCategoryId: number;
  recommendedAmount: number;
  actualSpending: number; // current month
  remaining: number;
  overBudget: boolean;
}

export interface GoalDTO {
  goalId: number;
  goalType: string;
  calculationMode: string;
  targetAmount: number;
  monthlySavingAmount: number;
  estimatedMonths: number;
  savedAmount: number; // allocated toward the goal (not real money movement)
  progressPercent: number; // savedAmount / targetAmount
}

export interface GoalsOverviewDTO {
  goals: GoalDTO[];
  totalAllocated: number;
  totalBalance: number;
  // True when allocations exceed available balance — powers the smart warning.
  overAllocated: boolean;
}

export interface FinancialScoreDTO {
  scoreValue: number; // 0-100
  snapshotDate: string;
}

export interface HealthScoreDTO {
  status: string; // Excellent | Average | Needs Improvement
  snapshotDate: string;
}

export interface AiOutputDTO {
  aiOutputId: number;
  type: string; // RECOMMENDATION | INSIGHT | SCORE_TIP
  content: string;
  generatedAt: string;
}

export interface NotificationDTO {
  id: string;
  type: string; // budget | income | subscription | goal (extensible)
  icon: string;
  title: string;
  message: string;
}

// Full on-demand AI analysis (all sections) returned by POST /api/ai.
export interface AiAnalysisDTO {
  financialHealth: string;
  insights: string[];
  recommendations: string[];
  goalAdvice: string[];
  budgetSuggestions: string[];
}
