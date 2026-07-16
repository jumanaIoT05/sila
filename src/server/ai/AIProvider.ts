// =============================================================
// AI layer contract (FR-7, FR-8, FR-11).
// All AI features go through this interface so the concrete provider
// (mock now, OpenAI later) is swappable via one env var. Every result
// is persisted through the generic ai_output entity by ai.service.ts.
// =============================================================

// Financial context handed to the AI so it can produce grounded output.
export interface AiContext {
  income: number;
  spending: number;
  savingPercentage: number;
  topCategories: Array<{ category: string; total: number }>;
  monthlyChangePercent: number; // spending change vs previous month
  financialScore: number; // 0-100
  overBudgetCategories: string[];
}

export interface AIProvider {
  generateRecommendations(ctx: AiContext): Promise<string[]>;
  generateInsights(ctx: AiContext): Promise<string[]>;
  generateScoreTip(ctx: AiContext): Promise<string>;
}
