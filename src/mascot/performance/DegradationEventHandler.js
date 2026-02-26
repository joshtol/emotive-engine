/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝
 *          ◐ ◑ ◒ ◓  DEGRADATION EVENT HANDLER  ◓ ◒ ◑ ◐
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview DegradationEventHandler - Performance Degradation Event Processing
 * @author Emotive Engine Team
 * @version 1.0.0
 * @module DegradationEventHandler
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Handles performance degradation events and applies degradation settings to
 * ║ engine subsystems (particles, audio, rendering). Works in tandem with
 * ║ PerformanceMonitoringManager which makes degradation decisions.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ ⚡ RESPONSIBILITIES
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Handle degradation/recovery/level change events
 * │ • Apply degradation settings to particle system
 * │ • Apply degradation settings to audio system
 * │ • Apply degradation settings to renderer
 * │ • Emit appropriate events for external monitoring
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */

export class DegradationEventHandler {
    /**
     * Create DegradationEventHandler
     * @param {Function} getSubsystems - Function returning {particleSystem, soundSystem, renderer}
     * @param {Function} emitEvent - Function to emit events (event, data)
     */
    constructor(getSubsystems, emitEvent) {
        this._getSubsystems = getSubsystems;
        this._emitEvent = emitEvent;
    }

    /**
     * Handle degradation-related events
     * @param {string} event - Event type (degradationApplied, recoveryApplied, levelChanged)
     * @param {Object} data - Event data with settings
     *
     * @example
     * handler.handleEvent('degradationApplied', {
     *   settings: { particleLimit: 500, audioEnabled: false, qualityLevel: 'low' }
     * });
     */
    handleEvent(event, data) {
        switch (event) {
            case 'degradationApplied':
                // Silently handle performance degradation
                this.applySettings(data.settings);
                this._emitEvent('performanceDegradation', data);
                break;

            case 'recoveryApplied':
                // Silently handle performance recovery
                this.applySettings(data.settings);
                this._emitEvent('performanceRecovery', data);
                break;

            case 'levelChanged':
                // Silently handle degradation level change
                this.applySettings(data.settings);
                this._emitEvent('degradationLevelChanged', data);
                break;
        }
    }

    /**
     * Apply degradation settings to all subsystems
     * @param {Object} settings - Degradation settings
     * @param {number} [settings.particleLimit] - Max particles to render
     * @param {boolean} [settings.audioEnabled] - Whether audio is enabled
     * @param {string} [settings.qualityLevel] - Rendering quality level
     *
     * @example
     * handler.applySettings({
     *   particleLimit: 500,
     *   audioEnabled: false,
     *   qualityLevel: 'low'
     * });
     */
    applySettings(settings) {
        const subsystems = this._getSubsystems();

        // Update particle system limits
        if (subsystems.particleSystem && settings.particleLimit !== undefined) {
            subsystems.particleSystem.setMaxParticles(settings.particleLimit);
        }

        // Update audio system
        if (subsystems.soundSystem && settings.audioEnabled !== undefined) {
            if (!settings.audioEnabled && subsystems.soundSystem.isAvailable()) {
                subsystems.soundSystem.stopAmbientTone(200);
            }
        }

        // DISABLED - Don't change FPS based on degradation
        /*
        // Update animation controller target FPS
        if (subsystems.animationController && settings.targetFPS !== undefined) {
            subsystems.animationController.setTargetFPS(settings.targetFPS);
        }
        */

        // Update renderer quality
        if (subsystems.renderer && settings.qualityLevel !== undefined) {
            subsystems.renderer.setQualityLevel(settings.qualityLevel);
        }
    }
}
