/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝
 *              ◐ ◑ ◒ ◓  VISUAL EFFECTS MANAGER  ◓ ◒ ◑ ◐
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview VisualEffectsManager - Visual Effects and Frame Export
 * @author Emotive Engine Team
 * @version 1.0.0
 * @module VisualEffectsManager
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Manages visual effects, containment bounds, scaling, and canvas frame export.
 * ║ Provides utilities for capturing animation frames and controlling particle bounds.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🎨 RESPONSIBILITIES
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Set particle containment bounds and scaling
 * │ • Export canvas frames as Data URLs
 * │ • Export canvas frames as Blobs
 * │ • Manage particle system dimensions
 * │ • Clear particle systems
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */

export class VisualEffectsManager {
    /**
     * Create VisualEffectsManager
     * @param {Function} getEngine - Function that returns the real engine instance
     * @param {Function} getCanvas - Function that returns the canvas element
     */
    constructor(getEngine, getCanvas) {
        this._getEngine = getEngine;
        this._getCanvas = getCanvas;
    }

    /**
     * Set particle containment bounds and scale
     * @param {Object} bounds - Bounds object {width, height} in pixels, null to disable containment
     * @param {number} scale - Scale factor for mascot (1 = normal, 0.5 = half size, etc.)
     *
     * @example
     * // Contain particles within 800x600 bounds at normal scale
     * visualEffectsManager.setContainment({ width: 800, height: 600 }, 1);
     *
     * @example
     * // Disable containment but set scale to half size
     * visualEffectsManager.setContainment(null, 0.5);
     *
     * @example
     * // Contain within element bounds at 80% scale
     * const rect = element.getBoundingClientRect();
     * visualEffectsManager.setContainment({ width: rect.width, height: rect.height }, 0.8);
     */
    setContainment(bounds, scale = 1) {
        const engine = this._getEngine();
        if (!engine) throw new Error('Engine not initialized. Call init() first.');

        // Set bounds on particle system
        if (engine.particleSystem) {
            engine.particleSystem.setContainmentBounds(bounds);
        }

        // CRITICAL: Set scale on PositionController (affects both core and particles)
        // The renderer recalculates scaleFactor every frame from effectiveCenter.coreScale
        // so we must set it on the PositionController which provides effectiveCenter
        if (engine.positionController) {
            engine.positionController.coreScaleOverride = scale;
            engine.positionController.particleScaleOverride = scale;
        }

        // Also update existing particles immediately (new particles will use PositionController scale)
        if (engine.particleSystem && engine.particleSystem.particles) {
            engine.particleSystem.particles.forEach(p => {
                p.scaleFactor = scale;
                p.size = p.baseSize * scale;
            });
        }
    }

    /**
     * Clear all particles from the system
     *
     * @example
     * visualEffectsManager.clearParticles();
     */
    clearParticles() {
        const engine = this._getEngine();
        if (!engine) throw new Error('Engine not initialized. Call init() first.');
        if (engine.particleSystem) {
            engine.particleSystem.clear();
        }
    }

    /**
     * Set particle system canvas dimensions
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     *
     * @example
     * visualEffectsManager.setParticleSystemCanvasDimensions(1920, 1080);
     */
    setParticleSystemCanvasDimensions(width, height) {
        const engine = this._getEngine();
        if (!engine) throw new Error('Engine not initialized. Call init() first.');
        if (engine.setParticleSystemCanvasDimensions) {
            engine.setParticleSystemCanvasDimensions(width, height);
        }
    }

    /**
     * Get current frame as data URL
     * @param {string} [format='png'] - Image format ('png', 'jpeg', 'webp')
     * @returns {string} Data URL of current canvas frame
     *
     * @example
     * // Export as PNG
     * const pngUrl = visualEffectsManager.getFrameData();
     * const img = new Image();
     * img.src = pngUrl;
     *
     * @example
     * // Export as JPEG
     * const jpegUrl = visualEffectsManager.getFrameData('jpeg');
     * window.open(jpegUrl);
     */
    getFrameData(format = 'png') {
        const canvas = this._getCanvas();
        if (!canvas) return null;
        return canvas.toDataURL(`image/${format}`);
    }

    /**
     * Get current frame as Blob
     * @param {string} [format='png'] - Image format ('png', 'jpeg', 'webp')
     * @returns {Promise<Blob>} Promise resolving to image blob
     *
     * @example
     * // Save frame as file
     * const blob = await visualEffectsManager.getFrameBlob();
     * const url = URL.createObjectURL(blob);
     * const a = document.createElement('a');
     * a.href = url;
     * a.download = 'mascot-frame.png';
     * a.click();
     *
     * @example
     * // Upload frame to server
     * const blob = await visualEffectsManager.getFrameBlob('jpeg');
     * const formData = new FormData();
     * formData.append('image', blob, 'mascot.jpg');
     * await fetch('/upload', { method: 'POST', body: formData });
     */
    getFrameBlob(format = 'png') {
        const canvas = this._getCanvas();
        if (!canvas) return Promise.resolve(null);

        return new Promise(resolve => {
            canvas.toBlob(blob => resolve(blob), `image/${format}`);
        });
    }
}
