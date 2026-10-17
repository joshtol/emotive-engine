/**
 * Check the links in the repo's Markdown (README, docs/, CONTRIBUTING, SECURITY,
 * CODE_OF_CONDUCT, .github templates) and the URLs in package.json.
 * Relative links must resolve to a file; http(s) links must answer 2xx/3xx.
 * Usage: node scripts/check-links.js [--offline]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const offline = process.argv.includes('--offline');

const FILES = [
    // CHANGELOG.md is history: paths from old layouts are expected there and not checked
    'README.md', 'CONTRIBUTING.md', 'SECURITY.md', 'CODE_OF_CONDUCT.md',
    '.github/PULL_REQUEST_TEMPLATE.md',
    ...fs.readdirSync(path.join(ROOT, 'docs')).filter(f => f.endsWith('.md')).map(f => `docs/${f}`),
    ...fs.readdirSync(path.join(ROOT, '.github/ISSUE_TEMPLATE')).map(f => `.github/ISSUE_TEMPLATE/${f}`),
];

const LINK_RE = /\]\(([^)\s]+)(?:\s+"[^"]*")?\)|(?:src|href|url)[=:]\s*"?'?(https?:\/\/[^\s"')>]+|\.{0,2}\/[^\s"')>]+)/g;
const SKIP = [
    /^mailto:/, /^#/, /localhost/, /127\.0\.0\.1/, /example\.com/, /YOUR_USERNAME/, /\{\{/, /^data:/,
    /^\/[^/]/, // root-absolute paths are app examples (<img src="/mascot.png">), not repo links
    /^https:\/\/\.\.\./, // placeholder URL inside a snippet
    /npmjs\.com/, // answers 403 to scripts; the npm badge covers it
];

const links = [];
for (const rel of FILES) {
    const full = path.join(ROOT, rel);
    if (!fs.existsSync(full)) continue;
    const text = fs.readFileSync(full, 'utf8');
    let m;
    while ((m = LINK_RE.exec(text))) {
        const url = (m[1] || m[2] || '').trim();
        if (!url || SKIP.some(re => re.test(url))) continue;
        links.push({ file: rel, url });
    }
}
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
for (const url of [pkg.homepage, pkg.bugs?.url, pkg.repository?.url?.replace(/^git\+/, '').replace(/\.git$/, ''), pkg.funding?.url].filter(Boolean)) {
    links.push({ file: 'package.json', url });
}

const seen = new Map();
const problems = [];

function checkLocal({ file, url }) {
    const clean = url.split('#')[0].split('?')[0];
    if (!clean) return;
    const target = path.resolve(path.dirname(path.join(ROOT, file)), clean);
    if (!fs.existsSync(target)) problems.push({ file, url, why: 'file not found' });
}

/** null when the URL answers 2xx/3xx (HEAD, then GET), otherwise a short reason */
async function fetchStatus(url) {
    for (const method of ['HEAD', 'GET']) {
        try {
            const ctrl = new globalThis.AbortController();
            const t = setTimeout(() => ctrl.abort(), 15000);
            const res = await globalThis.fetch(url, { method, redirect: 'follow', signal: ctrl.signal, headers: { 'user-agent': 'emotive-engine-link-check' } });
            clearTimeout(t);
            if (res.ok || (res.status >= 300 && res.status < 400)) return null;
            if (method === 'HEAD' && (res.status === 405 || res.status === 403 || res.status === 404)) continue;
            return `HTTP ${res.status}`;
        } catch (e) {
            if (method === 'GET') return e.name === 'AbortError' ? 'timeout' : e.message;
        }
    }
    return null;
}

function checkRemote(url) {
    if (!seen.has(url)) seen.set(url, fetchStatus(url));
    return seen.get(url);
}

const remote = [];
for (const l of links) {
    if (/^https?:\/\//.test(l.url)) remote.push(l);
    else checkLocal(l);
}

if (!offline) {
    let i = 0;
    await Promise.all(Array.from({ length: 8 }, async () => {
        while (i < remote.length) {
            const l = remote[i++];
            const why = await checkRemote(l.url);
            if (why) problems.push({ ...l, why });
        }
    }));
}

const uniqueRemote = new Set(remote.map(l => l.url)).size;
console.log(`checked ${links.length} links (${uniqueRemote} unique URLs${offline ? ', remote skipped' : ''}) in ${FILES.length} files`);
for (const p of problems) console.log(`  ${p.file}: ${p.url}  -> ${p.why}`);
if (problems.length) {
    console.log(`${problems.length} problem(s)`);
    process.exitCode = 1;
} else {
    console.log('no broken links');
}
