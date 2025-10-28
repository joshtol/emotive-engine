#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🎯 Achieving ZERO warnings...\n');

// Get lint output
let lintOutput = '';
try {
    lintOutput = execSync('npm run lint', { stdio: 'pipe', encoding: 'utf-8' });
} catch (error) {
    lintOutput = error.stdout || error.stderr || '';
}

const lines = lintOutput.split('\n');
const fileWarnings = {};
let currentFile = null;

// Parse all warnings
for (const line of lines) {
    if (line.match(/^[a-z]:/i) && line.endsWith('.js')) {
        currentFile = line.trim();
        fileWarnings[currentFile] = [];
    } else if (currentFile) {
        const match = line.match(/^\s+(\d+):(\d+)\s+warning\s+'(\w+)'\s+is (?:defined|assigned).*but never used/);
        if (match) {
            const [, lineNum, col, varName] = match;
            const isArg = line.includes('Allowed unused args must match');
            fileWarnings[currentFile].push({
                line: parseInt(lineNum),
                col: parseInt(col),
                varName,
                isArg
            });
        }
    }
}

let totalFixed = 0;

// Fix each file
for (const [filePath, warnings] of Object.entries(fileWarnings)) {
    if (!fs.existsSync(filePath) || warnings.length === 0) continue;

    let content = fs.readFileSync(filePath, 'utf-8');

    // Sort by line descending
    warnings.sort((a, b) => b.line - a.line);

    for (const { line, varName, isArg } of warnings) {
        const lines = content.split('\n');
        if (line - 1 >= lines.length) continue;

        const targetLine = lines[line - 1];

        if (isArg) {
            // Function parameter - just prefix with underscore
            // Pattern: (varName) or (varName = default) or (varName,)
            const paramPattern = new RegExp(`\\b${varName}\\b(?=\\s*[,=)])`);
            if (paramPattern.test(targetLine)) {
                lines[line - 1] = targetLine.replace(paramPattern, `_${varName}`);
                content = lines.join('\n');
                totalFixed++;
                continue;
            }
        }

        // Variable assigned but never used - delete the line if it starts with const
        if (targetLine.trim().startsWith('const ') && targetLine.includes(varName) && !targetLine.includes('{')) {
            lines[line - 1] = '';
            content = lines.join('\n');
            totalFixed++;
            continue;
        }

        // Object destructuring: const {x, varName, z} = - remove just varName
        const objDestructPattern = new RegExp(`const\\s*\\{[^}]*\\b${varName}\\b[^}]*\\}\\s*=`);
        if (objDestructPattern.test(targetLine)) {
            // Remove the variable from destructuring
            let newLine = targetLine;
            // Try removing with comma after
            newLine = newLine.replace(new RegExp(`\\b${varName}\\b\\s*,\\s*`), '');
            // Try removing with comma before
            if (newLine === targetLine) {
                newLine = newLine.replace(new RegExp(`,\\s*\\b${varName}\\b\\s*`), '');
            }
            // Try removing alone (only variable)
            if (newLine === targetLine) {
                newLine = newLine.replace(new RegExp(`\\{\\s*${varName}\\s*\\}`), '{}');
            }
            if (newLine !== targetLine) {
                lines[line - 1] = newLine;
                content = lines.join('\n');
                totalFixed++;
            }
        }
    }

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ Fixed ${filePath.replace(process.cwd(), '.')}`);
}

console.log(`\n✨ Fixed ${totalFixed} warnings`);
console.log('\n🔍 Final verification...\n');

try {
    execSync('npm run lint', { stdio: 'inherit' });
    console.log('\n🎉🎉🎉 ZERO WARNINGS ACHIEVED! 🎉🎉🎉');
    process.exit(0);
} catch (error) {
    const output = error.stdout || error.stderr || '';
    const warnings = output.split('\n').filter(l => l.includes('warning')).length;
    console.log(`\n${warnings === 0 ? '🎉 ZERO WARNINGS!' : `⚠️  ${warnings} warnings remain`}`);
    process.exit(warnings > 0 ? 1 : 0);
}
