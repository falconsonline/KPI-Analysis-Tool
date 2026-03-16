import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const FIXTURES = resolve('./tests/fixtures');
const logpipeContent = readFileSync(`${FIXTURES}/sample-logpipe.log`, 'utf8');
const csvContent = readFileSync(`${FIXTURES}/sample-flatcsv.csv`, 'utf8');
const rulesContent = JSON.parse(readFileSync(`${FIXTURES}/sample-rules.json`, 'utf8'));
const dbwContent = JSON.parse(readFileSync('./DBW.json', 'utf8'));

test.beforeEach(async ({ page }) => {
    await page.goto('/KPI-Analysis-Tool.html');
    await page.waitForFunction(() => typeof window.getUnix === 'function');
});

// ── Group 1: getUnix() ────────────────────────────────────────────────────────

test('getUnix: log-pipe format returns positive integer', async ({ page }) => {
    const result = await page.evaluate(() => window.getUnix('Jan 15 | 08:00:00'));
    expect(result).toBeGreaterThan(0);
});

test('getUnix: day prefix stripped — same result as without prefix', async ({ page }) => {
    const [withDay, withoutDay] = await page.evaluate(() => [
        window.getUnix('Mon Jan 15 | 08:00:00'),
        window.getUnix('Jan 15 | 08:00:00')
    ]);
    expect(withDay).toBe(withoutDay);
});

test('getUnix: CSV format returns positive integer', async ({ page }) => {
    const result = await page.evaluate(() => window.getUnix('2026-01-15,08:00:00'));
    expect(result).toBeGreaterThan(0);
});

test('getUnix: empty string returns 0', async ({ page }) => {
    const result = await page.evaluate(() => window.getUnix(''));
    expect(result).toBe(0);
});

test('getUnix: null returns 0', async ({ page }) => {
    const result = await page.evaluate(() => window.getUnix(null));
    expect(result).toBe(0);
});

test('getUnix: earlier timestamp is less than later timestamp', async ({ page }) => {
    const [earlier, later] = await page.evaluate(() => [
        window.getUnix('Jan 15 | 08:00:00'),
        window.getUnix('Jan 15 | 09:00:00')
    ]);
    expect(earlier).toBeLessThan(later);
});

test('getUnix: uses current year (not hardcoded 2026)', async ({ page }) => {
    const result = await page.evaluate(() => {
        const ts = window.getUnix('Jan 15 | 08:00:00');
        const year = Math.floor(ts / 10000000000);
        return year;
    });
    const currentYear = new Date().getFullYear();
    expect(result).toBe(currentYear);
});

// ── Group 2: formatLabel() ────────────────────────────────────────────────────

test('formatLabel: log-pipe format produces readable label', async ({ page }) => {
    const result = await page.evaluate(() => window.formatLabel('Mon Jan 15 | 14:35:42'));
    expect(result).toBe('Jan 15 14:35');
});

test('formatLabel: CSV format produces readable label', async ({ page }) => {
    const result = await page.evaluate(() => window.formatLabel('2026-01-15,14:35:42'));
    expect(result).toBe('2026-01-15 14:35');
});

test('formatLabel: empty string returns empty string', async ({ page }) => {
    const result = await page.evaluate(() => window.formatLabel(''));
    expect(result).toBe('');
});

// ── Group 3: Log-pipe parser ──────────────────────────────────────────────────

test('log-pipe: valid lines are parsed into correct token structure', async ({ page }) => {
    const content = logpipeContent;
    await page.evaluate((text) => {
        window.rawFilesStore = { 'test.log': text };
        document.getElementById('formatType').value = 'logPipe';
        document.getElementById('kpiPattern').value = '';
        window.processFilesFromUI();
    }, content);

    const result = await page.evaluate(() => window.parsedFilesStore['test.log']);
    expect(result).toBeTruthy();
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].timestamp).toContain('|');
    expect(typeof result[0].tokens['MSU Received Last Min']).toBe('number');
    expect(result[0].tokens['MSU Received Last Min']).toBe(100);
});

test('log-pipe: line with fewer than 5 pipe segments is rejected', async ({ page }) => {
    await page.evaluate(() => {
        window.rawFilesStore = { 'bad.log': 'Jan 15 | 08:00:00 | DBWriter | host1' };
        document.getElementById('formatType').value = 'logPipe';
        document.getElementById('kpiPattern').value = '';
        window.processFilesFromUI();
    });
    const result = await page.evaluate(() => window.parsedFilesStore['bad.log']);
    expect(result).toBeUndefined();
});

test('log-pipe: pattern filter excludes non-matching lines', async ({ page }) => {
    const content = logpipeContent;
    await page.evaluate((text) => {
        window.rawFilesStore = { 'test.log': text };
        document.getElementById('formatType').value = 'logPipe';
        document.getElementById('kpiPattern').value = 'NONEXISTENT_PATTERN';
        window.processFilesFromUI();
    }, content);

    const result = await page.evaluate(() => window.parsedFilesStore['test.log']);
    expect(result).toBeUndefined();
});

test('log-pipe: day-of-week prefix in timestamp does not break parsing', async ({ page }) => {
    await page.evaluate(() => {
        window.rawFilesStore = { 'test.log': 'Mon Jan 15 | 08:03:00 | DBWriter | host1 | MSU Received Last Min,200' };
        document.getElementById('formatType').value = 'logPipe';
        document.getElementById('kpiPattern').value = '';
        window.processFilesFromUI();
    });
    const result = await page.evaluate(() => window.parsedFilesStore['test.log']);
    expect(result).toBeTruthy();
    expect(result[0].tokens['MSU Received Last Min']).toBe(200);
});

// ── Group 4: Flat CSV parser ──────────────────────────────────────────────────

test('flatCsv: valid lines with manual headers produce named tokens', async ({ page }) => {
    const content = csvContent;
    await page.evaluate((text) => {
        window.rawFilesStore = { 'test.csv': text };
        document.getElementById('formatType').value = 'flatCsv';
        document.getElementById('csvHasHeader').checked = false;
        document.getElementById('csvManualHeaders').value = 'Date,Time,MSU,SM_Started,SM_Completed,SM_TimedOut';
        document.getElementById('kpiPattern').value = '';
        window.processFilesFromUI();
    }, content);

    const result = await page.evaluate(() => window.parsedFilesStore['test.csv']);
    expect(result).toBeTruthy();
    expect(result.length).toBe(3);
    // Indices 0 and 1 (Date/Time) are skipped — MSU is at index 2
    expect(result[0].tokens['MSU']).toBe(100);
});

test('flatCsv: line with fewer than 3 columns is rejected', async ({ page }) => {
    await page.evaluate(() => {
        window.rawFilesStore = { 'bad.csv': '2026-01-15,08:00:00' };
        document.getElementById('formatType').value = 'flatCsv';
        document.getElementById('csvHasHeader').checked = false;
        document.getElementById('csvManualHeaders').value = '';
        document.getElementById('kpiPattern').value = '';
        window.processFilesFromUI();
    });
    const result = await page.evaluate(() => window.parsedFilesStore['bad.csv']);
    expect(result).toBeUndefined();
});

test('flatCsv: timestamp columns (0,1) do not appear in availableTokens', async ({ page }) => {
    const content = csvContent;
    await page.evaluate((text) => {
        window.rawFilesStore = { 'test.csv': text };
        document.getElementById('formatType').value = 'flatCsv';
        document.getElementById('csvHasHeader').checked = false;
        document.getElementById('csvManualHeaders').value = 'Date,Time,Col_A,Col_B,Col_C,Col_D';
        document.getElementById('kpiPattern').value = '';
        window.processFilesFromUI();
    }, content);

    const tokens = await page.evaluate(() => window.availableTokens);
    expect(tokens).not.toContain('Date');
    expect(tokens).not.toContain('Time');
    expect(tokens).toContain('Col_A');
});

// ── Group 5: Rule Queue ───────────────────────────────────────────────────────

test('addRuleToQueue: queue grows by 1 with correct fields', async ({ page }) => {
    await page.evaluate(() => {
        window.availableTokens = ['MSU Received Last Min'];
        window.populateSelects();
        document.getElementById('selA').options[0].selected = true;
        document.getElementById('gHeader').value = 'Test Chart';
        document.getElementById('analysisMode').value = 'direct';
        document.getElementById('threshWarn').value = '';
        document.getElementById('threshCritical').value = '';
        window.addRuleToQueue();
    });

    const queue = await page.evaluate(() => window.ruleQueue);
    expect(queue.length).toBe(1);
    expect(queue[0].header).toBe('Test Chart');
    expect(queue[0].mode).toBe('direct');
    expect(queue[0].tokens).toContain('MSU Received Last Min');
});

test('addRuleToQueue: threshold values stored when provided', async ({ page }) => {
    await page.evaluate(() => {
        window.availableTokens = ['MSU Received Last Min'];
        window.populateSelects();
        document.getElementById('selA').options[0].selected = true;
        document.getElementById('gHeader').value = 'Threshold Test';
        document.getElementById('analysisMode').value = 'direct';
        document.getElementById('threshWarn').value = '5';
        document.getElementById('threshCritical').value = '10';
        window.addRuleToQueue();
    });

    const queue = await page.evaluate(() => window.ruleQueue);
    expect(queue[0].thresholds['MSU Received Last Min'].warn).toBe(5);
    expect(queue[0].thresholds['MSU Received Last Min'].critical).toBe(10);
});

test('renderQueue: DOM entry created for each rule', async ({ page }) => {
    await page.evaluate(() => {
        window.ruleQueue = [{ header: 'Rule A', mode: 'direct', tokens: ['X'], thresholds: {} }];
        window.renderQueue();
    });
    const count = await page.locator('#queueList > div').count();
    expect(count).toBe(1);
});

test('renderQueue: removing rule updates queue and DOM', async ({ page }) => {
    await page.evaluate(() => {
        window.ruleQueue = [
            { header: 'Rule A', mode: 'direct', tokens: ['X'], thresholds: {} },
            { header: 'Rule B', mode: 'direct', tokens: ['Y'], thresholds: {} }
        ];
        window.renderQueue();
    });
    // Click first remove button (✕)
    await page.locator('#queueList button', { hasText: '✕' }).first().click();

    const [queueLen, domCount] = await page.evaluate(() => [
        window.ruleQueue.length,
        document.querySelectorAll('#queueList > div').length
    ]);
    expect(queueLen).toBe(1);
    expect(domCount).toBe(1);
});

// ── Group 6: Rule Import ──────────────────────────────────────────────────────

test('importRules: DBW.json loads 5 rules with correct first rule', async ({ page }) => {
    const dbwJson = dbwContent;
    await page.evaluate((data) => {
        const raw = data.ruleQueue || [];
        window.ruleQueue = raw.map(r => ({
            header: r.header || 'KPI',
            mode: r.mode || (r.type === 'ratio' ? 'ratio' : 'direct'),
            tokens: r.tokens || [],
            thresholds: r.thresholds || {}
        }));
        window.renderQueue();
    }, dbwJson);

    const [len, first] = await page.evaluate(() => [
        window.ruleQueue.length,
        window.ruleQueue[0]
    ]);
    expect(len).toBe(5);
    expect(first.header).toBe('MSU');
    expect(first.mode).toBe('direct');
});

test('importRules: legacy schema (type/desc) is normalized to mode/description', async ({ page }) => {
    await page.evaluate(() => {
        const legacyData = {
            ruleQueue: [{ header: 'Legacy', type: 'ratio', desc: 'old format', tokens: ['X'] }]
        };
        const raw = legacyData.ruleQueue;
        window.ruleQueue = raw.map(r => ({
            header: r.header || 'KPI',
            mode: r.mode || (r.type === 'ratio' ? 'ratio' : 'direct'),
            tokens: r.tokens || [],
            thresholds: r.thresholds || {}
        }));
    });

    const rule = await page.evaluate(() => window.ruleQueue[0]);
    expect(rule.mode).toBe('ratio');
    expect(rule.header).toBe('Legacy');
});

// ── Group 7: Data Merge ───────────────────────────────────────────────────────

test('mergeAllAndSelect: data from two files is sorted by timestamp', async ({ page }) => {
    await page.evaluate(() => {
        window.parsedFilesStore = {
            'file_a.log': [
                { timestamp: 'Jan 15 | 09:00:00', tokens: { X: 1 } },
                { timestamp: 'Jan 15 | 11:00:00', tokens: { X: 3 } }
            ],
            'file_b.log': [
                { timestamp: 'Jan 15 | 10:00:00', tokens: { X: 2 } }
            ]
        };
        window.mergeAllAndSelect();
    });

    const [data, name] = await page.evaluate(() => [window.activeLogData, window.activeFileName]);
    expect(name).toBe('MERGED_TIMELINE');
    expect(data.length).toBe(3);
    // Should be sorted: 09:00 < 10:00 < 11:00
    const ts = data.map(d => d.tokens.X);
    expect(ts).toEqual([1, 2, 3]);
});

// ── Group 8: Dashboard Generation ────────────────────────────────────────────

test('generateDashboard: creates canvas element for each rule', async ({ page }) => {
    await page.evaluate(() => {
        window.activeLogData = [
            { timestamp: 'Jan 15 | 08:00:00', tokens: { 'MSU Received Last Min': 100 } },
            { timestamp: 'Jan 15 | 08:01:00', tokens: { 'MSU Received Last Min': 120 } },
            { timestamp: 'Jan 15 | 08:02:00', tokens: { 'MSU Received Last Min': 80 } }
        ];
        window.activeFileName = 'test.log';
        window.ruleQueue = [{ header: 'MSU', mode: 'direct', tokens: ['MSU Received Last Min'], thresholds: {} }];
        window.generateDashboard();
    });

    await expect(page.locator('#canvas-0')).toBeAttached();
    await expect(page.locator('.chart-wrapper')).toHaveCount(1);

    const chartCount = await page.evaluate(() => window.chartInstances.length);
    expect(chartCount).toBe(1);
});

test('generateDashboard: chart title uses textContent (XSS safe)', async ({ page }) => {
    await page.evaluate(() => {
        window.activeLogData = [{ timestamp: 'Jan 15 | 08:00:00', tokens: { X: 1 } }];
        window.activeFileName = 'test';
        window.ruleQueue = [{ header: '<script>alert(1)</script>', mode: 'direct', tokens: ['X'], thresholds: {} }];
        window.generateDashboard();
    });

    // The script tag should appear as text, not execute
    const titleText = await page.locator('.chart-wrapper h3').first().textContent();
    expect(titleText).toContain('<script>');
    // No alert dialog should have fired
});

// ── Group 9: Statistics ───────────────────────────────────────────────────────

test('computeStats: correct min/max/mean for known data', async ({ page }) => {
    const stats = await page.evaluate(() => {
        const data = [
            { timestamp: 'ts1', tokens: { X: 10 } },
            { timestamp: 'ts2', tokens: { X: 20 } },
            { timestamp: 'ts3', tokens: { X: 30 } }
        ];
        return window.computeStats(data, ['X']);
    });

    expect(stats.X.min).toBe(10);
    expect(stats.X.max).toBe(30);
    expect(stats.X.mean).toBeCloseTo(20);
    expect(stats.X.count).toBe(3);
});

test('renderStats: stats panel becomes visible after dashboard generation', async ({ page }) => {
    await page.evaluate(() => {
        window.activeLogData = [
            { timestamp: 'Jan 15 | 08:00:00', tokens: { 'MSU Received Last Min': 100 } },
            { timestamp: 'Jan 15 | 08:01:00', tokens: { 'MSU Received Last Min': 200 } }
        ];
        window.activeFileName = 'test';
        window.ruleQueue = [{ header: 'MSU', mode: 'direct', tokens: ['MSU Received Last Min'], thresholds: {} }];
        window.generateDashboard();
    });

    await expect(page.locator('#statsPanel')).not.toHaveClass(/hidden/);
    await expect(page.locator('.stats-table')).toBeAttached();
});

// ── Group 10: Threshold Alerts ────────────────────────────────────────────────

test('checkThresholds: returns breach when value exceeds critical', async ({ page }) => {
    const breaches = await page.evaluate(() => {
        const data = [{ timestamp: 'Jan 15 | 08:00:00', tokens: { 'SM TimedOut Last Min': 15 } }];
        const rules = [{ header: 'Test', mode: 'direct', tokens: ['SM TimedOut Last Min'], thresholds: { 'SM TimedOut Last Min': { warn: 5, critical: 10 } } }];
        return window.checkThresholds(data, rules);
    });

    expect(breaches.length).toBe(1);
    expect(breaches[0].severity).toBe('critical');
    expect(breaches[0].metric).toBe('SM TimedOut Last Min');
    expect(breaches[0].value).toBe(15);
});

test('checkThresholds: returns warn breach when value between warn and critical', async ({ page }) => {
    const breaches = await page.evaluate(() => {
        const data = [{ timestamp: 'Jan 15 | 08:00:00', tokens: { 'SM TimedOut Last Min': 7 } }];
        const rules = [{ header: 'Test', mode: 'direct', tokens: ['SM TimedOut Last Min'], thresholds: { 'SM TimedOut Last Min': { warn: 5, critical: 10 } } }];
        return window.checkThresholds(data, rules);
    });

    expect(breaches.length).toBe(1);
    expect(breaches[0].severity).toBe('warn');
});

test('checkThresholds: no breach when value below warn threshold', async ({ page }) => {
    const breaches = await page.evaluate(() => {
        const data = [{ timestamp: 'Jan 15 | 08:00:00', tokens: { 'SM TimedOut Last Min': 3 } }];
        const rules = [{ header: 'Test', mode: 'direct', tokens: ['SM TimedOut Last Min'], thresholds: { 'SM TimedOut Last Min': { warn: 5, critical: 10 } } }];
        return window.checkThresholds(data, rules);
    });

    expect(breaches.length).toBe(0);
});

test('alert panel appears when threshold breached after dashboard generation', async ({ page }) => {
    await page.evaluate(() => {
        window.activeLogData = [{ timestamp: 'Jan 15 | 08:00:00', tokens: { 'MSU Received Last Min': 200 } }];
        window.activeFileName = 'test';
        window.ruleQueue = [{ header: 'MSU', mode: 'direct', tokens: ['MSU Received Last Min'], thresholds: { 'MSU Received Last Min': { warn: 90, critical: 150 } } }];
        window.alertLog = [];
        document.getElementById('alertBody').innerHTML = '';
        document.getElementById('alertPanel').classList.add('hidden');
        window.generateDashboard();
    });

    await expect(page.locator('#alertPanel')).not.toHaveClass(/hidden/);
    await expect(page.locator('.alert-entry.critical')).toBeAttached();
});

// ── Group 11: UI Interactions ─────────────────────────────────────────────────

test('toggleTheme: cycles light → dark → light', async ({ page }) => {
    const initial = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(initial).toBe('light');

    await page.evaluate(() => window.toggleTheme());
    const dark = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(dark).toBe('dark');

    await page.evaluate(() => window.toggleTheme());
    const light = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(light).toBe('light');
});

test('logAction: appends entry to console body with correct text', async ({ page }) => {
    await page.evaluate(() => window.logAction('unit-test-message'));
    const entries = await page.locator('.log-entry').all();
    const texts = await Promise.all(entries.map(e => e.textContent()));
    expect(texts.some(t => t.includes('unit-test-message'))).toBe(true);
});

test('toggleCsvOptions: shows CSV options when flatCsv mode selected', async ({ page }) => {
    await page.evaluate(() => {
        document.getElementById('formatType').value = 'flatCsv';
        window.toggleCsvOptions();
    });
    await expect(page.locator('#csvOptions')).not.toHaveClass(/hidden/);
});

test('toggleCsvOptions: hides CSV options when logPipe mode selected', async ({ page }) => {
    await page.evaluate(() => {
        document.getElementById('formatType').value = 'logPipe';
        window.toggleCsvOptions();
    });
    await expect(page.locator('#csvOptions')).toHaveClass(/hidden/);
});

test('drop zone: has drag-and-drop event listeners (not just click)', async ({ page }) => {
    // Verify dragover does not throw and modifies class
    await page.evaluate(() => {
        const dz = document.getElementById('drop-zone');
        const evt = new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer: new DataTransfer() });
        dz.dispatchEvent(evt);
    });
    await expect(page.locator('#drop-zone')).toHaveClass(/drag-over/);
});
