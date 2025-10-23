'use client'

import React, { useState, useEffect } from 'react'

export default function FeaturesShowcase() {
  const [showAll, setShowAll] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Detect mobile viewport
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const features = [
    // TOP 3 (Mobile Priority) + TOP 6 (Desktop Priority)
    {
      icon: '⚡',
      title: '60fps Animation',
      description: 'Silky smooth even with 1000+ particles',
      color: '#667eea',
      bgGradient: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(102, 126, 234, 0.05) 100%)',
      borderColor: 'rgba(102, 126, 234, 0.3)',
      priority: 1  // Top priority
    },
    {
      icon: '💭',
      title: '15 Core Emotions',
      description: 'Full emotional spectrum from joy to contemplation',
      color: '#F59E0B',
      bgGradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%)',
      borderColor: 'rgba(245, 158, 11, 0.3)',
      priority: 1
    },
    {
      icon: '🚀',
      title: 'Simple API',
      description: 'From init to emotions in just 3 lines of code',
      color: '#10B981',
      bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%)',
      borderColor: 'rgba(16, 185, 129, 0.3)',
      priority: 1
    },
    {
      icon: '📦',
      title: '234KB Gzipped',
      description: 'Tiny bundle with massive capabilities',
      color: '#a5b4fc',
      bgGradient: 'linear-gradient(135deg, rgba(165, 180, 252, 0.15) 0%, rgba(165, 180, 252, 0.05) 100%)',
      borderColor: 'rgba(165, 180, 252, 0.3)',
      priority: 2  // Desktop priority (Top 6)
    },
    {
      icon: '🤖',
      title: 'LLM Integration',
      description: 'Built-in support for Claude, GPT, and more',
      color: '#764ba2',
      bgGradient: 'linear-gradient(135deg, rgba(118, 75, 162, 0.15) 0%, rgba(118, 75, 162, 0.05) 100%)',
      borderColor: 'rgba(118, 75, 162, 0.3)',
      priority: 2
    },
    {
      icon: '🎨',
      title: 'Zero GPU Required',
      description: 'Pure Canvas 2D - works everywhere',
      color: '#06B6D4',
      bgGradient: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(6, 182, 212, 0.05) 100%)',
      borderColor: 'rgba(6, 182, 212, 0.3)',
      priority: 2
    },
    {
      icon: '👋',
      title: '50+ Gestures',
      description: 'Wave, bounce, pulse, and more',
      color: '#EC4899',
      bgGradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(236, 72, 153, 0.05) 100%)',
      borderColor: 'rgba(236, 72, 153, 0.3)',
      priority: 2  // Now in top 8 for desktop
    },
    {
      icon: '🌀',
      title: 'Shape Morphing',
      description: 'Dynamic particle formations',
      color: '#8B5CF6',
      bgGradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0.05) 100%)',
      borderColor: 'rgba(139, 92, 246, 0.3)',
      priority: 2  // Now in top 8 for desktop
    },

    // ADDITIONAL FEATURES (Hidden by default)
    {
      icon: '📘',
      title: 'TypeScript Support',
      description: 'Full type definitions included',
      color: '#3178C6',
      bgGradient: 'linear-gradient(135deg, rgba(49, 120, 198, 0.15) 0%, rgba(49, 120, 198, 0.05) 100%)',
      borderColor: 'rgba(49, 120, 198, 0.3)',
      priority: 3
    },
    {
      icon: '📱',
      title: 'Any Device',
      description: 'Smartphones to 4K displays',
      color: '#EF4444',
      bgGradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%)',
      borderColor: 'rgba(239, 68, 68, 0.3)',
      priority: 3
    },
    {
      icon: '🎵',
      title: 'Audio Sync',
      description: 'Emotion-driven audio synthesis',
      color: '#F59E0B',
      bgGradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%)',
      borderColor: 'rgba(245, 158, 11, 0.3)',
      priority: 3
    },
    {
      icon: '🔧',
      title: 'Framework Agnostic',
      description: 'React, Vue, Svelte, vanilla JS',
      color: '#10B981',
      bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%)',
      borderColor: 'rgba(16, 185, 129, 0.3)',
      priority: 3
    },
    {
      icon: '✨',
      title: 'Smooth Transitions',
      description: 'Natural emotion blending',
      color: '#667eea',
      bgGradient: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(102, 126, 234, 0.05) 100%)',
      borderColor: 'rgba(102, 126, 234, 0.3)',
      priority: 3
    },
    {
      icon: '🎭',
      title: 'Semantic Performances',
      description: 'Choreographed emotion sequences',
      color: '#EC4899',
      bgGradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(236, 72, 153, 0.05) 100%)',
      borderColor: 'rgba(236, 72, 153, 0.3)',
      priority: 3
    },
    {
      icon: '🔍',
      title: 'Real-time Detection',
      description: 'Instant emotion recognition',
      color: '#06B6D4',
      bgGradient: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(6, 182, 212, 0.05) 100%)',
      borderColor: 'rgba(6, 182, 212, 0.3)',
      priority: 3
    },
    {
      icon: '🎯',
      title: 'No Dependencies',
      description: 'Zero external dependencies',
      color: '#a5b4fc',
      bgGradient: 'linear-gradient(135deg, rgba(165, 180, 252, 0.15) 0%, rgba(165, 180, 252, 0.05) 100%)',
      borderColor: 'rgba(165, 180, 252, 0.3)',
      priority: 3
    },
  ]

  // Filter features based on viewport and showAll state
  const getVisibleFeatures = () => {
    if (showAll) {
      return features // Show all when expanded
    }

    if (isMobile) {
      return features.filter(f => f.priority === 1) // Top 3 on mobile
    }

    return features.filter(f => f.priority <= 2) // Top 6 on desktop
  }

  const visibleFeatures = getVisibleFeatures()
  const hiddenCount = features.length - visibleFeatures.length

  return (
    <section style={{
      padding: '6rem 2rem',
      maxWidth: '1400px',
      margin: '4rem auto',
      background: 'rgba(10, 10, 10, 0.85)',      borderRadius: '32px',
      border: '1px solid rgba(102, 126, 234, 0.1)',
      position: 'relative',
      zIndex: 2,
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
    }}>
      {/* Section Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '4rem',
      }}>
        <div style={{
          display: 'inline-block',
          padding: '0.6rem 1.5rem',
          background: 'rgba(102, 126, 234, 0.15)',
          border: '1px solid rgba(102, 126, 234, 0.3)',
          borderRadius: '30px',
          marginBottom: '1.5rem',
          fontSize: '0.85rem',
          fontWeight: '600',
          color: '#a5b4fc',
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
        }}>
          Platform Features
        </div>

        <h2 style={{
          fontFamily: 'var(--font-primary)',
          fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
          fontWeight: '700',
          marginBottom: '1rem',
          letterSpacing: '-0.02em',
          background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 50%, #667eea 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          Everything You Need
        </h2>

        <p style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.2rem',
          color: 'rgba(255, 255, 255, 0.7)',
          maxWidth: '700px',
          margin: '0 auto',
          lineHeight: '1.6',
        }}>
          Built for performance, designed for developers, optimized for emotional connection
        </p>
      </div>

      {/* Features Grid */}
      <div className="features-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
      }}>
        {visibleFeatures.map((feature, index) => (
          <div
            key={index}
            className="feature-card"
            style={{
              padding: '2rem',
              background: feature.bgGradient,
              border: `1px solid ${feature.borderColor}`,
              borderRadius: '20px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'default',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = `0 20px 40px ${feature.color}40`
              e.currentTarget.style.borderColor = `${feature.color}80`
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.borderColor = feature.borderColor
            }}
          >
            {/* Icon */}
            <div style={{
              fontSize: '3rem',
              marginBottom: '1rem',
              filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3))',
            }}>
              {feature.icon}
            </div>

            {/* Title */}
            <h3 style={{
              fontFamily: 'var(--font-primary)',
              fontSize: '1.3rem',
              fontWeight: '700',
              marginBottom: '0.75rem',
              color: feature.color,
              letterSpacing: '-0.01em',
            }}>
              {feature.title}
            </h3>

            {/* Description */}
            <p style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '0.95rem',
              lineHeight: '1.6',
              color: 'rgba(255, 255, 255, 0.7)',
            }}>
              {feature.description}
            </p>

            {/* Decorative gradient orb */}
            <div style={{
              position: 'absolute',
              top: '-50px',
              right: '-50px',
              width: '150px',
              height: '150px',
              background: `radial-gradient(circle, ${feature.color}20 0%, transparent 70%)`,
              borderRadius: '50%',
              pointerEvents: 'none',
              opacity: 0.5,
            }} />
          </div>
        ))}
      </div>

      {/* Show More/Less Button */}
      {hiddenCount > 0 && (
        <div style={{
          marginTop: '3rem',
          textAlign: 'center',
        }}>
          <button
            onClick={() => setShowAll(!showAll)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '1rem 2rem',
              background: 'rgba(102, 126, 234, 0.1)',
              border: '1px solid rgba(102, 126, 234, 0.3)',
              borderRadius: '12px',
              color: '#a5b4fc',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)'
              e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.5)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)'
              e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.3)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <span>{showAll ? '↑' : '↓'}</span>
            <span>{showAll ? 'Show Less' : `Show ${hiddenCount} More Features`}</span>
          </button>
        </div>
      )}

      {/* Bottom CTA */}
      <div style={{
        marginTop: '4rem',
        textAlign: 'center',
        paddingTop: '3rem',
        borderTop: '1px solid rgba(102, 126, 234, 0.2)',
      }}>
        <p style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.1rem',
          color: 'rgba(255, 255, 255, 0.6)',
          marginBottom: '1.5rem',
        }}>
          Ready to bring emotional intelligence to your application?
        </p>
        <a
          href="#use-cases"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '1rem 2rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            textDecoration: 'none',
            color: 'white',
            fontSize: '1.1rem',
            fontWeight: '600',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(102, 126, 234, 0.6)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(102, 126, 234, 0.4)'
          }}
        >
          Explore Use Cases
        </a>
      </div>

      {/* Mobile Responsive Styles */}
      <style jsx>{`
        @media (max-width: 768px) {
          .features-grid {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }

          .feature-card {
            padding: 1.5rem !important;
          }
        }

        @media (max-width: 480px) {
          section {
            padding: 3rem 1rem !important;
            margin: 2rem auto !important;
          }
        }
      `}</style>
    </section>
  )
}
