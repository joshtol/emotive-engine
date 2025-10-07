/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Gesture Cache Wrapper
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Wrapper to use gesture cache without circular dependencies
 * @author Emotive Engine Team
 * @module gestures/gestureCacheWrapper
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Provides cached gesture access without creating circular dependencies.             
 * ║ This wrapper can be safely imported by gesture consumers.                         
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 */

import { getGesture as getGestureOriginal } from './index.js';
import { gestureCache } from '../cache/GestureCache.js';

/**
 * Get a gesture with caching support
 * @param {string} name - Gesture name
 * @returns {Object|null} Gesture object or null if not found
 */
export function getGesture(name) {
    // Use cached version if available
    if (gestureCache && gestureCache.isInitialized) {
        const cachedGesture = gestureCache.getGesture(name);
        if (cachedGesture) {
            return cachedGesture;
        }
    }
    
    // Fallback to original logic
    return getGestureOriginal(name);
}

/**
 * Get gesture properties with caching support
 * @param {string} name - Gesture name
 * @returns {Object|null} Gesture properties or null if not found
 */
export function getGestureProperties(name) {
    if (gestureCache && gestureCache.isInitialized) {
        const properties = gestureCache.getGestureProperties(name);
        if (properties) {
            return properties;
        }
    }
    
    // Fallback to original gesture and extract properties
    const gesture = getGestureOriginal(name);
    if (gesture) {
        return {
            type: gesture.type,
            emoji: gesture.emoji,
            description: gesture.description,
            config: gesture.config,
            rhythm: gesture.rhythm
        };
    }
    
    return null;
}

/**
 * Check if a gesture is a blending type with caching support
 * @param {string} name - Gesture name
 * @returns {boolean} True if gesture blends with existing motion
 */
export function isBlendingGesture(name) {
    // Use cached properties if available
    if (gestureCache && gestureCache.isInitialized) {
        const properties = gestureCache.getGestureProperties(name);
        if (properties) {
            return properties.type === 'blending';
        }
    }
    
    const gesture = getGestureOriginal(name);
    return gesture ? gesture.type === 'blending' : false;
}

/**
 * Check if a gesture is an override type with caching support
 * @param {string} name - Gesture name
 * @returns {boolean} True if gesture overrides existing motion
 */
export function isOverrideGesture(name) {
    // Use cached properties if available
    if (gestureCache && gestureCache.isInitialized) {
        const properties = gestureCache.getGestureProperties(name);
        if (properties) {
            return properties.type === 'override';
        }
    }
    
    const gesture = getGestureOriginal(name);
    return gesture ? gesture.type === 'override' : false;
}

/**
 * Get gesture combination with caching support
 * @param {string} gesture1 - First gesture name
 * @param {string} gesture2 - Second gesture name
 * @returns {Object|null} Gesture combination or null if not found
 */
export function getGestureCombination(gesture1, gesture2) {
    if (gestureCache && gestureCache.isInitialized) {
        const combination = gestureCache.getGestureCombination(gesture1, gesture2);
        if (combination) {
            return combination;
        }
    }
    
    return null;
}

/**
 * Get gesture cache statistics
 * @returns {Object} Cache statistics
 */
export function getGestureCacheStats() {
    if (gestureCache && gestureCache.isInitialized) {
        return gestureCache.getStats();
    }
    
    return {
        isInitialized: false,
        hitRate: '0%',
        cacheSize: 0
    };
}
