/**
 * GPU Memory Monitor - Diagnostic tool for tracking WebGL resource usage
 *
 * Usage:
 *   import { GPUMemoryMonitor } from './debug/GPUMemoryMonitor.js';
 *   const monitor = new GPUMemoryMonitor(renderer);
 *   monitor.snapshot('before gesture');
 *   // ... run gesture ...
 *   monitor.snapshot('after gesture');
 *   monitor.report();
 */
/* eslint-disable no-console */

export class GPUMemoryMonitor {
    constructor(renderer) {
        this.renderer = renderer;
        this.snapshots = [];
    }

    /**
     * Take a snapshot of current WebGL resource counts
     * @param {string} label - Label for this snapshot
     */
    snapshot(label) {
        const {info} = this.renderer;
        const gl = this.renderer.getContext();

        this.snapshots.push({
            label,
            timestamp: performance.now(),
            memory: {
                geometries: info.memory.geometries,
                textures: info.memory.textures
            },
            render: {
                frame: info.render.frame,
                calls: info.render.calls,
                triangles: info.render.triangles,
                points: info.render.points,
                lines: info.render.lines
            },
            programs: info.programs?.length || 'unknown',
            // WEBGL_debug_renderer_info if available
            renderer: gl.getParameter(gl.RENDERER),
            vendor: gl.getParameter(gl.VENDOR)
        });
    }

    /**
     * Generate a report comparing all snapshots
     */
    report() {
        console.log('═══════════════════════════════════════════════════════');
        console.log('GPU MEMORY MONITOR REPORT');
        console.log('═══════════════════════════════════════════════════════');

        this.snapshots.forEach((snap, i) => {
            console.log(`\n[${i}] ${snap.label} (${snap.timestamp.toFixed(0)}ms)`);
            console.log(`    Geometries: ${snap.memory.geometries}`);
            console.log(`    Textures: ${snap.memory.textures}`);
            console.log(`    Shader Programs: ${snap.programs}`);
            console.log(`    Draw Calls: ${snap.render.calls}`);
            console.log(`    Triangles: ${snap.render.triangles}`);
        });

        // Calculate deltas if we have multiple snapshots
        if (this.snapshots.length >= 2) {
            console.log('\n─────────────────────────────────────────────────────');
            console.log('DELTAS (comparing first to last):');
            const first = this.snapshots[0];
            const last = this.snapshots[this.snapshots.length - 1];

            const geoD = last.memory.geometries - first.memory.geometries;
            const texD = last.memory.textures - first.memory.textures;
            const progD = (typeof last.programs === 'number' && typeof first.programs === 'number')
                ? last.programs - first.programs : '?';

            console.log(`    Δ Geometries: ${geoD >= 0 ? '+' : ''}${geoD}`);
            console.log(`    Δ Textures: ${texD >= 0 ? '+' : ''}${texD}`);
            console.log(`    Δ Programs: ${progD >= 0 ? '+' : ''}${progD}`);

            if (geoD > 0 || texD > 0 || progD > 0) {
                console.log('\n⚠️  POTENTIAL LEAK: Resources increased between first and last snapshot');
            } else {
                console.log('\n✓ No obvious resource accumulation detected');
            }
        }

        console.log('═══════════════════════════════════════════════════════');
    }

    /**
     * Clear all snapshots
     */
    clear() {
        this.snapshots = [];
    }

    /**
     * Get current resource counts as an object
     */
    getCurrent() {
        const {info} = this.renderer;
        return {
            geometries: info.memory.geometries,
            textures: info.memory.textures,
            programs: info.programs?.length || 0
        };
    }
}

export default GPUMemoryMonitor;
