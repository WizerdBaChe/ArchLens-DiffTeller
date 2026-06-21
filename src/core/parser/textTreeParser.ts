import type { ParseResult, RawNode, TreeParser } from "@/types/tree";

/** Characters that can appear in a line's structural prefix, for both plain
 *  indentation and unix `tree`-command drawing glyphs. We count how many of
 *  these lead the line — that count alone gives us a consistent "depth" key
 *  whether the input used spaces or box-drawing characters. */
const PREFIX_CHAR = /[│├└─\s]/;

function splitPrefix(line: string): { indent: number; rest: string } {
  let i = 0;
  while (i < line.length && PREFIX_CHAR.test(line[i])) i++;
  return { indent: i, rest: line.slice(i) };
}

interface StackFrame {
  indent: number;
  path: string;
}

interface PendingRecord {
  path: string;
  explicitDir: boolean;
  line: number;
}

export const textTreeParser: TreeParser = {
  format: "text-tree",
  label: "Indented text tree",
  parse(source: string): ParseResult {
    const errors: ParseResult["errors"] = [];
    const seen = new Set<string>();
    const stack: StackFrame[] = [];
    const records: PendingRecord[] = [];
    // Any path that turns out to be someone's parent must be a directory,
    // even without a trailing "/" — this is how plain `tree` output (no -F
    // flag) and most pasted listings actually look.
    const hasChildren = new Set<string>();

    const lines = source.split(/\r?\n/);

    lines.forEach((rawLine, idx) => {
      if (!rawLine.trim()) return; // skip blank lines

      const { indent, rest } = splitPrefix(rawLine);
      let name = rest.trim();
      if (!name) return;

      // Strip trailing inline comments like "app.ts  # entry point"
      const commentMatch = name.match(/^(.*?)(?:\s+#.*)?$/);
      if (commentMatch) name = commentMatch[1].trim();

      const explicitDir = name.endsWith("/");
      if (explicitDir) name = name.slice(0, -1);

      if (!name) {
        errors.push({ message: `Empty node name`, line: idx + 1 });
        return;
      }
      if (name.includes("/")) {
        errors.push({
          message: `Line ${idx + 1}: "${name}" looks like a path, not a single segment — nest it under its parent instead`,
          line: idx + 1,
        });
        return;
      }

      // Pop stack until we find a strictly-shallower parent
      while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
        stack.pop();
      }

      const parent = stack.length > 0 ? stack[stack.length - 1] : null;
      const path = parent ? `${parent.path}/${name}` : name;

      if (seen.has(path)) {
        errors.push({ message: `Duplicate path "${path}"`, line: idx + 1 });
        return;
      }
      seen.add(path);
      if (parent) hasChildren.add(parent.path);
      records.push({ path, explicitDir, line: idx + 1 });

      // Push every node as a potential parent frame — whether it's a dir
      // is decided once we know if anything nested under it.
      stack.push({ indent, path });
    });

    const nodes: RawNode[] = records.map((r) => ({
      path: r.path,
      kind: r.explicitDir || hasChildren.has(r.path) ? "dir" : "file",
    }));

    return { nodes, errors };
  },
};
