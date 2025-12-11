'use client'

import { useRef, useEffect, useCallback } from 'react'
import { MascotMode } from './useMascotMode'

/**
 * Greeting card configuration for mascot display
 */
export interface GreetingCardConfig {
  emotion: string
  intensity?: number
  shape?: string  // 'crystal', 'rough', 'heart', 'sun', 'moon', 'solar'
  sssPreset?: string  // 'quartz', 'emerald', 'ruby', 'sapphire', 'amethyst'
  gestures?: Array<{ name: string; delay: number }>
}

/**
 * Options for the useCardMascot hook
 */
export interface UseCardMascotOptions {
  /** Currently selected card index (null = closed) */
  selectedIndex: number | null
  /** Greeting card configurations */
  greetings: GreetingCardConfig[]
  /** Current mascot mode (2d or 3d) */
  mascotMode: MascotMode
  /** Whether viewing on mobile device */
  isMobile: boolean
  /** Container ref for 3D mode */
  containerRef: React.RefObject<HTMLDivElement | null>
  /** Canvas ref for 2D mode */
  canvasRef: React.RefObject<HTMLCanvasElement | null>
}

/**
 * Return type for the useCardMascot hook
 */
export interface UseCardMascotReturn {
  /** Current mascot instance */
  mascot: any
  /** Whether mascot is initialized */
  isInitialized: boolean
  /** Current geometry type */
  geometryType: string | null
}

/**
 * Helper to position mascot camera to a spacer element
 */
const positionMascotToSpacer = (cardMascot: any, container: HTMLElement, spacerId = 'card-mascot-spacer') => {
  const spacer = document.getElementById(spacerId)
  if (spacer && container && cardMascot.core3D?.renderer) {
    const spacerRect = spacer.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()

    const containerCenterX = containerRect.width / 2
    const containerCenterY = containerRect.height / 2
    const spacerCenterX = spacerRect.left + spacerRect.width / 2 - containerRect.left
    const spacerCenterY = spacerRect.top + spacerRect.height / 2 - containerRect.top

    const offsetX = spacerCenterX - containerCenterX
    const offsetY = spacerCenterY - containerCenterY

    const camera = cardMascot.core3D.renderer.camera
    if (camera) {
      const fovRad = (camera.fov * Math.PI) / 180
      const visibleHeight = 2 * Math.tan(fovRad / 2) * camera.position.z
      const visibleWidth = visibleHeight * camera.aspect

      const worldOffsetX = (offsetX / containerRect.width) * visibleWidth
      const worldOffsetY = -(offsetY / containerRect.height) * visibleHeight

      camera.position.x = -worldOffsetX
      camera.position.y = -worldOffsetY
      camera.lookAt(-worldOffsetX, -worldOffsetY, 0)
    }
  }
}

/**
 * Hook for managing greeting card mascot instances
 * Handles mascot creation, reuse, morphing, SSS presets, and animations
 */
export function useCardMascot({
  selectedIndex,
  greetings,
  mascotMode,
  isMobile,
  containerRef,
  canvasRef,
}: UseCardMascotOptions): UseCardMascotReturn {
  const mascotRef = useRef<any>(null)
  const initializedRef = useRef<boolean>(false)
  const geometryRef = useRef<string | null>(null)
  const gestureIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Cleanup mascot when card is closed
  useEffect(() => {
    if (selectedIndex !== null) return  // Card is open, don't cleanup

    // Card closed - cleanup mascot
    if (gestureIntervalRef.current) {
      clearInterval(gestureIntervalRef.current)
      gestureIntervalRef.current = null
    }

    if (mascotRef.current) {
      mascotRef.current.stop?.()
      mascotRef.current.destroy?.()
      mascotRef.current = null
      initializedRef.current = false
      geometryRef.current = null
    }
  }, [selectedIndex])

  // Configure card mascot when phrase is selected
  useEffect(() => {
    if (selectedIndex === null) return

    let cancelled = false
    const timeoutIds: ReturnType<typeof setTimeout>[] = []

    // Clear any existing gesture interval
    if (gestureIntervalRef.current) {
      clearInterval(gestureIntervalRef.current)
      gestureIntervalRef.current = null
    }

    const configureCardMascot = async () => {
      // Wait for container/canvas to be available
      if (mascotMode === '3d') {
        let containerAttempts = 0
        while (!containerRef.current && containerAttempts < 20) {
          await new Promise(resolve => setTimeout(resolve, 50))
          containerAttempts++
        }
        if (!containerRef.current) {
          return
        }
      } else if (mascotMode === '2d') {
        let canvasAttempts = 0
        while (!canvasRef.current && canvasAttempts < 20) {
          await new Promise(resolve => setTimeout(resolve, 50))
          canvasAttempts++
        }
        if (!canvasRef.current) {
          return
        }
      }

      const greeting = greetings[selectedIndex]
      if (!greeting) {
        return
      }

      // Determine geometry type for this card
      const geometry3D = greeting.shape === 'solar' ? 'sun' : (greeting.shape || 'crystal')
      const isSolarEclipse = greeting.shape === 'solar'
      const isLunarEclipse = greeting.shape === 'moon'
      const isSun = geometry3D === 'sun'
      const isEclipse = isSolarEclipse || isLunarEclipse
      const isCrystal = ['crystal', 'rough', 'heart'].includes(geometry3D)

      if (mascotMode === '3d') {
        // ═══════════════════════════════════════════════════════════════════
        // 3D MODE: Use EmotiveMascot3D with instance reuse
        // ═══════════════════════════════════════════════════════════════════

        const container = containerRef.current
        if (!container) return

        // Check if we can reuse existing mascot (same material type)
        const existingMascot = mascotRef.current
        const existingGeometry = geometryRef.current

        // Determine reuse compatibility:
        // - Crystals can reuse each other (crystal, rough, heart) - same SSS material
        // - Sun types can only reuse sun (solar eclipse is still sun geometry)
        // - Moon CANNOT reuse sun and vice versa - completely different material systems
        const existingIsCrystal = ['crystal', 'rough', 'heart'].includes(existingGeometry || '')
        const existingIsSun = existingGeometry === 'sun'
        const existingIsMoon = existingGeometry === 'moon'

        const canReuse = existingMascot &&
                         initializedRef.current &&
                         ((isCrystal && existingIsCrystal) ||
                          ((isSun || isSolarEclipse) && existingIsSun) ||
                          (isLunarEclipse && existingIsMoon))

        if (canReuse && existingMascot) {
          // ═══════════════════════════════════════════════════════════════════
          // REUSE EXISTING MASCOT - just morph and update settings
          // ═══════════════════════════════════════════════════════════════════

          // Morph to new geometry if different
          if (existingGeometry !== geometry3D && existingMascot.morphTo) {
            // Get SSS preset applier from engine if available
            const module = (window as any).EmotiveMascot3D
            const applySSSPreset = module?.applySSSPreset

            // Set up callback to apply SSS preset AFTER material swap during morph
            if (greeting.sssPreset && isCrystal && existingMascot.core3D && applySSSPreset) {
              existingMascot.core3D.onMaterialSwap = (swapInfo: { geometryType: string, material: any }) => {
                if (swapInfo.geometryType === geometry3D && swapInfo.material) {
                  applySSSPreset(existingMascot, greeting.sssPreset)
                }
                existingMascot.core3D.onMaterialSwap = null
              }
            }
            existingMascot.morphTo(geometry3D)
            geometryRef.current = geometry3D
          } else {
            // No morph needed - apply SSS preset directly
            if (greeting.sssPreset && isCrystal) {
              const module = (window as any).EmotiveMascot3D
              module?.applySSSPreset?.(existingMascot, greeting.sssPreset)
            }
          }

          // Update emotion
          if (existingMascot.setEmotion) {
            existingMascot.setEmotion(greeting.emotion, 0)
          }

          // Handle eclipse animations on reused instance
          setupEclipseAnimations(existingMascot, isSolarEclipse, isLunarEclipse, cancelled, timeoutIds)

          // Setup gestures
          if (!isEclipse && greeting.gestures) {
            setupGestures(existingMascot, greeting.gestures, gestureIntervalRef, cancelled, timeoutIds)
          }

          // Reposition for new card layout
          setTimeout(() => positionMascotToSpacer(existingMascot, container), 50)

          return  // Done with reuse path
        }

        // ═══════════════════════════════════════════════════════════════════
        // CREATE NEW MASCOT - geometry type changed significantly
        // ═══════════════════════════════════════════════════════════════════

        // Cleanup existing mascot
        if (mascotRef.current) {
          mascotRef.current.stop?.()
          mascotRef.current.destroy?.()
          mascotRef.current = null
          initializedRef.current = false
          geometryRef.current = null
        }

        // Wait for EmotiveMascot3D to load
        let attempts = 0
        while (!(window as any).EmotiveMascot3D && attempts < 50) {
          await new Promise(resolve => setTimeout(resolve, 100))
          attempts++
        }

        if (!(window as any).EmotiveMascot3D) {
          return
        }

        // Clear container
        container.innerHTML = ''

        try {
          const EmotiveMascot3DModule = (window as any).EmotiveMascot3D
          const EmotiveMascot3D = EmotiveMascot3DModule?.default || EmotiveMascot3DModule

          if (!EmotiveMascot3D || typeof EmotiveMascot3D !== 'function') {
            return
          }

          // Determine camera settings based on shape
          const mobileMultiplier = isMobile ? 1.11 : 1.0
          let cameraDistance = 3.7
          let fov = 32
          if (isSolarEclipse) {
            cameraDistance = 1.88 * mobileMultiplier
            fov = 45
          } else if (isSun) {
            cameraDistance = 1.73 * mobileMultiplier
            fov = 45
          } else if (isLunarEclipse) {
            cameraDistance = 1.57 * mobileMultiplier
            fov = 45
          } else if (isCrystal) {
            cameraDistance = 2.4
            fov = 40
          }

          const cardMascot = new EmotiveMascot3D({
            coreGeometry: geometry3D,
            materialVariant: (isSun || isEclipse) ? 'multiplexer' : undefined,
            enableParticles: true,
            enablePostProcessing: true,
            enableControls: false,
            autoRotate: !isLunarEclipse,
            autoRotateSpeed: isSolarEclipse ? 0.2 : 0.5,
            defaultEmotion: greeting.emotion,
            enableBlinking: !isEclipse,
            enableBreathing: !isEclipse,
            cameraDistance,
            fov,
            enableShadows: false,
          })

          cardMascot.init(container)
          cardMascot.start()

          // Set refs after mascot is successfully started
          mascotRef.current = cardMascot
          geometryRef.current = geometry3D
          initializedRef.current = true

          // Position after layout settles
          setTimeout(() => positionMascotToSpacer(cardMascot, container), 50)

          // Apply SSS preset immediately
          if (greeting.sssPreset) {
            const module = (window as any).EmotiveMascot3D
            module?.applySSSPreset?.(cardMascot, greeting.sssPreset)
          }

          // Use engine's built-in grow-in animation
          cardMascot.growIn(500)

          // Handle eclipse animations
          setupEclipseAnimations(cardMascot, isSolarEclipse, isLunarEclipse, cancelled, timeoutIds)

          // Apply configuration and gestures
          const configTimeout = setTimeout(() => {
            if (cancelled || !mascotRef.current) return

            if (cardMascot.setEmotion) {
              cardMascot.setEmotion(greeting.emotion, 0)
            }

            if (!isEclipse && greeting.gestures) {
              setupGestures(cardMascot, greeting.gestures, gestureIntervalRef, cancelled, timeoutIds)
            }
          }, 300)
          timeoutIds.push(configTimeout)

        } catch (_err) {
          // 3D mascot initialization failed - non-critical
        }

      } else {
        // 2D MODE: Use EmotiveMascot

        // Clean up existing 2D mascot
        if (mascotRef.current) {
          mascotRef.current.stop?.()
          mascotRef.current.destroy?.()
          mascotRef.current = null
        }

        // Wait for either EmotiveMascotLean or EmotiveMascot
        let attempts = 0
        while (!(window as any).EmotiveMascotLean && !(window as any).EmotiveMascot && attempts < 50) {
          await new Promise(resolve => setTimeout(resolve, 100))
          attempts++
        }

        const EmotiveMascotModule = (window as any).EmotiveMascotLean || (window as any).EmotiveMascot
        if (!EmotiveMascotModule) {
          return
        }

        const canvas = canvasRef.current
        if (!canvas) return

        const rect = canvas.getBoundingClientRect()
        const dpr = window.devicePixelRatio || 1
        canvas.setAttribute('width', Math.round(rect.width * dpr).toString())
        canvas.setAttribute('height', Math.round(rect.height * dpr).toString())

        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
        }

        try {
          const EmotiveMascot = EmotiveMascotModule?.default || EmotiveMascotModule

          if (!EmotiveMascot) {
            return
          }

          const cardMascot = new EmotiveMascot({
            canvasId: 'card-mascot',
            enableAudio: false,
            soundEnabled: false,
            defaultEmotion: greeting.emotion,
            enableGazeTracking: true,
            enableIdleBehaviors: true,
            transitionDuration: 400,
            emotionTransitionSpeed: 300,
          })

          mascotRef.current = cardMascot

          await cardMascot.init(canvas)
          cardMascot.start()

          if (cardMascot.setPosition) {
            const offsetX = isMobile ? 0 : -200
            const offsetY = isMobile ? 50 : -120
            cardMascot.setPosition(offsetX, offsetY, 0)
          }

          const configTimeout = setTimeout(() => {
            if (cancelled) return

            if (cardMascot.setEmotion) {
              cardMascot.setEmotion(greeting.emotion, greeting.intensity ?? 0)
            }

            if (greeting.shape && cardMascot.morphTo) {
              cardMascot.morphTo(greeting.shape)
            }

            if (greeting.gestures) {
              const triggerGestures = () => {
                if (cancelled) return
                greeting.gestures!.forEach((gesture) => {
                  const gestureTimeout = setTimeout(() => {
                    if (cancelled) return
                    if (gesture.name === 'drift' && cardMascot.chain) {
                      cardMascot.chain('drift')
                    } else if (cardMascot.express) {
                      cardMascot.express(gesture.name)
                    }
                  }, gesture.delay)
                  timeoutIds.push(gestureTimeout)
                })
              }

              triggerGestures()
              gestureIntervalRef.current = setInterval(() => {
                if (!mascotRef.current) return
                triggerGestures()
              }, 8000)
            }
          }, 200)
          timeoutIds.push(configTimeout)

        } catch (_err) {
          // 2D mascot initialization failed - non-critical
        }
      }
    }

    configureCardMascot()

    return () => {
      cancelled = true
      timeoutIds.forEach(id => clearTimeout(id))
    }
  }, [selectedIndex, isMobile, mascotMode, greetings, containerRef, canvasRef])

  return {
    mascot: mascotRef.current,
    isInitialized: initializedRef.current,
    geometryType: geometryRef.current,
  }
}

/**
 * Setup eclipse animations for solar/lunar eclipses
 */
function setupEclipseAnimations(
  mascot: any,
  isSolarEclipse: boolean,
  isLunarEclipse: boolean,
  cancelled: boolean,
  timeoutIds: ReturnType<typeof setTimeout>[]
) {
  if (isSolarEclipse && mascot.core3D) {
    mascot.core3D.setSunShadow('total')
    if (mascot.core3D.solarEclipse) {
      mascot.core3D.solarEclipse.setManualShadowPosition(-2)
      mascot.core3D.solarEclipse.setShadowCoverage(0.990)

      const startAnimationTimeout = setTimeout(() => {
        if (cancelled) return
        const startTime = performance.now()
        const animateEclipse = () => {
          if (cancelled) return
          const progress = Math.min((performance.now() - startTime) / 600, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          mascot.core3D?.solarEclipse?.setManualShadowPosition(-2 + (2 * eased))
          if (progress < 1) requestAnimationFrame(animateEclipse)
        }
        requestAnimationFrame(animateEclipse)
      }, 100)
      timeoutIds.push(startAnimationTimeout)
    }
  }

  if (isLunarEclipse && mascot.core3D?.customMaterial?.uniforms) {
    const uniforms = mascot.core3D.customMaterial.uniforms
    if (uniforms.eclipseShadowPos) uniforms.eclipseShadowPos.value = [-2.0, 0.0]
    if (uniforms.eclipseShadowRadius) uniforms.eclipseShadowRadius.value = 1.2
    if (uniforms.eclipseProgress) uniforms.eclipseProgress.value = 0.0
    if (uniforms.emissiveStrength) uniforms.emissiveStrength.value = 0.0
    if (uniforms.shadowDarkness) uniforms.shadowDarkness.value = 1.0

    const lunarAnimationTimeout = setTimeout(() => {
      if (cancelled) return
      const startTime = performance.now()
      const animateLunarEclipse = (currentTime: number) => {
        if (cancelled) return
        const progress = Math.min((currentTime - startTime) / 900, 1.0)
        const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2
        if (uniforms.eclipseShadowPos) uniforms.eclipseShadowPos.value[0] = -2.0 + (2.0 * eased)
        if (uniforms.eclipseProgress) uniforms.eclipseProgress.value = eased
        if (uniforms.eclipseIntensity) uniforms.eclipseIntensity.value = eased
        if (uniforms.emissiveStrength) uniforms.emissiveStrength.value = 0.39 * eased
        if (uniforms.shadowDarkness) uniforms.shadowDarkness.value = 1.0 - (0.47 * eased)
        if (progress < 1.0) requestAnimationFrame(animateLunarEclipse)
      }
      requestAnimationFrame(animateLunarEclipse)
    }, 100)
    timeoutIds.push(lunarAnimationTimeout)
  }
}

/**
 * Setup gesture triggering with interval repeat
 */
function setupGestures(
  mascot: any,
  gestures: Array<{ name: string; delay: number }>,
  intervalRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>,
  cancelled: boolean,
  timeoutIds: ReturnType<typeof setTimeout>[]
) {
  const triggerGestures = () => {
    if (cancelled) return
    gestures.forEach((gesture) => {
      const gestureTimeout = setTimeout(() => {
        if (cancelled) return
        if (mascot.express) mascot.express(gesture.name)
      }, gesture.delay)
      timeoutIds.push(gestureTimeout)
    })
  }

  setTimeout(triggerGestures, 200)
  intervalRef.current = setInterval(() => {
    if (!mascot) return
    triggerGestures()
  }, 8000)
}

export default useCardMascot
