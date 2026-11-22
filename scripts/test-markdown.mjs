import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const url = 'http://127.0.0.1:4173/tests/markdown.html';
const browsers = [process.env.CHROME_BIN, 'google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser'].filter(Boolean);
const browser = browsers.find(name => spawnSync(name, ['--version'], { encoding: 'utf8' }).status === 0);
if (!browser) {
  console.error('No Chrome/Chromium browser found. Set CHROME_BIN or install Chrome.');
  process.exit(1);
}

const server = spawn(process.execPath, [
  'node_modules/vite/bin/vite.js',
  '--host', '127.0.0.1', '--port', '4173', '--strictPort',
], { stdio: ['ignore', 'pipe', 'pipe'] });

let logs = '';
server.stdout.on('data', data => { logs += String(data); });
server.stderr.on('data', data => { logs += String(data); });
const profile = mkdtempSync(join(tmpdir(), 'markdown-browser-'));

try {
  let ready = false;
  for (let attempt = 0; attempt < 50; attempt++) {
    if (server.exitCode !== null) break;
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(1000) });
      if (response.ok) { ready = true; break; }
    } catch { /* Vite is still starting. */ }
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  if (!ready) throw new Error('Vite did not start: ' + logs);

  const result = spawnSync(browser, [
    '--headless', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage',
    '--disable-background-networking', '--no-first-run', '--no-default-browser-check',
    '--virtual-time-budget=5000', '--dump-dom',
    '--user-data-dir=' + profile,
    url,
  ], { encoding: 'utf8', timeout: 30000, maxBuffer: 4000000 });

  const output = result.stdout || '';
  if (result.status !== 0 || !output.includes('data-test-status="pass"')) {
    const detail = output.match(/Markdown tests failed: [^<]+/)?.[0] ?? output.slice(-1200);
    throw new Error('Browser Markdown tests failed. ' + detail + '\n' + (result.stderr || ''));
  }
  console.log(output.match(/Markdown tests passed: \d+ cases/)?.[0] || 'Markdown tests passed');
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  server.kill('SIGTERM');
  rmSync(profile, { recursive: true, force: true });
}
