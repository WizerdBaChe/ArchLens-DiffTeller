import type { DiffResult } from "@/types/tree";

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

export type ExportFormat = "json" | "csv" | "md";

export function exportDiff(result: DiffResult, format: ExportFormat): { content: string; filename: string; mime: string } {
  switch (format) {
    case "json":
      return { content: toJson(result), filename: "structure-diff.json", mime: "application/json" };
    case "csv":
      return { content: toCsv(result), filename: "structure-diff.csv", mime: "text/csv" };
    case "md":
      return { content: toMarkdown(result), filename: "structure-diff.md", mime: "text/markdown" };
  }
}
