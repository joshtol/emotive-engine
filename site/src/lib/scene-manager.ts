import type { ScrollExperienceValue } from '@/components/hooks/useScrollExperience'

/**
 * Scene Interface
 *
 * Scenes are isolated canvas-based experiences tied to scroll sections.
 * Each scene manages its own lifecycle, animations, and interactions.
 */
export interface Scene {
  /**
   * Initialize the scene with a container element
   * @param container - The DOM element to render into
   * @param options - Scene-specific initialization options
   */
  init(container: HTMLElement, options?: SceneInitOptions): void | Promise<void>

  /**
   * Update the scene on each animation frame
   * @param deltaTime - Time elapsed since last frame (ms)
   * @param scrollState - Current scroll experience state
   */
  update(deltaTime: number, scrollState: ScrollExperienceValue): void

  /**
   * Handle scroll intent changes
   * @param intent - New scroll intent state (EXPLORING, SEEKING, SKIMMING)
   */
  handleIntent(intent: 'EXPLORING' | 'SEEKING' | 'SKIMMING'): void

  /**
   * Dispose of scene resources and cleanup
   */
  dispose(): void

  /**
   * Optional: Pause scene animations
   */
  pause?(): void

  /**
   * Optional: Resume scene animations
   */
  resume?(): void

  /**
   * Optional: Handle scene completion (user finished interaction)
   * @param callback - Called when scene interaction completes
   */
  onComplete?(callback?: () => void): void

  /**
   * Set completion callback
   */
  setOnCompleteCallback?(callback: () => void): void
}

export interface SceneInitOptions {
  /** Section ID this scene is bound to */
  sectionId: string
  /** Canvas width */
  width: number
  /** Canvas height */
  height: number
  /** Device pixel ratio for crisp rendering */
  dpr?: number
  /** Scene-specific configuration */
  config?: Record<string, any>
}

export interface SceneFactory {
  /** Unique scene type identifier */
  type: string
  /** Create a new scene instance */
  create(): Scene
}

/**
 * SceneManager
 *
 * Manages scene lifecycle tied to scroll lock states.
 * Activates/deactivates scenes as user scrolls through sections.
 */
export class SceneManager {
  private scenes: Map<string, SceneFactory> = new Map()
  private activeScene: Scene | null = null
  private activeSectionId: string | null = null
  private container: HTMLElement | null = null
  private animationFrame: number | null = null
  private lastFrameTime: number = 0
  private onSceneComplete?: (sectionId: string) => void

  constructor(container: HTMLElement, options?: { onSceneComplete?: (sectionId: string) => void }) {
    this.container = container
    this.onSceneComplete = options?.onSceneComplete
  }

  /**
   * Register a scene factory for a specific section
   * @param sectionId - Section ID to bind the scene to
   * @param factory - Scene factory to create instances
   */
  register(sectionId: string, factory: SceneFactory): void {
    this.scenes.set(sectionId, factory)
  }

  /**
   * Activate a scene for the given section
   * @param sectionId - Section to activate
   * @param options - Scene initialization options
   */
  async activate(sectionId: string, options: Partial<SceneInitOptions> = {}): Promise<void> {
    // Don't reactivate the same scene
    if (this.activeSectionId === sectionId && this.activeScene) {
      return
    }

    // Dispose of current scene
    if (this.activeScene) {
      this.dispose()
    }

    const factory = this.scenes.get(sectionId)
    if (!factory || !this.container) {
      return
    }

    // Create and initialize new scene
    const scene = factory.create()
    this.activeScene = scene
    this.activeSectionId = sectionId

    const initOptions: SceneInitOptions = {
      sectionId,
      width: this.container.clientWidth,
      height: this.container.clientHeight,
      dpr: window.devicePixelRatio || 1,
      ...options,
    }

    await scene.init(this.container, initOptions)

    // Set completion callback
    if (scene.setOnCompleteCallback) {
      scene.setOnCompleteCallback(() => {
        console.log(`Scene completed: ${sectionId}`)
        this.onSceneComplete?.(sectionId)
      })
    }

    // Start animation loop
    this.startAnimationLoop()
  }

  /**
   * Update the active scene with current scroll state
   * @param scrollState - Current scroll experience state
   */
  syncWithScroll(scrollState: ScrollExperienceValue): void {
    if (!this.activeScene) {
      return
    }

    // Handle intent changes
    this.activeScene.handleIntent(scrollState.intent.intent)

    // Auto-activate scene when section is locked
    if (scrollState.lock.locked && scrollState.lock.sectionId) {
      const lockedSectionId = scrollState.lock.sectionId
      if (this.activeSectionId !== lockedSectionId) {
        this.activate(lockedSectionId).catch((error) => {
          console.error('Scene activation failed:', error)
        })
      }
    }

    // Deactivate when skimming
    if (scrollState.intent.intent === 'SKIMMING') {
      this.pause()
    } else if (scrollState.intent.intent === 'EXPLORING') {
      this.resume()
    }
  }

  /**
   * Pause the active scene
   */
  pause(): void {
    if (this.activeScene?.pause) {
      this.activeScene.pause()
    }
    this.stopAnimationLoop()
  }

  /**
   * Resume the active scene
   */
  resume(): void {
    if (this.activeScene?.resume) {
      this.activeScene.resume()
    }
    this.startAnimationLoop()
  }

  /**
   * Dispose of the active scene
   */
  dispose(): void {
    this.stopAnimationLoop()

    if (this.activeScene) {
      try {
        this.activeScene.dispose()
      } catch (error) {
        console.error('Scene disposal error:', error)
      } finally {
        this.activeScene = null
        this.activeSectionId = null
      }
    }
  }

  /**
   * Destroy the scene manager and cleanup all resources
   */
  destroy(): void {
    this.dispose()
    this.scenes.clear()
    this.container = null
  }

  private startAnimationLoop(): void {
    if (this.animationFrame !== null) {
      return
    }

    this.lastFrameTime = performance.now()
    this.animationFrame = requestAnimationFrame(this.animate.bind(this))
  }

  private stopAnimationLoop(): void {
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }
  }

  private animate(timestamp: number): void {
    if (!this.activeScene) {
      this.stopAnimationLoop()
      return
    }

    const deltaTime = timestamp - this.lastFrameTime
    this.lastFrameTime = timestamp

    // Note: scrollState needs to be passed from external source
    // For now, scenes should access it via their own context
    // this.activeScene.update(deltaTime, scrollState)

    this.animationFrame = requestAnimationFrame(this.animate.bind(this))
  }

  /**
   * Get the currently active scene
   */
  getActiveScene(): Scene | null {
    return this.activeScene
  }

  /**
   * Get the active section ID
   */
  getActiveSectionId(): string | null {
    return this.activeSectionId
  }
}
