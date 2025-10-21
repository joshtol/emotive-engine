# LLM Integration Examples

This directory contains examples of integrating Emotive Mascot with various
Large Language Model (LLM) providers. The mascot responds emotionally to AI
conversations with automatic shape morphing, gesture choreography, and emotion
expression.

## 🎯 What's Included

- **claude-haiku.html** - Integration with Claude Haiku 4.5 (Anthropic)
- **Backend API examples** - Server-side code for different providers
- **System prompts** - Ready-to-use prompts for each provider

## 🚀 Quick Start

### 1. Basic Integration (3 lines of code)

```javascript
import EmotiveMascot from 'emotive-mascot';

const mascot = new EmotiveMascot({ canvasId: 'canvas' });
mascot.start();

// Get LLM response, then...
await mascot.handleLLMResponse(llmResponse);
```

### 2. LLM Response Format

Your LLM should return JSON with this structure:

```json
{
    "message": "I'd be happy to help with that!",
    "emotion": "joy",
    "sentiment": "positive",
    "action": "offer_help",
    "frustrationLevel": 20,
    "shape": "heart",
    "gesture": "reach"
}
```

### 3. Get System Prompt

```javascript
const prompt = EmotiveMascot.getLLMPromptTemplate({
    domain: 'customer support',
    personality: 'friendly and helpful',
    brand: 'Acme Corp',
});
```

## 📋 Provider-Specific Guides

### Claude (Anthropic) - Recommended

**Why Claude?** Excellent at following JSON schemas and emotional intelligence.
Haiku is fast and cost-effective.

```javascript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

const systemPrompt = EmotiveMascot.getLLMPromptTemplate({
    domain: 'retail checkout',
});

const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 200,
    temperature: 0.7,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
});

const llmResponse = JSON.parse(response.content[0].text);
await mascot.handleLLMResponse(llmResponse);
```

### OpenAI GPT

**Why GPT?** Great general-purpose model with JSON mode support.

```javascript
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const systemPrompt = EmotiveMascot.getLLMPromptTemplate({
    domain: 'customer support',
});

const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    max_tokens: 200,
    temperature: 0.7,
    response_format: { type: 'json_object' }, // Force JSON
    messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
    ],
});

const llmResponse = JSON.parse(response.choices[0].message.content);
await mascot.handleLLMResponse(llmResponse);
```

### Google Gemini

**Why Gemini?** Free tier available, good for experimentation.

```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

const systemPrompt = EmotiveMascot.getLLMPromptTemplate({
    domain: 'education',
});

const result = await model.generateContent([systemPrompt, userMessage]);

const llmResponse = JSON.parse(result.response.text());
await mascot.handleLLMResponse(llmResponse);
```

## 🎨 Customization

### Custom Emotion-to-Shape Mappings

```javascript
mascot.configureLLMHandler({
    emotionToShapeMap: {
        joy: 'sun', // Override default (star)
        empathy: 'moon', // Override default (heart)
        triumph: 'star', // Keep default
    },
    gestureIntensity: 0.9,
});
```

### Custom Action-to-Gesture Mappings

```javascript
mascot.configureLLMHandler({
    actionToGestureMap: {
        offer_help: 'wave', // Override default (reach)
        celebrate: 'bounce', // Override default (sparkle)
        guide: 'point', // Keep default
    },
});
```

### Disable Auto-Morphing

```javascript
mascot.configureLLMHandler({
    autoMorphShapes: false, // Disable shape morphing
    autoExpressGestures: true, // Keep gestures
});
```

## 📊 Response Schema Reference

### Required Fields

| Field              | Type   | Options                                                                                                         | Description                |
| ------------------ | ------ | --------------------------------------------------------------------------------------------------------------- | -------------------------- |
| `message`          | string | -                                                                                                               | Message to display to user |
| `emotion`          | string | joy, empathy, calm, excitement, concern, neutral, triumph, love, curiosity                                      | Mascot emotion             |
| `sentiment`        | string | positive, neutral, negative                                                                                     | Overall sentiment          |
| `action`           | string | offer_help, celebrate, guide, reassure, greet, confirm, deny, emphasize, question, think, listen, respond, none | Action context             |
| `frustrationLevel` | number | 0-100                                                                                                           | User frustration level     |

### Optional Fields

| Field     | Type   | Options                                               | Description                 |
| --------- | ------ | ----------------------------------------------------- | --------------------------- |
| `shape`   | string | circle, heart, star, sun, moon, square, triangle      | Shape to morph into         |
| `gesture` | string | bounce, pulse, nod, wave, sparkle, point, reach, etc. | Specific gesture to perform |

### Get Complete Lists Programmatically

```javascript
const emotions = EmotiveMascot.getLLMEmotions();
const actions = EmotiveMascot.getLLMActions();
const shapes = EmotiveMascot.getLLMShapes();
const gestures = EmotiveMascot.getLLMGestures();
```

## 🎭 Emotion Guidelines for LLMs

### When to use each emotion:

- **joy** - User is happy, things are going well
- **empathy** - User is struggling or frustrated
- **calm** - Neutral, instructional moments
- **excitement** - High energy, anticipation
- **concern** - User has a problem to address
- **neutral** - Default, routine interactions
- **triumph** - Major achievement unlocked
- **love** - Deep appreciation, gratitude
- **curiosity** - Exploring, learning, asking

## 🔧 Shape Guidelines for LLMs

- **heart** - Empathy, love, caring, appreciation
- **star** - Achievements, excellence, celebration
- **sun** - Energy, positivity, brightness
- **moon** - Calm, soothing, gentle
- **circle** - Neutral, balanced, default
- **square** - Structured, organized, professional
- **triangle** - Directional, focused, pointing

## 🎯 Action Guidelines for LLMs

- **offer_help** - User needs assistance
- **celebrate** - Success or achievement
- **guide** - Providing instructions
- **reassure** - Calming concerns
- **greet** - Starting conversation
- **confirm** - Validating user action
- **deny** - Rejecting or correcting
- **emphasize** - Highlighting important info
- **question** - Asking for clarification
- **think** - Processing information
- **listen** - Actively listening
- **respond** - General response

## 💡 Best Practices

### 1. Frustration Tracking

Track user frustration throughout the conversation:

```javascript
// 0-20: Calm and satisfied
// 21-40: Minor confusion
// 41-60: Moderate frustration
// 61-80: High frustration
// 81-100: Critical - escalate immediately
```

### 2. Emotion + Shape Combinations

Create memorable associations:

- **Heart + Empathy** = Caring support
- **Star + Triumph** = Achievement unlocked
- **Sun + Excitement** = Energetic help
- **Moon + Calm** = Soothing reassurance

### 3. Keep Messages Concise

LLM messages should be 2-3 sentences max for best UX.

### 4. Use Semantic Performances

The mascot has 44 built-in semantic performances that chain emotions, shapes,
and gestures together. They're automatically used when available.

## 🔍 Debugging

### Validate Response

```javascript
const schema = mascot.getLLMResponseSchema();
console.log('Expected schema:', schema);
```

### Check Handler Configuration

```javascript
mascot.configureLLMHandler({
    autoMorphShapes: true,
    autoExpressGestures: true,
});
```

### Test with Demo Responses

```javascript
const testResponse = {
    message: 'Test message',
    emotion: 'joy',
    sentiment: 'positive',
    action: 'celebrate',
    frustrationLevel: 0,
    shape: 'star',
    gesture: 'sparkle',
};

await mascot.handleLLMResponse(testResponse);
```

## 📖 Complete Example

See `claude-haiku.html` for a complete working example with:

- Chat interface
- Claude Haiku integration
- Demo fallback responses
- Example prompts
- Real-time mascot reactions

## 🚀 Next Steps

1. Copy `claude-haiku.html` and customize for your use case
2. Set up your LLM API endpoint (see provider guides above)
3. Customize system prompt with `getLLMPromptTemplate()`
4. Configure handler with `configureLLMHandler()`
5. Call `handleLLMResponse()` with each AI response

## 🆘 Troubleshooting

### Mascot not responding

Check that you're calling `await mascot.handleLLMResponse(response)` after
getting the LLM response.

### Invalid JSON errors

Ensure your system prompt emphasizes returning ONLY JSON, no markdown.

### Shapes not morphing

Enable in configuration:

```javascript
mascot.configureLLMHandler({ autoMorphShapes: true });
```

### Gestures not playing

Enable in configuration:

```javascript
mascot.configureLLMHandler({ autoExpressGestures: true });
```

## 📚 Additional Resources

- [Main API Documentation](../../API.md)
- [Semantic Performance System](../../API.md#semantic-performance-system)
- [Shape Morphing Guide](../../API.md#shape-morphing)
- [Gesture System](../../API.md#gesture-system)

---

**Made with ❤️ by the Emotive Engine Team**
