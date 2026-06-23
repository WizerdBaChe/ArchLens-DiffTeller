import type { ParseResult, RawNode, TreeParser } from "@/types/tree";

function normalizePath(p: string): string {
  return p.trim().replace(/^\/+/, "").replace(/\/+$/, "");
}

/**
 * Validate a raw `[{ path, type, contentHash? }]` array into RawNode[].
 * Shared by the bare `{ nodes: [...] }` format and the ArchLens envelope
 * format (whose payload carries the same node shape) so the per-row
 * validation rules live in exactly one place.
 */
export function parseNodeEntries(entries: unknown[]): ParseResult {
  const errors: ParseResult["errors"] = [];
  const nodes: RawNode[] = [];
  const seen = new Set<string>();

  entries.forEach((entry, idx) => {
    if (!entry || typeof entry !== "object") {
      errors.push({ message: `nodes[${idx}] is not an object` });
      return;
    }
    const { path, type, contentHash } = entry as Record<string, unknown>;

    if (typeof path !== "string" || !path.trim()) {
      errors.push({ message: `nodes[${idx}] is missing a non-empty "path"` });
      return;
    }
    if (type !== "file" && type !== "dir") {
      errors.push({
        message: `nodes[${idx}] ("${path}") has invalid "type": expected "file" or "dir"`,
      });
      return;
    }
    const cleanPath = normalizePath(path);
    if (!cleanPath) {
      errors.push({ message: `nodes[${idx}] has an empty path after normalization` });
      return;
    }
    if (seen.has(cleanPath)) {
      errors.push({ message: `Duplicate path "${cleanPath}"` });
      return;
    }
    seen.add(cleanPath);

    nodes.push({
      path: cleanPath,
      kind: type,
      contentHash: typeof contentHash === "string" ? contentHash : undefined,
    });
  });

  return { nodes, errors };
}

export const jsonTreeParser: TreeParser = {
  format: "json-tree",
  label: "Normalized tree JSON",
  parse(source: string): ParseResult {
    let parsed: unknown;
    try {
      parsed = JSON.parse(source);
    } catch (e) {
      return {
        nodes: [],
        errors: [{ message: `Invalid JSON: ${(e as Error).message}` }],
      };
    }

    const root = parsed as Record<string, unknown> | null;
    if (!root || typeof root !== "object" || !Array.isArray(root.nodes)) {
      return {
        nodes: [],
        errors: [{ message: `Expected an object with a "nodes" array, e.g. { "nodes": [{ "path": "src/app.ts", "type": "file" }] }` }],
      };
    }

    return parseNodeEntries(root.nodes as unknown[]);
  },
};
