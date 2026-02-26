/**
 * Undertone Synonyms
 *
 * Maps natural language words to the 6 canonical undertones.
 * Undertones modify the primary emotion, adding nuance.
 *
 * Example: "happy but nervous" = joy + nervous undertone
 *
 * @module core/intent/synonyms/undertones
 */

export const undertones = {
    // ═══════════════════════════════════════════════════════════════════
    // NERVOUS - Adds jittery, anxious energy to any emotion
    // ═══════════════════════════════════════════════════════════════════
    nervous: [
        // Core
        'nervous',
        'nervously',

        // Anxiety
        'anxious',
        'anxiously',
        'worried',
        'worriedly',
        'uneasy',
        'uneasily',
        'apprehensive',

        // Physical
        'jittery',
        'shaky',
        'trembling',
        'quivering',
        'fidgety',
        'restless',
        'twitchy',

        // Tension
        'tense',
        'tensely',
        'on edge',
        'edgy',
        'keyed up',
        'wound up',
        'uptight',

        // Self-conscious
        'self-conscious',
        'awkward',
        'awkwardly',
        'hesitant',
        'hesitantly',
        'uncertain',
        'uncertainly',

        // Slang
        'sketchy',
        'stressed',
        'stressing',
        'low-key panicking',
        'kinda freaking out',
    ],

    // ═══════════════════════════════════════════════════════════════════
    // CONFIDENT - Adds assurance, boldness, strength
    // ═══════════════════════════════════════════════════════════════════
    confident: [
        // Core
        'confident',
        'confidently',
        'confidence',

        // Assurance
        'assured',
        'assuredly',
        'certain',
        'certainly',
        'sure',
        'surely',
        'positive',
        'positively',

        // Boldness
        'bold',
        'boldly',
        'brave',
        'bravely',
        'daring',
        'daringly',
        'fearless',
        'fearlessly',

        // Strength
        'strong',
        'strongly',
        'powerful',
        'powerfully',
        'firm',
        'firmly',
        'solid',
        'solidly',

        // Authority
        'authoritative',
        'commanding',
        'assertive',
        'decisive',
        'decisively',
        'resolute',
        'resolutely',

        // Poise
        'poised',
        'self-assured',
        'unflappable',
        'unfazed',

        // Slang
        'owning it',
        'killing it',
        'crushing it',
        'boss',
        'like a boss',
    ],

    // ═══════════════════════════════════════════════════════════════════
    // TIRED - Adds weariness, low energy, sluggishness
    // ═══════════════════════════════════════════════════════════════════
    tired: [
        // Core
        'tired',
        'tiredly',
        'tiredness',

        // Exhaustion
        'exhausted',
        'weary',
        'wearily',
        'fatigued',
        'drained',
        'spent',
        'depleted',

        // Sluggishness
        'sluggish',
        'sluggishly',
        'slow',
        'slowly',
        'lethargic',
        'listless',
        'languid',

        // Low energy
        'low energy',
        'no energy',
        'out of energy',
        'running low',
        'running on fumes',

        // Physical
        'droopy',
        'drooping',
        'sagging',
        'slumping',
        'heavy',
        'weighted',
        'dragging',

        // Slang
        'wiped',
        'beat',
        'dead',
        'zonked',
        'burned out',
        'fried',
        'cooked',
        'toast',
    ],

    // ═══════════════════════════════════════════════════════════════════
    // INTENSE - Adds heightened energy, sharpness, focus
    // ═══════════════════════════════════════════════════════════════════
    intense: [
        // Core
        'intense',
        'intensely',
        'intensity',

        // Heightened
        'heightened',
        'elevated',
        'amplified',
        'magnified',
        'increased',
        'enhanced',

        // Force
        'forceful',
        'forcefully',
        'powerful',
        'powerfully',
        'fierce',
        'fiercely',
        'strong',
        'strongly',

        // Passion
        'passionate',
        'passionately',
        'fervent',
        'fervently',
        'ardent',
        'ardently',
        'vehement',
        'vehemently',

        // Sharpness
        'sharp',
        'sharply',
        'acute',
        'acutely',
        'keen',
        'keenly',
        'piercing',
        'piercingly',

        // Extreme
        'extreme',
        'extremely',
        'deeply',
        'profoundly',
        'tremendously',
        'immensely',
        'incredibly',

        // Slang
        'super',
        'mega',
        'ultra',
        'hella',
        'mad',
        'crazy',
    ],

    // ═══════════════════════════════════════════════════════════════════
    // SUBDUED - Adds softness, restraint, gentleness
    // ═══════════════════════════════════════════════════════════════════
    subdued: [
        // Core
        'subdued',
        'subduedly',

        // Softness
        'soft',
        'softly',
        'gentle',
        'gently',
        'mild',
        'mildly',
        'light',
        'lightly',

        // Restraint
        'restrained',
        'held back',
        'contained',
        'tempered',
        'moderated',
        'toned down',

        // Quietness
        'quiet',
        'quietly',
        'hushed',
        'muted',
        'understated',
        'subtle',
        'subtly',

        // Modesty
        'modest',
        'modestly',
        'humble',
        'humbly',
        'reserved',
        'demure',
        'unassuming',

        // Fading
        'faint',
        'faintly',
        'dim',
        'dimly',
        'pale',
        'faded',
        'washed out',

        // Slang
        'low key',
        'lowkey',
        'easy',
        'easy going',
    ],

    // ═══════════════════════════════════════════════════════════════════
    // CLEAR - Neutral undertone, no modification
    // ═══════════════════════════════════════════════════════════════════
    clear: [
        // Core
        'clear',
        'clearly',

        // Purity
        'pure',
        'purely',
        'clean',
        'cleanly',
        'simple',
        'simply',
        'plain',
        'plainly',

        // Directness
        'direct',
        'directly',
        'straightforward',
        'honest',
        'honestly',
        'frank',
        'frankly',

        // Transparency
        'transparent',
        'transparently',
        'open',
        'openly',
        'obvious',
        'obviously',
        'evident',
        'evidently',

        // Absence of modifier
        'unmodified',
        'unaltered',
        'unchanged',
        'normal',
        'normally',
        'regular',
        'regularly',
        'standard',
        'basic',
        'baseline',
    ],
};
