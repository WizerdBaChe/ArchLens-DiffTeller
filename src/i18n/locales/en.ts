export interface Locale {
  // Header
  tagline: string
  langSwitcherAria: string

  // Section eyebrows
  sectionStructure: string
  sectionSummary: string
  sectionDiff: string

  // Empty state
  emptyHint: string

  // Handoff banner
  handoffLoaded: (count: number, name: string | null, side: 'left' | 'right') => string
  handoffWarn: string
  handoffDismiss: string

  // InputPanel
  inputLoadFile: string
  inputVersionA: string
  inputCaptionA: string
  inputVersionB: string
  inputCaptionB: string
  inputPlaceholderA: string
  inputPlaceholderB: string
  inputResizeAria: string
  inputResizeTitle: string
  inputTrySample: string
  inputDoneCollapse: string
  inputEditExpand: string
  inputStatusLoaded: (count: number) => string
  inputLinePrefix: (line: number) => string
  inputMoreErrors: (count: number) => string

  // Toolbar
  toolbarLegend: string
  toolbarLegendAria: string
  toolbarWarnings: (count: number) => string
  toolbarCopyExport: string
  toolbarExportTitle: string
  toolbarExportMenuTitle: string
  toolbarClearWorkspace: string
  toolbarCopy: string
  toolbarCopied: string
  toolbarDownload: string

  // Export formats
  exportJson: string
  exportCsv: string
  exportMd: string
  exportAiPrompt: string
  exportAiPromptHint: string
  exportWorksheet: string
  exportWorksheetHint: string

  // FilterBar
  filterAll: string
  filterAria: string

  // SummaryBar
  summaryAdded: string
  summaryRemoved: string
  summaryMoved: string
  summaryRenamed: string
  summaryModifiedMeta: string
  summaryUnchanged: string

  // ChangeType labels
  changeAdded: string
  changeAddedShort: string
  changeRemoved: string
  changeRemovedShort: string
  changeMoved: string
  changeMovedShort: string
  changeRenamed: string
  changeRenamedShort: string
  changeModifiedMeta: string
  changeModifiedMetaShort: string
  changeUnchanged: string
  changeUnchangedShort: string

  // Legend
  legendNote: string
  legendAria: string
  legendConnectorAria: string

  // DetailPanel
  detailClose: string
  detailCopy: string
  detailCopied: string
  detailFrom: string
  detailTo: string
  detailKind: string
  detailConfidence: string
  detailWhy: string
  detailAria: string
}

const en: Locale = {
  // Header
  tagline: 'Read the structure that changed, not the lines that moved.',
  langSwitcherAria: 'Switch language',

  // Section eyebrows
  sectionStructure: '01 — Project structure',
  sectionSummary: '02 — Change summary',
  sectionDiff: '03 — Diff visualization',

  // Empty state
  emptyHint: 'Paste both versions above, or load the sample, to see what moved.',

  // Handoff banner
  handoffLoaded: (count, name, side) =>
    `Imported ${count} node${count !== 1 ? 's' : ''} from ArchLens Web${name ? ` (${name})` : ''} to the ${side === 'left' ? 'left' : 'right'} side — paste the version to compare on the other side.`,
  handoffWarn: 'Received a comparison request from Web, but no data could be auto-imported (cross-origin restriction or structure too large for localStorage — a JSON was downloaded instead). Paste or upload it manually above.',
  handoffDismiss: 'Dismiss',

  // InputPanel
  inputLoadFile: 'Load file…',
  inputVersionA: 'Version A',
  inputCaptionA: 'before',
  inputVersionB: 'Version B',
  inputCaptionB: 'after',
  inputPlaceholderA: 'Paste an indented tree or tree-command output…\n\nsrc/\n  app.ts\n  lib/\n    api.ts',
  inputPlaceholderB: 'Paste the version to compare against…\n\nsrc/\n  core/\n    app.ts\n  lib/\n    api.ts',
  inputResizeAria: 'Resize input area',
  inputResizeTitle: 'Drag to resize both panels together',
  inputTrySample: 'Try a sample diff',
  inputDoneCollapse: 'Done editing — collapse',
  inputEditExpand: 'Edit project structure',
  inputStatusLoaded: (count) => `Version loaded — ${count} nodes`,
  inputLinePrefix: (line) => `Line ${line}: `,
  inputMoreErrors: (count) => `…and ${count} more`,

  // Toolbar
  toolbarLegend: 'Legend',
  toolbarLegendAria: 'Show connector legend',
  toolbarWarnings: (count) => `⚠ ${count} low-confidence match${count > 1 ? 'es' : ''}`,
  toolbarCopyExport: 'Copy / Export ▾',
  toolbarExportTitle: 'Copy or download this diff — for a PR, a changelog, or an AI',
  toolbarExportMenuTitle: 'Get this diff out — for a PR, a changelog, or an AI',
  toolbarClearWorkspace: 'Clear workspace',
  toolbarCopy: 'Copy',
  toolbarCopied: 'Copied ✓',
  toolbarDownload: 'Download',

  // Export formats
  exportJson: 'JSON',
  exportCsv: 'CSV',
  exportMd: 'Markdown report',
  exportAiPrompt: 'Copy for AI',
  exportAiPromptHint: 'The diff JSON with a short field legend in front — paste straight into a chat AI.',
  exportWorksheet: 'Migration worksheet',
  exportWorksheetHint: 'A review checklist for moved/renamed items. Not an executable script — for you (or an AI) to confirm before anything is applied.',

  // FilterBar
  filterAll: 'All',
  filterAria: 'Filter by change type',

  // SummaryBar
  summaryAdded: 'Added',
  summaryRemoved: 'Removed',
  summaryMoved: 'Moved',
  summaryRenamed: 'Renamed',
  summaryModifiedMeta: 'Modified (metadata)',
  summaryUnchanged: 'Unchanged',

  // ChangeType labels
  changeAdded: 'Added',
  changeAddedShort: 'Added',
  changeRemoved: 'Removed',
  changeRemovedShort: 'Removed',
  changeMoved: 'Moved',
  changeMovedShort: 'Moved',
  changeRenamed: 'Renamed',
  changeRenamedShort: 'Renamed',
  changeModifiedMeta: 'Modified (metadata)',
  changeModifiedMetaShort: 'Meta',
  changeUnchanged: 'Unchanged',
  changeUnchangedShort: 'Unchanged',

  // Legend
  legendNote: 'dashed = lower-confidence guess',
  legendAria: 'Connector legend',
  legendConnectorAria: 'Connector legend',

  // DetailPanel
  detailClose: 'Close detail panel',
  detailCopy: 'Copy',
  detailCopied: 'Copied ✓',
  detailFrom: 'From',
  detailTo: 'To',
  detailKind: 'Kind',
  detailConfidence: 'Confidence',
  detailWhy: 'Why',
  detailAria: 'Change detail',
}

export default en
