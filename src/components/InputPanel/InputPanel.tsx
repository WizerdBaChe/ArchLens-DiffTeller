import { useRef } from "react";
import type { ParseError } from "@/types/tree";
import "./InputPanel.css";

interface SideInputProps {
  label: string;
  caption: string;
  value: string;
  onChange: (v: string) => void;
  errors: ParseError[];
  placeholder: string;
}

function SideInput({ label, caption, value, onChange, errors, placeholder }: SideInputProps) {
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
        <button
          type="button"
          className="al-input-side__load"
          onClick={() => fileInputRef.current?.click()}
        >
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
}

export function InputPanel({
  leftSource,
  rightSource,
  onLeftChange,
  onRightChange,
  leftErrors,
  rightErrors,
}: InputPanelProps) {
  return (
    <div className="al-input-panel">
      <SideInput
        label="Version A"
        caption="before"
        value={leftSource}
        onChange={onLeftChange}
        errors={leftErrors}
        placeholder={"Paste an indented tree or tree-command output…\n\nsrc/\n  app.ts\n  lib/\n    api.ts"}
      />
      <SideInput
        label="Version B"
        caption="after"
        value={rightSource}
        onChange={onRightChange}
        errors={rightErrors}
        placeholder={"Paste the version to compare against…\n\nsrc/\n  core/\n    app.ts\n  lib/\n    api.ts"}
      />
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
    </div>
  );
}
