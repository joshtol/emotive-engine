'use client'

import { useEffect } from 'react'

interface ScheduleModalProps {
  isOpen: boolean
  onClose: () => void
  calLink?: string // Cal.com link, e.g., "your-username/30min"
}

// Inject custom CSS for Cal.com branding
const injectCalStyles = () => {
  if (typeof document === 'undefined') return

  const styleId = 'cal-custom-styles'
  if (document.getElementById(styleId)) return

  const style = document.createElement('style')
  style.id = styleId
  style.textContent = `
    /* Cal.com brand customization */
    .cal-embed iframe {
      color-scheme: dark;
    }
  `
  document.head.appendChild(style)
}

export default function ScheduleModal({ isOpen, onClose, calLink = 'mailto:hello@emotiveengine.com?subject=Technical%20Demo%20Request' }: ScheduleModalProps) {
  // Close on escape key and inject styles
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
      injectCalStyles()
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  // If it's a Cal.com link (doesn't start with mailto:), use iframe
  const isCalLink = calLink && !calLink.startsWith('mailto:')

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(135deg, rgba(15, 18, 35, 0.98) 0%, rgba(10, 10, 10, 0.98) 100%)',
          borderRadius: '20px',
          border: '2px solid rgba(139, 92, 246, 0.3)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
          width: '100%',
          maxWidth: isCalLink ? '900px' : '500px',
          maxHeight: '90vh',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.5rem 2rem',
          borderBottom: '1px solid rgba(139, 92, 246, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: 'white',
            margin: 0,
          }}>
            Schedule a Demo
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.5rem',
              lineHeight: 1,
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{
          padding: '2rem',
          maxHeight: 'calc(90vh - 80px)',
          overflow: 'auto',
        }}>
          {isCalLink ? (
            // Custom branded scheduling UI
            <div style={{ textAlign: 'center' }}>
              <p style={{
                fontSize: '1.1rem',
                color: 'rgba(255, 255, 255, 0.8)',
                marginBottom: '2.5rem',
                lineHeight: 1.6,
              }}>
                Let's talk about how Emotive Engine can transform your interface.<br />
                Pick a time that works for you.
              </p>

              <a
                href={`https://cal.com/${calLink}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1.5rem 3rem',
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: 'white',
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
                  marginBottom: '2rem',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(139, 92, 246, 0.6)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(139, 92, 246, 0.4)'
                }}
              >
                <span>📅</span> Schedule 30-Minute Demo
              </a>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem',
                marginTop: '3rem',
                textAlign: 'left',
              }}>
                {[
                  { icon: '🎯', title: 'Technical Deep Dive', desc: 'Review API, architecture, and integration' },
                  { icon: '🎨', title: 'Live Examples', desc: 'See real-time demos of all capabilities' },
                  { icon: '💬', title: 'Q&A Session', desc: 'Ask anything about implementation' },
                ].map((item, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '1.5rem',
                      background: 'rgba(139, 92, 246, 0.1)',
                      border: '1px solid rgba(139, 92, 246, 0.2)',
                      borderRadius: '12px',
                    }}
                  >
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{item.icon}</div>
                    <div style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: 'white' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.6)', lineHeight: 1.5 }}>
                      {item.desc}
                    </div>
                  </div>
                ))}
              </div>

              <p style={{
                fontSize: '0.9rem',
                color: 'rgba(255, 255, 255, 0.5)',
                marginTop: '2rem',
              }}>
                Prefer email?{' '}
                <a
                  href="mailto:hello@emotiveengine.com"
                  style={{
                    color: '#8B5CF6',
                    textDecoration: 'none',
                    fontWeight: '600',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                >
                  Send us a message
                </a>
              </p>
            </div>
          ) : (
            // Fallback email option
            <div style={{ textAlign: 'center' }}>
              <p style={{
                fontSize: '1.1rem',
                color: 'rgba(255, 255, 255, 0.8)',
                marginBottom: '2rem',
                lineHeight: 1.6,
              }}>
                We'd love to show you how Emotive Engine can transform your interface.
              </p>

              <a
                href={calLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1.25rem 2.5rem',
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: 'white',
                  fontSize: '1.15rem',
                  fontWeight: '600',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(139, 92, 246, 0.6)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(139, 92, 246, 0.4)'
                }}
              >
                <span>📧</span> Email Us
              </a>

              <p style={{
                fontSize: '0.9rem',
                color: 'rgba(255, 255, 255, 0.5)',
                marginTop: '1.5rem',
              }}>
                Or email us directly at{' '}
                <a
                  href="mailto:hello@emotiveengine.com"
                  style={{
                    color: '#8B5CF6',
                    textDecoration: 'none',
                  }}
                >
                  hello@emotiveengine.com
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
