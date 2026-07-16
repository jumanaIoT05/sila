import type { AIProvider } from "./AIProvider";
import { MockAIProvider } from "./MockAIProvider";
import { OpenAIProvider } from "./OpenAIProvider";

// Factory: picks the AI provider from env. Defaults to the mock provider
// so the app is fully functional with no external keys.
let cached: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (cached) return cached;
  const choice = (process.env.AI_PROVIDER ?? "mock").toLowerCase();
  cached = choice === "openai" ? new OpenAIProvider() : new MockAIProvider();
  return cached;
}

export type { AIProvider, AiContext } from "./AIProvider";
