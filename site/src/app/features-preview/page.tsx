'use client'

import FeaturesShowcase from '@/components/FeaturesShowcase'
import EmotiveHeader from '@/components/EmotiveHeader'
import EmotiveFooter from '@/components/EmotiveFooter'

export default function FeaturesPreviewPage() {
  return (
    <>
      <EmotiveHeader />

      <main style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, rgba(10,10,10,0.95) 0%, rgba(5,5,5,0.85) 100%)',
        color: 'white',
        paddingTop: '80px',
        paddingBottom: '4rem',
      }}>
        {/* Preview Header */}
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem 2rem 2rem',
        }}>
          <h1 style={{
            fontFamily: 'var(--font-primary)',
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: '700',
            marginBottom: '1rem',
            letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 50%, #667eea 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Features Showcase Preview
          </h1>
          <p style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.1rem',
            color: 'rgba(255, 255, 255, 0.6)',
            maxWidth: '600px',
            margin: '0 auto',
          }}>
            Preview of the Features section ready to integrate into the home page
          </p>
        </div>

        {/* Features Component */}
        <FeaturesShowcase />

        {/* Integration Instructions */}
        <div style={{
          maxWidth: '800px',
          margin: '4rem auto 0 auto',
          padding: '2rem',
          background: 'rgba(102, 126, 234, 0.05)',
          border: '1px solid rgba(102, 126, 234, 0.2)',
          borderRadius: '20px',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-primary)',
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: '1rem',
            color: '#a5b4fc',
          }}>
            Integration Instructions
          </h2>
          <div style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1rem',
            color: 'rgba(255, 255, 255, 0.7)',
            lineHeight: '1.8',
          }}>
            <p style={{ marginBottom: '1rem' }}>
              <strong style={{ color: '#667eea' }}>Step 1:</strong> The component is already created at{' '}
              <code style={{
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                color: '#a5b4fc',
              }}>
                site/src/components/FeaturesShowcase.tsx
              </code>
            </p>
            <p style={{ marginBottom: '1rem' }}>
              <strong style={{ color: '#667eea' }}>Step 2:</strong> Import it in{' '}
              <code style={{
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                color: '#a5b4fc',
              }}>
                site/src/app/page.tsx
              </code>
            </p>
            <p style={{ marginBottom: '1rem' }}>
              <strong style={{ color: '#667eea' }}>Step 3:</strong> Insert{' '}
              <code style={{
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                color: '#a5b4fc',
              }}>
                &lt;FeaturesShowcase /&gt;
              </code>{' '}
              between the "Use Cases" and "For Developers" sections
            </p>
            <p style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(102, 126, 234, 0.2)' }}>
              See{' '}
              <code style={{
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                color: '#a5b4fc',
              }}>
                FEATURES_SHOWCASE_INTEGRATION.md
              </code>{' '}
              for complete documentation
            </p>
          </div>
        </div>
      </main>

      <EmotiveFooter />
    </>
  )
}
