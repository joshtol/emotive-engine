/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Particle 3D Orchestrator
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Orchestrates 3D particle system with emotion, gesture, and visual effects
 * @author Emotive Engine Team
 * @module 3d/particles/Particle3DOrchestrator
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Central coordinator for 3D particle system:
 * ║ • Coordinates emotion calculator, gesture extractor, effects builder
 * ║ • Manages particle spawning based on emotion/undertone
 * ║ • Updates particle physics with gesture motion
 * ║ • Applies visual effects to particle renderer
 * ║ • Provides clean API for Core3DManager
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ARCHITECTURE:
 *   Core3DManager
 *        ↓
 *   Particle3DOrchestrator (this class)
 *        ↓
 *   ┌────────────────┬──────────────────┬──────────────────┐
 *   ↓                ↓                  ↓                  ↓
 * EmotionCalc  GestureExtract  EffectsBuilder  ParticleSystem
 *                                                          ↓
 *                                              ┌───────────┴──────────┐
 *                                              ↓                      ↓
 *                                      Translator              Renderer
 */

import { ParticleEmotionCalculator } from './ParticleEmotionCalculator.js';
import { GestureDataExtractor } from './GestureDataExtractor.js';
import { ParticleEffectsBuilder } from './ParticleEffectsBuilder.js';

export class Particle3DOrchestrator {
    constructor(particleSystem, translator, renderer) {
        // Core particle components
        this.particleSystem = particleSystem;
        this.translator = translator;
        this.renderer = renderer;

        // Specialized calculators/extractors
        this.emotionCalculator = new ParticleEmotionCalculator();
        this.gestureExtractor = new GestureDataExtractor();
        this.effectsBuilder = new ParticleEffectsBuilder();

        // Current state cache
        this.currentEmotion = null;
        this.currentUndertone = null;
        this.currentConfig = null;
    }

    /**
     * Main update method - called by Core3DManager each frame
     * @param {number} deltaTime - Time since last frame (ms)
     * @param {string} emotion - Current emotion
     * @param {string|null} undertone - Current undertone
     * @param {Array} activeAnimations - Active gesture animations
     * @param {number} currentTime - Animation time
     * @param {Object} corePosition - 3D mascot position {x, y, z}
     * @param {Object} canvasSize - Canvas dimensions {width, height}
     * @param {Object} rotationState - Mascot rotation state {euler, quaternion, angularVelocity}
     * @param {number} coreScale - Final core scale (baseScale * breath * morph * blink)
     * @param {number} coreRadius3D - Actual 3D core radius in world units (for particle orbit distance)
     */
    update(deltaTime, emotion, undertone, activeAnimations, currentTime, corePosition, canvasSize, rotationState, coreScale, coreRadius3D) {
        // Update translator with current 3D core radius for screen-size-independent orbits
        if (coreRadius3D !== undefined) {
            this.translator.setCoreRadius3D(coreRadius3D);
        }
        // Step 1: Calculate emotion-based particle configuration
        const emotionConfig = this._updateEmotionConfig(emotion, undertone);

        // Step 2: Extract gesture data from animations
        const gestureData = this.gestureExtractor.extract(activeAnimations, currentTime);

        // Step 3: Spawn particles based on emotion config
        this._spawnParticles(emotionConfig, deltaTime, canvasSize);

        // Step 4: Update particle physics with gesture motion
        this._updatePhysics(emotionConfig, gestureData, deltaTime, canvasSize, undertone);

        // Step 5: Update rendering with visual effects and orbital physics
        this._updateRendering(gestureData, corePosition, canvasSize, rotationState, deltaTime, coreScale);
    }

    /**
     * Update emotion configuration (with caching)
     * @param {string} emotion - Current emotion
     * @param {string|null} undertone - Current undertone
     * @returns {Object} Particle configuration
     */
    _updateEmotionConfig(emotion, undertone) {
        // Check if emotion/undertone changed
        if (this.currentEmotion !== emotion || this.currentUndertone !== undertone) {
            this.currentEmotion = emotion;
            this.currentUndertone = undertone;

            // Recalculate config
            this.currentConfig = this.emotionCalculator.calculate(emotion, undertone);

            // Clear particles on emotion change for clean transition
            this.particleSystem.clear();
        }

        return this.currentConfig;
    }

    /**
     * Spawn particles based on emotion configuration
     * @param {Object} config - Emotion particle config
     * @param {number} deltaTime - Time delta
     * @param {Object} canvasSize - Canvas dimensions
     */
    _spawnParticles(config, deltaTime, canvasSize) {
        const centerX = canvasSize.width / 2;
        const centerY = canvasSize.height / 2;

        // Handle special behaviors (zen mixing)
        let spawnBehavior = config.behavior;
        if (config.specialBehavior === 'zen-mixing') {
            spawnBehavior = this.emotionCalculator.selectZenBehavior();
        }

        // Spawn particles using 2D particle system
        this.particleSystem.spawn(
            spawnBehavior,
            config.emotion,
            config.rate,
            centerX,
            centerY,
            deltaTime,
            null, // count (null for rate-based spawning)
            config.min,
            config.max,
            1.0, // scaleFactor
            1.0, // particleSizeMultiplier
            config.colors, // emotionColors
            this.currentUndertone
        );
    }

    /**
     * Update particle physics with gesture motion
     * @param {Object} config - Emotion config
     * @param {Object} gestureData - Gesture data
     * @param {number} deltaTime - Time delta in SECONDS (will be converted to milliseconds)
     * @param {Object} canvasSize - Canvas dimensions
     * @param {string|null} undertone - Current undertone
     */
    _updatePhysics(config, gestureData, deltaTime, canvasSize, undertone) {
        const centerX = canvasSize.width / 2;
        const centerY = canvasSize.height / 2;

        // Build undertone modifier for particle update
        const undertoneModifier = undertone ? { undertone } : null;

        // Update particle physics with gesture motion
        this.particleSystem.update(
            deltaTime, // deltaTime in milliseconds
            centerX,
            centerY,
            gestureData ? gestureData.motion : null, // gestureMotion
            gestureData ? gestureData.progress : 0,  // gestureProgress
            undertoneModifier
        );
    }

    /**
     * Update rendering with 3D translation and visual effects
     * @param {Object} gestureData - Gesture data
     * @param {Object} corePosition - 3D mascot position
     * @param {Object} canvasSize - Canvas dimensions
     * @param {Object} rotationState - Mascot rotation state for orbital physics
     * @param {number} deltaTime - Time delta for physics
     * @param {number} coreScale - Final core scale for size ratio
     */
    _updateRendering(gestureData, corePosition, canvasSize, rotationState, deltaTime, coreScale) {
        const centerX = canvasSize.width / 2;
        const centerY = canvasSize.height / 2;

        // Build visual effects transform
        const effectsTransform = gestureData
            ? this.effectsBuilder.build(gestureData, centerX, centerY)
            : null;

        // Update 3D particle renderer with rotation state for orbital physics
        this.renderer.updateParticles(
            this.particleSystem.particles,
            this.translator,
            corePosition,
            canvasSize,
            rotationState,
            deltaTime,
            gestureData,  // Pass gesture data to detect spin gestures
            coreScale,    // Pass core scale to maintain particle/core size ratio
            this.geometryType // Pass geometry type for special rendering rules (e.g., black hole culling)
        );

        // Apply gesture visual effects
        this.renderer.setGestureEffects(effectsTransform);
    }

    /**
     * Set emotion explicitly (called when emotion changes)
     * @param {string} _emotion - New emotion (triggers recalculation)
     * @param {string|null} _undertone - New undertone (triggers recalculation)
     */
    setEmotion(_emotion, _undertone = null) {
        // Force recalculation on next update
        this.currentEmotion = null;
        this.currentUndertone = null;
    }

    /**
     * Set geometry type for special rendering rules
     * @param {string} geometryType - Geometry type (e.g., 'blackHole', 'crystal')
     */
    setGeometryType(geometryType) {
        this.geometryType = geometryType;
    }

    /**
     * Clear all particles
     */
    clear() {
        this.particleSystem.clear();
    }

    /**
     * Enable/disable particles
     * @param {boolean} enabled - Whether particles are enabled
     */
    setEnabled(enabled) {
        this.renderer.setVisible(enabled);
        if (!enabled) {
            this.clear();
        }
    }

    /**
     * Get current particle count
     * @returns {number} Number of active particles
     */
    getParticleCount() {
        return this.particleSystem.particles.length;
    }

    /**
     * Get current emotion config (for debugging)
     * @returns {Object} Current particle configuration
     */
    getCurrentConfig() {
        return this.currentConfig;
    }

    /**
     * Register custom particle effect
     * @param {string} gestureName - Gesture name
     * @param {Function} builderFn - Effect builder function
     */
    registerEffect(gestureName, builderFn) {
        this.effectsBuilder.registerEffect(gestureName, builderFn);
    }

    /**
     * Cleanup resources
     */
    destroy() {
        this.particleSystem.destroy();
        this.renderer.dispose();
        if (this.translator) {
            this.translator.dispose?.();
            this.translator = null;
        }
        this.emotionCalculator.clearCache();
        this.emotionCalculator = null;
        this.gestureExtractor.reset();
        this.gestureExtractor = null;
        if (this.effectsBuilder) {
            this.effectsBuilder.destroy?.();
            this.effectsBuilder = null;
        }
    }
}

export default Particle3DOrchestrator;
