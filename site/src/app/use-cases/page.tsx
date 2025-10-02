'use client'

import { useState, useEffect, useCallback } from 'react'
import EmotiveHeader from '@/components/EmotiveHeader'
import EmotiveFooter from '@/components/EmotiveFooter'
import MessageHUD from '@/components/MessageHUD'
import HeroMascot from '@/components/HeroMascot'

export default function UseCasesPage() {
  const [mascot, setMascot] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [activeDemo, setActiveDemo] = useState<string | null>(null)
  const [scrollY, setScrollY] = useState(0)

  const addMessage = useCallback((type: string, content: string, duration = 3000) => {
    const id = Date.now().toString()
    setMessages(prev => [...prev, { id, type, content, duration, dismissible: true }])
  }, [])

  const removeMessage = useCallback((id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id))
  }, [])

  const handleMascotReady = useCallback((mascotInstance: any) => {
    setMascot(mascotInstance)
  }, [])

  const handleDemoClick = useCallback((demoType: string) => {
    setActiveDemo(demoType)
    
    if (mascot) {
      try {
        // Different demo scenarios based on use case
        switch (demoType) {
          case 'retail':
            mascot.setEmotion('joy')
            mascot.express('bounce')
            addMessage('info', 'Welcome! Let me help you check out.', 3000)
            break
          case 'home':
            mascot.setEmotion('calm')
            mascot.express('breathe')
            addMessage('info', 'Smart home system ready. How can I help?', 3000)
            break
          case 'music':
            mascot.setEmotion('excited')
            mascot.express('pulse')
            addMessage('info', 'Music detected! Dancing to the beat.', 3000)
            break
          case 'service':
            mascot.setEmotion('neutral')
            mascot.express('nod')
            addMessage('info', 'Customer service ready. How may I assist you?', 3000)
            break
        }
      } catch (error) {
        // Demo failed
      }
    }
  }, [mascot, addMessage])

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const useCases = [
    {
      id: 'retail',
      title: 'Retail Checkout AI',
      subtitle: 'Interface',
      description: 'Guide customers through self-checkout with emotional intelligence and real-time assistance.',
      features: ['POS Integration', 'Payment Processing', 'Customer Guidance', 'Error Handling'],
      target: 'Walmart, Home Depot, Amazon'
    },
    {
      id: 'home',
      title: 'Smart Home Hub',
      subtitle: 'Interface',
      description: 'Central control interface for smart home systems with voice commands and status monitoring.',
      features: ['IoT Integration', 'Voice Control', 'Status Monitoring', 'Automation'],
      target: 'Apple, Amazon, Nvidia'
    },
    {
      id: 'music',
      title: 'Music Platform',
      subtitle: 'Interface',
      description: 'Interactive music experience with real-time BPM detection and audio-reactive animations.',
      features: ['BPM Detection', 'Audio Analysis', 'Visual Sync', 'Groove Templates'],
      target: 'Spotify, Disney, Apple'
    },
    {
      id: 'service',
      title: 'Customer Service',
      subtitle: 'Robot Face',
      description: 'Emotional AI interface for customer service robots with natural language processing.',
      features: ['Voice Recognition', 'NLP Integration', 'Emotional AI', 'CRM Integration'],
      target: 'Amazon, Walmart, Disney'
    }
  ]

  const additionalUseCases = [
    { name: 'Robot Face', icon: '🤖' },
    { name: 'Server Monitor', icon: '📊' },
    { name: 'DJ Interface', icon: '🎧' },
    { name: 'Paint Station', icon: '🎨' },
    { name: 'Search & Rescue', icon: '🚁' },
    { name: 'Autism Communicator', icon: '💙' }
  ]

  return (
    <div className="emotive-container">
      <MessageHUD messages={messages} onMessageDismiss={removeMessage} />
      <EmotiveHeader 
        mascot={mascot}
        currentShape="circle"
        onAudioLoad={() => {}}
        onPlayStateChange={() => {}}
        onMessage={addMessage}
        flashMusicButton={false}
      />
      
      <div className="emotive-main">
        {/* Full Viewport Mascot Canvas */}
        <div className="full-vp-mascot-area">
          <HeroMascot onMascotReady={handleMascotReady} />
        </div>
        
        {/* Hero Text */}
        <div className="hero-text-container" style={{ 
          position: 'fixed', 
          top: '10%', 
          left: 'max(5%, 2rem)', 
          zIndex: 1000, 
          color: 'white',
          fontSize: '4rem',
          fontWeight: 'bold'
        }}>
          <div style={{ 
            color: 'transparent',
            WebkitTextStroke: '2px white',
            textStroke: '2px white',
            marginBottom: '-0.1em'
          }}>GET</div>
          <div className="hero-text-emotive">EMOTIVE</div>
          <div style={{
            fontSize: '1.2rem',
            fontWeight: '400',
            marginTop: '0.5rem',
            opacity: 0.8,
            letterSpacing: '0.1em'
          }}>Universal Communication</div>
        </div>
      </div>

      <EmotiveFooter />
    </div>
  )
}
