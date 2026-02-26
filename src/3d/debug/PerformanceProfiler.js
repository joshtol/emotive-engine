/**
 * PerformanceProfiler - Measures time spent in render loop sections
 *
 * Usage:
 *   const profiler = new PerformanceProfiler();
 *   profiler.enable();
 *
 *   // In render loop:
 *   profiler.start('section-name');
 *   // ... code ...
 *   profiler.end('section-name');
 *
 *   // At end of frame:
 *   profiler.endFrame();
 *
 *   // Get report:
 *   console.log(profiler.getReport());
 *
 * GPU Timing:
 *   profiler.setGL(renderer.getContext());
 *   profiler.enableGPUSync(); // Forces GPU sync for accurate timing (slower!)
 */
/* eslint-disable no-console */

export class PerformanceProfiler {
    constructor() {
        this.enabled = false;
        this.sections = new Map();
        this.frameCount = 0;
        this.frameStartTime = 0;
        this.totalFrameTime = 0;
        this._startTimes = new Map();
        this._reportInterval = 60; // Report every N frames
        this._gl = null;
        this._gpuSyncEnabled = false;
        this._frameTimestamps = []; // For calculating actual FPS
        this._maxTimestamps = 120; // Keep last 2 seconds at 60fps
    }

    /**
     * Set WebGL context for GPU timing
     * @param {WebGLRenderingContext|WebGL2RenderingContext} gl
     */
    setGL(gl) {
        this._gl = gl;
    }

    /**
     * Enable GPU synchronization for accurate GPU timing.
     * WARNING: This significantly impacts performance! Use for diagnostics only.
     */
    enableGPUSync() {
        this._gpuSyncEnabled = true;
        console.log('[PerformanceProfiler] GPU sync enabled - this will impact performance!');
    }

    /**
     * Disable GPU synchronization
     */
    disableGPUSync() {
        this._gpuSyncEnabled = false;
        console.log('[PerformanceProfiler] GPU sync disabled');
    }

    enable() {
        this.enabled = true;
        this.reset();
        console.log('[PerformanceProfiler] Enabled - collecting data...');
        console.log(
            '[PerformanceProfiler] TIP: Run profiler.enableGPUSync() for accurate GPU timing (will slow things down)'
        );
    }

    disable() {
        this.enabled = false;
        console.log('[PerformanceProfiler] Disabled');
    }

    reset() {
        this.sections.clear();
        this.frameCount = 0;
        this.totalFrameTime = 0;
        this._frameTimestamps = [];
    }

    startFrame() {
        if (!this.enabled) return;
        this.frameStartTime = performance.now();
    }

    start(name) {
        if (!this.enabled) return;
        this._startTimes.set(name, performance.now());
    }

    end(name) {
        if (!this.enabled) return;

        // If GPU sync is enabled and this is the renderer section, force GPU flush
        if (this._gpuSyncEnabled && this._gl && name === 'threeRenderer') {
            this._gl.finish(); // Force GPU to complete all pending operations
        }

        const startTime = this._startTimes.get(name);
        if (startTime === undefined) return;

        const elapsed = performance.now() - startTime;

        if (!this.sections.has(name)) {
            this.sections.set(name, { total: 0, count: 0, max: 0, min: Infinity });
        }
        const section = this.sections.get(name);
        section.total += elapsed;
        section.count++;
        section.max = Math.max(section.max, elapsed);
        section.min = Math.min(section.min, elapsed);
    }

    endFrame() {
        if (!this.enabled) return;

        const now = performance.now();
        const frameTime = now - this.frameStartTime;
        this.totalFrameTime += frameTime;
        this.frameCount++;

        // Track frame timestamps for real FPS calculation
        this._frameTimestamps.push(now);
        if (this._frameTimestamps.length > this._maxTimestamps) {
            this._frameTimestamps.shift();
        }

        // Auto-report every N frames
        if (this.frameCount % this._reportInterval === 0) {
            console.log(this.getReport());
        }
    }

    /**
     * Calculate actual FPS from frame timestamps
     */
    getActualFPS() {
        if (this._frameTimestamps.length < 2) return 0;
        const oldest = this._frameTimestamps[0];
        const newest = this._frameTimestamps[this._frameTimestamps.length - 1];
        const elapsed = newest - oldest;
        if (elapsed === 0) return 0;
        return ((this._frameTimestamps.length - 1) / elapsed) * 1000;
    }

    getReport() {
        if (this.frameCount === 0) return 'No frames recorded';

        const avgFrameTime = this.totalFrameTime / this.frameCount;
        const theoreticalFPS = 1000 / avgFrameTime;
        const actualFPS = this.getActualFPS();

        let report = `\n=== Performance Report (${this.frameCount} frames) ===\n`;
        report += `Average Frame Time: ${avgFrameTime.toFixed(2)}ms\n`;
        report += `Theoretical Max FPS: ${theoreticalFPS.toFixed(1)} (if no GPU bottleneck)\n`;
        report += `Actual FPS: ${actualFPS.toFixed(1)} (real measured rate)\n`;
        if (this._gpuSyncEnabled) {
            report += 'GPU Sync: ENABLED (accurate GPU timing)\n';
        } else {
            report +=
                'GPU Sync: disabled (CPU time only - run profiler.enableGPUSync() for GPU timing)\n';
        }
        report += '\nSection Breakdown:\n';

        // Sort by total time descending
        const sorted = [...this.sections.entries()].sort((a, b) => b[1].total - a[1].total);

        for (const [name, data] of sorted) {
            const avg = data.total / data.count;
            const pct = ((data.total / this.totalFrameTime) * 100).toFixed(1);
            report += `  ${name.padEnd(30)} avg: ${avg.toFixed(2)}ms  min: ${data.min.toFixed(2)}ms  max: ${data.max.toFixed(2)}ms  (${pct}%)\n`;
        }

        // Calculate unaccounted time
        let accountedTime = 0;
        for (const [, data] of this.sections) {
            accountedTime += data.total;
        }
        const unaccounted = this.totalFrameTime - accountedTime;
        const unaccountedPct = ((unaccounted / this.totalFrameTime) * 100).toFixed(1);
        report += `  ${'(unaccounted)'.padEnd(30)} total: ${unaccounted.toFixed(2)}ms  (${unaccountedPct}%)\n`;

        // Add bottleneck analysis
        report += '\n--- Analysis ---\n';
        if (actualFPS < theoreticalFPS * 0.5) {
            report += `⚠️ GPU BOTTLENECK DETECTED: Actual FPS (${actualFPS.toFixed(0)}) << Theoretical (${theoreticalFPS.toFixed(0)})\n`;
            report += '   The GPU cannot keep up with draw calls. Likely causes:\n';
            report += '   - Bloom post-processing (13 render passes)\n';
            report += '   - Complex shader (SSS crystal material)\n';
            report += '   - High resolution / pixel fill rate\n';
        } else {
            report += '✓ No obvious GPU bottleneck detected\n';
        }

        return report;
    }

    /**
     * Set renderer reference for diagnostics
     * @param {ThreeRenderer} renderer
     */
    setRenderer(renderer) {
        this._renderer = renderer;
    }

    /**
     * Diagnose render pipeline issues
     * Run profiler.diagnose() from console
     */
    diagnose() {
        let report = '\n=== RENDER PIPELINE DIAGNOSTICS ===\n\n';

        // GPU Info
        if (this._gl) {
            const debugInfo = this._gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                const vendor = this._gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
                const renderer = this._gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                report += `GPU: ${renderer}\n`;
                report += `Vendor: ${vendor}\n`;
            } else {
                report += 'GPU: (debug info not available)\n';
            }

            // Check max texture size and viewport
            const maxTexture = this._gl.getParameter(this._gl.MAX_TEXTURE_SIZE);
            const maxViewport = this._gl.getParameter(this._gl.MAX_VIEWPORT_DIMS);
            const drawingBuffer = [this._gl.drawingBufferWidth, this._gl.drawingBufferHeight];
            report += `Max Texture Size: ${maxTexture}\n`;
            report += `Max Viewport: ${maxViewport[0]}x${maxViewport[1]}\n`;
            report += `Drawing Buffer: ${drawingBuffer[0]}x${drawingBuffer[1]}\n`;
        }

        // Bloom pass info
        if (this._renderer) {
            report += '\n--- Bloom Passes ---\n';

            if (this._renderer.bloomPass) {
                const bp = this._renderer.bloomPass;
                report += 'Main Bloom:\n';
                report += `  resolution: ${bp.resolution?.x}x${bp.resolution?.y}\n`;
                report += `  nMips: ${bp.nMips}\n`;
                if (bp.renderTargetBright) {
                    report += `  renderTargetBright: ${bp.renderTargetBright.width}x${bp.renderTargetBright.height}\n`;
                }
                if (bp.renderTargetsHorizontal?.[0]) {
                    report += `  mip0: ${bp.renderTargetsHorizontal[0].width}x${bp.renderTargetsHorizontal[0].height}\n`;
                }
            } else {
                report += 'Main Bloom: NOT FOUND\n';
            }

            if (this._renderer.particleBloomPass) {
                const pbp = this._renderer.particleBloomPass;
                report += 'Particle Bloom:\n';
                report += `  resolution: ${pbp.resolution?.x}x${pbp.resolution?.y}\n`;
                if (pbp.renderTargetBright) {
                    report += `  renderTargetBright: ${pbp.renderTargetBright.width}x${pbp.renderTargetBright.height}\n`;
                }
            } else {
                report += 'Particle Bloom: NOT FOUND\n';
            }

            // Render targets
            report += '\n--- Render Targets ---\n';
            if (this._renderer.particleRenderTarget) {
                const prt = this._renderer.particleRenderTarget;
                report += `Particle RT: ${prt.width}x${prt.height}\n`;
            }
            if (this._renderer.soulRenderTarget) {
                const srt = this._renderer.soulRenderTarget;
                report += `Soul RT: ${srt.width}x${srt.height}\n`;
            }

            // Composer
            if (this._renderer.composer) {
                const c = this._renderer.composer;
                report += '\n--- Composer ---\n';
                report += `Passes: ${c.passes?.length || 'unknown'}\n`;
                if (c.readBuffer) {
                    report += `Read Buffer: ${c.readBuffer.width}x${c.readBuffer.height}\n`;
                }
            }
        } else {
            report += '\nRenderer not available - call profiler.setRenderer(mascot.renderer)\n';
        }

        // Frame rate analysis
        report += '\n--- Frame Rate Analysis ---\n';
        const actualFPS = this.getActualFPS();
        report += `Current FPS: ${actualFPS.toFixed(1)}\n`;
        if (actualFPS > 0 && actualFPS < 35 && actualFPS > 25) {
            report += '⚠️ FPS is suspiciously close to 30 - possible causes:\n';
            report += '   - Browser V-Sync to 30fps (power saving mode?)\n';
            report += '   - Windows display scaling issues\n';
            report += '   - GPU running on integrated graphics instead of dedicated\n';
            report += '   - requestAnimationFrame throttling\n';
            report += '\nTry:\n';
            report += '   1. Check chrome://gpu for GPU status\n';
            report += '   2. Disable battery saver / power saving mode\n';
            report += '   3. Force Chrome to use dedicated GPU in Windows settings\n';
        }

        console.log(report);
        return report;
    }

    /**
     * Test bypass bloom completely (for diagnosis)
     */
    testBypassBloom() {
        if (!this._renderer?.bloomPass) {
            console.log('Renderer not available');
            return;
        }
        this._renderer.bloomPass.enabled = false;
        if (this._renderer.particleBloomPass) {
            this._renderer.particleBloomPass.enabled = false;
        }
        console.log('[Profiler] Bloom DISABLED - check FPS now');
        console.log('[Profiler] Run profiler.restoreBloom() to re-enable');
    }

    /**
     * Restore bloom after test
     */
    restoreBloom() {
        if (!this._renderer?.bloomPass) {
            console.log('Renderer not available');
            return;
        }
        this._renderer.bloomPass.enabled = true;
        if (this._renderer.particleBloomPass) {
            this._renderer.particleBloomPass.enabled = true;
        }
        console.log('[Profiler] Bloom RESTORED');
    }

    /**
     * Completely bypass composer for testing
     * This will render directly to screen without any post-processing
     */
    testBypassComposer() {
        if (!this._renderer) {
            console.log('Renderer not available');
            return;
        }
        this._savedComposer = this._renderer.composer;
        this._renderer.composer = null;
        console.log('[Profiler] Composer BYPASSED - direct render mode (no bloom, no effects)');
        console.log('[Profiler] Check FPS now. Run profiler.restoreComposer() to restore');
    }

    /**
     * Restore composer after bypass test
     */
    restoreComposer() {
        if (!this._renderer || !this._savedComposer) {
            console.log('No saved composer to restore');
            return;
        }
        this._renderer.composer = this._savedComposer;
        this._savedComposer = null;
        console.log('[Profiler] Composer RESTORED');
    }
}

// Singleton for easy access
export const profiler = new PerformanceProfiler();
