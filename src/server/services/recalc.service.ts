// =============================================================
// Recalculation orchestrator (FR-13).
// The single entry point invoked after EVERY data mutation
// (new transaction, ingested SMS, manual balance change, budget edit…).
// Keeps all FINANCIAL data fresh in real time.
//
// AI is deliberately NOT run here. Financial calculations (scores, health,
// budgets, analytics) are the app's responsibility and must stay instant and
// reliable. AI analysis (insights/recommendations/tips) is generated ONLY on
// explicit user request (POST /api/ai) so it can never slow down or break a
// transaction, and external-provider calls stay bounded.
// =============================================================

import { computeAndSnapshotScores } from "./score.service";

export async function recalculate(userId: number): Promise<void> {
  // Re-score financial + health (snapshots). Dashboard aggregates and budget
  // status are computed on-read, so they need no persistence step here.
  await computeAndSnapshotScores(userId);
}
