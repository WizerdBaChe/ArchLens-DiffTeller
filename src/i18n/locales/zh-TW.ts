import type { Locale } from './en'

const zhTW: Locale = {
  // Header
  tagline: '讀懂結構的變化，而不只是移動的行號。',
  langSwitcherAria: '切換語言',

  // Section eyebrows
  sectionStructure: '01 — 專案結構',
  sectionSummary: '02 — 變更摘要',
  sectionDiff: '03 — Diff 視覺化',

  // Empty state
  emptyHint: '在上方貼上兩個版本，或載入範例，即可看到哪些東西移動了。',

  // Handoff banner
  handoffLoaded: (count, name, side) =>
    `已從 ArchLens Web 匯入 ${count} 個節點${name ? `（${name}）` : ''}到${side === 'left' ? '左' : '右'}側 —— 請在另一側貼上要比較的版本。`,
  handoffWarn: '收到 Web 的比較請求，但沒有可自動帶入的資料（跨來源不共享，或結構過大已改為下載）。請改用上方手動貼上 / 匯入 —— 若剛下載了 JSON，直接上傳即可。',
  handoffDismiss: '關閉',

  // InputPanel
  inputLoadFile: '載入檔案…',
  inputVersionA: '版本 A',
  inputCaptionA: '修改前',
  inputVersionB: '版本 B',
  inputCaptionB: '修改後',
  inputPlaceholderA: '貼上縮排目錄樹或 tree 指令輸出…\n\nsrc/\n  app.ts\n  lib/\n    api.ts',
  inputPlaceholderB: '貼上要比較的版本…\n\nsrc/\n  core/\n    app.ts\n  lib/\n    api.ts',
  inputResizeAria: '調整輸入區域高度',
  inputResizeTitle: '拖曳以同時調整兩個面板的高度',
  inputTrySample: '試用範例 diff',
  inputDoneCollapse: '完成編輯 — 收起',
  inputEditExpand: '編輯專案結構',
  inputStatusLoaded: (count) => `版本已載入 — ${count} 個節點`,
  inputLinePrefix: (line) => `第 ${line} 行：`,
  inputMoreErrors: (count) => `…還有 ${count} 個`,

  // Toolbar
  toolbarLegend: '圖例',
  toolbarLegendAria: '顯示連接線圖例',
  toolbarWarnings: (count) => `⚠ ${count} 個低信心比對`,
  toolbarCopyExport: '複製 / 匯出 ▾',
  toolbarExportTitle: '複製或下載此 diff —— 用於 PR、changelog 或 AI',
  toolbarExportMenuTitle: '匯出此 diff —— 用於 PR、changelog 或 AI',
  toolbarClearWorkspace: '清除工作區',
  toolbarCopy: '複製',
  toolbarCopied: '已複製 ✓',
  toolbarDownload: '下載',

  // Export formats
  exportJson: 'JSON',
  exportCsv: 'CSV',
  exportMd: 'Markdown 報告',
  exportAiPrompt: '複製給 AI',
  exportAiPromptHint: 'diff JSON 加上簡短欄位說明 —— 直接貼入 AI 對話框。',
  exportWorksheet: '遷移工作表',
  exportWorksheetHint: '移動 / 改名項目的確認清單。不是可執行腳本 —— 供你（或 AI）在實際操作前逐一確認。',

  // FilterBar
  filterAll: '全部',
  filterAria: '依變更類型篩選',

  // SummaryBar
  summaryAdded: '新增',
  summaryRemoved: '刪除',
  summaryMoved: '移動',
  summaryRenamed: '改名',
  summaryModifiedMeta: '元資料修改',
  summaryUnchanged: '未變更',

  // ChangeType labels
  changeAdded: '新增',
  changeAddedShort: '新增',
  changeRemoved: '刪除',
  changeRemovedShort: '刪除',
  changeMoved: '移動',
  changeMovedShort: '移動',
  changeRenamed: '改名',
  changeRenamedShort: '改名',
  changeModifiedMeta: '元資料修改',
  changeModifiedMetaShort: '元資料',
  changeUnchanged: '未變更',
  changeUnchangedShort: '未變更',

  // Legend
  legendNote: '虛線 = 較低信心的比對',
  legendAria: '連接線圖例',
  legendConnectorAria: '連接線圖例',

  // DetailPanel
  detailClose: '關閉詳情面板',
  detailCopy: '複製',
  detailCopied: '已複製 ✓',
  detailFrom: '來自',
  detailTo: '到',
  detailKind: '類型',
  detailConfidence: '信心度',
  detailWhy: '原因',
  detailAria: '變更詳情',
}

export default zhTW
