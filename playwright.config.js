import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    use: {
        baseURL: 'http://localhost:3000',
        headless: true,
    },
    webServer: {
        command: 'python3 -m http.server 3000',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
    },
});
