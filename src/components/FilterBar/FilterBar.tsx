import type { ChangeType } from "@/types/tree";
import { CHANGE_TYPE_META, FILTERABLE_TYPES } from "../changeTypeMeta";
import "./FilterBar.css";

interface FilterBarProps {
  active: ReadonlySet<ChangeType>;
  onToggle: (type: ChangeType) => void;
  onReset: () => void;
}

export function FilterBar({ active, onToggle, onReset }: FilterBarProps) {
  const allActive = active.size === 0;
  return (
    <div className="al-filter-bar" role="group" aria-label="Filter by change type">
      <button
        type="button"
        className={`al-filter-chip ${allActive ? "al-filter-chip--on" : ""}`}
        onClick={onReset}
        aria-pressed={allActive}
      >
        All
      </button>
      {FILTERABLE_TYPES.map((type) => {
        const meta = CHANGE_TYPE_META[type];
        const isOn = active.has(type);
        return (
          <button
            key={type}
            type="button"
            className={`al-filter-chip ${isOn ? "al-filter-chip--on" : ""}`}
            style={isOn ? { borderColor: `var(${meta.colorVar})`, color: `var(${meta.colorVar})` } : undefined}
            onClick={() => onToggle(type)}
            aria-pressed={isOn}
          >
            {meta.shortLabel}
          </button>
        );
      })}
    </div>
  );
}
