# CLAUDE.md — KPI Analysis Tool (Strict Execution Framework)

---

## 1. Purpose

This document defines **strict operating constraints** for Claude Code when working on the KPI Analysis Tool.

Claude MUST:

* Preserve full context across the session
* Follow the User Guide exactly 
* Avoid assumptions or inferred behavior
* Generate code only when fully aligned with defined logic

---

## 2. Context Retention (CRITICAL)

Claude MUST treat the **User Guide as the single source of truth**.

### Rules:

* NEVER ignore earlier instructions
* NEVER override previously defined logic unless explicitly instructed
* ALWAYS cross-check new logic with existing behavior
* Maintain consistency across:

  * Parsing logic
  * Rule engine
  * Multi-file handling
  * Multi-Component (MC) behavior

If context is missing → ASK, DO NOT assume

---

## 2.1 Context Snapshot Memory Pattern (MANDATORY)

Claude MUST maintain a **Context Snapshot**.

---

### When to Update

* Before code generation
* After user input
* After logic changes
* When switching modes or formats

---

### Snapshot Structure

```
Context Snapshot

1. Data Format:
2. Dataset Details:
   - Timestamp:
   - Header:
   - Key columns:
   - Component key:

3. Tokens:
4. Mode:
5. Formula:
6. Thresholds:
7. MC Settings:
8. Multi-file Context:
9. Assumptions:
```

---

### Rules

* Snapshot MUST be reused and updated (not recreated blindly)
* Assumptions MUST be empty or explicitly approved

---

### Conflict Handling

If conflict detected:

* Highlight conflict
* Ask user
* STOP execution

---

## 3. No-Assumption Policy (MANDATORY)

Claude MUST NOT:

* Invent tokens or fields
* Guess formats
* Infer KPI relationships

Use ONLY:

* Provided formats
* Actual dataset tokens

If unclear → STOP

---

## 4. Data Parsing Constraints

### Log-Pipe

* ≥5 segments
* KPI starts at segment 5

### Flat CSV

* First column(s) = timestamp

### Multi-Component

* Identify component key
* Use:

  * Annotation OR
  * Group-by column

NO alternative parsing logic allowed

---

## 5. Token Integrity Rules

* Tokens MUST be exact (case-sensitive)
* No silent renaming
* Invalid tokens (e.g. `%`) must be explicitly corrected

---

## 6. Rule Engine Constraints

| Mode         | Rule                 |
| ------------ | -------------------- |
| Direct       | Raw only             |
| Ratio        | First = denominator  |
| Formula      | Single output        |
| Mixed        | Direct + ONE formula |
| Multi-Series | Multiple series      |

NO violations allowed

---

## 7. Threshold Logic

* Formula modes → apply to computed result ONLY
* Direct mode → apply to raw metric
* Support:

  * ≥
  * `below`

---

## 8. Multi-Component Rules

* Respect:

  * Explicit selection
  * `__auto__`
* No hardcoding
* Overlay ≠ Aggregate

---

## 9. Multi-File Rules

* File isolation REQUIRED
* Routing:

  * Profile-based OR manual
* Execution:

  * Single → Generate Dashboard
  * Multi → Refresh All

---

## 10. Formula Rules

* Validate tokens
* Division by zero → NULL
* Reject invalid syntax

---

## 11. Error Handling

* Fail FAST
* Provide reason
* No silent correction

---

## 12. Code Generation Rules

Claude MUST NOT generate code if:

* Requirements unclear
* Tokens unverified
* Logic ambiguous

---

## 12.1 Pre-Code Validation Checklist (MANDATORY)

Claude MUST complete ALL:

### 1. Context Confirmation

* Format
* Timestamp
* Headers
* Dataset scope

### 2. Token Verification

* List tokens
* Validate existence

### 3. Mode Validation

* Confirm constraints

### 4. Formula Validation

* Syntax + tokens

### 5. Threshold Validation

* Correct dataset

### 6. MC Validation

* Key + behavior

### 7. Multi-file Validation

* Routing

### 8. Edge Case Check

* Nulls / missing / zero

### 9. Expected Output

* Define result

### 10. Final Statement

"I have validated all inputs. No assumptions made."

---

## 12.2 Post-Code Validation & Test Scenario Block

Claude MUST:

### 1. Logic Validation

### 2. Token Check

### 3. Edge Case Simulation

### 4. Mode Validation

### 5. Threshold Validation

### 6. MC Validation

### 7. Multi-file Validation

### 8. Dry Run

### 9. Test Scenarios (3)

#### Required:

* Normal case
* Edge case
* Failure case

### 10. Final Statement

"Post-code validation completed. No assumptions introduced."

---

## 13. Ask Instead of Assume

Claude MUST ask when:

* Tokens unclear
* Format unclear
* Mode ambiguous

---

## 14. Do / Don’t

### DO:

* Validate everything
* Preserve context
* Ask when unsure

### DON’T:

* Guess
* Assume
* Skip validation
* Mix logic

---

## 15. Priority Order

1. User instruction
2. User Guide 
3. Existing behavior

---

## 16. Final Enforcement Rule

If:

* Context missing
* Conflict exists
* Logic undefined

→ STOP
→ ASK

NO ASSUMPTIONS ALLOWED

## 17. File Phase-Out & Deprecation Policy (STRICT)

This section defines how Claude MUST handle deprecated, legacy, or phased-out files.

---

### 17.1 Purpose

To ensure Claude:
- Does NOT modify obsolete versions
- Does NOT generate code against deprecated logic
- Always works on the correct active version

---

### 17.2 Definitions

| Term | Meaning |
|-----|--------|
| Active File | Current version to be used |
| Deprecated File | File marked for phase-out |
| Frozen File | Read-only reference (no changes allowed) |
| Replaced File | Deprecated file with a designated replacement |

---

### 17.3 Mandatory Rules

Claude MUST:

- NEVER modify deprecated or phased-out files
- NEVER generate new logic based on deprecated behavior
- ALWAYS prefer the latest active version
- VERIFY file status before making changes

---

### 17.4 Explicit Phase-Out Declaration

When user specifies:

- "This file is deprecated"
- "Phase out this version"
- "Do not use this file"

Claude MUST:

1. Mark file as **DEPRECATED**
2. Stop using it immediately
3. Ask for replacement if not provided

---
## 17.11 Explicit File Phase-Out Rule (KPI-Analysis-Tool.html → KPI-Analysis-Tool-debug.html)

### Status Definition

| File | Status | Action |
|------|--------|--------|
| KPI-Analysis-Tool.html | ❌ DEPRECATED | DO NOT USE / DO NOT MODIFY |
| KPI-Analysis-Tool-debug.html | ✅ ACTIVE | ALL work must happen here |

---

### Mandatory Enforcement Rules

Claude MUST:

- NEVER:
  - Edit `KPI-Analysis-Tool.html`
  - Suggest changes to `KPI-Analysis-Tool.html`
  - Generate code targeting `KPI-Analysis-Tool.html`
  - Reference `KPI-Analysis-Tool.html` as current implementation

- ALWAYS:
  - Use `KPI-Analysis-Tool-debug.html` for all modifications
  - Treat `KPI-Analysis-Tool-debug.html` as the single source of truth
  - Migrate logic from `KPI-Analysis-Tool.html` → `KPI-Analysis-Tool-debug.html` ONLY if explicitly asked

---

### If User Mentions KPI-Analysis-Tool.html

Claude MUST respond:

"This file (KPI-Analysis-Tool.html) is marked as deprecated.  
Do you want to migrate this logic to KPI-Analysis-Tool-debug.html instead?"

Then STOP and wait.

---

### If Code Context Includes KPI-Analysis-Tool.html

Claude MUST:

1. Flag it:
   "KPI-Analysis-Tool.html is deprecated and will not be used."
2. Ignore it for all future logic
3. Continue using ONLY KPI-Analysis-Tool-debug.html

---


If user asks:

"Move logic from KPI-Analysis-Tool.html to KPI-Analysis-Tool-debug.html"

Claude MUST:

1. Extract logic from KPI-Analysis-Tool.html
2. Validate against current KPI-Analysis-Tool-debug.html behavior
3. Merge WITHOUT:
   - Breaking existing logic
   - Reintroducing deprecated patterns
4. Clearly highlight:
   - What was migrated
   - What was skipped

---

### Conflict Handling

If Claude detects:

- Logic mismatch between KPI-Analysis-Tool.html and KPI-Analysis-Tool-debug.html
- Feature present only in KPI-Analysis-Tool.html

Claude MUST:

- NOT auto-merge
- Ask user:
  "This logic exists only in deprecated KPI-Analysis-Tool.html. Should it be ported to KPI-Analysis-Tool-debug.html?"

---

### Hard Stop Rule

If Claude:

- Generates code for KPI-Analysis-Tool.html
- Suggests modifying KPI-Analysis-Tool.html
- Mixes KPI-Analysis-Tool.html and KPI-Analysis-Tool-debug.html logic

→ Response is INVALID  
→ Claude MUST restart using ONLY KPI-Analysis-Tool-debug.html  

NO EXCEPTIONS

---

## 18. Engineering Learnings & Gotchas (2026-04-26)

These are confirmed bugs, patterns, and constraints discovered during active development. Claude MUST apply these before generating similar code.

---

### 18.1 `const`/`let` in `try` is NOT accessible in `finally`

**Discovery:** `generateDashboard()` declared `const _doClear` inside `try { }` but used it in `finally { }`. In JavaScript, `try`, `catch`, and `finally` are separate block scopes. `const`/`let` declared in `try` are not visible in `finally`.

**Why it was silent before:** The function was synchronous and called fire-and-forget (`generateDashboard()` with no `await`). The `ReferenceError` thrown from `finally` propagated into the browser's uncaught-error handler and was never logged. Once the function became `async` and callers used `await`, the rejected Promise was caught and the error appeared.

**Rule:** Any variable needed in both `try` and `finally` MUST be declared at function scope — before the `try {` statement. Use `var` if you need it in `catch` as well (var is function-scoped; const/let are block-scoped).

```javascript
// WRONG
async function foo() {
    try {
        const _flag = true;
        ...
    } finally {
        if (_flag) { ... }  // ReferenceError: _flag is not defined
    }
}

// CORRECT
async function foo() {
    const _flag = true;   // declared before try
    try {
        ...
    } finally {
        if (_flag) { ... }  // accessible ✓
    }
}
```

---

### 18.2 Converting a synchronous function to async surfaces previously-silent errors

**Discovery:** Making `generateDashboard()` async and adding `await` in `_generateAllFileDashboards()` caused four previously-silent `ReferenceError`s (one per file) to appear as "Error processing … — skipping to next file." The errors existed before but were swallowed.

**Rule:** When converting a synchronous fire-and-forget function to async and introducing `await` at the call site, always audit the function's `catch`/`finally` blocks for scope violations first. Errors that were previously silent will now surface as caught Promise rejections.

---

### 18.3 Async IIFE pattern for converting `forEach` to `for` loop with `await`

**Discovery:** `generateDashboard()` used `_rules.forEach((rule, idx) => { ... })` with many early `return` statements inside. Converting to an async `for` loop while preserving the `return`-as-continue semantics required wrapping the body in an immediately-invoked async function expression (IIFE).

**Pattern:**

```javascript
// Before (forEach — returns exit the callback, not the outer function)
rules.forEach((rule, idx) => {
    if (!valid) return;   // skips this iteration
    ...
});

// After (for loop + async IIFE — preserves return semantics, allows await between iterations)
for (let idx = 0; idx < rules.length; idx++) {
    const rule = rules[idx];
    await (async function() {
        if (!valid) return;   // exits IIFE, not the for loop ✓
        ...
    }());
    await new Promise(r => setTimeout(r, 0));  // yield between iterations
}
```

**Rule:** Do NOT change all `return` to `continue` manually when the forEach body is large and complex — use the async IIFE wrapper. It is a safe, mechanical transformation.

---

### 18.4 Progress bar threading for multi-level async dashboard generation

**Discovery:** `generateDashboard()` (inner) and `_generateAllFileDashboards()` (outer) both call `_showGenProgress()`. When `generateDashboard` was made async and awaited by the outer function, inner progress calls (30–90% per chart) conflicted with the outer function's file-level progress (0–88% per file), causing backward jumps.

**Solution:** Add `_progressStart` and `_progressEnd` parameters to `generateDashboard`. When both are provided, chart-level progress is interpolated within that range. When absent (standalone call), the default 30→90% range applies.

**Progress allocation:**
| Range | Content |
|---|---|
| 0 – 88% | Standard file charts (subdivided equally per file, then per chart within each file) |
| 88 – 90% | Transition / file completion |
| 90 – 98% | MC section charts (subdivided equally per MC section) |
| 98 – 100% | Finalisation, threshold checks, alert render |

**Rule:** Any future function that renders charts by calling `generateDashboard()` in a loop MUST pass `_progressStart`/`_progressEnd` so the progress bar advances smoothly without backward jumps.

---

### 18.5 Stale debug warnings must be removed when the underlying code changes

**Discovery:** Three `[DBG-B] TOOLTIP OVERFLOW LIKELY` warnings said "Default mode:index shows all simultaneously" — but the tooltip had already been changed to `mode:'nearest'` with a single-item filter. The warnings were misleading users into thinking there was an active rendering problem.

**Rule:** When fixing a bug that a debug warning was diagnosing, remove or update the warning in the same commit. Stale warnings are worse than no warnings — they create false alarms and erode trust in the log output.

---

### 18.6 Binary file detection approach

**Confirmed working approach (v3.3.0):**
- Sample the first **8 KB** only — fast, non-destructive, covers all common binary signatures.
- A single **null byte** (`\x00`) is a definitive binary indicator — return `true` immediately.
- Count **control characters** outside normal text whitespace: bytes `< 9`, `11`, `12`, `14–31`, `127`. If they exceed **10%** of the sample, treat as binary.
- Normal text whitespace (TAB=9, LF=10, CR=13) is explicitly excluded from the count.
- Binary detection runs on **all** files including `.xls`. A positive result with `.xls` extension routes to SheetJS rather than the rejection path. A negative result with `.xls` extension reads the file as plain text — `.xls` files are often renamed CSVs and not binary at all.

**Rule:** Do NOT extend this check to post-read content (after `f.text()`). Read-as-text silently replaces unmappable bytes with replacement characters, destroying the signal. Always check the raw `ArrayBuffer` via `file.slice(0, 8192).arrayBuffer()`.

---

### 18.7 Adding CDN scripts: always compute SRI hash before committing

**Discovery:** The tool uses SRI (`integrity="sha384-..."`) on all CDN scripts for MITM protection. When SheetJS (`xlsx@0.18.5`) was added, the SRI hash was computed with:

```bash
curl -s https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js \
  | openssl dgst -sha384 -binary | openssl base64 -A
```

Result: `sha384-vtjasyidUo0kW94K5MXDXntzOJpQgBKXmE7e2Ga4LG0skTTLeBi97eFAXsqewJjw`

**Rule:** NEVER add a CDN `<script>` tag without an `integrity` attribute. Always compute the hash for the exact version being pinned. A wrong hash will cause the browser to silently refuse to load the script.

---

### 18.8 `.xls` support architecture

**Key insight (confirmed by user):** A file with a `.xls` extension is NOT necessarily binary. It is common practice to rename a plain-text CSV file as `.xls` (e.g. to open it in Excel by default). The binary detection step determines which path is taken — not the extension alone.

**Decision table:**

| `_isBinaryFile()` result | Extension | Action |
|---|---|---|
| `true` | `.xls` | Route to SheetJS converter (true Excel binary) |
| `true` | anything else | Reject — show binary error popup |
| `false` | `.xls` | Read as plain text (`f.text()`) — it is a renamed CSV |
| `false` | anything else | Read as plain text (`f.text()`) |

**Rule:** Never assume `.xls` means binary. Always run the binary check first and branch on the result.

**SheetJS library:** `xlsx@0.18.5` — loaded via CDN with SRI, exposes `window.XLSX`.

**Conversion pattern for true binary XLS:**
```javascript
const buffer = await file.arrayBuffer();
const wb = XLSX.read(buffer, { type: 'array', cellDates: true });
const ws = wb.Sheets[wb.SheetNames[0]];  // first sheet only
return XLSX.utils.sheet_to_csv(ws, { blankrows: false });
```

The converted CSV string is stored in `rawFilesStore` under the original `.xls` filename. Everything downstream treats it as a regular CSV — no other changes required.

**Limitations to document and enforce:**
- Only the first sheet is used for true binary XLS.
- `.xlsx` is NOT supported (different binary format — would need a different read path).
- `cellDates: true` ensures date cells are read as date strings, not serial numbers.

---

### 18.9 File input `accept` attribute and `ALLOWED_EXTENSIONS` must stay in sync

**Rule:** Whenever a new file extension is supported, update ALL of these together in the same change:
1. `const ALLOWED_EXTENSIONS` array (`validateFile` uses it for the security gate).
2. `<input type="file" id="dataFile" accept="...">` (OS file picker filter).
3. `<small id="file-status">Ready (...)` (initial status text).
4. `document.getElementById('file-status').textContent = 'Ready (...)'` in `removeFile()` and `resetAll()`.

Missing any one of these causes a confusing experience: the OS picker may hide the file, or the security gate rejects it, or the status hint is wrong.
