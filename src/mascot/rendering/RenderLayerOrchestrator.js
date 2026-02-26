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
 *
 * @module RenderLayerOrchestrator
 */
import { emotiveDebugger } from '../../utils/debugger.js';

export class RenderLayerOrchestrator {
    /**
     * Create RenderLayerOrchestrator
     *
     * @param {Object} deps - Dependencies
     * @param {Object} deps.canvasManager - Canvas manager instance
     * @param {Object} deps.config - Configuration object
     * @param {Object} deps.particleSystem - Particle system instance
     * @param {Object} [deps.pluginSystem] - Plugin system instance
     * @param {Object} deps.renderer - Renderer instance
     * @param {Object} deps.stateMachine - State machine instance
     * @param {Object} deps.state - Shared state with debugMode property
     * @param {Function} deps.renderDebugInfo - Debug info render function
     */
    constructor(deps) {
        this.canvasManager = deps.canvasManager;
        this.config = deps.config;
        this.particleSystem = deps.particleSystem;
        this.pluginSystem = deps.pluginSystem || null;
        this.renderer = deps.renderer;
        this.stateMachine = deps.stateMachine;
        this._state = deps.state || { debugMode: false };
        this._renderDebugInfo = deps.renderDebugInfo || (() => {});
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
        this.particleSystem.renderBackground(
            this.canvasManager.getContext(),
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
        this.renderer.render(renderState, deltaTime, gestureTransform);
    }

    /**
     * Render foreground particles (in front of orb)
     * @param {string} glowColor - Emotion glow color
     * @param {Object} gestureTransform - Gesture transform data
     */
    renderForegroundParticles(glowColor, gestureTransform) {
        this.particleSystem.renderForeground(
            this.canvasManager.getContext(),
            glowColor,
            gestureTransform
        );
    }

    /**
     * Render active plugins
     */
    renderPlugins() {
        if (this.pluginSystem) {
            const state = this.stateMachine.getCurrentState();
            this.pluginSystem.render(this.canvasManager.getContext(), state);
        }
    }

    /**
     * Render debug information if enabled
     * @param {number} deltaTime - Time since last frame
     */
    renderDebugIfEnabled(deltaTime) {
        if (this.config.showFPS || this.config.showDebug) {
            this._renderDebugInfo(deltaTime);
        }
    }

    /**
     * Log render performance if debugging
     * @param {number} renderStart - Render start timestamp
     * @param {number} deltaTime - Time since last frame
     */
    logPerformanceIfDebug(renderStart, deltaTime) {
        if (!this._state.debugMode) return;

        const renderTime = performance.now() - renderStart;

        if (renderTime > 16.67) {
            // Longer than 60fps frame
            emotiveDebugger.log('WARN', 'Slow render frame detected', {
                renderTime,
                deltaTime,
                particleCount: this.particleSystem.getStats().activeParticles,
            });
        }
    }
}
