/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - 3D Breathing Animator
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Handles breathing animations for 3D rendering
 * @author Emotive Engine Team
 * @module 3d/animation/BreathingAnimator
 *
 * Manages:
 * - Breathing phase and timing
 * - Emotion-specific breathing patterns
 * - Undertone modifiers
 * - Scale calculation for breathing effect
 */

export class BreathingAnimator {
    constructor() {
        // Base breathing configuration
        this.breathingSpeed = 1.0; // Base breathing speed
        this.breathingDepth = 0.03; // Base breathing depth (3% scale oscillation)

        // Breathing state
        this.breathingPhase = 0; // Current phase in breathing cycle [0, 2π]
        this.breathRate = 1.0; // Emotion-specific rate multiplier
        this.breathDepth = 0.03; // Emotion-specific depth
        this.breathRateMult = 1.0; // Undertone rate multiplier
        this.breathDepthMult = 1.0; // Undertone depth multiplier

        // Rhythm coordination
        this.rhythmAdapter = null; // Optional Rhythm3DAdapter reference
        this.grooveBlendFactor = 0.4; // Reduce breathing to 40% during groove

        // Emotion-specific breathing patterns (matches 2D BreathingAnimator)
        this.emotionBreathPatterns = {
            happy: { rate: 1.1, depth: 1.2 },
            sad: { rate: 0.8, depth: 0.7 },
            angry: { rate: 1.4, depth: 1.3 },
            calm: { rate: 0.7, depth: 0.9 },
            excited: { rate: 1.5, depth: 1.4 },
            focused: { rate: 0.9, depth: 0.6 },
            neutral: { rate: 1.0, depth: 1.0 },
            love: { rate: 1.2, depth: 1.3 },
            surprised: { rate: 1.3, depth: 1.1 },
            confused: { rate: 1.1, depth: 0.9 },
            amused: { rate: 1.2, depth: 1.1 },
            bored: { rate: 0.6, depth: 0.8 },
            tired: { rate: 0.5, depth: 1.2 },
            anxious: { rate: 1.6, depth: 0.9 },
            determined: { rate: 1.1, depth: 1.0 },
            proud: { rate: 0.9, depth: 1.3 },
            content: { rate: 0.8, depth: 1.0 },
            hopeful: { rate: 1.0, depth: 1.1 },
            zen: { rate: 0.4, depth: 1.5 },
            intrigued: { rate: 1.1, depth: 0.8 },
            embarrassed: { rate: 1.3, depth: 0.7 },
            grateful: { rate: 0.9, depth: 1.1 },
            inspired: { rate: 1.0, depth: 1.3 },
            silly: { rate: 1.4, depth: 1.2 },
            sleepy: { rate: 0.3, depth: 1.4 },
        };
    }

    /**
     * Update breathing animation
     * @param {number} deltaTime - Time since last frame in ms
     * @param {string} emotion - Current emotion
     * @param {Object} undertoneModifier - Undertone modifier with '3d' section
     */
    update(deltaTime, emotion, undertoneModifier = null) {
        // Apply emotion-specific breathing pattern
        const pattern = this.emotionBreathPatterns[emotion] || { rate: 1.0, depth: 1.0 };

        // Apply undertone modifiers
        if (undertoneModifier && undertoneModifier['3d'] && undertoneModifier['3d'].scale) {
            this.breathRateMult = undertoneModifier['3d'].scale.breathRateMultiplier || 1.0;
            this.breathDepthMult = undertoneModifier['3d'].scale.breathDepthMultiplier || 1.0;
        } else {
            this.breathRateMult = 1.0;
            this.breathDepthMult = 1.0;
        }

        // Calculate final breathing parameters
        this.breathRate = pattern.rate * this.breathRateMult;
        this.breathDepth = this.breathingDepth * pattern.depth * this.breathDepthMult;

        // Update breathing phase (sine wave oscillation)
        const phaseIncrement = this.breathingSpeed * this.breathRate * (deltaTime / 1000);
        this.breathingPhase += phaseIncrement;

        // Keep phase in [0, 2π] range
        if (this.breathingPhase > Math.PI * 2) {
            this.breathingPhase -= Math.PI * 2;
        }
    }

    /**
     * Set rhythm adapter for groove coordination
     * When groove is active, breathing depth is reduced to prevent visual interference
     * @param {Object|null} rhythmAdapter - Rhythm3DAdapter instance or null to disable
     */
    setRhythmAdapter(rhythmAdapter) {
        this.rhythmAdapter = rhythmAdapter;
    }

    /**
     * Get current breathing scale multiplier
     * When groove is active, breathing is reduced to complement rather than compete
     * @returns {number} Scale factor for breathing (1.0 ± breathDepth)
     */
    getBreathingScale() {
        // Check if groove is active
        const isGrooving = this.rhythmAdapter?.isPlaying?.() ?? false;

        // When grooving, reduce breathing depth to avoid fighting with groove pulse
        const grooveReduction = isGrooving ? this.grooveBlendFactor : 1.0;

        return 1.0 + Math.sin(this.breathingPhase) * this.breathDepth * grooveReduction;
    }

    /**
     * Set emotion (updates breathing pattern immediately)
     * @param {string} emotion - Emotion name
     * @param {Object} undertoneModifier - Undertone modifier
     */
    setEmotion(emotion, undertoneModifier = null) {
        const pattern = this.emotionBreathPatterns[emotion] || { rate: 1.0, depth: 1.0 };

        // Apply undertone modifiers
        if (undertoneModifier && undertoneModifier['3d'] && undertoneModifier['3d'].scale) {
            this.breathRateMult = undertoneModifier['3d'].scale.breathRateMultiplier || 1.0;
            this.breathDepthMult = undertoneModifier['3d'].scale.breathDepthMultiplier || 1.0;
        } else {
            this.breathRateMult = 1.0;
            this.breathDepthMult = 1.0;
        }

        // Calculate final breathing parameters
        this.breathRate = pattern.rate * this.breathRateMult;
        this.breathDepth = this.breathingDepth * pattern.depth * this.breathDepthMult;
    }

    /**
     * Reset breathing to default state
     */
    reset() {
        this.breathingPhase = 0;
        this.breathRate = 1.0;
        this.breathDepth = this.breathingDepth;
        this.breathRateMult = 1.0;
        this.breathDepthMult = 1.0;
    }

    /**
     * Get breathing info for debugging
     * @returns {Object} Breathing state info
     */
    getBreathingInfo() {
        return {
            phase: this.breathingPhase,
            rate: this.breathRate,
            depth: this.breathDepth,
            scale: this.getBreathingScale(),
            rateMult: this.breathRateMult,
            depthMult: this.breathDepthMult,
        };
    }

    /**
     * Cleanup all resources
     */
    destroy() {
        this.emotionBreathPatterns = null;
        this.rhythmAdapter = null;
    }
}

export default BreathingAnimator;
