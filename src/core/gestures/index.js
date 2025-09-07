/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE v4.0 - Gesture Registry
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Central registry for all gesture animations with plugin support
 * @author Emotive Engine Team
 * @version 4.0.0
 * @module gestures
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Control center for all gestures with full plugin adapter integration.             
 * ║ • Three gesture types: blending (motions), override (transforms), effects        
 * ║ • Core gestures loaded synchronously at startup                                   
 * ║ • Plugin gestures registered dynamically via adapter                              
 * ║ • Value-agnostic configurations for easy tuning                                   
 * ║                                                                                    
 * ║ TO ADD A PLUGIN GESTURE:                                                          
 * ║ Use pluginAdapter.registerPluginGesture() from your plugin                        
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 */

import pluginAdapter from './plugin-adapter.js';

// ┌─────────────────────────────────────────────────────────────────────────────────────
// │ IMPORT MOTION GESTURES (Blending - add to existing motion)
// └─────────────────────────────────────────────────────────────────────────────────────
import bounce from './motions/bounce.js';
import pulse from './motions/pulse.js';
import shake from './motions/shake.js';
import nod from './motions/nod.js';
import vibrate from './motions/vibrate.js';
import orbit from './motions/orbit.js';

// ┌─────────────────────────────────────────────────────────────────────────────────────
// │ IMPORT TRANSFORM GESTURES (Override - replace motion completely)
// └─────────────────────────────────────────────────────────────────────────────────────
import spin from './transforms/spin.js';
import jump from './transforms/jump.js';
import morph from './transforms/morph.js';
import stretch from './transforms/stretch.js';
import tilt from './transforms/tilt.js';
import orbital from './transforms/orbital.js';
import hula from './transforms/hula.js';

// ┌─────────────────────────────────────────────────────────────────────────────────────
// │ IMPORT EFFECT GESTURES (Visual effects)
// └─────────────────────────────────────────────────────────────────────────────────────
import wave from './effects/wave.js';
import drift from './effects/drift.js';
import flicker from './effects/flicker.js';
import burst from './effects/burst.js';
import directional from './effects/directional.js';
import settle from './effects/settle.js';
import fade from './effects/fade.js';
import hold from './effects/hold.js';
import breathe from './effects/breathe.js';
import expand from './effects/expand.js';
import contract from './effects/contract.js';
import flash from './effects/flash.js';
import glow from './effects/glow.js';

// ┌─────────────────────────────────────────────────────────────────────────────────────
// │ GESTURE COLLECTIONS
// └─────────────────────────────────────────────────────────────────────────────────────
const MOTION_GESTURES = [
    bounce,
    pulse,
    shake,
    nod,
    vibrate,
    orbit
];

const TRANSFORM_GESTURES = [
    spin,
    jump,
    morph,
    stretch,
    tilt,
    orbital,
    hula
];

const EFFECT_GESTURES = [
    wave,
    drift,
    flicker,
    burst,
    directional,
    settle,
    fade,
    hold,
    breathe,
    expand,
    contract,
    flash,
    glow
];

// ┌─────────────────────────────────────────────────────────────────────────────────────
// │ GESTURE REGISTRY - Fast lookup by name
// └─────────────────────────────────────────────────────────────────────────────────────
export const GESTURE_REGISTRY = {};

// Build the registry from all gesture arrays - SYNCHRONOUSLY
[...MOTION_GESTURES, ...TRANSFORM_GESTURES, ...EFFECT_GESTURES].forEach(gesture => {
    GESTURE_REGISTRY[gesture.name] = gesture;
});

// ┌─────────────────────────────────────────────────────────────────────────────────────
// │ GESTURE TYPE MAPPING - Quick type lookup
// └─────────────────────────────────────────────────────────────────────────────────────
export const GESTURE_TYPES = {
    blending: MOTION_GESTURES.map(g => g.name),
    override: TRANSFORM_GESTURES.map(g => g.name),
    effect: EFFECT_GESTURES.map(g => g.name)
};

/**
 * Get a gesture by name (checks both core and plugin gestures)
 * @param {string} name - Gesture name (e.g., 'bounce', 'spin')
 * @returns {Object|null} Gesture object or null if not found
 */
export function getGesture(name) {
    // Check core gestures first
    if (GESTURE_REGISTRY[name]) {
        return GESTURE_REGISTRY[name];
    }
    
    // Check plugin gestures
    const pluginGesture = pluginAdapter.getPluginGesture(name);
    if (pluginGesture) {
        return pluginGesture;
    }
    
    return null;
}

/**
 * Check if a gesture is a blending type
 * @param {string} name - Gesture name
 * @returns {boolean} True if gesture blends with existing motion
 */
export function isBlendingGesture(name) {
    const gesture = getGesture(name);
    return gesture ? gesture.type === 'blending' : false;
}

/**
 * Check if a gesture is an override type
 * @param {string} name - Gesture name
 * @returns {boolean} True if gesture overrides existing motion
 */
export function isOverrideGesture(name) {
    const gesture = getGesture(name);
    return gesture ? gesture.type === 'override' : false;
}

/**
 * Apply a gesture to a particle
 * @param {Particle} particle - The particle to animate
 * @param {string} gestureName - Name of the gesture
 * @param {number} progress - Animation progress (0-1)
 * @param {Object} motion - Motion configuration
 * @param {number} dt - Delta time
 * @param {number} centerX - Orb center X
 * @param {number} centerY - Orb center Y
 * @returns {boolean} True if gesture was applied
 */
export function applyGesture(particle, gestureName, progress, motion, dt, centerX, centerY) {
    const gesture = getGesture(gestureName);
    
    if (!gesture) {
        console.warn(`Gesture '${gestureName}' not found`);
        return false;
    }
    
    // Apply the gesture
    if (gesture.apply) {
        gesture.apply(particle, progress, motion, dt, centerX, centerY);
    }
    
    // Clean up if complete
    if (progress >= 1 && gesture.cleanup) {
        gesture.cleanup(particle);
    }
    
    return true;
}

/**
 * Get list of all available gestures (core and plugin)
 * @returns {Array} Array of gesture info objects
 */
export function listGestures() {
    const allGestures = [];
    
    // Add core gestures
    Object.values(GESTURE_REGISTRY).forEach(gesture => {
        allGestures.push({
            name: gesture.name,
            emoji: gesture.emoji || '🎭',
            type: gesture.type,
            description: gesture.description || 'No description',
            source: 'core'
        });
    });
    
    // Add plugin gestures
    const pluginGestureNames = pluginAdapter.getAllPluginGestures();
    pluginGestureNames.forEach(name => {
        const gesture = pluginAdapter.getPluginGesture(name);
        allGestures.push({
            name: gesture.name,
            emoji: gesture.emoji || '🔌',
            type: gesture.type,
            description: gesture.description || 'Plugin gesture',
            source: 'plugin'
        });
    });
    
    return allGestures;
}

// ┌─────────────────────────────────────────────────────────────────────────────────────
// │ DEBUG UTILITIES
// └─────────────────────────────────────────────────────────────────────────────────────
if (typeof window !== 'undefined' && window.DEBUG_GESTURES) {
    window.Gestures = {
        registry: GESTURE_REGISTRY,
        types: GESTURE_TYPES,
        list: listGestures,
        get: getGesture,
        isBlending: isBlendingGesture,
        isOverride: isOverrideGesture
    };
    console.log('🎭 Gestures Loaded:', listGestures());
}

// Export plugin adapter for external use
export { pluginAdapter };

// Export everything
export default {
    GESTURE_REGISTRY,
    GESTURE_TYPES,
    getGesture,
    isBlendingGesture,
    isOverrideGesture,
    applyGesture,
    listGestures,
    pluginAdapter
};