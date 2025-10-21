# Semantic Performances - Quick Reference

> Express AI intent through choreographed animations

## Quick Start

```javascript
// Basic performance
await mascot.perform('greeting')

// With context
await mascot.perform('celebrating', {
  context: { frustration: 0, urgency: 'low', magnitude: 'epic' }
})
```

---

## API Cheat Sheet

| Method | Purpose | Example |
|--------|---------|---------|
| `perform(name, options)` | Execute performance | `await mascot.perform('greeting')` |
| `updateContext(updates)` | Set context | `mascot.updateContext({ frustration: 60 })` |
| `getContext()` | Get context | `const ctx = mascot.getContext()` |
| `incrementFrustration(amount)` | Increase frustration | `mascot.incrementFrustration(10)` |
| `decrementFrustration(amount)` | Decrease frustration | `mascot.decrementFrustration(15)` |
| `resetFrustration()` | Reset frustration | `mascot.resetFrustration()` |
| `getAvailablePerformances()` | List all performances | `mascot.getAvailablePerformances()` |
| `registerPerformance(name, def)` | Add custom performance | See [docs](./api/semantic-performances.md#custom-performances) |

---

## Performance Catalog (44 total)

### Conversational (16)

| Performance | Emotion | Intensity | Use Case |
|------------|---------|-----------|----------|
| `listening` | curiosity | 0.6 | User is speaking |
| `thinking` | focused | 0.7 | AI is processing |
| `acknowledging` | calm | 0.7 | AI acknowledges understanding |
| `guiding` | calm | 0.7 | Providing instructions |
| `empathizing` | empathy | 0.8 | Showing empathy (sequence) |
| `celebrating` | joy | 0.9 | Celebrating with user (sequence) |
| `celebrating_epic` | triumph | 1.0 | Epic celebration + transformation |
| `reassuring` | calm | 0.8 | Providing reassurance (sequence) |
| `offering_help` | empathy | 0.8 | Offering assistance (sequence) |
| `offering_urgent_help` | empathy | 1.0 | Urgent help for frustrated user |
| `apologizing` | empathy | 0.85 | Apologizing for error (sequence) |
| `encouraging` | joy | 0.75 | Encouraging user to continue |
| `greeting` | joy | 0.7 | Greeting user warmly |
| `responding_positive` | joy | 0.75 | Positive sentiment response |
| `responding_neutral` | calm | 0.6 | Neutral sentiment response |
| `responding_negative` | empathy | 0.8 | Negative situation response |

### Feedback (13)

| Performance | Emotion | Intensity | Use Case |
|------------|---------|-----------|----------|
| `success_minor` | joy | 0.7 | Item scanned, field validated |
| `success_moderate` | joy | 0.8 | Section completed (sequence) |
| `success_major` | triumph | 0.9 | Milestone reached (sequence) |
| `success_epic` | triumph | 1.0 | Epic success + transformation |
| `error_minor` | concern | 0.6 | Minor, recoverable error |
| `error_moderate` | empathy | 0.75 | Moderate error (sequence) |
| `error_major` | empathy | 0.9 | Major error, needs help (sequence) |
| `error_critical` | empathy | 1.0 | Critical error, urgent attention |
| `warning` | concern | 0.7 | Warning, needs attention |
| `info` | neutral | 0.5 | Informational notification |
| `progress_start` | anticipation | 0.6 | Starting a process |
| `progress_ongoing` | focused | 0.7 | Process ongoing, working |
| `progress_complete` | satisfaction | 0.8 | Process completed |

### State (15)

| Performance | Emotion | Intensity | Loop | Use Case |
|------------|---------|-----------|------|----------|
| `idle` | neutral | 0.5 | No | System idle, waiting |
| `ready` | neutral | 0.6 | No | Ready for interaction |
| `waiting` | anticipation | 0.6 | Yes | Waiting for process |
| `processing` | focused | 0.7 | Yes | Actively processing |
| `scanning` | focused | 0.75 | Yes | Scanning or searching |
| `analyzing` | curiosity | 0.7 | Yes | Analyzing data |
| `completing` | anticipation | 0.8 | No | About to complete |
| `completed` | satisfaction | 0.85 | No | Process completed |
| `reviewing` | satisfaction | 0.65 | No | Reviewing information |
| `monitoring` | focused | 0.6 | Yes | Monitoring for changes |
| `paused` | neutral | 0.5 | No | System paused |
| `loading` | anticipation | 0.65 | Yes | Loading data |
| `connecting` | anticipation | 0.6 | Yes | Establishing connection |
| `active` | focused | 0.75 | No | Actively engaged |

---

## Context System

### Frustration (0-100)

| Range | Description | Intensity Boost |
|-------|-------------|----------------|
| 0-20 | Happy | +0.0 to +0.06 |
| 21-40 | Neutral | +0.06 to +0.12 |
| 41-60 | Annoyed | +0.12 to +0.18 |
| 61-80 | Frustrated | +0.18 to +0.24 |
| 81-100 | Extremely Frustrated | +0.24 to +0.30 |

**Auto-decay:** -5 points every 10 seconds (configurable)

```javascript
// Track frustration based on user actions
onError() { mascot.incrementFrustration(15) }
onRetry() { mascot.incrementFrustration(10) }
onSuccess() { mascot.decrementFrustration(20) }
onResolved() { mascot.resetFrustration() }
```

### Urgency

| Level | Intensity Adjustment | Use Case |
|-------|---------------------|----------|
| `low` | -0.1 | Casual interactions |
| `medium` | 0.0 | Normal interactions |
| `high` | +0.2 | Time-sensitive or critical situations |

### Magnitude

| Level | Intensity Adjustment | Use Case |
|-------|---------------------|----------|
| `small` | -0.1 | Minor actions (field validation) |
| `moderate` | 0.0 | Normal actions (section complete) |
| `major` | +0.15 | Important actions (form submitted) |
| `epic` | +0.3 | Milestone actions (goal achieved) |

---

## Common Patterns

### Conversational UI

```javascript
// User asks question
await mascot.perform('listening')

// AI is thinking
await mascot.perform('thinking')

// AI responds
await mascot.perform('responding_positive')
```

### Form Validation

```javascript
// On field focus
await mascot.perform('ready')

// On successful validation
await mascot.perform('success_minor')
mascot.decrementFrustration(5)

// On validation error
mascot.incrementFrustration(10)
await mascot.perform('error_minor')

// After multiple errors
if (mascot.getContext().frustration > 60) {
  await mascot.perform('error_major', {
    context: { urgency: 'high' }
  })
}
```

### Workflow States

```javascript
await mascot.perform('loading')        // Auto-loops
await delay(2000)
await mascot.perform('processing')     // Auto-loops
await delay(3000)
await mascot.perform('completing')
await delay(500)
await mascot.perform('completed')
mascot.resetFrustration()
```

### Retail Checkout

```javascript
const handleAction = async (action, frustration) => {
  const map = {
    'help': frustration > 60 ? 'offering_urgent_help' : 'offering_help',
    'guide': 'guiding',
    'success': frustration < 20 ? 'celebrating_epic' : 'celebrating'
  }

  await mascot.perform(map[action] || 'responding_neutral', {
    context: {
      frustration,
      urgency: frustration > 60 ? 'high' : 'medium',
      magnitude: frustration < 20 ? 'epic' : 'moderate'
    }
  })
}
```

---

## Before & After

### ❌ Old Approach (50+ lines)

```javascript
const emotionMap = {
  'joy': { emotion: 'joy', gesture: 'bounce' },
  'empathy': { emotion: 'empathy', gesture: 'nod' },
  // ...6 more mappings
}

const mascotAction = emotionMap[emotion] || emotionMap['neutral']
const intensity = frustration > 60 ? 1.0 : 0.7

mascot.setEmotion(mascotAction.emotion, intensity)

setTimeout(() => {
  mascot.express(mascotAction.gesture)
}, 200)

if (action === 'celebrate' && frustration < 20) {
  setTimeout(() => {
    mascot.morphTo('sun')
    mascot.chain('radiance')
  }, 800)
} else if (action === 'offer_help' && frustration > 60) {
  setTimeout(() => {
    mascot.express('point')
  }, 600)
}
```

### ✅ New Approach (1 line)

```javascript
await mascot.perform('celebrating_epic', {
  context: { frustration: 0, urgency: 'low', magnitude: 'epic' }
})
```

**Result:** 98% code reduction, context-aware intensity, maintainable

---

## Configuration

```javascript
const mascot = new EmotiveMascot({
  canvasId: 'my-canvas',

  // Performance system options
  enablePerformanceHistory: true,      // Track context history
  enableFrustrationDecay: true,        // Auto-decay frustration
  performanceHistoryLimit: 50,         // Max history entries
  frustrationDecayRate: 5,             // Decay points per interval
  frustrationDecayInterval: 10000,     // Decay interval (ms)
  allowConcurrentPerformances: false,  // Allow multiple performances
  enablePerformanceAnalytics: true     // Track analytics
})
```

---

## Resources

- **[Full Documentation](./api/semantic-performances.md)** - Complete guide with examples
- **[API Reference](../API.md#semantic-performance-system)** - API documentation
- **[GitHub](https://github.com/rougesteelproject/emotive-mascot)** - Source code
- **[Examples](./examples/)** - Code examples and demos

---

**Quick Links:**
- [Getting Started](./api/GETTING_STARTED.md)
- [Gesture Guide](./api/GESTURE_GUIDE.md)
- [Emotions Guide](./api/emotions.md)
- [Troubleshooting](./TROUBLESHOOTING.md)
