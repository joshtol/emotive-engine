# Emotive Engine API Documentation

## Table of Contents

- [Constructor](#constructor)
- [Core Methods](#core-methods)
- [LLM Integration](#llm-integration) 🤖 **NEW in v4.0**
- [Semantic Performance System](#semantic-performance-system) ⭐ **NEW in v3.0**
- [Emotion Control](#emotion-control)
- [Gesture System](#gesture-system)
- [Breathing API](#breathing-api)
- [Position and Scaling API](#position-and-scaling-api)
- [Events](#events)
- [Configuration Options](#configuration-options)

## Constructor

### `new EmotiveMascot(options)`

Creates a new Emotive Engine instance.

```javascript
const mascot = new EmotiveMascot({
    canvasId: 'emotive-canvas',
    emotion: 'neutral',
    particleCount: 100,
});
```

## Core Methods

### `start()`

Starts the animation loop.

```javascript
mascot.start();
```

### `stop()`

Stops the animation loop.

```javascript
mascot.stop();
```

### `destroy()`

Cleans up resources and removes event listeners.

```javascript
mascot.destroy();
```

### `resize(width, height)`

Resizes the canvas and adjusts rendering.

```javascript
mascot.resize(800, 600);
```

## LLM Integration

> 🤖 **NEW in v4.0** - Seamlessly integrate with Claude, GPT, Gemini, and other
> LLMs

The LLM Integration API enables your mascot to automatically respond to AI
conversations with choreographed emotions, shape morphing, and gestures. Perfect
for chatbots, AI assistants, and conversational interfaces.

### Quick Start (3 lines)

```javascript
// 1. Get system prompt for your LLM
const prompt = EmotiveMascot.getLLMPromptTemplate({
    domain: 'customer support',
});

// 2. Get LLM response (using Claude, GPT, Gemini, etc.)
const llmResponse = await yourLLM.chat(prompt, userMessage);

// 3. Let mascot respond emotionally
await mascot.handleLLMResponse(llmResponse);
```

### `handleLLMResponse(response, options)`

Process an LLM response and automatically choreograph mascot reactions.

**Parameters:**

- `response` (object): Structured LLM response
    - `message` (string): Message content
    - `emotion` (string): Emotion to express (joy, empathy, calm, etc.)
    - `sentiment` (string): positive | neutral | negative
    - `action` (string): Action context (offer_help, celebrate, guide, etc.)
    - `frustrationLevel` (number): User frustration level (0-100)
    - `shape` (string, optional): Shape to morph to (heart, star, sun, etc.)
    - `gesture` (string, optional): Gesture to perform (nod, wave, sparkle,
      etc.)
- `options` (object, optional): Override calculated intensity, skip validation

**Returns:** `Promise<EmotiveMascot>`

```javascript
const llmResponse = {
    message: "I'd be happy to help with that!",
    emotion: 'joy',
    sentiment: 'positive',
    action: 'offer_help',
    frustrationLevel: 20,
    shape: 'heart',
    gesture: 'reach',
};

await mascot.handleLLMResponse(llmResponse);
```

### `configureLLMHandler(config)`

Configure LLM response handling behavior.

```javascript
mascot.configureLLMHandler({
    // Shape morphing
    autoMorphShapes: true,
    morphDuration: 1000,

    // Gesture choreography
    autoExpressGestures: true,
    gestureTiming: 300, // Delay before gesture (ms)
    gestureIntensity: 0.8,

    // Custom mappings
    emotionToShapeMap: {
        joy: 'sun', // Override default (star)
        empathy: 'moon', // Override default (heart)
    },
    actionToGestureMap: {
        offer_help: 'wave', // Override default (reach)
        celebrate: 'bounce', // Override default (sparkle)
    },
});
```

### `static getLLMPromptTemplate(options)`

Get a system prompt template for your LLM that instructs it to return structured
responses.

**Parameters:**

- `options.domain` (string): Domain context (e.g., 'retail checkout', 'customer
  support')
- `options.personality` (string): Mascot personality
- `options.brand` (string): Brand name

**Returns:** System prompt string

```javascript
const prompt = EmotiveMascot.getLLMPromptTemplate({
    domain: 'retail checkout',
    personality: 'friendly and helpful',
    brand: 'SmartMart',
});

// Use with any LLM provider
const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5',
    system: prompt,
    messages: [{ role: 'user', content: userMessage }],
});
```

### LLM Response Schema

Your LLM should return JSON with this structure:

```typescript
{
  // Required fields
  message: string,              // Message to display
  emotion: string,              // joy | empathy | calm | excitement | concern | neutral | triumph | love | curiosity
  sentiment: string,            // positive | neutral | negative
  action: string,               // offer_help | celebrate | guide | reassure | greet | confirm | deny | emphasize | question | think | listen | respond | none
  frustrationLevel: number,     // 0-100

  // Optional fields
  shape?: string,               // circle | heart | star | sun | moon | eclipse | square | triangle
  gesture?: string              // bounce | pulse | nod | wave | sparkle | point | reach | shake | ... (40+ gestures)
}
```

### Available Options

Get valid values programmatically:

```javascript
const emotions = EmotiveMascot.getLLMEmotions();
// ['joy', 'empathy', 'calm', 'excitement', 'concern', 'neutral', 'triumph', 'love', 'curiosity']

const actions = EmotiveMascot.getLLMActions();
// ['offer_help', 'celebrate', 'guide', 'reassure', 'greet', 'confirm', 'deny', ...]

const shapes = EmotiveMascot.getLLMShapes();
// ['circle', 'heart', 'star', 'sun', 'moon', 'eclipse', 'square', 'triangle', ...]

const gestures = EmotiveMascot.getLLMGestures();
// ['bounce', 'pulse', 'nod', 'wave', 'sparkle', 'point', 'reach', ...]
```

### Provider-Specific Examples

#### Claude (Anthropic) - Recommended

```javascript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const systemPrompt = EmotiveMascot.getLLMPromptTemplate({ domain: 'support' });

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

#### OpenAI GPT

```javascript
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const systemPrompt = EmotiveMascot.getLLMPromptTemplate({ domain: 'support' });

const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    max_tokens: 200,
    temperature: 0.7,
    response_format: { type: 'json_object' },
    messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
    ],
});

const llmResponse = JSON.parse(response.choices[0].message.content);
await mascot.handleLLMResponse(llmResponse);
```

#### Google Gemini

```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
const systemPrompt = EmotiveMascot.getLLMPromptTemplate({ domain: 'support' });

const result = await model.generateContent([systemPrompt, userMessage]);
const llmResponse = JSON.parse(result.response.text());
await mascot.handleLLMResponse(llmResponse);
```

### Emotion + Shape Combinations

Create memorable emotional expressions:

| Emotion    | Default Shape | Use Case                        |
| ---------- | ------------- | ------------------------------- |
| joy        | star          | Celebrations, positive outcomes |
| empathy    | heart         | Caring support, understanding   |
| excitement | sun           | High energy moments             |
| calm       | moon          | Soothing, gentle guidance       |
| triumph    | star          | Achievements unlocked           |
| love       | heart         | Gratitude, deep appreciation    |

### Action Guidelines

| Action     | Default Gesture | When to Use                 |
| ---------- | --------------- | --------------------------- |
| offer_help | reach           | User needs assistance       |
| celebrate  | sparkle         | Success or achievement      |
| guide      | point           | Providing instructions      |
| reassure   | nod             | Calming concerns            |
| greet      | wave            | Starting conversation       |
| confirm    | nod             | Validating user action      |
| deny       | shake           | Correcting or rejecting     |
| emphasize  | pulse           | Highlighting important info |

### Best Practices

1. **Track Frustration** - Increase intensity for frustrated users
    - 0-20: Calm and satisfied
    - 21-40: Minor confusion
    - 41-60: Moderate frustration
    - 61-80: High frustration - urgent help needed
    - 81-100: Critical - escalate immediately

2. **Keep Messages Concise** - 2-3 sentences max

3. **Use Semantic Performances** - Automatically uses choreographed performances
   when available

4. **Combine Shape + Emotion** - Heart + empathy, Star + triumph, etc.

### Complete Example

See [examples/llm-integration/](../examples/llm-integration/) for complete
working examples with:

- Claude Haiku integration
- OpenAI GPT integration
- Google Gemini integration
- Chat interface
- Demo fallback responses

## Semantic Performance System

> ⭐ **NEW in v3.0** - Express AI intent through choreographed animation
> sequences

The Semantic Performance System enables context-aware, choreographed animations
that translate AI intent into expressive performances without manual timing and
coordination.

### Quick Example

```javascript
// Old approach: 50+ lines of manual choreography
const intensity = frustration > 60 ? 1.0 : 0.7;
mascot.setEmotion('empathy', intensity);
setTimeout(() => mascot.express('nod'), 200);
setTimeout(() => mascot.express('point'), 600);

// New approach: 1 line with semantic API
await mascot.perform('offering_help', {
    context: { frustration: 70, urgency: 'high' },
});
```

### `perform(semanticAction, options)`

Execute a semantic performance with context-aware intensity.

**Parameters:**

- `semanticAction` (string): Performance name (see
  [Performance Catalog](#performance-catalog))
- `options` (object, optional):
    - `context` (object): Context for intensity calculation
        - `frustration` (number, 0-100): User frustration level
        - `urgency` (string): `'low'` | `'medium'` | `'high'`
        - `magnitude` (string): `'small'` | `'moderate'` | `'major'` | `'epic'`
    - `intensity` (number, 0-1): Override calculated intensity
    - `delay` (number): Override default delay in milliseconds

**Returns:** `Promise<EmotiveMascot>`

```javascript
// Basic performance
await mascot.perform('greeting');

// With context for automatic intensity adjustment
await mascot.perform('celebrating', {
    context: {
        frustration: 0,
        urgency: 'low',
        magnitude: 'epic',
    },
});

// Frustrated user needs help
await mascot.perform('offering_urgent_help', {
    context: { frustration: 85, urgency: 'high' },
});
```

### `updateContext(updates)`

Update conversation context for context-aware performances.

```javascript
// Set frustration level (0-100)
mascot.updateContext({ frustration: 60 });

// Set urgency (affects intensity by ±0.2)
mascot.updateContext({ urgency: 'high' });

// Set magnitude (scales intensity)
mascot.updateContext({ magnitude: 'epic' });

// Multiple updates at once
mascot.updateContext({
    frustration: 40,
    urgency: 'medium',
    magnitude: 'moderate',
});
```

### `getContext()`

Get current conversation context.

```javascript
const context = mascot.getContext();
console.log(context.frustration); // 60
console.log(context.urgency); // 'high'
console.log(context.magnitude); // 'moderate'
```

### `incrementFrustration(amount)` / `decrementFrustration(amount)` / `resetFrustration()`

Manage user frustration level (automatically decays over time).

```javascript
// On error or retry
mascot.incrementFrustration(10);

// On successful action
mascot.decrementFrustration(15);

// On problem resolved
mascot.resetFrustration();
```

### `getAvailablePerformances()`

Get all 44 built-in performance names.

```javascript
const performances = mascot.getAvailablePerformances();
// ['listening', 'thinking', 'celebrating', 'empathizing', ...]
```

### `registerPerformance(name, definition)`

Register a custom performance.

```javascript
mascot.registerPerformance('welcome_back', {
    name: 'welcome_back',
    category: 'custom',
    emotion: 'joy',
    gesture: 'wave',
    baseIntensity: 0.75,
    description: 'Welcome back returning users',
});

await mascot.perform('welcome_back');
```

### Performance Catalog

**Conversational** (16 performances):

- `listening`, `thinking`, `acknowledging`, `guiding`
- `empathizing`, `celebrating`, `celebrating_epic`, `reassuring`
- `offering_help`, `offering_urgent_help`, `apologizing`, `encouraging`
- `greeting`, `responding_positive`, `responding_neutral`, `responding_negative`

**Feedback** (13 performances):

- `success_minor`, `success_moderate`, `success_major`, `success_epic`
- `error_minor`, `error_moderate`, `error_major`, `error_critical`
- `warning`, `info`
- `progress_start`, `progress_ongoing`, `progress_complete`

**State** (15 performances):

- `idle`, `ready`, `waiting`, `processing`, `scanning`, `analyzing`
- `completing`, `completed`, `reviewing`, `monitoring`
- `paused`, `loading`, `connecting`, `active`

📖 **[Full Documentation →](./docs/api/semantic-performances.md)**

## Emotion Control

### `setEmotion(emotionName, optionsOrDuration, timestamp)`

Sets the current emotional state with optional transition duration.

**Parameters:**

- `emotionName` (string): Name of the emotion
- `optionsOrDuration` (string|number|Object, optional):
    - **string**: Undertone name (e.g., 'warm', 'cold')
    - **number**: Transition duration in milliseconds (default: 500)
    - **Object**: Options object with `{undertone: string, duration: number}`
- `timestamp` (number, optional): Timestamp for recording mode

**Available Emotions:**

- `neutral`, `joy`, `sadness`, `anger`, `fear`, `surprise`, `disgust`
- `love`, `curiosity`, `excitement`, `contemplation`, `determination`
- `serenity`, `pride`, `embarrassment`, `amusement`, `awe`
- `satisfaction`, `sympathy`, `triumph`, `speaking`, `suspicion`

**Examples:**

```javascript
// Basic emotion change with default 500ms transition
mascot.setEmotion('joy');

// Instant emotion change (0ms transition)
// Useful for preventing particle artifacts when rapidly switching states
mascot.setEmotion('joy', 0);

// Emotion with undertone
mascot.setEmotion('joy', 'energetic');

// Emotion with custom transition duration
mascot.setEmotion('joy', 1000); // 1 second transition

// Emotion with undertone and duration via options object
mascot.setEmotion('joy', { undertone: 'energetic', duration: 0 });
```

**Note on Instant Transitions:** Use `duration: 0` for instant emotion changes
when rapidly switching between states (e.g., card carousels, quick
interactions). This prevents particle systems from the previous emotion state
from creating visual artifacts during the transition.

### `addUndertone(undertone)`

Adds an emotional undertone that modifies the primary emotion.

**Available Undertones:**

- `calm`, `energetic`, `melancholic`, `hopeful`, `anxious`, `confident`

```javascript
mascot.addUndertone('energetic');
```

### `blendEmotions(emotions, weights)`

Blends multiple emotions together.

```javascript
mascot.blendEmotions(['joy', 'excitement', 'curiosity'], [0.5, 0.3, 0.2]);
```

## Gesture System

### `addGesture(gestureName, options)`

Triggers a gesture animation.

**Available Gestures:**

- `wave`, `nod`, `shake`, `bounce`, `pulse`, `expand`, `contract`
- `spin`, `wobble`, `blink`, `look_left`, `look_right`, `look_up`, `look_down`

```javascript
mascot.addGesture('wave', {
    duration: 1000,
    intensity: 0.8,
});
```

### `queueGestures(gestures)`

Queues multiple gestures to play in sequence.

```javascript
mascot.queueGestures([
    { name: 'nod', duration: 500 },
    { name: 'wave', duration: 1000 },
    { name: 'pulse', duration: 500 },
]);
```

## Breathing API

### `setBreathePattern(inhale, hold1, exhale, hold2)`

Sets a custom breathing pattern.

**Parameters:**

- `inhale` (number): Inhale duration in ms
- `hold1` (number): Hold after inhale in ms
- `exhale` (number): Exhale duration in ms
- `hold2` (number): Hold after exhale in ms

```javascript
mascot.setBreathePattern(4000, 2000, 4000, 2000);
```

### `setOrbScale(scale, duration, easing)`

Sets the orb scale for breathing effects.

**Parameters:**

- `scale` (number): Target scale (1 = normal)
- `duration` (number): Transition duration in ms
- `easing` (string): Easing function ('linear', 'ease-in', 'ease-out',
  'ease-in-out')

```javascript
mascot.setOrbScale(1.5, 2000, 'ease-in-out');
```

### `breathe(type)`

Starts a predefined breathing pattern.

**Preset Types:**

- `calm`: 4-2-4-2 pattern
- `anxious`: 2-0-2-1 pattern
- `meditative`: 5-3-5-3 pattern
- `deep`: 6-4-6-2 pattern
- `sleep`: 4-1-6-1 pattern

```javascript
mascot.breathe('meditative');
```

### `stopBreathing()`

Stops the current breathing animation.

```javascript
mascot.stopBreathing();
```

## Position and Scaling API

### `setPosition(x, y, z)`

Sets the mascot's position offset from the viewport center.

**Parameters:**

- `x` (number): X offset from center in pixels
- `y` (number): Y offset from center in pixels
- `z` (number, optional): Z offset for pseudo-3D scaling (default: 0)

```javascript
// Position mascot 100px right, 50px down from center
mascot.setPosition(100, 50);

// Position with Z-depth scaling
mascot.setPosition(100, 50, -200); // Farther (smaller)
mascot.setPosition(100, 50, 200); // Closer (larger)
```

### `animateToPosition(x, y, z, duration, easing)`

Animates the mascot to a new position with easing.

**Parameters:**

- `x` (number): Target X offset
- `y` (number): Target Y offset
- `z` (number, optional): Target Z offset (default: 0)
- `duration` (number, optional): Animation duration in ms (default: 1000)
- `easing` (string, optional): Easing function (default: 'easeOutCubic')

**Available Easing Functions:**

- `linear`, `easeInQuad`, `easeOutQuad`, `easeInOutQuad`
- `easeInCubic`, `easeOutCubic`, `easeInOutCubic`
- `easeInBack`, `easeOutBack`

```javascript
// Smooth animation to new position
mascot.animateToPosition(200, 100, 0, 1500, 'easeOutCubic');

// Quick snap
mascot.animateToPosition(0, 0, 0, 300, 'linear');
```

### `setScale(scaleOrOptions)`

Sets the mascot's scale independently for core and particles.

**Parameters:**

- `scaleOrOptions` (number|Object):
    - **number**: Global scale for both core and particles (backward compatible)
    - **Object**: Options object with independent control:
        - `global` (number, optional): Scale both core and particles
        - `core` (number, optional): Scale only the core
        - `particles` (number, optional): Scale only the particles

**Examples:**

```javascript
// Global scaling (backward compatible)
mascot.setScale(0.6); // 60% of default size

// Explicit global scaling
mascot.setScale({ global: 0.6 });

// Independent control - smaller core, normal particles
mascot.setScale({
    core: 0.6, // Core at 60%
    particles: 1.0, // Particles at 100%
});

// Larger particles, smaller core
mascot.setScale({
    core: 0.8,
    particles: 1.2,
});

// Adjust only particles, keep core unchanged
mascot.setScale({ particles: 1.5 });

// Adjust only core, keep particles unchanged
mascot.setScale({ core: 0.5 });
```

**Use Cases:**

**Mobile Optimization:**

```javascript
// Smaller core for mobile, but keep particles visible
const isMobile = window.innerWidth < 768;
if (isMobile) {
    mascot.setScale({
        core: 0.6,
        particles: 1.0,
    });
}
```

**Emphasis Effects:**

```javascript
// Emphasize particles for celebration
mascot.setEmotion('joy');
mascot.setScale({
    core: 0.8,
    particles: 1.5, // Bigger particles for impact
});
```

**Subtle Presence:**

```javascript
// Subtle background mascot
mascot.setScale({
    core: 0.5,
    particles: 0.7,
});
```

**Note:** When particle scale changes, the particle pool is automatically
refreshed to ensure all particles use the new scale immediately, preventing
mixed-size particle artifacts.

### `getScale()`

Returns the current global scale factor.

```javascript
const currentScale = mascot.getScale(); // Returns number (e.g., 0.6)
```

### `clearParticles()`

Clears all particles from the particle system. Useful when repositioning the
mascot to remove particles from the old position.

```javascript
// Reposition and clear old particles
mascot.setPosition(200, 100);
mascot.clearParticles();
```

## Events

The mascot emits various events you can listen to:

### `stateChange`

Fired when emotional state changes.

```javascript
mascot.on('stateChange', state => {
    console.log(`New emotion: ${state.emotion}`);
});
```

### `gestureComplete`

Fired when a gesture animation completes.

```javascript
mascot.on('gestureComplete', gestureName => {
    console.log(`Completed gesture: ${gestureName}`);
});
```

### `breathePhase`

Fired during breathing animations.

```javascript
mascot.on('breathePhase', phase => {
    console.log(`Breathing phase: ${phase}`); // 'inhale', 'hold1', 'exhale', 'hold2'
});
```

### `particleSpawn`

Fired when new particles are created.

```javascript
mascot.on('particleSpawn', particle => {
    console.log('New particle spawned');
});
```

### `performanceWarning`

Fired when performance degrades.

```javascript
mascot.on('performanceWarning', metrics => {
    console.log(`FPS dropped to ${metrics.fps}`);
});
```

## Configuration Options

### Full Configuration Example

```javascript
const mascot = new EmotiveMascot({
    // Canvas Configuration
    canvasId: 'emotive-canvas',
    width: 400,
    height: 400,

    // Particle Settings
    particleCount: 150,
    particleSize: { min: 2, max: 6 },
    particleLifetime: { min: 1000, max: 3000 },

    // Performance
    targetFPS: 60,
    enableWorkers: true,
    adaptivePerformance: true,
    maxParticles: 500,

    // Visual Effects
    glowIntensity: 1.2,
    motionBlur: 0.8,
    particleTrails: true,

    // Core Behavior
    emotion: 'neutral',
    undertone: 'calm',

    // Features
    enableGestures: true,
    enablePhysics: true,
    enableAudio: false,

    // Interaction
    mouseTracking: true,
    touchEnabled: true,

    // Audio (Optional)
    audioEnabled: false,
    audioSensitivity: 0.7,
    audioFrequencyBands: 32,
});
```

### Performance Options

| Option                | Type    | Default | Description                 |
| --------------------- | ------- | ------- | --------------------------- |
| `targetFPS`           | number  | 60      | Target frame rate           |
| `enableWorkers`       | boolean | true    | Use Web Workers for physics |
| `adaptivePerformance` | boolean | true    | Auto-adjust quality         |
| `maxParticles`        | number  | 500     | Maximum particle count      |

### Visual Options

| Option           | Type    | Default | Description            |
| ---------------- | ------- | ------- | ---------------------- |
| `glowIntensity`  | number  | 1.0     | Glow effect strength   |
| `motionBlur`     | number  | 0.5     | Motion blur amount     |
| `particleTrails` | boolean | false   | Enable particle trails |

## Method Chaining

Most methods return the mascot instance for chaining:

```javascript
mascot
    .setEmotion('joy')
    .addUndertone('energetic')
    .addGesture('wave')
    .breathe('calm');
```

## TypeScript Support

The package includes TypeScript definitions:

```typescript
import EmotiveMascot, {
    EmotionName,
    GestureName,
    UndertoneType,
} from 'emotive-engine';

const emotion: EmotionName = 'joy';
const gesture: GestureName = 'wave';
const undertone: UndertoneType = 'calm';

const mascot = new EmotiveMascot({
    canvasId: 'mascot',
    emotion,
    undertone,
});
```
