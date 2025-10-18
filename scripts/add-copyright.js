/**
 * Add copyright notices and basic obfuscation
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COPYRIGHT_NOTICE = `/*!
 * Emotive Engine™ - Proprietary and Confidential
 * Copyright (c) 2025 Emotive Engine. All Rights Reserved.
 *
 * NOTICE: This code is proprietary and confidential. Unauthorized copying,
 * modification, or distribution is strictly prohibited and may result in
 * legal action. This software is licensed, not sold.
 *
 * Website: https://emotiveengine.com
 * License: https://emotive-engine.web.app/LICENSE.md
 */`;

const LEGAL_WARNING = `
// LEGAL WARNING: This code is protected by copyright law and international treaties.
// Unauthorized reproduction or distribution of this code, or any portion of it,
// may result in severe civil and criminal penalties, and will be prosecuted
// to the maximum extent possible under the law.`;

function addCopyrightToFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');

    // Don't add if already has copyright
    if (content.includes('Copyright (c) 2024 Emotive Engine')) {
        return;
    }

    const protectedContent = COPYRIGHT_NOTICE + '\n' + content + '\n' + LEGAL_WARNING;
    fs.writeFileSync(filePath, protectedContent);
    console.log(`✓ Protected: ${path.basename(filePath)}`);
}

function protectDirectory(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            protectDirectory(fullPath);
        } else if (entry.name.endsWith('.js') && !entry.name.includes('.min.')) {
            addCopyrightToFile(fullPath);
        }
    }
}

// Add to all JavaScript files
console.log('Adding copyright protection...\n');
protectDirectory(path.join(__dirname, '../site/js'));
console.log('\n✅ Copyright notices added!');
console.log('📜 This provides legal protection, not technical protection.');
console.log('⚖️  Violators can be pursued legally if they ignore the copyright.');