'use client'

import { useState } from 'react'
import Link from 'next/link'
import EmotiveHeader from '@/components/EmotiveHeader'
import EmotiveFooter from '@/components/EmotiveFooter'

export default function RetailPage() {
  const [cartItems, setCartItems] = useState(0)
  const [scanning, setScanning] = useState(false)

  const handleScan = () => {
    setScanning(true)
    setTimeout(() => {
      setCartItems(prev => prev + 1)
      setScanning(false)
    }, 800)
  }

  return (
    <div className="emotive-container">
      <EmotiveHeader />
      <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #2d0a1f 0%, #1a0612 100%)',
      color: 'white',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <Link
          href="/"
          style={{
            color: 'rgba(255,255,255,0.7)',
            textDecoration: 'none',
            fontSize: '1rem',
            display: 'inline-block',
            marginBottom: '3rem',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'white'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
          }}
        >
          ← Back to Portfolio
        </Link>

        {/* Hero */}
        <div style={{
          textAlign: 'center',
          marginBottom: '4rem'
        }}>
          <h1 style={{
            fontSize: 'clamp(3rem, 8vw, 5rem)',
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: '#FF6B9D'
          }}>
            🛒 Retail Checkout AI
          </h1>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
            marginBottom: '1rem',
            opacity: 0.9
          }}>
            Empathetic Self-Service Interface
          </h2>
          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.3rem)',
            opacity: 0.7,
            maxWidth: '700px',
            margin: '0 auto 2rem auto',
            lineHeight: 1.6
          }}>
            Reduce cart abandonment and customer frustration with emotional intelligence
            that guides shoppers through self-checkout with patience and understanding.
          </p>
        </div>

        {/* Interactive Demo */}
        <div style={{
          background: 'rgba(255,107,157,0.08)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '3rem 2rem',
          border: '1px solid rgba(255,107,157,0.25)',
          marginBottom: '4rem',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)'
        }}>
          <h3 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            marginBottom: '2rem',
            color: '#FF6B9D'
          }}>
            Try the Demo
          </h3>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2rem'
          }}>
            <div style={{
              fontSize: '6rem',
              opacity: scanning ? 1 : 0.5,
              transition: 'all 0.3s'
            }}>
              🛒
            </div>

            <div style={{
              fontSize: '1.5rem',
              marginBottom: '1rem'
            }}>
              Cart Items: <strong style={{ color: '#FF6B9D' }}>{cartItems}</strong>
            </div>

            <button
              onClick={handleScan}
              disabled={scanning}
              style={{
                padding: '1.5rem 3rem',
                fontSize: '1.3rem',
                fontWeight: '600',
                background: scanning
                  ? 'rgba(255,107,157,0.3)'
                  : 'linear-gradient(135deg, #FF6B9D 0%, #C44569 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: scanning ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s',
                opacity: scanning ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!scanning) {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(255,107,157,0.4)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {scanning ? '⏳ Scanning...' : '📦 Scan Item'}
            </button>

            {cartItems > 0 && (
              <div style={{
                marginTop: '1rem',
                padding: '1rem 2rem',
                background: 'rgba(255,107,157,0.2)',
                borderRadius: '8px',
                fontSize: '1.1rem'
              }}>
                😊 Great job! Keep scanning your items.
              </div>
            )}
          </div>
        </div>

        {/* Key Features */}
        <div style={{
          marginBottom: '4rem'
        }}>
          <h3 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            marginBottom: '2rem',
            textAlign: 'center',
            color: '#FF6B9D'
          }}>
            Key Features
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            <div style={{
              padding: '2rem',
              background: 'rgba(255,107,157,0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(255,107,157,0.2)'
            }}>
              <h4 style={{ fontSize: '1.3rem', marginBottom: '0.8rem', color: '#FF6B9D' }}>
                🔍 Real-time Assistance
              </h4>
              <p style={{ opacity: 0.8, lineHeight: 1.6 }}>
                Detects scanning errors and provides immediate, patient guidance to correct them.
              </p>
            </div>
            <div style={{
              padding: '2rem',
              background: 'rgba(255,107,157,0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(255,107,157,0.2)'
            }}>
              <h4 style={{ fontSize: '1.3rem', marginBottom: '0.8rem', color: '#FF6B9D' }}>
                😊 Emotion Detection
              </h4>
              <p style={{ opacity: 0.8, lineHeight: 1.6 }}>
                Recognizes customer frustration and responds with empathy and encouragement.
              </p>
            </div>
            <div style={{
              padding: '2rem',
              background: 'rgba(255,107,157,0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(255,107,157,0.2)'
            }}>
              <h4 style={{ fontSize: '1.3rem', marginBottom: '0.8rem', color: '#FF6B9D' }}>
                💳 Payment Flow
              </h4>
              <p style={{ opacity: 0.8, lineHeight: 1.6 }}>
                Guides customers through payment options with clear, friendly instructions.
              </p>
            </div>
          </div>
        </div>

        {/* Target Market */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '16px',
          padding: '3rem 2rem',
          border: '1px solid rgba(255,255,255,0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            marginBottom: '1.5rem',
            color: '#FF6B9D'
          }}>
            Target Market
          </h3>
          <p style={{
            fontSize: '1.2rem',
            opacity: 0.8,
            marginBottom: '2rem'
          }}>
            🎯 Walmart • Home Depot • Amazon • Target • Kroger
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem',
            marginTop: '2rem'
          }}>
            <div>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📊</div>
              <div style={{ fontWeight: '600', marginBottom: '0.3rem' }}>Reduce Cart Abandonment</div>
              <div style={{ opacity: 0.7 }}>Lower frustration = fewer abandoned carts</div>
            </div>
            <div>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>⭐</div>
              <div style={{ fontWeight: '600', marginBottom: '0.3rem' }}>Improve Satisfaction</div>
              <div style={{ opacity: 0.7 }}>Empathetic AI creates positive experiences</div>
            </div>
            <div>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>⚡</div>
              <div style={{ fontWeight: '600', marginBottom: '0.3rem' }}>Faster Checkouts</div>
              <div style={{ opacity: 0.7 }}>Reduce errors and wait times</div>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div style={{
          marginTop: '4rem',
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <Link
            href="/"
            style={{
              display: 'inline-block',
              padding: '1rem 2rem',
              background: 'rgba(255,107,157,0.2)',
              borderRadius: '8px',
              textDecoration: 'none',
              color: 'white',
              fontSize: '1.1rem',
              border: '1px solid rgba(255,107,157,0.4)',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,107,157,0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,107,157,0.2)'
            }}
          >
            ← Back to All Use Cases
          </Link>
        </div>
      </div>
    </div>
      <EmotiveFooter />
    </div>
  )
}
