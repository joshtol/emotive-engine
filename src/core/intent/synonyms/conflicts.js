/**
 * Conflict Resolution Rules
 *
 * Handles cases where a word or phrase could map to multiple categories.
 * Provides disambiguation rules and context hints for the parser.
 *
 * @module core/intent/synonyms/conflicts
 */

/**
 * Words that exist in multiple synonym categories
 * Maps word → array of potential categories with priority
 *
 * Priority order (highest to lowest):
 * 1. emotion - Primary emotional state
 * 2. gesture - Physical action
 * 3. shape - Visual form
 * 4. undertone - Emotional modifier
 * 5. modifier - Intensity/timing
 */
export const conflictRules = {
    // ═══════════════════════════════════════════════════════════════════
    // EMOTION vs UNDERTONE conflicts
    // ═══════════════════════════════════════════════════════════════════

    // "nervous" could be emotion (fear variant) or undertone
    nervous: {
        candidates: [
            { category: 'emotion', target: 'fear', priority: 1 },
            { category: 'undertone', target: 'nervous', priority: 2 },
        ],
        // If standalone, it's an emotion. If modifying another emotion, it's undertone.
        rule: 'standalone_is_emotion',
        examples: [
            { input: 'nervous', resolved: { emotion: 'fear' } },
            { input: 'happy but nervous', resolved: { emotion: 'joy', undertone: 'nervous' } },
        ],
    },

    // "anxious" - similar to nervous
    anxious: {
        candidates: [
            { category: 'emotion', target: 'fear', priority: 1 },
            { category: 'undertone', target: 'nervous', priority: 2 },
        ],
        rule: 'standalone_is_emotion',
    },

    // "confident" could be emotion (trust/pride) or undertone
    confident: {
        candidates: [
            { category: 'emotion', target: 'trust', priority: 2 },
            { category: 'undertone', target: 'confident', priority: 1 },
        ],
        // Confident is more often used as a modifier
        rule: 'prefer_undertone',
        examples: [
            { input: 'confident', resolved: { undertone: 'confident' } },
            { input: 'feeling confident', resolved: { emotion: 'trust' } },
        ],
    },

    // "tired" could be emotion (sadness variant) or undertone
    tired: {
        candidates: [
            { category: 'emotion', target: 'sadness', priority: 2 },
            { category: 'undertone', target: 'tired', priority: 1 },
        ],
        rule: 'prefer_undertone',
        examples: [
            { input: 'tired', resolved: { undertone: 'tired' } },
            { input: 'feeling tired', resolved: { emotion: 'sadness', undertone: 'tired' } },
        ],
    },

    // "intense" - modifier or undertone
    intense: {
        candidates: [
            { category: 'undertone', target: 'intense', priority: 1 },
            { category: 'modifier', target: 'intensity.very', priority: 2 },
        ],
        rule: 'prefer_undertone',
    },

    // ═══════════════════════════════════════════════════════════════════
    // EMOTION vs GESTURE conflicts
    // ═══════════════════════════════════════════════════════════════════

    // "curious" could be emotion (focused) or gesture (lean)
    curious: {
        candidates: [
            { category: 'emotion', target: 'focused', priority: 1 },
            { category: 'gesture', target: 'lean', priority: 2 },
        ],
        rule: 'standalone_is_emotion',
        examples: [
            { input: 'curious', resolved: { emotion: 'focused' } },
            { input: 'curious, leaning in', resolved: { emotion: 'focused', gesture: 'lean' } },
        ],
    },

    // "interested" - similar to curious
    interested: {
        candidates: [
            { category: 'emotion', target: 'focused', priority: 1 },
            { category: 'gesture', target: 'lean', priority: 2 },
        ],
        rule: 'standalone_is_emotion',
    },

    // "excited" could be emotion or gesture (bounce)
    excited: {
        candidates: [
            { category: 'emotion', target: 'joy', priority: 1 },
            { category: 'gesture', target: 'bounce', priority: 3 },
        ],
        rule: 'standalone_is_emotion',
    },

    // "shaking" could be emotion (fear) or gesture (shake)
    shaking: {
        candidates: [
            { category: 'gesture', target: 'shake', priority: 1 },
            { category: 'emotion', target: 'fear', priority: 2 },
        ],
        rule: 'standalone_is_gesture',
    },

    // "nodding" - gesture primarily
    nodding: {
        candidates: [{ category: 'gesture', target: 'nod', priority: 1 }],
        rule: 'always_gesture',
    },

    // ═══════════════════════════════════════════════════════════════════
    // GESTURE vs SHAPE conflicts
    // ═══════════════════════════════════════════════════════════════════

    // "glowing" could be gesture or shape modifier
    glowing: {
        candidates: [
            { category: 'gesture', target: 'glow', priority: 1 },
            { category: 'shape', target: 'sun', priority: 3 },
        ],
        rule: 'standalone_is_gesture',
    },

    // "spinning" - gesture
    spinning: {
        candidates: [{ category: 'gesture', target: 'spin', priority: 1 }],
        rule: 'always_gesture',
    },

    // ═══════════════════════════════════════════════════════════════════
    // EMOTION vs SHAPE conflicts
    // ═══════════════════════════════════════════════════════════════════

    // "love" could be emotion or shape (heart)
    love: {
        candidates: [
            { category: 'emotion', target: 'love', priority: 1 },
            { category: 'shape', target: 'heart', priority: 2 },
        ],
        rule: 'standalone_is_emotion',
        examples: [
            { input: 'love', resolved: { emotion: 'love' } },
            { input: 'love heart', resolved: { emotion: 'love', shape: 'heart' } },
            { input: 'become love', resolved: { shape: 'heart' } },
        ],
    },

    // "suspicious" could be emotion or shape
    suspicious: {
        candidates: [
            { category: 'emotion', target: 'suspicion', priority: 1 },
            { category: 'shape', target: 'suspicion', priority: 2 },
        ],
        rule: 'standalone_is_emotion',
    },

    // "bright" could be emotion (joy) or shape (sun/star)
    bright: {
        candidates: [
            { category: 'emotion', target: 'joy', priority: 2 },
            { category: 'shape', target: 'sun', priority: 3 },
            { category: 'modifier', target: 'intensity.very', priority: 4 },
        ],
        rule: 'context_dependent',
    },

    // ═══════════════════════════════════════════════════════════════════
    // AGREEMENT/DISAGREEMENT - Gesture specific
    // ═══════════════════════════════════════════════════════════════════

    // "yes" - nod gesture
    yes: {
        candidates: [{ category: 'gesture', target: 'nod', priority: 1 }],
        rule: 'always_gesture',
    },

    // "no" - shake gesture
    no: {
        candidates: [{ category: 'gesture', target: 'shake', priority: 1 }],
        rule: 'always_gesture',
    },

    // "agree" - could be gesture or emotion
    agree: {
        candidates: [
            { category: 'gesture', target: 'nod', priority: 1 },
            { category: 'emotion', target: 'trust', priority: 2 },
        ],
        rule: 'standalone_is_gesture',
    },

    // "disagree" - shake gesture
    disagree: {
        candidates: [{ category: 'gesture', target: 'shake', priority: 1 }],
        rule: 'always_gesture',
    },
};

/**
 * Context hints that help disambiguate
 * If these words appear nearby, they suggest a particular category
 */
export const contextHints = {
    // Words that suggest emotion context
    emotionContext: [
        'feeling',
        'feel',
        'feels',
        'felt',
        'emotion',
        'emotional',
        'emotionally',
        'mood',
        'moody',
        'state',
        'am',
        'is',
        'are',
        'being',
        'becoming',
        'become',
        'grew',
        'growing',
    ],

    // Words that suggest gesture context
    gestureContext: [
        'do',
        'doing',
        'does',
        'did',
        'perform',
        'performing',
        'action',
        'move',
        'moving',
        'movement',
        'start',
        'starting',
        'begin',
        'beginning',
        'physically',
        'motion',
    ],

    // Words that suggest shape context
    shapeContext: [
        'morph',
        'morphing',
        'morphed',
        'transform',
        'transforming',
        'transformed',
        'become',
        'becoming',
        'turn into',
        'shape',
        'form',
        'look like',
        'change to',
        'change into',
    ],

    // Words that suggest undertone context
    undertoneContext: [
        'but',
        'yet',
        'while',
        'although',
        'with',
        'and also',
        'mixed with',
        'underneath',
        'underlying',
        'beneath',
        'a bit',
        'slightly',
        'somewhat',
    ],

    // Words that suggest modifier context
    modifierContext: [
        'very',
        'really',
        'so',
        'extremely',
        'slightly',
        'barely',
        'completely',
        'quickly',
        'slowly',
        'briefly',
    ],
};

/**
 * Resolution rules explained:
 *
 * standalone_is_emotion: If the word appears alone without other context,
 *   treat it as an emotion. If it appears with another emotion word, it
 *   becomes an undertone or gesture modifier.
 *
 * standalone_is_gesture: If the word appears alone, treat it as a gesture.
 *
 * prefer_undertone: Default to undertone interpretation unless "feeling"
 *   or other emotion context words are present.
 *
 * always_gesture: This word is always interpreted as a gesture.
 *
 * context_dependent: Look at surrounding words to determine category.
 *   Falls back to highest priority if no context helps.
 */
