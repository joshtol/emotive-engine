/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Electric Effect Gesture Factory
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Factory for electric effect gestures
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/electricEffectFactory
 *
 * ## Electric Effect Gestures
 *
 * Two categories of electric gestures:
 *
 * ### Electrocution (being shocked)
 * - Rapid position jitter
 * - Violent shaking
 * - Mascot is VICTIM of electricity
 *
 * ### Powered (emanating energy)
 * - Gentle scale pulsing
 * - Controlled motion
 * - Mascot is SOURCE of electricity
 *
 * ## Variants
 *
 * | Gesture            | Category    | Effect                              |
 * |--------------------|-------------|-------------------------------------|
 * | shock              | Electrocute | Brief electric surge, jittery       |
 * | overload           | Electrocute | Intense buildup, extreme vibration  |
 * | glitch             | Electrocute | Digital corruption, displacement    |
 * | crackle            | Powered     | Ambient energy, gentle pulse        |
 * | chargeUp           | Powered     | Building power, growing intensity   |
 * | electricAuraEffect | Powered     | Emanating field, slow rotation      |
 * | staticDischarge    | Powered     | Low-level ambient, subtle sparks    |
 */

// ═══════════════════════════════════════════════════════════════════════════════════════
// ELECTRIC EFFECT VARIANTS
// ═══════════════════════════════════════════════════════════════════════════════════════

const ELECTRIC_EFFECT_VARIANTS = {
    shock: {
        name: 'shock',
        emoji: '⚡',
        type: 'blending',
        description: 'Brief electric surge - mascot is shocked',
        duration: 1200,
        beats: 2,
        intensity: 1.0,
        category: 'electrocute',
        // 3D Element spawning - arcs jumping across surface
        spawnMode: {
            type: 'surface',
            pattern: 'scattered',       // Random arc placements
            embedDepth: 0.1,
            cameraFacing: 0.4,
            clustering: 0.35,
            count: 6,
            scale: 1.0,
            models: ['arc-small', 'spark-node', 'arc-medium'],
            minDistance: 0.12,
            // Ephemeral: lightning arcs flash in, hold briefly, fade out, respawn elsewhere
            ephemeral: {
                lifetime: { min: 100, max: 300 },   // Very brief arcs
                flashIn: 30,                         // Snap in quickly
                fadeOut: 80,                         // Fade out slightly slower
                respawn: true                        // Keep crackling
            },
            // ═══════════════════════════════════════════════════════════════
            // NEW ANIMATION SYSTEM - Complements ephemeral
            // ═══════════════════════════════════════════════════════════════
            animation: {
                appearAt: 0.02,
                disappearAt: 0.95,
                stagger: 0.01,
                enter: {
                    type: 'flash',      // Instant electrical appearance
                    duration: 0.01,
                    easing: 'linear'
                },
                exit: {
                    type: 'flash',      // Instant disappearance
                    duration: 0.02,
                    easing: 'linear'
                },
                // Chaotic electric animation
                flicker: {
                    intensity: 0.5,     // Very intense flicker
                    rate: 30,           // Extremely fast
                    pattern: 'random'
                },
                emissive: {
                    min: 1.0,
                    max: 3.0,
                    frequency: 25,
                    pattern: 'random',
                    dutyCycle: 0.6
                },
                rotate: {
                    axis: [1, 1, 0],    // Diagonal axis for chaotic feel
                    speed: 0.5,
                    oscillate: true,
                    range: Math.PI / 3
                },
                // Very high variance - electricity is chaotic
                scaleVariance: 0.4,
                lifetimeVariance: 0.5,
                delayVariance: 0.2,
                blending: 'additive',
                renderOrder: 15,
                intensityScaling: {
                    scale: 1.3,
                    flickerIntensity: 1.5,
                    emissiveMax: 1.8
                }
            }
        },
        // Jitter parameters
        jitterFrequency: 60,        // Hz - very rapid
        jitterAmplitude: 0.015,     // Position displacement
        jitterDecay: 0.3,           // Decay over time
        // Glow parameters
        glowColor: [0.3, 0.9, 1.0], // Cyan
        glowIntensityMin: 0.8,
        glowIntensityMax: 2.5,
        glowFlickerRate: 25,        // Hz
        // Scale vibration
        scaleVibration: 0.03,
        scaleFrequency: 40
    },
    overload: {
        name: 'overload',
        emoji: '💥',
        type: 'blending',
        description: 'Intense charge buildup, extreme shock',
        duration: 2500,
        beats: 4,
        intensity: 2.0,
        category: 'electrocute',
        // 3D Element spawning - BUILD UP to overload
        spawnMode: {
            type: 'surface',
            pattern: 'shell',           // Full coverage
            embedDepth: 0.1,
            cameraFacing: 0.35,
            clustering: 0.2,
            count: 12,
            scale: 1.1,
            models: ['arc-small', 'arc-medium', 'arc-cluster', 'spark-node'],
            minDistance: 0.1,
            // Ephemeral: BUILDUP - starts small/fast, grows to big/slow/intense
            ephemeral: {
                lifetime: { min: 80, max: 150 },    // Starting: brief sparks
                flashIn: 15,                         // Starting: instant
                fadeOut: 40,                         // Starting: quick
                respawn: true,
                stagger: 30,                         // Stagger initial spawn
                // Progression: evolve timing over 2500ms gesture duration
                progression: {
                    duration: 2500,
                    // lifetime: [startMin, startMax, endMin, endMax]
                    lifetime: [80, 150, 300, 600],  // Grows from brief to sustained
                    // flashIn: [start, end]
                    flashIn: [15, 40],               // Flash gets more deliberate
                    // fadeOut: [start, end]
                    fadeOut: [40, 150],              // Fade gets more dramatic
                    // respawnDelay: [startMin, startMax, endMin, endMax]
                    respawnDelay: [0, 30, 0, 0]      // Less delay as it intensifies
                }
            }
        },
        // Jitter parameters - more extreme
        jitterFrequency: 80,
        jitterAmplitude: 0.03,
        jitterDecay: 0.1,           // Stays intense longer
        // Glow parameters - brighter, more dramatic
        glowColor: [0.5, 0.95, 1.0], // Bright cyan-white
        glowIntensityMin: 1.0,
        glowIntensityMax: 4.0,
        glowFlickerRate: 35,
        // Scale vibration - more intense
        scaleVibration: 0.05,
        scaleFrequency: 50,
        // Buildup phase
        buildupPhase: 0.3,          // First 30% is buildup
        buildupGlowRamp: true
    },
    glitch: {
        name: 'glitch',
        emoji: '📺',
        type: 'blending',
        description: 'Digital corruption, static displacement',
        duration: 1800,
        beats: 3,
        intensity: 0.7,
        category: 'electrocute',
        // 3D Element spawning - VERY FEW erratic glitch sparks
        spawnMode: {
            type: 'surface',
            pattern: 'scattered',       // Glitchy random placement
            embedDepth: 0.15,
            cameraFacing: 0.5,
            clustering: 0.4,
            count: 2,                   // Very few - just 2 glitchy sparks
            scale: 0.7,                 // Smaller for glitch feel
            models: ['spark-node'],     // Just sparks, no arcs
            minDistance: 0.25,
            // Ephemeral: ERRATIC - very short, random gaps between
            ephemeral: {
                lifetime: { min: 25, max: 80 },     // Extremely brief glitch flash
                flashIn: 8,                          // Instant pop-in
                fadeOut: 15,                         // Instant pop-out
                respawn: true,
                // Random delay between glitches for erratic rhythm
                respawnDelay: { min: 80, max: 400 }
            }
        },
        // Jitter parameters - irregular, digital
        jitterFrequency: 20,        // Slower but bigger jumps
        jitterAmplitude: 0.04,
        jitterDecay: 0.5,
        // Glow parameters - flickering static
        glowColor: [0.4, 0.8, 1.0], // Blue-cyan
        glowIntensityMin: 0.5,
        glowIntensityMax: 2.0,
        glowFlickerRate: 15,
        // Scale vibration - asymmetric
        scaleVibration: 0.04,
        scaleFrequency: 12,
        // Glitch-specific
        holdFrames: true,           // Freeze in random positions
        holdProbability: 0.15,      // Chance to freeze per frame
        holdDuration: 0.05          // How long to freeze (seconds)
    },

    // ═══════════════════════════════════════════════════════════════════════════════════════
    // POWERED VARIANTS - Mascot is SOURCE of energy, not victim
    // ═══════════════════════════════════════════════════════════════════════════════════════

    crackle: {
        name: 'crackle',
        emoji: '✨',
        type: 'blending',
        description: 'Ambient electrical energy crackling across surface',
        duration: 2000,
        beats: 3,
        intensity: 0.8,
        category: 'powered',
        // 3D Element spawning - WHIP CRACK + aftershock
        spawnMode: {
            type: 'surface',
            pattern: 'spikes',          // Dramatic outward arcs
            embedDepth: 0.08,
            cameraFacing: 0.5,
            clustering: 0.3,
            count: 2,                   // Just 2: main crack + aftershock
            scale: 1.3,                 // BIG dramatic arc
            models: ['arc-medium', 'arc-cluster'],  // Larger arc models
            minDistance: 0.2,
            // Ephemeral: WHIP CRACK - ONE dramatic flash + aftershock, then done
            ephemeral: {
                lifetime: { min: 250, max: 400 },   // Visible crack duration
                flashIn: 15,                         // Snap in fast
                fadeOut: 150,                        // Dramatic fade
                respawn: false,                      // NO respawn - just 1-2 cracks total
                initialDelay: 333,                   // Wait half a beat before crack
                stagger: 100                         // Aftershock delayed behind main crack
            },
            animation: {
                appearAt: 0.15,         // Delayed whip crack
                disappearAt: 0.85,
                stagger: 0.05,
                enter: {
                    type: 'pop',        // Dramatic crack appearance
                    duration: 0.015,
                    easing: 'elasticOut',
                    overshoot: 1.3
                },
                exit: {
                    type: 'fade',
                    duration: 0.15,
                    easing: 'easeOutCubic'
                },
                // Controlled power crackle
                pulse: {
                    amplitude: 0.15,
                    frequency: 4,
                    easing: 'snap',     // Sharp pulse
                    sync: 'global'
                },
                emissive: {
                    min: 0.8,
                    max: 2.5,
                    frequency: 6,
                    pattern: 'sine'
                },
                scaleVariance: 0.2,
                lifetimeVariance: 0.15,
                blending: 'additive',
                renderOrder: 12,
                intensityScaling: {
                    scale: 1.25,
                    emissiveMax: 1.5
                }
            }
        },
        // NO jitter - controlled energy
        jitterFrequency: 0,
        jitterAmplitude: 0,
        jitterDecay: 0.2,
        // Glow - pulsing with energy
        glowColor: [0.4, 0.9, 1.0], // Cyan
        glowIntensityMin: 1.0,
        glowIntensityMax: 1.8,
        glowFlickerRate: 8,         // Slower, more rhythmic
        // Scale breathing - gentle grow/shrink
        scaleVibration: 0.02,
        scaleFrequency: 2,          // Slow breathing
        // Powered-specific
        scalePulse: true,           // Smooth sine pulse instead of vibration
        rotationDrift: 0.01         // Very subtle slow rotation
    },

    charge: {
        name: 'chargeUp',
        emoji: '🔋',
        type: 'blending',
        description: 'Building up electrical power, growing intensity',
        duration: 2500,
        beats: 4,
        intensity: 1.2,
        category: 'powered',
        // 3D Element spawning - CHARGING UP: small/fast → big/slow
        spawnMode: {
            type: 'surface',
            pattern: 'crown',           // Energy gathering upward
            embedDepth: 0.1,
            cameraFacing: 0.4,
            clustering: 0.3,
            count: 6,
            scale: 1.0,
            models: ['spark-node', 'arc-small', 'arc-medium'],
            minDistance: 0.12,
            // Ephemeral: CHARGE UP - starts small/fast, becomes big/slow/sustained
            ephemeral: {
                lifetime: { min: 50, max: 100 },    // Starting: quick sparks
                flashIn: 12,                         // Starting: instant
                fadeOut: 30,                         // Starting: quick
                respawn: true,
                stagger: 50,                         // Spread out initial sparks
                // Progression: arcs get slower and more sustained as power builds
                progression: {
                    duration: 2500,
                    // lifetime: [startMin, startMax, endMin, endMax]
                    lifetime: [50, 100, 400, 700],   // Brief sparks → sustained arcs
                    // flashIn: [start, end]
                    flashIn: [12, 60],                // Quick snap → deliberate appearance
                    // fadeOut: [start, end]
                    fadeOut: [30, 200],               // Quick → slow dramatic fade
                    // respawnDelay: [startMin, startMax, endMin, endMax]
                    respawnDelay: [0, 20, 100, 250]   // Frequent sparks → deliberate pulses
                }
            },
            animation: {
                appearAt: 0.05,
                disappearAt: 0.92,
                stagger: 0.03,
                enter: {
                    type: 'grow',       // Power building up
                    duration: 0.04,
                    easing: 'easeOutQuad'
                },
                exit: {
                    type: 'flash',
                    duration: 0.02,
                    easing: 'linear'
                },
                // Power ramping animation
                pulse: {
                    amplitude: 0.18,
                    frequency: 3,       // Builds with charge
                    easing: 'easeInOut',
                    sync: 'global'
                },
                emissive: {
                    min: 0.6,
                    max: 2.8,           // High peak at full charge
                    frequency: 4,
                    pattern: 'sine'
                },
                drift: {
                    direction: 'up',    // Energy gathers upward
                    speed: 0.025,
                    noise: 0.15
                },
                rotate: {
                    axis: 'y',
                    speed: 0.08,
                    oscillate: false
                },
                scaleVariance: 0.25,
                lifetimeVariance: 0.2,
                blending: 'additive',
                renderOrder: 12,
                intensityScaling: {
                    scale: 1.35,
                    emissiveMax: 1.6,
                    driftSpeed: 1.3
                }
            }
        },
        // Minimal jitter - just slight tremble at peak
        jitterFrequency: 30,
        jitterAmplitude: 0.005,     // Very subtle
        jitterDecay: 0.2,
        // Glow - ramping up
        glowColor: [0.3, 0.95, 1.0], // Bright cyan
        glowIntensityMin: 0.8,
        glowIntensityMax: 3.0,
        glowFlickerRate: 12,
        // Scale - growing with power
        scaleVibration: 0.01,
        scaleFrequency: 3,
        // Charge-specific
        scalePulse: true,
        scaleGrowth: 0.08,          // Grows 8% larger during charge
        rampUp: true,               // Intensity ramps up over duration
        riseAmount: 0.02            // Slight upward drift
    },

    aura: {
        name: 'electricAuraEffect',
        emoji: '💫',
        type: 'blending',
        description: 'Emanating energy field, radiating power',
        duration: 3000,
        beats: 4,
        intensity: 1.0,
        category: 'powered',
        // 3D Element spawning - AURA: slow roaming + fast traveling
        spawnMode: {
            type: 'surface',
            pattern: 'shell',           // Full coverage aura
            embedDepth: 0.1,
            cameraFacing: 0.3,
            clustering: 0.1,
            count: 10,                  // More elements for layered effect
            scale: 1.0,
            models: ['arc-cluster', 'arc-medium', 'arc-small', 'spark-node'],
            minDistance: 0.08,
            // Ephemeral: MIX of slow roaming (longer) and fast traveling (shorter)
            // Wide variance creates natural two-speed population
            ephemeral: {
                lifetime: { min: 100, max: 700 },   // Wide range: some fast, some slow
                flashIn: 35,                         // Medium appearance
                fadeOut: 120,                        // Graceful fade
                respawn: true,
                stagger: 100,                        // Wave-like staggered starts
                // Slower respawn for lazy roaming feel
                respawnDelay: { min: 50, max: 200 }
            },
            animation: {
                appearAt: 0.08,
                disappearAt: 0.88,
                stagger: 0.04,
                enter: {
                    type: 'fade',       // Graceful aura appearance
                    duration: 0.08,
                    easing: 'easeOutQuad'
                },
                exit: {
                    type: 'fade',
                    duration: 0.12,
                    easing: 'easeIn'
                },
                // Sustained electric aura
                pulse: {
                    amplitude: 0.12,
                    frequency: 2,
                    easing: 'easeInOut',
                    sync: 'global'
                },
                flicker: {
                    intensity: 0.15,    // Subtle background flicker
                    rate: 8,
                    pattern: 'sine'
                },
                emissive: {
                    min: 0.9,
                    max: 1.8,
                    frequency: 2.5,
                    pattern: 'sine'
                },
                drift: {
                    direction: 'outward',
                    speed: 0.012,
                    noise: 0.1
                },
                rotate: {
                    axis: 'y',
                    speed: 0.025,
                    oscillate: false
                },
                scaleVariance: 0.2,
                lifetimeVariance: 0.25,
                blending: 'additive',
                renderOrder: 10,
                intensityScaling: {
                    scale: 1.2,
                    emissiveMax: 1.4
                }
            }
        },
        // No jitter
        jitterFrequency: 0,
        jitterAmplitude: 0,
        jitterDecay: 0.3,
        // Glow - strong sustained
        glowColor: [0.5, 0.85, 1.0], // Soft cyan
        glowIntensityMin: 1.2,
        glowIntensityMax: 2.0,
        glowFlickerRate: 4,         // Very slow pulse
        // Scale - subtle breathing
        scaleVibration: 0.015,
        scaleFrequency: 1.5,
        // Aura-specific
        scalePulse: true,
        rotationDrift: 0.02,        // Slow majestic rotation
        hover: true,                // Slight float effect
        hoverAmount: 0.01
    },

    static: {
        name: 'staticDischarge',
        emoji: '⚡',
        type: 'blending',
        description: 'Low-level static electricity, ambient sparks',
        duration: 1500,
        beats: 2,
        intensity: 0.4,
        category: 'powered',
        // 3D Element spawning - OCCASIONAL static discharge pops
        spawnMode: {
            type: 'surface',
            pattern: 'scattered',       // Random sparse sparks
            embedDepth: 0.15,
            cameraFacing: 0.35,
            clustering: 0.3,
            count: 2,                   // Just 2 - occasional pops
            scale: 0.6,                 // Small static sparks
            models: ['spark-node'],
            minDistance: 0.3,
            // Ephemeral: OCCASIONAL - brief pop then long wait
            ephemeral: {
                lifetime: { min: 40, max: 100 },    // Very brief pop
                flashIn: 10,                         // Instant snap
                fadeOut: 30,                         // Quick fade
                respawn: true,
                stagger: 200,                        // Spread out initial pops
                // Long gaps between discharges - feels like occasional static
                respawnDelay: { min: 250, max: 600 }
            }
        },
        // Very minimal jitter - occasional twitch
        jitterFrequency: 5,
        jitterAmplitude: 0.002,
        jitterDecay: 0.4,
        // Glow - subtle
        glowColor: [0.5, 0.8, 1.0], // Pale cyan
        glowIntensityMin: 0.9,
        glowIntensityMax: 1.3,
        glowFlickerRate: 20,        // Quick subtle flickers
        // Scale - barely perceptible
        scaleVibration: 0.005,
        scaleFrequency: 8,
        // Static-specific
        scalePulse: false,
        sparkBursts: true,          // Occasional spark intensity spikes
        sparkProbability: 0.1
    }
};

// ═══════════════════════════════════════════════════════════════════════════════════════
// PSEUDO-RANDOM HASH FOR DETERMINISTIC JITTER
// ═══════════════════════════════════════════════════════════════════════════════════════

function hash(n) {
    return ((Math.sin(n * 127.1 + n * 311.7) * 43758.5453) % 1 + 1) % 1;
}

function noise1D(x) {
    const i = Math.floor(x);
    const f = x - i;
    const smooth = f * f * (3 - 2 * f);
    return hash(i) * (1 - smooth) + hash(i + 1) * smooth;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// ELECTRIC EFFECT GESTURE FACTORY
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Create an electric effect gesture (no shatter, just electrocution visuals)
 *
 * @param {string} variant - 'shock', 'overload', or 'glitch'
 * @returns {Object} Gesture configuration
 */
export function createElectricEffectGesture(variant) {
    const config = ELECTRIC_EFFECT_VARIANTS[variant];
    if (!config) {
        console.warn(`Unknown electric effect variant: ${variant}`);
        return null;
    }

    return {
        name: config.name,
        emoji: config.emoji,
        type: config.type,
        description: config.description,

        config: {
            duration: config.duration,
            ...config
        },

        rhythm: {
            enabled: true,
            syncMode: 'beat',
            amplitudeSync: {
                onBeat: 1.5,
                offBeat: 1.0,
                curve: 'sharp'
            }
        },

        /**
         * 3D core transformation for electric effect
         * Handles both electrocution (jittery) and powered (controlled) variants
         */
        '3d': {
            evaluate(progress, motion) {
                const cfg = { ...config, ...motion };
                const time = progress * cfg.duration / 1000; // Convert to seconds
                const isPowered = cfg.category === 'powered';

                // ═══════════════════════════════════════════════════════════════
                // PHASE CALCULATION
                // ═══════════════════════════════════════════════════════════════
                let effectStrength = 1.0;

                // Buildup phase for overload
                if (cfg.buildupPhase && progress < cfg.buildupPhase) {
                    effectStrength = progress / cfg.buildupPhase;
                    if (cfg.buildupGlowRamp) {
                        effectStrength = Math.pow(effectStrength, 0.5);
                    }
                }

                // Ramp up for charge variant
                if (cfg.rampUp) {
                    effectStrength = Math.pow(progress, 0.7); // Gradual increase
                }

                // Decay in final phase
                if (progress > (1 - cfg.jitterDecay)) {
                    const decayProgress = (progress - (1 - cfg.jitterDecay)) / cfg.jitterDecay;
                    effectStrength *= (1 - decayProgress);
                }

                // ═══════════════════════════════════════════════════════════════
                // POSITION - Jitter (electrocution) or controlled (powered)
                // ═══════════════════════════════════════════════════════════════
                let posX = 0, posY = 0, posZ = 0;

                if (cfg.jitterAmplitude > 0) {
                    const jitterTime = time * cfg.jitterFrequency;

                    // Glitch mode: occasional frame holds
                    let holdMultiplier = 1.0;
                    if (cfg.holdFrames) {
                        const holdCheck = hash(Math.floor(jitterTime * 3));
                        if (holdCheck < cfg.holdProbability) {
                            holdMultiplier = 0.1;
                        }
                    }

                    // Multi-frequency noise for organic jitter
                    posX = (
                        noise1D(jitterTime) - 0.5 +
                        (noise1D(jitterTime * 2.3 + 50) - 0.5) * 0.5 +
                        (noise1D(jitterTime * 4.7 + 100) - 0.5) * 0.25
                    ) * cfg.jitterAmplitude * effectStrength * holdMultiplier;

                    posY = (
                        noise1D(jitterTime + 33) - 0.5 +
                        (noise1D(jitterTime * 2.1 + 83) - 0.5) * 0.5 +
                        (noise1D(jitterTime * 5.3 + 133) - 0.5) * 0.25
                    ) * cfg.jitterAmplitude * effectStrength * holdMultiplier;

                    posZ = (
                        noise1D(jitterTime + 66) - 0.5 +
                        (noise1D(jitterTime * 1.9 + 116) - 0.5) * 0.5 +
                        (noise1D(jitterTime * 3.7 + 166) - 0.5) * 0.25
                    ) * cfg.jitterAmplitude * effectStrength * holdMultiplier * 0.5;
                }

                // Powered: hover/rise effect
                if (cfg.hover && cfg.hoverAmount) {
                    posY += Math.sin(time * Math.PI * 0.5) * cfg.hoverAmount * effectStrength;
                }
                if (cfg.riseAmount) {
                    posY += cfg.riseAmount * effectStrength;
                }

                // ═══════════════════════════════════════════════════════════════
                // ROTATION - Jitter (electrocution) or drift (powered)
                // ═══════════════════════════════════════════════════════════════
                let rotX = 0, rotY = 0, rotZ = 0;

                if (!isPowered && cfg.jitterAmplitude > 0) {
                    // Electrocution: rotational shake
                    const jitterTime = time * cfg.jitterFrequency;
                    const rotJitterAmt = cfg.jitterAmplitude * 2;
                    rotX = (noise1D(jitterTime * 1.3 + 200) - 0.5) * rotJitterAmt * effectStrength;
                    rotY = (noise1D(jitterTime * 1.7 + 250) - 0.5) * rotJitterAmt * effectStrength;
                    rotZ = (noise1D(jitterTime * 2.1 + 300) - 0.5) * rotJitterAmt * effectStrength * 0.5;
                } else if (cfg.rotationDrift) {
                    // Powered: slow majestic rotation
                    rotY = time * cfg.rotationDrift * effectStrength;
                }

                // ═══════════════════════════════════════════════════════════════
                // SCALE - Vibration (electrocution) or breathing pulse (powered)
                // ═══════════════════════════════════════════════════════════════
                let scale = 1.0;
                const scaleTime = time * cfg.scaleFrequency;

                if (cfg.scalePulse) {
                    // Powered: smooth sine breathing
                    const breathe = Math.sin(scaleTime * Math.PI * 2) * 0.5 + 0.5; // 0-1
                    scale = 1.0 + breathe * cfg.scaleVibration * effectStrength;

                    // Growth during charge
                    if (cfg.scaleGrowth) {
                        scale += cfg.scaleGrowth * effectStrength;
                    }
                } else {
                    // Electrocution: rapid vibration
                    const scaleNoise = Math.sin(scaleTime * Math.PI * 2) * 0.5 +
                                      Math.sin(scaleTime * Math.PI * 3.7) * 0.3;
                    scale = 1.0 + scaleNoise * cfg.scaleVibration * effectStrength;
                }

                // ═══════════════════════════════════════════════════════════════
                // GLOW - Flickering (electrocution) or pulsing (powered)
                // ═══════════════════════════════════════════════════════════════
                const flickerTime = time * cfg.glowFlickerRate;
                let flickerValue;

                if (isPowered) {
                    // Powered: smooth pulsing glow
                    flickerValue = Math.sin(flickerTime * Math.PI * 2) * 0.3 + 0.7;

                    // Spark bursts for static variant
                    if (cfg.sparkBursts && hash(Math.floor(time * 10)) < cfg.sparkProbability) {
                        flickerValue = 1.0;
                    }
                } else {
                    // Electrocution: erratic flickering
                    const flicker1 = Math.sin(flickerTime * Math.PI * 2);
                    const flicker2 = Math.sin(flickerTime * Math.PI * 5.3 + 1.7);
                    const flicker3 = hash(Math.floor(flickerTime * 2)) > 0.7 ? 1 : 0;
                    flickerValue = (flicker1 * 0.4 + flicker2 * 0.3 + flicker3 * 0.5 + 0.5);
                }

                const glowIntensity = cfg.glowIntensityMin +
                    (cfg.glowIntensityMax - cfg.glowIntensityMin) * flickerValue * effectStrength;

                const glowBoost = (flickerValue * 0.8 + 0.2) * effectStrength * cfg.intensity;

                // ═══════════════════════════════════════════════════════════════
                // RETURN TRANSFORMATION
                // ═══════════════════════════════════════════════════════════════
                return {
                    position: [posX, posY, posZ],
                    rotation: [rotX, rotY, rotZ],
                    scale,
                    glowIntensity,
                    glowBoost,
                    glowColorOverride: cfg.glowColor,
                    electricOverlay: {
                        enabled: effectStrength > 0.1,
                        strength: effectStrength * cfg.intensity,
                        charge: effectStrength * cfg.intensity,
                        category: cfg.category,
                        spawnMode: cfg.spawnMode || null,
                        time
                    }
                };
            }
        }
    };
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// NEW FACTORY: buildElectricEffectGesture(config) — Matches fire/water/ice pattern
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Build an electric effect gesture from a full config object.
 * This is the modern pattern matching fire/water/ice.
 *
 * @param {Object} config - Full gesture configuration
 * @returns {Object} Gesture configuration
 */
export function buildElectricEffectGesture(config) {
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
                onBeat: 1.5,
                offBeat: 1.0,
                curve: config.category === 'powered' ? 'smooth' : 'sharp'
            }
        },

        '3d': {
            evaluate(progress, motion) {
                const cfg = { ...config, ...motion };
                const time = progress * cfg.duration / 1000;
                const isPowered = cfg.category === 'powered';

                // ═══════════════════════════════════════════════════════════════
                // PHASE CALCULATION
                // ═══════════════════════════════════════════════════════════════
                let effectStrength = 1.0;

                if (cfg.buildupPhase && progress < cfg.buildupPhase) {
                    effectStrength = progress / cfg.buildupPhase;
                    if (cfg.buildupGlowRamp) {
                        effectStrength = Math.pow(effectStrength, 0.5);
                    }
                }

                if (cfg.rampUp) {
                    effectStrength = Math.pow(progress, 0.7);
                }

                if (progress > (1 - cfg.jitterDecay)) {
                    const decayProgress = (progress - (1 - cfg.jitterDecay)) / cfg.jitterDecay;
                    effectStrength *= (1 - decayProgress);
                }

                // ═══════════════════════════════════════════════════════════════
                // POSITION - Jitter (electrocution) or controlled (powered)
                // ═══════════════════════════════════════════════════════════════
                let posX = 0, posY = 0, posZ = 0;

                if (cfg.jitterAmplitude > 0) {
                    const jitterTime = time * cfg.jitterFrequency;

                    let holdMultiplier = 1.0;
                    if (cfg.holdFrames) {
                        const holdCheck = hash(Math.floor(jitterTime * 3));
                        if (holdCheck < cfg.holdProbability) {
                            holdMultiplier = 0.1;
                        }
                    }

                    posX = (
                        noise1D(jitterTime) - 0.5 +
                        (noise1D(jitterTime * 2.3 + 50) - 0.5) * 0.5 +
                        (noise1D(jitterTime * 4.7 + 100) - 0.5) * 0.25
                    ) * cfg.jitterAmplitude * effectStrength * holdMultiplier;

                    posY = (
                        noise1D(jitterTime + 33) - 0.5 +
                        (noise1D(jitterTime * 2.1 + 83) - 0.5) * 0.5 +
                        (noise1D(jitterTime * 5.3 + 133) - 0.5) * 0.25
                    ) * cfg.jitterAmplitude * effectStrength * holdMultiplier;

                    posZ = (
                        noise1D(jitterTime + 66) - 0.5 +
                        (noise1D(jitterTime * 1.9 + 116) - 0.5) * 0.5 +
                        (noise1D(jitterTime * 3.7 + 166) - 0.5) * 0.25
                    ) * cfg.jitterAmplitude * effectStrength * holdMultiplier * 0.5;
                }

                if (cfg.hover && cfg.hoverAmount) {
                    posY += Math.sin(time * Math.PI * 0.5) * cfg.hoverAmount * effectStrength;
                }
                if (cfg.riseAmount) {
                    posY += cfg.riseAmount * effectStrength;
                }

                // ═══════════════════════════════════════════════════════════════
                // ROTATION
                // ═══════════════════════════════════════════════════════════════
                let rotX = 0, rotY = 0, rotZ = 0;

                if (!isPowered && cfg.jitterAmplitude > 0) {
                    const jitterTime = time * cfg.jitterFrequency;
                    const rotJitterAmt = cfg.jitterAmplitude * 2;
                    rotX = (noise1D(jitterTime * 1.3 + 200) - 0.5) * rotJitterAmt * effectStrength;
                    rotY = (noise1D(jitterTime * 1.7 + 250) - 0.5) * rotJitterAmt * effectStrength;
                    rotZ = (noise1D(jitterTime * 2.1 + 300) - 0.5) * rotJitterAmt * effectStrength * 0.5;
                } else if (cfg.rotationDrift) {
                    rotY = time * cfg.rotationDrift * effectStrength;
                }

                // ═══════════════════════════════════════════════════════════════
                // SCALE
                // ═══════════════════════════════════════════════════════════════
                let scale = 1.0;
                const scaleTime = time * cfg.scaleFrequency;

                if (cfg.scalePulse) {
                    const breathe = Math.sin(scaleTime * Math.PI * 2) * 0.5 + 0.5;
                    scale = 1.0 + breathe * cfg.scaleVibration * effectStrength;
                    if (cfg.scaleGrowth) {
                        scale += cfg.scaleGrowth * effectStrength;
                    }
                } else {
                    const scaleNoise = Math.sin(scaleTime * Math.PI * 2) * 0.5 +
                                      Math.sin(scaleTime * Math.PI * 3.7) * 0.3;
                    scale = 1.0 + scaleNoise * cfg.scaleVibration * effectStrength;
                }

                // ═══════════════════════════════════════════════════════════════
                // GLOW
                // ═══════════════════════════════════════════════════════════════
                const flickerTime = time * cfg.glowFlickerRate;
                let flickerValue;

                if (isPowered) {
                    flickerValue = Math.sin(flickerTime * Math.PI * 2) * 0.3 + 0.7;
                    if (cfg.sparkBursts && hash(Math.floor(time * 10)) < cfg.sparkProbability) {
                        flickerValue = 1.0;
                    }
                } else {
                    const flicker1 = Math.sin(flickerTime * Math.PI * 2);
                    const flicker2 = Math.sin(flickerTime * Math.PI * 5.3 + 1.7);
                    const flicker3 = hash(Math.floor(flickerTime * 2)) > 0.7 ? 1 : 0;
                    flickerValue = (flicker1 * 0.4 + flicker2 * 0.3 + flicker3 * 0.5 + 0.5);
                }

                const glowIntensity = cfg.glowIntensityMin +
                    (cfg.glowIntensityMax - cfg.glowIntensityMin) * flickerValue * effectStrength;
                const glowBoost = (flickerValue * 0.8 + 0.2) * effectStrength * cfg.intensity;

                // ═══════════════════════════════════════════════════════════════
                // RETURN — with new instanced spawner fields
                // ═══════════════════════════════════════════════════════════════
                return {
                    position: [posX, posY, posZ],
                    rotation: [rotX, rotY, rotZ],
                    scale,
                    glowIntensity,
                    glowBoost,
                    glowColorOverride: cfg.glowColor,
                    electricOverlay: {
                        enabled: effectStrength > 0.1,
                        strength: effectStrength * cfg.intensity,
                        charge: effectStrength * cfg.intensity,
                        category: cfg.category,
                        spawnMode: cfg.spawnMode || null,
                        duration: cfg.duration,
                        progress,
                        time,
                        // Pass animation config to ElementSpawner
                        animation: config.spawnMode?.animation,
                        models: config.spawnMode?.models,
                        count: config.spawnMode?.count,
                        scale: config.spawnMode?.scale,
                        embedDepth: config.spawnMode?.embedDepth
                    }
                };
            }
        }
    };
}

// Individual electric gestures are in their own files (electricshock.js, electriccrown.js, etc.)
// and import buildElectricEffectGesture from this file. They are aggregated in gestures/index.js.

export { ELECTRIC_EFFECT_VARIANTS };
