#!/usr/bin/env node
/**
 * Automated Shader Calibration Screenshot Capture
 *
 * Systematic shader testing - one effect at a time with ideal geometry.
 * Organized by shader effect with focused validation.
 */

import { chromium } from 'playwright';
import { mkdir, writeFile, appendFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Output directory structure: calibration-screenshots/<shader-name>/
const BASE_OUTPUT_DIR = join(__dirname, '../examples/calibration-screenshots');
const LOG_FILE = join(BASE_OUTPUT_DIR, 'calibration.log');

// Test suite URL
const TEST_SUITE_URL = 'http://localhost:5500/examples/3d-shader-test-suite.html';

// Logger
async function log(message) {
    console.log(message);
    await appendFile(LOG_FILE, message + '\n').catch(() => {});
}

async function logError(message) {
    console.error(message);
    await appendFile(LOG_FILE, 'ERROR: ' + message + '\n').catch(() => {});
}

// ============================================================================
// SHADER-FOCUSED CALIBRATION TESTS
// Each shader gets its own folder with ideal test cases
// ============================================================================

const SHADER_TESTS = {
    // 1. ROUGHNESS - Test mirror reflection with environment
    roughness: {
        folder: '01-roughness',
        description: 'Roughness/Reflectivity with Environment Map',
        model: 'utah-teapot',
        camera: 'front',
        baseConfig: { metallic: 0, ao: 100, sss: 0, anisotropy: 0, iridescence: 0 },
        tests: [
            { name: 'mirror', roughness: 0, description: '0% - Perfect mirror (should show sky)' },
            { name: 'glossy', roughness: 15, description: '15% - Glossy reflection' },
            { name: 'satin', roughness: 35, description: '35% - Satin finish' },
            { name: 'balanced', roughness: 50, description: '50% - Balanced' },
            { name: 'matte', roughness: 75, description: '75% - Matte' },
            { name: 'pure-matte', roughness: 100, description: '100% - Pure diffuse' }
        ]
    },

    // 2. FRESNEL - Test edge brightening for dielectrics
    fresnel: {
        folder: '02-fresnel',
        description: 'Fresnel Edge Brightening (Dielectrics)',
        model: 'suzanne',
        camera: 'rim',
        baseConfig: { roughness: 15, metallic: 0, ao: 100, sss: 0, anisotropy: 0, iridescence: 0 },
        tests: [
            { name: 'front-angle', camera: 'front', description: 'Front view - minimal Fresnel' },
            { name: 'rim-angle', camera: 'rim', description: 'Rim view - strong Fresnel edges' },
            { name: 'grazing-angle', camera: 'grazing', description: 'Grazing angle - maximum Fresnel' }
        ]
    },

    // 3. METALLIC - Test colored reflections
    metallic: {
        folder: '03-metallic',
        description: 'Metallic with Colored Fresnel',
        model: 'suzanne',
        camera: 'rim',
        baseConfig: { roughness: 20, ao: 100, sss: 0, anisotropy: 0, iridescence: 0 },
        tests: [
            { name: 'dielectric', metallic: 0, description: '0% - Dielectric (white Fresnel)' },
            { name: 'mixed', metallic: 50, description: '50% - Mixed behavior' },
            { name: 'metal', metallic: 100, description: '100% - Metal (colored Fresnel)' }
        ]
    },

    // 4. AMBIENT OCCLUSION - Test crevice darkening
    ao: {
        folder: '04-ambient-occlusion',
        description: 'Ambient Occlusion - Crevice Darkening',
        model: 'torus-knot',
        camera: 'grazing',
        baseConfig: { roughness: 90, metallic: 0, sss: 0, anisotropy: 0, iridescence: 0 },
        tests: [
            { name: 'no-ao', ao: 100, description: '100% - No darkening' },
            { name: 'light-ao', ao: 75, description: '75% - Light shadows' },
            { name: 'medium-ao', ao: 50, description: '50% - Medium shadows' },
            { name: 'heavy-ao', ao: 25, description: '25% - Heavy shadows' },
            { name: 'maximum-ao', ao: 0, description: '0% - Black crevices' },
            { name: 'organic-ao', ao: 0, model: 'stanford-bunny', camera: 'closeup', description: 'Maximum AO on organic (bunny ears)' }
        ]
    },

    // 5. SUBSURFACE SCATTERING - Test light penetration
    sss: {
        folder: '05-subsurface-scattering',
        description: 'SSS - Light Penetration & Color Shifts',
        model: 'stanford-bunny',
        camera: 'closeup',
        baseConfig: { roughness: 45, metallic: 0, ao: 85, anisotropy: 0, iridescence: 0 },
        tests: [
            { name: 'no-sss', sss: 0, description: '0% - Opaque surface' },
            { name: 'light-sss', sss: 30, description: '30% - Light translucency' },
            { name: 'moderate-sss', sss: 60, description: '60% - Moderate penetration (jade-like)' },
            { name: 'strong-sss', sss: 100, description: '100% - Strong glow (ears, thin areas)' },
            { name: 'sss-rim-lighting', sss: 100, camera: 'rim', description: '100% - Rim lighting with SSS' }
        ]
    },

    // 6. ANISOTROPY - Test brushed metal directional highlights
    anisotropy: {
        folder: '06-anisotropy',
        description: 'Anisotropic Reflection - Brushed Metal',
        model: 'spot-cow',
        camera: 'front',
        baseConfig: { roughness: 30, metallic: 100, ao: 100, sss: 0, iridescence: 0 },
        tests: [
            { name: 'isotropic', anisotropy: 0, description: '0 - Isotropic (standard metal)' },
            { name: 'light-aniso', anisotropy: 30, description: '30% - Light brushing' },
            { name: 'moderate-aniso', anisotropy: 60, description: '60% - Moderate brushing' },
            { name: 'strong-aniso', anisotropy: 100, description: '100% - Dramatic brushed metal' },
            { name: 'negative-aniso', anisotropy: -60, description: '-60% - Reverse direction' }
        ]
    },

    // 7. IRIDESCENCE - Test thin-film interference
    iridescence: {
        folder: '07-iridescence',
        description: 'Iridescence - Thin-Film Interference',
        model: 'torus-knot',
        camera: 'front',
        baseConfig: { roughness: 10, metallic: 0, ao: 100, sss: 0, anisotropy: 0 },
        tests: [
            { name: 'no-iridescence', iridescence: 0, description: '0% - Standard surface' },
            { name: 'subtle-iridescence', iridescence: 30, description: '30% - Subtle color shift' },
            { name: 'moderate-iridescence', iridescence: 60, description: '60% - Visible colors' },
            { name: 'strong-iridescence', iridescence: 100, description: '100% - Dramatic rainbow' },
            { name: 'iridescence-angles', iridescence: 100, camera: 'grazing', description: '100% - Grazing angle (strongest)' }
        ]
    },

    // 8. COMBINED EFFECTS - Real-world materials
    combined: {
        folder: '08-combined-materials',
        description: 'Combined Effects - Real Materials',
        model: 'stanford-bunny',
        camera: 'front',
        baseConfig: {},
        tests: [
            {
                name: 'jade',
                roughness: 20, metallic: 0, ao: 50, sss: 80, anisotropy: 0, iridescence: 0,
                description: 'Jade - SSS + AO + smooth'
            },
            {
                name: 'brushed-copper',
                roughness: 40, metallic: 100, ao: 70, sss: 0, anisotropy: 70, iridescence: 0,
                description: 'Brushed Copper - Anisotropy + Metallic'
            },
            {
                name: 'soap-bubble',
                roughness: 5, metallic: 0, ao: 100, sss: 30, anisotropy: 0, iridescence: 100,
                description: 'Soap Bubble - Iridescence + SSS'
            },
            {
                name: 'polished-marble',
                roughness: 15, metallic: 0, ao: 30, sss: 40, anisotropy: 0, iridescence: 0,
                description: 'Polished Marble - SSS + AO + Fresnel'
            }
        ]
    }
};

// ============================================================================
// BUILD TEST URL
// ============================================================================

function buildTestURL(baseURL, config) {
    const params = new URLSearchParams({
        model: config.model,
        camera: config.camera,
        roughness: config.roughness ?? 50,
        metallic: config.metallic ?? 0,
        ao: config.ao ?? 100,
        sss: config.sss ?? 0,
        anisotropy: config.anisotropy ?? 0,
        iridescence: config.iridescence ?? 0,
        renderMode: 'standard'
    });
    return `${baseURL}?${params.toString()}`;
}

// ============================================================================
// CAPTURE SCREENSHOT
// ============================================================================

async function captureScreenshot(page, test, outputPath) {
    const config = { ...test.baseConfig, ...test };

    await log(`    Loading: ${buildTestURL(TEST_SUITE_URL, config)}`);

    try {
        await page.goto(buildTestURL(TEST_SUITE_URL, config), {
            waitUntil: 'domcontentloaded', // Changed from networkidle to avoid hanging
            timeout: 30000
        });
    } catch (error) {
        // If navigation interrupted, that's okay - the page might have already started loading
        if (!error.message.includes('interrupted')) {
            throw error;
        }
    }

    // Wait for initialization and rendering
    const isLargeModel = config.model === 'stanford-dragon';
    const baseWait = isLargeModel ? 10000 : 5000; // Increased wait times
    await page.waitForTimeout(baseWait);

    // Verify geometry loaded
    const geometryInfo = await page.evaluate(() => {
        if (window.mascot?.state?.geometry) {
            const geom = window.mascot.state.geometry;
            const vertexCount = geom.vertices ? geom.vertices.length / 3 : 0;
            return {
                type: 'loaded',
                vertices: vertexCount.toLocaleString()
            };
        }
        return { type: 'unknown' };
    });

    if (geometryInfo.type === 'loaded') {
        await log(`    Geometry type: ${geometryInfo.type}`);
        await log(`    Vertices: ${geometryInfo.vertices}`);
    }

    // Extra wait for rendering to stabilize
    await page.waitForTimeout(1000);

    // Capture screenshot
    await page.screenshot({
        path: outputPath,
        type: 'png'
    });

    await log(`  ✅ Saved: ${outputPath.split(/[/\\]/).slice(-2).join('/')}`);
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
    console.log('\n🎨 Shader-Focused Calibration System\n');
    console.log('📁 Base directory:', BASE_OUTPUT_DIR);
    console.log('📝 Log file:', LOG_FILE);

    // Create base output directory and clear log
    await mkdir(BASE_OUTPUT_DIR, { recursive: true });
    await writeFile(LOG_FILE, `Calibration started at ${new Date().toISOString()}\n\n`);

    // Launch browser
    console.log('\n🌐 Launching browser...');
    const browser = await chromium.launch({
        headless: true,
        args: ['--force-device-scale-factor=2'] // 2x resolution for quality
    });
    const page = await browser.newPage({
        viewport: { width: 1920, height: 1080 }
    });

    // Enable console logging from browser
    page.on('console', msg => log(`  [Browser log] ${msg.text()}`));
    page.on('pageerror', err => logError(`  [Browser error] ${err.message}`));

    await log('🌐 Browser launched\n');

    // Process each shader category
    const shaderCategories = Object.entries(SHADER_TESTS);
    let totalTests = 0;
    for (const [, category] of shaderCategories) {
        totalTests += category.tests.length;
    }

    console.log(`\n🔬 Running ${totalTests} tests across ${shaderCategories.length} shader categories...\n`);

    let testIndex = 0;
    for (const [shaderName, category] of shaderCategories) {
        await log(`\n${'='.repeat(80)}`);
        await log(`${category.description}`);
        await log(`${'='.repeat(80)}`);

        // Create shader-specific output directory
        const outputDir = join(BASE_OUTPUT_DIR, category.folder);
        await mkdir(outputDir, { recursive: true });

        // Run tests for this shader
        for (const test of category.tests) {
            testIndex++;
            console.log(`\n[${testIndex}/${totalTests}] ${category.folder}/${test.name}`);
            await log(`\n[${testIndex}/${totalTests}] ${test.name}`);
            await log(`  ${test.description}`);

            const testConfig = {
                ...category.baseConfig,
                model: test.model || category.model,
                camera: test.camera || category.camera,
                roughness: test.roughness,
                metallic: test.metallic,
                ao: test.ao,
                sss: test.sss,
                anisotropy: test.anisotropy,
                iridescence: test.iridescence
            };

            const outputPath = join(outputDir, `${test.name}.png`);

            try {
                await captureScreenshot(page, testConfig, outputPath);
            } catch (error) {
                await logError(`Failed to capture ${test.name}: ${error.message}`);
                console.error(`  ❌ Failed: ${error.message}`);
            }
        }
    }

    await browser.close();

    console.log('\n✅ Calibration complete!');
    console.log(`📁 Screenshots saved to: ${BASE_OUTPUT_DIR}`);
    console.log(`📝 Log saved to: ${LOG_FILE}\n`);
}

main().catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
});
