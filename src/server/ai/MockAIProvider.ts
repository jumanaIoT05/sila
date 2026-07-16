import type { AIProvider, AiContext, AiAnalysis } from "./AIProvider";

// Deterministic, rule-based AI stand-in. Produces plausible, context-aware
// financial analysis without any external service. Default provider, and the
// graceful fallback for GeminiProvider.
export class MockAIProvider implements AIProvider {
  async analyze(ctx: AiContext): Promise<AiAnalysis> {
    return {
      financialHealth: this.financialHealth(ctx),
      insights: this.insights(ctx).slice(0, 3),
      recommendations: this.recommendations(ctx).slice(0, 3),
      goalAdvice: this.goalAdvice(ctx).slice(0, 2),
      budgetSuggestions: this.budgetSuggestions(ctx).slice(0, 2),
    };
  }

  private recommendations(ctx: AiContext): string[] {
    const recs: string[] = [];
    if (ctx.monthlyChangePercent > 10 && ctx.topCategories[0]) {
      const top = ctx.topCategories[0];
      recs.push(
        `Your ${top.category} spending rose ${Math.round(
          ctx.monthlyChangePercent
        )}% vs last month. Trimming it could save ~${Math.round(top.total * 0.15)} SAR.`
      );
    }
    for (const cat of ctx.overBudgetCategories) {
      recs.push(`You're likely to exceed your ${cat} budget this month — ease off to stay on track.`);
    }
    if (ctx.savingPercentage < 15) {
      recs.push(
        `Your saving rate is ${Math.round(
          ctx.savingPercentage
        )}%. Automating a small monthly transfer could lift it above 20%.`
      );
    }
    if (recs.length === 0) {
      recs.push("Your spending looks balanced — keep it up and consider adding to a goal.");
    }
    return recs;
  }

  private insights(ctx: AiContext): string[] {
    const insights: string[] = [];
    if (ctx.topCategories[0]) {
      insights.push(
        `${ctx.topCategories[0].category} is your largest spending category at ${Math.round(
          ctx.topCategories[0].total
        )} SAR.`
      );
    }
    if (ctx.spending > 0) {
      insights.push(
        `You spent ${Math.round(ctx.spending)} SAR against ${Math.round(
          ctx.income
        )} SAR of income this period.`
      );
    }
    insights.push("Reviewing recurring subscriptions is a common quick win for reducing monthly outflow.");
    return insights;
  }

  private financialHealth(ctx: AiContext): string {
    if (ctx.savingPercentage < 20) {
      return `You saved ${Math.round(
        ctx.savingPercentage
      )}% of income. Reaching 25% would meaningfully strengthen your financial health.`;
    }
    if (ctx.financialScore < 80) {
      return "Keeping spending under budget across all categories for a full month will steadily raise your score.";
    }
    return "Great financial habits — maintaining your saving rate keeps your financial health strong.";
  }

  private goalAdvice(ctx: AiContext): string[] {
    const advice: string[] = [];
    if (ctx.savingPercentage >= 20) {
      advice.push(
        `At a ${Math.round(ctx.savingPercentage)}% saving rate you can allocate steadily toward your goals each month.`
      );
    } else {
      advice.push(
        "Freeing up a little more each month would let you allocate faster toward your goals."
      );
    }
    if (ctx.topCategories[0]) {
      advice.push(
        `Redirecting part of your ${ctx.topCategories[0].category} spend could accelerate a goal.`
      );
    }
    return advice;
  }

  private budgetSuggestions(ctx: AiContext): string[] {
    const out: string[] = [];
    for (const cat of ctx.overBudgetCategories.slice(0, 2)) {
      out.push(`Consider a tighter monthly budget for ${cat} to curb overspending.`);
    }
    if (out.length === 0 && ctx.topCategories[0]) {
      out.push(`Setting a budget for ${ctx.topCategories[0].category} would help you stay on track.`);
    }
    if (out.length === 0) {
      out.push("Your budgets look healthy — no changes needed right now.");
    }
    return out;
  }
}
