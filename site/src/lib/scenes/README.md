# Scene Integration Guide

## Overview

Scenes are isolated canvas-based experiences tied to scroll sections. Each scene demonstrates a use case for the Emotive Engine (retail, healthcare, education, etc.) and responds to user scroll intent.

## Architecture

```
SceneManager (site/src/lib/scene-manager.ts)
├── Scene Interface - init, update, handleIntent, dispose
├── SceneFactory - type + create method
└── Lifecycle - tied to ScrollExperienceValue lock state

RetailScene (site/src/lib/scenes/retail-scene.ts)
├── Product scanning simulation
├── Payment processing flow
└── Responds to scroll intents (SKIMMING = fast-forward)
```

## Creating a New Scene

### 1. Implement the Scene interface

```typescript
import type { Scene, SceneFactory, SceneInitOptions } from '../scene-manager'
import type { ScrollExperienceValue } from '@/components/hooks/useScrollExperience'

export class MyScene implements Scene {
  private container: HTMLElement | null = null
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private isPaused = false

  async init(container: HTMLElement, options?: SceneInitOptions): Promise<void> {
    this.container = container

    // Create canvas
    this.canvas = document.createElement('canvas')
    this.canvas.className = 'scene-canvas'
    const dpr = options?.dpr || window.devicePixelRatio || 1
    const width = options?.width || container.clientWidth
    const height = options?.height || container.clientHeight

    this.canvas.width = width * dpr
    this.canvas.height = height * dpr
    this.ctx = this.canvas.getContext('2d')

    if (this.ctx) {
      this.ctx.scale(dpr, dpr)
    }

    container.appendChild(this.canvas)

    // Initialize your scene state here
  }

  update(deltaTime: number, scrollState: ScrollExperienceValue): void {
    if (this.isPaused || !this.ctx || !this.canvas) return

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    // Render your scene
    this.render()
  }

  handleIntent(intent: 'EXPLORING' | 'SEEKING' | 'SKIMMING'): void {
    switch (intent) {
      case 'SKIMMING':
        this.fastForward()
        break
      case 'SEEKING':
        this.nextStep()
        break
      case 'EXPLORING':
        this.resume()
        break
    }
  }

  pause(): void {
    this.isPaused = true
  }

  resume(): void {
    this.isPaused = false
  }

  dispose(): void {
    if (this.canvas && this.container) {
      this.container.removeChild(this.canvas)
    }
    this.canvas = null
    this.ctx = null
    this.container = null
  }

  private render(): void {
    // Your rendering logic here
  }

  private fastForward(): void {
    // Jump to completion
  }

  private nextStep(): void {
    // Advance to next interaction step
  }
}

export const mySceneFactory: SceneFactory = {
  type: 'my-scene-type',
  create: () => new MyScene(),
}
```

### 2. Register the scene in HomePage

```typescript
import { SceneManager } from '@/lib/scene-manager'
import { retailSceneFactory } from '@/lib/scenes/retail-scene'
import { mySceneFactory } from '@/lib/scenes/my-scene'

// In HomePage component
const sceneManagerRef = useRef<SceneManager | null>(null)

useEffect(() => {
  const container = document.getElementById('scene-container')
  if (!container) return

  const manager = new SceneManager(container)
  sceneManagerRef.current = manager

  // Register scenes per section
  manager.register('retail', retailSceneFactory)
  manager.register('my-section', mySceneFactory)

  return () => {
    manager.destroy()
    sceneManagerRef.current = null
  }
}, [])

// Sync with scroll state
useEffect(() => {
  const manager = sceneManagerRef.current
  if (manager) {
    manager.syncWithScroll(scrollExperienceValue)
  }
}, [scrollExperienceValue])
```

### 3. Add scene container to your section

```tsx
<div
  ref={(el) => (sectionRefs.current[1] = el)}
  id={sections[1].id}
  className="parallax-section"
>
  <RetailSection />
  <div id="scene-container" className="scene-container" />
</div>
```

## Scene Lifecycle

1. **Registration** - `manager.register(sectionId, factory)`
2. **Activation** - Auto-triggered when `scrollLockState.locked && scrollLockState.sectionId === sectionId`
3. **Update Loop** - RAF-driven; receives deltaTime and scrollState
4. **Intent Handling** - Responds to EXPLORING, SEEKING, SKIMMING
5. **Disposal** - Cleanup on section leave or manager destroy

## Best Practices

- Keep scenes isolated - no shared state between scenes
- Use `onComplete` callback to signal when user finishes interaction
- Handle all scroll intents (SKIMMING should fast-forward or skip)
- Clean up all resources in `dispose()` method
- Use DPR for crisp rendering on high-DPI displays
- Prefer canvas for animations; DOM for UI overlays

## Example Scenes to Build

- **Healthcare Form** - Multi-step patient intake with validation
- **Education Tutor** - Math problem with step-by-step solution
- **Smart Home** - Device control dashboard with status updates
- **Automotive** - Car dashboard with speed/fuel gauges

See `retail-scene.ts` for a complete reference implementation.
