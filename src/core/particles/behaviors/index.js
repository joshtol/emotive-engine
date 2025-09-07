/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE v4.0 - Behavior Registry
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Central registry for all particle behaviors with plugin support
 * @author Emotive Engine Team
 * @version 4.0.0
 * @module particles/behaviors
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Control center for particle behaviors with plugin adapter integration.            
 * ║ • Each behavior defines unique particle physics and movement patterns             
 * ║ • Core behaviors loaded synchronously at startup                                  
 * ║ • Plugin behaviors registered dynamically via adapter                             
 * ║ • Value-agnostic design for easy physics tuning                                   
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
import pluginAdapter from './plugin-adapter.js';

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

// Build the registry from the behaviors array - SYNCHRONOUSLY
BEHAVIORS.forEach(behavior => {
    BEHAVIOR_REGISTRY[behavior.name] = behavior;
});

/**
 * Get a behavior by name (checks both core and plugin behaviors)
 * @param {string} name - Behavior name (e.g., 'ambient', 'orbiting')
 * @returns {Object|null} Behavior object or null if not found
 */
export function getBehavior(name) {
    // Check core behaviors first
    if (BEHAVIOR_REGISTRY[name]) {
        return BEHAVIOR_REGISTRY[name];
    }
    // Check plugin behaviors
    const pluginBehavior = pluginAdapter.getPluginBehavior(name);
    if (pluginBehavior) {
        return pluginBehavior;
    }
    return null;
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
 * Get list of all available behaviors (core and plugin)
 * @returns {Array} Array of behavior names and descriptions
 */
export function listBehaviors() {
    // Get core behaviors
    const coreBehaviors = Object.values(BEHAVIOR_REGISTRY).map(behavior => ({
        name: behavior.name,
        emoji: behavior.emoji || '🎯',
        description: behavior.description || 'No description',
        type: 'core'
    }));
    
    // Get plugin behaviors
    const pluginBehaviorNames = pluginAdapter.getAllPluginBehaviors();
    const pluginBehaviors = pluginBehaviorNames.map(name => {
        const behavior = pluginAdapter.getPluginBehavior(name);
        return {
            name: behavior.name,
            emoji: behavior.emoji || '🔌',
            description: behavior.description || 'Plugin behavior',
            type: 'plugin'
        };
    });
    
    return [...coreBehaviors, ...pluginBehaviors];
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

// Export plugin adapter for external use
export { pluginAdapter };

// Export everything
export default {
    BEHAVIOR_REGISTRY,
    getBehavior,
    initializeBehavior,
    updateBehavior,
    listBehaviors,
    pluginAdapter
};