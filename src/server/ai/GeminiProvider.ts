import { GoogleGenAI } from "@google/genai";
import type { AIProvider, AiContext, AiAnalysis } from "./AIProvider";
import { MockAIProvider } from "./MockAIProvider";

// =============================================================
// Gemini provider (Google Gen AI SDK, model = gemini-2.5-flash).
// ONE request returns every section as structured JSON, mapped into AiAnalysis.
//
// Guarantees:
//  • Gemini NEVER computes financial values — it only analyzes the already-
//    computed AiContext and returns natural-language text.
//  • Resilient: a 9s timeout, and on timeout/failure/bad-JSON it falls back to
//    MockAIProvider. analyze() never throws, so business logic is never affected.
//  • Strict prompt (no invented/estimated numbers, no investment advice, no
//    loans/products, analyze only the supplied context, state when data is
//    insufficient, stay concise) with per-section size caps.
// =============================================================

const REQUEST_TIMEOUT_MS = 9000;

const CAP = { insights: 3, recommendations: 3, goalAdvice: 2, budgetSuggestions: 2 } as const;

const SYSTEM_RULES = [
  'You are the financial assistant for "Sila", a personal-finance app.',
  "You analyze ONLY the supplied pre-computed figures (context). Strict rules:",
  "- Never invent numbers.",
  "- Never estimate missing financial values.",
  "- Never recompute the figures; treat them as the single source of truth.",
  "- Never provide investment advice.",
  "- Never recommend loans, credit, or financial products.",
  "- If the data is insufficient for a section, explicitly say so, briefly.",
  "- All amounts are Saudi Riyal (SAR). Be concise, specific, encouraging, non-judgmental.",
].join("\n");

export class GeminiProvider implements AIProvider {
  private client: GoogleGenAI | null;
  private model: string;
  private fallback = new MockAIProvider();

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY ?? "";
    this.model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    this.client = apiKey ? new GoogleGenAI({ apiKey }) : null;
    if (!this.client) {
      console.warn("[ai] GEMINI_API_KEY not set — GeminiProvider will fall back to MockAIProvider.");
    }
  }

  // Always resolves to a complete analysis. Any problem → Mock (seamless).
  async analyze(ctx: AiContext): Promise<AiAnalysis> {
    if (!this.client) return this.fallback.analyze(ctx);
    try {
      const json = await this.withTimeout(this.callGemini(ctx), REQUEST_TIMEOUT_MS);
      return this.normalize(json);
    } catch (e) {
      console.error("[ai] Gemini analysis failed/timed out — falling back to mock:", e);
      return this.fallback.analyze(ctx);
    }
  }

  private facts(ctx: AiContext): string {
    return JSON.stringify({
      incomeSAR: ctx.income,
      spendingSAR: ctx.spending,
      savingPercentage: ctx.savingPercentage,
      topCategories: ctx.topCategories,
      monthlyChangePercent: ctx.monthlyChangePercent,
      financialScore: ctx.financialScore,
      overBudgetCategories: ctx.overBudgetCategories,
    });
  }

  private async callGemini(ctx: AiContext): Promise<unknown> {
    const prompt =
      `${SYSTEM_RULES}\n\n` +
      `Pre-computed figures: ${this.facts(ctx)}\n\n` +
      `Return ONLY valid JSON with EXACTLY these fields and caps:\n` +
      `{\n` +
      `  "financialHealth": string,      // 1 short explanation of the financial-health/score\n` +
      `  "insights": string[],           // max ${CAP.insights} short observations\n` +
      `  "recommendations": string[],    // max ${CAP.recommendations} short, actionable tips\n` +
      `  "goalAdvice": string[],         // max ${CAP.goalAdvice} saving suggestions (or state if data is insufficient)\n` +
      `  "budgetSuggestions": string[]   // max ${CAP.budgetSuggestions} budget suggestions from the categories provided\n` +
      `}`;

    const res = await this.client!.models.generateContent({
      model: this.model,
      contents: prompt,
      config: { responseMimeType: "application/json", temperature: 0.6 },
    });
    const raw = (res.text ?? "").trim().replace(/^```(?:json)?\s*|\s*```$/g, "");
    return JSON.parse(raw);
  }

  // Validates + caps the parsed JSON. Throws if unusable (→ triggers fallback).
  private normalize(json: unknown): AiAnalysis {
    const o = (json ?? {}) as Record<string, unknown>;
    const arr = (v: unknown, cap: number): string[] =>
      (Array.isArray(v) ? v : [])
        .filter((s): s is string => typeof s === "string" && s.trim().length > 0)
        .slice(0, cap);

    const insights = arr(o.insights, CAP.insights);
    const recommendations = arr(o.recommendations, CAP.recommendations);
    const financialHealth = typeof o.financialHealth === "string" ? o.financialHealth.trim() : "";

    if (insights.length === 0 && recommendations.length === 0 && !financialHealth) {
      throw new Error("Gemini returned no usable content");
    }

    return {
      financialHealth,
      insights,
      recommendations,
      goalAdvice: arr(o.goalAdvice, CAP.goalAdvice),
      budgetSuggestions: arr(o.budgetSuggestions, CAP.budgetSuggestions),
    };
  }

  private withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
      p,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`Gemini request timed out after ${ms}ms`)), ms)
      ),
    ]);
  }
}
