import type { AIProvider } from "./AIProvider";
import { MockAIProvider } from "./MockAIProvider";
import { OpenAIProvider } from "./OpenAIProvider";
import { GeminiProvider } from "./GeminiProvider";

// Factory: picks the AI provider from env. Defaults to the mock provider so
// the app is fully functional with no external keys. GeminiProvider itself
// falls back to mock on any failure, so business logic is never at risk.
let cached: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (cached) return cached;
  const choice = (process.env.AI_PROVIDER ?? "mock").toLowerCase();
  cached =
    choice === "gemini"
      ? new GeminiProvider()
      : choice === "openai"
        ? new OpenAIProvider()
        : new MockAIProvider();
  return cached;
}

export type { AIProvider, AiContext, AiAnalysis } from "./AIProvider";
