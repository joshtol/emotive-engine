#!/usr/bin/env node
/**
 * Direct PNG Shader Calibration Renderer
 *
 * Renders shader calibration screenshots directly using the engine
 * without browser automation - just pure rendering to PNG files.
 */

import { createCanvas } from 'canvas';
import { mkdir, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { JSDOM } from 'jsdom';
import gl from 'gl'; // headless-gl for WebGL

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Output directory structure
const BASE_OUTPUT_DIR = join(__dirname, '../examples/calibration-screenshots');

console.log('\n🎨 Direct Shader Calibration Renderer\n');
console.log('📁 Output directory:', BASE_OUTPUT_DIR);

// Create JSDOM environment for engine
const dom = new JSDOM('<!DOCTYPE html><html><body><canvas id="canvas"></canvas></body></html>', {
    pretendToBeVisual: true,
    resources: 'usable'
});

global.window = dom.window;
global.document = dom.window.document;
global.HTMLCanvasElement = dom.window.HTMLCanvasElement;

// Setup canvas with headless WebGL
const canvas = createCanvas(1920, 1080);
const glContext = gl(1920, 1080, { preserveDrawingBuffer: true });

// Monkey-patch canvas.getContext to return our headless GL context
canvas.getContext = function(contextType) {
    if (contextType === 'webgl2' || contextType === 'webgl') {
        return glContext;
    }
    return null;
};

console.log('✅ Headless WebGL context created');
console.log('📏 Canvas size: 1920x1080');

// Import engine (this will need to be built for Node)
import('../dist/emotive-mascot-3d.js').then(async (EmotiveModule) => {
    const EmotiveMascot3D = EmotiveModule.default;

    console.log('✅ Engine loaded');

    // Initialize mascot
    const mascot = new EmotiveMascot3D({
        coreGeometry: 'icosphere',
        enableParticles: false,
        coreScale: 0.5
    });

    await mascot.init(canvas);
    mascot.start();

    console.log('✅ Mascot initialized');

    // Test render
    async function renderToFile(config, outputPath) {
        // Load model
        if (config.model) {
            const modelPath = join(__dirname, `../examples/models/${config.model}.obj`);
            await mascot.loadGeometry(modelPath);
        }

        // Set camera
        if (config.camera) {
            // Set camera position based on preset
            // TODO: Implement camera positioning
        }

        // Set material properties
        mascot.setMaterialProperty('roughness', config.roughness / 100);
        mascot.setMaterialProperty('metallic', config.metallic / 100);
        mascot.setMaterialProperty('ao', config.ao / 100);
        mascot.setMaterialProperty('sssStrength', config.sss / 100);
        mascot.setMaterialProperty('anisotropy', config.anisotropy / 100);
        mascot.setMaterialProperty('iridescence', config.iridescence / 100);

        // Render a frame
        mascot.render();

        // Read pixels from WebGL
        const width = 1920;
        const height = 1080;
        const pixels = new Uint8Array(width * height * 4);
        glContext.readPixels(0, 0, width, height, glContext.RGBA, glContext.UNSIGNED_BYTE, pixels);

        // Flip vertically (WebGL has origin at bottom-left)
        const flippedPixels = new Uint8Array(width * height * 4);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const srcIdx = ((height - 1 - y) * width + x) * 4;
                const dstIdx = (y * width + x) * 4;
                flippedPixels[dstIdx] = pixels[srcIdx];
                flippedPixels[dstIdx + 1] = pixels[srcIdx + 1];
                flippedPixels[dstIdx + 2] = pixels[srcIdx + 2];
                flippedPixels[dstIdx + 3] = pixels[srcIdx + 3];
            }
        }

        // Write PNG
        const pngCanvas = createCanvas(width, height);
        const ctx = pngCanvas.getContext('2d');
        const imageData = ctx.createImageData(width, height);
        imageData.data.set(flippedPixels);
        ctx.putImageData(imageData, 0, 0);

        const buffer = pngCanvas.toBuffer('image/png');
        await writeFile(outputPath, buffer);

        console.log(`✅ Saved: ${outputPath}`);
    }

    // Test with one render
    await mkdir(join(BASE_OUTPUT_DIR, 'test'), { recursive: true });
    await renderToFile({
        model: 'utah-teapot',
        camera: 'front',
        roughness: 0,
        metallic: 0,
        ao: 100,
        sss: 0,
        anisotropy: 0,
        iridescence: 0
    }, join(BASE_OUTPUT_DIR, 'test', 'mirror-test.png'));

    console.log('\n✅ Test complete!');
    process.exit(0);

}).catch(error => {
    console.error('❌ Failed to load engine:', error);
    process.exit(1);
});
