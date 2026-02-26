/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - 3D Blink Animator
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Emotion-aware blink animation system for 3D geometries
 * @author Emotive Engine Team
 * @module 3d/animation/BlinkAnimator
 *
 * Manages:
 * - Geometry-specific blink behaviors
 * - Emotion-modulated timing and speed
 * - Smooth blink animations with playful accents
 */

import { getEmotion } from '../../core/emotions/index.js';

export class BlinkAnimator {
    constructor(geometryConfig, _options = {}) {
        // Geometry-specific blink config
        this.blinkConfig = geometryConfig.blink || this.getDefaultBlinkConfig();
        this.currentGeometryType = null;

        // Timing (modulated by emotion)
        this.baseDuration = this.blinkConfig.duration || 150;
        this.baseMinInterval = 3000; // 3 seconds
        this.baseMaxInterval = 7000; // 7 seconds

        // Current emotion modifiers
        this.emotionBlinkRate = 1.0; // Affects interval between blinks
        this.emotionBlinkSpeed = 1.0; // Affects blink animation speed

        // State
        this.isBlinking = false;
        this.blinkTimer = 0;
        this.nextBlinkTime = this.getRandomBlinkTime();
        this.enabled = true;

        // Animation state
        this.blinkProgress = 0; // 0→1 (linear progress through blink)
    }

    /**
     * Update emotion modifiers when emotion changes
     * @param {string} emotionName - Name of the emotion
     */
    setEmotion(emotionName) {
        const emotion = getEmotion(emotionName);
        this.emotionBlinkRate = emotion?.visual?.blinkRate || 1.0;
        this.emotionBlinkSpeed = emotion?.visual?.blinkSpeed || 1.0;
    }

    /**
     * Update geometry config when shape changes
     * @param {Object} geometryConfig - Geometry configuration with blink settings
     */
    setGeometry(geometryConfig) {
        this.blinkConfig = geometryConfig.blink || this.getDefaultBlinkConfig();
        this.baseDuration = this.blinkConfig.duration || 150;
    }

    /**
     * Main update loop
     * @param {number} deltaTime - Time since last frame in ms
     * @returns {Object} Current blink state
     */
    update(deltaTime) {
        if (!this.enabled) return this.getIdleState();

        if (this.isBlinking) {
            // Update blink animation
            this.blinkTimer += deltaTime;
            const duration = this.baseDuration / this.emotionBlinkSpeed;

            if (this.blinkTimer >= duration) {
                this.completeBlink();
                return this.getIdleState();
            }

            // Calculate progress (0→1)
            const rawProgress = this.blinkTimer / duration;
            this.blinkProgress = rawProgress;

            return this.getBlinkState();
        } else {
            // Wait for next blink
            if (Date.now() >= this.nextBlinkTime) {
                this.startBlink();
                return this.getBlinkState();
            }

            return this.getIdleState();
        }
    }

    /**
     * Start blink animation
     */
    startBlink() {
        if (!this.enabled) return;
        this.isBlinking = true;
        this.blinkTimer = 0;
        this.blinkProgress = 0;
    }

    /**
     * Complete blink and schedule next
     */
    completeBlink() {
        this.isBlinking = false;
        this.blinkTimer = 0;
        this.blinkProgress = 0;
        this.nextBlinkTime = Date.now() + this.getRandomBlinkTime();
    }

    /**
     * Get random interval until next blink (emotion-modulated)
     * @returns {number} Time in milliseconds
     */
    getRandomBlinkTime() {
        const min = this.baseMinInterval / this.emotionBlinkRate;
        const max = this.baseMaxInterval / this.emotionBlinkRate;
        return min + Math.random() * (max - min);
    }

    /**
     * Calculate current blink animation state
     * @returns {Object} Blink state with scale, rotation, glow
     */
    getBlinkState() {
        const config = this.blinkConfig;

        // Sine wave: 0→1→0 (smooth blink curve)
        const sineCurve = Math.sin(this.blinkProgress * Math.PI);

        // Apply playful accents if configured
        let playfulMultiplier = 1.0;
        if (config.playful) {
            // Anticipation (first 10%)
            if (this.blinkProgress < 0.1) {
                const anticipationPhase = this.blinkProgress / 0.1;
                const anticipation = Math.sin(anticipationPhase * Math.PI);
                playfulMultiplier -= anticipation * config.playful.anticipation;
            }
            // Overshoot (last 20%)
            else if (this.blinkProgress > 0.8) {
                const overshootPhase = (this.blinkProgress - 0.8) / 0.2;
                const overshoot = Math.sin(overshootPhase * Math.PI);
                playfulMultiplier += overshoot * config.playful.overshoot;
            }
        }

        const blinkAmount = sineCurve * playfulMultiplier;

        // Calculate scale based on geometry config
        const scale = [
            1.0 - (1.0 - config.scaleAxis[0]) * blinkAmount,
            1.0 - (1.0 - config.scaleAxis[1]) * blinkAmount,
            1.0 - (1.0 - config.scaleAxis[2]) * blinkAmount,
        ];

        // Optional rotation
        let rotation = null;
        if (config.rotation) {
            rotation = [
                config.rotation[0] * blinkAmount,
                config.rotation[1] * blinkAmount,
                config.rotation[2] * blinkAmount,
            ];
        }

        // Optional glow boost
        let glowBoost = 0;
        if (config.glowBoost) {
            glowBoost = config.glowBoost * blinkAmount;
        }

        return {
            isBlinking: true,
            progress: this.blinkProgress,
            scale,
            rotation,
            glowBoost,
        };
    }

    /**
     * Get idle state (no blink)
     * @returns {Object} Idle state
     */
    getIdleState() {
        return {
            isBlinking: false,
            progress: 0,
            scale: [1, 1, 1],
            rotation: null,
            glowBoost: 0,
        };
    }

    /**
     * Default blink config fallback
     * @returns {Object} Default blink configuration
     */
    getDefaultBlinkConfig() {
        return {
            type: 'vertical-squish',
            duration: 150,
            scaleAxis: [1.0, 0.3, 1.0],
            curve: 'sine',
        };
    }

    /**
     * Pause blinks (during geometry morph, etc.)
     */
    pause() {
        this.enabled = false;
        if (this.isBlinking) {
            this.completeBlink();
        }
    }

    /**
     * Resume blinks
     */
    resume() {
        this.enabled = true;
        this.nextBlinkTime = Date.now() + this.getRandomBlinkTime();
    }

    /**
     * Get current state for debugging
     * @returns {Object} Current animator state
     */
    getState() {
        return {
            isBlinking: this.isBlinking,
            enabled: this.enabled,
            blinkProgress: this.blinkProgress,
            emotionBlinkRate: this.emotionBlinkRate,
            emotionBlinkSpeed: this.emotionBlinkSpeed,
            nextBlinkTime: this.nextBlinkTime,
        };
    }

    /**
     * Cleanup all resources
     */
    destroy() {
        this.blinkConfig = null;
        this.enabled = false;
        this.isBlinking = false;
    }
}

export default BlinkAnimator;
