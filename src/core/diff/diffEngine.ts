import type {
  DiffChange,
  DiffOptions,
  DiffResult,
  DiffSummary,
  DiffWarning,
  NormalizedNode,
  NormalizedTree,
} from "@/types/tree";
import { classifyPair } from "./classifier";

const LOW_CONFIDENCE_THRESHOLD = 0.75;

function emptySummary(): DiffSummary {
  return { added: 0, removed: 0, moved: 0, renamed: 0, unchanged: 0, modifiedMeta: 0 };
}

function tally(summary: DiffSummary, change: DiffChange): void {
  switch (change.type) {
    case "added":
      summary.added++;
      break;
    case "removed":
      summary.removed++;
      break;
    case "moved":
      summary.moved++;
      break;
    case "renamed":
      summary.renamed++;
      break;
    case "unchanged":
      summary.unchanged++;
      break;
    case "modified-meta":
      summary.modifiedMeta++;
      break;
  }
}

export function diffTrees(
  left: NormalizedTree,
  right: NormalizedTree,
  options: DiffOptions,
): DiffResult {
  const changes: DiffChange[] = [];
  const warnings: DiffWarning[] = [];
  const summary = emptySummary();

  const leftRemaining = new Map<string, NormalizedNode>(left.nodes.map((n) => [n.path, n]));
  const rightRemaining = new Map<string, NormalizedNode>(right.nodes.map((n) => [n.path, n]));

  // Pass 1 — exact path match.
  for (const [path, leftNode] of [...leftRemaining]) {
    const rightNode = rightRemaining.get(path);
    if (!rightNode) continue;

    if (leftNode.kind === rightNode.kind) {
      changes.push({
        id: `U:${path}`,
        type: "unchanged",
        kind: leftNode.kind,
        from: path,
        to: path,
        confidence: 1,
        reason: "Identical path and type on both sides",
      });
    } else {
      changes.push({
        id: `M:${path}`,
        type: "modified-meta",
        kind: rightNode.kind,
        from: path,
        to: path,
        confidence: 1,
        reason: `Type changed: ${leftNode.kind} → ${rightNode.kind}`,
      });
    }
    leftRemaining.delete(path);
    rightRemaining.delete(path);
  }

  // Pass 2 — case-only path change (same path, different case; same directory level).
  for (const [leftPath, leftNode] of [...leftRemaining]) {
    let found: NormalizedNode | undefined;
    for (const rightNode of rightRemaining.values()) {
      if (
        rightNode.kind === leftNode.kind &&
        rightNode.path.toLowerCase() === leftPath.toLowerCase()
      ) {
        found = rightNode;
        break;
      }
    }
    if (!found) continue;

    changes.push({
      id: `MM:${leftPath}->${found.path}`,
      type: "modified-meta",
      kind: leftNode.kind,
      from: leftPath,
      to: found.path,
      confidence: 0.99,
      reason: `Case-only path change ("${leftPath}" → "${found.path}")`,
    });
    leftRemaining.delete(leftPath);
    rightRemaining.delete(found.path);
  }

  // Pass 3 — heuristic rename/move matching via greedy best-score assignment.
  if (options.detectRename || options.detectMove) {
    type Candidate = { left: NormalizedNode; right: NormalizedNode; confidence: number; type: "renamed" | "moved"; reason: string };
    const candidates: Candidate[] = [];

    for (const leftNode of leftRemaining.values()) {
      for (const rightNode of rightRemaining.values()) {
        const verdict = classifyPair(leftNode, rightNode, options);
        if (!verdict) continue;
        if (verdict.type === "renamed" && !options.detectRename) continue;
        if (verdict.type === "moved" && !options.detectMove) continue;
        candidates.push({ left: leftNode, right: rightNode, ...verdict });
      }
    }

    // Best matches first; greedy assignment is an MVP-appropriate approximation
    // of optimal bipartite matching, and keeps the algorithm O(n*m log(n*m)).
    candidates.sort((a, b) => b.confidence - a.confidence);

    const usedLeft = new Set<string>();
    const usedRight = new Set<string>();

    for (const c of candidates) {
      if (usedLeft.has(c.left.path) || usedRight.has(c.right.path)) continue;

      changes.push({
        id: `${c.type === "renamed" ? "RN" : "MV"}:${c.left.path}->${c.right.path}`,
        type: c.type,
        kind: c.left.kind,
        from: c.left.path,
        to: c.right.path,
        confidence: c.confidence,
        reason: c.reason,
      });
      if (c.confidence < LOW_CONFIDENCE_THRESHOLD) {
        warnings.push({
          side: "both",
          message: `Low-confidence ${c.type} guess (${Math.round(c.confidence * 100)}%): "${c.left.path}" → "${c.right.path}" — verify before relying on it`,
        });
      }

      usedLeft.add(c.left.path);
      usedRight.add(c.right.path);
      leftRemaining.delete(c.left.path);
      rightRemaining.delete(c.right.path);
    }
  }

  // Pass 4 — whatever's left is a genuine add or remove.
  for (const node of leftRemaining.values()) {
    changes.push({
      id: `D:${node.path}`,
      type: "removed",
      kind: node.kind,
      from: node.path,
      confidence: 1,
      reason: "Only present in version A",
    });
  }
  for (const node of rightRemaining.values()) {
    changes.push({
      id: `A:${node.path}`,
      type: "added",
      kind: node.kind,
      to: node.path,
      confidence: 1,
      reason: "Only present in version B",
    });
  }

  for (const change of changes) tally(summary, change);

  return { summary, changes, warnings };
}
