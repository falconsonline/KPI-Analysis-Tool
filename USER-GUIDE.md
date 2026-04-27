# KPI Analysis Tool — User Guide

**Version:** 3.4.0 | **Author:** Shiju Abraham | **Updated:** 2026-04-27

---

## Table of Contents

1. [Overview](#1-overview)
2. [Getting Started](#2-getting-started)
3. [Supported Data Formats](#3-supported-data-formats)
4. [Loading Data Files](#4-loading-data-files)
5. [Building Analysis Rules](#5-building-analysis-rules)
6. [Multi-Component (MC) Analysis](#6-multi-component-mc-analysis)
   - [6.8 Annotation-less Files — Group by Column](#68-annotation-less-files--group-by-column)
   - [6.9 Overlay Charts — Dimension Label](#69-overlay-charts--dimension-label)
   - [6.10 Wildcard Component Selection — ★ All](#610-wildcard-component-selection---all)
   - [6.11 Component Overlay — All Components in One Chart](#611-component-overlay--all-components-in-one-chart)
7. [Multi-File Analysis & Running Sequences](#7-multi-file-analysis--running-sequences)
8. [Dashboard & Charts](#8-dashboard--charts) *(v3.1: Refresh All button)*
9. [Threshold Alerts & Visual Indicators](#9-threshold-alerts--visual-indicators)
10. [Formula Mode](#10-formula-mode)
11. [Mixed Mode — Direct + Formula on One Chart](#11-mixed-mode--direct--formula-on-one-chart)
12. [Multi-Series Mode — Multiple Direct + Multiple Formulas](#12-multi-series-mode--multiple-direct--multiple-formulas)
13. [Timestamp Formats](#13-timestamp-formats)
14. [Exporting Results](#14-exporting-results)
15. [Master Config & Profiles](#15-master-config--profiles) *(includes mixed-profile workflow)*
   - [15.5 Profile Creation Walkthrough — All Formats](#155-profile-creation-walkthrough--all-formats)
   - [15.5.2 flatCsv](#1552-format-flatcsv)
   - [15.5.3 logPipe](#1553-format-logpipe)
   - [15.5.4 multiComp](#1554-format-multicomp--multi-component-mc-data)
   - [15.5.5 Rule Modes Reference](#1555-rule-modes-reference)
   - [15.5.6 Match Scoring Quick Reference](#1556-match-scoring-quick-reference)
   - [15.5.7 Complete Profile Templates](#1557-complete-profile-template--copy-and-customise)
16. [Tips & Troubleshooting](#16-tips--troubleshooting)

---

## 1. Overview

The KPI Analysis Tool is a self-contained, browser-based application for analysing KPI metrics from structured log and CSV files. It requires no installation, no server, and no internet connection — open the HTML file directly in any modern browser.

**Key capabilities:**
- Parse three data formats: Log-Pipe, Flat CSV, Multi-Component CSV
- Build rule-based charts with direct, ratio, and formula analysis modes
- Visual warning and critical threshold lines on every chart
- Multi-file analysis with automatic running-sequence collation
- Threshold breach alerts with timestamp and severity
- Synchronised zoom/pan across all charts
- PDF export and rule import/export
- Live data via WebSocket (optional server required)

---

## 2. Getting Started

1. Open `KPI-Analysis-Tool.html` (or `KPI-Analysis-Tool-debug.html` for debug logging) in Chrome, Edge, or Firefox.
2. Upload one or more data files using the **drop zone** or the file picker.
3. Select the parser mode (Auto-Detect works for most files).
4. Click **Initialize Analysis** to parse the files.
5. Select metrics and build rules in the Rule Builder panel.
6. Click **GENERATE DASHBOARD** to render charts.

---

## 3. Supported Data Formats

### 3.1 Log-Pipe Format

Pipe-delimited rows where each line is one time sample. Fields are positional.

```
Jan 15 | 08:00:00 | Instance-1 | SeqNo | KPI1,100,KPI2,95,KPI3,42
Mon Jan 15 | 08:00:00 | NodeA | 1 | MSU Received/min,500,MSU Sent/min,480
```

**Rules:**
- At least 5 pipe-separated segments required.
- Segment 1 = timestamp (optional day-of-week prefix is stripped).
- Segment 5+ = comma-separated key-value pairs (`KPI_name,value`).
- Day-of-week prefixes (Mon–Sun) are automatically stripped.

---

### 3.2 Flat CSV Format

Standard CSV where each row is one time sample and columns are KPI values.

```
TIMESTAMP,CPU_util,Mem_used,Disk_io
2026-01-31,08:00:00,45.2,62.1,120
2026-01-31,08:01:00,47.8,63.4,135
```

**Rules:**
- First column(s) = timestamp (date + time, or single combined column).
- Remaining columns = KPI numeric values.
- Header row optional; configurable via the **CSV Options** panel.
- Manual column headers can be specified to override auto-detection.

---

### 3.3 Multi-Component (MC) CSV Format

CSV where multiple rows share the same timestamp, each row representing a different component (device, interface, process, etc.).

**Annotated variant** — key columns carry `Name(value)` annotations:
```
TIMESTAMP,Device:(sdb),r/s,w/s,rkB/s,wkB/s,svctm,%util
260131 00:00,sdb,89.40,4.20,611.40,946.40,0.79,7.36
260131 00:00,sdc,0.00,0.00,0.00,0.00,0.00,0.00
```

**Plain variant** — no annotations; key column identified via the **Group by column** picker (v2.6+):
```
Time,Device,r/s,w/s,rkB/s,wkB/s,avgrq-sz,avgqu-sz,await,svctm,%util
260131 00:00,sda,2.95,0.21,47.97,2.72,33.97,0.00,1.66,1.57,0.50
260131 00:00,sdb,89.40,4.20,611.40,946.40,14.36,0.07,0.79,0.79,7.36
```

**Rules:**
- Column 0 = timestamp (single combined column) or columns 0 + 1 (Date + Time).
- One column = component key identifying each row's device/process (e.g. Device in column 1).
- Remaining columns = KPI values for that component.
- Use the **Multi-Component builder panel** to select components and KPIs.
- For plain variant files, use the **Group by column** dropdown in CSV Options to designate the key column (see Section 6.8).

---

## 4. Loading Data Files

### 4.1 Upload

Drag files onto the drop zone, or click the zone to open the file picker. Multiple files can be selected at once. Supported extensions: `.csv`, `.txt`, `.log`, `.xls`.

> **`.xls` files:** The tool accepts `.xls` files in two forms:
> - **True binary XLS** (Excel 97–2003 Workbook format): automatically detected and converted to CSV via SheetJS. The first sheet is used; the sheet name and count are logged. If your data is on a later sheet, move it to Sheet 1 and re-save.
> - **Plain-text CSV renamed to `.xls`** (a common practice): automatically detected as text and read directly — no conversion step needed.
>
> Note: `.xlsx` (Office Open XML format) is **not** supported. Save as `.xls` or export to `.csv` first.

> **Binary file guard (v3.3.0):** When a file is uploaded, the tool samples its first 8 KB to confirm it contains comma-separated text. If a null byte or more than 10% control characters are detected, the file is rejected and a pop-up error lists the skipped filenames. All other files in the same upload load normally. A `.xls` file that tests as binary is routed to the XLS converter instead of being rejected.

### 4.2 Parser Mode

| Mode | When to use |
|---|---|
| **Auto-Detect** | Default — works for most files |
| **Log-Pipe** | Force pipe-delimited log format |
| **Flat CSV** | Force standard CSV format |
| **Multi-Component** | Force MC CSV (iostat, per-device logs) |

### 4.3 CSV Options

Expand the **CSV Options** section when using Flat CSV or MC format:

- **Header row present** — tick if row 1 contains column names.
- **Manual headers** — type comma-separated names to override auto-detected headers (e.g. `Date,Time,CPU,Mem,Disk`).
- **Timestamp format** — choose `Auto`, `Date + Time (2 cols)`, or `Single timestamp column`.
- **Group by column** *(MC format only)* — designate which column holds the component identifier (e.g. `Device`). Use this when the file has no `Name(value)` annotations and auto-detection cannot find the key column. The dropdown is populated automatically as soon as a file is loaded and **First row is Header** is checked — no need to click Initialize Analysis first. Changing the **Timestamp Format** selection also triggers a refresh so the correct columns (excluding timestamp columns) are listed. See [Section 6.8](#68-annotation-less-files--group-by-column).

### 4.4 KPI Pattern Filter

Enter a text pattern to restrict which KPI lines are loaded (Log-Pipe mode). Supports:
- Plain text: `CPU` — loads only lines containing "CPU".
- Label syntax: `MyLabel:CPU` — loads lines matching "CPU" and labels them "MyLabel".
- Upload a pattern file for bulk filter lists.

### 4.5 Search Directory for Files (v3.4.0)

The **Search Directory for Files** feature lets you recursively search a local folder by filename pattern, load all matching files, and merge them into a single continuous dataset per rule — without manually selecting files one by one.

**How to use:**

1. Tick **Search Directory for Files** to reveal the panel.
2. Click **Choose Directory** and select the root folder to search.
3. Type a **File Name Pattern** such as `iostat_cpu.txt`, `*free*.log`, or `DBW.csv`.
4. The tool automatically runs the search and starts **Initialize Analysis** as soon as **both** a directory is selected and a pattern is entered — regardless of order. You do not need to click any button.

**Behaviour:**

- The found-files list displays the **relative path** from the chosen directory root (e.g. `server1/iostat_cpu.txt`, `server2/iostat_cpu.txt`), so files with identical names in different sub-folders are shown and stored distinctly.
- All matched files are automatically **combined** into a single dataset. Charts produced by the Rule Builder span the entire dataset from all files, sorted by timestamp — one graph per rule, not one graph per file.
- A **Cancel Search** button appears while the tool is reading files. Click it to stop mid-way; any files already read are retained.
- The **Activity Console** opens automatically when directory search starts, so the **⬇ Download Log** button is immediately accessible without needing to click the console header.

**Supported patterns:**

| Pattern | Matches |
|---------|---------|
| `iostat_cpu.txt` | Exact filename |
| `*cpu*` | Any filename containing "cpu" |
| `free?.log` | "free" + one character + ".log" |

**Notes:**

- Only `.csv`, `.txt`, `.log`, and `.xls` files are considered. Other extensions are silently skipped.
- Binary files found during the search are logged and skipped (or converted if `.xls`).
- The search is case-insensitive.
- If you want to search a different directory or change the pattern, update the fields — the auto-trigger fires again on each change.

### 4.6 Initialize Analysis

After uploading files and configuring options, click **Initialize Analysis**. The tool parses all files and populates the metric selector in the Rule Builder. The **Inventory** panel shows each parsed file with its row count.

> When using **Search Directory for Files**, Initialize Analysis runs automatically — you do not need to click this button.

### 4.7 Selecting a File

Click a file row in the Inventory to make it the active dataset for dashboard generation. The active row is highlighted.

---

## 5. Building Analysis Rules

Rules define which metrics to chart and how to analyse them. Each rule produces one chart on the dashboard.

### 5.1 Chart Title

Enter a descriptive title for the chart (e.g. `Memory Utilisation`).

### 5.2 Analysis Modes

Five modes are available. Choose based on what you want to plot:

| Mode | Best for |
|---|---|
| **Direct Value** | Plot one or more raw metrics as separate lines |
| **Ratio %** | Express each metric as a percentage of a common denominator |
| **Formula f(x)** | Derive a single result from a math expression (e.g. a computed %) |
| **Mixed (Direct + Formula)** | Show raw metric lines **alongside** one formula result in the same chart |
| **Multi-Series** | Combine any number of direct metrics and formula results in one chart |

#### Direct Value
Plots raw metric values as-is. Each selected metric becomes its own line.

#### Ratio %
The **first** selected metric is the denominator (100% reference). Each subsequent metric is plotted as a percentage of the denominator.

```
Example: denominator = total_requests
         metric A    = errors → plotted as (errors / total_requests) × 100
```

#### Formula f(x)
Evaluates a custom mathematical expression using selected metrics as variables. Plots the **derived result** as a single bold line.

```
Example formula: (free + shared + buffers) / total * 100
Result:          one bold line showing free memory %
```

See [Section 10](#10-formula-mode) for full formula syntax.

#### Mixed (Direct + Formula)
Plots one or more raw metric lines **plus** one formula result in the same chart. Useful when you want to see the source values and the derived metric together.

See [Section 11](#11-mixed-mode--direct--formula-on-one-chart) for setup and examples.

#### Multi-Series
Builds a chart from any combination of direct metrics and formula results — each added individually as a "series". No limit on the number of series. Each series gets its own label and optional Y-axis assignment.

See [Section 12](#12-multi-series-mode--multiple-direct--multiple-formulas) for setup and examples.

### 5.3 Selecting Metrics

Use the **Metrics** multi-select list. Hold `Ctrl` (Windows/Linux) or `Cmd` (Mac) to select multiple metrics. For Ratio mode, the first selected metric is the denominator.

### 5.4 Thresholds

Warning and critical thresholds are optional. When set:
- A **dashed amber line** `⚠` is drawn across the chart at the warning value.
- A **dashed dark-red line** `✕` is drawn at the critical value.
- Data points on the metric line are coloured **yellow** when ≥ warning, **red** when ≥ critical.
- Threshold breaches are listed in the **Alert Panel** with timestamp and severity.

Enter values in the **Warning** and **Critical** fields. Leave blank if not needed.

### 5.5 Adding to Queue

Click **+ Add to Queue**. The rule appears in the queue list below. You can:
- **Edit** a rule — re-populates the form; save with **+ Add to Queue**.
- **Delete** a rule — removes it from the queue.
- **Reorder** — use the ▲ ▼ arrows (shown when 2+ rules exist).

### 5.6 Generate Dashboard

Click **GENERATE DASHBOARD** to render all queued rules as charts. The dashboard clears and rebuilds each time.

---

## 6. Multi-Component (MC) Analysis

Use the **Multi-Component Builder Panel** when your data has one row per component per timestamp (e.g. iostat device data, per-interface counters).

### 6.1 Component Selector

Lists all detected component keys (e.g. device names: `sdb`, `sdc`, `APP_vg-opt_roamware_vol`). Select one or more components to include in the rule.

Two shortcut buttons sit above the list:

| Button | Action |
|---|---|
| **★ All** | Selects all currently listed components and stores the rule as a **wildcard** (see [Section 6.10](#610-wildcard-component-selection---all)) |
| **✕ None** | Deselects all components |

> **Tip:** Use **★ All** when the device/component names may differ across files or KPI collection runs. The wildcard resolves to whatever components are present at generation time — the saved rule stays portable. Combine with **Component Overlay** (Section 6.11) to put all components onto one chart.

### 6.2 KPI Selector

Lists available metric columns for the selected data. Select one or more KPIs to plot.

### 6.3 Display Name

Optional friendly name for the chart title when a single component is selected.

### 6.4 Aggregation Mode

When multiple components are selected:
- **SUM** — total across all selected components at each timestamp.
- **AVG** — average across all selected components at each timestamp.

Produces one combined chart instead of one chart per component.

### 6.5 Per-Second Conversion

Tick **Per-second** to divide all values by 60 (converts per-minute KPIs to per-second).

### 6.6 Per-Component Charts (no aggregation)

When aggregation is off, one chart is produced per selected component. Each chart shows all selected KPIs for that component.

### 6.7 MC Header File

Upload an MC Header file to provide friendly column names and key-field annotations. Header file format:

```
Date,Time,Inst,Device:(sdb),KPI1_Name,KPI2_Name,...
```

Annotate key columns with `(value)` to help the tool identify which columns are component identifiers.

---

### 6.8 Annotation-less Files — Group by Column

Some MC-style files have no `Name(value)` annotations and a single combined timestamp column — the component/device column appears immediately after the timestamp with no special marking:

```
Time,Device,r/s,w/s,rkB/s,wkB/s,avgrq-sz,avgqu-sz,await,svctm,%util
260131 00:00,sda,2.95,0.21,47.97,2.72,33.97,0.00,1.66,1.57,0.50
260131 00:00,sdb,89.40,4.20,611.40,946.40,14.36,0.07,0.79,0.79,7.36
260131 00:01,sda,3.10,0.18,45.30,2.40,31.20,0.01,1.50,1.40,0.48
260131 00:01,sdb,91.20,3.80,590.10,910.20,13.80,0.08,0.82,0.81,7.58
```

Auto-detection cannot find the key column in this layout because `Device` is at column index 1 (auto-detection only scans columns 3–7). The **Group by column** dropdown solves this.

#### Step-by-step: iostat device analysis

> **Prerequisite:** The `%util` column name is invalid for formulas (the `%` character is not allowed in token names). If you plan to use `%util` in a formula, rename it first via Manual Headers (e.g. `util_pct`). For direct charting, `%util` can remain as-is.

**Step 1 — Upload the file**

Drag `iostat_device.txt` (or `.csv`) onto the drop zone, or use the file picker.

**Step 2 — Set Parser Mode**

In the **Parser Mode** dropdown, select **Multi-Component CSV**.

**Step 3 — CSV Options**

Expand (or look for) the **CSV Options** section which becomes visible when MC format is selected:

| Option | Setting |
|---|---|
| First row is Header | ✓ **checked** |
| Manual Headers | *(leave blank — the file already has a header row)* |
| Timestamp Format | **Col 1 = Timestamp** (`singleTs`) |
| **Group by column** | **Device** |

> The **Group by column** dropdown is populated after you select the format and check the header box. It lists all non-timestamp columns. Select `Device`.

**Step 4 — Initialize Analysis**

Click **Initialize Analysis**. The tool parses the file using column 1 (`Device`) as the component key. The **Inventory** panel shows the file with its row count. The **Multi-Component builder panel** activates.

**Step 5 — Build an MC rule (example: svctm per device)**

Switch to the **Multi-Component Builder Panel**:

1. **Components** — the selector now lists each unique device value found in the file: `sda`, `sdb`, etc. Select the devices you want to chart (Ctrl/Cmd+click for multiple). Click **★ All** to select all devices and store the rule as a portable wildcard that works across files with different device names (see [Section 6.10](#610-wildcard-component-selection---all)).
2. **Chart Title** — enter `IO Service Time`.
3. **KPI(s)** — select `svctm`.
4. **Mode** — `Direct Value`.
5. **Warning Threshold** — enter `10` (ms; adjust to your environment).
6. **Critical Threshold** — enter `50` (ms).
7. Leave **Aggregate** unchecked — you want one chart per device.
8. Click **Add MC Rule to Queue**.

**Step 6 — Generate Dashboard**

Click **GENERATE DASHBOARD**. Results:

- One chart per selected device (`IO Service Time (sda)`, `IO Service Time (sdb)`, …).
- Each chart shows `svctm` over time as a solid line.
- A dashed **amber** line at 10 ms (warning) and a dashed **dark-red** line at 50 ms (critical).
- The **Alert Panel** lists every timestamp where any device's svctm ≥ threshold, labelled with the device name: `svctm [sdb] = 11.2 at 2026-01-31 00:05`.

#### Adding more rules

Repeat Step 5 for each metric you want to chart. Common iostat rules:

| Chart Title | KPI | Threshold | Notes |
|---|---|---|---|
| `Read IOPS` | `r/s` | — | Direct, per device |
| `Write IOPS` | `w/s` | — | Direct, per device |
| `IO Util %` | `%util` | warn 70, critical 90 | Select all devices |
| `IO Service Time` | `svctm` | warn 10, critical 50 | ms threshold |
| `Await` | `await` | warn 20, critical 100 | ms, total IO latency |

#### Saving as a profile

After validating the charts, click **Save/Add new Profile to Master Config** in the Inventory panel. Future loads of similarly-structured iostat files will auto-match this profile and restore the rules.

---

### 6.9 Overlay Charts — Dimension Label

When a rule uses **Overlay mode** (showing multiple groups as separate lines on a single chart), a subtitle appears immediately below the chart title:

```
Overlay by: Device  ·  3 groups  ·  sda / sdb / sdc
```

This confirms which dimension is driving the grouping and lists the group values. Up to 5 values are shown inline; if there are more, the label ends with `…`.

The overlay chip bar below the subtitle shows one coloured chip per group. Click a chip to hide/show that group; Shift-click to isolate it (solo mode). The **All** button restores all groups.

---

### 6.10 Wildcard Component Selection — ★ All

When you click **★ All** in the component selector and then **Add MC Rule to Queue**, the rule stores a **wildcard** (`__auto__`) instead of the explicit list of device names. At dashboard generation time the wildcard expands to all components currently loaded in the file.

#### Why this matters

Device and component names vary across files and collection periods. A rule saved with explicit names (e.g. `["sda", "sdb"]`) will silently produce no charts if a different file has `["nvme0n1", "nvme1n1"]`. The wildcard avoids this by always matching whatever is present.

#### Behaviour

| Scenario | Result |
|---|---|
| Rule added with ★ All, same file reloaded | All components appear in the charts |
| Rule added with ★ All, different file loaded (different device names) | All components from the new file appear |
| Rule exported to JSON | Saved as `"compKeys": ["__auto__"]` — not the expanded list |
| Rule imported to Master Config | Wildcard preserved; expands at generation time |
| Profile saved via Save Profile | Wildcard stored; shown in profile as `* (all components at load time)` |

#### When to use

- **iostat / per-device files** where disk names differ per server.
- **Per-interface or per-process logs** where process names change between runs.
- Any MC file where you want a "catch-all" rule that does not need per-file editing.

#### When to use explicit selection instead

- When you want only a **specific subset** of components (e.g. only `sdb` and `sdc`) regardless of what else is in the file.
- When component count varies wildly between files and you want to guard against accidentally charting dozens of unexpected entries.

---

### 6.11 Component Overlay — All Components in One Chart

By default, a Multi-Component rule produces **one chart per selected component** (e.g. a separate chart for `sda`, `sdb`, `sdc`). The **Component Overlay** option merges all selected components onto a **single chart**, with one line per component.

#### When to use

| Scenario | Recommended |
|---|---|
| Compare `sda` vs `sdb` trend side-by-side | **Component Overlay ✓** |
| Inspect each device independently with its own scale | Per-component (default) |
| Aggregate total IOPS across all devices | Aggregate mode |
| Show multiple KPIs per device | Per-component (default) |

#### How to enable

In the MC Rule Builder, under the Aggregate/Per-second options, tick:

> **📈 Component Overlay — single chart with all selected components as lines**

- Incompatible with **Aggregate** (checking one unchecks the other automatically).
- Compatible with all analysis modes: Direct, Ratio, Formula.
- Compatible with **★ All** wildcard — the overlay expands to all loaded components at generation time.

#### Chart output (v3.2.2+)

- **One chart per KPI** is produced. If you select 3 KPIs, you get 3 charts.
- Each component gets a distinct **colour** and is one line per chart.
- The chart title includes the KPI name when multiple KPIs are selected: `IO Service Time — svctm`.
- A subtitle appears: `Components: sda / sdb / sdc · 3 groups`.

#### Chip bar (toggle / solo)

A row of coloured chips appears above the chart, one per component:

| Interaction | Effect |
|---|---|
| Click a chip | Toggle that component's line(s) on / off |
| Shift + click | Solo mode — hide all other components |
| Click **All** button | Restore all components |

The stats table below the chart updates to show only the currently visible components.

#### Example — IO Service Time across all devices

1. Select all devices with **★ All** (or Ctrl+click individual ones).
2. Set Chart Title to `IO Service Time`.
3. Select KPI `svctm`.
4. Tick **Component Overlay**.
5. Set Warning threshold `10`, Critical `50`.
6. Click **Add MC Rule to Queue** → **GENERATE DASHBOARD**.

**Result:** One chart with `sda`, `sdb`, etc. as separate coloured lines. Click a chip to hide a device. The alert panel lists breaches per device: `svctm [sdb] = 11.2 at …`.

---

## 7. Multi-File Analysis & Running Sequences

### 7.1 Analyze All Files

After loading and initialising multiple files, click **ANALYZE ALL FILES** (the darker green button below GENERATE DASHBOARD). This:

1. Groups all loaded files by their **filename prefix** (see Section 7.2).
2. For each group, merges and sorts data chronologically.
3. Generates a separate labelled **chart section** per group in a single scrollable dashboard.
4. Shows combined stats and alerts across all files at the bottom.

This does not change the currently selected file — the existing selection is restored after the operation.

### 7.2 Running Sequence Detection

Files that are periodic rotations of the same data source share a common filename prefix and a timestamp suffix in the name:

```
app.20260321-120000.csv   ← prefix: "app"
app.20260321-125000.csv   ← prefix: "app"
app.20260322-000000.csv   ← prefix: "app"
```

**Naming patterns recognised:**
- `<prefix>.<YYYYMMDD>-<HHMMSS>.<ext>` — e.g. `iostat.20260131-000000.csv`
- `<prefix>_<YYYYMMDD>_<HHMMSS>.<ext>` — e.g. `iostat_20260131_000000.csv`
- `<prefix>-<digits>.<ext>` — e.g. `DBW-1.csv`, `DBW-123.log`, `app-001.txt`
- `<prefix>_<digits>.<ext>` — e.g. `DBW_1.csv`, `DBW_123.log`, `app_001.txt`
- Files without a timestamp suffix: treated individually, grouped by stem name.

When 2+ files share a prefix, they are **collated** — all rows merged and sorted by timestamp — and displayed as one section labelled:
```
app  (3 files — running sequence)
```

### 7.3 Section Headers

Each file/group gets a left-bordered section header in the dashboard. The existing **GENERATE DASHBOARD** button always generates a single-file dashboard using the currently selected file — its behaviour is unchanged.

---

## 8. Dashboard & Charts

### 8.1 Chart Layout

Each rule produces one chart card containing:
- **Title bar** with the chart name and a **Copy** button.
- **Line chart** (Chart.js) with the metric lines and optional threshold indicator lines.
- **Stats table** below the chart showing Min, Max, Avg, and Count for each metric.

### 8.2 Zoom & Pan

- **Drag** on a chart to zoom into a time range.
- **Ctrl + drag** to pan.
- All charts synchronise — zooming one zooms all others to the same X range.
- Click **RESET VIEW** in the dashboard meta bar to restore full data view.

### 8.3 Gap Detection

If the data contains large time gaps (> 1.5× the minimum interval), a visual shaded gap is inserted so the line does not stretch misleadingly across missing time.

### 8.4 File Context Bar (v3.2+)

When you click a file in the Inventory to select it, a **file context bar** appears at the top of the Rule Builder panel showing the exact settings used to parse that file:

```
📄 free.txt   Format: Flat CSV · Header row: yes · 847 rows · 12 metrics
```

This confirms what format was detected, whether a header row was consumed, how many data rows were parsed, and how many metrics are available. The **Metrics list immediately below** is filtered to show only the tokens from that file — not a combined union of all loaded files.

If you want to re-parse the file with different settings (e.g. change the format or header checkbox), adjust the controls in the **CSV Options** area at the top and click **Initialize Analysis** again.

### 8.5 Active File Label

The meta bar above the dashboard shows which file (or group) is currently displayed. For **Analyze All Files** or when multiple files are loaded via MasterConfig, this shows `Multiple files (N)`.

### 8.5 Refresh All Button

The **↺ Refresh All** button appears in the dashboard meta bar as soon as multiple files are loaded — you do not need to generate a dashboard first. Clicking it:

- Regenerates charts for **all loaded files**, routing each file's profile rules to its own data.
- Appends MC overlay charts once at the end (not duplicated per file).
- Useful after changing a rule or threshold without needing to click **GENERATE DASHBOARD** per file.

### 8.5.1 No-Rules Placeholder Card

If a file has **no queued rules** (either because no profile is assigned or because a profile is assigned but no rules were added for it), the dashboard shows a **placeholder card** for that file instead of silently skipping it. The card:

- Displays the filename with an orange left border.
- Explains whether the file is unprofile or has a profile with no rules queued.
- Lists **all available metric names** (tokens parsed from that file) so you can see at a glance what KPIs it contains.
- Includes an **"Open in Inventory & Builder"** button that jumps directly to that file's metric list so you can add rules.

After adding rules via the builder, click **↺ Refresh All** to regenerate all charts including the newly-configured file.

### 8.6 Stats Panel

A summary stats table appears below the charts showing per-metric Min, Max, Mean, and Count across the full active dataset. Threshold indicator lines are excluded from stats.

---

## 9. Threshold Alerts & Visual Indicators

### 9.1 Visual Lines on Charts

When a threshold is set for a metric, horizontal dashed lines appear on that metric's chart:

| Line | Colour | Label format (standard) | Label format (`direction: "below"`) |
|---|---|---|---|
| Warning | Amber `⚠` | `MetricName ⚠ (60)` | `MetricName ⚠ below (30)` |
| Critical | Dark red `✕` | `MetricName ✕ (80)` | `MetricName ✕ below (10)` |

The lines span the full X-axis and zoom/pan with the chart. They appear in the chart legend and can be toggled by clicking the legend entry.

### 9.1.1 Direction-Aware Thresholds (`direction: "below"`)

By default, thresholds fire when a value is **at or above** the threshold level (e.g. high CPU usage). For metrics where **low values are bad** — such as available memory, idle CPU %, or disk free space — set the threshold direction to `"below"`:

**In a MasterConfig profile:**
```json
"thresholds": {
  "Free Memory %": {
    "warn": 25,
    "critical": 10,
    "direction": "below"
  }
}
```

- `direction: "below"` → breach fires when `value ≤ threshold` (instead of `≥`)
- Chart lines and alert panel labels include the word **below** to make the direction visually obvious: `MetricName ✕ below (10)`
- Works in all rule modes: direct, formula, mixed, multi-series, and MC.

### 9.2 Alert Panel

Below the dashboard, the **Alert Panel** lists every threshold breach found in the data:

```
[CRITICAL] svctm = 11.2  at 2026-01-31 00:05   rule: IO Service Time
[WARN]     %util = 7.36  at 2026-01-31 00:00   rule: IO Utilisation
```

Entries are colour-coded (red = critical, yellow = warn). The alert counter badge shows total breach count.

#### Enable / Disable Alerts (v3.2.3+)

An **Alerts on** checkbox appears in the Alert Panel header. Unchecking it:
- Immediately hides the alert panel.
- Prevents any threshold checks from running on the next dashboard generation.
- Persists for the session (resets to enabled on page reload).

This is useful when raw-value thresholds conflict with formula-derived % charts (e.g. a `free` rule whose warn threshold is 1 000 would falsely fire on `(used/total)*100` values if checked against the wrong dataset). Disable alerts while you review charts, then re-enable after adjusting thresholds.

### 9.3 Per-Device / Per-Component Alerts

In MC mode, threshold checks run on every component's data independently. Each breach entry in the Alert Panel includes the **device/component name in brackets** so you know exactly which component triggered it:

```
[CRITICAL] svctm [sdb] = 11.2  at 2026-01-31 00:05   rule: IO Service Time
[WARN]     svctm [sda] = 10.8  at 2026-01-31 00:07   rule: IO Service Time
```

The metric label format is `MetricName [ComponentKey]`. For annotation-less files using the Group by column picker, the component key is the raw value from the chosen column (e.g. `sda`, `sdb`).

---

## 10. Formula Mode

Formula mode derives a single value from a mathematical expression and plots it as one line. Use this when you want to see a **computed metric** (e.g. a percentage or ratio) rather than raw values.

### 10.1 How It Works

The tool evaluates the formula for every data point in time. The result is plotted as a **single bold solid line**. Source metrics are not shown on the chart (to avoid Y-axis scale conflicts — raw values in MB and a result in % cannot share the same axis sensibly).

If you also want to see the source metrics alongside the formula result, use [Mixed Mode](#11-mixed-mode--direct--formula-on-one-chart) or [Multi-Series Mode](#12-multi-series-mode--multiple-direct--multiple-formulas) instead.

### 10.2 Setting Up a Formula Rule

1. Set **Analysis Mode** → `Formula f(x)`.
2. In the **Metrics** multi-select, choose **all metrics referenced** in your formula. The tool uses this list to know which columns to fetch from the data.
3. Enter the expression in the **Formula** field.
4. Enter a **Result Label** — this is the name shown on the chart line and in the legend (and in the saved profile JSON).
5. Optionally tick **"Also show source metrics on secondary axis"** to render source metrics as thin dashed lines on the right Y-axis.
6. Set optional **Warning / Critical** thresholds — these apply to the **formula result**, not the source metrics.
7. Click **+ Add to Queue**.

### 10.3 Example: Free Memory Percentage

**Scenario:** Your flat CSV has columns `total`, `used`, `free`, `shared`, `buffers`, `cached`. You want a chart showing what percentage of RAM is freely available (free + shared + buffers).

| Field | Value |
|---|---|
| Chart Title | `Free Memory %` |
| Analysis Mode | `Formula f(x)` |
| Metrics (select all) | `total`, `free`, `shared`, `buffers` |
| Formula | `(free + shared + buffers) / total * 100` |
| Result Label | `Free Memory %` |
| Warning | `70` |
| Critical | `90` |

**What the chart shows:**
- One bold line tracking the free memory percentage over time.
- A dashed amber line at 70 % (warning threshold).
- A dashed dark-red line at 90 % (critical threshold).
- Alert panel reports any data points that breach those values.

**What NOT to do:** Do not set the formula threshold against the raw source values (e.g. `total = 8192 MB`). The tool correctly evaluates the formula result (58–59 %) and compares it against the thresholds (70 %, 90 %). The alert will only fire when the formula result itself exceeds the threshold.

### 10.4 Example: CPU User %

```
Formula:  user / (user + sys + idle) * 100
Label:    CPU User %
Warning:  75
Critical: 90
```

### 10.5 Formula Syntax Reference

| Operation | Syntax | Example |
|---|---|---|
| Addition | `a + b` | `free + buffers` |
| Subtraction | `a - b` | `total - used` |
| Multiplication | `a * b` | `r_await * r_s` |
| Division | `a / b` | `used / total * 100` |
| Parentheses | `(a + b) / c` | `(free + shared + buffers) / total * 100` |
| Constants | `a * 1000` | `bytes * 1024` |
| Unary minus | `-a` | `-delta` |

**Rules:**
- Token names must match **exactly** as shown in the Metrics list (case-sensitive).
- Spaces around operators are optional: `free+buffers` is the same as `free + buffers`.
- Division by zero returns `null` (gap in chart) — no crash, no infinite value.
- If the formula has a syntax error or references no known tokens, the rule is rejected at creation time with a warning message.
- The `%` character is not a valid token character. Rename columns like `%util` to `util_pct` via **Manual Headers** before use.

### 10.6 Thresholds in Formula Mode

- Thresholds are set once (single warn/critical pair) and applied to the **formula result**.
- In the saved profile JSON, the threshold is stored under the **Result Label** key — not the individual source token names.
- Example saved JSON for the Free Memory % rule:

```json
"thresholds": {
  "Free Memory %": {
    "warn": 70,
    "critical": 90
  }
}
```

---

## 11. Mixed Mode — Direct + Formula on One Chart

### 11.1 When to Use Mixed Mode

Use Mixed mode when you want to see **both** the raw source metrics **and** a formula result on the **same chart**. This is useful when:

- The source metrics and the formula result are in the **same units** and share the same Y-axis scale (e.g. MB values alongside a computed MB sum).
- You want to visually compare the components with the derived total.
- You have one formula to overlay on raw data.

If the source metrics and formula result are in **different units** (e.g. raw MB values alongside a percentage), use the **dual Y-axis** option to give each its own scale.

If you need **more than one formula** on the same chart, use [Multi-Series Mode](#12-multi-series-mode--multiple-direct--multiple-formulas) instead.

### 11.2 How It Works

Mixed mode plots two types of line on one chart:

| Line type | Appearance | What it shows |
|---|---|---|
| **Direct metric** | Solid line | Raw metric value from the data |
| **Formula result** | Dashed line (thicker) | Computed value from the expression |

Each direct metric uses a distinct colour. The formula result line uses a blue dashed style so it is visually distinct.

### 11.3 Setting Up a Mixed Rule

1. Set **Analysis Mode** → `Mixed (Direct + Formula)`.
2. In the **Direct Metrics to Plot** multi-select, select the raw metrics you want to see as solid lines.
3. In the **Formula** field, enter the expression for the derived line.
4. Enter a **Result Label** for the formula line.
5. If the direct metrics and formula result have different units (e.g. MB vs %), tick **"Formula result on secondary (right) Y-axis"** to use independent scales.
6. Set optional thresholds — these apply to the **formula result** line.
7. Click **+ Add to Queue**.

### 11.4 Example A — Same Units (No Dual Axis)

**Scenario:** You want to see `total` memory (raw) alongside `free + shared + buffers` (a computed sum of available memory), both in MB on the same axis.

| Field | Value |
|---|---|
| Chart Title | `Memory: Total vs Available` |
| Analysis Mode | `Mixed (Direct + Formula)` |
| Direct Metrics | `total` |
| Formula | `free + shared + buffers` |
| Result Label | `Available Memory` |
| Dual Y-axis | *(unchecked — same units)* |
| Warning / Critical | *(blank)* |

**What the chart shows:**
```
Y-axis (MB)
  8192 ─── total (solid blue)
  4800 ─ ─ Available Memory (dashed, computed)
  ...
```

At any point in time, the gap between the two lines represents used memory.

### 11.5 Example B — Different Units (Dual Y-Axis)

**Scenario:** You want to see `total` memory in MB on the left axis, and `(free + shared + buffers) / total * 100` as a percentage on the right axis.

| Field | Value |
|---|---|
| Chart Title | `Memory: Raw + Free %` |
| Analysis Mode | `Mixed (Direct + Formula)` |
| Direct Metrics | `total` |
| Formula | `(free + shared + buffers) / total * 100` |
| Result Label | `Free Memory %` |
| Dual Y-axis | ✓ **checked** |
| Warning | `70` |
| Critical | `90` |

**What the chart shows:**
```
Left Y (MB)        Right Y (%)
  8192 ─── total      100 ─
                        70 ─ ─ ⚠ warning line
                        59 ─ ─  Free Memory % (dashed)
                        90 ─ ─ ✕ critical line
```

The two Y-axes are completely independent — the MB scale on the left does not interfere with the % scale on the right.

### 11.6 Thresholds in Mixed Mode

Thresholds apply to the **formula result line only**. Direct metric lines do not have separate thresholds in Mixed mode. The threshold is stored in the profile JSON under the Result Label:

```json
"thresholds": {
  "Free Memory %": { "warn": 70, "critical": 90 }
}
```

---

## 12. Multi-Series Mode — Multiple Direct + Multiple Formulas

### 12.1 When to Use Multi-Series Mode

Use Multi-Series mode when you need **any combination** of direct metric lines and formula result lines in a single chart. It is the most flexible mode and covers all cases where Mixed mode is insufficient:

- Multiple formula results on the same chart (e.g. CPU user % and CPU sys % both derived).
- Multiple direct metrics plus multiple derived metrics together.
- Series that need different Y-axis assignments (some on the left, some on the right).

### 12.2 How It Works

Instead of selecting metrics from a list, you build a **series list** — each series is either a **Direct** entry (one raw metric) or a **Formula** entry (one derived result). You add series one at a time. Each series has:

| Property | What it sets |
|---|---|
| Type | Direct or Formula |
| Token / Expression | Which metric to read, or which formula to evaluate |
| Label | Name shown on the chart line and legend |
| Y-Axis | Left Y or Right Y — independent scale assignment per series |

### 12.3 Setting Up a Multi-Series Rule

1. Set **Analysis Mode** → `Multi-Series (Direct + Formulas)`.
2. The Metrics multi-select is replaced by the **Series List** builder.
3. Click **+ Direct Metric** to add a raw metric series:
   - Choose the token from the dropdown.
   - Enter a label (optional — defaults to the token name).
   - Choose **Left Y** or **Right Y**.
4. Click **ƒ Formula** to add a derived series:
   - Enter the formula expression.
   - Enter a label for the result line.
   - Choose **Left Y** or **Right Y**.
5. Repeat steps 3–4 for every series you want on the chart.
6. Set optional **Warning / Critical** thresholds (applied to all formula series in the rule).
7. Click **+ Add to Queue**.

**Removing a series:** Click the red `✕` button on the right of any row.

### 12.4 Visual Style

| Series type | Line style | Purpose |
|---|---|---|
| Direct | Solid, medium weight | Raw metric value |
| Formula | Dashed, heavier weight | Derived / computed result |

Direct series rotate through a colour palette. Formula series use a blue-family palette starting at `hsl(200)`.

### 12.5 Example A — Memory Overview (same axis)

**Scenario:** A flat CSV with columns `total`, `used`, `free`, `shared`, `buffers`, `cached`. You want one chart showing:
1. `total` — total RAM (raw)
2. `used` — used RAM (raw)
3. `free + shared + buffers` — available memory (computed sum)

All three are in MB, so all go on the **Left Y** axis.

**Series list:**

| Type | Token / Formula | Label | Axis |
|---|---|---|---|
| Direct | `total` | Total RAM | Left Y |
| Direct | `used` | Used RAM | Left Y |
| Formula | `free + shared + buffers` | Available | Left Y |

**What the chart shows:**
```
Y-axis (MB)
  8192 ─── Total RAM (solid)
  4200 ─── Used RAM (solid)
  4800 ─ ─ Available (dashed)
```

The available line is the computed sum — you can instantly see how used + available always adds up to total.

---

### 12.6 Example B — Memory Raw + Two Percentages (dual axis)

**Scenario:** You want to see `total` RAM in MB on the left axis, plus two computed percentages on the right axis: free memory % and cache %.

**Series list:**

| Type | Token / Formula | Label | Axis |
|---|---|---|---|
| Direct | `total` | Total RAM (MB) | Left Y |
| Formula | `(free + shared + buffers) / total * 100` | Free Memory % | Right Y |
| Formula | `(cached) / total * 100` | Cache % | Right Y |

**Thresholds:** Warning `70`, Critical `90` (applied to both formula series)

**What the chart shows:**
```
Left Y (MB)             Right Y (%)
  8192 ─── Total RAM      90 ─ ─ ✕ critical
                          70 ─ ─ ⚠ warning
                          59 ─ ─  Free Memory % (dashed)
                          12 ─ ─  Cache % (dashed)
```

Left and right Y-axes are independent — the MB scale does not distort the percentage scale.

---

### 12.7 Example C — CPU Breakdown

**Scenario:** A log file with CPU columns `user`, `sys`, `idle`, `iowait`. You want:
1. Each raw CPU component as a direct line.
2. A formula line for total active CPU (user + sys + iowait as a %).

**Series list:**

| Type | Token / Formula | Label | Axis |
|---|---|---|---|
| Direct | `user` | CPU User | Left Y |
| Direct | `sys` | CPU Sys | Left Y |
| Direct | `iowait` | CPU IOWait | Left Y |
| Formula | `(user + sys + iowait) / (user + sys + iowait + idle) * 100` | CPU Active % | Right Y |

**Thresholds:** Warning `75`, Critical `90` (applied to CPU Active % formula)

---

### 12.8 Example D — iostat Device Analysis

**Scenario:** Multi-component iostat data with columns `r/s`, `w/s`, `svctm`, `%util`. You want to see read and write IOPS as direct lines, plus a combined throughput formula.

> Note: `%util` contains `%` which is not a valid token character. Rename it to `util` using **Manual Headers** in CSV Options first.

**Series list:**

| Type | Token / Formula | Label | Axis |
|---|---|---|---|
| Direct | `r/s` | Read IOPS | Left Y |
| Direct | `w/s` | Write IOPS | Left Y |
| Formula | `r/s + w/s` | Total IOPS | Left Y |
| Direct | `svctm` | Service Time (ms) | Right Y |

---

### 12.9 Thresholds in Multi-Series Mode

- One warn/critical pair applies to **all formula series** in the rule.
- Direct series do not have threshold alerts in Multi-Series mode.
- Threshold indicator lines appear on formula series at the Y position matching their axis.
- In the saved profile JSON, the threshold is stored under the rule header:

```json
"thresholds": {
  "Memory Overview": { "warn": 70, "critical": 90 }
}
```

---

### 12.10 Mode Comparison Summary

| Need | Recommended mode |
|---|---|
| Plot raw metrics only | **Direct** |
| Express metrics as % of a total | **Ratio %** |
| Single computed KPI (e.g. a %) | **Formula f(x)** |
| 1 computed line + 1 or more raw lines | **Mixed** |
| 2+ computed lines, or 2+ raw + computed mix | **Multi-Series** |

---

## 13. Timestamp Formats

The tool auto-detects the timestamp format. All formats below are supported:

| Format | Example | Notes |
|---|---|---|
| `YYMMDD HH:MM` | `260131 00:00` | iostat default; X-axis shows `2026-01-31 00:00` |
| `YYYYMMDD HH:MM:SS` | `20260131 08:00:00` | Single-column space-separated |
| `YYYY-MM-DD,HH:MM:SS` | `2026-01-31,08:00:00` | Standard two-column CSV |
| `MMM DD \| HH:MM:SS` | `Jan 31 \| 08:00:00` | Log-pipe format |
| `DDD MMM DD \| HH:MM:SS` | `Mon Jan 31 \| 08:00:00` | Log-pipe with day-of-week prefix (stripped) |

### Notes on `YYMMDD HH:MM` (iostat format)

- The tool expands the 6-digit date using the current year's century prefix (`20` for 2026).
- X-axis labels display the full date: `2026-01-31 00:00`.
- Gap detection and chronological sorting work correctly.
- The `detectCsvTsFormat()` auto-classifier recognises this format as a single-column timestamp.

---

## 14. Exporting Results

### 14.1 PDF Export

Click the **Export PDF** button in the dashboard meta bar. Options:

- **Full Data** — exports the entire dashboard at full data range.
- **Current View** — exports the current zoomed view.

Enter a custom filename when prompted, or use the default.

### 14.2 Copy Chart

Each chart card has a **Copy** button in its title bar. This copies the chart image to the clipboard for pasting into documents or chat.

### 14.3 Rule Export

In the Rule Builder, use **Export Rules** to save the current rule queue as a JSON file. The file can be re-imported later with **Import Rules**.

### 14.4 Console Log

The console panel at the bottom of the page logs all parsing and chart events. Use **Copy Log** to copy all entries to the clipboard for sharing or debugging.

---

## 15. Master Config & Profiles

A Master Config JSON file pre-defines named profiles that map to specific data files. When a Master Config is loaded:

1. Each uploaded file is automatically scored against all profiles.
2. The **File ↔ Profile Assignment** modal always appears, showing each file's best-matched profile pre-selected.
3. Review the assignments — change any file's dropdown if the auto-match is wrong.
4. Click **Apply** to confirm. You can click **Skip** to clear all profiles and set everything up manually.

> **Why it always shows:** Even when all files score ≥ 80%, the auto-match can be wrong — for example, a vmstat file might match a profile by format/column count alone but have completely different column names. The modal gives you one clear confirmation step before rules are applied.

Use **↺ Refresh All** in the dashboard meta bar at any time to regenerate all charts (e.g. after adding or modifying a rule).

### 15.0 Mixed scenario: some files have profiles, some do not

The **File ↔ Profile Assignment modal** always appears when a Master Config is loaded:

**In the modal:**
- Files with a confident match (≥ 80%) show their matched profile pre-selected.
- Files with no match default to **"(No profile — manual setup)"**.
- Review, adjust if needed, then click **Apply / Confirm Assignments**.

**After the modal:**
1. The tool re-parses all files. Profile rules are queued for matched files and the dashboard auto-generates for all files.
2. The unmatched file's data is loaded; the dashboard shows a **placeholder card** for it (orange left border) listing all its available metrics and an **"Open in Inventory & Builder"** button.

**Adding rules for the unmatched file:**
3. Click **"Open in Inventory & Builder"** in the placeholder card, or click the **Analyze** button on the unmatched file's row in the **Inventory panel** to select it.
4. The **Graph Rule Builder** panel opens. A **file context bar** at the top confirms the file's format, header setting, row count, and available metric count — e.g. `📄 free.txt   Format: Flat CSV · Header row: yes · 847 rows · 12 metrics`.
5. The **Metrics** list is now filtered to show only the tokens parsed from that file. Select the metrics you want, set mode and thresholds, click **+ Add to Queue**. These manually added rules carry no profile tag and will be routed to this file by **↺ Refresh All**.
6. Repeat for each chart you want from that file.

**Generating the combined dashboard:**
7. Click **↺ Refresh All** in the dashboard meta bar (not the individual "GENERATE DASHBOARD" builder button).

`Refresh All` routes rules to files by profile tag:

| File | Which rules are used |
|---|---|
| File with Profile A | Only rules tagged `_sourceProfile = "Profile A"` |
| File with Profile B | Only rules tagged `_sourceProfile = "Profile B"` |
| File with no profile | Only manually added rules (no `_sourceProfile` tag) |

The result is one combined dashboard showing all files' charts in order.

> **Why not use "GENERATE DASHBOARD"?** The builder panel's GENERATE DASHBOARD button runs all queued rules against the single currently-active file. In a multi-file scenario that would evaluate Profile A and B rules against the wrong file's data. **↺ Refresh All** is the correct button for multi-file dashboards.

### 15.1 Profile Structure (MasterConfig.json)

```json
{
  "version": "1.0",
  "profiles": [
    {
      "name": "IO Statistics",
      "format": "multiComp",
      "headers": {
        "hasHeader": true,
        "keyLabels": {"1": "Device"},
        "kpiColumns": ["r/s", "w/s", "svctm", "%util"]
      },
      "rules": [...]
    }
  ]
}
```

### 15.2 Match Spec — Profile Identification Criteria

The `match` object in a profile defines how the tool scores a candidate file against the profile. The higher the score, the more confidently the file is auto-matched.

| Field | Points | Description |
|---|---|---|
| `columns` | 10 per col | Column type (`date`, `time`, `singleTs`, `sequence`) or regex pattern match |
| `allNumericFrom` | 10 | All columns from this index onward are numeric |
| `headerKeywords` | 5 each | File header contains these keyword substrings |
| `keyFields` | 10 each | Column at this index has ≤ N distinct values (low-cardinality categorical) |
| `requiredColumns` | 15 each | Column name exists in file header; **−20 if missing** (hard discriminator) |
| `expectedHeaders` | up to 30 | Exact column header row match (strongest discriminator) |

#### Token Mismatch Detection

When the **File ↔ Profile Assignment** modal is shown, each profile option in the dropdown is automatically checked against the file's header columns. If a profile's rules reference token names that **do not appear in the file's header row**, the option is marked with **⚠ token mismatch** in amber. A warning banner also appears below the dropdown for the auto-selected profile when tokens don't match.

This helps detect cases where two profiles share the same column structure (e.g. both `flatCsv` with vmstat-style columns) but have different semantic content — one profile's rules reference application-specific KPI names that don't exist in the system monitoring file.

#### `expectedHeaders` — Exact Header Row Matching

Add the complete comma-separated first line of the file to lock-match it to this profile:

```json
"match": {
  "requiredColumns": ["buffers", "cached"],
  "expectedHeaders": "Timestamp,total,used,free,shared,buffers,cached"
}
```

- **Full match (100%):** +30 pts — virtually guarantees auto-assignment to this profile.
- **Partial match (≥ 70%):** proportional credit.
- **Poor match (< 30%) with ≥ 3 expected headers:** −15 pts penalty.

This is the recommended approach when two profiles have the same format (e.g. both `flatCsv`) but different column structures.

### 15.2.1 Threshold Format in Saved Profiles

For formula, mixed, and multi-series rules, thresholds are stored with a **single key** equal to the formula result label — not repeated for each source token. You can optionally add `direction: "below"` for metrics where low values are problematic:

```json
{
  "header": "Free Memory %",
  "mode": "formula",
  "tokens": ["total", "free", "cached", "buffers"],
  "formula": "(free + cached + buffers) / total * 100",
  "formulaLabel": "Free Memory %",
  "thresholds": {
    "Free Memory %": { "warn": 25, "critical": 10, "direction": "below" }
  }
}
```

This is correct. The threshold is checked against the **computed formula result**, not the individual source token values. Older profiles saved before v2.5 may show the threshold repeated under each token name — this is automatically normalised when the profile is re-saved.

### 15.3 Saving a Profile

After analysing a file, click **Save/Add new Profile to Master Config** in the Inventory panel.

**Save behaviour (v3.0+):**

- If the loaded Master Config already contains a profile with the **same name and application group**, the save will **update** (replace) that entry — not add a duplicate.
- If no match is found, a new profile entry is appended.
- The save modal pre-fills the **Profile Name** and **Application / Group** fields from the currently auto-matched profile (if any), making updates require only one click on **Save Profile to Config**.
- The summary row in the modal shows `✎ Update mode: existing profile will be replaced` when an existing entry will be overwritten.

**Round-trip fields saved per MC rule (v3.0+):**

| Field | Saved |
|---|---|
| `compKeys` | ✓ (`["__auto__"]` for wildcard) |
| `_overlay` / `_overlayKeys` | ✓ |
| `_aggregate` / `_aggMode` | ✓ |
| `_perSec` | ✓ |
| `_groupOverlay` | ✓ (new in v2.9) |
| `thresholds` | ✓ |

---

### 15.4 Built-in SysMonitor Profiles (Linux System KPIs)

The Master Config ships with 8 pre-built profiles under the **SysMonitor** application group, covering common Linux system monitoring data formats. Load a matching file and the profile is auto-detected.

| Profile | File example | Format | Description |
|---|---|---|---|
| `SysMonitor-IOStatCPU` | `iostat_cpu.txt` | flatCsv / singleTs | CPU usage from `iostat -c`: user, system, iowait, steal, idle |
| `SysMonitor-LoadAvg` | `load.txt` | flatCsv / singleTs | System load averages: 1-, 5-, 15-minute |
| `SysMonitor-DiskHourly` | `disk_hourly.txt` | multiComp / singleTs | Per-filesystem disk usage (% used, used KB, available KB) |
| `SysMonitor-NIC` | `nicstat.txt` | multiComp / singleTs | Per-interface: throughput, packets, utilization, errors |
| `SysMonitor-NICTcp` | `nicstat_tcp.txt` | multiComp / singleTs | TCP: throughput, segments, connections, resets, retransmit % |
| `SysMonitor-NICUdp` | `nicstat_udp.txt` | multiComp / singleTs | UDP: datagrams/s, input/output errors |
| `SysMonitor-PsByMem` | `psbymem.txt` | multiComp / singleTs | Per-process: %CPU, %MEM, RSS, VSZ, thread count |
| `SysMonitor-UserStats` | `user.txt` | multiComp / singleTs | Per-user aggregate: CPU, MEMORY, NPROC |

#### Recommended charts per file type

**iostat_cpu.txt** — CPU health over time
- CPU Active (user + system + nice) — alert at >70% sustained
- CPU Idle % — alert below 20% warn / 10% critical; sustained drops signal saturation
- CPU I/O Wait — alert >10% warn / >25% critical; high iowait = storage bottleneck
- CPU Steal % — alert >5% (VMs only); steal > 15% = noisy-neighbour problem

**load.txt** — Run-queue depth
- All three averages on one chart to show trend (1m spikes vs. 15m sustained)
- Thresholds: warn at 2× vCPU count, critical at 4× vCPU count; rule of thumb for N-core system: warn=N×2, critical=N×4

**disk_hourly.txt** — Storage growth per filesystem
- Disk Usage % overlay (one line per filesystem) — alert at 75%/90%
- Available KB overlay — alert when available < 5 GB (warn) / 2 GB (critical)
- Trend analysis: if usage grows monotonically, project time-to-full

**nicstat.txt** — Network interface throughput & errors
- Read/Write KB/s overlay by interface — spot dominant interfaces
- Utilization % — alert >60% warn / >80% critical (full-duplex Gbps NIC = 125 MB/s max)
- Errors (IErr, OErr) — any non-zero value is notable; alert >10 events

**nicstat_tcp.txt** — TCP health
- Throughput (InKB/OutKB) — baseline and anomaly detection
- Retransmit % — alert >0.5% warn / >2% critical; elevated retransmits = congestion or packet loss
- Resets + Drops — alert >10 resets / >5 drops per interval
- Connection rate (InConn/OutCon) — sudden spike = connection storm

**nicstat_udp.txt** — UDP health
- Datagrams/s — baseline for DNS, NTP, media streams
- Input/Output errors — alert >5 warn / >20 critical; errors indicate buffer overflow

**psbymem.txt** — Process-level resource consumption
- %CPU overlay by PID — spot runaway processes
- %MEM overlay by PID — spot memory leaks (monotonic increase)
- RSS KB — track physical memory footprint growth; alert >1 GB warn / >2 GB critical
- Thread count (NLWP) — alert >100 warn / >200 critical; thread explosion = potential deadlock

**user.txt** — User-level aggregate view
- CPU overlay by user — identify dominant application owners
- MEMORY overlay by user — useful for capacity planning by service tier
- NPROC — track process count growth per user account

---

## 15.5 Profile Creation Walkthrough — All Formats

This section is a complete step-by-step guide to writing a profile in `MasterConfig.json` by hand (or as a reference for profiles you save through the UI). Each format is covered from the sample data line through to finished JSON and an explanation of what the resulting chart looks like.

---

### 15.5.1 Process Overview

Every profile follows the same six-step recipe regardless of format:

| Step | What you decide |
|------|----------------|
| 1 | **Format** — `flatCsv`, `logPipe`, or `multiComp` |
| 2 | **Match criteria** — how the tool identifies this file automatically |
| 3 | **Headers** — column names and structure |
| 4 | **Rules** — one entry per chart, with mode, tokens, and thresholds |
| 5 | **Name & app** — human-readable label and application group |
| 6 | **Validate** — load the file, confirm the auto-match, check charts |

The outer file structure is always:

```json
{
  "version": "1.0",
  "profiles": [
    { ... profile 1 ... },
    { ... profile 2 ... }
  ]
}
```

---

### 15.5.2 Format: `flatCsv`

#### What is it?

A flat CSV file where every row is one time sample. Columns are: one or two timestamp columns, then numeric KPI columns. There is no component dimension — one row = one point per KPI.

#### Sample data A — file has its own header row

```
Timestamp,total,used,free,shared,buffers,cached
2026-04-25 00:00,8192,3400,2100,512,180,2000
2026-04-25 00:05,8192,3550,1950,512,185,1995
```

**Profile JSON:**

```json
{
  "name": "Memory Statistics",
  "app": "SysMonitor",
  "format": "flatCsv",
  "match": {
    "columns": {
      "0": { "type": "singleTs" }
    },
    "requiredColumns": ["total", "free", "cached"]
  },
  "headers": {
    "hasHeader": true
  },
  "rules": [
    {
      "header": "Memory Usage (MB)",
      "mode": "direct",
      "tokens": ["total", "used", "free", "cached", "buffers"],
      "thresholds": {}
    },
    {
      "header": "Free Memory %",
      "mode": "formula",
      "tokens": ["total", "free", "cached", "buffers"],
      "formula": "(free + cached + buffers) / total * 100",
      "formulaLabel": "Free Memory %",
      "thresholds": {
        "Free Memory %": { "warn": 25, "critical": 10, "direction": "below" }
      }
    }
  ]
}
```

**Key fields explained:**

| Field | Value | Why |
|-------|-------|-----|
| `format` | `"flatCsv"` | Tells the parser to treat this as a flat time-series CSV |
| `match.columns."0"` | `{ "type": "singleTs" }` | Column 0 is a combined datetime stamp |
| `match.requiredColumns` | `["total","free","cached"]` | File must contain these exact column names to match |
| `headers.hasHeader` | `true` | First row is a header row — column names are read from it |
| Rule `mode` | `"direct"` / `"formula"` | Chart type — see rule modes below |

**Chart 1 — Direct (Memory Usage MB):**

```
Y-axis (MB)
  8192 ─────────────────── total
  3550 ─── ─── ─── ─── ─── used
  2100 ──────────────────── free
  2000 ─── ─── ─── ─── ─── cached
   185 ─────────────────── buffers
       00:00  00:05  00:10 ...
```

Five coloured lines, one per token. Each line shows that metric's raw value over time. No computation — what you see is exactly what is in the data.

**Chart 2 — Formula (Free Memory %):**

```
Y-axis (%)        ── warn (25%)
   52 ─────────────────────────── Free Memory %
   49 ─────────────────────────── (declining trend)
       00:00  00:05  00:10 ...
  ── critical (10%)
```

One line showing the computed result of `(free + cached + buffers) / total * 100`. A warning band appears when the value drops below 25%; a critical band below 10% (because `direction: "below"` means low values are bad).

---

#### Sample data B — file has NO header row

```
2026-04-25 00:00,100,2.5,1.2,97.3
2026-04-25 00:05,103,3.1,1.4,95.5
```

You must tell the profile what the columns are:

```json
{
  "name": "CPU Statistics",
  "app": "SysMonitor",
  "format": "flatCsv",
  "match": {
    "columns": {
      "0": { "type": "singleTs" }
    },
    "allNumericFrom": 1
  },
  "headers": {
    "hasHeader": false,
    "columns": "Timestamp,usr,sys,iowait,idle"
  },
  "rules": [
    {
      "header": "CPU Breakdown (%)",
      "mode": "direct",
      "tokens": ["usr", "sys", "iowait", "idle"],
      "thresholds": {
        "iowait": { "warn": 10, "critical": 25 }
      }
    },
    {
      "header": "CPU Active %",
      "mode": "formula",
      "tokens": ["usr", "sys", "iowait"],
      "formula": "usr + sys + iowait",
      "formulaLabel": "Active CPU %",
      "thresholds": {
        "Active CPU %": { "warn": 70, "critical": 85 }
      }
    }
  ]
}
```

**Key difference from sample A:**

| Field | Value | Why |
|-------|-------|-----|
| `headers.hasHeader` | `false` | No header row in the file |
| `headers.columns` | `"Timestamp,usr,sys,iowait,idle"` | Comma-separated list of column names to assign, in order |
| `match.allNumericFrom` | `1` | Columns 1 onward are all numeric — strong match signal |
| `thresholds."iowait"` | `{ "warn": 10, "critical": 25 }` | Per-token threshold in a direct rule (key = token name) |

**Chart 1 — Direct with per-token threshold on iowait:**

```
Y-axis (%)
  97 ──────────── idle (large, dominant line)
   3 ──────────── usr
   1 ──────────── sys
        ── warn (10%)
   2 ──────────── iowait  ← breaches warn if it crosses dashed line
        ── critical (25%)
     00:00  00:05 ...
```

**Chart 2 — Formula (Active CPU %):**

```
Y-axis (%)
        ── critical (85%)
        ── warn (70%)
   6.8 ──────── Active CPU % (computed: usr+sys+iowait)
     00:00  00:05 ...
```

---

#### `flatCsv` with ratio mode

Ratio mode divides the second token by the first and multiplies by 100, giving a percentage. The first token is the **denominator**; subsequent tokens are numerators.

```json
{
  "header": "Request Success Rate (%)",
  "mode": "ratio",
  "tokens": ["Total_Req", "Total_OK", "Total_Fail"],
  "thresholds": {}
}
```

**Data:** `Total_Req=200, Total_OK=185, Total_Fail=15`

**Computed:** `(185 / 200) × 100 = 92.5%` and `(15 / 200) × 100 = 7.5%`

```
Y-axis (%)
  92.5 ──────────── Total_OK rate
   7.5 ─── ─── ─── Total_Fail rate
       (denominator Total_Req is not plotted)
```

---

### 15.5.3 Format: `logPipe`

#### What is it?

A pipe-delimited log line where every KPI is stored as a named `key=value` pair. Each line is one time sample.

#### Sample data

```
2026-04-25|00:00|App|INFO|MSU Received Last Min=145|SM Started Last Min=120|SM Completed Last Min=115|SM TimedOut Last Min=3|SM Failed Last Min=2
2026-04-25|00:05|App|INFO|MSU Received Last Min=162|SM Started Last Min=138|SM Completed Last Min=130|SM TimedOut Last Min=5|SM Failed Last Min=3
```

**Parsing rules for logPipe:**
- Columns 0–1 are the timestamp (date + time).
- Columns 2–4 are metadata (ignored for KPIs).
- Column 5 onward: each segment is `key=value`. The key becomes the token name.

**Profile JSON — all modes in one profile:**

```json
{
  "name": "GTPP Session Statistics",
  "app": "GGSN",
  "format": "logPipe",
  "match": {
    "columns": {
      "0": { "type": "date", "pattern": "^\\d{4}-\\d{2}-\\d{2}$" },
      "1": { "type": "time", "pattern": "^\\d{2}:\\d{2}" }
    }
  },
  "rules": [
    {
      "header": "MSU & Session Counts",
      "mode": "direct",
      "tokens": [
        "MSU Received Last Min",
        "SM Started Last Min",
        "SM Completed Last Min",
        "SM TimedOut Last Min",
        "SM Failed Last Min"
      ],
      "thresholds": { "warn": 150, "critical": 250 }
    },
    {
      "header": "Session Completion Rate (%)",
      "mode": "ratio",
      "tokens": ["SM Started Last Min", "SM Completed Last Min", "SM Failed Last Min"],
      "thresholds": {}
    },
    {
      "header": "Net Healthy Sessions",
      "mode": "formula",
      "tokens": ["SM Completed Last Min", "SM TimedOut Last Min", "SM Failed Last Min"],
      "formula": "SM Completed Last Min - SM TimedOut Last Min - SM Failed Last Min",
      "formulaLabel": "Healthy Sessions",
      "thresholds": {}
    },
    {
      "header": "Session Efficiency Index",
      "mode": "formula",
      "tokens": ["SM Started Last Min", "SM Completed Last Min", "MSU Received Last Min"],
      "formula": "(SM Completed Last Min / SM Started Last Min) * MSU Received Last Min",
      "formulaLabel": "Efficiency Index",
      "thresholds": {}
    }
  ]
}
```

**Chart 1 — Direct (MSU & Session Counts):**

```
Y-axis (count/min)
       ── critical (250)
  162 ─────────────────── MSU Received Last Min
  138 ─── ─── ─── ─── ─── SM Started Last Min
  130 ─────────────────── SM Completed Last Min
       ── warn (150)
    5 ─────────────────── SM TimedOut Last Min
    3 ─── ─── ─── ─── ─── SM Failed Last Min
      00:00  00:05  ...
```

The single `thresholds: { "warn": 150, "critical": 250 }` applies the same threshold lines to **all** tokens in a direct rule. To apply different thresholds per token, use a separate rule for each token.

**Chart 2 — Ratio (Session Completion Rate %):**

```
Y-axis (%)
   94.2 ──────── SM Completed rate  (130/138 × 100)
    2.2 ─── ─── SM Failed rate      (3/138 × 100)
        (SM Started Last Min is denominator, not plotted)
      00:00  00:05  ...
```

**Chart 3 — Formula (Net Healthy Sessions):**

```
Y-axis (count)
   122 ──────── Healthy Sessions
               (= Completed − TimedOut − Failed = 130−5−3)
      00:00  00:05  ...
```

**Chart 4 — Formula (Efficiency Index):**

```
Y-axis (index)
   154 ──────── Efficiency Index
               (= (130/138) × 162 = 152.6)
      00:00  00:05  ...
```

---

### 15.5.4 Format: `multiComp` — Multi-Component (MC) Data

#### What is it?

A CSV where each row represents one time sample **for a specific component** (e.g. a network link, a cell, a device). Multiple rows share the same timestamp — one per component. Charts show one line per component.

#### Sample data

```
2026-04-25 00:00,SS7,Link-1,120,115,0,2
2026-04-25 00:00,SS7,Link-2,98,95,1,0
2026-04-25 00:05,SS7,Link-1,125,120,0,3
2026-04-25 00:05,SS7,Link-2,102,99,0,1
```

**Column layout:**

| Index | 0 | 1 | 2 | 3 | 4 | 5 | 6 |
|-------|---|---|---|---|---|---|---|
| Name | Timestamp | (unused) | Type | LinkId | MSU_Recv | MSU_Sent | Errors | Retransmits |

Wait — let me clarify: with a single combined timestamp (`singleTs`), the layout is:

| Index | 0 | 1 | 2 | 3 | 4 | 5 | 6 |
|-------|---|---|---|---|---|---|---|
| Name | Timestamp | Type (key col) | LinkId (key col) | MSU_Recv | MSU_Sent | Errors | Retransmits |

For a two-column Date+Time timestamp:

| Index | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|-------|---|---|---|---|---|---|---|---|
| Name | Date | Time | (extra) | Type | LinkId | MSU_Recv | MSU_Sent | Errors |

#### Understanding key columns

**Key columns** are the columns that identify which component a row belongs to. They must have low cardinality (few distinct values). You define them in `match.keyFields`:

```json
"keyFields": {
  "3": { "maxDistinct": 10 },
  "4": { "maxDistinct": 50 }
}
```

This says: column 3 has at most 10 distinct values (e.g. record type `SS7`, `SIP`); column 4 has at most 50 distinct values (individual link IDs). Combined, they form the **component key** — e.g. `SS7|Link-1`.

#### Understanding KPI columns

After all key columns, the remaining columns are the KPI metrics. In `headers.kpiColumns` you assign names to them **in order from the first KPI column**:

```json
"kpiColumns": ["MSU_Recv", "MSU_Sent", "Errors", "Retransmits"]
```

In rules, KPIs are referenced as **positional tokens** `KPI_1`, `KPI_2`, etc. (`KPI_1` = first kpiColumn name, `KPI_2` = second, and so on).

#### The `mcHeaderFile` annotation — the most powerful matching tool

`mcHeaderFile` is an array of header line strings (one per row type) that describe what a row looks like. The format is:

```
Date,Time,Col2,RecordType(STATIC_VALUE),CompId(XXX),KPI_Label_1,...
```

- `ColName(STATIC_VALUE)` — this column always contains `STATIC_VALUE` in real data rows (e.g. `RecordType(SS7)` means col 3 always = `SS7`)
- `ColName(XXX)` — this column varies per row (component ID)
- Labels after the key columns name the KPIs for the header inspector

The scoring engine uses the static-value annotations as a **fingerprint** to identify which profile a file belongs to. If the real data matches the annotation values (e.g. col 3 = `SS7`, col 4 = any value per row), the profile scores high.

**Example with mcHeaderFile:**

```json
"mcHeaderFile": [
  "Date,Time,Col2,RecordType(SS7),LinkId(XXX),MSU Received,MSU Sent,Link Errors,Retransmits"
]
```

This declares: in real data rows, column 3 always = `SS7`; column 4 varies.

For files with **multiple record types** (e.g. SS7 rows and SIP rows mixed in the same file), add one entry per record type:

```json
"mcHeaderFile": [
  "Date,Time,Col2,RecordType(SS7),LinkId(XXX),MSU Received,MSU Sent,Link Errors,Retransmits",
  "Date,Time,Col2,RecordType(SIP),SessionId(XXX),Dialog Count,Active Calls,Failed Calls"
]
```

---

#### Profile A: Per-Component Direct Chart

**Each component gets its own line on the chart.**

```json
{
  "name": "MTP2 Link Stats",
  "app": "STP",
  "format": "multiComp",
  "match": {
    "columns": {
      "0": { "type": "date" },
      "1": { "type": "time" }
    },
    "keyFields": {
      "3": { "maxDistinct": 10 },
      "4": { "maxDistinct": 50 }
    }
  },
  "headers": {
    "hasHeader": false,
    "keyLabels": { "3": "Type", "4": "LinkId" },
    "kpiColumns": ["MSU_Recv", "MSU_Sent", "Errors", "Retransmits"],
    "mcHeaderFile": [
      "Date,Time,Col2,RecordType(SS7),LinkId(XXX),MSU Received,MSU Sent,Link Errors,Retransmits"
    ]
  },
  "rules": [
    {
      "header": "Link Traffic — Per Component",
      "_mc": true,
      "mode": "direct",
      "tokens": ["KPI_1", "KPI_2"],
      "compKeys": ["__auto__"],
      "_overlay": false,
      "_overlayKeys": [],
      "_excludeOverlay": [],
      "_aggregate": false,
      "_aggMode": "sum",
      "_perSec": false
    }
  ]
}
```

**What this chart looks like:**

```
Link Traffic — Per Component
Y-axis (count)
  125 ──────── SS7|Link-1 MSU_Recv
  120 ─ ─ ─ ─  SS7|Link-1 MSU_Sent
  102 ──────── SS7|Link-2 MSU_Recv
   99 ─ ─ ─ ─  SS7|Link-2 MSU_Sent
      00:00  00:05  00:10  ...
```

Each component's KPI becomes one line. Solid = KPI_1, dashed = KPI_2. The legend shows `ComponentKey KPI_Name`.

---

#### Profile B: Overlay Chart (Group by Dimension)

**All components appear on one chart as separate lines** — like a sparkline comparison. This is the most useful view when you want to compare components side-by-side.

```json
{
  "header": "Link Traffic — Overlay All Links",
  "_mc": true,
  "mode": "direct",
  "tokens": ["KPI_1"],
  "compKeys": ["__auto__"],
  "_overlay": false,
  "_overlayKeys": [],
  "_excludeOverlay": [],
  "_aggregate": false,
  "_aggMode": "sum",
  "_perSec": false
}
```

> **Note:** Overlay here refers to the **Component Overlay** mode in the UI (enabled via the Component Overlay checkbox in the rule builder). In the JSON saved profile, this is encoded as `"_overlay": false` with `compKeys: ["__auto__"]` — the tool automatically expands all component keys. For a group-dimension overlay (grouping by a KPI column's categorical value), use `_overlay: true` and set `_overlayKeys`.

**Group-dimension overlay** — overlay by a categorical column within the data:

```json
{
  "header": "Traffic by Band — Overlay",
  "_mc": true,
  "mode": "direct",
  "tokens": ["KPI_2", "KPI_3"],
  "compKeys": ["__auto__"],
  "_overlay": true,
  "_overlayKeys": ["KPI_1"],
  "_excludeOverlay": ["Unknown"],
  "_aggregate": false,
  "_aggMode": "sum",
  "_perSec": false
}
```

Here `KPI_1` holds the band value (`700MHz`, `1800MHz`, etc.). The chart groups and colours lines by band, and excludes any component with band = `Unknown`.

**What the overlay chart looks like:**

```
Traffic by Band — Overlay
Y-axis (count)
  125 ──────────── 700MHz  MSU_Recv
   98 ─── ─── ─── 1800MHz MSU_Recv
   87 ─ ─ ─ ─ ─ ─ 2100MHz MSU_Recv
      00:00  00:05  00:10 ...
Legend: [700MHz] [1800MHz] [2100MHz]  (click to hide/show)
```

---

#### Profile C: Aggregated Chart (Sum / Average Across All Components)

**All components are rolled up into one value per timestamp** — useful for totals (capacity planning) or averages (health baselines).

```json
{
  "header": "Total Network Traffic (SUM)",
  "_mc": true,
  "mode": "direct",
  "tokens": ["KPI_1", "KPI_2"],
  "compKeys": ["__auto__"],
  "_overlay": false,
  "_overlayKeys": [],
  "_excludeOverlay": [],
  "_aggregate": true,
  "_aggMode": "sum",
  "_perSec": false
}
```

**What the aggregated chart looks like:**

```
Total Network Traffic (SUM)
Y-axis (count)
  227 ──────── MSU_Recv (all links summed: 125 + 102)
  219 ─── ─── MSU_Sent (all links summed: 120 + 99)
      00:00  00:05 ...
```

For `_aggMode: "avg"`, each point is the mean across all active components. Useful for normalised KPIs like utilisation %.

---

#### Profile D: Per-Second Rate Chart

Set `_perSec: true` to divide each value by the interval length in seconds. This converts raw counts-per-interval into rates-per-second.

```json
{
  "header": "MSU Rate (per second)",
  "_mc": true,
  "mode": "direct",
  "tokens": ["KPI_1"],
  "compKeys": ["__auto__"],
  "_overlay": false,
  "_overlayKeys": [],
  "_excludeOverlay": [],
  "_aggregate": true,
  "_aggMode": "sum",
  "_perSec": true
}
```

**Example:** interval = 300 seconds (5 min), raw sum = 227 → rate = 227 / 300 = **0.76 MSU/sec**.

---

#### Profile E: Ratio Rule (% Utilisation Per Component)

```json
{
  "name": "Cell Channel Utilization",
  "app": "RAN",
  "format": "multiComp",
  "match": {
    "columns": {
      "0": { "type": "date" },
      "1": { "type": "time" }
    },
    "keyFields": { "3": { "maxDistinct": 5 }, "4": { "maxDistinct": 100 } }
  },
  "headers": {
    "hasHeader": false,
    "keyLabels": { "3": "RAT", "4": "CellId" },
    "kpiColumns": ["TCH_Avail", "TCH_Used", "SD_Drops"],
    "mcHeaderFile": [
      "Date,Time,Type(GSM),CompId(XXX),TCH Available,TCH Used,SD Drops"
    ]
  },
  "rules": [
    {
      "header": "Channel Utilization (%) — Per Cell",
      "_mc": true,
      "mode": "ratio",
      "tokens": ["KPI_1", "KPI_2"],
      "compKeys": ["__auto__"],
      "_overlay": false,
      "_overlayKeys": [],
      "_excludeOverlay": [],
      "_aggregate": false,
      "_aggMode": "sum",
      "_perSec": false,
      "thresholds": {
        "KPI_2": { "warn": 70, "critical": 90 }
      }
    }
  ]
}
```

**Computed:** `KPI_2 / KPI_1 × 100 = TCH_Used / TCH_Avail × 100`

**Chart:**

```
Channel Utilization (%) — Per Cell
Y-axis (%)
       ── critical (90%)
   78 ──────── GSM|Cell-1  TCH_Used%
       ── warn (70%)
   62 ─── ─── GSM|Cell-2  TCH_Used%
   55 ─────── GSM|Cell-3  TCH_Used%
      00:00  00:05 ...
```

---

#### Profile F: Formula Rule Per Component

```json
{
  "header": "DL-UL Imbalance — Per Cell",
  "_mc": true,
  "mode": "formula",
  "tokens": ["KPI_1", "KPI_2"],
  "formula": "KPI_1 - KPI_2",
  "formulaLabel": "DL minus UL Gap",
  "compKeys": ["__auto__"],
  "_overlay": false,
  "_overlayKeys": [],
  "_excludeOverlay": [],
  "_aggregate": false,
  "_aggMode": "sum",
  "_perSec": false
}
```

**Chart:**

```
DL-UL Imbalance — Per Cell
Y-axis (PRB %)
  12 ──────── GSM|Cell-1  DL minus UL Gap
   8 ─── ─── GSM|Cell-2  DL minus UL Gap
   3 ──────── GSM|Cell-3  DL minus UL Gap
      00:00  00:05 ...
```

---

#### Profile G: Aggregated Formula with Per-Second Rate

Combining `_aggregate`, `_aggMode: "avg"`, and `_perSec: true`:

```json
{
  "header": "Weighted PRB — AVG Aggregated (per sec)",
  "_mc": true,
  "mode": "formula",
  "tokens": ["KPI_1", "KPI_2", "KPI_3"],
  "formula": "(KPI_1 + KPI_2) / 2 - KPI_3 * 0.1",
  "formulaLabel": "Adjusted PRB Usage",
  "compKeys": ["__auto__"],
  "_overlay": false,
  "_overlayKeys": [],
  "_excludeOverlay": [],
  "_aggregate": true,
  "_aggMode": "avg",
  "_perSec": true
}
```

**Evaluation order:** 1. compute formula per row → 2. average across all components → 3. divide by interval seconds.

---

### 15.5.5 Rule Modes Reference

| Mode | Tokens | Output | Formula field | Use when |
|------|--------|--------|---------------|----------|
| `direct` | 1–N KPI names | One line per token | — | Raw metric values over time |
| `ratio` | 2–N KPI names; first = denominator | One `%` line per non-first token | — | Express sub-counts as % of a total |
| `formula` | 1–N KPI names (as referenced in expression) | One line: the computed result | Required (`formula`, `formulaLabel`) | Any derived metric (sums, differences, weighted averages) |
| `mixed` | Direct tokens + formula tokens | Solid lines (direct) + dashed line (formula) on one chart | Required | Show raw + derived together on same axes |
| `multi` / `multi-series` | Multiple formulas | Multiple dashed lines | One `formula`+`formulaLabel` per series | Compare several derived metrics on one chart |

---

### 15.5.6 Match Scoring Quick Reference

When the tool opens a file, it scores every profile in `MasterConfig.json`. The profile with the highest score wins and is pre-selected in the File ↔ Profile Assignment modal. Score ≥ 80 is auto-confirmed unless you change it.

**Strongest discriminators (use these first):**

1. **`requiredColumns`** with specific column names from your file — +15 each, −20 if missing. A file that has all required columns and no penalties will almost always win.
2. **`expectedHeaders`** — add the exact header row from the file for a +30 full-match bonus. Best when two profiles look the same by column count/type but have different semantics.
3. **`mcHeaderFile` annotations** — static-value annotation matching (e.g. `RecordType(SS7)`) awards +15 per matching column. Used for MC files where the record type acts as a discriminator.

**Lighter signals (good secondary evidence):**

4. **`keyFields`** — column index has few distinct values. +10 per field.
5. **`columns`** type patterns — +10 per column for matching `date`, `time`, `singleTs` etc.
6. **`allNumericFrom`** — all columns from index N are numeric. +10 overall.

**A safe minimal match block for a flatCsv with known columns:**

```json
"match": {
  "columns": { "0": { "type": "singleTs" } },
  "requiredColumns": ["free", "cached", "buffers"],
  "expectedHeaders": "Timestamp,total,used,free,shared,buffers,cached"
}
```

**A safe minimal match block for a multiComp file:**

```json
"match": {
  "columns": { "0": { "type": "date" }, "1": { "type": "time" } },
  "keyFields": { "3": { "maxDistinct": 10 }, "4": { "maxDistinct": 50 } }
}
```

Add `mcHeaderFile` with static annotations to make the profile unique when multiple MC files have the same column layout but different record types.

---

### 15.5.7 Complete Profile Template — Copy and Customise

**flatCsv with header row:**

```json
{
  "name": "My Application Stats",
  "app": "MyApp",
  "format": "flatCsv",
  "match": {
    "columns": { "0": { "type": "singleTs" } },
    "requiredColumns": ["col_a", "col_b"]
  },
  "headers": {
    "hasHeader": true
  },
  "rules": [
    {
      "header": "Raw Metrics",
      "mode": "direct",
      "tokens": ["col_a", "col_b"],
      "thresholds": {}
    }
  ]
}
```

**logPipe:**

```json
{
  "name": "My App Log Stats",
  "app": "MyApp",
  "format": "logPipe",
  "match": {
    "columns": {
      "0": { "type": "date", "pattern": "^\\d{4}-\\d{2}-\\d{2}$" },
      "1": { "type": "time" }
    }
  },
  "rules": [
    {
      "header": "Key Metrics",
      "mode": "direct",
      "tokens": ["Token Name With Spaces", "Other Token"],
      "thresholds": {}
    }
  ]
}
```

**multiComp:**

```json
{
  "name": "My Component Stats",
  "app": "MyApp",
  "format": "multiComp",
  "match": {
    "columns": { "0": { "type": "date" }, "1": { "type": "time" } },
    "keyFields": { "3": { "maxDistinct": 10 }, "4": { "maxDistinct": 200 } }
  },
  "headers": {
    "hasHeader": false,
    "keyLabels": { "3": "Type", "4": "ComponentId" },
    "kpiColumns": ["Metric1", "Metric2", "Metric3"],
    "mcHeaderFile": [
      "Date,Time,Extra,RecordType(MY_TYPE),CompId(XXX),Metric 1 Label,Metric 2 Label,Metric 3 Label"
    ]
  },
  "rules": [
    {
      "header": "Per-Component Metrics",
      "_mc": true,
      "mode": "direct",
      "tokens": ["KPI_1", "KPI_2"],
      "compKeys": ["__auto__"],
      "_overlay": false,
      "_overlayKeys": [],
      "_excludeOverlay": [],
      "_aggregate": false,
      "_aggMode": "sum",
      "_perSec": false
    }
  ]
}
```

---

## 16. Tips & Troubleshooting

### Chart shows no data / flat line
- Confirm metric names in the rule match the parsed token names exactly (case-sensitive).
- Check the Console panel for `[DBG] token(s) have NO data` warnings.
- Verify the correct file is selected in the Inventory.

### Formula result invisible on chart
- The formula result is the **only line** in Formula mode — source metrics are not plotted (by design).
- If the result is still not visible, ensure all formula token names match the Metrics list exactly.
- Division by zero produces `null` (gap) — ensure the denominator has non-zero data.

### False threshold alerts for formula rules
- This happened in versions before v2.5 where thresholds were checked against raw token values (e.g. total = 8192 MB against a 70% threshold).
- From v2.5 onwards, the formula result is evaluated per data point and compared against the threshold. Raw token values are not checked.
- If you have an old saved profile with thresholds repeated per token, re-save the profile — the tool normalises it on save.

### Mixed mode: chart is blank despite valid formula
- Ensure the **Direct Metrics** multi-select has at least one metric selected in addition to the formula.
- Ensure all token names in the formula exist in the loaded file's columns.

### Multi-Series mode: "No valid series" warning
- This appears if the series list is empty, or if every formula row has a blank expression.
- Click **+ Direct Metric** or **ƒ Formula** to add at least one series before clicking **+ Add to Queue**.
- If a formula expression has a syntax error, that series is skipped — the warning message names the bad formula.

### Choosing the wrong mode
- If you see **source metric lines cluttering a formula chart**: you are in Direct mode, not Formula mode. Switch to Formula and enter the expression.
- If you want **raw and derived lines together**: use Mixed (one formula) or Multi-Series (multiple formulas).
- If you want **separate charts per KPI**: add one Direct rule per metric to the queue.

### YYMMDD timestamps showing raw on X-axis
- From v2.4 onwards the X-axis displays `2026-01-31 00:00` instead of `260131 00:00`.
- If you see the raw format, ensure you are using v2.4 or later.

### Files not collating in Analyze All Files
- Filenames must include a timestamp suffix: `.<YYYYMMDD>-<HHMMSS>.<ext>` or `_<YYYYMMDD>_<HHMMSS>.<ext>`.
- Files without a timestamp suffix are treated individually.
- Check the console for `Collating N files for prefix "..."` messages.

### Threshold lines not appearing
- Lines only appear when warn or critical values are entered.
- In Formula / Mixed / Multi-Series mode, thresholds apply to the **formula result**, not raw metrics.
- Threshold lines are excluded from the stats table below the chart (by design).
- The alert panel is collapsible — click the header row to expand it if it appears closed.

### Multi-Component mode not detecting device column
- **Preferred fix (v2.6+):** Use the **Group by column** dropdown in CSV Options. Set format to Multi-Component, set Timestamp Format to match your file (single column or Date+Time), check Header row, then pick the device/component column from the dropdown. No file editing required.
- **Alternative:** Provide an **MC Header file** with `Device:(sdb)` annotation on the key column — this works for annotated MC files.
- Auto-detection only scans columns 3–7 and requires `Name(value)` annotations or low-cardinality string values in that range. Files where the key column is at index 0–2 (e.g. iostat with Device at column 1) need the Group by column picker.

### Group by column shows no options / stays at Auto-detect
- The dropdown populates automatically as soon as a file is loaded with **First row is Header** checked — no need to click Initialize Analysis.
- If the dropdown is still empty after loading, confirm the header checkbox is ticked.
- The dropdown skips timestamp columns (col 0 for singleTs; cols 0–1 for Date+Time). If the expected column is missing, verify the **Timestamp Format** selection matches the file and change it — the dropdown refreshes immediately on change.
- If Timestamp Format is set to **Auto-Detect**, the tool runs the same timestamp classifier it uses at parse time to determine how many columns to skip; the result may differ from your expectation — force `singleTs` or `Date+Time` explicitly if the dropdown is wrong.

### Rule added with ★ All shows no charts on a different file
- This should not happen with v2.7+ — the wildcard (`__auto__`) always expands to whatever components are present in the currently loaded file.
- If charts are blank, check the Console panel for `[Config] __auto__ → N component(s)` messages. If `N = 0` the file was not parsed yet; click **Initialize Analysis** first.
- Old rules saved before v2.7 may have an explicit device list instead of `__auto__`. Re-add the rule using **★ All** and re-export the profile to fix this.

### iostat file: Device column treated as KPI / timestamp wrong
- Set **Timestamp Format** to **Col 1 = Timestamp (singleTs)** — the default for MC files is Date+Time (two columns) which would misparse a combined `260131 00:00` timestamp.
- Then select **Device** in the **Group by column** picker and click **Initialize Analysis** again.

### `%util` in formula causes error
- The `%` character is not a valid token name character.
- Rename the column to `util_pct` using **Manual Headers** in CSV Options before use.

### Script appears stuck / unresponsive with large files (fixed in v3.0)
- In versions before v3.0, files with more than 20 000 lines could freeze the browser tab because the parser processed all lines in a single synchronous block.
- **v3.0 fix:** the parser now processes lines in chunks of 1 000 per browser tick, yielding control to the UI between each chunk. A progress bar appears in the upload area showing `Parsing <file>: N% (X / Y lines)…` so you can see the progress rather than a blank screen.
- If the progress bar is not advancing, the file is likely very large (> 100 000 lines). Wait for it to complete — do **not** click Initialize Analysis again while parsing is in progress.
- Files up to 50 MB are supported.

### Zoom is out of sync across charts
- Click **RESET VIEW** in the dashboard meta bar to reset all charts simultaneously.
- Zoom sync applies to the X-axis only.

### MasterConfig loaded but MC component key not detected (fixed in v3.0)
- In versions before v3.0, loading a MasterConfig and then uploading files could result in the MC parser failing to identify the component key column. This happened because the profile's `keyLabels` (column index → label mapping) was only used to update existing label text — it never bootstrapped `mcKeyFieldIndices` when the global state was empty after a reset.
- **v3.0 fix:** when `mcKeyFieldIndices` is empty and the profile contains a `keyLabels` map, the tool now derives `mcKeyFieldIndices`, `mcKeyFieldLabels`, and `mcDataStartIndex` directly from those labels before the parse loop runs. The key column is correctly identified without needing an `mcHeaderFile` in the profile.

### Multiple files + MasterConfig: no charts generated automatically (fixed in v3.1)
- In versions before v3.1, loading two or more standard (non-MC) files with a MasterConfig produced no charts automatically because `activeLogData` was never bound when more than one standard file existed. `_onAllFilesComplete()` only auto-selected `parsedFilesStore[firstFile]` when `fk.length === 1`. With two files the condition was never met, so the auto-generate condition `activeLogData.length || hasMcData` evaluated to `false` and `generateDashboard()` was not called.
- Clicking **GENERATE DASHBOARD** manually also failed: the guard inside `generateDashboard()` saw an empty `activeLogData` and — because `formatType` was not `multiComp` — tried the auto-bind fallback, which required `fk.length === 1`. With two files it issued `Error: No data loaded.` and returned.
- **v3.1 fix:** `_onAllFilesComplete()` now auto-selects the first file when `fk.length >= 1` and calls `_generateAllFileDashboards()` for the multi-file path. The guard in `generateDashboard()` is simplified: if `activeLogData` is empty it binds to the first available standard file regardless of count, and only errors if both `parsedFilesStore` and `compIndexStore` are empty. A **↺ Refresh All** button is added to the dashboard meta bar for manual re-generation across all files.

### Two different files + MasterConfig: second file parsed as wrong format (fixed in v3.0)
- In versions before v3.0, loading two files (e.g. `free.txt` and `iostat_device.txt`) with a MasterConfig could result in the second file being parsed incorrectly. The per-file profile selector modal called `_applyFileProfiles()` and then re-invoked `processFilesFromUI()`, which reset MC globals, then skipped `_applyFileProfiles()` again because `_profileAlreadySelected` was already `true`.
- **v3.0 fix:** `_applyFileProfiles()` is now called unconditionally after the reset whenever a valid profile mapping exists, ensuring MC globals are always re-populated before each file's parse loop runs.

### Component Overlay shows only one chart regardless of KPI count (fixed in v3.2.2)

**Symptom:** Selecting 3 KPIs with Component Overlay enabled produced a single chart with all component × KPI combinations plotted on it using different dash patterns, making it unreadable.

**Root cause:** The chart generation loop iterated over components in the outer loop and KPI tokens in the inner loop, pushing every combination as a dataset into a single `_goDatasets` array, then creating one chart for the whole array.

**v3.2.2 fix:** The loop order is reversed. The outer loop now iterates over tokens (one chart per KPI), and the inner loop builds one dataset per component on that chart. A formula rule still produces a single chart (since there is only one computed series). Chart titles include the KPI name when multiple KPIs are selected: `Rule Header — kpi_name`.

### Metrics list shows wrong file's tokens / all files share same column names (fixed in v3.2.1)

**Symptom A — no-profile file selected first:** The Metrics list shows the token names from the _last_ file selected, not the one currently highlighted in the Inventory.

**Symptom B — no-profile file selected last:** The Metrics list is correct for the no-profile file, but clicking **↺ Refresh All** adds charts from another profiled file _and_ corrupts that file's Metrics list so it shows the no-profile file's columns.

**Root cause:** The chunk-based parser used two shared global variables (`window._parseChunkState` and `window._parseChunkMapFn`) to carry state across browser ticks. When multiple files are loaded together, the `forEach` that schedules a parse for each file runs synchronously — so all per-file closures captured the same global. By the time the first `setTimeout` callback fired, the global had already been overwritten by the last file's setup. Every file's async chunks then read the last file's state, causing all files to store the last file's column names in `parsedFileMeta` and (for long files) push the last file's rows into every `parsedFilesStore` entry.

**v3.2.1 fix:** `window._parseChunkState` and `window._parseChunkMapFn` are now local `const` variables (`_chunkState` / `_chunkMapFn`) declared inside the per-file parse closure. Each file's `_processChunk` callback captures its own local state instead of the shared global, so concurrent async parses remain fully isolated.

### Refresh All sends profiled-file rules to all files including no-profile files (fixed in v3.2.1)

**Symptom:** After loading two profiled files (e.g. `app.log` → Profile A, `db.log` → Profile B) and one no-profile file (e.g. `custom.csv`), clicking **↺ Refresh All** generates charts for `custom.csv` that use Profile A's rules — producing blank or incorrect charts because the column names don't match.

**Root cause:** The rule-routing filter in `_generateAllFileDashboards()` returned `true` (apply to all files) for manually-added non-profiled rules, rather than limiting them to files that also have no profile assignment.

**v3.2.1 fix:** The filter now returns `!fp` (only apply a non-profiled rule to a file that itself has no profile). The complete routing contract is:
- Rule has `_sourceProfile` set → only routed to the file whose profile name matches.
- Rule has no `_sourceProfile` (manually added) → only routed to files with no profile assignment.
- MC rules (`_mc: true`) → always routed to MC overlay data, regardless of file.

### Group Overlay / multi-file charts show truncated X-axis or miss early timestamps (fixed in v3.2.3)

**Symptom:** A Group Overlay chart shows only the tail of the data — the first N hours of timestamps are missing even though all data is present in the file.

**Root cause (1 — tick limit):** `makeChartOptions()` sets `maxTicksLimit: 14` on the X-axis. In Group Overlay mode the chart was using this option (matching per-component charts) instead of the overlay-style `scales: {x:{}}` that removes the cap. Chart.js's `autoSkip` then collapsed the visible range.

**Root cause (2 — shared labels array):** The `_goLabels` array was declared once outside the per-KPI chart loop and passed as the same reference to every chart instance. Chart.js 4.x attaches reactive proxy symbols to `data.labels`, and sharing the reference across instances caused the second and subsequent charts to inherit the first chart's state.

**v3.2.3 fix:** Each chart now receives `[..._goLabels]` (a fresh copy) and the gap indices array is also spread (`[..._goGapIndices]`). `scales.x = {}` is applied to remove `maxTicksLimit`, matching the behaviour of regular Overlay charts.

### Multi-file dashboard: MC charts appear mixed with last file's charts (fixed in v3.2.3)

**Symptom:** When two or more standard files and MC overlay data are loaded together, the Multi-Component charts appear directly after the last standard file's charts with no visual separation, making it look as if they belong to that file.

**Root cause:** `_generateAllFileDashboards()` appended all charts to the same `#dashboard` container without any section headers or visual breaks.

**v3.2.3 fix:** The function now pre-clears the dashboard once, then inserts a labelled **file section header** div before each file's charts and before the MC section (`Multi-Component Analysis`). Each section header shows the file name and is colour-coded (blue for standard files, green for MC). This also means saving a profile while viewing a multi-file dashboard correctly identifies which rules belong to which file, since the rule queue routing has not changed.

### Incorrect threshold alerts for raw-value metrics / formula-% rules (fixed in v3.2.3)

**Symptom A — false alerts every data point:** A direct rule with tokens whose raw values are in millions (e.g. `free = 8 000 000 KB`) produces a critical alert on every single data point even when the threshold is set to a reasonable number like `90`.

**Root cause:** The `checkThresholds` direct/ratio path compared `val >= thresh.critical` without converting the operands to numbers first and without checking for empty-string thresholds. In JavaScript `val >= ''` coerces `''` to `0`, so positive raw values always satisfy the condition.

**v3.2.3 fix:** The direct/ratio path now mirrors the formula path — both operands are converted with `Number()`, empty strings produce `null` (no check), and `isNaN` guards prevent comparisons against non-numeric thresholds.

**Symptom B — multi-file alerts run against wrong file's data:** When Refresh All generates charts for multiple files, all threshold rules were checked against the first file's data only. Rules for `free.txt` (memory, millions) were checked against CPU data or vice versa, producing spurious breaches or missing real ones.

**v3.2.3 fix:** Threshold checks in `_generateAllFileDashboards()` now run per-file: each file's matching rules are evaluated against that file's own parsed data. MC rules continue to use `compIndexStore` independently. The combined breach list is then rendered once in the Alert Panel.

---

### Dashboard progress bar stuck at 30% / browser freezes during chart generation (fixed in v3.3.0)

**Symptom:** After clicking **Generate Dashboard** or **↺ Refresh All**, the progress bar fills to 30% and then the browser tab becomes unresponsive for several seconds before suddenly jumping to 100%. With many charts or large datasets the freeze could last 10–30 seconds.

**Root cause:** `generateDashboard()` was a synchronous function. It set the progress bar to 30% and then immediately rendered all Chart.js instances in a single blocking JS call — the browser could not repaint between the 30% update and the 100% completion update, so the tab appeared frozen.

**v3.3.0 fix:** `generateDashboard()` is now an `async` function. It yields control to the browser immediately after setting 30% (via `setTimeout(0)`) so the progress bar paints before rendering starts. Charts render in a `for` loop with a yield and a progress update between each chart:
- **Standalone call** (single file, "Generate Dashboard"): progress advances from 30% → 90% across all charts, then 100% on completion.
- **Multi-file call** (↺ Refresh All): each file is allocated a proportional slice of the 0–88% range; charts within that file advance the bar through their file's slice. MC sections use 90–98%. No backward jumps between files.

---

### Multi-file Refresh All: "Error processing … _doClear is not defined — skipping to next file" (fixed in v3.3.0)

**Symptom:** Loading more than one data file and clicking **↺ Refresh All** produces a log entry for every file:

```
Refresh All: Error processing "KPI-2026-04-22.csv": _doClear is not defined — skipping to next file.
```

No charts are generated for any file.

**Root cause:** `const _doClear` was declared inside the `try { }` block of `generateDashboard()`, but was also referenced in the `finally { }` block. In JavaScript, `const`/`let` are block-scoped — `try` and `finally` are separate block scopes, so `_doClear` was not visible in `finally`. When `generateDashboard()` was synchronous and called without `await`, this `ReferenceError` from `finally` propagated silently (uncaught). After v3.3.0 made `generateDashboard()` async and `_generateAllFileDashboards()` started `await`-ing it, the rejected Promise was caught and the error was logged for every file.

**v3.3.0 fix:** `const _doClear` is now declared before the `try` block, at function scope, where it is visible to both `try` and `finally`.

---

### Uploading a binary or non-text file: "Binary File Detected" popup (v3.3.0)

**Symptom:** After dragging in one or more files, a red pop-up appears:

> **⚠ Binary File Detected**
> The following file(s) appear to be binary (not comma-separated text) and were skipped. All other files have been loaded normally.

The listed filenames are skipped; any remaining files in the same upload load and parse normally.

**Cause:** The tool samples the first 8 KB of every uploaded file:
- A **null byte** (`\x00`) in the sample → definitive binary.
- More than **10% control characters** (anything below ASCII 32 excluding TAB, LF, CR, plus DEL) → likely binary.

If either condition is met and the file extension is not `.xls`, the file is rejected. `.xls` files pass this check through the XLS converter regardless.

**Resolution:** Ensure the file is comma-separated plain text (`.csv`, `.txt`, `.log`) or a genuine `.xls` Excel file. Binary formats such as `.xlsx`, `.db`, `.bin`, executables, or archive files are not supported — convert to CSV first.

---

### `.xls` file support (v3.3.0)

The tool now accepts `.xls` files alongside `.csv`, `.txt`, and `.log`. The binary-file check (Section 16 above) determines which path is taken:

| File content | Detected as | Action |
|---|---|---|
| True Excel binary (BIFF8) | Binary | Converted to CSV via SheetJS (first sheet); rest of pipeline unchanged |
| Plain-text CSV saved/renamed as `.xls` | Text | Read directly as CSV text; no conversion needed |

**Limitations:**
- For true binary `.xls`: only the **first sheet** is used. If your data lives on a later sheet, open the file in Excel or LibreOffice, move or copy the data to Sheet 1, and re-save.
- `.xlsx` (modern Office Open XML format) is **not** supported. Use *Save As → Excel 97–2003 Workbook (.xls)* or *Save As → CSV* instead.
- Dates exported from Excel may carry a time component (`2026-04-22 00:00:00`). The parser handles the most common combined timestamp formats; if timestamps are not recognised, switch the **Timestamp Format** option in CSV Options.

---

### Directory search finds files but only one chart section appears, not per-file sections (v3.4.0 behaviour)

This is correct behaviour. When **Search Directory for Files** is active, all matched files are automatically combined into a single merged dataset (sorted by timestamp). The Rule Builder produces **one chart per rule** spanning the complete dataset across all files — not one chart section per file. This matches the intent of searching a directory: you want a single continuous view across multiple data captures.

If you need per-file sections, upload the files manually (drag-and-drop or file picker) and leave the Combine Files checkbox unchecked.

---

### Directory search: two files with the same name from different sub-folders were being overwritten (fixed in v3.4.0)

**Symptom:** Directory search reported "Found 2 matching file(s)" but the log showed `rawFilesStore keys: [iostat_cpu.txt]` — only one key. One file's data was silently overwriting the other.

**Root cause:** The store used the bare filename (`iostat_cpu.txt`) as the key. Two files with the same name in different sub-folders collided.

**v3.4.0 fix:** The store now uses the relative path from the chosen directory root as the key (e.g. `server1/iostat_cpu.txt`, `server2/iostat_cpu.txt`). Both files are loaded correctly and both contribute to the merged dataset.

---

### Activity Console is too small to see all log entries

The console panel is resizable. Drag the thin bar at the very top of the console panel upward to increase its height. A blue grip indicator appears on hover to mark the drag zone.

The default height was increased from 280 px to 400 px in **v3.4.0**. When a directory search starts, the console is also expanded automatically.
