/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Fire Effect Gesture Factory
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Factory for fire effect gestures
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/fireEffectFactory
 *
 * ## Fire Effect Gestures
 *
 * Two categories of fire gestures:
 *
 * ### Burning (being heated/on fire)
 * - Flames licking across surface
 * - Intense heat effects
 * - Mascot is VICTIM of fire
 *
 * ### Radiating (emanating heat/fire)
 * - Controlled fire aura
 * - Heat wave emanation
 * - Mascot is SOURCE of fire
 *
 * ## Variants
 *
 * | Gesture  | Category  | Effect                              |
 * |----------|-----------|-------------------------------------|
 * | burn     | Burning   | Flames flickering across surface    |
 * | scorch   | Burning   | Intense heat, darkening effect      |
 * | combust  | Burning   | Building pressure, flame burst      |
 * | radiate  | Radiating | Emitting heat waves, warm glow      |
 * | blaze    | Radiating | Powerful fire aura, torch-like      |
 * | smolder  | Radiating | Low simmer, faint ember glow        |
 */

// ═══════════════════════════════════════════════════════════════════════════════════════
// FIRE EFFECT VARIANTS
// ═══════════════════════════════════════════════════════════════════════════════════════

const FIRE_EFFECT_VARIANTS = {
    // ═══════════════════════════════════════════════════════════════════════════════════════
    // BURNING VARIANTS - Mascot is being heated/on fire
    // ═══════════════════════════════════════════════════════════════════════════════════════

    burn: {
        name: 'burn',
        emoji: '🔥',
        type: 'blending',
        description: 'Flames flickering across surface, being consumed',
        duration: 2500,
        beats: 4,
        intensity: 1.0,
        category: 'burning',
        temperature: 0.6,              // Active flame temperature
        // 3D Element spawning - flames rising from surface
        spawnMode: {
            type: 'surface',
            pattern: 'scattered',       // Flames scattered across surface
            embedDepth: 0.15,
            cameraFacing: 0.3,
            clustering: 0.25,           // Some clustering for flame groups
            count: 8,
            scale: 1.0,
            models: ['flame-wisp', 'ember-cluster', 'flame-tongue'],
            minDistance: 0.12,          // Flames can be fairly close
            // ═══════════════════════════════════════════════════════════════
            // NEW ANIMATION SYSTEM CONFIG
            // ═══════════════════════════════════════════════════════════════
            animation: {
                // Timing - staggered flame appearance
                appearAt: 0.05,
                disappearAt: 0.85,
                stagger: 0.03,          // Staggered ignition
                // Enter - flames ignite with flash
                enter: {
                    type: 'fade',       // Smooth fade in for procedural fire
                    duration: 0.08,
                    easing: 'easeOut'
                },
                // Exit - flames die down
                exit: {
                    type: 'fade',
                    duration: 0.15,
                    easing: 'easeIn'
                },
                // Procedural shader config (universal for all procedural elements)
                procedural: {
                    scaleSmoothing: 0.08,    // Smooth scale lerping to avoid jitter
                    geometryStability: true  // Use fadeProgress for stable vertex displacement
                },
                // Parameter animation: animate shader uniforms over gesture lifetime
                parameterAnimation: {
                    temperature: {
                        start: 0.4,         // Cool ignition
                        peak: 0.65,         // Hot active flames
                        end: 0.35,          // Dying embers
                        curve: 'bell'       // Gradual rise and fall
                    }
                },
                // Hold - flickering fire animation
                flicker: {
                    intensity: 0.35,    // Strong flicker
                    rate: 12,           // Fast fire flicker
                    pattern: 'random'
                },
                pulse: {
                    amplitude: 0.15,
                    frequency: 8,       // Fast pulsing
                    easing: 'easeInOut'
                },
                emissive: {
                    min: 0.8,
                    max: 2.0,
                    frequency: 10,
                    pattern: 'sine'
                },
                drift: {
                    direction: 'up',    // Flames rise
                    distance: 0.1,      // Total drift over gesture lifetime (musical timing)
                    noise: 0.02         // Subtle variation
                },
                // Variance - chaotic fire
                scaleVariance: 0.35,
                lifetimeVariance: 0.3,
                delayVariance: 0.1,
                // Rendering
                blending: 'additive',
                renderOrder: 10,
                // Intensity scaling
                intensityScaling: {
                    scale: 1.3,
                    pulseAmplitude: 1.5,
                    flickerIntensity: 1.4,
                    emissiveMax: 1.6
                },
                // Model-specific behavior overrides (Phase 11)
                modelOverrides: {
                    'ember-cluster': {
                        scaling: { mode: 'uniform-pulse', amplitude: 0.2, frequency: 4 },
                        drift: { direction: 'rising', speed: 0.025, noise: 0.25, buoyancy: true },
                        opacityLink: 'flicker'
                    },
                    'flame-wisp': {
                        scaling: {
                            mode: 'non-uniform',
                            axes: {
                                x: { expand: false, rate: 0.7 },
                                y: { expand: true, rate: 1.6 },
                                z: { expand: false, rate: 0.7 }
                            }
                        },
                        drift: { direction: 'rising', speed: 0.03, noise: 0.15, buoyancy: true },
                        orientationOverride: 'rising'
                    },
                    'flame-tongue': {
                        scaling: {
                            mode: 'non-uniform',
                            axes: {
                                x: { expand: false, rate: 0.8, oscillate: true },
                                y: { expand: true, rate: 1.4 },
                                z: { expand: false, rate: 0.8, oscillate: true }
                            },
                            wobbleFrequency: 5, wobbleAmplitude: 0.15
                        },
                        drift: { direction: 'rising', speed: 0.025, noise: 0.2 }
                    }
                }
            }
        },
        // Flame flicker motion
        flickerFrequency: 12,          // Fast flickering
        flickerAmplitude: 0.015,       // Subtle position jitter
        flickerDecay: 0.2,
        // Glow - orange/red pulsing
        glowColor: [1.0, 0.5, 0.1],    // Orange
        glowIntensityMin: 1.2,
        glowIntensityMax: 2.5,
        glowFlickerRate: 15,           // Fast erratic flicker
        // Scale - slight pulsing with flames
        scaleVibration: 0.02,
        scaleFrequency: 8,
        // Rise effect - flames rise
        riseAmount: 0.01
    },

    scorch: {
        name: 'scorch',
        emoji: '🫠',
        type: 'blending',
        description: 'Intense heat exposure, surface heating',
        duration: 3000,
        beats: 5,
        intensity: 1.3,
        category: 'burning',
        temperature: 0.8,              // High heat
        // 3D Element spawning - intense flame coverage
        spawnMode: {
            type: 'surface',
            pattern: 'shell',           // Full heat coverage
            embedDepth: 0.2,
            cameraFacing: 0.25,
            clustering: 0.15,
            count: 10,
            scale: 1.1,
            models: ['flame-tongue', 'flame-wisp', 'fire-burst'],
            minDistance: 0.1,           // Dense flame coverage
            animation: {
                appearAt: 0.03,
                disappearAt: 0.88,
                stagger: 0.02,
                enter: {
                    type: 'fade',       // Smooth fade for procedural fire
                    duration: 0.1,
                    easing: 'easeOutCubic'
                },
                exit: {
                    type: 'fade',
                    duration: 0.12,
                    easing: 'easeInQuad'
                },
                // Procedural shader config
                procedural: {
                    scaleSmoothing: 0.08,
                    geometryStability: true
                },
                // Temperature: sustained high heat
                parameterAnimation: {
                    temperature: {
                        start: 0.6,         // Already hot
                        peak: 0.85,         // Intense sustained heat
                        end: 0.7,           // Stays hot
                        curve: 'sustained'  // Quick rise, hold at peak
                    }
                },
                // Sustained intense heat - less flicker, more emissive
                flicker: {
                    intensity: 0.2,     // Less chaotic than burn
                    rate: 6,
                    pattern: 'sine'
                },
                pulse: {
                    amplitude: 0.1,
                    frequency: 3,       // Slower, more intense
                    easing: 'easeInOut'
                },
                emissive: {
                    min: 1.2,           // Higher baseline
                    max: 3.0,           // Intense peak
                    frequency: 4,
                    pattern: 'sine'
                },
                drift: {
                    direction: 'up',
                    distance: 0.08,     // Total drift over gesture lifetime
                    noise: 0.01
                },
                scaleVariance: 0.25,
                lifetimeVariance: 0.2,
                blending: 'additive',
                renderOrder: 12,
                intensityScaling: {
                    scale: 1.4,
                    emissiveMax: 1.8,
                    pulseAmplitude: 1.3
                },
                // Model-specific behavior overrides (Phase 11)
                modelOverrides: {
                    'flame-tongue': {
                        scaling: {
                            mode: 'non-uniform',
                            axes: {
                                x: { expand: true, rate: 1.2, oscillate: true },
                                y: { expand: true, rate: 1.3 },
                                z: { expand: true, rate: 1.2, oscillate: true }
                            },
                            wobbleFrequency: 3, wobbleAmplitude: 0.1
                        },
                        drift: { direction: 'rising', speed: 0.02, noise: 0.1 }
                    },
                    'flame-wisp': {
                        scaling: {
                            mode: 'non-uniform',
                            axes: {
                                x: { expand: false, rate: 0.8 },
                                y: { expand: true, rate: 1.8 },
                                z: { expand: false, rate: 0.8 }
                            }
                        },
                        drift: { direction: 'rising', speed: 0.02, buoyancy: true }
                    },
                    'fire-burst': {
                        scaling: {
                            mode: 'non-uniform',
                            axes: {
                                x: { expand: true, rate: 1.2 },
                                y: { expand: true, rate: 1.3 },
                                z: { expand: true, rate: 1.2 }
                            }
                        },
                        drift: { direction: 'outward', speed: 0.02, noise: 0.05 },
                        opacityLink: 'inverse-scale'
                    }
                }
            }
        },
        // Minimal flicker - more sustained heat
        flickerFrequency: 6,
        flickerAmplitude: 0.008,
        flickerDecay: 0.25,
        // Glow - intense yellow/white
        glowColor: [1.0, 0.8, 0.3],    // Yellow-white
        glowIntensityMin: 1.5,
        glowIntensityMax: 3.5,
        glowFlickerRate: 8,
        // Scale - slight expansion from heat
        scaleVibration: 0.01,
        scaleFrequency: 3,
        heatExpansion: 0.03,           // Grows slightly from heat
        // Heat shimmer
        shimmerEffect: true,
        shimmerIntensity: 0.02
    },

    combust: {
        name: 'combust',
        emoji: '💥',
        type: 'blending',
        description: 'Building heat then sudden flame burst',
        duration: 2000,
        beats: 4,
        intensity: 1.5,
        category: 'burning',
        temperature: 0.9,              // Very hot at burst
        // 3D Element spawning - explosive flame burst
        spawnMode: {
            type: 'surface',
            pattern: 'spikes',          // Flames burst outward
            embedDepth: 0.1,
            cameraFacing: 0.35,
            clustering: 0.3,
            count: 12,
            scale: 1.2,
            models: ['fire-burst', 'flame-tongue', 'ember-cluster'],
            minDistance: 0.08,          // Dense explosion
            animation: {
                appearAt: 0.55,         // Appears at burst moment
                disappearAt: 0.95,
                stagger: 0.01,          // Rapid sequential burst
                enter: {
                    type: 'fade',       // Quick fade for procedural fire
                    duration: 0.03,
                    easing: 'easeOut'
                },
                exit: {
                    type: 'fade',
                    duration: 0.1,
                    easing: 'easeInCubic'
                },
                // Procedural shader config
                procedural: {
                    scaleSmoothing: 0.06,   // Slightly faster for explosive effect
                    geometryStability: true
                },
                // Temperature: spike at burst
                parameterAnimation: {
                    temperature: {
                        start: 0.5,         // Building heat
                        peak: 0.95,         // Explosive plasma burst
                        end: 0.6,           // Hot aftermath
                        curve: 'spike'      // Slow rise then explosive peak
                    }
                },
                flicker: {
                    intensity: 0.5,     // Very chaotic at burst
                    rate: 25,           // Extremely fast
                    pattern: 'random'
                },
                pulse: {
                    amplitude: 0.25,
                    frequency: 15,
                    easing: 'easeOut'
                },
                emissive: {
                    min: 1.5,
                    max: 4.0,           // Extremely bright burst
                    frequency: 20,
                    pattern: 'sine'
                },
                drift: {
                    direction: 'outward', // Explodes outward
                    distance: 0.15,       // Total expansion over gesture lifetime
                    noise: 0.02
                },
                scaleVariance: 0.4,
                lifetimeVariance: 0.25,
                delayVariance: 0.05,
                blending: 'additive',
                renderOrder: 15,
                intensityScaling: {
                    scale: 1.5,
                    emissiveMax: 2.0,
                    flickerIntensity: 1.6,
                    driftSpeed: 1.4
                },
                // Model-specific behavior overrides (Phase 11)
                modelOverrides: {
                    'fire-burst': {
                        scaling: {
                            mode: 'non-uniform',
                            axes: {
                                x: { expand: true, rate: 1.8 },
                                y: { expand: true, rate: 2.0 },
                                z: { expand: true, rate: 1.8 }
                            }
                        },
                        drift: { direction: 'outward', speed: 0.06, noise: 0.15 },
                        opacityLink: 'inverse-scale'
                    },
                    'flame-tongue': {
                        scaling: {
                            mode: 'non-uniform',
                            axes: {
                                x: { expand: true, rate: 1.4, oscillate: true },
                                y: { expand: true, rate: 1.6 },
                                z: { expand: true, rate: 1.4, oscillate: true }
                            },
                            wobbleFrequency: 8, wobbleAmplitude: 0.2
                        },
                        drift: { direction: 'outward', speed: 0.04, noise: 0.1 }
                    },
                    'ember-cluster': {
                        drift: { direction: 'outward', speed: 0.05, noise: 0.3 },
                        opacityLink: 'flicker'
                    }
                }
            }
        },
        // Buildup then burst
        buildupPhase: 0.6,             // 60% buildup
        burstPhase: 0.4,               // 40% burst
        // Minimal flicker during buildup
        flickerFrequency: 20,
        flickerAmplitude: 0.025,       // Stronger at burst
        flickerDecay: 0.15,
        // Glow - ramps up dramatically
        glowColor: [1.0, 0.6, 0.2],    // Orange-yellow
        glowIntensityMin: 0.8,
        glowIntensityMax: 4.0,         // Bright burst
        glowFlickerRate: 25,
        // Scale - compress then burst
        scaleVibration: 0.03,
        scaleFrequency: 15,
        scaleBurst: 0.08,              // Expands 8% at burst
        // Position burst
        burstJitter: 0.03              // Violent shake at burst
    },

    // ═══════════════════════════════════════════════════════════════════════════════════════
    // RADIATING VARIANTS - Mascot is SOURCE of fire/heat
    // ═══════════════════════════════════════════════════════════════════════════════════════

    radiate: {
        name: 'radiate',
        emoji: '☀️',
        type: 'blending',
        description: 'Emitting heat waves, warm ambient glow',
        duration: 3000,
        beats: 4,
        intensity: 0.8,
        category: 'radiating',
        temperature: 0.4,              // Warm, not hot
        // 3D Element spawning - gentle ambient embers
        spawnMode: {
            type: 'surface',
            pattern: 'scattered',       // Gentle scattered embers
            embedDepth: 0.15,
            cameraFacing: 0.3,
            clustering: 0.2,
            count: 5,
            scale: 0.9,
            models: ['ember-cluster', 'flame-wisp'],
            minDistance: 0.18,          // Spread out for ambient feel
            animation: {
                appearAt: 0.1,
                disappearAt: 0.9,
                stagger: 0.05,
                enter: {
                    type: 'fade',       // Gentle fade in
                    duration: 0.12,
                    easing: 'easeOutQuad'
                },
                exit: {
                    type: 'fade',
                    duration: 0.15,
                    easing: 'easeInQuad'
                },
                // Procedural shader config
                procedural: {
                    scaleSmoothing: 0.1,    // Very smooth for gentle radiating
                    geometryStability: true
                },
                // Temperature: gentle warmth pulse
                parameterAnimation: {
                    temperature: {
                        start: 0.3,         // Warm start
                        peak: 0.45,         // Gentle peak
                        end: 0.3,           // Return to warmth
                        curve: 'pulse'      // Smooth sine wave
                    }
                },
                // Controlled emanation - smooth breathing
                pulse: {
                    amplitude: 0.12,
                    frequency: 1.5,     // Slow breathing
                    easing: 'easeInOut',
                    sync: 'global'      // All elements pulse together
                },
                emissive: {
                    min: 0.6,
                    max: 1.2,
                    frequency: 1.5,
                    pattern: 'sine'
                },
                drift: {
                    direction: 'outward',
                    distance: 0.05,     // Subtle outward drift over gesture
                    noise: 0.005
                },
                rotate: {
                    axis: 'y',
                    speed: 0.02,
                    oscillate: true,
                    range: Math.PI / 6
                },
                scaleVariance: 0.2,
                lifetimeVariance: 0.15,
                blending: 'additive',
                renderOrder: 8,
                intensityScaling: {
                    scale: 1.2,
                    emissiveMax: 1.3,
                    pulseAmplitude: 1.2
                },
                // Model-specific behavior overrides (Phase 11)
                modelOverrides: {
                    'ember-cluster': {
                        scaling: { mode: 'uniform-pulse', amplitude: 0.15, frequency: 1.5 },
                        drift: { direction: 'rising', speed: 0.015, noise: 0.1, buoyancy: true }
                    },
                    'flame-wisp': {
                        scaling: {
                            mode: 'non-uniform',
                            axes: {
                                x: { expand: false, rate: 0.8 },
                                y: { expand: true, rate: 1.2 },
                                z: { expand: false, rate: 0.8 }
                            }
                        },
                        drift: { direction: 'rising', speed: 0.01, buoyancy: true }
                    }
                }
            }
        },
        // No jitter - controlled emission
        flickerFrequency: 0,
        flickerAmplitude: 0,
        flickerDecay: 0.3,
        // Glow - gentle warm pulsing
        glowColor: [1.0, 0.7, 0.3],    // Warm orange
        glowIntensityMin: 1.0,
        glowIntensityMax: 1.6,
        glowFlickerRate: 3,            // Slow breathing pulse
        // Scale - gentle breathing
        scaleVibration: 0.015,
        scaleFrequency: 1.5,
        scalePulse: true,              // Smooth sine pulse
        // Heat wave effect
        heatWaves: true,
        waveFrequency: 2
    },

    blaze: {
        name: 'blaze',
        emoji: '🔆',
        type: 'blending',
        description: 'Powerful fire aura, controlled intensity',
        duration: 2500,
        beats: 4,
        intensity: 1.2,
        category: 'radiating',
        temperature: 0.7,              // Hot flame
        // 3D Element spawning - powerful flame aura
        spawnMode: {
            type: 'surface',
            pattern: 'shell',           // Full coverage aura
            embedDepth: 0.1,
            cameraFacing: 0.35,
            clustering: 0.1,
            count: 10,
            scale: 1.1,
            models: ['flame-tongue', 'fire-burst', 'flame-wisp'],
            minDistance: 0.1,           // Dense aura
            animation: {
                appearAt: 0.05,
                disappearAt: 0.9,
                stagger: 0.02,
                enter: {
                    type: 'fade',       // Smooth fade for procedural fire
                    duration: 0.08,
                    easing: 'easeOutBack'
                },
                exit: {
                    type: 'fade',
                    duration: 0.1,
                    easing: 'easeIn'
                },
                // Procedural shader config
                procedural: {
                    scaleSmoothing: 0.08,
                    geometryStability: true
                },
                // Temperature: powerful sustained heat with breathing
                parameterAnimation: {
                    temperature: {
                        start: 0.55,        // Starting hot
                        peak: 0.75,         // Powerful peak
                        end: 0.6,           // Sustained warmth
                        curve: 'bell'       // Controlled rise and fall
                    }
                },
                // Powerful controlled flames
                pulse: {
                    amplitude: 0.15,
                    frequency: 2,
                    easing: 'easeInOut',
                    sync: 'global'
                },
                flicker: {
                    intensity: 0.15,    // Subtle flicker, controlled
                    rate: 6,
                    pattern: 'sine'
                },
                emissive: {
                    min: 1.0,
                    max: 2.2,
                    frequency: 2,
                    pattern: 'sine'
                },
                drift: {
                    direction: 'up',
                    distance: 0.08,     // Controlled rise over gesture lifetime
                    noise: 0.01
                },
                scaleVariance: 0.2,
                lifetimeVariance: 0.15,
                blending: 'additive',
                renderOrder: 10,
                intensityScaling: {
                    scale: 1.35,
                    emissiveMax: 1.5,
                    pulseAmplitude: 1.3
                },
                // Model-specific behavior overrides (Phase 11)
                modelOverrides: {
                    'flame-tongue': {
                        scaling: {
                            mode: 'non-uniform',
                            axes: {
                                x: { expand: true, rate: 1.2, oscillate: true },
                                y: { expand: true, rate: 1.8 },
                                z: { expand: true, rate: 1.2, oscillate: true }
                            },
                            wobbleFrequency: 2, wobbleAmplitude: 0.1
                        },
                        drift: { direction: 'rising', speed: 0.03, buoyancy: true }
                    },
                    'fire-burst': {
                        scaling: {
                            mode: 'non-uniform',
                            axes: {
                                x: { expand: true, rate: 1.3 },
                                y: { expand: true, rate: 1.4 },
                                z: { expand: true, rate: 1.3 }
                            }
                        },
                        drift: { direction: 'outward', speed: 0.025, noise: 0.05 },
                        opacityLink: 'inverse-scale'
                    },
                    'flame-wisp': {
                        scaling: {
                            mode: 'non-uniform',
                            axes: {
                                x: { expand: false, rate: 0.7 },
                                y: { expand: true, rate: 2.0 },
                                z: { expand: false, rate: 0.7 }
                            }
                        },
                        drift: { direction: 'rising', speed: 0.035, buoyancy: true }
                    }
                }
            }
        },
        // Controlled flicker
        flickerFrequency: 0,
        flickerAmplitude: 0,
        flickerDecay: 0.2,
        // Glow - strong sustained
        glowColor: [1.0, 0.6, 0.15],   // Bright orange
        glowIntensityMin: 1.5,
        glowIntensityMax: 2.8,
        glowFlickerRate: 6,            // Medium pulse
        // Scale - power breathing
        scaleVibration: 0.025,
        scaleFrequency: 2,
        scalePulse: true,
        scaleGrowth: 0.04,             // Grows with power
        // Slight rise
        hover: true,
        hoverAmount: 0.008
    },

    smolder: {
        name: 'smolder',
        emoji: '🪨',
        type: 'blending',
        description: 'Low simmer, faint ember glow',
        duration: 4000,
        beats: 6,
        intensity: 0.4,
        category: 'radiating',
        temperature: 0.15,             // Embers
        // 3D Element spawning - sparse embers
        spawnMode: {
            type: 'surface',
            pattern: 'scattered',       // Sparse embers
            embedDepth: 0.2,
            cameraFacing: 0.25,
            clustering: 0.3,
            count: 4,
            scale: 0.8,
            models: ['ember-cluster'],
            minDistance: 0.2,           // Very sparse
            animation: {
                appearAt: 0.1,
                disappearAt: 0.85,
                stagger: 0.08,          // Slow stagger
                enter: {
                    type: 'fade',
                    duration: 0.25,     // Slow fade in for embers
                    easing: 'easeOutQuad'
                },
                exit: {
                    type: 'fade',
                    duration: 0.3,      // Slow fade out
                    easing: 'easeInQuad'
                },
                // Procedural shader config
                procedural: {
                    scaleSmoothing: 0.12,   // Very smooth for slow embers
                    geometryStability: true
                },
                // Temperature: subtle ember glow
                parameterAnimation: {
                    temperature: {
                        start: 0.1,         // Cool embers
                        peak: 0.2,          // Gentle warmth
                        end: 0.08,          // Dying down
                        curve: 'pulse'      // Subtle breathing
                    }
                },
                // Subtle smoldering - very slow
                pulse: {
                    amplitude: 0.08,
                    frequency: 0.5,     // Very slow pulse
                    easing: 'easeInOut'
                },
                emissive: {
                    min: 0.3,
                    max: 0.8,           // Subtle ember glow
                    frequency: 0.7,
                    pattern: 'sine'
                },
                // Minimal drift
                drift: {
                    direction: 'up',
                    distance: 0.02,     // Barely perceptible rise over gesture
                    noise: 0.002
                },
                scaleVariance: 0.15,
                lifetimeVariance: 0.2,
                blending: 'additive',
                renderOrder: 5,
                intensityScaling: {
                    scale: 1.1,
                    emissiveMax: 1.4
                },
                // Model-specific behavior overrides (Phase 11)
                modelOverrides: {
                    'ember-cluster': {
                        scaling: { mode: 'uniform-pulse', amplitude: 0.08, frequency: 0.5 },
                        drift: { direction: 'rising', speed: 0.008, noise: 0.05, buoyancy: true },
                        opacityLink: 'dissipate'
                    }
                }
            }
        },
        // Very subtle flicker
        flickerFrequency: 0,
        flickerAmplitude: 0,
        flickerDecay: 0.4,
        // Glow - deep red, subtle
        glowColor: [0.9, 0.3, 0.1],    // Deep red
        glowIntensityMin: 0.8,
        glowIntensityMax: 1.2,
        glowFlickerRate: 2,            // Very slow
        // Scale - minimal
        scaleVibration: 0.005,
        scaleFrequency: 1,
        scalePulse: true,
        // Smoke hint
        smokeHint: true
    }
};

// ═══════════════════════════════════════════════════════════════════════════════════════
// PSEUDO-RANDOM HASH FOR DETERMINISTIC FLICKER
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
 * Create a fire effect gesture (NO shatter - mesh stays intact)
 * @param {string} variant - Variant name from FIRE_EFFECT_VARIANTS
 * @returns {Object} Gesture configuration
 */
export function createFireEffectGesture(variant) {
    const config = FIRE_EFFECT_VARIANTS[variant];
    if (!config) {
        console.warn(`[FIRE_EFFECT] Unknown variant: ${variant}, using burn`);
        return createFireEffectGesture('burn');
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
                onBeat: 1.8,
                offBeat: 1.0,
                curve: config.category === 'radiating' ? 'smooth' : 'sharp'
            }
        },

        /**
         * 3D core transformation for fire effect
         * Handles both burning (victim) and radiating (source) variants
         */
        '3d': {
            evaluate(progress, motion) {
                const cfg = { ...config, ...motion };
                const time = progress * cfg.duration / 1000;
                const isRadiating = cfg.category === 'radiating';

                // ═══════════════════════════════════════════════════════════════
                // PHASE CALCULATION
                // ═══════════════════════════════════════════════════════════════
                let effectStrength = 1.0;

                // Buildup phase for combust
                if (cfg.buildupPhase && progress < cfg.buildupPhase) {
                    effectStrength = progress / cfg.buildupPhase;
                    // Exponential ramp for dramatic buildup
                    effectStrength = Math.pow(effectStrength, 1.5);
                }

                // Burst phase for combust
                if (cfg.burstPhase && progress >= cfg.buildupPhase) {
                    const burstProgress = (progress - cfg.buildupPhase) / cfg.burstPhase;
                    // Quick peak then decay
                    effectStrength = burstProgress < 0.3
                        ? 1.0 + burstProgress * 3.33  // Ramp to 2.0
                        : 2.0 * (1 - (burstProgress - 0.3) / 0.7);  // Decay from 2.0
                }

                // Decay in final phase
                if (progress > (1 - cfg.flickerDecay)) {
                    const decayProgress = (progress - (1 - cfg.flickerDecay)) / cfg.flickerDecay;
                    effectStrength *= (1 - decayProgress);
                }

                // ═══════════════════════════════════════════════════════════════
                // POSITION - Flicker (burning) or stable (radiating)
                // ═══════════════════════════════════════════════════════════════
                let posX = 0, posY = 0, posZ = 0;

                if (cfg.flickerAmplitude > 0) {
                    const flickerTime = time * cfg.flickerFrequency;

                    // Multi-frequency noise for organic flame flicker
                    posX = (
                        noise1D(flickerTime) - 0.5 +
                        (noise1D(flickerTime * 2.1 + 50) - 0.5) * 0.4
                    ) * cfg.flickerAmplitude * effectStrength;

                    posY = (
                        noise1D(flickerTime + 33) - 0.5 +
                        (noise1D(flickerTime * 1.8 + 83) - 0.5) * 0.5
                    ) * cfg.flickerAmplitude * effectStrength;

                    posZ = (
                        noise1D(flickerTime + 66) - 0.5
                    ) * cfg.flickerAmplitude * effectStrength * 0.5;

                    // Burst jitter for combust
                    if (cfg.burstJitter && progress >= cfg.buildupPhase) {
                        const burstMult = effectStrength > 1.0 ? effectStrength : 0;
                        posX += (noise1D(time * 50) - 0.5) * cfg.burstJitter * burstMult;
                        posY += (noise1D(time * 50 + 100) - 0.5) * cfg.burstJitter * burstMult;
                        posZ += (noise1D(time * 50 + 200) - 0.5) * cfg.burstJitter * burstMult * 0.5;
                    }
                }

                // Rise effect (flames rise)
                if (cfg.riseAmount) {
                    posY += cfg.riseAmount * effectStrength;
                }

                // Hover effect (radiating)
                if (cfg.hover && cfg.hoverAmount) {
                    posY += Math.sin(time * Math.PI * 0.5) * cfg.hoverAmount * effectStrength;
                }

                // ═══════════════════════════════════════════════════════════════
                // SCALE - Vibration (burning) or breathing (radiating)
                // ═══════════════════════════════════════════════════════════════
                let scale = 1.0;
                const scaleTime = time * cfg.scaleFrequency;

                if (cfg.scalePulse) {
                    // Radiating: smooth sine breathing
                    const breathe = Math.sin(scaleTime * Math.PI * 2) * 0.5 + 0.5;
                    scale = 1.0 + breathe * cfg.scaleVibration * effectStrength;

                    // Growth during blaze/charge
                    if (cfg.scaleGrowth) {
                        scale += cfg.scaleGrowth * effectStrength;
                    }
                } else {
                    // Burning: erratic vibration
                    const scaleNoise = Math.sin(scaleTime * Math.PI * 2) * 0.5 +
                                      Math.sin(scaleTime * Math.PI * 3.3) * 0.3;
                    scale = 1.0 + scaleNoise * cfg.scaleVibration * effectStrength;
                }

                // Heat expansion
                if (cfg.heatExpansion) {
                    scale += cfg.heatExpansion * effectStrength;
                }

                // Burst expansion for combust
                if (cfg.scaleBurst && progress >= cfg.buildupPhase) {
                    const burstMult = effectStrength > 1.0 ? (effectStrength - 1.0) : 0;
                    scale += cfg.scaleBurst * burstMult;
                }

                // ═══════════════════════════════════════════════════════════════
                // GLOW - Flickering (burning) or pulsing (radiating)
                // ═══════════════════════════════════════════════════════════════
                const flickerTime = time * cfg.glowFlickerRate;
                let flickerValue;

                if (isRadiating) {
                    // Radiating: smooth pulsing glow
                    flickerValue = Math.sin(flickerTime * Math.PI * 2) * 0.3 + 0.7;
                } else {
                    // Burning: erratic flame flicker
                    const flicker1 = Math.sin(flickerTime * Math.PI * 2);
                    const flicker2 = Math.sin(flickerTime * Math.PI * 4.7 + 1.3);
                    const flicker3 = hash(Math.floor(flickerTime * 3)) > 0.6 ? 1 : 0;
                    flickerValue = (flicker1 * 0.3 + flicker2 * 0.2 + flicker3 * 0.4 + 0.5);
                }

                const glowIntensity = cfg.glowIntensityMin +
                    (cfg.glowIntensityMax - cfg.glowIntensityMin) * flickerValue * effectStrength;

                const glowBoost = (flickerValue * 0.7 + 0.3) * effectStrength * cfg.intensity;

                // ═══════════════════════════════════════════════════════════════
                // RETURN TRANSFORMATION
                // ═══════════════════════════════════════════════════════════════
                return {
                    position: [posX, posY, posZ],
                    rotation: [0, 0, 0],
                    scale,
                    glowIntensity,
                    glowBoost,
                    glowColorOverride: cfg.glowColor,
                    fireOverlay: {
                        enabled: effectStrength > 0.1,
                        strength: effectStrength * cfg.intensity,
                        heat: effectStrength * cfg.intensity,
                        temperature: cfg.temperature,
                        category: cfg.category,
                        spawnMode: cfg.spawnMode || null,
                        duration: cfg.duration,
                        progress,
                        time
                    }
                };
            }
        }
    };
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// PRE-BUILT GESTURES
// ═══════════════════════════════════════════════════════════════════════════════════════

// Burning variants (being heated)
export const burn = createFireEffectGesture('burn');
export const scorch = createFireEffectGesture('scorch');
export const combust = createFireEffectGesture('combust');

// Radiating variants (emanating heat)
export const radiate = createFireEffectGesture('radiate');
export const blaze = createFireEffectGesture('blaze');
export const smolder = createFireEffectGesture('smolder');

export {
    FIRE_EFFECT_VARIANTS
};

export default {
    // Burning
    burn,
    scorch,
    combust,
    // Radiating
    radiate,
    blaze,
    smolder,
    // Factory
    createFireEffectGesture,
    FIRE_EFFECT_VARIANTS
};
