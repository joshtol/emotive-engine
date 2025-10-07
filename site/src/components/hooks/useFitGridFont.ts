'use client'

import { useEffect, useRef } from 'react'

type Options = {
  minVh?: number
  maxVh?: number
  minVw?: number
  maxVw?: number
  step?: number
}

// Measures longest label and reduces a shared CSS var so the longest button fits without truncation
export function useFitGridFont(containerRef: React.RefObject<HTMLElement | null>, options: Options = {}) {
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const {
      minVh = 1.0,
      maxVh = 1.8,
      minVw = 0.8,
      maxVw = 1.2,
      step = 0.05,
    } = options

    const root = container as HTMLElement

    const measureAndFit = () => {
      // Candidate font size range (in viewport units). We'll try decreasing until the longest fits.
      let currentVh = Math.min(maxVh, Math.max(minVh, maxVh))
      let currentVw = Math.min(maxVw, Math.max(minVw, maxVw))

      const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('.emotive-sidebar button, .emotive-controls button'))
      if (buttons.length === 0) return

      // Set initial stable values to prevent visual jumps
      document.documentElement.style.setProperty('--global-grid-font-size', `clamp(10px, 1.2vw, 14px)`)
      document.documentElement.style.setProperty('--global-grid-letter-spacing', '0.3px')

      const fitsAt = (vhVal: number, vwVal: number) => {
        document.documentElement.style.setProperty('--global-grid-font-size', `min(${vwVal}vw, ${vhVal}vh)`)
        // Use modest letter spacing that scales with size
        document.documentElement.style.setProperty('--global-grid-letter-spacing', `min(0.12vw, ${vhVal * 0.2}vh)`)

        // If any button's inner label overflows, it doesn't fit.
        for (const btn of buttons) {
          const label = btn.querySelector<HTMLElement>('.btn-label') || btn
          if (label.scrollWidth > label.clientWidth + 0.5) return false
        }
        return true
      }

      // Try from larger to smaller to find the first that fits
      let found = false
      for (let vh = currentVh; vh >= minVh; vh -= step) {
        // Keep vw proportional to vh to avoid overly tall text on narrow screens
        const vw = Math.max(minVw, Math.min(maxVw, (vh / maxVh) * maxVw))
        if (fitsAt(vh, vw)) {
          found = true
          break
        }
      }

      if (!found) {
        // Fall back to minimum size
        document.documentElement.style.setProperty('--global-grid-font-size', `min(${minVw}vw, ${minVh}vh)`)
        document.documentElement.style.setProperty('--global-grid-letter-spacing', `min(0.1vw, ${minVh * 0.18}vh)`)
      }
    }

    const schedule = () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(measureAndFit)
    }

    // Initial
    schedule()

    // Recompute on resize
    const onResize = () => schedule()
    window.addEventListener('resize', onResize)

    // Recompute when fonts load
    if (document.fonts && 'ready' in document.fonts) {
      // @ts-ignore - TS doesn't know about FontFaceSet in some libs
      document.fonts.ready.then(schedule).catch(() => {})
    }

    return () => {
      window.removeEventListener('resize', onResize)
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    }
  }, [containerRef, options.minVh, options.maxVh, options.minVw, options.maxVw, options.step])
}


