// =============================================================
// AI layer contract (FR-7, FR-8, FR-11).
// All AI features go through this interface so the concrete provider
// (mock / gemini / openai) is swappable via one env var. Every result is
// persisted through the generic ai_output entity by ai.service.ts.
//
// IMPORTANT: a provider must NEVER compute financial values. It receives the
// already-computed AiContext (produced by the app's analysis/score/budget
// services — the single source of truth) and returns ONLY natural-language
// insights, recommendations and tips.
// =============================================================

// Pre-computed financial context handed to the AI. These numbers are produced
// by the application; the provider only analyzes and explains them.
export interface AiContext {
  income: number;
  spending: number;
  savingPercentage: number;
  topCategories: Array<{ category: string; total: number }>;
  monthlyChangePercent: number; // spending change vs previous month
  financialScore: number; // 0-100
  overBudgetCategories: string[];
}

// The full natural-language analysis a provider returns for one request.
export interface AiAnalysis {
  financialHealth: string; // 1 explanation of the health/score
  insights: string[]; // ≤3 observations
  recommendations: string[]; // ≤3 actionable tips
  goalAdvice: string[]; // ≤2 saving-toward-goals suggestions
  budgetSuggestions: string[]; // ≤2 budget suggestions
}

export interface AIProvider {
  // A single call produces every section. Providers must be resilient — they
  // never throw and never compute financial values.
  analyze(ctx: AiContext): Promise<AiAnalysis>;
}
