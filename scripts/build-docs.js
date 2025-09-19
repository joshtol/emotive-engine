#!/usr/bin/env node

/**
 * Documentation Build Script
 * Generates JSDoc documentation for the Emotive Engine
 *
 * Usage:
 *   npm run build:docs
 *   node scripts/build-docs.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const config = {
    source: {
        include: [
            './site/src',
            './src',
            './site/js/core',
            './site/js/controls',
            './site/js/ui',
            './site/js/utils',
            './README.md'
        ],
        exclude: [
            './site/src/docs',
            './site/src/**/*.test.js',
            './site/src/**/*.spec.js',
            './node_modules/**',
            './test/**'
        ]
    },
    destination: './docs/api',
    template: 'node_modules/docdash',
    readme: './README.md'
};

// JSDoc configuration
const jsdocConfig = {
    tags: {
        allowUnknownTags: true,
        dictionaries: ['jsdoc', 'closure']
    },
    source: {
        include: config.source.include,
        exclude: config.source.exclude,
        includePattern: '.+\\.js(doc|x)?$',
        excludePattern: '(^|\\/|\\\\)_'
    },
    plugins: [
        'plugins/markdown'
    ],
    templates: {
        cleverLinks: false,
        monospaceLinks: false,
        default: {
            outputSourceFiles: true,
            includeDate: false
        }
    },
    opts: {
        destination: config.destination,
        recurse: true,
        readme: config.readme,
        template: config.template,
        encoding: 'utf8'
    },
    markdown: {
        parser: 'gfm',
        hardwrap: true
    }
};

/**
 * Clean the documentation directory
 */
function cleanDocsDirectory() {
    console.log('🧹 Cleaning documentation directory...');

    if (fs.existsSync(config.destination)) {
        fs.rmSync(config.destination, { recursive: true, force: true });
    }

    fs.mkdirSync(config.destination, { recursive: true });
    console.log('✅ Documentation directory cleaned');
}

/**
 * Generate JSDoc configuration file
 */
function generateJSDocConfig() {
    console.log('📝 Generating JSDoc configuration...');

    const configPath = path.join(__dirname, 'jsdoc.json');
    fs.writeFileSync(configPath, JSON.stringify(jsdocConfig, null, 2));

    console.log('✅ JSDoc configuration generated');
    return configPath;
}

/**
 * Build the documentation
 */
function buildDocs(configPath) {
    console.log('🔨 Building documentation...');

    try {
        // Check if jsdoc is installed
        try {
            execSync('npx jsdoc --version', { stdio: 'ignore' });
        } catch {
            console.log('📦 Installing JSDoc...');
            execSync('npm install --save-dev jsdoc docdash', { stdio: 'inherit' });
        }

        // Run JSDoc
        const command = `npx jsdoc -c ${configPath}`;
        console.log(`Running: ${command}`);
        execSync(command, { stdio: 'inherit' });

        console.log('✅ Documentation built successfully');
    } catch (error) {
        console.error('❌ Error building documentation:', error.message);
        process.exit(1);
    }
}

/**
 * Generate markdown API documentation
 */
function generateMarkdownDocs() {
    console.log('📄 Generating markdown documentation...');

    const apiDocs = [];

    // Read all JS files
    function processDirectory(dir, baseDir = '') {
        const files = fs.readdirSync(dir);

        files.forEach(file => {
            const fullPath = path.join(dir, file);
            const relativePath = path.join(baseDir, file);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
                processDirectory(fullPath, relativePath);
            } else if (file.endsWith('.js') && !file.endsWith('.test.js')) {
                const content = fs.readFileSync(fullPath, 'utf8');
                const docs = extractDocs(content, relativePath);
                if (docs) {
                    apiDocs.push(docs);
                }
            }
        });
    }

    // Extract documentation from source
    function extractDocs(content, filePath) {
        const lines = content.split('\n');
        const docs = {
            file: filePath,
            classes: [],
            functions: [],
            exports: []
        };

        let inComment = false;
        let currentComment = [];

        lines.forEach((line, index) => {
            if (line.includes('/**')) {
                inComment = true;
                currentComment = [];
            } else if (line.includes('*/')) {
                inComment = false;
                // Process the comment
                const nextLine = lines[index + 1] || '';

                if (nextLine.includes('class ')) {
                    const className = nextLine.match(/class\s+(\w+)/)?.[1];
                    if (className) {
                        docs.classes.push({
                            name: className,
                            comment: currentComment.join('\n')
                        });
                    }
                } else if (nextLine.includes('function ') || nextLine.includes('=>')) {
                    const funcName = nextLine.match(/(?:function\s+)?(\w+)\s*(?:\(|=)/)?.[1];
                    if (funcName) {
                        docs.functions.push({
                            name: funcName,
                            comment: currentComment.join('\n')
                        });
                    }
                } else if (nextLine.includes('export')) {
                    docs.exports.push({
                        line: nextLine,
                        comment: currentComment.join('\n')
                    });
                }
            } else if (inComment) {
                currentComment.push(line.replace(/^\s*\*\s?/, ''));
            }
        });

        return docs.classes.length || docs.functions.length || docs.exports.length ? docs : null;
    }

    // Process source directories
    config.source.include.forEach(dir => {
        if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
            processDirectory(dir);
        }
    });

    // Generate markdown
    let markdown = '# Emotive Engine API Reference\n\n';
    markdown += 'This document provides a comprehensive API reference for the Emotive Engine.\n\n';
    markdown += '## Table of Contents\n\n';

    // Group by directory
    const byDirectory = {};
    apiDocs.forEach(doc => {
        const dir = path.dirname(doc.file);
        if (!byDirectory[dir]) {
            byDirectory[dir] = [];
        }
        byDirectory[dir].push(doc);
    });

    // Generate TOC
    Object.keys(byDirectory).sort().forEach(dir => {
        markdown += `- [${dir || 'Root'}](#${(dir || 'root').replace(/[\\/\\\\]/g, '-')})\n`;
    });

    markdown += '\n---\n\n';

    // Generate content
    Object.keys(byDirectory).sort().forEach(dir => {
        markdown += `## ${dir || 'Root'}\n\n`;

        byDirectory[dir].forEach(doc => {
            markdown += `### ${doc.file}\n\n`;

            if (doc.classes.length) {
                markdown += '#### Classes\n\n';
                doc.classes.forEach(cls => {
                    markdown += `- **${cls.name}**\n`;
                    if (cls.comment) {
                        markdown += `  ${cls.comment.split('\n')[0]}\n`;
                    }
                });
                markdown += '\n';
            }

            if (doc.functions.length) {
                markdown += '#### Functions\n\n';
                doc.functions.forEach(func => {
                    markdown += `- **${func.name}**\n`;
                    if (func.comment) {
                        markdown += `  ${func.comment.split('\n')[0]}\n`;
                    }
                });
                markdown += '\n';
            }

            if (doc.exports.length) {
                markdown += '#### Exports\n\n';
                doc.exports.forEach(exp => {
                    markdown += `- \`${exp.line.trim()}\`\n`;
                });
                markdown += '\n';
            }
        });
    });

    // Save markdown
    const markdownPath = path.join(config.destination, 'API_REFERENCE.md');
    fs.writeFileSync(markdownPath, markdown);

    console.log('✅ Markdown documentation generated');
}

/**
 * Copy additional documentation files
 */
function copyAdditionalDocs() {
    console.log('📋 Copying additional documentation...');

    const docsToCopy = [
        { src: './docs/GETTING_STARTED.md', dest: 'GETTING_STARTED.md' },
        { src: './docs/GESTURE_GUIDE.md', dest: 'GESTURE_GUIDE.md' },
        { src: './docs/RHYTHM_SYNC.md', dest: 'RHYTHM_SYNC.md' },
        { src: './docs/FIREBASE_INTEGRATION.md', dest: 'FIREBASE_INTEGRATION.md' },
        { src: './site/src/docs/PUBLIC_API.md', dest: 'PUBLIC_API.md' },
        { src: './site/src/docs/EVENTS.md', dest: 'EVENTS.md' },
        { src: './site/docs/MODULE_ARCHITECTURE.md', dest: 'MODULE_ARCHITECTURE.md' }
    ];

    docsToCopy.forEach(({ src, dest }) => {
        if (fs.existsSync(src)) {
            const destPath = path.join(config.destination, dest);
            fs.copyFileSync(src, destPath);
            console.log(`  ✅ Copied ${dest}`);
        }
    });

    console.log('✅ Additional documentation copied');
}

/**
 * Generate index page
 */
function generateIndexPage() {
    console.log('🏠 Generating index page...');

    const indexContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Emotive Engine Documentation</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        h1 { color: #667eea; }
        h2 { color: #555; margin-top: 30px; }
        .card {
            background: #f7f7f7;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .card h3 { margin-top: 0; color: #667eea; }
        a {
            color: #667eea;
            text-decoration: none;
        }
        a:hover { text-decoration: underline; }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        .badge {
            display: inline-block;
            padding: 2px 8px;
            background: #667eea;
            color: white;
            border-radius: 4px;
            font-size: 12px;
            margin-left: 10px;
        }
    </style>
</head>
<body>
    <h1>🎭 Emotive Engine Documentation</h1>
    <p>Welcome to the comprehensive documentation for the Emotive Engine!</p>

    <h2>📚 Getting Started</h2>
    <div class="grid">
        <div class="card">
            <h3>Quick Start</h3>
            <p>Get up and running quickly with our step-by-step guide.</p>
            <a href="GETTING_STARTED.md">Getting Started Guide →</a>
        </div>
        <div class="card">
            <h3>Examples</h3>
            <p>Interactive examples demonstrating engine features.</p>
            <a href="../examples/basic-usage.html">View Examples →</a>
        </div>
    </div>

    <h2>📖 API Documentation</h2>
    <div class="grid">
        <div class="card">
            <h3>Public API Reference</h3>
            <p>Complete reference for all public methods and properties.</p>
            <a href="PUBLIC_API.md">API Reference →</a>
        </div>
        <div class="card">
            <h3>Events Documentation</h3>
            <p>All events emitted by the engine with examples.</p>
            <a href="EVENTS.md">Events Guide →</a>
        </div>
        <div class="card">
            <h3>JSDoc API</h3>
            <p>Auto-generated API documentation from source code.</p>
            <a href="index.html">Browse JSDoc →</a>
        </div>
    </div>

    <h2>🎮 Feature Guides</h2>
    <div class="grid">
        <div class="card">
            <h3>Gesture System</h3>
            <p>Learn about all available gestures and how to create custom ones.</p>
            <a href="GESTURE_GUIDE.md">Gesture Guide →</a>
        </div>
        <div class="card">
            <h3>Rhythm Synchronization</h3>
            <p>Make your mascot dance to the beat with rhythm sync.</p>
            <a href="RHYTHM_SYNC.md">Rhythm Guide →</a>
        </div>
        <div class="card">
            <h3>Firebase Integration</h3>
            <p>Add social features and cloud persistence.</p>
            <a href="FIREBASE_INTEGRATION.md">Firebase Guide →</a>
        </div>
    </div>

    <h2>🏗️ Architecture</h2>
    <div class="card">
        <h3>Module Architecture</h3>
        <p>Understand the engine's modular architecture and design patterns.</p>
        <a href="MODULE_ARCHITECTURE.md">Architecture Documentation →</a>
    </div>

    <h2>🔧 Development</h2>
    <div class="grid">
        <div class="card">
            <h3>Testing</h3>
            <p>Run the comprehensive test suite.</p>
            <a href="../test/index.html">Test Runner →</a>
            <span class="badge">52+ Tests</span>
        </div>
        <div class="card">
            <h3>Contributing</h3>
            <p>Guidelines for contributing to the project.</p>
            <a href="../CONTRIBUTING.md">Contribution Guide →</a>
        </div>
    </div>

    <footer style="margin-top: 60px; padding-top: 20px; border-top: 1px solid #ddd; color: #666;">
        <p>Emotive Engine v2.0.0 | Generated on ${new Date().toLocaleDateString()}</p>
    </footer>
</body>
</html>
    `.trim();

    const indexPath = path.join(config.destination, 'documentation.html');
    fs.writeFileSync(indexPath, indexContent);

    console.log('✅ Index page generated');
}

/**
 * Main build function
 */
function build() {
    console.log('🚀 Starting documentation build...\n');

    const startTime = Date.now();

    try {
        // Clean directory
        cleanDocsDirectory();

        // Generate JSDoc config
        const configPath = generateJSDocConfig();

        // Build JSDoc documentation
        buildDocs(configPath);

        // Generate markdown docs
        generateMarkdownDocs();

        // Copy additional docs
        copyAdditionalDocs();

        // Generate index page
        generateIndexPage();

        // Clean up
        fs.unlinkSync(configPath);

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`\n✨ Documentation build completed in ${elapsed}s`);
        console.log(`📁 Output: ${path.resolve(config.destination)}`);
        console.log(`🌐 Open ${path.resolve(config.destination, 'documentation.html')} to view`);

    } catch (error) {
        console.error('\n❌ Build failed:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    build();
}

module.exports = { build };