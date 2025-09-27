/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE v4.0 - Gesture Plugin Adapter
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Bridge between plugin system and gesture registry
 * @author Emotive Engine Team
 * @version 4.0.0
 * @module gestures/plugin-adapter
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Adapter for dynamic gesture registration from plugins.                            
 * ║ • Maintains separate registry for plugin gestures                                 
 * ║ • Validates gesture definitions for required apply() function                     
 * ║ • Provides legacy format conversion for older plugins                             
 * ║ • Enables runtime registration and unregistration                                 
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Plugin gesture registry
 */
const pluginGestures = new Map();

/**
 * Register a plugin gesture
 * @param {string} name - Gesture name
 * @param {Object} gestureDef - Gesture definition object
 */
export function registerPluginGesture(name, gestureDef) {
    // Ensure gesture has required properties
    if (!gestureDef.apply && !gestureDef.type) {
        return false;
    }
    
    // Add name if not present
    if (!gestureDef.name) {
        gestureDef.name = name;
    }
    
    // Set default type if not specified
    if (!gestureDef.type) {
        gestureDef.type = 'blending';
    }
    
    pluginGestures.set(name, gestureDef);
    
    if (typeof window !== 'undefined' && window.DEBUG_GESTURES) {
        // Debug logging would go here
    }
    
    return true;
}

/**
 * Unregister a plugin gesture
 * @param {string} name - Gesture name to remove
 */
export function unregisterPluginGesture(name) {
    if (pluginGestures.has(name)) {
        pluginGestures.delete(name);
        
        if (typeof window !== 'undefined' && window.DEBUG_GESTURES) {
            // Debug logging would go here
        }
        
        return true;
    }
    return false;
}

/**
 * Get a plugin gesture by name
 * @param {string} name - Gesture name
 * @returns {Object|null} Gesture object or null if not found
 */
export function getPluginGesture(name) {
    return pluginGestures.get(name) || null;
}

/**
 * Get all plugin gesture names
 * @returns {Array<string>} Array of gesture names
 */
export function getAllPluginGestures() {
    return Array.from(pluginGestures.keys());
}

/**
 * Clear all plugin gestures
 */
export function clearPluginGestures() {
    pluginGestures.clear();
}

/**
 * Convert legacy plugin gesture format to new format
 * @param {Object} legacyGesture - Old format gesture
 * @returns {Object} New format gesture
 */
export function createLegacyAdapter(legacyGesture) {
    return {
        name: legacyGesture.name || 'unknown',
        type: legacyGesture.type || 'blending',
        emoji: legacyGesture.emoji || '🔌',
        description: legacyGesture.description || 'Plugin gesture',
        config: legacyGesture.config || {},
        
        apply(particle, progress, motion, dt, centerX, centerY) {
            // Adapt old plugin format to new format
            if (legacyGesture.animate) {
                // Old plugins might use 'animate' instead of 'apply'
                legacyGesture.animate(particle, progress, motion, dt, centerX, centerY);
            } else if (legacyGesture.apply) {
                legacyGesture.apply(particle, progress, motion, dt, centerX, centerY);
            }
        },
        
        cleanup: legacyGesture.cleanup || function(particle) {
            // Default cleanup
            if (particle.gestureData && particle.gestureData[this.name]) {
                delete particle.gestureData[this.name];
            }
        }
    };
}

// Export adapter interface
export default {
    registerPluginGesture,
    unregisterPluginGesture,
    getPluginGesture,
    getAllPluginGestures,
    clearPluginGestures,
    createLegacyAdapter
};