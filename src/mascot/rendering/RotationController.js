/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝
 *               ◐ ◑ ◒ ◓  ROTATION CONTROLLER  ◓ ◒ ◑ ◐
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview RotationController - Manages Shape Rotation Behavior
 * @author Emotive Engine Team
 * @version 1.0.0
 * @module RotationController
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Manages shape rotation in multiple modes: rhythm-based (BPM), continuous rotation
 * ║ (degrees per frame), and direct angle positioning (for scratching/DJ effects).
 * ║ Provides unified interface for all rotation control methods.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🔄 ROTATION MODES
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • BPM Mode: Rhythm-linked rotation synchronized with audio/beat detection
 * │ • Continuous Mode: Constant rotation speed in degrees per frame
 * │ • Direct Mode: Manual angle positioning for interactive control (scratching)
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🎯 RESPONSIBILITIES
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Configure BPM for rhythm-linked subsystems
 * │ • Set continuous rotation speed (degrees per frame)
 * │ • Set direct rotation angle for manual control
 * │ • Delegate rotation updates to renderer with error boundary protection
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */

export class RotationController {
    /**
     * Create RotationController
     * @param {EmotiveMascot} mascot - Parent mascot instance
     */
    constructor(mascot) {
        this.mascot = mascot;
    }

    /**
     * Set BPM for rhythm-linked subsystems
     * @param {number} bpm - Beats per minute (forwarded to audio/rhythm helpers)
     * @returns {EmotiveMascot} Parent mascot instance for chaining
     *
     * @note Manual rotation now uses degrees per frame; BPM no longer drives rotation speed directly.
     *
     * @example
     * // Sync rotation with detected music tempo
     * mascot.setBPM(128); // House music tempo
     *
     * @example
     * // Update BPM dynamically based on audio analysis
     * audioAnalyzer.on('bpmDetected', (bpm) => {
     *   mascot.setBPM(bpm);
     * });
     */
    setBPM(bpm) {
        return this.mascot.errorBoundary.wrap(() => {
            if (this.mascot.renderer && this.mascot.renderer.setBPM) {
                this.mascot.renderer.setBPM(bpm);
            }
            return this.mascot;
        }, 'bpm-update', this.mascot)();
    }

    /**
     * Set manual rotation speed for the shape
     * @param {number} speed - Rotation speed in degrees per frame (negative for reverse)
     * @returns {EmotiveMascot} Parent mascot instance for chaining
     *
     * @note Speeds between -10 and 10 feel natural; higher values may cause motion blur.
     *
     * @example
     * // Gentle clockwise rotation
     * mascot.setRotationSpeed(2); // 2 degrees per frame
     *
     * @example
     * // Fast counter-clockwise rotation
     * mascot.setRotationSpeed(-8); // -8 degrees per frame
     *
     * @example
     * // Stop rotation
     * mascot.setRotationSpeed(0);
     */
    setRotationSpeed(speed) {
        return this.mascot.errorBoundary.wrap(() => {
            if (this.mascot.renderer && this.mascot.renderer.setRotationSpeed) {
                this.mascot.renderer.setRotationSpeed(speed);
            }
            return this.mascot;
        }, 'rotation-speed-update', this.mascot)();
    }

    /**
     * Set manual rotation angle directly (for scratching/DJ effects)
     * @param {number} angle - Rotation angle in degrees
     * @returns {EmotiveMascot} Parent mascot instance for chaining
     *
     * @example
     * // Set absolute rotation angle
     * mascot.setRotationAngle(45); // Rotate to 45 degrees
     *
     * @example
     * // DJ scratching effect - follow mouse/touch movement
     * let startAngle = 0;
     * canvas.addEventListener('mousedown', (e) => {
     *   startAngle = e.clientX;
     * });
     * canvas.addEventListener('mousemove', (e) => {
     *   const deltaX = e.clientX - startAngle;
     *   mascot.setRotationAngle(deltaX * 2); // Convert movement to rotation
     * });
     *
     * @example
     * // Snap to cardinal directions
     * const cardinalAngles = [0, 90, 180, 270];
     * mascot.setRotationAngle(cardinalAngles[2]); // Face left (180°)
     */
    setRotationAngle(angle) {
        return this.mascot.errorBoundary.wrap(() => {
            if (this.mascot.renderer && this.mascot.renderer.setRotationAngle) {
                this.mascot.renderer.setRotationAngle(angle);
            }
            return this.mascot;
        }, 'rotation-angle-update', this.mascot)();
    }
}
