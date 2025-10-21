/**
 * Script to split emotion files into base + rhythm modules
 * Automates the refactor of 14 remaining emotions
 */

const fs = require('fs');
const path = require('path');

const emotionsToSplit = [
    'joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust',
    'love', 'suspicion', 'excited', 'resting', 'euphoria',
    'focused', 'glitch', 'calm'
];

const statesDir = path.join(__dirname, '../src/core/emotions/states');
const baseDir = path.join(__dirname, '../src/core/emotions/base');
const rhythmDir = path.join(__dirname, '../src/core/emotions/rhythm');

emotionsToSplit.forEach(emotionName => {
    const sourceFile = path.join(statesDir, `${emotionName}.js`);

    console.log(`\nProcessing: ${emotionName}`);

    if (!fs.existsSync(sourceFile)) {
        console.log(`  ⚠️  Skipping - file not found: ${sourceFile}`);
        return;
    }

    const content = fs.readFileSync(sourceFile, 'utf8');

    // Find the rhythm section
    const rhythmMatch = content.match(/,?\s*\/\/\s*Rhythm.*?\n\s*rhythm:\s*{[\s\S]*?^    }/m);

    if (!rhythmMatch) {
        console.log(`  ⚠️  No rhythm section found`);
        return;
    }

    const rhythmSection = rhythmMatch[0];

    // Create base version (remove rhythm section)
    let baseContent = content.replace(rhythmSection, '');

    // Clean up trailing comma before closing brace if needed
    baseContent = baseContent.replace(/,(\s*)(\n\s*\/\*\*\s*\n\s*\* Get core)/m, '$1$2');

    // Update header for base file
    baseContent = baseContent.replace(
        /(Emotion)(\s*\n)/,
        '$1 (Base)$2'
    );
    baseContent = baseContent.replace(
        /(@fileoverview .+?)(\n)/,
        '$1 (visual/behavioral only)$2'
    );
    baseContent = baseContent.replace(
        /(@module emotions\/states\/)/,
        '@module emotions/base/'
    );

    // Add comment about rhythm
    baseContent = baseContent.replace(
        /(export default {)/,
        `$1\n    // Note: Rhythm sync properties are in rhythm/${emotionName}.js`
    );

    // Extract just the rhythm object
    const rhythmObjectMatch = rhythmSection.match(/rhythm:\s*({[\s\S]*?^    })/m);
    if (!rhythmObjectMatch) {
        console.log(`  ⚠️  Could not extract rhythm object`);
        return;
    }

    const rhythmObject = rhythmObjectMatch[1];

    // Create rhythm file content
    const rhythmContent = `/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - ${emotionName.charAt(0).toUpperCase() + emotionName.slice(1)} Emotion (Rhythm Sync)
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview ${emotionName.charAt(0).toUpperCase() + emotionName.slice(1)} emotional state - rhythm sync configuration
 * @author Emotive Engine Team
 * @module emotions/rhythm/${emotionName}
 */

/**
 * ${emotionName.charAt(0).toUpperCase() + emotionName.slice(1)} emotion rhythm configuration
 * Contains only rhythm sync properties for audio-reactive builds
 * Base properties are in base/${emotionName}.js
 */
export default {
    // Rhythm configuration
    rhythm: ${rhythmObject.replace(/^    rhythm: /, '')}
};
`;

    // Write base file
    const baseFile = path.join(baseDir, `${emotionName}.js`);
    fs.writeFileSync(baseFile, baseContent);
    console.log(`  ✓ Created base/${emotionName}.js`);

    // Write rhythm file
    const rhythmFile = path.join(rhythmDir, `${emotionName}.js`);
    fs.writeFileSync(rhythmFile, rhythmContent);
    console.log(`  ✓ Created rhythm/${emotionName}.js`);
});

console.log('\n✅ Emotion split complete!');
console.log(`\nNext steps:`);
console.log(`1. Update src/core/emotions/index.js to import from base/ or merge with rhythm/`);
console.log(`2. Update lean.js to import from base/`);
console.log(`3. Update audio.js to merge base + rhythm`);
