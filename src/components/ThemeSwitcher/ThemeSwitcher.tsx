import { useState } from "react";

/**
 * 主題切換器（Phase 4 / @archlens/tokens 試點）。
 * 切換掛在 <html> 的 .al-theme-* class，共用 token 與本地 diff-domain 顏色一起換色。
 * 選擇記在 localStorage；index.html 有 no-flash 初始化腳本先行套用同一個值。
 */

const THEMES = [
  { id: "blueprint", label: "Blueprint" },
  { id: "light", label: "Light" },
  { id: "hacker", label: "Hacker" },
] as const;

type ThemeId = (typeof THEMES)[number]["id"];

const STORAGE_KEY = "archlens:diff-theme";
const CLASSES = THEMES.map((t) => `al-theme-${t.id}`);

function readTheme(): ThemeId {
  try {
    const t = localStorage.getItem(STORAGE_KEY);
    if (t === "blueprint" || t === "light" || t === "hacker") return t;
  } catch {
    /* ignore */
  }
  return "blueprint";
}

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<ThemeId>(readTheme);

  const apply = (next: ThemeId) => {
    const el = document.documentElement;
    el.classList.remove(...CLASSES);
    el.classList.add(`al-theme-${next}`);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    setTheme(next);
  };

  return (
    <div className="al-theme-switch" role="group" aria-label="Theme">
      {THEMES.map((t) => (
        <button
          key={t.id}
          type="button"
          className={`al-theme-switch__btn${theme === t.id ? " is-active" : ""}`}
          aria-pressed={theme === t.id}
          onClick={() => apply(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
