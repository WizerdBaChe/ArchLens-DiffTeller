import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "@/i18n";
import type { ChangeType, DiffChange, DiffResult, NormalizedTree } from "@/types/tree";
import { buildHierarchy, flattenHierarchy } from "@/core/normalize/normalizeTree";
import { changeTypeMeta } from "../changeTypeMeta";
import { TreeRow } from "./TreeRow";
import "./TreeView.css";

const LANE_WIDTH = 120;

interface ConnectorPos {
  id: string;
  y1: number;
  y2: number;
  colorVar: string;
  dashed: boolean;
  confidence: number;
}

interface TreeViewProps {
  leftTree: NormalizedTree;
  rightTree: NormalizedTree;
  diff: DiffResult;
  selectedId: string | null;
  onSelect: (change: DiffChange) => void;
  activeFilters: ReadonlySet<ChangeType>;
}

export function TreeView({ leftTree, rightTree, diff, selectedId, onSelect, activeFilters }: TreeViewProps) {
  const { t } = useLocale();
  const [collapsedLeft, setCollapsedLeft] = useState<Set<string>>(new Set());
  const [collapsedRight, setCollapsedRight] = useState<Set<string>>(new Set());
  const [positions, setPositions] = useState<ConnectorPos[]>([]);

  const laneRef = useRef<HTMLDivElement>(null);
  const leftRefs = useRef(new Map<string, HTMLDivElement>());
  const rightRefs = useRef(new Map<string, HTMLDivElement>());

  const leftHierarchy = useMemo(() => buildHierarchy(leftTree), [leftTree]);
  const rightHierarchy = useMemo(() => buildHierarchy(rightTree), [rightTree]);
  const leftRows = useMemo(() => flattenHierarchy(leftHierarchy, collapsedLeft), [leftHierarchy, collapsedLeft]);
  const rightRows = useMemo(() => flattenHierarchy(rightHierarchy, collapsedRight), [rightHierarchy, collapsedRight]);

  const leftChangeByPath = useMemo(() => {
    const m = new Map<string, DiffChange>();
    for (const c of diff.changes) if (c.from) m.set(c.from, c);
    return m;
  }, [diff]);
  const rightChangeByPath = useMemo(() => {
    const m = new Map<string, DiffChange>();
    for (const c of diff.changes) if (c.to) m.set(c.to, c);
    return m;
  }, [diff]);

  const connectors = useMemo(
    () =>
      diff.changes.filter(
        (c) =>
          c.from &&
          c.to &&
          c.from !== c.to &&
          (c.type === "moved" || c.type === "renamed" || c.type === "modified-meta") &&
          (activeFilters.size === 0 || activeFilters.has(c.type)),
      ),
    [diff, activeFilters],
  );

  const connectorFromPaths = useMemo(() => new Set(connectors.map((c) => c.from!)), [connectors]);
  const connectorToPaths = useMemo(() => new Set(connectors.map((c) => c.to!)), [connectors]);

  // A row is dimmed when filters are active and this row's type isn't one of them.
  // "unchanged" rows dim along with everything else outside the active set —
  // that's the point of filtering: make the selected change types pop.
  const dimWhenFiltered = (change: DiffChange | undefined) => {
    if (activeFilters.size === 0) return false;
    if (!change) return true;
    return !activeFilters.has(change.type);
  };

  useLayoutEffect(() => {
    function measure() {
      const lane = laneRef.current;
      if (!lane) return;
      const laneRect = lane.getBoundingClientRect();
      const next: ConnectorPos[] = [];
      for (const c of connectors) {
        const leftEl = leftRefs.current.get(c.from!);
        const rightEl = rightRefs.current.get(c.to!);
        if (!leftEl || !rightEl) continue;
        const lRect = leftEl.getBoundingClientRect();
        const rRect = rightEl.getBoundingClientRect();
        next.push({
          id: c.id,
          y1: lRect.top + lRect.height / 2 - laneRect.top,
          y2: rRect.top + rRect.height / 2 - laneRect.top,
          colorVar: changeTypeMeta(c.type, t).colorVar,
          dashed: c.confidence < 0.85,
          confidence: c.confidence,
        });
      }
      setPositions(next);
    }

    measure();
    const ro = new ResizeObserver(measure);
    if (laneRef.current) ro.observe(laneRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectors, leftRows, rightRows, collapsedLeft, collapsedRight]);

  const laneHeight = positions.reduce((m, p) => Math.max(m, p.y1, p.y2), 0) + 40;

  return (
    <div className="al-tree-view">
      <div className="al-tree-view__headers">
        <span className="al-tree-view__header">{t.inputVersionA}</span>
        <span className="al-tree-view__header al-tree-view__header--lane" />
        <span className="al-tree-view__header">{t.inputVersionB}</span>
      </div>
      <div className="al-tree-view__scroll">
        <div className="al-tree-view__flex">
          <div className="al-tree-view__col">
            {leftRows.map(({ node, hasChildren }) => {
              const change = leftChangeByPath.get(node.path);
              const isConnector = connectorFromPaths.has(node.path);
              return (
                <TreeRow
                  key={node.id}
                  node={node}
                  depth={node.depth}
                  hasChildren={hasChildren}
                  isCollapsed={collapsedLeft.has(node.path)}
                  onToggleCollapse={() =>
                    setCollapsedLeft((prev) => toggleSet(prev, node.path))
                  }
                  change={change}
                  isSelected={change?.id === selectedId}
                  onSelect={() => change && onSelect(change)}
                  isDimmed={dimWhenFiltered(change)}
                  isConnector={isConnector}
                  registerRef={
                    isConnector
                      ? (el) => {
                          if (el) leftRefs.current.set(node.path, el);
                          else leftRefs.current.delete(node.path);
                        }
                      : undefined
                  }
                />
              );
            })}
          </div>

          <div className="al-tree-view__lane" ref={laneRef} style={{ width: LANE_WIDTH, minHeight: Math.max(laneHeight, 1) }}>
            <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
              {positions.map((p) => {
                const midY = (p.y1 + p.y2) / 2;
                const showLabel = p.confidence < 0.97;
                return (
                  <g key={p.id} opacity={0.9}>
                    <path
                      d={`M 0,${p.y1} C ${LANE_WIDTH * 0.5},${p.y1} ${LANE_WIDTH * 0.5},${p.y2} ${LANE_WIDTH},${p.y2}`}
                      fill="none"
                      stroke={`var(${p.colorVar})`}
                      strokeWidth={1.4}
                      strokeDasharray={p.dashed ? "3 3" : undefined}
                    />
                    <circle cx={0} cy={p.y1} r={2.3} fill={`var(${p.colorVar})`} />
                    <circle cx={LANE_WIDTH} cy={p.y2} r={2.3} fill={`var(${p.colorVar})`} />
                    {showLabel && (
                      <text
                        x={LANE_WIDTH / 2}
                        y={midY - 4}
                        textAnchor="middle"
                        fontSize="9.5"
                        fontFamily="var(--font-mono)"
                        fill={`var(${p.colorVar})`}
                        stroke="var(--paper)"
                        strokeWidth={3}
                        paintOrder="stroke"
                      >
                        {Math.round(p.confidence * 100)}%
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="al-tree-view__col">
            {rightRows.map(({ node, hasChildren }) => {
              const change = rightChangeByPath.get(node.path);
              const isConnector = connectorToPaths.has(node.path);
              return (
                <TreeRow
                  key={node.id}
                  node={node}
                  depth={node.depth}
                  hasChildren={hasChildren}
                  isCollapsed={collapsedRight.has(node.path)}
                  onToggleCollapse={() =>
                    setCollapsedRight((prev) => toggleSet(prev, node.path))
                  }
                  change={change}
                  isSelected={change?.id === selectedId}
                  onSelect={() => change && onSelect(change)}
                  isDimmed={dimWhenFiltered(change)}
                  isConnector={isConnector}
                  registerRef={
                    isConnector
                      ? (el) => {
                          if (el) rightRefs.current.set(node.path, el);
                          else rightRefs.current.delete(node.path);
                        }
                      : undefined
                  }
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function toggleSet(set: Set<string>, value: string): Set<string> {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}
