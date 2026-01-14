/**
 * LLMIntegrationBridge - LLM Response Handling and Integration
 *
 * Bridges LLM responses with the Emotive Mascot, automatically choreographing
 * emotional reactions, shape morphs, and gestures based on LLM output.
 *
 * @module LLMIntegrationBridge
 */

import LLMResponseHandler from '../../core/integration/LLMResponseHandler.js';
import { generateSystemPrompt } from '../../core/integration/llm-templates.js';

export class LLMIntegrationBridge {
    /**
     * Create LLMIntegrationBridge
     *
     * @param {Object} deps - Dependencies
     * @param {Object} deps.errorBoundary - Error handling wrapper
     * @param {Object} [deps.mascotRef] - Reference to mascot for LLMResponseHandler
     * @param {Object} [deps.chainTarget] - Return value for method chaining
     */
    constructor(deps) {
        this.errorBoundary = deps.errorBoundary;
        this._mascotRef = deps.mascotRef;
        this._chainTarget = deps.chainTarget || this;
        this._llmHandler = null;
    }

    /**
     * Get or create LLM handler (lazy initialization)
     * @private
     */
    _getHandler(options = {}) {
        if (!this._llmHandler) {
            this._llmHandler = new LLMResponseHandler(this._mascotRef, options);
        }
        return this._llmHandler;
    }

    /**
     * Handle an LLM response and automatically choreograph mascot reaction
     *
     * @param {Object} response - Structured LLM response
     * @param {Object} options - Handler options
     * @returns {Promise<Object>} Chain target for method chaining
     */
    handleLLMResponse(response, options = {}) {
        return this.errorBoundary.wrap(async () => {
            const handler = this._getHandler(options);
            await handler.handle(response, options);
            return this._chainTarget;
        }, 'handleLLMResponse', this._chainTarget)();
    }

    /**
     * Configure LLM response handling behavior
     *
     * @param {Object} config - Handler configuration
     * @returns {Object} Chain target for method chaining
     */
    configureLLMHandler(config) {
        return this.errorBoundary.wrap(() => {
            const handler = this._getHandler(config);
            handler.configure(config);
            return this._chainTarget;
        }, 'configureLLMHandler', this._chainTarget)();
    }

    /**
     * Get the LLM response schema for validation
     * @returns {Object} Response schema
     */
    getLLMResponseSchema() {
        return this._getHandler().getSchema();
    }

    /**
     * Get system prompt template for LLM integration
     * @static
     */
    static getLLMPromptTemplate(options = {}) {
        return generateSystemPrompt(options);
    }

    /** @static */
    static getLLMEmotions() {
        return LLMResponseHandler.getAvailableEmotions();
    }

    /** @static */
    static getLLMActions() {
        return LLMResponseHandler.getAvailableActions();
    }

    /** @static */
    static getLLMShapes() {
        return LLMResponseHandler.getAvailableShapes();
    }

    /** @static */
    static getLLMGestures() {
        return LLMResponseHandler.getAvailableGestures();
    }
}
