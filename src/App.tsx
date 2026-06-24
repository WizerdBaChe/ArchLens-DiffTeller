import { useEffect, useRef, useState } from "react";
import type { ChangeType, DiffChange } from "@/types/tree";
import { useDiffPipeline } from "@/hooks/useDiffPipeline";
import { peekHandoff, clearHandoff, type HandoffOutcome } from "@/handoff";
import { InputPanel } from "@/components/InputPanel/InputPanel";
import { Toolbar } from "@/components/Toolbar/Toolbar";
import { TreeView } from "@/components/TreeView/TreeView";
import { DetailPanel } from "@/components/DetailPanel/DetailPanel";
import "./App.css";

// P6: default view emphasizes the four primary change types; unchanged /
// modified-meta start dimmed until the person explicitly clicks "All".
const DEFAULT_FILTERS: ChangeType[] = ["added", "removed", "moved", "renamed"];

export default function App() {
  // Phase 3 handoff: read a tree sent from ArchLens Web (pure peek on init, so
  // the loaded side seeds the initial pipeline source). The cleanup (clearing
  // localStorage + the URL param) is a side effect and lives in an effect
  // below — keeping the initializer pure and StrictMode-safe.
  const [handoff] = useState<HandoffOutcome>(peekHandoff);
  const initialLeft = handoff?.status === "loaded" && handoff.side === "left" ? handoff.json : "";
  const initialRight = handoff?.status === "loaded" && handoff.side === "right" ? handoff.json : "";

  const pipeline = useDiffPipeline(initialLeft, initialRight);
  const [selected, setSelected] = useState<DiffChange | null>(null);
  const [activeFilters, setActiveFilters] = useState<Set<ChangeType>>(new Set(DEFAULT_FILTERS));
  const [inputCollapsed, setInputCollapsed] = useState(false);
  const [handoffBanner, setHandoffBanner] = useState<HandoffOutcome>(handoff);

  // P3 / P5: the first time a comparison produces a result, collapse the
  // input section automatically so analysis becomes the focus. Tracked via
  // a ref (not state) because we only care about the true→false edge, not
  // every render. Seeded with the current emptiness so a handoff-preloaded
  // side doesn't trigger an immediate collapse — the person should still see
  // the input panel to fill in the other version.
  const wasEmpty = useRef(pipeline.isEmpty);
  useEffect(() => {
    if (wasEmpty.current && !pipeline.isEmpty) {
      setInputCollapsed(true);
    }
    wasEmpty.current = pipeline.isEmpty;
  }, [pipeline.isEmpty]);

  // After mount, clear the consumed handoff so a refresh doesn't re-import.
  useEffect(() => {
    if (handoff) clearHandoff();
  }, [handoff]);

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

      {handoffBanner && (
        <div
          className={`al-handoff al-handoff--${handoffBanner.status === "loaded" ? "ok" : "warn"}`}
          role="status"
        >
          <span className="al-handoff__text">
            {handoffBanner.status === "loaded" ? (
              <>
                從 ArchLens Web 匯入了 <strong>{handoffBanner.count}</strong> 個節點
                {handoffBanner.name ? <> （{handoffBanner.name}）</> : null} 到
                {handoffBanner.side === "left" ? "左" : "右"}側 —— 請在另一側貼上要比較的版本。
              </>
            ) : (
              <>收到 Web 的比較請求，但沒有可自動帶入的資料（跨來源不共享，或結構過大已改為下載）。請改用上方手動貼上 / 匯入 —— 若剛下載了 JSON，直接上傳即可。</>
            )}
          </span>
          <button
            type="button"
            className="al-handoff__close"
            aria-label="Dismiss"
            onClick={() => setHandoffBanner(null)}
          >
            ✕
          </button>
        </div>
      )}

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
