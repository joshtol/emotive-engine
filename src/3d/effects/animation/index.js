/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Animation System
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Main entry point for the elemental animation system
 * @module effects/animation
 *
 * This module provides a comprehensive animation system for 3D elemental effects:
 *
 * - **Easing**: 14+ easing functions for smooth transitions
 * - **AnimationConfig**: Parser/validator for animation configuration
 * - **AnimationState**: Per-element state machine for lifecycle management
 * - **HoldAnimations**: Continuous animations (pulse, flicker, drift, rotate)
 *
 * @example
 * import { AnimationConfig, AnimationState, Easing } from './animation';
 *
 * // Parse config
 * const config = new AnimationConfig({
 *     enter: { type: 'flash', duration: 0.02 },
 *     flicker: { intensity: 0.3, rate: 12 },
 *     respawn: true
 * }, gestureDuration);
 *
 * // Create state for each element
 * const state = new AnimationState(config, elementIndex);
 * state.initialize(currentTime);
 *
 * // Update each frame
 * state.update(time, deltaTime, gestureProgress);
 *
 * // Apply to mesh
 * mesh.material.opacity = state.opacity;
 * mesh.scale.setScalar(state.scale);
 */

// Easing functions
export {
    Easing,
    getEasing,
    createCustomEasing,
    // Individual functions for tree-shaking
    linear,
    easeIn,
    easeOut,
    easeInOut,
    easeInQuad,
    easeOutQuad,
    easeInOutQuad,
    easeInCubic,
    easeOutCubic,
    easeInOutCubic,
    elastic,
    elasticOut,
    elasticInOut,
    bounce,
    bounceOut,
    bounceInOut,
    snap,
    step,
    smoothstep,
    smootherstep,
    backIn,
    backOut,
    backInOut,
} from './Easing.js';

// Animation configuration
export {
    AnimationConfig,
    parseAnimationConfig,
    ANIMATION_DEFAULTS,
    PULSE_DEFAULTS,
    FLICKER_DEFAULTS,
    DRIFT_DEFAULTS,
    ROTATE_DEFAULTS,
    EMISSIVE_DEFAULTS,
} from './AnimationConfig.js';

// Animation state machine
export { AnimationState, AnimationStates } from './AnimationState.js';

// Hold animation functions
export {
    calculatePulse,
    calculatePulseEased,
    calculateFlicker,
    calculateLayeredFlicker,
    calculateDrift,
    calculateRotation,
    calculateEmissive,
    calculateBreathingEmissive,
    calculateHoldAnimations,
} from './HoldAnimations.js';

// Trail effect
export { TrailState, createTrailState } from './Trail.js';
