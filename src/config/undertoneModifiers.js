/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝
 *                      ◐ ◑ ◒ ◓  UNDERTONE MODIFIERS  ◓ ◒ ◑ ◐
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Undertone Modifiers - Subtle Emotion Variations
 * @author Emotive Engine Team
 * @version 2.0.0
 * @module UndertoneModifiers
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Undertones add NUANCE to emotions - like being "nervously happy" or
 * ║ "confidently angry". These modifiers STACK on top of emotion modifiers
 * ║ to create more complex, realistic emotional expressions.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🎨 MULTIPLIER EFFECTS (Applied to Base Gesture)
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • speed        : Animation speed (0.5=half speed, 2.0=double speed)
 * │ • amplitude    : Movement size (0.5=smaller, 2.0=bigger)
 * │ • intensity    : Effect strength (0.5=subtle, 2.0=extreme)
 * │ • smoothness   : Animation smoothing (0.5=jerky, 1.5=very smooth)
 * │ • regularity   : Pattern consistency (0.5=chaotic, 1.0=regular)
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ ⚡ SPECIAL EFFECTS (Boolean Flags)
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • addFlutter      : Butterfly-like motion (nervous)
 * │ • addMicroShake   : Tiny trembling (nervous, tired)
 * │ • addPower        : Strong, decisive motion (confident)
 * │ • addDrag         : Sluggish, heavy motion (tired)
 * │ • addTension      : Tight, controlled motion (intense)
 * │ • addSoftness     : Gentle, flowing motion (subdued)
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ ❌ DO NOT ADD HERE (Belongs in Other Files)
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ ✗ Base gesture definitions   → use gestureConfig.js
 * │ ✗ Emotion modifiers         → use emotionModifiers.js
 * │ ✗ Visual properties         → use emotionMap.js
 * │ ✗ Particle behaviors        → use Particle.js
 * │ ✗ State logic              → use EmotiveStateMachine.js
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                           ADDING NEW UNDERTONES
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ 1. Create new undertone object with all base multipliers (default to 1.0)
 * ║ 2. Add special effect flags as needed (addXXX properties)
 * ║ 3. Test combinations with ALL emotions for unexpected interactions
 * ║ 4. Document the intended "feel" and use cases
 * ║ 5. Add to valid undertones in ErrorBoundary.js
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */

export const UNDERTONE_MODIFIERS = {
    // No undertone - neutral multipliers
    none: {
        speed: 1.0,
        amplitude: 1.0,
        intensity: 1.0,
        smoothness: 1.0,
        regularity: 1.0,
        '3d': {
            rotation: { speedMultiplier: 1.0, shakeMultiplier: 1.0 },
            glow: { intensityMultiplier: 1.0, pulseSpeedMultiplier: 1.0 },
            scale: { breathDepthMultiplier: 1.0, breathRateMultiplier: 1.0 },
            righting: { strengthMultiplier: 1.0 },
        },
    },

    // Clear undertone - no modification
    clear: {
        speed: 1.0,
        amplitude: 1.0,
        intensity: 1.0,
        smoothness: 1.0,
        regularity: 1.0,
        '3d': {
            rotation: { speedMultiplier: 1.0, shakeMultiplier: 1.0 },
            glow: { intensityMultiplier: 1.0, pulseSpeedMultiplier: 1.0 },
            scale: { breathDepthMultiplier: 1.0, breathRateMultiplier: 1.0 },
            righting: { strengthMultiplier: 1.0 },
        },
    },

    nervous: {
        speed: 1.2, // 20% faster
        amplitude: 0.9, // 10% smaller (contained)
        intensity: 1.1, // 10% more intense
        smoothness: 0.7, // 30% less smooth (fluttery)
        regularity: 0.6, // Irregular (butterflies)
        addFlutter: true, // Butterfly-like flutter
        addMicroShake: true, // Subtle tremor
        '3d': {
            rotation: {
                speedMultiplier: 1.5, // Noticeably faster rotation (anxious energy)
                shakeMultiplier: 3.5, // Very visible shake/wobble (nervous tremor)
                enableEpisodicWobble: true, // Random shake bursts (at least once per rotation)
            },
            glow: {
                intensityMultiplier: 1.25, // Brighter (heightened state)
                pulseSpeedMultiplier: 2.0, // Rapid pulsing (racing heartbeat)
            },
            scale: {
                breathDepthMultiplier: 0.5, // Very shallow rapid breaths
                breathRateMultiplier: 1.8, // Much faster breathing (panic)
            },
            righting: {
                strengthMultiplier: 0.7, // Less stable (nervous wobble)
            },
        },
    },

    confident: {
        speed: 0.9, // 10% slower (deliberate)
        amplitude: 1.3, // 30% bigger (bold)
        intensity: 1.2, // 20% more intense
        smoothness: 1.1, // 10% smoother (controlled)
        regularity: 1.2, // Very regular (assured)
        addPower: true, // Strong, decisive motion
        addHold: true, // Brief pause at peaks
        '3d': {
            rotation: {
                speedMultiplier: 0.7, // Much slower, commanding presence
                shakeMultiplier: 0.2, // Minimal shake (rock solid control)
            },
            glow: {
                intensityMultiplier: 1.4, // Noticeably brighter (bold presence)
                pulseSpeedMultiplier: 0.7, // Slow steady pulse (calm confidence)
            },
            scale: {
                breathDepthMultiplier: 1.5, // Deep powerful breaths
                breathRateMultiplier: 0.7, // Slow breathing (total control)
            },
            righting: {
                strengthMultiplier: 1.6, // Very stable (immovable)
            },
        },
    },

    tired: {
        speed: 0.7, // 30% slower
        amplitude: 0.7, // 30% smaller
        intensity: 0.8, // 20% less intense
        smoothness: 1.3, // 30% smoother (sluggish)
        regularity: 0.8, // Slightly irregular (drowsy)
        addDroop: true, // Downward tendency
        addPause: true, // Occasional hesitation
        '3d': {
            rotation: {
                speedMultiplier: 0.4, // Very slow rotation (lethargic)
                shakeMultiplier: 0.15, // Almost no shake (exhausted)
            },
            glow: {
                intensityMultiplier: 0.5, // Noticeably dimmer (low energy)
                pulseSpeedMultiplier: 0.5, // Very slow pulse (drowsy)
            },
            scale: {
                breathDepthMultiplier: 1.3, // Deep tired sighs
                breathRateMultiplier: 0.5, // Very slow breathing (sleepy)
            },
            righting: {
                strengthMultiplier: 0.6, // Unstable (drooping, sagging)
            },
        },
    },

    intense: {
        speed: 1.3, // 30% faster
        amplitude: 1.2, // 20% bigger
        intensity: 1.4, // 40% more intense
        smoothness: 0.6, // 40% less smooth (sharp)
        regularity: 0.9, // Slightly irregular
        addPulse: true, // Pulsing intensity
        addFocus: true, // Concentrated motion
        '3d': {
            rotation: {
                speedMultiplier: 1.6, // Noticeably faster rotation (heightened)
                shakeMultiplier: 2.5, // Strong shake (tension)
            },
            glow: {
                intensityMultiplier: 1.8, // Very bright (burning intensity)
                pulseSpeedMultiplier: 2.2, // Very rapid pulsing (racing)
            },
            scale: {
                breathDepthMultiplier: 1.6, // Deep intense breaths
                breathRateMultiplier: 1.8, // Rapid breathing (adrenaline)
            },
            righting: {
                strengthMultiplier: 1.3, // More stable (tense control)
            },
        },
    },

    subdued: {
        speed: 0.8, // 20% slower
        amplitude: 0.8, // 20% smaller
        intensity: 0.7, // 30% less intense
        smoothness: 1.2, // 20% smoother
        regularity: 1.1, // Regular (restrained)
        addSoftness: true, // Gentle, muted motion
        addFade: true, // Fading at edges
        '3d': {
            rotation: {
                speedMultiplier: 0.5, // Much slower rotation (gentle)
                shakeMultiplier: 0.1, // Almost no shake (serene)
            },
            glow: {
                intensityMultiplier: 0.55, // Noticeably dimmer (muted)
                pulseSpeedMultiplier: 0.6, // Slow pulse (peaceful)
            },
            scale: {
                breathDepthMultiplier: 0.7, // Shallow controlled breaths
                breathRateMultiplier: 0.6, // Slow breathing (restrained)
            },
            righting: {
                strengthMultiplier: 1.4, // Very stable (composed stillness)
            },
        },
    },
};

/**
 * Get undertone modifier
 * @param {string} undertone - Name of the undertone
 * @returns {Object} Modifier object with default values if undertone not found
 */
export function getUndertoneModifier(undertone) {
    if (!undertone || undertone === '' || undertone === 'clear') {
        return UNDERTONE_MODIFIERS.clear;
    }
    return UNDERTONE_MODIFIERS[undertone] || UNDERTONE_MODIFIERS.clear;
}
