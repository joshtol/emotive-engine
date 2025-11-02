#!/usr/bin/env node
/**
 * Automated Shader Calibration Screenshot Capture
 *
 * Generates systematic calibration screenshots for shader analysis.
 * Opens the shader test suite, applies test configurations from the
 * calibration guide, and captures screenshots for validation.
 */

import { chromium } from 'playwright';
import { mkdir, writeFile, appendFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Output directory
const OUTPUT_DIR = join(__dirname, '../examples/calibration-screenshots');
const LOG_FILE = join(OUTPUT_DIR, 'calibration.log');

// Logger that writes to both console and file
async function log(message) {
    console.log(message);
    await appendFile(LOG_FILE, message + '\n').catch(() => {});
}

async function logError(message) {
    console.error(message);
    await appendFile(LOG_FILE, 'ERROR: ' + message + '\n').catch(() => {});
}

// Test suite URL (adjust port if needed)
const TEST_SUITE_URL = 'http://localhost:5500/examples/3d-shader-test-suite.html';

// Calibration test configurations
const CALIBRATION_TESTS = [
    // PBR Material Validation
    {
        name: '01-pbr-roughness-mirror',
        category: 'PBR',
        model: 'utah-teapot',
        camera: 'front',
        material: { roughness: 0, metallic: 30, ao: 100, sss: 0, anisotropy: 0, iridescence: 0 },
        renderMode: 'standard',
        description: 'Roughness 0% - Perfect mirror'
    },
    {
        name: '02-pbr-roughness-glossy',
        category: 'PBR',
        model: 'utah-teapot',
        camera: 'front',
        material: { roughness: 25, metallic: 30, ao: 100, sss: 0, anisotropy: 0, iridescence: 0 },
        renderMode: 'standard',
        description: 'Roughness 25% - Glossy'
    },
    {
        name: '03-pbr-roughness-balanced',
        category: 'PBR',
        model: 'utah-teapot',
        camera: 'front',
        material: { roughness: 50, metallic: 30, ao: 100, sss: 0, anisotropy: 0, iridescence: 0 },
        renderMode: 'standard',
        description: 'Roughness 50% - Balanced'
    },
    {
        name: '04-pbr-roughness-matte',
        category: 'PBR',
        model: 'utah-teapot',
        camera: 'front',
        material: { roughness: 100, metallic: 30, ao: 100, sss: 0, anisotropy: 0, iridescence: 0 },
        renderMode: 'standard',
        description: 'Roughness 100% - Pure matte'
    },
    {
        name: '05-pbr-metallic-dielectric',
        category: 'PBR',
        model: 'suzanne',
        camera: 'rim',
        material: { roughness: 20, metallic: 0, ao: 100, sss: 0, anisotropy: 0, iridescence: 0 },
        renderMode: 'standard',
        description: 'Metallic 0% - Dielectric (Fresnel edges)'
    },
    {
        name: '06-pbr-metallic-metal',
        category: 'PBR',
        model: 'suzanne',
        camera: 'rim',
        material: { roughness: 20, metallic: 100, ao: 100, sss: 0, anisotropy: 0, iridescence: 0 },
        renderMode: 'standard',
        description: 'Metallic 100% - Metal (colored reflections)'
    },

    // Ambient Occlusion
    {
        name: '07-ao-none',
        category: 'AO',
        model: 'torus-knot',
        camera: 'grazing',
        material: { roughness: 90, metallic: 0, ao: 100, sss: 0, anisotropy: 0, iridescence: 0 },
        renderMode: 'standard',
        description: 'AO 100% - No darkening'
    },
    {
        name: '08-ao-moderate',
        category: 'AO',
        model: 'torus-knot',
        camera: 'grazing',
        material: { roughness: 90, metallic: 0, ao: 50, sss: 0, anisotropy: 0, iridescence: 0 },
        renderMode: 'standard',
        description: 'AO 50% - Moderate crevice darkening'
    },
    {
        name: '09-ao-maximum',
        category: 'AO',
        model: 'torus-knot',
        camera: 'grazing',
        material: { roughness: 90, metallic: 0, ao: 0, sss: 0, anisotropy: 0, iridescence: 0 },
        renderMode: 'standard',
        description: 'AO 0% - Maximum shadow'
    },
    {
        name: '10-ao-organic',
        category: 'AO',
        model: 'stanford-bunny',
        camera: 'closeup',
        material: { roughness: 90, metallic: 0, ao: 0, sss: 0, anisotropy: 0, iridescence: 0 },
        renderMode: 'standard',
        description: 'AO on organic geometry (bunny ears)'
    },

    // Subsurface Scattering
    {
        name: '11-sss-none',
        category: 'SSS',
        model: 'stanford-bunny',
        camera: 'closeup',
        material: { roughness: 45, metallic: 0, ao: 85, sss: 0, anisotropy: 0, iridescence: 0 },
        renderMode: 'standard',
        description: 'SSS 0% - Opaque'
    },
    {
        name: '12-sss-moderate',
        category: 'SSS',
        model: 'stanford-bunny',
        camera: 'closeup',
        material: { roughness: 45, metallic: 0, ao: 85, sss: 50, anisotropy: 0, iridescence: 0 },
        renderMode: 'standard',
        description: 'SSS 50% - Light penetration'
    },
    {
        name: '13-sss-maximum',
        category: 'SSS',
        model: 'stanford-bunny',
        camera: 'closeup',
        material: { roughness: 45, metallic: 0, ao: 85, sss: 100, anisotropy: 0, iridescence: 0 },
        renderMode: 'standard',
        description: 'SSS 100% - Strong translucency'
    },

    // Anisotropic Reflection
    {
        name: '14-anisotropy-isotropic',
        category: 'Anisotropy',
        model: 'utah-teapot',
        camera: 'rim',
        material: { roughness: 20, metallic: 100, ao: 100, sss: 0, anisotropy: 0, iridescence: 0 },
        renderMode: 'standard',
        description: 'Anisotropy 0% - Round highlights'
    },
    {
        name: '15-anisotropy-brushed',
        category: 'Anisotropy',
        model: 'utah-teapot',
        camera: 'rim',
        material: { roughness: 20, metallic: 100, ao: 100, sss: 0, anisotropy: 70, iridescence: 0 },
        renderMode: 'standard',
        description: 'Anisotropy 70% - Brushed metal'
    },
    {
        name: '16-anisotropy-knot',
        category: 'Anisotropy',
        model: 'torus-knot',
        camera: 'grazing',
        material: { roughness: 20, metallic: 100, ao: 100, sss: 0, anisotropy: 70, iridescence: 0 },
        renderMode: 'standard',
        description: 'Anisotropy on complex geometry'
    },

    // Iridescence
    {
        name: '17-iridescence-none',
        category: 'Iridescence',
        model: 'torus-knot',
        camera: 'grazing',
        material: { roughness: 0, metallic: 0, ao: 100, sss: 0, anisotropy: 0, iridescence: 0 },
        renderMode: 'standard',
        description: 'Iridescence 0% - No color shift'
    },
    {
        name: '18-iridescence-moderate',
        category: 'Iridescence',
        model: 'torus-knot',
        camera: 'grazing',
        material: { roughness: 0, metallic: 0, ao: 100, sss: 0, anisotropy: 0, iridescence: 50 },
        renderMode: 'standard',
        description: 'Iridescence 50% - Subtle rainbow'
    },
    {
        name: '19-iridescence-soap',
        category: 'Iridescence',
        model: 'torus-knot',
        camera: 'grazing',
        material: { roughness: 0, metallic: 0, ao: 100, sss: 0, anisotropy: 0, iridescence: 90 },
        renderMode: 'standard',
        description: 'Iridescence 90% - Soap bubble'
    },
    {
        name: '20-iridescence-pearl',
        category: 'Iridescence',
        model: 'utah-teapot',
        camera: 'rim',
        material: { roughness: 15, metallic: 10, ao: 100, sss: 20, anisotropy: 0, iridescence: 50 },
        renderMode: 'standard',
        description: 'Pearl luster (SSS + iridescence)'
    },

    // Render Modes
    {
        name: '21-normals-dragon',
        category: 'RenderModes',
        model: 'stanford-dragon',
        camera: 'front',
        material: { roughness: 50, metallic: 0, ao: 100, sss: 0, anisotropy: 0, iridescence: 0 },
        renderMode: 'normals',
        description: 'Normal visualization (RGB normals)'
    },
    {
        name: '22-edges-suzanne',
        category: 'RenderModes',
        model: 'suzanne',
        camera: 'front',
        material: { roughness: 50, metallic: 0, ao: 100, sss: 0, anisotropy: 0, iridescence: 0 },
        renderMode: 'edge',
        description: 'Edge detection'
    },
    {
        name: '23-toon-cow',
        category: 'RenderModes',
        model: 'spot-cow',
        camera: 'front',
        material: { roughness: 50, metallic: 0, ao: 100, sss: 0, anisotropy: 0, iridescence: 0 },
        renderMode: 'toon',
        description: 'Toon/cel shading'
    },

    // Combined Effects
    {
        name: '24-combined-skin',
        category: 'Combined',
        model: 'stanford-bunny',
        camera: 'closeup',
        material: { roughness: 45, metallic: 0, ao: 85, sss: 60, anisotropy: 0, iridescence: 0 },
        renderMode: 'standard',
        description: 'Skin preset (AO + SSS)'
    },
    {
        name: '25-combined-brushed-metal',
        category: 'Combined',
        model: 'utah-teapot',
        camera: 'rim',
        material: { roughness: 20, metallic: 100, ao: 100, sss: 0, anisotropy: 70, iridescence: 0 },
        renderMode: 'standard',
        description: 'Brushed metal (metallic + anisotropy)'
    },
    {
        name: '26-combined-pearl',
        category: 'Combined',
        model: 'utah-teapot',
        camera: 'rim',
        material: { roughness: 15, metallic: 10, ao: 100, sss: 20, anisotropy: 0, iridescence: 50 },
        renderMode: 'standard',
        description: 'Pearl (SSS + iridescence)'
    },

    // Performance Test
    {
        name: '27-performance-dragon',
        category: 'Performance',
        model: 'stanford-dragon',
        camera: 'front',
        material: { roughness: 20, metallic: 50, ao: 80, sss: 30, anisotropy: 30, iridescence: 20 },
        renderMode: 'standard',
        description: 'All effects on high-poly model'
    }
];

/**
 * Build URL with test configuration parameters
 */
function buildTestURL(baseURL, config) {
    const url = new URL(baseURL);

    if (config.model) {
        url.searchParams.set('model', config.model);
    }

    if (config.camera) {
        url.searchParams.set('camera', config.camera);
    }

    if (config.material) {
        url.searchParams.set('roughness', config.material.roughness);
        url.searchParams.set('metallic', config.material.metallic);
        url.searchParams.set('ao', config.material.ao);
        url.searchParams.set('sss', config.material.sss);
        url.searchParams.set('anisotropy', config.material.anisotropy);
        url.searchParams.set('iridescence', config.material.iridescence);
    }

    if (config.renderMode) {
        url.searchParams.set('renderMode', config.renderMode);
    }

    return url.toString();
}

/**
 * Apply test configuration by loading URL with parameters
 */
async function applyTestConfig(page, config) {
    await log(`  Applying config: ${config.description}`);

    // Build URL with all test parameters
    const testURL = buildTestURL(TEST_SUITE_URL, config);
    await log(`    Loading: ${testURL}`);

    // Navigate to URL with parameters - page will configure itself on load
    await page.goto(testURL, { waitUntil: 'networkidle' });

    // Wait for initialization and model loading
    await page.waitForTimeout(3000);

    // Log the result
    const geometryInfo = await page.evaluate(() => {
        if (!window.mascot || !window.mascot.core3D) {
            return { error: 'Mascot not initialized' };
        }
        return {
            geometryType: window.mascot.core3D.geometryType,
            hasVertices: !!window.mascot.core3D.geometry?.vertices
        };
    });

    await log(`    Geometry type: ${geometryInfo.geometryType || geometryInfo.error}`);

    // Let rendering stabilize
    await page.waitForTimeout(500);
}

/**
 * Capture screenshot of canvas area
 */
async function captureScreenshot(page, outputPath) {
    const canvas = await page.locator('canvas').first();
    await canvas.screenshot({ path: outputPath });
}

/**
 * Main execution
 */
async function main() {
    // Create output directory
    await mkdir(OUTPUT_DIR, { recursive: true });

    // Clear/create log file
    await writeFile(LOG_FILE, '=== Shader Calibration Run ===\n');
    await log('🎨 Automated Shader Calibration Screenshot Capture\n');
    await log(`📁 Output directory: ${OUTPUT_DIR}`);
    await log(`📝 Log file: ${LOG_FILE}\n`);

    // Launch browser
    console.log('🌐 Launching browser...');
    const browser = await chromium.launch({
        headless: false,  // CHANGED: Run with visible browser for debugging
        slowMo: 100       // Slow down by 100ms per action to see what's happening
    });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();

    // Listen to ALL browser console messages for debugging
    page.on('console', msg => {
        const type = msg.type();
        const text = msg.text();
        const prefix = `  [Browser ${type}]`;

        if (type === 'error') {
            console.error(`${prefix} ${text}`);
        } else if (type === 'warning') {
            console.warn(`${prefix} ${text}`);
        } else {
            console.log(`${prefix} ${text}`);
        }
    });

    // Catch page errors
    page.on('pageerror', error => {
        console.error(`  [Page Error] ${error.message}`);
    });

    await log('🌐 Browser launched\n');

    // Generate manifest
    const manifest = {
        timestamp: new Date().toISOString(),
        totalTests: CALIBRATION_TESTS.length,
        categories: {},
        tests: []
    };

    // Run each calibration test
    console.log(`\n🔬 Running ${CALIBRATION_TESTS.length} calibration tests...\n`);

    for (let i = 0; i < CALIBRATION_TESTS.length; i++) {
        const test = CALIBRATION_TESTS[i];
        const testNum = i + 1;

        console.log(`[${testNum}/${CALIBRATION_TESTS.length}] ${test.name}`);
        console.log(`  Category: ${test.category}`);
        console.log(`  Model: ${test.model || 'default'}`);

        // Apply configuration
        await applyTestConfig(page, test);

        // Capture screenshot
        const screenshotPath = join(OUTPUT_DIR, `${test.name}.png`);
        await captureScreenshot(page, screenshotPath);
        console.log(`  ✅ Saved: ${test.name}.png\n`);

        // Update manifest
        if (!manifest.categories[test.category]) {
            manifest.categories[test.category] = [];
        }
        manifest.categories[test.category].push(test.name);

        manifest.tests.push({
            id: test.name,
            category: test.category,
            description: test.description,
            model: test.model,
            camera: test.camera,
            material: test.material,
            renderMode: test.renderMode,
            filename: `${test.name}.png`
        });
    }

    // Save manifest
    const manifestPath = join(OUTPUT_DIR, 'manifest.json');
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`📋 Saved manifest: manifest.json\n`);

    // Create index HTML for easy viewing
    const indexHtml = generateIndexHtml(manifest);
    const indexPath = join(OUTPUT_DIR, 'index.html');
    await writeFile(indexPath, indexHtml);
    console.log(`📄 Saved index: index.html\n`);

    // Cleanup
    await browser.close();

    console.log('✅ Calibration screenshot capture complete!');
    console.log(`\n📊 Summary:`);
    console.log(`   Total screenshots: ${CALIBRATION_TESTS.length}`);
    console.log(`   Categories: ${Object.keys(manifest.categories).join(', ')}`);
    console.log(`   Output: ${OUTPUT_DIR}`);
    console.log(`\n💡 Open ${indexPath} in your browser to view all screenshots`);
}

/**
 * Generate index HTML for viewing screenshots
 */
function generateIndexHtml(manifest) {
    const categorySections = Object.entries(manifest.categories)
        .map(([category, testNames]) => {
            const tests = manifest.tests.filter(t => testNames.includes(t.id));
            const testCards = tests.map(test => `
                <div class="test-card">
                    <img src="${test.filename}" alt="${test.description}">
                    <div class="test-info">
                        <h3>${test.id}</h3>
                        <p>${test.description}</p>
                        <div class="test-details">
                            <span>Model: ${test.model || 'default'}</span>
                            <span>Camera: ${test.camera || 'default'}</span>
                        </div>
                    </div>
                </div>
            `).join('');

            return `
                <section class="category">
                    <h2>${category}</h2>
                    <div class="test-grid">
                        ${testCards}
                    </div>
                </section>
            `;
        }).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shader Calibration Screenshots - ${manifest.timestamp}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #1a1a1a;
            color: #f2f1f1;
            padding: 40px 20px;
        }
        header {
            max-width: 1400px;
            margin: 0 auto 40px;
            text-align: center;
        }
        header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            background: linear-gradient(135deg, #DD4A9A, #84CFC5);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        header p {
            color: #b8b8b8;
            font-size: 0.9rem;
        }
        .category {
            max-width: 1400px;
            margin: 0 auto 60px;
        }
        .category h2 {
            font-size: 1.8rem;
            margin-bottom: 20px;
            color: #DD4A9A;
            border-bottom: 2px solid rgba(221, 74, 154, 0.3);
            padding-bottom: 10px;
        }
        .test-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
            gap: 30px;
        }
        .test-card {
            background: #2a2a2a;
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid rgba(242, 241, 241, 0.1);
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .test-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 30px rgba(221, 74, 154, 0.2);
        }
        .test-card img {
            width: 100%;
            height: 300px;
            object-fit: contain;
            background: #000;
            border-bottom: 1px solid rgba(242, 241, 241, 0.1);
        }
        .test-info {
            padding: 20px;
        }
        .test-info h3 {
            font-size: 1.1rem;
            margin-bottom: 8px;
            color: #4090CE;
        }
        .test-info p {
            color: #b8b8b8;
            font-size: 0.9rem;
            margin-bottom: 12px;
        }
        .test-details {
            display: flex;
            gap: 15px;
            font-size: 0.75rem;
            color: #888;
        }
        .test-details span {
            padding: 4px 10px;
            background: rgba(221, 74, 154, 0.1);
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <header>
        <h1>🎨 Shader Calibration Screenshots</h1>
        <p>Generated: ${new Date(manifest.timestamp).toLocaleString()}</p>
        <p>Total Tests: ${manifest.totalTests}</p>
    </header>
    ${categorySections}
</body>
</html>`;
}

// Run
main().catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
});
