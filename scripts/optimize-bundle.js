#!/usr/bin/env node

/**
 * Bundle Optimization Script
 * Analyzes and optimizes the Emotive Engine bundle size
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const srcDir = path.join(rootDir, 'src');

// Track analysis results
const analysis = {
    totalFiles: 0,
    totalLines: 0,
    totalSize: 0,
    duplicates: new Map(),
    unused: new Set(),
    largeFiles: [],
    deadCode: [],
    suggestions: []
};

/**
 * Analyze a JavaScript file
 */
function analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const size = Buffer.byteLength(content, 'utf8');

    analysis.totalFiles++;
    analysis.totalLines += lines.length;
    analysis.totalSize += size;

    // Check for large files (> 10KB)
    if (size > 10240) {
        analysis.largeFiles.push({
            path: path.relative(rootDir, filePath),
            size: Math.round(size / 1024) + 'KB',
            lines: lines.length
        });
    }

    // Check for duplicate code patterns
    const codePatterns = extractPatterns(content);
    for (const pattern of codePatterns) {
        if (!analysis.duplicates.has(pattern)) {
            analysis.duplicates.set(pattern, []);
        }
        analysis.duplicates.get(pattern).push(filePath);
    }

    // Check for unused exports
    const exports = extractExports(content);
    const imports = extractImports(content);

    return { exports, imports, size, lines: lines.length };
}

/**
 * Extract code patterns for duplicate detection
 */
function extractPatterns(content) {
    const patterns = [];

    // Look for repeated function patterns
    const functionMatches = content.match(/function\s+\w+\s*\([^)]*\)\s*{[^}]{50,200}}/g);
    if (functionMatches) {
        patterns.push(...functionMatches.map(normalizePattern));
    }

    // Look for repeated class methods
    const methodMatches = content.match(/\w+\s*\([^)]*\)\s*{[^}]{50,200}}/g);
    if (methodMatches) {
        patterns.push(...methodMatches.map(normalizePattern));
    }

    return patterns;
}

/**
 * Normalize code pattern for comparison
 */
function normalizePattern(pattern) {
    return pattern
        .replace(/\s+/g, ' ')
        .replace(/['"`]/g, '')
        .replace(/\d+/g, 'N')
        .trim();
}

/**
 * Extract exports from a file
 */
function extractExports(content) {
    const exports = new Set();

    // Named exports
    const namedExports = content.match(/export\s+(?:const|let|var|function|class)\s+(\w+)/g);
    if (namedExports) {
        namedExports.forEach(match => {
            const name = match.match(/(\w+)$/)?.[1];
            if (name) exports.add(name);
        });
    }

    // Export statements
    const exportStatements = content.match(/export\s*{\s*([^}]+)\s*}/g);
    if (exportStatements) {
        exportStatements.forEach(match => {
            const names = match.match(/(\w+)(?:\s+as\s+\w+)?/g);
            if (names) {
                names.forEach(name => exports.add(name.split(' ')[0]));
            }
        });
    }

    return exports;
}

/**
 * Extract imports from a file
 */
function extractImports(content) {
    const imports = new Set();

    // Named imports
    const namedImports = content.match(/import\s*{\s*([^}]+)\s*}\s*from/g);
    if (namedImports) {
        namedImports.forEach(match => {
            const names = match.match(/(\w+)(?:\s+as\s+\w+)?/g);
            if (names) {
                names.filter(n => n !== 'import' && n !== 'from')
                    .forEach(name => imports.add(name.split(' ')[0]));
            }
        });
    }

    // Default imports
    const defaultImports = content.match(/import\s+(\w+)\s+from/g);
    if (defaultImports) {
        defaultImports.forEach(match => {
            const name = match.match(/import\s+(\w+)/)?.[1];
            if (name) imports.add(name);
        });
    }

    return imports;
}

/**
 * Analyze all files
 */
function analyzeAllFiles() {
    const files = getAllJSFiles(srcDir);
    const fileData = new Map();
    const allExports = new Set();
    const allImports = new Set();

    // First pass: analyze all files
    for (const file of files) {
        const data = analyzeFile(file);
        fileData.set(file, data);
        data.exports.forEach(e => allExports.add(e));
        data.imports.forEach(i => allImports.add(i));
    }

    // Find unused exports
    for (const exp of allExports) {
        if (!allImports.has(exp) && !['default', 'EmotiveMascot'].includes(exp)) {
            analysis.unused.add(exp);
        }
    }

    // Find duplicate code
    for (const [pattern, fileList] of analysis.duplicates.entries()) {
        if (fileList.length > 1) {
            analysis.deadCode.push({
                pattern: pattern.substring(0, 50) + '...',
                files: fileList.map(f => path.relative(rootDir, f)),
                count: fileList.length
            });
        }
    }

    // Clear single-file patterns
    for (const [pattern, fileList2] of analysis.duplicates.entries()) {
        if (fileList2.length <= 1) {
            analysis.duplicates.delete(pattern);
        }
    }
}

/**
 * Get all JS files recursively
 */
function getAllJSFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir);

    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            files.push(...getAllJSFiles(fullPath));
        } else if (item.endsWith('.js')) {
            files.push(fullPath);
        }
    }

    return files;
}

/**
 * Generate optimization suggestions
 */
function generateSuggestions() {
    // Large files
    if (analysis.largeFiles.length > 0) {
        analysis.suggestions.push({
            type: 'LARGE_FILES',
            severity: 'high',
            message: `Found ${analysis.largeFiles.length} files over 10KB`,
            files: analysis.largeFiles.slice(0, 5),
            recommendation: 'Consider splitting these into smaller modules'
        });
    }

    // Duplicate code
    if (analysis.duplicates.size > 0) {
        analysis.suggestions.push({
            type: 'DUPLICATE_CODE',
            severity: 'medium',
            message: `Found ${analysis.duplicates.size} duplicate code patterns`,
            count: analysis.duplicates.size,
            recommendation: 'Extract common code into shared utilities'
        });
    }

    // Unused exports
    if (analysis.unused.size > 0) {
        analysis.suggestions.push({
            type: 'UNUSED_EXPORTS',
            severity: 'medium',
            message: `Found ${analysis.unused.size} potentially unused exports`,
            exports: Array.from(analysis.unused).slice(0, 10),
            recommendation: 'Remove unused exports to reduce bundle size'
        });
    }

    // Bundle size
    const totalSizeMB = (analysis.totalSize / 1024 / 1024).toFixed(2);
    if (analysis.totalSize > 2097152) { // 2MB
        analysis.suggestions.push({
            type: 'BUNDLE_SIZE',
            severity: 'critical',
            message: `Total source size is ${totalSizeMB}MB`,
            recommendation: 'Implement code splitting and lazy loading'
        });
    }

    // Specific optimizations
    analysis.suggestions.push({
        type: 'TREE_SHAKING',
        severity: 'low',
        message: 'Enable tree shaking in build config',
        recommendation: 'Ensure sideEffects: false in package.json for better tree shaking'
    });

    analysis.suggestions.push({
        type: 'DYNAMIC_IMPORTS',
        severity: 'medium',
        message: 'Use dynamic imports for optional features',
        recommendation: 'Convert large optional modules to dynamic imports'
    });
}

/**
 * Generate report
 */
function generateReport() {
    const report = {
        timestamp: new Date().toISOString(),
        summary: {
            totalFiles: analysis.totalFiles,
            totalLines: analysis.totalLines,
            totalSize: `${(analysis.totalSize / 1024 / 1024).toFixed(2)}MB`,
            largeFiles: analysis.largeFiles.length,
            duplicatePatterns: analysis.duplicates.size,
            unusedExports: analysis.unused.size
        },
        details: {
            largeFiles: analysis.largeFiles.slice(0, 10),
            duplicates: analysis.deadCode.slice(0, 10),
            unusedExports: Array.from(analysis.unused).slice(0, 20)
        },
        suggestions: analysis.suggestions
    };

    return report;
}

/**
 * Write optimization config
 */
function writeOptimizationConfig() {
    const config = {
        // Files to split
        splitChunks: analysis.largeFiles
            .filter(f => f.size.includes('KB') && parseInt(f.size, 10) > 20)
            .map(f => f.path),

        // Unused exports to remove
        removeExports: Array.from(analysis.unused),

        // Modules to lazy load
        lazyLoad: [
            'src/plugins/**/*.js',
            'src/effects/**/*.js',
            'src/core/effects/**/*.js'
        ],

        // Optimization flags
        optimization: {
            usedExports: true,
            sideEffects: false,
            concatenateModules: true,
            minimize: true,
            removeAvailableModules: true,
            removeEmptyChunks: true
        }
    };

    fs.writeFileSync(
        path.join(rootDir, 'optimization-config.json'),
        JSON.stringify(config, null, 2)
    );
}

// Run analysis
console.log('🔍 Analyzing Emotive Engine bundle...\n');
analyzeAllFiles();
generateSuggestions();
const report = generateReport();

// Print report
console.log('📊 Bundle Analysis Report');
console.log('═'.repeat(50));
console.log(`\n📦 Summary:`);
console.log(`   Files: ${report.summary.totalFiles}`);
console.log(`   Lines: ${report.summary.totalLines}`);
console.log(`   Size: ${report.summary.totalSize}`);
console.log(`   Large Files: ${report.summary.largeFiles}`);
console.log(`   Duplicate Patterns: ${report.summary.duplicatePatterns}`);
console.log(`   Unused Exports: ${report.summary.unusedExports}`);

if (report.details.largeFiles.length > 0) {
    console.log(`\n📁 Largest Files:`);
    report.details.largeFiles.forEach(f => {
        console.log(`   ${f.path} (${f.size}, ${f.lines} lines)`);
    });
}

if (report.suggestions.length > 0) {
    console.log(`\n💡 Optimization Suggestions:`);
    report.suggestions.forEach(s => {
        const icon = s.severity === 'critical' ? '🚨' :
                    s.severity === 'high' ? '⚠️' :
                    s.severity === 'medium' ? '📌' : '💭';
        console.log(`\n   ${icon} ${s.message}`);
        console.log(`      → ${s.recommendation}`);
    });
}

// Save detailed report
fs.writeFileSync(
    path.join(rootDir, 'bundle-analysis.json'),
    JSON.stringify(report, null, 2)
);

// Write optimization config
writeOptimizationConfig();

console.log('\n✅ Analysis complete!');
console.log('   - Report saved to: bundle-analysis.json');
console.log('   - Config saved to: optimization-config.json');

// Calculate potential savings
const potentialSavings = (analysis.unused.size * 500 + analysis.duplicates.size * 1000) / 1024;
console.log(`\n💰 Potential savings: ~${Math.round(potentialSavings)}KB`);

process.exit(0);