# Engine Performance Framework

## Semantic Animation System for Conversational AI

### Executive Summary

The retail checkout use case reveals that AI responses should be treated as
**performances** - choreographed sequences of emotion, gesture, timing, and
visual effects that communicate intent universally without overwhelming users.
This document identifies patterns that should be incorporated into the Emotive
Mascot engine to enable developers to create semantic, context-aware animations
without manual choreography.

---

## 1. Core Problem

**Current State:** Developers manually map AI intent to animation sequences:

```typescript
// Application code - manual choreography
if (action === 'celebrate') {
    mascot.setEmotion('joy', 1.0);
    setTimeout(() => mascot.express('bounce'), 200);
    setTimeout(() => {
        mascot.morphTo('sun');
        mascot.chain('radiance');
    }, 800);
}
```

**Desired State:** Engine provides semantic performance API:

```typescript
// Future engine API - semantic
mascot.perform('celebrate', { intensity: 'high', context: { frustration: 0 } });
```

---

## 2. Performance Patterns Observed

### 2.1 Semantic Emotion Mapping

**Pattern:** Each semantic emotion maps to technical emotion + gesture pair

**Current Implementation (AICheckoutAssistant.tsx:208-216):**

```typescript
const emotionMap = {
    joy: { emotion: 'joy', gesture: 'bounce' },
    empathy: { emotion: 'empathy', gesture: 'nod' },
    calm: { emotion: 'calm', gesture: 'breathe' },
    excitement: { emotion: 'excitement', gesture: 'wiggle' },
    concern: { emotion: 'concern', gesture: 'shake' },
    triumph: { emotion: 'triumph', gesture: 'glow' },
    neutral: { emotion: 'neutral', gesture: 'pulse' },
};
```

**Engine Feature Needed:**

```typescript
// Built into engine
mascot.setSemanticEmotion('empathy');
// Internally: setEmotion('empathy') → express('nod')
```

---

### 2.2 Context-Aware Intensity

**Pattern:** Intensity varies based on conversation context (frustration,
urgency, success level)

**Current Implementation (AICheckoutAssistant.tsx:220-222):**

```typescript
const intensity = frustration > 60 ? 1.0 : 0.7;
mascot.setEmotion(emotion, intensity);
```

**Engine Feature Needed:**

```typescript
// Engine API
mascot.perform('empathy', {
    context: {
        frustration: 80,
        urgency: 'high',
    },
});
// Engine automatically sets intensity to 1.0
```

---

### 2.3 Performance Sequences (Choreography)

**Pattern:** Complex responses require multi-step timed sequences

**Current Implementation (AICheckoutAssistant.tsx:230-244):**

```typescript
// Celebration performance
if (action === 'celebrate' && frustration < 20) {
    // Step 1: Base emotion + gesture
    mascot.setEmotion('joy', intensity);
    setTimeout(() => mascot.express('bounce'), 200);

    // Step 2: Climax transformation
    setTimeout(() => {
        mascot.morphTo('sun');
        mascot.chain('radiance');
    }, 800);
}

// Help-offering performance
if (action === 'offer_help' && frustration > 60) {
    mascot.setEmotion('empathy', 1.0);
    setTimeout(() => mascot.express('nod'), 200);
    setTimeout(() => mascot.express('point'), 600);
}
```

**Engine Feature Needed:**

```typescript
// Performance Builder API
mascot.perform('celebrate', {
    sequence: [
        { at: 0, action: 'emotion', value: 'joy', intensity: 0.9 },
        { at: 200, action: 'gesture', value: 'bounce' },
        { at: 800, action: 'morph', value: 'sun' },
        { at: 800, action: 'chain', value: 'radiance' },
    ],
});

// Or use built-in semantic performances
mascot.perform('celebrate');
mascot.perform('offer_urgent_help');
```

---

### 2.4 Conversation States

**Pattern:** Mascot transitions through conversation states with distinct
animations

**Current Implementation (AICheckoutAssistant.tsx:263-266):**

```typescript
// User sends message → listening state
mascot.setEmotion('curiosity', 0.6);
mascot.express('pulse');
```

**Simulation States (CheckoutSimulation.tsx:128-135):**

```typescript
const stepEmotions = [
    { emotion: 'neutral', gesture: 'pulse' }, // Welcome
    { emotion: 'focused', gesture: 'breathe' }, // Scanning
    { emotion: 'satisfaction', gesture: 'drift' }, // Review
    { emotion: 'calm', gesture: 'breathe' }, // Payment
    { emotion: 'anticipation', gesture: 'pulse' }, // Processing
    { emotion: 'triumph', gesture: 'glow' }, // Complete
];
```

**Engine Feature Needed:**

```typescript
// Built-in conversation states
mascot.setState('listening'); // → curiosity + pulse
mascot.setState('thinking'); // → focused + breathe
mascot.setState('responding'); // → Based on response sentiment
mascot.setState('idle'); // → neutral + drift

// Workflow states
mascot.setWorkflowState('processing'); // → anticipation + repeating pulse
mascot.setWorkflowState('success'); // → triumph + glow
mascot.setWorkflowState('error'); // → empathy + shake
```

---

### 2.5 Error/Success Archetypes

**Pattern:** Universal patterns for success and failure feedback

**Current Implementation (CheckoutSimulation.tsx:168-191):**

```typescript
if (scanError) {
    // Error archetype
    mascot.setEmotion('empathy', 1.0);
    mascot.express('shake');
    setTimeout(() => mascot.express('nod'), 600);
} else {
    // Success archetype
    mascot.setEmotion('joy', 0.9);
    mascot.express('bounce');
}
```

**Engine Feature Needed:**

```typescript
// Universal feedback archetypes
mascot.performFeedback('error', {
    severity: 'recoverable', // vs 'critical'
    reassurance: true, // Include comforting gesture
});
// → empathy + shake + nod

mascot.performFeedback('success', {
    magnitude: 'minor', // vs 'major', 'complete'
});
// → joy + bounce (minor)
// → triumph + glow + morph (major)
```

---

### 2.6 Looping Behaviors

**Pattern:** Repeating gestures during waiting/processing states

**Current Implementation (CheckoutSimulation.tsx:214-225):**

```typescript
// Repeating pulse during processing
const pulseInterval = setInterval(() => {
    mascot.express('pulse');
}, 1000);

setTimeout(() => {
    clearInterval(pulseInterval);
}, 2500);
```

**Engine Feature Needed:**

```typescript
// Engine manages looping
mascot.startLoop('pulse', { interval: 1000 });

// Later...
mascot.stopLoop();

// Or with auto-timeout
mascot.performLoop('pulse', {
    interval: 1000,
    duration: 2500,
});
```

---

### 2.7 Climactic Moments (Crescendo System)

**Pattern:** Build to climactic celebrations for major milestones

**Current Implementation (CheckoutSimulation.tsx:233-245):**

```typescript
// Transaction complete → big celebration
mascot.setEmotion('triumph', 1.0);
mascot.express('glow');

setTimeout(() => {
    mascot.morphTo('sun');
    mascot.chain('radiance');
}, 500);
```

**Engine Feature Needed:**

```typescript
// Crescendo performance
mascot.performClimax('transaction_complete');
// → Automatically builds: triumph + glow → morph sun + radiance

// Configurable intensity
mascot.performClimax('milestone', {
    magnitude: 'epic', // vs 'moderate', 'small'
});
```

---

## 3. Proposed Engine API

### 3.1 Performance System

```typescript
interface PerformanceOptions {
  intensity?: number | 'auto'
  context?: {
    frustration?: number      // 0-100
    urgency?: 'low' | 'medium' | 'high'
    magnitude?: 'small' | 'moderate' | 'major' | 'epic'
  }
  timing?: {
    speed?: number           // 0.5 = slower, 2.0 = faster
    delay?: number           // Initial delay in ms
  }
}

// Semantic performance
mascot.perform(semanticAction: string, options?: PerformanceOptions): void

// Examples
mascot.perform('celebrate')
mascot.perform('empathize', { context: { frustration: 80 } })
mascot.perform('guide', { intensity: 0.7 })
```

### 3.2 Built-in Semantic Performances

```typescript
// Conversational
'listening'; // curiosity + pulse
'thinking'; // focused + breathe
'acknowledging'; // calm + nod
'guiding'; // calm + point
'empathizing'; // empathy + shake → nod
'celebrating'; // joy + bounce → (triumph + glow + morph sun)
'reassuring'; // calm + breathe → wave

// Feedback
'success_minor'; // joy + bounce
'success_major'; // triumph + glow
'success_epic'; // triumph + glow → morph sun + radiance
'error_minor'; // concern + shake
'error_major'; // empathy + shake → nod
'error_critical'; // empathy (high intensity) + shake → point

// States
'idle'; // neutral + drift
'waiting'; // anticipation + repeating pulse
'processing'; // focused + repeating breathe
'ready'; // neutral + wave
```

### 3.3 Conversation State Management

```typescript
// Automatic state tracking
mascot.onConversationStateChange(state => {
    // Engine automatically performs appropriate animation
});

// Manual state control
mascot.setConversationState('listening');
mascot.setConversationState('responding', {
    sentiment: 'positive', // negative, neutral
    intent: 'guide', // celebrate, empathize, inform
});
```

### 3.4 Feedback Archetypes

```typescript
interface FeedbackOptions {
  type: 'success' | 'error' | 'warning' | 'info'
  magnitude: 'small' | 'moderate' | 'major' | 'epic'
  reassurance?: boolean  // Add comforting gesture
  urgency?: 'low' | 'medium' | 'high'
}

mascot.performFeedback(options: FeedbackOptions): void

// Examples
mascot.performFeedback({
  type: 'success',
  magnitude: 'major'
})

mascot.performFeedback({
  type: 'error',
  magnitude: 'moderate',
  reassurance: true
})
```

### 3.5 Sequence Builder (Advanced)

```typescript
interface PerformanceStep {
    at: number; // Timestamp in ms
    action: 'emotion' | 'gesture' | 'morph' | 'chain' | 'sound';
    value: string;
    intensity?: number;
    options?: any;
}

// Custom sequences
mascot.performSequence([
    { at: 0, action: 'emotion', value: 'joy', intensity: 0.8 },
    { at: 200, action: 'gesture', value: 'bounce' },
    { at: 800, action: 'morph', value: 'sun' },
    { at: 800, action: 'chain', value: 'radiance' },
]);

// Named custom performances
mascot.definePerformance('custom_celebration', [
    { at: 0, action: 'emotion', value: 'excitement', intensity: 1.0 },
    { at: 100, action: 'gesture', value: 'wiggle' },
    { at: 600, action: 'gesture', value: 'bounce' },
    { at: 1200, action: 'chain', value: 'sparkle' },
]);

mascot.perform('custom_celebration');
```

### 3.6 Context-Aware Auto-Modulation

```typescript
// Engine automatically adjusts based on context
mascot.setContext({
    frustrationLevel: 85,
    urgency: 'high',
    previousErrors: 3,
});

// Now performances auto-adjust
mascot.perform('empathize');
// → Automatically uses intensity: 1.0, adds reassurance gestures
```

---

## 4. Universal Performance Semantics

### 4.1 Conversational Intent Mapping

| AI Intent         | Emotion       | Primary Gesture | Secondary Gesture | Use Case               |
| ----------------- | ------------- | --------------- | ----------------- | ---------------------- |
| **Greeting**      | neutral/joy   | wave            | -                 | Initial contact        |
| **Listening**     | curiosity     | pulse           | -                 | User is speaking       |
| **Thinking**      | focused       | breathe         | -                 | AI is processing       |
| **Understanding** | calm          | nod             | -                 | Acknowledging input    |
| **Guiding**       | calm          | point           | breathe           | Giving instructions    |
| **Empathizing**   | empathy       | shake           | nod               | User is frustrated     |
| **Celebrating**   | joy → triumph | bounce          | glow → morph      | Success/completion     |
| **Reassuring**    | calm          | breathe         | wave              | Calming user           |
| **Apologizing**   | empathy       | shake           | breathe           | Acknowledging mistake  |
| **Encouraging**   | joy           | nod             | bounce            | Positive reinforcement |

### 4.2 Feedback Response Mapping

| Outcome                 | Emotion       | Gesture | Escalation           | Context              |
| ----------------------- | ------------- | ------- | -------------------- | -------------------- |
| **Success (Minor)**     | joy           | bounce  | -                    | Item scanned         |
| **Success (Major)**     | triumph       | glow    | -                    | Section complete     |
| **Success (Epic)**      | triumph       | glow    | morph sun + radiance | Transaction complete |
| **Error (Recoverable)** | concern       | shake   | -                    | Scan failed, retry   |
| **Error (Needs Help)**  | empathy       | shake   | nod → point          | User frustrated      |
| **Error (Critical)**    | empathy (1.0) | shake   | point + alert        | System failure       |
| **Warning**             | concern       | pulse   | -                    | Low balance alert    |
| **Info**                | neutral       | drift   | -                    | Passive notification |

### 4.3 Workflow State Mapping

| Workflow State | Emotion      | Gesture | Loop?      | Example            |
| -------------- | ------------ | ------- | ---------- | ------------------ |
| **Idle**       | neutral      | drift   | yes (slow) | Waiting for user   |
| **Ready**      | neutral      | wave    | no         | System ready       |
| **Processing** | anticipation | pulse   | yes (1s)   | Payment processing |
| **Scanning**   | focused      | breathe | yes (slow) | Barcode scan       |
| **Reviewing**  | satisfaction | drift   | no         | Cart review        |
| **Completing** | triumph      | glow    | no         | Final step         |

---

## 5. Implementation Priority

### Phase 1: Core Performance System

1. **Semantic performance mapping** - Built-in emotion→gesture pairs
2. **Perform API** - `mascot.perform(semantic, options)`
3. **Context intensity** - Auto-adjust based on frustration/urgency
4. **Built-in performances** - 10-15 universal semantics

### Phase 2: State Management

1. **Conversation states** - listening, thinking, responding, idle
2. **Workflow states** - processing, success, error
3. **Auto-transitions** - Engine manages state changes
4. **State callbacks** - `onStateChange` events

### Phase 3: Advanced Choreography

1. **Sequence builder** - Custom performance sequences
2. **Looping system** - Managed repeating gestures
3. **Crescendo system** - Climactic celebrations
4. **Custom definitions** - `definePerformance()`

### Phase 4: AI Integration

1. **LLM response parsing** - Extract intent/sentiment automatically
2. **Auto-performance** - AI response → automatic performance
3. **Context tracking** - Engine tracks conversation history
4. **Adaptive responses** - Learn user preferences

---

## 6. Developer Experience

### Current (Manual Choreography)

```typescript
// Developer writes 50+ lines per interaction
const handleResponse = aiData => {
    if (aiData.action === 'celebrate') {
        mascot.setEmotion('joy', aiData.frustration > 20 ? 0.7 : 1.0);
        setTimeout(() => {
            mascot.express('bounce');
        }, 200);
        if (aiData.frustration < 20) {
            setTimeout(() => {
                mascot.morphTo('sun');
                mascot.chain('radiance');
            }, 800);
        }
    } else if (aiData.action === 'offer_help') {
        const intensity = aiData.frustration > 60 ? 1.0 : 0.7;
        mascot.setEmotion('empathy', intensity);
        setTimeout(() => {
            mascot.express('nod');
        }, 200);
        if (aiData.frustration > 60) {
            setTimeout(() => {
                mascot.express('point');
            }, 600);
        }
    }
    // ... 10 more branches
};
```

### Future (Semantic API)

```typescript
// Developer writes 1 line per interaction
const handleResponse = aiData => {
    mascot.perform(aiData.action, {
        context: { frustration: aiData.frustrationLevel },
    });
};
```

**Line reduction:** ~95% less code **Consistency:** Universal semantics across
all apps **Maintenance:** Engine updates improve all apps

---

## 7. Performance Principles

### 7.1 Non-Overwhelming

- **Subtle by default**: Low intensity for routine interactions
- **Escalate intentionally**: Higher intensity only for high-frustration or
  climactic moments
- **Smooth transitions**: No jarring changes
- **Respect attention**: Don't distract from primary task

### 7.2 Universal Communication

- **Cross-cultural**: Gestures understood globally
- **Accessibility**: Clear without sound/color
- **Intuitive**: Matches human emotional expression
- **Consistent**: Same meaning across contexts

### 7.3 Intent Expression

- **Empathy visible**: Show AI understands user state
- **Guidance clear**: Point, nod, wave for direction
- **Feedback immediate**: Instant response to actions
- **Celebration earned**: Big reactions for big moments

### 7.4 Performance as Communication

- **AI is performing**: Every response is choreographed
- **Timing matters**: Delays create anticipation
- **Crescendo builds**: Small → medium → epic
- **Context shapes performance**: Same semantic, different execution

---

## 8. Example Use Cases

### 8.1 Retail Checkout (Current)

```typescript
// Scan success
mascot.perform('success_minor');

// Scan error
mascot.perform('error_minor', { reassurance: true });

// Transaction complete
mascot.perform('success_epic');

// User frustrated
mascot.perform('empathize', { context: { frustration: 90 } });
```

### 8.2 Customer Support

```typescript
// Ticket received
mascot.perform('acknowledging');

// Investigating issue
mascot.setWorkflowState('processing'); // → looping breathe

// Solution found
mascot.perform('success_major');

// Escalation needed
mascot.perform('error_major', { reassurance: true });
```

### 8.3 Education

```typescript
// Answer correct
mascot.perform('celebrating');

// Answer incorrect
mascot.perform('reassuring');

// Hint given
mascot.perform('guiding');

// Lesson complete
mascot.perform('success_epic');
```

### 8.4 Healthcare

```typescript
// Appointment confirmed
mascot.perform('success_moderate');

// Waiting for doctor
mascot.setWorkflowState('waiting');

// Results ready
mascot.perform('info'); // Neutral delivery

// Good news
mascot.perform('celebrating');

// Serious discussion
mascot.perform('empathizing', { intensity: 0.8 });
```

---

## 9. Benefits

### For Developers

- **95% less animation code**
- **Consistent UX** across all implementations
- **Faster development** - focus on AI logic, not choreography
- **Better maintainability** - engine updates improve all apps
- **Semantic clarity** - code reads like intent

### For Users

- **Predictable responses** - same gestures mean same things
- **Appropriate intensity** - not overwhelming, not boring
- **Emotional connection** - AI feels aware and responsive
- **Universal understanding** - works across languages/cultures
- **Professional polish** - expert-choreographed performances

### For Business

- **Faster time-to-market** - less custom animation work
- **Lower cost** - reusable performance library
- **Better retention** - emotionally engaging experiences
- **Brand consistency** - controlled emotional expression
- **Competitive advantage** - premium feel out-of-box

---

## 10. Next Steps

### Research & Design

1. **Interview developers** - Validate semantic naming
2. **User testing** - Confirm universal understanding
3. **Cultural review** - Ensure global appropriateness
4. **Performance catalog** - Document all built-in performances

### Implementation

1. **Core API** - `perform()`, context system
2. **Built-in library** - 15-20 semantic performances
3. **Documentation** - Performance catalog, examples
4. **Migration guide** - Help existing apps adopt semantic API

### Validation

1. **Reference implementations** - Rebuild retail/support examples
2. **Developer preview** - Beta test with partners
3. **Performance testing** - Measure frame rates, timing accuracy
4. **A/B testing** - Compare manual vs semantic UX

---

## Summary

The retail checkout example demonstrates that **AI responses should be
performances** - carefully choreographed sequences that communicate intent
universally and appropriately. By building a **Semantic Performance System**
into the Emotive Mascot engine, we enable:

1. **Developer Efficiency**: 1 line instead of 50
2. **Universal Semantics**: "Celebrating" means the same everywhere
3. **Context Awareness**: Automatically adjust to user state
4. **Professional Polish**: Expert choreography built-in
5. **Emotional Intelligence**: AI intent expressed visually

**The engine should translate conversation semantics into animation
performances, allowing developers to focus on AI logic while the mascot handles
emotional expression automatically.**
