const fs = require('fs');
const {
    Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    Header, Footer, AlignmentType, LevelFormat,
    HeadingLevel, BorderStyle, WidthType, ShadingType,
    PageNumber, PageBreak
} = require('docx');

// ── Constants ──────────────────────────────────────────────────────────────────
const PAGE_WIDTH = 12240;  // US Letter
const PAGE_HEIGHT = 15840;
const MARGIN = 1440;       // 1 inch
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN; // 9360
const FONT = "Arial";
const ACCENT = "2E5090";   // dark blue
const LIGHT_ACCENT = "D5E8F0";
const HEADER_BG = "2E5090";
const HEADER_FG = "FFFFFF";

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 60, bottom: 60, left: 100, right: 100 };

// ── Helpers ────────────────────────────────────────────────────────────────────
function h1(text) {
    return new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 360, after: 200 },
        children: [new TextRun({ text, bold: true, font: FONT, size: 32, color: ACCENT })]
    });
}
function h2(text) {
    return new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 280, after: 160 },
        children: [new TextRun({ text, bold: true, font: FONT, size: 26, color: ACCENT })]
    });
}
function h3(text) {
    return new Paragraph({
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 200, after: 120 },
        children: [new TextRun({ text, bold: true, font: FONT, size: 22, color: "333333" })]
    });
}
function p(text, opts = {}) {
    return new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({ text, font: FONT, size: 20, ...opts })]
    });
}
function pRuns(runs) {
    return new Paragraph({
        spacing: { after: 120 },
        children: runs.map(r => typeof r === 'string' ? new TextRun({ text: r, font: FONT, size: 20 }) : new TextRun({ font: FONT, size: 20, ...r }))
    });
}
function code(text) {
    return new Paragraph({
        spacing: { before: 60, after: 60 },
        indent: { left: 360 },
        children: [new TextRun({ text, font: "Courier New", size: 18, color: "333333" })]
    });
}
function codeBlock(lines) {
    return lines.map(line => code(line));
}
function emptyLine() {
    return new Paragraph({ spacing: { after: 80 }, children: [] });
}

function headerCell(text, width) {
    return new TableCell({
        borders,
        width: { size: width, type: WidthType.DXA },
        shading: { fill: HEADER_BG, type: ShadingType.CLEAR },
        margins: cellMargins,
        children: [new Paragraph({ children: [new TextRun({ text, font: FONT, size: 18, bold: true, color: HEADER_FG })] })]
    });
}
function dataCell(text, width, opts = {}) {
    return new TableCell({
        borders,
        width: { size: width, type: WidthType.DXA },
        shading: opts.shade ? { fill: opts.shade, type: ShadingType.CLEAR } : undefined,
        margins: cellMargins,
        children: [new Paragraph({
            children: [new TextRun({ text, font: opts.mono ? "Courier New" : FONT, size: 18, bold: !!opts.bold, color: opts.color || "333333" })]
        })]
    });
}
function dataCellRuns(runs, width, opts = {}) {
    return new TableCell({
        borders,
        width: { size: width, type: WidthType.DXA },
        shading: opts.shade ? { fill: opts.shade, type: ShadingType.CLEAR } : undefined,
        margins: cellMargins,
        children: [new Paragraph({
            children: runs.map(r => typeof r === 'string' ? new TextRun({ text: r, font: FONT, size: 18 }) : new TextRun({ font: FONT, size: 18, ...r }))
        })]
    });
}

function makeTable(headers, rows, colWidths) {
    const totalW = colWidths.reduce((a, b) => a + b, 0);
    return new Table({
        width: { size: totalW, type: WidthType.DXA },
        columnWidths: colWidths,
        rows: [
            new TableRow({ children: headers.map((h, i) => headerCell(h, colWidths[i])) }),
            ...rows.map(row => new TableRow({
                children: row.map((cell, i) => {
                    if (typeof cell === 'object' && cell._isCell) return cell;
                    return dataCell(String(cell), colWidths[i]);
                })
            }))
        ]
    });
}

// ── Document Content ───────────────────────────────────────────────────────────

const doc = new Document({
    styles: {
        default: { document: { run: { font: FONT, size: 20 } } },
        paragraphStyles: [
            { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
                run: { size: 32, bold: true, font: FONT, color: ACCENT },
                paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
            { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
                run: { size: 26, bold: true, font: FONT, color: ACCENT },
                paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 } },
            { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
                run: { size: 22, bold: true, font: FONT, color: "333333" },
                paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 } },
        ]
    },
    numbering: {
        config: [
            { reference: "bullets",
                levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
                    style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
            { reference: "numbers",
                levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
                    style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
            { reference: "bullets2",
                levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
                    style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
            { reference: "numbers2",
                levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
                    style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
        ]
    },
    sections: [
        // ══════════════════════════════════════════════════════════════════════
        // COVER PAGE
        // ══════════════════════════════════════════════════════════════════════
        {
            properties: {
                page: {
                    size: { width: PAGE_WIDTH, height: PAGE_HEIGHT },
                    margin: { top: 2880, right: MARGIN, bottom: MARGIN, left: MARGIN }
                }
            },
            children: [
                emptyLine(), emptyLine(), emptyLine(),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 200 },
                    children: [new TextRun({ text: "KPI Analysis Tool", font: FONT, size: 56, bold: true, color: ACCENT })]
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 },
                    children: [new TextRun({ text: "Master Config & Header Annotation Guide", font: FONT, size: 36, color: "555555" })]
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    border: { top: { style: BorderStyle.SINGLE, size: 6, color: ACCENT, space: 12 } },
                    spacing: { before: 600, after: 200 },
                    children: [new TextRun({ text: "Comprehensive Reference for Header Annotations,", font: FONT, size: 22, color: "666666" })]
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 100 },
                    children: [new TextRun({ text: "Instance ID Detection, Wildcard Matching,", font: FONT, size: 22, color: "666666" })]
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 },
                    children: [new TextRun({ text: "and Master Config JSON Profiles", font: FONT, size: 22, color: "666666" })]
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 400 },
                    children: [new TextRun({ text: "Version 1.0  |  March 2026", font: FONT, size: 20, color: "999999" })]
                }),
            ]
        },

        // ══════════════════════════════════════════════════════════════════════
        // MAIN CONTENT
        // ══════════════════════════════════════════════════════════════════════
        {
            properties: {
                page: {
                    size: { width: PAGE_WIDTH, height: PAGE_HEIGHT },
                    margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN }
                }
            },
            headers: {
                default: new Header({
                    children: [new Paragraph({
                        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: ACCENT, space: 4 } },
                        children: [new TextRun({ text: "KPI Analysis Tool \u2014 Master Config & Header Guide", font: FONT, size: 16, color: "999999", italics: true })]
                    })]
                })
            },
            footers: {
                default: new Footer({
                    children: [new Paragraph({
                        alignment: AlignmentType.CENTER,
                        border: { top: { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC", space: 4 } },
                        children: [
                            new TextRun({ text: "Page ", font: FONT, size: 16, color: "999999" }),
                            new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 16, color: "999999" })
                        ]
                    })]
                })
            },
            children: [
                // ─── Section 1: Overview ─────────────────────────────────────
                h1("1. Overview"),
                p("The KPI Analysis Tool supports a header annotation mechanism that allows CSV column headers to self-describe which columns are component key fields and which are KPI data columns. This mechanism works across all CSV-based formats (flatCsv and multiComp)."),
                p("The annotation system serves three purposes:"),
                new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 80 },
                    children: [new TextRun({ text: "Explicitly identifies key columns vs. KPI data columns in headers", font: FONT, size: 20 })] }),
                new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 80 },
                    children: [new TextRun({ text: "Marks Instance ID columns whose values vary across application instances", font: FONT, size: 20 })] }),
                new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 120 },
                    children: [new TextRun({ text: "Enables wildcard matching in MC Header Files (one header row covers multiple components)", font: FONT, size: 20 })] }),

                // ─── Section 2: Annotation Syntax ────────────────────────────
                h1("2. Header Annotation Syntax"),
                p("Column headers use a parenthetical suffix to indicate key columns:"),
                emptyLine(),
                makeTable(
                    ["Header Pattern", "Role", "Description"],
                    [
                        ["Name(value)", "Key Column", "Column is a component identifier. The (value) is a sample/hint."],
                        ["Name(XXX)", "Instance ID Key", "Column contains instance IDs that vary (0, 1, 2, ...). XXX = wildcard."],
                        ["Name", "KPI Data Column", "No parentheses = this column contains measurable KPI data."],
                    ],
                    [2400, 2000, 4960]
                ),
                emptyLine(),
                h3("Rules"),
                new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 80 },
                    children: [new TextRun({ text: "Annotated key columns must appear contiguously after timestamp columns and before KPI data columns", font: FONT, size: 20 })] }),
                new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 80 },
                    children: [new TextRun({ text: "The (value) annotation is parsed by the existing parseMcHeaderCol() function", font: FONT, size: 20 })] }),
                new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 80 },
                    children: [new TextRun({ text: "(XXX) is case-insensitive and means \"this column\u2019s value varies per instance\"", font: FONT, size: 20 })] }),
                new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 120 },
                    children: [new TextRun({ text: "Any column with (...) annotation is treated as a key column regardless of annotation value", font: FONT, size: 20 })] }),

                // ─── Section 3: Supported Timestamp Formats ──────────────────
                h1("3. Supported Timestamp Formats"),
                emptyLine(),
                makeTable(
                    ["Format", "Columns", "Example Data", "Key Cols Start At"],
                    [
                        ["Date + Time", "2 (col 0 + col 1)", "2025-01-01,08:00:00", "Index 2"],
                        ["Single Timestamp", "1 (col 0 only)", "250101 08:00:00", "Index 1"],
                        ["LogPipe", "N/A (before first |)", "Jan 15 08:00:00|KPI:val", "N/A (self-describing)"],
                    ],
                    [2200, 2000, 3000, 2160]
                ),
                emptyLine(),
                p("The timestamp format determines where key column annotations can begin. With Date+Time (2 columns), annotations start at column index 2. With Single Timestamp (1 column), annotations start at index 1."),

                // ─── Section 4: Data File Formats ────────────────────────────
                new Paragraph({ children: [new PageBreak()] }),
                h1("4. Data File Formats with Annotations"),

                h2("4.1 FlatCsv with Instance ID"),
                p("FlatCsv files normally treat all rows as a single flat series. When headers contain annotations, the file automatically promotes to multi-component mode, splitting data by component key."),
                emptyLine(),
                h3("Example: GGSN with 4 Instances (Date+Time format)"),
                ...codeBlock([
                    "Date,Time,NodeId(GGSN01),Instance(XXX),ActivePDP,CreateReq,DeleteReq,Throughput",
                    "2025-01-01,08:00,GGSN01,0,15000,200,50,1200",
                    "2025-01-01,08:00,GGSN01,1,14800,190,48,1150",
                    "2025-01-01,08:00,GGSN01,2,15200,210,52,1250",
                    "2025-01-01,08:00,GGSN01,3,14900,195,49,1180",
                    "2025-01-01,08:01,GGSN01,0,15100,205,48,1220",
                    "... (continues for all timestamps and instances)",
                ]),
                emptyLine(),
                pRuns([
                    { text: "Key columns: ", bold: true },
                    "NodeId(GGSN01) at index 2, Instance(XXX) at index 3"
                ]),
                pRuns([
                    { text: "KPI data columns: ", bold: true },
                    "ActivePDP, CreateReq, DeleteReq, Throughput (indices 4-7)"
                ]),
                pRuns([
                    { text: "Component keys generated: ", bold: true },
                    "GGSN01|0, GGSN01|1, GGSN01|2, GGSN01|3"
                ]),
                pRuns([
                    { text: "Instance(XXX): ", bold: true },
                    "Values 0, 1, 2, 3 represent 4 application instances"
                ]),

                emptyLine(),
                h3("Example: STP with Single Timestamp format"),
                ...codeBlock([
                    "250101 080000,NYC,LS01,1,50000,48000,0,12",
                    "250101 080000,NYC,LS01,2,51000,49500,0,8",
                    "250101 080000,NYC,LS01,3,49800,47900,1,15",
                ]),
                pRuns([
                    { text: "Header (manual or from config): ", bold: true },
                ]),
                code("Timestamp,SiteCode(NYC),LinkSet(LS01),Instance(XXX),MSU_Rx,MSU_Tx,Congestion,Errors"),
                pRuns([
                    { text: "Note: ", bold: true },
                    "Single timestamp (tsColCount=1), so key columns start at index 1."
                ]),

                // ─── MultiComp ───────────────────────────────────────────────
                new Paragraph({ children: [new PageBreak()] }),
                h2("4.2 MultiComp with Embedded Section Headers"),
                p("MultiComp data files can contain multiple component sections, each with its own embedded header row. Different component types can have different KPI column structures."),
                emptyLine(),
                h3("Example: Mixed GSM + LTE Data"),
                ...codeBlock([
                    "Date,Time,Type(GSM),CompId(BTS01),TCH_Avail,TCH_Used,SD_Drops,HO_Success",
                    "2025-01-01,08:00,GSM,BTS01,120,85,2,98.5",
                    "2025-01-01,08:01,GSM,BTS01,120,90,1,99.0",
                    "Date,Time,Type(GSM),CompId(BTS02),TCH_Avail,TCH_Used,SD_Drops,HO_Success",
                    "2025-01-01,08:00,GSM,BTS02,96,72,0,99.2",
                    "2025-01-01,08:01,GSM,BTS02,96,78,1,98.8",
                    "Date,Time,Type(LTE),CompId(eNB01),PRB_DL,PRB_UL,RSRP,SINR,CQI",
                    "2025-01-01,08:00,LTE,eNB01,65,45,-95,12,10",
                    "2025-01-01,08:01,LTE,eNB01,70,48,-93,13,11",
                    "Date,Time,Type(LTE),CompId(eNB02),PRB_DL,PRB_UL,RSRP,SINR,CQI",
                    "2025-01-01,08:00,LTE,eNB02,58,40,-98,10,9",
                    "2025-01-01,08:01,LTE,eNB02,62,43,-96,11,10",
                ]),
                emptyLine(),
                p("Key observations:", { bold: true }),
                new Paragraph({ numbering: { reference: "bullets2", level: 0 }, spacing: { after: 80 },
                    children: [new TextRun({ text: "4 component sections, each preceded by its own header row", font: FONT, size: 20 })] }),
                new Paragraph({ numbering: { reference: "bullets2", level: 0 }, spacing: { after: 80 },
                    children: [new TextRun({ text: "GSM components have 4 KPI columns (TCH_Avail, TCH_Used, SD_Drops, HO_Success)", font: FONT, size: 20 })] }),
                new Paragraph({ numbering: { reference: "bullets2", level: 0 }, spacing: { after: 80 },
                    children: [new TextRun({ text: "LTE components have 5 KPI columns (PRB_DL, PRB_UL, RSRP, SINR, CQI)", font: FONT, size: 20 })] }),
                new Paragraph({ numbering: { reference: "bullets2", level: 0 }, spacing: { after: 80 },
                    children: [new TextRun({ text: "Each embedded header is auto-detected by the parser (key columns have Name(value) format)", font: FONT, size: 20 })] }),
                new Paragraph({ numbering: { reference: "bullets2", level: 0 }, spacing: { after: 120 },
                    children: [new TextRun({ text: "Component keys: GSM|BTS01, GSM|BTS02, LTE|eNB01, LTE|eNB02", font: FONT, size: 20 })] }),

                // ─── Section 5: MC Header File ───────────────────────────────
                new Paragraph({ children: [new PageBreak()] }),
                h1("5. MC Header File (Friendly Name Mapping)"),
                p("The MC Header File is a separate CSV file that maps component keys to human-readable KPI display names. It uses the same annotation syntax, with (XXX) acting as a wildcard for matching."),

                h2("5.1 Wildcard Matching with (XXX)"),
                p("When (XXX) appears in an MC Header File row, it matches ANY value in that key column. This allows one header row to cover multiple components of the same type."),
                emptyLine(),
                h3("MC Header File for the Mixed GSM+LTE example:"),
                ...codeBlock([
                    "Date,Time,Type(GSM),CompId(XXX),TCH Available,TCH Used,SD Drops,Handover Success (%)",
                    "Date,Time,Type(LTE),CompId(XXX),PRB Usage DL (%),PRB Usage UL (%),RSRP (dBm),SINR (dB),CQI Index",
                ]),
                emptyLine(),
                p("Matching logic:", { bold: true }),
                emptyLine(),
                makeTable(
                    ["Component Key", "Type Match", "CompId Match", "Header Row Used", "Friendly KPI Names"],
                    [
                        ["GSM|BTS01", "GSM = (GSM) \u2713", "BTS01 = (XXX) \u2713", "Row 1", "TCH Available, TCH Used, ..."],
                        ["GSM|BTS02", "GSM = (GSM) \u2713", "BTS02 = (XXX) \u2713", "Row 1", "TCH Available, TCH Used, ..."],
                        ["LTE|eNB01", "LTE = (LTE) \u2713", "eNB01 = (XXX) \u2713", "Row 2", "PRB Usage DL (%), ..."],
                        ["LTE|eNB02", "LTE = (LTE) \u2713", "eNB02 = (XXX) \u2713", "Row 2", "PRB Usage DL (%), ..."],
                    ],
                    [1600, 1600, 1700, 1600, 2860]
                ),
                emptyLine(),
                p("Result: BTS01 and BTS02 share the same friendly KPI names (both are GSM type). eNB01 and eNB02 share LTE-specific friendly names. Only 2 header rows needed for 4 components."),

                h2("5.2 FlatCsv MC Header File"),
                p("When flatCsv uses annotated headers, it also supports MC Header File for friendly name mapping."),
                emptyLine(),
                h3("MC Header File for GGSN (all instances share same names):"),
                ...codeBlock([
                    "Date,Time,NodeId(XXX),Instance(XXX),Active PDP Contexts,Create PDP Requests/min,Delete PDP Requests/min,GTP Throughput (Mbps)",
                ]),
                p("Both key columns use (XXX) \u2014 one row matches all instances of all nodes. The friendly names apply to every component."),

                // ─── Section 6: Master Config JSON ───────────────────────────
                new Paragraph({ children: [new PageBreak()] }),
                h1("6. Master Config JSON"),
                p("The Master Config is a JSON file containing application profiles. Each profile defines the file format, header annotations, matching criteria, and pre-configured dashboard rules for an application."),

                h2("6.1 Profile Structure"),
                emptyLine(),
                makeTable(
                    ["Field", "Type", "Description"],
                    [
                        ["name", "string", "Display name shown in UI when profile matches"],
                        ["app", "string", "Application identifier (e.g., GGSN, STP, eNodeB)"],
                        ["format", "string", "Parser mode: flatCsv | multiComp | logPipe"],
                        ["match", "object", "Auto-detection criteria for scoring data files"],
                        ["match.columns", "object", "Column type/pattern checks (keyed by column index)"],
                        ["match.keyFields", "object", "Expected key field cardinality (keyed by column index)"],
                        ["match.allNumericFrom", "number", "Column index from which all values should be numeric"],
                        ["headers", "object", "Column structure definition"],
                        ["headers.hasHeader", "boolean", "true = first CSV row is a header; false = no header in data"],
                        ["headers.tsFormat", "string", "Timestamp format: dateTime (default) | singleTs"],
                        ["headers.columns", "string", "Annotated header string with Name(value) syntax"],
                        ["headers.friendlyNames", "object", "Maps raw KPI names to display names (inline alternative to MC Header File)"],
                        ["rules", "array", "Pre-configured dashboard chart rules"],
                    ],
                    [2800, 1200, 5360]
                ),

                // ─── Section 6.2: Match Section ─────────────────────────────
                emptyLine(),
                h2("6.2 Match Section (Auto-Detection)"),
                p("The match section defines criteria used to automatically detect which profile matches a loaded data file. The tool samples the first few rows and scores each profile."),
                emptyLine(),
                h3("match.columns"),
                p("Checks column types by index:"),
                ...codeBlock([
                    '"columns": {',
                    '    "0": { "type": "date", "pattern": "^\\\\d{4}-\\\\d{2}-\\\\d{2}$" },',
                    '    "1": { "type": "time", "pattern": "^\\\\d{2}:\\\\d{2}" }',
                    '}',
                ]),
                new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 80 },
                    children: [new TextRun({ text: "type: date | time | sequence | numeric | string", font: FONT, size: 20 })] }),
                new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 120 },
                    children: [new TextRun({ text: "pattern: optional regex for precise format validation", font: FONT, size: 20 })] }),

                h3("match.keyFields"),
                p("Checks cardinality of key columns:"),
                ...codeBlock([
                    '"keyFields": {',
                    '    "2": { "maxDistinct": 20 },',
                    '    "3": { "maxDistinct": 100 }',
                    '}',
                ]),
                p("Column 2 should have at most 20 distinct values (e.g., 20 MSC IDs). Column 3 should have at most 100 distinct values (e.g., 100 trunk groups)."),

                h3("match.allNumericFrom"),
                p("Column index from which all subsequent columns should contain numeric data:"),
                ...codeBlock(['"allNumericFrom": 4']),
                p("Columns 4, 5, 6, ... should all be numeric. Helps distinguish flatCsv with 2 key columns (data from col 4) vs. flatCsv with 0 key columns (data from col 2)."),

                // ─── Section 6.3: Headers Section ────────────────────────────
                new Paragraph({ children: [new PageBreak()] }),
                h2("6.3 Headers Section"),
                p("Defines the column structure for parsing:"),
                emptyLine(),
                h3("headers.columns (annotated header string)"),
                ...codeBlock(['"columns": "Date,Time,NodeId(GGSN01),Instance(XXX),ActivePDP,CreateReq,DeleteReq"']),
                new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 80 },
                    children: [new TextRun({ text: "NodeId(GGSN01): key column, sample value GGSN01 (fixed across rows)", font: FONT, size: 20 })] }),
                new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 80 },
                    children: [new TextRun({ text: "Instance(XXX): key column, instance ID (varies: 0, 1, 2, ...)", font: FONT, size: 20 })] }),
                new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 120 },
                    children: [new TextRun({ text: "ActivePDP, CreateReq, DeleteReq: KPI data columns (no parentheses)", font: FONT, size: 20 })] }),

                h3("headers.friendlyNames (inline name mapping)"),
                ...codeBlock([
                    '"friendlyNames": {',
                    '    "ActivePDP": "Active PDP Contexts",',
                    '    "CreateReq": "Create PDP Requests/min",',
                    '    "DeleteReq": "Delete PDP Requests/min"',
                    '}',
                ]),
                p("Maps raw KPI column names to human-readable display names. This is an inline alternative to uploading a separate MC Header File."),

                h3("headers.tsFormat"),
                ...codeBlock(['"tsFormat": "singleTs"']),
                p("Set to \"singleTs\" when column 0 contains a combined timestamp like \"250101 080000\". Default is \"dateTime\" (separate Date and Time columns)."),

                // ─── Section 6.4: Rules Section ──────────────────────────────
                h2("6.4 Rules Section"),
                p("Pre-configured chart rules that auto-queue when the profile matches:"),
                emptyLine(),
                makeTable(
                    ["Field", "Type", "Description"],
                    [
                        ["header", "string", "Chart title displayed above the graph"],
                        ["mode", "string", "Plot mode: direct | ratio | delta"],
                        ["tokens", "array", "KPI column names to plot"],
                        ["thresholds", "object", "Threshold lines (e.g., {\"low\": 40, \"high\": 100})"],
                        ["_mc", "boolean", "Multi-component rule (uses compIndexStore)"],
                        ["_overlay", "boolean", "Overlay: plot all components on one chart"],
                        ["_overlayKeys", "array", "Key column(s) for overlay grouping"],
                        ["compKeys", "array", "Component keys to include. [\"__auto__\"] = all"],
                        ["_aggregate", "boolean", "Aggregate across components"],
                        ["_aggMode", "string", "Aggregation mode: sum | avg"],
                        ["_perSec", "boolean", "Divide values by 60 (per-minute to per-second)"],
                    ],
                    [2200, 1200, 5960]
                ),

                // ─── Section 7: Complete Examples ────────────────────────────
                new Paragraph({ children: [new PageBreak()] }),
                h1("7. Complete Master Config Examples"),

                h2("7.1 FlatCsv: GGSN PDP Statistics (4 instances, Date+Time)"),
                ...codeBlock([
                    '{',
                    '  "name": "GGSN PDP Statistics",',
                    '  "app": "GGSN",',
                    '  "format": "flatCsv",',
                    '  "match": {',
                    '    "columns": {',
                    '      "0": { "type": "date", "pattern": "^\\\\d{4}-\\\\d{2}-\\\\d{2}$" },',
                    '      "1": { "type": "time", "pattern": "^\\\\d{2}:\\\\d{2}" }',
                    '    },',
                    '    "allNumericFrom": 4',
                    '  },',
                    '  "headers": {',
                    '    "hasHeader": true,',
                    '    "columns": "Date,Time,NodeId(GGSN01),Instance(XXX),ActivePDP,CreateReq,DeleteReq,Throughput",',
                    '    "friendlyNames": {',
                    '      "ActivePDP": "Active PDP Contexts",',
                    '      "CreateReq": "Create PDP Requests/min",',
                    '      "DeleteReq": "Delete PDP Requests/min",',
                    '      "Throughput": "GTP Throughput (Mbps)"',
                    '    }',
                    '  },',
                    '  "rules": [',
                    '    {',
                    '      "header": "PDP Session Overview",',
                    '      "mode": "direct",',
                    '      "tokens": ["ActivePDP", "CreateReq", "DeleteReq"],',
                    '      "_mc": true, "_overlay": true,',
                    '      "_overlayKeys": ["Instance"],',
                    '      "compKeys": ["__auto__"]',
                    '    },',
                    '    {',
                    '      "header": "Throughput per Instance",',
                    '      "mode": "direct",',
                    '      "tokens": ["Throughput"],',
                    '      "_mc": true, "_overlay": true,',
                    '      "_overlayKeys": ["Instance"],',
                    '      "compKeys": ["__auto__"]',
                    '    }',
                    '  ]',
                    '}',
                ]),

                new Paragraph({ children: [new PageBreak()] }),
                h2("7.2 FlatCsv: STP Link Statistics (8 instances, Single Timestamp)"),
                ...codeBlock([
                    '{',
                    '  "name": "STP Link Statistics",',
                    '  "app": "STP",',
                    '  "format": "flatCsv",',
                    '  "match": {',
                    '    "columns": {',
                    '      "0": { "type": "date", "pattern": "^\\\\d{6}\\\\s+\\\\d{2}" }',
                    '    },',
                    '    "allNumericFrom": 4',
                    '  },',
                    '  "headers": {',
                    '    "hasHeader": false,',
                    '    "tsFormat": "singleTs",',
                    '    "columns": "Timestamp,SiteCode(NYC),LinkSet(LS01),Instance(XXX),MSU_Rx,MSU_Tx,Congestion,Errors",',
                    '    "friendlyNames": {',
                    '      "MSU_Rx": "MSU Received/min",',
                    '      "MSU_Tx": "MSU Transmitted/min",',
                    '      "Congestion": "Congestion Level",',
                    '      "Errors": "Error Count"',
                    '    }',
                    '  },',
                    '  "rules": [',
                    '    {',
                    '      "header": "MSU Traffic",',
                    '      "mode": "direct",',
                    '      "tokens": ["MSU_Rx", "MSU_Tx"],',
                    '      "_mc": true, "_overlay": true,',
                    '      "_overlayKeys": ["Instance"],',
                    '      "compKeys": ["__auto__"],',
                    '      "_aggregate": true, "_aggMode": "sum", "_perSec": true',
                    '    },',
                    '    {',
                    '      "header": "Link Health",',
                    '      "mode": "direct",',
                    '      "tokens": ["Congestion", "Errors"],',
                    '      "_mc": true, "compKeys": ["__auto__"]',
                    '    }',
                    '  ]',
                    '}',
                ]),

                new Paragraph({ children: [new PageBreak()] }),
                h2("7.3 MultiComp: eNodeB Cell Statistics (Overlay by CellId)"),
                ...codeBlock([
                    '{',
                    '  "name": "eNodeB Cell Statistics",',
                    '  "app": "eNodeB",',
                    '  "format": "multiComp",',
                    '  "match": {',
                    '    "columns": {',
                    '      "0": { "type": "date" },',
                    '      "1": { "type": "time" }',
                    '    },',
                    '    "keyFields": { "2": { "maxDistinct": 100 }, "3": { "maxDistinct": 500 } }',
                    '  },',
                    '  "headers": {',
                    '    "hasHeader": true,',
                    '    "columns": "Date,Time,eNBId(5608995),CellId(13014),RSRP,SINR,CQI,PRB_Usage,RRC_Connected",',
                    '    "friendlyNames": {',
                    '      "RSRP": "RSRP (dBm)",',
                    '      "SINR": "SINR (dB)",',
                    '      "CQI": "CQI Index",',
                    '      "PRB_Usage": "PRB Usage (%)",',
                    '      "RRC_Connected": "RRC Connected Users"',
                    '    }',
                    '  },',
                    '  "rules": [',
                    '    {',
                    '      "header": "RF Quality",',
                    '      "mode": "direct",',
                    '      "tokens": ["RSRP", "SINR", "CQI"],',
                    '      "_mc": true, "_overlay": true,',
                    '      "_overlayKeys": ["CellId"],',
                    '      "compKeys": ["__auto__"]',
                    '    },',
                    '    {',
                    '      "header": "Cell Utilization",',
                    '      "mode": "direct",',
                    '      "tokens": ["PRB_Usage", "RRC_Connected"],',
                    '      "_mc": true, "compKeys": ["__auto__"]',
                    '    }',
                    '  ]',
                    '}',
                ]),

                new Paragraph({ children: [new PageBreak()] }),
                h2("7.4 MultiComp: Mixed Technology (GSM + LTE, Different KPI Structures)"),
                ...codeBlock([
                    '{',
                    '  "name": "Multi-Tech Cell Statistics",',
                    '  "app": "RAN",',
                    '  "format": "multiComp",',
                    '  "match": {',
                    '    "columns": {',
                    '      "0": { "type": "date" },',
                    '      "1": { "type": "time" }',
                    '    },',
                    '    "keyFields": { "2": { "maxDistinct": 10 }, "3": { "maxDistinct": 500 } }',
                    '  },',
                    '  "headers": {',
                    '    "hasHeader": true,',
                    '    "columns": "Date,Time,Type(GSM),CompId(BTS01),TCH_Avail,TCH_Used,SD_Drops,HO_Success"',
                    '  },',
                    '  "rules": [',
                    '    {',
                    '      "header": "GSM Cell Performance",',
                    '      "mode": "direct",',
                    '      "tokens": ["TCH_Avail", "TCH_Used", "SD_Drops"],',
                    '      "_mc": true, "_overlay": true,',
                    '      "_overlayKeys": ["CompId"],',
                    '      "compKeys": ["__auto__"]',
                    '    }',
                    '  ]',
                    '}',
                ]),
                emptyLine(),
                p("Note: The headers.columns in the config provides the annotation structure for the first section type (GSM). The data file itself contains embedded headers for each section, and the parser updates the column mapping when it encounters each new header row."),

                // ─── Section 7.5: LogPipe ────────────────────────────────────
                h2("7.5 LogPipe: STP MTP2 Statistics"),
                ...codeBlock([
                    '{',
                    '  "name": "STP MTP2 Pipe Stats",',
                    '  "app": "STP",',
                    '  "format": "logPipe",',
                    '  "match": {',
                    '    "columns": {',
                    '      "0": { "type": "date", "pattern": "^[A-Z][a-z]{2}\\\\s+\\\\d+" }',
                    '    }',
                    '  },',
                    '  "headers": {},',
                    '  "rules": [',
                    '    {',
                    '      "header": "MTP2 Link Activity",',
                    '      "mode": "direct",',
                    '      "tokens": ["MSU Received Last Min", "SM Started Last Min", "SM Completed Last Min"],',
                    '      "thresholds": { "SM Completed Last Min": { "low": 40 } }',
                    '    }',
                    '  ]',
                    '}',
                ]),
                p("LogPipe format uses pipe-delimited key:value pairs. No header annotations needed as KPI names are embedded in the data. No multi-component support."),

                // ─── Section 8: MC Header Files ──────────────────────────────
                new Paragraph({ children: [new PageBreak()] }),
                h1("8. MC Header File Reference"),
                p("MC Header Files provide friendly KPI display names for components. They use the same annotation syntax as data file headers."),

                h2("8.1 Structure"),
                new Paragraph({ numbering: { reference: "numbers2", level: 0 }, spacing: { after: 80 },
                    children: [new TextRun({ text: "Each row defines friendly names for one component type", font: FONT, size: 20 })] }),
                new Paragraph({ numbering: { reference: "numbers2", level: 0 }, spacing: { after: 80 },
                    children: [new TextRun({ text: "Key columns use Name(value) to identify which components the row applies to", font: FONT, size: 20 })] }),
                new Paragraph({ numbering: { reference: "numbers2", level: 0 }, spacing: { after: 80 },
                    children: [new TextRun({ text: "Name(XXX) = wildcard: matches ANY value in that key column", font: FONT, size: 20 })] }),
                new Paragraph({ numbering: { reference: "numbers2", level: 0 }, spacing: { after: 120 },
                    children: [new TextRun({ text: "KPI columns carry friendly display names (no parentheses)", font: FONT, size: 20 })] }),

                h2("8.2 Examples"),
                emptyLine(),
                h3("Single-type (all components share same KPI names):"),
                ...codeBlock([
                    "Date,Time,NodeId(XXX),Instance(XXX),Active PDP Contexts,Create PDP Requests/min,Delete PDP Requests/min,GTP Throughput (Mbps)",
                ]),
                p("One row with all key columns as (XXX) \u2014 matches every component."),
                emptyLine(),
                h3("Multi-type (different KPI structures per type):"),
                ...codeBlock([
                    "Date,Time,Type(GSM),CompId(XXX),TCH Available,TCH Used,SD Drops,Handover Success (%)",
                    "Date,Time,Type(LTE),CompId(XXX),PRB Usage DL (%),PRB Usage UL (%),RSRP (dBm),SINR (dB),CQI Index",
                ]),
                p("Two rows: GSM components get 4 friendly names, LTE components get 5 different friendly names."),
                emptyLine(),
                h3("Per-component (unique names per component):"),
                ...codeBlock([
                    "Date,Time,Type(GSM),CompId(BTS01),TCH Available (BTS01),TCH Used (BTS01),SD Drops,Handover Success (%)",
                    "Date,Time,Type(GSM),CompId(BTS02),TCH Available (BTS02),TCH Used (BTS02),SD Drops,Handover Success (%)",
                ]),
                p("Exact match on CompId (no wildcard) \u2014 each component can have unique display names if needed."),

                // ─── Section 9: Data Flow ────────────────────────────────────
                new Paragraph({ children: [new PageBreak()] }),
                h1("9. End-to-End Data Flow"),

                h2("9.1 FlatCsv with Annotations"),
                new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 80 },
                    children: [new TextRun({ text: "User loads Master Config JSON (optional) and data CSV file", font: FONT, size: 20 })] }),
                new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 80 },
                    children: [new TextRun({ text: "If Master Config loaded: autoMatchProfile() scores profiles against data", font: FONT, size: 20 })] }),
                new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 80 },
                    children: [new TextRun({ text: "Matched profile sets format to flatCsv, applies headers.columns to manual headers field", font: FONT, size: 20 })] }),
                new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 80 },
                    children: [new TextRun({ text: "parseAnnotatedHeaders() detects Name(value) annotations in headerKeys", font: FONT, size: 20 })] }),
                new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 80 },
                    children: [new TextRun({ text: "Sets mcKeyFieldIndices, mcKeyFieldLabels, mcDataStartIndex from annotations", font: FONT, size: 20 })] }),
                new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 80 },
                    children: [new TextRun({ text: "Data rows parse with multiComp-style key extraction \u2192 compIndexStore", font: FONT, size: 20 })] }),
                new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 80 },
                    children: [new TextRun({ text: "expandAutoCompKeys() replaces __auto__ with discovered component keys", font: FONT, size: 20 })] }),
                new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 120 },
                    children: [new TextRun({ text: "Dashboard generates charts from queued rules with overlay/aggregation", font: FONT, size: 20 })] }),

                h2("9.2 MultiComp with Section Headers"),
                new Paragraph({ numbering: { reference: "numbers2", level: 0 }, spacing: { after: 80 },
                    children: [new TextRun({ text: "Parser processes each line: detects embedded header rows by Name(value) pattern in key columns", font: FONT, size: 20 })] }),
                new Paragraph({ numbering: { reference: "numbers2", level: 0 }, spacing: { after: 80 },
                    children: [new TextRun({ text: "When header row detected: updates headerKeys for subsequent data rows of that section", font: FONT, size: 20 })] }),
                new Paragraph({ numbering: { reference: "numbers2", level: 0 }, spacing: { after: 80 },
                    children: [new TextRun({ text: "Data rows extract key values \u2192 compKey = keyParts.join('|') \u2192 compIndexStore", font: FONT, size: 20 })] }),
                new Paragraph({ numbering: { reference: "numbers2", level: 0 }, spacing: { after: 80 },
                    children: [new TextRun({ text: "Different sections can have different KPI column counts and names", font: FONT, size: 20 })] }),
                new Paragraph({ numbering: { reference: "numbers2", level: 0 }, spacing: { after: 80 },
                    children: [new TextRun({ text: "MC Header File loaded: wildcard matching maps friendly names by type", font: FONT, size: 20 })] }),
                new Paragraph({ numbering: { reference: "numbers2", level: 0 }, spacing: { after: 120 },
                    children: [new TextRun({ text: "Dashboard renders charts with correct KPI labels per component type", font: FONT, size: 20 })] }),

                // ─── Section 10: Quick Reference ─────────────────────────────
                new Paragraph({ children: [new PageBreak()] }),
                h1("10. Quick Reference"),
                emptyLine(),
                makeTable(
                    ["Feature", "Syntax/Value", "Where Used"],
                    [
                        ["Key column marker", "Name(value)", "Data file headers, MC Header File, Master Config headers.columns"],
                        ["Instance ID marker", "Name(XXX)", "Any header \u2014 marks column whose values vary per instance"],
                        ["Wildcard match", "(XXX)", "MC Header File \u2014 matches any value in that key column"],
                        ["Auto component keys", '["__auto__"]', "Master Config rules.compKeys \u2014 expands to all discovered keys"],
                        ["Aggregation", "_aggregate: true", "Master Config rules \u2014 sum or avg across components"],
                        ["Per-second rate", "_perSec: true", "Master Config rules \u2014 divides values by 60"],
                        ["Overlay mode", "_overlay: true", "Master Config rules \u2014 all components on one chart"],
                        ["Overlay grouping", "_overlayKeys: [\"Instance\"]", "Master Config rules \u2014 which key column to group by"],
                        ["Inline friendly names", "headers.friendlyNames", "Master Config \u2014 maps raw KPI names to display names"],
                        ["Single timestamp", 'tsFormat: "singleTs"', "Master Config headers \u2014 column 0 is combined date+time"],
                    ],
                    [2800, 3200, 3360]
                ),
            ]
        }
    ]
});

// ── Generate ───────────────────────────────────────────────────────────────────
Packer.toBuffer(doc).then(buffer => {
    const outPath = process.argv[2] || 'KPI-Tool-Master-Config-Guide.docx';
    fs.writeFileSync(outPath, buffer);
    console.log('Document generated: ' + outPath + ' (' + buffer.length + ' bytes)');
});
