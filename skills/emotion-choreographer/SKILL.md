---
name: emotion-choreographer
description:
    Design and implement new emotion behaviors, gestures, and semantic
    performances for the emotive-mascot engine. Use when creating new emotions,
    choreographing particle movements, or designing multi-step performances.
trigger:
    emotion, gesture, choreography, performance, particle behavior, animation
    sequence
---

# Emotion Choreographer

You are an expert in designing emotion behaviors and particle choreography for
the emotive-mascot animation engine.

## When to Use This Skill

- Creating new emotion definitions in `src/config/emotions.js`
- Designing gesture sequences and particle formations
- Building semantic performances (multi-step emotion sequences)
- Troubleshooting emotion transitions and blending
- Optimizing particle physics and movement patterns
- Creating responsive animations that sync with user interactions

## Core Concepts

### Emotion Structure

Every emotion in the emotive-mascot engine has these components:

```javascript
{
  name: 'joy',
  particleCount: 800,           // Number of particles
  speed: { min: 0.5, max: 2.0 }, // Movement speed range
  color: '#FFD700',              // Primary color
  colorVariation: 0.15,          // Color randomness (0-1)
  formation: 'circle',           // Shape: circle, spiral, wave, cluster, etc.
  energy: 0.8,                   // Overall intensity (0-1)
  bounce: 0.3,                   // Bounce intensity (0-1)
  glow: true,                    // Particle glow effect
  trailLength: 5,                // Motion trail (0-20)
  physics: {
    gravity: 0.0,
    friction: 0.95,
    repulsion: 0.5
  }
}
```

### Semantic Performances

Multi-step choreographed sequences:

```javascript
const welcomePerformance = {
    name: 'welcome',
    steps: [
        { emotion: 'anticipation', duration: 800 },
        { emotion: 'joy', duration: 1200, gesture: 'wave' },
        { emotion: 'calm', duration: 1000 },
    ],
    triggers: {
        onStart: mascot => {
            /* optional callback */
        },
        onComplete: mascot => {
            /* optional callback */
        },
    },
};
```

### Available Gestures

**Built-in gestures** (50+ available):

- `wave` - Friendly wave motion
- `bounce` - Bouncy excitement
- `pulse` - Rhythmic pulsing
- `spin` - Spinning rotation
- `explode` - Particle burst
- `contract` - Gather inward
- `shimmer` - Sparkle effect
- `float` - Gentle floating
- `dance` - Rhythmic movement

## Development Workflow

### 1. Define New Emotion

Read `src/config/emotions.js` to see existing emotions, then add:

```javascript
export const emotions = {
    // ... existing emotions

    myNewEmotion: {
        name: 'myNewEmotion',
        particleCount: 600,
        speed: { min: 1.0, max: 3.0 },
        color: '#FF6B9D',
        colorVariation: 0.2,
        formation: 'spiral',
        energy: 0.7,
        bounce: 0.4,
        glow: true,
        trailLength: 8,
        physics: {
            gravity: 0.1,
            friction: 0.92,
            repulsion: 0.6,
        },
    },
};
```

### 2. Test Emotion

Create test file or add to demo:

```javascript
// Test in browser console or demo page
const mascot = window.emotiveMascot;
await mascot.transitionTo('myNewEmotion', { duration: 1000 });
```

### 3. Build Performance

Create semantic performance in `src/core/SemanticPerformanceEngine.js`:

```javascript
this.registerPerformance({
    name: 'celebration',
    steps: [
        { emotion: 'anticipation', duration: 500 },
        { emotion: 'joy', duration: 800, gesture: 'bounce' },
        { emotion: 'excitement', duration: 1000, gesture: 'explode' },
        { emotion: 'joy', duration: 600, gesture: 'shimmer' },
    ],
});
```

### 4. Integrate with LLM

Map to sentiment in `src/plugins/LLMEmotionPlugin.js`:

```javascript
const emotionMapping = {
    celebration: ['celebrate', 'party', 'yay', 'woohoo', 'success'],
    // ... other mappings
};
```

## Key Files

- **Emotions**: `src/config/emotions.js` - All emotion definitions
- **Gestures**: `src/core/GestureEngine.js` - Gesture system
- **Performances**: `src/core/SemanticPerformanceEngine.js` - Multi-step
  sequences
- **Physics**: `src/core/PhysicsEngine.js` - Particle physics
- **Formations**: `src/core/FormationEngine.js` - Particle formations
- **LLM Integration**: `src/plugins/LLMEmotionPlugin.js` - Sentiment mapping

## Design Principles

1. **Smooth Transitions** - Use gradual speed/color changes for natural blending
2. **60fps Target** - Keep particle count under 1000 for smooth performance
3. **Semantic Clarity** - Each emotion should have distinct visual
   characteristics
4. **Energy Conservation** - Balance particle count with movement complexity
5. **Color Psychology** - Use appropriate colors for emotional context

## Common Patterns

### Excited Emotions

- High particle count (800-1000)
- Fast speed (2-4)
- Bright colors
- High energy (0.8-1.0)
- Bounce/explode gestures

### Calm Emotions

- Medium particle count (400-600)
- Slow speed (0.3-1.0)
- Soft colors
- Low energy (0.3-0.5)
- Float/pulse gestures

### Thinking Emotions

- Medium particle count (500-700)
- Variable speed (0.5-2.0)
- Cool colors (blue, purple)
- Medium energy (0.5-0.7)
- Spiral/orbit formations

## Testing Checklist

- [ ] Emotion renders at 60fps on desktop
- [ ] Emotion renders smoothly on mobile (test at 30fps)
- [ ] Transitions from/to other emotions are smooth
- [ ] Colors are visually distinct from similar emotions
- [ ] Gesture completes within expected duration
- [ ] Performance sequence flows naturally
- [ ] No jarring jumps in particle count or speed

## Example: Creating a "Confused" Emotion

```javascript
// 1. Define in emotions.js
confused: {
  name: 'confused',
  particleCount: 600,
  speed: { min: 0.5, max: 2.5 },
  color: '#9B59B6',              // Purple
  colorVariation: 0.25,          // More randomness
  formation: 'scatter',          // Disorganized
  energy: 0.6,
  bounce: 0.2,
  glow: false,
  trailLength: 3,
  physics: {
    gravity: 0.05,
    friction: 0.88,              // Less smooth
    repulsion: 0.7               // More chaotic
  }
}

// 2. Create gesture in GestureEngine.js
registerGesture('questionMark', {
  duration: 1500,
  keyframes: [
    { time: 0, formation: 'scatter' },
    { time: 500, formation: 'arc', rotation: 180 },
    { time: 1000, formation: 'dot', scale: 0.3 },
    { time: 1500, formation: 'scatter' }
  ]
})

// 3. Use in performance
registerPerformance({
  name: 'thinking',
  steps: [
    { emotion: 'calm', duration: 500 },
    { emotion: 'confused', duration: 1200, gesture: 'questionMark' },
    { emotion: 'contemplation', duration: 800 }
  ]
})

// 4. Map in LLM integration
const emotionMapping = {
  confused: ['confused', 'unsure', 'unclear', 'what', 'huh', '?']
}
```

## Troubleshooting

**Emotion feels sluggish**

- Reduce particle count
- Increase friction (0.9-0.95)
- Check for excessive trail length

**Transition is jarring**

- Ensure particle counts are similar
- Use blending duration > 500ms
- Check color difference isn't too extreme

**Gesture not completing**

- Verify duration matches keyframes
- Check formation names are valid
- Ensure gesture is registered before use

**Performance doesn't flow**

- Add transition emotions between extremes
- Use appropriate durations (500-1500ms)
- Test total performance time

## Resources

- [Emotion Config](../../src/config/emotions.js)
- [Gesture Engine](../../src/core/GestureEngine.js)
- [Performance Engine](../../src/core/SemanticPerformanceEngine.js)
- [Formation Types](../../src/core/FormationEngine.js)
- [Color Psychology Guide](../../docs/color-psychology.md)
