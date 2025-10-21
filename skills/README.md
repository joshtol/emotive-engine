# Emotive Mascot Development Skills

A collection of specialized Claude Code skills for developing with the
emotive-mascot animation engine.

## Overview

These skills provide expert guidance and code patterns for common tasks when
working with the emotive-mascot platform. Each skill is optimized for specific
development scenarios and automatically activates based on trigger keywords.

## Installation

### Option 1: Local Installation

1. Clone this repository or copy the `skills/` folder
2. Place in your Claude Code skills directory:
    - **macOS/Linux**: `~/.claude/skills/emotive-mascot-skills/`
    - **Windows**: `%USERPROFILE%\.claude\skills\emotive-mascot-skills\`

3. Restart Claude Code or reload skills

### Option 2: Plugin Marketplace (Coming Soon)

Once published to the Claude Code plugin marketplace, install with:

```bash
claude install emotive-mascot-skills
```

## Available Skills

### 1. Emotion Choreographer

**Use when**: Creating new emotions, designing gestures, building semantic
performances

**Triggers**: emotion, gesture, choreography, performance, particle behavior,
animation sequence

**What it does**:

- Guides you through emotion structure and parameters
- Provides patterns for gesture design
- Shows how to build multi-step semantic performances
- Helps optimize particle physics and formations
- Includes testing checklist and troubleshooting guide

**Example tasks**:

- "Create a new 'confused' emotion with purple particles"
- "Design a wave gesture that lasts 1.5 seconds"
- "Build a 'celebration' performance with 3 emotion steps"

---

### 2. Mascot Integrator

**Use when**: Adding mascot to new pages, frameworks, or use cases

**Triggers**: integrate, add mascot, setup, implementation, use case, framework

**What it does**:

- Provides framework-specific setup patterns (React, Vue, vanilla JS)
- Shows use case integration examples (retail, healthcare, education, smart
  home)
- Includes configuration options and best practices
- Troubleshoots common integration issues

**Example tasks**:

- "Add mascot to my Next.js page"
- "Integrate mascot into a retail checkout flow"
- "Set up gaze tracking and scroll reactivity"

---

### 3. Performance Auditor

**Use when**: Diagnosing performance issues, optimizing for 60fps, reducing
bundle size

**Triggers**: performance, optimization, fps, lag, slow, bundle size, mobile
performance

**What it does**:

- Diagnoses frame rate drops and stuttering
- Provides optimization techniques for particle systems
- Shows how to implement adaptive quality
- Includes profiling scripts and performance monitoring
- Guides bundle size reduction

**Example tasks**:

- "Why is my mascot running at 30fps on desktop?"
- "Optimize particle count for mobile devices"
- "Reduce bundle size to under 200KB"

---

### 4. Theme Implementer

**Use when**: Applying color schemes, creating visual variants, A/B testing
themes

**Triggers**: theme, color scheme, visual design, branding, color palette,
styling

**What it does**:

- Implements CSS variable-based theming
- Creates theme switcher components
- Shows how to sync mascot colors with themes
- Provides A/B testing implementation
- Ensures accessibility (WCAG contrast ratios)

**Example tasks**:

- "Apply the warm orange theme to all pages"
- "Create a theme switcher in the header"
- "Implement A/B testing for color schemes"

---

### 5. LLM Integrator

**Use when**: Connecting AI services, implementing chat, creating emotion-aware
conversations

**Triggers**: llm, ai, claude, gpt, chatbot, sentiment analysis, conversation,
api integration

**What it does**:

- Sets up Claude/GPT API integration
- Implements sentiment detection
- Maps sentiments to mascot emotions
- Provides context-aware emotion responses
- Includes rate limiting and caching patterns

**Example tasks**:

- "Integrate Claude API for the retail assistant"
- "Detect sentiment and trigger mascot emotions"
- "Add streaming responses with real-time emotion changes"

---

### 6. Semantic Performance Builder

**Use when**: Creating choreographed emotion sequences, designing complex
interactions

**Triggers**: semantic performance, sequence, choreography, multi-step

**What it does**:

- Designs multi-emotion sequences
- Times transitions and gestures
- Creates context-appropriate performances
- Tests performance flow and timing

**Example tasks**:

- "Build a 'welcome' performance for the homepage hero"
- "Create an 'error recovery' sequence for checkout"
- "Design a 'celebration' performance for quiz completion"

---

### 7. Use Case Generator

**Use when**: Creating new demo pages, implementing industry-specific scenarios

**Triggers**: use case, demo, industry, scenario, example

**What it does**:

- Generates complete use case implementations
- Provides industry-specific patterns
- Creates appropriate emotion mappings
- Includes interaction handlers and UI

**Example tasks**:

- "Create a banking chatbot use case"
- "Build a restaurant ordering demo"
- "Implement a fitness coaching scenario"

---

### 8. Bundle Optimizer

**Use when**: Reducing package size, optimizing builds, analyzing dependencies

**Triggers**: bundle, package, size, optimization, tree-shaking

**What it does**:

- Analyzes bundle composition
- Implements code splitting
- Optimizes Rollup/Webpack config
- Removes unused dependencies

**Example tasks**:

- "Analyze what's making my bundle large"
- "Implement dynamic imports for audio module"
- "Reduce gzipped size to under 200KB"

## Usage Examples

### Activating Skills

Skills activate automatically based on your messages. Just describe what you
want to do:

```
You: "I want to create a new 'excited' emotion with orange particles"
Claude: [Activates emotion-choreographer skill]
```

```
You: "How do I add the mascot to my React app?"
Claude: [Activates mascot-integrator skill]
```

```
You: "The mascot is laggy on mobile"
Claude: [Activates performance-auditor skill]
```

### Combining Skills

Skills work together for complex tasks:

```
You: "Create a retail checkout use case with Claude integration"
Claude: [Activates use-case-generator + llm-integrator + mascot-integrator]
```

## Skill Development

### Creating New Skills

To add a new skill to this collection:

1. Create a new directory: `skills/your-skill-name/`
2. Add `SKILL.md` with YAML frontmatter:

```yaml
---
name: your-skill-name
description: Brief description of when to use this skill
trigger: keyword1, keyword2, keyword3
---
# Your Skill Name

You are an expert in [domain].
## When to Use This Skill
---
## Key Concepts
---
## Code Examples
```

3. Update `.claude-plugin/plugin.json` to include your skill
4. Test the skill with sample queries

### Skill Best Practices

- **Clear triggers**: Use specific keywords that users would naturally say
- **Actionable examples**: Provide copy-paste code snippets
- **File references**: Link to actual files in the codebase
- **Troubleshooting**: Include common issues and solutions
- **Testing**: Provide test scripts and validation steps

## Project Context

These skills are designed for the **emotive-mascot** animation engine:

- **Repository**: https://github.com/joshtol/emotive-engine
- **License**: Proprietary (SEE LICENSE IN LICENSE.md)
- **Tech Stack**: Canvas 2D, TypeScript, React/Next.js
- **Target**: 60fps particle-based emotional mascot animations
- **Bundle Size**: 234KB gzipped (full), 120KB (minimal)

## Architecture

```
emotive-mascot/
├── src/                    # Core engine source
│   ├── core/              # Animation engines
│   ├── config/            # Emotion configs
│   ├── plugins/           # LLM, audio plugins
│   └── utils/             # Helpers
├── site/                  # Next.js demo site
│   ├── src/app/           # Pages and routes
│   ├── src/components/    # React components
│   └── tests/             # Playwright tests
├── dist/                  # Built bundles
└── skills/                # This skills directory
    ├── emotion-choreographer/
    ├── mascot-integrator/
    ├── performance-auditor/
    ├── theme-implementer/
    ├── llm-integrator/
    ├── semantic-performance-builder/
    ├── use-case-generator/
    └── bundle-optimizer/
```

## Key Technologies

- **Canvas 2D API**: Rendering engine
- **Particle Physics**: Custom physics simulation
- **Emotion Engine**: 15+ core emotions
- **Gesture System**: 50+ gestures
- **LLM Integration**: Claude/GPT sentiment detection
- **Framework Support**: React, Vue, Svelte, vanilla JS

## Performance Targets

- **Desktop**: 60 FPS with 800-1000 particles
- **Mobile**: 30-60 FPS adaptive with 400-600 particles
- **Bundle**: < 250 KB gzipped
- **Memory**: < 100 MB peak usage

## Contributing

To contribute new skills or improvements:

1. Fork the repository
2. Create a new skill in `skills/`
3. Add comprehensive documentation and examples
4. Test the skill with real scenarios
5. Submit a pull request

## Support

- **Documentation**: `docs/` directory in main repository
- **Issues**: https://github.com/joshtol/emotive-engine/issues
- **Examples**: `site/src/app/use-cases/` for working demos

## License

SEE LICENSE IN LICENSE.md

These skills are provided as development tools for the emotive-mascot platform
and follow the same licensing as the main project.

---

Made with Claude Code - Specialized skills for emotive development
