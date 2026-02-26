/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - LLM Integration Templates
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview System prompt templates and response schemas for LLM integration
 * @author Emotive Engine Team
 * @module config/llm-templates
 *
 * @description
 * Ready-to-use templates for integrating Emotive Mascot with various LLM providers:
 * - Claude (Anthropic)
 * - GPT (OpenAI)
 * - Gemini (Google)
 * - Generic template for other providers
 *
 * Each template includes:
 * - Response schema
 * - System prompt with emotion/shape/gesture guidance
 * - Provider-specific configuration
 * - Example responses
 */

/**
 * Standard response schema compatible with all LLM providers
 */
export const RESPONSE_SCHEMA = {
    message: {
        type: 'string',
        required: true,
        description: 'The message content to display to the user',
    },
    emotion: {
        type: 'string',
        required: true,
        enum: [
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
        description: 'The emotion the mascot should express',
    },
    sentiment: {
        type: 'string',
        required: true,
        enum: ['positive', 'neutral', 'negative'],
        description: 'Overall sentiment of the interaction',
    },
    action: {
        type: 'string',
        required: true,
        enum: [
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
        description: 'The action context for gesture selection',
    },
    frustrationLevel: {
        type: 'number',
        required: true,
        min: 0,
        max: 100,
        description: 'Estimated user frustration level (0 = calm, 100 = very frustrated)',
    },
    shape: {
        type: 'string',
        required: false,
        enum: [
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
        description: 'Optional: Shape to morph the mascot into',
    },
    gesture: {
        type: 'string',
        required: false,
        enum: [
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
            'jump',
            'orbital',
            'hula',
            'scan',
            'twist',
            'burst',
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
        description: 'Optional: Specific gesture to perform',
    },
};

/**
 * Generate a system prompt for LLM integration
 * @param {Object} options - Configuration options
 * @param {string} options.domain - Domain context (e.g., 'retail checkout', 'customer service')
 * @param {string} options.personality - Mascot personality description
 * @param {string} options.brand - Brand name
 * @param {Array<string>} options.customEmotions - Additional emotions beyond defaults
 * @param {Array<string>} options.customActions - Additional actions beyond defaults
 * @returns {string} System prompt
 */
export function generateSystemPrompt(options = {}) {
    const {
        domain = 'general assistance',
        personality = 'friendly, empathetic, and helpful',
        brand = 'our service',
        customEmotions = [],
        customActions = [],
    } = options;

    const emotions = [
        'joy',
        'empathy',
        'calm',
        'excitement',
        'concern',
        'neutral',
        'triumph',
        'love',
        'curiosity',
        ...customEmotions,
    ];

    const actions = [
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
        ...customActions,
    ];

    return `You are a ${personality} AI assistant for ${brand}, providing ${domain}. You have an animated mascot companion that responds to the emotional tone and context of conversations.

**CRITICAL: You must ONLY respond with valid JSON. Do not include any text before or after the JSON object. Do not use markdown code blocks.**

## Response Format

Your response must be a valid JSON object with this exact structure:

{
  "message": "your helpful response here (2-3 sentences max)",
  "emotion": "${emotions.join('|')}",
  "sentiment": "positive|neutral|negative",
  "action": "${actions.join('|')}",
  "frustrationLevel": 0-100,
  "shape": "heart|star|sun|moon|circle|square|triangle (optional)",
  "gesture": "nod|wave|sparkle|point|reach|bounce|pulse|... (optional)"
}

## Guidelines

**Emotional Intelligence:**
- Detect emotional tone in user messages (frustration, confusion, satisfaction, joy, etc.)
- Respond with empathy when users are frustrated or confused
- Celebrate successes and positive moments
- Match your emotion to the user's needs

**Communication Style:**
- Be concise (max 2-3 sentences)
- Use warm, encouraging, ${personality} language
- Provide specific, actionable solutions
- Avoid generic responses

**Frustration Tracking:**
- 0-20: User is calm and satisfied
- 21-40: Minor confusion or concern
- 41-60: Moderate frustration
- 61-80: High frustration, needs urgent help
- 81-100: Critical frustration, escalate immediately

## Emotion Guidelines

- **joy**: User is happy, things are going well → Use for celebrations, positive outcomes
- **empathy**: User is struggling or frustrated → Use to show understanding and care
- **calm**: Neutral, instructional → Use for steady guidance
- **excitement**: High energy, anticipation → Use for big wins or new features
- **concern**: User has a problem → Use when addressing issues
- **neutral**: Default state → Use for routine interactions
- **triumph**: Achievement unlocked → Use for major successes
- **love**: Deep appreciation → Use when user expresses gratitude
- **curiosity**: Exploring, learning → Use when user asks questions

## Shape Guidelines (Optional - enhances emotional expression)

- **heart**: Empathy, love, appreciation, caring
- **star**: Achievements, excellence, celebration
- **sun**: Energy, positivity, brightness, enthusiasm
- **moon**: Calm, soothing, gentle, nighttime
- **circle**: Neutral, default, balanced
- **square**: Structured, organized, professional
- **triangle**: Directional, focused, pointing

Use shapes to reinforce emotions - e.g., "heart" + "empathy" for caring support.

## Gesture Guidelines (Optional - adds personality)

- **nod**: Confirming, agreeing, understanding
- **wave**: Greetings, farewells
- **sparkle**: Celebration, magic moments, success
- **point**: Directing attention, guidance
- **reach**: Offering help, extending support
- **bounce**: Excitement, enthusiasm, playfulness
- **pulse**: Emphasis, importance, attention
- **shake**: No, error, disagreement
- **shimmer**: Delight, wonder, positive surprise

## Action Guidelines

- **offer_help**: User needs assistance → Trigger helpful gestures
- **celebrate**: Success or achievement → Trigger celebratory animations
- **guide**: Providing instructions → Trigger directional gestures
- **reassure**: Calming concerns → Trigger comforting animations
- **greet**: Starting conversation → Trigger welcoming gestures
- **confirm**: Validating user action → Trigger affirmative gestures
- **deny**: Rejecting or correcting → Trigger negative gestures
- **emphasize**: Highlighting important info → Trigger attention gestures

## Example Responses

**User expresses frustration:**
{"message": "I totally understand how frustrating this is! Let me help you get this sorted out right now. What specifically isn't working?", "emotion": "empathy", "sentiment": "negative", "action": "offer_help", "frustrationLevel": 75, "shape": "heart", "gesture": "reach"}

**User asks for guidance:**
{"message": "Great question! Hold the barcode about 6 inches from the scanner until you hear a beep. The item will appear in your cart.", "emotion": "calm", "sentiment": "neutral", "action": "guide", "frustrationLevel": 20, "shape": "square", "gesture": "point"}

**User succeeds:**
{"message": "Perfect! You've got it now. Anything else I can help you with today?", "emotion": "joy", "sentiment": "positive", "action": "celebrate", "frustrationLevel": 0, "shape": "star", "gesture": "sparkle"}

**User greets:**
{"message": "Hello! I'm here to make your ${domain} experience smooth and easy. How can I help you today?", "emotion": "joy", "sentiment": "positive", "action": "greet", "frustrationLevel": 0, "shape": "sun", "gesture": "wave"}

**User says thanks:**
{"message": "You're so welcome! I'm thrilled I could help. Have a wonderful day!", "emotion": "love", "sentiment": "positive", "action": "celebrate", "frustrationLevel": 0, "shape": "heart", "gesture": "sparkle"}

Remember: Always respond with valid JSON only. No extra text, no markdown formatting.`;
}

/**
 * Claude (Anthropic) specific templates
 */
export const CLAUDE_TEMPLATE = {
    provider: 'anthropic',
    models: {
        haiku: 'claude-haiku-4-5', // Fast, cost-effective
        sonnet: 'claude-sonnet-4', // Balanced
        opus: 'claude-opus-4', // Most capable
    },
    recommendedModel: 'claude-haiku-4-5',
    config: {
        max_tokens: 200,
        temperature: 0.7,
        top_p: 1.0,
    },
    notes: 'Claude excels at following JSON schemas and emotional intelligence. Haiku is recommended for real-time interactions.',
    exampleCode: `
import Anthropic from '@anthropic-ai/sdk';
import { generateSystemPrompt } from 'emotive-mascot/llm-templates';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const systemPrompt = generateSystemPrompt({ domain: 'customer support' });

const response = await anthropic.messages.create({
  model: 'claude-haiku-4-5',
  max_tokens: 200,
  temperature: 0.7,
  system: systemPrompt,
  messages: [{ role: 'user', content: userMessage }]
});

const llmResponse = JSON.parse(response.content[0].text);
await mascot.handleLLMResponse(llmResponse);
    `.trim(),
};

/**
 * OpenAI GPT specific templates
 */
export const OPENAI_TEMPLATE = {
    provider: 'openai',
    models: {
        gpt4: 'gpt-4',
        gpt4Turbo: 'gpt-4-turbo-preview',
        gpt35Turbo: 'gpt-3.5-turbo',
    },
    recommendedModel: 'gpt-4-turbo-preview',
    config: {
        max_tokens: 200,
        temperature: 0.7,
        response_format: { type: 'json_object' }, // Force JSON mode
    },
    notes: 'Use response_format json_object to ensure valid JSON. GPT-4 Turbo recommended for emotional intelligence.',
    exampleCode: `
import OpenAI from 'openai';
import { generateSystemPrompt } from 'emotive-mascot/llm-templates';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const systemPrompt = generateSystemPrompt({ domain: 'customer support' });

const response = await openai.chat.completions.create({
  model: 'gpt-4-turbo-preview',
  max_tokens: 200,
  temperature: 0.7,
  response_format: { type: 'json_object' },
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage }
  ]
});

const llmResponse = JSON.parse(response.choices[0].message.content);
await mascot.handleLLMResponse(llmResponse);
    `.trim(),
};

/**
 * Google Gemini specific templates
 */
export const GEMINI_TEMPLATE = {
    provider: 'google',
    models: {
        pro: 'gemini-pro',
        ultra: 'gemini-ultra',
    },
    recommendedModel: 'gemini-pro',
    config: {
        maxOutputTokens: 200,
        temperature: 0.7,
        topP: 1.0,
    },
    notes: 'Gemini Pro is free for many use cases. Supports JSON mode via response schema.',
    exampleCode: `
import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateSystemPrompt } from 'emotive-mascot/llm-templates';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
const systemPrompt = generateSystemPrompt({ domain: 'customer support' });

const result = await model.generateContent([
  systemPrompt,
  userMessage
]);

const llmResponse = JSON.parse(result.response.text());
await mascot.handleLLMResponse(llmResponse);
    `.trim(),
};

/**
 * Generic template for other LLM providers (Ollama, Llama, etc.)
 */
export const GENERIC_TEMPLATE = {
    provider: 'generic',
    notes: 'Works with any LLM that can follow system prompts and return JSON',
    exampleCode: `
import { generateSystemPrompt } from 'emotive-mascot/llm-templates';

const systemPrompt = generateSystemPrompt({ domain: 'customer support' });

// Make request to your LLM API
const response = await fetch('YOUR_LLM_ENDPOINT', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    system: systemPrompt,
    message: userMessage,
    temperature: 0.7
  })
});

const data = await response.json();
const llmResponse = JSON.parse(data.response);
await mascot.handleLLMResponse(llmResponse);
    `.trim(),
};

/**
 * Export all templates
 */
export const LLM_TEMPLATES = {
    schema: RESPONSE_SCHEMA,
    generateSystemPrompt,
    providers: {
        claude: CLAUDE_TEMPLATE,
        openai: OPENAI_TEMPLATE,
        gemini: GEMINI_TEMPLATE,
        generic: GENERIC_TEMPLATE,
    },
};

export default LLM_TEMPLATES;
