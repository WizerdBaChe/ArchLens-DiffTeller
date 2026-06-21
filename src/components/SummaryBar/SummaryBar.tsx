import type { DiffSummary } from "@/types/tree";
import { CHANGE_TYPE_META } from "../changeTypeMeta";
import "./SummaryBar.css";

interface SummaryBarProps {
  summary: DiffSummary;
}

const ORDER: Array<keyof DiffSummary> = ["added", "removed", "moved", "renamed", "modifiedMeta", "unchanged"];
const KEY_TO_META_KEY: Record<keyof DiffSummary, keyof typeof CHANGE_TYPE_META> = {
  added: "added",
  removed: "removed",
  moved: "moved",
  renamed: "renamed",
  modifiedMeta: "modified-meta",
  unchanged: "unchanged",
};

export function SummaryBar({ summary }: SummaryBarProps) {
  return (
    <div className="al-summary-bar" aria-label="Diff summary">
      {ORDER.map((key) => {
        const meta = CHANGE_TYPE_META[KEY_TO_META_KEY[key]];
        return (
          <div className="al-summary-bar__item" key={key}>
            <span className="al-summary-bar__dot" style={{ background: `var(${meta.colorVar})` }} />
            <span className="al-summary-bar__count">{summary[key]}</span>
            <span className="al-summary-bar__label">{meta.label}</span>
          </div>
        );
      })}
    </div>
  );
}
