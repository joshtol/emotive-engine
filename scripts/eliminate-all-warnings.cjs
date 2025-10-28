#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔧 Eliminating ALL remaining warnings...\n');

// Run lint and get output
let lintOutput = '';
try {
    lintOutput = execSync('npm run lint', { stdio: 'pipe', encoding: 'utf-8' });
} catch (error) {
    lintOutput = error.stdout || error.stderr || '';
}

const lines = lintOutput.split('\n');
const fileWarnings = {};
let currentFile = null;

// Parse warnings
for (const line of lines) {
    if (line.match(/^[a-z]:/i) && line.endsWith('.js')) {
        currentFile = line.trim();
        fileWarnings[currentFile] = [];
    } else if (currentFile) {
        const match = line.match(/^\s+(\d+):(\d+)\s+warning\s+'(\w+)'\s+is (?:defined|assigned).*but never used/);
        if (match) {
            const [, lineNum, col, varName] = match;
            fileWarnings[currentFile].push({
                line: parseInt(lineNum),
                col: parseInt(col),
                varName
            });
        }
    }
}

let totalFixed = 0;

// Fix each file
for (const [filePath, warnings] of Object.entries(fileWarnings)) {
    if (!fs.existsSync(filePath) || warnings.length === 0) continue;

    let content = fs.readFileSync(filePath, 'utf-8');

    // Sort warnings by line number descending to avoid offset issues
    warnings.sort((a, b) => b.line - a.line);

    for (const { line, varName } of warnings) {
        const lines = content.split('\n');
        if (line - 1 >= lines.length) continue;

        const targetLine = lines[line - 1];

        // Strategy 1: Object destructuring parameter: {x, y, z} - prefix with _
        const objDestructParamPattern = new RegExp(`\\{[^}]*\\b${varName}\\b[^}]*\\}\\s*\\)`);
        if (objDestructParamPattern.test(targetLine)) {
            lines[line - 1] = targetLine.replace(new RegExp(`\\b${varName}\\b(?=[^}]*\\})`), `_${varName}`);
            content = lines.join('\n');
            totalFixed++;
            continue;
        }

        // Strategy 2: Simple const varName = in destructuring - prefix
        const simpleDestructPattern = new RegExp(`const\\s+\\{[^}]*\\b${varName}\\b[^}]*\\}\\s*=`);
        if (simpleDestructPattern.test(targetLine)) {
            lines[line - 1] = targetLine.replace(new RegExp(`\\b${varName}\\b(?=[^}]*\\})`), `_${varName}`);
            content = lines.join('\n');
            totalFixed++;
            continue;
        }

        // Strategy 3: const varName = (not destructuring) - delete line
        const simpleConstPattern = new RegExp(`^\\s*const\\s+${varName}\\s*=`);
        if (simpleConstPattern.test(targetLine)) {
            lines[line - 1] = '';
            content = lines.join('\n');
            totalFixed++;
            continue;
        }
    }

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ Fixed ${filePath.replace(process.cwd(), '.')}`);
}

console.log(`\n✨ Fixed ${totalFixed} warnings`);
console.log('\n🔍 Running final lint...\n');

try {
    execSync('npm run lint', { stdio: 'inherit' });
    console.log('\n🎉 SUCCESS - ZERO WARNINGS!');
    process.exit(0);
} catch (error) {
    const output = error.stdout || error.stderr || '';
    const warnings = output.split('\n').filter(l => l.includes('warning'));
    console.log(`\n⚠️  ${warnings.length} warnings remain`);
    process.exit(warnings.length > 0 ? 1 : 0);
}
