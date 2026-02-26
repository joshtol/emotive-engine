/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Semantic Action Registry
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Maps LLM response actions to semantic performances
 * @author Emotive Engine Team
 * @module core/performances/semantic-actions
 *
 * @description
 * Bridges the gap between LLM intent (actions like "offer_help", "celebrate") and the
 * semantic performance system. Each action maps to:
 * - A semantic performance name (if available)
 * - Default shape to morph into
 * - Default gesture to perform
 * - Matching emotion
 * - Performance characteristics
 *
 * This enables LLMs to trigger sophisticated choreographed performances with simple
 * action names, while maintaining fallback behavior for manual choreography.
 *
 * Actions are organized by semantic category matching the gesture system:
 * - CONVERSATIONAL: Dialog-driven actions (greet, confirm, deny, guide)
 * - COGNITIVE: Thinking/processing actions (think, listen, question)
 * - PHYSICAL: Movement and reaction actions (attack, hit, dance, dodge)
 * - DRAMATIC: High-impact theatrical actions (celebrate_big, rage, transform)
 * - AMBIENT: Environmental/atmospheric actions (idle, ambient, weather)
 * - NEUTRAL: Default/no-action state
 */

/**
 * Semantic action definitions
 * Maps LLM action strings to performance configurations
 */
export const SEMANTIC_ACTIONS = {
    // ═══════════════════════════════════════════════════════════════════════════════════
    // CONVERSATIONAL ACTIONS
    // ═══════════════════════════════════════════════════════════════════════════════════

    /**
     * User needs assistance - mascot offers help
     */
    offer_help: {
        performance: 'offering_help', // Semantic performance name
        defaultShape: 'heart', // Empathetic shape
        defaultGesture: 'reach', // Reaching out gesture
        emotionMatch: 'empathy', // Best matching emotion
        category: 'conversational',
        description: 'Offering assistance to user',
        intensityModifier: 1.0, // No modification to calculated intensity
        examples: ['How can I help you?', 'Let me assist you with that', "I'm here to help"],
    },

    /**
     * Celebrating success or achievement
     */
    celebrate: {
        performance: 'celebrating',
        defaultShape: 'star', // Achievement shape
        defaultGesture: 'sparkle', // Celebratory gesture
        emotionMatch: 'joy',
        category: 'conversational',
        description: 'Celebrating success or completion',
        intensityModifier: 1.2, // Amplify celebrations
        examples: ['Great job!', 'You did it!', 'Perfect!'],
    },

    /**
     * Providing guidance or instructions
     */
    guide: {
        performance: 'guiding',
        defaultShape: 'square', // Structured shape for instructions
        defaultGesture: 'point', // Directional gesture
        emotionMatch: 'calm',
        category: 'conversational',
        description: 'Providing step-by-step guidance',
        intensityModifier: 0.8, // Calm, measured guidance
        examples: ["Here's how to do that", 'Follow these steps', 'Let me show you'],
    },

    /**
     * Reassuring or comforting user
     */
    reassure: {
        performance: 'reassuring',
        defaultShape: 'heart', // Caring shape
        defaultGesture: 'nod', // Affirming gesture
        emotionMatch: 'empathy',
        category: 'conversational',
        description: 'Providing comfort and reassurance',
        intensityModifier: 0.9, // Gentle reassurance
        examples: ["Don't worry, we'll fix this", 'Everything will be okay', "You're doing great"],
    },

    /**
     * Greeting user
     */
    greet: {
        performance: 'greeting',
        defaultShape: 'sun', // Bright, welcoming shape
        defaultGesture: 'wave', // Welcoming gesture
        emotionMatch: 'joy',
        category: 'conversational',
        description: 'Welcoming user',
        intensityModifier: 1.0,
        examples: ['Hello!', 'Welcome!', 'Hi there!'],
    },

    /**
     * Confirming or validating user action
     */
    confirm: {
        performance: 'confirming',
        defaultShape: 'circle', // Neutral shape
        defaultGesture: 'nod', // Affirmative gesture
        emotionMatch: 'calm',
        category: 'conversational',
        description: 'Confirming user action or understanding',
        intensityModifier: 0.7, // Subtle confirmation
        examples: ["Yes, that's correct", 'I understand', 'Got it'],
    },

    /**
     * Denying or correcting
     */
    deny: {
        performance: 'denying',
        defaultShape: 'circle', // Neutral shape
        defaultGesture: 'shake', // Negative gesture
        emotionMatch: 'concern',
        category: 'conversational',
        description: 'Correcting or indicating no',
        intensityModifier: 0.8,
        examples: ["That's not quite right", 'No, let me clarify', 'Not exactly'],
    },

    /**
     * Emphasizing important information
     */
    emphasize: {
        performance: 'emphasizing',
        defaultShape: 'star', // Attention-grabbing shape
        defaultGesture: 'pulse', // Pulsing for emphasis
        emotionMatch: 'excitement',
        category: 'conversational',
        description: 'Drawing attention to key information',
        intensityModifier: 1.1, // Slightly amplified
        examples: ['This is important', 'Pay attention to this', 'Remember this'],
    },

    // ═══════════════════════════════════════════════════════════════════════════════════
    // COGNITIVE ACTIONS
    // ═══════════════════════════════════════════════════════════════════════════════════

    /**
     * Asking a question or expressing curiosity
     */
    question: {
        performance: 'questioning',
        defaultShape: 'circle', // Open, curious shape
        defaultGesture: 'tilt', // Inquisitive tilt
        emotionMatch: 'curiosity',
        category: 'cognitive',
        description: 'Asking for clarification or more info',
        intensityModifier: 0.8,
        examples: ['Could you clarify?', 'What do you mean?', 'Can you tell me more?'],
    },

    /**
     * Processing or thinking
     */
    think: {
        performance: 'thinking',
        defaultShape: 'circle', // Neutral while processing
        defaultGesture: 'orbit', // Contemplative orbit
        emotionMatch: 'calm',
        category: 'cognitive',
        description: 'Processing information',
        intensityModifier: 0.6, // Calm thinking
        examples: ['Let me think about that', 'Processing...', 'Hmm...'],
    },

    /**
     * Actively listening
     */
    listen: {
        performance: 'listening',
        defaultShape: 'circle', // Attentive shape
        defaultGesture: 'settle', // Focused, still
        emotionMatch: 'calm',
        category: 'cognitive',
        description: 'Actively listening to user',
        intensityModifier: 0.5, // Very calm, attentive
        examples: ["I'm listening", 'Go on...', 'Tell me more'],
    },

    /**
     * Responding or replying
     */
    respond: {
        performance: 'responding',
        defaultShape: 'circle', // Neutral response
        defaultGesture: 'bounce', // Engaged bounce
        emotionMatch: 'calm',
        category: 'cognitive',
        description: 'General response to user',
        intensityModifier: 0.8,
        examples: ["Here's what I think", 'My response is...', 'To answer your question'],
    },

    // ═══════════════════════════════════════════════════════════════════════════════════
    // PHYSICAL ACTIONS (Maps to: actions, reactions, dance gesture categories)
    // ═══════════════════════════════════════════════════════════════════════════════════

    /**
     * Attacking or aggressive action
     */
    attack: {
        performance: 'attacking',
        defaultShape: 'diamond', // Sharp, aggressive shape
        defaultGesture: 'lunge', // Forward attack motion
        emotionMatch: 'anger',
        category: 'physical',
        description: 'Aggressive forward action',
        intensityModifier: 1.3, // High intensity
        examples: ['Take this!', 'Attack!', 'Charge!'],
    },

    /**
     * Being hit or taking damage
     */
    hit: {
        performance: 'hit_reaction',
        defaultShape: 'circle', // Defensive shape
        defaultGesture: 'oofFront', // Impact reaction
        emotionMatch: 'pain',
        category: 'physical',
        description: 'Reacting to being hit',
        intensityModifier: 1.1,
        examples: ['Oof!', 'Ouch!', 'That hurt!'],
    },

    /**
     * Dodging or evading
     */
    dodge: {
        performance: 'dodging',
        defaultShape: 'circle', // Agile shape
        defaultGesture: 'wobble', // Quick evasive motion
        emotionMatch: 'fear',
        category: 'physical',
        description: 'Evading an attack or obstacle',
        intensityModifier: 1.0,
        examples: ['Whoa!', 'Close one!', 'Missed me!'],
    },

    /**
     * Dancing or grooving
     */
    dance: {
        performance: 'dancing',
        defaultShape: 'star', // Fun, dynamic shape
        defaultGesture: 'runningman', // Classic dance move
        emotionMatch: 'joy',
        category: 'physical',
        description: 'Dancing or moving to rhythm',
        intensityModifier: 1.2,
        examples: ["Let's dance!", 'Groove time!', 'Feel the beat!'],
    },

    /**
     * Jumping with excitement
     */
    jump: {
        performance: 'jumping',
        defaultShape: 'star', // Energetic shape
        defaultGesture: 'jump', // Vertical jump
        emotionMatch: 'excitement',
        category: 'physical',
        description: 'Jumping with energy',
        intensityModifier: 1.1,
        examples: ['Jump!', 'Boing!', 'Up we go!'],
    },

    /**
     * Spinning around
     */
    spin: {
        performance: 'spinning',
        defaultShape: 'circle', // Rotational shape
        defaultGesture: 'spin', // Full rotation
        emotionMatch: 'excitement',
        category: 'physical',
        description: 'Spinning or rotating',
        intensityModifier: 1.0,
        examples: ['Wheee!', 'Spin!', 'Round and round!'],
    },

    /**
     * Bowing or showing respect
     */
    bow: {
        performance: 'bowing',
        defaultShape: 'circle', // Humble shape
        defaultGesture: 'bow', // Respectful bow
        emotionMatch: 'calm',
        category: 'physical',
        description: 'Showing respect or gratitude',
        intensityModifier: 0.7,
        examples: ['Thank you', "I'm honored", 'My pleasure'],
    },

    /**
     * Pointing to direct attention
     */
    point: {
        performance: 'pointing',
        defaultShape: 'triangle', // Directional shape
        defaultGesture: 'point', // Pointing gesture
        emotionMatch: 'calm',
        category: 'physical',
        description: 'Directing attention somewhere',
        intensityModifier: 0.9,
        examples: ['Look over there!', 'This way!', 'Right here!'],
    },

    // ═══════════════════════════════════════════════════════════════════════════════════
    // DRAMATIC ACTIONS (Maps to: destruction, reactions, atmosphere gesture categories)
    // ═══════════════════════════════════════════════════════════════════════════════════

    /**
     * Big celebration with effects
     */
    celebrate_big: {
        performance: 'celebrating_big',
        defaultShape: 'star', // Celebratory shape
        defaultGesture: 'confetti', // Party effect
        emotionMatch: 'joy',
        category: 'dramatic',
        description: 'Major celebration with dramatic effects',
        intensityModifier: 1.4, // Maximum celebration
        examples: ['AMAZING!', 'INCREDIBLE!', 'WE DID IT!'],
    },

    /**
     * Expressing intense anger
     */
    rage: {
        performance: 'raging',
        defaultShape: 'diamond', // Sharp, angry shape
        defaultGesture: 'rage', // Intense anger gesture
        emotionMatch: 'anger',
        category: 'dramatic',
        description: 'Expressing intense anger or frustration',
        intensityModifier: 1.3,
        examples: ['ARGH!', 'This is unacceptable!', "I've had enough!"],
    },

    /**
     * Dramatic transformation
     */
    transform: {
        performance: 'transforming',
        defaultShape: 'star', // Dynamic shape
        defaultGesture: 'morph', // Transformation effect
        emotionMatch: 'excitement',
        category: 'dramatic',
        description: 'Dramatic shape or state transformation',
        intensityModifier: 1.2,
        examples: ['Transforming!', 'Watch this!', 'Behold!'],
    },

    /**
     * Breaking apart dramatically
     */
    shatter: {
        performance: 'shattering',
        defaultShape: 'circle', // Pre-shatter shape
        defaultGesture: 'shatter', // Break apart effect
        emotionMatch: 'surprise',
        category: 'dramatic',
        description: 'Breaking apart into pieces',
        intensityModifier: 1.3,
        examples: ['Breaking!', 'Shattered!', 'Falling apart!'],
    },

    /**
     * Fading away or dissolving
     */
    dissolve: {
        performance: 'dissolving',
        defaultShape: 'circle', // Fading shape
        defaultGesture: 'dissolveUp', // Dissolve effect
        emotionMatch: 'sadness',
        category: 'dramatic',
        description: 'Fading or dissolving away',
        intensityModifier: 0.8,
        examples: ['Goodbye...', 'Fading away...', 'Disappearing...'],
    },

    /**
     * Getting knocked down
     */
    knockdown: {
        performance: 'knocked_down',
        defaultShape: 'circle', // Defeated shape
        defaultGesture: 'knockdown', // Fall down gesture
        emotionMatch: 'sadness',
        category: 'dramatic',
        description: 'Being knocked down or defeated',
        intensityModifier: 1.1,
        examples: ["I'm down!", 'Defeated...', "Can't go on..."],
    },

    /**
     * Victory pose
     */
    victory: {
        performance: 'victorious',
        defaultShape: 'star', // Triumphant shape
        defaultGesture: 'burstUp', // Upward celebration
        emotionMatch: 'joy',
        category: 'dramatic',
        description: 'Celebrating victory',
        intensityModifier: 1.3,
        examples: ['Victory!', 'I won!', 'Champion!'],
    },

    // ═══════════════════════════════════════════════════════════════════════════════════
    // AMBIENT ACTIONS (Maps to: idle, atmosphere gesture categories)
    // ═══════════════════════════════════════════════════════════════════════════════════

    /**
     * Idle/waiting state with subtle movement
     */
    idle: {
        performance: 'idling',
        defaultShape: 'circle', // Relaxed shape
        defaultGesture: 'breathe', // Subtle breathing
        emotionMatch: 'neutral',
        category: 'ambient',
        description: 'Idle state with subtle animation',
        intensityModifier: 0.4, // Very subtle
        examples: ['...', '*waiting*', '*idle*'],
    },

    /**
     * Ambient environmental effect
     */
    ambient: {
        performance: 'ambient_effect',
        defaultShape: 'circle', // Neutral shape
        defaultGesture: 'glow', // Ambient glow
        emotionMatch: 'calm',
        category: 'ambient',
        description: 'Ambient environmental effect',
        intensityModifier: 0.5,
        examples: ['*glowing*', '*ambient*', '*atmospheric*'],
    },

    /**
     * Weather-like atmospheric effect
     */
    weather: {
        performance: 'weather_effect',
        defaultShape: 'circle', // Neutral shape
        defaultGesture: 'rain', // Weather particles
        emotionMatch: 'calm',
        category: 'ambient',
        description: 'Weather or particle effect',
        intensityModifier: 0.6,
        examples: ['*raining*', '*snowing*', '*stormy*'],
    },

    /**
     * Sleepy or drowsy state
     */
    sleepy: {
        performance: 'sleeping',
        defaultShape: 'circle', // Relaxed shape
        defaultGesture: 'sway', // Drowsy sway
        emotionMatch: 'calm',
        category: 'ambient',
        description: 'Sleepy or drowsy state',
        intensityModifier: 0.3, // Very low energy
        examples: ['*yawn*', 'So sleepy...', 'Zzz...'],
    },

    /**
     * Alert/awakening state
     */
    alert: {
        performance: 'alerting',
        defaultShape: 'diamond', // Sharp, alert shape
        defaultGesture: 'snap', // Quick snap to attention
        emotionMatch: 'surprise',
        category: 'ambient',
        description: 'Becoming alert or awakening',
        intensityModifier: 1.0,
        examples: ['What?!', 'Huh?', "I'm awake!"],
    },

    // ═══════════════════════════════════════════════════════════════════════════════════
    // EMOTIONAL REACTIONS (Maps to: reactions gesture category)
    // ═══════════════════════════════════════════════════════════════════════════════════

    /**
     * Surprised reaction
     */
    surprise: {
        performance: 'surprised',
        defaultShape: 'star', // Startled shape
        defaultGesture: 'elasticBounce', // Springy surprise
        emotionMatch: 'surprise',
        category: 'emotional',
        description: 'Surprised or startled reaction',
        intensityModifier: 1.1,
        examples: ['Oh!', 'Wow!', 'What?!'],
    },

    /**
     * Scared/frightened reaction
     */
    scared: {
        performance: 'frightened',
        defaultShape: 'circle', // Defensive shape
        defaultGesture: 'shiver', // Fearful shiver
        emotionMatch: 'fear',
        category: 'emotional',
        description: 'Scared or frightened reaction',
        intensityModifier: 1.0,
        examples: ['Eek!', "I'm scared!", 'Help!'],
    },

    /**
     * Sad/disappointed reaction
     */
    sad: {
        performance: 'saddened',
        defaultShape: 'heart', // Emotional shape
        defaultGesture: 'deflate', // Deflating sadly
        emotionMatch: 'sadness',
        category: 'emotional',
        description: 'Sad or disappointed reaction',
        intensityModifier: 0.7,
        examples: ['Oh no...', "That's sad...", "I'm sorry to hear that"],
    },

    /**
     * Excited/thrilled reaction
     */
    excited: {
        performance: 'excited',
        defaultShape: 'star', // Energetic shape
        defaultGesture: 'sparkle', // Excited sparkle
        emotionMatch: 'excitement',
        category: 'emotional',
        description: 'Excited or thrilled reaction',
        intensityModifier: 1.2,
        examples: ['Yes!', 'This is exciting!', "I can't wait!"],
    },

    /**
     * Confused/puzzled reaction
     */
    confused: {
        performance: 'confused',
        defaultShape: 'circle', // Uncertain shape
        defaultGesture: 'wobble', // Confused wobble
        emotionMatch: 'confusion',
        category: 'emotional',
        description: 'Confused or puzzled reaction',
        intensityModifier: 0.8,
        examples: ['Huh?', "I don't understand...", "That's confusing"],
    },

    /**
     * Love/affection expression
     */
    love: {
        performance: 'loving',
        defaultShape: 'heart', // Love shape
        defaultGesture: 'heartbeat', // Pulsing heart
        emotionMatch: 'love',
        category: 'emotional',
        description: 'Expressing love or affection',
        intensityModifier: 1.1,
        examples: ['I love it!', 'So sweet!', 'Adorable!'],
    },

    // ═══════════════════════════════════════════════════════════════════════════════════
    // NEUTRAL / NONE
    // ═══════════════════════════════════════════════════════════════════════════════════

    /**
     * No specific action - neutral state
     */
    none: {
        performance: null, // No performance
        defaultShape: 'circle', // Default shape
        defaultGesture: null, // No gesture
        emotionMatch: 'neutral',
        category: 'neutral',
        description: 'Neutral state with no specific action',
        intensityModifier: 0.5,
        examples: ['Okay', 'I see', 'Understood'],
    },
};

/**
 * Get semantic action configuration by name
 * @param {string} actionName - Action name from LLM response
 * @returns {Object|null} Action configuration or null if not found
 */
export function getSemanticAction(actionName) {
    return SEMANTIC_ACTIONS[actionName] || null;
}

/**
 * Get all available action names
 * @returns {Array<string>} List of valid action names
 */
export function getAvailableActions() {
    return Object.keys(SEMANTIC_ACTIONS);
}

/**
 * Get actions by category
 * @param {string} category - Category name ('conversational', 'cognitive', 'physical', 'dramatic', 'ambient', 'emotional', 'neutral')
 * @returns {Array<Object>} List of actions in category
 */
export function getActionsByCategory(category) {
    return Object.entries(SEMANTIC_ACTIONS)
        .filter(([_, config]) => config.category === category)
        .map(([name, config]) => ({ name, ...config }));
}

/**
 * Get all available categories
 * @returns {Array<string>} List of unique category names
 */
export function getAvailableCategories() {
    const categories = new Set(Object.values(SEMANTIC_ACTIONS).map(config => config.category));
    return Array.from(categories);
}

/**
 * Get action configuration with fallbacks
 * @param {string} actionName - Action name
 * @param {Object} overrides - Override specific properties
 * @returns {Object} Complete action configuration
 */
export function getActionConfig(actionName, overrides = {}) {
    const action = getSemanticAction(actionName);

    if (!action) {
        // Return safe defaults for unknown actions
        return {
            performance: null,
            defaultShape: 'circle',
            defaultGesture: null,
            emotionMatch: 'neutral',
            category: 'unknown',
            description: 'Unknown action',
            intensityModifier: 1.0,
            ...overrides,
        };
    }

    return {
        ...action,
        ...overrides,
    };
}

/**
 * Validate if action name is valid
 * @param {string} actionName - Action name to validate
 * @returns {boolean} True if valid
 */
export function isValidAction(actionName) {
    return actionName in SEMANTIC_ACTIONS;
}

/**
 * Get suggested emotion for action
 * @param {string} actionName - Action name
 * @returns {string} Suggested emotion name
 */
export function getSuggestedEmotion(actionName) {
    const action = getSemanticAction(actionName);
    return action ? action.emotionMatch : 'neutral';
}

/**
 * Get suggested shape for action
 * @param {string} actionName - Action name
 * @returns {string} Suggested shape name
 */
export function getSuggestedShape(actionName) {
    const action = getSemanticAction(actionName);
    return action ? action.defaultShape : 'circle';
}

/**
 * Get suggested gesture for action
 * @param {string} actionName - Action name
 * @returns {string|null} Suggested gesture name or null
 */
export function getSuggestedGesture(actionName) {
    const action = getSemanticAction(actionName);
    return action ? action.defaultGesture : null;
}

/**
 * Calculate intensity with action modifier
 * @param {number} baseIntensity - Base intensity (0-1)
 * @param {string} actionName - Action name
 * @returns {number} Modified intensity (0-1)
 */
export function calculateActionIntensity(baseIntensity, actionName) {
    const action = getSemanticAction(actionName);
    const modifier = action ? action.intensityModifier : 1.0;
    return Math.max(0.3, Math.min(1.0, baseIntensity * modifier));
}

export default SEMANTIC_ACTIONS;
