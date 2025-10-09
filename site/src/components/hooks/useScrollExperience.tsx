'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { ScrollIntentState } from './useScrollIntent'
import type { ScrollLockState, ScrollLockReason, LockSectionParams } from './useScrollLock'
import type { AvatarController } from '@/lib/avatar-controller'

export interface ScrollExperienceValue {
  intent: ScrollIntentState
  lock: ScrollLockState
  lockSection: (params: LockSectionParams) => void
  releaseLock: (reason?: ScrollLockReason) => void
  activeSection: number
  sections: ReadonlyArray<{ id: string; title: string; subtitle: string; pathAnchor: number; offset: { x: number; y: number } }>
  visitedSections: ReadonlySet<string>
  lockedSections: ReadonlySet<string>
  avatarController: AvatarController | null
}

const ScrollExperienceContext = createContext<ScrollExperienceValue | null>(null)

export function ScrollExperienceProvider({ value, children }: { value: ScrollExperienceValue; children: ReactNode }) {
  return <ScrollExperienceContext.Provider value={value}>{children}</ScrollExperienceContext.Provider>
}

export function useScrollExperience(): ScrollExperienceValue {
  const context = useContext(ScrollExperienceContext)
  if (!context) {
    throw new Error('useScrollExperience must be used within a ScrollExperienceProvider')
  }
  return context
}
