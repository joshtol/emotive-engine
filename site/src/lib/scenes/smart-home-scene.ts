import type { Scene, SceneFactory, SceneInitOptions } from '../scene-manager'
import type { ScrollExperienceValue } from '@/components/hooks/useScrollExperience'

/**
 * SmartHomeScene
 *
 * Interactive smart home dashboard demonstrating:
 * - Device status monitoring
 * - Real-time control interface
 * - Energy usage visualization
 * - Voice command integration
 */
export class SmartHomeScene implements Scene {
  private container: HTMLElement | null = null
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private isPaused = false
  private animationTime = 0
  private devices: Device[] = []
  private completionCallback?: () => void
  private intervalId: number | null = null

  async init(container: HTMLElement, options?: SceneInitOptions): Promise<void> {
    this.container = container

    // Create canvas
    this.canvas = document.createElement('canvas')
    this.canvas.className = 'scene-canvas smart-home-scene'
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

    // Initialize devices
    this.devices = [
      { name: 'Living Room Lights', icon: '💡', status: 'off', value: 0 },
      { name: 'Thermostat', icon: '🌡️', status: 'off', value: 72 },
      { name: 'Security System', icon: '🔒', status: 'off', value: 0 },
      { name: 'Smart Speaker', icon: '🔊', status: 'off', value: 50 },
    ]

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

    // Render dashboard
    this.renderDashboard(width, height)
  }

  handleIntent(intent: 'EXPLORING' | 'SEEKING' | 'SKIMMING'): void {
    switch (intent) {
      case 'SKIMMING':
        this.fastForward()
        break
      case 'SEEKING':
        this.activateNextDevice()
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

    if (this.canvas && this.container) {
      this.container.removeChild(this.canvas)
    }

    this.canvas = null
    this.ctx = null
    this.container = null
    this.devices = []
  }

  setOnCompleteCallback(callback: () => void): void {
    this.completionCallback = callback
  }

  onComplete(): void {
    this.completionCallback?.()
  }

  private startDemo(): void {
    // Activate devices one by one
    let deviceIndex = 0
    this.intervalId = setInterval(() => {
      if (deviceIndex < this.devices.length) {
        this.devices[deviceIndex].status = 'on'
        deviceIndex++
      } else {
        if (this.intervalId !== null) {
          clearInterval(this.intervalId)
          this.intervalId = null
        }
        this.onComplete?.()
      }
    }, 1500) as unknown as number
  }

  private activateNextDevice(): void {
    const nextOff = this.devices.find((d) => d.status === 'off')
    if (nextOff) {
      nextOff.status = 'on'
    } else {
      this.onComplete?.()
    }
  }

  private fastForward(): void {
    this.devices.forEach((device) => {
      device.status = 'on'
    })
    this.onComplete?.()
  }

  private renderDashboard(width: number, height: number): void {
    if (!this.ctx) return

    const centerX = width / 2
    const centerY = height / 2

    // Draw title
    this.ctx.font = 'bold 28px sans-serif'
    this.ctx.fillStyle = '#ffffff'
    this.ctx.textAlign = 'center'
    this.ctx.fillText('Smart Home Dashboard', centerX, centerY - 120)

    // Draw devices in a grid
    const cols = 2
    const rows = 2
    const deviceWidth = 160
    const deviceHeight = 100
    const spacing = 20

    this.devices.forEach((device, index) => {
      const col = index % cols
      const row = Math.floor(index / cols)

      const x = centerX - ((cols * deviceWidth + (cols - 1) * spacing) / 2) + col * (deviceWidth + spacing)
      const y = centerY - 50 + row * (deviceHeight + spacing)

      this.renderDevice(device, x, y, deviceWidth, deviceHeight)
    })

    // Draw status summary
    const activeCount = this.devices.filter((d) => d.status === 'on').length
    const totalCount = this.devices.length

    this.ctx.font = '18px sans-serif'
    this.ctx.fillStyle = activeCount === totalCount ? '#10b981' : '#94a3b8'
    this.ctx.fillText(`${activeCount} of ${totalCount} devices active`, centerX, centerY + 130)

    // Draw completion message
    if (activeCount === totalCount) {
      this.ctx.font = 'bold 20px sans-serif'
      this.ctx.fillStyle = '#10b981'
      this.ctx.fillText('✓ All Systems Online', centerX, centerY + 160)
    }
  }

  private renderDevice(device: Device, x: number, y: number, width: number, height: number): void {
    if (!this.ctx) return

    const isOn = device.status === 'on'
    const bgColor = isOn ? 'rgba(16, 185, 129, 0.15)' : 'rgba(71, 85, 105, 0.15)'
    const borderColor = isOn ? '#10b981' : '#475569'

    // Draw device card
    this.ctx.fillStyle = bgColor
    this.ctx.fillRect(x, y, width, height)

    this.ctx.strokeStyle = borderColor
    this.ctx.lineWidth = 2
    this.ctx.strokeRect(x, y, width, height)

    // Draw icon
    this.ctx.font = '32px sans-serif'
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'
    this.ctx.fillText(device.icon, x + width / 2, y + 30)

    // Draw name
    this.ctx.font = '14px sans-serif'
    this.ctx.fillStyle = '#ffffff'
    this.ctx.fillText(device.name, x + width / 2, y + height - 30)

    // Draw status indicator
    const statusX = x + width - 15
    const statusY = y + 15

    this.ctx.fillStyle = isOn ? '#10b981' : '#475569'
    this.ctx.beginPath()
    this.ctx.arc(statusX, statusY, 6, 0, Math.PI * 2)
    this.ctx.fill()

    // Pulse animation for active devices
    if (isOn) {
      const pulse = Math.sin(this.animationTime * 0.003) * 0.3 + 0.7
      this.ctx.fillStyle = `rgba(16, 185, 129, ${pulse * 0.3})`
      this.ctx.beginPath()
      this.ctx.arc(statusX, statusY, 10, 0, Math.PI * 2)
      this.ctx.fill()
    }
  }
}

interface Device {
  name: string
  icon: string
  status: 'on' | 'off'
  value: number
}

export const smartHomeSceneFactory: SceneFactory = {
  type: 'smart-home-dashboard',
  create: () => new SmartHomeScene(),
}
