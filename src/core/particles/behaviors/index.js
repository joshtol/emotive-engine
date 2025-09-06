/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Behavior Registry
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Central registry for all particle behaviors
 * @author Emotive Engine Team
 * @module particles/behaviors
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ This is the control center for all particle behaviors. Instead of a giant switch  
 * ║ statement, behaviors are registered here and can be looked up by name.            
 * ║                                                                                    
 * ║ TO ADD A NEW BEHAVIOR:                                                            
 * ║ 1. Create a new file in this folder (e.g., sparkle.js)                            
 * ║ 2. Import it below                                                                
 * ║ 3. Add it to the BEHAVIORS array                                                  
 * ║ 4. That's it! It's now available everywhere                                       
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 */

// ┌─────────────────────────────────────────────────────────────────────────────────────
// │ IMPORT ALL BEHAVIORS
// └─────────────────────────────────────────────────────────────────────────────────────
import ambient from './ambient.js';
import orbiting from './orbiting.js';
import rising from './rising.js';
import falling from './falling.js';
import popcorn from './popcorn.js';
import burst from './burst.js';
import aggressive from './aggressive.js';
import scattering from './scattering.js';
import repelling from './repelling.js';
import connecting from './connecting.js';
import resting from './resting.js';
import radiant from './radiant.js';
import ascending from './ascending.js';
import erratic from './erratic.js';
import cautious from './cautious.js';

// ┌─────────────────────────────────────────────────────────────────────────────────────
// │ BEHAVIOR COLLECTION
// └─────────────────────────────────────────────────────────────────────────────────────
const BEHAVIORS = [
    ambient,
    orbiting,
    rising,
    falling,
    popcorn,
    burst,
    aggressive,
    scattering,
    repelling,
    connecting,
    resting,
    radiant,
    ascending,
    erratic,
    cautious
];

// ┌─────────────────────────────────────────────────────────────────────────────────────
// │ BEHAVIOR REGISTRY - Fast lookup by name
// └─────────────────────────────────────────────────────────────────────────────────────
export const BEHAVIOR_REGISTRY = {};

// Build the registry from the behaviors array
BEHAVIORS.forEach(behavior => {
    BEHAVIOR_REGISTRY[behavior.name] = behavior;
});

/**
 * Get a behavior by name
 * @param {string} name - Behavior name (e.g., 'ambient', 'orbiting')
 * @returns {Object|null} Behavior object or null if not found
 */
export function getBehavior(name) {
    return BEHAVIOR_REGISTRY[name] || null;
}

/**
 * Initialize a particle with a specific behavior
 * @param {Particle} particle - The particle to initialize
 * @param {string} behaviorName - Name of the behavior to apply
 * @returns {boolean} True if behavior was found and applied
 */
export function initializeBehavior(particle, behaviorName) {
    const behavior = getBehavior(behaviorName);
    if (behavior && behavior.initialize) {
        behavior.initialize(particle);
        return true;
    }
    // Fallback to ambient if behavior not found
    if (behaviorName !== 'ambient') {
        console.warn(`Behavior '${behaviorName}' not found, using 'ambient'`);
        return initializeBehavior(particle, 'ambient');
    }
    return false;
}

/**
 * Update a particle's behavior
 * @param {Particle} particle - The particle to update
 * @param {string} behaviorName - Name of the behavior
 * @param {number} dt - Delta time
 * @param {number} centerX - Orb center X
 * @param {number} centerY - Orb center Y
 * @returns {boolean} True if behavior was found and updated
 */
export function updateBehavior(particle, behaviorName, dt, centerX, centerY) {
    const behavior = getBehavior(behaviorName);
    if (behavior && behavior.update) {
        behavior.update(particle, dt, centerX, centerY);
        return true;
    }
    return false;
}

/**
 * Get list of all available behaviors
 * @returns {Array} Array of behavior names and descriptions
 */
export function listBehaviors() {
    return Object.values(BEHAVIOR_REGISTRY).map(behavior => ({
        name: behavior.name,
        emoji: behavior.emoji || '🎯',
        description: behavior.description || 'No description'
    }));
}

// ┌─────────────────────────────────────────────────────────────────────────────────────
// │ DEBUG UTILITIES
// └─────────────────────────────────────────────────────────────────────────────────────
if (typeof window !== 'undefined' && window.DEBUG_PARTICLES) {
    window.ParticleBehaviors = {
        registry: BEHAVIOR_REGISTRY,
        list: listBehaviors,
        get: getBehavior
    };
    console.log('🎯 Particle Behaviors Loaded:', listBehaviors());
}

// Export everything
export default {
    BEHAVIOR_REGISTRY,
    getBehavior,
    initializeBehavior,
    updateBehavior,
    listBehaviors
};