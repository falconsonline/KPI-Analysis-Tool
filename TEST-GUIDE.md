# KPI Analysis Tool — Test Execution Guide

## Prerequisites

- **Node.js** 18+ installed (`node --version`)
- **npm** installed (`npm --version`)

## Quick Start

```bash
# 1. Navigate to project directory
cd /path/to/KPI-Analysis-Tool

# 2. Install dependencies
npm install

# 3. Install Playwright Chromium browser (first time only)
npx playwright install chromium

# 4. Run all tests
npx playwright test tests/kpi-tool-v2.spec.js --reporter=list
```

Expected output: `50 passed`

---

## Step-by-Step Execution

### Step 1: Install Dependencies

```bash
npm install
```

This installs `@playwright/test` as listed in `package.json`.

### Step 2: Install Playwright Browser

```bash
npx playwright install chromium
```

Downloads the Chromium browser binary used by Playwright. This is ~162MB and only needed once.

### Step 3: Run Tests (Headless)

```bash
npx playwright test tests/kpi-tool-v2.spec.js --reporter=list
```

This will:
1. Start a local Python HTTP server on port 3000 (via `playwright.config.js`)
2. Serve `KPI-Analysis-Tool.html` at `http://localhost:3000`
3. Run all 50 tests in Chromium headless mode
4. Print pass/fail for each test

### Step 4: Run Tests (Headed — Watch in Browser)

```bash
npx playwright test tests/kpi-tool-v2.spec.js --headed
```

Opens a visible browser window so you can watch each test execute.

### Step 5: Run Specific Test Group

```bash
# Run only Fix A tests
npx playwright test tests/kpi-tool-v2.spec.js -g "Fix A"

# Run only Enhancement 1 tests
npx playwright test tests/kpi-tool-v2.spec.js -g "Enhancement 1"

# Run only Regression tests
npx playwright test tests/kpi-tool-v2.spec.js -g "Regression"
```

Available group names:
- `"Page Load"`
- `"File Upload"`
- `"Fix B"` (Copy Button)
- `"Fix A"` (Stats Refresh)
- `"Fix C"` (Tooltip Filter)
- `"Enhancement 1"` (Key Detection)
- `"Enhancement 2"` (Aggregation)
- `"Enhancement 3"` (Format Detection)
- `"Enhancement 4"` (Master Config)
- `"Security"` (SRI)
- `"Regression"`
- `"toggleCsvOptions"`

### Step 6: Generate HTML Report

```bash
npx playwright test tests/kpi-tool-v2.spec.js --reporter=html
npx playwright show-report
```

Opens an interactive HTML report in your browser with detailed results, timings, and traces for any failures.

### Step 7: Debug a Failing Test

```bash
# Run with Playwright Inspector (step-through debugger)
npx playwright test tests/kpi-tool-v2.spec.js -g "test name" --debug

# Run with trace on
npx playwright test tests/kpi-tool-v2.spec.js --trace on
```

---

## Manual Validation Checklist

After all automated tests pass, verify these scenarios manually by opening `KPI-Analysis-Tool.html` in a browser:

### File Upload / Drop
- [ ] Click the drop zone — file picker opens
- [ ] Select a CSV file — file loads and inventory appears
- [ ] Drag and drop a file onto the drop zone — file loads
- [ ] Try uploading a non-CSV/LOG/TXT file — warning appears

### Copy Button (Fix B)
- [ ] Generate a dashboard with any data
- [ ] Copy button (clipboard icon) is visible on each chart
- [ ] Clicking copy button copies chart image to clipboard

### Stats Table Refresh (Fix A)
- [ ] Load multiComp overlay data (e.g., `sample-mc-overlay.csv`)
- [ ] Create an overlay rule and generate dashboard
- [ ] Click a legend chip to hide a group — stats table updates to show fewer rows
- [ ] Click "All" button — stats table shows all rows again

### Tooltip Behavior (Fix C)
- [ ] Hover over a chart with multiple datasets — tooltip shows
- [ ] Hide some datasets via legend — tooltip only shows visible datasets
- [ ] Tooltip doesn't overflow the chart boundary

### Dynamic Key Detection (Enhancement 1)
- [ ] Load `mystats.csv` as multiComp — sequence field (col 2) is not used as a key
- [ ] Component selector shows correct key structure (not sequence numbers)
- [ ] Key label in UI updates dynamically

### Aggregation (Enhancement 2)
- [ ] Check "Aggregate" checkbox — SUM/AVG and per-sec options appear
- [ ] Add a rule with aggregation enabled — rule stores agg settings
- [ ] Generate dashboard with aggregated data — single chart with aggregated values

### Auto Format Detection (Enhancement 3)
- [ ] Set format to "Auto-Detect" and load a logPipe file — detected correctly
- [ ] Set format to "Auto-Detect" and load a flatCsv file — detected correctly
- [ ] Set format to "Auto-Detect" and load a multiComp file — detected correctly

### Master Config (Enhancement 4)
- [ ] Click Config button and load `sample-master-config.json`
- [ ] Badge shows "Config loaded" indicator
- [ ] Load matching data — profile auto-matches and applies rules
- [ ] Click clear config — config resets

### Security (SRI)
- [ ] View page source — all CDN `<script>` tags have `integrity` and `crossorigin` attributes
- [ ] CDN URLs include version pins (`@4.5.1`, `@2.2.0`)

### Theme Toggle
- [ ] Click theme toggle — switches to dark mode
- [ ] Click again — switches back to light mode

---

## Troubleshooting

### Port 3000 Already in Use
```bash
# Find and kill the process
lsof -i :3000
kill -9 <PID>
```

### Playwright Not Found
```bash
npm install
npx playwright install chromium
```

### Tests Timeout
Increase timeout in `playwright.config.js`:
```js
use: { timeout: 30000 }
```

### Python HTTP Server Not Found
The test config uses `python3 -m http.server 3000`. Ensure Python 3 is installed:
```bash
python3 --version
```

---

## Project Structure

```
KPI-Analysis-Tool/
├── KPI-Analysis-Tool.html      # Main application (single file)
├── playwright.config.js         # Playwright configuration
├── package.json                 # Node.js dependencies
├── TEST-RESULTS.md              # Test execution results
├── TEST-GUIDE.md                # This file
└── tests/
    ├── kpi-tool-v2.spec.js      # Comprehensive test suite (50 tests)
    └── fixtures/
        ├── sample-flatcsv.csv        # Flat CSV test data
        ├── sample-logpipe.log        # Log pipe test data
        ├── sample-mc-overlay.csv     # MultiComp overlay test data
        ├── sample-mc-sequence.csv    # MultiComp with sequence field
        ├── sample-master-config.json # Master config profiles
        └── sample-rules.json        # Rule configuration
```
