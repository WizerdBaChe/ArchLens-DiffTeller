import { describe, expect, it } from "vitest";
import { decodeHandoff } from "@/handoff";

const envelope = {
  archlens: "1.0",
  kind: "tree",
  source: { product: "web", name: "Demo" },
  payload: { nodes: [{ path: "src/app.ts", type: "file" }, { path: "src", type: "dir" }] },
};

describe("decodeHandoff", () => {
  it("decodes a valid web handoff payload (default right side)", () => {
    const raw = JSON.stringify({ side: "right", from: "web", at: Date.now(), envelope });
    const data = decodeHandoff(raw);
    expect(data).not.toBeNull();
    expect(data!.side).toBe("right");
    expect(data!.count).toBe(2);
    expect(data!.name).toBe("Demo");
    // the produced json must itself re-parse as a tree the parser accepts
    expect(JSON.parse(data!.json).kind).toBe("tree");
  });

  it("honors an explicit left side", () => {
    const raw = JSON.stringify({ side: "left", envelope });
    expect(decodeHandoff(raw)!.side).toBe("left");
  });

  it("defaults to right when side is missing/unknown", () => {
    const raw = JSON.stringify({ envelope });
    expect(decodeHandoff(raw)!.side).toBe("right");
  });

  it("rejects a non-tree envelope", () => {
    const raw = JSON.stringify({ envelope: { archlens: "1.0", kind: "graph", payload: {} } });
    expect(decodeHandoff(raw)).toBeNull();
  });

  it("returns null for malformed JSON", () => {
    expect(decodeHandoff("{not json")).toBeNull();
  });

  it("returns null for empty/absent storage", () => {
    expect(decodeHandoff(null)).toBeNull();
    expect(decodeHandoff("")).toBeNull();
  });
});
