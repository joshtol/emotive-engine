# Semantic Performance System

> **Version:** 3.0.0
> **Status:** Production Ready
> **Introduced:** Phase 1 Implementation

The Semantic Performance System enables developers to express AI intent through universal, choreographed animation sequences without manual timing and gesture coordination.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
- [API Reference](#api-reference)
- [Performance Catalog](#performance-catalog)
- [Context Management](#context-management)
- [Custom Performances](#custom-performances)
- [Examples](#examples)
- [Best Practices](#best-practices)

---

## Overview

### The Problem

Traditional mascot animation required developers to manually choreograph every interaction:

```javascript
// ❌ Old approach: 50+ lines of manual choreography
const emotionMap = {
  'joy': { emotion: 'joy', gesture: 'bounce' },
  'empathy': { emotion: 'empathy', gesture: 'nod' },
  // ...
}
const intensity = frustration > 60 ? 1.0 : 0.7
mascot.setEmotion(emotion, intensity)
setTimeout(() => mascot.express(gesture), 200)
if (action === 'celebrate' && frustration < 20) {
  setTimeout(() => {
    mascot.morphTo('sun')
    mascot.chain('radiance')
  }, 800)
}
```

### The Solution

Semantic performances translate intent into animation with context-aware intensity:

```javascript
// ✅ New approach: 1 line with semantic API
await mascot.perform('celebrating', {
  context: { frustration: 0, urgency: 'low', magnitude: 'epic' }
})
```

**Benefits:**
- 98% code reduction for animation choreography
- Universal archetypes for consistent UX
- Context-aware intensity automatically adjusts to user state
- Maintainable, centralized performance definitions
- Easy to extend with custom performances

---

## Quick Start

### Basic Usage

```javascript
import EmotiveMascot from 'emotive-mascot'

// Initialize mascot
const mascot = new EmotiveMascot({ canvasId: 'my-canvas' })
mascot.start()

// Execute a semantic performance
await mascot.perform('greeting')

// With context for intensity adjustment
await mascot.perform('empathizing', {
  context: {
    frustration: 60,
    urgency: 'high'
  }
})

// Update context separately
mascot.updateContext({ frustration: 40 })
await mascot.perform('offering_help')
```

### In React/TypeScript

```typescript
import { useEffect, useRef } from 'react'
import EmotiveMascot from 'emotive-mascot'

function MyComponent() {
  const mascotRef = useRef<EmotiveMascot | null>(null)

  useEffect(() => {
    const mascot = new EmotiveMascot({ canvasId: 'mascot-canvas' })
    mascot.start()
    mascotRef.current = mascot

    return () => mascot.destroy()
  }, [])

  const handleUserAction = async (action: string, frustration: number) => {
    if (!mascotRef.current) return

    // Map actions to semantic performances
    const performanceMap: Record<string, string> = {
      'help': frustration > 60 ? 'offering_urgent_help' : 'offering_help',
      'success': frustration < 20 ? 'celebrating_epic' : 'celebrating',
      'guide': 'guiding'
    }

    await mascotRef.current.perform(performanceMap[action] || 'responding_neutral', {
      context: {
        frustration,
        urgency: frustration > 60 ? 'high' : 'medium',
        magnitude: frustration < 20 ? 'epic' : 'moderate'
      }
    })
  }

  return <canvas id="mascot-canvas" />
}
```

---

## Core Concepts

### 1. Semantic Performances

A **semantic performance** is a named, choreographed sequence that expresses a specific intent (e.g., `celebrating`, `empathizing`, `guiding`).

Each performance includes:
- **Base emotion** - The primary emotional state
- **Gestures** - Physical movements (bounce, nod, glow)
- **Intensity** - Strength of expression (0-1 scale)
- **Timing** - Precise sequence of actions over time
- **Optional effects** - Morphing, particle chains, sounds

### 2. Context-Aware Intensity

Performances automatically adjust intensity based on conversation context:

- **Frustration (0-100)**: Boosts intensity up to +0.3 as frustration increases
- **Urgency (low/medium/high)**: Adjusts intensity by -0.1/0/+0.2
- **Magnitude (small/moderate/major/epic)**: Scales from -0.1 to +0.3

**Example:**
```javascript
// Base intensity: 0.7
// Frustration: 80 → +0.24 boost
// Urgency: high → +0.2 boost
// Final intensity: 0.94 (clamped to 0-1 range)
```

### 3. Performance Categories

**Conversational** (16 performances)
- Expressions during AI interactions
- Examples: `listening`, `thinking`, `empathizing`, `celebrating`

**Feedback** (13 performances)
- Success and error responses
- Examples: `success_minor`, `success_epic`, `error_moderate`, `warning`

**State** (15 performances)
- Workflow and system states
- Examples: `idle`, `processing`, `loading`, `completed`

### 4. Automatic Frustration Decay

Context frustration automatically decreases over time (default: -5 points per 10 seconds), encouraging positive user experiences.

---

## API Reference

### `perform(semanticAction, options)`

Execute a semantic performance.

**Parameters:**
- `semanticAction` (string): Performance name (e.g., `'celebrating'`)
- `options` (object, optional):
  - `context` (object, optional): Context for intensity calculation
    - `frustration` (number, 0-100): User frustration level
    - `urgency` (string): `'low'` | `'medium'` | `'high'`
    - `magnitude` (string): `'small'` | `'moderate'` | `'major'` | `'epic'`
  - `intensity` (number, 0-1): Override calculated intensity
  - `delay` (number): Override default delay in milliseconds

**Returns:** `Promise<EmotiveMascot>` (for chaining)

**Example:**
```javascript
await mascot.perform('celebrating_epic', {
  context: {
    frustration: 0,
    urgency: 'low',
    magnitude: 'epic'
  }
})
```

---

### `updateContext(updates)`

Update conversation context for context-aware performances.

**Parameters:**
- `updates` (object):
  - `frustration` (number, optional): Frustration level (0-100)
  - `urgency` (string, optional): `'low'` | `'medium'` | `'high'`
  - `magnitude` (string, optional): `'small'` | `'moderate'` | `'major'` | `'epic'`
  - `custom` (object, optional): Custom context values

**Returns:** `EmotiveMascot` (for chaining)

**Example:**
```javascript
mascot.updateContext({ frustration: 60, urgency: 'high' })
await mascot.perform('offering_urgent_help')
```

---

### `getContext()`

Get current conversation context.

**Returns:** `Object` with current context state

**Example:**
```javascript
const context = mascot.getContext()
console.log(context.frustration) // 60
console.log(context.urgency)     // 'high'
```

---

### `incrementFrustration(amount)`

Increment user frustration level.

**Parameters:**
- `amount` (number, optional): Amount to increment (default: 10)

**Returns:** `EmotiveMascot` (for chaining)

**Example:**
```javascript
mascot.incrementFrustration(15) // Increase frustration by 15 points
```

---

### `decrementFrustration(amount)`

Decrement user frustration level.

**Parameters:**
- `amount` (number, optional): Amount to decrement (default: 10)

**Returns:** `EmotiveMascot` (for chaining)

**Example:**
```javascript
mascot.decrementFrustration(20) // Decrease frustration by 20 points
```

---

### `resetFrustration()`

Reset user frustration to zero.

**Returns:** `EmotiveMascot` (for chaining)

**Example:**
```javascript
mascot.resetFrustration() // Set frustration to 0
```

---

### `getAvailablePerformances()`

Get all available performance names.

**Returns:** `Array<string>` - Array of 44 performance names

**Example:**
```javascript
const performances = mascot.getAvailablePerformances()
console.log(performances)
// ['listening', 'thinking', 'celebrating', 'empathizing', ...]
```

---

### `registerPerformance(name, definition)`

Register a custom performance.

**Parameters:**
- `name` (string): Unique performance name
- `definition` (object): Performance definition (see [Custom Performances](#custom-performances))

**Returns:** `EmotiveMascot` (for chaining)

**Example:**
```javascript
mascot.registerPerformance('custom_celebration', {
  name: 'custom_celebration',
  category: 'custom',
  emotion: 'triumph',
  baseIntensity: 1.0,
  sequence: [
    { at: 0, action: 'emotion', value: 'joy', intensity: 0.9 },
    { at: 200, action: 'gesture', value: 'bounce' },
    { at: 700, action: 'morph', value: 'star' }
  ]
})
```

---

### `getPerformanceAnalytics()`

Get performance execution analytics (if enabled).

**Returns:** `Object | null` - Analytics data or null if disabled

**Example:**
```javascript
const analytics = mascot.getPerformanceAnalytics()
console.log(analytics.mostUsed)     // 'celebrating'
console.log(analytics.totalExecutions) // 47
```

---

### `getContextAnalytics()`

Get context history analytics (if enabled).

**Returns:** `Object | null` - Context analytics or null if disabled

**Example:**
```javascript
const analytics = mascot.getContextAnalytics()
console.log(analytics.frustration.average) // 35.2
console.log(analytics.frustration.max)     // 85
```

---

## Performance Catalog

### Conversational (16 performances)

Expressions for AI conversation flows.

| Performance | Emotion | Base Intensity | Description |
|------------|---------|---------------|-------------|
| `listening` | curiosity | 0.6 | User is speaking, AI is listening |
| `thinking` | focused | 0.7 | AI is processing and thinking |
| `acknowledging` | calm | 0.7 | AI acknowledges understanding |
| `guiding` | calm | 0.7 | AI provides guidance/instructions |
| `empathizing` | empathy | 0.8 | AI shows empathy (sequence) |
| `celebrating` | joy | 0.9 | AI celebrates with user (sequence) |
| `celebrating_epic` | triumph | 1.0 | Epic celebration with transformation |
| `reassuring` | calm | 0.8 | AI provides reassurance (sequence) |
| `offering_help` | empathy | 0.8 | AI offers assistance (sequence) |
| `offering_urgent_help` | empathy | 1.0 | AI urgently offers help (sequence) |
| `apologizing` | empathy | 0.85 | AI apologizes for error (sequence) |
| `encouraging` | joy | 0.75 | AI encourages user to continue |
| `greeting` | joy | 0.7 | AI greets user warmly |
| `responding_positive` | joy | 0.75 | Positive sentiment response |
| `responding_neutral` | calm | 0.6 | Neutral sentiment response |
| `responding_negative` | empathy | 0.8 | Negative situation response |

---

### Feedback (13 performances)

Universal archetypes for success and error feedback.

| Performance | Emotion | Base Intensity | Description |
|------------|---------|---------------|-------------|
| `success_minor` | joy | 0.7 | Small success (item scanned) |
| `success_moderate` | joy | 0.8 | Moderate success (sequence) |
| `success_major` | triumph | 0.9 | Major success (sequence) |
| `success_epic` | triumph | 1.0 | Epic success with transformation |
| `error_minor` | concern | 0.6 | Minor error, easily recoverable |
| `error_moderate` | empathy | 0.75 | Moderate error (sequence) |
| `error_major` | empathy | 0.9 | Major error, needs help (sequence) |
| `error_critical` | empathy | 1.0 | Critical error, urgent attention |
| `warning` | concern | 0.7 | Warning, needs attention |
| `info` | neutral | 0.5 | Informational notification |
| `progress_start` | anticipation | 0.6 | Starting a process |
| `progress_ongoing` | focused | 0.7 | Process ongoing, working |
| `progress_complete` | satisfaction | 0.8 | Process completed successfully |

---

### State (15 performances)

Workflow and system state expressions.

| Performance | Emotion | Base Intensity | Loop | Description |
|------------|---------|---------------|------|-------------|
| `idle` | neutral | 0.5 | No | System idle, waiting |
| `ready` | neutral | 0.6 | No | System ready for interaction |
| `waiting` | anticipation | 0.6 | Yes | Waiting for process to complete |
| `processing` | focused | 0.7 | Yes | System actively processing |
| `scanning` | focused | 0.75 | Yes | Scanning or searching |
| `analyzing` | curiosity | 0.7 | Yes | Analyzing data or input |
| `completing` | anticipation | 0.8 | No | Final step, about to complete |
| `completed` | satisfaction | 0.85 | No | Process completed successfully |
| `reviewing` | satisfaction | 0.65 | No | Reviewing information |
| `monitoring` | focused | 0.6 | Yes | Actively monitoring changes |
| `paused` | neutral | 0.5 | No | System paused, can resume |
| `loading` | anticipation | 0.65 | Yes | Loading data or content |
| `connecting` | anticipation | 0.6 | Yes | Establishing connection |
| `active` | focused | 0.75 | No | System actively engaged |

**Loop**: Indicates the performance repeats at intervals automatically.

---

## Context Management

### Frustration Tracking

Track user frustration to automatically intensify empathetic responses:

```javascript
// Increment on errors or retries
mascot.incrementFrustration(10)

// Decrement on successful actions
mascot.decrementFrustration(15)

// Reset after resolution
mascot.resetFrustration()

// Check current level
const context = mascot.getContext()
if (context.frustration > 70) {
  await mascot.perform('offering_urgent_help')
}
```

### Urgency Levels

Set urgency to adjust intensity:

```javascript
mascot.updateContext({ urgency: 'low' })    // -0.1 intensity
mascot.updateContext({ urgency: 'medium' }) // No change
mascot.updateContext({ urgency: 'high' })   // +0.2 intensity
```

### Magnitude Scaling

Scale performances by magnitude:

```javascript
mascot.updateContext({ magnitude: 'small' })    // -0.1 intensity
mascot.updateContext({ magnitude: 'moderate' }) // No change
mascot.updateContext({ magnitude: 'major' })    // +0.15 intensity
mascot.updateContext({ magnitude: 'epic' })     // +0.3 intensity
```

### Custom Context Values

Store custom context for advanced use cases:

```javascript
mascot.updateContext({
  custom: {
    conversationLength: 12,
    userTier: 'premium',
    timeOfDay: 'evening'
  }
})
```

---

## Custom Performances

### Simple Performance

```javascript
mascot.registerPerformance('welcome_back', {
  name: 'welcome_back',
  category: 'custom',
  emotion: 'joy',
  gesture: 'wave',
  delay: 200,
  baseIntensity: 0.75,
  emotionDuration: 500,
  description: 'Welcome back returning users'
})

await mascot.perform('welcome_back')
```

### Sequence Performance

```javascript
mascot.registerPerformance('epic_failure_recovery', {
  name: 'epic_failure_recovery',
  category: 'custom',
  emotion: 'empathy',
  baseIntensity: 1.0,
  description: 'Empathetic response to major failure with recovery guidance',
  sequence: [
    { at: 0, action: 'emotion', value: 'empathy', intensity: 1.0 },
    { at: 150, action: 'gesture', value: 'shake' },
    { at: 500, action: 'gesture', value: 'nod' },
    { at: 900, action: 'emotion', value: 'calm', intensity: 0.8 },
    { at: 1100, action: 'gesture', value: 'point' }
  ]
})

await mascot.perform('epic_failure_recovery', {
  context: { frustration: 90, urgency: 'high' }
})
```

### Performance Schema

```javascript
{
  name: string,              // Required: Unique identifier
  category: string,          // Required: 'conversational' | 'feedback' | 'state' | 'custom'
  emotion: string,           // Required if no sequence: Base emotion
  gesture: string,           // Optional: Gesture to execute
  baseIntensity: number,     // Optional: Base intensity 0-1 (default: 0.7)
  emotionDuration: number,   // Optional: Emotion duration in ms (default: 500)
  delay: number,             // Optional: Delay before execution in ms (default: 0)
  loop: boolean,             // Optional: Whether to loop (default: false)
  loopInterval: number,      // Optional: Loop interval in ms (default: 1000)
  description: string,       // Optional: Human-readable description
  sequence: Array<{          // Optional: Multi-step choreography
    at: number,              // Required: Timestamp in ms
    action: string,          // Required: 'emotion' | 'gesture' | 'morph' | 'chain' | 'sound'
    value: string,           // Required: Action value
    intensity: number,       // Optional: Intensity for emotion actions
    options: object          // Optional: Options for the action
  }>
}
```

---

## Examples

### Retail Checkout Assistant

```javascript
// Map AI response actions to semantic performances
async function handleAIResponse(message, action, frustration) {
  const performanceMap = {
    'guide': 'guiding',
    'offer_help': frustration > 60 ? 'offering_urgent_help' : 'offering_help',
    'celebrate': frustration < 20 ? 'celebrating_epic' : 'celebrating'
  }

  await mascot.perform(performanceMap[action] || 'responding_neutral', {
    context: {
      frustration,
      urgency: frustration > 60 ? 'high' : 'medium',
      magnitude: frustration < 20 ? 'epic' : 'moderate'
    }
  })
}

// User asks for help
await handleAIResponse('How do I scan?', 'guide', 30)

// User is frustrated
await handleAIResponse('This is taking forever!', 'offer_help', 80)

// User succeeds
mascot.resetFrustration()
await handleAIResponse('Thanks!', 'celebrate', 0)
```

### Form Validation

```javascript
async function handleFormEvent(eventType, isValid, retryCount) {
  if (eventType === 'submit') {
    if (isValid) {
      await mascot.perform('success_major')
      mascot.decrementFrustration(20)
    } else {
      mascot.incrementFrustration(10 * retryCount)
      const context = mascot.getContext()

      if (context.frustration > 70) {
        await mascot.perform('error_major', {
          context: { urgency: 'high' }
        })
      } else {
        await mascot.perform('error_moderate')
      }
    }
  } else if (eventType === 'focus') {
    await mascot.perform('ready')
  } else if (eventType === 'typing') {
    await mascot.perform('monitoring')
  }
}
```

### Workflow States

```javascript
async function handleWorkflowState(state) {
  const stateMap = {
    'idle': 'idle',
    'loading': 'loading',
    'processing': 'processing',
    'analyzing': 'analyzing',
    'completing': 'completing',
    'completed': 'completed',
    'error': 'error_moderate'
  }

  await mascot.perform(stateMap[state] || 'idle')
}

// Workflow progression
await handleWorkflowState('loading')
await new Promise(resolve => setTimeout(resolve, 2000))
await handleWorkflowState('processing')
await new Promise(resolve => setTimeout(resolve, 3000))
await handleWorkflowState('completing')
await new Promise(resolve => setTimeout(resolve, 500))
await handleWorkflowState('completed')
```

---

## Best Practices

### 1. Map Actions to Performances

Create clear mappings between user actions and semantic performances:

```javascript
const ACTION_TO_PERFORMANCE = {
  userAsksQuestion: 'listening',
  aiResponding: 'thinking',
  successfulAction: 'success_moderate',
  errorOccurred: 'error_moderate',
  userFrustrated: 'offering_urgent_help'
}
```

### 2. Track Frustration Contextually

Increment frustration on negative events, decrement on positive ones:

```javascript
// Negative events
onError() { mascot.incrementFrustration(15) }
onRetry() { mascot.incrementFrustration(10) }
onTimeout() { mascot.incrementFrustration(20) }

// Positive events
onSuccess() { mascot.decrementFrustration(20) }
onHelpful() { mascot.decrementFrustration(10) }
onResolved() { mascot.resetFrustration() }
```

### 3. Use Context-Aware Intensity

Let the system calculate intensity based on context rather than manually setting it:

```javascript
// ✅ Good: Context-aware
await mascot.perform('empathizing', {
  context: { frustration: 70, urgency: 'high' }
})

// ❌ Avoid: Manual intensity override (unless necessary)
await mascot.perform('empathizing', { intensity: 0.9 })
```

### 4. Choose Appropriate Magnitudes

Match magnitude to the significance of the event:

```javascript
// Small: Field validated
await mascot.perform('success_minor', {
  context: { magnitude: 'small' }
})

// Moderate: Form section completed
await mascot.perform('success_moderate', {
  context: { magnitude: 'moderate' }
})

// Major: Entire form submitted
await mascot.perform('success_major', {
  context: { magnitude: 'major' }
})

// Epic: Major milestone achieved
await mascot.perform('success_epic', {
  context: { magnitude: 'epic' }
})
```

### 5. Consider Performance Loops

Some state performances loop automatically. Don't call them repeatedly:

```javascript
// ✅ Good: Call once, it loops automatically
await mascot.perform('processing')

// ❌ Avoid: Calling in a loop (redundant)
while (isProcessing) {
  await mascot.perform('processing')
  await delay(1000)
}
```

### 6. Test with Different Context States

Test performances with various frustration and urgency levels:

```javascript
// Low frustration
mascot.updateContext({ frustration: 10 })
await mascot.perform('offering_help')

// Medium frustration
mascot.updateContext({ frustration: 50 })
await mascot.perform('offering_help')

// High frustration
mascot.updateContext({ frustration: 85 })
await mascot.perform('offering_help') // Will feel more urgent
```

### 7. Leverage Analytics

Use analytics to optimize performance selection:

```javascript
const analytics = mascot.getPerformanceAnalytics()
const contextAnalytics = mascot.getContextAnalytics()

console.log('Most used:', analytics.mostUsed)
console.log('Average frustration:', contextAnalytics.frustration.average)
console.log('Peak frustration:', contextAnalytics.frustration.max)

// Adjust your app based on insights
if (contextAnalytics.frustration.average > 60) {
  // Users are frequently frustrated - simplify UX
}
```

---

## Configuration

Enable/disable features in the constructor:

```javascript
const mascot = new EmotiveMascot({
  canvasId: 'my-canvas',

  // Performance system options
  enablePerformanceHistory: true,      // Track context history (default: true)
  enableFrustrationDecay: true,        // Auto-decay frustration (default: true)
  performanceHistoryLimit: 50,         // Max history entries (default: 50)
  frustrationDecayRate: 5,             // Decay points per interval (default: 5)
  frustrationDecayInterval: 10000,     // Decay interval in ms (default: 10000)
  allowConcurrentPerformances: false,  // Allow multiple performances (default: false)
  enablePerformanceAnalytics: true     // Track analytics (default: true)
})
```

---

## Troubleshooting

### Performance Not Executing

```javascript
// Check if mascot is initialized and started
if (!mascot.isRunning) {
  mascot.start()
}

// Check if performance exists
const available = mascot.getAvailablePerformances()
console.log(available.includes('my_performance'))

// Check console for errors
await mascot.perform('unknown_performance') // Logs warning
```

### Intensity Not Adjusting

```javascript
// Verify context is being set
const context = mascot.getContext()
console.log(context) // Should show frustration, urgency, magnitude

// Check if intensity override is being used
await mascot.perform('celebrating', {
  // Remove this if you want context-aware intensity
  // intensity: 0.5
})
```

### Custom Performance Not Working

```javascript
// Validate performance definition
const definition = {
  name: 'my_performance',
  category: 'custom',
  emotion: 'joy', // Required if no sequence
  baseIntensity: 0.7
}

mascot.registerPerformance('my_performance', definition)

// Check if registered
const available = mascot.getAvailablePerformances()
console.log(available.includes('my_performance')) // Should be true
```

---

## See Also

- [API Reference](./API_REFERENCE.md) - Complete API documentation
- [Gesture Guide](./GESTURE_GUIDE.md) - Available gestures
- [Emotions Guide](./emotions.md) - Available emotions
- [Getting Started](./GETTING_STARTED.md) - Initial setup guide
- [Examples](../examples/) - Code examples and demos
