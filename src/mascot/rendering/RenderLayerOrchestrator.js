/**
 * RenderLayerOrchestrator
 *
 * Orchestrates the rendering of all visual layers.
 * Handles:
 * - Background particle rendering (behind orb)
 * - Orb rendering (middle layer)
 * - Foreground particle rendering (in front of orb)
 * - Plugin rendering
 * - Debug info rendering
 * - Performance logging
 */
import { emotiveDebugger } from '../../utils/debugger.js';

export class RenderLayerOrchestrator {
    constructor(mascot) {
        this.mascot = mascot;
    }

    /**
     * Render all layers in correct order
     * @param {Object} params - Rendering parameters
     */
    renderAllLayers(params) {
        const { renderState, deltaTime, emotionParams, gestureTransform, renderStart } = params;

        this.renderBackgroundParticles(emotionParams.glowColor, gestureTransform);
        this.renderOrb(renderState, deltaTime, gestureTransform);
        this.renderForegroundParticles(emotionParams.glowColor, gestureTransform);
        this.renderPlugins();
        this.renderDebugIfEnabled(deltaTime);
        this.logPerformanceIfDebug(renderStart, deltaTime);
    }

    /**
     * Render background particles (behind orb)
     * @param {string} glowColor - Emotion glow color
     * @param {Object} gestureTransform - Gesture transform data
     */
    renderBackgroundParticles(glowColor, gestureTransform) {
        this.mascot.particleSystem.renderBackground(
            this.mascot.canvasManager.getContext(),
            glowColor,
            gestureTransform
        );
    }

    /**
     * Render the Emotive orb (middle layer)
     * @param {Object} renderState - Current render state
     * @param {number} deltaTime - Time since last frame
     * @param {Object} gestureTransform - Gesture transform data
     */
    renderOrb(renderState, deltaTime, gestureTransform) {
        this.mascot.renderer.render(renderState, deltaTime, gestureTransform);
    }

    /**
     * Render foreground particles (in front of orb)
     * @param {string} glowColor - Emotion glow color
     * @param {Object} gestureTransform - Gesture transform data
     */
    renderForegroundParticles(glowColor, gestureTransform) {
        this.mascot.particleSystem.renderForeground(
            this.mascot.canvasManager.getContext(),
            glowColor,
            gestureTransform
        );
    }

    /**
     * Render active plugins
     */
    renderPlugins() {
        if (this.mascot.pluginSystem) {
            const state = this.mascot.stateMachine.getCurrentState();
            this.mascot.pluginSystem.render(this.mascot.canvasManager.getContext(), state);
        }
    }

    /**
     * Render debug information if enabled
     * @param {number} deltaTime - Time since last frame
     */
    renderDebugIfEnabled(deltaTime) {
        if (this.mascot.config.showFPS || this.mascot.config.showDebug) {
            this.mascot.renderDebugInfo(deltaTime);
        }
    }

    /**
     * Log render performance if debugging
     * @param {number} renderStart - Render start timestamp
     * @param {number} deltaTime - Time since last frame
     */
    logPerformanceIfDebug(renderStart, deltaTime) {
        if (!this.mascot.debugMode) return;

        const renderTime = performance.now() - renderStart;

        if (renderTime > 16.67) { // Longer than 60fps frame
            emotiveDebugger.log('WARN', 'Slow render frame detected', {
                renderTime,
                deltaTime,
                particleCount: this.mascot.particleSystem.getStats().activeParticles
            });
        }
    }
}
