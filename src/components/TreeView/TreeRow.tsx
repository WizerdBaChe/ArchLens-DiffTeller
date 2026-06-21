import type { DiffChange, NormalizedNode } from "@/types/tree";
import { CHANGE_TYPE_META } from "../changeTypeMeta";
import "./TreeRow.css";

function FolderIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M1.5 3.5h4l1.2 1.6H14a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-.5.5h-12a.5.5 0 0 1-.5-.5V4a.5.5 0 0 1 .5-.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M3.5 1.5h6l3 3v10a.5.5 0 0 1-.5.5h-8.5a.5.5 0 0 1-.5-.5V2a.5.5 0 0 1 .5-.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M9.5 1.5V4a.5.5 0 0 0 .5.5h2.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      aria-hidden="true"
      style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 150ms ease-out" }}
    >
      <path d="M3 1.5 7.5 5 3 8.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface TreeRowProps {
  node: NormalizedNode;
  depth: number;
  hasChildren: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  change?: DiffChange;
  isSelected: boolean;
  onSelect: () => void;
  isDimmed: boolean;
  /** True when this row is one end of a cross-pane connector (moved/renamed/
   *  case-change). Draws a leader-line stub out to the row's edge so the
   *  connector dot doesn't appear to float in empty space next to a short
   *  filename. */
  isConnector?: boolean;
  registerRef?: (el: HTMLDivElement | null) => void;
}

export function TreeRow({
  node,
  depth,
  hasChildren,
  isCollapsed,
  onToggleCollapse,
  change,
  isSelected,
  onSelect,
  isDimmed,
  isConnector,
  registerRef,
}: TreeRowProps) {
  const meta = change ? CHANGE_TYPE_META[change.type] : undefined;
  const showConfidence = change && change.confidence < 1 && change.type !== "unchanged";

  return (
    <div
      ref={registerRef}
      className={`al-tree-row ${isSelected ? "al-tree-row--selected" : ""} ${isDimmed ? "al-tree-row--dimmed" : ""}`}
      style={{
        paddingLeft: `calc(${depth} * 16px + var(--space-2))`,
        borderLeftColor: meta ? `var(${meta.colorVar})` : "transparent",
      }}
      onClick={onSelect}
      role="treeitem"
      aria-selected={isSelected}
      aria-expanded={hasChildren ? !isCollapsed : undefined}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      <span
        className="al-tree-row__chevron"
        onClick={(e) => {
          e.stopPropagation();
          if (hasChildren) onToggleCollapse();
        }}
      >
        {hasChildren ? <Chevron open={!isCollapsed} /> : null}
      </span>
      <span className="al-tree-row__icon">{node.kind === "dir" ? <FolderIcon /> : <FileIcon />}</span>
      <span className="al-tree-row__name">{node.name}</span>
      {meta && change?.type !== "unchanged" && (
        <span className="al-tree-row__glyph" style={{ color: `var(${meta.colorVar})` }} aria-label={meta.label}>
          {meta.glyph}
        </span>
      )}
      {showConfidence && (
        <span className="al-tree-row__confidence">{Math.round(change!.confidence * 100)}%</span>
      )}
      {isConnector && meta && (
        <span className="al-tree-row__stub" style={{ borderColor: `var(${meta.colorVar})` }} aria-hidden="true" />
      )}
    </div>
  );
}
