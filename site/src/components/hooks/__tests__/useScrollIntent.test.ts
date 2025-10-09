import { describe, expect, it } from 'vitest'
import { __scrollIntentInternals, type ScrollIntentSample } from '../useScrollIntent'

const { classifySample, computeConfidence } = __scrollIntentInternals

describe('classifySample', () => {
  const baseSample = {
    timestamp: 0,
    y: 0,
    source: 'wheel' as const,
  }

  it('returns EXPLORING for low velocity and delta', () => {
    const sample: ScrollIntentSample = {
      ...baseSample,
      delta: 120,
      velocity: 600,
    }

    expect(classifySample(sample)).toBe('EXPLORING')
  })

  it('returns SEEKING for medium velocity', () => {
    const sample: ScrollIntentSample = {
      ...baseSample,
      delta: 150,
      velocity: 1800,
    }

    expect(classifySample(sample)).toBe('SEEKING')
  })

  it('returns SKIMMING for large delta jump', () => {
    const sample: ScrollIntentSample = {
      ...baseSample,
      delta: 3000,
      velocity: 4500,
    }

    expect(classifySample(sample)).toBe('SKIMMING')
  })
})

describe('computeConfidence', () => {
  const makeSamples = (partials: Array<Partial<ScrollIntentSample>>): ScrollIntentSample[] =>
    partials.map((partial, index) => ({
      timestamp: index * 16,
      y: index * 16,
      delta: partial.delta ?? 500,
      velocity: partial.velocity ?? 2000,
      source: partial.source ?? 'wheel',
    }))

  it('returns 1 for IDLE intent', () => {
    const confidence = computeConfidence([], 'IDLE')
    expect(confidence).toBe(1)
  })

  it('returns 0 when no samples support the intent', () => {
    const samples = makeSamples([
      { delta: 50, velocity: 200 },
      { delta: 60, velocity: 300 },
    ])

    const confidence = computeConfidence(samples, 'SEEKING')
    expect(confidence).toBe(0)
  })

  it('returns high confidence when majority supports the intent', () => {
    const samples = makeSamples([
      { velocity: 1800 },
      { velocity: 2000 },
      { velocity: 2200 },
      { delta: 3000, velocity: 4500 },
    ])

    const confidence = computeConfidence(samples, 'SEEKING')
    expect(confidence).toBeCloseTo(0.75, 2)
  })

  it('applies conflict penalty when many samples disagree', () => {
    const samples = makeSamples([
      { velocity: 50, delta: 30 },
      { velocity: 60, delta: 20 },
      { velocity: 1800, delta: 220 },
      { velocity: 1900, delta: 260 },
      { velocity: 2100, delta: 280 },
      { velocity: 70, delta: 25 },
    ])

    const confidence = computeConfidence(samples, 'SEEKING')
    expect(confidence).toBeCloseTo(0.4, 2)
  })
})
