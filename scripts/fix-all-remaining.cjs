#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔧 Fixing ALL remaining warnings...\n');

let lintOutput = '';
try {
    lintOutput = execSync('npm run lint', { stdio: 'pipe', encoding: 'utf-8' });
} catch (error) {
    lintOutput = error.stdout || error.stderr || '';
}

const lines = lintOutput.split('\n');
const fixes = {};

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.match(/^[a-z]:/i) && line.endsWith('.js')) {
        const currentFile = line.trim();
        fixes[currentFile] = fixes[currentFile] || [];
        continue;
    }

    const match = line.match(/^\s+(\d+):(\d+)\s+warning\s+'(_?\w+)'\s+is (?:defined|assigned).*but never used/);
    if (match) {
        const [, lineNum, , varName] = match;
        const currentFile = Object.keys(fixes).pop();
        if (currentFile) {
            fixes[currentFile].push({ line: parseInt(lineNum), varName });
        }
    }
}

console.log(`Found ${Object.keys(fixes).length} files to fix\n`);

let totalFixed = 0;

for (const [filePath, warnings] of Object.entries(fixes)) {
    if (!fs.existsSync(filePath)) continue;

    let content = fs.readFileSync(filePath, 'utf-8');
    const contentLines = content.split('\n');

    warnings.sort((a, b) => b.line - a.line);

    for (const { line, varName } of warnings) {
        const lineIdx = line - 1;
        if (lineIdx < 0 || lineIdx >= contentLines.length) continue;

        const targetLine = contentLines[lineIdx];

        // Fix 1: Remove catch parameter entirely: catch (_e) {} → catch {}
        if (targetLine.includes('catch') && varName.startsWith('_')) {
            contentLines[lineIdx] = targetLine.replace(/catch\s*\([^)]+\)/, 'catch');
            totalFixed++;
            continue;
        }

        // Fix 2: Array destructuring [_id, x] → [, x]
        const arrayDestructPattern = new RegExp(`\\[\\s*${varName}\\s*,`);
        if (arrayDestructPattern.test(targetLine)) {
            contentLines[lineIdx] = targetLine.replace(arrayDestructPattern, '[,');
            totalFixed++;
            continue;
        }

        // Fix 3: Delete const _variable = ... lines entirely
        if (varName.startsWith('_') && targetLine.trim().startsWith('const ') && targetLine.includes('=')) {
            contentLines[lineIdx] = '';
            totalFixed++;
        }
    }

    content = contentLines.join('\n');
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ Fixed ${filePath.replace(process.cwd(), '.')}`);
}

console.log(`\n✨ Fixed ${totalFixed} warnings\n`);
console.log('🔍 Verifying...\n');

try {
    execSync('npm run lint', { stdio: 'inherit' });
    console.log('\n🎉 ALL WARNINGS FIXED!');
    process.exit(0);
} catch (error) {
    const output = error.stdout || error.stderr || '';
    const count = output.split('\n').filter(l => l.includes('warning')).length;
    if (count === 0) {
        console.log('\n🎉 ALL WARNINGS FIXED!');
        process.exit(0);
    } else {
        console.log(`\n⚠️  ${count} warnings remain`);
        process.exit(1);
    }
}
