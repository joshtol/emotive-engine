import { useState, useEffect } from 'react'
import HeroMascot from '../HeroMascot'

interface HeroSectionProps {
  onMascotPosition: (position: { x: number, y: number, visible: boolean }) => void
  mascot: any
}

export default function HeroSection({ onMascotPosition, mascot }: HeroSectionProps) {
  const [scrollY, setScrollY] = useState(0)

  const heroHighlights = [
    'Real-time Response',
    '15 Core Emotions',
    'Cross-platform',
    'Battery-optimized',
    '50+ Gesture Animations',
    'No GPU Required'
  ];

  const heroUseCases = [
    'AI Interfaces',
    'Mobile Apps',
    'Web Platforms',
    'Desktop Apps',
    'Gaming UIs',
    'Retail Systems'
  ];

  const heroApplications = [
    'Chat Widgets',
    'Call-to-Actions',
    'Loading States',
    'Notifications',
    'Progress Bars',
    'Brand Characters'
  ];

  const carouselCards = [
    { title: 'Retail Checkout AI', color: '#FF6B9D', emotion: 'neutral', delay: 0 },
    { title: 'Smart Home Hub', color: '#4ECDC4', emotion: 'calm', delay: 0.2 },
    { title: 'Music Platform', color: '#45B7D1', emotion: 'excited', delay: 0.4 },
    { title: 'Customer Service', color: '#96CEB4', emotion: 'joy', delay: 0.6 },
    { title: 'Gaming Interface', color: '#FFEAA7', emotion: 'euphoria', delay: 0.8 },
    { title: 'Healthcare Assistant', color: '#FFAA85', emotion: 'calm', delay: 1.0 }
  ];

  // Simple scroll tracking for component state only
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Calculate container dimensions
  const glassContainerHeight = 'clamp(240px, 44vw, 560px)'
  
  return (
    <section className="hero-section">
      {/* Hero Mascot - positioned in top right */}
      <HeroMascot onMascotPosition={onMascotPosition} />

      {/* Main hero content container */}
      <div className="hero-content">
        {/* Glass container 1 - GET EMOTIVE text */}
        <div 
          className="glass-container glass-container-1"
          style={{
            height: 'clamp(320px, 60vw, 760px)',
            transition: 'all 0.5s ease'
          }}
        >
          {/* EMOTIVE outline 1 */}
          <div 
            className="emotive-outline emotive-outline-1"
            style={{
              top: `${Math.min(scrollY * 0.8, 200)}px`,
              transform: `scale(${1 + Math.min(scrollY / 400, 0.1)})`,
              transformOrigin: 'left top',
              transition: 'all 0.5s ease'
            }}
          />

          {/* EMOTIVE outline 2 */}

          <div 
            className="emotive-outline emotive-outline-2"
            style={{
              top: `${Math.min(scrollY * 0.4, 100)}px`,
              transform: `scale(${1 + Math.min(scrollY / 500, 0.05)})`,
              transformOrigin: 'left top',
              transition: 'all 0.5s ease'
            }}
          />

          {/* GET EMOTIVE text container */}
          <div className="hero-text-container">
            <div className="hero-text-main">
              <img 
                src="/assets/misc/hero/get.svg" 
                alt="GET" 
                className="get-text"
                style={{ marginBottom: '0.5em' }}
              />
              <img 
                src="/assets/misc/hero/emotive-outline.svg" 
                alt="EMOTIVE" 
                className="emotive-text"
              />
            </div>
            
            {/* Tagline */}
            <div className="hero-tagline">
              AI Communication without Uncanny Valley
            </div>

            {/* Selling points */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'clamp(0.8rem, 2vw, 1.2rem)',
              fontSize: 'clamp(0.9rem, 2.2vw, 1rem)',
              opacity: 0.8,
              marginBottom: 'clamp(1rem, 3vw, 1.5rem)'
            }}>
              {heroHighlights.map(item => (
                <span key={item}>{item}</span>
              ))}
            </div>
            <div style={{
              fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
              opacity: 0.7,
              marginTop: 'clamp(0.5rem, 1.5vw, 0.8rem)',
              textAlign: 'center',
              fontStyle: 'italic'
            }}>
              <span>Unlimited Animation Combinations</span>
            </div>
          </div>
        </div>

        {/* Glass container 2 - CTAs and features */}
        <div 
          className="glass-container glass-container-2"
          style={{
            height: glassContainerHeight,
            zIndex: 101
          }}
        >
          {/* Try Demo Button */}
          <div className="demo-button-container" style={{ marginTop: 'clamp(1rem, 3vw, 2rem)' }}>
            <button className="cta-button demo-button">
              Try Demo
            </button>
          </div>

          {/* Feature tagline */}
          <div className="feature-tagline" style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
            margin: 'clamp(1rem, 3vw, 1.5rem) 0 clamp(0.8rem, 2vw, 1.2rem) 0',
            textAlign: 'center',
            fontWeight: '600',
            opacity: 0.9
          }}>
            Perfect for Everything User-Facing
          </div>

          {/* Feature grid */}
          <div className="feature-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 'clamp(0.8rem, 2vw, 1rem)',
            fontSize: 'clamp(0.8rem, 1.8vw, 0.95rem)',
            marginBottom: 'clamp(0.8rem, 2.5vw, 1.2rem)',
            opacity: 0.8
          }}>
            {heroUseCases.map(item => (
              <span key={item}>{item}</span>
            ))}
          </div>

          {/* Feature text */}
          <div className="feature-text" style={{
            fontSize: 'clamp(0.85rem, 2vw, 1rem)',
            marginBottom: 'clamp(1rem, 3vw, 1.5rem)',
            textAlign: 'center',
            opacity: 0.8,
            lineHeight: '1.4'
          }}>
            Canvas2D + VanillaJS. Universal compatibility. Battery optimized for mobile.
           
            <br />
            <strong style={{ opacity: 0.9 }}>Instant deployment. Zero dependencies.</strong>
          </div>

          {/* Usage examples */}
          <div className="usage-examples" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: 'clamp(0.6rem, 1.5vw, 0.8rem)',
            fontSize: 'clamp(0.75rem, 1.6vw, 0.9rem)',
            marginBottom: 'clamp(1.2rem, 3.5vw, 2rem)',
            opacity: 0.7
          }}>
            {heroApplications.map(item => (
              <span key={item}>{item}</span>
            ))}
          </div>

{/* Scroll indicator */}
        <div className="scroll-indicator" style={{ 
          position: 'fixed',
          bottom: '2vh',
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'white',
          fontSize: '2rem',
          zIndex: 1100,
          animation: 'bounce 2s infinite',
          pointerEvents: 'none'
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 9L12 15L6 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div style={{
            fontSize: 'clamp(0.7rem, 1.5vw, 0.9rem)',
            marginTop: '0.5rem',
            opacity: 0.6
          }}>
            Discover Use Cases
          </div>
        </div>

        {/* Use case carousel */}
        <div 
          className="carousel-container"
          style={{
            position: 'relative',
            width: '100%',
            height: '200px',
            bottom: '90vh',
            transform: `translateY(${scrollY > 100 ? 50 : 0}px)`,
            transition: 'all 0.5s ease',
            zIndex: scrollY > 100 ? 400 : 1100,
            opacity: 1
          }}
        >
          {/* Carousel teaser */}
          <div className="carousel-teaser" style={{
            position: 'absolute',
            bottom: '-1rem',
            left: '0',
            width: '100%',
            textAlign: 'center',
            color: '#FFFFFF',
            fontSize: 'clamp(0.8rem, 2vw, 1rem)',
            zIndex: 1101,
            opacity: 0.6
          }}>
            Real-world applications powered by Emotive Engine
          </div>

          {/* Carousel cards */}
          {mascot && carouselCards.slice(0, window.innerWidth <= 768 ? 3 : 5).map((card, index, array) => {
            const scrollThreshold = 50
            const carouselDuration = 1000
            const cardDuration = carouselDuration / array.length
            
            const normalizedScroll = Math.max(0, (scrollY - scrollThreshold)) * 0.5
            const activeCardIndex = Math.floor(normalizedScroll / cardDuration) % array.length
            const isActiveCard = activeCardIndex === index
            
            if (isActiveCard && mascot) {
              setTimeout(() => {
                mascot.setEmotion(card.emotion)
                mascot.express('nod')
              }, 100)
            }
            
            return (
              <div
                key={card.title}
                className={`carousel-card ${card.title.toLowerCase().replace(/\s+/g, '-')}`}
                style={{
                  position: 'absolute',
                  left: `${10 + index * (80 / Math.max(array.length - 1, 1))}%`,
                  top: `${Math.sin(scrollY * 0.01 + card.delay) * 10 + 50 - scrollY * 0.05}%`,
                  transform: `
                    translateX(-50%) 
                    translateY(-50%) 
                    rotate(${isActiveCard ? Math.sin(scrollY * 0.005 + card.delay) * 8 : Math.sin(scrollY * 0.005 + card.delay) * 5}deg)
                    scale(${isActiveCard ? 0.95 : 0.8 + Math.sin(scrollY * 0.008 + card.delay) * 0.1})
                  `,
                  width: window.innerWidth <= 768 ? 'clamp(200px, 25vw, 250px)' : '180px',
                  height: window.innerWidth <= 768 ? 'clamp(140px, 18vw, 180px)' : '120px',
                  backgroundColor: isActiveCard ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(15px)',
                  borderRadius: '16px',
                  border: `2px solid ${card.color}`,
                  boxShadow: isActiveCard 
                    ? `0 12px 40px rgba(${card.color.slice(1).match(/.{2}/g)?.map(hex => parseInt(hex, 16)).join(', ')}, 0.4), 0 0 30px ${card.color}60`
                    : `0 8px 32px rgba(${card.color.slice(1).match(/.{2}/g)?.map(hex => parseInt(hex, 16)).join(', ')}, 0.3)`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: window.innerWidth <= 768 ? 'clamp(0.9rem, 2.5vw, 1.1rem)' : '0.9rem',
                  fontWeight: '600',
                  textAlign: 'center',
                  opacity: isActiveCard ? 1.0 : (0.7 + Math.sin(scrollY * 0.01 + card.delay) * 0.2),
                  zIndex: isActiveCard ? 10 : (5 - index),
                  transition: 'all 0.5s ease'
                }}
              >
                <div>{card.title}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Backdrop blur layer */}
      <div className="backdrop-blur-layer" />

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateX(-50%) translateY(0);
          }
          40% {
            transform: translateX(-50%) translateY(-10px);
          }
          60% {
            transform: translateX(-50%) translateY(-5px);
          }
        }
      `}</style>
    </section>
  )
}



