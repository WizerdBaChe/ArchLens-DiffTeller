import { describe, expect, it } from "vitest";
import { textTreeParser } from "@/core/parser/textTreeParser";
import { normalizeTree } from "@/core/normalize/normalizeTree";
import { diffTrees } from "@/core/diff/diffEngine";
import { DEFAULT_DIFF_OPTIONS } from "@/types/tree";
import { RPD_EXAMPLE_LEFT, RPD_EXAMPLE_RIGHT } from "@/fixtures/rpdExample";

function diffFromText(left: string, right: string) {
  const l = normalizeTree(textTreeParser.parse(left).nodes, "L");
  const r = normalizeTree(textTreeParser.parse(right).nodes, "R");
  return diffTrees(l, r, DEFAULT_DIFF_OPTIONS);
}

describe("diffTrees — RPD worked example", () => {
  it("detects app.ts moving into a new src/core directory", () => {
    const result = diffFromText(RPD_EXAMPLE_LEFT, RPD_EXAMPLE_RIGHT);

    const moved = result.changes.find((c) => c.type === "moved" && c.from === "src/app.ts");
    expect(moved).toBeDefined();
    expect(moved?.to).toBe("src/core/app.ts");
    expect(moved!.confidence).toBeGreaterThan(0.9);

    const unchangedApi = result.changes.find((c) => c.from === "src/lib/api.ts");
    expect(unchangedApi?.type).toBe("unchanged");

    const addedDir = result.changes.find((c) => c.to === "src/core");
    expect(addedDir?.type).toBe("added");

    expect(result.summary).toEqual({
      added: 1, // src/core
      removed: 0,
      moved: 1, // app.ts
      renamed: 0,
      unchanged: 3, // src, src/lib, src/lib/api.ts
      modifiedMeta: 0,
    });
  });
});

describe("diffTrees — rename within same directory", () => {
  it("classifies a same-directory name change as renamed, not moved", () => {
    const result = diffFromText(`src/\n  app.ts`, `src/\n  app2.ts`);
    const renamed = result.changes.find((c) => c.type === "renamed");
    expect(renamed).toBeDefined();
    expect(renamed?.from).toBe("src/app.ts");
    expect(renamed?.to).toBe("src/app2.ts");
  });
});

describe("diffTrees — unrelated add/remove", () => {
  it("does not force a match when names are dissimilar", () => {
    const result = diffFromText(`src/\n  app.ts`, `src/\n  totally-different-thing.ts`);
    expect(result.changes.some((c) => c.type === "removed" && c.from === "src/app.ts")).toBe(true);
    expect(
      result.changes.some((c) => c.type === "added" && c.to === "src/totally-different-thing.ts"),
    ).toBe(true);
  });
});

describe("diffTrees — case-only and type-change metadata", () => {
  it("flags a case-only rename as modified-meta", () => {
    const result = diffFromText(`src/\n  App.ts`, `src/\n  app.ts`);
    const meta = result.changes.find((c) => c.type === "modified-meta");
    expect(meta).toBeDefined();
    expect(meta?.reason).toMatch(/[Cc]ase/);
  });
});
