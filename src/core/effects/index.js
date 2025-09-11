/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Visual Effects Registry
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Central registry for visual effects like zen vortex, recording glow, etc.
 * @author Emotive Engine Team
 * @module effects
 */

// Import all effect modules
import zenVortex from './zen-vortex.js';
import recordingGlow from './recording-glow.js';
import speakingPulse from './speaking-pulse.js';
import sleepingEffect from './sleeping-effect.js';
import suspicionScan from './suspicion-scan.js';
import gazeNarrowing from './gaze-narrowing.js';
import fingerprint from './fingerprint.js';

// Registry to store all visual effects
const effectRegistry = new Map();

/**
 * Register a visual effect module
 * @param {Object} effectModule - The effect module to register
 */
export function registerEffect(effectModule) {
    if (!effectModule.name) {
        return;
    }
    effectRegistry.set(effectModule.name, effectModule);
}

/**
 * Get effect by name
 * @param {string} effectName - Name of the effect
 * @returns {Object|null} The effect module or null
 */
export function getEffect(effectName) {
    return effectRegistry.get(effectName) || null;
}

/**
 * Apply a visual effect
 * @param {string} effectName - Name of the effect to apply
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} params - Effect parameters
 * @returns {boolean} True if effect was applied
 */
export function applyEffect(effectName, ctx, params) {
    const effect = getEffect(effectName);
    if (!effect) {
        return false;
    }
    
    if (effect.apply) {
        effect.apply(ctx, params);
        return true;
    }
    
    return false;
}

/**
 * Check if effect should be active
 * @param {string} effectName - Name of the effect
 * @param {Object} state - Current state
 * @returns {boolean} True if effect should be active
 */
export function isEffectActive(effectName, state) {
    const effect = getEffect(effectName);
    if (!effect || !effect.shouldActivate) {
        return false;
    }
    return effect.shouldActivate(state);
}

/**
 * Get all registered effect names
 * @returns {Array} Array of effect names
 */
export function getAllEffects() {
    return Array.from(effectRegistry.keys());
}

// Register all built-in effects
registerEffect(zenVortex);
registerEffect(recordingGlow);
registerEffect(speakingPulse);
registerEffect(sleepingEffect);
registerEffect(suspicionScan);
registerEffect(gazeNarrowing);
registerEffect(fingerprint);

export default {
    registerEffect,
    getEffect,
    applyEffect,
    isEffectActive,
    getAllEffects
};