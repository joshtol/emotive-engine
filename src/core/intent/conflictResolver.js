/**
 * Conflict Resolver
 *
 * Resolves ambiguous tokens that could map to multiple categories.
 * Uses context, priority rules, and co-occurrence to disambiguate.
 *
 * @module core/intent/conflictResolver
 */

import { conflictRules, contextHints } from './synonyms/conflicts.js';

/**
 * Check if context words suggest a particular category
 * @param {string[]} tokens - All tokens in the intent
 * @param {number} tokenIndex - Index of the ambiguous token
 * @param {string} category - Category to check for
 * @returns {boolean} Whether context suggests this category
 */
function hasContextFor(tokens, tokenIndex, category) {
    const hints = contextHints[`${category}Context`];
    if (!hints) return false;

    // Check tokens before and after (within 3 positions)
    const start = Math.max(0, tokenIndex - 3);
    const end = Math.min(tokens.length, tokenIndex + 4);

    for (let i = start; i < end; i++) {
        if (i === tokenIndex) continue;
        if (hints.includes(tokens[i])) {
            return true;
        }
    }

    return false;
}

/**
 * Check if another token of a specific category exists
 * @param {Object} parsed - Current parsed result
 * @param {string} category - Category to check
 * @returns {boolean}
 */
function hasCategory(parsed, category) {
    switch (category) {
    case 'emotion':
        return parsed.emotion !== null;
    case 'gesture':
        return parsed.gestures && parsed.gestures.length > 0;
    case 'shape':
        return parsed.shape !== null;
    case 'undertone':
        return parsed.undertone !== null;
    default:
        return false;
    }
}

/**
 * Resolve a conflicting token to its most appropriate category
 *
 * @param {string} token - The ambiguous token
 * @param {string[]} allTokens - All tokens in the intent
 * @param {number} tokenIndex - Index of this token
 * @param {Object} currentParsed - Current parsing state
 * @returns {Object|null} Resolution { category, target } or null if no conflict
 *
 * @example
 * resolve('nervous', ['nervous'], 0, {})
 * // Returns: { category: 'emotion', target: 'fear' }
 *
 * resolve('nervous', ['happy', 'but', 'nervous'], 2, { emotion: 'joy' })
 * // Returns: { category: 'undertone', target: 'nervous' }
 */
export function resolve(token, allTokens, tokenIndex, currentParsed) {
    const rule = conflictRules[token];

    // No conflict for this token
    if (!rule) {
        return null;
    }

    const { candidates, rule: ruleName } = rule;

    // Single candidate - no actual conflict
    if (candidates.length === 1) {
        return candidates[0];
    }

    // Apply the specific rule
    switch (ruleName) {
    case 'standalone_is_emotion': {
        // If we already have an emotion, this becomes undertone/gesture
        if (hasCategory(currentParsed, 'emotion')) {
            // Find first non-emotion candidate
            const nonEmotion = candidates.find(c => c.category !== 'emotion');
            if (nonEmotion) return nonEmotion;
        }
        // Check for emotion context words
        if (hasContextFor(allTokens, tokenIndex, 'emotion')) {
            return candidates.find(c => c.category === 'emotion') || candidates[0];
        }
        // Default to emotion
        return candidates.find(c => c.category === 'emotion') || candidates[0];
    }

    case 'standalone_is_gesture': {
        // If we already have this gesture type, maybe it's something else
        if (hasCategory(currentParsed, 'gesture')) {
            const nonGesture = candidates.find(c => c.category !== 'gesture');
            if (nonGesture) return nonGesture;
        }
        // Check for gesture context words
        if (hasContextFor(allTokens, tokenIndex, 'gesture')) {
            return candidates.find(c => c.category === 'gesture') || candidates[0];
        }
        // Default to gesture
        return candidates.find(c => c.category === 'gesture') || candidates[0];
    }

    case 'prefer_undertone': {
        // If emotion context is explicit, use emotion
        if (hasContextFor(allTokens, tokenIndex, 'emotion')) {
            return candidates.find(c => c.category === 'emotion') || candidates[0];
        }
        // Default to undertone
        return candidates.find(c => c.category === 'undertone') || candidates[0];
    }

    case 'always_gesture':
        return candidates.find(c => c.category === 'gesture') || candidates[0];

    case 'always_emotion':
        return candidates.find(c => c.category === 'emotion') || candidates[0];

    case 'context_dependent': {
        // Check each category's context
        for (const category of ['emotion', 'gesture', 'shape', 'undertone']) {
            if (hasContextFor(allTokens, tokenIndex, category)) {
                const match = candidates.find(c => c.category === category);
                if (match) return match;
            }
        }
        // Fall back to highest priority
        return candidates.sort((a, b) => a.priority - b.priority)[0];
    }

    default:
        // Unknown rule, use priority
        return candidates.sort((a, b) => a.priority - b.priority)[0];
    }
}

/**
 * Check if a token has potential conflicts
 * @param {string} token - Token to check
 * @returns {boolean}
 */
export function hasConflict(token) {
    return token in conflictRules;
}

/**
 * Get all possible interpretations for a token
 * @param {string} token - Token to check
 * @returns {Array<{category: string, target: string}>} Possible interpretations
 */
export function getPossibilities(token) {
    const rule = conflictRules[token];
    if (!rule) return [];
    return rule.candidates;
}

export default { resolve, hasConflict, getPossibilities };
