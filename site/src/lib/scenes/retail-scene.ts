import type { Scene, SceneFactory, SceneInitOptions } from '../scene-manager'
import type { ScrollExperienceValue } from '@/components/hooks/useScrollExperience'

/**
 * RetailScene
 *
 * Interactive retail checkout simulation demonstrating:
 * - Product scanning animations
 * - Payment processing states
 * - Customer guidance prompts
 * - Error handling flows
 */
export class RetailScene implements Scene {
  private container: HTMLElement | null = null
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private animationFrame: number | null = null
  private isPaused = false
  private products: Product[] = []
  private currentStep: 'idle' | 'scanning' | 'payment' | 'complete' = 'idle'
  private animationProgress = 0
  private completionCallback?: () => void
  private intervalId: number | null = null
  private timeoutIds: number[] = []

  async init(container: HTMLElement, options?: SceneInitOptions): Promise<void> {
    this.container = container

    // Create canvas
    this.canvas = document.createElement('canvas')
    this.canvas.className = 'scene-canvas'
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

    // Initialize demo products
    this.products = [
      { name: 'Organic Apples', price: 4.99, scanned: false },
      { name: 'Whole Milk', price: 3.49, scanned: false },
      { name: 'Sourdough Bread', price: 5.99, scanned: false },
    ]

    this.currentStep = 'idle'
    this.startDemo()
  }

  update(deltaTime: number, scrollState: ScrollExperienceValue): void {
    if (this.isPaused || !this.ctx || !this.canvas) {
      return
    }

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    // Render based on current step
    this.renderStep()
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
    // Clear interval to prevent memory leak
    if (this.intervalId !== null) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }

    // Clear all timeouts to prevent memory leak
    this.timeoutIds.forEach(id => clearTimeout(id))
    this.timeoutIds = []

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }

    if (this.canvas && this.container) {
      this.container.removeChild(this.canvas)
    }

    this.canvas = null
    this.ctx = null
    this.container = null
    this.products = []
  }

  setOnCompleteCallback(callback: () => void): void {
    this.completionCallback = callback
  }

  onComplete(): void {
    this.completionCallback?.()
  }

  private startDemo(): void {
    // Start with first product scan after 1 second
    const timeoutId = setTimeout(() => {
      if (this.currentStep === 'idle') {
        this.currentStep = 'scanning'
        this.scanProducts()
      }
    }, 1000) as unknown as number
    this.timeoutIds.push(timeoutId)
  }

  private scanProducts(): void {
    let scannedCount = 0
    this.intervalId = setInterval(() => {
      if (scannedCount < this.products.length) {
        this.products[scannedCount].scanned = true
        scannedCount++
      } else {
        if (this.intervalId !== null) {
          clearInterval(this.intervalId)
          this.intervalId = null
        }
        this.currentStep = 'payment'
        const timeoutId = setTimeout(() => this.processPayment(), 500) as unknown as number
        this.timeoutIds.push(timeoutId)
      }
    }, 1500) as unknown as number
  }

  private processPayment(): void {
    // Simulate payment processing
    const timeoutId = setTimeout(() => {
      this.currentStep = 'complete'
      this.onComplete?.()
    }, 2000) as unknown as number
    this.timeoutIds.push(timeoutId)
  }

  private nextStep(): void {
    switch (this.currentStep) {
      case 'idle':
        this.currentStep = 'scanning'
        this.scanProducts()
        break
      case 'scanning':
        // Skip to payment
        this.products.forEach((p) => (p.scanned = true))
        this.currentStep = 'payment'
        this.processPayment()
        break
      case 'payment':
        this.currentStep = 'complete'
        this.onComplete?.()
        break
    }
  }

  private fastForward(): void {
    this.products.forEach((p) => (p.scanned = true))
    this.currentStep = 'complete'
    this.onComplete?.()
  }

  private renderStep(): void {
    if (!this.ctx || !this.canvas) return

    const {width} = this.canvas
    const {height} = this.canvas

    // Render current step UI
    this.ctx.font = '24px sans-serif'
    this.ctx.fillStyle = '#ffffff'
    this.ctx.textAlign = 'center'

    let statusText = ''
    switch (this.currentStep) {
      case 'idle':
        statusText = 'Ready to scan items...'
        break
      case 'scanning':
        statusText = `Scanning... (${this.products.filter((p) => p.scanned).length}/${this.products.length})`
        break
      case 'payment':
        statusText = 'Processing payment...'
        break
      case 'complete':
        statusText = 'Transaction complete! ✓'
        break
    }

    this.ctx.fillText(statusText, width / 2, height / 2)

    // Render product list
    this.ctx.font = '16px sans-serif'
    this.ctx.textAlign = 'left'
    this.products.forEach((product, index) => {
      const y = height / 2 + 50 + index * 30
      const status = product.scanned ? '✓' : '○'
      this.ctx!.fillText(`${status} ${product.name} - $${product.price.toFixed(2)}`, width / 4, y)
    })
  }
}

interface Product {
  name: string
  price: number
  scanned: boolean
}

export const retailSceneFactory: SceneFactory = {
  type: 'retail-checkout',
  create: () => new RetailScene(),
}
