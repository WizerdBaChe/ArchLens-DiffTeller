import type { DiffChange } from "@/types/tree";
import { CHANGE_TYPE_META } from "../changeTypeMeta";
import "./DetailPanel.css";

interface DetailPanelProps {
  change: DiffChange | null;
  onClose: () => void;
}

export function DetailPanel({ change, onClose }: DetailPanelProps) {
  if (!change) {
    return (
      <aside className="al-detail-panel al-detail-panel--empty">
        <p>Select a node in either tree to see why it was classified the way it was.</p>
      </aside>
    );
  }

  const meta = CHANGE_TYPE_META[change.type];

  return (
    <aside className="al-detail-panel" aria-live="polite">
      <div className="al-detail-panel__head">
        <span className="al-detail-panel__type" style={{ color: `var(${meta.colorVar})` }}>
          {meta.label}
        </span>
        <button type="button" className="al-detail-panel__close" onClick={onClose} aria-label="Close detail panel">
          ×
        </button>
      </div>

      {change.from && (
        <div className="al-detail-panel__row">
          <span className="al-detail-panel__label">From</span>
          <code className="al-detail-panel__path">{change.from}</code>
        </div>
      )}
      {change.to && (
        <div className="al-detail-panel__row">
          <span className="al-detail-panel__label">To</span>
          <code className="al-detail-panel__path">{change.to}</code>
        </div>
      )}
      <div className="al-detail-panel__row">
        <span className="al-detail-panel__label">Kind</span>
        <span>{change.kind}</span>
      </div>
      <div className="al-detail-panel__row">
        <span className="al-detail-panel__label">Confidence</span>
        <span className="al-detail-panel__confidence-bar">
          <span
            className="al-detail-panel__confidence-fill"
            style={{ width: `${change.confidence * 100}%`, background: `var(${meta.colorVar})` }}
          />
        </span>
        <span>{Math.round(change.confidence * 100)}%</span>
      </div>
      <div className="al-detail-panel__reason">
        <span className="al-detail-panel__label">Why</span>
        <p>{change.reason}</p>
      </div>
    </aside>
  );
}
