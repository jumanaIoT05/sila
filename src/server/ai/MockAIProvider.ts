import type { AIProvider, AiContext } from "./AIProvider";

// Deterministic, rule-based AI stand-in. Produces plausible, context-aware
// financial guidance without any external API. Default provider (AI_PROVIDER=mock).
export class MockAIProvider implements AIProvider {
  async generateRecommendations(ctx: AiContext): Promise<string[]> {
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

  async generateInsights(ctx: AiContext): Promise<string[]> {
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

  async generateScoreTip(ctx: AiContext): Promise<string> {
    if (ctx.savingPercentage < 20) {
      return `You saved ${Math.round(
        ctx.savingPercentage
      )}% of income. Reaching 25% would raise your financial score meaningfully.`;
    }
    if (ctx.financialScore < 80) {
      return "Keeping spending under budget across all categories for a full month will steadily raise your score.";
    }
    return "Great financial habits — maintain your saving rate to keep your score high.";
  }
}
