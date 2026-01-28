/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Hold Animation Functions
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Pure functions for computing continuous hold animation values
 * @module effects/animation/HoldAnimations
 *
 * These functions compute animation values without side effects.
 * They can be used standalone or composed together.
 *
 * All functions take a config object and time/state parameters,
 * returning a modifier value or offset.
 */

// ═══════════════════════════════════════════════════════════════════════════════════════
// PULSE ANIMATION - Scale oscillation
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Calculate pulse scale modifier
 *
 * @param {Object} config - Pulse configuration
 * @param {number} config.amplitude - Scale variation (e.g., 0.1 = ±10%)
 * @param {number} config.frequency - Pulses per second
 * @param {number} time - Current time in seconds
 * @param {number} [phaseOffset=0] - Phase offset for staggered sync
 * @returns {number} Scale modifier (multiply with base scale)
 *
 * @example
 * const scaleMod = calculatePulse({ amplitude: 0.15, frequency: 2 }, time);
 * mesh.scale.setScalar(baseScale * scaleMod);
 */
export function calculatePulse(config, time, phaseOffset = 0) {
    const { amplitude = 0.1, frequency = 2 } = config;
    const phase = (time + phaseOffset) * frequency * Math.PI * 2;
    const wave = Math.sin(phase);
    return 1 + wave * amplitude;
}

/**
 * Calculate pulse with easing applied
 *
 * @param {Object} config - Pulse configuration with easing
 * @param {number} config.amplitude - Scale variation
 * @param {number} config.frequency - Pulses per second
 * @param {Function} [config.easing] - Easing function to apply
 * @param {number} time - Current time in seconds
 * @param {number} [phaseOffset=0] - Phase offset
 * @returns {number} Scale modifier
 */
export function calculatePulseEased(config, time, phaseOffset = 0) {
    const { amplitude = 0.1, frequency = 2, easing } = config;

    // Get position in pulse cycle (0-1)
    const cyclePosition = ((time + phaseOffset) * frequency) % 1;

    // Apply easing to create shaped wave
    let wave;
    if (easing) {
        // Shape the wave using easing
        if (cyclePosition < 0.5) {
            wave = easing(cyclePosition * 2) * 2 - 1;  // -1 to 1
        } else {
            wave = 1 - easing((cyclePosition - 0.5) * 2) * 2;  // 1 to -1
        }
    } else {
        wave = Math.sin(cyclePosition * Math.PI * 2);
    }

    return 1 + wave * amplitude;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// FLICKER ANIMATION - Opacity variation
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Seeded random number generator for deterministic flicker
 * @param {number} seed - Random seed
 * @returns {Function} Seeded random function
 */
function createSeededRandom(seed) {
    let state = seed;
    return () => {
        state = (state * 1103515245 + 12345) & 0x7fffffff;
        return state / 0x7fffffff;
    };
}

/**
 * Calculate flicker opacity modifier
 *
 * @param {Object} config - Flicker configuration
 * @param {number} config.intensity - Opacity variation (e.g., 0.3 = ±30%)
 * @param {number} config.rate - Flickers per second
 * @param {string} [config.pattern='random'] - 'random' | 'sine' | 'square' | 'noise'
 * @param {number} [config.seed] - Optional seed for deterministic flicker
 * @param {number} time - Current time in seconds
 * @param {number} [prevValue=1] - Previous flicker value (for smoothing)
 * @returns {number} Opacity modifier (multiply with base opacity)
 *
 * @example
 * const opacityMod = calculateFlicker({ intensity: 0.3, rate: 12 }, time);
 * material.opacity = baseOpacity * opacityMod;
 */
export function calculateFlicker(config, time, prevValue = 1) {
    const { intensity = 0.2, rate = 10, pattern = 'random', seed = null } = config;

    switch (pattern) {
    case 'sine': {
        const phase = time * rate * Math.PI * 2;
        return 1 + Math.sin(phase) * intensity;
    }

    case 'square': {
        const phase = (time * rate) % 1;
        return phase < 0.5 ? (1 + intensity) : (1 - intensity);
    }

    case 'noise': {
        // Perlin-like noise approximation
        const t = time * rate;
        const n1 = Math.sin(t * 1.0) * 0.5;
        const n2 = Math.sin(t * 2.3) * 0.25;
        const n3 = Math.sin(t * 5.7) * 0.125;
        const noise = (n1 + n2 + n3) / 0.875; // Normalize to -1..1
        return 1 + noise * intensity;
    }

    case 'random':
    default: {
        // Use seeded random if provided, otherwise true random
        const random = seed !== null
            ? createSeededRandom(seed + Math.floor(time * rate))()
            : Math.random();

        // Smooth transition between random values
        const targetValue = 1 + (random * 2 - 1) * intensity;
        const smoothing = Math.min(rate * 0.016, 1); // ~60fps smoothing
        return prevValue + (targetValue - prevValue) * smoothing;
    }
    }
}

/**
 * Calculate multi-layer flicker for more complex effects
 *
 * @param {Object} config - Flicker configuration
 * @param {number} time - Current time
 * @param {Object} layers - Layer configuration
 * @returns {number} Combined flicker value
 */
export function calculateLayeredFlicker(config, time, layers = {}) {
    const {
        baseRate = config.rate || 10,
        baseIntensity = config.intensity || 0.2,
        layers: numLayers = 3,
        layerScale = 0.5  // Each layer is half the intensity of previous
    } = layers;

    let result = 1;
    for (let i = 0; i < numLayers; i++) {
        const layerConfig = {
            intensity: baseIntensity * Math.pow(layerScale, i),
            rate: baseRate * Math.pow(2, i),
            pattern: 'sine'
        };
        result *= calculateFlicker(layerConfig, time);
    }

    return result;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// DRIFT ANIMATION - Position offset
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Calculate drift position offset
 * Uses musical timing: distance = total drift over gesture lifetime
 *
 * @param {Object} config - Drift configuration
 * @param {string} config.direction - 'outward' | 'inward' | 'up' | 'down' | 'tangent' | 'random'
 * @param {number} config.distance - Total drift distance over gesture lifetime
 * @param {number} config.gestureDuration - Gesture duration in ms (for calculating per-frame movement)
 * @param {boolean} [config.bounce=false] - Bounce at boundary vs clamp
 * @param {number} [config.noise=0] - Random noise amount (0-1)
 * @param {Object} currentOffset - Current offset { x, y, z }
 * @param {number} deltaTime - Time since last frame in seconds
 * @returns {Object} New offset { x, y, z }
 *
 * @example
 * const offset = calculateDrift(config, currentOffset, deltaTime);
 * mesh.position.add(new THREE.Vector3(offset.x, offset.y, offset.z));
 */
export function calculateDrift(config, currentOffset, deltaTime) {
    const {
        direction = 'outward',
        distance = 0.1,
        gestureDuration = 1000,
        bounce = false,
        noise = 0
    } = config;

    // Clone current offset
    const offset = {
        x: currentOffset.x || 0,
        y: currentOffset.y || 0,
        z: currentOffset.z || 0
    };

    // Calculate per-frame increment from total distance and gesture duration
    const increment = (distance / gestureDuration) * deltaTime;

    // Add noise if configured
    const noiseX = noise > 0 ? (Math.random() - 0.5) * noise * increment : 0;
    const noiseY = noise > 0 ? (Math.random() - 0.5) * noise * increment : 0;
    const noiseZ = noise > 0 ? (Math.random() - 0.5) * noise * increment : 0;

    // Apply direction-based movement
    switch (direction) {
    case 'outward': {
        // Move away from origin
        offset.x += (offset.x || 0.001) > 0 ? increment + noiseX : -increment + noiseX;
        offset.y += (offset.y || 0.001) > 0 ? increment + noiseY : -increment + noiseY;
        offset.z += (offset.z || 0.001) > 0 ? increment + noiseZ : -increment + noiseZ;
        break;
    }

    case 'inward': {
        // Move toward origin
        offset.x -= (offset.x || 0.001) > 0 ? increment : -increment;
        offset.y -= (offset.y || 0.001) > 0 ? increment : -increment;
        offset.z -= (offset.z || 0.001) > 0 ? increment : -increment;
        break;
    }

    case 'up':
        offset.y += increment + noiseY;
        break;

    case 'down':
        offset.y -= increment + noiseY;
        break;

    case 'tangent':
        // Flow along surface (horizontal drift)
        offset.x += increment + noiseX;
        offset.z += noiseZ;
        break;

    case 'random': {
        offset.x += (Math.random() - 0.5) * increment * 2;
        offset.y += (Math.random() - 0.5) * increment * 2;
        offset.z += (Math.random() - 0.5) * increment * 2;
        break;
    }
    }

    // Clamp to distance limit (the configured total distance is the max)
    const dist = Math.sqrt(offset.x ** 2 + offset.y ** 2 + offset.z ** 2);

    if (dist > distance) {
        if (bounce) {
            // Reflect direction
            const scale = -distance / dist;
            offset.x *= scale;
            offset.y *= scale;
            offset.z *= scale;
        } else {
            // Clamp to max distance
            const scale = distance / dist;
            offset.x *= scale;
            offset.y *= scale;
            offset.z *= scale;
        }
    }

    return offset;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// ROTATE ANIMATION - Rotation offset
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Calculate rotation offset
 *
 * @param {Object} config - Rotate configuration
 * @param {Array|string} config.axis - [x, y, z] or 'x' | 'y' | 'z' | 'random'
 * @param {number} config.speed - Radians per second
 * @param {boolean} [config.oscillate=false] - Back and forth vs continuous
 * @param {number} [config.range] - Oscillation range in radians
 * @param {Object} currentRotation - Current rotation offset { x, y, z }
 * @param {number} time - Current time (for oscillation)
 * @param {number} deltaTime - Time since last frame (for continuous)
 * @returns {Object} New rotation offset { x, y, z }
 */
export function calculateRotation(config, currentRotation, time, deltaTime) {
    const {
        axis = [0, 1, 0],
        speed = 0.1,
        oscillate = false,
        range = Math.PI / 4
    } = config;

    // Normalize axis
    let axisVec = axis;
    if (typeof axis === 'string') {
        axisVec = axis === 'x' ? [1, 0, 0] :
            axis === 'y' ? [0, 1, 0] :
                axis === 'z' ? [0, 0, 1] :
                    [Math.random(), Math.random(), Math.random()];
    }

    const rotation = {
        x: currentRotation.x || 0,
        y: currentRotation.y || 0,
        z: currentRotation.z || 0
    };

    if (oscillate) {
        // Oscillating rotation
        const phase = time * speed * 2;
        const wave = Math.sin(phase);
        rotation.x = axisVec[0] * wave * range;
        rotation.y = axisVec[1] * wave * range;
        rotation.z = axisVec[2] * wave * range;
    } else {
        // Continuous rotation
        const delta = speed * deltaTime;
        rotation.x += axisVec[0] * delta;
        rotation.y += axisVec[1] * delta;
        rotation.z += axisVec[2] * delta;
    }

    return rotation;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// EMISSIVE ANIMATION - Glow intensity
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Calculate emissive intensity
 *
 * @param {Object} config - Emissive configuration
 * @param {number} config.min - Minimum emissive intensity
 * @param {number} config.max - Maximum emissive intensity
 * @param {number} config.frequency - Cycles per second
 * @param {string} [config.pattern='sine'] - 'sine' | 'sawtooth' | 'pulse' | 'triangle'
 * @param {number} [config.dutyCycle=0.5] - For pulse pattern, portion that's "on"
 * @param {number} time - Current time in seconds
 * @returns {number} Emissive intensity value
 *
 * @example
 * const emissive = calculateEmissive({ min: 0.5, max: 1.5, frequency: 0.5 }, time);
 * material.emissiveIntensity = emissive;
 */
export function calculateEmissive(config, time) {
    const {
        min = 0.5,
        max = 1.5,
        frequency = 1,
        pattern = 'sine',
        dutyCycle = 0.5
    } = config;

    const range = max - min;
    let t; // 0-1 wave position

    switch (pattern) {
    case 'sine': {
        const phase = time * frequency * Math.PI * 2;
        t = (Math.sin(phase) + 1) / 2;
        break;
    }

    case 'sawtooth': {
        t = (time * frequency) % 1;
        break;
    }

    case 'triangle': {
        const phase = (time * frequency) % 1;
        t = phase < 0.5 ? phase * 2 : 2 - phase * 2;
        break;
    }

    case 'pulse': {
        const phase = (time * frequency) % 1;
        t = phase < dutyCycle ? 1 : 0;
        break;
    }

    default:
        t = 0.5;
    }

    return min + t * range;
}

/**
 * Calculate breathing emissive (smooth, organic glow)
 *
 * @param {Object} config - Configuration
 * @param {number} time - Current time
 * @returns {number} Emissive intensity
 */
export function calculateBreathingEmissive(config, time) {
    const { min = 0.5, max = 1.5, frequency = 0.5 } = config;

    // Use smoothstep-shaped breathing curve
    const phase = (time * frequency) % 1;
    const t = phase * phase * (3 - 2 * phase); // Smoothstep
    const wave = Math.sin(t * Math.PI);

    return min + wave * (max - min);
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// COMBINED HOLD ANIMATION UPDATE
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Calculate all hold animation values at once
 *
 * @param {Object} holdConfig - Hold animations config (from AnimationConfig)
 * @param {Object} state - Current animation state
 * @param {number} time - Current time in seconds
 * @param {number} deltaTime - Time since last frame
 * @returns {Object} Animation values { scaleMod, opacityMod, emissive, driftOffset, rotationOffset }
 */
export function calculateHoldAnimations(holdConfig, state, time, deltaTime) {
    const result = {
        scaleMod: 1,
        opacityMod: 1,
        emissive: 1,
        driftOffset: state.driftOffset || { x: 0, y: 0, z: 0 },
        rotationOffset: state.rotationOffset || { x: 0, y: 0, z: 0 }
    };

    if (!holdConfig) return result;

    // Pulse
    if (holdConfig.pulse) {
        result.scaleMod = calculatePulse(holdConfig.pulse, time, state.pulsePhase || 0);
    }

    // Flicker
    if (holdConfig.flicker) {
        result.opacityMod = calculateFlicker(holdConfig.flicker, time, state.flickerValue || 1);
    }

    // Emissive
    if (holdConfig.emissive) {
        result.emissive = calculateEmissive(holdConfig.emissive, time);
    }

    // Drift
    if (holdConfig.drift) {
        result.driftOffset = calculateDrift(
            holdConfig.drift,
            state.driftOffset || { x: 0, y: 0, z: 0 },
            deltaTime
        );
    }

    // Rotate
    if (holdConfig.rotate) {
        result.rotationOffset = calculateRotation(
            holdConfig.rotate,
            state.rotationOffset || { x: 0, y: 0, z: 0 },
            time,
            deltaTime
        );
    }

    return result;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// NON-UNIFORM SCALING - Model behavior based axis scaling
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Calculate non-uniform scale based on model behavior
 *
 * @param {Object} behavior - Model behavior config from MODEL_BEHAVIORS
 * @param {number} time - Current time in seconds
 * @param {number} progress - Animation progress 0-1
 * @param {Object} [velocity] - Current velocity { x, y, z } for velocity-linked scaling
 * @returns {{ x: number, y: number, z: number }} Scale multipliers per axis
 *
 * @example
 * const nuScale = calculateNonUniformScale(behavior, time, progress, velocity);
 * mesh.scale.set(baseScale * nuScale.x, baseScale * nuScale.y, baseScale * nuScale.z);
 */
export function calculateNonUniformScale(behavior, time, progress, velocity = null) {
    if (!behavior?.scaling) {
        return { x: 1, y: 1, z: 1 };
    }

    const { scaling } = behavior;

    // Uniform pulse mode - simple breathing
    if (scaling.mode === 'uniform-pulse') {
        const pulse = 1 + Math.sin(time * scaling.frequency * Math.PI * 2) * scaling.amplitude;
        return { x: pulse, y: pulse, z: pulse };
    }

    // Non-uniform mode - per-axis control
    if (scaling.mode === 'non-uniform') {
        const result = { x: 1, y: 1, z: 1 };

        for (const axis of ['x', 'y', 'z']) {
            const axisConfig = scaling.axes?.[axis];
            if (!axisConfig) continue;

            let scale = 1;

            // Base expansion/contraction over time
            if (axisConfig.expand) {
                scale += progress * axisConfig.rate;
            } else {
                scale -= progress * (1 - axisConfig.rate) * 0.5;
            }

            // Oscillation for wobble effect
            if (axisConfig.oscillate) {
                scale += Math.sin(time * 3) * 0.1;
            }

            // Velocity-linked scaling (for droplet elongation during fall)
            if (scaling.velocityLink === axis && velocity) {
                const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y + velocity.z * velocity.z);
                scale += speed * 0.5;
            }

            result[axis] = Math.max(0.1, scale);
        }

        // Wobble effect - alternating X/Z for organic movement
        if (scaling.wobbleFrequency) {
            const wobble = Math.sin(time * scaling.wobbleFrequency * Math.PI * 2);
            const wobbleAmp = scaling.wobbleAmplitude || 0.1;
            result.x += wobble * wobbleAmp;
            result.z -= wobble * wobbleAmp;
        }

        return result;
    }

    return { x: 1, y: 1, z: 1 };
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// PHYSICS DRIFT - Gravity, rising, adherence based movement
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Calculate physics-aware drift for elemental models
 * Supports: gravity (water/nature), rising (fire/bubbles), outward-flat (rings/cracks)
 *
 * @param {Object} driftConfig - Drift configuration from MODEL_BEHAVIORS
 * @param {number} time - Elapsed time in seconds
 * @param {number} deltaTime - Frame delta in seconds
 * @param {Object} [surfaceNormal] - Surface normal { x, y, z } at spawn point
 * @param {Object} [currentOffset] - Current offset { x, y, z }
 * @returns {{ x: number, y: number, z: number }} Drift offset
 *
 * @example
 * const offset = calculatePhysicsDrift(driftConfig, time, deltaTime, normal);
 * mesh.position.add(new THREE.Vector3(offset.x, offset.y, offset.z));
 */
export function calculatePhysicsDrift(driftConfig, time, deltaTime, surfaceNormal = null, currentOffset = null) {
    if (!driftConfig) {
        return { x: 0, y: 0, z: 0 };
    }

    const offset = { x: 0, y: 0, z: 0 };
    const speed = driftConfig.speed || 0.02;
    const noise = driftConfig.noise || 0;

    switch (driftConfig.direction) {
    case 'gravity': {
        // Surface adherence phase - droplets cling before falling
        const adherenceTime = driftConfig.adherence || 0;
        if (adherenceTime > 0 && time < adherenceTime) {
            // Clinging to surface - minimal drift with slight outward
            const clingProgress = time / adherenceTime;
            const clingStrength = 1 - clingProgress;
            if (surfaceNormal) {
                offset.x = surfaceNormal.x * 0.01 * clingStrength;
                offset.z = surfaceNormal.z * 0.01 * clingStrength;
            }
        } else {
            // Falling phase with acceleration
            const fallTime = time - adherenceTime;
            const accel = driftConfig.acceleration || 0.01;
            const fallSpeed = speed + fallTime * accel;
            offset.y = -fallSpeed * fallTime;
        }
        break;
    }

    case 'rising': {
        // Buoyant rise with optional acceleration
        let riseSpeed = speed;
        if (driftConfig.buoyancy) {
            riseSpeed += time * 0.01;  // Accelerates upward
        }
        offset.y = riseSpeed * time;

        // Wobbly horizontal drift
        if (noise > 0) {
            offset.x = Math.sin(time * 2.3) * noise * 0.1;
            offset.z = Math.cos(time * 1.7) * noise * 0.1;
        }
        break;
    }

    case 'outward-flat': {
        // Expand in XZ plane only (for rings, cracks, patches)
        const expandDist = speed * time;
        if (surfaceNormal) {
            // Project outward in surface plane
            offset.x = surfaceNormal.x * expandDist;
            offset.z = surfaceNormal.z * expandDist;
        } else {
            // Default radial expansion
            const angle = currentOffset ?
                Math.atan2(currentOffset.z, currentOffset.x) :
                Math.random() * Math.PI * 2;
            offset.x = Math.cos(angle) * expandDist;
            offset.z = Math.sin(angle) * expandDist;
        }
        // No Y drift
        break;
    }

    case 'outward': {
        // Radial expansion in all directions
        const expandDist = speed * time;
        if (surfaceNormal) {
            offset.x = surfaceNormal.x * expandDist;
            offset.y = surfaceNormal.y * expandDist;
            offset.z = surfaceNormal.z * expandDist;
        }
        if (noise > 0) {
            offset.x += (Math.random() - 0.5) * noise * expandDist;
            offset.y += (Math.random() - 0.5) * noise * expandDist;
            offset.z += (Math.random() - 0.5) * noise * expandDist;
        }
        break;
    }

    case 'tangent': {
        // Flow along surface (for waves, vines)
        const tangentDist = speed * time;
        // Surface adherence keeps it close
        if (driftConfig.adherence && surfaceNormal) {
            offset.x = -surfaceNormal.z * tangentDist;  // Perpendicular to normal
            offset.z = surfaceNormal.x * tangentDist;
        }
        if (noise > 0) {
            offset.x += Math.sin(time * 1.5) * noise * 0.05;
            offset.z += Math.cos(time * 1.8) * noise * 0.05;
        }
        break;
    }

    case 'random': {
        // Chaotic movement (sparks, particles)
        if (noise > 0) {
            offset.x = (Math.random() - 0.5) * speed * deltaTime * 10;
            offset.y = (Math.random() - 0.5) * speed * deltaTime * 10;
            offset.z = (Math.random() - 0.5) * speed * deltaTime * 10;
        }
        break;
    }
    }

    return offset;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// OPACITY LINK - Scale/flicker based opacity modifiers
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Calculate opacity modifier based on opacity link type
 *
 * @param {string} opacityLink - 'inverse-scale' | 'flicker' | null
 * @param {Object} scale - Current scale { x, y, z }
 * @param {number} time - Current time in seconds
 * @param {number} [seed=0] - Seed for deterministic flicker
 * @returns {number} Opacity multiplier 0-1
 */
export function calculateOpacityLink(opacityLink, scale, time, seed = 0) {
    if (!opacityLink) {
        return 1;
    }

    switch (opacityLink) {
    case 'inverse-scale': {
        // Fade as scale increases (for expanding rings, bursts)
        const avgScale = (scale.x + scale.y + scale.z) / 3;
        // Map scale 1-3 to opacity 1-0
        return Math.max(0, Math.min(1, 2 - avgScale));
    }

    case 'flicker': {
        // Random flicker (for embers, sparks, electricity)
        const flickerFreq = 8;
        const flickerAmp = 0.3;
        const seededNoise = Math.sin(time * flickerFreq + seed * 17.3) *
                            Math.sin(time * flickerFreq * 1.7 + seed * 31.1);
        return Math.max(0.2, 1 - Math.abs(seededNoise) * flickerAmp);
    }

    case 'dissipate': {
        // Gradual fade over time (for smoke rising)
        return Math.max(0, 1 - time * 0.3);
    }
    }

    return 1;
}

export default {
    calculatePulse,
    calculatePulseEased,
    calculateFlicker,
    calculateLayeredFlicker,
    calculateDrift,
    calculateRotation,
    calculateEmissive,
    calculateBreathingEmissive,
    calculateHoldAnimations,
    // Phase 11 additions
    calculateNonUniformScale,
    calculatePhysicsDrift,
    calculateOpacityLink
};
