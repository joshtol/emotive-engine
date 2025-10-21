---
name: mascot-integrator
description:
    Integrate the emotive-mascot into new use cases, applications, and
    frameworks. Use when adding mascot to a new page, creating custom
    interactions, or setting up framework-specific implementations (React, Vue,
    vanilla JS).
trigger: integrate, add mascot, setup, implementation, use case, framework
---

# Mascot Integrator

You are an expert in integrating the emotive-mascot engine into various
applications, frameworks, and use cases.

## When to Use This Skill

- Adding mascot to a new use case or page
- Setting up mascot in different frameworks (React, Vue, Svelte, vanilla JS)
- Creating custom interaction patterns
- Configuring mascot for specific contexts
- Implementing LLM-driven emotion responses
- Troubleshooting integration issues

## Quick Start Patterns

### Vanilla JavaScript

```html
<!DOCTYPE html>
<html>
    <head>
        <script src="https://unpkg.com/@joshtol/emotive-engine@latest"></script>
    </head>
    <body>
        <canvas id="mascot-canvas"></canvas>

        <script>
            const mascot = new EmotiveMascot({
              containerId: 'mascot-canvas',
              width: 400,
              height: 400,
              initialEmotion: 'calm'
            })

            await mascot.initialize()
            await mascot.transitionTo('joy')
        </script>
    </body>
</html>
```

### React (Next.js App Router)

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';

export default function MascotDemo() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mascotRef = useRef<any>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isClient || !canvasRef.current) return;

        const initMascot = async () => {
            const { EmotiveMascot } = await import('@joshtol/emotive-engine');

            mascotRef.current = new EmotiveMascot({
                canvas: canvasRef.current,
                width: 400,
                height: 400,
                initialEmotion: 'calm',
                enableGazeTracking: true,
            });

            await mascotRef.current.initialize();
        };

        initMascot();

        return () => {
            mascotRef.current?.destroy();
        };
    }, [isClient]);

    const handleEmotionChange = async (emotion: string) => {
        await mascotRef.current?.transitionTo(emotion, { duration: 1000 });
    };

    if (!isClient) return null;

    return (
        <div>
            <canvas ref={canvasRef} />
            <button onClick={() => handleEmotionChange('joy')}>Joy</button>
            <button onClick={() => handleEmotionChange('excitement')}>
                Excitement
            </button>
        </div>
    );
}
```

### Vue 3

```vue
<template>
    <div>
        <canvas ref="mascotCanvas"></canvas>
        <button @click="changeEmotion('joy')">Joy</button>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const mascotCanvas = ref(null);
let mascot = null;

onMounted(async () => {
    const { EmotiveMascot } = await import('@joshtol/emotive-engine');

    mascot = new EmotiveMascot({
        canvas: mascotCanvas.value,
        width: 400,
        height: 400,
        initialEmotion: 'calm',
    });

    await mascot.initialize();
});

onUnmounted(() => {
    mascot?.destroy();
});

const changeEmotion = async emotion => {
    await mascot?.transitionTo(emotion);
};
</script>
```

## Use Case Patterns

### 1. Retail Checkout Assistant

**Context**: Shopping cart, payment processing, item scanning **Emotions**: calm
→ anticipation (scanning) → joy (success) → concern (error)

```javascript
const mascot = new EmotiveMascot({
    containerId: 'checkout-mascot',
    initialEmotion: 'calm',
    enableGazeTracking: true,
    scrollReactive: false, // Fixed position at checkout
});

// Item scanned successfully
async function onItemScanned() {
    await mascot.playPerformance('itemScanned', {
        steps: [
            { emotion: 'anticipation', duration: 300 },
            { emotion: 'joy', duration: 800, gesture: 'bounce' },
        ],
    });
}

// Payment processing
async function onPaymentProcessing() {
    await mascot.transitionTo('anticipation', { duration: 500 });
    // Show loading state
}

// Payment success
async function onPaymentSuccess() {
    await mascot.playPerformance('celebration');
}

// Error occurred
async function onError(errorType) {
    await mascot.transitionTo('concern', { duration: 800 });
}
```

### 2. Smart Home Dashboard

**Context**: Device control, status monitoring, voice commands **Emotions**:
calm → focus (listening) → joy (command success)

```javascript
const mascot = new EmotiveMascot({
    containerId: 'smarthome-mascot',
    initialEmotion: 'calm',
    enableGazeTracking: true,
    scrollReactive: true,
    audioEnabled: true, // Enable audio feedback
});

// Voice command started
async function onVoiceStart() {
    await mascot.transitionTo('focus', { duration: 400 });
}

// Command recognized
async function onCommandRecognized(command) {
    await mascot.transitionTo('anticipation', { duration: 300 });
}

// Device controlled successfully
async function onDeviceControlled(device) {
    await mascot.playPerformance('success', {
        steps: [
            { emotion: 'joy', duration: 600, gesture: 'pulse' },
            { emotion: 'calm', duration: 800 },
        ],
    });
}
```

### 3. Healthcare Patient Intake

**Context**: Form filling, health questions, appointment scheduling
**Emotions**: calm → empathy → reassurance

```javascript
const mascot = new EmotiveMascot({
    containerId: 'patient-mascot',
    initialEmotion: 'calm',
    enableGazeTracking: true,
    scrollReactive: false,
});

// Sensitive question
async function onSensitiveQuestion() {
    await mascot.transitionTo('empathy', { duration: 1000 });
}

// Form validation error
async function onValidationError() {
    await mascot.transitionTo('concern', { duration: 600 });
}

// Form submitted
async function onFormSubmitted() {
    await mascot.playPerformance('reassurance', {
        steps: [
            { emotion: 'gratitude', duration: 800 },
            { emotion: 'calm', duration: 600 },
        ],
    });
}
```

### 4. Education / Learning Platform

**Context**: Quiz, lessons, progress tracking **Emotions**: calm → encouragement
→ celebration (correct) → empathy (incorrect)

```javascript
const mascot = new EmotiveMascot({
    containerId: 'learning-mascot',
    initialEmotion: 'calm',
    enableGazeTracking: true,
});

// Correct answer
async function onCorrectAnswer() {
    await mascot.playPerformance('celebration', {
        steps: [
            { emotion: 'joy', duration: 600, gesture: 'bounce' },
            { emotion: 'pride', duration: 800, gesture: 'shimmer' },
        ],
    });
}

// Incorrect answer
async function onIncorrectAnswer() {
    await mascot.playPerformance('encouragement', {
        steps: [
            { emotion: 'empathy', duration: 600 },
            { emotion: 'encouragement', duration: 800 },
        ],
    });
}

// Lesson completed
async function onLessonComplete() {
    await mascot.playPerformance('achievement');
}
```

## LLM Integration Pattern

Connect mascot to Claude, GPT, or other LLMs for sentiment-driven emotions:

```javascript
import { LLMEmotionPlugin } from '@joshtol/emotive-engine';

const mascot = new EmotiveMascot({
    containerId: 'ai-mascot',
    initialEmotion: 'calm',
    plugins: [
        new LLMEmotionPlugin({
            provider: 'anthropic', // or 'openai'
            apiKey: process.env.ANTHROPIC_API_KEY,
            autoDetect: true, // Automatically detect sentiment
        }),
    ],
});

// Handle LLM response
async function onLLMResponse(message) {
    // Plugin automatically detects sentiment and transitions emotion
    await mascot.handleLLMMessage(message);
}

// Manual sentiment override
async function onUserMessage(message) {
    if (message.includes('error') || message.includes('problem')) {
        await mascot.transitionTo('concern', { duration: 800 });
    } else if (message.includes('thank') || message.includes('great')) {
        await mascot.transitionTo('gratitude', { duration: 600 });
    }
}
```

## Configuration Options

### Essential Options

```javascript
{
  // Container (choose one)
  containerId: 'my-canvas',     // ID of canvas element
  canvas: canvasElement,        // Direct canvas reference

  // Dimensions
  width: 400,                   // Canvas width
  height: 400,                  // Canvas height

  // Initial state
  initialEmotion: 'calm',       // Starting emotion

  // Interactivity
  enableGazeTracking: true,     // Follow mouse/touch
  scrollReactive: true,         // React to page scroll
  clickReactive: true,          // React to clicks

  // Performance
  targetFPS: 60,                // Target frame rate
  pixelRatio: window.devicePixelRatio,  // Display quality

  // Features
  audioEnabled: false,          // Audio synthesis
  plugins: []                   // Additional plugins
}
```

### Advanced Options

```javascript
{
  // Accessibility
  ariaLabel: 'Interactive mascot',
  reducedMotion: false,         // Respect prefers-reduced-motion

  // Debug
  debug: false,                 // Show FPS and debug info

  // Custom behaviors
  onEmotionChange: (emotion) => {
    console.log('Emotion changed to:', emotion)
  },

  onGestureComplete: (gesture) => {
    console.log('Gesture completed:', gesture)
  },

  onPerformanceComplete: (performance) => {
    console.log('Performance completed:', performance)
  }
}
```

## Common Integration Patterns

### Fixed Position Mascot

```css
#mascot-canvas {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 1000;
    border-radius: 50%;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}
```

### Scroll-Reactive Hero Section

```javascript
const mascot = new EmotiveMascot({
    containerId: 'hero-mascot',
    scrollReactive: true,
    scrollConfig: {
        minScroll: 0,
        maxScroll: 1000,
        emotionSequence: [
            { scrollY: 0, emotion: 'calm' },
            { scrollY: 300, emotion: 'curiosity' },
            { scrollY: 600, emotion: 'excitement' },
            { scrollY: 1000, emotion: 'joy' },
        ],
    },
});
```

### Mobile Responsive

```javascript
const isMobile = window.innerWidth < 768;

const mascot = new EmotiveMascot({
    containerId: 'mascot',
    width: isMobile ? 300 : 500,
    height: isMobile ? 300 : 500,
    targetFPS: isMobile ? 30 : 60, // Lower FPS on mobile
    enableGazeTracking: !isMobile, // Disable on mobile for performance
});
```

## Troubleshooting

**Mascot not rendering**

- Verify canvas element exists in DOM
- Check canvas has width/height (not 0x0)
- Ensure `initialize()` is called after construction
- Check browser console for errors

**Performance issues**

- Reduce particle count in emotion configs
- Lower targetFPS to 30
- Disable gaze tracking on mobile
- Check for other animation conflicts

**Emotions not changing**

- Verify emotion name exists in emotion config
- Check transition is awaited (async)
- Ensure previous transition completed
- Check for JavaScript errors blocking execution

**Framework-specific issues**

**React**: Canvas disappears on re-render

- Use `useRef` for canvas element
- Don't recreate mascot on every render
- Clean up with `destroy()` in cleanup function

**Vue**: Mascot not initializing

- Use `onMounted` hook
- Check canvas ref is properly bound
- Use `nextTick()` if needed

**Next.js**: SSR errors

- Use `'use client'` directive
- Check for `window` before initializing
- Use dynamic imports for mascot library

## Key Files

- **Core Engine**: `src/core/EmotiveMascot.js`
- **LLM Plugin**: `src/plugins/LLMEmotionPlugin.js`
- **Gaze Tracking**: `src/core/GazeTrackingEngine.js`
- **Scroll Reactive**: `src/core/ScrollReactiveEngine.js`
- **Example Use Cases**: `site/src/app/use-cases/`

## Testing Integration

```javascript
// Test basic initialization
const mascot = new EmotiveMascot({ containerId: 'test-canvas' });
await mascot.initialize();
console.assert(mascot.isInitialized, 'Mascot should be initialized');

// Test emotion transition
await mascot.transitionTo('joy');
console.assert(mascot.currentEmotion === 'joy', 'Should transition to joy');

// Test gesture
await mascot.playGesture('wave');
console.assert(mascot.isGesturePlaying, 'Gesture should be playing');

// Clean up
mascot.destroy();
```

## Resources

- [API Documentation](../../docs/api.md)
- [Use Case Examples](../../site/src/app/use-cases/)
- [Framework Guides](../../docs/frameworks/)
- [Performance Guide](../../docs/performance.md)
