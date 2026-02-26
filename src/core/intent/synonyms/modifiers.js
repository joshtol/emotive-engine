/**
 * Modifier Synonyms
 *
 * Maps natural language words to intensity and timing modifiers.
 * These modify how emotions and gestures are expressed.
 *
 * @module core/intent/synonyms/modifiers
 */

export const modifiers = {
    // ═══════════════════════════════════════════════════════════════════
    // INTENSITY MODIFIERS - How strongly to express
    // ═══════════════════════════════════════════════════════════════════

    intensity: {
        // Very low (0.1 - 0.2)
        barely: [
            'barely',
            'hardly',
            'scarcely',
            'faintly',
            'slightly',
            'marginally',
            'just a bit',
            'just a little',
            'just barely',
            'hint of',
            'touch of',
            'trace of',
        ],

        // Low (0.2 - 0.4)
        slightly: [
            'slightly',
            'somewhat',
            'a little',
            'a bit',
            'mildly',
            'lightly',
            'kind of',
            'kinda',
            'sort of',
            'sorta',
            'a tad',
            'a touch',
            'a smidge',
        ],

        // Medium-low (0.4 - 0.5)
        moderately: ['moderately', 'reasonably', 'fairly', 'pretty', 'rather', 'quite'],

        // Medium (0.5 - 0.6) - Default, no modifier needed
        normal: [
            'normal',
            'normally',
            'regular',
            'regularly',
            'standard',
            'typical',
            'typically',
            'average',
            'ordinary',
        ],

        // Medium-high (0.6 - 0.7)
        notably: [
            'notably',
            'noticeably',
            'clearly',
            'definitely',
            'certainly',
            'decidedly',
            'genuinely',
            'truly',
            'really',
        ],

        // High (0.7 - 0.85)
        very: [
            'very',
            'really',
            'so',
            'such',
            'quite',
            'highly',
            'deeply',
            'seriously',
            'majorly',
            'hella',
            'super',
            'extra',
            'mad',
        ],

        // Very high (0.85 - 0.95)
        extremely: [
            'extremely',
            'incredibly',
            'immensely',
            'tremendously',
            'enormously',
            'hugely',
            'intensely',
            'fiercely',
            'wildly',
            'insanely',
            'crazy',
            'ridiculously',
            'mega',
            'ultra',
            'hyper',
        ],

        // Maximum (0.95 - 1.0)
        absolutely: [
            'absolutely',
            'completely',
            'totally',
            'utterly',
            'entirely',
            'wholly',
            'fully',
            'maximum',
            'max',
            'over the top',
            'off the charts',
            'through the roof',
            'to the max',
        ],
    },

    // ═══════════════════════════════════════════════════════════════════
    // DURATION MODIFIERS - How long to express
    // ═══════════════════════════════════════════════════════════════════

    duration: {
        // Very brief (< 500ms)
        flash: [
            'flash',
            'instant',
            'instantaneous',
            'split second',
            'split-second',
            'momentary',
            'fleeting',
            'brief flash',
        ],

        // Brief (500ms - 1s)
        quick: [
            'quick',
            'quickly',
            'fast',
            'rapid',
            'swift',
            'swiftly',
            'brief',
            'briefly',
            'short',
            'shortly',
            'snap',
        ],

        // Normal (1s - 2s) - Default
        normal: ['normal', 'regular', 'standard', 'typical', 'usual'],

        // Extended (2s - 4s)
        slow: [
            'slow',
            'slowly',
            'gradual',
            'gradually',
            'gentle',
            'gently',
            'easy',
            'easily',
            'leisurely',
            'unhurried',
        ],

        // Long (4s - 8s)
        long: [
            'long',
            'prolonged',
            'extended',
            'sustained',
            'lasting',
            'lingering',
            'drawn out',
            'drawn-out',
        ],

        // Persistent (> 8s or until changed)
        persistent: [
            'persistent',
            'constant',
            'continuous',
            'ongoing',
            'steady',
            'maintained',
            'held',
            'holding',
            'stay',
            'staying',
            'keep',
            'keeping',
            'remain',
            'remaining',
        ],
    },

    // ═══════════════════════════════════════════════════════════════════
    // TRANSITION MODIFIERS - How to change between states
    // ═══════════════════════════════════════════════════════════════════

    transition: {
        // Instant (no easing)
        instant: [
            'instant',
            'instantly',
            'immediate',
            'immediately',
            'sudden',
            'suddenly',
            'abrupt',
            'abruptly',
            'snap',
            'cut',
            'jump',
        ],

        // Quick ease
        snappy: ['snappy', 'crisp', 'sharp', 'sharply', 'brisk', 'briskly', 'punchy'],

        // Normal ease - Default
        smooth: ['smooth', 'smoothly', 'natural', 'naturally', 'fluid', 'fluidly', 'flowing'],

        // Slow ease
        gentle: [
            'gentle',
            'gently',
            'soft',
            'softly',
            'gradual',
            'gradually',
            'easing',
            'gliding',
            'drifting',
        ],

        // Very slow ease with float
        dreamy: [
            'dreamy',
            'dreamlike',
            'floaty',
            'ethereal',
            'languid',
            'lazy',
            'flowing',
            'melting',
        ],
    },

    // ═══════════════════════════════════════════════════════════════════
    // REPETITION MODIFIERS - How often to repeat
    // ═══════════════════════════════════════════════════════════════════

    repetition: {
        // Once (no loop)
        once: ['once', 'one time', 'single', 'just once', 'only once', 'one shot'],

        // Few times (2-3)
        few: [
            'few',
            'few times',
            'couple',
            'couple times',
            'twice',
            'two times',
            'thrice',
            'three times',
        ],

        // Several times (4-6)
        several: [
            'several',
            'several times',
            'multiple',
            'multiple times',
            'repeatedly',
            'again and again',
        ],

        // Many times (7+)
        many: ['many', 'many times', 'lots', 'lots of times', 'over and over', 'nonstop'],

        // Continuous loop
        loop: [
            'loop',
            'looping',
            'looped',
            'continuous',
            'continuously',
            'forever',
            'infinitely',
            'endlessly',
            'always',
            'keep going',
            'on repeat',
        ],
    },
};

/**
 * Intensity value mappings
 * Maps intensity level names to numeric ranges
 */
export const intensityValues = {
    barely: { min: 0.1, max: 0.2, default: 0.15 },
    slightly: { min: 0.2, max: 0.4, default: 0.3 },
    moderately: { min: 0.4, max: 0.5, default: 0.45 },
    normal: { min: 0.5, max: 0.6, default: 0.55 },
    notably: { min: 0.6, max: 0.7, default: 0.65 },
    very: { min: 0.7, max: 0.85, default: 0.8 },
    extremely: { min: 0.85, max: 0.95, default: 0.9 },
    absolutely: { min: 0.95, max: 1.0, default: 1.0 },
};

/**
 * Duration value mappings (in milliseconds)
 */
export const durationValues = {
    flash: { min: 100, max: 500, default: 250 },
    quick: { min: 500, max: 1000, default: 750 },
    normal: { min: 1000, max: 2000, default: 1500 },
    slow: { min: 2000, max: 4000, default: 3000 },
    long: { min: 4000, max: 8000, default: 6000 },
    persistent: { min: 8000, max: Infinity, default: 10000 },
};
