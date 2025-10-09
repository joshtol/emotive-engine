import type { ScrollIntentState } from '@/components/hooks/useScrollIntent'
import type { ScrollLockReason } from '@/components/hooks/useScrollLock'
import type { ScrollExperienceValue } from '@/components/hooks/useScrollExperience'
import type { EmotiveEngine } from './emotive-engine'

export interface SectionMeta {
  id: string
  title: string
  subtitle: string
  pathAnchor: number
  offset: { x: number; y: number }
  speed?: number
}

export interface GestureConfig {
  sectionId: string
  emotion?: string
  gesture?: string
  chain?: string
  delay?: number
}

export interface AvatarControllerEvents {
  onPathStart?: (sectionId: string) => void
  onPathComplete?: (sectionId: string) => void
  onSectionEnter?: (sectionId: string) => void
  onSectionLeave?: (sectionId: string) => void
}

export interface AvatarControllerOptions extends AvatarControllerEvents {
  engine: EmotiveEngine
  sections: SectionMeta[]
  getScrollExperience: () => ScrollExperienceValue
  canvas: HTMLCanvasElement
  gestureRegistry?: GestureConfig[]
  onReady?: (controller: AvatarController) => void
  onError?: (error: Error) => void
}

interface Waypoint {
  sectionId: string
  anchorY: number
  pathAnchor: number
  offset: { x: number; y: number }
  speed?: number
}

export class AvatarController {
  private engine: EmotiveEngine | null = null
  private canvas: HTMLCanvasElement | null = null
  private sections: SectionMeta[] = []
  private gestureRegistry: Map<string, GestureConfig> = new Map()
  private getScrollExperience: (() => ScrollExperienceValue) | null = null
  private currentWaypoint: Waypoint | null = null
  private previousSectionId: string | null = null
  private pathCleanup: (() => void) | null = null
  private initialized = false
  private onReady?: (controller: AvatarController) => void
  private onError?: (error: Error) => void
  private onPathStart?: (sectionId: string) => void
  private onPathComplete?: (sectionId: string) => void
  private onSectionEnter?: (sectionId: string) => void
  private onSectionLeave?: (sectionId: string) => void

  async init(options: AvatarControllerOptions): Promise<void> {
    try {
      this.engine = options.engine
      this.canvas = options.canvas
      this.sections = options.sections
      this.getScrollExperience = options.getScrollExperience
      this.onReady = options.onReady
      this.onError = options.onError
      this.onPathStart = options.onPathStart
      this.onPathComplete = options.onPathComplete
      this.onSectionEnter = options.onSectionEnter
      this.onSectionLeave = options.onSectionLeave

      if (options.gestureRegistry) {
        this.gestureRegistry = new Map(options.gestureRegistry.map((entry) => [entry.sectionId, entry]))
      }

      this.initialized = true
      this.onReady?.(this)
    } catch (error) {
      this.handleError(error)
    }
  }

  destroy(): void {
    this.stop()
    this.sections = []
    this.gestureRegistry.clear()
    this.currentWaypoint = null
    this.initialized = false
    this.engine = null
    this.canvas = null
  }

  stop(): void {
    try {
      this.stopCurrentPath()
      this.engine?.pause?.()
    } catch (error) {
      this.handleError(error)
    }
  }

  async moveToSection(sectionId: string, opts: { immediate?: boolean; reason?: string } = {}): Promise<void> {
    if (!this.initialized || !this.engine) {
      return
    }

    if (!opts.immediate && this.currentWaypoint?.sectionId === sectionId) {
      return
    }

    const section = this.sections.find((entry) => entry.id === sectionId)
    if (!section) {
      return
    }

    // Trigger section leave event
    if (this.previousSectionId && this.previousSectionId !== sectionId) {
      this.onSectionLeave?.(this.previousSectionId)
    }

    const waypoint = this.buildWaypoint(section)
    this.currentWaypoint = waypoint

    const positionController = (this.engine as any)?.positionController

    // Trigger path start event
    this.onPathStart?.(sectionId)

    if (opts.immediate) {
      this.stopCurrentPath()
      this.setOffset(section.offset.x, section.offset.y)
      this.applyGestureForSection(sectionId)

      // Trigger immediate events
      this.onPathComplete?.(sectionId)
      this.onSectionEnter?.(sectionId)
      this.previousSectionId = sectionId
      return
    }

    this.stopCurrentPath()

    const cleanup = await this.moveViaEngine(positionController, section, waypoint.pathAnchor)
    if (typeof cleanup === 'function') {
      this.pathCleanup = cleanup
    }

    this.applyGestureForSection(sectionId)

    // Trigger path complete and section enter events
    this.onPathComplete?.(sectionId)
    this.onSectionEnter?.(sectionId)
    this.previousSectionId = sectionId
  }

  syncWithScroll(state: ScrollExperienceValue): void {
    if (!this.initialized || !this.engine) {
      return
    }

    if (state.intent.intent === 'SKIMMING') {
      this.engine.pause?.()
      return
    }

    if (state.intent.intent === 'EXPLORING') {
      this.engine.play?.()
    }
  }

  express(gestureId: string, options?: { chain?: boolean; emotion?: string }): void {
    if (!this.initialized || !this.engine) {
      return
    }

    const controller: any = this.engine

    if (options?.emotion && controller?.setEmotion) {
      controller.setEmotion(options.emotion)
    }

    if (options?.chain && controller?.chain) {
      controller.chain(gestureId)
    } else if (controller?.express) {
      controller.express(gestureId)
    }
  }

  setEmotion(emotion: string): void {
    if (!this.initialized || !this.engine) {
      return
    }

    const controller: any = this.engine
    controller?.setEmotion?.(emotion)
  }

  updateSections(sections: SectionMeta[]): void {
    this.sections = sections
    if (this.currentWaypoint) {
      const updated = sections.find((entry) => entry.id === this.currentWaypoint?.sectionId)
      if (updated) {
        this.currentWaypoint = this.buildWaypoint(updated)
      }
    }
  }

  handleScrollLockChange(lockState: ScrollExperienceValue['lock'], reason: ScrollLockReason): void {
    if (!lockState.locked && reason === 'skimming') {
      this.engine?.pause?.()
    }
  }

  handleIntentChange(intentState: ScrollIntentState): void {
    if (!this.initialized || !this.engine) {
      return
    }

    if (intentState.intent === 'SKIMMING') {
      this.engine.pause?.()
    } else if (intentState.intent === 'EXPLORING') {
      this.engine.play?.()
    }
  }

  private buildWaypoint(section: SectionMeta): Waypoint {
    const anchorElement = document.getElementById(section.id)
    const rect = anchorElement?.getBoundingClientRect()
    const anchorY = rect ? window.scrollY + rect.top : window.scrollY
    const pathAnchor = typeof section.pathAnchor === 'number' ? section.pathAnchor : 0.8
    const offset = section.offset ?? { x: 0, y: 0 }

    return {
      sectionId: section.id,
      anchorY,
      pathAnchor,
      offset,
      speed: section.speed,
    }
  }

  private applyGestureForSection(sectionId: string): void {
    if (!this.engine) {
      return
    }

    const config = this.gestureRegistry.get(sectionId)
    if (!config) {
      return
    }

    if (config.emotion) {
      this.setEmotion(config.emotion)
    }

    if (config.chain) {
      this.express(config.chain, { chain: true })
    } else if (config.gesture) {
      this.express(config.gesture)
    }
  }

  private async moveViaEngine(positionController: any, section: SectionMeta, pathAnchor: number): Promise<(() => void) | void> {
    const elementTargeting = positionController?.getElementTargeting
      ? positionController.getElementTargeting()
      : null
    const selector = `#${section.id}`
    const offset = section.offset ?? { x: 0, y: 0 }

    if (elementTargeting?.moveToElementWithPath) {
      const { pathPoints, options } = this.buildPathPoints(positionController, section)

      try {
        return elementTargeting.moveToElementWithPath(selector, pathPoints, 'center', offset, {
          coordinateSystem: 'viewport',
          speed: section.speed ?? 320,
          easing: options.easing,
        })
      } catch (error) {
        this.handleError(error)
      }
    }

    this.setOffset(section.offset.x, section.offset.y)
    return undefined
  }

  private buildPathPoints(positionController: any, section: SectionMeta): { pathPoints: Array<{ x: number; y: number }>; options: { easing: string } } {
    const pathPoints: Array<{ x: number; y: number }> = []
    const viewportWidth = window.innerWidth || 1
    const viewportHeight = window.innerHeight || 1
    const anchorFraction = section.pathAnchor ?? 0.8
    const boundedAnchor = Math.min(0.92, Math.max(0.08, anchorFraction))
    const horizontalAnchor = Math.min(viewportWidth - 80, Math.max(80, viewportWidth * boundedAnchor))

    const currentOffset = positionController?.getOffset?.() || { x: 0, y: 0 }
    const offsetX = typeof currentOffset.x === 'number' ? currentOffset.x : 0
    const offsetY = typeof currentOffset.y === 'number' ? currentOffset.y : 0

    if (offsetX !== 0 || offsetY !== 0) {
      pathPoints.push({
        x: horizontalAnchor,
        y: offsetY + viewportHeight / 2,
      })
    } else {
      pathPoints.push({
        x: horizontalAnchor,
        y: viewportHeight * 0.3,
      })
    }

    const element = document.getElementById(section.id)
    if (element) {
      const rect = element.getBoundingClientRect()
      const targetMidY = rect.top + rect.height / 2
      pathPoints.push({ x: horizontalAnchor, y: targetMidY })

      const approachFromLeft = horizontalAnchor < rect.left + rect.width / 2
      const approachX = approachFromLeft
        ? rect.left + rect.width * 0.35
        : rect.left + rect.width * 0.65
      pathPoints.push({ x: approachX, y: targetMidY })
    } else {
      pathPoints.push({ x: horizontalAnchor, y: viewportHeight * 0.5 })
    }

    return {
      pathPoints,
      options: { easing: 'easeInOutCubic' },
    }
  }

  private setOffset(x: number, y: number): void {
    try {
      const positionController = (this.engine as any)?.positionController
      if (positionController?.setOffset) {
        positionController.setOffset(x, y, 0)
      } else if ((this.engine as any)?.setOffset) {
        // eslint-disable-next-line no-extra-semi
        ;(this.engine as any).setOffset(x, y, 0)
      }
    } catch (error) {
      // Silently handle initialization errors during engine startup
      // The position will be set once the engine is fully initialized
      if (error instanceof Error && !error.message.includes('onUpdate')) {
        this.handleError(error)
      }
    }
  }

  private stopCurrentPath(): void {
    if (this.pathCleanup) {
      try {
        this.pathCleanup()
      } catch (error) {
        this.handleError(error)
      } finally {
        this.pathCleanup = null
      }
    }
  }

  private handleError(error: unknown): void {
    if (error instanceof Error) {
      this.onError?.(error)
    } else {
      this.onError?.(new Error(String(error)))
    }
  }
}
