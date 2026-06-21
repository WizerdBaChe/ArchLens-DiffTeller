import { CHANGE_TYPE_META } from "../changeTypeMeta";
import "./Legend.css";

const LEGEND_TYPES = ["moved", "renamed", "modified-meta"] as const;

export function Legend() {
  return (
    <div className="al-legend" aria-label="Connector legend">
      {LEGEND_TYPES.map((type) => {
        const meta = CHANGE_TYPE_META[type];
        return (
          <span className="al-legend__item" key={type}>
            <svg width="22" height="10" viewBox="0 0 22 10" aria-hidden="true">
              <line
                x1="0"
                y1="5"
                x2="22"
                y2="5"
                stroke={`var(${meta.colorVar})`}
                strokeWidth="1.5"
                strokeDasharray={type === "modified-meta" ? "3 2" : undefined}
              />
              <circle cx="1.5" cy="5" r="1.5" fill={`var(${meta.colorVar})`} />
              <circle cx="20.5" cy="5" r="1.5" fill={`var(${meta.colorVar})`} />
            </svg>
            {meta.label}
          </span>
        );
      })}
      <span className="al-legend__item al-legend__item--note">dashed = lower-confidence guess</span>
    </div>
  );
}
