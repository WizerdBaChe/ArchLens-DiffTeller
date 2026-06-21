import { useCallback, useRef, useState } from "react";
import type { ParseError } from "@/types/tree";
import "./InputPanel.css";

const MIN_HEIGHT = 110;
const MAX_HEIGHT = 520;
const DEFAULT_HEIGHT = 150;

interface SideInputProps {
  label: string;
  caption: string;
  value: string;
  onChange: (v: string) => void;
  errors: ParseError[];
  placeholder: string;
  height: number;
}

function SideInput({ label, caption, value, onChange, errors, placeholder, height }: SideInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result ?? ""));
    reader.readAsText(file);
  };

  return (
    <div className="al-input-side">
      <div className="al-input-side__head">
        <span className="al-input-side__label">{label}</span>
        <span className="al-input-side__caption">{caption}</span>
        <button type="button" className="al-input-side__load" onClick={() => fileInputRef.current?.click()}>
          Load file…
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.json,.md"
          className="al-input-side__file"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
      </div>
      <textarea
        className="al-input-side__textarea"
        style={{ height }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        spellCheck={false}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        onDragOver={(e) => e.preventDefault()}
      />
      {errors.length > 0 && (
        <ul className="al-input-side__errors" role="alert">
          {errors.slice(0, 4).map((err, i) => (
            <li key={i}>
              {err.line ? `Line ${err.line}: ` : ""}
              {err.message}
            </li>
          ))}
          {errors.length > 4 && <li>…and {errors.length - 4} more</li>}
        </ul>
      )}
    </div>
  );
}

const SAMPLE_LEFT = `src/
  app.ts
  lib/
    api.ts
  utils/
    format.ts
    legacy-helpers.ts
README.md`;

const SAMPLE_RIGHT = `src/
  core/
    app.ts
  lib/
    api.ts
    api-client.ts
  utils/
    formatting.ts
README.md
CHANGELOG.md`;

interface InputPanelProps {
  leftSource: string;
  rightSource: string;
  onLeftChange: (v: string) => void;
  onRightChange: (v: string) => void;
  leftErrors: ParseError[];
  rightErrors: ParseError[];
  leftCount: number;
  rightCount: number;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

export function InputPanel({
  leftSource,
  rightSource,
  onLeftChange,
  onRightChange,
  leftErrors,
  rightErrors,
  leftCount,
  rightCount,
  collapsed,
  onToggleCollapsed,
}: InputPanelProps) {
  const [height, setHeight] = useState(DEFAULT_HEIGHT);
  const dragState = useRef<{ startY: number; startHeight: number } | null>(null);

  const onDragMove = useCallback((e: MouseEvent) => {
    if (!dragState.current) return;
    const delta = e.clientY - dragState.current.startY;
    const next = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, dragState.current.startHeight + delta));
    setHeight(next);
  }, []);

  const onDragEnd = useCallback(() => {
    dragState.current = null;
    window.removeEventListener("mousemove", onDragMove);
    window.removeEventListener("mouseup", onDragEnd);
    document.body.style.cursor = "";
  }, [onDragMove]);

  const onDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    dragState.current = { startY: e.clientY, startHeight: height };
    window.addEventListener("mousemove", onDragMove);
    window.addEventListener("mouseup", onDragEnd);
    document.body.style.cursor = "row-resize";
  };

  if (collapsed) {
    return (
      <div className="al-input-panel al-input-panel--collapsed">
        <span className="al-input-panel__status">
          <span className="al-input-panel__status-dot" /> Version A loaded — {leftCount} nodes
        </span>
        <span className="al-input-panel__status">
          <span className="al-input-panel__status-dot" /> Version B loaded — {rightCount} nodes
        </span>
        <button type="button" className="al-input-panel__expand" onClick={onToggleCollapsed}>
          Expand project structure ▾
        </button>
      </div>
    );
  }

  return (
    <div className="al-input-panel">
      <div className="al-input-panel__grid">
        <SideInput
          label="Version A"
          caption="before"
          value={leftSource}
          onChange={onLeftChange}
          errors={leftErrors}
          placeholder={"Paste an indented tree or tree-command output…\n\nsrc/\n  app.ts\n  lib/\n    api.ts"}
          height={height}
        />
        <SideInput
          label="Version B"
          caption="after"
          value={rightSource}
          onChange={onRightChange}
          errors={rightErrors}
          placeholder={"Paste the version to compare against…\n\nsrc/\n  core/\n    app.ts\n  lib/\n    api.ts"}
          height={height}
        />
      </div>

      <div
        className="al-input-panel__resize-handle"
        onMouseDown={onDragStart}
        role="separator"
        aria-orientation="horizontal"
        aria-label="Resize input area"
        title="Drag to resize both panels together"
      >
        <span className="al-input-panel__resize-grip" />
      </div>

      <div className="al-input-panel__footer">
        <button
          type="button"
          className="al-input-panel__sample"
          onClick={() => {
            onLeftChange(SAMPLE_LEFT);
            onRightChange(SAMPLE_RIGHT);
          }}
        >
          Try a sample diff
        </button>
        {leftCount > 0 || rightCount > 0 ? (
          <button type="button" className="al-input-panel__collapse" onClick={onToggleCollapsed}>
            Collapse ▴
          </button>
        ) : null}
      </div>
    </div>
  );
}
