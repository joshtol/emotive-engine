/**
 * Intent Tokenizer
 *
 * Breaks down natural language intent strings into tokens for parsing.
 * Handles multi-word phrases, punctuation, and normalization.
 *
 * @module core/intent/tokenizer
 */

/**
 * Known multi-word phrases that should be kept together
 * Order matters - longer phrases should come first
 */
const MULTI_WORD_PHRASES = [
    // Gestures (3+ words)
    'bouncing up and down', 'hopping around', 'rocking back and forth',
    'side to side', 'light on feet', 'spring in step',
    'leaning forward', 'leaning in', 'leaning closer', 'leaning toward',
    'reaching out', 'reaching toward', 'pointing at', 'pointing to',
    'waving hello', 'waving goodbye', 'nodding head', 'shaking head',
    'head shake', 'head nod', 'head bob', 'head tilt',
    'deep breath', 'taking a breath', 'breathing deeply',
    'settling down', 'calming down', 'winding down',
    'getting bigger', 'getting smaller', 'puffing up',
    'spinning around', 'twirling around',

    // Emotions (2-3 words)
    'at peace', 'in love', 'on cloud nine', 'over the moon',
    'on top of the world', 'in awe', 'grossed out', 'freaked out',
    'low key', 'low-key', 'high key',

    // Undertones (2 words)
    'on edge', 'keyed up', 'wound up',
    'low energy', 'no energy', 'running low',

    // Modifiers (2-3 words)
    'just a bit', 'just a little', 'a little bit',
    'kind of', 'sort of', 'a bit', 'a little', 'a lot',
    'over the top', 'off the charts', 'through the roof',
    'split second', 'one time', 'few times', 'many times',
    'again and again', 'over and over', 'on repeat',

    // Shapes (2 words)
    'blood moon', 'full moon', 'new moon', 'half moon',
    'solar eclipse', 'lunar eclipse', 'total eclipse',
    'ring of fire', 'diamond ring',

    // Slang (2 words)
    'killing it', 'crushing it', 'nailed it',
    'sussy baka', 'side eye'
];

/**
 * Characters that act as separators between intent components
 */
const SEPARATORS = /[,;|\/]+/;

/**
 * Words to strip (articles, filler words that don't affect meaning)
 */
const FILLER_WORDS = new Set([
    'a', 'an', 'the',
    'is', 'are', 'am', 'be', 'being', 'been',
    'i', 'me', 'my',
    'it', 'its',
    'to', 'of', 'for', 'with', 'as',
    'this', 'that', 'these', 'those',
    'just', 'only', 'also', 'too',
    'please', 'pls', 'plz'
]);

/**
 * Words that should NOT be stripped even though they look like filler
 * (they have meaning in our context)
 */
const KEEP_WORDS = new Set([
    'but', 'and', 'or', 'yet', 'while', 'although', // Connectors matter
    'not', 'no', 'never', // Negations matter
    'very', 'really', 'so', 'quite', 'rather', // Modifiers matter
    'slightly', 'barely', 'extremely', 'completely', // Modifiers matter
    'feeling', 'feel', 'feels', // Context hints
    'become', 'becoming', 'morph', 'morphing' // Shape context
]);

/**
 * Normalize a string for matching
 * @param {string} str - Input string
 * @returns {string} Normalized string
 */
function normalize(str) {
    return str
        .toLowerCase()
        .trim()
        .replace(/['']/g, "'")  // Normalize quotes
        .replace(/[""]/g, '"')
        .replace(/\s+/g, ' ');  // Collapse whitespace
}

/**
 * Extract multi-word phrases from input, replacing them with placeholders
 * @param {string} input - Normalized input string
 * @returns {{ processed: string, phrases: Map<string, string> }}
 */
function extractPhrases(input) {
    const phrases = new Map();
    let processed = input;
    let placeholderIndex = 0;

    for (const phrase of MULTI_WORD_PHRASES) {
        const phraseNorm = normalize(phrase);
        if (processed.includes(phraseNorm)) {
            const placeholder = `__PHRASE_${placeholderIndex}__`;
            processed = processed.replace(new RegExp(phraseNorm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), placeholder);
            phrases.set(placeholder, phraseNorm);
            placeholderIndex++;
        }
    }

    return { processed, phrases };
}

/**
 * Tokenize an intent string into meaningful tokens
 *
 * @param {string} intent - Natural language intent string
 * @returns {Object} Tokenization result
 * @returns {string[]} returns.tokens - Array of normalized tokens
 * @returns {string[]} returns.segments - Original segments split by separators
 * @returns {Map<string, string>} returns.phrases - Multi-word phrases found
 *
 * @example
 * tokenize('happy, bouncing up and down')
 * // Returns:
 * // {
 * //   tokens: ['happy', 'bouncing up and down'],
 * //   segments: ['happy', 'bouncing up and down'],
 * //   phrases: Map { '__PHRASE_0__' => 'bouncing up and down' }
 * // }
 */
export function tokenize(intent) {
    if (!intent || typeof intent !== 'string') {
        return { tokens: [], segments: [], phrases: new Map() };
    }

    // Normalize input
    const normalized = normalize(intent);

    // Extract multi-word phrases first
    const { processed, phrases } = extractPhrases(normalized);

    // Split by separators to get segments
    const rawSegments = processed.split(SEPARATORS)
        .map(s => s.trim())
        .filter(s => s.length > 0);

    // Process each segment
    const tokens = [];
    const segments = [];

    for (const segment of rawSegments) {
        // Restore phrases in segment for display
        let displaySegment = segment;
        for (const [placeholder, phrase] of phrases) {
            displaySegment = displaySegment.replace(placeholder, phrase);
        }
        segments.push(displaySegment.trim());

        // Split segment into words
        const words = segment.split(/\s+/);

        for (const word of words) {
            // Check if it's a phrase placeholder
            if (phrases.has(word)) {
                tokens.push(phrases.get(word));
                continue;
            }

            // Skip empty
            if (!word) continue;

            // Check if it's a filler word (but respect KEEP_WORDS)
            if (FILLER_WORDS.has(word) && !KEEP_WORDS.has(word)) {
                continue;
            }

            // Clean punctuation from edges
            const cleaned = word.replace(/^[^\w]+|[^\w]+$/g, '');
            if (cleaned) {
                tokens.push(cleaned);
            }
        }
    }

    return { tokens, segments, phrases };
}

/**
 * Check if a token is a connector word
 * @param {string} token - Token to check
 * @returns {boolean}
 */
export function isConnector(token) {
    return ['but', 'and', 'or', 'yet', 'while', 'although', 'with'].includes(token);
}

/**
 * Check if a token is a negation
 * @param {string} token - Token to check
 * @returns {boolean}
 */
export function isNegation(token) {
    return ['not', 'no', 'never', "don't", 'dont', "doesn't", 'doesnt', "isn't", 'isnt'].includes(token);
}

export default { tokenize, isConnector, isNegation };
