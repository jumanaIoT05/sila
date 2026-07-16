// =============================================================
// Recalculation orchestrator (FR-13).
// The single entry point invoked after EVERY data mutation
// (new transaction, ingested SMS, manual balance change). Keeps all
// derived data (scores, health, AI outputs) fresh in real time.
//
// Centralizing this means no endpoint duplicates recalculation logic.
// Dashboard aggregates and budget status are computed on-read, so they
// need no persistence step here.
// =============================================================

import { computeAndSnapshotScores } from "./score.service";
import { regenerateAiOutputs } from "./ai.service";

export async function recalculate(userId: number): Promise<void> {
  // 1. Re-score financial + health (snapshots).
  await computeAndSnapshotScores(userId);
  // 2. Regenerate recommendations / insights / score tips.
  await regenerateAiOutputs(userId);
}
