/**
 * Convert EXR to HDR (Radiance RGBE) format
 *
 * This script converts OpenEXR files to Radiance HDR format
 * which can be loaded directly by the HDRILoader in the browser.
 *
 * Usage: node scripts/convert-exr-to-hdr.js
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const INPUT_EXR = path.join(__dirname, '../assets/3d/lonely_road_afternoon_puresky_4k.exr');
const OUTPUT_HDR = path.join(__dirname, '../assets/3d/lonely_road_afternoon_puresky_4k.hdr');

async function convertEXRtoHDR() {
    console.log('🔄 Converting EXR to HDR format...\n');
    console.log(`Input:  ${INPUT_EXR}`);
    console.log(`Output: ${OUTPUT_HDR}`);

    // Check if input exists
    if (!fs.existsSync(INPUT_EXR)) {
        console.error(`❌ Error: Input file not found: ${INPUT_EXR}`);
        process.exit(1);
    }

    try {
        // Try ImageMagick first (most common)
        console.log('\n📦 Attempting conversion with ImageMagick...');
        try {
            const { stdout, stderr } = await execAsync(`magick "${INPUT_EXR}" -colorspace RGB "${OUTPUT_HDR}"`);
            console.log('✅ Conversion successful with ImageMagick!');
            if (stdout) console.log(stdout);
            return;
        } catch (magickError) {
            console.log('⚠️  ImageMagick not available, trying alternative...');
        }

        // Try convert command (older ImageMagick)
        console.log('📦 Attempting conversion with convert command...');
        try {
            const { stdout, stderr } = await execAsync(`convert "${INPUT_EXR}" -colorspace RGB "${OUTPUT_HDR}"`);
            console.log('✅ Conversion successful with convert!');
            if (stdout) console.log(stdout);
            return;
        } catch (convertError) {
            console.log('⚠️  convert command not available.');
        }

        // No converters available
        console.error('\n❌ Error: No image conversion tools available.');
        console.error('\n📚 Please install one of the following:\n');
        console.error('1. ImageMagick:');
        console.error('   Windows: https://imagemagick.org/script/download.php#windows');
        console.error('   Mac:     brew install imagemagick');
        console.error('   Linux:   sudo apt install imagemagick\n');
        console.error('2. Or convert manually using an online tool:\n');
        console.error('   - https://convertio.co/exr-hdr/');
        console.error('   - https://anyconv.com/exr-to-hdr-converter/\n');
        process.exit(1);

    } catch (error) {
        console.error('❌ Conversion failed:', error.message);
        process.exit(1);
    }
}

// Check if output already exists
if (fs.existsSync(OUTPUT_HDR)) {
    const stats = fs.statSync(OUTPUT_HDR);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`\n✅ HDR file already exists (${sizeMB} MB)`);
    console.log(`   ${OUTPUT_HDR}`);
    console.log('\n💡 Delete it to force re-conversion, or use it as-is.');
    process.exit(0);
}

convertEXRtoHDR();
