import type { ParseResult, TreeParser } from "@/types/tree";
import { isArchlensEnvelope, isTreeEnvelope } from "@/schema/archlensSchema";
import { parseNodeEntries } from "./jsonTreeParser";

/**
 * Parses the ArchLens suite exchange envelope:
 *   { "archlens": "1.0", "kind": "tree", "payload": { "nodes": [{ path, type }] } }
 *
 * This is what ArchLens Web (and other sister products) emit, so a tree
 * exported there can be dropped straight into Diff. The node shape inside
 * `payload.nodes` is identical to the bare json-tree format, so validation is
 * delegated to the shared `parseNodeEntries`.
 */
export const archlensTreeParser: TreeParser = {
  format: "archlens-tree",
  label: "ArchLens tree envelope",
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

    if (!isTreeEnvelope(parsed)) {
      const hint = isArchlensEnvelope(parsed)
        ? `Expected an ArchLens "tree" envelope but got kind "${parsed.kind}".`
        : `Expected an ArchLens tree envelope, e.g. { "archlens": "1.0", "kind": "tree", "payload": { "nodes": [{ "path": "src/app.ts", "type": "file" }] } }`;
      return { nodes: [], errors: [{ message: hint }] };
    }

    return parseNodeEntries(parsed.payload.nodes);
  },
};
