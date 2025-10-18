'use client'

import { useScrollExperience } from '@/components/hooks/useScrollExperience'

interface MusicSectionProps {
  onMascotPosition?: (x: number, y: number) => void
}

export default function MusicSection({ onMascotPosition }: MusicSectionProps) {
  const { lock } = useScrollExperience()
  const isLocked = lock.locked && lock.sectionId === 'music'

  return (
    <section className="music-section" data-scroll-locked={isLocked ? 'true' : 'false'} style={{ 
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
          color: '#45B7D1'
        }}>
          Music Platform
        </h2>
        <h3 style={{ 
          fontSize: 'clamp(1.2rem, 3vw, 2rem)', 
          marginBottom: '2rem',
          opacity: 0.8,
          fontWeight: '400'
        }}>
          Audio-Reactive Experience
        </h3>
        <p style={{ 
          fontSize: 'clamp(1rem, 2vw, 1.5rem)', 
          lineHeight: '1.6',
          opacity: 0.9,
          marginBottom: '2rem'
        }}>
          Interactive music experience with real-time BPM detection and audio-reactive animations. 
          Transform music streaming into an immersive, emotional journey that responds to every beat.
        </p>
        
        {/* Key Features */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginTop: '3rem'
        }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(69, 183, 209, 0.1)', borderRadius: '8px' }}>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#45B7D1' }}>🎵 BPM Detection</h4>
            <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Real-time beat analysis for synchronized animations</p>
          </div>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(69, 183, 209, 0.1)', borderRadius: '8px' }}>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#45B7D1' }}>🌊 Audio Reactive</h4>
            <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Visual elements respond to frequency and amplitude</p>
          </div>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(69, 183, 209, 0.1)', borderRadius: '8px' }}>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#45B7D1' }}>🎭 Mood Matching</h4>
            <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Emotional expressions match music genre and energy</p>
          </div>
        </div>
      </div>
    </section>
  )
}
