/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Emotion Loader (Full with Rhythm)
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Loads emotions with rhythm sync merged
 * @author Emotive Engine Team
 * @module emotions/loader-full
 */

// Import base emotion modules
import neutralBase from './base/neutral.js';
import joyBase from './base/joy.js';
import sadnessBase from './base/sadness.js';
import angerBase from './base/anger.js';
import fearBase from './base/fear.js';
import surpriseBase from './base/surprise.js';
import disgustBase from './base/disgust.js';
import loveBase from './base/love.js';
import suspicionBase from './base/suspicion.js';
import excitedBase from './base/excited.js';
import restingBase from './base/resting.js';
import euphoriaBase from './base/euphoria.js';
import focusedBase from './base/focused.js';
import glitchBase from './base/glitch.js';
import calmBase from './base/calm.js';

// Import rhythm modules
import neutralRhythm from './rhythm/neutral.js';
import joyRhythm from './rhythm/joy.js';
import sadnessRhythm from './rhythm/sadness.js';
import angerRhythm from './rhythm/anger.js';
import fearRhythm from './rhythm/fear.js';
import surpriseRhythm from './rhythm/surprise.js';
import disgustRhythm from './rhythm/disgust.js';
import loveRhythm from './rhythm/love.js';
import suspicionRhythm from './rhythm/suspicion.js';
import excitedRhythm from './rhythm/excited.js';
import restingRhythm from './rhythm/resting.js';
import euphoriaRhythm from './rhythm/euphoria.js';
import focusedRhythm from './rhythm/focused.js';
import glitchRhythm from './rhythm/glitch.js';
import calmRhythm from './rhythm/calm.js';

/**
 * Merge base emotion with rhythm properties
 * @param {Object} base - Base emotion object
 * @param {Object} rhythm - Rhythm properties object
 * @returns {Object} Merged emotion object
 */
function mergeEmotion(base, rhythm) {
    return { ...base, ...rhythm };
}

// Create full emotions with rhythm
const neutral = mergeEmotion(neutralBase, neutralRhythm);
const joy = mergeEmotion(joyBase, joyRhythm);
const sadness = mergeEmotion(sadnessBase, sadnessRhythm);
const anger = mergeEmotion(angerBase, angerRhythm);
const fear = mergeEmotion(fearBase, fearRhythm);
const surprise = mergeEmotion(surpriseBase, surpriseRhythm);
const disgust = mergeEmotion(disgustBase, disgustRhythm);
const love = mergeEmotion(loveBase, loveRhythm);
const suspicion = mergeEmotion(suspicionBase, suspicionRhythm);
const excited = mergeEmotion(excitedBase, excitedRhythm);
const resting = mergeEmotion(restingBase, restingRhythm);
const euphoria = mergeEmotion(euphoriaBase, euphoriaRhythm);
const focused = mergeEmotion(focusedBase, focusedRhythm);
const glitch = mergeEmotion(glitchBase, glitchRhythm);
const calm = mergeEmotion(calmBase, calmRhythm);

/**
 * Get all full emotions as array
 * @returns {Array} Array of full emotion objects with rhythm
 */
export function getFullEmotions() {
    return [
        neutral,
        joy,
        sadness,
        anger,
        fear,
        surprise,
        disgust,
        love,
        suspicion,
        excited,
        resting,
        euphoria,
        focused,
        glitch,
        calm,
    ];
}

/**
 * Get full emotion by name
 * @param {string} name - Emotion name
 * @returns {Object|null} Full emotion object or null
 */
export function getFullEmotion(name) {
    const emotions = {
        neutral,
        joy,
        sadness,
        anger,
        fear,
        surprise,
        disgust,
        love,
        suspicion,
        excited,
        resting,
        euphoria,
        focused,
        glitch,
        calm,
    };
    return emotions[name] || null;
}

export default getFullEmotions;
