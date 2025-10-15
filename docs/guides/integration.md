---
title: "Integration Guide"
category: "Getting Started"
order: 2
description: "Integrate Emotive Engine into your project"
---

# Integration Guide

Learn how to integrate Emotive Engine into various frameworks and environments.

## Vanilla JavaScript

### Basic HTML Setup

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Emotive Engine</title>
    <style>
        body {
            margin: 0;
            background: #0a0a0a;
            overflow: hidden;
        }
        #mascot {
            width: 100vw;
            height: 100vh;
        }
    </style>
</head>
<body>
    <canvas id="mascot"></canvas>
    <script type="module" src="app.js"></script>
</body>
</html>
```

```javascript
// app.js
import EmotiveMascot from '@joshtol/emotive-engine'

const mascot = new EmotiveMascot({
    canvasId: 'mascot',
    emotion: 'neutral'
})

await mascot.init(document.getElementById('mascot'))
mascot.start()
```

---

## React

### Function Component

```jsx
import { useEffect, useRef, useState } from 'react'

export default function MascotComponent() {
    const canvasRef = useRef(null)
    const mascotRef = useRef(null)
    const [emotion, setEmotion] = useState('neutral')

    useEffect(() => {
        const initMascot = async () => {
            const { default: EmotiveMascot } = await import('@joshtol/emotive-engine')

            const instance = new EmotiveMascot({
                canvasId: 'mascot-canvas',
                emotion: 'neutral',
                enableGazeTracking: true
            })

            await instance.init(canvasRef.current)
            instance.start()
            mascotRef.current = instance
        }

        initMascot()

        return () => {
            if (mascotRef.current) {
                mascotRef.current.destroy()
            }
        }
    }, [])

    useEffect(() => {
        if (mascotRef.current) {
            mascotRef.current.setEmotion(emotion, 0)
        }
    }, [emotion])

    return (
        <div>
            <canvas
                ref={canvasRef}
                id="mascot-canvas"
                style={{ width: '100%', height: '600px' }}
            />

            <div className="controls">
                <button onClick={() => setEmotion('joy')}>Joy</button>
                <button onClick={() => setEmotion('anger')}>Anger</button>
                <button onClick={() => setEmotion('love')}>Love</button>
            </div>
        </div>
    )
}
```

### Custom Hook

```jsx
// useMascot.js
import { useEffect, useRef, useState } from 'react'

export function useMascot(canvasId, config = {}) {
    const mascotRef = useRef(null)
    const [isReady, setIsReady] = useState(false)

    useEffect(() => {
        const init = async () => {
            const { default: EmotiveMascot } = await import('@joshtol/emotive-engine')

            const canvas = document.getElementById(canvasId)
            if (!canvas) return

            const mascot = new EmotiveMascot({
                canvasId,
                ...config
            })

            await mascot.init(canvas)
            mascot.start()
            mascotRef.current = mascot
            setIsReady(true)
        }

        init()

        return () => {
            if (mascotRef.current) {
                mascotRef.current.destroy()
            }
        }
    }, [canvasId])

    return { mascot: mascotRef.current, isReady }
}

// Usage
function App() {
    const { mascot, isReady } = useMascot('mascot', {
        emotion: 'neutral',
        enableGazeTracking: true
    })

    return (
        <div>
            <canvas id="mascot" />
            {isReady && (
                <button onClick={() => mascot.express('bounce')}>
                    Bounce
                </button>
            )}
        </div>
    )
}
```

---

## Next.js

### Client Component (App Router)

```jsx
// app/components/Mascot.tsx
'use client'

import { useEffect, useRef } from 'react'

export default function Mascot() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const mascotRef = useRef<any>(null)

    useEffect(() => {
        const initMascot = async () => {
            if (!canvasRef.current) return

            // Dynamic import to avoid SSR issues
            const { default: EmotiveMascot } = await import('@joshtol/emotive-engine')

            const mascot = new EmotiveMascot({
                canvasId: 'next-mascot',
                emotion: 'neutral'
            })

            await mascot.init(canvasRef.current)
            mascot.start()
            mascotRef.current = mascot
        }

        initMascot()

        return () => {
            if (mascotRef.current) {
                mascotRef.current.destroy()
            }
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            id="next-mascot"
            style={{ width: '100%', height: '600px' }}
        />
    )
}
```

### Page Usage

```jsx
// app/page.tsx
import Mascot from './components/Mascot'

export default function Home() {
    return (
        <main>
            <h1>My Emotive App</h1>
            <Mascot />
        </main>
    )
}
```

---

## Vue 3

### Composition API

```vue
<template>
  <div>
    <canvas ref="canvasRef" id="vue-mascot"></canvas>

    <div class="controls">
      <button @click="changeEmotion('joy')">Joy</button>
      <button @click="changeEmotion('anger')">Anger</button>
      <button @click="triggerGesture('bounce')">Bounce</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)
const mascot = ref(null)

onMounted(async () => {
  const { default: EmotiveMascot } = await import('@joshtol/emotive-engine')

  const instance = new EmotiveMascot({
    canvasId: 'vue-mascot',
    emotion: 'neutral'
  })

  await instance.init(canvasRef.value)
  instance.start()
  mascot.value = instance
})

onUnmounted(() => {
  if (mascot.value) {
    mascot.value.destroy()
  }
})

const changeEmotion = (emotion) => {
  if (mascot.value) {
    mascot.value.setEmotion(emotion, 0)
  }
}

const triggerGesture = (gesture) => {
  if (mascot.value) {
    mascot.value.express(gesture)
  }
}
</script>

<style scoped>
canvas {
  width: 100%;
  height: 600px;
}

.controls {
  margin-top: 1rem;
  display: flex;
  gap: 0.5rem;
}
</style>
```

---

## Svelte

```svelte
<script>
  import { onMount, onDestroy } from 'svelte'

  let canvasRef
  let mascot

  onMount(async () => {
    const { default: EmotiveMascot } = await import('@joshtol/emotive-engine')

    mascot = new EmotiveMascot({
      canvasId: 'svelte-mascot',
      emotion: 'neutral'
    })

    await mascot.init(canvasRef)
    mascot.start()
  })

  onDestroy(() => {
    if (mascot) {
      mascot.destroy()
    }
  })

  function handleEmotion(emotion) {
    if (mascot) {
      mascot.setEmotion(emotion, 0)
    }
  }
</script>

<div>
  <canvas bind:this={canvasRef} id="svelte-mascot" />

  <div class="controls">
    <button on:click={() => handleEmotion('joy')}>Joy</button>
    <button on:click={() => handleEmotion('anger')}>Anger</button>
  </div>
</div>

<style>
  canvas {
    width: 100%;
    height: 600px;
  }
</style>
```

---

## TypeScript

### Type Definitions

```typescript
import EmotiveMascot from '@joshtol/emotive-engine'

interface MascotConfig {
  canvasId: string
  emotion?: string
  particleCount?: number
  enableGazeTracking?: boolean
}

class MascotController {
  private mascot: EmotiveMascot | null = null

  async init(config: MascotConfig): Promise<void> {
    const canvas = document.getElementById(config.canvasId) as HTMLCanvasElement

    this.mascot = new EmotiveMascot(config)
    await this.mascot.init(canvas)
    this.mascot.start()
  }

  setEmotion(emotion: string): void {
    this.mascot?.setEmotion(emotion, 0)
  }

  express(gesture: string): void {
    this.mascot?.express(gesture)
  }

  destroy(): void {
    this.mascot?.destroy()
  }
}

export default MascotController
```

---

## Build Tools

### Vite

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  optimizeDeps: {
    include: ['@joshtol/emotive-engine']
  }
})
```

### Webpack

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        include: /node_modules\/@joshtol\/emotive-engine/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
}
```

---

## See Also

- [Quick Start](/docs/guides/quick-start)
- [API Reference](/docs/api/constructor)
- [Examples](/docs/examples/basic-setup)
