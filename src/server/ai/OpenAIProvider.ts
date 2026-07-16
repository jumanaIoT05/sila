import type { AIProvider, AiContext, AiAnalysis } from "./AIProvider";
import { MockAIProvider } from "./MockAIProvider";

// OpenAI-ready structure. Not wired to the SDK by default — this is the seam.
// Set AI_PROVIDER=openai and OPENAI_API_KEY, then implement the API call in
// analyze(). Until then it falls back to MockAIProvider so nothing breaks.
export class OpenAIProvider implements AIProvider {
  private fallback = new MockAIProvider();

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      console.warn("[ai] OPENAI_API_KEY not set — OpenAIProvider will fall back to MockAIProvider.");
    }
  }

  async analyze(ctx: AiContext): Promise<AiAnalysis> {
    // TODO: implement the OpenAI chat/completions call and map to AiAnalysis.
    return this.fallback.analyze(ctx);
  }
}
