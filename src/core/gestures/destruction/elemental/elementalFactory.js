/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Elemental Gesture Factory
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Factory for elemental gestures using the elemental material system
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/elementalFactory
 *
 * ## Elemental Gestures
 *
 * These gestures transform the mascot into elemental forms before shattering.
 * Each element has unique visual materials and physics behaviors.
 *
 * ## Elements & Master Parameters
 *
 * | Element  | Parameter   | Range Description              |
 * |----------|-------------|--------------------------------|
 * | fire     | temperature | 0=embers, 0.5=fire, 1=plasma   |
 * | water    | viscosity   | 0=mercury, 0.3=water, 1=jello  |
 * | smoke    | density     | 0=steam, 0.5=smoke, 1=heavy    |
 * | ice      | melt        | 0=frozen, 0.5=melting, 1=slush |
 * | electric | charge      | 0=static, 0.5=arcs, 1=lightning|
 * | void     | depth       | 0=wispy, 0.5=dark, 1=black hole|
 *
 * ## Gesture Categories
 *
 * **Water:** splash, drip, ripple
 * **Smoke:** smokebomb, vanish, materialize
 * **Fire:** ignite, phoenix, ember
 * **Ice:** freeze, shatterIce, thaw
 * **Electric:** shock, overload, glitch
 * **Void:** consume, corrupt, singularity
 */

// ═══════════════════════════════════════════════════════════════════════════════════════
// WATER GESTURES
// ═══════════════════════════════════════════════════════════════════════════════════════

const WATER_VARIANTS = {};

// ═══════════════════════════════════════════════════════════════════════════════════════
// SMOKE GESTURES
// ═══════════════════════════════════════════════════════════════════════════════════════

const SMOKE_VARIANTS = {};

// ═══════════════════════════════════════════════════════════════════════════════════════
// FIRE GESTURES
// ═══════════════════════════════════════════════════════════════════════════════════════

const FIRE_VARIANTS = {
    // NOTE: phoenix moved to fireEffectFactory.js (ring-based effect)
};

// ═══════════════════════════════════════════════════════════════════════════════════════
// ICE GESTURES
// ═══════════════════════════════════════════════════════════════════════════════════════

const ICE_VARIANTS = {};

// ═══════════════════════════════════════════════════════════════════════════════════════
// ELECTRIC GESTURES
// ═══════════════════════════════════════════════════════════════════════════════════════

const ELECTRIC_VARIANTS = {};

// ═══════════════════════════════════════════════════════════════════════════════════════
// VOID GESTURES
// ═══════════════════════════════════════════════════════════════════════════════════════

const VOID_VARIANTS = {};

// ═══════════════════════════════════════════════════════════════════════════════════════
// FACTORY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * All elemental variants combined
 */
const ALL_ELEMENTAL_VARIANTS = {
    // Water
    ...WATER_VARIANTS,
    // Smoke
    ...SMOKE_VARIANTS,
    // Fire
    ...FIRE_VARIANTS,
    // Ice
    ...ICE_VARIANTS,
    // Electric
    ...ELECTRIC_VARIANTS,
    // Void
    ...VOID_VARIANTS
};

/**
 * Create an elemental gesture
 * @param {string} variant - Variant name (e.g., 'splash', 'ignite', 'singularity')
 * @returns {Object} Gesture definition
 */
export function createElementalGesture(variant) {
    const config = ALL_ELEMENTAL_VARIANTS[variant];
    if (!config) {
        console.warn(`ElementalFactory: Unknown variant '${variant}'`);
        return null;
    }

    return {
        name: config.name,
        emoji: config.emoji,
        type: 'override',
        description: config.description,
        usesShatter: true, // Marks gestures that use the ShatterSystem

        config: {
            duration: config.duration,
            musicalDuration: { musical: true, beats: config.beats },
            intensity: config.intensity,
            variant,
            elemental: config.elemental,
            elementalParam: config.elementalParam
        },

        rhythm: {
            enabled: true,
            syncMode: 'beat',
            durationSync: { mode: 'beats', beats: config.beats },
            timingSync: 'onBeat',
            accentResponse: {
                enabled: true,
                multiplier: 1.3
            }
        },

        '3d': {
            evaluate(progress, motion) {
                const cfg = motion.config || this.config || {};
                const intensity = cfg.intensity || 1.0;

                // Track triggers
                let shatterTrigger = false;
                let reassembleTrigger = false;
                let glowIntensity = 1.0;
                let glowBoost = 0;
                let scale = 1.0;

                // Timing
                const triggerAt = config.shatterTriggerAt !== undefined ? config.shatterTriggerAt : 0.1;
                const hasReassembly = config.reassemble;
                const reassembleAt = config.reassembleAt || 0.5;

                // ═══════════════════════════════════════════════════════════════
                // ELEMENTAL-SPECIFIC PRE-EFFECTS
                // ═══════════════════════════════════════════════════════════════

                // Water wobble effect
                if (config.useWobble && progress < triggerAt) {
                    const wobbleT = progress / triggerAt;
                    const wobble = Math.sin(wobbleT * Math.PI * 6) * 0.03 * wobbleT;
                    scale = 1.0 + wobble;
                }

                // Electric charge buildup
                if (config.chargeBuildup && progress < triggerAt) {
                    const chargeT = progress / triggerAt;
                    const flicker = Math.sin(progress * 100) * 0.2 * chargeT;
                    glowIntensity = 1.0 + chargeT * 1.5 + flicker;
                    glowBoost = chargeT * 0.8;
                }

                // Fire glow pulse
                if (config.glowPulse) {
                    const pulse = Math.sin(progress * Math.PI * 4) * 0.2;
                    glowIntensity += pulse;
                }

                // Void corruption spread visual
                if (config.corruptSpread && progress < triggerAt) {
                    const spreadT = progress / triggerAt;
                    glowIntensity = 1.0 - spreadT * 0.3; // Darken
                    glowBoost = -spreadT * 0.2; // Negative glow (absorb)
                }

                // Ice pre-freeze visual
                if (config.preFreezePhase && progress < triggerAt) {
                    const freezeT = progress / triggerAt;
                    glowIntensity = 1.0 + freezeT * 0.3;
                    glowBoost = freezeT * 0.4; // Icy glow
                }

                // ═══════════════════════════════════════════════════════════════
                // PHASE 1: BUILD-UP (0 to triggerAt)
                // ═══════════════════════════════════════════════════════════════
                if (progress < triggerAt) {
                    if (triggerAt > 0) {
                        const t = progress / triggerAt;
                        const eased = t * t;

                        // Base glow (modified by elemental effects above)
                        if (!config.chargeBuildup && !config.corruptSpread) {
                            glowIntensity = 1.0 + eased * 0.6;
                            glowBoost = eased * 0.3;
                        }

                        if (!config.useWobble) {
                            scale = 1.0 + eased * 0.03;
                        }
                    }
                }
                // ═══════════════════════════════════════════════════════════════
                // PHASE 2: TRIGGER
                // ═══════════════════════════════════════════════════════════════
                else if (progress < triggerAt + 0.02) {
                    shatterTrigger = progress >= triggerAt && progress < triggerAt + 0.005;

                    // Elemental-specific trigger flash
                    if (config.elemental === 'void') {
                        glowIntensity = 0.5; // Void absorbs light
                        glowBoost = -0.3;
                    } else if (config.elemental === 'electric') {
                        glowIntensity = 2.5; // Bright flash
                        glowBoost = 1.0;
                    } else {
                        glowIntensity = 1.8;
                        glowBoost = 0.5;
                    }
                    scale = 1.03;
                }
                // ═══════════════════════════════════════════════════════════════
                // PHASE 3: AFTERMATH / REASSEMBLY
                // ═══════════════════════════════════════════════════════════════
                else {
                    // Check for reassembly trigger
                    if (hasReassembly && progress >= reassembleAt && progress < reassembleAt + 0.02) {
                        reassembleTrigger = true;
                    }

                    // Glow during reassembly
                    if (hasReassembly && progress >= reassembleAt) {
                        const reassemblyProgress = (progress - reassembleAt) / (1 - reassembleAt);
                        const eased = reassemblyProgress * reassemblyProgress;
                        glowIntensity = 1.0 + eased * 0.8;
                        glowBoost = eased * 0.5;

                        if (progress > 0.95) {
                            glowIntensity = 2.0;
                            glowBoost = 0.8;
                        }
                    } else {
                        // Fade out
                        const t = (progress - triggerAt - 0.02) / (hasReassembly ? (reassembleAt - triggerAt - 0.02) : (1 - triggerAt - 0.02));
                        const clampedT = Math.min(1, Math.max(0, t));
                        const eased = 1 - (1 - clampedT) * (1 - clampedT);

                        glowIntensity = 1.8 - eased * 0.8;
                        glowBoost = 0.5 - eased * 0.5;
                    }
                    scale = 1.0;
                }

                // ═══════════════════════════════════════════════════════════════
                // DEBUG LOGGING - Elemental Gesture Evaluation
                // ═══════════════════════════════════════════════════════════════
                if (shatterTrigger) {
                    console.log(`[ELEMENTAL_GESTURE] 🎯 ${variant} TRIGGER`, {
                        variant,
                        elemental: config.elemental,
                        elementalParam: config.elementalParam,
                        overlay: config.overlay,
                        overlayParam: config.overlayParam,
                        progress: progress.toFixed(3),
                        fullConfig: config
                    });
                }

                return {
                    scale,
                    glowIntensity,
                    glowBoost,

                    // Shatter channel
                    shatter: {
                        enabled: shatterTrigger,
                        impactPoint: config.impactPoint,
                        impactDirection: config.impactDirection,
                        intensity: intensity * config.intensity,
                        variant,
                        // Elemental material system
                        elemental: config.elemental,
                        elementalParam: config.elementalParam,
                        overlay: config.overlay,
                        overlayParam: config.overlayParam,
                        // Reassembly
                        reassemble: reassembleTrigger,
                        reassembleDuration: config.reassembleDuration || 1000,
                        // Soul reveal
                        revealSoul: config.revealSoul !== false,
                        // Suspend/freeze modes
                        isSuspendMode: config.isSuspendMode || false,
                        suspendAt: config.suspendAt || 0.15,
                        suspendDuration: config.suspendDuration || 0.2,
                        isFreezeMode: config.isFreezeMode || false,
                        // Physics
                        gravity: config.gravity,
                        explosionForce: config.explosionForce,
                        rotationForce: config.rotationForce,
                        gestureDuration: config.duration,
                        // Dual-mode
                        isDualMode: config.isDualMode || false,
                        dualModeType: config.dualModeType,
                        dualModeConfig: {
                            duration: config.dualModeDuration || 2000,
                            impactPoint: config.impactPoint,
                            reassemble: config.reassemble,
                            reassembleDuration: config.reassembleDuration
                        }
                    }
                };
            }
        }
    };
}

/**
 * Create all gestures for a specific element
 * @param {string} element - 'water', 'smoke', 'fire', 'ice', 'electric', 'void'
 * @returns {Object[]} Array of gesture definitions
 */
export function createElementGestures(element) {
    const variantMaps = {
        water: WATER_VARIANTS,
        smoke: SMOKE_VARIANTS,
        fire: FIRE_VARIANTS,
        ice: ICE_VARIANTS,
        electric: ELECTRIC_VARIANTS,
        void: VOID_VARIANTS
    };

    const variants = variantMaps[element];
    if (!variants) {
        console.warn(`ElementalFactory: Unknown element '${element}'`);
        return [];
    }

    return Object.keys(variants).map(v => createElementalGesture(v));
}

/**
 * Create all elemental gestures
 * @returns {Object[]} Array of all gesture definitions
 */
export function createAllElementalGestures() {
    return Object.keys(ALL_ELEMENTAL_VARIANTS).map(v => createElementalGesture(v));
}

/**
 * Get all available elemental variant names
 * @returns {string[]}
 */
export function getElementalVariants() {
    return Object.keys(ALL_ELEMENTAL_VARIANTS);
}

/**
 * Get variants by element
 * @param {string} element
 * @returns {string[]}
 */
export function getVariantsByElement(element) {
    const variantMaps = {
        water: WATER_VARIANTS,
        smoke: SMOKE_VARIANTS,
        fire: FIRE_VARIANTS,
        ice: ICE_VARIANTS,
        electric: ELECTRIC_VARIANTS,
        void: VOID_VARIANTS
    };

    const variants = variantMaps[element];
    return variants ? Object.keys(variants) : [];
}

// Export individual variant configs for direct access
export {
    WATER_VARIANTS,
    SMOKE_VARIANTS,
    FIRE_VARIANTS,
    ICE_VARIANTS,
    ELECTRIC_VARIANTS,
    VOID_VARIANTS,
    ALL_ELEMENTAL_VARIANTS
};

export default createElementalGesture;
