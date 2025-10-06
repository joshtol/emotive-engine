'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import Link from 'next/link'
import EmotiveHeader from '@/components/EmotiveHeader'
import EmotiveFooter from '@/components/EmotiveFooter'
import MessageHUD from '@/components/MessageHUD'
import HeroMascot from '@/components/HeroMascot'
import HeroSection from '@/components/sections/HeroSection'
import RetailSection from '@/components/sections/RetailSection'
import SmartHomeSection from '@/components/sections/SmartHomeSection'
import MusicSection from '@/components/sections/MusicSection'
import ServiceSection from '@/components/sections/ServiceSection'

export default function HomePage() {
  const [mascot, setMascot] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [scrollY, setScrollY] = useState(0)
  const [activeSection, setActiveSection] = useState(0)
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([])
  const pathCleanupRef = useRef<(() => void) | null>(null)
  const lastTargetIdRef = useRef<string | null>(null)

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

  // Define sections with mascot positions
  const sections = useMemo(() => [
    {
      id: 'hero',
      title: 'GET EMOTIVE',
      subtitle: 'Universal Communication',
      pathAnchor: 0.82,
      offset: { x: 160, y: -140 }
    },
    {
      id: 'retail',
      title: 'Retail Checkout AI',
      subtitle: 'Interface',
      pathAnchor: 0.78,
      offset: { x: 140, y: -40 }
    },
    {
      id: 'smart-home',
      title: 'Smart Home Hub',
      subtitle: 'Interface',
      pathAnchor: 0.25,
      offset: { x: -160, y: 60 }
    },
    {
      id: 'music',
      title: 'Music Platform',
      subtitle: 'Interface',
      pathAnchor: 0.74,
      offset: { x: 120, y: -20 }
    },
    {
      id: 'service',
      title: 'Customer Service',
      subtitle: 'Robot Face',
      pathAnchor: 0.5,
      offset: { x: 0, y: 40 }
    }
  ], [])
  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      setScrollY(scrollY)

      // Calculate which section is active based on scroll position
      const sectionHeight = window.innerHeight
      const activeIndex = Math.min(Math.floor(scrollY / sectionHeight), sections.length - 1)
      setActiveSection(activeIndex)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [sections.length])

  // Update mascot position based on active section (disabled for now - keeping original positioning)
  // useEffect(() => {
  //   if (mascot && sections[activeSection]) {
  //     const section = sections[activeSection]
  //     const canvasWidth = window.innerWidth
  //     const canvasHeight = window.innerHeight

  //     // Calculate mascot position based on section's desired position
  //     const targetX = canvasWidth * section.position.x
  //     const targetY = canvasHeight * section.position.y

  //     // Adjust for mascot's center positioning
  //     mascot.setOffset(targetX - (canvasWidth / 2), targetY - (canvasHeight / 2), 0)
  //   }
  // }, [mascot, activeSection, sections])

  useEffect(() => {
    if (!mascot) {
      return
    }

    const targetMeta = sections[activeSection]
    const targetElement = sectionRefs.current[activeSection]
    if (!targetMeta || !targetElement) {
      return
    }

    const elementTargeting = mascot.positionController?.getElementTargeting?.()
    if (!elementTargeting || typeof elementTargeting.moveToElementWithPath !== 'function') {
      return
    }

    const targetId = targetMeta.id
    if (!targetId) {
      return
    }

    if (lastTargetIdRef.current === targetId && pathCleanupRef.current) {
      return
    }

    if (pathCleanupRef.current) {
      pathCleanupRef.current()
      pathCleanupRef.current = null
    }

    const viewportWidth = window.innerWidth || 1
    const viewportHeight = window.innerHeight || 1
    const anchorFraction = targetMeta.pathAnchor ?? 0.8
    const boundedAnchor = Math.min(0.92, Math.max(0.08, anchorFraction))
    const horizontalAnchor = Math.min(viewportWidth - 80, Math.max(80, viewportWidth * boundedAnchor))

    const pathPoints: Array<{ x: number; y: number }> = []
    const currentOffset = mascot.positionController?.getOffset?.()

    if (currentOffset && typeof currentOffset.x === 'number' && typeof currentOffset.y === 'number') {
      pathPoints.push({
        x: horizontalAnchor,
        y: currentOffset.y + viewportHeight / 2
      })
    } else {
      pathPoints.push({
        x: horizontalAnchor,
        y: viewportHeight * 0.3
      })
    }

    const targetRect = targetElement.getBoundingClientRect()
    const targetMidY = targetRect.top + targetRect.height / 2

    pathPoints.push({
      x: horizontalAnchor,
      y: targetMidY
    })

    const approachFromLeft = horizontalAnchor < targetRect.left + (targetRect.width / 2)
    const approachX = approachFromLeft
      ? targetRect.left + targetRect.width * 0.35
      : targetRect.left + targetRect.width * 0.65

    pathPoints.push({
      x: approachX,
      y: targetMidY
    })

    const cleanup = elementTargeting.moveToElementWithPath(
      `#${targetId}`,
      pathPoints,
      'center',
      targetMeta.offset ?? { x: 0, y: 0 },
      {
        coordinateSystem: 'viewport',
        speed: targetMeta.speed ?? 320,
        easing: 'easeInOutCubic'
      }
    )

    pathCleanupRef.current = typeof cleanup === 'function' ? cleanup : null
    lastTargetIdRef.current = targetId
  }, [mascot, activeSection, sections])

  useEffect(() => {
    return () => {
      if (pathCleanupRef.current) {
        pathCleanupRef.current()
        pathCleanupRef.current = null
      }
    }
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
      
      <div className="parallax-main">
        {/* Full Document Mascot Canvas */}
        <div className="full-vp-mascot-area">
          <HeroMascot onMascotReady={handleMascotReady} />
        </div>

        {/* Parallax Sections */}
        <div
          ref={el => sectionRefs.current[0] = el}
          id={sections[0].id}
          className="parallax-section"
        >
          <HeroSection mascot={mascot} />
        </div>

        {/* Spacer to ensure next section doesn't start until Try Demo button fades */}
        <div style={{ height: '200px' }}></div>

        <div
          ref={el => sectionRefs.current[1] = el}
          id={sections[1].id}
          className="parallax-section"
        >
          <RetailSection />
        </div>

        <div
          ref={el => sectionRefs.current[2] = el}
          id={sections[2].id}
          className="parallax-section"
        >
          <SmartHomeSection />
        </div>

        <div
          ref={el => sectionRefs.current[3] = el}
          id={sections[3].id}
          className="parallax-section"
        >
          <MusicSection />
        </div>

        <div
          ref={el => sectionRefs.current[4] = el}
          id={sections[4].id}
          className="parallax-section"
        >
          <ServiceSection />
        </div>
      </div>

      <EmotiveFooter />
    </div>
  )
}
