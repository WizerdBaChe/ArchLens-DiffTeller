import type { DiffSummary } from "@/types/tree";
import { useLocale } from "@/i18n";
import { changeTypeMeta } from "../changeTypeMeta";
import "./SummaryBar.css";

interface SummaryBarProps {
  summary: DiffSummary;
}

const ORDER: Array<keyof DiffSummary> = ["added", "removed", "moved", "renamed", "modifiedMeta", "unchanged"];
const KEY_TO_CHANGE_TYPE = {
  added: "added",
  removed: "removed",
  moved: "moved",
  renamed: "renamed",
  modifiedMeta: "modified-meta",
  unchanged: "unchanged",
} as const;

export function SummaryBar({ summary }: SummaryBarProps) {
  const { t } = useLocale();
  return (
    <div className="al-summary-bar" aria-label={t.sectionSummary}>
      {ORDER.map((key) => {
        const meta = changeTypeMeta(KEY_TO_CHANGE_TYPE[key], t);
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
