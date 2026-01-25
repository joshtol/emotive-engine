/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Ice Effect Gesture Factory
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Factory for ice/frost effect gestures
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/iceEffectFactory
 *
 * ## Ice Effect Gestures
 *
 * Three categories of ice gestures:
 *
 * ### Afflicted (being frozen)
 * - Cold spreading across mascot
 * - Movement slowing, stiffening
 * - Mascot is FREEZING
 *
 * ### Emanating (radiating cold)
 * - Cold aura emanating outward
 * - Frost particles spreading
 * - Mascot is PROJECTING cold
 *
 * ### Transform (becoming ice)
 * - Crystallizing into solid ice
 * - Becoming frozen statue
 * - Mascot is TRANSFORMING to ice
 *
 * ## Variants
 *
 * | Gesture     | Category   | Effect                              |
 * |-------------|------------|-------------------------------------|
 * | freeze      | Afflicted  | Being frozen, movement slowing      |
 * | chill       | Afflicted  | Light frost effect, shivering       |
 * | frostbite   | Afflicted  | Deep cold damage, crackling ice     |
 * | crystallize | Transform  | Becoming pure crystal ice           |
 * | frost       | Emanating  | Light frost aura spreading          |
 * | glacial     | Transform  | Massive ice formation               |
 * | shatter     | Transform  | Ice breaking apart                  |
 * | thaw        | Afflicted  | Ice melting, releasing              |
 * | encase      | Transform  | Complete ice encasement             |
 */

// ═══════════════════════════════════════════════════════════════════════════════════════
// ICE EFFECT VARIANTS
// ═══════════════════════════════════════════════════════════════════════════════════════

const ICE_EFFECT_VARIANTS = {
    // ═══════════════════════════════════════════════════════════════════════════════════════
    // AFFLICTED VARIANTS - Mascot is being frozen
    // ═══════════════════════════════════════════════════════════════════════════════════════

    freeze: {
        name: 'iceFreeze',
        emoji: '🥶',
        type: 'blending',
        description: 'Being frozen solid, movement slowing to halt',
        duration: 3000,
        beats: 4,
        intensity: 1.0,
        category: 'afflicted',
        frost: 0.7,                    // High frost level
        // 3D Element spawning - ice crystals forming on mascot surface
        spawnMode: {
            type: 'surface',
            pattern: 'shell',           // Even coverage as ice spreads
            embedDepth: 0.2,            // Slightly embedded into surface
            cameraFacing: 0.4,          // Mostly normal-aligned, some camera bias
            clustering: 0.15,           // Slight clustering for organic spread
            scale: 1.0                  // Use φ-based model sizes
        },
        // Slowing effect
        slowRate: 0.5,
        jitterDecay: true,             // Movement jitters then stops
        // Glow - icy blue
        glowColor: [0.6, 0.85, 1.0],   // Ice blue
        glowIntensityMin: 0.5,
        glowIntensityMax: 0.8,
        glowFlickerRate: 2,            // Slow crystalline pulse
        // Scale - slight contraction from cold
        scaleVibration: 0.015,
        scaleFrequency: 3,
        scaleContract: 0.02,           // Contracts when freezing
        // Position - freezing in place with occasional tremor
        tremor: 0.008,
        tremorFrequency: 8,
        tremorDecay: 0.7,              // Tremor fades as frozen
        // Decay
        decayRate: 0.15
    },

    chill: {
        name: 'iceChill',
        emoji: '❄️',
        type: 'blending',
        description: 'Light frost, shivering from cold',
        duration: 2500,
        beats: 4,
        intensity: 0.5,
        category: 'afflicted',
        frost: 0.35,                   // Light frost
        // Shivering
        shiverAmount: 0.012,
        shiverFrequency: 12,
        // Glow - light blue
        glowColor: [0.7, 0.9, 1.0],    // Light ice blue
        glowIntensityMin: 0.7,
        glowIntensityMax: 0.9,
        glowFlickerRate: 4,
        // Scale - minimal effect
        scaleVibration: 0.008,
        scaleFrequency: 5,
        // Position - shivering motion
        tremor: 0.006,
        tremorFrequency: 10,
        // Decay
        decayRate: 0.2
    },

    frostbite: {
        name: 'iceFrostbite',
        emoji: '🧊',
        type: 'blending',
        description: 'Deep cold damage, ice crackling across surface',
        duration: 3500,
        beats: 5,
        intensity: 1.2,
        category: 'afflicted',
        frost: 0.85,                   // Severe frost
        // 3D Element spawning - ice spreading on surface in crackling patches
        spawnMode: {
            type: 'surface',
            pattern: 'scattered',       // Random patches of damage
            embedDepth: 0.15,           // Slight embed
            cameraFacing: 0.5,          // Balanced for visibility
            clustering: 0.4,            // Moderate clustering (damage patches)
            scale: 0.9                  // Slightly smaller frost patches
        },
        // Crackling effect
        crackleRate: 0.4,
        crackleSpread: true,
        // Glow - pale icy
        glowColor: [0.8, 0.92, 1.0],   // Pale ice
        glowIntensityMin: 0.55,
        glowIntensityMax: 0.85,
        glowFlickerRate: 6,            // Crackling rhythm
        // Scale - slight contraction
        scaleVibration: 0.02,
        scaleFrequency: 4,
        scaleContract: 0.03,
        // Position - stiff with occasional crack movement
        jitterAmount: 0.004,
        jitterFrequency: 15,           // Sharp, sudden
        // Rotation - slight tilt from stiffness
        rotationWobble: 0.015,
        rotationWobbleSpeed: 1.5,
        // Decay
        decayRate: 0.18
    },

    thaw: {
        name: 'iceThaw',
        emoji: '💧',
        type: 'blending',
        description: 'Ice melting, slowly releasing from frozen state',
        duration: 4000,
        beats: 6,
        intensity: 0.6,
        category: 'afflicted',
        frost: 0.4,                    // Diminishing frost
        frostDecay: true,              // Frost level decreases over time
        // Dripping effect
        dripRate: 0.3,
        // Glow - warming blue
        glowColor: [0.65, 0.85, 0.95], // Warmer blue
        glowIntensityMin: 0.6,
        glowIntensityMax: 0.85,
        glowFlickerRate: 2,
        // Scale - slight expansion as thawing
        scaleVibration: 0.01,
        scaleFrequency: 2,
        scaleExpand: 0.015,
        // Position - slight drooping from melting
        droopAmount: 0.008,
        droopAcceleration: 0.3,
        // Decay
        decayRate: 0.25
    },

    // ═══════════════════════════════════════════════════════════════════════════════════════
    // EMANATING VARIANTS - Mascot is projecting cold
    // ═══════════════════════════════════════════════════════════════════════════════════════

    frost: {
        name: 'iceFrost',
        emoji: '❆',
        type: 'blending',
        description: 'Frost aura spreading outward',
        duration: 2800,
        beats: 4,
        intensity: 0.7,
        category: 'emanating',
        frost: 0.5,                    // Medium frost
        // Spreading aura
        auraSpread: 0.4,
        auraSpeed: 1.2,
        // Glow - bright icy
        glowColor: [0.75, 0.95, 1.0],  // Bright ice
        glowIntensityMin: 0.7,
        glowIntensityMax: 1.0,
        glowFlickerRate: 3,
        // Scale - pulsing outward
        scaleVibration: 0.02,
        scaleFrequency: 3,
        scalePulse: true,
        // Position - centered emanation
        tremor: 0.003,
        tremorFrequency: 5,
        // Decay
        decayRate: 0.2
    },

    // ═══════════════════════════════════════════════════════════════════════════════════════
    // TRANSFORM VARIANTS - Mascot is becoming ice
    // ═══════════════════════════════════════════════════════════════════════════════════════

    crystallize: {
        name: 'iceCrystallize',
        emoji: '💎',
        type: 'blending',
        description: 'Becoming pure crystal ice, geometric transformation',
        duration: 3200,
        beats: 5,
        intensity: 1.3,
        category: 'transform',
        frost: 0.9,                    // High crystallization
        // Crystal formation
        crystalGrowth: 0.5,
        facetEffect: true,
        // 3D Element spawning - spiky crystals growing outward
        spawnMode: {
            type: 'surface',
            pattern: 'spikes',          // Crystalline spikes pointing outward
            embedDepth: 0.15,           // Less embed so spikes protrude
            cameraFacing: 0.5,          // Balanced camera facing
            clustering: 0.2,            // Light clustering
            count: 8,                   // Good number of crystals
            scale: 1.0                  // Use φ-based sizes
        },
        // Glow - prismatic ice
        glowColor: [0.85, 0.95, 1.0],  // Crystal white-blue
        glowIntensityMin: 0.6,
        glowIntensityMax: 1.0,
        glowFlickerRate: 5,            // Sparkling
        // Scale - crystalline growth
        scaleVibration: 0.025,
        scaleFrequency: 4,
        scaleGrow: 0.03,               // Slight expansion from crystallization
        // Rotation - slow faceted rotation
        rotationSpeed: 0.15,
        // Decay
        decayRate: 0.12
    },

    glacial: {
        name: 'iceGlacial',
        emoji: '🏔️',
        type: 'blending',
        description: 'Massive ice formation, ancient glacier power',
        duration: 4000,
        beats: 6,
        intensity: 1.5,
        category: 'transform',
        frost: 1.0,                    // Maximum frost
        // 3D Element spawning - massive glacier-like formations
        spawnMode: {
            type: 'surface',
            pattern: 'shell',           // Full coverage like glacier
            embedDepth: 0.25,           // Moderate embed
            cameraFacing: 0.3,          // Mostly natural
            clustering: 0.1,            // Even distribution
            count: 10,                  // Good coverage
            scale: 1.0                  // Use φ-based sizes (ice models already smaller)
        },
        // Massive buildup
        buildupRate: 0.3,
        massiveScale: true,
        // Glow - deep glacier blue
        glowColor: [0.5, 0.8, 0.95],   // Glacier blue
        glowIntensityMin: 0.5,
        glowIntensityMax: 0.9,
        glowFlickerRate: 1.5,          // Slow, massive pulses
        // Scale - significant growth
        scaleVibration: 0.03,
        scaleFrequency: 2,
        scaleGrow: 0.08,               // Grows larger
        // Position - rooted, stable
        tremor: 0.002,
        tremorFrequency: 2,
        // Decay
        decayRate: 0.1
    },

    shatter: {
        name: 'iceShatter',
        emoji: '💥',
        type: 'blending',
        description: 'Ice breaking apart, fragments flying',
        duration: 1800,
        beats: 3,
        intensity: 1.8,
        category: 'transform',
        frost: 0.6,                    // Ice present to shatter
        // Shatter effect
        shatterPoint: 0.4,             // When shatter happens
        fragmentSpread: 0.6,
        // 3D Element spawning - shards flying outward
        spawnMode: 'burst',
        // Glow - flash then dim
        glowColor: [0.9, 0.98, 1.0],   // Bright white flash
        glowIntensityMin: 0.4,
        glowIntensityMax: 1.5,         // Bright flash
        glowFlickerRate: 15,           // Rapid
        // Scale - expand then contract
        scaleVibration: 0.05,
        scaleFrequency: 8,
        // Position - explosive scatter
        explosionForce: 0.03,
        // Rotation - chaotic
        rotationSpeed: 0.8,
        rotationWobble: 0.1,
        rotationWobbleSpeed: 8,
        // Decay
        decayRate: 0.08
    },

    encase: {
        name: 'iceEncase',
        emoji: '🪨',
        type: 'blending',
        description: 'Complete ice encasement, frozen solid',
        duration: 3500,
        beats: 5,
        intensity: 1.4,
        category: 'transform',
        frost: 0.95,                   // Near-complete frost
        // 3D Element spawning - complete ice shell around mascot
        spawnMode: {
            type: 'surface',
            pattern: 'shell',           // Full encasement coverage
            embedDepth: 0.3,            // Moderate embed for encased look
            cameraFacing: 0.3,          // Mostly surface-aligned
            clustering: 0.0,            // Very even distribution
            count: 12,                  // Dense coverage
            scale: 1.0                  // Use φ-based sizes
        },
        // Encasement spreading
        encaseProgress: 0.8,
        encaseFromEdges: true,
        // Glow - solid ice
        glowColor: [0.7, 0.9, 1.0],    // Solid ice blue
        glowIntensityMin: 0.55,
        glowIntensityMax: 0.85,
        glowFlickerRate: 2,
        // Scale - slight compression
        scaleVibration: 0.012,
        scaleFrequency: 2,
        scaleContract: 0.025,
        // Position - frozen still
        tremor: 0.001,                 // Almost none
        tremorFrequency: 1,
        tremorDecay: 0.9,              // Rapid decay to stillness
        // Decay
        decayRate: 0.15
    }
};

// ═══════════════════════════════════════════════════════════════════════════════════════
// PSEUDO-RANDOM HASH FOR DETERMINISTIC ANIMATION
// ═══════════════════════════════════════════════════════════════════════════════════════

function hash(n) {
    return ((Math.sin(n) * 43758.5453) % 1 + 1) % 1;
}

function noise1D(x) {
    const i = Math.floor(x);
    const f = x - i;
    const u = f * f * (3 - 2 * f);
    return hash(i) * (1 - u) + hash(i + 1) * u;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// GESTURE FACTORY
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Create an ice effect gesture
 * @param {string} variant - Variant name from ICE_EFFECT_VARIANTS
 * @returns {Object} Gesture configuration
 */
export function createIceEffectGesture(variant) {
    const config = ICE_EFFECT_VARIANTS[variant];
    if (!config) {
        console.warn(`[ICE_EFFECT] Unknown variant: ${variant}, using freeze`);
        return createIceEffectGesture('freeze');
    }

    return {
        name: config.name,
        emoji: config.emoji,
        type: config.type,
        description: config.description,

        config: {
            duration: config.duration,
            beats: config.beats,
            intensity: config.intensity,
            ...config
        },

        rhythm: {
            enabled: true,
            syncMode: 'beat',

            amplitudeSync: {
                onBeat: config.category === 'transform' ? 1.4 : 1.2,
                offBeat: 1.0,
                curve: 'smooth'
            }
        },

        /**
         * 3D core transformation for ice effect
         */
        '3d': {
            evaluate(progress, motion) {
                const cfg = { ...config, ...motion };
                const time = progress * cfg.duration / 1000;
                const { category } = cfg;

                // ═══════════════════════════════════════════════════════════════
                // EFFECT STRENGTH
                // ═══════════════════════════════════════════════════════════════
                let effectStrength = 1.0;

                // Afflicted: gradual buildup
                if (category === 'afflicted') {
                    if (progress < 0.2) {
                        effectStrength = progress / 0.2;
                    }
                    // Thaw decreases over time
                    if (cfg.frostDecay) {
                        effectStrength *= (1 - progress * 0.6);
                    }
                }

                // Emanating: pulse outward
                if (category === 'emanating') {
                    const pulse = Math.sin(time * Math.PI * 2) * 0.2 + 0.8;
                    effectStrength *= pulse;
                }

                // Transform: accelerating or shatter timing
                if (category === 'transform') {
                    if (cfg.shatterPoint && progress > cfg.shatterPoint) {
                        // Post-shatter rapid decay
                        effectStrength = 1 - ((progress - cfg.shatterPoint) / (1 - cfg.shatterPoint));
                    } else {
                        effectStrength = Math.min(1, progress / 0.3);
                    }
                }

                // Decay in final phase
                if (progress > (1 - cfg.decayRate)) {
                    const decayProgress = (progress - (1 - cfg.decayRate)) / cfg.decayRate;
                    effectStrength *= (1 - decayProgress);
                }

                // ═══════════════════════════════════════════════════════════════
                // FROST LEVEL - Determines overlay intensity
                // ═══════════════════════════════════════════════════════════════
                let frostLevel = cfg.frost;
                if (cfg.frostDecay) {
                    frostLevel *= (1 - progress * 0.7);
                }

                // ═══════════════════════════════════════════════════════════════
                // POSITION - Tremor, shiver, explosion
                // ═══════════════════════════════════════════════════════════════
                let posX = 0, posY = 0, posZ = 0;

                // Tremor (freezing in place)
                if (cfg.tremor > 0) {
                    let tremorStrength = cfg.tremor;
                    if (cfg.tremorDecay) {
                        tremorStrength *= (1 - progress * cfg.tremorDecay);
                    }
                    const tremorTime = time * cfg.tremorFrequency;
                    posX += (noise1D(tremorTime) - 0.5) * tremorStrength * effectStrength;
                    posY += (noise1D(tremorTime + 50) - 0.5) * tremorStrength * effectStrength * 0.5;
                    posZ += (noise1D(tremorTime + 100) - 0.5) * tremorStrength * effectStrength * 0.3;
                }

                // Shivering (chill)
                if (cfg.shiverAmount > 0) {
                    const shiverTime = time * cfg.shiverFrequency;
                    posX += Math.sin(shiverTime * Math.PI * 2) * cfg.shiverAmount * effectStrength;
                    posY += Math.cos(shiverTime * Math.PI * 3.1) * cfg.shiverAmount * 0.5 * effectStrength;
                }

                // Jitter (frostbite cracking)
                if (cfg.jitterAmount > 0) {
                    const jitterTime = time * cfg.jitterFrequency;
                    if (hash(Math.floor(jitterTime)) > 0.7) {
                        posX += (hash(jitterTime) - 0.5) * cfg.jitterAmount * effectStrength;
                        posY += (hash(jitterTime + 10) - 0.5) * cfg.jitterAmount * 0.5 * effectStrength;
                    }
                }

                // Droop (thaw melting)
                if (cfg.droopAmount > 0) {
                    const droopProgress = progress * (1 + cfg.droopAcceleration * progress);
                    posY -= cfg.droopAmount * droopProgress * effectStrength;
                }

                // Explosion (shatter)
                if (cfg.explosionForce > 0 && cfg.shatterPoint && progress > cfg.shatterPoint) {
                    const explodeProgress = (progress - cfg.shatterPoint) / (1 - cfg.shatterPoint);
                    const explodeStrength = cfg.explosionForce * explodeProgress;
                    posX += (noise1D(time * 20) - 0.5) * explodeStrength;
                    posY += (noise1D(time * 20 + 33) - 0.5) * explodeStrength;
                    posZ += (noise1D(time * 20 + 66) - 0.5) * explodeStrength;
                }

                // ═══════════════════════════════════════════════════════════════
                // SCALE - Contraction, expansion, crystalline growth
                // ═══════════════════════════════════════════════════════════════
                let scale = 1.0;
                const scaleTime = time * cfg.scaleFrequency;

                // Base vibration
                if (cfg.scalePulse) {
                    const breathe = Math.sin(scaleTime * Math.PI * 2) * 0.5 + 0.5;
                    scale = 1.0 + (breathe - 0.5) * cfg.scaleVibration * effectStrength;
                } else {
                    const scaleNoise = Math.sin(scaleTime * Math.PI * 2) * 0.6 +
                                      Math.sin(scaleTime * Math.PI * 2.7) * 0.4;
                    scale = 1.0 + scaleNoise * cfg.scaleVibration * effectStrength;
                }

                // Contraction (freezing)
                if (cfg.scaleContract > 0) {
                    scale -= cfg.scaleContract * progress * effectStrength;
                }

                // Expansion (thaw, crystalline growth)
                if (cfg.scaleExpand > 0) {
                    scale += cfg.scaleExpand * progress * effectStrength;
                }
                if (cfg.scaleGrow > 0) {
                    scale += cfg.scaleGrow * progress * effectStrength;
                }

                // Shatter: rapid scale changes
                if (cfg.shatterPoint && progress > cfg.shatterPoint) {
                    scale += (noise1D(time * 15) - 0.5) * 0.1;
                }

                scale = Math.max(0.1, scale);

                // ═══════════════════════════════════════════════════════════════
                // ROTATION - Crystalline, shatter chaos
                // ═══════════════════════════════════════════════════════════════
                let rotX = 0, rotY = 0, rotZ = 0;

                // Slow rotation (crystallize)
                if (cfg.rotationSpeed > 0) {
                    rotY = time * cfg.rotationSpeed * Math.PI * 2 * effectStrength;
                }

                // Wobble (frostbite, shatter)
                if (cfg.rotationWobble > 0) {
                    const wobbleTime = time * cfg.rotationWobbleSpeed;
                    rotX = Math.sin(wobbleTime * Math.PI * 2) * cfg.rotationWobble * effectStrength;
                    rotZ = Math.sin(wobbleTime * Math.PI * 1.7 + 0.5) * cfg.rotationWobble * 0.7 * effectStrength;
                }

                // ═══════════════════════════════════════════════════════════════
                // GLOW - Icy blue emanation
                // ═══════════════════════════════════════════════════════════════
                const flickerTime = time * cfg.glowFlickerRate;
                let flickerValue;

                if (cfg.shatterPoint && progress > cfg.shatterPoint) {
                    // Shatter: bright flash
                    flickerValue = 1.0 + (hash(flickerTime * 5) * 0.5);
                } else {
                    flickerValue = Math.sin(flickerTime * Math.PI * 2) * 0.3 + 0.7;
                }

                const glowIntensity = cfg.glowIntensityMin +
                    (cfg.glowIntensityMax - cfg.glowIntensityMin) * flickerValue * effectStrength;

                // Ice glow boost - cold blue shimmer
                const glowBoost = 0.15 * effectStrength * cfg.intensity * frostLevel;

                // ═══════════════════════════════════════════════════════════════
                // RETURN TRANSFORMATION
                // ═══════════════════════════════════════════════════════════════
                return {
                    iceOverlay: {
                        enabled: effectStrength > 0.1,
                        strength: effectStrength * cfg.intensity,
                        frost: frostLevel,
                        category: cfg.category,
                        spawnMode: cfg.spawnMode || null,  // 'orbit' | 'impact' | 'burst' | null
                        time
                    },
                    position: [posX, posY, posZ],
                    rotation: [rotX, rotY, rotZ],
                    scale,
                    glowIntensity,
                    glowBoost,
                    glowColorOverride: cfg.glowColor
                };
            }
        }
    };
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// PRE-BUILT GESTURES
// ═══════════════════════════════════════════════════════════════════════════════════════

// Afflicted variants (being frozen)
export const freeze = createIceEffectGesture('freeze');
export const chill = createIceEffectGesture('chill');
export const frostbite = createIceEffectGesture('frostbite');
export const thaw = createIceEffectGesture('thaw');

// Emanating variants (projecting cold)
export const frost = createIceEffectGesture('frost');

// Transform variants (becoming ice)
export const crystallize = createIceEffectGesture('crystallize');
export const glacial = createIceEffectGesture('glacial');
export const shatter = createIceEffectGesture('shatter');
export const encase = createIceEffectGesture('encase');

export {
    ICE_EFFECT_VARIANTS
};

export default {
    // Afflicted
    freeze,
    chill,
    frostbite,
    thaw,
    // Emanating
    frost,
    // Transform
    crystallize,
    glacial,
    shatter,
    encase,
    // Factory
    createIceEffectGesture,
    ICE_EFFECT_VARIANTS
};
