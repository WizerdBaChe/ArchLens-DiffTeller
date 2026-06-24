/**
 * handoff.ts — 接收 ArchLens Web 的「送到 Diff 比較」（Phase 3 反孤島）。
 *
 * Web 端把 tree 信封寫進 localStorage 並帶 ?handoff=tree 開啟本站；這裡在啟動時
 * 同步讀取一次、清掉 localStorage 與網址參數（避免重新整理重複匯入），把信封字串
 * 交回給 App 注入到輸入端。系列產品正式部署同源（wizerdbache.github.io）故共用
 * localStorage；本機跨 port 不同源時讀不到，回報 "missing" 讓 UI 提示改用手動匯入。
 */

import { isTreeEnvelope } from "@/schema/archlensSchema";

/** 與 Web 端共用的 localStorage 鍵（兩邊一致）。 */
export const HANDOFF_KEY = "archlens:handoff";

export interface HandoffData {
  side: "left" | "right";
  json: string;
  count: number;
  name?: string;
}

export type HandoffOutcome =
  | ({ status: "loaded" } & HandoffData)
  | { status: "missing" }
  | null;

/**
 * 純函式：把 localStorage 取出的原始字串解碼成可注入的資料。無 window 依賴，可單測。
 * 無效（null / 壞 JSON / 非 tree 信封）一律回 null。
 */
export function decodeHandoff(raw: string | null): HandoffData | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as { side?: string; envelope?: unknown };
    if (!data?.envelope || !isTreeEnvelope(data.envelope)) return null;
    return {
      side: data.side === "left" ? "left" : "right",
      json: JSON.stringify(data.envelope, null, 2),
      count: data.envelope.payload.nodes.length,
      name: data.envelope.source?.name,
    };
  } catch {
    return null;
  }
}

/**
 * 純讀取（無副作用，可重複呼叫）：看網址是否帶 ?handoff=tree，並讀 localStorage。
 * 適合放進 React useState 的 lazy initializer（StrictMode 會重複呼叫 initializer，
 * 因此這裡刻意「不清理」——清理交給 clearHandoff 在 effect 裡做一次）。回傳：
 *  - `null`：沒有 ?handoff。
 *  - `{ status: "missing" }`：有 ?handoff 但無有效資料（提示手動匯入）。
 *  - `{ status: "loaded", ... }`：取得信封。
 */
export function peekHandoff(): HandoffOutcome {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  if (params.get("handoff") !== "tree") return null;

  let data: HandoffData | null = null;
  try {
    data = decodeHandoff(localStorage.getItem(HANDOFF_KEY));
  } catch {
    data = null;
  }
  return data ? { status: "loaded", ...data } : { status: "missing" };
}

/**
 * 清掉 localStorage 與網址的 ?handoff 參數，避免重新整理時重複匯入。
 * 有副作用、且冪等——放進 mount-once 的 useEffect（StrictMode 重跑也安全）。
 */
export function clearHandoff(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(HANDOFF_KEY);
  } catch {
    /* ignore */
  }
  const params = new URLSearchParams(window.location.search);
  if (!params.has("handoff")) return;
  params.delete("handoff");
  const q = params.toString();
  window.history.replaceState(null, "", window.location.pathname + (q ? `?${q}` : "") + window.location.hash);
}
