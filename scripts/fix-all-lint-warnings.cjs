#!/usr/bin/env node

/**
 * Bulk fix all remaining ESLint warnings
 * Focuses on unused parameter warnings that need underscore prefixes
 */

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔧 Fixing all remaining lint warnings...\n');

// Get lint output
let lintOutput = '';
try {
    lintOutput = execSync('npm run lint', { stdio: 'pipe', encoding: 'utf-8' });
} catch (error) {
    lintOutput = error.stdout || error.stderr || '';
}

// Parse warnings - looking for "Allowed unused args must match /^_/u"
const lines = lintOutput.split('\n');
const fixes = {};

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Match file path lines (they don't have leading spaces)
    if (line.match(/^[a-z]:/i) && line.endsWith('.js')) {
        const currentFile = line.trim();
        fixes[currentFile] = fixes[currentFile] || [];
        continue;
    }

    // Match warning lines with unused args
    const match = line.match(/^\s+(\d+):(\d+)\s+warning\s+'(\w+)'\s+is defined but never used.*Allowed unused args must match/);
    if (match) {
        const [, lineNum, , varName] = match;
        const currentFile = Object.keys(fixes).pop();
        if (currentFile && !varName.startsWith('_')) {
            fixes[currentFile].push({ line: parseInt(lineNum), varName });
        }
    }
}

console.log(`Found ${Object.keys(fixes).length} files with fixable warnings\n`);

let totalFixed = 0;

// Fix each file
for (const [filePath, warnings] of Object.entries(fixes)) {
    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  File not found: ${filePath}`);
        continue;
    }

    let content = fs.readFileSync(filePath, 'utf-8');

    // Sort by line number descending to avoid offset issues
    warnings.sort((a, b) => b.line - a.line);

    for (const { line, varName } of warnings) {
        // Create regex to match the parameter name as a whole word
        // This handles: (param), (param,), (param = default), (...param)
        const paramRegex = new RegExp(
            `(\\(|,\\s*)(\\.\\.\\.)?(${varName})(\\s*[,=)])`,
            'g'
        );

        const lines = content.split('\n');
        const targetLine = lines[line - 1];

        if (targetLine && targetLine.includes(varName)) {
            // Replace the parameter name with underscore-prefixed version
            lines[line - 1] = targetLine.replace(paramRegex, `$1$2_${varName}$4`);
            content = lines.join('\n');
            totalFixed++;
        }
    }

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ Fixed ${filePath.replace(process.cwd(), '.')}`);
}

console.log(`\n✨ Fixed ${totalFixed} unused parameter warnings`);
console.log('\n🔍 Running lint again to verify...\n');

// Run lint again
try {
    execSync('npm run lint', { stdio: 'inherit' });
    console.log('\n✅ All linter warnings fixed!');
} catch (error) {
    const remainingCount = (error.stdout || '').split('\n').filter(l => l.includes('warning')).length;
    console.log(`\n⚠️  ${remainingCount} warnings remain. May need manual fixes.`);
}
