/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝
 *                 ◐ ◑ ◒ ◓  EMOTIONAL STATE MANAGER  ◓ ◒ ◑ ◐
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview EmotionalStateManager - Emotional State & Undertone Management
 * @author Emotive Engine Team
 * @version 1.0.0
 * @module EmotionalStateManager
 * @complexity ⭐⭐⭐ Moderate-High (Complex state management with undertones)
 * @audience Modify this when changing emotional state transitions or undertone effects
 * @see docs/architecture/emotive-renderer-refactoring.md for extraction details
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Manages emotional states and undertone modifiers for the Emotive mascot.
 * ║ Handles smooth transitions between emotions, applies undertone effects on
 * ║ visual properties (size, glow, breathing), and coordinates with color systems.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🎭 RESPONSIBILITIES
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Set and transition between emotional states
 * │ • Apply undertone modifiers (intense, confident, nervous, tired, subdued)
 * │ • Update undertones without changing emotion
 * │ • Handle weighted undertone modifiers for smooth blending
 * │ • Coordinate color transitions with emotion changes
 * │ • Manage suspicion state and zen mode transitions
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🎨 UNDERTONE EFFECTS
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ INTENSE   : +20% size, +10% glow, +10% breathing → Electric, overwhelming
 * │ CONFIDENT : +10% size, +5% breathing → Bold, present
 * │ NERVOUS   : Jitter, flutter, irregular breathing → Anxious, tense
 * │ CLEAR     : Default multipliers → Normal midtone
 * │ TIRED     : -10% breathing rate/depth → Washed out, fading
 * │ SUBDUED   : -15% glow, -10% breathing → Ghostly, withdrawn
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */

import { getEmotion } from '../emotions/index.js';
import { emotionCache } from '../cache/EmotionCache.js';

/**
 * EmotionalStateManager - Manages emotional states and undertone modifiers
 */
export class EmotionalStateManager {
    /**
     * @param {Object} renderer - Reference to parent EmotiveRenderer
     */
    constructor(renderer) {
        this.renderer = renderer;
    }

    /**
     * Apply undertone modifiers to renderer state
     * Handles both weighted modifiers (for smooth transitions) and string-based undertones
     * @param {string|Object|null} undertone - Undertone name or weighted modifier object
     */
    applyUndertoneModifiers(undertone) {
        // Handle weighted modifier from state machine
        if (undertone && typeof undertone === 'object' && undertone.weight !== undefined) {
            const { weight } = undertone;

            // Apply weighted modifiers for smooth transitions
            // Use default value of 1.0 if property is undefined
            this.renderer.state.sizeMultiplier =
                1.0 + ((undertone.sizeMultiplier || 1.0) - 1.0) * weight;
            this.renderer.state.jitterAmount = (undertone.jitterAmount || 0) * weight;
            this.renderer.state.episodicFlutter =
                weight > 0.5 ? undertone.episodicFlutter || false : false;
            this.renderer.state.glowRadiusMult =
                1.0 + ((undertone.glowRadiusMult || 1.0) - 1.0) * weight;
            this.renderer.state.breathRateMult =
                1.0 + ((undertone.breathRateMult || 1.0) - 1.0) * weight;
            this.renderer.state.breathDepthMult =
                1.0 + ((undertone.breathDepthMult || 1.0) - 1.0) * weight;
            this.renderer.state.breathIrregular =
                weight > 0.5 ? undertone.breathIrregular || false : false;
            this.renderer.state.particleRateMult = 1.0;

            // Apply weighted glow and color effects
            this.renderer.state.glowPulse = (undertone.glowPulse || 0) * weight;
            this.renderer.state.brightnessFlicker = (undertone.brightnessFlicker || 0) * weight;
            this.renderer.state.brightnessMult =
                1.0 + ((undertone.brightnessMult || 1.0) - 1.0) * weight;
            this.renderer.state.saturationMult =
                1.0 + ((undertone.saturationMult || 1.0) - 1.0) * weight;
            this.renderer.state.hueShift = (undertone.hueShift || 0) * weight;
            return;
        }

        // String-based undertone handling
        if (!undertone || !this.renderer.undertoneModifiers[undertone]) {
            // Reset to defaults if no undertone - CLEAR ALL GLOW EFFECTS
            this.renderer.state.sizeMultiplier = 1.0;
            this.renderer.state.jitterAmount = 0;
            this.renderer.state.episodicFlutter = false;
            this.renderer.state.glowRadiusMult = 1.0;
            this.renderer.state.breathRateMult = 1.0;
            this.renderer.state.breathDepthMult = 1.0;
            this.renderer.state.breathIrregular = false;
            this.renderer.state.particleRateMult = 1.0;

            // Reset all glow and color effects to prevent accumulation
            this.renderer.state.glowPulse = 0;
            this.renderer.state.brightnessFlicker = 0;
            this.renderer.state.brightnessMult = 1.0;
            this.renderer.state.saturationMult = 1.0;
            this.renderer.state.hueShift = 0;
            return;
        }

        const modifier = this.renderer.undertoneModifiers[undertone];

        // Apply all modifiers directly
        this.renderer.state.sizeMultiplier = modifier.sizeMultiplier;
        this.renderer.state.jitterAmount = modifier.jitterAmount || 0;
        this.renderer.state.episodicFlutter = modifier.episodicFlutter || false;
        this.renderer.state.glowRadiusMult = modifier.glowRadiusMult;
        this.renderer.state.breathRateMult = modifier.breathRateMult;
        this.renderer.state.breathDepthMult = modifier.breathDepthMult;
        this.renderer.state.breathIrregular = modifier.breathIrregular || false;
        this.renderer.state.particleRateMult = 1.0;

        // Apply all glow and color effects
        this.renderer.state.glowPulse = modifier.glowPulse || 0;
        this.renderer.state.brightnessFlicker = modifier.brightnessFlicker || 0;
        this.renderer.state.brightnessMult = modifier.brightnessMult || 1.0;
        this.renderer.state.saturationMult = modifier.saturationMult || 1.0;
        this.renderer.state.hueShift = modifier.hueShift || 0;
    }

    /**
     * Update just the undertone without resetting emotion
     * @param {string|Object|null} undertone - Undertone name or weighted modifier object
     */
    updateUndertone(undertone) {
        // Clear glow cache when undertone changes (colors will change)
        if (this.renderer.state.undertone !== undertone && this.renderer.glowCache) {
            this.renderer.glowCache.clear();
        }

        // Store undertone for color processing
        this.renderer.state.undertone = undertone;
        this.renderer.currentUndertone = undertone;

        // Get weighted undertone modifier from state machine if available
        const weightedModifier =
            this.renderer.stateMachine && this.renderer.stateMachine.getWeightedUndertoneModifiers
                ? this.renderer.stateMachine.getWeightedUndertoneModifiers()
                : null;

        // Apply all undertone modifiers (visual, breathing only - no particles)
        this.applyUndertoneModifiers(weightedModifier || undertone);

        // Update colors with the new undertone
        if (this.renderer.state.emotion) {
            const emotionConfig =
                emotionCache && emotionCache.isInitialized
                    ? emotionCache.getEmotion(this.renderer.state.emotion)
                    : getEmotion(this.renderer.state.emotion);
            if (emotionConfig) {
                const baseColor = emotionConfig.glowColor || this.renderer.config.defaultGlowColor;
                const targetColor = this.renderer.applyUndertoneToColor(
                    baseColor,
                    weightedModifier || undertone
                );

                // Start color transition to new undertone color (faster for responsiveness)
                this.renderer.startColorTransition(targetColor, 200); // 200ms transition
            }
        }
    }

    /**
     * Set emotional state
     * @param {string} emotion - Emotion name (joy, sadness, anger, fear, zen, suspicion, etc.)
     * @param {Object} properties - Emotion properties (glowColor, glowIntensity, breathRate, eyeOpenness, etc.)
     * @param {string|Object|null} undertone - Optional undertone modifier
     */
    setEmotionalState(emotion, properties, undertone = null) {
        // Clear glow cache when emotion or undertone changes (colors will change)
        if (
            (this.renderer.state.emotion !== emotion ||
                this.renderer.state.undertone !== undertone) &&
            this.renderer.glowCache
        ) {
            this.renderer.glowCache.clear();
        }

        // Store undertone for color processing
        this.renderer.state.undertone = undertone;
        this.renderer.currentUndertone = undertone;

        // Get weighted undertone modifier from state machine if available
        const weightedModifier =
            this.renderer.stateMachine && this.renderer.stateMachine.getWeightedUndertoneModifiers
                ? this.renderer.stateMachine.getWeightedUndertoneModifiers()
                : null;

        // Apply all undertone modifiers (visual, breathing, particles)
        this.applyUndertoneModifiers(weightedModifier || undertone);

        // Get base color and apply undertone shifts
        const baseColor = properties.glowColor || this.renderer.config.defaultGlowColor;

        // Get target color - for suspicion, use the dynamic color directly
        let targetColor;
        if (emotion === 'suspicion') {
            // Use the dynamic color from properties (includes threat level)
            targetColor = properties.glowColor || baseColor;
        } else {
            targetColor = this.renderer.applyUndertoneToColor(
                baseColor,
                weightedModifier || undertone
            );
        }

        // Apply intensity modifier from undertone
        const modifier =
            weightedModifier || (undertone ? this.renderer.undertoneModifiers[undertone] : null);
        const baseIntensity = properties.glowIntensity || 1.0;

        // Get the glow multiplier - check for glowRadiusMult or use default of 1.0
        let glowMult = 1.0;
        if (modifier) {
            if (weightedModifier) {
                // For weighted modifiers, check if glowRadiusMult exists
                // Check for NaN in weight calculation
                const weight = modifier.weight || 0;
                if (
                    modifier.glowRadiusMult !== undefined &&
                    isFinite(modifier.glowRadiusMult) &&
                    isFinite(weight)
                ) {
                    glowMult = 1.0 + (modifier.glowRadiusMult - 1.0) * weight;
                } else {
                    glowMult = 1.0;
                }
            } else {
                // For non-weighted modifiers, use glowRadiusMult if it exists
                glowMult = modifier.glowRadiusMult !== undefined ? modifier.glowRadiusMult : 1.0;
            }
        }

        const targetIntensity = baseIntensity * glowMult;

        // Determine transition duration based on emotion
        let duration = 1500; // Default 1.5s
        if (emotion === 'anger' || emotion === 'fear') {
            duration = 800; // Quick transitions for urgent emotions
        } else if (emotion === 'sadness' || emotion === 'resting') {
            duration = 2000; // Slower for calming emotions
        } else if (emotion === 'zen') {
            duration = 2000; // Zen gets special timing during lotus bloom
        }

        // Update emotion state BEFORE handling transitions to avoid timing issues
        const previousEmotion = this.renderer.state.emotion;
        this.renderer.state.emotion = emotion;

        // Handle suspicion state
        if (emotion === 'suspicion') {
            this.renderer.state.isSuspicious = true;
            // Store target squint amount, we'll animate to it
            this.renderer.state.targetSquintAmount =
                properties && properties.coreSquint ? properties.coreSquint : 0.4;
            if (this.renderer.state.squintAmount === undefined) {
                this.renderer.state.squintAmount = 0; // Start from no squint
            }
            this.renderer.state.lastScanTime = Date.now();
            this.renderer.state.scanPhase = 0;
        } else {
            this.renderer.state.isSuspicious = false;
            this.renderer.state.targetSquintAmount = 0;
            if (this.renderer.state.squintAmount === undefined) {
                this.renderer.state.squintAmount = 0;
            }
        }

        // Handle zen state transitions specially
        if (emotion === 'zen' && previousEmotion !== 'zen') {
            // Entering zen - will handle its own color transition during lotus bloom
            this.renderer.enterZenMode(targetColor, targetIntensity);
        } else if (previousEmotion === 'zen' && emotion !== 'zen') {
            // Exiting zen - will handle its own color transition during lotus close
            this.renderer.exitZenMode(emotion, targetColor, targetIntensity);
        } else {
            // Standard color transition for all other state changes
            this.renderer.startColorTransition(targetColor, targetIntensity, duration);
        }

        // Apply breathing with undertone modifiers
        const baseBreathRate = properties.breathRate || 1.0;
        const baseBreathDepth = properties.breathDepth || this.renderer.config.breathingDepth;
        this.renderer.state.breathRate = modifier
            ? baseBreathRate * modifier.breathRateMult
            : baseBreathRate;
        this.renderer.state.breathDepth = modifier
            ? baseBreathDepth * modifier.breathDepthMult
            : baseBreathDepth;

        // Jitter combines emotion jitter with undertone jitter
        this.renderer.state.coreJitter =
            properties.coreJitter || (modifier && modifier.jitterAmount > 0);
        this.renderer.state.emotionEyeOpenness = properties.eyeOpenness;
        this.renderer.state.emotionEyeArc = properties.eyeArc;
    }
}
