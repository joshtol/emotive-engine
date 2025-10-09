/**
 * SiteController - thin wrapper around EmotiveMascot for site integrations.
 * Provides a stable entry point for positioning, gesture, and playback helpers.
 */
export class SiteController {
  /**
   * @param {{ mascot: any, onError?: (error: Error) => void }} [options]
   */
  constructor(options = {}) {
    const { mascot = null, onError } = options
    this.mascot = mascot
    this._onError = onError ?? ((error) => {
      if (process.env.NODE_ENV !== 'production') {
        console.error('SiteController error:', error)
      }
    })
  }

  /**
   * Update the mascot reference if the caller reinitialises the engine.
   * @param {any} mascot
   */
  updateMascot(mascot) {
    this.mascot = mascot
    return this
  }

  /**
   * @returns {any|null}
   */
  get positionController() {
    return this.mascot?.positionController ?? null
  }

  /**
   * @returns {any|null}
   */
  getElementTargeting() {
    return this.positionController?.getElementTargeting?.() ?? null
  }

  /**
   * Move the mascot toward a DOM element using the engine path helper when available.
   * @param {string} selector
   * @param {{ offset?: { x: number; y: number }, speed?: number, easing?: string, coordinateSystem?: string }} [options]
   */
  moveToElement(selector, options = {}) {
    return this.moveToElementWithPath(selector, [], 'center', options.offset ?? { x: 0, y: 0 }, options)
  }

  /**
   * Move the mascot using explicit path points.
   * @param {string} selector
   * @param {Array<{ x: number; y: number }>} pathPoints
   * @param {'center' | 'start' | 'end'} [alignment]
   * @param {{ x: number; y: number }} [offset]
   * @param {{ speed?: number; easing?: string; coordinateSystem?: string }} [options]
   */
  moveToElementWithPath(selector, pathPoints = [], alignment = 'center', offset = { x: 0, y: 0 }, options = {}) {
    const controller = this.positionController
    if (!controller) {
      return undefined
    }

    const elementTargeting = controller.getElementTargeting?.()
    const speed = options.speed ?? 320
    const easing = options.easing ?? 'easeInOutCubic'
    const coordinateSystem = options.coordinateSystem ?? 'viewport'

    if (elementTargeting?.moveToElementWithPath) {
      try {
        return elementTargeting.moveToElementWithPath(
          selector,
          pathPoints,
          alignment,
          offset,
          { coordinateSystem, speed, easing }
        )
      } catch (error) {
        this._handleError(error)
      }
    }

    if (controller.setOffset) {
      controller.setOffset(offset.x, offset.y, 0)
    }

    return undefined
  }

  /**
   * Directly set the mascot offset.
   */
  setOffset(x, y, z = 0) {
    try {
      this.positionController?.setOffset?.(x, y, z)
    } catch (error) {
      this._handleError(error)
    }
  }

  /**
   * Get the current offset from the position controller.
   */
  getOffset() {
    try {
      return this.positionController?.getOffset?.() ?? { x: 0, y: 0 }
    } catch (error) {
      this._handleError(error)
      return { x: 0, y: 0 }
    }
  }

  /**
   * Update mascot emotion.
   */
  setEmotion(emotion) {
    try {
      this.mascot?.setEmotion?.(emotion)
    } catch (error) {
      this._handleError(error)
    }
  }

  /**
   * Trigger gesture or chain.
   */
  express(gesture, options = {}) {
    try {
      if (options.chain && this.mascot?.chain) {
        this.mascot.chain(gesture)
        return
      }
      this.mascot?.express?.(gesture)
    } catch (error) {
      this._handleError(error)
    }
  }

  /**
   * Stop active paths/animations without destroying configuration.
   */
  stop() {
    try {
      const controller = this.positionController
      controller?.stopCurrentPath?.()
      controller?.stop?.()
      this.mascot?.pause?.()
    } catch (error) {
      this._handleError(error)
    }
  }

  /**
   * Resume mascot playback.
   */
  play() {
    try {
      this.mascot?.play?.()
    } catch (error) {
      this._handleError(error)
    }
  }

  /**
   * Destroy controller references and clear listeners.
   */
  destroy() {
    this.stop()
    this.mascot = null
  }

  _handleError(error) {
    if (error instanceof Error) {
      this._onError(error)
    } else {
      this._onError(new Error(String(error)))
    }
  }
}
