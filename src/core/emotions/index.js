/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE v4.0 - Emotion Registry
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Central emotion registry with full plugin support
 * @author Emotive Engine Team
 * @version 4.0.0
 * @module emotions
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Central registry for modular emotion system with plugin adapter integration.
 * ║ • Core emotions are loaded synchronously at startup
 * ║ • Plugin emotions can be registered dynamically via adapter
 * ║ • Each emotion is self-contained with visual, gesture, and transition data
 * ║ • Value-agnostic design allows easy tuning without code changes
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 */

import pluginAdapter from './plugin-adapter.js';

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
import glitch from './states/glitch.js';
import calm from './states/calm.js';

// Registry to store all registered emotions
const emotionRegistry = new Map();

// Emotion aliases for compatibility
const emotionAliases = {
    'happy': 'joy',
    'peaceful': 'calm',
    'curious': 'surprise',
    'frustrated': 'anger',
    'sad': 'sadness'
};

// Register all emotions SYNCHRONOUSLY
[neutral, joy, sadness, anger, fear, surprise, disgust,
    love, suspicion, excited, resting, euphoria, focused, glitch, calm].forEach(emotion => {
    if (emotion && emotion.name) {
        emotionRegistry.set(emotion.name, emotion);
    }
});


/**
 * Register an emotion module
 * @param {Object} emotionModule - The emotion module to register
 */
export function registerEmotion(emotionModule) {
    if (!emotionModule.name) {
        return;
    }
    emotionRegistry.set(emotionModule.name, emotionModule);
}

/**
 * Get emotion configuration by name (checks both core and plugin emotions)
 * @param {string} emotionName - Name of the emotion (or alias)
 * @returns {Object|null} The emotion configuration or null if not found
 */
export function getEmotion(emotionName) {
    // Check aliases first
    const resolvedName = emotionAliases[emotionName] || emotionName;

    // Check core emotions
    const coreEmotion = emotionRegistry.get(resolvedName);
    if (coreEmotion) {
        return coreEmotion;
    }

    // Check plugin emotions
    const pluginEmotion = pluginAdapter.getPluginEmotion(resolvedName);
    if (pluginEmotion) {
        return pluginEmotion;
    }

    return null;
}

/**
 * Get emotion parameters (visual properties) with dynamic evaluation
 * @param {string} emotionName - Name of the emotion
 * @returns {Object} Visual parameters for the emotion
 */
export function getEmotionVisualParams(emotionName) {
    const emotion = getEmotion(emotionName);
    if (!emotion) {
        return getEmotion('neutral').visual;
    }

    // Make sure visual exists
    if (!emotion.visual) {
        return {};
    }
    
    // Create a copy of visual properties, excluding functions
    const {visual} = emotion;
    const params = {};
    
    // Copy non-function properties
    for (const key in visual) {
        if (typeof visual[key] !== 'function') {
            params[key] = visual[key];
        }
    }
    
    // Evaluate dynamic functions if they exist and override static values
    if (typeof visual.getGlowIntensity === 'function') {
        params.glowIntensity = visual.getGlowIntensity();
    }
    
    if (typeof visual.getParticleSpeed === 'function') {
        params.particleSpeed = visual.getParticleSpeed();
    }
    
    if (typeof visual.getParticleRate === 'function') {
        params.particleRate = visual.getParticleRate();
    }
    
    if (typeof visual.getGlowColor === 'function') {
        params.glowColor = visual.getGlowColor();
    }
    
    return params;
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
 * Get list of available emotions (core and plugin)
 * @returns {Array<string>} List of emotion names
 */
export function listEmotions() {
    const coreEmotions = Array.from(emotionRegistry.keys());
    const pluginEmotions = pluginAdapter.getAllPluginEmotions();
    return [...coreEmotions, ...pluginEmotions];
}

/**
 * Get all emotion configurations
 * @returns {Object} Object mapping emotion names to configurations
 */
export function getAllEmotions() {
    const emotions = {};
    emotionRegistry.forEach((value, key) => {
        emotions[key] = value;
    });
    return emotions;
}

/**
 * Check if an emotion exists (checks both core and plugin)
 * @param {string} emotionName - Name of the emotion to check
 * @returns {boolean} True if emotion exists
 */
export function hasEmotion(emotionName) {
    const resolvedName = emotionAliases[emotionName] || emotionName;
    return emotionRegistry.has(resolvedName) || pluginAdapter.getPluginEmotion(resolvedName) !== null;
}

/**
 * Add an emotion alias
 * @param {string} alias - The alias name
 * @param {string} emotionName - The actual emotion name
 */
export function addEmotionAlias(alias, emotionName) {
    emotionAliases[alias] = emotionName;
}

/**
 * Get emotion transition parameters
 * @param {string} fromEmotion - Starting emotion
 * @param {string} toEmotion - Target emotion
 * @returns {Object} Transition parameters
 */
export function getTransitionParams(fromEmotion, toEmotion) {
    const from = getEmotion(fromEmotion);
    const to = getEmotion(toEmotion);
    
    if (!from || !to) {
        return {
            duration: 1000,
            easing: 'ease-in-out'
        };
    }
    
    // Check if 'to' emotion has specific transition hints
    if (to.transitions && to.transitions[fromEmotion]) {
        return to.transitions[fromEmotion];
    }
    
    // Use default transition
    return {
        duration: 1000,
        easing: 'ease-in-out',
        gesture: to.transitions?.defaultGesture || null
    };
}

/**
 * Get typical gestures for an emotion
 * @param {string} emotionName - Name of the emotion
 * @returns {Array<string>} List of typical gesture names
 */
export function getEmotionGestures(emotionName) {
    const emotion = getEmotion(emotionName);
    return emotion?.gestures || [];
}

// Debug utilities can be imported directly if needed
// No longer polluting global scope

// Export plugin adapter for external use
export { pluginAdapter };

// Export everything
export default {
    registerEmotion,
    getEmotion,
    getEmotionVisualParams,
    getEmotionParams: getEmotionVisualParams, // Alias for compatibility
    getEmotionModifiers,
    listEmotions,
    getAllEmotions,
    hasEmotion,
    addEmotionAlias,
    getTransitionParams,
    getEmotionGestures,
    pluginAdapter
};