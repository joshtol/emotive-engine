import { describe, expect, it } from 'vitest'
import { __scrollLockInternals } from '../useScrollLock'

const { shouldReleaseLock, shouldHardBreak } = __scrollLockInternals

describe('shouldReleaseLock', () => {
  const buffer = 100
  const confidenceThreshold = 0.6

  it('releases immediately when intent is SKIMMING', () => {
    expect(shouldReleaseLock('SKIMMING', 0.1, 10, buffer, confidenceThreshold)).toBe(true)
  })

  it('holds lock when distance inside buffer', () => {
    expect(shouldReleaseLock('SEEKING', 0.9, 50, buffer, confidenceThreshold)).toBe(false)
  })

  it('releases when seeking with high confidence beyond buffer', () => {
    expect(shouldReleaseLock('SEEKING', 0.8, 140, buffer, confidenceThreshold)).toBe(true)
  })

  it('holds when confidence below threshold even beyond buffer', () => {
    expect(shouldReleaseLock('SEEKING', 0.4, 160, buffer, confidenceThreshold)).toBe(false)
  })

  it('requires extra distance for exploring intent before releasing', () => {
    expect(shouldReleaseLock('EXPLORING', 0.7, 120, buffer, confidenceThreshold)).toBe(false)
    expect(shouldReleaseLock('EXPLORING', 0.7, 160, buffer, confidenceThreshold)).toBe(true)
  })
})

describe('shouldHardBreak', () => {
  it('hard breaks once distance exceeds buffer + threshold', () => {
    expect(shouldHardBreak(210, 100, 100)).toBe(true)
  })

  it('does not hard break within combined limit', () => {
    expect(shouldHardBreak(180, 100, 100)).toBe(false)
  })
})
