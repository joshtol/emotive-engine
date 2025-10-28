#!/usr/bin/env node

/**
 * Fix array destructuring unused variables
 * Replaces [_id, value] with [, value]
 */

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔧 Fixing array destructuring warnings...\n');

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

    const match = line.match(/^\s+(\d+):(\d+)\s+warning\s+'(\w+)'\s+is assigned a value but never used/);
    if (match) {
        const [, lineNum, , varName] = match;
        const currentFile = Object.keys(fixes).pop();
        if (currentFile) {
            fixes[currentFile].push({ line: parseInt(lineNum), varName });
        }
    }
}

let totalFixed = 0;

for (const [filePath, warnings] of Object.entries(fixes)) {
    if (!fs.existsSync(filePath)) continue;

    let content = fs.readFileSync(filePath, 'utf-8');

    for (const { varName } of warnings) {
        // Pattern: [_id, ...] or [..., _id, ...] - replace with empty
        const arrayPattern1 = new RegExp(`\\[\\s*${varName}\\s*,`, 'g');
        const arrayPattern2 = new RegExp(`,\\s*${varName}\\s*,`, 'g');
        const arrayPattern3 = new RegExp(`,\\s*${varName}\\s*\\]`, 'g');

        if (arrayPattern1.test(content)) {
            content = content.replace(arrayPattern1, '[,');
            totalFixed++;
        } else if (arrayPattern2.test(content)) {
            content = content.replace(arrayPattern2, ',,');
            totalFixed++;
        } else if (arrayPattern3.test(content)) {
            content = content.replace(arrayPattern3, ',]');
            totalFixed++;
        } else {
            // Simple destructuring: const {varName} = or const varName =
            // Just delete these lines
            const deletePattern = new RegExp(`^\\s*const\\s+${varName}\\s*=.*?;?$`, 'gm');
            const destructPattern = new RegExp(`^\\s*const\\s*\\{[^}]*${varName}[^}]*\\}\\s*=.*?;?$`, 'gm');

            if (deletePattern.test(content)) {
                content = content.replace(deletePattern, '');
                totalFixed++;
            } else if (destructPattern.test(content)) {
                // For object destructuring, remove just the variable
                const objRemovePattern = new RegExp(`,?\\s*${varName}\\s*,?`, 'g');
                content = content.replace(objRemovePattern, '');
                totalFixed++;
            }
        }
    }

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ Fixed ${filePath.replace(process.cwd(), '.')}`);
}

console.log(`\n✨ Fixed ${totalFixed} array destructuring warnings`);
console.log('\n🔍 Final verification...\n');

try {
    execSync('npm run lint', { stdio: 'inherit' });
    console.log('\n🎉 ALL WARNINGS FIXED!');
} catch (error) {
    const output = error.stdout || error.stderr || '';
    const count = output.split('\n').filter(l => l.includes('warning')).length;
    console.log(`\n${count > 0 ? '⚠️' : '✅'}  ${count} warnings remain.`);
}
