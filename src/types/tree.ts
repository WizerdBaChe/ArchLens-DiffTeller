/**
 * Core domain types for ArchLens Diff.
 *
 * Design rule: this file has zero dependencies on React, parsing libraries,
 * or rendering concerns. Every other module (parser, diff engine, UI) depends
 * INWARD on these contracts — never the other way around. This is what keeps
 * "swap the input format" or "swap the renderer" cheap later.
 */

export type Side = "L" | "R";
export type NodeKind = "file" | "dir";

/** A single path entry as understood right after parsing, before normalization. */
export interface RawNode {
  path: string; // forward-slash, no leading slash, no trailing slash
  kind: NodeKind;
  /** Optional content fingerprint, supplied by caller (e.g. hash of file body). */
  contentHash?: string;
}

/** A RawNode enriched with tree position info, scoped to one side (L or R). */
export interface NormalizedNode extends RawNode {
  id: string; // `${side}:${path}` — stable identity within a side
  side: Side;
  name: string; // basename, e.g. "app.ts"
  parentPath: string | null; // null for root-level entries
  depth: number; // 0 = root level
}

export interface NormalizedTree {
  side: Side;
  nodes: NormalizedNode[]; // flat list, order-preserving
  byPath: Map<string, NormalizedNode>;
}

export type ChangeType =
  | "added"
  | "removed"
  | "unchanged"
  | "renamed"
  | "moved"
  | "modified-meta";

export interface DiffChange {
  id: string; // stable key for React lists / detail panel lookups
  type: ChangeType;
  kind: NodeKind;
  from?: string; // left path, absent for "added"
  to?: string; // right path, absent for "removed"
  confidence: number; // 1.0 for exact matches (added/removed/unchanged); heuristic for moved/renamed
  reason: string; // short human-readable justification, always present for heuristic types
}

export interface DiffSummary {
  added: number;
  removed: number;
  moved: number;
  renamed: number;
  unchanged: number;
  modifiedMeta: number;
}

export interface DiffWarning {
  side: Side | "both";
  message: string;
}

export interface DiffResult {
  summary: DiffSummary;
  changes: DiffChange[];
  warnings: DiffWarning[];
}

export interface DiffOptions {
  detectRename: boolean;
  detectMove: boolean;
  /** Minimum name-similarity (0..1) to call two same-dir files a "rename". */
  renameThreshold: number;
  /** Minimum name-similarity (0..1) to call two different-dir files a "move". */
  moveThreshold: number;
}

export const DEFAULT_DIFF_OPTIONS: DiffOptions = {
  detectRename: true,
  detectMove: true,
  renameThreshold: 0.6,
  moveThreshold: 0.8,
};

// ---- Input / parsing boundary -------------------------------------------

export type InputFormat = "text-tree" | "json-tree" | "archlens-tree";

export interface ParseError {
  message: string;
  line?: number;
}

export interface ParseResult {
  nodes: RawNode[];
  errors: ParseError[];
}

/** A parser is anything that turns raw user input into RawNode[]. New formats
 *  (zip manifest, git ls-tree, etc.) just implement this — nothing else in
 *  the app needs to change. */
export interface TreeParser {
  format: InputFormat;
  label: string;
  parse(source: string): ParseResult;
}

// ---- JSON input shapes (input mode B from the RPD appendix) -------------

export interface JsonTreeNodeInput {
  path: string;
  type: NodeKind;
  contentHash?: string;
}

export interface JsonTreeInput {
  root?: string;
  nodes: JsonTreeNodeInput[];
}
