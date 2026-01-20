/**
 * Gesture Synonyms
 *
 * Maps natural language words and phrases to canonical gestures.
 * Includes both single words and multi-word phrases.
 *
 * Organized by semantic category (matching the gesture folder structure):
 * - IDLE: Subtle continuous behaviors (breathing, swaying, fidgeting)
 * - DANCE: Music-synchronized movements (steps, moves, accents, orbits)
 * - ACTIONS: Deliberate character movements (locomotion, acrobatics, gesturing, poses)
 * - REACTIONS: Responses to events (impacts, emotions, oscillations)
 * - DESTRUCTION: Breaking apart effects (shatter, dissolve, reform)
 * - ATMOSPHERE: Environmental effects (weather, particles, glow, control)
 *
 * @module core/intent/synonyms/gestures
 */

export const gestures = {
    // ═══════════════════════════════════════════════════════════════════
    // IDLE GESTURES - Subtle continuous behaviors
    // ═══════════════════════════════════════════════════════════════════

    // --- Breathing ---

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

    expand: [
        // Single words
        'expand', 'expanding',
        'grow', 'growing',
        'enlarge', 'enlarging',
        'swell', 'swelling',
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
        'reduce', 'reducing',

        // Phrases
        'getting smaller', 'shrinking down',
        'pulling in', 'contracting inward'
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

    // --- Swaying ---

    sway: [
        // Single words
        'sway', 'swaying',
        'swing', 'swinging',
        'oscillate', 'oscillating',

        // Phrases
        'swaying gently', 'gentle sway',
        'side to side', 'swaying motion'
    ],

    float: [
        // Single words
        'float', 'floating',
        'hover', 'hovering',
        'glide', 'gliding',
        'levitate', 'levitating',

        // Weightlessness
        'weightless', 'weightlessness',
        'buoyant', 'airy',

        // Phrases
        'floating gently', 'hovering in place',
        'light as air', 'floating freely'
    ],

    floatUp: [
        'float up', 'floating up', 'floating upward',
        'rise', 'rising', 'ascend', 'ascending',
        'lift', 'lifting', 'lifted up',
        'soar', 'soaring', 'going up'
    ],

    floatDown: [
        'float down', 'floating down', 'floating downward',
        'descend', 'descending', 'sink', 'sinking',
        'lower', 'lowering', 'going down'
    ],

    floatLeft: [
        'float left', 'floating left', 'drift left', 'drifting left'
    ],

    floatRight: [
        'float right', 'floating right', 'drift right', 'drifting right'
    ],

    bob: [
        'bob', 'bobbing',
        'bobbing up and down', 'gentle bob'
    ],

    lean: [
        // Single words
        'lean', 'leaning',
        'incline', 'inclining',

        // Directional
        'leaning in', 'lean in',
        'leaning forward', 'lean forward',
        'leaning toward', 'lean toward',
        'leaning closer', 'lean closer',
        'moving closer', 'coming closer',
        'drawing near', 'approaching',

        // Interest
        'interested', 'intrigued',
        'engaged', 'attentive',
        'listening closely', 'paying attention'
    ],

    leanLeft: [
        'lean left', 'leaning left', 'tilt left', 'tilting left'
    ],

    leanRight: [
        'lean right', 'leaning right', 'tilt right', 'tilting right'
    ],

    // --- Fidgeting ---

    jitter: [
        // Single words
        'jitter', 'jittering', 'jittery',
        'stutter', 'stuttering',

        // Phrases
        'jittering around', 'slight jitter',
        'nervous jitter'
    ],

    twitch: [
        // Single words
        'twitch', 'twitching', 'twitchy',
        'spasm', 'spasming',
        'flinch', 'flinching',

        // Phrases
        'quick twitch', 'nervous twitch',
        'sudden movement'
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

    shake: [
        // Single words
        'shake', 'shaking', 'shaky',
        'shudder', 'shuddering',
        'tremble', 'trembling',
        'quake', 'quaking',

        // Disagreement
        'no', 'nope', 'nah',
        'disagree', 'disagreeing',
        'refuse', 'refusing',
        'deny', 'denying',

        // Phrases
        'shaking head', 'shake head', 'head shake',
        'saying no', 'shaking no'
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

    // ═══════════════════════════════════════════════════════════════════
    // DANCE GESTURES - Music-synchronized movements
    // ═══════════════════════════════════════════════════════════════════

    // --- Steps ---

    stepLeft: [
        'step left', 'stepping left', 'sidestep left',
        'move left', 'moving left', 'shift left'
    ],

    stepRight: [
        'step right', 'stepping right', 'sidestep right',
        'move right', 'moving right', 'shift right'
    ],

    stepUp: [
        'step up', 'stepping up', 'step forward'
    ],

    stepDown: [
        'step down', 'stepping down', 'step back'
    ],

    slideLeft: [
        'slide left', 'sliding left', 'glide left'
    ],

    slideRight: [
        'slide right', 'sliding right', 'glide right'
    ],

    // --- Moves ---

    runningman: [
        'running man', 'runningman', 'running man dance',
        'run in place', 'running in place'
    ],

    charleston: [
        'charleston', 'charleston dance', 'swing dance',
        'kick step', 'kick and step'
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

    twist: [
        // Single words
        'twist', 'twisting', 'twisty',
        'contort', 'contorting',

        // Dance
        'do the twist', 'twisting dance',

        // Phrases
        'twisting around', 'getting twisted'
    ],

    // --- Accents ---

    pop: [
        'pop', 'popping',
        'pop and lock', 'popping motion',
        'hit', 'hitting' // dance hit
    ],

    flare: [
        'flare', 'flaring',
        'dramatic flare', 'flourish'
    ],

    swell: [
        'swell', 'swelling',
        'surge', 'surging',
        'crescendo'
    ],

    swagger: [
        'swagger', 'swaggering',
        'strut', 'strutting',
        'confident walk', 'cocky'
    ],

    dip: [
        'dip', 'dipping',
        'drop', 'dropping down',
        'low dip', 'dance dip'
    ],

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

    // --- Orbits ---

    orbit: [
        // Single words
        'orbit', 'orbiting',
        'circle', 'circling',
        'revolve', 'revolving',

        // Phrases
        'circling around', 'going around',
        'rotating slowly', 'orbital motion'
    ],

    orbitLeft: [
        'orbit left', 'orbiting left', 'circle left',
        'counter-clockwise', 'counterclockwise'
    ],

    orbitRight: [
        'orbit right', 'orbiting right', 'circle right',
        'clockwise'
    ],

    orbitUp: [
        'orbit up', 'orbiting up', 'rising orbit',
        'spiral up', 'spiraling up'
    ],

    orbitDown: [
        'orbit down', 'orbiting down', 'descending orbit',
        'spiral down', 'spiraling down'
    ],

    // --- Dance extras ---

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

    // ═══════════════════════════════════════════════════════════════════
    // ACTION GESTURES - Deliberate character movements
    // ═══════════════════════════════════════════════════════════════════

    // --- Locomotion ---

    jump: [
        // Single words
        'jump', 'jumping', 'jumpy',
        'leap', 'leaping',
        'bound', 'bounding',

        // Phrases
        'jumping up', 'leap up',
        'spring up', 'jumping for joy'
    ],

    // jumpUp removed - redundant with jump (which already goes up)
    // Use jump instead for upward jumps

    jumpDown: [
        'jump down', 'jumping down', 'drop down'
    ],

    jumpLeft: [
        'jump left', 'jumping left', 'leap left'
    ],

    jumpRight: [
        'jump right', 'jumping right', 'leap right'
    ],

    lunge: [
        'lunge', 'lunging',
        'thrust', 'thrusting',
        'charge forward', 'aggressive step'
    ],

    lungeForward: [
        'lunge forward', 'lunging forward', 'thrust forward'
    ],

    lungeBack: [
        'lunge back', 'lunging back', 'retreat lunge'
    ],

    rushForward: [
        'rush forward', 'rushing forward', 'dash forward',
        'sprint', 'sprinting', 'charge', 'charging'
    ],

    rushBack: [
        'rush back', 'rushing back', 'dash back', 'retreat quickly'
    ],

    // --- Acrobatics ---

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

    spinLeft: [
        'spin left', 'spinning left', 'turn left',
        'rotate left', 'counter-clockwise spin'
    ],

    spinRight: [
        'spin right', 'spinning right', 'turn right',
        'rotate right', 'clockwise spin'
    ],

    flip: [
        'flip', 'flipping',
        'somersault', 'somersaulting',
        'front flip', 'frontflip'
    ],

    backflip: [
        'backflip', 'back flip', 'backflipping',
        'back somersault', 'flip backward'
    ],

    // --- Gesturing ---

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

    pointUp: [
        'point up', 'pointing up', 'pointing upward',
        'look up', 'look to the sky'
    ],

    pointDown: [
        'point down', 'pointing down', 'pointing downward',
        'look down', 'look at this'
    ],

    pointLeft: [
        'point left', 'pointing left', 'gesture left'
    ],

    pointRight: [
        'point right', 'pointing right', 'gesture right'
    ],

    kickLeft: [
        'kick left', 'kicking left', 'left kick'
    ],

    kickRight: [
        'kick right', 'kicking right', 'right kick'
    ],

    bow: [
        'bow', 'bowing',
        'curtsy', 'curtseying',
        'reverence', 'showing respect',
        'take a bow', 'bow down'
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

    reach: [
        // Single words
        'reach', 'reaching',
        'extend', 'extending',

        // Directional
        'reaching out', 'reach out',
        'reaching toward', 'reach toward',
        'extending toward',

        // Offering
        'offer', 'offering',
        'present', 'presenting',
        'give', 'giving',
        'help', 'helping'
    ],

    headBob: [
        // Direct
        'headbob', 'head bob', 'headbobbing', 'head bobbing',

        // Musical
        'nodding to beat', 'nodding to music',
        'bobbing along', 'bobbing to rhythm',
        'vibing', 'jamming',

        // Phrases
        'bobbing head', 'bob head',
        'feeling the beat', 'moving to music'
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

    // --- Poses ---

    crouch: [
        'crouch', 'crouching',
        'squat', 'squatting',
        'hunker', 'hunkering',
        'duck', 'ducking',
        'get low', 'getting low'
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

    tiltUp: [
        'tilt up', 'tilting up', 'look up', 'looking up'
    ],

    tiltDown: [
        'tilt down', 'tilting down', 'look down', 'looking down'
    ],

    tiltLeft: [
        'tilt left', 'tilting left', 'head tilt left'
    ],

    tiltRight: [
        'tilt right', 'tilting right', 'head tilt right'
    ],

    // ═══════════════════════════════════════════════════════════════════
    // REACTION GESTURES - Responses to events
    // ═══════════════════════════════════════════════════════════════════

    // --- Impacts ---

    recoil: [
        'recoil', 'recoiling',
        'flinch', 'flinching',
        'wince', 'wincing',
        'pull back', 'pulling back',
        'jerk back', 'snap back'
    ],

    knockdown: [
        'knockdown', 'knock down', 'knocked down',
        'fall', 'falling', 'fell',
        'topple', 'toppling',
        'take a hit', 'got hit'
    ],

    knockout: [
        'knockout', 'knock out', 'knocked out',
        'KO', 'ko\'d',
        'lights out', 'out cold'
    ],

    squash: [
        'squash', 'squashing', 'squashed',
        'flatten', 'flattening', 'flattened',
        'compress', 'compressed',
        'smoosh', 'smooshed'
    ],

    stretch: [
        // Single words
        'stretch', 'stretching', 'stretchy',
        'elongate', 'elongating',
        'lengthen', 'lengthening',

        // Phrases
        'stretching out', 'big stretch',
        'reaching up', 'stretching tall'
    ],

    inflate: [
        'inflate', 'inflating', 'inflated',
        'puff up', 'puffing up', 'puffed up',
        'balloon', 'ballooning'
    ],

    deflate: [
        'deflate', 'deflating', 'deflated',
        'let air out', 'losing air',
        'shrivel', 'shriveling'
    ],

    pancake: [
        'pancake', 'pancaked', 'pancaking',
        'flatten completely', 'totally flat',
        'squished flat', 'smooshed flat'
    ],

    // --- Emotions ---

    rage: [
        'rage', 'raging',
        'furious', 'fury',
        'angry', 'anger',
        'mad', 'livid',
        'enraged', 'seeing red',
        'lose temper', 'losing it'
    ],

    fury: [
        'fury', 'furious',
        'quick anger', 'flash of anger',
        'snap', 'snapping'
    ],

    battlecry: [
        'battlecry', 'battle cry',
        'war cry', 'roar',
        'yell', 'yelling',
        'scream', 'screaming',
        'rallying cry'
    ],

    charge: [
        'charge', 'charging',
        'rush', 'rushing',
        'attack', 'attacking',
        'assault', 'advance'
    ],

    // --- Oscillations ---

    wobble: [
        'wobble', 'wobbling', 'wobbly',
        'unstable', 'unsteady',
        'drunk', 'dizzy',
        'off balance', 'losing balance'
    ],

    teeter: [
        'teeter', 'teetering',
        'totter', 'tottering',
        'about to fall', 'precarious',
        'on edge', 'unbalanced'
    ],

    rock: [
        'rock', 'rocking',
        'soothing rock', 'gentle rocking',
        'back and forth', 'rocking motion'
    ],

    pendulum: [
        'pendulum', 'pendulum motion',
        'swing back and forth', 'swinging',
        'hypnotic swing', 'metronome'
    ],

    // ═══════════════════════════════════════════════════════════════════
    // DESTRUCTION GESTURES - Breaking apart effects
    // ═══════════════════════════════════════════════════════════════════

    shatter: [
        'shatter', 'shattering', 'shattered',
        'break', 'breaking', 'broken',
        'smash', 'smashing', 'smashed',
        'fragment', 'fragmenting',
        'explode into pieces', 'break apart'
    ],

    shatterExplosive: [
        'explosive shatter', 'explode', 'exploding',
        'blow up', 'blowing up',
        'detonate', 'detonating',
        'big explosion', 'kaboom'
    ],

    shatterCrumble: [
        'crumble', 'crumbling',
        'fall apart', 'falling apart',
        'disintegrate', 'disintegrating',
        'collapse', 'collapsing'
    ],

    dissolveUp: [
        'dissolve up', 'dissolving up',
        'evaporate', 'evaporating',
        'fade up', 'rising dust'
    ],

    dissolveDown: [
        'dissolve down', 'dissolving down',
        'melt', 'melting',
        'drip away', 'dripping'
    ],

    dissolveAway: [
        'dissolve away', 'dissolving away',
        'blow away', 'scatter in wind',
        'dust in wind', 'fade to dust'
    ],

    morph: [
        'morph', 'morphing',
        'transform', 'transforming',
        'shape shift', 'shapeshifting',
        'change form', 'metamorphose'
    ],

    // ═══════════════════════════════════════════════════════════════════
    // ATMOSPHERE GESTURES - Environmental effects
    // ═══════════════════════════════════════════════════════════════════

    // --- Weather ---

    rain: [
        // Single words
        'rain', 'raining',
        'shower', 'showering',
        'drip', 'dripping',
        'pour', 'pouring',

        // Phrases
        'raining down', 'particles falling',
        'gentle rain', 'shower of particles'
    ],

    drift: [
        'drift', 'drifting',
        'waft', 'wafting',
        'float gently', 'gentle drift'
    ],

    driftUp: [
        'drift up', 'drifting up', 'rising mist',
        'float upward', 'waft up'
    ],

    driftDown: [
        'drift down', 'drifting down', 'settling dust',
        'float downward', 'waft down'
    ],

    vortex: [
        'vortex', 'whirlpool', 'tornado',
        'cyclone', 'maelstrom',
        'spinning vortex', 'swirling'
    ],

    cascadeDown: [
        'cascade', 'cascading', 'cascade down',
        'waterfall', 'falling water',
        'pour down', 'flow down'
    ],

    // --- Particles ---

    confetti: [
        'confetti', 'throw confetti',
        'celebration particles', 'party confetti',
        'ticker tape', 'streamers'
    ],

    fizz: [
        'fizz', 'fizzing', 'fizzy',
        'bubble', 'bubbling', 'bubbly',
        'effervescent', 'carbonated',
        'sparkling bubbles'
    ],

    burst: [
        // Single words
        'burst', 'bursting',
        'erupt', 'erupting', 'eruption',
        'boom', 'booming',

        // Phrases
        'bursting out', 'burst of energy',
        'explosive burst', 'big burst'
    ],

    burstUp: [
        'burst up', 'bursting up', 'fountain',
        'geyser', 'erupting up'
    ],

    ripple: [
        'ripple', 'rippling',
        'wave effect', 'ripple effect',
        'water ripple', 'spreading rings'
    ],

    // --- Glow ---

    flash: [
        // Single words
        'flash', 'flashing', 'flashy',
        'blink', 'blinking',
        'strobe', 'strobing',

        // Phrases
        'quick flash', 'bright flash',
        'flashing light', 'strobing light'
    ],

    glow: [
        // Single words
        'glow', 'glowing', 'glowy',
        'radiate', 'radiating',
        'emanate', 'emanating',
        'luminescent',
        'bright', 'brighten', 'brightening',

        // Phrases
        'soft glow', 'warm glow',
        'inner glow', 'glowing warmly',
        'lighting up', 'lit up'
    ],

    bloom: [
        'bloom', 'blooming',
        'blossom', 'blossoming',
        'flower', 'flowering',
        'unfold', 'unfolding',
        'light bloom', 'lens bloom'
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

    shiver: [
        'shiver', 'shivering',
        'chill', 'chilly',
        'cold', 'freezing',
        'brr', 'brrr'
    ],

    heartbeat: [
        'heartbeat', 'heart beat',
        'pulse of life', 'living pulse',
        'thump thump', 'ba-dum'
    ],

    snap: [
        'snap', 'snapping',
        'click', 'clicking',
        'quick snap', 'finger snap'
    ],

    elasticBounce: [
        'elastic bounce', 'rubbery bounce',
        'springy', 'bouncy elastic',
        'rubber band', 'spring back'
    ],

    // --- Control ---

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

    fade: [
        // Single words
        'fade', 'fading',
        'dim', 'dimming',
        'disappear', 'disappearing',
        'vanish', 'vanishing',

        // Phrases
        'fading out', 'fading away',
        'growing dim', 'becoming transparent'
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
        'coming to rest', 'finding peace'
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
    ]
};
