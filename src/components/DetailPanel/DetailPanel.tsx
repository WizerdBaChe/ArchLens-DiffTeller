import { useEffect, useState } from "react";
import type { DiffChange } from "@/types/tree";
import { CHANGE_TYPE_META } from "../changeTypeMeta";
import { toSingleChangeText } from "@/core/export/exportDiff";
import { useClipboardFeedback } from "@/hooks/useClipboardFeedback";
import "./DetailPanel.css";

interface DetailPanelProps {
  change: DiffChange | null;
  onClose: () => void;
}

export function DetailPanel({ change, onClose }: DetailPanelProps) {
  // Keep rendering the last-selected change while the drawer animates shut,
  // so it doesn't flash to an empty state mid-transition.
  const [displayed, setDisplayed] = useState<DiffChange | null>(change);
  const isOpen = change !== null;
  const { copy, copiedKey } = useClipboardFeedback();

  useEffect(() => {
    if (change) setDisplayed(change);
  }, [change]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const meta = displayed ? CHANGE_TYPE_META[displayed.type] : null;

  return (
    <>
      {isOpen && <div className="al-detail-backdrop" onClick={onClose} aria-hidden="true" />}
      <aside
        className={`al-detail-panel ${isOpen ? "al-detail-panel--open" : ""}`}
        aria-live="polite"
        aria-hidden={!isOpen}
      >
        {displayed && meta && (
          <>
            <div className="al-detail-panel__head">
              <span className="al-detail-panel__type" style={{ color: `var(${meta.colorVar})` }}>
                {meta.label}
              </span>
              <div className="al-detail-panel__head-actions">
                <button
                  type="button"
                  className="al-detail-panel__copy"
                  onClick={() => copy(toSingleChangeText(displayed), displayed.id)}
                >
                  {copiedKey === displayed.id ? "Copied ✓" : "Copy"}
                </button>
                <button type="button" className="al-detail-panel__close" onClick={onClose} aria-label="Close detail panel">
                  ×
                </button>
              </div>
            </div>

            {displayed.from && (
              <div className="al-detail-panel__row">
                <span className="al-detail-panel__label">From</span>
                <code className="al-detail-panel__path">{displayed.from}</code>
              </div>
            )}
            {displayed.to && (
              <div className="al-detail-panel__row">
                <span className="al-detail-panel__label">To</span>
                <code className="al-detail-panel__path">{displayed.to}</code>
              </div>
            )}
            <div className="al-detail-panel__row">
              <span className="al-detail-panel__label">Kind</span>
              <span>{displayed.kind}</span>
            </div>
            <div className="al-detail-panel__row">
              <span className="al-detail-panel__label">Confidence</span>
              <span className="al-detail-panel__confidence-bar">
                <span
                  className="al-detail-panel__confidence-fill"
                  style={{ width: `${displayed.confidence * 100}%`, background: `var(${meta.colorVar})` }}
                />
              </span>
              <span>{Math.round(displayed.confidence * 100)}%</span>
            </div>
            <div className="al-detail-panel__reason">
              <span className="al-detail-panel__label">Why</span>
              <p>{displayed.reason}</p>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
