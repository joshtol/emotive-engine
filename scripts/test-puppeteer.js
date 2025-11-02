import puppeteer from 'puppeteer';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const HTML_PATH = join(__dirname, '../examples/test-puppeteer.html');
const HTML_URL = pathToFileURL(HTML_PATH).href;

console.log('Testing Puppeteer with file:// URL');
console.log('URL:', HTML_URL);

const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security', '--allow-file-access-from-files']
});

const page = await browser.newPage();
page.on('console', msg => console.log('[Browser]', msg.text()));
page.on('pageerror', err => console.error('[Error]', err.message));

await page.goto(HTML_URL, { waitUntil: 'networkidle0' });

const ready = await page.evaluate(() => window.testReady);
console.log('testReady:', ready);

await browser.close();
console.log('Test complete!');
