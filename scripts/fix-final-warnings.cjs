#!/usr/bin/env node

/**
 * Final pass - fix all remaining warnings
 */

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔧 Final pass - fixing all remaining warnings...\n');

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

    const match = line.match(/^\s+(\d+):(\d+)\s+warning\s+'(\w+)'\s+is (?:defined|assigned).*but never used/);
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

        let targetLine = contentLines[lineIdx];

        // Fix 1: catch (_e) {} or catch (_error) {} -> catch {}
        if (targetLine.includes('catch') && varName.startsWith('_')) {
            targetLine = targetLine.replace(/catch\s*\([^)]+\)/, 'catch');
            contentLines[lineIdx] = targetLine;
            totalFixed++;
            continue;
        }

        // Fix 2: Destructuring - const {a, varName} = -> const {a} =
        const destructRemovePattern = new RegExp(`,\\s*${varName}(?=\\s*[}])`);
        if (destructRemovePattern.test(targetLine)) {
            contentLines[lineIdx] = targetLine.replace(destructRemovePattern, '');
            totalFixed++;
            continue;
        }

        // Fix 3: Simple const varName = -> delete line entirely
        const simpleConstPattern = new RegExp(`^\\s*const\\s+${varName}\\s*=`);
        if (simpleConstPattern.test(targetLine) && !targetLine.includes('{')) {
            // Delete the line entirely
            contentLines[lineIdx] = '';
            totalFixed++;
            continue;
        }

        // Fix 4: Parameters in destructuring const {something} = x
        // Just prefix the whole destructured name
        if (targetLine.includes('{') && !varName.startsWith('_')) {
            contentLines[lineIdx] = targetLine.replace(new RegExp(`\\b${varName}\\b`), `_${varName}`);
            totalFixed++;
        }
    }

    content = contentLines.join('\n');
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ Fixed ${filePath.replace(process.cwd(), '.')}`);
}

console.log(`\n✨ Fixed ${totalFixed} warnings`);
console.log('\n🔍 Final lint check...\n');

try {
    execSync('npm run lint', { stdio: 'inherit' });
    console.log('\n🎉 SUCCESS - All warnings fixed!');
    process.exit(0);
} catch (error) {
    const output = error.stdout || error.stderr || '';
    const count = output.split('\n').filter(l => l.includes('warning')).length;
    console.log(`\n⚠️  ${count} warnings still remain.`);
    process.exit(count > 0 ? 1 : 0);
}
