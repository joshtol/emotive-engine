/**
 * Emotive Engine — Minimal Gesture Registry
 *
 * Lightweight gesture registry for the minimal/loading-screen bundle.
 * Contains ~25 essential gestures (vs 134 in the full index).
 * Same exported API shape as the full index.
 *
 * @module gestures/index-minimal
 */

import pluginAdapter from './plugin-adapter.js';

// ── Idle / Breathing ──
import breathe from './idle/breathing/breathe.js';
import expand from './idle/breathing/expand.js';
import contract from './idle/breathing/contract.js';
import pulse from './idle/breathing/pulse.js';

// ── Idle / Swaying ──
import sway from './idle/swaying/sway.js';
import float from './idle/swaying/float.js';

// ── Idle / Fidgeting ──
import shake from './idle/fidgeting/shake.js';
import wiggle from './idle/fidgeting/wiggle.js';

// ── Dance / Accents ──
import bounce from './dance/accents/bounce.js';

// ── Actions / Acrobatics ──
import spin from './actions/acrobatics/spin.js';

// ── Actions / Gesturing ──
import nod from './actions/gesturing/nod.js';

// ── Actions / Locomotion ──
import jump from './actions/locomotion/jump.js';

// ── Reactions / Impacts ──
import stretch from './reactions/impacts/stretch.js';

// ── Reactions / Oscillations ──
import wobble from './reactions/oscillations/wobble.js';

// ── Atmosphere / Weather ──
import drift from './atmosphere/weather/drift.js';

// ── Atmosphere / Particles ──
import burst from './atmosphere/particles/burst.js';
import wave from './atmosphere/particles/wave.js';

// ── Atmosphere / Glow ──
import flash from './atmosphere/glow/flash.js';
import glow from './atmosphere/glow/glow.js';
import flicker from './atmosphere/glow/flicker.js';
import heartbeat from './atmosphere/glow/heartbeat.js';

// ── Atmosphere / Control ──
import fade from './atmosphere/control/fade.js';

// ── Inline definitions (no separate file import needed) ──

// Sparkle — bright twinkling bursts of light
const sparkle = {
    name: 'sparkle',
    emoji: '✨',
    type: 'blending',
    description: 'Bright twinkling sparkle bursts',
    config: {
        duration: 800,
        musicalDuration: { musical: true, beats: 2 },
    },
    rhythm: {
        enabled: true,
        syncMode: 'beat',
        timingSync: 'nextBeat',
        durationSync: { mode: 'beats', beats: 2 },
        interruptible: true,
        priority: 5,
        blendable: true,
    },
    apply: (_particle, _progress, _params) => false,
    blend: (_particle, _progress, _params) => false,
    '3d': {
        evaluate(progress, motion) {
            const strength = motion?.strength || 1.0;
            const sparkle1 = Math.pow(Math.max(0, Math.sin(progress * Math.PI * 6)), 3);
            const sparkle2 = Math.pow(Math.max(0, Math.sin(progress * Math.PI * 8 + 1)), 3);
            const sparkle3 = Math.pow(Math.max(0, Math.sin(progress * Math.PI * 10 + 2)), 3);
            const sparkleValue = Math.max(sparkle1, sparkle2, sparkle3);
            const envelope = Math.sin(progress * Math.PI);
            const finalSparkle = sparkleValue * envelope;
            const glowIntensity = 1.0 + finalSparkle * 0.5 * strength;
            const glowBoost = finalSparkle * 2.0 * strength;
            const scale = 1.0 + finalSparkle * 0.08 * strength;
            return { position: [0, 0, 0], rotation: [0, 0, 0], scale, glowIntensity, glowBoost };
        },
    },
};

// Shimmer — makes particles shimmer with wave effect
const shimmer = {
    name: 'shimmer',
    emoji: '🌟',
    type: 'particle',
    description: 'Shimmer effect with sparkling particles',
    config: {
        duration: 2000,
        musicalDuration: { musical: true, bars: 1 },
        particleMotion: 'radiant',
    },
    rhythm: {
        enabled: true,
        syncType: 'beat',
        durationSync: { mode: 'bars', bars: 1 },
        intensity: 0.8,
    },
    override: (particle, progress, _params) => {
        particle.shimmerEffect = true;
        particle.shimmerProgress = progress;
        return true;
    },
    blend: (_particle, _progress, _params) => false,
    '3d': {
        evaluate(progress, motion) {
            const strength = motion?.strength || 1.0;
            const wave1 = Math.sin(progress * Math.PI * 4);
            const wave2 = Math.sin(progress * Math.PI * 6 + 0.5);
            const wave3 = Math.sin(progress * Math.PI * 10 + 1.0);
            const shimmerValue = (wave1 * 0.4 + wave2 * 0.35 + wave3 * 0.25 + 1) / 2;
            const glowIntensity = 1.0 + shimmerValue * 0.3 * strength;
            const glowBoost = shimmerValue * 1.0 * strength;
            return {
                position: [0, 0, 0],
                rotation: [0, 0, 0],
                scale: 1.0 + shimmerValue * 0.05 * strength,
                glowIntensity,
                glowBoost,
            };
        },
    },
};

// ── GESTURE REGISTRY ──

export const GESTURE_REGISTRY = {};

const _motionNames = [];
const _transformNames = [];
const _effectNames = [];

function _regEager(gesture, group) {
    GESTURE_REGISTRY[gesture.name] = gesture;
    group.push(gesture.name);
}

// ── MOTION gestures ──
[
    bounce, pulse, breathe, expand, contract,
    sway, float, nod, shake, sparkle, shimmer,
    wiggle, wobble,
].forEach(g => _regEager(g, _motionNames));

// ── TRANSFORM gestures ──
[
    spin, jump, stretch,
].forEach(g => _regEager(g, _transformNames));

// ── EFFECT gestures ──
[
    wave, drift, flicker, burst, flash,
    glow, heartbeat, fade,
].forEach(g => _regEager(g, _effectNames));

// ── GESTURE TYPE MAPPING ──
export const GESTURE_TYPES = {
    blending: _motionNames,
    override: _transformNames,
    effect: _effectNames,
};

// ── Reverse lookup ──
const GESTURE_TO_CATEGORY = {};
Object.entries(GESTURE_TYPES).forEach(([category, names]) => {
    names.forEach(name => { GESTURE_TO_CATEGORY[name] = category; });
});

/**
 * Check if a gesture is a blending type
 * @param {string} name - Gesture name
 * @returns {boolean}
 */
export function isBlendingGesture(name) {
    const gesture = getGesture(name);
    return gesture ? gesture.type === 'blending' : false;
}

/**
 * Check if a gesture is an override type
 * @param {string} name - Gesture name
 * @returns {boolean}
 */
export function isOverrideGesture(name) {
    const gesture = getGesture(name);
    return gesture ? gesture.type === 'override' : false;
}

/**
 * Semantic categories (minimal subset)
 */
export const GESTURE_CATEGORIES = {
    idle: ['breathe', 'expand', 'contract', 'pulse', 'sway', 'float', 'shake', 'wiggle'],
    dance: ['bounce', 'sparkle', 'shimmer'],
    actions: ['spin', 'jump', 'nod', 'stretch'],
    reactions: ['wobble'],
    atmosphere: ['wave', 'drift', 'flicker', 'burst', 'flash', 'glow', 'heartbeat', 'fade'],
};

export { GESTURE_TO_CATEGORY };

/**
 * Get the semantic category for a gesture
 * @param {string} name - Gesture name
 * @returns {string} Category name
 */
export function getGestureCategory(name) {
    return GESTURE_TO_CATEGORY[name] || 'atmosphere';
}

/**
 * No-op warm up (minimal build has no lazy getters)
 */
export function warmUpGestures({ onBatch, onComplete } = {}) {
    if (onBatch) {
        onBatch(Object.keys(GESTURE_REGISTRY).map(name => ({
            name, category: GESTURE_TO_CATEGORY[name] || 'atmosphere', source: 'core',
        })));
    }
    if (onComplete) onComplete();
}

/**
 * Get a gesture by name
 * @param {string} name - Gesture name
 * @returns {Object|null} Gesture object or null
 */
export function getGesture(name) {
    if (GESTURE_REGISTRY[name]) {
        return GESTURE_REGISTRY[name];
    }
    const pluginGesture = pluginAdapter.getPluginGesture(name);
    if (pluginGesture) {
        return pluginGesture;
    }
    return null;
}

/**
 * Apply a gesture to a particle
 * @param {Object} particle - The particle
 * @param {string} gestureName - Gesture name
 * @param {number} progress - Animation progress (0-1)
 * @param {Object} motion - Motion configuration
 * @param {number} dt - Delta time
 * @param {number} centerX - Orb center X
 * @param {number} centerY - Orb center Y
 * @returns {boolean} True if gesture was applied
 */
export function applyGesture(particle, gestureName, progress, motion, dt, centerX, centerY) {
    const gesture = getGesture(gestureName);
    if (!gesture) return false;
    if (gesture.apply) {
        gesture.apply(particle, progress, motion, dt, centerX, centerY);
    }
    if (progress >= 1 && gesture.cleanup) {
        gesture.cleanup(particle);
    }
    return true;
}

/**
 * List all available gestures
 * @returns {Array} Array of gesture info objects
 */
export function listGestures() {
    const allGestures = [];
    Object.values(GESTURE_REGISTRY).forEach(gesture => {
        allGestures.push({
            name: gesture.name,
            emoji: gesture.emoji || '🎭',
            type: gesture.type,
            category: GESTURE_TO_CATEGORY[gesture.name] || 'atmosphere',
            description: gesture.description || 'No description',
            source: 'core',
        });
    });
    const pluginGestureNames = pluginAdapter.getAllPluginGestures();
    pluginGestureNames.forEach(name => {
        const gesture = pluginAdapter.getPluginGesture(name);
        allGestures.push({
            name: gesture.name,
            emoji: gesture.emoji || '🔌',
            type: gesture.type,
            category: gesture.category || 'effect',
            description: gesture.description || 'Plugin gesture',
            source: 'plugin',
        });
    });
    return allGestures;
}

export { pluginAdapter };
