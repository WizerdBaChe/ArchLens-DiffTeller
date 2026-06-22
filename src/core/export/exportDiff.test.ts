import { describe, expect, it } from "vitest";
import { toAiPrompt, toMigrationWorksheet, toSingleChangeText } from "@/core/export/exportDiff";
import type { DiffResult } from "@/types/tree";

const sampleResult: DiffResult = {
  summary: { added: 1, removed: 1, moved: 1, renamed: 1, unchanged: 1, modifiedMeta: 0 },
  changes: [
    { id: "MV:1", type: "moved", kind: "file", from: "src/app.ts", to: "src/core/app.ts", confidence: 0.93, reason: "Same filename, relocated" },
    { id: "RN:1", type: "renamed", kind: "file", from: "src/utils/format.ts", to: "src/utils/formatting.ts", confidence: 0.69, reason: "69% filename similarity in same directory" },
    { id: "A:1", type: "added", kind: "file", to: "CHANGELOG.md", confidence: 1, reason: "Only present in version B" },
    { id: "D:1", type: "removed", kind: "file", from: "src/utils/legacy-helpers.ts", confidence: 1, reason: "Only present in version A" },
    { id: "U:1", type: "unchanged", kind: "file", from: "src/lib/api.ts", to: "src/lib/api.ts", confidence: 1, reason: "Identical" },
  ],
  warnings: [{ side: "both", message: "Low-confidence renamed guess (69%): verify before relying on it" }],
};

describe("toAiPrompt", () => {
  it("includes a field legend and the full JSON payload", () => {
    const out = toAiPrompt(sampleResult);
    expect(out).toMatch(/Field reference/);
    expect(out).toMatch(/```json/);
    expect(out).toMatch(/"app.ts"|src\/app\.ts/);
  });
});

describe("toMigrationWorksheet", () => {
  it("is explicitly labeled as a non-executable draft", () => {
    expect(toMigrationWorksheet(sampleResult)).toMatch(/not an executable script/i);
  });

  it("lists moved/renamed as checkboxes and flags low confidence", () => {
    const out = toMigrationWorksheet(sampleResult);
    expect(out).toMatch(/- \[ \] `src\/app\.ts` → `src\/core\/app\.ts`/);
    expect(out).toMatch(/- \[ \] `src\/utils\/format\.ts` → `src\/utils\/formatting\.ts`/);
    expect(out).toMatch(/69%.*⚠ low confidence/);
    expect(out).not.toMatch(/93%.*⚠ low confidence/);
  });

  it("lists added/removed without checkboxes, since there's nothing to verify", () => {
    const out = toMigrationWorksheet(sampleResult);
    expect(out).toMatch(/Added: CHANGELOG\.md/);
    expect(out).toMatch(/Removed: src\/utils\/legacy-helpers\.ts/);
    expect(out).not.toMatch(/- \[ \].*CHANGELOG/);
  });

  it("excludes unchanged entries entirely", () => {
    expect(toMigrationWorksheet(sampleResult)).not.toMatch(/api\.ts.*api\.ts/);
  });
});

describe("toSingleChangeText", () => {
  it("formats a moved change with confidence and reason", () => {
    const text = toSingleChangeText(sampleResult.changes[0]);
    expect(text).toBe("moved: src/app.ts → src/core/app.ts\nConfidence: 93%\nReason: Same filename, relocated");
  });

  it("omits confidence/reason for unchanged entries", () => {
    const text = toSingleChangeText(sampleResult.changes[4]);
    expect(text).toBe("unchanged: src/lib/api.ts → src/lib/api.ts");
  });
});
