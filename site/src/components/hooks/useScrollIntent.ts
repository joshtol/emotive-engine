'use client'

import { useEffect, useRef, useState } from 'react'

export interface ScrollIntentSample {
  timestamp: number
  y: number
  delta: number
  velocity: number
  source: 'wheel' | 'touch' | 'keyboard' | 'unknown'
}

export type ScrollIntent = 'EXPLORING' | 'SEEKING' | 'SKIMMING' | 'IDLE'

export interface ScrollIntentState {
  intent: ScrollIntent
  velocity: number
  distance: number
  confidence: number
  samples: ScrollIntentSample[]
  up: boolean
}

export interface UseScrollIntentOptions {
  sampleWindow?: number
  idleThreshold?: number
  hardBreakDistance?: number
  debug?: boolean | ((state: ScrollIntentState) => void)
  onIntentChange?: (intent: ScrollIntent, prev: ScrollIntent) => void
  onConfidenceChange?: (confidence: number, prev: number) => void
  onHardBreak?: (state: ScrollIntentState) => void
}

const DEFAULT_STATE: ScrollIntentState = {
  intent: 'IDLE',
  velocity: 0,
  distance: 0,
  confidence: 1,
  samples: [],
  up: false,
}

const INTENT_THRESHOLDS = {
  exploringVelocity: 1200,
  exploringDelta: 400,
  skimmingVelocity: 4000,
  skimmingDelta: 2000,
}

const MAX_SAMPLES = 120
const KEYBOARD_SCROLL_KEYS = new Set([
  'ArrowDown',
  'ArrowUp',
  'ArrowLeft',
  'ArrowRight',
  'PageDown',
  'PageUp',
  'End',
  'Home',
  'Space',
])

function classifySample(sample: ScrollIntentSample): ScrollIntent {
  const absVelocity = Math.abs(sample.velocity)
  const absDelta = Math.abs(sample.delta)

  if (absVelocity > INTENT_THRESHOLDS.skimmingVelocity || absDelta >= INTENT_THRESHOLDS.skimmingDelta) {
    return 'SKIMMING'
  }

  if (absVelocity >= INTENT_THRESHOLDS.exploringVelocity || absDelta >= INTENT_THRESHOLDS.exploringDelta) {
    return 'SEEKING'
  }

  return 'EXPLORING'
}

function computeConfidence(samples: ScrollIntentSample[], intent: ScrollIntent): number {
  if (intent === 'IDLE') {
    return 1
  }

  if (samples.length === 0) {
    return 0
  }

  const recentWindowStart = Math.max(samples.length - 10, 0)
  let totalWeight = 0
  let supporting = 0
  let conflicting = 0

  samples.forEach((sample, index) => {
    const weight = index >= recentWindowStart ? 2 : 1
    totalWeight += weight

    if (classifySample(sample) === intent) {
      supporting += weight
    } else {
      conflicting += weight
    }
  })

  if (totalWeight === 0) {
    return 0
  }

  let ratio = supporting / totalWeight

  if (conflicting / totalWeight > 0.3) {
    ratio *= 0.8
  }

  return Math.min(1, Math.max(0, ratio))
}

function shouldUpdateState(prev: ScrollIntentState, next: ScrollIntentState): boolean {
  if (prev.intent !== next.intent) return true
  if (prev.up !== next.up) return true
  if (Math.abs(prev.velocity - next.velocity) > 10) return true
  if (Math.abs(prev.distance - next.distance) > 5) return true
  if (Math.abs(prev.confidence - next.confidence) > 0.05) return true
  if (prev.samples.length !== next.samples.length) return true
  return false
}

export function useScrollIntent(options: UseScrollIntentOptions = {}): ScrollIntentState {
  const {
    sampleWindow = 1000,
    idleThreshold = 250,
    hardBreakDistance = 200,
    debug,
    onIntentChange,
    onConfidenceChange,
    onHardBreak,
  } = options

  const [state, setState] = useState<ScrollIntentState>(DEFAULT_STATE)
  const stateRef = useRef<ScrollIntentState>(DEFAULT_STATE)
  const samplesRef = useRef<ScrollIntentSample[]>([])
  const lastYRef = useRef(0)
  const lastTimeRef = useRef(0)
  const lastMovementTimeRef = useRef(0)
  const lastIntentRef = useRef<ScrollIntent>('IDLE')
  const lastConfidenceRef = useRef(1)
  const distanceRef = useRef(0)
  const hardBreakTriggeredRef = useRef(false)
  const rafRef = useRef<number | null>(null)
  const lastInputTypeRef = useRef<ScrollIntentSample['source']>('unknown')

  const callbacksRef = useRef({ debug, onIntentChange, onConfidenceChange, onHardBreak })

  useEffect(() => {
    callbacksRef.current = { debug, onIntentChange, onConfidenceChange, onHardBreak }
  }, [debug, onIntentChange, onConfidenceChange, onHardBreak])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    let isMounted = true

    const initialise = () => {
      lastYRef.current = window.scrollY
      lastTimeRef.current = performance.now()
      lastMovementTimeRef.current = lastTimeRef.current
    }

    initialise()

    const handleWheel = () => {
      lastInputTypeRef.current = 'wheel'
    }

    const handleTouchMove = () => {
      lastInputTypeRef.current = 'touch'
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (KEYBOARD_SCROLL_KEYS.has(event.key)) {
        lastInputTypeRef.current = 'keyboard'
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    window.addEventListener('keydown', handleKeyDown)

    const loop = () => {
      if (!isMounted) {
        return
      }

      const now = performance.now()
      const currentY = window.scrollY
      const delta = currentY - lastYRef.current
      const elapsed = now - lastTimeRef.current || 16

      if (delta !== 0) {
        const velocity = (Math.abs(delta) / (elapsed || 1)) * 1000
        const sample: ScrollIntentSample = {
          timestamp: now,
          y: currentY,
          delta,
          velocity,
          source: lastInputTypeRef.current,
        }

        samplesRef.current.push(sample)
        lastMovementTimeRef.current = now

        if (samplesRef.current.length > MAX_SAMPLES) {
          samplesRef.current.splice(0, samplesRef.current.length - MAX_SAMPLES)
        }
      }

      // Prune old samples outside the time window
      const cutoff = now - sampleWindow
      while (samplesRef.current.length && samplesRef.current[0].timestamp < cutoff) {
        samplesRef.current.shift()
      }

      const timeSinceMovement = now - lastMovementTimeRef.current

      let nextIntent: ScrollIntent = stateRef.current.intent
      let nextVelocity = stateRef.current.velocity
      let nextUp = stateRef.current.up

      const samples = samplesRef.current
      const latestSample = samples[samples.length - 1]

      if (timeSinceMovement >= idleThreshold) {
        nextIntent = 'IDLE'
        nextVelocity = 0
        distanceRef.current = 0
        hardBreakTriggeredRef.current = false
      } else if (latestSample) {
        nextIntent = classifySample(latestSample)
        nextVelocity = latestSample.velocity
        nextUp = latestSample.delta < 0

        if (nextIntent !== lastIntentRef.current) {
          distanceRef.current = Math.abs(latestSample.delta)
          hardBreakTriggeredRef.current = false
        } else {
          distanceRef.current += Math.abs(latestSample.delta)
        }
      }

      const nextConfidence = nextIntent === 'IDLE' ? 1 : computeConfidence(samples, nextIntent)
      const adjustedConfidence = nextIntent !== lastIntentRef.current
        ? Math.min(nextConfidence, 0.6)
        : nextConfidence

      const nextState: ScrollIntentState = {
        intent: nextIntent,
        velocity: nextVelocity,
        distance: distanceRef.current,
        confidence: adjustedConfidence,
        samples: samples.slice(),
        up: nextUp,
      }

      if (shouldUpdateState(stateRef.current, nextState)) {
        const prevState = stateRef.current
        stateRef.current = nextState

        setState(nextState)

        if (callbacksRef.current.onIntentChange && prevState.intent !== nextIntent) {
          callbacksRef.current.onIntentChange(nextIntent, prevState.intent)
        }

        if (
          callbacksRef.current.onConfidenceChange &&
          Math.abs(adjustedConfidence - lastConfidenceRef.current) > 0.01
        ) {
          callbacksRef.current.onConfidenceChange(adjustedConfidence, lastConfidenceRef.current)
        }

        if (
          callbacksRef.current.onHardBreak &&
          !hardBreakTriggeredRef.current &&
          distanceRef.current >= hardBreakDistance
        ) {
          hardBreakTriggeredRef.current = true
          callbacksRef.current.onHardBreak(nextState)
        }

        const debugHandler = callbacksRef.current.debug
        if (debugHandler) {
          if (typeof debugHandler === 'function') {
            debugHandler(nextState)
          } else if (debugHandler === true && process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line no-console
            console.table({
              intent: nextState.intent,
              velocity: Math.round(nextState.velocity),
              distance: Math.round(nextState.distance),
              confidence: nextState.confidence.toFixed(2),
              up: nextState.up,
              samples: nextState.samples.length,
            })
          }
        }

        lastIntentRef.current = nextIntent
        lastConfidenceRef.current = adjustedConfidence
      }

      lastYRef.current = currentY
      lastTimeRef.current = now
      lastInputTypeRef.current = 'unknown'

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)

    return () => {
      isMounted = false
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
      }
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [sampleWindow, idleThreshold, hardBreakDistance])

  return state
}

export const __scrollIntentInternals = {
  classifySample,
  computeConfidence,
}

