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
 *
 * @param {Object} config - Drift configuration
 * @param {string} config.direction - 'outward' | 'inward' | 'up' | 'down' | 'random'
 * @param {number} config.speed - Units per second
 * @param {number} config.maxDistance - Maximum drift distance
 * @param {boolean} [config.bounce=false] - Bounce at boundary vs clamp
 * @param {number} [config.noise=0] - Perlin noise amount
 * @param {Object} currentOffset - Current offset { x, y, z }
 * @param {number} deltaTime - Time since last frame
 * @param {Object} [origin] - Origin position for outward/inward
 * @returns {Object} New offset { x, y, z }
 *
 * @example
 * const offset = calculateDrift(config, currentOffset, deltaTime);
 * mesh.position.add(new THREE.Vector3(offset.x, offset.y, offset.z));
 */
export function calculateDrift(config, currentOffset, deltaTime, origin = null) {
    const {
        direction = 'outward',
        speed = 0.02,
        maxDistance = 0.5,
        bounce = false,
        noise = 0
    } = config;

    // Clone current offset
    const offset = {
        x: currentOffset.x || 0,
        y: currentOffset.y || 0,
        z: currentOffset.z || 0
    };

    const movement = speed * deltaTime;

    // Apply direction-based movement
    switch (direction) {
    case 'outward': {
        // Move away from origin
        const len = Math.sqrt(offset.x ** 2 + offset.y ** 2 + offset.z ** 2) || 0.001;
        const nx = offset.x / len;
        const ny = offset.y / len;
        const nz = offset.z / len;
        offset.x += nx * movement;
        offset.y += ny * movement;
        offset.z += nz * movement;
        break;
    }

    case 'inward': {
        // Move toward origin
        const len = Math.sqrt(offset.x ** 2 + offset.y ** 2 + offset.z ** 2);
        if (len > movement) {
            const scale = (len - movement) / len;
            offset.x *= scale;
            offset.y *= scale;
            offset.z *= scale;
        } else {
            offset.x = offset.y = offset.z = 0;
        }
        break;
    }

    case 'up':
        offset.y += movement;
        break;

    case 'down':
        offset.y -= movement;
        break;

    case 'random': {
        offset.x += (Math.random() - 0.5) * movement * 2;
        offset.y += (Math.random() - 0.5) * movement * 2;
        offset.z += (Math.random() - 0.5) * movement * 2;
        break;
    }
    }

    // Add noise if configured
    if (noise > 0) {
        const time = Date.now() / 1000;
        offset.x += Math.sin(time * 1.3) * noise * movement;
        offset.y += Math.sin(time * 1.7) * noise * movement;
        offset.z += Math.sin(time * 2.1) * noise * movement;
    }

    // Apply distance limit
    const dist = Math.sqrt(offset.x ** 2 + offset.y ** 2 + offset.z ** 2);

    if (dist > maxDistance) {
        if (bounce) {
            // Reflect direction
            const scale = -maxDistance / dist;
            offset.x *= scale;
            offset.y *= scale;
            offset.z *= scale;
        } else {
            // Clamp to max distance
            const scale = maxDistance / dist;
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

export default {
    calculatePulse,
    calculatePulseEased,
    calculateFlicker,
    calculateLayeredFlicker,
    calculateDrift,
    calculateRotation,
    calculateEmissive,
    calculateBreathingEmissive,
    calculateHoldAnimations
};
