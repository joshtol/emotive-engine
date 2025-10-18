'use client'

import { useScrollExperience } from '@/components/hooks/useScrollExperience'

interface RetailSectionProps {
  onMascotPosition?: (x: number, y: number) => void
}

export default function RetailSection({ onMascotPosition }: RetailSectionProps) {
  const { lock } = useScrollExperience()
  const isLocked = lock.locked && lock.sectionId === 'retail'

  return (
    <section className="retail-section" data-scroll-locked={isLocked ? 'true' : 'false'} style={{ 
      height: '100vh', 
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      color: 'white',
      padding: '2rem',
      backgroundColor: 'rgba(255, 107, 157, 0.1)', // Temporary background to see if section is visible
      border: '2px solid #FF6B9D' // Temporary border
    }}>
      <div style={{ maxWidth: '800px', textAlign: 'center' }}>
        <h2 style={{ 
          fontSize: 'clamp(2rem, 5vw, 4rem)', 
          marginBottom: '1rem',
          fontWeight: '700',
          color: '#FF6B9D'
        }}>
          Retail Checkout AI
        </h2>
        <h3 style={{ 
          fontSize: 'clamp(1.2rem, 3vw, 2rem)', 
          marginBottom: '2rem',
          opacity: 0.8,
          fontWeight: '400'
        }}>
          Empathetic Self-Service Interface
        </h3>
        <p style={{ 
          fontSize: 'clamp(1rem, 2vw, 1.5rem)', 
          lineHeight: '1.6',
          opacity: 0.9,
          marginBottom: '2rem'
        }}>
          Guide customers through self-checkout with emotional intelligence and real-time assistance. 
          Reduce cart abandonment and improve customer satisfaction with intuitive, empathetic interactions.
        </p>
        
        {/* Key Features */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginTop: '3rem'
        }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(255, 107, 157, 0.1)', borderRadius: '8px' }}>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#FF6B9D' }}>🛒 Cart Assistance</h4>
            <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Real-time help with scanning and checkout process</p>
          </div>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(255, 107, 157, 0.1)', borderRadius: '8px' }}>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#FF6B9D' }}>😊 Emotion Detection</h4>
            <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Responds to customer frustration with helpful guidance</p>
          </div>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(255, 107, 157, 0.1)', borderRadius: '8px' }}>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#FF6B9D' }}>💳 Payment Support</h4>
            <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Guides through payment options with patience</p>
          </div>
        </div>
      </div>
    </section>
  )
}
