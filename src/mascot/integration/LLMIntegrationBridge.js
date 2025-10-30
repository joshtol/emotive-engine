/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝
 *                 ◐ ◑ ◒ ◓  LLM INTEGRATION BRIDGE  ◓ ◒ ◑ ◐
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview LLMIntegrationBridge - LLM Response Handling and Integration
 * @author Emotive Engine Team
 * @version 1.0.0
 * @module LLMIntegrationBridge
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Bridges LLM (Large Language Model) responses with the Emotive Mascot,
 * ║ automatically choreographing emotional reactions, shape morphs, and gestures
 * ║ based on LLM output. Provides schema validation and prompt templates.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🤖 RESPONSIBILITIES
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Handle LLM responses and choreograph mascot reactions
 * │ • Configure LLM handler behavior and mappings
 * │ • Provide response schemas for validation
 * │ • Generate system prompts for LLM integration
 * │ • Expose available emotions, actions, shapes, and gestures
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */

import LLMResponseHandler from '../../core/integration/LLMResponseHandler.js';
import { generateSystemPrompt } from '../../core/integration/llm-templates.js';

export class LLMIntegrationBridge {
    /**
     * Create LLMIntegrationBridge
     * @param {EmotiveMascot} mascot - Parent mascot instance
     */
    constructor(mascot) {
        this.mascot = mascot;
    }

    /**
     * Handle an LLM response and automatically choreograph mascot reaction
     *
     * @param {Object} response - Structured LLM response
     * @param {string} response.message - Message content
     * @param {string} response.emotion - Emotion to express
     * @param {string} response.sentiment - Sentiment (positive/neutral/negative)
     * @param {string} response.action - Action context
     * @param {number} response.frustrationLevel - User frustration (0-100)
     * @param {string} [response.shape] - Optional shape to morph to
     * @param {string} [response.gesture] - Optional gesture to perform
     * @param {Object} options - Handler options
     * @returns {Promise<EmotiveMascot>} Parent mascot instance for chaining
     *
     * @example
     * const llmResponse = {
     *   message: "I'd be happy to help!",
     *   emotion: 'joy',
     *   sentiment: 'positive',
     *   action: 'offer_help',
     *   frustrationLevel: 20,
     *   shape: 'heart',
     *   gesture: 'reach'
     * };
     * await mascot.handleLLMResponse(llmResponse);
     */
    async handleLLMResponse(response, options = {}) {
        return this.mascot.errorBoundary.wrap(async () => {
            // Lazy-initialize LLM handler
            if (!this.mascot.llmHandler) {
                this.mascot.llmHandler = new LLMResponseHandler(this.mascot, options);
            }

            // Process the response
            await this.mascot.llmHandler.handle(response, options);

            return this.mascot;
        }, 'handleLLMResponse', this.mascot)();
    }

    /**
     * Configure LLM response handling behavior
     *
     * @param {Object} config - Handler configuration
     * @param {boolean} [config.autoMorphShapes] - Automatically morph shapes
     * @param {number} [config.morphDuration] - Shape morph duration (ms)
     * @param {boolean} [config.autoExpressGestures] - Automatically express gestures
     * @param {number} [config.gestureTiming] - Gesture delay (ms)
     * @param {number} [config.gestureIntensity] - Default gesture intensity (0-1)
     * @param {Object} [config.emotionToShapeMap] - Custom emotion→shape mappings
     * @param {Object} [config.actionToGestureMap] - Custom action→gesture mappings
     * @returns {EmotiveMascot} Parent mascot instance for chaining
     *
     * @example
     * mascot.configureLLMHandler({
     *   emotionToShapeMap: {
     *     joy: 'sun',      // Override default
     *     empathy: 'moon'  // Custom mapping
     *   },
     *   gestureIntensity: 0.9
     * });
     */
    configureLLMHandler(config) {
        return this.mascot.errorBoundary.wrap(() => {
            if (!this.mascot.llmHandler) {
                this.mascot.llmHandler = new LLMResponseHandler(this.mascot, config);
            } else {
                this.mascot.llmHandler.configure(config);
            }
            return this.mascot;
        }, 'configureLLMHandler', this.mascot)();
    }

    /**
     * Get the LLM response schema for validation
     * @returns {Object} Response schema
     */
    getLLMResponseSchema() {
        if (!this.mascot.llmHandler) {
            this.mascot.llmHandler = new LLMResponseHandler(this.mascot);
        }
        return this.mascot.llmHandler.getSchema();
    }

    /**
     * Get system prompt template for LLM integration
     *
     * @param {Object} options - Prompt customization options
     * @param {string} [options.domain] - Domain context (e.g., 'retail checkout')
     * @param {string} [options.personality] - Mascot personality
     * @param {string} [options.brand] - Brand name
     * @returns {string} System prompt
     *
     * @example
     * const prompt = EmotiveMascot.getLLMPromptTemplate({
     *   domain: 'customer support',
     *   personality: 'friendly and professional',
     *   brand: 'Acme Corp'
     * });
     *
     * // Use with Claude, GPT, Gemini, etc.
     * const response = await llm.generate({
     *   system: prompt,
     *   message: userInput
     * });
     */
    static getLLMPromptTemplate(options = {}) {
        return generateSystemPrompt(options);
    }

    /**
     * Get available emotions for LLM responses
     * @returns {Array<string>} List of valid emotion names
     */
    static getLLMEmotions() {
        return LLMResponseHandler.getAvailableEmotions();
    }

    /**
     * Get available actions for LLM responses
     * @returns {Array<string>} List of valid action names
     */
    static getLLMActions() {
        return LLMResponseHandler.getAvailableActions();
    }

    /**
     * Get available shapes for LLM responses
     * @returns {Array<string>} List of valid shape names
     */
    static getLLMShapes() {
        return LLMResponseHandler.getAvailableShapes();
    }

    /**
     * Get available gestures for LLM responses
     * @returns {Array<string>} List of valid gesture names
     */
    static getLLMGestures() {
        return LLMResponseHandler.getAvailableGestures();
    }
}
