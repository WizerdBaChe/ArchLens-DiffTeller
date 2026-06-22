import type { DiffChange, DiffResult } from "@/types/tree";
import { LOW_CONFIDENCE_THRESHOLD } from "@/core/diff/diffEngine";

export function toJson(result: DiffResult): string {
  return JSON.stringify(result, null, 2);
}

export function toCsv(result: DiffResult): string {
  const header = ["type", "from", "to", "kind", "confidence", "reason"];
  const escape = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const rows = result.changes.map((c) =>
    [c.type, c.from ?? "", c.to ?? "", c.kind, c.confidence.toFixed(2), c.reason]
      .map((v) => escape(String(v)))
      .join(","),
  );
  return [header.join(","), ...rows].join("\n");
}

export function toMarkdown(result: DiffResult): string {
  const { summary, changes, warnings } = result;
  const lines: string[] = [];

  lines.push("# Structure Diff");
  lines.push("");
  lines.push(
    `**Added:** ${summary.added}  **Removed:** ${summary.removed}  **Moved:** ${summary.moved}  **Renamed:** ${summary.renamed}  **Modified (meta):** ${summary.modifiedMeta}  **Unchanged:** ${summary.unchanged}`,
  );
  lines.push("");

  if (warnings.length > 0) {
    lines.push("## Warnings");
    lines.push("");
    for (const w of warnings) lines.push(`- ${w.message}`);
    lines.push("");
  }

  lines.push("## Changes");
  lines.push("");
  lines.push("| Type | From | To | Confidence | Reason |");
  lines.push("|---|---|---|---|---|");
  for (const c of changes) {
    if (c.type === "unchanged") continue; // keep the report focused on what changed
    lines.push(
      `| ${c.type} | ${c.from ?? "—"} | ${c.to ?? "—"} | ${Math.round(c.confidence * 100)}% | ${c.reason} |`,
    );
  }
  return lines.join("\n");
}

/**
 * "Copy for AI" — the raw data plus just enough of a schema legend that
 * an LLM (or a human skimming before pasting) doesn't have to guess what
 * the fields mean. Intentionally light-touch: no instruction telling the
 * AI *what* to do with it, since that depends on what the person actually
 * wants (changelog entry? risk review? PR description?) — they fill that
 * part in themselves above the pasted block.
 */
export function toAiPrompt(result: DiffResult): string {
  const { summary } = result;
  const lines: string[] = [];

  lines.push(
    "The JSON below is a structural diff between two versions of a project " +
      "(folders/files added, removed, moved, renamed, or metadata-changed — " +
      "not a line-by-line text diff).",
  );
  lines.push("");
  lines.push(
    `Summary: ${summary.added} added, ${summary.removed} removed, ${summary.moved} moved, ` +
      `${summary.renamed} renamed, ${summary.modifiedMeta} modified-meta, ${summary.unchanged} unchanged.`,
  );
  lines.push("");
  lines.push(
    "Field reference: `type` is one of added/removed/moved/renamed/modified-meta/unchanged. " +
      "`from`/`to` are paths (only one is present for added/removed). `confidence` (0–1) is how " +
      "sure the matching heuristic is about a moved/renamed pairing — it is a guess, not a fact, " +
      "below roughly 0.75 it should be treated as unverified. `reason` is the heuristic's own " +
      "justification for the call.",
  );
  lines.push("");
  lines.push("```json");
  lines.push(toJson(result));
  lines.push("```");
  return lines.join("\n");
}

/**
 * Migration worksheet — deliberately NOT an executable script. This is a
 * human-reviewable draft: checklist items for anything the engine had to
 * *guess* about (moved/renamed/modified-meta), with confidence and reasoning
 * shown inline so a person can confirm, correct, or strike out an item
 * before it ever becomes a real command — by hand, or by handing the
 * reviewed list to an AI/codemod afterward. Added/removed are listed
 * separately without checkboxes, since those are exact matches with
 * nothing to verify.
 */
export function toMigrationWorksheet(result: DiffResult): string {
  const { changes } = result;
  const lines: string[] = [];

  lines.push("# Structure Migration Worksheet (draft — not an executable script)");
  lines.push("");
  lines.push(
    "This is a review draft generated from a structural diff, not a script to run. " +
      "Check off, correct, or annotate each item below before treating it as ground " +
      "truth — then use this as the source material for writing the actual move " +
      "commands or codemod, by hand or with AI help.",
  );
  lines.push("");

  const moved = changes.filter((c) => c.type === "moved");
  const renamed = changes.filter((c) => c.type === "renamed");
  const added = changes.filter((c) => c.type === "added");
  const removed = changes.filter((c) => c.type === "removed");
  const meta = changes.filter((c) => c.type === "modified-meta");

  const renderReviewSection = (title: string, items: DiffChange[]) => {
    if (items.length === 0) return;
    lines.push(`## ${title} (${items.length}) — review before applying`);
    lines.push("");
    for (const c of items) {
      const low = c.confidence < LOW_CONFIDENCE_THRESHOLD;
      lines.push(`- [ ] \`${c.from ?? "?"}\` → \`${c.to ?? "?"}\``);
      lines.push(
        `      confidence ${Math.round(c.confidence * 100)}%${low ? " ⚠ low confidence — verify manually" : ""} — ${c.reason}`,
      );
    }
    lines.push("");
  };

  renderReviewSection("Moved", moved);
  renderReviewSection("Renamed", renamed);
  renderReviewSection("Modified (metadata)", meta);

  if (added.length > 0 || removed.length > 0) {
    lines.push("## Also changed (exact matches — nothing to verify)");
    lines.push("");
    if (added.length > 0) lines.push(`- Added: ${added.map((c) => c.to).join(", ")}`);
    if (removed.length > 0) lines.push(`- Removed: ${removed.map((c) => c.from).join(", ")}`);
    lines.push("");
  }

  lines.push("---");
  lines.push("");
  lines.push("## Notes");
  lines.push("");
  lines.push("_(add corrections here before handing this to a script or an AI)_");
  lines.push("");

  return lines.join("\n");
}

/** Plain-text summary of a single change, for the detail panel's copy button. */
export function toSingleChangeText(change: DiffChange): string {
  const pathLine =
    change.from && change.to
      ? `${change.from} → ${change.to}`
      : change.from
        ? change.from
        : (change.to ?? "");
  const lines = [`${change.type}: ${pathLine}`];
  if (change.type !== "unchanged") {
    lines.push(`Confidence: ${Math.round(change.confidence * 100)}%`);
    lines.push(`Reason: ${change.reason}`);
  }
  return lines.join("\n");
}

export type ExportFormat = "json" | "csv" | "md" | "ai-prompt" | "worksheet";

export interface ExportPayload {
  content: string;
  filename: string;
  mime: string;
}

export function exportDiff(result: DiffResult, format: ExportFormat): ExportPayload {
  switch (format) {
    case "json":
      return { content: toJson(result), filename: "structure-diff.json", mime: "application/json" };
    case "csv":
      return { content: toCsv(result), filename: "structure-diff.csv", mime: "text/csv" };
    case "md":
      return { content: toMarkdown(result), filename: "structure-diff.md", mime: "text/markdown" };
    case "ai-prompt":
      return { content: toAiPrompt(result), filename: "structure-diff.ai-prompt.md", mime: "text/markdown" };
    case "worksheet":
      return { content: toMigrationWorksheet(result), filename: "structure-diff.worksheet.md", mime: "text/markdown" };
  }
}
