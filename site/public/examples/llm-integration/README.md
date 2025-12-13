# LLM Integration Examples

This directory contains examples of integrating Emotive Engine mascot with Large
Language Model (LLM) providers. The mascot responds emotionally to AI
conversations with automatic emotion expression, shape morphing, and gesture
choreography.

## 🎯 What's Included

- **[claude-haiku.html](claude-haiku.html)** - Working example with Claude Haiku
  4.5 (Anthropic) ⭐⭐⭐ Advanced
- **[react-component.jsx](../react-component.jsx)** - React integration template
  ⭐⭐⭐⭐ Advanced
- **[vue-component.vue](../vue-component.vue)** - Vue integration template
  ⭐⭐⭐⭐ Advanced

## 🚀 Quick Start

### 1. Study the Working Example

Start with [claude-haiku.html](claude-haiku.html) - it's a complete working demo
that shows:

- Two-panel chat interface (chat + mascot)
- Demo responses with sentiment analysis
- Real-time mascot reactions to conversation
- How to map sentiment → emotion → shape → gesture

### 2. LLM Response Format

Your LLM should analyze the conversation and return JSON like this:

```json
{
    "message": "I'd be happy to help with that!",
    "emotion": "joy",
    "sentiment": "positive",
    "shape": "star",
    "gesture": "bounce"
}
```

### 3. Update Mascot Based on Response

```javascript
// After getting LLM response, update mascot
if (mascot) {
    // Set emotion from sentiment
    mascot.setEmotion(data.emotion);

    // Morph shape if specified (with delay for smooth transition)
    if (data.shape) {
        setTimeout(() => mascot.morphTo(data.shape), 300);
    }

    // Trigger gesture if specified
    if (data.gesture) {
        setTimeout(() => mascot.express(data.gesture), 600);
    }
}
```

## 📋 Valid Values (From Real API)

### Emotions

**From working examples:** `joy`, `calm`, `excited`, `sadness`, `love`,
`focused`, `empathy`, `neutral`

### Shapes

**From working examples:** `circle`, `heart`, `star`, `sun`, `moon`

### Gestures

**From working examples:** `bounce`, `spin`, `pulse`, `glow`, `breathe`,
`expand`

## 🎨 Integration Pattern

### Complete Example (from claude-haiku.html)

```javascript
// STEP 1: Initialize mascot
const mascot = new EmotiveMascot({
    canvasId: 'mascot-canvas',
    targetFPS: 60,
    enableAudio: false,
    defaultEmotion: 'joy',
    enableGazeTracking: false,
    enableIdleBehaviors: true,
});

await mascot.init(canvas);

mascot.setBackdrop({
    enabled: true,
    radius: 3.5,
    intensity: 0.9,
    blendMode: 'normal',
    falloff: 'smooth',
    edgeSoftness: 0.95,
    coreTransparency: 0.25,
    responsive: true,
});

mascot.start();

// STEP 2: Send user message to LLM (server-side)
// Your backend should:
// 1. Call Anthropic/OpenAI/Gemini API
// 2. Analyze sentiment and context
// 3. Return structured response

// STEP 3: Update mascot based on response
function handleLLMResponse(data) {
    // Update emotion
    mascot.setEmotion(data.emotion);
    document.getElementById('current-emotion').textContent =
        data.emotion.charAt(0).toUpperCase() + data.emotion.slice(1);

    // Morph shape if specified
    if (data.shape) {
        setTimeout(() => mascot.morphTo(data.shape), 300);
    }

    // Trigger gesture if specified
    if (data.gesture) {
        setTimeout(() => mascot.express(data.gesture), 600);
    }
}
```

## 📊 Provider-Specific Guides

### Claude (Anthropic) - Recommended

**Why Claude?** Excellent at following instructions and emotional intelligence.
Haiku is fast and cost-effective.

```javascript
// Backend API endpoint (Node.js example)
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

app.post('/api/chat', async (req, res) => {
    const { message } = req.body;

    const response = await anthropic.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 200,
        temperature: 0.7,
        system: `You are a helpful assistant. Analyze the user's message and respond with JSON:
{
    "message": "Your response text",
    "emotion": "joy|calm|excited|sadness|love|focused|empathy|neutral",
    "sentiment": "positive|neutral|negative",
    "shape": "circle|heart|star|sun|moon (optional)",
    "gesture": "bounce|spin|pulse|glow|breathe|expand (optional)"
}

Choose emotion based on context:
- joy: User is happy, things going well
- calm: Neutral, instructional
- excited: High energy, enthusiastic
- sadness: User struggling or upset
- love: Deep appreciation
- focused: Concentrated task
- empathy: User needs support
- neutral: Default interactions

Return ONLY valid JSON, no markdown.`,
        messages: [{ role: 'user', content: message }],
    });

    const llmResponse = JSON.parse(response.content[0].text);
    res.json(llmResponse);
});
```

### OpenAI GPT

```javascript
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    max_tokens: 200,
    temperature: 0.7,
    response_format: { type: 'json_object' },
    messages: [
        {
            role: 'system',
            content: 'Analyze sentiment and respond with JSON...',
        },
        { role: 'user', content: userMessage },
    ],
});

const llmResponse = JSON.parse(response.choices[0].message.content);
```

### Google Gemini

```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

const result = await model.generateContent([systemPrompt, userMessage]);
const llmResponse = JSON.parse(result.response.text());
```

## 🎭 Emotion Guidelines for LLMs

### When to use each emotion:

- **joy** - User is happy, things are going well, positive outcomes
- **calm** - Neutral moments, instructional content, steady state
- **excited** - High energy, anticipation, enthusiasm
- **sadness** - User struggling, disappointed, or upset
- **love** - Deep appreciation, gratitude, caring moments
- **focused** - Concentrated task, problem-solving, attention
- **empathy** - User needs support, understanding, compassion
- **neutral** - Default state for routine interactions

## 🔧 Shape Guidelines for LLMs

- **heart** - Love, empathy, caring, appreciation
- **star** - Joy, achievements, excellence, celebration
- **sun** - Excited, energy, positivity, brightness
- **moon** - Calm, soothing, gentle, peaceful
- **circle** - Neutral, balanced, default state

## 🎯 Demo Response Examples

See [claude-haiku.html](claude-haiku.html) for complete demo responses:

```javascript
// Example: User asks for help
{
    message: "I'd be happy to help you with that! What would you like to know?",
    emotion: 'joy',
    sentiment: 'positive',
    shape: 'star',
    gesture: 'bounce'
}

// Example: User is frustrated
{
    message: "I understand this is frustrating. Let's work through it together.",
    emotion: 'empathy',
    sentiment: 'neutral',
    shape: 'heart',
    gesture: 'pulse'
}

// Example: User achieves something
{
    message: "Fantastic work! You've successfully completed the task!",
    emotion: 'excited',
    sentiment: 'positive',
    shape: 'sun',
    gesture: 'spin'
}
```

## 💡 Best Practices

### 1. Timing is Critical

Use delays between emotion, shape, and gesture for smooth transitions:

```javascript
mascot.setEmotion(data.emotion); // Immediate
setTimeout(() => mascot.morphTo(shape), 300); // After 300ms
setTimeout(() => mascot.express(gesture), 600); // After 600ms
```

This creates a natural progression instead of jarring all-at-once changes.

### 2. Keep Messages Concise

LLM messages should be 2-3 sentences max for best UX. Long messages distract
from mascot animations.

### 3. Match Emotion + Shape Combinations

Create memorable associations:

- **Heart + Empathy** = Caring support
- **Star + Joy** = Happy celebration
- **Sun + Excited** = Energetic enthusiasm
- **Moon + Calm** = Soothing peace
- **Circle + Neutral** = Balanced default

### 4. Test with Demo Mode First

Use demo responses (like in claude-haiku.html) to test your UI before connecting
to real LLM API.

## 🔍 Debugging

### Mascot not responding

Check that you're calling the API methods in correct order:

```javascript
mascot.setEmotion(emotion); // ✅ Real API
setTimeout(() => mascot.morphTo(shape), 300); // ✅ Real API
setTimeout(() => mascot.express(gesture), 600); // ✅ Real API
```

### Invalid emotion/shape/gesture

Check the valid values section above. Only use emotions, shapes, and gestures
that exist in the real API.

### JSON parsing errors

Ensure your system prompt emphasizes returning ONLY JSON, no markdown formatting
or code blocks.

## 📖 Complete Working Example

See **[claude-haiku.html](claude-haiku.html)** for:

- ✅ Two-panel layout (chat + mascot)
- ✅ Demo fallback responses (works without API key)
- ✅ Example prompts for quick testing
- ✅ Real-time mascot reactions
- ✅ Proper timing between emotion/shape/gesture
- ✅ Clean, educational code with STEP comments

**Complexity:** ⭐⭐⭐ Advanced - Shows real LLM integration patterns

## 🚀 Framework Integration

### React

See **[react-component.jsx](../react-component.jsx)** for template showing:

- Component lifecycle management
- UMD bundle loading
- Real API method usage
- Event listener setup

⚠️ **Note:** This is a TEMPLATE/GUIDE, not executable code. Study working HTML
examples first.

### Vue

See **[vue-component.vue](../vue-component.vue)** for template showing:

- Vue lifecycle hooks (mounted/beforeUnmount)
- Reactive mascot updates
- Real API method usage
- Event emitting to parent

⚠️ **Note:** This is a TEMPLATE/GUIDE, not executable code. Study working HTML
examples first.

## 🆘 Common Mistakes

### ❌ Wrong API methods

```javascript
// FAKE - These don't exist!
mascot.handleLLMResponse(response);
mascot.configureLLMHandler(config);
mascot.getLLMPromptTemplate(options);
```

### ✅ Real API methods

```javascript
// REAL - Use these!
mascot.setEmotion(emotion);
mascot.morphTo(shape);
mascot.express(gesture);
mascot.on(event, handler);
```

### ❌ Wrong emotions

```javascript
// FAKE - These don't exist!
('curiosity', 'excitement', 'concern', 'triumph', 'contemplation');
```

### ✅ Real emotions

```javascript
// REAL - Use these!
('joy', 'calm', 'excited', 'sadness', 'love', 'focused', 'empathy', 'neutral');
```

## 📚 Additional Resources

- [Main README](../../README.md) - Project overview
- [API Documentation](../../API.md) - Complete API reference (if available)
- [hello-world.html](../hello-world.html) - Simplest working example
- [basic-usage.html](../basic-usage.html) - All core features

---

**Made with care by the Emotive Engine community**

**Start with [claude-haiku.html](claude-haiku.html) - it's a complete, working
example!**
