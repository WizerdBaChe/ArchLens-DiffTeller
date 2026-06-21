import { useEffect, useRef, useState } from "react";
import type { ChangeType, DiffChange } from "@/types/tree";
import { useDiffPipeline } from "@/hooks/useDiffPipeline";
import { InputPanel } from "@/components/InputPanel/InputPanel";
import { Toolbar } from "@/components/Toolbar/Toolbar";
import { TreeView } from "@/components/TreeView/TreeView";
import { DetailPanel } from "@/components/DetailPanel/DetailPanel";
import "./App.css";

// P6: default view emphasizes the four primary change types; unchanged /
// modified-meta start dimmed until the person explicitly clicks "All".
const DEFAULT_FILTERS: ChangeType[] = ["added", "removed", "moved", "renamed"];

export default function App() {
  const pipeline = useDiffPipeline();
  const [selected, setSelected] = useState<DiffChange | null>(null);
  const [activeFilters, setActiveFilters] = useState<Set<ChangeType>>(new Set(DEFAULT_FILTERS));
  const [inputCollapsed, setInputCollapsed] = useState(false);

  // P3 / P5: the first time a comparison produces a result, collapse the
  // input section automatically so analysis becomes the focus. Tracked via
  // a ref (not state) because we only care about the true→false edge, not
  // every render.
  const wasEmpty = useRef(true);
  useEffect(() => {
    if (wasEmpty.current && !pipeline.isEmpty) {
      setInputCollapsed(true);
    }
    wasEmpty.current = pipeline.isEmpty;
  }, [pipeline.isEmpty]);

  const toggleFilter = (type: ChangeType) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const handleClearWorkspace = () => {
    pipeline.reset();
    setSelected(null);
    setActiveFilters(new Set(DEFAULT_FILTERS));
    setInputCollapsed(false);
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

      <section className="al-app__section" aria-labelledby="al-section-structure">
        <span id="al-section-structure" className="al-section-eyebrow">
          01 — Project structure
        </span>
        <InputPanel
          leftSource={pipeline.leftSource}
          rightSource={pipeline.rightSource}
          onLeftChange={pipeline.setLeftSource}
          onRightChange={pipeline.setRightSource}
          leftErrors={pipeline.leftErrors}
          rightErrors={pipeline.rightErrors}
          leftCount={pipeline.leftTree.nodes.length}
          rightCount={pipeline.rightTree.nodes.length}
          collapsed={inputCollapsed}
          onToggleCollapsed={() => setInputCollapsed((v) => !v)}
        />
      </section>

      {pipeline.isEmpty ? (
        <div className="al-app__empty">
          <p>Paste both versions above, or load the sample, to see what moved.</p>
        </div>
      ) : (
        <>
          <section className="al-app__section" aria-labelledby="al-section-summary">
            <span id="al-section-summary" className="al-section-eyebrow">
              02 — Change summary
            </span>
            <Toolbar
              diff={pipeline.diff}
              activeFilters={activeFilters}
              onToggleFilter={toggleFilter}
              onResetFilters={() => setActiveFilters(new Set())}
              onClearWorkspace={handleClearWorkspace}
            />
          </section>

          <section className="al-app__section al-app__section--fill" aria-labelledby="al-section-diff">
            <span id="al-section-diff" className="al-section-eyebrow">
              03 — Diff visualization
            </span>
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
          </section>
        </>
      )}
    </div>
  );
}
