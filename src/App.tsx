import { useState } from "react";
import type { ChangeType, DiffChange } from "@/types/tree";
import { useDiffPipeline } from "@/hooks/useDiffPipeline";
import { InputPanel } from "@/components/InputPanel/InputPanel";
import { Toolbar } from "@/components/Toolbar/Toolbar";
import { TreeView } from "@/components/TreeView/TreeView";
import { DetailPanel } from "@/components/DetailPanel/DetailPanel";
import "./App.css";

export default function App() {
  const pipeline = useDiffPipeline();
  const [selected, setSelected] = useState<DiffChange | null>(null);
  const [activeFilters, setActiveFilters] = useState<Set<ChangeType>>(new Set());

  const toggleFilter = (type: ChangeType) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  return (
    <div className="al-app">
      <header className="al-app__header">
        <div className="al-app__wordmark">
          <span className="al-app__wordmark-icon" aria-hidden="true">
            ⟁
          </span>
          ArchLens<span className="al-app__wordmark-accent">Diff</span>
        </div>
        <p className="al-app__tagline">Read the structure that changed, not the lines that moved.</p>
      </header>

      <InputPanel
        leftSource={pipeline.leftSource}
        rightSource={pipeline.rightSource}
        onLeftChange={pipeline.setLeftSource}
        onRightChange={pipeline.setRightSource}
        leftErrors={pipeline.leftErrors}
        rightErrors={pipeline.rightErrors}
      />

      {pipeline.isEmpty ? (
        <div className="al-app__empty">
          <p>Paste both versions above, or load the sample, to see what moved.</p>
        </div>
      ) : (
        <>
          <Toolbar
            diff={pipeline.diff}
            activeFilters={activeFilters}
            onToggleFilter={toggleFilter}
            onResetFilters={() => setActiveFilters(new Set())}
          />
          <div className="al-app__main">
            <TreeView
              leftTree={pipeline.leftTree}
              rightTree={pipeline.rightTree}
              diff={pipeline.diff}
              selectedId={selected?.id ?? null}
              onSelect={setSelected}
              activeFilters={activeFilters}
            />
            <DetailPanel change={selected} onClose={() => setSelected(null)} />
          </div>
        </>
      )}
    </div>
  );
}
