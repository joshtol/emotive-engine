/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Water Effect Gesture Factory
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Factory for water effect gestures (no shatter, just fluid visuals)
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/waterEffectFactory
 *
 * ## Water Effect Gestures
 *
 * Three categories of water gestures:
 *
 * ### Impact (water hitting mascot)
 * - Quick wobble burst, ripple outward
 * - Mascot is HIT by water
 *
 * ### Ambient (mascot emanates water)
 * - Continuous flowing motion
 * - Mascot is SOURCE of water/fluid
 *
 * ### Transform (becoming water)
 * - Losing rigid form, becoming fluid
 * - Mascot TRANSFORMS into water
 *
 * ## Variants
 *
 * | Gesture  | Category  | Effect                                   |
 * |----------|-----------|------------------------------------------|
 * | splash   | Impact    | Quick burst wobble, ripple settle        |
 * | drench   | Impact    | Heavy water hit, dripping weight         |
 * | soak     | Impact    | Gradual saturation, slight expansion     |
 * | flow     | Ambient   | Continuous S-curve undulation            |
 * | ripple   | Ambient   | Concentric pulse waves                   |
 * | tide     | Ambient   | Side-to-side fluid sway                  |
 * | liquefy  | Transform | Losing form, wobbly edges, melting       |
 * | pool     | Transform | Settling downward, spreading wide        |
 */

// ═══════════════════════════════════════════════════════════════════════════════════════
// WATER EFFECT VARIANTS
// ═══════════════════════════════════════════════════════════════════════════════════════

const WATER_EFFECT_VARIANTS = {
    // ═══════════════════════════════════════════════════════════════════════════════════════
    // IMPACT VARIANTS - Water hitting the mascot
    // ═══════════════════════════════════════════════════════════════════════════════════════

    splash: {
        name: 'splash',
        emoji: '💦',
        type: 'blending',
        description: 'Rising water ring traveling from bottom to top',
        duration: 1200,
        beats: 2,
        intensity: 1.0,
        category: 'impact',
        turbulence: 0.9,              // High turbulence for dynamic water
        // 3D Element spawning - single ring traveling bottom to top
        spawnMode: {
            type: 'axis-travel',
            axisTravel: {
                axis: 'y',
                start: 'bottom',
                end: 'top',
                easing: 'easeOutQuad',     // Quick start, gentle arrival
                startScale: 0.8,           // Slightly smaller at start
                endScale: 1.2,             // Expands as it rises
                startDiameter: 0.7,        // Tighter at bottom
                endDiameter: 1.1           // Wider at top
            },
            count: 1,
            scale: 1.0,
            models: ['splash-ring'],
            animation: {
                appearAt: 0.02,         // Immediate appearance
                disappearAt: 0.95,
                enter: {
                    type: 'grow',       // Ring emerges from center
                    duration: 0.08,
                    easing: 'easeOutBack',
                    overshoot: 1.15
                },
                exit: {
                    type: 'fade',       // Dissolves at top
                    duration: 0.12,
                    easing: 'easeIn'
                },
                // Procedural config - enables ProceduralWaterMaterial
                procedural: {
                    scaleSmoothing: 0.06,
                    geometryStability: true
                },
                // Parameter animation: water dynamics during travel
                parameterAnimation: {
                    turbulence: {
                        start: 0.8,          // Energetic start
                        peak: 1.0,           // Maximum mid-journey
                        end: 0.3,            // Calming at top
                        curve: 'bell'
                    },
                    wetness: {
                        start: 0.6,
                        peak: 1.0,
                        end: 0.5,
                        curve: 'bell'
                    }
                },
                // Gentle pulse for organic motion
                pulse: {
                    amplitude: 0.08,
                    frequency: 4,
                    easing: 'easeInOut'
                },
                blending: 'normal',
                renderOrder: 8,
                // Model-specific behavior overrides
                modelOverrides: {
                    'splash-ring': {
                        scaling: {
                            mode: 'non-uniform',
                            axes: {
                                x: { expand: true, rate: 1.5 },
                                y: { expand: false, rate: 0.3 },
                                z: { expand: true, rate: 1.5 }
                            }
                        },
                        opacityLink: 'inverse-scale',
                        // Shader animation: rotating arc for dynamic ring
                        shaderAnimation: {
                            type: 1,  // ROTATING_ARC
                            arcWidth: 0.5,    // Visible arc width
                            arcSpeed: 1.5,    // 1.5 rotations over gesture
                            arcCount: 2       // Two arcs for fuller appearance
                        }
                    }
                }
            }
        },
        // Wobble parameters - reduced for fluid motion
        wobbleFrequency: 3,
        wobbleAmplitude: 0.015,
        wobbleDecay: 0.5,
        // Scale - brief expansion then contract
        scaleWobble: 0.06,
        scaleFrequency: 6,
        // Glow - wet sheen
        glowColor: [0.3, 0.6, 1.0],  // Blue
        glowIntensityMin: 1.0,
        glowIntensityMax: 1.6,
        glowPulseRate: 4,
        // Impact-specific
        impactBurst: true,
        burstDuration: 0.2
    },

    drench: {
        name: 'drench',
        emoji: '🌊',
        type: 'blending',
        description: 'Heavy water hit, dripping with weight',
        duration: 2000,
        beats: 3,
        intensity: 1.2,
        category: 'impact',
        turbulence: 0.6,              // Moderate turbulence - heavy but not chaotic
        // 3D Element spawning - heavy water coverage
        spawnMode: {
            type: 'surface',
            pattern: 'shell',           // Full wet coverage
            embedDepth: 0.15,
            cameraFacing: 0.3,
            clustering: 0.2,
            count: 10,
            scale: 1.0,
            models: ['droplet-large', 'wave-curl', 'splash-ring'],
            minDistance: 0.1,
            animation: {
                appearAt: 0.05,
                disappearAt: 0.9,
                stagger: 0.03,
                enter: {
                    type: 'fade',
                    duration: 0.08,
                    easing: 'easeOutQuad'
                },
                exit: {
                    type: 'fade',
                    duration: 0.15,
                    easing: 'easeIn'
                },
                // Procedural config - enables ProceduralWaterMaterial
                procedural: {
                    scaleSmoothing: 0.08,    // Smooth for heavy dripping
                    geometryStability: true
                },
                // Parameter animation: heavy saturation
                parameterAnimation: {
                    turbulence: {
                        start: 0.4,
                        peak: 0.6,           // Less chaotic than splash
                        end: 0.2,
                        curve: 'bell'
                    },
                    wetness: {
                        start: 0.6,
                        peak: 1.0,           // Maximum saturation
                        end: 0.8,            // Stays wet
                        curve: 'sustained'
                    },
                    weight: {
                        start: 0.3,
                        peak: 1.0,           // Heavy water weight
                        end: 0.7,
                        curve: 'sustained'
                    }
                },
                drift: {
                    direction: 'down',    // Heavy dripping
                    distance: 0.1,
                    noise: 0.15
                },
                scaleVariance: 0.25,
                lifetimeVariance: 0.2,
                blending: 'normal',
                renderOrder: 7,
                // Model-specific behavior overrides (Phase 11)
                modelOverrides: {
                    'splash-ring': {
                        scaling: {
                            mode: 'non-uniform',
                            axes: {
                                x: { expand: true, rate: 1.2 },
                                y: { expand: false, rate: 0.3 },
                                z: { expand: true, rate: 1.2 }
                            }
                        },
                        opacityLink: 'inverse-scale',
                        // Shader animation: rotating arc for partial ring visibility
                        shaderAnimation: {
                            type: 1,  // ROTATING_ARC
                            arcWidth: 0.6,
                            arcSpeed: 1.0,  // One rotation over gesture
                            arcCount: 2
                        }
                    },
                    'droplet-large': {
                        // Heavy dripping with velocity stretch
                        scaling: {
                            mode: 'velocity-stretch',
                            stretchFactor: 1.5,
                            minSpeed: 0.02,
                            maxStretch: 2.0
                        },
                        drift: {
                            direction: 'gravity',
                            speed: 0.04,
                            acceleration: 0.03,
                            adherence: 0.2,
                            noise: 0.01
                        },
                        // Shader animation: vertical drip stretch
                        shaderAnimation: {
                            type: 3  // DRIP_FALL
                        }
                    },
                    'wave-curl': {
                        scaling: { mode: 'uniform-pulse', amplitude: 0.08, frequency: 1.2 },
                        drift: { direction: 'tangent', speed: 0.008, adherence: 0.6, noise: 0.02 }
                    },
                    'bubble-cluster': {
                        drift: { direction: 'rising', speed: 0.012, buoyancy: true, noise: 0.03 }
                    }
                }
            }
        },
        // Wobble - minimal for fluid motion
        wobbleFrequency: 1.5,
        wobbleAmplitude: 0.01,
        wobbleDecay: 0.3,
        // Scale - slight compression from weight
        scaleWobble: 0.03,
        scaleFrequency: 2,
        scaleCompression: -0.02,     // Gets slightly smaller (weighted down)
        // Glow - saturated wet look
        glowColor: [0.2, 0.5, 0.9],
        glowIntensityMin: 1.2,
        glowIntensityMax: 1.8,
        glowPulseRate: 2,
        // Drench-specific
        sinkAmount: 0.015,           // Slight downward drift
        dripEffect: true             // Vertical stretch at bottom
    },

    soak: {
        name: 'soak',
        emoji: '💧',
        type: 'blending',
        description: 'Gradual water saturation, absorbing',
        duration: 2500,
        beats: 4,
        intensity: 0.6,
        category: 'impact',
        turbulence: 0.15,             // Very calm - gradual saturation
        // 3D Element spawning - gradual droplet buildup
        spawnMode: {
            type: 'surface',
            pattern: 'scattered',       // Droplets accumulating
            embedDepth: 0.2,
            cameraFacing: 0.35,
            clustering: 0.25,
            count: 6,
            scale: 0.9,
            models: ['droplet-small', 'bubble-cluster'],
            minDistance: 0.15,
            animation: {
                appearAt: 0.1,
                disappearAt: 0.95,
                stagger: 0.08,          // Gradual appearance
                enter: {
                    type: 'fade',
                    duration: 0.15,
                    easing: 'easeOutQuad'
                },
                exit: {
                    type: 'fade',
                    duration: 0.2,
                    easing: 'easeInQuad'
                },
                // Procedural config - enables ProceduralWaterMaterial
                procedural: {
                    scaleSmoothing: 0.12,    // Very smooth for gradual soaking
                    geometryStability: true
                },
                // Parameter animation: gradual saturation buildup
                parameterAnimation: {
                    turbulence: {
                        start: 0.05,
                        peak: 0.15,          // Very calm
                        end: 0.1,
                        curve: 'bell'
                    },
                    wetness: {
                        start: 0.1,
                        peak: 0.9,           // Builds to saturated
                        end: 0.8,
                        curve: 'sustained'   // Gradual buildup
                    },
                    absorption: {
                        start: 0.0,
                        peak: 1.0,
                        end: 0.9,
                        curve: 'linear'      // Steady absorption
                    }
                },
                pulse: {
                    amplitude: 0.05,
                    frequency: 1,
                    easing: 'easeInOut'
                },
                scaleVariance: 0.2,
                lifetimeVariance: 0.15,
                blending: 'normal',
                renderOrder: 6,
                // Model-specific behavior overrides (Phase 11)
                modelOverrides: {
                    'splash-ring': {
                        scaling: {
                            mode: 'non-uniform',
                            axes: {
                                x: { expand: true, rate: 0.8 },
                                y: { expand: false, rate: 0.5 },
                                z: { expand: true, rate: 0.8 }
                            }
                        },
                        opacityLink: 'inverse-scale',
                        // Shader animation: rotating arc for partial ring visibility
                        shaderAnimation: {
                            type: 1,  // ROTATING_ARC
                            arcWidth: 0.6,
                            arcSpeed: 1.0,  // One rotation over gesture
                            arcCount: 2
                        }
                    },
                    'droplet-small': {
                        drift: { direction: 'gravity', speed: 0.008, adherence: 0.7 }
                    },
                    'bubble-cluster': {
                        scaling: {
                            mode: 'non-uniform',
                            axes: {
                                x: { expand: false, rate: 0.7 },
                                y: { expand: false, rate: 0.7 },
                                z: { expand: false, rate: 0.7 }
                            }
                        },
                        opacityLink: 'inverse-scale'
                    }
                }
            }
        },
        // Wobble - very gentle
        wobbleFrequency: 1.5,
        wobbleAmplitude: 0.01,
        wobbleDecay: 0.2,
        // Scale - gradual expansion (absorbing water)
        scaleWobble: 0.01,
        scaleFrequency: 1,
        scaleGrowth: 0.04,           // Grows 4% as it absorbs
        // Glow - building saturation
        glowColor: [0.3, 0.55, 0.85],
        glowIntensityMin: 0.9,
        glowIntensityMax: 1.5,
        glowPulseRate: 1,
        // Soak-specific
        rampUp: true,                // Effect builds over time
        saturationBuild: true
    },

    // ═══════════════════════════════════════════════════════════════════════════════════════
    // AMBIENT VARIANTS - Mascot is SOURCE of water/fluid energy
    // ═══════════════════════════════════════════════════════════════════════════════════════

    flow: {
        name: 'flow',
        emoji: '〰️',
        type: 'blending',
        description: 'Continuous fluid S-curve motion',
        duration: 3000,
        beats: 4,
        intensity: 0.8,
        category: 'ambient',
        turbulence: 0.3,              // Calm flowing water
        // 3D Element spawning - flowing water elements
        spawnMode: {
            type: 'surface',
            pattern: 'shell',           // Flowing coverage
            embedDepth: 0.12,
            cameraFacing: 0.3,
            clustering: 0.15,
            count: 6,
            scale: 0.9,
            models: ['wave-curl', 'droplet-small', 'bubble-cluster'],
            minDistance: 0.15,
            animation: {
                appearAt: 0.1,
                disappearAt: 0.85,
                stagger: 0.05,
                enter: {
                    type: 'fade',       // Gentle fluid emergence
                    duration: 0.1,
                    easing: 'easeOutQuad'
                },
                exit: {
                    type: 'fade',
                    duration: 0.15,
                    easing: 'easeInQuad'
                },
                // Procedural config - enables ProceduralWaterMaterial
                procedural: {
                    scaleSmoothing: 0.1,     // Smooth flowing motion
                    geometryStability: true
                },
                // Parameter animation: sustained gentle flow
                parameterAnimation: {
                    turbulence: {
                        start: 0.2,
                        peak: 0.3,           // Calm, minimal turbulence
                        end: 0.2,
                        curve: 'sustained'
                    },
                    flowSpeed: {
                        start: 0.5,
                        peak: 0.8,
                        end: 0.5,
                        curve: 'bell'
                    }
                },
                // Smooth flowing animation
                pulse: {
                    amplitude: 0.1,
                    frequency: 1.5,     // Slow fluid breathing
                    easing: 'easeInOut',
                    sync: 'global'
                },
                emissive: {
                    min: 0.5,
                    max: 0.9,
                    frequency: 1.5,
                    pattern: 'sine'
                },
                drift: {
                    direction: 'tangent', // Flow along surface
                    distance: 0.1,        // Musical timing: gentle drift
                    noise: 0.1
                },
                rotate: {
                    axis: 'y',
                    speed: 0.01,
                    oscillate: true,
                    range: Math.PI / 8
                },
                scaleVariance: 0.2,
                lifetimeVariance: 0.15,
                blending: 'normal',
                renderOrder: 6,
                intensityScaling: {
                    scale: 1.15,
                    driftSpeed: 1.2
                },
                // Model-specific behavior overrides (Phase 11)
                modelOverrides: {
                    'splash-ring': {
                        scaling: {
                            mode: 'non-uniform',
                            axes: {
                                x: { expand: true, rate: 1.1, oscillate: true },
                                y: { expand: false, rate: 0.4 },
                                z: { expand: true, rate: 1.1, oscillate: true }
                            },
                            wobbleFrequency: 1.5
                        },
                        opacityLink: 'inverse-scale',
                        // Shader animation: rotating arc for partial ring visibility
                        shaderAnimation: {
                            type: 1,  // ROTATING_ARC
                            arcWidth: 0.6,
                            arcSpeed: 1.0,  // One rotation over gesture
                            arcCount: 2
                        }
                    },
                    'droplet-small': {
                        drift: { direction: 'tangent', speed: 0.015, noise: 0.1 }
                    },
                    'wave-curl': {
                        scaling: { mode: 'uniform-pulse', amplitude: 0.12, frequency: 1.5 },
                        rotate: { axis: 'tangent', speed: 0.015, oscillate: true, range: Math.PI / 6 },
                        // Shader animation: directional flow
                        shaderAnimation: {
                            type: 4,  // FLOW_STREAM
                            flowDirection: 0
                        }
                    },
                    'bubble-cluster': {
                        drift: { direction: 'rising', speed: 0.02, buoyancy: true, noise: 0.15 }
                    }
                }
            }
        },
        // Flow motion - smooth S-curve
        flowFrequency: 0.8,          // Slow wave
        flowAmplitude: 0.02,         // Gentle side-to-side
        flowPhaseOffset: 0.5,        // Creates S-curve with Y offset
        // Scale - gentle breathing
        scaleWobble: 0.015,
        scaleFrequency: 0.6,
        // Glow - steady wet sheen
        glowColor: [0.35, 0.65, 1.0],
        glowIntensityMin: 1.1,
        glowIntensityMax: 1.4,
        glowPulseRate: 0.5,
        // Flow-specific
        rotationFlow: 0.01,          // Slight rotation drift
        continuous: true
    },

    ripple: {
        name: 'ripple',
        emoji: '🔵',
        type: 'blending',
        description: 'Concentric pulse waves expanding',
        duration: 2000,
        beats: 3,
        intensity: 0.7,
        category: 'ambient',
        turbulence: 0.35,             // Moderate - visible wave patterns
        // 3D Element spawning - ripple rings
        spawnMode: {
            type: 'surface',
            pattern: 'ring',            // Rings of water
            embedDepth: 0.1,
            cameraFacing: 0.35,
            clustering: 0.2,
            count: 5,
            scale: 1.0,
            models: ['splash-ring', 'droplet-small'],
            minDistance: 0.15,
            animation: {
                appearAt: 0.1,
                disappearAt: 0.88,
                stagger: 0.08,          // Sequential ripples
                enter: {
                    type: 'grow',       // Ripples expand out
                    duration: 0.08,
                    easing: 'easeOutQuad'
                },
                exit: {
                    type: 'fade',
                    duration: 0.12,
                    easing: 'easeIn'
                },
                // Procedural config - enables ProceduralWaterMaterial
                procedural: {
                    scaleSmoothing: 0.08,    // Quick response for ripple animation
                    geometryStability: true
                },
                // Parameter animation: expanding ripples
                parameterAnimation: {
                    waveHeight: {
                        start: 0.3,
                        peak: 1.0,
                        end: 0.1,
                        curve: 'bell'
                    },
                    rippleSpeed: {
                        start: 0.5,
                        peak: 0.8,
                        end: 0.3,
                        curve: 'sustained'
                    }
                },
                // Concentric pulse animation
                pulse: {
                    amplitude: 0.15,
                    frequency: 3,       // Ripple frequency
                    easing: 'easeInOut',
                    sync: 'staggered'   // Each ring slightly offset
                },
                drift: {
                    direction: 'outward',
                    distance: 0.15,     // Musical timing: expands 0.15 units
                    noise: 0
                },
                scaleVariance: 0.15,
                lifetimeVariance: 0.1,
                blending: 'normal',
                renderOrder: 5,
                intensityScaling: {
                    scale: 1.2,
                    pulseAmplitude: 1.3
                },
                // Model-specific behavior overrides (Phase 11)
                modelOverrides: {
                    'splash-ring': {
                        scaling: {
                            mode: 'non-uniform',
                            axes: {
                                x: { expand: true, rate: 1.6 },
                                y: { expand: false, rate: 0.2 },
                                z: { expand: true, rate: 1.6 }
                            },
                            easing: 'easeOutQuad'
                        },
                        drift: { direction: 'outward-flat', speed: 0.04 },
                        opacityLink: 'inverse-scale',
                        // Shader animation: rotating arc for partial ring visibility
                        shaderAnimation: {
                            type: 1,  // ROTATING_ARC
                            arcWidth: 0.6,
                            arcSpeed: 1.0,  // One rotation over gesture
                            arcCount: 3   // More arcs for ripple effect
                        }
                    },
                    'droplet-small': {
                        drift: { direction: 'outward-flat', speed: 0.02 }
                    }
                }
            }
        },
        // Ripple motion - pulsing outward
        wobbleFrequency: 2,
        wobbleAmplitude: 0.008,
        wobbleDecay: 0.1,            // Minimal decay - continuous
        // Scale - breathing pulse
        scaleWobble: 0.025,
        scaleFrequency: 1.5,
        // Glow - pulsing rings
        glowColor: [0.4, 0.7, 1.0],
        glowIntensityMin: 1.0,
        glowIntensityMax: 1.7,
        glowPulseRate: 3,            // Matches ripple frequency
        // Ripple-specific
        concentricPulse: true,
        pulseCount: 3                // Multiple wave peaks
    },

    tide: {
        name: 'tide',
        emoji: '🌊',
        type: 'blending',
        description: 'Side-to-side fluid sway like waves',
        duration: 3500,
        beats: 4,
        intensity: 0.9,
        category: 'ambient',
        turbulence: 0.5,              // Ocean wave motion
        // 3D Element spawning - wave elements
        spawnMode: {
            type: 'surface',
            pattern: 'shell',           // Full wave coverage
            embedDepth: 0.1,
            cameraFacing: 0.3,
            clustering: 0.1,
            count: 8,
            scale: 1.0,
            models: ['wave-curl', 'splash-ring', 'droplet-large'],
            minDistance: 0.12,
            animation: {
                appearAt: 0.08,
                disappearAt: 0.88,
                stagger: 0.04,
                enter: {
                    type: 'fade',
                    duration: 0.12,
                    easing: 'easeOutQuad'
                },
                exit: {
                    type: 'fade',
                    duration: 0.15,
                    easing: 'easeInQuad'
                },
                // Procedural config - enables ProceduralWaterMaterial
                procedural: {
                    scaleSmoothing: 0.1,     // Smooth tidal motion
                    geometryStability: true
                },
                // Parameter animation: ocean wave rhythm
                parameterAnimation: {
                    waveHeight: {
                        start: 0.3,
                        peak: 0.8,
                        end: 0.4,
                        curve: 'pulse'       // Rhythmic wave pattern
                    },
                    turbulence: {
                        start: 0.2,
                        peak: 0.5,
                        end: 0.3,
                        curve: 'bell'
                    },
                    flowSpeed: {
                        start: 0.4,
                        peak: 0.7,
                        end: 0.5,
                        curve: 'sustained'
                    }
                },
                pulse: {
                    amplitude: 0.12,
                    frequency: 0.8,     // Slow tidal rhythm
                    easing: 'easeInOut',
                    sync: 'global'
                },
                drift: {
                    direction: 'tangent',
                    distance: 0.08,     // Musical timing: gentle lateral drift
                    noise: 0.1
                },
                scaleVariance: 0.2,
                lifetimeVariance: 0.15,
                blending: 'normal',
                renderOrder: 6,
                // Model-specific behavior overrides (Phase 11)
                modelOverrides: {
                    'splash-ring': {
                        scaling: { mode: 'uniform-pulse', amplitude: 0.1, frequency: 0.8 },
                        drift: { direction: 'tangent', speed: 0.015, noise: 0.1 },
                        opacityLink: 'inverse-scale',
                        // Shader animation: rotating arc for partial ring visibility
                        shaderAnimation: {
                            type: 1,  // ROTATING_ARC
                            arcWidth: 0.6,    // Wider arc for flowing tide
                            arcSpeed: 1.0,  // One rotation over gesture
                            arcCount: 2
                        }
                    },
                    'droplet-large': {
                        drift: { direction: 'tangent', speed: 0.02, noise: 0.15 }
                    },
                    'wave-curl': {
                        scaling: { mode: 'uniform-pulse', amplitude: 0.15, frequency: 0.8 },
                        rotate: { axis: 'tangent', speed: 0.02, oscillate: true, range: Math.PI / 4 }
                    },
                    'bubble-cluster': {
                        drift: { direction: 'tangent', speed: 0.015, noise: 0.2 }
                    }
                }
            }
        },
        // Tide motion - slow lateral sway
        flowFrequency: 0.4,          // Very slow
        flowAmplitude: 0.03,         // Broader movement
        flowPhaseOffset: 0,          // Simple side-to-side
        // Scale - wave-like compression
        scaleWobble: 0.02,
        scaleFrequency: 0.4,
        // Glow - ocean blue
        glowColor: [0.2, 0.5, 0.9],
        glowIntensityMin: 1.0,
        glowIntensityMax: 1.5,
        glowPulseRate: 0.4,
        // Tide-specific
        rotationSway: 0.015,         // Tilt with the sway
        verticalBob: 0.01            // Slight up/down bob
    },

    // ═══════════════════════════════════════════════════════════════════════════════════════
    // TRANSFORM VARIANTS - Mascot becoming water/fluid
    // ═══════════════════════════════════════════════════════════════════════════════════════

    liquefy: {
        name: 'liquefy',
        emoji: '💧',
        type: 'blending',
        description: 'Losing solid form, becoming fluid',
        duration: 2500,
        beats: 4,
        intensity: 1.0,
        category: 'transform',
        turbulence: 0.8,              // High turbulence - chaotic melting
        // 3D Element spawning - dripping melting water
        spawnMode: {
            type: 'surface',
            pattern: 'scattered',       // Dripping points
            embedDepth: 0.1,
            cameraFacing: 0.35,
            clustering: 0.3,
            count: 8,
            scale: 1.0,
            models: ['droplet-large', 'droplet-small', 'wave-curl'],
            minDistance: 0.1,
            animation: {
                appearAt: 0.08,
                disappearAt: 0.92,
                stagger: 0.04,
                enter: {
                    type: 'grow',       // Drips form
                    duration: 0.08,
                    easing: 'easeOutQuad'
                },
                exit: {
                    type: 'shrink',     // Drips fall away
                    duration: 0.1,
                    easing: 'easeIn'
                },
                // Procedural config - enables ProceduralWaterMaterial
                procedural: {
                    scaleSmoothing: 0.07,    // Responsive for chaotic melting
                    geometryStability: true
                },
                // Parameter animation: increasing chaos as form dissolves
                parameterAnimation: {
                    turbulence: {
                        start: 0.1,
                        peak: 1.0,           // Maximum instability
                        end: 0.8,
                        curve: 'sustained'   // Keeps building
                    },
                    transparency: {
                        start: 0.0,
                        peak: 0.7,
                        end: 0.9,
                        curve: 'linear'      // Steadily dissolving
                    }
                },
                // Minimal pulse - velocity stretch provides dynamism
                pulse: {
                    amplitude: 0.08,    // Subtle breathing
                    frequency: 1.5,
                    easing: 'easeInOut'
                },
                drift: {
                    direction: 'down',  // Dripping down
                    distance: 0.15,     // Musical timing: drips 0.15 units
                    noise: 0.05         // Minimal noise for smooth drips
                },
                scaleVariance: 0.3,
                lifetimeVariance: 0.2,
                blending: 'normal',
                renderOrder: 7,
                intensityScaling: {
                    scale: 1.2,
                    pulseAmplitude: 1.4,
                    driftSpeed: 1.3
                },
                // Model-specific behavior overrides (Phase 11)
                modelOverrides: {
                    'splash-ring': {
                        scaling: {
                            mode: 'non-uniform',
                            axes: {
                                x: { expand: true, rate: 1.5 },
                                y: { expand: false, rate: 0.4 },
                                z: { expand: true, rate: 1.5 }
                            }
                        },
                        drift: { direction: 'outward-flat', speed: 0.02, noise: 0.03 },
                        opacityLink: 'inverse-scale',
                        // Shader animation: rotating arc for partial ring visibility
                        shaderAnimation: {
                            type: 1,  // ROTATING_ARC
                            arcWidth: 0.6,
                            arcSpeed: 1.0,  // One rotation over gesture
                            arcCount: 2
                        }
                    },
                    'droplet-small': {
                        // Melting drips with velocity stretch
                        scaling: {
                            mode: 'velocity-stretch',
                            stretchFactor: 1.8,
                            minSpeed: 0.02,
                            maxStretch: 2.5
                        },
                        drift: {
                            direction: 'gravity',
                            speed: 0.05,
                            acceleration: 0.04,
                            adherence: 0.3,
                            noise: 0.01
                        },
                        // Shader animation: vertical drip stretch
                        shaderAnimation: {
                            type: 3  // DRIP_FALL
                        }
                    },
                    'droplet-large': {
                        // Heavy drips with velocity stretch
                        scaling: {
                            mode: 'velocity-stretch',
                            stretchFactor: 1.5,
                            minSpeed: 0.02,
                            maxStretch: 2.0
                        },
                        drift: {
                            direction: 'gravity',
                            speed: 0.045,
                            acceleration: 0.035,
                            adherence: 0.25,
                            noise: 0.01
                        },
                        // Shader animation: vertical drip stretch
                        shaderAnimation: {
                            type: 3  // DRIP_FALL
                        }
                    },
                    'wave-curl': {
                        scaling: { mode: 'uniform-pulse', amplitude: 0.15, frequency: 2 },
                        drift: { direction: 'tangent', speed: 0.01, noise: 0.02 }
                    },
                    'bubble-cluster': {
                        enter: { type: 'pop', duration: 0.02 },
                        drift: { direction: 'rising', speed: 0.02, buoyancy: true, noise: 0.05 }
                    }
                }
            }
        },
        // Wobble - minimal for fluid motion
        wobbleFrequency: 2,
        wobbleAmplitude: 0.01,
        wobbleDecay: 0.2,
        // Scale - irregular wobbling
        scaleWobble: 0.04,
        scaleFrequency: 3,
        // Glow - becoming translucent
        glowColor: [0.3, 0.6, 0.95],
        glowIntensityMin: 1.0,
        glowIntensityMax: 2.0,
        glowPulseRate: 5,
        // Liquefy-specific
        meltDown: true,              // Slight downward drift
        formLoss: true,              // Increasing wobble amplitude
        stretchVertical: 0.03        // Vertical stretch (dripping)
    },

    pool: {
        name: 'pool',
        emoji: '🫗',
        type: 'blending',
        description: 'Settling into a pool, spreading wide',
        duration: 2000,
        beats: 3,
        intensity: 0.8,
        category: 'transform',
        turbulence: 0.1,              // Very calm settling pool
        // 3D Element spawning - pool ripples
        spawnMode: {
            type: 'surface',
            pattern: 'ring',            // Pool at base
            embedDepth: 0.2,
            cameraFacing: 0.25,
            clustering: 0.2,
            count: 5,
            scale: 1.1,
            models: ['splash-ring', 'bubble-cluster'],
            minDistance: 0.15,
            animation: {
                appearAt: 0.1,
                disappearAt: 0.92,
                stagger: 0.06,
                enter: {
                    type: 'grow',
                    duration: 0.12,
                    easing: 'easeOutQuad'
                },
                exit: {
                    type: 'fade',
                    duration: 0.15,
                    easing: 'easeInQuad'
                },
                // Procedural config - enables ProceduralWaterMaterial
                procedural: {
                    scaleSmoothing: 0.12,    // Very smooth for calm settling
                    geometryStability: true
                },
                // Parameter animation: settling and spreading
                parameterAnimation: {
                    turbulence: {
                        start: 0.3,
                        peak: 0.2,           // Calming down
                        end: 0.05,           // Very calm pool
                        curve: 'linear'
                    },
                    spread: {
                        start: 0.2,
                        peak: 1.0,
                        end: 0.9,
                        curve: 'sustained'   // Spreads and holds
                    },
                    depth: {
                        start: 0.1,
                        peak: 0.6,
                        end: 0.5,
                        curve: 'bell'
                    }
                },
                pulse: {
                    amplitude: 0.08,
                    frequency: 1.5,
                    easing: 'easeInOut'
                },
                drift: {
                    direction: 'outward',
                    distance: 0.12,     // Musical timing: spreading outward
                    noise: 0.05
                },
                scaleVariance: 0.15,
                lifetimeVariance: 0.1,
                blending: 'normal',
                renderOrder: 5,
                // Model-specific behavior overrides (Phase 11)
                modelOverrides: {
                    'splash-ring': {
                        scaling: {
                            mode: 'non-uniform',
                            axes: {
                                x: { expand: true, rate: 1.3 },
                                y: { expand: false, rate: 0.3 },
                                z: { expand: true, rate: 1.3 }
                            },
                            easing: 'easeOutQuad'
                        },
                        drift: { direction: 'outward-flat', speed: 0.02 },
                        opacityLink: 'inverse-scale',
                        // Shader animation: rotating arc for partial ring visibility
                        shaderAnimation: {
                            type: 1,  // ROTATING_ARC
                            arcWidth: 0.6,
                            arcSpeed: 1.0,  // One rotation over gesture
                            arcCount: 2
                        }
                    },
                    'bubble-cluster': {
                        drift: { direction: 'rising', speed: 0.025, buoyancy: true },
                        exit: { type: 'pop', duration: 0.03 }
                    }
                }
            }
        },
        // Wobble - gentle settling ripples
        wobbleFrequency: 2,
        wobbleAmplitude: 0.015,
        wobbleDecay: 0.5,
        // Scale - squash (flatten)
        scaleWobble: 0.01,
        scaleFrequency: 1,
        scaleSquash: 0.08,           // Flatten vertically
        scaleStretch: 0.05,          // Spread horizontally
        // Glow - calm pool
        glowColor: [0.25, 0.55, 0.9],
        glowIntensityMin: 1.1,
        glowIntensityMax: 1.4,
        glowPulseRate: 1,
        // Pool-specific
        settleDown: 0.03,            // Sink downward
        spreadOut: true
    },

    // ═══════════════════════════════════════════════════════════════════════════════════════
    // PHASE 13: AXIS CHOREOGRAPHY GESTURES
    // ═══════════════════════════════════════════════════════════════════════════════════════

    vortex: {
        name: 'vortex',
        emoji: '🌀',
        type: 'blending',
        description: 'Spiraling water vortex rising from feet to head',
        duration: 2500,
        beats: 4,
        intensity: 1.1,
        category: 'transform',
        turbulence: 0.8,
        // 3D Element spawning - spiral formation traveling up axis
        spawnMode: {
            type: 'axis-travel',
            formation: {
                type: 'spiral',
                count: 5,
                spacing: 0.12,
                arcOffset: 72,          // 360/5 = evenly distributed spiral
                phaseOffset: 0.04       // Staggered travel for flowing effect
            },
            axisTravel: {
                axis: 'y',
                start: 'bottom',
                end: 'top',
                easing: 'easeInOut',
                startDiameter: 0.6,     // Tighter at bottom
                endDiameter: 1.2        // Wider at top (expanding vortex)
            },
            count: 5,
            scale: 1.0,
            models: ['splash-ring'],
            animation: {
                appearAt: 0.05,
                disappearAt: 0.95,
                stagger: 0.02,
                enter: {
                    type: 'grow',
                    duration: 0.08,
                    easing: 'easeOutQuad'
                },
                exit: {
                    type: 'fade',
                    duration: 0.1,
                    easing: 'easeIn'
                },
                procedural: {
                    scaleSmoothing: 0.08,
                    geometryStability: true
                },
                parameterAnimation: {
                    turbulence: {
                        start: 0.4,
                        peak: 0.9,
                        end: 0.5,
                        curve: 'bell'
                    }
                },
                modelOverrides: {
                    'splash-ring': {
                        shaderAnimation: {
                            type: 1,        // ROTATING_ARC
                            arcWidth: 0.4,  // Tighter arc for vortex
                            arcSpeed: 2.0,  // 2 rotations over gesture
                            arcCount: 2
                        }
                    }
                }
            }
        },
        // Wobble - swirling motion
        wobbleFrequency: 4,
        wobbleAmplitude: 0.02,
        wobbleDecay: 0.3,
        // Glow - water vortex glow
        glowColor: [0.2, 0.5, 0.9],
        glowIntensityMin: 1.2,
        glowIntensityMax: 1.6,
        glowPulseRate: 2,
        // Vortex-specific
        swirl: true,
        riseSpeed: 0.03
    }
};

// ═══════════════════════════════════════════════════════════════════════════════════════
// SMOOTH NOISE FOR ORGANIC MOTION
// ═══════════════════════════════════════════════════════════════════════════════════════

function smoothNoise(x) {
    // Combination of sine waves at different frequencies for organic motion
    return (
        Math.sin(x * 1.0) * 0.5 +
        Math.sin(x * 2.3 + 1.3) * 0.3 +
        Math.sin(x * 4.1 + 2.7) * 0.2
    );
}

function smoothNoise2(x, y) {
    return (
        Math.sin(x * 1.0 + y * 0.7) * 0.4 +
        Math.sin(x * 1.7 - y * 1.3 + 1.5) * 0.35 +
        Math.sin(x * 2.9 + y * 2.1 + 3.2) * 0.25
    );
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// WATER EFFECT GESTURE FACTORY
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Create a water effect gesture (no shatter, just fluid visuals)
 *
 * @param {string} variant - 'splash', 'drench', 'soak', 'flow', 'ripple', 'tide', 'liquefy', 'pool'
 * @returns {Object} Gesture configuration
 */
export function createWaterEffectGesture(variant) {
    const config = WATER_EFFECT_VARIANTS[variant];
    if (!config) {
        console.warn(`Unknown water effect variant: ${variant}`);
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
            syncMode: 'phrase',
            amplitudeSync: {
                onBeat: 1.3,
                offBeat: 1.0,
                curve: 'smooth'        // Smooth for water, not sharp
            }
        },

        /**
         * 3D core transformation for water effect
         * Handles impact (burst), ambient (flow), and transform (liquefy) variants
         */
        '3d': {
            evaluate(progress, motion) {
                const cfg = { ...config, ...motion };
                const time = progress * cfg.duration / 1000; // Convert to seconds
                const {category} = cfg;

                // ═══════════════════════════════════════════════════════════════
                // EFFECT STRENGTH - Varies by category
                // ═══════════════════════════════════════════════════════════════
                let effectStrength = 1.0;

                // Impact: burst then decay
                if (category === 'impact') {
                    if (cfg.impactBurst && progress < cfg.burstDuration) {
                        // Burst phase - quick ramp up
                        effectStrength = progress / cfg.burstDuration;
                        effectStrength = Math.pow(effectStrength, 0.3); // Fast attack
                    } else if (cfg.rampUp) {
                        // Soak - gradual build
                        effectStrength = Math.pow(progress, 0.5);
                    } else {
                        // Standard decay
                        const decayStart = cfg.burstDuration || 0.2;
                        if (progress > decayStart) {
                            const decayProgress = (progress - decayStart) / (1 - decayStart);
                            effectStrength = 1 - Math.pow(decayProgress, cfg.wobbleDecay + 0.5);
                        }
                    }
                }

                // Transform: increasing effect
                if (category === 'transform') {
                    if (cfg.formLoss) {
                        // Liquefy - wobble increases
                        effectStrength = 0.3 + progress * 0.7;
                    } else {
                        // Pool - settle then stable
                        effectStrength = Math.min(progress * 2, 1.0);
                    }
                }

                // Ambient: sustained with gentle pulse
                if (category === 'ambient') {
                    const pulse = Math.sin(progress * Math.PI * 2) * 0.1;
                    effectStrength = 0.8 + pulse + progress * 0.2;
                }

                // Fade out in final phase
                if (progress > 0.85) {
                    const fadeProgress = (progress - 0.85) / 0.15;
                    effectStrength *= (1 - fadeProgress);
                }

                // ═══════════════════════════════════════════════════════════════
                // POSITION - Flowing/wobbling motion
                // ═══════════════════════════════════════════════════════════════
                let posX = 0, posY = 0, posZ = 0;

                if (cfg.flowFrequency) {
                    // Flow motion - smooth S-curve
                    const flowTime = time * cfg.flowFrequency * Math.PI * 2;
                    posX = Math.sin(flowTime) * cfg.flowAmplitude * effectStrength;

                    if (cfg.flowPhaseOffset) {
                        // S-curve: Y moves opposite to create wave
                        posY = Math.sin(flowTime + Math.PI * cfg.flowPhaseOffset) *
                               cfg.flowAmplitude * 0.5 * effectStrength;
                    }

                    if (cfg.verticalBob) {
                        posY += Math.sin(flowTime * 0.5) * cfg.verticalBob * effectStrength;
                    }
                }

                if (cfg.wobbleAmplitude > 0) {
                    // Wobble motion - multi-frequency for organic feel
                    const wobbleTime = time * cfg.wobbleFrequency;
                    let wobbleStrength = cfg.wobbleAmplitude * effectStrength;

                    // Negative decay = increasing wobble (liquefy)
                    if (cfg.wobbleDecay < 0) {
                        wobbleStrength *= (1 + progress * Math.abs(cfg.wobbleDecay) * 2);
                    }

                    posX += smoothNoise(wobbleTime) * wobbleStrength;
                    posY += smoothNoise(wobbleTime + 33) * wobbleStrength * 0.7;
                    posZ += smoothNoise(wobbleTime + 66) * wobbleStrength * 0.5;
                }

                // Sink/settle effects
                if (cfg.sinkAmount) {
                    posY -= cfg.sinkAmount * effectStrength;
                }
                if (cfg.settleDown) {
                    posY -= cfg.settleDown * progress * effectStrength;
                }
                if (cfg.meltDown) {
                    posY -= 0.02 * progress * effectStrength;
                }

                // ═══════════════════════════════════════════════════════════════
                // ROTATION - Fluid sway
                // ═══════════════════════════════════════════════════════════════
                let rotX = 0, rotY = 0, rotZ = 0;

                if (cfg.rotationFlow) {
                    // Gentle rotation drift
                    rotY = time * cfg.rotationFlow * effectStrength;
                }

                if (cfg.rotationSway) {
                    // Tilt with flow motion
                    const swayTime = time * (cfg.flowFrequency || 1) * Math.PI * 2;
                    rotZ = Math.sin(swayTime) * cfg.rotationSway * effectStrength;
                }

                // Wobble adds slight rotation instability
                if (cfg.wobbleAmplitude > 0 && category !== 'ambient') {
                    const wobbleTime = time * cfg.wobbleFrequency;
                    const rotWobble = cfg.wobbleAmplitude * 0.3 * effectStrength;
                    rotX += smoothNoise(wobbleTime * 0.7 + 100) * rotWobble;
                    rotZ += smoothNoise(wobbleTime * 0.9 + 150) * rotWobble;
                }

                // ═══════════════════════════════════════════════════════════════
                // SCALE - Wobble, breathing, squash/stretch
                // ═══════════════════════════════════════════════════════════════
                let scale = 1.0;
                let scaleX = 1.0, scaleY = 1.0, scaleZ = 1.0;

                // Base scale wobble
                if (cfg.scaleWobble) {
                    const scaleTime = time * cfg.scaleFrequency * Math.PI * 2;
                    const scaleWave = Math.sin(scaleTime) * 0.5 + 0.5; // 0-1

                    if (cfg.concentricPulse && cfg.pulseCount) {
                        // Multiple ripple peaks
                        const multiPulse = Math.sin(scaleTime * cfg.pulseCount) * 0.5 + 0.5;
                        scale = 1.0 + multiPulse * cfg.scaleWobble * effectStrength;
                    } else {
                        scale = 1.0 + scaleWave * cfg.scaleWobble * effectStrength;
                    }
                }

                // Growth (soak absorbing water)
                if (cfg.scaleGrowth) {
                    scale += cfg.scaleGrowth * progress * effectStrength;
                }

                // Compression (drench weight)
                if (cfg.scaleCompression) {
                    scale += cfg.scaleCompression * effectStrength;
                }

                // Squash and stretch (pool settling)
                if (cfg.scaleSquash) {
                    scaleY = scale - cfg.scaleSquash * progress * effectStrength;
                    scaleX = scale + (cfg.scaleStretch || cfg.scaleSquash * 0.5) * progress * effectStrength;
                    scaleZ = scaleX;
                } else if (cfg.stretchVertical) {
                    // Liquefy drip stretch
                    scaleY = scale + cfg.stretchVertical * progress * effectStrength;
                    scaleX = scale - cfg.stretchVertical * 0.3 * progress * effectStrength;
                    scaleZ = scaleX;
                } else {
                    scaleX = scaleY = scaleZ = scale;
                }

                // ═══════════════════════════════════════════════════════════════
                // GLOW - Wet sheen, pulsing
                // ═══════════════════════════════════════════════════════════════
                const glowTime = time * cfg.glowPulseRate * Math.PI * 2;
                let glowPulse = Math.sin(glowTime) * 0.5 + 0.5; // 0-1

                // Impact burst glow
                if (cfg.impactBurst && progress < cfg.burstDuration) {
                    glowPulse = 1.0;
                }

                // Saturation build
                if (cfg.saturationBuild) {
                    glowPulse = Math.max(glowPulse, progress);
                }

                const glowIntensity = cfg.glowIntensityMin +
                    (cfg.glowIntensityMax - cfg.glowIntensityMin) * glowPulse * effectStrength;

                const glowBoost = glowPulse * 0.6 * effectStrength * cfg.intensity;

                // ═══════════════════════════════════════════════════════════════
                // RETURN TRANSFORMATION
                // ═══════════════════════════════════════════════════════════════
                return {
                    position: [posX, posY, posZ],
                    rotation: [rotX, rotY, rotZ],
                    scale: (scaleX + scaleY + scaleZ) / 3, // Average for uniform
                    scaleXYZ: [scaleX, scaleY, scaleZ],    // Non-uniform if needed
                    glowIntensity,
                    glowBoost,
                    glowColorOverride: cfg.glowColor,
                    waterOverlay: {
                        enabled: effectStrength > 0.1,
                        strength: effectStrength * cfg.intensity,
                        wetness: effectStrength * cfg.intensity,
                        turbulence: cfg.turbulence,
                        category: cfg.category,
                        spawnMode: cfg.spawnMode || null,
                        duration: cfg.duration,
                        progress,
                        time,
                        // Phase 11: Pass animation config to ElementSpawner
                        // Use config.spawnMode (not cfg.spawnMode) because motion may override with string
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

// ═══════════════════════════════════════════════════════════════════════════════════════
// PRE-BUILT GESTURES
// ═══════════════════════════════════════════════════════════════════════════════════════

// Impact variants (water hitting mascot)
export const splash = createWaterEffectGesture('splash');
export const drench = createWaterEffectGesture('drench');
export const soak = createWaterEffectGesture('soak');

// Ambient variants (emanating water/fluid)
export const flow = createWaterEffectGesture('flow');
export const ripple = createWaterEffectGesture('ripple');
export const tide = createWaterEffectGesture('tide');

// Transform variants (becoming water)
export const liquefy = createWaterEffectGesture('liquefy');
export const pool = createWaterEffectGesture('pool');

// Axis choreography variants (Phase 13)
export const vortex = createWaterEffectGesture('vortex');

export {
    WATER_EFFECT_VARIANTS
};

export default {
    // Impact
    splash,
    drench,
    soak,
    // Ambient
    flow,
    ripple,
    tide,
    // Transform
    liquefy,
    pool,
    // Axis choreography
    vortex,
    // Factory
    createWaterEffectGesture,
    WATER_EFFECT_VARIANTS
};
