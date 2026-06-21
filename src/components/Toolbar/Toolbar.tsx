import { useState } from "react";
import type { ChangeType, DiffResult } from "@/types/tree";
import { SummaryBar } from "../SummaryBar/SummaryBar";
import { FilterBar } from "../FilterBar/FilterBar";
import { Legend } from "../Legend/Legend";
import { exportDiff, type ExportFormat } from "@/core/export/exportDiff";
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

export function Toolbar({ diff, activeFilters, onToggleFilter, onResetFilters, onClearWorkspace }: ToolbarProps) {
  const [exportOpen, setExportOpen] = useState(false);
  const [legendOpen, setLegendOpen] = useState(false);

  const handleExport = (format: ExportFormat) => {
    const { content, filename, mime } = exportDiff(diff, format);
    downloadText(content, filename, mime);
    setExportOpen(false);
  };

  return (
    <div className="al-toolbar">
      <SummaryBar summary={diff.summary} />
      <div className="al-toolbar__right">
        <FilterBar active={activeFilters} onToggle={onToggleFilter} onReset={onResetFilters} />

        <div className="al-toolbar__popover-wrap">
          <button
            type="button"
            className="al-toolbar__icon-btn"
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

        <div className="al-toolbar__export">
          <button type="button" className="al-toolbar__export-btn" onClick={() => setExportOpen((v) => !v)}>
            Export ▾
          </button>
          {exportOpen && (
            <div className="al-toolbar__export-menu" role="menu">
              <button type="button" role="menuitem" onClick={() => handleExport("json")}>
                structure-diff.json
              </button>
              <button type="button" role="menuitem" onClick={() => handleExport("csv")}>
                structure-diff.csv
              </button>
              <button type="button" role="menuitem" onClick={() => handleExport("md")}>
                structure-diff.md
              </button>
            </div>
          )}
        </div>

        <button type="button" className="al-toolbar__clear-btn" onClick={onClearWorkspace}>
          Clear workspace
        </button>
      </div>
    </div>
  );
}
