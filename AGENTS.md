# ArchLens Diff — 產品層 AI 指引

本檔是 **ArchLens 系列** 的一員。系列層指引（mission、痛點↔產品對照表、共用 schema、scope 慣例）在上層
[`../AGENTS.md`](../AGENTS.md)，AI session 會自動一併繼承。**先讀那份。**

## 本產品負責（`[product:diff]`，stage: compare）

兩份專案樹之間的**結構差異**分類：新增 / 刪除 / 移動 / 改名 / modified-meta。輸出 `diff`。
核心是 React-free 的純函式引擎；新增輸入格式 = 在 `src/core/parser/index.ts` 的 registry 加一個 `TreeParser`。

## 不屬於本產品的需求 → 請指向姊妹產品

- import / 依賴關係 / 耦合 / 循環依賴 → **dependency**（`ArchLens-DependencyTeller/`）。**不要**把 import 分析加進本產品。
- 純目錄樹 / 餵 AI 的 context → **web**（`ArchLens-Web/`）。
- 文件與程式碼對不上 → **docsgap**（`ArchLens-DocsGapTeller/`）。

## 資料契約

本產品已支援 `{ "nodes": [{ "path", "type" }] }` 作為輸入，正是系列共用 `tree` payload 的基準。
新增吃系列信封 `{ "archlens": "1.0", "kind": "tree", ... }` 的 parser 時，照 registry 模式加一個檔即可，
不動其他檔。輸出包進共用信封 `kind: "diff"`（見系列層 AGENTS.md 的 Layer B）。
