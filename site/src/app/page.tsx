'use client'

import Link from 'next/link'
import EmotiveHeader from '@/components/EmotiveHeader'
import EmotiveFooter from '@/components/EmotiveFooter'

export default function HomePage() {
  return (
    <div className="emotive-container">
      <EmotiveHeader />

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0a0a0a 0%, #050505 50%, #0a0a0a 100%)',
        color: 'white',
        padding: 'var(--container-padding)'
      }}>
      {/* Hero Section */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        paddingTop: '8vh',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontFamily: 'var(--font-primary)',
          fontSize: 'clamp(3rem, 8vw, 6rem)',
          fontWeight: '700',
          marginBottom: '1.5rem',
          lineHeight: 1.1,
          letterSpacing: '-0.02em'
        }}>
          Emotive Engine
        </h1>

        <p style={{
          fontFamily: 'var(--font-primary)',
          fontSize: 'clamp(1.2rem, 3vw, 2rem)',
          color: 'rgba(255,255,255,0.9)',
          marginBottom: '1rem',
          maxWidth: '800px',
          margin: '0 auto 1.5rem auto',
          fontWeight: '500',
          letterSpacing: '-0.01em'
        }}>
          Emotional AI for Human Experiences
        </p>

        <p style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(1rem, 2vw, 1.125rem)',
          color: 'rgba(255,255,255,0.7)',
          marginBottom: '4rem',
          maxWidth: '700px',
          margin: '0 auto 4rem auto',
          lineHeight: '1.7',
          fontWeight: '400',
          letterSpacing: '0.01em'
        }}>
          Real-time emotional intelligence that creates genuine human connection.
          No uncanny valley—just authentic, responsive experiences.
        </p>

        {/* Use Case Grid */}
        <h2 style={{
          fontFamily: 'var(--font-primary)',
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          fontWeight: '600',
          marginBottom: '2rem',
          marginTop: '4rem',
          letterSpacing: '-0.015em'
        }}>
          Use Cases
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--grid-gap)',
          marginTop: 'var(--spacing-lg)',
          marginBottom: 'var(--section-gap)'
        }}>
          {/* Cherokee Language Learning - FLAGSHIP */}
          <Link
            href="/use-cases/cherokee"
            className="cherokee-flagship-card use-case-card"
            style={{
              padding: 'var(--card-padding-lg) var(--card-padding)',
              background: 'linear-gradient(135deg, rgba(218,165,32,0.15) 0%, rgba(218,165,32,0.05) 100%)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              borderRadius: '20px',
              border: '1px solid rgba(218,165,32,0.3)',
              textDecoration: 'none',
              color: 'white',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              willChange: 'transform'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(218,165,32,0.25) 0%, rgba(218,165,32,0.1) 100%)'
              e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)'
              e.currentTarget.style.boxShadow = '0 20px 60px rgba(218,165,32,0.4)'
              e.currentTarget.style.borderColor = 'rgba(218,165,32,0.5)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(218,165,32,0.15) 0%, rgba(218,165,32,0.05) 100%)'
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(31, 38, 135, 0.15)'
              e.currentTarget.style.borderColor = 'rgba(218,165,32,0.3)'
            }}
          >
            <div style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              padding: '0.3rem 0.8rem',
              background: 'rgba(218,165,32,0.8)',
              borderRadius: '4px',
              fontSize: '0.9rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Flagship
            </div>
            <h2 style={{ fontFamily: 'var(--font-primary)', fontSize: '2rem', fontWeight: '600', marginBottom: '0.8rem', color: '#DAA520', letterSpacing: '-0.01em' }}>
              ᏣᎳᎩ Cherokee Language Learning
            </h2>
            <p style={{ fontFamily: 'var(--font-heading)', opacity: 0.9, lineHeight: 1.6, fontSize: '1.1rem', fontWeight: '400', marginBottom: '1rem' }}>
              Preserve and teach indigenous languages through interactive syllabary learning with cultural context.
              Shape-morphing animations bring each character to life with emotional resonance.
            </p>
            <p style={{ fontFamily: 'var(--font-heading)', opacity: 0.7, fontSize: '0.9rem', fontWeight: '400', fontStyle: 'italic' }}>
              🎯 Cherokee Nation Heritage Center • Cultural Preservation Institutions
            </p>
          </Link>

          {/* Retail Checkout AI */}
          <Link
            href="/use-cases/retail"
            className="use-case-card"
            style={{
              padding: 'var(--card-padding)',
              background: 'rgba(255,107,157,0.08)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              borderRadius: '20px',
              border: '1px solid rgba(255,107,157,0.25)',
              textDecoration: 'none',
              color: 'white',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              willChange: 'transform',
              boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,107,157,0.15)'
              e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)'
              e.currentTarget.style.boxShadow = '0 20px 60px rgba(255,107,157,0.3)'
              e.currentTarget.style.borderColor = 'rgba(255,107,157,0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,107,157,0.08)'
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(31, 38, 135, 0.15)'
              e.currentTarget.style.borderColor = 'rgba(255,107,157,0.25)'
            }}
          >
            <h2 style={{ fontFamily: 'var(--font-primary)', fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem', color: '#FF6B9D', letterSpacing: '-0.01em' }}>
              🛒 Retail Checkout AI
            </h2>
            <p style={{ fontFamily: 'var(--font-heading)', opacity: 0.8, lineHeight: 1.6, fontWeight: '400' }}>
              Reduce cart abandonment with empathetic AI that guides shoppers through checkout with patience and understanding.
            </p>
            <p style={{ fontFamily: 'var(--font-heading)', opacity: 0.6, fontSize: '0.9rem', fontWeight: '400', marginTop: '0.8rem' }}>
              🎯 Walmart • Home Depot • Amazon • Target
            </p>
          </Link>

          {/* Smart Home Hub */}
          <Link
            href="/use-cases/smart-home"
            className="use-case-card"
            style={{
              padding: '2rem',
              background: 'rgba(78,205,196,0.08)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              borderRadius: '20px',
              border: '1px solid rgba(78,205,196,0.25)',
              textDecoration: 'none',
              color: 'white',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              willChange: 'transform',
              boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(78,205,196,0.15)'
              e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)'
              e.currentTarget.style.boxShadow = '0 20px 60px rgba(78,205,196,0.3)'
              e.currentTarget.style.borderColor = 'rgba(78,205,196,0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(78,205,196,0.08)'
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(31, 38, 135, 0.15)'
              e.currentTarget.style.borderColor = 'rgba(78,205,196,0.25)'
            }}
          >
            <h2 style={{ fontFamily: 'var(--font-primary)', fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem', color: '#4ECDC4', letterSpacing: '-0.01em' }}>
              🏠 Smart Home Hub
            </h2>
            <p style={{ fontFamily: 'var(--font-heading)', opacity: 0.8, lineHeight: 1.6, fontWeight: '400' }}>
              Transform smart homes with unified IoT control that understands context and responds naturally to voice commands.
            </p>
            <p style={{ fontFamily: 'var(--font-heading)', opacity: 0.6, fontSize: '0.9rem', fontWeight: '400', marginTop: '0.8rem' }}>
              🎯 Apple • Amazon • Google • Nvidia
            </p>
          </Link>

          {/* Healthcare Assistant */}
          <Link
            href="/use-cases/healthcare"
            className="use-case-card"
            style={{
              padding: '2rem',
              background: 'rgba(150,206,180,0.08)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              borderRadius: '20px',
              border: '1px solid rgba(150,206,180,0.25)',
              textDecoration: 'none',
              color: 'white',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              willChange: 'transform',
              boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(150,206,180,0.15)'
              e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)'
              e.currentTarget.style.boxShadow = '0 20px 60px rgba(150,206,180,0.3)'
              e.currentTarget.style.borderColor = 'rgba(150,206,180,0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(150,206,180,0.08)'
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(31, 38, 135, 0.15)'
              e.currentTarget.style.borderColor = 'rgba(150,206,180,0.25)'
            }}
          >
            <h2 style={{ fontFamily: 'var(--font-primary)', fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem', color: '#96CEB4', letterSpacing: '-0.01em' }}>
              🏥 Healthcare Forms
            </h2>
            <p style={{ fontFamily: 'var(--font-heading)', opacity: 0.8, lineHeight: 1.6, fontWeight: '400' }}>
              Reduce patient anxiety with empathetic guidance through medical intake forms and complex healthcare workflows.
            </p>
            <p style={{ fontFamily: 'var(--font-heading)', opacity: 0.6, fontSize: '0.9rem', fontWeight: '400', marginTop: '0.8rem' }}>
              🎯 Healthcare Systems • EMR Vendors • Telehealth
            </p>
          </Link>

          {/* Education Tutor */}
          <Link
            href="/use-cases/education"
            className="use-case-card"
            style={{
              padding: '2rem',
              background: 'rgba(69,183,209,0.08)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              borderRadius: '20px',
              border: '1px solid rgba(69,183,209,0.25)',
              textDecoration: 'none',
              color: 'white',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              willChange: 'transform',
              boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(69,183,209,0.15)'
              e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)'
              e.currentTarget.style.boxShadow = '0 20px 60px rgba(69,183,209,0.3)'
              e.currentTarget.style.borderColor = 'rgba(69,183,209,0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(69,183,209,0.08)'
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(31, 38, 135, 0.15)'
              e.currentTarget.style.borderColor = 'rgba(69,183,209,0.25)'
            }}
          >
            <h2 style={{ fontFamily: 'var(--font-primary)', fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem', color: '#45B7D1', letterSpacing: '-0.01em' }}>
              📚 Education Tutor
            </h2>
            <p style={{ fontFamily: 'var(--font-heading)', opacity: 0.8, lineHeight: 1.6, fontWeight: '400' }}>
              Adaptive AI tutor that provides personalized encouragement, progressive hints, and emotional support tailored to each learner.
            </p>
            <p style={{ fontFamily: 'var(--font-heading)', opacity: 0.6, fontSize: '0.9rem', fontWeight: '400', marginTop: '0.8rem' }}>
              🎯 EdTech Platforms • Khan Academy • Duolingo
            </p>
          </Link>
        </div>

        {/* Rhythm Game Demo */}
        <div style={{
          marginTop: 'var(--section-gap-lg)',
          padding: 'var(--card-padding-lg) var(--card-padding)',
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.15)',
          boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)'
        }}>
          <h2 style={{
            fontFamily: 'var(--font-primary)',
            fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
            fontWeight: '600',
            marginBottom: '1rem',
            letterSpacing: '-0.015em'
          }}>
            Interactive Demo
          </h2>
          <p style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            opacity: 0.8,
            fontWeight: '400',
            marginBottom: '2rem',
            maxWidth: '600px',
            margin: '0 auto 2rem auto'
          }}>
            Experience the Emotive Engine through our interactive rhythm game—see emotional AI respond in real-time
          </p>
          <Link
            href="/demo"
            style={{
              display: 'inline-block',
              padding: '1.2rem 3rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              textDecoration: 'none',
              color: 'white',
              fontSize: '1.2rem',
              fontWeight: '600',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              willChange: 'transform'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)'
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(102,126,234,0.5)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(102,126,234,0.2)'
            }}
          >
            🎵 Play Rhythm Game Demo
          </Link>
        </div>

        {/* How It Works */}
        <div style={{
          marginTop: 'var(--section-gap-lg)',
          textAlign: 'left',
          maxWidth: '900px',
          margin: 'var(--section-gap-lg) auto 0 auto'
        }}>
          <h2 style={{
            fontFamily: 'var(--font-primary)',
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: '600',
            marginBottom: '2rem',
            textAlign: 'center',
            letterSpacing: '-0.015em'
          }}>
            How It Works
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 'var(--grid-gap)',
            marginTop: 'var(--spacing-md)'
          }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', color: '#667eea', fontSize: '1.3rem', fontWeight: '600', marginBottom: '0.5rem', letterSpacing: '-0.01em' }}>⚡ Real-time Emotion Engine</h3>
              <p style={{ fontFamily: 'var(--font-heading)', opacity: 0.8, lineHeight: 1.6, fontWeight: '400' }}>
                15 core emotions with smooth transitions. Responds instantly to user interactions and context.
              </p>
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', color: '#667eea', fontSize: '1.3rem', fontWeight: '600', marginBottom: '0.5rem', letterSpacing: '-0.01em' }}>🎭 Shape Morphing</h3>
              <p style={{ fontFamily: 'var(--font-heading)', opacity: 0.8, lineHeight: 1.6, fontWeight: '400' }}>
                Transform between any shapes. Perfect for logos, characters, or abstract forms.
              </p>
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', color: '#667eea', fontSize: '1.3rem', fontWeight: '600', marginBottom: '0.5rem', letterSpacing: '-0.01em' }}>🎨 50+ Gesture Animations</h3>
              <p style={{ fontFamily: 'var(--font-heading)', opacity: 0.8, lineHeight: 1.6, fontWeight: '400' }}>
                Chain gestures for unlimited combinations. Build complex emotional sequences.
              </p>
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', color: '#667eea', fontSize: '1.3rem', fontWeight: '600', marginBottom: '0.5rem', letterSpacing: '-0.01em' }}>🔋 Battery Optimized</h3>
              <p style={{ fontFamily: 'var(--font-heading)', opacity: 0.8, lineHeight: 1.6, fontWeight: '400' }}>
                No GPU required. Runs smoothly on any device, from phones to desktops.
              </p>
            </div>
          </div>
        </div>

        {/* For Developers */}
        <div style={{
          marginTop: 'var(--section-gap-lg)',
          padding: 'var(--card-padding-lg) var(--card-padding)',
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.15)',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)'
        }}>
          <h2 style={{
            fontFamily: 'var(--font-primary)',
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: '600',
            marginBottom: '1.5rem',
            letterSpacing: '-0.015em'
          }}>
            For Developers
          </h2>
          <p style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            opacity: 0.8,
            fontWeight: '400',
            marginBottom: '2rem',
            maxWidth: '700px',
            margin: '0 auto 2rem auto'
          }}>
            Open source, platform-agnostic, and designed for seamless integration into any stack
          </p>
          <div style={{
            display: 'flex',
            gap: '1.5rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginTop: '2rem'
          }}>
            <a
              href="https://github.com/rougesteelproject/emotive-mascot"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '1rem 2rem',
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                borderRadius: '12px',
                textDecoration: 'none',
                color: 'white',
                fontSize: '1.1rem',
                border: '1px solid rgba(255,255,255,0.15)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                willChange: 'transform'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(255,255,255,0.15)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              📦 GitHub
            </a>
            <a
              href="https://www.npmjs.com/package/emotive-mascot"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '1rem 2rem',
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                borderRadius: '12px',
                textDecoration: 'none',
                color: 'white',
                fontSize: '1.1rem',
                border: '1px solid rgba(255,255,255,0.15)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                willChange: 'transform'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(255,255,255,0.15)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              📘 NPM Package
            </a>
            <a
              href="https://emotive-mascot.web.app"
              style={{
                padding: '1rem 2rem',
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                borderRadius: '12px',
                textDecoration: 'none',
                color: 'white',
                fontSize: '1.1rem',
                border: '1px solid rgba(255,255,255,0.15)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                willChange: 'transform'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(255,255,255,0.15)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              📖 Documentation
            </a>
          </div>
        </div>

        {/* Footer spacing */}
        <div style={{ height: '4rem' }} />
      </div>
      </div>

      <EmotiveFooter />

      {/* Styles */}
      <style jsx>{`
        @media (min-width: 768px) {
          :global(.cherokee-flagship-card) {
            grid-column: span 2;
          }
        }

        /* Focus states for accessibility */
        :global(.use-case-card:focus-visible) {
          outline: 2px solid rgba(255, 255, 255, 0.8);
          outline-offset: 4px;
          border-radius: 20px;
        }

        :global(.cherokee-flagship-card:focus-visible) {
          outline: 2px solid rgba(218, 165, 32, 0.9);
          outline-offset: 4px;
        }

        /* Smooth default shadow on cards */
        :global(.use-case-card) {
          box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
        }
      `}</style>
    </div>
  )
}
