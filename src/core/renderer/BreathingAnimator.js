/**
 * BreathingAnimator - Handles breathing animations for EmotiveRenderer
 * @module core/renderer/BreathingAnimator
 */

export class BreathingAnimator {
    constructor(renderer) {
        this.renderer = renderer;

        // Breathing configuration
        this.breathingSpeed = 0.42; // 16 breaths/min (0.42 rad/s = 4 sec/cycle = 15-16 bpm)
        this.breathingDepth = 0.08; // 8% size variation for visible breathing

        // Breathing state
        this.breathingPhase = 0;
        this.breathRate = 1.0;
        this.breathDepth = this.breathingDepth;
        this.breathRateMult = 1.0;
        this.breathDepthMult = 1.0;
        this.breathIrregular = false;

        // Custom scale override
        this.customScale = null;

        // Emotion-specific breathing patterns
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
     * @param {Object} undertone - Current undertone modifiers
     */
    update(deltaTime, emotion, undertone = {}) {
        // Ensure undertone is not null
        undertone = undertone || {};

        // Apply emotion-specific breathing pattern
        const pattern = this.emotionBreathPatterns[emotion] || { rate: 1.0, depth: 1.0 };

        // Apply undertone modifiers (safe access with null check)
        const undertoneRateMult = undertone?.breathRateMult || 1.0;
        const undertoneDepthMult = undertone?.breathDepthMult || 1.0;

        // Calculate final breathing parameters
        this.breathRate = pattern.rate * this.breathRateMult * undertoneRateMult;
        this.breathDepth =
            this.breathingDepth * pattern.depth * this.breathDepthMult * undertoneDepthMult;

        // Add irregularity if needed
        let phaseIncrement = this.breathingSpeed * this.breathRate * (deltaTime / 1000);
        if (this.breathIrregular && undertone?.breathIrregular) {
            phaseIncrement *= 0.8 + Math.sin(Date.now() * 0.0003) * 0.4;
        }

        // Update breathing phase
        this.breathingPhase += phaseIncrement;
        if (this.breathingPhase > Math.PI * 2) {
            this.breathingPhase -= Math.PI * 2;
        }
    }

    /**
     * Get current breathing scale
     * @returns {number} Scale factor for breathing
     */
    getBreathingScale() {
        // Return custom scale if set
        if (this.customScale !== null) {
            return this.customScale;
        }

        // Calculate breathing scale
        const breathAmount = Math.sin(this.breathingPhase);
        return 1 + breathAmount * this.breathDepth;
    }

    /**
     * Set custom breathing scale (overrides normal breathing)
     * @param {number} scale - Custom scale value, or null to use normal breathing
     */
    setCustomScale(scale) {
        this.customScale = scale;
    }

    /**
     * Set breathing speed
     * @param {number} speed - Breathing speed in radians per second
     */
    setBreathingSpeed(speed) {
        this.breathingSpeed = speed;
    }

    /**
     * Set breathing depth
     * @param {number} depth - Breathing depth as percentage (0-1)
     */
    setBreathingDepth(depth) {
        this.breathingDepth = Math.max(0, Math.min(1, depth));
    }

    /**
     * Set breathing rate multiplier
     * @param {number} mult - Rate multiplier
     */
    setBreathRateMultiplier(mult) {
        this.breathRateMult = mult;
    }

    /**
     * Set breathing depth multiplier
     * @param {number} mult - Depth multiplier
     */
    setBreathDepthMultiplier(mult) {
        this.breathDepthMult = mult;
    }

    /**
     * Enable/disable irregular breathing
     * @param {boolean} irregular - Whether breathing should be irregular
     */
    setIrregularBreathing(irregular) {
        this.breathIrregular = irregular;
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
        this.breathIrregular = false;
        this.customScale = null;
    }

    /**
     * Apply breath hold effect
     * @param {boolean} empty - Whether lungs are empty (true) or full (false)
     */
    holdBreath(empty = false) {
        // Set custom scale based on breath hold type
        this.customScale = empty ? 0.92 : 1.08;
    }

    /**
     * Release breath hold
     */
    releaseBreath() {
        this.customScale = null;
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
            isCustom: this.customScale !== null,
            isIrregular: this.breathIrregular,
        };
    }
}

export default BreathingAnimator;
