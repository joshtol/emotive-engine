#!/usr/bin/env node
/**
 * GLB Model Optimization Script
 *
 * Uses @gltf-transform/cli to optimize GLB models:
 * - Strips all textures (we apply our own materials)
 * - Simplifies geometry
 * - Welds duplicate vertices
 * - Removes unused data
 *
 * NO Draco compression (requires runtime decoder dependency)
 *
 * Usage: node scripts/compress-glb-models.js [folder]
 * Default folder: assets/models/Elements/Nature
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { readdir, stat, mkdir, copyFile } from 'fs/promises';
import { join } from 'path';

const execAsync = promisify(exec);

const SOURCE_FOLDER = process.argv[2] || 'assets/models/Elements/Nature';
// Preserve folder structure: assets/models/X -> site/public/assets/models/X
const OUTPUT_FOLDER = SOURCE_FOLDER.replace('assets/', 'site/public/assets/');

async function getFileSizeKB(filePath) {
    const stats = await stat(filePath);
    return (stats.size / 1024).toFixed(1);
}

async function optimizeGLB(inputPath, outputPath) {
    // Step 1: Optimize with simplify, weld, dedup, prune (NO draco)
    // --simplify: Reduce mesh complexity
    // --weld: Merge duplicate vertices
    // --dedup: Remove duplicate data
    // --prune: Remove unused resources
    const optimizeCmd = `npx gltf-transform optimize "${inputPath}" "${outputPath}" --simplify --weld 0.0001 --prune`;

    try {
        await execAsync(optimizeCmd, { timeout: 120000 });

        // Step 2: Strip all textures (we use our own materials)
        // textureResize to 1x1 effectively removes texture data while keeping material refs valid
        const stripCmd = `npx gltf-transform texture-resize "${outputPath}" "${outputPath}" --width 1 --height 1`;
        try {
            await execAsync(stripCmd, { timeout: 60000 });
        } catch {
            // If no textures, this might fail - that's fine
        }

        // Step 3: Prune again to remove the now-tiny textures
        const pruneCmd = `npx gltf-transform prune "${outputPath}" "${outputPath}"`;
        try {
            await execAsync(pruneCmd, { timeout: 60000 });
        } catch {
            // Prune might fail if nothing to prune
        }

        return true;
    } catch (error) {
        // Fallback: just copy with basic optimization
        try {
            const fallbackCmd = `npx gltf-transform optimize "${inputPath}" "${outputPath}" --weld 0.0001 --prune`;
            await execAsync(fallbackCmd, { timeout: 60000 });
            return true;
        } catch (fallbackError) {
            console.error(`  Error: ${fallbackError.message}`);
            return false;
        }
    }
}

async function main() {
    console.log('='.repeat(60));
    console.log('  GLB Model Optimization (No Draco, No Textures)');
    console.log('='.repeat(60));
    console.log(`\nSource: ${SOURCE_FOLDER}`);
    console.log(`Output: ${OUTPUT_FOLDER}\n`);

    // Ensure output directory exists
    await mkdir(OUTPUT_FOLDER, { recursive: true });

    // Get all GLB files
    const files = await readdir(SOURCE_FOLDER);
    const glbFiles = files.filter(f => f.endsWith('.glb'));

    if (glbFiles.length === 0) {
        console.log('No GLB files found in source folder.');
        return;
    }

    console.log(`Found ${glbFiles.length} GLB files to optimize:\n`);

    let totalOriginal = 0;
    let totalOptimized = 0;

    for (const file of glbFiles) {
        const inputPath = join(SOURCE_FOLDER, file);
        const outputPath = join(OUTPUT_FOLDER, file);

        const originalSize = await getFileSizeKB(inputPath);
        totalOriginal += parseFloat(originalSize);

        process.stdout.write(`  ${file.padEnd(25)} ${originalSize.padStart(8)} KB -> `);

        const success = await optimizeGLB(inputPath, outputPath);

        if (success) {
            const optimizedSize = await getFileSizeKB(outputPath);
            totalOptimized += parseFloat(optimizedSize);
            const ratio = ((1 - optimizedSize / originalSize) * 100).toFixed(0);
            console.log(`${optimizedSize.padStart(8)} KB  (${ratio}% smaller)`);
        } else {
            // Copy original if optimization fails
            await copyFile(inputPath, outputPath);
            totalOptimized += parseFloat(originalSize);
            console.log(`${originalSize.padStart(8)} KB  (copied original)`);
        }
    }

    console.log(`\n${'-'.repeat(60)}`);
    console.log(`  Total: ${totalOriginal.toFixed(1)} KB -> ${totalOptimized.toFixed(1)} KB`);
    console.log(`  Saved: ${(totalOriginal - totalOptimized).toFixed(1)} KB (${((1 - totalOptimized / totalOriginal) * 100).toFixed(0)}%)`);
    console.log('='.repeat(60));
}

main().catch(console.error);
