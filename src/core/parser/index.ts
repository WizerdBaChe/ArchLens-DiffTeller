import type { InputFormat, TreeParser } from "@/types/tree";
import { textTreeParser } from "./textTreeParser";
import { jsonTreeParser } from "./jsonTreeParser";

export const PARSERS: Record<InputFormat, TreeParser> = {
  "text-tree": textTreeParser,
  "json-tree": jsonTreeParser,
};

export const PARSER_LIST: TreeParser[] = Object.values(PARSERS);

export function getParser(format: InputFormat): TreeParser {
  return PARSERS[format];
}

/** Best-effort guess at which parser to use, so pasting either format "just works"
 *  without the user having to flip a switch first. */
export function detectFormat(source: string): InputFormat {
  const trimmed = source.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      JSON.parse(trimmed);
      return "json-tree";
    } catch {
      // fall through to text-tree
    }
  }
  return "text-tree";
}
