/**
 * Emotion Synonyms
 *
 * Maps natural language words to the 15 canonical emotions.
 * Organized by intensity and register (formal, casual, slang, regional).
 *
 * @module core/intent/synonyms/emotions
 */

export const emotions = {
    // ═══════════════════════════════════════════════════════════════════
    // NEUTRAL - Absence of strong emotion, default state
    // ═══════════════════════════════════════════════════════════════════
    neutral: [
        // Direct
        'neutral',
        'default',
        'normal',
        'baseline',
        'standard',

        // Absence descriptors
        'nothing special',
        'nothing particular',
        'no strong feeling',
        'not much',
        'meh',
        'whatever',
        'indifferent',

        // Equilibrium
        'balanced',
        'even',
        'steady',
        'stable',
        'centered',
        'level',
        'middle ground',
        'in between',

        // Waiting states
        'ready',
        'waiting',
        'standing by',
        'at attention',
        'present',
        'here',
        'available',
        'attentive',

        // Reset
        'reset',
        'clear',
        'blank',
        'empty',
        'clean slate',
    ],

    // ═══════════════════════════════════════════════════════════════════
    // JOY - Happiness, pleasure, positive feelings
    // ═══════════════════════════════════════════════════════════════════
    joy: [
        // Core
        'happy',
        'joy',
        'joyful',
        'joyous',

        // Mild happiness
        'pleased',
        'glad',
        'content',
        'satisfied',
        'gratified',
        'comfortable',
        'good',

        // Medium happiness
        'cheerful',
        'cheery',
        'merry',
        'jovial',
        'jolly',
        'upbeat',
        'sunny',
        'bright',
        'lighthearted',
        'buoyant',

        // Strong happiness
        'delighted',
        'thrilled',
        'overjoyed',
        'elated',
        'jubilant',
        'exultant',
        'gleeful',

        // Warm happiness
        'glowing',
        'beaming',
        'radiant',

        // Slang - American
        'pumped',
        'stoked',
        'psyched',
        'amped',
        'hyped',

        // Slang - Internet/Gen-Z
        'vibing',
        'living',
        'slaying',
        'winning',
        'lit',
        'fire',
        'sick',
        'dope',

        // British
        'chuffed',
        'pleased as punch',
        'over the moon',
        'made up',
        'tickled',
        'tickled pink',

        // Formal
        'felicitous',
        'beatific',
        'blissful',

        // Action-oriented
        'smiling',
        'grinning',
        'laughing',
        'giggling',
    ],

    // ═══════════════════════════════════════════════════════════════════
    // CALM - Peace, tranquility, relaxation
    // ═══════════════════════════════════════════════════════════════════
    calm: [
        // Core
        'calm',
        'peaceful',
        'serene',
        'tranquil',

        // Relaxation
        'relaxed',
        'at ease',
        'comfortable',
        'loose',
        'unwound',
        'decompressed',
        'chilled',

        // Stillness
        'still',
        'quiet',
        'hushed',
        'silent',
        'soft',
        'gentle',
        'mild',
        'placid',
        'smooth',

        // Mental calm
        'composed',
        'collected',
        'centered',
        'grounded',
        'untroubled',
        'unworried',
        'unbothered',
        'unfazed',

        // Meditative
        'meditative',
        'mindful',
        'contemplative',
        'reflective',
        'introspective',

        // Physical relaxation
        'soothed',
        'eased',
        'mellowed',
        'softened',

        // Slang
        'chill',
        'coasting',
        'floating',
        'drifting',
        'laid back',
        'easy going',
        'low key',

        // British
        'sorted',
        'easy peasy',
    ],

    // ═══════════════════════════════════════════════════════════════════
    // EXCITED - High energy, enthusiasm, anticipation
    // ═══════════════════════════════════════════════════════════════════
    excited: [
        // Core
        'excited',
        'exciting',
        'excitable',

        // Enthusiasm
        'enthusiastic',
        'eager',
        'keen',
        'avid',
        'passionate',
        'fervent',
        'ardent',
        'zealous',

        // Energy
        'energetic',
        'energized',
        'animated',
        'lively',
        'spirited',
        'vivacious',
        'vibrant',
        'dynamic',
        'bouncy',
        'peppy',
        'perky',
        'sprightly',

        // Anticipation
        'anticipating',
        'expectant',
        'looking forward',
        'itching',
        'raring',
        'chomping at the bit',

        // Intensity
        'fired up',
        'charged',
        'electric',
        'electrified',
        'buzzing',
        'tingling',
        'crackling',
        'sparking',

        // Slang
        'jazzed',
        'juiced',
        'geeked',
        'hype',
        'turnt',
        'going off',

        // British
        'well excited',
        'buzzing',

        // Physical
        'restless',
        'fidgety',
        'antsy',
        'jumpy',
        'twitchy',
        'keyed up',
        'wound up',
    ],

    // ═══════════════════════════════════════════════════════════════════
    // SADNESS - Unhappiness, sorrow, grief
    // ═══════════════════════════════════════════════════════════════════
    sadness: [
        // Core
        'sad',
        'sadness',
        'saddened',
        'unhappy',

        // Mild sadness
        'down',
        'low',
        'blue',
        'glum',
        'bummed',
        'disappointed',
        'let down',
        'discouraged',
        'disheartened',
        'dispirited',
        'deflated',

        // Medium sadness
        'melancholy',
        'melancholic',
        'somber',
        'gloomy',
        'mournful',
        'sorrowful',
        'doleful',
        'woeful',
        'heavy-hearted',
        'downcast',
        'crestfallen',

        // Strong sadness
        'heartbroken',
        'devastated',
        'crushed',
        'shattered',
        'despairing',
        'despondent',
        'desolate',
        'inconsolable',
        'grief',
        'grieving',
        'mourning',
        'bereft',

        // Emptiness
        'empty',
        'hollow',
        'numb',
        'void',

        // Longing
        'wistful',
        'longing',
        'yearning',
        'pining',
        'nostalgic',

        // Slang
        'bummed out',
        'down in the dumps',
        'in a funk',
        'in the dumps',
        'feeling low',

        // British
        'gutted',
        'choked',

        // Physical
        'crying',
        'tearful',
        'weeping',
        'sobbing',
        'sighing',
        'drooping',
        'wilting',
        'slumping',
    ],

    // ═══════════════════════════════════════════════════════════════════
    // ANGER - Frustration, irritation, rage
    // ═══════════════════════════════════════════════════════════════════
    anger: [
        // Core
        'angry',
        'anger',
        'angered',
        'mad',

        // Mild anger
        'annoyed',
        'irritated',
        'bothered',
        'irked',
        'peeved',
        'miffed',
        'vexed',
        'displeased',
        'put out',
        'ticked off',
        'ticked',

        // Medium anger
        'frustrated',
        'aggravated',
        'exasperated',
        'fed up',
        'sick of',
        'had enough',
        'cross',
        'upset',
        'worked up',

        // Strong anger
        'furious',
        'enraged',
        'livid',
        'irate',
        'incensed',
        'infuriated',
        'outraged',
        'seething',
        'fuming',
        'boiling',
        'burning',
        'smoldering',

        // Extreme anger
        'raging',
        'ballistic',
        'apoplectic',
        'berserk',
        'seeing red',
        'losing it',

        // Slang
        'pissed',
        'pissed off',
        'salty',
        'pressed',
        'triggered',
        'tilted',
        'heated',
        'steaming',

        // British
        'narked',
        'cheesed off',
        'brassed off',
        'shirty',
        'stroppy',
        'mardy',

        // Australian
        'ropeable',
        'filthy',
        'spewing',

        // Physical
        'clenching',
        'tensing',
        'grinding',
    ],

    // ═══════════════════════════════════════════════════════════════════
    // FEAR - Anxiety, worry, terror
    // ═══════════════════════════════════════════════════════════════════
    fear: [
        // Core
        'afraid',
        'scared',
        'fear',
        'fearful',

        // Mild fear
        'uneasy',
        'unsettled',
        'apprehensive',
        'wary',
        'concerned',
        'worried',

        // Physical anxiety
        'jittery',
        'shaky',
        'trembling',
        'quivering',
        'tense',
        'tight',
        'clenched',
        'knotted',

        // Medium fear
        'frightened',
        'alarmed',
        'startled',
        'spooked',
        'freaked',
        'freaked out',
        'creeped out',
        'on edge',
        'rattled',
        'unnerved',

        // Strong fear
        'terrified',
        'petrified',
        'horrified',
        'panicked',
        'panic',
        'panicking',
        'terror',
        'dread',

        // Paranoia
        'paranoid',
        'distrustful',
        'looking over shoulder',

        // Slang
        'sketched',
        'sketched out',
        'wigged out',
        'shook',

        // British
        'bricking it',
        'having kittens',
        'in a flap',

        // Physical
        'frozen',
        'paralyzed',
        'deer in headlights',
        'heart racing',
        'heart pounding',
        'sweating',
    ],

    // ═══════════════════════════════════════════════════════════════════
    // SURPRISE - Astonishment, unexpectedness, shock
    // ═══════════════════════════════════════════════════════════════════
    surprise: [
        // Core
        'surprised',
        'surprise',
        'surprising',

        // Mild surprise
        'oh',
        'huh',
        'hmm',
        'interesting',
        'unexpected',
        'caught off guard',

        // Medium surprise
        'astonished',
        'amazed',
        'astounded',
        'startled',
        'taken aback',
        'struck',

        // Strong surprise
        'shocked',
        'stunned',
        'staggered',
        'floored',
        'dumbfounded',
        'flabbergasted',
        'gobsmacked',
        'blown away',
        'mind blown',
        'speechless',

        // Positive surprise
        'wow',
        'whoa',
        'omg',
        'no way',
        'incredible',
        'unbelievable',
        'amazing',

        // Negative surprise
        'alarmed',
        'dismayed',
        'appalled',

        // Confusion element
        'bewildered',
        'baffled',
        'perplexed',
        'puzzled',
        'confused',
        'disoriented',
        'thrown',

        // Slang
        'shooketh',
        'gagged',
        'dead',
        'wait what',

        // British
        'blimey',
        'crikey',
        'bloody hell',

        // Physical
        'jaw dropped',
        'eyes wide',
        'double take',
        'gasp',
        'gasping',
    ],

    // ═══════════════════════════════════════════════════════════════════
    // DISGUST - Revulsion, aversion, distaste
    // ═══════════════════════════════════════════════════════════════════
    disgust: [
        // Core
        'disgusted',
        'disgust',
        'disgusting',

        // Mild disgust
        'distaste',
        'dislike',
        'aversion',
        'put off',
        'turned off',
        'off-putting',

        // Medium disgust
        'repulsed',
        'revolted',
        'repelled',
        'grossed out',
        'creeped out',
        'icked out',

        // Strong disgust
        'sickened',
        'nauseated',
        'nauseous',
        'appalled',
        'horrified',
        'scandalized',

        // Moral disgust
        'offended',
        'outraged',
        'indignant',
        'contempt',
        'contemptuous',
        'disdain',
        'scorn',

        // Physical
        'gagging',
        'retching',
        'cringing',
        'wincing',
        'recoiling',
        'shrinking back',

        // Slang
        'gross',
        'ew',
        'eww',
        'yuck',
        'yucky',
        'ick',
        'nasty',
        'foul',
        'vile',

        // British
        'rank',
        'minging',
        'manky',
        'grotty',
    ],

    // ═══════════════════════════════════════════════════════════════════
    // LOVE - Affection, adoration, tenderness
    // ═══════════════════════════════════════════════════════════════════
    love: [
        // Core
        'love',
        'loving',
        'loved',

        // Affection
        'affection',
        'affectionate',
        'fond',
        'fondness',
        'tender',
        'tenderness',
        'gentle',

        // Care
        'caring',
        'care',
        'nurturing',
        'supportive',
        'protective',
        'devoted',
        'dedicated',

        // Warmth
        'warm',
        'warmth',
        'warm-hearted',
        'kind',
        'kind-hearted',
        'compassionate',
        'sympathetic',

        // Adoration
        'adoring',
        'adore',
        'cherish',
        'cherishing',
        'treasure',
        'treasuring',
        'doting',

        // Romantic
        'romantic',
        'amorous',
        'passionate',
        'smitten',
        'infatuated',
        'enamored',
        'besotted',
        'head over heels',
        'falling for',

        // Connection
        'connected',
        'bonded',
        'attached',
        'close',
        'intimate',
        'deep',
        'profound',

        // Slang
        'heart eyes',
        'crushing',
        'swooning',
        'melting',

        // Physical
        'hugging',
        'embracing',
        'holding',
        'cuddling',
        'snuggling',
        'nuzzling',
    ],

    // ═══════════════════════════════════════════════════════════════════
    // EUPHORIA - Extreme joy, transcendence, bliss
    // ═══════════════════════════════════════════════════════════════════
    euphoria: [
        // Core
        'euphoric',
        'euphoria',
        'bliss',
        'blissful',

        // Transcendence
        'transcendent',
        'otherworldly',
        'sublime',
        'heavenly',
        'divine',
        'ethereal',
        'celestial',

        // Ecstasy
        'ecstatic',
        'ecstasy',
        'rapture',
        'rapturous',
        'exultant',
        'exalted',
        'elevated',

        // Peak experience
        'peak',
        'pinnacle',
        'height',
        'climax',
        'breakthrough',
        'revelation',
        'epiphany',

        // Overwhelming positivity
        'overwhelming joy',
        'pure joy',
        'absolute joy',
        'complete happiness',
        'total bliss',

        // Physical
        'floating',
        'soaring',
        'flying',
        'weightless',
        'radiating',
        'shining',

        // Slang
        'on cloud nine',
        'in heaven',
        'on top of the world',
        'walking on air',
        'living my best life',
        'ascended',
    ],

    // ═══════════════════════════════════════════════════════════════════
    // FOCUSED - Concentration, attention, engagement
    // ═══════════════════════════════════════════════════════════════════
    focused: [
        // Core
        'focused',
        'focus',
        'focusing',

        // Concentration
        'concentrating',
        'concentration',
        'concentrated',
        'attentive',
        'attention',
        'attending',

        // Mental state
        'thinking',
        'thought',
        'thoughtful',
        'pondering',
        'considering',
        'contemplating',
        'reflecting',
        'musing',
        'mulling',

        // Engagement
        'engaged',
        'absorbed',
        'immersed',
        'engrossed',
        'rapt',
        'riveted',
        'captivated',
        'enthralled',

        // Intensity
        'intent',
        'determined',
        'resolute',
        'single-minded',
        'laser focused',
        'zeroed in',

        // Work state
        'working',
        'processing',
        'analyzing',
        'examining',
        'studying',
        'learning',
        'figuring out',

        // Slang
        'locked in',
        'dialed in',
        'in the zone',
        'flow state',
        'deep work',
        'grinding',

        // Physical
        'staring',
        'gazing',
        'peering',
        'squinting',
        'furrowed brow',
    ],

    // ═══════════════════════════════════════════════════════════════════
    // SUSPICION - Doubt, wariness, skepticism
    // ═══════════════════════════════════════════════════════════════════
    suspicion: [
        // Core
        'suspicious',
        'suspicion',
        'suspect',

        // Doubt
        'doubtful',
        'doubt',
        'doubting',
        'skeptical',
        'skepticism',
        'questioning',
        'uncertain',
        'unsure',
        'unconvinced',

        // Wariness
        'wary',
        'cautious',
        'guarded',
        'careful',
        'leery',
        'circumspect',
        'vigilant',

        // Distrust
        'distrustful',
        'mistrust',
        'mistrustful',
        'disbelieving',
        'incredulous',
        'unbelieving',

        // Evaluation
        'scrutinizing',
        'examining',
        'assessing',
        'evaluating',
        'judging',
        'sizing up',

        // Slang
        'sus',
        'sussy',
        'suss',
        'side eye',
        'giving side eye',
        'side-eyeing',
        'eyeing',
        'not buying it',

        // Physical
        'narrowed eyes',
        'squinting',
        'raised eyebrow',
        'cocked head',
        'tilted head',
        'looking askance',
    ],

    // ═══════════════════════════════════════════════════════════════════
    // RESTING - Low energy, dormancy, tiredness
    // ═══════════════════════════════════════════════════════════════════
    resting: [
        // Core
        'resting',
        'rest',
        'restful',

        // Tiredness
        'tired',
        'weary',
        'fatigued',
        'exhausted',
        'drained',
        'spent',
        'depleted',
        'worn out',

        // Sleepiness
        'sleepy',
        'drowsy',
        'dozy',
        'groggy',
        'yawning',
        'nodding off',
        'drifting off',

        // Low energy
        'sluggish',
        'lethargic',
        'listless',
        'languid',
        'lazy',
        'idle',
        'inactive',

        // Recovery
        'recovering',
        'recuperating',
        'recharging',
        'winding down',
        'powering down',
        'shutting down',

        // Sleep states
        'sleeping',
        'asleep',
        'slumbering',
        'dozing',
        'napping',
        'snoozing',

        // Slang
        'zonked',
        'wiped',
        'beat',
        'dead tired',
        'running on empty',
        'out of gas',
        'crashed',

        // British
        'knackered',
        'shattered',
        'cream crackered',
    ],

    // ═══════════════════════════════════════════════════════════════════
    // GLITCH - Error state, malfunction, corruption
    // ═══════════════════════════════════════════════════════════════════
    glitch: [
        // Core
        'glitch',
        'glitchy',
        'glitching',

        // Malfunction
        'malfunction',
        'malfunctioning',
        'broken',
        'bugged',
        'buggy',
        'error',
        'erroring',

        // Corruption
        'corrupted',
        'corruption',
        'scrambled',
        'garbled',
        'distorted',
        'warped',

        // Digital
        'static',
        'noise',
        'interference',
        'pixelated',
        'artifacting',
        'tearing',

        // Chaos
        'haywire',
        'fritzing',
        'shorting out',
        'going crazy',
        'spazzing',

        // Unstable
        'unstable',
        'erratic',
        'unpredictable',
        'flickering',
        'stuttering',
        'lagging',

        // Confused
        'does not compute',
        'syntax error',
        'crash',
    ],
};
