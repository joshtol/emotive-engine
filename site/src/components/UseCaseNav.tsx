'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface UseCase {
  href: string
  icon: string
  title: string
  description: string
  color: string
  gradient: string
  borderColor: string
  shadowColor: string
}

interface UseCaseNavProps {
  currentPath?: string
  compact?: boolean
}

export default function UseCaseNav({ currentPath, compact = false }: UseCaseNavProps) {
  const router = useRouter()

  const useCases: UseCase[] = [
    {
      href: '/use-cases/cherokee',
      icon: 'ᏣᎳᎩ',
      title: 'Cherokee Language',
      description: 'Cultural preservation through interactive learning',
      color: 'linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #FBBF24 100%)',
      gradient: 'linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(217,119,6,0.1) 100%)',
      borderColor: 'rgba(245,158,11,0.3)',
      shadowColor: 'rgba(245,158,11,0.3)',
    },
    {
      href: '/use-cases/smart-home',
      icon: '🏠',
      title: 'Smart Home',
      description: 'Context-aware home automation',
      color: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 50%, #C4B5FD 100%)',
      gradient: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(139,92,246,0.05) 100%)',
      borderColor: 'rgba(139,92,246,0.2)',
      shadowColor: 'rgba(139,92,246,0.3)',
    },
    {
      href: '/use-cases/education',
      icon: '🎓',
      title: 'Adaptive Learning',
      description: 'Emotion-aware tutoring',
      color: 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 50%, #A78BFA 100%)',
      gradient: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(124,58,237,0.05) 100%)',
      borderColor: 'rgba(124,58,237,0.2)',
      shadowColor: 'rgba(124,58,237,0.3)',
    },
    {
      href: '/use-cases/retail',
      icon: '🛍️',
      title: 'Smart Retail',
      description: 'Personalized shopping',
      color: 'linear-gradient(135deg, #DD4A9A 0%, #FF6B9D 50%, #F9A8C9 100%)',
      gradient: 'linear-gradient(135deg, rgba(221,74,154,0.15) 0%, rgba(221,74,154,0.05) 100%)',
      borderColor: 'rgba(221,74,154,0.2)',
      shadowColor: 'rgba(221,74,154,0.3)',
    },
  ]

  // Filter out current page
  const otherUseCases = useCases.filter(uc => uc.href !== currentPath)

  return (
    <section style={{
      padding: compact ? '3rem 2rem' : '4rem 2rem',
      maxWidth: '1400px',
      margin: '0 auto',
      position: 'relative',
      zIndex: 2,
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '3rem',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-primary)',
          fontSize: compact ? 'clamp(2rem, 4vw, 2.5rem)' : 'clamp(2.5rem, 5vw, 3rem)',
          fontWeight: '700',
          marginBottom: '0.75rem',
          letterSpacing: '-0.02em',
          color: 'white',
        }}>
          Explore More Use Cases
        </h2>
        <p style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(1rem, 2vw, 1.15rem)',
          color: 'rgba(255, 255, 255, 0.7)',
          maxWidth: '600px',
          margin: '0 auto',
        }}>
          See how Emotive AI transforms experiences across industries
        </p>
      </div>

      {/* Mini Bento Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 'clamp(1rem, 2vw, 1.5rem)',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        {otherUseCases.map((useCase) => (
          <Link
            key={useCase.href}
            href={useCase.href}
            prefetch={false}
            style={{
              background: useCase.gradient,
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              borderRadius: '20px',
              border: `1px solid ${useCase.borderColor}`,
              padding: compact ? '2rem' : '2.5rem',
              textDecoration: 'none',
              color: 'white',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              router.prefetch(useCase.href)
              e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)'
              e.currentTarget.style.boxShadow = `0 20px 60px ${useCase.shadowColor.replace('0.3', '0.6')}, inset 0 1px 0 rgba(255, 255, 255, 0.15)`
            }}
            onTouchStart={() => router.prefetch(useCase.href)}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
          >
            <div style={{
              fontSize: compact ? '2.5rem' : '3rem',
              lineHeight: 1,
            }}>
              {useCase.icon}
            </div>
            <div>
              <h3 style={{
                fontFamily: 'var(--font-primary)',
                fontSize: compact ? '1.25rem' : '1.4rem',
                fontWeight: '700',
                marginBottom: '0.5rem',
                background: useCase.color,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.01em',
              }}>
                {useCase.title}
              </h3>
              <p style={{
                fontFamily: 'var(--font-heading)',
                fontSize: compact ? '0.95rem' : '1rem',
                lineHeight: '1.6',
                opacity: 0.85,
                color: 'rgba(255,255,255,0.85)',
              }}>
                {useCase.description}
              </p>
            </div>
            <div style={{
              fontSize: '0.85rem',
              opacity: 0.6,
              fontWeight: '600',
              marginTop: 'auto',
            }}>
              View Demo →
            </div>
          </Link>
        ))}
      </div>

      {/* Back to Home Link */}
      <div style={{
        textAlign: 'center',
        marginTop: '3rem',
      }}>
        <Link
          href="/"
          prefetch={false}
          style={{
            display: 'inline-block',
            padding: '1rem 2rem',
            background: 'linear-gradient(135deg, rgba(102,126,234,0.2) 0%, rgba(102,126,234,0.1) 100%)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(102, 126, 234, 0.4)',
            borderRadius: '12px',
            textDecoration: 'none',
            color: 'white',
            fontSize: '1rem',
            fontWeight: '600',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          }}
          onMouseEnter={(e) => {
            router.prefetch('/')
            e.currentTarget.style.transform = 'translateY(-4px)'
            e.currentTarget.style.boxShadow = '0 12px 32px rgba(102, 126, 234, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
          }}
          onTouchStart={() => router.prefetch('/')}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}
        >
          ← View All Use Cases
        </Link>
      </div>
    </section>
  )
}
