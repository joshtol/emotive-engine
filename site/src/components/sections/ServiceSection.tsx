'use client'

interface ServiceSectionProps {
  onMascotPosition?: (x: number, y: number) => void
}

export default function ServiceSection({ onMascotPosition }: ServiceSectionProps) {
  return (
    <section className="service-section" style={{ 
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
          color: '#96CEB4'
        }}>
          Customer Service
        </h2>
        <h3 style={{ 
          fontSize: 'clamp(1.2rem, 3vw, 2rem)', 
          marginBottom: '2rem',
          opacity: 0.8,
          fontWeight: '400'
        }}>
          Empathetic AI Assistant
        </h3>
        <p style={{ 
          fontSize: 'clamp(1rem, 2vw, 1.5rem)', 
          lineHeight: '1.6',
          opacity: 0.9,
          marginBottom: '2rem'
        }}>
          Emotional AI interface for customer service robots with natural language processing. 
          Bridge the gap between human empathy and automated assistance for superior customer experiences.
        </p>
        
        {/* Key Features */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginTop: '3rem'
        }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(150, 206, 180, 0.1)', borderRadius: '8px' }}>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#96CEB4' }}>🤖 Robot Interface</h4>
            <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Physical robot face with expressive capabilities</p>
          </div>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(150, 206, 180, 0.1)', borderRadius: '8px' }}>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#96CEB4' }}>💬 Natural Language</h4>
            <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Advanced NLP with emotional context understanding</p>
          </div>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(150, 206, 180, 0.1)', borderRadius: '8px' }}>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#96CEB4' }}>❤️ Empathy Engine</h4>
            <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Responds with appropriate emotional intelligence</p>
          </div>
        </div>
      </div>
    </section>
  )
}
