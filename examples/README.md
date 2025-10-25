# Emotive Engine Examples

Welcome to the Emotive Engine examples gallery! This directory contains working
examples demonstrating various features and integration patterns.

## Quick Start

All examples are self-contained HTML files that you can open directly in your
browser.

```bash
# Serve examples locally
cd examples
python -m http.server 8000
# Open http://localhost:8000 in your browser
```

---

## Examples by Category

### 🚀 Getting Started

#### [vanilla-js.html](./vanilla-js.html)

**Basic vanilla JavaScript integration**

- Simplest possible setup
- Create mascot, set emotions, trigger gestures
- Perfect for beginners
- ~50 lines of code

**What you'll learn**:

- How to import and initialize Emotive Engine
- Basic emotion control
- Simple gesture triggers

```javascript
import EmotiveMascot from './dist/mascot.js';
const mascot = new EmotiveMascot({ canvasId: 'mascot' });
mascot.start();
mascot.setEmotion('joy');
```

---

#### [basic-usage.html](./basic-usage.html)

**Complete basic usage example**

- Interactive controls for all core features
- Emotion selection dropdown
- Gesture trigger buttons
- Shape morphing controls

**What you'll learn**:

- Complete API surface area
- UI integration patterns
- Event handling

---

### 🎭 Emotions & Gestures

#### [custom-gesture.html](./custom-gesture.html)

**Create custom gestures and animations**

- Define custom gesture animations
- Combine multiple gestures
- Create choreographed sequences

**What you'll learn**:

- Gesture system architecture
- How to extend built-in gestures
- Animation timing and coordination

```javascript
mascot.registerGesture('celebrate', {
    duration: 2000,
    sequence: ['bounce', 'spin', 'pulse'],
});
```

---

#### [breathing-app.html](./breathing-app.html)

**Breathing exercise guided meditation**

- Real-world wellness application
- Timed breathing patterns
- Smooth emotion transitions
- Audio integration

**What you'll learn**:

- Building complete applications
- Timing and rhythm coordination
- Using mascot for guided experiences

---

### 🎵 Audio & Music

#### [rhythm-sync-demo.html](./rhythm-sync-demo.html)

**Music-reactive animations**

- Connect to audio source
- Beat detection and BPM tracking
- Audio-reactive particle behaviors
- FFT visualization

**What you'll learn**:

- Audio integration API
- Beat-synchronized animations
- Music theory integration (bars, beats, phrases)

```javascript
const audio = document.getElementById('music');
mascot.connectAudio(audio);
// Mascot now dances to the beat!
```

---

### 🎯 Event Handling

#### [event-handling.html](./event-handling.html)

**Listen to mascot events**

- State change events
- Gesture completion events
- Morph completion events
- Beat detection events

**What you'll learn**:

- Event system API
- Building reactive UIs
- Coordinating with other components

```javascript
mascot.on('gestureComplete', gesture => {
    console.log(`Finished: ${gesture}`);
});
```

---

### ⚛️ Framework Integrations

#### [react-component.jsx](./react-component.jsx)

**React component wrapper**

- TypeScript/JSX integration
- React hooks integration
- Lifecycle management
- Props-driven configuration

**What you'll learn**:

- React best practices
- Ref management for canvas
- State synchronization

```jsx
function MascotWidget({ emotion }) {
    const mascotRef = useEmotiveMascot({ emotion });
    return <canvas ref={mascotRef} />;
}
```

---

#### [vue-component.vue](./vue-component.vue)

**Vue 3 component wrapper**

- Composition API
- Template refs
- Reactive props
- Lifecycle hooks

**What you'll learn**:

- Vue 3 integration patterns
- Reactive state management
- Component composition

---

### 🤖 AI Integration

#### [llm-integration/](./llm-integration/)

**Connect mascot to LLM responses**

- OpenAI/Anthropic Claude integration
- Sentiment analysis → emotion mapping
- Streaming response visualization
- Token-by-token animation

**What you'll learn**:

- AI assistant integration
- Real-time emotion updates
- Sentiment detection
- WebSocket/SSE handling

**Examples in this directory**:

- `openai-chatgpt.html` - ChatGPT integration
- `anthropic-claude.html` - Claude integration
- `sentiment-mapper.js` - Sentiment → emotion mapping
- `streaming-handler.js` - Handle streaming responses

---

## Example Templates

### Minimal Template

```html
<!DOCTYPE html>
<html>
    <head>
        <title>Emotive Mascot Example</title>
    </head>
    <body>
        <canvas id="mascot" width="800" height="600"></canvas>

        <script type="module">
            import EmotiveMascot from '../dist/mascot.js';

            const mascot = new EmotiveMascot({
                canvasId: 'mascot',
                emotion: 'neutral',
            });

            mascot.start();

            // Your code here
        </script>
    </body>
</html>
```

### React Template

```jsx
import { useEmotiveMascot } from '@joshtol/emotive-engine/react';

function App() {
    const [emotion, setEmotion] = useState('neutral');
    const canvasRef = useEmotiveMascot({ emotion });

    return (
        <div>
            <canvas ref={canvasRef} width={800} height={600} />
            <button onClick={() => setEmotion('joy')}>Happy</button>
        </div>
    );
}
```

---

## Running Examples Locally

### Option 1: Static Server

```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve .

# VS Code
# Install "Live Server" extension and click "Go Live"
```

### Option 2: Development Server

```bash
# From repo root
npm run dev
# Examples served at http://localhost:3000/examples
```

---

## Creating Your Own Example

1. **Copy a template** from above
2. **Modify** the configuration and interactions
3. **Test** locally with a static server
4. **Share** via pull request (optional)

### Example Contribution Guidelines

If submitting a new example:

- [ ] Self-contained single HTML file (or clear directory structure)
- [ ] Includes code comments explaining key concepts
- [ ] Works standalone without external dependencies (except Emotive Engine)
- [ ] Mobile-responsive (if applicable)
- [ ] Adds entry to this README

---

## Common Patterns

### Pattern 1: UI-Driven Emotions

```javascript
document.getElementById('btn-joy').addEventListener('click', () => {
    mascot.setEmotion('joy');
});
```

### Pattern 2: AI-Driven Emotions

```javascript
async function updateFromAI(message) {
    const sentiment = await analyzeSentiment(message);
    const emotion = sentimentToEmotion(sentiment);
    mascot.setEmotion(emotion);
}
```

### Pattern 3: Music-Reactive

```javascript
const audio = document.getElementById('player');
mascot.connectAudio(audio);
// Mascot automatically syncs to music
```

### Pattern 4: Event-Driven Gestures

```javascript
mascot.on('stateChange', ({ emotion }) => {
    if (emotion === 'joy') {
        mascot.express('bounce');
    }
});
```

---

## Debugging Examples

### Enable Debug Mode

```javascript
const mascot = new EmotiveMascot({
    canvasId: 'mascot',
    debug: true, // Enables console logging
});
```

### Check Performance

```javascript
mascot.on('frameRendered', ({ fps }) => {
    console.log(`Current FPS: ${fps}`);
});
```

### Visualize State

```javascript
setInterval(() => {
    console.log(mascot.getState());
}, 1000);
```

---

## Browser Compatibility

All examples work in:

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

Mobile:

- ✅ iOS Safari 14+
- ✅ Chrome Android 90+

---

## Resources

- **[API Documentation](../docs/api/README.md)** - Complete API reference
- **[Getting Started Guide](../docs/guides/quick-start.md)** - Step-by-step
  tutorial
- **[Main README](../README.md)** - Project overview
- **[GitHub Issues](https://github.com/joshtol/emotive-engine/issues)** - Ask
  questions

---

## Example Index

| Example                                          | Category        | Difficulty        | Features          |
| ------------------------------------------------ | --------------- | ----------------- | ----------------- |
| [vanilla-js.html](./vanilla-js.html)             | Getting Started | ⭐ Beginner       | Basic setup       |
| [basic-usage.html](./basic-usage.html)           | Getting Started | ⭐ Beginner       | Complete API      |
| [custom-gesture.html](./custom-gesture.html)     | Gestures        | ⭐⭐ Intermediate | Custom animations |
| [breathing-app.html](./breathing-app.html)       | Application     | ⭐⭐ Intermediate | Wellness app      |
| [rhythm-sync-demo.html](./rhythm-sync-demo.html) | Audio           | ⭐⭐⭐ Advanced   | Music sync        |
| [event-handling.html](./event-handling.html)     | Events          | ⭐⭐ Intermediate | Event system      |
| [react-component.jsx](./react-component.jsx)     | Frameworks      | ⭐⭐ Intermediate | React integration |
| [vue-component.vue](./vue-component.vue)         | Frameworks      | ⭐⭐ Intermediate | Vue 3 integration |
| [llm-integration/](./llm-integration/)           | AI              | ⭐⭐⭐ Advanced   | LLM integration   |

---

## Contributing Examples

Have a cool use case? We'd love to see it!

1. Create your example
2. Add it to the appropriate category
3. Update this README
4. Submit a pull request

See [CONTRIBUTING.md](../CONTRIBUTING.md) for details.

---

**Happy coding! ** ✨

If you build something cool with Emotive Engine,
[show us](https://github.com/joshtol/emotive-engine/discussions)!
