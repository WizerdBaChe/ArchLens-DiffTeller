import { describe, expect, it } from "vitest";
import { textTreeParser } from "@/core/parser/textTreeParser";
import { jsonTreeParser } from "@/core/parser/jsonTreeParser";

describe("textTreeParser", () => {
  it("parses nested indentation into full paths", () => {
    const { nodes, errors } = textTreeParser.parse(`src/\n  app.ts\n  lib/\n    api.ts`);
    expect(errors).toHaveLength(0);
    expect(nodes).toEqual([
      { path: "src", kind: "dir" },
      { path: "src/app.ts", kind: "file" },
      { path: "src/lib", kind: "dir" },
      { path: "src/lib/api.ts", kind: "file" },
    ]);
  });

  it("parses unix `tree`-command box-drawing output", () => {
    const input = ["src", "├── app.ts", "└── lib", "    └── api.ts"].join("\n");
    const { nodes, errors } = textTreeParser.parse(input);
    expect(errors).toHaveLength(0);
    expect(nodes.map((n) => n.path)).toEqual(["src", "src/app.ts", "src/lib", "src/lib/api.ts"]);
  });

  it("flags duplicate paths at the same level", () => {
    const { errors } = textTreeParser.parse(`src/\n  app.ts\n  app.ts`);
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe("jsonTreeParser", () => {
  it("parses valid node arrays", () => {
    const { nodes, errors } = jsonTreeParser.parse(
      JSON.stringify({ nodes: [{ path: "src/app.ts", type: "file" }] }),
    );
    expect(errors).toHaveLength(0);
    expect(nodes).toEqual([{ path: "src/app.ts", kind: "file", contentHash: undefined }]);
  });

  it("reports the specific row and field that failed", () => {
    const { errors } = jsonTreeParser.parse(
      JSON.stringify({ nodes: [{ path: "src/app.ts", type: "folder" }] }),
    );
    expect(errors[0].message).toMatch(/nodes\[0\]/);
  });

  it("rejects malformed JSON with a clear message instead of throwing", () => {
    const { errors, nodes } = jsonTreeParser.parse("{not json");
    expect(nodes).toHaveLength(0);
    expect(errors[0].message).toMatch(/Invalid JSON/);
  });
});
