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

export function Toolbar({ diff, activeFilters, onToggleFilter, onResetFilters }: ToolbarProps) {
  const [exportOpen, setExportOpen] = useState(false);

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
      </div>
      <div className="al-toolbar__legend-row">
        <Legend />
        {diff.warnings.length > 0 && (
          <span className="al-toolbar__warning">⚠ {diff.warnings.length} low-confidence match{diff.warnings.length > 1 ? "es" : ""}</span>
        )}
      </div>
    </div>
  );
}
