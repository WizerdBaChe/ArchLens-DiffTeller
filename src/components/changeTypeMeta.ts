import type { ChangeType } from "@/types/tree";

export interface ChangeTypeMeta {
  label: string;
  shortLabel: string;
  colorVar: string;
  dimVar: string;
  glyph: string; // single character/symbol used in compact contexts
}

export const CHANGE_TYPE_META: Record<ChangeType, ChangeTypeMeta> = {
  added: { label: "Added", shortLabel: "Added", colorVar: "--added", dimVar: "--added-dim", glyph: "+" },
  removed: { label: "Removed", shortLabel: "Removed", colorVar: "--removed", dimVar: "--removed-dim", glyph: "−" },
  moved: { label: "Moved", shortLabel: "Moved", colorVar: "--moved", dimVar: "--moved-dim", glyph: "⇄" },
  renamed: { label: "Renamed", shortLabel: "Renamed", colorVar: "--renamed", dimVar: "--renamed-dim", glyph: "✎" },
  "modified-meta": { label: "Modified (metadata)", shortLabel: "Meta", colorVar: "--meta", dimVar: "--meta-dim", glyph: "≈" },
  unchanged: { label: "Unchanged", shortLabel: "Unchanged", colorVar: "--unchanged", dimVar: "--unchanged", glyph: "·" },
};

export const FILTERABLE_TYPES: ChangeType[] = ["added", "removed", "moved", "renamed", "modified-meta"];
