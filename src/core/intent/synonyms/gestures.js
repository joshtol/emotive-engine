/**
 * Gesture Synonyms
 *
 * Maps natural language words and phrases to canonical gestures.
 * Includes both single words and multi-word phrases.
 *
 * @module core/intent/synonyms/gestures
 */

export const gestures = {
    // ═══════════════════════════════════════════════════════════════════
    // MOTION GESTURES - Movement-based animations
    // ═══════════════════════════════════════════════════════════════════

    bounce: [
        // Single words
        'bounce', 'bouncing', 'bouncy',
        'hop', 'hopping', 'hoppy',
        'spring', 'springing', 'springy',
        'boing', 'boinging',

        // Phrases
        'bouncing up and down', 'hopping around',
        'spring in step', 'light on feet'
    ],

    pulse: [
        // Single words
        'pulse', 'pulsing', 'pulsate', 'pulsating',
        'throb', 'throbbing',
        'beat', 'beating',

        // Phrases
        'pulsing gently', 'steady pulse',
        'heartbeat', 'heart beat'
    ],

    shake: [
        // Single words
        'shake', 'shaking', 'shaky',
        'shudder', 'shuddering',
        'tremble', 'trembling',
        'quake', 'quaking',
        'shiver', 'shivering',

        // Disagreement
        'no', 'nope', 'nah',
        'disagree', 'disagreeing',
        'refuse', 'refusing',
        'deny', 'denying',

        // Phrases
        'shaking head', 'shake head', 'head shake',
        'saying no', 'shaking no'
    ],

    nod: [
        // Single words
        'nod', 'nodding',

        // Agreement
        'yes', 'yeah', 'yep', 'yup',
        'agree', 'agreeing',
        'acknowledge', 'acknowledging',
        'confirm', 'confirming',
        'accept', 'accepting',
        'approve', 'approving',

        // Understanding
        'understand', 'understanding',
        'got it', 'gotcha', 'i see',
        'makes sense', 'understood',

        // Phrases
        'nodding head', 'nod head', 'head nod',
        'nodding along', 'nodding yes'
    ],

    vibrate: [
        // Single words
        'vibrate', 'vibrating', 'vibration',
        'buzz', 'buzzing',
        'hum', 'humming',
        'quiver', 'quivering',

        // Phrases
        'vibrating slightly', 'gentle buzz',
        'low hum', 'subtle vibration'
    ],

    orbit: [
        // Single words
        'orbit', 'orbiting',
        'circle', 'circling',
        'revolve', 'revolving',
        'rotate', 'rotating',

        // Phrases
        'circling around', 'going around',
        'rotating slowly', 'orbital motion'
    ],

    sway: [
        // Single words
        'sway', 'swaying',
        'rock', 'rocking',
        'swing', 'swinging',
        'oscillate', 'oscillating',

        // Phrases
        'swaying gently', 'rocking back and forth',
        'gentle sway', 'side to side'
    ],

    float: [
        // Single words
        'float', 'floating',
        'drift', 'drifting',
        'hover', 'hovering',
        'glide', 'gliding',
        'levitate', 'levitating',

        // Weightlessness
        'weightless', 'weightlessness',
        'buoyant', 'airy',

        // Phrases
        'floating gently', 'drifting along',
        'hovering in place', 'light as air'
    ],

    lean: [
        // Single words
        'lean', 'leaning',
        'incline', 'inclining',
        'tilt', 'tilting',

        // Directional
        'leaning in', 'lean in',
        'leaning forward', 'lean forward',
        'leaning toward', 'lean toward',
        'leaning closer', 'lean closer',
        'moving closer', 'coming closer',
        'drawing near', 'approaching',

        // Interest
        'interested', 'intrigued', 'curious',
        'engaged', 'attentive',
        'listening closely', 'paying attention'
    ],

    reach: [
        // Single words
        'reach', 'reaching',
        'extend', 'extending',
        'stretch', 'stretching',

        // Directional
        'reaching out', 'reach out',
        'reaching toward', 'reach toward',
        'extending toward', 'stretching toward',

        // Offering
        'offer', 'offering',
        'present', 'presenting',
        'give', 'giving',
        'help', 'helping'
    ],

    point: [
        // Single words
        'point', 'pointing',
        'indicate', 'indicating',
        'gesture', 'gesturing',
        'direct', 'directing',

        // Phrases
        'pointing at', 'pointing to',
        'pointing toward', 'gesturing toward',
        'showing', 'directing attention'
    ],

    wave: [
        // Single words
        'wave', 'waving',

        // Greetings
        'greet', 'greeting',
        'hello', 'hi', 'hey',
        'goodbye', 'bye', 'farewell',
        'welcome', 'welcoming',

        // Phrases
        'waving hello', 'waving goodbye',
        'friendly wave', 'waving hand'
    ],

    headBob: [
        // Direct
        'headbob', 'head bob', 'headbobbing', 'head bobbing',
        'bobbing', 'bob',

        // Musical
        'nodding to beat', 'nodding to music',
        'bobbing along', 'bobbing to rhythm',
        'vibing', 'grooving', 'jamming',

        // Phrases
        'bobbing head', 'bob head',
        'feeling the beat', 'moving to music'
    ],

    wiggle: [
        // Single words
        'wiggle', 'wiggling', 'wiggly',
        'jiggle', 'jiggling', 'jiggly',
        'squirm', 'squirming',
        'wriggle', 'wriggling',

        // Phrases
        'wiggling around', 'little wiggle',
        'happy wiggle', 'excited wiggle'
    ],

    groove: [
        // Single words
        'groove', 'grooving', 'groovy',
        'dance', 'dancing',
        'boogie', 'boogying',
        'funk', 'funky',

        // Musical
        'rhythmic', 'moving to music',
        'feeling the music', 'in the groove',

        // Phrases
        'getting down', 'busting a move',
        'doing a little dance'
    ],

    twitch: [
        // Single words
        'twitch', 'twitching', 'twitchy',
        'spasm', 'spasming',
        'jerk', 'jerking', 'jerky',
        'flinch', 'flinching',

        // Phrases
        'quick twitch', 'nervous twitch',
        'sudden movement'
    ],

    jitter: [
        // Single words
        'jitter', 'jittering', 'jittery',
        'stutter', 'stuttering',

        // Phrases
        'jittering around', 'slight jitter',
        'nervous jitter'
    ],

    // ═══════════════════════════════════════════════════════════════════
    // TRANSFORM GESTURES - Shape/size changes
    // ═══════════════════════════════════════════════════════════════════

    spin: [
        // Single words
        'spin', 'spinning',
        'twirl', 'twirling',
        'whirl', 'whirling',
        'rotate', 'rotating',
        'turn', 'turning',

        // Phrases
        'spinning around', 'quick spin',
        'full rotation', 'twirling around'
    ],

    jump: [
        // Single words
        'jump', 'jumping', 'jumpy',
        'leap', 'leaping',
        'spring', 'springing',
        'bound', 'bounding',

        // Phrases
        'jumping up', 'leap up',
        'spring up', 'jumping for joy'
    ],

    stretch: [
        // Single words
        'stretch', 'stretching', 'stretchy',
        'elongate', 'elongating',
        'extend', 'extending',
        'lengthen', 'lengthening',

        // Phrases
        'stretching out', 'big stretch',
        'reaching up', 'stretching tall'
    ],

    expand: [
        // Single words
        'expand', 'expanding',
        'grow', 'growing',
        'enlarge', 'enlarging',
        'swell', 'swelling',
        'inflate', 'inflating',
        'bloat', 'bloating',

        // Phrases
        'getting bigger', 'growing larger',
        'puffing up', 'expanding outward'
    ],

    contract: [
        // Single words
        'contract', 'contracting',
        'shrink', 'shrinking',
        'compress', 'compressing',
        'deflate', 'deflating',
        'reduce', 'reducing',

        // Phrases
        'getting smaller', 'shrinking down',
        'pulling in', 'contracting inward'
    ],

    twist: [
        // Single words
        'twist', 'twisting', 'twisty',
        'contort', 'contorting',
        'warp', 'warping',
        'distort', 'distorting',

        // Phrases
        'twisting around', 'getting twisted',
        'warping shape'
    ],

    tilt: [
        // Single words
        'tilt', 'tilting', 'tilted',
        'angle', 'angling', 'angled',
        'cock', 'cocking', 'cocked',

        // Phrases
        'tilting head', 'tilt head',
        'cocking head', 'curious tilt',
        'angling sideways', 'head tilt'
    ],

    hula: [
        // Direct
        'hula', 'hula-ing',

        // Motion
        'hip sway', 'swaying hips',
        'circular sway', 'round motion',

        // Phrases
        'hula motion', 'hula dance'
    ],

    // ═══════════════════════════════════════════════════════════════════
    // EFFECT GESTURES - Visual effects and glows
    // ═══════════════════════════════════════════════════════════════════

    sparkle: [
        // Single words
        'sparkle', 'sparkling', 'sparkly',
        'twinkle', 'twinkling', 'twinkly',
        'glitter', 'glittering', 'glittery',
        'shine', 'shining', 'shiny',

        // Celebration
        'celebrate', 'celebrating', 'celebration', 'celebratory',
        'festive', 'party', 'partying',
        'victory', 'triumphant', 'triumph',

        // Success
        'winning', 'success', 'successful',
        'achievement', 'accomplished', 'nailed it',

        // Slang
        'slay', 'slaying', 'killing it',
        'yasss', 'yay', 'woo', 'woohoo'
    ],

    shimmer: [
        // Single words
        'shimmer', 'shimmering', 'shimmery',
        'glisten', 'glistening',
        'gleam', 'gleaming',
        'lustrous', 'luminous',

        // Phrases
        'soft shimmer', 'gentle gleam',
        'shimmering light', 'pearlescent'
    ],

    glow: [
        // Single words
        'glow', 'glowing', 'glowy',
        'radiate', 'radiating',
        'emanate', 'emanating',
        'luminous', 'luminescent',
        'bright', 'brighten', 'brightening',

        // Phrases
        'soft glow', 'warm glow',
        'inner glow', 'glowing warmly',
        'lighting up', 'lit up'
    ],

    flash: [
        // Single words
        'flash', 'flashing', 'flashy',
        'blink', 'blinking',
        'strobe', 'strobing',
        'flare', 'flaring',

        // Phrases
        'quick flash', 'bright flash',
        'flashing light', 'strobing light'
    ],

    flicker: [
        // Single words
        'flicker', 'flickering', 'flickery',
        'flutter', 'fluttering',
        'waver', 'wavering',
        'guttering',

        // Phrases
        'flickering light', 'unsteady light',
        'wavering glow', 'candle-like'
    ],

    burst: [
        // Single words
        'burst', 'bursting',
        'explode', 'exploding', 'explosion',
        'erupt', 'erupting', 'eruption',
        'pop', 'popping',
        'boom', 'booming',

        // Phrases
        'bursting out', 'burst of energy',
        'explosive', 'big burst'
    ],

    settle: [
        // Single words
        'settle', 'settling', 'settled',
        'calm', 'calming',
        'ground', 'grounding', 'grounded',
        'center', 'centering', 'centered',
        'anchor', 'anchoring', 'anchored',
        'root', 'rooting', 'rooted',

        // Relaxing
        'relax', 'relaxing',
        'unwind', 'unwinding',
        'decompress', 'decompressing',

        // Phrases
        'settling down', 'calming down',
        'winding down', 'cooling down',
        'coming to rest', 'finding peace',
        'sinking into', 'melting into'
    ],

    breathe: [
        // Single words
        'breathe', 'breathing', 'breath',
        'inhale', 'inhaling',
        'exhale', 'exhaling',
        'sigh', 'sighing',
        'respire', 'respiring',

        // Depth
        'deep breath', 'deep breathing',
        'slow breath', 'slow breathing',
        'long breath', 'full breath',

        // Phrases
        'breathing deeply', 'breathing slowly',
        'taking a breath', 'take a breath',
        'catching breath', 'breath work', 'breathwork',
        'inhale exhale', 'in and out',

        // Descriptive
        'meditative breathing', 'calming breath',
        'cleansing breath', 'relaxing breath',
        'centering breath', 'mindful breathing'
    ],

    peek: [
        // Single words
        'peek', 'peeking',
        'peer', 'peering',
        'peep', 'peeping',
        'glance', 'glancing',

        // Phrases
        'peeking out', 'peek out',
        'looking shyly', 'shy glance',
        'quick peek', 'sneaking a look'
    ],

    fade: [
        // Single words
        'fade', 'fading',
        'dim', 'dimming',
        'disappear', 'disappearing',
        'vanish', 'vanishing',

        // Phrases
        'fading out', 'fading away',
        'growing dim', 'becoming transparent',
        'dissolving', 'melting away'
    ],

    hold: [
        // Single words
        'hold', 'holding',
        'pause', 'pausing', 'paused',
        'freeze', 'freezing', 'frozen',
        'still', 'stillness',
        'stop', 'stopping', 'stopped',

        // Phrases
        'holding still', 'staying still',
        'frozen in place', 'completely still',
        'motionless', 'stationary'
    ],

    rain: [
        // Single words
        'rain', 'raining',
        'shower', 'showering',
        'drip', 'dripping',
        'pour', 'pouring',
        'fall', 'falling',

        // Phrases
        'raining down', 'particles falling',
        'gentle rain', 'shower of particles'
    ]
};
