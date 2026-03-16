# KPI Analysis Tool v2.2.0 — Feature Catalog, Test Cases & Bug Report

**Author:** Shiju Abraham | **Date:** 2026-03-08 | **Version:** 2.2.0

---

## 1. COMPLETE FEATURE CATALOG

### 1.1 Frontend Features (KPI-Analysis-Tool.html)

| ID | Feature | Function(s) | Status |
|----|---------|-------------|--------|
| F1 | File Upload — Click | `dataFile` change listener | OK |
| F2 | File Upload — Drag & Drop | `drop`, `dragover`, `dragleave` listeners | OK |
| F3 | Multi-File Upload | rawFilesStore accumulation | OK |
| F4 | File Status Indicator | `#file-status` text update | OK |
| F5 | URL Auto-Fetch — Start | `startAutoFetch()` | BUG: Race condition on double-click (H5) |
| F6 | URL Auto-Fetch — Stop | `stopAutoFetch()` | OK |
| F7 | URL Auto-Fetch — Refresh Interval | `fetchInterval` input + setInterval | OK |
| F8 | Log-Pipe Parser | `processFilesFromUI()` logPipe branch | OK |
| F9 | Flat CSV Parser | `processFilesFromUI()` flatCsv branch | OK |
| F10 | CSV Header Row Detection | `csvHasHeader` checkbox | OK |
| F11 | CSV Manual Headers | `csvManualHeaders` input | OK |
| F12 | KPI Pattern Filter — Text | `kpiPattern` input filtering | OK |
| F13 | KPI Pattern Filter — File | `handlePatternUpload()` | OK |
| F14 | KPI Pattern with Label | `inputVal.includes(':')` branch | OK |
| F15 | Non-printable Char Stripping | Regex `[^\x20-\x7E]` replacement | OK |
| F16 | Day-of-Week Prefix Handling | `getUnix()` regex strip | OK |
| F17 | Timestamp Parsing — Log-Pipe | `getUnix()` pipe branch | BUG: Missing boundary checks (M1) |
| F18 | Timestamp Parsing — CSV | `getUnix()` comma branch | OK |
| F19 | Timestamp Formatting — Log-Pipe | `formatLabel()` pipe branch | BUG: Missing guards (M2) |
| F20 | Timestamp Formatting — CSV | `formatLabel()` comma branch | OK |
| F21 | File Inventory Table | `processFilesFromUI()` DOM build | OK |
| F22 | File Selection — Analyze Button | `selectFile()` | OK |
| F23 | Active Row Highlighting | `selectFile()` active-row class | OK |
| F24 | Merge All Data | `mergeAllAndSelect()` | OK |
| F25 | Merged Data Sort by Timestamp | `all.sort()` in mergeAllAndSelect | OK |
| F26 | Rule Builder — Add Rule | `addRuleToQueue()` | OK |
| F27 | Rule Builder — Chart Title | `gHeader` input | OK |
| F28 | Rule Builder — Analysis Mode Direct | `analysisMode` = direct | OK |
| F29 | Rule Builder — Analysis Mode Ratio | `analysisMode` = ratio | OK |
| F30 | Rule Builder — Metric Multi-Select | `selA` multiple select | OK |
| F31 | Rule Builder — Warning Threshold | `threshWarn` input | OK |
| F32 | Rule Builder — Critical Threshold | `threshCritical` input | OK |
| F33 | Rule Queue Display | `renderQueue()` | OK |
| F34 | Rule Queue — Remove Rule | renderQueue onclick splice | OK |
| F35 | Rule Queue — Threshold Badge | hasThresh badge in renderQueue | OK |
| F36 | Rule Export to JSON | `saveRulesToFile()` | OK |
| F37 | Rule Import from JSON | `importRules()` | OK |
| F38 | Legacy Schema Normalization | type/desc to mode/description in importRules | OK |
| F39 | Import — Auto-Bind Single File | importRules single-file branch | OK |
| F40 | Import — CSV Config Restore | importRules csvHeaderConfig branch | OK |
| F41 | Dashboard Generation | `generateDashboard()` | BUG: Mutual recursion (H1) |
| F42 | Chart.js Line Charts | Chart constructor in generateDashboard | OK |
| F43 | Threshold-Colored Points | pointColors logic in generateDashboard | OK |
| F44 | Synchronized Zoom/Pan | `syncCharts()` | OK |
| F45 | Reset View | `resetAllZoom()` | OK |
| F46 | Dashboard Meta Bar | active-file-label display | OK |
| F47 | Ratio Mode Calculation | `(d.tokens[t] / d.tokens[rule.tokens[0]] * 100)` | BUG: No zero-denominator guard |
| F48 | Statistics — computeStats | `computeStats()` | BUG: Stack overflow >100K elements (C1) |
| F49 | Statistics — Render Table | `renderStats()` | OK |
| F50 | Statistics — Collapse/Expand | `toggleStatsPanel()` | OK |
| F51 | Threshold Alert Check | `checkThresholds()` | OK |
| F52 | Alert Panel — Render | `renderAlerts()` | BUG: Unbounded DOM growth (H3) |
| F53 | Alert Counter Badge | alertCount textContent | OK |
| F54 | Alert Clear | `clearAlerts()` | OK |
| F55 | WebSocket Client — Connect | `connectWebSocket()` | BUG: No reconnect limit (H4) |
| F56 | WebSocket — Data Messages | ws.onmessage data handler | OK |
| F57 | WebSocket — Alert Messages | ws.onmessage alert handler | OK |
| F58 | WebSocket — Live Badge | live-badge show/hide | OK |
| F59 | WebSocket — Auto-Reconnect | ws.onclose setTimeout | BUG: No max attempts (H4) |
| F60 | WebSocket — Exponential Backoff | wsDelay doubling logic | OK |
| F61 | WebSocket — URL from Query Param | `?ws=` in window.onload | OK |
| F62 | Theme Toggle | `toggleTheme()` | OK |
| F63 | PDF Export | `exportFullPDF()` | OK |
| F64 | PDF — Custom Filename | prompt() in exportFullPDF | OK |
| F65 | PDF — Multi-Page | y > 250 page break | OK |
| F66 | Console — Log Action | `logAction()` | BUG: Unbounded entries (H2) |
| F67 | Console — Toggle Collapse | `toggleConsole()` | OK |
| F68 | Console — Copy to Clipboard | `copyConsole()` | OK |
| F69 | Hard Reset | location.reload() | OK |
| F70 | XSS-Safe Filename Display | DOM API textContent | OK |
| F71 | XSS-Safe Chart Titles | textContent in generateDashboard | OK |
| F72 | Populate Metric Selects | `populateSelects()` | OK |
| F73 | CSV Toggle Options | `toggleCsvOptions()` | OK |
| F74 | Duplicate Header Detection | manualTokens match-and-skip logic | OK |

### 1.2 Server Features (server/server.py)

| ID | Feature | Function(s) | Status |
|----|---------|-------------|--------|
| S1 | Config Loading | `load_config()` | BUG: Shallow merge crashes on partial config (C4) |
| S2 | Config CLI Flag | `sys.argv` --config parsing | OK |
| S3 | Log Parse — Log-Pipe Mode | `parse_log_line()` logPipe branch | OK |
| S4 | Log Parse — Flat CSV Mode | `parse_log_line()` flatCsv branch | BUG: Uses Col_N names (C7) |
| S5 | Pattern Filter (Server) | pattern check in parse_log_line | OK |
| S6 | Threshold Check (Server) | `check_thresholds()` | OK |
| S7 | Alert — Write to Log | `write_alert_log()` | BUG: Unbounded file growth (H7) |
| S8 | Alert — Email via SMTP | `send_email_alert()` | BUG: No cooldown/dedup (C3) |
| S9 | File Tail — Local | `tail_local_file()` | BUG: Starts at pos 0 = OOM (C5) |
| S10 | File Rotation Detection | size < pos check | BUG: Unreachable code |
| S11 | Remote Sync — rsync | `sync_remote_file()` | OK |
| S12 | Remote Sync — Periodic | remote_interval timer | OK |
| S13 | WebSocket Broadcast | `broadcast()` | BUG: Race condition (C2) |
| S14 | WebSocket Handler | `ws_handler()` | BUG: path param issue (C6) |
| S15 | HTTP Server | `make_http_handler()` | OK |
| S16 | Monitor Loop | `monitor_loop()` | OK |
| S17 | Main Entry | `main()`, `main_async()` | BUG: No graceful shutdown (H8) |

---

## 2. COMPREHENSIVE TEST CASES

### Group 1: Timestamp Parsing — getUnix()

| TC# | Test Case | Input | Expected Output | Status |
|-----|-----------|-------|-----------------|--------|
| 1.1 | Log-pipe format returns positive integer | `'Jan 15 \| 08:00:00'` | Integer > 0 | Exists |
| 1.2 | Day prefix stripped — same as without prefix | `'Mon Jan 15 \| 08:00:00'` vs `'Jan 15 \| 08:00:00'` | Equal values | Exists |
| 1.3 | CSV format returns positive integer | `'2026-01-15,08:00:00'` | Integer > 0 | Exists |
| 1.4 | Empty string returns 0 | `''` | 0 | Exists |
| 1.5 | Null returns 0 | `null` | 0 | Exists |
| 1.6 | Earlier timestamp < later timestamp | `08:00` vs `09:00` | earlier < later | Exists |
| 1.7 | Uses current year (not hardcoded 2026) | Extract year from result | Current year | Exists |
| 1.8 | Unknown month defaults gracefully | `'Xyz 15 \| 08:00:00'` | Integer (uses "01") | NEW |
| 1.9 | Missing time part after pipe | `'Jan 15 \|'` | Integer (empty time part) | NEW |
| 1.10 | No pipe or comma format | `'Jan 15 08:00:00'` | 0 | NEW |
| 1.11 | Single element after split | `'Jan\| 08:00:00'` | No crash, returns integer | NEW |
| 1.12 | Undefined input | `undefined` | 0 | NEW |
| 1.13 | All day prefixes stripped equally | `'Wed Feb 28 \| 12:00:00'` vs `'Feb 28 \| 12:00:00'` | Equal | NEW |
| 1.14 | Milliseconds truncated to 6 digits | `'Jan 15 \| 08:00:00.123'` | Same as `08:00:00` | NEW |
| 1.15 | CSV date with slashes | `'2026/01/15,08:00:00'` | Handles without crash | NEW |

### Group 2: Timestamp Formatting — formatLabel()

| TC# | Test Case | Input | Expected Output | Status |
|-----|-----------|-------|-----------------|--------|
| 2.1 | Log-pipe produces readable label | `'Mon Jan 15 \| 14:35:42'` | `'Jan 15 14:35'` | Exists |
| 2.2 | CSV produces readable label | `'2026-01-15,14:35:42'` | `'2026-01-15 14:35'` | Exists |
| 2.3 | Empty string returns empty | `''` | `''` | Exists |
| 2.4 | Null returns empty string | `null` | `''` | NEW |
| 2.5 | No pipe or comma returns as-is | `'random text'` | `'random text'` | NEW |
| 2.6 | Pipe with no time part | `'Jan 15 \|'` | No crash | NEW |
| 2.7 | CSV with no time after comma | `'2026-01-15,'` | No crash | NEW |
| 2.8 | Multiple pipes — uses first split | `'A \| B \| C'` | First pipe determines split | NEW |

### Group 3: Log-Pipe Parser

| TC# | Test Case | Input | Expected Output | Status |
|-----|-----------|-------|-----------------|--------|
| 3.1 | Valid lines parsed with correct tokens | sample-logpipe.log | MSU Received Last Min = 100 | Exists |
| 3.2 | < 5 pipe segments rejected | 4-segment line | Not in parsedFilesStore | Exists |
| 3.3 | Pattern filter excludes non-matching | "NONEXISTENT" pattern | Empty results | Exists |
| 3.4 | Day-of-week prefix does not break | "Mon" prefixed line | Parsed correctly | Exists |
| 3.5 | Multiple KV pairs all parsed | 5 KV pairs | 5 tokens in result | NEW |
| 3.6 | Odd KV count (trailing key) | `K1,100,K2` | K1=100, K2 handled | NEW |
| 3.7 | Spaces around key names trimmed | ` K1 , 100 ` | Key = "K1" | NEW |
| 3.8 | Non-numeric KV value defaults to 0 | `K1,abc` | val = 0 | NEW |
| 3.9 | Empty KV section | Empty 5th segment | Row filtered (no tokens) | NEW |
| 3.10 | Non-printable chars stripped | Line with \x01\x02 | Characters removed | NEW |
| 3.11 | Pattern with colon label syntax | `'App:PATTERN'` | Label extracted, filter = "PATTERN" | NEW |
| 3.12 | Multiple files parsed independently | 2 different files | Both in parsedFilesStore | NEW |
| 3.13 | Empty file not added to store | Empty string | Key absent from store | NEW |
| 3.14 | Only blank lines not added | `'\n\n\n'` | Key absent | NEW |

### Group 4: Flat CSV Parser

| TC# | Test Case | Input | Expected Output | Status |
|-----|-----------|-------|-----------------|--------|
| 4.1 | Manual headers produce named tokens | CSV + manual headers | Named keys | Exists |
| 4.2 | < 3 columns rejected | 2-column line | Not in store | Exists |
| 4.3 | Timestamp columns excluded | Date,Time header | Not in availableTokens | Exists |
| 4.4 | Auto-header from first row (csvHasHeader=true) | CSV with header row | Header names as keys | NEW |
| 4.5 | Manual headers override auto-header | Both set | Manual takes priority | NEW |
| 4.6 | No headers = Col_N naming | No header config | Col_2, Col_3 etc. | NEW |
| 4.7 | Duplicate header row detected and skipped | Data matching headers | Row filtered | NEW |
| 4.8 | Non-numeric values default to 0 | `abc,def` values | Tokens = 0 | NEW |
| 4.9 | Trailing comma handled | Extra comma at end | No crash | NEW |
| 4.10 | Windows line endings (CRLF) | \r\n content | Parsed correctly | NEW |

### Group 5: Rule Queue Management

| TC# | Test Case | Input | Expected Output | Status |
|-----|-----------|-------|-----------------|--------|
| 5.1 | Add rule — queue grows by 1 | Select + add | queue.length = 1 | Exists |
| 5.2 | Threshold values stored | Warn=5, Crit=10 | Thresholds populated | Exists |
| 5.3 | DOM entry per rule | 1 rule | 1 div in queueList | Exists |
| 5.4 | Remove rule updates queue and DOM | Remove 1 of 2 | length=1, DOM=1 | Exists |
| 5.5 | No metric selected — not added | Empty selection | Queue unchanged | NEW |
| 5.6 | Multiple metrics in one rule | 3 metrics selected | tokens.length = 3 | NEW |
| 5.7 | Warn-only threshold | Warn=5, Crit=empty | Only warn present | NEW |
| 5.8 | Critical-only threshold | Warn=empty, Crit=10 | Only critical present | NEW |
| 5.9 | No thresholds — empty object | Both empty | thresholds = {} | NEW |
| 5.10 | Custom chart title preserved | "My Chart" | header = "My Chart" | NEW |
| 5.11 | Default title when empty | "" | header = "KPI" | NEW |
| 5.12 | Threshold badge shown | With thresholds | Badge in DOM | NEW |
| 5.13 | No badge without thresholds | Without thresholds | No badge | NEW |

### Group 6: Rule Import/Export

| TC# | Test Case | Input | Expected Output | Status |
|-----|-----------|-------|-----------------|--------|
| 6.1 | DBW.json loads 5 rules | DBW.json | 5 rules, first = "MSU" | Exists |
| 6.2 | Legacy schema normalized | type:"ratio" | mode = "ratio" | Exists |
| 6.3 | GTPP.json loads 3 rules | GTPP.json content | 3 rules with correct tokens | NEW |
| 6.4 | CSV header config restored | JSON with csvHeaderConfig | Checkbox/input populated | NEW |
| 6.5 | Missing thresholds default {} | Rule without thresholds | thresholds = {} | NEW |
| 6.6 | Invalid JSON — error handled | Malformed JSON | Alert shown, no crash | NEW |
| 6.7 | Flat array (no ruleQueue wrapper) | `[{header:...}]` | Recognized as rules | NEW |
| 6.8 | Export produces valid JSON | saveRulesToFile() | Blob with correct structure | NEW |
| 6.9 | Auto-bind when single file | 1 file in store | selectFile called | NEW |
| 6.10 | Dashboard triggered when data exists | activeLogData set | generateDashboard called | NEW |

### Group 7: Data Selection & Merge

| TC# | Test Case | Input | Expected Output | Status |
|-----|-----------|-------|-----------------|--------|
| 7.1 | Merge two files sorted by timestamp | 2 files, interleaved | Sorted, "MERGED_TIMELINE" | Exists |
| 7.2 | Select file sets activeLogData | Click analyze | Data matches file | NEW |
| 7.3 | Select file sets activeFileName | Click analyze | Name matches | NEW |
| 7.4 | Active row highlighted | Select index 1 | row-1 has active-row | NEW |
| 7.5 | Previous row unhighlighted | Select A then B | Only B highlighted | NEW |
| 7.6 | Builder panel shown | Select file | builderPanel visible | NEW |
| 7.7 | Auto-generate if rules exist | Rules in queue | Dashboard generated | NEW |
| 7.8 | Merge auto-generates if rules exist | Rules in queue | Dashboard generated | NEW |
| 7.9 | Merge with empty store | No files | activeLogData = [] | NEW |

### Group 8: Dashboard Generation

| TC# | Test Case | Input | Expected Output | Status |
|-----|-----------|-------|-----------------|--------|
| 8.1 | Canvas element per rule | 1 rule | 1 canvas | Exists |
| 8.2 | XSS-safe chart title | `<script>alert(1)</script>` | Rendered as text | Exists |
| 8.3 | Multiple rules — multiple wrappers | 3 rules | 3 chart-wrappers | NEW |
| 8.4 | Ratio mode calculation correct | tokens[0]=100, tokens[1]=50 | 50% | NEW |
| 8.5 | Ratio mode — zero denominator | tokens[0]=0 | 0 (not Infinity) | NEW |
| 8.6 | Ratio mode — first token = 100% | Any data | First series = 100% | NEW |
| 8.7 | Direct mode raw values | token=42 | Dataset value = 42 | NEW |
| 8.8 | Dashboard clears on rebuild | Generate twice | Old canvases gone | NEW |
| 8.9 | chartInstances count correct | 2 rules | chartInstances.length = 2 | NEW |
| 8.10 | Meta bar shows filename | "test.log" | Label = "test.log" | NEW |
| 8.11 | Empty data — error logged | No data | "No data" in console | NEW |
| 8.12 | Auto-bind single file | 1 file, empty activeLogData | selectFile called | NEW |
| 8.13 | Critical threshold coloring | val >= critical | Red point (#dc3545) | NEW |
| 8.14 | Warning threshold coloring | warn <= val < critical | Yellow point (#ffc107) | NEW |
| 8.15 | No threshold — zero point radius | No thresholds | pointRadius = 0 | NEW |

### Group 9: Statistics

| TC# | Test Case | Input | Expected Output | Status |
|-----|-----------|-------|-----------------|--------|
| 9.1 | Correct min/max/mean | [10, 20, 30] | min=10, max=30, mean=20 | Exists |
| 9.2 | Stats panel visible after dashboard | Generate | statsPanel visible | Exists |
| 9.3 | Empty array — empty stats | [] | {} | NEW |
| 9.4 | Single data point — stddev = 0 | [42] | stddev=0, all=42 | NEW |
| 9.5 | Negative values | [-10, -5, 0, 5] | min=-10, max=5, mean=-2.5 | NEW |
| 9.6 | Mixed undefined/NaN filtered | [10, undefined, NaN, 30] | Computed on [10, 30] | NEW |
| 9.7 | Standard deviation correct | [2,4,4,4,5,5,7,9] | stddev approx 2.0 | NEW |
| 9.8 | Table rows match token count | 5 tokens | 5 rows | NEW |
| 9.9 | Collapse hides body | Click | display=none | NEW |
| 9.10 | Expand shows body | Click again | display='' | NEW |
| 9.11 | Multiple tokens in table | 3 metrics | All 3 in table | NEW |
| 9.12 | Large dataset no crash (C1 fix) | 150K values | Correct stats | NEW |

### Group 10: Threshold Alerts

| TC# | Test Case | Input | Expected Output | Status |
|-----|-----------|-------|-----------------|--------|
| 10.1 | Value >= critical — critical breach | val=15, crit=10 | severity="critical" | Exists |
| 10.2 | warn <= val < critical — warn breach | val=7, w=5, c=10 | severity="warn" | Exists |
| 10.3 | Value < warn — no breach | val=3, w=5, c=10 | 0 breaches | Exists |
| 10.4 | Alert panel visible on breach | Breach found | alertPanel visible | Exists |
| 10.5 | Value exactly at warn | val=5, warn=5 | Breach (>=) | NEW |
| 10.6 | Value exactly at critical | val=10, crit=10 | Critical breach | NEW |
| 10.7 | Multiple metrics mixed | 2 metrics, 1 breached | 1 breach | NEW |
| 10.8 | Rule with no thresholds | thresholds={} | 0 breaches | NEW |
| 10.9 | Metric not in data | Threshold for "X", data has "Y" | 0 breaches | NEW |
| 10.10 | Alert counter correct | 3 breaches | alertCount = "3" | NEW |
| 10.11 | Clear resets everything | clearAlerts() | alertLog=[], hidden | NEW |
| 10.12 | Alert shows formatted timestamp | Breach data | formatLabel output | NEW |
| 10.13 | Critical CSS class | Critical breach | .alert-entry.critical | NEW |
| 10.14 | Warning CSS class | Warn breach | .alert-entry.warn | NEW |
| 10.15 | Multiple rules multiple thresholds | 2 rules with thresholds | All checked | NEW |

### Group 11: UI Interactions

| TC# | Test Case | Input | Expected Output | Status |
|-----|-----------|-------|-----------------|--------|
| 11.1 | Theme toggle cycles | Call twice | light→dark→light | Exists |
| 11.2 | logAction appends entry | Message | .log-entry in DOM | Exists |
| 11.3 | CSV options for flatCsv | Set flatCsv | csvOptions visible | Exists |
| 11.4 | CSV options hidden for logPipe | Set logPipe | csvOptions hidden | Exists |
| 11.5 | Drop zone dragover listener | Dispatch event | drag-over class | Exists |
| 11.6 | Console toggle collapse/expand | Click header | collapsed class toggled | NEW |
| 11.7 | Console arrow direction | Toggle | Arrow changes | NEW |
| 11.8 | Dark theme data attribute | Toggle to dark | data-theme="dark" | NEW |
| 11.9 | Log entry has timestamp | logAction call | [HH:MM:SS] prefix | NEW |
| 11.10 | Dragleave removes class | Dispatch dragleave | drag-over removed | NEW |
| 11.11 | Multiple log entries accumulate | 5 messages | 5+ log entries | NEW |
| 11.12 | Populate selects fills options | Set tokens, call | Option count matches | NEW |

### Group 12: URL Auto-Fetch

| TC# | Test Case | Input | Expected Output | Status |
|-----|-----------|-------|-----------------|--------|
| 12.1 | Empty URL — warning logged | No URL, start | "No URL" in console | NEW |
| 12.2 | Start hides/shows buttons | Start | Start hidden, stop shown | NEW |
| 12.3 | Stop shows/hides buttons | Stop | Start shown, stop hidden | NEW |
| 12.4 | Successful fetch populates store | Mock response | rawFilesStore updated | NEW |
| 12.5 | Failed fetch logs error | 404 | "Fetch Error" logged | NEW |
| 12.6 | Custom interval used | 10s | setInterval(fn, 10000) | NEW |
| 12.7 | Default interval 30s | No change | 30s | NEW |
| 12.8 | Stop clears timer | Start then stop | fetchTimer = null | NEW |

### Group 13: WebSocket Client

| TC# | Test Case | Input | Expected Output | Status |
|-----|-----------|-------|-----------------|--------|
| 13.1 | Query param auto-connects | `?ws=ws://localhost:8765` | connectWebSocket called | NEW |
| 13.2 | Data message appends data | `{type:'data', rows:[...]}` | activeLogData grows | NEW |
| 13.3 | Alert message renders | `{type:'alert',...}` | Alert in DOM | NEW |
| 13.4 | Live badge on connect | ws.onopen | Badge visible | NEW |
| 13.5 | Live badge hidden on disconnect | ws.onclose | Badge hidden | NEW |
| 13.6 | Backoff doubles delay | First disconnect | wsDelay = 2000 | NEW |
| 13.7 | Backoff capped at 30s | Many disconnects | Max 30000 | NEW |
| 13.8 | Delay resets on connect | Successful connect | wsDelay = 1000 | NEW |
| 13.9 | Non-JSON handled gracefully | Bad message | "non-JSON" logged | NEW |
| 13.10 | Metrics populated from data | First data message | availableTokens set | NEW |

### Group 14: PDF Export

| TC# | Test Case | Input | Expected Output | Status |
|-----|-----------|-------|-----------------|--------|
| 14.1 | No charts — warning | 0 instances | "No charts" logged | NEW |
| 14.2 | Cancel prompt — cancelled | null from prompt | "cancelled" logged | NEW |
| 14.3 | Empty filename uses default | "" | Default name used | NEW |
| 14.4 | .pdf auto-appended | "report" | "report.pdf" | NEW |
| 14.5 | Existing .pdf not doubled | "report.pdf" | "report.pdf" | NEW |

### Group 15: File Upload Events

| TC# | Test Case | Input | Expected Output | Status |
|-----|-----------|-------|-----------------|--------|
| 15.1 | Upload stores in rawFilesStore | 1 file | Key present | NEW |
| 15.2 | Multiple files uploaded | 3 files | 3 keys | NEW |
| 15.3 | Status shows count | 2 files | "2 files ready." | NEW |
| 15.4 | Upload triggers processFilesFromUI | File added | parsedFilesStore populated | NEW |
| 15.5 | Upload triggers merge | File added | activeFileName set | NEW |

### Group 16: Pattern Filter File Upload

| TC# | Test Case | Input | Expected Output | Status |
|-----|-----------|-------|-----------------|--------|
| 16.1 | Pattern loaded into input | "SYSTEM_KPI" | kpiPattern.value set | NEW |
| 16.2 | Colon label extracted | "App:PATTERN" | Label logged | NEW |
| 16.3 | Empty file — no change | Empty | Input unchanged | NEW |
| 16.4 | Triggers reprocessing | Files loaded | processFilesFromUI called | NEW |

### Group 17: Chart Sync & Zoom

| TC# | Test Case | Input | Expected Output | Status |
|-----|-----------|-------|-----------------|--------|
| 17.1 | Sync propagates zoom | Zoom chart 0 | Chart 1 matches | NEW |
| 17.2 | isInternalSync prevents loops | Internal trigger | No recursion | NEW |
| 17.3 | Reset all zoom | Multiple charts | All reset | NEW |

### Group 18: Edge Cases & Boundary Conditions

| TC# | Test Case | Input | Expected Output | Status |
|-----|-----------|-------|-----------------|--------|
| 18.1 | Empty rawFilesStore | No files | No crash | NEW |
| 18.2 | Empty ruleQueue | No rules | No charts | NEW |
| 18.3 | All same values | [5,5,5] | stddev=0 | NEW |
| 18.4 | Very large values | [1e15, 2e15] | Correct | NEW |
| 18.5 | Special chars in token name | `'SM TimedOut Last Min'` | Handled | NEW |
| 18.6 | XSS filename | `'<img onerror=alert(1)>.log'` | Text only | NEW |
| 18.7 | Very long line (10KB) | Large line | Parsed ok | NEW |
| 18.8 | Mixed valid/invalid lines | Mixed content | Valid parsed, invalid skipped | NEW |

---

## 3. BUGS FOUND

### 3.1 Critical Bugs (Crashes / Data Loss)

| ID | Component | Description | Affected Feature | Fix Required |
|----|-----------|-------------|-----------------|--------------|
| C1 | HTML | `computeStats()` uses `Math.min(...vals)` — stack overflow when array >100K elements | F48 | Replace with reduce pattern |
| C2 | Server | `broadcast()` iterates `clients` set while `ws_handler()` modifies it — RuntimeError | S13 | Iterate over snapshot `set(clients)` |
| C3 | Server | Email flooding — every log line above threshold triggers email (360/hour at 10s poll) | S8 | AlertDeduplicator with 300s cooldown |
| C4 | Server | `load_config()` shallow merge — partial email config drops defaults, KeyError crash | S1 | Recursive deep_merge() |
| C5 | Server | File positions start at 0 — 100GB log loaded into memory = OOM | S9 | start_from_end config, seek to EOF |
| C6 | Server | `ws_server_handler(websocket, path=None)` — path removed in websockets >= 10.0 | S14 | Remove path parameter |
| C7 | Server | CSV mode uses Col_N names but rules use manualHeaders names — silent mismatch | S4 | Map to header names from config |

### 3.2 High Bugs (Memory Leaks / UX Issues)

| ID | Component | Description | Affected Feature | Fix Required |
|----|-----------|-------------|-----------------|--------------|
| H1 | HTML | `generateDashboard()` and `selectFile()` call each other (mutual recursion) | F41 | Guard flag |
| H2 | HTML | `logAction()` appends DOM entries without limit — memory leak after hours | F66 | Cap at 500 entries |
| H3 | HTML | `renderAlerts()` creates unlimited DOM elements, no batching | F52 | DocumentFragment, cap at 1000 |
| H4 | HTML | `connectWebSocket()` reconnects forever with growing closure chain | F55 | Max 10 attempts, close old ws |
| H5 | HTML | `startAutoFetch()` double-click creates overlapping timers | F5 | isFetchRunning boolean guard |
| H6 | HTML | File input `onchange` won't fire for same file twice | F1 | Reset input.value = '' |
| H7 | Server | `alerts.log` append-only, no rotation — fills disk | S7 | RotatingFileHandler |
| H8 | Server | No graceful shutdown — `wait_closed()` blocks, no `close()` call | S17 | Signal handler + try-finally |

### 3.3 Medium Bugs (Edge Cases / Defensive Coding)

| ID | Component | Description | Affected Feature | Fix Required |
|----|-----------|-------------|-----------------|--------------|
| M1 | HTML | `getUnix()` missing boundary checks — crash on undefined dateParts | F17 | Length/month validation |
| M2 | HTML | `formatLabel()` crash when split produces < 2 parts | F19 | Length guards |
| M3 | HTML | CSV parser naively splits on comma — breaks quoted fields | F9 | Document as limitation |
| M4 | HTML | Drop event may simultaneously open file dialog (click interference) | F2 | stopPropagation + debounce |
| M5 | HTML | `processFilesFromUI()` silent on empty rawFilesStore | F8 | Early return + warning |
| M6 | Server | `errors="replace"` silently corrupts metric names | S9 | UTF-8 strict, latin-1 fallback |

### 3.4 Logic Bugs

| ID | Component | Description | Affected Feature | Fix Required |
|----|-----------|-------------|-----------------|--------------|
| L1 | HTML | Ratio mode has no zero-denominator guard (returns 0 by JS default but could produce NaN) | F47 | Explicit check |
| L2 | Server | File rotation check unreachable — `<=` check runs before `<` check | S10 | Change to `==` for no-new-data |

---

## 4. SECURITY VULNERABILITIES

| ID | Severity | Component | Vulnerability | Fix |
|----|----------|-----------|---------------|-----|
| SEC1 | CRITICAL | Server | Command injection via rsync config (user/host/path) | Validate with strict regex |
| SEC2 | CRITICAL | HTML | WS URL injection via ?ws= query parameter | Validate protocol whitelist |
| SEC3 | HIGH | HTML | No SRI on CDN scripts — CDN compromise = page takeover | Add integrity + crossorigin |
| SEC4 | HIGH | HTML | Fetch URL not validated — SSRF risk | Whitelist http/https, block private IPs |
| SEC5 | HIGH | Server | SMTP injection via recipients list | Validate email format |
| SEC6 | HIGH | Server | Plaintext SMTP password in config.json | Use SMTP_PASSWORD env var |
| SEC7 | HIGH | Server | No WebSocket origin validation | Check Origin header |
| SEC8 | HIGH | Server | HTTP error leaks file system path | Generic error message |
| SEC9 | HIGH | HTML | No file upload size/type validation — DoS | 50MB limit, extension whitelist |
| SEC10 | MEDIUM | Server | World-readable /tmp/kpi-remote directory | tempfile.mkdtemp with 0o700 |
| SEC11 | MEDIUM | Server | Unbounded broadcast message size | 1MB max limit |
| SEC12 | MEDIUM | HTML | Missing Content-Security-Policy meta tag | Add CSP |

---

## 5. SUMMARY

| Category | Count |
|----------|-------|
| Frontend Features | 74 |
| Server Features | 17 |
| **Total Features** | **91** |
| Existing Test Cases | 27 |
| New Test Cases Required | ~110 |
| **Total Test Cases** | **~137** |
| Critical Bugs | 7 |
| High Bugs | 8 |
| Medium Bugs | 6 |
| Logic Bugs | 2 |
| **Total Bugs** | **23** |
| Security Vulnerabilities | 12 |

---

---

## 6. v2.2.0 FEEDBACK UPDATES — NEW FEATURES & TEST CASES

### 6.1 New/Updated Features (F75–F99)

| ID | Feature | Function(s) | Source |
|----|---------|-------------|--------|
| F75 | Multi-Component CSV Parser | `processFilesFromUI()` multiComp branch | Restored from v1.9.0 |
| F76 | MC Builder Panel UI | `mcBuilderPanel` HTML + selectors | Restored from v1.9.0 |
| F77 | MC Header File Loader | `loadMcHeaderFile()`, `parseMcHeaderCol()`, `clearMcHeaderFile()` | Restored from v1.9.0 |
| F78 | MC Component/Type Selector | `populateMcSelects()`, `refreshMcKpiSelector()` | Restored from v1.9.0 |
| F79 | MC Overlay Mode | `toggleOverlayKey()`, `populateOverlayKeySelect()` | Restored from v1.9.0 |
| F80 | MC Rule Queue | `addMcRule()`, `editMcRule()`, `renderMcQueue()` | Restored from v1.9.0 |
| F81 | MC Dashboard Rendering | `generateDashboard()` MC branches | Restored from v1.9.0 |
| F82 | Per-Chart Stats Table | `buildStatsTable(datasets, isRatio)` | Restored from v1.9.0 |
| F83 | Edit Rule — Standard | `editRule(index)`, `cancelEditRule()` | Restored from v1.9.0 |
| F84 | Edit Rule — MC | `editMcRule(idx)`, `cancelMcEdit()` | Restored from v1.9.0 |
| F85 | Edit Banner UI | `#editBanner`, `#mcEditBanner` with cancel button | Restored from v1.9.0 |
| F86 | PDF Export Modal | `#pdf-modal` with Full Data / Current View / Cancel | Restored from v1.9.0 |
| F87 | PDF Full Data Export | `_runPdfExport(true)` — resets zoom before capture | Restored from v1.9.0 |
| F88 | PDF Current View Export | `_runPdfExport(false)` — captures zoomed/panned state | Restored from v1.9.0 |
| F89 | PDF Source Filename Header | Text header in PDF first page with source & timestamp | New |
| F90 | Directory Selection — Rules Export | `showSaveFilePicker()` in `saveRulesToFile()` | New |
| F91 | Directory Selection — PDF Export | `showSaveFilePicker()` in `_runPdfExport()` | New |
| F92 | Directory Selection — Fallback | `prompt()` + `a.download` for unsupported browsers | New |
| F93 | Detailed Action Logging | `logAction()` for all user interactions | Enhanced |
| F94 | Timeline Gap Detection | `insertGapsIntoTsOrder()`, `buildTimelineWithGaps()` | Restored from v1.9.0 |
| F95 | Gap Visualization Plugin | `makeGapPlugin()` | Restored from v1.9.0 |
| F96 | Chart Copy to Clipboard | `copyChartToClipboard()` | Restored from v1.9.0 |
| F97 | CSV Timestamp Format Detection | `detectCsvTsFormat()` | Restored from v1.9.0 |
| F98 | URL Auto-Fetch | `startAutoFetch()`, `stopAutoFetch()` | Ported from v2.1.0 |
| F99 | File Upload Validation | `validateFile()` — size + extension checks | Ported from v2.1.0 |

### 6.2 New Test Cases (Groups 19–26)

#### Group 19: Per-Chart Statistics (F82)

| TC# | Test Case | Expected | Priority |
|-----|-----------|----------|----------|
| 19.1 | Stats table shows only metrics for that chart | Each chart's stats table lists only its own metrics | NEW |
| 19.2 | Stats table not shown globally | No single global stats table; each chart has its own | NEW |
| 19.3 | Ratio mode stats show "%" unit column | Stats table has "Unit" column with "%" | NEW |
| 19.4 | Direct mode stats have no unit column | Stats table has no "Unit" column | NEW |
| 19.5 | Stats Min/Max/Avg correct for known data | Min=10, Max=30, Avg=20 for [10,20,30] | NEW |

#### Group 20: Detailed Action Logging (F93)

| TC# | Test Case | Expected | Priority |
|-----|-----------|----------|----------|
| 20.1 | Parser mode change logged | Console shows "Parser mode: [value]" | NEW |
| 20.2 | CSV header checkbox toggle logged | Console shows "Config: CSV header row enabled/disabled" | NEW |
| 20.3 | Manual headers input logged | Console shows "Config: Manual headers updated." | NEW |
| 20.4 | Timestamp format change logged | Console shows "Config: Timestamp format set to [value]" | NEW |
| 20.5 | Metric selection change logged | Console shows "Metrics: [list]" | NEW |
| 20.6 | Analysis mode change logged | Console shows "Config: Analysis mode set to [value]" | NEW |
| 20.7 | Threshold input change logged | Console shows "Config: Threshold updated" | NEW |
| 20.8 | Zoom event logged | Console shows "View: Chart zoomed." | NEW |
| 20.9 | Pan event logged | Console shows "View: Chart panned." | NEW |
| 20.10 | MC component selection logged | Console shows "MC: Components selected: [list]" | NEW |
| 20.11 | MC overlay toggle logged | Console shows "MC: Overlay mode enabled/disabled." | NEW |
| 20.12 | File drop logged | Console shows "Filesystem: N file(s) dropped." | NEW |
| 20.13 | File upload logged | Console shows "Filesystem: N data file(s) uploaded." | NEW |
| 20.14 | Rule add logged | Console shows "Rule: Added '[header]'." | NEW |
| 20.15 | Rule edit logged | Console shows "Rule: Editing '[header]'." | NEW |
| 20.16 | Rule remove logged | Console shows "Rule: Removed." | NEW |
| 20.17 | PDF export start logged | Console shows relevant PDF log | NEW |
| 20.18 | Gap detection logged | Console shows "Timeline: N gap(s) detected." | NEW |
| 20.19 | Tool version logged on load | Console shows "System: Tool v2.2.0 loaded." | NEW |
| 20.20 | Console entries capped at 500 | Only 500 entries visible in DOM | NEW |

#### Group 21: PDF Export Options (F86, F87, F88)

| TC# | Test Case | Expected | Priority |
|-----|-----------|----------|----------|
| 21.1 | PDF modal opens with 3 buttons | Modal visible with "Full Data", "Current View", "Cancel" | NEW |
| 21.2 | Cancel closes modal | Modal hidden, "PDF: Export cancelled." logged | NEW |
| 21.3 | Click outside modal closes it | Modal hidden | NEW |
| 21.4 | Full Data resets zoom before export | Charts reset, PDF saved | NEW |
| 21.5 | Current View preserves zoom | PDF captures zoomed state | NEW |
| 21.6 | Filename input pre-populated | Input shows "KPI_Report_[activeFileName]" | NEW |
| 21.7 | Custom filename used | File saved with custom name | NEW |
| 21.8 | .pdf extension auto-appended | .pdf added automatically | NEW |
| 21.9 | No charts — warning, no modal | Warning logged, modal does not open | NEW |
| 21.10 | Busy overlay shown during export | Overlay visible during generation | NEW |

#### Group 22: Edit Rules (F83, F84, F85)

| TC# | Test Case | Expected | Priority |
|-----|-----------|----------|----------|
| 22.1 | Edit pencil button visible per rule | Edit button visible next to each rule | NEW |
| 22.2 | Edit populates form fields | gHeader, analysisMode, selA populated with rule values | NEW |
| 22.3 | Edit banner appears | Yellow edit banner shows "Editing rule: [name]" | NEW |
| 22.4 | Add button changes to Save | Button text changes to "Save Rule Changes" | NEW |
| 22.5 | Save updates the rule in queue | ruleQueue[index] updated with new values | NEW |
| 22.6 | Cancel edit resets form | Form cleared, banner hidden, button reset | NEW |
| 22.7 | Queue item highlighted during edit | Item at index has `.editing` class | NEW |
| 22.8 | MC edit populates MC form | mcHeader, mcMode, selComp, selMcKpi populated | NEW |
| 22.9 | MC edit banner appears | MC edit banner visible | NEW |
| 22.10 | MC cancel resets MC form | MC form cleared, banner hidden | NEW |

#### Group 23: PDF Source Filename (F89)

| TC# | Test Case | Expected | Priority |
|-----|-----------|----------|----------|
| 23.1 | PDF first page shows source filename | First page has "Source: [filename]" text | NEW |
| 23.2 | PDF shows generation timestamp | First page has "Generated: [datetime]" | NEW |
| 23.3 | PDF shows "N/A" when no file active | "Source: N/A" in PDF | NEW |
| 23.4 | PDF header uses bold title | "KPI Analysis Report" in bold 14pt font | NEW |
| 23.5 | Charts start below header | First chart positioned below header text | NEW |

#### Group 24: Directory Selection (F90, F91, F92)

| TC# | Test Case | Expected | Priority |
|-----|-----------|----------|----------|
| 24.1 | Rules export opens save dialog (Chrome) | System save file picker appears | NEW |
| 24.2 | PDF export opens save dialog (Chrome) | System save file picker appears | NEW |
| 24.3 | Rules export fallback (Firefox) | prompt() dialog appears | NEW |
| 24.4 | PDF export fallback (Firefox) | jsPDF default save | NEW |
| 24.5 | Cancel save dialog cancels export | "Cancelled." logged, no file saved | NEW |
| 24.6 | Custom directory selection works | File saved to selected directory | NEW |
| 24.7 | Suggested filename appears in picker | Default filename pre-filled | NEW |
| 24.8 | File type filter shows in picker | Shows "JSON Files" or "PDF Files" | NEW |

#### Group 25: Multi-Component CSV (F75–F81)

| TC# | Test Case | Expected | Priority |
|-----|-----------|----------|----------|
| 25.1 | MC parser option visible | "Multi-Component CSV" option present | NEW |
| 25.2 | MC builder panel shown when MC selected | mcBuilderPanel visible, standard hidden | NEW |
| 25.3 | MC CSV data parsed correctly | compIndexStore populated with Type/CompId keys | NEW |
| 25.4 | MC auto-detects header row | headerKeys populated, header row skipped | NEW |
| 25.5 | MC component selector populated | selComp has Type/CompId options | NEW |
| 25.6 | MC KPI selector populated | selMcKpi shows KPI column names | NEW |
| 25.7 | MC rule added to queue | Rule in ruleQueue with _mc:true flag | NEW |
| 25.8 | MC rule edit works | MC form populated with rule values | NEW |
| 25.9 | MC dashboard generates per-component charts | Separate chart per component | NEW |
| 25.10 | MC overlay mode generates single chart | Single chart with multiple component lines | NEW |
| 25.11 | MC header file loads metadata | mcHeaderStore populated, UI labels updated | NEW |
| 25.12 | MC display name override works | Chart title uses override name | NEW |
| 25.13 | MC parser summary logged | Console shows "MC PARSER SUMMARY" | NEW |
| 25.14 | MC rule queue renders separately | Standard in queueList, MC in mcQueueList | NEW |
| 25.15 | Switching parser mode resets UI | MC panel hidden, standard panel visible | NEW |

#### Group 26: Restored Features Regression

| TC# | Test Case | Expected | Priority |
|-----|-----------|----------|----------|
| 26.1 | Timeline gap detection works | Null points inserted at gaps | NEW |
| 26.2 | Gap visualization plugin active | Gaps shown as dashed line regions | NEW |
| 26.3 | Chart copy to clipboard works | Chart image in clipboard | NEW |
| 26.4 | CSV timestamp format auto-detection | Format auto-detected and applied | NEW |
| 26.5 | Chart aspect ratio preserved in PDF | Charts not stretched/squished | NEW |
| 26.6 | Busy overlay shown during PDF generation | Semi-transparent overlay visible | NEW |
| 26.7 | Copy button hidden during PDF export | `.chart-copy-btn` display:none | NEW |

### 6.3 Phase 5 — Bug Fixes & New Feature (F100–F102)

| ID | Feature | Function(s) | Source |
|----|---------|-------------|--------|
| F100 | PDF Full Data Zoom Reset Fix | `_runPdfExport()` — `update('none')` + double-rAF for reliable canvas capture | Bug Fix |
| F101 | PDF Save Picker User Gesture Fix | `_runPdfExport()` — early `showSaveFilePicker()` call before chart reset | Bug Fix |
| F102 | MC Overlay Exclusion | `addMcRule()`, `editMcRule()`, `generateDashboard()` overlay filter, `renderMcQueue()` | New Feature |
| F103 | Multi-Key Overlay | `selOverlayKey` multi-select, `addMcRule()` `_overlayKeys` array, `generateDashboard()` multi-key grouping | Enhancement |
| F104 | Overlap Indicator (Tooltip) | `makeChartOptions()` — `interaction:{mode:'index'}` + `afterBody` callback detecting overlapping KPI values | Enhancement |
| F105 | KPI Dash Legend | Overlay rendering — SVG dash-pattern legend bar mapping line styles to KPI names | Enhancement |
| F106 | MC Parser Strict Number Detection | `processFilesFromUI()` MC branch — `Number()` replaces `parseFloat()` to preserve IPv4/IPv6/alphanumeric values | Bug Fix |
| F107 | Overlay Overlap Point Markers | `generateDashboard()` overlay — distinct `pointStyle` per overlay group (circle, triangle, rect, rectRot, star, cross, crossRot) with adaptive `pointRadius`, SVG marker shapes in color key bar | Enhancement |

#### Group 27: PDF Full Data Zoom Reset (F100)

| TC# | Test Case | Expected | Priority |
|-----|-----------|----------|----------|
| 27.1 | Zoom a chart, export Full Data PDF | Charts in PDF show full data range, not zoomed view | NEW |
| 27.2 | Pan a chart, export Full Data PDF | Charts in PDF show complete data range from start | NEW |
| 27.3 | Export Current View PDF after zoom | PDF captures the zoomed/panned state exactly | NEW |

#### Group 28: Directory Selection Reliability (F101)

| TC# | Test Case | Expected | Priority |
|-----|-----------|----------|----------|
| 28.1 | Export PDF in Chrome/Edge | System save file picker dialog appears BEFORE busy overlay | NEW |
| 28.2 | Export rules JSON in Chrome/Edge | System save file picker dialog appears | NEW |
| 28.3 | Cancel save dialog | "PDF: Export cancelled." logged, no file saved, no overlay shown | NEW |

#### Group 29: MC Overlay Exclusion (F102)

| TC# | Test Case | Expected | Priority |
|-----|-----------|----------|----------|
| 29.1 | Overlay mode with no exclusions | All distinct overlay values plotted | NEW |
| 29.2 | Exclude single value (e.g. "116") | Value removed from chart and color key bar | NEW |
| 29.3 | Exclude multiple values ("116, 117") | All specified values removed | NEW |
| 29.4 | Exclude value with special chars: `Cell (A)`, `gw-001`, `[Test]` | Correctly matched and excluded | NEW |
| 29.5 | Edit rule with exclusions | Exclusion input populated with saved values joined by ", " | NEW |
| 29.6 | Empty exclusion input | No filtering applied, all values plotted | NEW |

#### Group 30: Multi-Key Overlay (F103)

| TC# | Test Case | Expected | Priority |
|-----|-----------|----------|----------|
| 30.1 | Select 1 overlay key, generate | Single-key groups (backward compatible behavior) | NEW |
| 30.2 | Select 2 overlay keys, generate | Combined groups "val1 \| val2" in chart and color key | NEW |
| 30.3 | Edit rule with multi-key | All keys restored as selected in multi-select | NEW |
| 30.4 | Import old rule with `_overlayKey` string only | Treated as single-key array via normalization | NEW |
| 30.5 | Exclude combined values (e.g. "116 \| A") | Exclusion matches multi-key format | NEW |
| 30.6 | Queue label shows multi-key | "overlay[key1,key2]" displayed in rule queue | NEW |

#### Group 31: Overlap Indicator (F104, F105)

| TC# | Test Case | Expected | Priority |
|-----|-----------|----------|----------|
| 31.1 | Hover shows all datasets at x-index | Full tooltip with all dataset values at that index | NEW |
| 31.2 | Overlapping KPIs flagged in tooltip | Tooltip shows warning section with overlapping KPI names | NEW |
| 31.3 | Non-overlapping values — no indicator | No "Overlapping" section in tooltip | NEW |
| 31.4 | Dash legend for 2+ KPIs in overlay | "KPIs:" bar with SVG line segments matching dash patterns | NEW |
| 31.5 | Single KPI in overlay — no dash legend | Dash legend bar not rendered | NEW |

#### Group 32: MC Parser Strict Number Detection (F106)

| TC# | Test Case | Expected | Priority |
|-----|-----------|----------|----------|
| 32.1 | Overlay key with IPv4 value `192.168.1.1` | Preserved as string, not mangled to `192.168` | NEW |
| 32.2 | Overlay key with IPv6 value `2001:db8::1` | Preserved as string, not truncated to `2001` | NEW |
| 32.3 | Overlay key with alphanumeric `3GPP-v2` | Preserved as string, not truncated to `3` | NEW |
| 32.4 | Pure numeric KPI value `-85` | Stored as number `-85` | NEW |
| 32.5 | Overlay key `10.0.0.254` in chart legend | Full IP shown in dataset label and color key bar | NEW |

#### Group 33: Overlay Overlap Point Markers (F107)

| TC# | Test Case | Expected | Priority |
|-----|-----------|----------|----------|
| 33.1 | Overlay chart with 3 groups, same KPI values at a timestamp | All 3 point markers visible (circle, triangle, rect) at overlap | NEW |
| 33.2 | Point marker shapes differ per overlay group | 1st group=circle, 2nd=triangle, 3rd=rect, 4th=rectRot, etc. | NEW |
| 33.3 | Color key bar shows SVG marker shapes | Each overlay value label shows its marker shape in matching color | NEW |
| 33.4 | Adaptive point radius — small dataset (<40 points) | pointRadius=2.5 for clear visibility | NEW |
| 33.5 | Adaptive point radius — medium dataset (40-80 points) | pointRadius=2 to reduce clutter | NEW |
| 33.6 | Adaptive point radius — large dataset (>80 points) | pointRadius=1.5 for minimal clutter | NEW |
| 33.7 | Hover over data point shows enlarged marker | pointHoverRadius = pointRadius + 3 | NEW |
| 33.8 | Overlapping data points with tooltip | Tooltip shows ⚠ Overlapping section listing identical KPIs | NEW |
| 33.9 | Non-overlapping data points at same timestamp | Different marker shapes visible at distinct y-positions | NEW |
| 33.10 | 7+ overlay groups cycle through all point styles | ptStyles array wraps around at index 7 | NEW |

### 6.4 Summary of v2.2.0 Changes

| Item | Count |
|------|-------|
| New Features Added (F75-F107) | 33 |
| New Test Cases (Groups 19-33) | 105 |
| Bug Fixes Applied | 16 (SEC3, H1-H5, M1-M2, M4-M5, M7, SEC2, SEC4, SEC9, F100, F101, F106) |
| User Feedback Items Addressed | 8 + 1 new feature + 4 enhancements + 1 parser fix |

---

*Generated by KPI Analysis Tool Code Review — 2026-03-09 (Updated for v2.2.0 Phase 6)*
