/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Intent Parser
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview IntentParser - Natural Language Intent Parsing for LLM Integration
 * @author Emotive Engine Team
 * @version 1.0.0
 * @module core/intent/IntentParser
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Parses natural language intent strings from LLMs into structured commands
 * ║ that the Emotive Engine can execute. Enables LLMs to express intent in plain
 * ║ text like "curious, leaning in" rather than API calls.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🎯 EXAMPLE USAGE
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ const parser = new IntentParser();
 * │ const result = parser.parse('happy, bouncing, heart shape');
 * │ // Returns: {
 * │ //   emotion: 'joy',
 * │ //   undertone: 'clear',
 * │ //   gestures: ['bounce'],
 * │ //   shape: 'heart',
 * │ //   intensity: 0.55,
 * │ //   duration: 1500
 * │ // }
 * └───────────────────────────────────────────────────────────────────────────────────
 */

import { tokenize, isConnector, isNegation } from './tokenizer.js';
import { resolve, hasConflict } from './conflictResolver.js';
import { emotions } from './synonyms/emotions.js';
import { undertones } from './synonyms/undertones.js';
import { gestures } from './synonyms/gestures.js';
import { shapes } from './synonyms/shapes.js';
import { modifiers, intensityValues, durationValues } from './synonyms/modifiers.js';

/**
 * Build a reverse lookup map from synonyms to canonical names
 * @param {Object} synonymMap - Map of canonical → [synonyms]
 * @returns {Map<string, string>} Map of synonym → canonical
 */
function buildReverseLookup(synonymMap) {
    const lookup = new Map();
    for (const [canonical, synonyms] of Object.entries(synonymMap)) {
        for (const synonym of synonyms) {
            // Normalize the synonym
            const normalized = synonym.toLowerCase().trim();
            lookup.set(normalized, canonical);
        }
        // Also map canonical to itself
        lookup.set(canonical.toLowerCase(), canonical);
    }
    return lookup;
}

/**
 * Build reverse lookup for nested modifier structure
 * @param {Object} modifierMap - Nested modifier map
 * @returns {Map<string, {type: string, level: string}>}
 */
function buildModifierLookup(modifierMap) {
    const lookup = new Map();
    for (const [type, levels] of Object.entries(modifierMap)) {
        for (const [level, synonyms] of Object.entries(levels)) {
            for (const synonym of synonyms) {
                const normalized = synonym.toLowerCase().trim();
                lookup.set(normalized, { type, level });
            }
        }
    }
    return lookup;
}

/**
 * IntentParser class
 *
 * Parses natural language intent strings into structured mascot commands.
 */
export class IntentParser {
    constructor() {
        // Build reverse lookup tables
        this.emotionLookup = buildReverseLookup(emotions);
        this.undertoneLookup = buildReverseLookup(undertones);
        this.gestureLookup = buildReverseLookup(gestures);
        this.shapeLookup = buildReverseLookup(shapes);
        this.modifierLookup = buildModifierLookup(modifiers);
    }

    /**
     * Parse a natural language intent string
     *
     * @param {string} intent - Natural language intent (e.g., "happy, bouncing")
     * @returns {Object} Parsed intent object
     * @returns {string|null} returns.emotion - Canonical emotion name
     * @returns {string} returns.undertone - Canonical undertone name (default: 'clear')
     * @returns {string[]} returns.gestures - Array of canonical gesture names
     * @returns {string|null} returns.shape - Canonical shape name
     * @returns {number} returns.intensity - Intensity value (0-1)
     * @returns {number} returns.duration - Duration in milliseconds
     * @returns {string[]} returns.unrecognized - Tokens that couldn't be parsed
     *
     * @example
     * parser.parse('excited, bouncing, star shape')
     * // { emotion: 'joy', gestures: ['bounce'], shape: 'star', ... }
     *
     * parser.parse('nervous but trying to be confident')
     * // { emotion: 'fear', undertone: 'confident', ... }
     *
     * parser.parse('very happy, slow nod')
     * // { emotion: 'joy', intensity: 0.8, gestures: ['nod'], duration: 3000, ... }
     */
    parse(intent) {
        // Initialize result
        const result = {
            emotion: null,
            undertone: 'clear',
            gestures: [],
            shape: null,
            intensity: intensityValues.normal.default,
            duration: durationValues.normal.default,
            transition: 'smooth',
            repetition: 'once',
            unrecognized: [],
            raw: intent,
        };

        // Handle empty/invalid input
        if (!intent || typeof intent !== 'string') {
            return result;
        }

        // Tokenize
        const { tokens } = tokenize(intent);

        if (tokens.length === 0) {
            return result;
        }

        // Track negations for the next token
        let negateNext = false;

        // Process each token
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];

            // Handle connectors (but, and, etc.)
            if (isConnector(token)) {
                // 'but' often introduces an undertone
                continue;
            }

            // Handle negations
            if (isNegation(token)) {
                negateNext = true;
                continue;
            }

            // Skip if negated (we don't support "not happy" yet - complex semantics)
            if (negateNext) {
                negateNext = false;
                continue;
            }

            // Check for conflicts first
            if (hasConflict(token)) {
                const resolution = resolve(token, tokens, i, result);
                if (resolution) {
                    this._applyResolution(result, resolution);
                    continue;
                }
            }

            // Try each category in priority order
            if (this._tryEmotion(token, result)) continue;
            if (this._tryGesture(token, result)) continue;
            if (this._tryShape(token, result)) continue;
            if (this._tryUndertone(token, result)) continue;
            if (this._tryModifier(token, result)) continue;

            // Unrecognized token
            result.unrecognized.push(token);
        }

        return result;
    }

    /**
     * Apply a conflict resolution result
     * @private
     */
    _applyResolution(result, resolution) {
        const { category, target } = resolution;

        switch (category) {
            case 'emotion':
                if (!result.emotion) {
                    result.emotion = target;
                }
                break;
            case 'undertone':
                if (result.undertone === 'clear') {
                    result.undertone = target;
                }
                break;
            case 'gesture':
                if (!result.gestures.includes(target)) {
                    result.gestures.push(target);
                }
                break;
            case 'shape':
                if (!result.shape) {
                    result.shape = target;
                }
                break;
        }
    }

    /**
     * Try to match token as emotion
     * @private
     */
    _tryEmotion(token, result) {
        const emotion = this.emotionLookup.get(token);
        if (emotion && !result.emotion) {
            result.emotion = emotion;
            return true;
        }
        return false;
    }

    /**
     * Try to match token as gesture
     * @private
     */
    _tryGesture(token, result) {
        const gesture = this.gestureLookup.get(token);
        if (gesture && !result.gestures.includes(gesture)) {
            result.gestures.push(gesture);
            return true;
        }
        return false;
    }

    /**
     * Try to match token as shape
     * @private
     */
    _tryShape(token, result) {
        const shape = this.shapeLookup.get(token);
        if (shape && !result.shape) {
            result.shape = shape;
            return true;
        }
        return false;
    }

    /**
     * Try to match token as undertone
     * @private
     */
    _tryUndertone(token, result) {
        const undertone = this.undertoneLookup.get(token);
        if (undertone && result.undertone === 'clear') {
            result.undertone = undertone;
            return true;
        }
        return false;
    }

    /**
     * Try to match token as modifier
     * @private
     */
    _tryModifier(token, result) {
        const modifier = this.modifierLookup.get(token);
        if (modifier) {
            const { type, level } = modifier;

            switch (type) {
                case 'intensity':
                    result.intensity = intensityValues[level]?.default || result.intensity;
                    break;
                case 'duration':
                    result.duration = durationValues[level]?.default || result.duration;
                    break;
                case 'transition':
                    result.transition = level;
                    break;
                case 'repetition':
                    result.repetition = level;
                    break;
            }
            return true;
        }
        return false;
    }

    /**
     * Validate a parsed result
     * @param {Object} parsed - Parsed intent result
     * @returns {Object} Validation result { valid: boolean, errors: string[] }
     */
    validate(parsed) {
        const errors = [];

        // Must have at least one actionable element
        if (!parsed.emotion && parsed.gestures.length === 0 && !parsed.shape) {
            errors.push('No actionable intent found (need emotion, gesture, or shape)');
        }

        // Intensity must be in range
        if (parsed.intensity < 0 || parsed.intensity > 1) {
            errors.push(`Intensity ${parsed.intensity} out of range [0, 1]`);
        }

        // Duration must be positive
        if (parsed.duration <= 0) {
            errors.push(`Duration ${parsed.duration} must be positive`);
        }

        return {
            valid: errors.length === 0,
            errors,
        };
    }

    /**
     * Get available emotions
     * @returns {string[]}
     */
    static getAvailableEmotions() {
        return Object.keys(emotions);
    }

    /**
     * Get available undertones
     * @returns {string[]}
     */
    static getAvailableUndertones() {
        return Object.keys(undertones);
    }

    /**
     * Get available gestures
     * @returns {string[]}
     */
    static getAvailableGestures() {
        return Object.keys(gestures);
    }

    /**
     * Get available shapes
     * @returns {string[]}
     */
    static getAvailableShapes() {
        return Object.keys(shapes);
    }
}

export default IntentParser;
