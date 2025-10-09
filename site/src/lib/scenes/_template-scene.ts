import type { Scene, SceneFactory, SceneInitOptions } from '../scene-manager'
import type { ScrollExperienceValue } from '@/components/hooks/useScrollExperience'

/**
 * TemplateScene
 *
 * Describe your scene's purpose and interactions here.
 * Example: Interactive [feature] demonstrating:
 * - [Key interaction 1]
 * - [Key interaction 2]
 * - [Key interaction 3]
 */
export class TemplateScene implements Scene {
  private container: HTMLElement | null = null
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private isPaused = false
  private animationTime = 0
  private completionCallback?: () => void

  // Scene-specific state
  private currentStep = 0
  private totalSteps = 3

  async init(container: HTMLElement, options?: SceneInitOptions): Promise<void> {
    this.container = container

    // Create canvas
    this.canvas = document.createElement('canvas')
    this.canvas.className = 'scene-canvas template-scene'
    this.canvas.style.width = '100%'
    this.canvas.style.height = '100%'
    this.canvas.style.position = 'absolute'
    this.canvas.style.top = '0'
    this.canvas.style.left = '0'
    this.canvas.style.pointerEvents = 'none'

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
    this.currentStep = 0

    // Start demo sequence
    this.startDemo()
  }

  update(deltaTime: number, scrollState: ScrollExperienceValue): void {
    if (this.isPaused || !this.ctx || !this.canvas) {
      return
    }

    this.animationTime += deltaTime

    // Clear canvas
    const width = this.canvas.width / (window.devicePixelRatio || 1)
    const height = this.canvas.height / (window.devicePixelRatio || 1)
    this.ctx.clearRect(0, 0, width, height)

    // Render your scene
    this.render(width, height)
  }

  handleIntent(intent: 'EXPLORING' | 'SEEKING' | 'SKIMMING'): void {
    switch (intent) {
      case 'SKIMMING':
        // Fast-forward to completion
        this.fastForward()
        break
      case 'SEEKING':
        // Advance to next step
        this.nextStep()
        break
      case 'EXPLORING':
        // Resume normal playback
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

  setOnCompleteCallback(callback: () => void): void {
    this.completionCallback = callback
  }

  onComplete(): void {
    console.log('Template scene completed!')
    this.completionCallback?.()
  }

  private startDemo(): void {
    // Implement your auto-play demo sequence
    // Example: step through interactions automatically
    const stepInterval = setInterval(() => {
      if (this.currentStep < this.totalSteps - 1) {
        this.currentStep++
      } else {
        clearInterval(stepInterval)
        this.onComplete()
      }
    }, 2000)
  }

  private nextStep(): void {
    // Advance to next interaction step
    if (this.currentStep < this.totalSteps - 1) {
      this.currentStep++
    } else {
      this.onComplete()
    }
  }

  private fastForward(): void {
    // Jump directly to completion
    this.currentStep = this.totalSteps - 1
    this.onComplete()
  }

  private render(width: number, height: number): void {
    if (!this.ctx) return

    const centerX = width / 2
    const centerY = height / 2

    // Example: Draw step indicator
    this.ctx.font = 'bold 24px sans-serif'
    this.ctx.fillStyle = '#ffffff'
    this.ctx.textAlign = 'center'
    this.ctx.fillText(
      `Step ${this.currentStep + 1} of ${this.totalSteps}`,
      centerX,
      centerY
    )

    // Add your custom rendering logic here
    // - Draw shapes, text, animations
    // - Respond to this.currentStep
    // - Use this.animationTime for animations
  }
}

export const templateSceneFactory: SceneFactory = {
  type: 'template-scene',
  create: () => new TemplateScene(),
}
