import type { Scene, SceneFactory, SceneInitOptions } from '../scene-manager'
import type { ScrollExperienceValue } from '@/components/hooks/useScrollExperience'

/**
 * HealthcareScene
 *
 * Interactive patient intake form demonstrating:
 * - Multi-step form validation
 * - Patient information collection
 * - Error handling and guidance
 * - HIPAA-compliant UI patterns
 */
export class HealthcareScene implements Scene {
  private container: HTMLElement | null = null
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private isPaused = false
  private currentStep = 0
  private totalSteps = 4
  private completedSteps: Set<number> = new Set()
  private animationProgress = 0
  private showValidation = false
  private completionCallback?: () => void

  private steps = [
    { title: 'Personal Info', fields: ['Name', 'Date of Birth', 'Contact'] },
    { title: 'Insurance', fields: ['Provider', 'Policy #', 'Group #'] },
    { title: 'Medical History', fields: ['Allergies', 'Medications', 'Conditions'] },
    { title: 'Review & Submit', fields: ['Consent', 'Signature'] },
  ]

  async init(container: HTMLElement, options?: SceneInitOptions): Promise<void> {
    this.container = container

    // Create canvas
    this.canvas = document.createElement('canvas')
    this.canvas.className = 'scene-canvas healthcare-scene'
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

    // Clear canvas
    const width = this.canvas.width / (window.devicePixelRatio || 1)
    const height = this.canvas.height / (window.devicePixelRatio || 1)
    this.ctx.clearRect(0, 0, width, height)

    // Render current step
    this.renderStep(width, height)

    // Animate progress
    this.animationProgress += deltaTime * 0.001
    if (this.animationProgress > 1) {
      this.animationProgress = 0
    }
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
    this.completedSteps.clear()
  }

  setOnCompleteCallback(callback: () => void): void {
    this.completionCallback = callback
  }

  onComplete(): void {
    console.log('Healthcare form submitted!')
    this.completionCallback?.()
  }

  private startDemo(): void {
    // Auto-advance through steps
    const stepInterval = setInterval(() => {
      if (this.currentStep < this.totalSteps - 1) {
        this.completedSteps.add(this.currentStep)
        this.currentStep++
        this.showValidation = false
      } else {
        clearInterval(stepInterval)
        this.completedSteps.add(this.currentStep)
        this.onComplete?.()
      }
    }, 2500)
  }

  private nextStep(): void {
    if (this.currentStep < this.totalSteps - 1) {
      this.completedSteps.add(this.currentStep)
      this.currentStep++
      this.showValidation = false
    } else {
      this.completedSteps.add(this.currentStep)
      this.onComplete?.()
    }
  }

  private fastForward(): void {
    for (let i = 0; i < this.totalSteps; i++) {
      this.completedSteps.add(i)
    }
    this.currentStep = this.totalSteps - 1
    this.onComplete?.()
  }

  private renderStep(width: number, height: number): void {
    if (!this.ctx) return

    const step = this.steps[this.currentStep]
    const centerX = width / 2
    const centerY = height / 2

    // Draw step indicator
    this.ctx.font = 'bold 20px sans-serif'
    this.ctx.fillStyle = '#0ea5e9'
    this.ctx.textAlign = 'center'
    this.ctx.fillText(`Step ${this.currentStep + 1} of ${this.totalSteps}`, centerX, centerY - 100)

    // Draw step title
    this.ctx.font = 'bold 28px sans-serif'
    this.ctx.fillStyle = '#ffffff'
    this.ctx.fillText(step.title, centerX, centerY - 50)

    // Draw fields
    this.ctx.font = '18px sans-serif'
    this.ctx.textAlign = 'left'
    step.fields.forEach((field, index) => {
      const y = centerY + index * 35
      const isCompleted = this.completedSteps.has(this.currentStep)
      const fieldStatus = isCompleted ? '✓' : '○'
      const color = isCompleted ? '#10b981' : '#94a3b8'

      this.ctx!.fillStyle = color
      this.ctx!.fillText(`${fieldStatus} ${field}`, centerX - 120, y)
    })

    // Draw progress bar
    const progressBarWidth = 300
    const progressBarHeight = 8
    const progressX = centerX - progressBarWidth / 2
    const progressY = centerY + 120

    this.ctx.fillStyle = '#1e293b'
    this.ctx.fillRect(progressX, progressY, progressBarWidth, progressBarHeight)

    const progress = (this.completedSteps.size / this.totalSteps) * progressBarWidth
    this.ctx.fillStyle = '#0ea5e9'
    this.ctx.fillRect(progressX, progressY, progress, progressBarHeight)

    // Draw completion percentage
    const percent = Math.round((this.completedSteps.size / this.totalSteps) * 100)
    this.ctx.font = '16px sans-serif'
    this.ctx.fillStyle = '#94a3b8'
    this.ctx.textAlign = 'center'
    this.ctx.fillText(`${percent}% Complete`, centerX, progressY + 30)

    // Draw validation message if needed
    if (this.showValidation) {
      this.ctx.fillStyle = '#ef4444'
      this.ctx.fillText('⚠ Please complete all required fields', centerX, progressY + 55)
    }
  }
}

export const healthcareSceneFactory: SceneFactory = {
  type: 'healthcare-form',
  create: () => new HealthcareScene(),
}
