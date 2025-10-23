import type { Scene, SceneFactory, SceneInitOptions } from '../scene-manager'
import type { ScrollExperienceValue } from '@/components/hooks/useScrollExperience'

/**
 * EducationScene
 *
 * Interactive math tutor demonstrating:
 * - Step-by-step problem solving
 * - Visual equation breakdown
 * - Hints and guidance system
 * - Achievement feedback
 */
export class EducationScene implements Scene {
  private intervalId: number | null = null
  private container: HTMLElement | null = null
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private isPaused = false
  private currentStep = 0
  private totalSteps = 5
  private showHint = false
  private animationTime = 0
  private completionCallback?: () => void

  // Math problem: Solve for x: 2x + 5 = 13
  private steps = [
    { label: 'Problem', equation: '2x + 5 = 13', hint: 'Isolate the variable x' },
    { label: 'Subtract 5', equation: '2x = 8', hint: 'Remove the constant from the left side' },
    { label: 'Divide by 2', equation: 'x = 4', hint: 'Divide both sides by the coefficient' },
    { label: 'Verify', equation: '2(4) + 5 = 13', hint: 'Substitute x back into original equation' },
    { label: 'Solution', equation: 'x = 4 ✓', hint: 'Correct!' },
  ]

  async init(container: HTMLElement, options?: SceneInitOptions): Promise<void> {
    this.container = container

    // Create canvas
    this.canvas = document.createElement('canvas')
    this.canvas.className = 'scene-canvas education-scene'
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

    this.currentStep = 0
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

    // Render current step
    this.renderStep(width, height)
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
        this.showHint = true
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
    // Clear interval to prevent memory leak
    if (this.intervalId !== null) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }

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
    console.log('Math problem solved!')
    this.completionCallback?.()
  }

  private startDemo(): void {
    // Auto-advance through steps
    this.intervalId = setInterval(() => {
      if (this.currentStep < this.totalSteps - 1) {
        this.currentStep++
        this.showHint = false
        this.animationTime = 0
      } else {
        if (this.intervalId !== null) {
          clearInterval(this.intervalId)
          this.intervalId = null
        }
        this.onComplete?.()
      }
    }, 2000) as unknown as number
  }

  private nextStep(): void {
    if (this.currentStep < this.totalSteps - 1) {
      this.currentStep++
      this.showHint = false
      this.animationTime = 0
    } else {
      this.onComplete?.()
    }
  }

  private fastForward(): void {
    this.currentStep = this.totalSteps - 1
    this.onComplete?.()
  }

  private renderStep(width: number, height: number): void {
    if (!this.ctx) return

    const step = this.steps[this.currentStep]
    const centerX = width / 2
    const centerY = height / 2

    // Draw step indicator
    this.ctx.font = 'bold 18px sans-serif'
    this.ctx.fillStyle = '#8b5cf6'
    this.ctx.textAlign = 'center'
    this.ctx.fillText(`Step ${this.currentStep + 1} of ${this.totalSteps}`, centerX, centerY - 120)

    // Draw step label
    this.ctx.font = '20px sans-serif'
    this.ctx.fillStyle = '#a78bfa'
    this.ctx.fillText(step.label, centerX, centerY - 80)

    // Draw equation
    this.ctx.font = 'bold 36px monospace'
    this.ctx.fillStyle = '#ffffff'
    this.ctx.fillText(step.equation, centerX, centerY - 20)

    // Draw progress dots
    const dotSpacing = 25
    const totalWidth = (this.totalSteps - 1) * dotSpacing
    const startX = centerX - totalWidth / 2

    for (let i = 0; i < this.totalSteps; i++) {
      const x = startX + i * dotSpacing
      const y = centerY + 40

      if (i < this.currentStep) {
        // Completed step
        this.ctx.fillStyle = '#10b981'
        this.ctx.beginPath()
        this.ctx.arc(x, y, 6, 0, Math.PI * 2)
        this.ctx.fill()
      } else if (i === this.currentStep) {
        // Current step - animated
        this.ctx.fillStyle = '#8b5cf6'
        const pulse = Math.sin(this.animationTime * 0.003) * 0.3 + 1
        this.ctx.beginPath()
        this.ctx.arc(x, y, 6 * pulse, 0, Math.PI * 2)
        this.ctx.fill()
      } else {
        // Future step
        this.ctx.fillStyle = '#475569'
        this.ctx.beginPath()
        this.ctx.arc(x, y, 5, 0, Math.PI * 2)
        this.ctx.fill()
      }
    }

    // Draw hint if enabled
    if (this.showHint) {
      this.ctx.font = '16px sans-serif'
      this.ctx.fillStyle = '#fbbf24'
      this.ctx.fillText(`💡 Hint: ${step.hint}`, centerX, centerY + 90)
    }

    // Draw completion message
    if (this.currentStep === this.totalSteps - 1) {
      this.ctx.font = 'bold 24px sans-serif'
      this.ctx.fillStyle = '#10b981'
      this.ctx.fillText('🎉 Problem Solved!', centerX, centerY + 120)
    }
  }
}

export const educationSceneFactory: SceneFactory = {
  type: 'education-tutor',
  create: () => new EducationScene(),
}
