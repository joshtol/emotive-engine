'use client'

import { useState, useRef, useEffect } from 'react'
import { useTimeoutManager } from '@/hooks/useTimeoutManager'

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

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function CheckoutSimulation({ onStepChange, openAIChat }: CheckoutSimulationProps) {
  const { setTimeout: setManagedTimeout } = useTimeoutManager()
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

  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your checkout assistant. I can help you scan items, apply coupons, answer questions, and make your shopping smooth."
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (openAIChat) {
      (window as any).__openRetailAIChat = () => setShowAIHelp(true)
    }
    return () => {
      delete (window as any).__openRetailAIChat
    }
  }, [openAIChat])

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Auto-scroll disabled - let user control viewport
  // useEffect(() => {
  //   if (messages.length > 0 && messages[messages.length - 1].role === 'assistant') {
  //     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  //   }
  // }, [messages])

  // Initialize mascot - ONCE
  useEffect(() => {
    let cancelled = false

    const initMascot = async () => {
      if (!canvasRef.current || cancelled) return

      try {
        let attempts = 0
        while (!(window as any).EmotiveMascotLean && !(window as any).EmotiveMascot && attempts < 50) {
          await new Promise(resolve => setTimeout(resolve, 100))
          attempts++
        }

        const EmotiveMascot = (window as any).EmotiveMascotLean?.default || (window as any).EmotiveMascotLean || (window as any).EmotiveMascot?.default || (window as any).EmotiveMascot
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
          maxParticles: isMobile ? 40 : 100,
        })

        await mascot.init(canvas)
        mascot.start()

        mascot.setPosition(0, 0, 0)
        mascot.setScale({
          core: isMobile ? 1.3 : 1.2,
          particles: isMobile ? 1.5 : 1.8
        })

        mascot.setBackdrop({
          enabled: true,
          radius: 3.5,
          intensity: 0.9,
          blendMode: 'normal',
          falloff: 'smooth',
          edgeSoftness: 0.95,
          coreTransparency: 0.2,
          responsive: true
        })

        mascotRef.current = mascot

        setManagedTimeout(() => {
          mascot.express?.('wave')
        }, 500)

      } catch (error) {
        console.error('Failed to initialize mascot:', error)
      }
    }

    initMascot()

    return () => {
      cancelled = true
      // Timeouts are auto-cleaned by useTimeoutManager hook
      if (mascotRef.current) {
        mascotRef.current.stop?.()
        mascotRef.current.destroy?.()
      }
    }
  }, [isMobile])

  const handleScanProduct = async () => {
    setScanning(true)
    setScanError(false)

    const randomProduct = DEMO_PRODUCTS[Math.floor(Math.random() * DEMO_PRODUCTS.length)]
    setCurrentProduct(randomProduct)

    if (mascotRef.current && mascotRef.current.express) {
      mascotRef.current.express('shake', { intensity: 0.5, duration: 800 })
    }

    const willError = Math.random() < 0.15

    await new Promise(resolve => setTimeout(resolve, 1200))

    if (willError) {
      setScanError(true)
      setScanning(false)

      if (mascotRef.current) {
        if (mascotRef.current.setEmotion) {
          mascotRef.current.setEmotion('surprise', 0.7)
        }
        if (mascotRef.current.updateUndertone) {
          mascotRef.current.updateUndertone('subdued')
        }
      }
    } else {
      setCart(prev => [...prev, randomProduct])
      setScanning(false)
      setCurrentProduct(null)

      if (mascotRef.current && mascotRef.current.express) {
        mascotRef.current.express('nod', { intensity: 0.4, duration: 500 })
      }
    }
  }

  const handleRetry = () => {
    setScanError(false)
    setCurrentProduct(null)

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
    if (mascotRef.current && mascotRef.current.express) {
      mascotRef.current.express('float', { intensity: 0.6, duration: 1500 })
    }

    setCurrentStep(2)
    await new Promise(resolve => setTimeout(resolve, 1000))

    setCurrentStep(3)
    await new Promise(resolve => setTimeout(resolve, 1000))

    setCurrentStep(4)
    setProcessing(true)

    if (mascotRef.current && mascotRef.current.perform) {
      await mascotRef.current.perform('processing', {
        context: {
          frustration: 0,
          urgency: 'medium',
          magnitude: 'moderate'
        }
      })
    }

    await new Promise(resolve => setTimeout(resolve, 2000))

    setCurrentStep(5)
    setProcessing(false)
    setCompleted(true)

    await handleLLMResponse({
      message: '',
      emotion: 'triumph',
      sentiment: 'positive',
      action: 'celebrate',
      frustrationLevel: 0,
      shape: 'sun',
      gesture: 'sparkle'
    })

    setManagedTimeout(() => {
      if (mascotRef.current && mascotRef.current.express) {
        mascotRef.current.express('glow', { intensity: 0.8, duration: 2000 })
      }
    }, 500)

    setManagedTimeout(async () => {
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
    if (!mascotRef.current) return

    if (mascotRef.current.handleLLMResponse) {
      try {
        await mascotRef.current.handleLLMResponse(response)
      } catch (error) {
        console.error('Error handling LLM response:', error)
        if (mascotRef.current.setEmotion) {
          mascotRef.current.setEmotion(response.emotion, 0.8)
        }
      }
    } else {
      if (mascotRef.current.setEmotion) {
        mascotRef.current.setEmotion(response.emotion, 0.8)
      }
      if (response.shape && mascotRef.current.morphTo) {
        mascotRef.current.morphTo(response.shape, { duration: 1000 })
      }
      if (response.gesture && mascotRef.current.express) {
        setManagedTimeout(() => {
          if (mascotRef.current && mascotRef.current.express) {
            mascotRef.current.express(response.gesture, { intensity: 0.7 })
          }
        }, 300)
      }
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    // Mascot listens
    if (mascotRef.current) {
      if (mascotRef.current.setEmotion) {
        mascotRef.current.setEmotion('neutral', 0.6)
      }
      if (mascotRef.current.express) {
        mascotRef.current.express('settle', { intensity: 0.3, duration: 500 })
      }
    }

    await new Promise(resolve => setTimeout(resolve, 800))

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          context: 'retail-checkout'
        }),
      })

      if (!res.ok) throw new Error('Failed to get response')

      const data = await res.json()

      setMessages(prev => [...prev, { role: 'assistant', content: data.message }])

      // Trigger mascot reaction
      await handleLLMResponse({
        message: data.message,
        emotion: data.emotion || 'joy',
        sentiment: data.sentiment || 'positive',
        action: data.action || 'none',
        frustrationLevel: data.frustrationLevel || 0,
        shape: data.shape,
        gesture: data.gesture
      })

    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again!"
      }])

      // Show error emotion
      if (mascotRef.current && mascotRef.current.setEmotion) {
        mascotRef.current.setEmotion('surprise', 0.6)
      }
    } finally {
      setLoading(false)
    }
  }

  const total = cart.reduce((sum, item) => sum + item.price, 0)

  const examplePrompts = isMobile ? [
    "How do I scan an item?",
    "Help with payment",
    "Scanner not working"
  ] : [
    "How do I scan an item?",
    "Help with payment",
    "Do you accept coupons?",
    "Scanner not working"
  ]

  return (
    <div style={{
      position: 'relative',
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {isMobile ? (
        <>
          {!showAIHelp ? (
            /* CHECKOUT VIEW */
            <>
              <div style={{
                height: '22vh',
                minHeight: '140px',
                maxHeight: '180px',
                width: '100%',
                position: 'relative',
                background: 'rgba(0, 0, 0, 0.3)',
                borderBottom: '1px solid rgba(0, 217, 255, 0.3)'
              }}>
                <canvas
                  ref={canvasRef}
                  id="checkout-mascot"
                  style={{
                    width: '100%',
                    height: '100%',
                    filter: 'drop-shadow(0 10px 40px rgba(0, 217, 255, 0.6))',
                  }}
                />
              </div>

              <div style={{
                flex: 1,
                overflow: 'auto',
                padding: '0.75rem',
                background: 'linear-gradient(180deg, rgba(10,10,10,0.95) 0%, rgba(15,15,35,0.98) 100%)'
              }}>
                {currentStep === 0 && (
                  <div style={{ textAlign: 'center' }}>
                    <h3 style={{
                      fontSize: '1.5rem',
                      marginBottom: '0.5rem',
                      background: 'linear-gradient(135deg, #00D9FF 0%, #10B981 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: '800'
                    }}>
                      Welcome to SmartMart
                    </h3>
                    <p style={{ fontSize: '0.9rem', opacity: 0.75, marginBottom: '1.5rem', lineHeight: 1.6 }}>
                      Watch the mascot respond emotionally to your checkout
                    </p>
                    <button
                      onClick={() => setCurrentStep(1)}
                      style={{
                        width: '100%',
                        padding: '1rem',
                        fontSize: '1rem',
                        fontWeight: '700',
                        background: 'linear-gradient(135deg, #00D9FF 0%, #00A8CC 100%)',
                        color: '#0F1223',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      Start Shopping
                    </button>
                  </div>
                )}

                {currentStep === 1 && (
                  <div>
                    <h3 style={{
                      fontSize: '1.1rem',
                      marginBottom: '0.75rem',
                      background: 'linear-gradient(135deg, #00D9FF 0%, #10B981 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: '800',
                      textAlign: 'center'
                    }}>
                      Scan Items
                    </h3>

                    <div style={{
                      padding: '1rem',
                      background: 'rgba(0, 0, 0, 0.4)',
                      borderRadius: '12px',
                      border: `2px dashed ${scanning ? 'rgba(0, 217, 255, 0.6)' : 'rgba(255, 255, 255, 0.15)'}`,
                      marginBottom: '0.75rem',
                      textAlign: 'center',
                      minHeight: '100px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {scanning && currentProduct && (
                        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
                          {currentProduct.image}
                        </div>
                      )}

                      {scanError && currentProduct && (
                        <div>
                          <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#EF4444', marginBottom: '0.5rem' }}>
                            Scanning Error
                          </div>
                          <p style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '1rem' }}>
                            Mascot shows empathy! Try again.
                          </p>
                          <button
                            onClick={handleRetry}
                            style={{
                              padding: '0.75rem 1.5rem',
                              background: 'linear-gradient(135deg, #00D9FF 0%, #00A8CC 100%)',
                              color: '#0F1223',
                              border: 'none',
                              borderRadius: '10px',
                              fontSize: '0.9rem',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            Try Again
                          </button>
                        </div>
                      )}

                      {!scanning && !scanError && (
                        <>
                          <div style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '1rem' }}>
                            Watch mascot react
                          </div>
                          <button
                            onClick={handleScanProduct}
                            disabled={scanning}
                            style={{
                              padding: '1rem 2rem',
                              fontSize: '1rem',
                              fontWeight: '700',
                              background: 'linear-gradient(135deg, #00D9FF 0%, #00A8CC 100%)',
                              color: '#0F1223',
                              border: 'none',
                              borderRadius: '12px',
                              cursor: 'pointer',
                              textTransform: 'uppercase'
                            }}
                          >
                            Scan Item
                          </button>
                        </>
                      )}
                    </div>

                    {cart.length > 0 && (
                      <div style={{
                        padding: '0.75rem',
                        background: 'rgba(0, 217, 255, 0.05)',
                        borderRadius: '10px',
                        border: '1px solid rgba(0, 217, 255, 0.2)',
                        marginBottom: '0.75rem'
                      }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.75rem', color: '#00D9FF' }}>
                          CART ({cart.length})
                        </div>
                        {cart.map((item, i) => (
                          <div key={i} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '0.5rem',
                            background: 'rgba(0, 0, 0, 0.3)',
                            borderRadius: '8px',
                            marginBottom: '0.5rem',
                            fontSize: '0.85rem'
                          }}>
                            <span>{item.image} {item.name}</span>
                            <span style={{ fontWeight: '700', color: '#10B981' }}>${item.price.toFixed(2)}</span>
                          </div>
                        ))}
                        <div style={{
                          marginTop: '0.75rem',
                          paddingTop: '0.75rem',
                          borderTop: '1px solid rgba(0, 217, 255, 0.2)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '1.1rem',
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
                          padding: '0.85rem',
                          fontSize: '0.95rem',
                          fontWeight: '700',
                          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          textTransform: 'uppercase',
                          marginBottom: '0.65rem'
                        }}
                      >
                        Checkout (${total.toFixed(2)})
                      </button>
                    )}

                    <button
                      onClick={() => setShowAIHelp(true)}
                      style={{
                        width: '100%',
                        padding: '0.85rem',
                        fontSize: '0.9rem',
                        fontWeight: '700',
                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        textTransform: 'uppercase'
                      }}
                    >
                      💬 Get AI Help
                    </button>
                  </div>
                )}

                {currentStep >= 2 && currentStep <= 4 && (
                  <div style={{ textAlign: 'center' }}>
                    <h3 style={{
                      fontSize: '1.5rem',
                      marginBottom: '1rem',
                      background: 'linear-gradient(135deg, #00D9FF 0%, #10B981 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: '800'
                    }}>
                      {currentStep === 2 && 'Reviewing Order'}
                      {currentStep === 3 && 'Secure Payment'}
                      {currentStep === 4 && 'Processing...'}
                    </h3>
                    <p style={{ fontSize: '1rem', opacity: 0.75, lineHeight: 1.6 }}>
                      {currentStep === 2 && `${cart.length} items • $${total.toFixed(2)}`}
                      {currentStep === 3 && 'Encrypted & secure'}
                      {currentStep === 4 && 'Watch mascot respond...'}
                    </p>
                  </div>
                )}

                {currentStep === 5 && (
                  <div style={{ textAlign: 'center' }}>
                    <h3 style={{
                      fontSize: '2rem',
                      marginBottom: '1rem',
                      background: 'linear-gradient(135deg, #10B981 0%, #00D9FF 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: '900'
                    }}>
                      Order Complete!
                    </h3>
                    <p style={{ fontSize: '1rem', opacity: 0.85, marginBottom: '0.5rem' }}>
                      Mascot celebrates your success!
                    </p>
                    <p style={{ fontSize: '0.95rem', opacity: 0.75, marginBottom: '2rem' }}>
                      Total: <span style={{ color: '#10B981', fontWeight: '700' }}>${total.toFixed(2)}</span>
                    </p>
                    <button
                      onClick={handleReset}
                      style={{
                        width: '100%',
                        padding: '1rem',
                        fontSize: '1rem',
                        fontWeight: '700',
                        background: 'linear-gradient(135deg, #00D9FF 0%, #00A8CC 100%)',
                        color: '#0F1223',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        textTransform: 'uppercase'
                      }}
                    >
                      New Order
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* AI CHAT VIEW - SAME MASCOT! */
            <>
              {/* Mascot - SAME CANVAS */}
              <div style={{
                height: '22vh',
                minHeight: '140px',
                maxHeight: '180px',
                width: '100%',
                position: 'relative',
                background: 'rgba(0, 0, 0, 0.3)',
                borderBottom: '1px solid rgba(0, 217, 255, 0.3)'
              }}>
                <canvas
                  ref={canvasRef}
                  id="checkout-mascot"
                  style={{
                    width: '100%',
                    height: '100%',
                    filter: 'drop-shadow(0 10px 40px rgba(0, 217, 255, 0.6))',
                  }}
                />
              </div>

              {/* Header with close */}
              <div style={{
                padding: '0.75rem 1rem',
                background: 'rgba(0, 0, 0, 0.5)',
                borderBottom: '1px solid rgba(0, 217, 255, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(0, 217, 255, 0.2)',
                    border: '2px solid rgba(0, 217, 255, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem'
                  }}>
                    💬
                  </div>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#00D9FF' }}>
                      Checkout Assistant
                    </div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>
                      Claude Haiku 4.5
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowAIHelp(false)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    fontSize: '1.1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Chat messages */}
              <div style={{
                flex: 1,
                overflow: 'auto',
                padding: '1rem',
                background: 'linear-gradient(180deg, rgba(10,10,10,0.95) 0%, rgba(15,15,35,0.98) 100%)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                {messages.map((msg, i) => (
                  <div key={i} style={{
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%'
                  }}>
                    <div style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '16px',
                      background: msg.role === 'user'
                        ? 'linear-gradient(135deg, #00D9FF 0%, #00A8CC 100%)'
                        : 'rgba(0, 217, 255, 0.1)',
                      border: msg.role === 'user'
                        ? 'none'
                        : '1px solid rgba(0, 217, 255, 0.3)',
                      color: msg.role === 'user' ? '#0F1223' : 'white',
                      fontSize: '0.95rem',
                      lineHeight: 1.5
                    }}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div style={{ alignSelf: 'flex-start', maxWidth: '85%' }}>
                    <div style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '16px',
                      background: 'rgba(0, 217, 255, 0.1)',
                      border: '1px solid rgba(0, 217, 255, 0.3)',
                      color: 'white',
                      fontSize: '0.95rem'
                    }}>
                      Typing...
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Example prompts */}
              {messages.length === 1 && (
                <div style={{
                  padding: '0.5rem 1rem 1rem 1rem',
                  background: 'rgba(10,10,10,0.95)',
                  borderTop: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                  <div style={{ fontSize: '0.75rem', opacity: 0.5, marginBottom: '0.5rem' }}>
                    SUGGESTED QUESTIONS
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {examplePrompts.map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setInput(prompt)
                        }}
                        style={{
                          padding: '0.75rem',
                          background: 'rgba(0, 217, 255, 0.05)',
                          border: '1px solid rgba(0, 217, 255, 0.2)',
                          borderRadius: '10px',
                          color: 'rgba(255, 255, 255, 0.8)',
                          fontSize: '0.85rem',
                          textAlign: 'left',
                          cursor: 'pointer'
                        }}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div style={{
                padding: '1rem',
                background: 'rgba(10,10,10,0.95)',
                borderTop: '1px solid rgba(0, 217, 255, 0.3)',
                display: 'flex',
                gap: '0.75rem'
              }}>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '0.75rem 1rem',
                    background: 'rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(0, 217, 255, 0.3)',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '0.95rem',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || loading}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: input.trim() && !loading
                      ? 'linear-gradient(135deg, #00D9FF 0%, #00A8CC 100%)'
                      : 'rgba(0, 217, 255, 0.2)',
                    border: 'none',
                    borderRadius: '10px',
                    color: input.trim() && !loading ? '#0F1223' : 'rgba(255, 255, 255, 0.3)',
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    cursor: input.trim() && !loading ? 'pointer' : 'not-allowed'
                  }}
                >
                  Send
                </button>
              </div>
            </>
          )}
        </>
      ) : (
        /* DESKTOP - Three column layout */
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 500px 1fr',
          gap: '2rem',
          padding: '2rem',
          minHeight: '700px',
          alignItems: 'stretch'
        }}>
          {/* LEFT: Checkout Interface */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.05) 0%, rgba(16, 185, 129, 0.03) 100%)',
            borderRadius: '20px',
            border: '1px solid rgba(0, 217, 255, 0.2)',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            {currentStep === 0 && (
              <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h3 style={{
                  fontSize: '2rem',
                  marginBottom: '1rem',
                  background: 'linear-gradient(135deg, #00D9FF 0%, #10B981 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: '800'
                }}>
                  Welcome to SmartMart
                </h3>
                <p style={{ fontSize: '1.1rem', opacity: 0.75, marginBottom: '2rem', lineHeight: 1.6 }}>
                  Watch the mascot respond emotionally to your checkout experience
                </p>
                <button
                  onClick={() => setCurrentStep(1)}
                  style={{
                    padding: '1.25rem 2.5rem',
                    fontSize: '1.1rem',
                    fontWeight: '700',
                    background: 'linear-gradient(135deg, #00D9FF 0%, #00A8CC 100%)',
                    color: '#0F1223',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    boxShadow: '0 4px 20px rgba(0, 217, 255, 0.3)'
                  }}
                >
                  Start Shopping
                </button>
              </div>
            )}

            {currentStep === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
                <h3 style={{
                  fontSize: '1.5rem',
                  marginBottom: '0.5rem',
                  background: 'linear-gradient(135deg, #00D9FF 0%, #10B981 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: '800',
                  textAlign: 'center'
                }}>
                  Scan Items
                </h3>

                <div style={{
                  padding: '2rem',
                  background: 'rgba(0, 0, 0, 0.4)',
                  borderRadius: '16px',
                  border: `2px dashed ${scanning ? 'rgba(0, 217, 255, 0.6)' : 'rgba(255, 255, 255, 0.15)'}`,
                  minHeight: '180px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '1rem'
                }}>
                  {scanning && currentProduct && (
                    <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>
                      {currentProduct.image}
                    </div>
                  )}

                  {scanError && currentProduct && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.3rem', fontWeight: '700', color: '#EF4444', marginBottom: '0.75rem' }}>
                        Scanning Error
                      </div>
                      <p style={{ fontSize: '1rem', opacity: 0.8, marginBottom: '1.5rem' }}>
                        Mascot shows empathy! Try scanning again.
                      </p>
                      <button
                        onClick={handleRetry}
                        style={{
                          padding: '1rem 2rem',
                          background: 'linear-gradient(135deg, #00D9FF 0%, #00A8CC 100%)',
                          color: '#0F1223',
                          border: 'none',
                          borderRadius: '10px',
                          fontSize: '1rem',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        Try Again
                      </button>
                    </div>
                  )}

                  {!scanning && !scanError && (
                    <>
                      <div style={{ fontSize: '1rem', opacity: 0.7, marginBottom: '1rem' }}>
                        Watch the mascot react to each scan
                      </div>
                      <button
                        onClick={handleScanProduct}
                        disabled={scanning}
                        style={{
                          padding: '1.25rem 2.5rem',
                          fontSize: '1.1rem',
                          fontWeight: '700',
                          background: 'linear-gradient(135deg, #00D9FF 0%, #00A8CC 100%)',
                          color: '#0F1223',
                          border: 'none',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          textTransform: 'uppercase',
                          boxShadow: '0 4px 20px rgba(0, 217, 255, 0.3)'
                        }}
                      >
                        Scan Item
                      </button>
                    </>
                  )}
                </div>

                {cart.length > 0 && (
                  <div style={{
                    padding: '1.5rem',
                    background: 'rgba(0, 217, 255, 0.05)',
                    borderRadius: '12px',
                    border: '1px solid rgba(0, 217, 255, 0.2)',
                    flex: 1
                  }}>
                    <div style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem', color: '#00D9FF' }}>
                      CART ({cart.length} items)
                    </div>
                    {cart.map((item, i) => (
                      <div key={i} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '0.75rem',
                        background: 'rgba(0, 0, 0, 0.3)',
                        borderRadius: '8px',
                        marginBottom: '0.5rem',
                        fontSize: '1rem'
                      }}>
                        <span>{item.image} {item.name}</span>
                        <span style={{ fontWeight: '700', color: '#10B981' }}>${item.price.toFixed(2)}</span>
                      </div>
                    ))}
                    <div style={{
                      marginTop: '1rem',
                      paddingTop: '1rem',
                      borderTop: '1px solid rgba(0, 217, 255, 0.2)',
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
                      padding: '1.25rem',
                      fontSize: '1.1rem',
                      fontWeight: '700',
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                      boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)'
                    }}
                  >
                    Checkout (${total.toFixed(2)})
                  </button>
                )}
              </div>
            )}

            {currentStep >= 2 && currentStep <= 4 && (
              <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h3 style={{
                  fontSize: '2rem',
                  marginBottom: '1rem',
                  background: 'linear-gradient(135deg, #00D9FF 0%, #10B981 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: '800'
                }}>
                  {currentStep === 2 && 'Reviewing Order'}
                  {currentStep === 3 && 'Secure Payment'}
                  {currentStep === 4 && 'Processing...'}
                </h3>
                <p style={{ fontSize: '1.2rem', opacity: 0.75, lineHeight: 1.6 }}>
                  {currentStep === 2 && `${cart.length} items • $${total.toFixed(2)}`}
                  {currentStep === 3 && 'Encrypted & secure payment processing'}
                  {currentStep === 4 && 'Watch the mascot respond...'}
                </p>
              </div>
            )}

            {currentStep === 5 && (
              <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h3 style={{
                  fontSize: '2.5rem',
                  marginBottom: '1rem',
                  background: 'linear-gradient(135deg, #10B981 0%, #00D9FF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: '900'
                }}>
                  Order Complete!
                </h3>
                <p style={{ fontSize: '1.2rem', opacity: 0.85, marginBottom: '0.75rem' }}>
                  Mascot celebrates your success!
                </p>
                <p style={{ fontSize: '1.1rem', opacity: 0.75, marginBottom: '2rem' }}>
                  Total: <span style={{ color: '#10B981', fontWeight: '700' }}>${total.toFixed(2)}</span>
                </p>
                <button
                  onClick={handleReset}
                  style={{
                    padding: '1.25rem 2.5rem',
                    fontSize: '1.1rem',
                    fontWeight: '700',
                    background: 'linear-gradient(135deg, #00D9FF 0%, #00A8CC 100%)',
                    color: '#0F1223',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    boxShadow: '0 4px 20px rgba(0, 217, 255, 0.3)'
                  }}
                >
                  New Order
                </button>
              </div>
            )}
          </div>

          {/* CENTER: Mascot */}
          <div style={{
            height: '700px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
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

          {/* RIGHT: AI Chat */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.05) 0%, rgba(16, 185, 129, 0.03) 100%)',
            borderRadius: '20px',
            border: '1px solid rgba(0, 217, 255, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Chat Header */}
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid rgba(0, 217, 255, 0.2)',
              background: 'rgba(0, 0, 0, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'rgba(0, 217, 255, 0.2)',
                  border: '2px solid rgba(0, 217, 255, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>
                  💬
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#00D9FF' }}>
                    AI Assistant
                  </div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.6 }}>
                    Claude Haiku 4.5
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div style={{
              flex: 1,
              overflow: 'auto',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {messages.map((msg, i) => (
                <div key={i} style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%'
                }}>
                  <div style={{
                    padding: '1rem 1.25rem',
                    borderRadius: '16px',
                    background: msg.role === 'user'
                      ? 'linear-gradient(135deg, #00D9FF 0%, #00A8CC 100%)'
                      : 'rgba(0, 217, 255, 0.1)',
                    border: msg.role === 'user'
                      ? 'none'
                      : '1px solid rgba(0, 217, 255, 0.3)',
                    color: msg.role === 'user' ? '#0F1223' : 'white',
                    fontSize: '1rem',
                    lineHeight: 1.5
                  }}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ alignSelf: 'flex-start', maxWidth: '80%' }}>
                  <div style={{
                    padding: '1rem 1.25rem',
                    borderRadius: '16px',
                    background: 'rgba(0, 217, 255, 0.1)',
                    border: '1px solid rgba(0, 217, 255, 0.3)',
                    color: 'white',
                    fontSize: '1rem'
                  }}>
                    Typing...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Example prompts */}
            {messages.length === 1 && (
              <div style={{
                padding: '0 1.5rem 1rem 1.5rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
                <div style={{ fontSize: '0.75rem', opacity: 0.5, marginBottom: '0.75rem' }}>
                  SUGGESTED QUESTIONS
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {examplePrompts.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setInput(prompt)
                      }}
                      style={{
                        padding: '0.75rem',
                        background: 'rgba(0, 217, 255, 0.05)',
                        border: '1px solid rgba(0, 217, 255, 0.2)',
                        borderRadius: '10px',
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontSize: '0.9rem',
                        textAlign: 'left',
                        cursor: 'pointer'
                      }}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Input */}
            <div style={{
              padding: '1.5rem',
              borderTop: '1px solid rgba(0, 217, 255, 0.2)',
              background: 'rgba(0, 0, 0, 0.2)',
              display: 'flex',
              gap: '0.75rem'
            }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '1rem',
                  background: 'rgba(0, 0, 0, 0.5)',
                  border: '1px solid rgba(0, 217, 255, 0.3)',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '1rem',
                  outline: 'none'
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || loading}
                style={{
                  padding: '1rem 2rem',
                  background: input.trim() && !loading
                    ? 'linear-gradient(135deg, #00D9FF 0%, #00A8CC 100%)'
                    : 'rgba(0, 217, 255, 0.2)',
                  border: 'none',
                  borderRadius: '10px',
                  color: input.trim() && !loading ? '#0F1223' : 'rgba(255, 255, 255, 0.3)',
                  fontSize: '1rem',
                  fontWeight: '700',
                  cursor: input.trim() && !loading ? 'pointer' : 'not-allowed'
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
