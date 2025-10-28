#!/usr/bin/env node

/**
 * Delete unused variables that are assigned but never used
 * These are variables prefixed with _ that ESLint still complains about
 */

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🗑️  Deleting unused variable assignments...\n');

// Get lint output
let lintOutput = '';
try {
    lintOutput = execSync('npm run lint', { stdio: 'pipe', encoding: 'utf-8' });
} catch (error) {
    lintOutput = error.stdout || error.stderr || '';
}

const lines = lintOutput.split('\n');
const deletions = {};

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Match file path lines
    if (line.match(/^[a-z]:/i) && line.endsWith('.js')) {
        const currentFile = line.trim();
        deletions[currentFile] = deletions[currentFile] || [];
        continue;
    }

    // Match: '_variable' is assigned a value but never used
    const match = line.match(/^\s+(\d+):(\d+)\s+warning\s+'(_\w+)'\s+is assigned a value but never used/);
    if (match) {
        const [, lineNum, , varName] = match;
        const currentFile = Object.keys(deletions).pop();
        if (currentFile) {
            deletions[currentFile].push({ line: parseInt(lineNum), varName });
        }
    }
}

console.log(`Found ${Object.keys(deletions).length} files with deletable variables\n`);

let totalDeleted = 0;

for (const [filePath, vars] of Object.entries(deletions)) {
    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  File not found: ${filePath}`);
        continue;
    }

    let content = fs.readFileSync(filePath, 'utf-8');
    const contentLines = content.split('\n');

    // Sort by line number descending
    vars.sort((a, b) => b.line - a.line);

    for (const { line, varName } of vars) {
        const lineIdx = line - 1;
        if (lineIdx < 0 || lineIdx >= contentLines.length) continue;

        const targetLine = contentLines[lineIdx];

        // Pattern 1: const _var = ...; - delete entire line
        const standalonePattern = new RegExp(`^\\s*const\\s+${varName}\\s*=.*?;\\s*$`);
        if (standalonePattern.test(targetLine)) {
            contentLines[lineIdx] = ''; // Delete line
            totalDeleted++;
            continue;
        }

        // Pattern 2: Destructuring const {a, _var} = ... - remove just _var
        const destructPattern = new RegExp(`,\\s*${varName}(?=\\s*[,}])`);
        if (destructPattern.test(targetLine)) {
            contentLines[lineIdx] = targetLine.replace(destructPattern, '');
            totalDeleted++;
            continue;
        }

        // Pattern 3: const _var = in a multi-line context - comment it out
        const declPattern = new RegExp(`const\\s+${varName}\\s*=`);
        if (declPattern.test(targetLine)) {
            const indent = targetLine.match(/^(\s*)/)[1];
            contentLines[lineIdx] = `${indent}// ${targetLine.trim()} // Removed - unused`;
            totalDeleted++;
        }
    }

    content = contentLines.join('\n');
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ Fixed ${filePath.replace(process.cwd(), '.')}`);
}

console.log(`\n✨ Deleted ${totalDeleted} unused variable assignments`);
console.log('\n🔍 Running lint to verify...\n');

// Run lint
try {
    execSync('npm run lint', { stdio: 'inherit' });
    console.log('\n🎉 All warnings fixed!');
} catch (error) {
    const output = error.stdout || error.stderr || '';
    const count = output.split('\n').filter(l => l.includes('warning')).length;
    console.log(`\n⚠️  ${count} warnings remain.`);
}
