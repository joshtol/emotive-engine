'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

interface HeroSectionProps {
  onMascotPosition?: (x: number, y: number) => void
  mascot?: any
}

export default function HeroSection({ onMascotPosition, mascot }: HeroSectionProps) {
  const [scrollY, setScrollY] = useState(0)
  const [hasTriggeredDemo, setHasTriggeredDemo] = useState(false)
  const [buttonPosition, setButtonPosition] = useState<{x: number, y: number} | null>(null)
  const [originalPosition, setOriginalPosition] = useState<{x: number, y: number} | null>(null)

  // Capture button position and original mascot position when component mounts
  useEffect(() => {
    const captureButtonPosition = () => {
      // Look for the Try Demo button specifically in the hero section, not the nav
      const demoButton = document.querySelector('.hero-text-container a[href="/demo"]') as HTMLElement
      if (demoButton) {
        const buttonRect = demoButton.getBoundingClientRect()
        const buttonCenterX = buttonRect.left + buttonRect.width / 2
        const buttonCenterY = buttonRect.top + buttonRect.height / 2
        setButtonPosition({ x: buttonCenterX, y: buttonCenterY })
      } else {
        const allDemoLinks = document.querySelectorAll('a[href="/demo"]')
      }
    }
    
    const captureOriginalPosition = () => {
      if (mascot && mascot.positionController && !originalPosition) {
        const x = mascot.positionController.offsetX
        const y = mascot.positionController.offsetY
        setOriginalPosition({ x, y })
      }
    }
    
    // Try multiple times with increasing delays
    setTimeout(captureButtonPosition, 100)
    setTimeout(captureButtonPosition, 500)
    setTimeout(captureButtonPosition, 1000)
    
    setTimeout(captureOriginalPosition, 100)
    setTimeout(captureOriginalPosition, 500)
  }, [mascot, originalPosition])

  useEffect(() => {
    const handleScroll = () => {
      const newScrollY = window.scrollY
      setScrollY(newScrollY)
      
      
      // Gradually move mascot toward Try Demo button with parallax (reversible)
      if (mascot && buttonPosition) {
        // Calculate progress from 50px to 300px scroll (when button starts fading)
        const startScroll = 50
        const endScroll = 300
        const progress = Math.min(Math.max((newScrollY - startScroll) / (endScroll - startScroll), 0), 1)
        
        // Get mascot's current actual position (matches HeroMascot positioning logic)
        const isDesktop = window.innerWidth > 1024
        const mascotRadius = 50 // Approximate radius for positioning
        
        // Use captured original position if available, otherwise calculate expected position
        const originalX = originalPosition?.x ?? (isDesktop ? (window.innerWidth * 0.25) : (window.innerWidth * 0.33) - mascotRadius)
        const originalY = originalPosition?.y ?? (isDesktop ? -(window.innerHeight * 0.25) - mascotRadius + (window.innerHeight * 0.15) : -(window.innerHeight * 0.35) - mascotRadius + (window.innerHeight * 0.08))
        
        if (newScrollY < startScroll) {
          // When scrolled back above start point, reset to exact original position
          mascot.setOffset(originalX, originalY, 0)
          
          // Reset scale to 100%
          if (typeof mascot.setScale === 'function') {
            mascot.setScale(1.0)
          }
          
          // Reset to original state
          if (hasTriggeredDemo) {
            setHasTriggeredDemo(false)
            mascot.setEmotion('neutral')
            
            // Return to circle shape
            if (typeof mascot.setShape === 'function') {
              mascot.setShape('circle')
            } else if (typeof mascot.morphTo === 'function') {
              mascot.morphTo('circle')
            }
          }
        } else {
          // Normal animation when scrolling down
          // Target position (to the right of Try Demo button)
          const buttonOffset = 80 // Hover 80px to the right of the button
          const targetX = (buttonPosition.x + buttonOffset) - window.innerWidth / 2
          const targetY = buttonPosition.y - window.innerHeight / 2
          
          // Interpolate between original and target positions
          const currentX = originalX + (targetX - originalX) * progress
          const currentY = originalY + (targetY - originalY) * progress
          
          // Calculate size scaling (100% to 60% as it approaches button)
          const currentScale = 1.0 - (progress * 0.4) // Scale from 1.0 to 0.6
          
          
          // Move mascot to interpolated position
          mascot.setOffset(currentX, currentY, 0)
          
          
          
          // Apply size scaling
          if (typeof mascot.setScale === 'function') {
            mascot.setScale(currentScale)
          }
          
          // Start nod immediately when movement begins, but save euphoria for the button
          if (!hasTriggeredDemo) {
            setHasTriggeredDemo(true)
            mascot.express('nod')
          }
          
          // Trigger euphoria when reaching the button (80% progress)
          if (progress >= 0.8) {
            mascot.setEmotion('euphoria')
          }
          
          // Change to sun shape as it moves
          if (typeof mascot.setShape === 'function') {
            mascot.setShape('sun')
          } else if (typeof mascot.morphTo === 'function') {
            mascot.morphTo('sun')
          }
        }
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hasTriggeredDemo, mascot, buttonPosition])
  return (
    <section className="hero-section" style={{ height: '100vh', position: 'relative' }}>
      {/* Hero Text */}
      <div className="hero-text-container" style={{
        position: 'fixed',
        top: '15%',
        left: 'max(5%, 2rem)',
        zIndex: 1000,
        pointerEvents: 'auto'
      }}>
        {/* Hero Text with Chromatic Aberration */}
        <div style={{ position: 'relative' }}>
          {/* GET - fades out with EMOTIVE */}
          <img 
            src="/assets/misc/hero/get.svg" 
            alt="GET"
            style={{
              width: 'clamp(150px, 20vw, 300px)', // Much smaller than EMOTIVE
              height: 'auto',
              display: 'block',
              marginBottom: '-0.1em',
              opacity: Math.max(1 - Math.max(scrollY - 450, 0) / 200, 0) // Fade out slightly after EMOTIVE
            }}
          />
          
          {/* EMOTIVE with chromatic aberration effect */}
          <div style={{ position: 'relative' }}>
            {/* First outline - slides straight down, evenly spaced */}
            <img 
              src="/assets/misc/hero/emotive-outline.svg" 
              alt=""
              style={{
                position: 'absolute',
                top: `${Math.min(scrollY * 0.6, 120)}px`, // Move to 120px down
                left: '0px', // Stay centered
                width: 'clamp(300px, 40vw, 600px)',
                height: 'auto',
                opacity: Math.min(scrollY / 100 * 0.6, 0.6) * Math.max(1 - Math.max(scrollY - 400, 0) / 200, 0), // Faster fade in
                zIndex: -2,
                pointerEvents: 'none'
              }}
            />
            
            {/* Second outline - slides straight down, evenly spaced */}
            <img 
              src="/assets/misc/hero/emotive-outline.svg" 
              alt=""
              style={{
                position: 'absolute',
                top: `${Math.min(scrollY * 0.3, 60)}px`, // Move to 60px down (half of first outline)
                left: '0px', // Stay centered
                width: 'clamp(300px, 40vw, 600px)',
                height: 'auto',
                opacity: Math.min(scrollY / 150 * 0.4, 0.4) * Math.max(1 - Math.max(scrollY - 400, 0) / 200, 0), // Faster fade in
                zIndex: -1,
                pointerEvents: 'none'
              }}
            />
            
            {/* Main EMOTIVE with gradient - fades out with Try Demo button */}
            <img 
              src="/assets/misc/hero/emotive-gradient.svg" 
              alt="EMOTIVE"
              style={{
                width: 'clamp(300px, 40vw, 600px)',
                height: 'auto',
                display: 'block',
                position: 'relative',
                zIndex: 1,
                opacity: Math.max(1 - Math.max(scrollY - 400, 0) / 200, 0) // Fade out with Try Demo button
              }}
            />
          </div>
        </div>
        {/* Tagline - fades out early */}
        <div style={{
          fontSize: '1.2rem',
          fontWeight: '400',
          marginTop: '0.5rem',
          opacity: Math.max(0.8 - scrollY / 250, 0), // Fade out early
          letterSpacing: '0.1em',
          color: 'white'
        }}>Universal Communication</div>

        {/* Value Proposition - fades out early */}
        <div style={{
          marginTop: '2rem',
          maxWidth: '500px',
          color: 'white',
          opacity: Math.max(0.9 - scrollY / 250, 0) // Fade out early
        }}>
          <p style={{
            fontSize: '1.1rem',
            lineHeight: '1.6',
            marginBottom: '1rem'
          }}>
            Emotional AI that bridges human communication without the uncanny valley.
          </p>
          <div style={{
            display: 'flex',
            gap: '1.5rem',
            flexWrap: 'wrap',
            fontSize: '0.9rem',
            opacity: 0.8
          }}>
            <span>✨ Real-time Response</span>
            <span>🎭 50+ Emotions</span>
            <span>🌐 Cross-platform</span>
          </div>
        </div>

        {/* CTA Button - fades out late, after user scrolls past it */}
        <Link href="/demo" style={{
          display: 'inline-block',
          marginTop: '2rem',
          padding: '1rem 2rem',
          backgroundColor: 'var(--brand-primary)',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '0.5rem',
          fontSize: '1.1rem',
          fontWeight: '600',
          letterSpacing: '0.05em',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 15px rgba(221, 74, 154, 0.3)',
          pointerEvents: 'auto',
          position: 'relative',
          zIndex: 1100, // Above mascot (500) and hero text (1000)
          opacity: Math.max(1 - Math.max(scrollY - 400, 0) / 200, 0) // Start fading after 400px scroll
        }}>Try Demo</Link>
      </div>

      {/* Use Case Preview Cards Teaser */}
      <div style={{
        position: 'absolute',
        bottom: '4rem',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '90%',
        maxWidth: '1200px',
        height: '200px',
        pointerEvents: 'none'
      }}>
        {/* Preview Cards */}
        {[
          { title: 'Retail Checkout AI', color: '#FF6B9D', delay: 0 },
          { title: 'Smart Home Hub', color: '#4ECDC4', delay: 0.2 },
          { title: 'Music Platform', color: '#45B7D1', delay: 0.4 },
          { title: 'Customer Service', color: '#96CEB4', delay: 0.6 },
          { title: 'Gaming Interface', color: '#FFEAA7', delay: 0.8 }
        ].map((card, index) => (
          <div
            key={card.title}
            style={{
              position: 'absolute',
              left: `${20 + index * 15}%`, // Spread horizontally
              top: `${Math.sin(scrollY * 0.01 + card.delay) * 10 + 50}%`, // Floating effect
              transform: `
                translateX(-50%) 
                translateY(-50%) 
                rotate(${Math.sin(scrollY * 0.005 + card.delay) * 5}deg)
                scale(${0.8 + Math.sin(scrollY * 0.008 + card.delay) * 0.1})
              `, // Rotation and scale animation
              width: '180px',
              height: '120px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              border: `2px solid ${card.color}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '0.9rem',
              fontWeight: '600',
              textAlign: 'center',
              opacity: (0.7 + Math.sin(scrollY * 0.01 + card.delay) * 0.2) * Math.max(1 - scrollY / 150, 0), // Fade out faster
              boxShadow: `0 8px 32px rgba(${card.color.slice(1).match(/.{2}/g)?.map(hex => parseInt(hex, 16)).join(', ')}, 0.3)`,
              zIndex: 5 - index, // Stack order
              transition: 'all 0.3s ease'
            }}
          >
            {card.title}
          </div>
        ))}
        
        {/* Teaser Text */}
        <div style={{
          position: 'absolute',
          bottom: '-3rem',
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'white',
          opacity: 0.6 * Math.max(1 - scrollY / 150, 0), // Fade out faster
          fontSize: '0.9rem',
          letterSpacing: '0.1em',
          textAlign: 'center',
          animation: 'bounce 2s infinite'
        }}>
          Discover Use Cases ↓
        </div>
      </div>
    </section>
  )
}
