import type { InputFormat, TreeParser } from "@/types/tree";
import { isTreeEnvelope } from "@/schema/archlensSchema";
import { textTreeParser } from "./textTreeParser";
import { jsonTreeParser } from "./jsonTreeParser";
import { archlensTreeParser } from "./archlensTreeParser";

export const PARSERS: Record<InputFormat, TreeParser> = {
  "text-tree": textTreeParser,
  "json-tree": jsonTreeParser,
  "archlens-tree": archlensTreeParser,
};

export const PARSER_LIST: TreeParser[] = Object.values(PARSERS);

export function getParser(format: InputFormat): TreeParser {
  return PARSERS[format];
}

/** Best-effort guess at which parser to use, so pasting any supported format
 *  "just works" without the user having to flip a switch first. An ArchLens
 *  envelope (from Web etc.) is recognised before the bare json-tree so the
 *  exported file imports directly. */
export function detectFormat(source: string): InputFormat {
  const trimmed = source.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      return isTreeEnvelope(parsed) ? "archlens-tree" : "json-tree";
    } catch {
      // fall through to text-tree
    }
  }
  return "text-tree";
}
