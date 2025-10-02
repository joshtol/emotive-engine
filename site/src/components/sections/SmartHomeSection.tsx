'use client'

interface SmartHomeSectionProps {
  onMascotPosition?: (x: number, y: number) => void
}

export default function SmartHomeSection({ onMascotPosition }: SmartHomeSectionProps) {
  return (
    <section className="smart-home-section" style={{ 
      height: '100vh', 
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      color: 'white',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '800px', textAlign: 'center' }}>
        <h2 style={{ 
          fontSize: 'clamp(2rem, 5vw, 4rem)', 
          marginBottom: '1rem',
          fontWeight: '700',
          color: '#4ECDC4'
        }}>
          Smart Home Hub
        </h2>
        <h3 style={{ 
          fontSize: 'clamp(1.2rem, 3vw, 2rem)', 
          marginBottom: '2rem',
          opacity: 0.8,
          fontWeight: '400'
        }}>
          Intelligent Home Companion
        </h3>
        <p style={{ 
          fontSize: 'clamp(1rem, 2vw, 1.5rem)', 
          lineHeight: '1.6',
          opacity: 0.9,
          marginBottom: '2rem'
        }}>
          Central control interface for smart home systems with voice commands and status monitoring. 
          Create an intuitive, emotional connection between users and their connected home environment.
        </p>
        
        {/* Key Features */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginTop: '3rem'
        }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(78, 205, 196, 0.1)', borderRadius: '8px' }}>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#4ECDC4' }}>🏠 Device Control</h4>
            <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Unified control for lights, temperature, and security</p>
          </div>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(78, 205, 196, 0.1)', borderRadius: '8px' }}>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#4ECDC4' }}>🎤 Voice Commands</h4>
            <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Natural language processing with emotional context</p>
          </div>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(78, 205, 196, 0.1)', borderRadius: '8px' }}>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#4ECDC4' }}>📊 Status Monitoring</h4>
            <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Real-time feedback on home systems and energy usage</p>
          </div>
        </div>
      </div>
    </section>
  )
}
