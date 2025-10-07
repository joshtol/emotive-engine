/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE v4.0 - Emotion Plugin Adapter
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Bridge between plugin system and emotion registry
 * @author Emotive Engine Team
 * @version 4.0.0
 * @module emotions/plugin-adapter
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Adapter for dynamic emotion registration from plugins.                            
 * ║ • Maintains separate registry for plugin emotions                                 
 * ║ • Validates emotion definitions for required properties                           
 * ║ • Provides legacy format conversion for older plugins                             
 * ║ • Enables runtime registration and unregistration                                 
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Plugin emotion registry
 */
const pluginEmotions = new Map();

/**
 * Register a plugin emotion
 * @param {string} name - Emotion name
 * @param {Object} emotionDef - Emotion definition object
 */
export function registerPluginEmotion(name, emotionDef) {
    // Ensure emotion has required properties
    if (!emotionDef.color) {
        return false;
    }
    
    // Add name if not present
    if (!emotionDef.name) {
        emotionDef.name = name;
    }
    
    // Ensure visual and modifiers exist
    if (!emotionDef.visual) {
        emotionDef.visual = {
            primaryColor: emotionDef.color,
            particleCount: emotionDef.particleCount || 15,
            particleSize: emotionDef.particleSize || { min: 2, max: 6 }
        };
    }
    
    if (!emotionDef.modifiers) {
        emotionDef.modifiers = {
            speed: 1.0,
            amplitude: 1.0,
            intensity: 1.0
        };
    }
    
    pluginEmotions.set(name, emotionDef);
    
    if (typeof window !== 'undefined' && window.DEBUG_EMOTIONS) {
        // Debug logging would go here
    }
    
    return true;
}

/**
 * Unregister a plugin emotion
 * @param {string} name - Emotion name to remove
 */
export function unregisterPluginEmotion(name) {
    if (pluginEmotions.has(name)) {
        pluginEmotions.delete(name);
        
        if (typeof window !== 'undefined' && window.DEBUG_EMOTIONS) {
            // Debug logging would go here
        }
        
        return true;
    }
    return false;
}

/**
 * Get a plugin emotion by name
 * @param {string} name - Emotion name
 * @returns {Object|null} Emotion object or null if not found
 */
export function getPluginEmotion(name) {
    return pluginEmotions.get(name) || null;
}

/**
 * Get all plugin emotion names
 * @returns {Array<string>} Array of emotion names
 */
export function getAllPluginEmotions() {
    return Array.from(pluginEmotions.keys());
}

/**
 * Clear all plugin emotions
 */
export function clearPluginEmotions() {
    pluginEmotions.clear();
}

/**
 * Convert legacy plugin emotion format to new format
 * @param {Object} legacyEmotion - Old format emotion
 * @returns {Object} New format emotion
 */
export function createLegacyAdapter(legacyEmotion) {
    return {
        name: legacyEmotion.name || 'unknown',
        emoji: legacyEmotion.emoji || '🔌',
        color: legacyEmotion.primaryColor || legacyEmotion.color || '#7B68EE',
        energy: legacyEmotion.energy || 'medium',
        
        visual: {
            primaryColor: legacyEmotion.primaryColor || legacyEmotion.color || '#7B68EE',
            secondaryColor: legacyEmotion.secondaryColor,
            particleCount: legacyEmotion.particleCount || legacyEmotion.particleRate || 15,
            particleSize: legacyEmotion.particleSize || { min: 2, max: 6 },
            glowIntensity: legacyEmotion.glowIntensity || 0.5,
            trailLength: legacyEmotion.trailLength || 5,
            pulseRate: legacyEmotion.pulseRate || legacyEmotion.breathRate || 1.0
        },
        
        particles: {
            behavior: legacyEmotion.particleBehavior || 'ambient',
            density: legacyEmotion.particleDensity || 'medium',
            speed: legacyEmotion.particleSpeed || 'normal'
        },
        
        modifiers: {
            speed: legacyEmotion.speedMultiplier || 1.0,
            amplitude: legacyEmotion.amplitudeMultiplier || 1.0,
            intensity: legacyEmotion.intensityMultiplier || 1.0,
            smoothness: legacyEmotion.smoothnessMultiplier || 1.0
        },
        
        gestures: legacyEmotion.gestures || [],
        transitions: legacyEmotion.transitions || {}
    };
}

// Export adapter interface
export default {
    registerPluginEmotion,
    unregisterPluginEmotion,
    getPluginEmotion,
    getAllPluginEmotions,
    clearPluginEmotions,
    createLegacyAdapter
};