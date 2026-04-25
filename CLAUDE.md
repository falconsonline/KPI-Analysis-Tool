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
