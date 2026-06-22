import { useState } from "react";
import type { ChangeType, DiffResult } from "@/types/tree";
import { SummaryBar } from "../SummaryBar/SummaryBar";
import { FilterBar } from "../FilterBar/FilterBar";
import { Legend } from "../Legend/Legend";
import { exportDiff, type ExportFormat } from "@/core/export/exportDiff";
import { useClipboardFeedback } from "@/hooks/useClipboardFeedback";
import "./Toolbar.css";

interface ToolbarProps {
  diff: DiffResult;
  activeFilters: ReadonlySet<ChangeType>;
  onToggleFilter: (type: ChangeType) => void;
  onResetFilters: () => void;
  onClearWorkspace: () => void;
}

function downloadText(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function ExportIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M8 1v8.5M8 9.5 5 6.5M8 9.5l3-3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M2.5 11v2a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

const PRIMARY_FORMATS: Array<{ format: ExportFormat; label: string }> = [
  { format: "json", label: "JSON" },
  { format: "csv", label: "CSV" },
  { format: "md", label: "Markdown report" },
];

const DERIVED_FORMATS: Array<{ format: ExportFormat; label: string; hint: string }> = [
  {
    format: "ai-prompt",
    label: "Copy for AI",
    hint: "The diff JSON with a short field legend in front — paste straight into a chat AI.",
  },
  {
    format: "worksheet",
    label: "Migration worksheet",
    hint: "A review checklist for moved/renamed items. Not an executable script — for you (or an AI) to confirm before anything is applied.",
  },
];

export function Toolbar({ diff, activeFilters, onToggleFilter, onResetFilters, onClearWorkspace }: ToolbarProps) {
  const [exportOpen, setExportOpen] = useState(false);
  const [legendOpen, setLegendOpen] = useState(false);
  const { copy, copiedKey } = useClipboardFeedback();

  const handleDownload = (format: ExportFormat) => {
    const { content, filename, mime } = exportDiff(diff, format);
    downloadText(content, filename, mime);
  };

  const handleCopy = (format: ExportFormat) => {
    const { content } = exportDiff(diff, format);
    copy(content, format);
  };

  const renderRow = (format: ExportFormat, label: string, hint?: string) => (
    <div className="al-toolbar__export-row" key={format} title={hint}>
      <span className="al-toolbar__export-label">{label}</span>
      <div className="al-toolbar__export-actions">
        <button type="button" role="menuitem" onClick={() => handleCopy(format)}>
          {copiedKey === format ? "Copied ✓" : "Copy"}
        </button>
        <button type="button" role="menuitem" onClick={() => handleDownload(format)}>
          Download
        </button>
      </div>
      {hint && <p className="al-toolbar__export-hint">{hint}</p>}
    </div>
  );

  return (
    <div className="al-toolbar">
      <SummaryBar summary={diff.summary} />
      <div className="al-toolbar__right">
        <div className="al-toolbar__view-controls">
          <FilterBar active={activeFilters} onToggle={onToggleFilter} onReset={onResetFilters} />

          <div className="al-toolbar__popover-wrap">
            <button
              type="button"
              className="al-btn al-btn--ghost"
              onClick={() => setLegendOpen((v) => !v)}
              aria-expanded={legendOpen}
              title="Show connector legend"
            >
              Legend
            </button>
            {legendOpen && (
              <div className="al-toolbar__popover">
                <Legend />
              </div>
            )}
          </div>

          {diff.warnings.length > 0 && (
            <span className="al-toolbar__warning" title={diff.warnings.map((w) => w.message).join("\n")}>
              ⚠ {diff.warnings.length} low-confidence match{diff.warnings.length > 1 ? "es" : ""}
            </span>
          )}
        </div>

        <div className="al-toolbar__divider" aria-hidden="true" />

        <div className="al-toolbar__actions">
          <div className="al-toolbar__export">
            <button
              type="button"
              className="al-btn al-btn--accent"
              onClick={() => setExportOpen((v) => !v)}
              aria-expanded={exportOpen}
              title="Copy or download this diff — for a PR, a changelog, or an AI"
            >
              <span className="al-btn__icon">
                <ExportIcon />
              </span>
              Copy / Export ▾
            </button>
            {exportOpen && (
              <div className="al-toolbar__export-menu" role="menu">
                <p className="al-toolbar__export-menu-title">Get this diff out — for a PR, a changelog, or an AI</p>
                {PRIMARY_FORMATS.map((f) => renderRow(f.format, f.label))}
                <div className="al-toolbar__export-divider" />
                {DERIVED_FORMATS.map((f) => renderRow(f.format, f.label, f.hint))}
              </div>
            )}
          </div>

          <button type="button" className="al-btn al-btn--ghost" onClick={onClearWorkspace}>
            Clear workspace
          </button>
        </div>
      </div>
    </div>
  );
}
