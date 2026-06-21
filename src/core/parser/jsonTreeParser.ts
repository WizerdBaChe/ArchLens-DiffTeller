import type { ParseResult, RawNode, TreeParser } from "@/types/tree";

function normalizePath(p: string): string {
  return p.trim().replace(/^\/+/, "").replace(/\/+$/, "");
}

export const jsonTreeParser: TreeParser = {
  format: "json-tree",
  label: "Normalized tree JSON",
  parse(source: string): ParseResult {
    const errors: ParseResult["errors"] = [];
    const nodes: RawNode[] = [];

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

    const seen = new Set<string>();
    (root.nodes as unknown[]).forEach((entry, idx) => {
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
  },
};
