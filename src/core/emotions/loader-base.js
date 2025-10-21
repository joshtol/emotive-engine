/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Emotion Loader (Base Only)
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Loads base emotions only (no rhythm sync)
 * @author Emotive Engine Team
 * @module emotions/loader-base
 */

// Import base emotion modules (visual/behavioral only, no rhythm)
import neutral from './base/neutral.js';
import joy from './base/joy.js';
import sadness from './base/sadness.js';
import anger from './base/anger.js';
import fear from './base/fear.js';
import surprise from './base/surprise.js';
import disgust from './base/disgust.js';
import love from './base/love.js';
import suspicion from './base/suspicion.js';
import excited from './base/excited.js';
import resting from './base/resting.js';
import euphoria from './base/euphoria.js';
import focused from './base/focused.js';
import glitch from './base/glitch.js';
import calm from './base/calm.js';

/**
 * Get all base emotions as array
 * @returns {Array} Array of base emotion objects
 */
export function getBaseEmotions() {
    return [
        neutral, joy, sadness, anger, fear, surprise, disgust,
        love, suspicion, excited, resting, euphoria, focused, glitch, calm
    ];
}

/**
 * Get base emotion by name
 * @param {string} name - Emotion name
 * @returns {Object|null} Base emotion object or null
 */
export function getBaseEmotion(name) {
    const emotions = {
        neutral, joy, sadness, anger, fear, surprise, disgust,
        love, suspicion, excited, resting, euphoria, focused, glitch, calm
    };
    return emotions[name] || null;
}

export default getBaseEmotions;
