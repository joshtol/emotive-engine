'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import AICheckoutAssistant from './AICheckoutAssistant'

interface Product {
  id: string
  name: string
  price: number
  barcode: string
  image: string
}

interface CheckoutSimulationProps {
  onStepChange?: (step: number, emotion: string) => void
  openAIChat?: () => void
}

const DEMO_PRODUCTS: Product[] = [
  { id: '1', name: 'Organic Milk', price: 4.99, barcode: '12345', image: '🥛' },
  { id: '2', name: 'Whole Wheat Bread', price: 3.49, barcode: '23456', image: '🍞' },
  { id: '3', name: 'Fresh Apples', price: 5.99, barcode: '34567', image: '🍎' },
  { id: '4', name: 'Greek Yogurt', price: 6.49, barcode: '45678', image: '🥛' },
  { id: '5', name: 'Orange Juice', price: 4.29, barcode: '56789', image: '🧃' },
]

export default function CheckoutSimulation({ onStepChange, openAIChat }: CheckoutSimulationProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [cart, setCart] = useState<Product[]>([])
  const [scanning, setScanning] = useState(false)
  const [scanError, setScanError] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null)
  const [showAIHelp, setShowAIHelp] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mascotRef = useRef<any>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Expose the open AI chat function to parent
  useEffect(() => {
    if (openAIChat) {
      // Pass the function to open the chat
      (window as any).__openRetailAIChat = () => setShowAIHelp(true)
    }
    return () => {
      delete (window as any).__openRetailAIChat
    }
  }, [openAIChat])

  // Detect client-side mounting
  useEffect(() => {
    setIsClient(true)
    console.log('CheckoutSimulation mounted on client')
  }, [])

  // Detect mobile
  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Initialize mascot
  useEffect(() => {
    let cancelled = false

    const initMascot = async () => {
      if (!canvasRef.current || cancelled) return

      try {
        let attempts = 0
        while (!(window as any).EmotiveMascot && attempts < 50) {
          await new Promise(resolve => setTimeout(resolve, 100))
          attempts++
        }

        const EmotiveMascot = (window as any).EmotiveMascot?.default || (window as any).EmotiveMascot
        if (!EmotiveMascot) return

        const canvas = canvasRef.current
        if (!canvas) return

        const rect = canvas.getBoundingClientRect()
        const dpr = window.devicePixelRatio || 1
        canvas.setAttribute('width', Math.round(rect.width * dpr).toString())
        canvas.setAttribute('height', Math.round(rect.height * dpr).toString())

        const mascot = new EmotiveMascot({
          canvasId: 'checkout-mascot',
          enableAudio: false,
          soundEnabled: false,
          defaultEmotion: 'neutral',
          enableGazeTracking: false,
          enableIdleBehaviors: true,
          targetFPS: isMobile ? 30 : 60,
          maxParticles: isMobile ? 50 : 100,
        })

        await mascot.init(canvas)
        mascot.start()

        mascot.setPosition(0, 0, 0)
        mascot.setScale({
          core: isMobile ? 0.7 : 1.2,
          particles: isMobile ? 1.0 : 1.8
        })

        mascot.setBackdrop({
          enabled: true,
          radius: 3.0,
          intensity: 0.8,
          blendMode: 'normal',
          falloff: 'smooth',
          edgeSoftness: 0.95,
          coreTransparency: 0.3,
          responsive: true
        })

        mascotRef.current = mascot

        // Welcome gesture
        setTimeout(() => {
          mascot.express?.('wave')
        }, 500)

      } catch (error) {
        console.error('Failed to initialize mascot:', error)
      }
    }

    initMascot()

    return () => {
      cancelled = true
      if (mascotRef.current) {
        mascotRef.current.stop?.()
        mascotRef.current.destroy?.()
      }
    }
  }, [isMobile])

  // Handle step changes - DISABLED to prevent mascot jumping around
  useEffect(() => {
    // Mascot now only responds to AI chat, not checkout steps
    if (onStepChange) {
      onStepChange(currentStep, 'neutral')
    }
  }, [currentStep, onStepChange])

  const handleScanProduct = async () => {
    setScanning(true)
    setScanError(false)

    // Random product
    const randomProduct = DEMO_PRODUCTS[Math.floor(Math.random() * DEMO_PRODUCTS.length)]
    setCurrentProduct(randomProduct)

    // Mascot shakes while scanning
    if (mascotRef.current && mascotRef.current.express) {
      mascotRef.current.express('shake', { intensity: 0.5, duration: 800 })
    }

    // 15% chance of error for demo purposes
    const willError = Math.random() < 0.15

    await new Promise(resolve => setTimeout(resolve, 1200))

    if (willError) {
      // Error state - surprised with subdued undertone
      setScanError(true)
      setScanning(false)

      // Change to surprised emotion with subdued undertone
      if (mascotRef.current) {
        if (mascotRef.current.setEmotion) {
          mascotRef.current.setEmotion('surprise', 0.7)
        }
        if (mascotRef.current.updateUndertone) {
          mascotRef.current.updateUndertone('subdued')
        }
        if (mascotRef.current.express) {
          mascotRef.current.express('shake', { intensity: 0.5, duration: 600 })
        }
      }
    } else {
      // Success state - subtle nod, stay neutral
      setCart(prev => [...prev, randomProduct])
      setScanning(false)
      setCurrentProduct(null)

      // Quick nod on success
      if (mascotRef.current && mascotRef.current.express) {
        mascotRef.current.express('nod', { intensity: 0.4, duration: 500 })
      }
    }
  }

  const handleRetry = () => {
    setScanError(false)
    setCurrentProduct(null)

    // Return to neutral emotion and clear undertone
    if (mascotRef.current) {
      if (mascotRef.current.setEmotion) {
        mascotRef.current.setEmotion('neutral', 0.5)
      }
      if (mascotRef.current.updateUndertone) {
        mascotRef.current.updateUndertone('clear')
      }
    }
  }

  const handleCheckout = async () => {
    // Mascot floats when proceeding to checkout
    if (mascotRef.current && mascotRef.current.express) {
      mascotRef.current.express('float', { intensity: 0.6, duration: 1500 })
    }

    setCurrentStep(2) // Cart review
    await new Promise(resolve => setTimeout(resolve, 1500))

    setCurrentStep(3) // Payment
    await new Promise(resolve => setTimeout(resolve, 1500))

    setCurrentStep(4) // Processing
    setProcessing(true)

    // Mascot performs processing animation - use semantic performance for sophisticated choreography
    if (mascotRef.current && mascotRef.current.perform) {
      await mascotRef.current.perform('processing', {
        context: {
          frustration: 0,
          urgency: 'medium',
          magnitude: 'moderate'
        }
      })
    }

    await new Promise(resolve => setTimeout(resolve, 2500))

    setCurrentStep(5) // Complete
    setProcessing(false)
    setCompleted(true)

    // Mascot celebrates completion with euphoria and sun shape!
    await handleLLMResponse({
      message: '',
      emotion: 'triumph',
      sentiment: 'positive',
      action: 'celebrate',
      frustrationLevel: 0,
      shape: 'sun',
      gesture: 'sparkle'
    })

    // Add glow effect after morphing to sun
    setTimeout(() => {
      if (mascotRef.current && mascotRef.current.express) {
        mascotRef.current.express('glow', { intensity: 0.8, duration: 2000 })
      }
    }, 500)

    // Return to neutral after celebrating
    setTimeout(async () => {
      if (mascotRef.current) {
        if (mascotRef.current.setEmotion) {
          mascotRef.current.setEmotion('neutral', 0.5)
        }
        if (mascotRef.current.morphTo) {
          mascotRef.current.morphTo('circle', { duration: 1500 })
        }
        if (mascotRef.current.updateUndertone) {
          mascotRef.current.updateUndertone('clear')
        }
      }
    }, 3000)
  }

  const handleReset = () => {
    setCurrentStep(0)
    setCart([])
    setScanError(false)
    setScanning(false)
    setProcessing(false)
    setCompleted(false)
    setCurrentProduct(null)
  }

  const handleLLMResponse = async (response: any) => {
    console.log('handleLLMResponse called with:', response)

    if (!mascotRef.current) {
      console.warn('Mascot not initialized yet')
      return
    }

    if (mascotRef.current.handleLLMResponse) {
      console.log('Using new handleLLMResponse API')
      try {
        await mascotRef.current.handleLLMResponse(response)
      } catch (error) {
        console.error('Error handling LLM response:', error)
        // Fallback to manual control
        if (mascotRef.current.setEmotion) {
          mascotRef.current.setEmotion(response.emotion, 0.8)
        }
      }
    } else {
      console.warn('handleLLMResponse not available, using fallback')
      // Fallback to manual choreography
      if (mascotRef.current.setEmotion) {
        mascotRef.current.setEmotion(response.emotion, 0.8)
      }
      if (response.shape && mascotRef.current.morphTo) {
        mascotRef.current.morphTo(response.shape, { duration: 1000 })
      }
      if (response.gesture && mascotRef.current.express) {
        setTimeout(() => {
          if (mascotRef.current && mascotRef.current.express) {
            mascotRef.current.express(response.gesture, { intensity: 0.7 })
          }
        }, 300)
      }
    }
  }

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  // Help button to be rendered in status bar
  const helpButton = (
    <button
      onClick={() => setShowAIHelp(!showAIHelp)}
      style={{
        padding: '0.6rem 1.25rem',
        background: showAIHelp
          ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
          : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        borderRadius: '10px',
        fontSize: '0.9rem',
        fontWeight: '700',
        color: 'white',
        border: showAIHelp
          ? '1px solid rgba(239, 68, 68, 0.3)'
          : '1px solid rgba(16, 185, 129, 0.3)',
        boxShadow: showAIHelp
          ? '0 2px 12px rgba(239, 68, 68, 0.3)'
          : '0 2px 12px rgba(16, 185, 129, 0.3)',
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-1px)'
        e.currentTarget.style.boxShadow = showAIHelp
          ? '0 4px 16px rgba(239, 68, 68, 0.4)'
          : '0 4px 16px rgba(16, 185, 129, 0.4)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = showAIHelp
          ? '0 2px 12px rgba(239, 68, 68, 0.3)'
          : '0 2px 12px rgba(16, 185, 129, 0.3)'
      }}
    >
      <span style={{ fontSize: '1rem' }}>{showAIHelp ? '✕' : '💬'}</span>
      <span>{showAIHelp ? 'Close Chat' : 'Get Help'}</span>
    </button>
  )

  return (
    <div style={{
      position: 'relative',
      minHeight: '800px',
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
      gap: isMobile ? '2rem' : '3rem',
      alignItems: 'center',
      padding: '2rem',
      overflow: 'hidden'
    }}>
      {/* Mascot - Front and Center */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: isMobile ? '400px' : '600px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        order: isMobile ? 1 : 0,
        transform: showAIHelp && !isMobile ? 'translateX(-10%)' : 'translateX(0)',
        transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        <canvas
          ref={canvasRef}
          id="checkout-mascot"
          style={{
            width: '100%',
            height: '100%',
            filter: 'drop-shadow(0 20px 80px rgba(0, 217, 255, 0.6))',
          }}
        />
      </div>

      {/* Interface Card */}
      <div style={{
        position: 'relative',
        width: '100%',
        order: isMobile ? 2 : 1,
      }}>
        {/* Glass Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(26, 31, 58, 0.95) 0%, rgba(15, 18, 35, 0.98) 100%)',
          backdropFilter: 'blur(60px)',
          WebkitBackdropFilter: 'blur(60px)',
          borderRadius: '32px',
          padding: 'clamp(2rem, 4vw, 3rem)',
          border: '2px solid rgba(0, 217, 255, 0.2)',
          boxShadow: `
            0 30px 90px rgba(0, 0, 0, 0.5),
            0 0 0 1px rgba(0, 217, 255, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.05)
          `,
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Top accent line */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent, rgba(0, 217, 255, 0.8), transparent)'
          }} />

          {/* Ambient glow */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(0, 217, 255, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
            filter: 'blur(40px)',
          }} />

          {/* Progress indicator */}
          <div style={{
            marginBottom: '2.5rem',
            display: 'flex',
            gap: '0.5rem',
            justifyContent: 'center',
            position: 'relative'
          }}>
            {['Start', 'Scan', 'Review', 'Pay', 'Process', 'Done'].map((label, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  maxWidth: '100px',
                  textAlign: 'center'
                }}
              >
                <div style={{
                  height: '3px',
                  background: i <= currentStep
                    ? 'linear-gradient(90deg, #00D9FF, #10B981)'
                    : 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '3px',
                  marginBottom: '0.6rem',
                  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: i <= currentStep ? '0 0 12px rgba(0, 217, 255, 0.5)' : 'none'
                }} />
                <div style={{
                  fontSize: '0.75rem',
                  opacity: i <= currentStep ? 1 : 0.35,
                  fontWeight: i === currentStep ? '700' : '500',
                  color: i <= currentStep ? '#00D9FF' : 'rgba(255, 255, 255, 0.4)',
                  transition: 'all 0.3s ease',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase'
                }}>
                  {label}
                </div>
              </div>
            ))}
          </div>

          {/* Main content */}
          <div style={{ position: 'relative' }}>
          {currentStep === 0 && (
            <div style={{ textAlign: 'center' }}>
              <h3 style={{
                fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
                marginBottom: '1rem',
                background: 'linear-gradient(135deg, #00D9FF 0%, #10B981 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: '800',
                letterSpacing: '-0.02em'
              }}>
                Welcome to SmartMart
              </h3>
              <p style={{
                fontSize: '1.15rem',
                opacity: 0.75,
                marginBottom: '2.5rem',
                lineHeight: 1.7,
                color: 'rgba(255, 255, 255, 0.7)'
              }}>
                Watch how the mascot responds with emotion to every step of your checkout!
              </p>
              <button
                onClick={() => setCurrentStep(1)}
                style={{
                  padding: '1.4rem 3rem',
                  fontSize: '1.15rem',
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #00D9FF 0%, #00A8CC 100%)',
                  color: 'rgba(15, 18, 35, 1)',
                  border: '2px solid rgba(0, 217, 255, 0.3)',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 8px 32px rgba(0, 217, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'
                  e.currentTarget.style.boxShadow = '0 12px 48px rgba(0, 217, 255, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 217, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                }}
              >
                Start Shopping
              </button>
            </div>
          )}

          {currentStep === 1 && (
            <div>
              <h3 style={{
                fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                marginBottom: '2rem',
                background: 'linear-gradient(135deg, #00D9FF 0%, #10B981 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: '800',
                textAlign: 'center',
                letterSpacing: '-0.01em'
              }}>
                Scan Your Items
              </h3>

              {/* Scanner area */}
              <div style={{
                padding: '2.5rem',
                background: 'rgba(0, 0, 0, 0.4)',
                borderRadius: '20px',
                border: `2px dashed ${scanning ? 'rgba(0, 217, 255, 0.6)' : 'rgba(255, 255, 255, 0.15)'}`,
                marginBottom: '1.5rem',
                textAlign: 'center',
                minHeight: '220px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: scanning ? '0 0 40px rgba(0, 217, 255, 0.3), inset 0 0 40px rgba(0, 217, 255, 0.1)' : 'none'
              }}>
                {scanning && currentProduct && (
                  <div style={{
                    fontSize: '4rem',
                    marginBottom: '1rem',
                    animation: 'scanPulse 1s ease-in-out infinite'
                  }}>
                    {currentProduct.image}
                  </div>
                )}

                {scanError && currentProduct && (
                  <div style={{
                    animation: 'slideInUp 0.3s ease-out'
                  }}>
                    <div style={{
                      fontSize: '1.3rem',
                      fontWeight: '700',
                      color: '#EF4444',
                      marginBottom: '0.75rem'
                    }}>
                      Scanning Error
                    </div>
                    <div style={{
                      fontSize: '1rem',
                      opacity: 0.8,
                      marginBottom: '1rem',
                      lineHeight: 1.5,
                      color: 'rgba(255, 255, 255, 0.7)'
                    }}>
                      The mascot is showing empathy! Try holding the barcode closer to the scanner.
                    </div>
                    <button
                      onClick={handleRetry}
                      style={{
                        padding: '1rem 2rem',
                        background: 'linear-gradient(135deg, #00D9FF 0%, #00A8CC 100%)',
                        color: 'rgba(15, 18, 35, 1)',
                        border: '2px solid rgba(0, 217, 255, 0.3)',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 4px 20px rgba(0, 217, 255, 0.4)',
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-3px)'
                        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 217, 255, 0.6)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 217, 255, 0.4)'
                      }}
                    >
                      Try Again
                    </button>
                  </div>
                )}

                {!scanning && !scanError && (
                  <>
                    <div style={{
                      fontSize: '1.1rem',
                      opacity: 0.7,
                      marginBottom: '1.5rem',
                      color: 'rgba(255, 255, 255, 0.7)'
                    }}>
                      Watch the mascot react as you scan items
                    </div>
                    <button
                      onClick={handleScanProduct}
                      disabled={scanning}
                      style={{
                        padding: '1.2rem 2.5rem',
                        fontSize: '1.1rem',
                        fontWeight: '700',
                        background: 'linear-gradient(135deg, #00D9FF 0%, #00A8CC 100%)',
                        color: 'rgba(15, 18, 35, 1)',
                        border: '2px solid rgba(0, 217, 255, 0.3)',
                        borderRadius: '14px',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 6px 24px rgba(0, 217, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'
                        e.currentTarget.style.boxShadow = '0 10px 40px rgba(0, 217, 255, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)'
                        e.currentTarget.style.boxShadow = '0 6px 24px rgba(0, 217, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                      }}
                    >
                      Scan Item
                    </button>
                  </>
                )}
              </div>

              {/* Cart preview */}
              {cart.length > 0 && (
                <div style={{
                  padding: '1.8rem',
                  background: 'rgba(0, 217, 255, 0.05)',
                  borderRadius: '16px',
                  border: '1px solid rgba(0, 217, 255, 0.2)',
                  marginBottom: '1.5rem',
                  boxShadow: '0 4px 20px rgba(0, 217, 255, 0.1)'
                }}>
                  <div style={{
                    fontSize: '1rem',
                    fontWeight: '700',
                    marginBottom: '1.2rem',
                    color: '#00D9FF',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    Cart ({cart.length} {cart.length === 1 ? 'item' : 'items'})
                  </div>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.6rem',
                    maxHeight: '180px',
                    overflowY: 'auto'
                  }}>
                    {cart.map((item, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.75rem 1rem',
                          background: 'rgba(0, 0, 0, 0.3)',
                          borderRadius: '10px',
                          fontSize: '0.95rem',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ fontSize: '1.5rem' }}>{item.image}</span>
                          <span style={{ fontWeight: '500' }}>{item.name}</span>
                        </span>
                        <span style={{ fontWeight: '700', color: '#10B981', fontSize: '1.05rem' }}>
                          ${item.price.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div style={{
                    marginTop: '1.2rem',
                    paddingTop: '1.2rem',
                    borderTop: '2px solid rgba(0, 217, 255, 0.2)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '1.3rem',
                    fontWeight: '800'
                  }}>
                    <span style={{ color: '#00D9FF' }}>Total:</span>
                    <span style={{ color: '#10B981' }}>${total.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {cart.length > 0 && (
                <button
                  onClick={handleCheckout}
                  style={{
                    width: '100%',
                    padding: '1.5rem',
                    fontSize: '1.2rem',
                    fontWeight: '700',
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    color: 'white',
                    border: '2px solid rgba(16, 185, 129, 0.4)',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px) scale(1.01)'
                    e.currentTarget.style.boxShadow = '0 12px 48px rgba(16, 185, 129, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)'
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                  }}
                >
                  Proceed to Checkout
                </button>
              )}
            </div>
          )}

          {currentStep >= 2 && currentStep <= 4 && (
            <div style={{ textAlign: 'center' }}>
              <h3 style={{
                fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
                marginBottom: '1.2rem',
                background: 'linear-gradient(135deg, #00D9FF 0%, #10B981 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: '800',
                letterSpacing: '-0.02em'
              }}>
                {currentStep === 2 && 'Reviewing Your Order'}
                {currentStep === 3 && 'Secure Payment'}
                {currentStep === 4 && 'Processing...'}
              </h3>
              <p style={{
                fontSize: '1.15rem',
                opacity: 0.75,
                lineHeight: 1.7,
                color: 'rgba(255, 255, 255, 0.7)',
                marginBottom: '1rem'
              }}>
                {currentStep === 2 && `${cart.length} items • Total: $${total.toFixed(2)}`}
                {currentStep === 3 && 'Your payment is encrypted and secure'}
                {currentStep === 4 && 'Watch the mascot respond while we process...'}
              </p>
            </div>
          )}

          {currentStep === 5 && (
            <div style={{ textAlign: 'center' }}>
              <h3 style={{
                fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)',
                marginBottom: '1.2rem',
                background: 'linear-gradient(135deg, #10B981 0%, #00D9FF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: '900',
                letterSpacing: '-0.02em'
              }}>
                Order Complete!
              </h3>
              <p style={{
                fontSize: '1.25rem',
                opacity: 0.85,
                marginBottom: '1rem',
                lineHeight: 1.7,
                color: 'rgba(255, 255, 255, 0.8)'
              }}>
                Look at the mascot celebrating your successful checkout!
              </p>
              <p style={{
                fontSize: '1.1rem',
                opacity: 0.75,
                marginBottom: '2.5rem',
                lineHeight: 1.7,
                color: 'rgba(255, 255, 255, 0.7)'
              }}>
                Your order of <span style={{ color: '#10B981', fontWeight: '700' }}>${total.toFixed(2)}</span> has been processed.
              </p>
              <button
                onClick={handleReset}
                style={{
                  padding: '1.4rem 3rem',
                  fontSize: '1.15rem',
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #00D9FF 0%, #00A8CC 100%)',
                  color: 'rgba(15, 18, 35, 1)',
                  border: '2px solid rgba(0, 217, 255, 0.3)',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 8px 32px rgba(0, 217, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'
                  e.currentTarget.style.boxShadow = '0 12px 48px rgba(0, 217, 255, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 217, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                }}
              >
                Start New Order
              </button>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Premium Slate Glass AI Panel */}
      <div style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        width: isMobile ? '100%' : 'calc(50% - 1.5rem)',
        background: `
          linear-gradient(135deg,
            rgba(10, 12, 20, 0.95) 0%,
            rgba(15, 18, 28, 0.97) 50%,
            rgba(20, 24, 35, 0.95) 100%
          )
        `,
        backdropFilter: 'blur(80px) saturate(180%)',
        WebkitBackdropFilter: 'blur(80px) saturate(180%)',
        border: '1px solid rgba(0, 217, 255, 0.15)',
        borderRadius: '40px',
        transform: showAIHelp ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 50,
        overflow: 'hidden',
        boxShadow: showAIHelp
          ? `0 50px 150px rgba(0, 0, 0, 0.7),
             0 0 0 1px rgba(0, 217, 255, 0.08),
             inset 0 0 120px rgba(0, 217, 255, 0.03),
             inset 0 2px 0 rgba(255, 255, 255, 0.05),
             inset 0 -1px 0 rgba(0, 0, 0, 0.5)`
          : 'none'
      }}>
        {/* Premium glass reflection overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '50%',
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 100
        }} />

        {/* Animated ambient glow - top right */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '10%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(0, 217, 255, 0.12) 0%, transparent 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
          animation: 'float 12s ease-in-out infinite',
          zIndex: 0
        }} />

        {/* Animated ambient glow - bottom left */}
        <div style={{
          position: 'absolute',
          bottom: '15%',
          left: '5%',
          width: '350px',
          height: '350px',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
          animation: 'float 15s ease-in-out infinite reverse',
          zIndex: 0
        }} />

        {/* Edge glow accent */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: '1px',
          background: 'linear-gradient(180deg, transparent 0%, rgba(0, 217, 255, 0.3) 20%, rgba(0, 217, 255, 0.3) 80%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 101
        }} />

        {/* Top edge accent */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(0, 217, 255, 0.4) 50%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 101
        }} />

        {/* AI Assistant Content - Full Height */}
        <div style={{
          position: 'relative',
          height: '100%',
          overflow: 'hidden',
          zIndex: 10,
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            flex: 1,
            overflow: 'hidden',
            borderRadius: '32px'
          }}>
            <AICheckoutAssistant onLLMResponse={handleLLMResponse} />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scanPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes celebrationBounce {
          0% { transform: scale(0) rotate(0deg); }
          50% { transform: scale(1.2) rotate(10deg); }
          100% { transform: scale(1) rotate(0deg); }
        }

        @keyframes float {
          0%, 100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(10px, -10px);
          }
        }
      `}</style>

      {/* Render help button in status bar using portal */}
      {isClient && document.getElementById('help-button-container') && (
        createPortal(helpButton, document.getElementById('help-button-container')!)
      )}
    </div>
  )
}
