# ArchLens Diff — Developer Guide

Developer-facing notes: dev workflow, test layout, and the seams to extend. The
deep architectural rationale (layer boundaries, classification rules, the
matching heuristic) already lives in [README.md](README.md) — this file does not
repeat it; it covers *how to work on the code*.

## Local development

```bash
npm install
npm run dev        # vite dev server, http://localhost:5173
npm test           # vitest run — core engine + export + handoff unit tests
npm run typecheck  # tsc --noEmit
npm run build      # tsc -b + vite build → dist/
npm run preview    # serve the production build
```

Stack: React 19 + TypeScript + Vite, vitest for tests, @fontsource for the
self-hosted fonts. No backend.

## Layer boundary (the rule to keep)

**`components/` depend on `core/`; `core/` never depends on `components/`.** The
diff algorithm is pure and React-free, so it is unit-tested directly. Tests live
next to the code they cover:

```
src/core/parser/parser.test.ts        format detection + text/JSON parsing
src/core/diff/diffEngine.test.ts      asserts against the RPD's worked example (fixtures/rpdExample.ts)
src/core/export/exportDiff.test.ts    DiffResult → json/csv/md
src/handoff.test.ts                   inbound tree handoff from sibling products
```

## Where to extend

These are the intended single-file seams (see README for the full reasoning):

- **New input format** → add a `TreeParser` implementation under
  `src/core/parser/` and register it in `src/core/parser/index.ts`. Nothing else
  changes. (Existing: `textTreeParser`, `jsonTreeParser`, `archlensTreeParser`.)
- **Tune rename/move detection** → isolated to `src/core/diff/classifier.ts` and
  `similarity.ts`; the pass ordering in `diffEngine.ts` doesn't know *how*
  matches are scored.
- **New export format** → add next to `src/core/export/exportDiff.ts`.
- **Per-change-type color/label/glyph** → centralized in
  `src/components/changeTypeMeta.ts`; components never re-decide a color.
- **Swap the renderer** (e.g. virtualization) → only touches
  `src/components/TreeView/`; the `DiffResult` contract stays put.

## Theming

UI consumes the shared `@archlens/tokens` `--al-*` roles plus a local
`src/styles/tokens.css` for diff-domain colors. The suite default is **Blueprint**
(`<html class="al-theme-blueprint">`); the in-app `ThemeSwitcher` offers
Blueprint / Hacker (Light was removed suite-wide). To retune shared colors,
change the theme pack in `@archlens/tokens`, not this repo.

## Data contract

Diff **consumes** the suite's `tree` envelope and **produces** a `diff` envelope.
See [README.md](README.md#input-formats) and the suite-level
[`AGENTS.md`](../AGENTS.md) (Layer B).
