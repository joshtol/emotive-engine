---
title: "Basic Setup"
category: "Examples"
order: 1
description: "Simple examples to get started"
---

# Basic Setup Examples

## Minimal Example

The simplest possible setup:

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            margin: 0;
            background: #0a0a0a;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }
        canvas {
            max-width: 100%;
            max-height: 100vh;
        }
    </style>
</head>
<body>
    <canvas id="mascot"></canvas>
    <script type="module">
        import EmotiveMascot from '@joshtol/emotive-engine'

        const mascot = new EmotiveMascot({
            canvasId: 'mascot',
            emotion: 'neutral'
        })

        await mascot.init(document.getElementById('mascot'))
        mascot.start()
    </script>
</body>
</html>
```

## Interactive Buttons

Add emotion and gesture controls:

```html
<div id="controls">
    <div class="emotion-buttons"></div>
    <div class="gesture-buttons"></div>
</div>
<canvas id="mascot"></canvas>

<script type="module">
    import EmotiveMascot from '@joshtol/emotive-engine'

    const mascot = new EmotiveMascot({ canvasId: 'mascot' })
    await mascot.init(document.getElementById('mascot'))
    mascot.start()

    // Emotion buttons
    const emotions = ['joy', 'anger', 'love', 'fear', 'surprise', 'calm']
    const emotionContainer = document.querySelector('.emotion-buttons')

    emotions.forEach(emotion => {
        const btn = document.createElement('button')
        btn.textContent = emotion
        btn.onclick = () => mascot.setEmotion(emotion, 0)
        emotionContainer.appendChild(btn)
    })

    // Gesture buttons
    const gestures = ['bounce', 'spin', 'wave', 'pulse', 'flash']
    const gestureContainer = document.querySelector('.gesture-buttons')

    gestures.forEach(gesture => {
        const btn = document.createElement('button')
        btn.textContent = gesture
        btn.onclick = () => mascot.express(gesture)
        gestureContainer.appendChild(btn)
    })
</script>
```

## React Integration

Using Emotive Engine in a React component:

```jsx
import { useEffect, useRef, useState } from 'react'

function EmotiveMascotComponent() {
    const canvasRef = useRef(null)
    const [mascot, setMascot] = useState(null)

    useEffect(() => {
        const initMascot = async () => {
            // Dynamically import to avoid SSR issues
            const { default: EmotiveMascot } = await import('@joshtol/emotive-engine')

            const instance = new EmotiveMascot({
                canvasId: 'react-mascot',
                emotion: 'neutral',
                enableGazeTracking: true
            })

            await instance.init(canvasRef.current)
            instance.start()
            setMascot(instance)
        }

        initMascot()

        return () => {
            if (mascot) {
                mascot.stop()
            }
        }
    }, [])

    return (
        <div>
            <canvas ref={canvasRef} id="react-mascot" />

            <div className="controls">
                <button onClick={() => mascot?.setEmotion('joy', 0)}>
                    Joy
                </button>
                <button onClick={() => mascot?.setEmotion('anger', 0)}>
                    Anger
                </button>
                <button onClick={() => mascot?.express('bounce')}>
                    Bounce
                </button>
            </div>
        </div>
    )
}

export default EmotiveMascotComponent
```

## Responsive Layout

Adapt to different screen sizes:

```javascript
import EmotiveMascot from '@joshtol/emotive-engine'

// Detect device
const isMobile = window.innerWidth < 768
const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024

// Configure based on device
const mascot = new EmotiveMascot({
    canvasId: 'mascot',
    targetFPS: isMobile ? 30 : 60,
    maxParticles: isMobile ? 50 : isTablet ? 100 : 200,
    enableAutoOptimization: true
})

await mascot.init(document.getElementById('mascot'))
mascot.start()

// Set scale based on viewport
if (isMobile) {
    mascot.setScale({
        core: 0.6,
        particles: 0.8
    })
} else if (isTablet) {
    mascot.setScale({
        core: 0.8,
        particles: 0.9
    })
}

// Handle window resize
window.addEventListener('resize', () => {
    const newIsMobile = window.innerWidth < 768

    if (newIsMobile !== isMobile) {
        mascot.setScale({
            core: newIsMobile ? 0.6 : 1.0,
            particles: newIsMobile ? 0.8 : 1.0
        })
    }
})
```

## Fixed Position Overlay

Create a mascot that floats over your content:

```html
<style>
    #mascot-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none; /* Allow clicks through */
        z-index: 9999;
    }
</style>

<div id="mascot-overlay">
    <canvas id="mascot"></canvas>
</div>

<script type="module">
    import EmotiveMascot from '@joshtol/emotive-engine'

    const mascot = new EmotiveMascot({
        canvasId: 'mascot',
        emotion: 'neutral',
        enableGazeTracking: true
    })

    await mascot.init(document.getElementById('mascot'))
    mascot.start()

    // Position in corner
    mascot.setPosition(
        window.innerWidth / 2 - 100,  // Offset from center
        -window.innerHeight / 2 + 100  // Top right
    )

    mascot.setScale(0.5) // Smaller for corner placement
</script>
```

## See Also

- [Audio Reactive Examples](/docs/examples/audio-reactive)
- [API Reference](/docs/api/constructor)
- [Integration Guide](/docs/guides/integration)
