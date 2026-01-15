/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE v4.0 - Audio Interpreter
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Real-time audio semantic interpreter using BYOK LLM
 * @author Emotive Engine Team
 * @version 4.0.0
 * @module audio/AudioInterpreter
 *
 * Interprets audio content (lyrics, mood) in real-time and maps semantic meaning
 * to engine actions (geometry, emotion, gesture, SSS preset).
 *
 * Supports ANY LLM provider:
 * - Anthropic Claude (direct browser access)
 * - OpenAI
 * - Grok (xAI)
 * - Any OpenAI-compatible API (local models, etc.)
 */

// ┌─────────────────────────────────────────────────────────────────────────────────────
// │ ENGINE VOCABULARY - The actual available states in the engine
// └─────────────────────────────────────────────────────────────────────────────────────

const ENGINE_VOCABULARY = {
    geometries: ['crystal', 'rough', 'heart', 'star', 'moon', 'sun'],
    sssPresets: ['quartz', 'emerald', 'ruby', 'sapphire', 'amethyst'],
    emotions: [
        'neutral', 'joy', 'sadness', 'anger', 'fear', 'surprise',
        'disgust', 'love', 'suspicion', 'excited', 'resting',
        'euphoria', 'focused', 'glitch', 'calm'
    ],
    motionGestures: [
        'bounce', 'pulse', 'shake', 'nod', 'vibrate', 'orbit',
        'twitch', 'sway', 'float', 'jitter', 'wiggle', 'sparkle',
        'shimmer', 'pop', 'bob', 'swell', 'swagger', 'dip', 'flare',
        'headBob', 'lean', 'point', 'reach'
    ],
    transformGestures: [
        'spin', 'jump', 'morph', 'stretch', 'tilt', 'orbital', 'hula', 'twist'
    ],
    effectGestures: [
        'wave', 'drift', 'flicker', 'burst', 'fade', 'breathe',
        'expand', 'contract', 'flash', 'glow', 'settle', 'hold'
    ]
};

// ┌─────────────────────────────────────────────────────────────────────────────────────
// │ SYSTEM PROMPT
// └─────────────────────────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a dance choreographer for an animated 3D mascot. Interpret lyrics/mood and output movement commands.

## PHILOSOPHY
- Gestures are constant - always return at least one to keep the mascot alive
- Emotions shift with lyrical sentiment - change when mood shifts
- Geometry transforms are dramatic - save for big moments (chorus, bridge, climax)
- SSS (material color) sets visual tone - change with thematic imagery

## VOCABULARY

**Geometries** (use sparingly - 2-3 per song max):
- crystal (default, neutral)
- heart (love, romance, passion)
- star (dreams, hope, aspiration)
- moon (night, introspection, melancholy)
- sun (energy, happiness, warmth)
- rough (raw, edgy, intense)

**SSS Presets** (works with crystal/rough/heart/star):
- quartz (pure, clean, ethereal)
- emerald (nature, growth, envy)
- ruby (passion, love, fire, anger)
- sapphire (cool, ocean, sky, sadness)
- amethyst (mystical, royal, dreamy)

**Emotions**:
- neutral, calm, resting (baseline)
- joy, excited, euphoria (positive energy)
- love (romantic, tender)
- sadness, fear (vulnerable)
- anger, disgust (intensity)
- surprise (sudden shifts)
- focused, suspicion (tension)

**Gestures by Category**:
- Base (ongoing): sway, float, bounce, swagger, pulse
- Accent (momentary hit): pop, bob, swell, dip, flare, burst
- Texture (layer on top): shimmer, sparkle, glow, breathe
- Transform (dramatic): spin, jump, shake, twist

## GESTURE CHAINING

You can combine gestures:
- Single: "gesture": "sway"
- Layered (simultaneous): "gesture": ["sway", "shimmer"]
- Sequential (accent then settle): "gesture": "pop", "then": "sway"

Common patterns:
- Verse: base + texture → ["sway", "breathe"]
- Beat hit: accent then base → "pop", then: "sway"
- Chorus: base + texture + energy → ["swagger", "sparkle"]
- Climax: transform then base → "burst", then: "swagger"

## DECISION GUIDE

| Content Type | Response |
|--------------|----------|
| Emotional words | emotion + gesture |
| Visual imagery | sss + maybe geometry |
| Action/movement | gesture only |
| Quiet narrative | subtle base gesture |
| High energy hook | layered gestures + emotion |
| Major theme shift | geometry + sss + emotion |

## OUTPUT FORMAT

Return ONLY valid JSON. Always include gesture.

{"gesture":"sway"}
{"gesture":["sway","shimmer"],"emotion":"calm"}
{"gesture":"pop","then":"swagger","emotion":"excited"}
{"gesture":"burst","then":"float","emotion":"euphoria","geometry":"star","sss":"amethyst"}

## EXAMPLES

"walking in the rain" → {"gesture":["sway","breathe"],"emotion":"sadness","sss":"sapphire"}
"I love you" → {"gesture":"swell","emotion":"love"}
"let's dance!" → {"gesture":["swagger","sparkle"],"emotion":"excited"}
"the stars above" → {"gesture":["float","shimmer"],"sss":"amethyst"}
"my heart burns" → {"gesture":"flare","then":"pulse","emotion":"love","geometry":"heart","sss":"ruby"}
"silence in the dark" → {"gesture":"breathe","emotion":"calm","geometry":"moon"}
"drop it!" → {"gesture":"burst","then":"swagger","emotion":"euphoria"}

RULES: Always include gesture. Use only listed vocabulary. Geometry changes are rare. JSON only.`;

// ┌─────────────────────────────────────────────────────────────────────────────────────
// │ AUDIO INTERPRETER CLASS
// └─────────────────────────────────────────────────────────────────────────────────────

/**
 * AudioInterpreter - Real-time semantic audio-to-visual mapping
 *
 * BYOK (Bring Your Own Key) - works with any LLM provider.
 */
export class AudioInterpreter {
    /**
     * @param {Object} options
     * @param {string} [options.apiKey] - API key
     * @param {string} [options.endpoint] - API endpoint URL
     * @param {string} [options.model] - Model name
     * @param {Function} [options.onAction] - Callback when action is generated
     * @param {Function} [options.onError] - Callback on error
     */
    constructor(options = {}) {
        this.apiKey = options.apiKey || null;
        this.endpoint = options.endpoint || null;
        this.model = options.model || null;
        this.onAction = options.onAction || null;
        this.onError = options.onError || null;

        this.enabled = false;
        this.lastAction = null;
        this.lastInterpretTime = 0;
        this.minIntervalMs = 3000;
        this.pendingRequest = null;

        this.currentState = {
            geometry: null,
            sss: null,
            emotion: null
        };

        this.textBuffer = [];
        this.bufferTimeout = null;
    }

    /**
     * Configure the LLM provider
     * @param {Object} config
     * @param {string} config.apiKey - API key
     * @param {string} config.endpoint - Full API endpoint URL
     * @param {string} [config.model] - Model name
     */
    configure(config) {
        // Sanitize API key - remove non-ASCII characters that can break fetch headers
        if (config.apiKey) {
            // eslint-disable-next-line no-control-regex
            this.apiKey = config.apiKey.replace(/[^\x00-\x7F]/g, '').trim();
        }
        if (config.endpoint) this.endpoint = config.endpoint;
        if (config.model) this.model = config.model;
    }

    /**
     * Check if this is an Anthropic endpoint
     * @private
     */
    _isAnthropic() {
        return this.endpoint && this.endpoint.includes('anthropic.com');
    }

    enable() {
        if (!this.apiKey || !this.endpoint) {
            console.warn('[AudioInterpreter] Need API key and endpoint');
            return false;
        }
        this.enabled = true;
        console.log('[AudioInterpreter] Enabled:', this.endpoint);
        return true;
    }

    disable() {
        this.enabled = false;
        if (this.bufferTimeout) {
            clearTimeout(this.bufferTimeout);
            this.bufferTimeout = null;
        }
        console.log('[AudioInterpreter] Disabled');
    }

    updateCurrentState(state) {
        if (state.geometry) this.currentState.geometry = state.geometry;
        if (state.sss) this.currentState.sss = state.sss;
        if (state.emotion) this.currentState.emotion = state.emotion;
    }

    feedText(text) {
        if (!this.enabled || !this.apiKey) return;
        if (!text || text.trim().length === 0) return;

        this.textBuffer.push(text.trim());

        if (this.bufferTimeout) {
            clearTimeout(this.bufferTimeout);
        }

        this.bufferTimeout = setTimeout(() => {
            this._processBuffer();
        }, 500);
    }

    async interpret(text) {
        if (!this.enabled || !this.apiKey) return null;

        const now = Date.now();
        if (now - this.lastInterpretTime < this.minIntervalMs) {
            return null;
        }

        if (this.pendingRequest) {
            this.pendingRequest = null;
        }

        this.lastInterpretTime = now;

        try {
            const action = await this._callLLM(text);
            if (action) {
                this.lastAction = action;
                this._emitAction(action);
            }
            return action;
        } catch (err) {
            console.error('[AudioInterpreter] Error:', err);
            if (this.onError) {
                this.onError(err);
            }
            return null;
        }
    }

    async _processBuffer() {
        if (this.textBuffer.length === 0) return;
        const text = this.textBuffer.join(' ');
        this.textBuffer = [];
        await this.interpret(text);
    }

    async _callLLM(text) {
        const requestId = Date.now();
        this.pendingRequest = requestId;

        let response;

        if (this._isAnthropic()) {
            // Anthropic API format
            response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey,
                    'anthropic-version': '2023-06-01',
                    'anthropic-dangerous-direct-browser-access': 'true'
                },
                body: JSON.stringify({
                    model: this.model || 'claude-3-haiku-20240307',
                    max_tokens: 100,
                    system: SYSTEM_PROMPT,
                    messages: [
                        { role: 'user', content: `Audio context: "${text}"` }
                    ]
                })
            });
        } else {
            // OpenAI-compatible API format (OpenAI, Grok, local models, etc.)
            response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model || 'gpt-4o-mini',
                    messages: [
                        { role: 'system', content: SYSTEM_PROMPT },
                        { role: 'user', content: `Audio context: "${text}"` }
                    ],
                    max_tokens: 100,
                    temperature: 0.3
                })
            });
        }

        if (this.pendingRequest !== requestId) {
            return null;
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `API error: ${response.status}`);
        }

        const data = await response.json();

        // Extract content based on API format
        let content;
        if (this._isAnthropic()) {
            const textBlock = data.content?.find(c => c.type === 'text');
            content = textBlock?.text;
        } else {
            content = data.choices?.[0]?.message?.content;
        }

        if (!content) {
            return null;
        }

        // Parse JSON response
        try {
            const action = JSON.parse(content.trim());
            return this._validateAction(action);
        } catch {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    const action = JSON.parse(jsonMatch[0]);
                    return this._validateAction(action);
                } catch {
                    console.warn('[AudioInterpreter] Failed to parse:', content);
                    return null;
                }
            }
            console.warn('[AudioInterpreter] Failed to parse:', content);
            return null;
        }
    }

    _validateAction(action) {
        if (!action || typeof action !== 'object') {
            return null;
        }

        const validated = {};

        if (action.geometry && ENGINE_VOCABULARY.geometries.includes(action.geometry)) {
            if (action.geometry !== this.currentState.geometry) {
                validated.geometry = action.geometry;
            }
        }

        if (action.sss && ENGINE_VOCABULARY.sssPresets.includes(action.sss)) {
            const targetGeometry = validated.geometry || this.currentState.geometry;
            const crystalTypes = ['crystal', 'rough', 'heart', 'star'];
            if (crystalTypes.includes(targetGeometry)) {
                if (action.sss !== this.currentState.sss) {
                    validated.sss = action.sss;
                }
            }
        }

        if (action.emotion && ENGINE_VOCABULARY.emotions.includes(action.emotion)) {
            if (action.emotion !== this.currentState.emotion) {
                validated.emotion = action.emotion;
            }
        }

        // Validate gesture - supports single string or array
        if (action.gesture) {
            const allGestures = [
                ...ENGINE_VOCABULARY.motionGestures,
                ...ENGINE_VOCABULARY.transformGestures,
                ...ENGINE_VOCABULARY.effectGestures
            ];

            if (Array.isArray(action.gesture)) {
                // Filter to only valid gestures
                const validGestures = action.gesture.filter(g => allGestures.includes(g));
                if (validGestures.length > 0) {
                    validated.gesture = validGestures.length === 1 ? validGestures[0] : validGestures;
                }
            } else if (allGestures.includes(action.gesture)) {
                validated.gesture = action.gesture;
            }
        }

        // Validate "then" gesture for sequential chaining
        if (action.then) {
            const allGestures = [
                ...ENGINE_VOCABULARY.motionGestures,
                ...ENGINE_VOCABULARY.transformGestures,
                ...ENGINE_VOCABULARY.effectGestures
            ];

            if (Array.isArray(action.then)) {
                const validGestures = action.then.filter(g => allGestures.includes(g));
                if (validGestures.length > 0) {
                    validated.then = validGestures.length === 1 ? validGestures[0] : validGestures;
                }
            } else if (allGestures.includes(action.then)) {
                validated.then = action.then;
            }
        }

        if (Object.keys(validated).length === 0) {
            return null;
        }

        return validated;
    }

    _emitAction(action) {
        if (action.geometry) this.currentState.geometry = action.geometry;
        if (action.sss) this.currentState.sss = action.sss;
        if (action.emotion) this.currentState.emotion = action.emotion;

        if (this.onAction) {
            this.onAction(action);
        }
    }

    static getVocabulary() {
        return { ...ENGINE_VOCABULARY };
    }
}

// Preset endpoints for convenience
export const LLM_ENDPOINTS = {
    anthropic: 'https://api.anthropic.com/v1/messages',
    openai: 'https://api.openai.com/v1/chat/completions',
    grok: 'https://api.x.ai/v1/chat/completions'
};

const audioInterpreter = new AudioInterpreter();
export { audioInterpreter, ENGINE_VOCABULARY };
export default audioInterpreter;
