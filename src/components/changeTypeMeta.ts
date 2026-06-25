import type { ChangeType } from "@/types/tree";
import type { Locale } from "@/i18n/locales/en";

export interface ChangeTypeMeta {
  label: string;
  shortLabel: string;
  colorVar: string;
  dimVar: string;
  glyph: string;
}

/** Static colour/glyph data that never changes with locale. */
const CHANGE_TYPE_STATIC: Record<ChangeType, Omit<ChangeTypeMeta, 'label' | 'shortLabel'>> = {
  added:           { colorVar: "--added",     dimVar: "--added-dim",   glyph: "+" },
  removed:         { colorVar: "--removed",   dimVar: "--removed-dim", glyph: "−" },
  moved:           { colorVar: "--moved",     dimVar: "--moved-dim",   glyph: "⇄" },
  renamed:         { colorVar: "--renamed",   dimVar: "--renamed-dim", glyph: "✎" },
  "modified-meta": { colorVar: "--meta",      dimVar: "--meta-dim",    glyph: "≈" },
  unchanged:       { colorVar: "--unchanged", dimVar: "--unchanged",   glyph: "·" },
};

/** Returns full ChangeTypeMeta for a given type, with labels sourced from locale. */
export function changeTypeMeta(type: ChangeType, t: Locale): ChangeTypeMeta {
  const static_ = CHANGE_TYPE_STATIC[type];
  switch (type) {
    case "added":          return { ...static_, label: t.changeAdded,        shortLabel: t.changeAddedShort };
    case "removed":        return { ...static_, label: t.changeRemoved,      shortLabel: t.changeRemovedShort };
    case "moved":          return { ...static_, label: t.changeMoved,        shortLabel: t.changeMovedShort };
    case "renamed":        return { ...static_, label: t.changeRenamed,      shortLabel: t.changeRenamedShort };
    case "modified-meta":  return { ...static_, label: t.changeModifiedMeta, shortLabel: t.changeModifiedMetaShort };
    case "unchanged":      return { ...static_, label: t.changeUnchanged,    shortLabel: t.changeUnchangedShort };
  }
}

export const FILTERABLE_TYPES: ChangeType[] = ["added", "removed", "moved", "renamed", "modified-meta"];
