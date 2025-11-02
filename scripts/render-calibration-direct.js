#!/usr/bin/env node
/**
 * Direct Shader Calibration Renderer
 *
 * Uses test suite HTML with simple HTTP server (no auto-reload).
 */

import puppeteer from 'puppeteer';
import { mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Output directory
const BASE_OUTPUT_DIR = join(__dirname, '../examples/calibration-screenshots');

// Use working test suite HTML with Live Server (user must start manually)
// Live Server should be started from the project root, serving examples folder
const SERVER_PORT = 5500;
const TEST_SUITE_URL = `http://localhost:${SERVER_PORT}/examples/3d-shader-test-suite.html`;

// ASCII Art Logo
console.log('\n');
console.log('  ███████╗███╗   ███╗ ██████╗ ████████╗██╗██╗   ██╗███████╗');
console.log('  ██╔════╝████╗ ████║██╔═══██╗╚══██╔══╝██║██║   ██║██╔════╝');
console.log('  █████╗  ██╔████╔██║██║   ██║   ██║   ██║██║   ██║█████╗  ');
console.log('  ██╔══╝  ██║╚██╔╝██║██║   ██║   ██║   ██║╚██╗ ██╔╝██╔══╝  ');
console.log('  ███████╗██║ ╚═╝ ██║╚██████╔╝   ██║   ██║ ╚████╔╝ ███████╗');
console.log('  ╚══════╝╚═╝     ╚═╝ ╚═════╝    ╚═╝   ╚═╝  ╚═══╝  ╚══════╝');
console.log('');
console.log('  ╔═══════════════════════════════════════════════════════╗');
console.log('  ║       SHADER CALIBRATION SYSTEM v1.0                  ║');
console.log('  ║       Automated PBR Quality Validation                ║');
console.log('  ╚═══════════════════════════════════════════════════════╝');
console.log('');
console.log('📁 Output Directory:', BASE_OUTPUT_DIR);
console.log('📄 Test Suite URL:', TEST_SUITE_URL);
console.log('');

// Shader test configurations
const SHADER_TESTS = {
    roughness: {
        folder: '01-roughness',
        description: 'Roughness/Reflectivity with Environment Map',
        model: 'utah-teapot',
        camera: 'front',
        base: { metallic: 0, ao: 100, sss: 0, anisotropy: 0, iridescence: 0 },
        tests: [
            { name: 'mirror', roughness: 0, description: '0% - Perfect mirror (should show sky)' },
            { name: 'glossy', roughness: 15, description: '15% - Glossy reflection' },
            { name: 'satin', roughness: 35, description: '35% - Satin finish' },
            { name: 'balanced', roughness: 50, description: '50% - Balanced' },
            { name: 'matte', roughness: 75, description: '75% - Matte' },
            { name: 'pure-matte', roughness: 100, description: '100% - Pure diffuse' }
        ]
    },
    fresnel: {
        folder: '02-fresnel',
        description: 'Fresnel Edge Brightening (Dielectrics)',
        model: 'suzanne',
        base: { roughness: 15, metallic: 0, ao: 100, sss: 0, anisotropy: 0, iridescence: 0 },
        tests: [
            { name: 'front', camera: 'front', description: 'Front view - minimal Fresnel' },
            { name: 'rim', camera: 'rim', description: 'Rim view - strong Fresnel edges' },
            { name: 'grazing', camera: 'grazing', description: 'Grazing angle - maximum Fresnel' }
        ]
    },
    ao: {
        folder: '03-ambient-occlusion',
        description: 'Ambient Occlusion - Crevice Darkening',
        model: 'torus-knot',
        camera: 'grazing',
        base: { roughness: 90, metallic: 0, sss: 0, anisotropy: 0, iridescence: 0 },
        tests: [
            { name: 'none', ao: 100, description: '100% - No darkening' },
            { name: 'light', ao: 75, description: '75% - Light shadows' },
            { name: 'medium', ao: 50, description: '50% - Medium shadows' },
            { name: 'heavy', ao: 25, description: '25% - Heavy shadows' },
            { name: 'maximum', ao: 0, description: '0% - Black crevices' }
        ]
    },
    sss: {
        folder: '04-subsurface-scattering',
        description: 'SSS - Light Penetration & Color Shifts',
        model: 'stanford-bunny',
        camera: 'closeup',
        base: { roughness: 45, metallic: 0, ao: 85, anisotropy: 0, iridescence: 0 },
        tests: [
            { name: 'none', sss: 0, description: '0% - Opaque surface' },
            { name: 'light', sss: 30, description: '30% - Light translucency' },
            { name: 'moderate', sss: 60, description: '60% - Moderate penetration (jade-like)' },
            { name: 'strong', sss: 100, description: '100% - Strong glow (ears, thin areas)' }
        ]
    },

    // 5. METALLIC - Dielectric to Metal Transition
    metallic: {
        folder: '05-metallic',
        description: 'Metallic - Dielectric to Metal Transition',
        model: 'suzanne',
        camera: 'rim',
        base: { roughness: 20, ao: 100, sss: 0, anisotropy: 0, iridescence: 0 },
        tests: [
            { name: 'dielectric', metallic: 0, description: '0% - Pure dielectric (plastic/ceramic)' },
            { name: 'semi-metal-25', metallic: 25, description: '25% - Slightly metallic' },
            { name: 'semi-metal-50', metallic: 50, description: '50% - Half metal transition' },
            { name: 'semi-metal-75', metallic: 75, description: '75% - Mostly metal' },
            { name: 'pure-metal', metallic: 100, description: '100% - Pure metal (colored Fresnel)' },
            { name: 'metal-rough', metallic: 100, roughness: 60, description: '100% metal + 60% roughness (brushed)' },
            { name: 'metal-mirror-front', metallic: 100, roughness: 0, camera: 'front', description: '100% metal + mirror - FRONT (colored env)' },
            { name: 'metal-mirror-rim', metallic: 100, roughness: 0, camera: 'rim', description: '100% metal + mirror - RIM (colored edges)' },
            { name: 'metal-mirror-grazing', metallic: 100, roughness: 0, camera: 'grazing', description: '100% metal + mirror - GRAZING (max color)' }
        ]
    },

    // 6. ANISOTROPY - Brushed Metal Directional Highlights
    anisotropy: {
        folder: '06-anisotropy',
        description: 'Anisotropic Reflection - Brushed Metal',
        model: 'spot-cow',
        camera: 'front',
        base: { roughness: 30, metallic: 100, ao: 100, sss: 0, iridescence: 0 },
        tests: [
            { name: 'isotropic', anisotropy: 0, description: '0 - Isotropic (standard metal)' },
            { name: 'light-horizontal', anisotropy: 30, description: '30% - Light horizontal brushing' },
            { name: 'moderate-horizontal', anisotropy: 60, description: '60% - Moderate horizontal brushing' },
            { name: 'strong-horizontal', anisotropy: 100, description: '100% - Dramatic horizontal brushed metal' },
            { name: 'light-vertical', anisotropy: -30, description: '-30% - Light vertical brushing' },
            { name: 'strong-vertical', anisotropy: -100, description: '-100% - Dramatic vertical brushed metal' },
            { name: 'aniso-front', anisotropy: 100, camera: 'front', description: '100% horizontal - FRONT view' },
            { name: 'aniso-rim', anisotropy: 100, camera: 'rim', description: '100% horizontal - RIM view (edge highlights)' },
            { name: 'aniso-grazing', anisotropy: 100, camera: 'grazing', description: '100% horizontal - GRAZING view (maximum)' },
            { name: 'aniso-topdown', anisotropy: 100, camera: 'topdown', description: '100% horizontal - TOP-DOWN view' }
        ]
    },

    // 7. IRIDESCENCE - Thin-Film Interference Rainbow
    iridescence: {
        folder: '07-iridescence',
        description: 'Iridescence - Thin-Film Interference',
        model: 'torus-knot',
        camera: 'front',
        base: { roughness: 10, metallic: 0, ao: 100, sss: 0, anisotropy: 0 },
        tests: [
            { name: 'none', iridescence: 0, description: '0% - Standard surface' },
            { name: 'subtle', iridescence: 30, description: '30% - Subtle color shift' },
            { name: 'moderate', iridescence: 60, description: '60% - Visible rainbow colors' },
            { name: 'strong', iridescence: 100, description: '100% - Dramatic iridescent rainbow' },
            { name: 'irid-front', iridescence: 100, camera: 'front', description: '100% - FRONT view (baseline)' },
            { name: 'irid-rim', iridescence: 100, camera: 'rim', description: '100% - RIM view (rainbow edges)' },
            { name: 'irid-grazing', iridescence: 100, camera: 'grazing', description: '100% - GRAZING view (maximum rainbow)' },
            { name: 'irid-closeup', iridescence: 100, camera: 'closeup', description: '100% - CLOSEUP view (detail)' },
            { name: 'smooth-irid-mirror', iridescence: 100, roughness: 0, camera: 'rim', description: '100% irid + 0% rough - Mirror rainbow at rim' }
        ]
    },

    // 8. COMBINED MATERIALS - Real-World Scenarios
    combined: {
        folder: '08-combined-materials',
        description: 'Combined Effects - Real Materials',
        model: 'stanford-bunny',
        camera: 'front',
        base: {},
        tests: [
            {
                name: 'jade',
                roughness: 20, metallic: 0, ao: 50, sss: 80, anisotropy: 0, iridescence: 0,
                description: 'Jade - SSS + AO + smooth Fresnel'
            },
            {
                name: 'brushed-copper',
                roughness: 40, metallic: 100, ao: 70, sss: 0, anisotropy: 70, iridescence: 0,
                description: 'Brushed Copper - Anisotropy + Metallic + AO'
            },
            {
                name: 'soap-bubble',
                roughness: 5, metallic: 0, ao: 100, sss: 30, anisotropy: 0, iridescence: 100,
                description: 'Soap Bubble - Iridescence + SSS + mirror'
            },
            {
                name: 'polished-marble',
                roughness: 15, metallic: 0, ao: 30, sss: 40, anisotropy: 0, iridescence: 0,
                description: 'Polished Marble - SSS + AO + Fresnel'
            },
            {
                name: 'opal',
                roughness: 25, metallic: 0, ao: 60, sss: 50, anisotropy: 0, iridescence: 80,
                description: 'Opal - SSS + Iridescence + AO'
            },
            {
                name: 'brushed-titanium',
                roughness: 35, metallic: 100, ao: 50, sss: 0, anisotropy: 85, iridescence: 15,
                model: 'suzanne',
                description: 'Brushed Titanium - Anisotropy + Metal + subtle rainbow'
            }
        ]
    },

    // 9. EDGE CASES - Stress Testing
    edgeCases: {
        folder: '09-edge-cases',
        description: 'Edge Cases - Extreme Values & Interactions',
        model: 'suzanne',
        camera: 'rim',
        base: {},
        tests: [
            {
                name: 'all-zero',
                roughness: 0, metallic: 0, ao: 100, sss: 0, anisotropy: 0, iridescence: 0,
                description: 'All effects disabled (pure mirror dielectric)'
            },
            {
                name: 'all-maximum',
                roughness: 100, metallic: 100, ao: 0, sss: 100, anisotropy: 100, iridescence: 100,
                description: 'All effects maxed (chaos test)'
            },
            {
                name: 'metal-sss-conflict',
                roughness: 30, metallic: 100, ao: 100, sss: 100, anisotropy: 0, iridescence: 0,
                description: 'Metal + SSS (should suppress SSS)'
            },
            {
                name: 'mirror-ao-conflict',
                roughness: 0, metallic: 100, ao: 0, sss: 0, anisotropy: 0, iridescence: 0,
                description: 'Mirror metal + maximum AO'
            },
            {
                name: 'extreme-aniso-irid',
                roughness: 20, metallic: 100, ao: 100, sss: 0, anisotropy: 100, iridescence: 100,
                description: 'Extreme anisotropy + iridescence on metal'
            }
        ]
    },

    // 10. GEOMETRY STRESS TEST - Different Models
    geometryTests: {
        folder: '10-geometry-tests',
        description: 'Geometry Validation - Same Shader, Different Models',
        camera: 'front',
        base: { roughness: 25, metallic: 0, ao: 50, sss: 60, anisotropy: 0, iridescence: 40 },
        tests: [
            { name: 'teapot', model: 'utah-teapot', description: 'Utah Teapot (3K verts, smooth curves)' },
            { name: 'bunny', model: 'stanford-bunny', description: 'Stanford Bunny (35K verts, organic)' },
            { name: 'suzanne', model: 'suzanne', description: 'Suzanne (507 verts, low-poly organic)' },
            { name: 'torus-knot', model: 'torus-knot', description: 'Torus Knot (4K verts, complex topology)' },
            { name: 'cow', model: 'spot-cow', description: 'Spot Cow (2.9K verts, quad mesh)' },
            { name: 'dragon', model: 'stanford-dragon', description: 'Stanford Dragon (437K verts, high-poly stress test)' }
        ]
    }
};

function buildURL(baseURL, config) {
    const params = new URLSearchParams({
        model: config.model,
        camera: config.camera || 'front',
        roughness: config.roughness ?? 50,
        metallic: config.metallic ?? 0,
        ao: config.ao ?? 100,
        sss: config.sss ?? 0,
        anisotropy: config.anisotropy ?? 0,
        iridescence: config.iridescence ?? 0
    });
    return `${baseURL}?${params.toString()}`;
}

async function captureScreenshot(page, config, outputPath) {
    const url = buildURL(TEST_SUITE_URL, config);

    // Navigate to HTTP URL
    await page.goto(url, {
        waitUntil: 'networkidle0',
        timeout: 30000
    });

    // Wait for mascot and rendering
    const isLargeModel = config.model === 'stanford-dragon';
    const waitTime = isLargeModel ? 12000 : 6000;
    await new Promise(resolve => setTimeout(resolve, waitTime));

    // Capture screenshot
    await page.screenshot({
        path: outputPath,
        type: 'png'
    });

    console.log(`  ✅ Captured successfully!`);
}

async function main() {
    const startTime = Date.now();

    // Create output directory
    await mkdir(BASE_OUTPUT_DIR, { recursive: true });

    // Calculate total tests
    const totalTests = Object.values(SHADER_TESTS).reduce((sum, cat) => sum + cat.tests.length, 0);

    console.log('🎯 Test Configuration:');
    console.log(`   Total Categories: ${Object.keys(SHADER_TESTS).length}`);
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   Estimated Time: ~${Math.ceil(totalTests * 6 / 60)} minutes`);
    console.log('');

    // Launch browser
    console.log('🌐 Launching headless browser...');
    console.log('⏳ Please wait while calibration runs...\n');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Enable console logging
    page.on('console', msg => {
        const type = msg.type();
        // Only show errors, not all logs
        if (type === 'error') {
            console.log(`  [Browser] ${msg.type()}: ${msg.text()}`);
        }
    });

    page.on('pageerror', err => {
        console.error(`  ❌ Page Error: ${err.message}`);
    });

    page.on('response', response => {
        if (response.status() === 404) {
            console.error(`  ❌ 404: ${response.url()}`);
        }
    });

    // Process each shader category
    let testIndex = 0;
    let successCount = 0;
    let failCount = 0;

    for (const [shaderName, category] of Object.entries(SHADER_TESTS)) {
        console.log(`\n${'═'.repeat(60)}`);
        console.log(`  ${category.folder.toUpperCase()}`);
        console.log(`  ${category.description || ''}`);
        console.log(`${'═'.repeat(60)}`);

        const outputDir = join(BASE_OUTPUT_DIR, category.folder);
        await mkdir(outputDir, { recursive: true });

        for (const test of category.tests) {
            testIndex++;
            const progress = `[${testIndex}/${totalTests}]`;

            console.log(`\n${progress} ${test.name}`);
            console.log(`  ⏳ Rendering... (${test.description || 'No description'})`);

            const config = {
                ...category.base,
                model: category.model,
                camera: category.camera,
                ...test
            };

            const outputPath = join(outputDir, `${test.name}.png`);

            try {
                await captureScreenshot(page, config, outputPath);
                successCount++;
            } catch (error) {
                console.error(`  ❌ FAILED: ${error.message}`);
                failCount++;
            }
        }
    }

    await browser.close();

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(1);

    // Final Summary
    console.log('\n');
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║               CALIBRATION COMPLETE                        ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('');
    console.log('📊 Results Summary:');
    console.log(`   ✅ Successful: ${successCount}/${totalTests}`);
    console.log(`   ❌ Failed: ${failCount}/${totalTests}`);
    console.log(`   ⏱️  Duration: ${duration}s`);
    console.log(`   📁 Output: ${BASE_OUTPUT_DIR}`);
    console.log('');

    if (successCount === totalTests) {
        console.log('🎉 All tests passed! Shaders are production-ready!');
    } else if (failCount > 0) {
        console.log('⚠️  Some tests failed. Check errors above for details.');
    }

    console.log('');
    console.log('📝 Next Steps:');
    console.log('   1. Review screenshots in calibration-screenshots/ folders');
    console.log('   2. Verify shader quality meets requirements');
    console.log('   3. Run analysis if needed');
    console.log('');
}

main().catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
});
