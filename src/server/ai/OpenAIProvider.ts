import type { AIProvider, AiContext } from "./AIProvider";

// OpenAI-ready structure (FR-7/8/11). Not wired to the SDK by default —
// this is the seam. Set AI_PROVIDER=openai and OPENAI_API_KEY, then
// implement the fetch calls below. Kept dependency-free so the project
// runs fully on the mock provider out of the box.
export class OpenAIProvider implements AIProvider {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY ?? "";
    if (!this.apiKey) {
      throw new Error("AI_PROVIDER=openai requires OPENAI_API_KEY to be set.");
    }
  }

  // Example shape for a real implementation:
  // private async complete(prompt: string): Promise<string> {
  //   const res = await fetch("https://api.openai.com/v1/chat/completions", {
  //     method: "POST",
  //     headers: { Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/json" },
  //     body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "user", content: prompt }] }),
  //   });
  //   const json = await res.json();
  //   return json.choices?.[0]?.message?.content ?? "";
  // }

  async generateRecommendations(_ctx: AiContext): Promise<string[]> {
    throw new Error("OpenAIProvider.generateRecommendations not implemented — wire up the API here.");
  }

  async generateInsights(_ctx: AiContext): Promise<string[]> {
    throw new Error("OpenAIProvider.generateInsights not implemented — wire up the API here.");
  }

  async generateScoreTip(_ctx: AiContext): Promise<string> {
    throw new Error("OpenAIProvider.generateScoreTip not implemented — wire up the API here.");
  }
}
