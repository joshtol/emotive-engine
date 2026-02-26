/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - LLM Response Handler
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Handles LLM responses and translates them into mascot performances
 * @author Emotive Engine Team
 * @module core/LLMResponseHandler
 *
 * @description
 * Provides a standardized way to process structured LLM responses (from Claude, GPT,
 * Gemini, etc.) and automatically choreograph appropriate mascot reactions including
 * emotions, shape morphing, and gestures.
 *
 * This eliminates the need for developers to manually coordinate:
 * - Emotion timing and intensity
 * - Shape morphing triggers
 * - Gesture choreography
 * - Context-aware performance scaling
 *
 * @example
 * const handler = new LLMResponseHandler(mascot, {
 *   autoMorphShapes: true,
 *   gestureTiming: 300
 * });
 *
 * const llmResponse = {
 *   message: "I'd be happy to help!",
 *   emotion: 'joy',
 *   sentiment: 'positive',
 *   action: 'offer_help',
 *   shape: 'heart',
 *   gesture: 'reach',
 *   frustrationLevel: 20
 * };
 *
 * await handler.handle(llmResponse);
 */

export default class LLMResponseHandler {
    /**
     * Create an LLM response handler
     * @param {EmotiveMascot} mascot - The mascot instance to control
     * @param {Object} config - Handler configuration
     * @param {boolean} config.autoMorphShapes - Automatically morph shapes based on emotion/action
     * @param {number} config.morphDuration - Duration of shape morphing in milliseconds
     * @param {boolean} config.autoExpressGestures - Automatically express gestures
     * @param {number} config.gestureTiming - Delay before gesture expression in milliseconds
     * @param {number} config.gestureIntensity - Default gesture intensity (0-1)
     * @param {boolean} config.useFallbackGestures - Use action-based gestures if none specified
     * @param {Object} config.emotionToShapeMap - Custom emotion to shape mappings
     * @param {Object} config.actionToGestureMap - Custom action to gesture mappings
     * @param {boolean} config.useSemanticPerformances - Use semantic performance system when available
     * @param {boolean} config.enableContextTracking - Automatically track frustration levels
     */
    constructor(mascot, config = {}) {
        if (!mascot) {
            throw new Error('LLMResponseHandler requires a mascot instance');
        }

        this.mascot = mascot;
        this.config = {
            // Shape morphing configuration
            autoMorphShapes: true,
            morphDuration: 1000,

            // Gesture choreography configuration
            autoExpressGestures: true,
            gestureTiming: 300, // Delay after emotion change for better choreography
            gestureIntensity: 0.7,

            // Fallback behaviors
            useFallbackGestures: true, // Use action-based gestures if none specified
            useSemanticPerformances: true, // Prefer semantic performances over manual choreography

            // Context tracking
            enableContextTracking: true, // Update mascot context automatically

            // Custom mappings (override defaults)
            emotionToShapeMap: {},
            actionToGestureMap: {},

            // Merge user config
            ...config,
        };

        // Response validation schema
        this.schema = {
            message: 'string',
            emotion: [
                'joy',
                'empathy',
                'calm',
                'excitement',
                'concern',
                'neutral',
                'triumph',
                'love',
                'curiosity',
            ],
            sentiment: ['positive', 'neutral', 'negative'],
            action: [
                'none',
                'offer_help',
                'celebrate',
                'guide',
                'reassure',
                'greet',
                'confirm',
                'deny',
                'emphasize',
                'question',
                'think',
                'listen',
                'respond',
            ],
            frustrationLevel: 'number', // 0-100
            shape: [
                'circle',
                'heart',
                'star',
                'sun',
                'moon',
                'eclipse',
                'solar',
                'lunar',
                'square',
                'triangle',
                'suspicion',
            ],
            gesture: [
                'bounce',
                'pulse',
                'shake',
                'spin',
                'drift',
                'nod',
                'tilt',
                'expand',
                'contract',
                'flash',
                'stretch',
                'glow',
                'flicker',
                'vibrate',
                'wave',
                'morph',
                'jump',
                'orbital',
                'hula',
                'scan',
                'twist',
                'burst',
                'directional',
                'settle',
                'fade',
                'hold',
                'breathe',
                'peek',
                'sparkle',
                'shimmer',
                'wiggle',
                'groove',
                'point',
                'lean',
                'reach',
                'headBob',
                'rain',
                'twitch',
                'sway',
                'float',
                'jitter',
                'orbit',
            ],
        };

        // Default emotion to shape mappings
        this.defaultShapeMap = {
            joy: 'star',
            love: 'heart',
            empathy: 'heart',
            excitement: 'sun',
            calm: 'moon',
            concern: 'circle',
            triumph: 'star',
            curiosity: 'circle',
            neutral: 'circle',
        };

        // Default action to gesture mappings
        this.defaultGestureMap = {
            offer_help: 'reach',
            celebrate: 'sparkle',
            guide: 'point',
            reassure: 'nod',
            greet: 'wave',
            confirm: 'nod',
            deny: 'shake',
            emphasize: 'pulse',
            question: 'tilt',
            think: 'orbit',
            listen: 'settle',
            respond: 'bounce',
        };

        // Semantic action to performance mappings (if performance system is available)
        this.semanticActionMap = {
            offer_help: 'offering_help',
            celebrate: 'celebrating',
            guide: 'guiding',
            reassure: 'reassuring',
            greet: 'greeting',
            confirm: 'confirming',
            deny: 'denying',
            emphasize: 'emphasizing',
            question: 'questioning',
            think: 'thinking',
            listen: 'listening',
            respond: 'responding',
        };
    }

    /**
     * Process an LLM response and update mascot accordingly
     * @param {Object} response - Structured LLM response
     * @param {string} response.message - The message content
     * @param {string} response.emotion - Emotion name
     * @param {string} response.sentiment - Sentiment (positive/neutral/negative)
     * @param {string} response.action - Action to perform
     * @param {number} response.frustrationLevel - User frustration level (0-100)
     * @param {string} response.shape - Optional shape to morph to
     * @param {string} response.gesture - Optional gesture to perform
     * @param {Object} options - Additional options
     * @param {number} options.intensity - Override calculated intensity
     * @param {boolean} options.skipValidation - Skip response validation
     * @returns {Promise<EmotiveMascot>} The mascot instance for chaining
     */
    async handle(response, options = {}) {
        try {
            // Validate response structure
            if (!options.skipValidation) {
                this.validateResponse(response);
            }

            const {
                emotion = 'neutral',
                sentiment = 'neutral',
                action = 'none',
                shape,
                gesture,
                frustrationLevel = 0,
            } = response;

            // Calculate performance intensity from context
            const intensity =
                options.intensity !== undefined
                    ? options.intensity
                    : this.calculateIntensity(frustrationLevel, sentiment);

            // Update mascot context if tracking enabled
            if (this.config.enableContextTracking && this.mascot.updateContext) {
                this.mascot.updateContext({
                    frustration: frustrationLevel,
                    sentiment,
                });
            }

            // Try to use semantic performance system first (more sophisticated)
            if (
                this.config.useSemanticPerformances &&
                this.mascot.perform &&
                this.semanticActionMap[action]
            ) {
                const performanceName = this.semanticActionMap[action];

                try {
                    await this.mascot.perform(performanceName, {
                        context: {
                            frustration: frustrationLevel,
                            sentiment,
                            urgency:
                                frustrationLevel > 60
                                    ? 'high'
                                    : frustrationLevel > 30
                                      ? 'medium'
                                      : 'low',
                        },
                        intensity,
                    });

                    // If shape specified, morph after performance
                    if (shape && this.config.autoMorphShapes) {
                        await this.morphToShape(shape);
                    }

                    return this.mascot;
                } catch {
                    // Performance not available, fall back to manual choreography
                    console.warn(
                        `Semantic performance '${performanceName}' not available, using manual choreography`
                    );
                }
            }

            // Manual choreography fallback
            await this.choreographResponse(emotion, action, shape, gesture, intensity);

            return this.mascot;
        } catch (error) {
            console.error('Error handling LLM response:', error);
            // Don't break the user experience - just log the error
            return this.mascot;
        }
    }

    /**
     * Manually choreograph mascot response
     * @private
     */
    async choreographResponse(emotion, action, shape, gesture, intensity) {
        // 1. Set emotion
        this.mascot.setEmotion(emotion, intensity);

        // 2. Morph shape if specified or mapped
        if (this.config.autoMorphShapes) {
            const targetShape = shape || this.getShapeForEmotion(emotion, action);
            if (targetShape) {
                await this.morphToShape(targetShape);
            }
        }

        // 3. Express gesture after choreographed delay
        if (this.config.autoExpressGestures) {
            const targetGesture = gesture || this.getGestureForAction(action);
            if (targetGesture) {
                await this.delay(this.config.gestureTiming);
                this.mascot.express(targetGesture, {
                    intensity: this.config.gestureIntensity,
                });
            }
        }
    }

    /**
     * Calculate performance intensity from context
     * @param {number} frustrationLevel - User frustration (0-100)
     * @param {string} sentiment - Sentiment (positive/neutral/negative)
     * @returns {number} Intensity value (0-1)
     */
    calculateIntensity(frustrationLevel, sentiment) {
        let intensity = 0.5; // Base intensity

        // Frustration increases intensity (more dramatic reactions)
        intensity += (frustrationLevel / 100) * 0.3;

        // Sentiment modifier
        if (sentiment === 'positive') {
            intensity += 0.2; // More energetic for positive
        } else if (sentiment === 'negative') {
            intensity += 0.3; // More dramatic for negative/empathy
        }

        // Clamp to valid range
        return Math.max(0.3, Math.min(1.0, intensity));
    }

    /**
     * Get appropriate shape for emotion/action combination
     * @param {string} emotion - Emotion name
     * @param {string} action - Action name
     * @returns {string|null} Shape name or null
     */
    getShapeForEmotion(emotion, action) {
        // Custom mappings have highest priority
        if (this.config.emotionToShapeMap[emotion]) {
            return this.config.emotionToShapeMap[emotion];
        }

        // Action-based overrides (e.g., celebrate always uses star)
        if (action === 'celebrate') return 'star';
        if (action === 'greet') return 'sun';

        // Default emotion-based mapping
        return this.defaultShapeMap[emotion] || null;
    }

    /**
     * Get appropriate gesture for action
     * @param {string} action - Action name
     * @returns {string|null} Gesture name or null
     */
    getGestureForAction(action) {
        if (!this.config.useFallbackGestures) {
            return null;
        }

        // Custom mappings have highest priority
        if (this.config.actionToGestureMap[action]) {
            return this.config.actionToGestureMap[action];
        }

        // Default action-based mapping
        return this.defaultGestureMap[action] || null;
    }

    /**
     * Morph to target shape
     * @private
     */
    morphToShape(targetShape) {
        if (targetShape && targetShape !== 'circle' && this.mascot.morphTo) {
            this.mascot.morphTo(targetShape, {
                duration: this.config.morphDuration,
            });
        }
    }

    /**
     * Validate LLM response structure
     * @param {Object} response - Response to validate
     * @throws {Error} If response is invalid
     */
    validateResponse(response) {
        if (!response || typeof response !== 'object') {
            throw new Error('LLM response must be an object');
        }

        // Validate emotion
        if (response.emotion && !this.schema.emotion.includes(response.emotion)) {
            console.warn(`Unknown emotion: ${response.emotion}. Using 'neutral'`);
        }

        // Validate sentiment
        if (response.sentiment && !this.schema.sentiment.includes(response.sentiment)) {
            console.warn(`Unknown sentiment: ${response.sentiment}. Using 'neutral'`);
        }

        // Validate action
        if (response.action && !this.schema.action.includes(response.action)) {
            console.warn(`Unknown action: ${response.action}. Using 'none'`);
        }

        // Validate shape
        if (response.shape && !this.schema.shape.includes(response.shape)) {
            console.warn(`Unknown shape: ${response.shape}. Ignoring.`);
        }

        // Validate gesture
        if (response.gesture && !this.schema.gesture.includes(response.gesture)) {
            console.warn(`Unknown gesture: ${response.gesture}. Ignoring.`);
        }

        // Validate frustration level
        if (response.frustrationLevel !== undefined) {
            const level = Number(response.frustrationLevel);
            if (isNaN(level) || level < 0 || level > 100) {
                console.warn(`Invalid frustrationLevel: ${response.frustrationLevel}. Using 0.`);
            }
        }
    }

    /**
     * Get the response schema
     * @returns {Object} Schema object
     */
    getSchema() {
        return { ...this.schema };
    }

    /**
     * Update handler configuration
     * @param {Object} config - Configuration updates
     * @returns {LLMResponseHandler} This instance for chaining
     */
    configure(config) {
        Object.assign(this.config, config);
        return this;
    }

    /**
     * Delay helper
     * @private
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Static method: Get available emotions
     * @returns {Array<string>} List of valid emotion names
     */
    static getAvailableEmotions() {
        return [
            'joy',
            'empathy',
            'calm',
            'excitement',
            'concern',
            'neutral',
            'triumph',
            'love',
            'curiosity',
        ];
    }

    /**
     * Static method: Get available actions
     * @returns {Array<string>} List of valid action names
     */
    static getAvailableActions() {
        return [
            'none',
            'offer_help',
            'celebrate',
            'guide',
            'reassure',
            'greet',
            'confirm',
            'deny',
            'emphasize',
            'question',
            'think',
            'listen',
            'respond',
        ];
    }

    /**
     * Static method: Get available shapes
     * @returns {Array<string>} List of valid shape names
     */
    static getAvailableShapes() {
        return [
            'circle',
            'heart',
            'star',
            'sun',
            'moon',
            'eclipse',
            'solar',
            'lunar',
            'square',
            'triangle',
            'suspicion',
        ];
    }

    /**
     * Static method: Get available gestures
     * @returns {Array<string>} List of valid gesture names
     */
    static getAvailableGestures() {
        return [
            'bounce',
            'pulse',
            'shake',
            'spin',
            'drift',
            'nod',
            'tilt',
            'expand',
            'contract',
            'flash',
            'stretch',
            'glow',
            'flicker',
            'vibrate',
            'wave',
            'morph',
            'jump',
            'orbital',
            'hula',
            'scan',
            'twist',
            'burst',
            'directional',
            'settle',
            'fade',
            'hold',
            'breathe',
            'peek',
            'sparkle',
            'shimmer',
            'wiggle',
            'groove',
            'point',
            'lean',
            'reach',
            'headBob',
            'rain',
            'twitch',
            'sway',
            'float',
            'jitter',
            'orbit',
        ];
    }
}
