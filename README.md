# ArchLens Diff

**專案樹的結構差異工具 — 看出版本之間「增 / 刪 / 移動 / 改名」，而非逐行文字差異。**  
**A structural diff for project trees — see what was added / removed / moved / renamed between two versions, not line-by-line text diff.**

所有比對完全在瀏覽器中執行 — 你的檔案永遠不會離開你的電腦。  
Everything runs entirely in your browser — your files never leave your machine.

---

**語言 / Language:** 繁體中文 | [English](#english-version)

---

## 繁體中文

### 功能介紹

一般的文字 diff 只告訴你哪幾行變了。ArchLens Diff 看的是**結構**：給它兩份專案樹，它會分類兩版之間到底發生了什麼——

- **新增（added）** / **刪除（removed）**
- **移動（moved）** — 同一個檔案換了所在目錄
- **改名（renamed）** — 同一個目錄下檔名改變
- **改了 meta（modified-meta）** — 大小寫 / 副檔名 / 類型變動

移動與改名是用**相似度啟發式**比對出來的：每一筆都帶有信心度（0–1）與人類可讀的判定理由，信心低於門檻會被標為警告——沒有任何判定是靜默發生的。

這是 [ArchLens 系列](../AGENTS.md) 的 `compare`（比較）階段：它**消費** `tree`、**產生** `diff`。

無需帳號。無需伺服器。無需上傳。100% 瀏覽器端。

---

### 使用方式

```
npm install
npm run dev        # http://localhost:5173
npm test           # 核心引擎單元測試（vitest）
npm run build      # 生產建置 → dist/
npm run typecheck  # tsc --noEmit
```

貼上 / 載入**兩份**專案樹（舊版、新版），自動偵測格式並比對。支援兩種輸入格式：

1. **縮排文字樹** — 純縮排（目錄帶結尾 `/`），或 `tree` 指令的 `├──` / `└──` / `│` 輸出。
2. **正規化 JSON** — `{ "nodes": [{ "path": "src/app.ts", "type": "file" }] }`（系列共用的 `tree` payload 基準）。

---

### 分類規則

| 類型 | 規則 |
|---|---|
| `unchanged` | 兩側 path 與類型都相同 |
| `modified-meta` | 同 path 不同類型；或忽略大小寫相同、大小寫不同 |
| `renamed` | 同一父目錄，檔名相似度 ≥ 門檻（或內容雜湊相同） |
| `moved` | 不同父目錄，檔名相似度 ≥ 門檻（或內容雜湊相同） |
| `added` / `removed` | 在另一側找不到合理對應 |

---

### 設計方向

對象是「正在 review 結構差異」的工程師，所以視覺語言是字面意義的**建築藍圖**——藍圖底色上的白色線稿。招牌元素是兩棵樹之間的「尺寸線」連接道：被判定為移動 / 改名的節點，會以製圖風格的引線連起來並標上信心度百分比，信心低時改為虛線。

---

### 隱私

所有比對均在你的瀏覽器中執行。任何檔案內容或比對結果都不會送往任何伺服器。

---

### 開發者 & 貢獻者

完整架構（層級邊界、分類規則、相似度啟發式的設計理由）與擴充點，請參閱 [DEV_README.md](DEV_README.md)。

---

## English Version

### What It Does

A normal text diff only tells you which lines changed. ArchLens Diff looks at
**structure**: give it two project trees and it classifies what actually happened
between the two versions —

- **added** / **removed**
- **moved** — same file, different directory
- **renamed** — same directory, changed filename
- **modified-meta** — case / extension / type changes

Moved and renamed nodes are matched with a **similarity heuristic**: every match
carries a confidence (0–1) and a human-readable reason, and anything below the
threshold is flagged as a warning — nothing is asserted silently.

This is the `compare` stage of the [ArchLens suite](../AGENTS.md): it **consumes**
a `tree` and **produces** a `diff`.

No account needed. No server. No upload. 100% browser-side.

---

### How to Use

```
npm install
npm run dev        # http://localhost:5173
npm test           # core engine unit tests (vitest)
npm run build      # production build → dist/
npm run typecheck  # tsc --noEmit
```

Paste / load **two** project trees (old, new); the format is auto-detected and
diffed. Two input formats are supported:

1. **Indented text tree** — plain indentation (directories end with `/`), or raw
   `tree`-command output with `├──` / `└──` / `│` glyphs.
2. **Normalized JSON** — `{ "nodes": [{ "path": "src/app.ts", "type": "file" }] }`
   (the suite's shared `tree` payload baseline).

---

### Classification Rules

| Type | Rule |
|---|---|
| `unchanged` | Identical path and kind on both sides |
| `modified-meta` | Same path, different kind; or same path case-insensitively, different case |
| `renamed` | Same parent directory, filename similarity ≥ threshold (or identical content hash) |
| `moved` | Different parent directory, filename similarity ≥ threshold (or identical content hash) |
| `added` / `removed` | No plausible match found on the other side |

---

### Design Direction

The audience is engineers reviewing a structural diff, so the visual language is
a literal architectural **blueprint** — white linework on blueprint-blue paper.
The signature element is the dimension-line connector lane between the two trees:
matched moved/renamed nodes get a drafting-style leader line with confidence-
percentage labels, dashed when confidence is low.

---

### Privacy

All diffing happens in your browser. No file content or diff result is ever sent
to any server.

---

### For Developers & Contributors

See [DEV_README.md](DEV_README.md) for the full architecture (layer boundaries,
classification rules, the matching heuristic rationale) and extension points.
