# ArchLens Diff

A structural diff tool for project trees. Instead of line-by-line text diff, it
classifies what happened between two versions of a tree: **added, removed,
moved, renamed,** or **modified-meta** (case/extension/type changes) — per the
[product blueprint](#) this was built from.

```
npm install
npm run dev        # http://localhost:5173
npm test           # core engine unit tests
npm run build      # production build → dist/
npm run typecheck  # tsc --noEmit
```

## Why it's structured this way

The codebase is split into three layers with a strict dependency direction —
**components depend on core, core never depends on components**:

```
src/
  types/tree.ts          ← shared contracts. Zero dependencies. Everything else
                            depends inward on this; it depends on nothing.
  core/                   ← pure functions, no React, fully unit-testable
    parser/               · text-tree and JSON parsers, behind a TreeParser
                             interface (strategy pattern: new format = new file
                             + one registry line, nothing else changes)
    normalize/             · RawNode[] → NormalizedTree, synthesizes missing
                             ancestor directories, builds/flattens hierarchy
    diff/                  · diffEngine (pass ordering) + classifier (single-
                             pair scoring) + similarity (string metric) — each
                             piece is independently swappable
    export/                · DiffResult → json/csv/md strings, no DOM/file APIs
  hooks/
    useDiffPipeline.ts    ← the ONLY seam between core and React. Components
                             never import parser/diff/normalize directly.
  components/             ← presentational, each owns its own .css + concerns
```

This means:
- **The diff algorithm is tested without React** (`core/diff/diffEngine.test.ts`
  asserts against the RPD's own worked example — `src/app.ts` moving into
  `src/core/app.ts`).
- **Adding an input format** (e.g. a zip manifest, `git ls-tree` output) means
  writing one new file implementing `TreeParser` and adding it to the registry
  in `core/parser/index.ts` — no other file changes.
- **Tuning the rename/move heuristic** is isolated to `classifier.ts`; the
  engine's pass ordering (exact match → case-only → heuristic match → leftover
  add/remove) lives separately in `diffEngine.ts` and doesn't know *how*
  matches are scored, only that they are.
- **Swapping the renderer** (e.g. virtualizing the tree for huge projects)
  only touches `components/`; the data contract (`DiffResult`) stays put.

## Input formats

Two formats are auto-detected on paste (`core/parser/detectFormat`):

1. **Indented text tree** — either plain indentation with trailing `/` on
   directories, or raw `tree`-command output with `├──`/`└──`/`│` glyphs.
   Directories are inferred structurally (anything with children is a
   directory) *and* from the trailing slash, so both conventions work even
   without `tree -F`.
2. **Normalized JSON** — `{ "nodes": [{ "path": "src/app.ts", "type": "file" }] }`
   per the RPD's input-mode B. Missing ancestor directories are synthesized
   automatically during normalization.

(Zip-snapshot input, mode C in the RPD, is intentionally deferred — see
Known limitations below.)

## Classification rules

| Type | Rule |
|---|---|
| `unchanged` | Identical path and kind on both sides |
| `modified-meta` | Same path, different kind; or same path case-insensitively, different case |
| `renamed` | Same parent directory, filename similarity ≥ threshold (or identical content hash) |
| `moved` | Different parent directory, filename similarity ≥ threshold (or identical content hash) |
| `added` / `removed` | No plausible match found on the other side |

Matching for renamed/moved is a **greedy best-score-first assignment** across
all same-kind left/right candidates — an O(n·m log(n·m)) approximation of
optimal bipartite matching, which is the right MVP trade-off per the RPD's
quality-over-speed ranking without needing a full assignment-problem solver.
Every heuristic match carries a `confidence` (0–1) and a human-readable
`reason`, surfaced in the detail panel and flagged as a warning below 75%
confidence — this directly answers the RPD's biggest stated risk ("heuristic
判定讓使用者不信任"): nothing is asserted silently.

## Design direction

Audience is engineers reviewing a structural diff, so the visual language is
literal architectural blueprint — white linework on blueprint-blue paper,
rather than the cream/serif, near-black/neon, or hairline-broadsheet defaults.
The signature element is the dimension-line connector lane between the two
trees: matched moved/renamed nodes get a drafting-style leader line with
confidence-percentage labels, dashed when confidence is low. Tokens live in
`src/styles/tokens.css`; per-type color/label/glyph metadata is centralized in
`src/components/changeTypeMeta.ts` so no component re-decides a color.

## Known limitations / next steps

- **Matching is greedy, not globally optimal.** Pathological inputs (many
  near-identical filenames) can produce a locally-good but globally
  suboptimal assignment. Acceptable for MVP; a true min-cost bipartite match
  is the natural upgrade if this becomes a problem in practice.
- **No zip/git-snapshot input yet** (RPD input mode C) — would need a
  small unzip + path-list extraction step, deliberately deferred to keep
  the MVP backend-free per the RPD's technical preferences.
- **No virtualization.** Trees rendering thousands of rows will be slow;
  `react-window` or similar would slot into `components/TreeView` without
  touching `core/`.
- **Directory-level moved/renamed don't visually "absorb" their descendants
  in the summary** — a moved folder produces one `moved` entry for the
  folder and separate `unchanged` entries for everything inside it, since
  diffing happens on the flat node list. This matches the RPD's literal
  taxonomy but a future pass could roll up "folder X moved, N children
  came with it" as a single summary line.
