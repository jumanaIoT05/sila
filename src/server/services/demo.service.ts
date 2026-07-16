// =============================================================
// Demo service (presentation only).
// Runs a predefined scenario by replaying its bank SMS messages through the
// real ingestion pipeline (ingestSms → parser → transaction → recalc), so the
// dashboard, activity, budgets, scores, goals and AI insights all update
// exactly as they would for real incoming SMS.
// =============================================================

import { AppError } from "../http";
import { ingestSms } from "./transaction.service";
import { DEMO_SCENARIOS, findScenario } from "../demo/scenarios";

export function listScenarios() {
  return DEMO_SCENARIOS.map((s) => ({
    key: s.key,
    title: s.title,
    description: s.description,
    icon: s.icon,
    messageCount: s.messages.length,
  }));
}

export async function runScenario(
  userId: number,
  key: string
): Promise<{ scenario: string; added: number }> {
  const scenario = findScenario(key);
  if (!scenario) throw new AppError("Unknown demo scenario", 404);

  let added = 0;
  for (const message of scenario.messages) {
    await ingestSms(userId, message); // same pipeline as real SMS (recalcs each)
    added += 1;
  }

  return { scenario: scenario.title, added };
}
