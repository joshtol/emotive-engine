'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { ScrollIntentState, ScrollIntent } from '@/components/hooks/useScrollIntent'

type ScrollDirection = 'up' | 'down' | null

export type ScrollLockReason = 'manual' | 'buffer-release' | 'hard-break' | 'skimming' | 'scene-complete'

export interface ScrollLockState {
  locked: boolean
  sectionId: string | null
  distance: number
  direction: ScrollDirection
  intent: ScrollIntent
}

export interface LockSectionParams {
  sectionId: string
  anchorY?: number
  meta?: Record<string, unknown>
}

export interface UseScrollLockOptions {
  intentState: ScrollIntentState
  lockThreshold?: number
  buffer?: number
  confidenceThreshold?: number
  onLock?: (sectionId: string, meta?: Record<string, unknown>) => void
  onUnlock?: (sectionId: string | null, reason: ScrollLockReason, meta?: Record<string, unknown>) => void
  onHardBreak?: (sectionId: string | null, meta?: Record<string, unknown>) => void
}

const DEFAULT_LOCK_STATE: ScrollLockState = {
  locked: false,
  sectionId: null,
  distance: 0,
  direction: null,
  intent: 'EXPLORING',
}

const DEFAULT_OPTIONS = {
  lockThreshold: 100,
  buffer: 100,
  confidenceThreshold: 0.6,
}

export function shouldReleaseLock(
  intent: ScrollIntent,
  confidence: number,
  distance: number,
  buffer: number,
  confidenceThreshold: number,
): boolean {
  if (intent === 'SKIMMING') {
    return true
  }

  if (distance < buffer) {
    return false
  }

  if (intent === 'SEEKING' && confidence >= confidenceThreshold) {
    return true
  }

  if (intent === 'EXPLORING' && confidence >= confidenceThreshold && distance >= buffer * 1.5) {
    return true
  }

  return false
}

export function shouldHardBreak(distance: number, buffer: number, lockThreshold: number): boolean {
  return distance >= buffer + lockThreshold
}

function shouldUpdateLockState(prev: ScrollLockState, next: ScrollLockState): boolean {
  if (prev.locked !== next.locked) return true
  if (prev.sectionId !== next.sectionId) return true
  if (prev.direction !== next.direction) return true
  if (prev.intent !== next.intent) return true
  if (Math.abs(prev.distance - next.distance) > 1) return true
  return false
}

export function useScrollLock(options: UseScrollLockOptions): {
  state: ScrollLockState
  lockSection: (params: LockSectionParams) => void
  unlock: (reason?: ScrollLockReason) => void
} {
  const { intentState, onLock, onUnlock, onHardBreak } = options
  const lockThreshold = options.lockThreshold ?? DEFAULT_OPTIONS.lockThreshold
  const buffer = options.buffer ?? DEFAULT_OPTIONS.buffer
  const confidenceThreshold = options.confidenceThreshold ?? DEFAULT_OPTIONS.confidenceThreshold

  const [state, setState] = useState<ScrollLockState>(DEFAULT_LOCK_STATE)
  const stateRef = useRef<ScrollLockState>(DEFAULT_LOCK_STATE)
  const anchorYRef = useRef<number>(0)
  const metaRef = useRef<Record<string, unknown> | undefined>(undefined)
  const hardBrokenRef = useRef<boolean>(false)

  const intentRef = useRef<ScrollIntentState>(intentState)
  useEffect(() => {
    intentRef.current = intentState
  }, [intentState])

  const updateState = useCallback((next: ScrollLockState) => {
    if (!shouldUpdateLockState(stateRef.current, next)) {
      return
    }

    stateRef.current = next
    setState(next)
  }, [])

  const unlock = useCallback(
    (reason: ScrollLockReason = 'manual') => {
      if (!stateRef.current.locked) {
        return
      }

      const previousSection = stateRef.current.sectionId
      const meta = metaRef.current

      stateRef.current = { ...DEFAULT_LOCK_STATE }
      anchorYRef.current = 0
      metaRef.current = undefined
      hardBrokenRef.current = false
      setState(stateRef.current)

      if (onUnlock) {
        onUnlock(previousSection, reason, meta)
      }
    },
    [onUnlock],
  )

  const lockSection = useCallback(
    (params: LockSectionParams) => {
      const { sectionId, anchorY, meta } = params
      const currentIntent = intentRef.current
      const latestSample = currentIntent.samples[currentIntent.samples.length - 1]

      const resolvedAnchor =
        typeof anchorY === 'number'
          ? anchorY
          : latestSample
            ? latestSample.y
            : typeof window !== 'undefined'
              ? window.scrollY
              : 0

      if (stateRef.current.locked && stateRef.current.sectionId === sectionId) {
        // Update anchor if provided explicitly but do not trigger unlock
        if (typeof anchorY === 'number') {
          anchorYRef.current = resolvedAnchor
        }
        metaRef.current = meta
        return
      }

      anchorYRef.current = resolvedAnchor
      metaRef.current = meta
      hardBrokenRef.current = false

      const nextState: ScrollLockState = {
        locked: true,
        sectionId,
        distance: 0,
        direction: null,
        intent: currentIntent.intent,
      }

      stateRef.current = nextState
      setState(nextState)

      if (onLock) {
        onLock(sectionId, meta)
      }
    },
    [onLock],
  )

  useEffect(() => {
    if (!stateRef.current.locked) {
      return
    }

    const currentIntent = intentRef.current
    const latestSample = currentIntent.samples[currentIntent.samples.length - 1]

    const currentY = latestSample
      ? latestSample.y
      : typeof window !== 'undefined'
        ? window.scrollY
        : anchorYRef.current

    const distance = Math.abs(currentY - anchorYRef.current)
    const direction: ScrollDirection = currentY < anchorYRef.current ? 'up' : currentY > anchorYRef.current ? 'down' : stateRef.current.direction

    const nextState: ScrollLockState = {
      locked: true,
      sectionId: stateRef.current.sectionId,
      distance,
      direction,
      intent: currentIntent.intent,
    }

    updateState(nextState)

    if (!hardBrokenRef.current && shouldHardBreak(distance, buffer, lockThreshold)) {
      hardBrokenRef.current = true
      if (onHardBreak) {
        onHardBreak(stateRef.current.sectionId, metaRef.current)
      }
      unlock('hard-break')
      return
    }

    if (shouldReleaseLock(currentIntent.intent, currentIntent.confidence, distance, buffer, confidenceThreshold)) {
      const releaseReason = currentIntent.intent === 'SKIMMING' ? 'skimming' : 'buffer-release'
      unlock(releaseReason)
    }
  }, [buffer, confidenceThreshold, lockThreshold, onHardBreak, unlock, updateState, intentState.samples, intentState.intent, intentState.confidence])

  return {
    state,
    lockSection,
    unlock,
  }
}

export const __scrollLockInternals = {
  shouldReleaseLock,
  shouldHardBreak,
}
