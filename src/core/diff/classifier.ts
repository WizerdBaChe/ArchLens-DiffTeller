import type { DiffOptions, NormalizedNode } from "@/types/tree";
import { nameSimilarity } from "./similarity";

export interface PairVerdict {
  type: "renamed" | "moved";
  confidence: number;
  reason: string;
}

function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

/**
 * Decides whether a left node (gone from A) and a right node (new in B) are
 * plausibly "the same thing that moved/got renamed", or just an unrelated
 * add+remove pair.
 *
 * Returns null when there isn't enough evidence to call it a match — callers
 * should then let both sides fall through to plain added/removed.
 */
export function classifyPair(
  left: NormalizedNode,
  right: NormalizedNode,
  options: DiffOptions,
): PairVerdict | null {
  if (left.kind !== right.kind) return null;

  const contentMatch = Boolean(
    left.contentHash && right.contentHash && left.contentHash === right.contentHash,
  );
  const sim = nameSimilarity(left.name, right.name);
  const sameDir = left.parentPath === right.parentPath;

  // Evidence that these are "the same node" rather than coincidence.
  const confidence = contentMatch ? Math.max(0.95, sim) : sim;

  if (sameDir) {
    if (!contentMatch && confidence < options.renameThreshold) return null;
    return {
      type: "renamed",
      confidence: round2(confidence),
      reason: contentMatch
        ? `Identical content hash; only the name changed (${left.name} → ${right.name})`
        : `${pct(sim)} filename similarity in the same directory (${left.name} → ${right.name})`,
    };
  }

  // Different directory.
  if (!contentMatch && confidence < options.moveThreshold) return null;
  return {
    type: "moved",
    confidence: round2(confidence),
    reason: contentMatch
      ? `Identical content hash; relocated from "${left.parentPath ?? "/"}" to "${right.parentPath ?? "/"}"`
      : sim >= 0.97
        ? `Same filename, relocated from "${left.parentPath ?? "/"}" to "${right.parentPath ?? "/"}"`
        : `${pct(sim)} filename similarity, relocated from "${left.parentPath ?? "/"}" to "${right.parentPath ?? "/"}"`,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
