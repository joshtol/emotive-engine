/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Plugin Behavior Adapter
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Adapter for plugin-defined particle behaviors
 * @author Emotive Engine Team
 * @module particles/behaviors/plugin-adapter
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Bridges the gap between the plugin system and modular particle behaviors.         
 * ║ Allows plugins to register custom particle behaviors that integrate seamlessly    
 * ║ with the modular particle system.                                                 
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 */

import { selectWeightedColor } from '../utils/colorUtils.js';

// Registry for plugin-defined behaviors
const pluginBehaviors = new Map();

/**
 * Register a custom particle behavior from a plugin
 * @param {string} name - Unique name for the behavior
 * @param {Object} behaviorDef - Behavior definition object
 * @returns {boolean} Success status
 */
export function registerPluginBehavior(name, behaviorDef) {
    if (pluginBehaviors.has(name)) {
    }
    
    // Validate behavior definition
    if (!behaviorDef.initialize || typeof behaviorDef.initialize !== 'function') {
        return false;
    }
    
    if (!behaviorDef.update || typeof behaviorDef.update !== 'function') {
        return false;
    }
    
    // Store the behavior
    pluginBehaviors.set(name, {
        name,
        emoji: behaviorDef.emoji || '🔌',
        description: behaviorDef.description || `Plugin behavior: ${name}`,
        initialize: behaviorDef.initialize,
        update: behaviorDef.update,
        isPlugin: true
    });
    
    return true;
}

/**
 * Unregister a plugin behavior
 * @param {string} name - Name of the behavior to remove
 * @returns {boolean} Success status
 */
export function unregisterPluginBehavior(name) {
    if (pluginBehaviors.has(name)) {
        pluginBehaviors.delete(name);
        return true;
    }
    return false;
}

/**
 * Get a plugin behavior by name
 * @param {string} name - Name of the behavior
 * @returns {Object|null} Behavior definition or null
 */
export function getPluginBehavior(name) {
    return pluginBehaviors.get(name) || null;
}

/**
 * Get all registered plugin behaviors
 * @returns {Array} Array of behavior names
 */
export function getAllPluginBehaviors() {
    return Array.from(pluginBehaviors.keys());
}

/**
 * Create a behavior wrapper for legacy plugin particle effects
 * Converts old-style particle definitions to modular behavior format
 * @param {Object} legacyBehavior - Legacy behavior configuration
 * @returns {Object} Modular behavior definition
 */
export function createLegacyAdapter(legacyBehavior) {
    return {
        name: legacyBehavior.name || 'legacy',
        emoji: '🔄',
        description: legacyBehavior.description || 'Legacy plugin behavior',
        
        initialize(particle) {
            // Apply legacy configuration
            if (legacyBehavior.size) {
                particle.size = typeof legacyBehavior.size === 'object' ?
                    legacyBehavior.size.min + Math.random() * (legacyBehavior.size.max - legacyBehavior.size.min) :
                    legacyBehavior.size;
                particle.baseSize = particle.size;
            }
            
            if (legacyBehavior.speed) {
                const speed = typeof legacyBehavior.speed === 'object' ?
                    legacyBehavior.speed.min + Math.random() * (legacyBehavior.speed.max - legacyBehavior.speed.min) :
                    legacyBehavior.speed;
                const angle = Math.random() * Math.PI * 2;
                particle.vx = Math.cos(angle) * speed;
                particle.vy = Math.sin(angle) * speed;
            }
            
            if (legacyBehavior.lifespan) {
                const lifespan = typeof legacyBehavior.lifespan === 'object' ?
                    legacyBehavior.lifespan.min + Math.random() * (legacyBehavior.lifespan.max - legacyBehavior.lifespan.min) :
                    legacyBehavior.lifespan;
                particle.lifeDecay = 1000 / lifespan; // Convert ms to decay rate
            }
            
            if (legacyBehavior.color) {
                particle.color = Array.isArray(legacyBehavior.color) ?
                    selectWeightedColor(legacyBehavior.color) :
                    legacyBehavior.color;
            }
            
            if (legacyBehavior.opacity) {
                particle.life = typeof legacyBehavior.opacity === 'object' ?
                    legacyBehavior.opacity.min + Math.random() * (legacyBehavior.opacity.max - legacyBehavior.opacity.min) :
                    legacyBehavior.opacity;
            }
            
            // Store legacy-specific data
            particle.behaviorData = {
                movementType: legacyBehavior.movementType || 'linear',
                turbulence: legacyBehavior.turbulence || 0,
                drift: legacyBehavior.drift || 0,
                acceleration: legacyBehavior.acceleration || 0,
                ...legacyBehavior.customData
            };
        },
        
        update(particle, dt, centerX, centerY) {
            const data = particle.behaviorData;
            
            // Apply movement based on type
            switch (data.movementType) {
            case 'wander':
                // Random wandering
                particle.vx += (Math.random() - 0.5) * data.turbulence * dt;
                particle.vy += (Math.random() - 0.5) * data.turbulence * dt;
                break;
                    
            case 'fall':
                // Falling with drift
                particle.vy += 0.1 * dt; // Gravity
                particle.vx += (Math.random() - 0.5) * data.drift * dt;
                break;
                    
            case 'rain':
                // Digital rain effect
                particle.vy += data.acceleration * dt;
                break;
                    
            case 'orbit': {
                // Orbital motion
                const dx = particle.x - centerX;
                const dy = particle.y - centerY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 0) {
                    const angle = Math.atan2(dy, dx) + 0.02 * dt;
                    particle.x = centerX + Math.cos(angle) * dist;
                    particle.y = centerY + Math.sin(angle) * dist;
                }
                break;
            }
                    
            case 'linear':
            default:
                // Simple linear motion (already handled by velocity)
                break;
            }
            
            // Call custom update if provided
            if (legacyBehavior.customUpdate) {
                legacyBehavior.customUpdate(particle, dt, centerX, centerY);
            }
        }
    };
}

// Export adapter functions for plugin system integration
export default {
    registerPluginBehavior,
    unregisterPluginBehavior,
    getPluginBehavior,
    getAllPluginBehaviors,
    createLegacyAdapter
};