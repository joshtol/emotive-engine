/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Emotion Registry
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Central emotion registry - manages all emotional states
 * @author Emotive Engine Team
 * @module emotions
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Central registry for modular emotion system. Each emotion is self-contained with:
 * ║ • Visual properties (colors, particles, glow)
 * ║ • Gesture modifiers (speed, amplitude, intensity)
 * ║ • Typical gestures (what animations this emotion commonly uses)
 * ║ • Transition hints (how to smoothly change to/from this emotion)
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 */

// Import all emotion modules
import neutral from './states/neutral.js';
import joy from './states/joy.js';
import sadness from './states/sadness.js';
import anger from './states/anger.js';
import fear from './states/fear.js';
import surprise from './states/surprise.js';
import disgust from './states/disgust.js';
import love from './states/love.js';
import suspicion from './states/suspicion.js';
import excited from './states/excited.js';
import resting from './states/resting.js';
import euphoria from './states/euphoria.js';
import focused from './states/focused.js';

// Registry to store all registered emotions
const emotionRegistry = new Map();

// Emotion aliases for compatibility
const emotionAliases = {
    'happy': 'joy',
    'calm': 'neutral',
    'curious': 'surprise',
    'frustrated': 'anger',
    'sad': 'sadness'
};

/**
 * Register an emotion module
 * @param {Object} emotionModule - The emotion module to register
 */
export function registerEmotion(emotionModule) {
    if (!emotionModule.name) {
        console.error('Emotion module missing name:', emotionModule);
        return;
    }
    emotionRegistry.set(emotionModule.name, emotionModule);
}

/**
 * Get emotion configuration by name
 * @param {string} emotionName - Name of the emotion (or alias)
 * @returns {Object|null} The emotion configuration or null if not found
 */
export function getEmotion(emotionName) {
    // Check aliases first
    const resolvedName = emotionAliases[emotionName] || emotionName;
    return emotionRegistry.get(resolvedName) || null;
}

/**
 * Get emotion parameters (visual properties)
 * @param {string} emotionName - Name of the emotion
 * @returns {Object} Visual parameters for the emotion
 */
export function getEmotionParams(emotionName) {
    const emotion = getEmotion(emotionName);
    if (!emotion) {
        console.warn(`Unknown emotion: ${emotionName}, using neutral`);
        return getEmotion('neutral').visual;
    }
    return emotion.visual;
}

/**
 * Get emotion modifiers (gesture adjustments)
 * @param {string} emotionName - Name of the emotion
 * @returns {Object} Gesture modifiers for the emotion
 */
export function getEmotionModifiers(emotionName) {
    const emotion = getEmotion(emotionName);
    if (!emotion) {
        return getEmotion('neutral').modifiers;
    }
    return emotion.modifiers;
}

/**
 * Get typical gestures for an emotion
 * @param {string} emotionName - Name of the emotion
 * @returns {Array} Array of typical gesture names
 */
export function getEmotionGestures(emotionName) {
    const emotion = getEmotion(emotionName);
    return emotion?.typicalGestures || [];
}

/**
 * Get all registered emotion names
 * @returns {Array} Array of emotion names
 */
export function getAllEmotions() {
    return Array.from(emotionRegistry.keys());
}

/**
 * Check if emotion exists
 * @param {string} emotionName - Name to check
 * @returns {boolean} True if emotion exists
 */
export function hasEmotion(emotionName) {
    const resolvedName = emotionAliases[emotionName] || emotionName;
    return emotionRegistry.has(resolvedName);
}

/**
 * Interpolate between two emotion states
 * @param {string} fromEmotion - Starting emotion
 * @param {string} toEmotion - Target emotion
 * @param {number} progress - Progress (0-1)
 * @returns {Object} Interpolated parameters
 */
export function interpolateEmotions(fromEmotion, toEmotion, progress) {
    const from = getEmotion(fromEmotion);
    const to = getEmotion(toEmotion);
    
    if (!from || !to) {
        console.warn('Invalid emotions for interpolation');
        return getEmotion('neutral').visual;
    }
    
    // Helper to interpolate colors
    const interpolateColor = (color1, color2, t) => {
        const rgb1 = hexToRgb(color1);
        const rgb2 = hexToRgb(color2);
        
        const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * t);
        const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * t);
        const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * t);
        
        return rgbToHex(r, g, b);
    };
    
    // Interpolate numeric values
    const lerp = (a, b, t) => a + (b - a) * t;
    
    return {
        glowColor: interpolateColor(from.visual.glowColor, to.visual.glowColor, progress),
        glowIntensity: lerp(from.visual.glowIntensity, to.visual.glowIntensity, progress),
        particleRate: Math.round(lerp(from.visual.particleRate, to.visual.particleRate, progress)),
        particleBehavior: progress < 0.5 ? from.visual.particleBehavior : to.visual.particleBehavior,
        breathRate: lerp(from.visual.breathRate, to.visual.breathRate, progress),
        breathDepth: lerp(from.visual.breathDepth, to.visual.breathDepth, progress),
        coreJitter: progress < 0.5 ? from.visual.coreJitter : to.visual.coreJitter,
        particleColors: progress < 0.5 ? from.visual.particleColors : to.visual.particleColors
    };
}

// Color utility functions
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

// Register all built-in emotions
registerEmotion(neutral);
registerEmotion(joy);
registerEmotion(sadness);
registerEmotion(anger);
registerEmotion(fear);
registerEmotion(surprise);
registerEmotion(disgust);
registerEmotion(love);
registerEmotion(suspicion);
registerEmotion(excited);
registerEmotion(resting);
registerEmotion(euphoria);
registerEmotion(focused);

// Export for backwards compatibility
export const emotionMap = Object.fromEntries(
    Array.from(emotionRegistry.entries()).map(([name, emotion]) => 
        [name, emotion.visual]
    )
);

export default {
    registerEmotion,
    getEmotion,
    getEmotionParams,
    getEmotionModifiers,
    getEmotionGestures,
    getAllEmotions,
    hasEmotion,
    interpolateEmotions,
    emotionMap
};