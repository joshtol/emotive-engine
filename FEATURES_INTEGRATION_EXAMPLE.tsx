// Example: How to integrate FeaturesShowcase into page.tsx
// Location: site/src/app/page.tsx

'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import EmotiveHeader from '@/components/EmotiveHeader'
import EmotiveFooter from '@/components/EmotiveFooter'
import FeaturesShowcase from '@/components/FeaturesShowcase' // ADD THIS IMPORT

export default function HomePage() {
  // ... existing state and hooks ...

  return (
    <>
      <EmotiveHeader />

      {/* Scroll-driven mascot */}
      <div ref={containerRef} style={{...}}>
        <canvas ref={canvasRef} id="hero-mascot-canvas" style={{...}} />
      </div>

      <main style={{...}}>

        {/* Hero Section */}
        <section style={{...}}>
          {/* ... existing hero content ... */}
        </section>

        {/* Use Cases - Bento Grid */}
        <section id="use-cases" style={{...}}>
          {/* ... existing use cases content ... */}
        </section>

        {/* ========================================
            ADD FEATURES SHOWCASE HERE
            ======================================== */}
        <FeaturesShowcase />
        {/* ========================================
            END FEATURES SHOWCASE
            ======================================== */}

        {/* For Developers */}
        <section style={{...}}>
          {/* ... existing developer content ... */}
        </section>

        {/* Footer Spacing */}
        <div style={{ height: '4rem' }} />
      </main>

      <EmotiveFooter />

      {/* Styles */}
      <style jsx>{`
        /* ... existing styles ... */
      `}</style>
    </>
  )
}

// That's it! The FeaturesShowcase component will automatically:
// - Match the home page design with glass morphism
// - Be responsive (mobile, tablet, desktop)
// - Include hover effects and animations
// - Display all 16 features in 4 categories
// - Fit perfectly between Use Cases and For Developers sections
