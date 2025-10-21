'use client'

import { useState, useEffect, useRef } from 'react'

/**
 * Lazy-loaded FeaturesShowcase that only renders when scrolled into view
 * Prevents hydration mismatches and reduces initial bundle evaluation
 */
export default function LazyFeaturesShowcase() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Intersection Observer to load content when visible
  useEffect(() => {
    if (!containerRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            setIsMobile(window.innerWidth < 768)
            observer.disconnect()
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '100px' // Load before entering viewport
      }
    )

    observer.observe(containerRef.current)

    return () => observer.disconnect()
  }, [])

  // Window resize handler (only after visible)
  useEffect(() => {
    if (!isVisible) return

    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isVisible])

  const features = [
    // Priority 1 (Top 3 - Mobile + Desktop)
    {
      icon: '⚡',
      title: '60fps Animation',
      description: 'Silky smooth even with 1000+ particles',
      color: '#667eea',
      priority: 1
    },
    {
      icon: '💭',
      title: '15 Core Emotions',
      description: 'Full emotional spectrum from joy to contemplation',
      color: '#F59E0B',
      priority: 1
    },
    {
      icon: '🚀',
      title: 'Simple API',
      description: 'From init to emotions in just 3 lines of code',
      color: '#10B981',
      priority: 1
    },

    // Priority 2 (Top 8 - Desktop only)
    {
      icon: '📦',
      title: '234KB Gzipped',
      description: 'Lightweight bundle optimized for web',
      color: '#8B5CF6',
      priority: 2
    },
    {
      icon: '🤖',
      title: 'LLM Integration',
      description: 'Claude & GPT sentiment detection',
      color: '#EC4899',
      priority: 2
    },
    {
      icon: '🎨',
      title: 'Zero GPU Required',
      description: 'Pure Canvas 2D rendering',
      color: '#06B6D4',
      priority: 2
    },
    {
      icon: '👋',
      title: '50+ Gestures',
      description: 'Wave, bounce, explode, shimmer, and more',
      color: '#F97316',
      priority: 2
    },
    {
      icon: '🌀',
      title: 'Shape Morphing',
      description: 'Dynamic formations and transitions',
      color: '#14B8A6',
      priority: 2
    },

    // Priority 3 (Expandable)
    {
      icon: '📘',
      title: 'TypeScript Support',
      description: 'Full type definitions included',
      color: '#3B82F6',
      priority: 3
    },
    {
      icon: '📱',
      title: 'Any Device',
      description: 'Desktop, mobile, tablet - all supported',
      color: '#A855F7',
      priority: 3
    },
    {
      icon: '🎵',
      title: 'Audio Sync',
      description: 'Optional audio module for music sync',
      color: '#EF4444',
      priority: 3
    },
    {
      icon: '⚛️',
      title: 'Framework Agnostic',
      description: 'React, Vue, Svelte, or vanilla JS',
      color: '#6366F1',
      priority: 3
    },
    {
      icon: '🎯',
      title: 'Event-Driven',
      description: 'Rich event system for custom behaviors',
      color: '#10B981',
      priority: 3
    },
    {
      icon: '🔧',
      title: 'Highly Customizable',
      description: 'Every parameter is configurable',
      color: '#F59E0B',
      priority: 3
    },
    {
      icon: '♿',
      title: 'Accessible',
      description: 'ARIA labels and reduced motion support',
      color: '#06B6D4',
      priority: 3
    },
    {
      icon: '📊',
      title: 'Performance Monitoring',
      description: 'Built-in FPS and memory tracking',
      color: '#8B5CF6',
      priority: 3
    }
  ]

  const getVisibleFeatures = () => {
    if (showAll) return features
    if (isMobile) return features.filter(f => f.priority === 1) // Top 3
    return features.filter(f => f.priority <= 2) // Top 8
  }

  const visibleFeatures = isVisible ? getVisibleFeatures() : []
  const hiddenCount = features.length - visibleFeatures.length

  // Reserve space to prevent layout shift
  const estimatedHeight = isMobile ? '600px' : '800px'

  return (
    <section
      ref={containerRef}
      style={{
        minHeight: isVisible ? 'auto' : estimatedHeight,
        padding: '5rem 2rem',
        background: 'linear-gradient(180deg, rgba(10,10,10,0.5) 0%, rgba(5,5,5,0.3) 100%)',
        position: 'relative',
        contentVisibility: 'auto', // Browser optimization for off-screen content
        containIntrinsicSize: estimatedHeight // Reserve space for layout
      }}
    >
      {!isVisible && (
        // Skeleton loader
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          opacity: 0.3
        }}>
          <div style={{
            width: '200px',
            height: '40px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '8px',
            margin: '0 auto 2rem'
          }} />
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
            gap: '1.5rem'
          }}>
            {[...Array(isMobile ? 3 : 8)].map((_, i) => (
              <div
                key={i}
                style={{
                  height: '150px',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '16px'
                }}
              />
            ))}
          </div>
        </div>
      )}

      {isVisible && (
        <>
          <h2 style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: '800',
            textAlign: 'center',
            marginBottom: '4rem',
            background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Why Developers Choose Emotive
          </h2>

          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
            gap: '1.5rem',
            marginBottom: hiddenCount > 0 ? '3rem' : 0
          }}>
            {visibleFeatures.map((feature, index) => (
              <div
                key={index}
                style={{
                  padding: '2rem',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  backdropFilter: 'blur(10px)',
                  transition: 'transform 0.3s ease, border-color 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.borderColor = feature.color
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
                }}
              >
                <div style={{
                  fontSize: '2.5rem',
                  marginBottom: '1rem'
                }}>
                  {feature.icon}
                </div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  marginBottom: '0.5rem',
                  color: feature.color
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  fontSize: '0.95rem',
                  color: 'rgba(255, 255, 255, 0.6)',
                  lineHeight: 1.6
                }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {hiddenCount > 0 && (
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={() => setShowAll(!showAll)}
                style={{
                  padding: '1rem 2rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#667eea',
                  background: 'rgba(102, 126, 234, 0.15)',
                  border: '1px solid rgba(102, 126, 234, 0.3)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(102, 126, 234, 0.25)'
                  e.currentTarget.style.transform = 'scale(1.05)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(102, 126, 234, 0.15)'
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                {showAll ? 'Show Less' : `Show ${hiddenCount} More Features`}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}
