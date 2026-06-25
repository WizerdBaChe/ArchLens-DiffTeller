import type { ChangeType } from "@/types/tree";
import { useLocale } from "@/i18n";
import { FILTERABLE_TYPES, changeTypeMeta } from "../changeTypeMeta";
import "./FilterBar.css";

interface FilterBarProps {
  active: ReadonlySet<ChangeType>;
  onToggle: (type: ChangeType) => void;
  onReset: () => void;
}

export function FilterBar({ active, onToggle, onReset }: FilterBarProps) {
  const { t } = useLocale();
  const allActive = active.size === 0;
  return (
    <div className="al-filter-bar" role="group" aria-label={t.filterAria}>
      <button
        type="button"
        className={`al-filter-chip ${allActive ? "al-filter-chip--on" : ""}`}
        onClick={onReset}
        aria-pressed={allActive}
      >
        {t.filterAll}
      </button>
      {FILTERABLE_TYPES.map((type) => {
        const meta = changeTypeMeta(type, t);
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
