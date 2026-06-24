import { describe, expect, it } from "vitest";
import { textTreeParser } from "@/core/parser/textTreeParser";
import { jsonTreeParser } from "@/core/parser/jsonTreeParser";
import { archlensTreeParser } from "@/core/parser/archlensTreeParser";
import { detectFormat, getParser } from "@/core/parser";

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

describe("archlensTreeParser", () => {
  const envelope = JSON.stringify({
    archlens: "1.0",
    kind: "tree",
    source: { product: "web", name: "Demo" },
    payload: { nodes: [{ path: "src/app.ts", type: "file" }, { path: "src", type: "dir" }] },
  });

  it("unwraps a tree envelope and validates its nodes", () => {
    const { nodes, errors } = archlensTreeParser.parse(envelope);
    expect(errors).toHaveLength(0);
    expect(nodes).toEqual([
      { path: "src/app.ts", kind: "file", contentHash: undefined },
      { path: "src", kind: "dir", contentHash: undefined },
    ]);
  });

  it("rejects an envelope whose kind is not tree", () => {
    const { errors, nodes } = archlensTreeParser.parse(
      JSON.stringify({ archlens: "1.0", kind: "graph", payload: { nodes: [] } }),
    );
    expect(nodes).toHaveLength(0);
    expect(errors[0].message).toMatch(/graph/);
  });

  it("reuses the shared per-row validation (bad type is flagged by row)", () => {
    const { errors } = archlensTreeParser.parse(
      JSON.stringify({ archlens: "1.0", kind: "tree", payload: { nodes: [{ path: "a", type: "folder" }] } }),
    );
    expect(errors[0].message).toMatch(/nodes\[0\]/);
  });
});

describe("detectFormat", () => {
  it("routes an ArchLens envelope to the envelope parser", () => {
    const src = JSON.stringify({ archlens: "1.0", kind: "tree", payload: { nodes: [{ path: "a", type: "file" }] } });
    expect(detectFormat(src)).toBe("archlens-tree");
    // round-trip: detection + parser should yield the node
    const { nodes, errors } = getParser(detectFormat(src)).parse(src);
    expect(errors).toHaveLength(0);
    expect(nodes.map((n) => n.path)).toEqual(["a"]);
  });

  it("still routes a bare { nodes } object to json-tree", () => {
    expect(detectFormat(JSON.stringify({ nodes: [{ path: "a", type: "file" }] }))).toBe("json-tree");
  });

  it("falls back to text-tree for non-JSON input", () => {
    expect(detectFormat("src/\n  app.ts")).toBe("text-tree");
  });
});
