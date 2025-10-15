---
title: "Quick Start"
category: "Getting Started"
order: 1
description: "Get up and running with Emotive Engine in 5 minutes"
---

# Quick Start

Get Emotive Engine running in your project in just a few minutes.

## Installation

Install via npm or yarn:

```bash
npm install @joshtol/emotive-engine
```

## Basic Setup

Create a canvas element and initialize the mascot:

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Emotive Mascot</title>
</head>
<body>
    <canvas id="mascot-canvas"></canvas>
    <script type="module" src="main.js"></script>
</body>
</html>
```

```javascript
// main.js
import EmotiveMascot from '@joshtol/emotive-engine'

// Create mascot instance
const mascot = new EmotiveMascot({
  canvasId: 'mascot-canvas',
  emotion: 'neutral',
  particleCount: 100
})

// Initialize and start
await mascot.init(document.getElementById('mascot-canvas'))
mascot.start()

// Express emotions
mascot.setEmotion('joy')
mascot.express('bounce')
```

## Next Steps

- Explore the [API Reference](/docs/api/constructor) for all available options
- Check out [Examples](/docs/examples/basic-setup) for common use cases
- Learn about [Audio Integration](/docs/guides/audio-reactive) for music-reactive mascots

## Common Patterns

### Emotion Buttons

```javascript
const emotions = ['joy', 'anger', 'love', 'fear', 'surprise']

emotions.forEach(emotion => {
  const button = document.createElement('button')
  button.textContent = emotion
  button.onclick = () => mascot.setEmotion(emotion, 0)
  document.body.appendChild(button)
})
```

### Gesture Triggers

```javascript
// Trigger gesture on user interaction
document.addEventListener('click', () => {
  mascot.express('wave')
})
```

### Responsive Sizing

```javascript
// Adjust for mobile
const isMobile = window.innerWidth < 768

mascot.setScale({
  core: isMobile ? 0.6 : 1.0,
  particles: isMobile ? 0.8 : 1.0
})
```
