/**
 * Shape Synonyms
 *
 * Maps natural language words and phrases to canonical shapes.
 * Shapes are the geometric/symbolic forms the mascot can morph into.
 *
 * @module core/intent/synonyms/shapes
 */

export const shapes = {
    // ═══════════════════════════════════════════════════════════════════
    // GEOMETRIC SHAPES - Basic forms
    // ═══════════════════════════════════════════════════════════════════

    circle: [
        // Direct
        'circle',
        'circular',
        'round',
        'rounded',
        'orb',
        'ball',
        'sphere',
        'spherical',
        'ring',
        'disc',
        'disk',

        // Abstract
        'whole',
        'complete',
        'unity',
        'unified',
        'endless',
        'infinite',
        'continuous',

        // Phrases
        'full circle',
        'perfect round',
        'come full circle',
    ],

    sphere: [
        // Direct
        'sphere',
        'spherical',
        'globe',
        'globular',
        'ball',
        '3d circle',
        'three dimensional',

        // Phrases
        'round ball',
        'floating sphere',
    ],

    square: [
        // Direct
        'square',
        'squared',
        'boxy',
        'box',
        'rectangle',
        'rectangular',
        'quadrilateral',
        'cube',
        'cubic',
        'block',
        'blocky',

        // Abstract
        'stable',
        'solid',
        'grounded',
        'sturdy',
        'rigid',
        'firm',
        'structured',

        // Phrases
        'four sided',
        'four corners',
        'box shape',
    ],

    triangle: [
        // Direct
        'triangle',
        'triangular',
        'tri',
        'pyramid',
        'pyramidal',
        'delta',
        'wedge',
        'arrow',
        'arrowhead',

        // Abstract
        'pointed',
        'sharp',
        'dynamic',
        'directional',
        'ascending',

        // Phrases
        'three sided',
        'three pointed',
        'pointing up',
    ],

    // ═══════════════════════════════════════════════════════════════════
    // ORGANIC SHAPES - Natural and emotional forms
    // ═══════════════════════════════════════════════════════════════════

    heart: [
        // Direct
        'heart',
        'hearted',
        'hearts',
        'love',
        'loving',
        'lovely',
        'valentine',
        'romantic',

        // Emotional
        'affection',
        'affectionate',
        'caring',
        'care',
        'tender',
        'warmth',
        'warm-hearted',
        'heartfelt',
        'compassion',
        'compassionate',
        'devotion',
        'devoted',

        // Slang
        'luv',
        'wuv',
        '<3',
        '❤️',
        '💕',
        '💗',

        // Phrases
        'full of love',
        'with love',
        'heart shape',
        'heart shaped',
        'from the heart',
    ],

    suspicion: [
        // Direct
        'suspicion',
        'suspicious',
        'suspect',
        'sly',
        'slyly',
        'sneaky',
        'sneakily',
        'mischievous',
        'mischief',

        // Facial
        'smirk',
        'smirking',
        'smirky',
        'grin',
        'grinning',
        'sly grin',
        'side eye',
        'sideeye',
        'side-eye',

        // Emotion
        'skeptical',
        'skepticism',
        'doubtful',
        'doubt',
        'doubting',
        'wary',
        'distrustful',
        'distrust',

        // Slang
        'sus',
        'sussy',
        'sussy baka',
        'hmm',
        'hmmm',
        'hmmmm',
        'shady',
        'fishy',
        'sketchy',

        // Phrases
        'not buying it',
        'something fishy',
        'seems off',
        'up to something',
    ],

    // ═══════════════════════════════════════════════════════════════════
    // ASTRONOMICAL SHAPES - Celestial bodies
    // ═══════════════════════════════════════════════════════════════════

    star: [
        // Direct
        'star',
        'starred',
        'starry',
        'stars',
        'stellar',
        'astral',
        'twinkle',
        'twinkling',

        // Success
        'achievement',
        'achieved',
        'excellence',
        'excellent',
        'gold star',
        'five star',
        'superstar',
        'rockstar',
        'rock star',

        // Wonder
        'wonder',
        'wonderful',
        'wondrous',
        'magical',
        'magic',
        'miraculous',
        'amazing',
        'spectacular',

        // Phrases
        'reach for stars',
        'seeing stars',
        'star shape',
        'shining star',
    ],

    sun: [
        // Direct
        'sun',
        'sunny',
        'sunshine',
        'sunlight',
        'solar',
        'sol',
        'daylight',
        'daytime',
        'day',

        // Energy
        'radiant',
        'radiance',
        'radiating',
        'bright',
        'brightness',
        'brilliant',
        'glowing',
        'glow',
        'blazing',
        'blaze',
        'warm',
        'warmth',

        // Positivity
        'cheerful',
        'cheery',
        'optimistic',
        'optimism',
        'hopeful',
        'hope',
        'positive',
        'positivity',

        // Phrases
        'full of light',
        'ray of sunshine',
        'like the sun',
        'sunny disposition',
    ],

    moon: [
        // Direct
        'moon',
        'moony',
        'moonlight',
        'moonlit',
        'lunar',
        'crescent',
        'nighttime',
        'night',
        'nocturnal',

        // Phases
        'waxing',
        'waning',
        'gibbous',
        'new moon',
        'full moon',
        'half moon',
        'quarter moon',
        'crescent moon',

        // Emotion
        'dreamy',
        'dreamlike',
        'dream',
        'mysterious',
        'mystery',
        'mystical',
        'ethereal',
        'otherworldly',
        'serene',
        'serenity',
        'tranquil',
        'contemplative',
        'reflective',

        // Phrases
        'moonlit night',
        'by moonlight',
        'moon shape',
        'under the moon',
    ],

    lunar: [
        // Eclipse specific
        'lunar eclipse',
        'blood moon',
        'blood-moon',
        'red moon',
        'copper moon',
        'rust moon',

        // Eclipse phases
        'eclipsing',
        'eclipsed',
        'shadow crossing',
        'earth shadow',

        // Mood
        'ominous',
        'foreboding',
        'portentous',
        'dramatic',
        'intense',
        'transforming',
        'transformation',

        // Phrases
        'moon in shadow',
        'moon turning red',
        'eclipse phase',
        'lunar event',
    ],

    solar: [
        // Eclipse specific
        'solar eclipse',
        'total eclipse',
        'corona',
        'diamond ring',
        'totality',
        'umbra',
        'penumbra',

        // Visual
        'ring of fire',
        'dark sun',
        'blocked sun',
        'occluded',

        // Mood
        'awe',
        'awesome',
        'awe-inspiring',
        'rare',
        'momentous',
        'historic',
        'breathtaking',
        'magnificent',

        // Phrases
        'sun blocked',
        'sun covered',
        'total darkness',
        'corona visible',
    ],

    eclipse: [
        // General eclipse
        'eclipse',
        'eclipsing',
        'eclipsed',
        'celestial event',
        'astronomical event',

        // Metaphorical
        'overshadow',
        'overshadowed',
        'blocked',
        'blocking',
        'obscured',
        'hidden',
        'hiding',
        'concealed',

        // Transition
        'passing',
        'crossing',
        'alignment',

        // Phrases
        'in eclipse',
        'going dark',
        'being eclipsed',
        'eclipsed by',
    ],
};
