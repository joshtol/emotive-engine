---
name: use-case-generator
description:
    Generate complete use case implementations for specific industries and
    scenarios. Use when creating new demo pages, implementing industry-specific
    mascot integrations, or exploring new application areas.
trigger: use case, demo, industry, scenario, example, implementation
---

# Use Case Generator

You are an expert in creating industry-specific use case implementations for the
emotive-mascot platform.

## When to Use This Skill

- Creating new demo pages for specific industries
- Implementing mascot for client use cases
- Exploring new application areas
- Building proof-of-concept implementations
- Generating industry-specific emotion mappings

## Available Use Case Templates

We have 4 fully implemented use cases you can reference:

### 1. Retail Checkout

**Location**: `site/src/app/use-cases/retail/`

**Features**:

- Item scanning simulation
- Payment processing flow
- AI checkout assistant (Claude integration)
- Error handling and recovery
- Success celebrations

**Emotions**: calm → anticipation (scanning) → joy (success) → concern (error)

---

### 2. Smart Home Dashboard

**Location**: `site/src/app/use-cases/smart-home/`

**Features**:

- Device control interface
- Voice command simulation
- Status monitoring
- AI home assistant
- Multi-device management

**Emotions**: calm → focus (listening) → anticipation (processing) → joy
(success)

---

### 3. Healthcare Patient Intake

**Location**: `site/src/app/use-cases/healthcare/`

**Features**:

- Form validation
- Sensitive data handling
- Privacy reassurance
- AI patient assistant
- Empathetic interactions

**Emotions**: calm → empathy (concerns) → reassurance (explaining) → gratitude
(complete)

---

### 4. Education Learning Platform

**Location**: `site/src/app/use-cases/education/`

**Features**:

- Quiz interface
- Progress tracking
- AI tutor assistant
- Hint system
- Celebration for correct answers

**Emotions**: calm → contemplation (thinking) → pride (correct) → encouragement
(incorrect)

## Generating New Use Cases

### Step 1: Define the Scenario

```typescript
// Define your use case
const useCase = {
    industry: 'banking', // or retail, healthcare, education, etc.
    context: 'loan-application',
    userGoal: 'Complete loan application form',
    painPoints: [
        'Complex forms',
        'Unclear requirements',
        'Anxiety about approval',
    ],
    mascotRole: 'Supportive guide and reassurance provider',
};
```

### Step 2: Map Emotions to User Journey

```typescript
const emotionJourney = {
    onboarding: 'calm', // User arrives
    formStart: 'encouragement', // User begins
    complexQuestion: 'empathy', // User confused
    validation: 'concern', // Error occurred
    corrected: 'encouragement', // User fixed error
    submission: 'anticipation', // Processing
    approval: 'celebration', // Success!
    rejection: 'empathy', // Support needed
};
```

### Step 3: Create Page Structure

```typescript
// site/src/app/use-cases/[industry]/page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import PremiumAIAssistant from '@/components/PremiumAIAssistant'

export default function IndustryUseCasePage() {
  const [mascot, setMascot] = useState(null)
  const [showAI, setShowAI] = useState(false)
  const [userProgress, setUserProgress] = useState('start')

  // Initialize mascot
  useEffect(() => {
    const initMascot = async () => {
      const { EmotiveMascot } = await import('@joshtol/emotive-engine')
      const m = new EmotiveMascot({
        canvas: canvasRef.current,
        initialEmotion: 'calm',
        enableGazeTracking: true
      })
      await m.initialize()
      setMascot(m)
    }
    initMascot()
  }, [])

  // Emotion handlers
  const handleUserAction = async (action: string) => {
    const emotion = emotionJourney[action]
    await mascot?.transitionTo(emotion, { duration: 1000 })
  }

  return (
    <div>
      {/* Canvas */}
      <canvas ref={canvasRef} />

      {/* Your UI */}
      <YourIndustrySpecificUI onAction={handleUserAction} />

      {/* AI Assistant */}
      {showAI && (
        <PremiumAIAssistant
          title="Your Assistant"
          context={useCase.context}
          onLLMResponse={(emotion) => mascot?.transitionTo(emotion)}
          onClose={() => setShowAI(false)}
        />
      )}
    </div>
  )
}
```

## Industry-Specific Patterns

### Financial Services

- **Key emotions**: calm, reassurance, empathy, trust
- **Triggers**: Form complexity, data privacy concerns, approval anxiety
- **Mascot role**: Confidence builder, guide

### E-Commerce

- **Key emotions**: joy, excitement, anticipation, gratitude
- **Triggers**: Product discovery, cart interactions, checkout success
- **Mascot role**: Shopping companion, celebration enhancer

### Healthcare

- **Key emotions**: empathy, calm, reassurance, gratitude
- **Triggers**: Sensitive questions, privacy concerns, anxiety
- **Mascot role**: Empathetic supporter, privacy guardian

### Education

- **Key emotions**: encouragement, pride, contemplation, joy
- **Triggers**: Correct/incorrect answers, hints requested, progress
- **Mascot role**: Patient tutor, achievement celebrator

### Customer Support

- **Key emotions**: focus, empathy, concern, gratitude
- **Triggers**: Issue reporting, troubleshooting, resolution
- **Mascot role**: Problem solver, empathetic listener

## Quick Start Template

Use this template to quickly scaffold a new use case:

```bash
# Create new use case directory
mkdir -p site/src/app/use-cases/your-industry

# Copy from existing template
cp -r site/src/app/use-cases/retail/* site/src/app/use-cases/your-industry/

# Customize for your industry
# - Update emotion mappings
# - Modify UI components
# - Adjust AI assistant prompts
# - Add industry-specific interactions
```

## Resources

- [Existing Use Cases](../../site/src/app/use-cases/)
- [Mascot Integrator Skill](../mascot-integrator/SKILL.md)
- [LLM Integrator Skill](../llm-integrator/SKILL.md)
- [Emotion Choreographer Skill](../emotion-choreographer/SKILL.md)
