'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  emotion?: string
  sentiment?: string
}

interface AICheckoutAssistantProps {
  onEmotionChange?: (emotion: string, gesture: string) => void
}

// Demo mode fallback responses
const DEMO_RESPONSES: Record<string, any> = {
  'scan': {
    message: "To scan an item, hold the barcode 6-8 inches from the scanner until you hear a beep. The red laser should cover the entire barcode.",
    emotion: 'calm',
    sentiment: 'neutral',
    action: 'guide',
    frustrationLevel: 15
  },
  'coupon': {
    message: "After scanning your items, select 'Apply Coupon' on the payment screen. You can scan paper coupons or enter digital codes. Need help with a specific coupon?",
    emotion: 'joy',
    sentiment: 'positive',
    action: 'guide',
    frustrationLevel: 10
  },
  'payment': {
    message: "We accept credit cards, debit cards, mobile payments (Apple Pay, Google Pay), cash, and EBT. Just tap or insert your card when prompted!",
    emotion: 'calm',
    sentiment: 'neutral',
    action: 'guide',
    frustrationLevel: 5
  },
  'help': {
    message: "I'm here to help! An attendant has been notified and will be with you shortly. In the meantime, I can answer questions about scanning, coupons, or payment.",
    emotion: 'empathy',
    sentiment: 'positive',
    action: 'offer_help',
    frustrationLevel: 40
  },
  'frustrated': {
    message: "I completely understand your frustration! Let me get you some immediate help. What's giving you trouble right now?",
    emotion: 'empathy',
    sentiment: 'negative',
    action: 'offer_help',
    frustrationLevel: 80
  },
  'thanks': {
    message: "You're so welcome! I'm thrilled I could help. Have a wonderful day and thanks for shopping with us!",
    emotion: 'joy',
    sentiment: 'positive',
    action: 'celebrate',
    frustrationLevel: 0
  }
}

function getDemoResponse(userMessage: string): any {
  const msg = userMessage.toLowerCase()

  if (msg.includes('thank') || msg.includes('thanks')) return DEMO_RESPONSES.thanks
  if (msg.includes('frustrat') || msg.includes('forever') || msg.includes('slow')) return DEMO_RESPONSES.frustrated
  if (msg.includes('help') || msg.includes('assistant') || msg.includes('attendant')) return DEMO_RESPONSES.help
  if (msg.includes('scan')) return DEMO_RESPONSES.scan
  if (msg.includes('coupon') || msg.includes('discount')) return DEMO_RESPONSES.coupon
  if (msg.includes('pay') || msg.includes('card') || msg.includes('cash')) return DEMO_RESPONSES.payment

  // Default friendly response
  return {
    message: "I'd be happy to help! Try asking about scanning items, applying coupons, payment methods, or requesting assistance.",
    emotion: 'calm',
    sentiment: 'neutral',
    action: 'guide',
    frustrationLevel: 20
  }
}

export default function AICheckoutAssistant({ onEmotionChange }: AICheckoutAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your checkout assistant. How can I help you today?",
      emotion: 'joy',
      sentiment: 'positive'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [frustrationLevel, setFrustrationLevel] = useState(0)
  const [demoMode, setDemoMode] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mascotRef = useRef<any>(null)
  const [isMobile, setIsMobile] = useState(false)

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
        // Wait for EmotiveMascot to load
        let attempts = 0
        while (!(window as any).EmotiveMascot && attempts < 50) {
          await new Promise(resolve => setTimeout(resolve, 100))
          attempts++
        }

        const EmotiveMascot = (window as any).EmotiveMascot?.default || (window as any).EmotiveMascot
        if (!EmotiveMascot) {
          console.error('EmotiveMascot not found')
          return
        }

        const canvas = canvasRef.current
        if (!canvas) return

        // Set canvas dimensions
        const rect = canvas.getBoundingClientRect()
        const dpr = window.devicePixelRatio || 1
        canvas.setAttribute('width', Math.round(rect.width * dpr).toString())
        canvas.setAttribute('height', Math.round(rect.height * dpr).toString())

        const mascot = new EmotiveMascot({
          canvasId: 'assistant-mascot',
          enableAudio: false,
          soundEnabled: false,
          defaultEmotion: 'joy',
          enableGazeTracking: true,
          enableIdleBehaviors: true,
          targetFPS: isMobile ? 30 : 60,
          maxParticles: isMobile ? 50 : 100,
          transitionDuration: 400,
          emotionTransitionSpeed: 300,
          // Walmart-themed colors
          primaryColor: '#0071CE',  // Walmart blue
          secondaryColor: '#FCBA03', // Walmart yellow
        })

        await mascot.init(canvas)
        mascot.start()

        // Position mascot centered in kiosk screen
        mascot.setPosition(0, -20, 0)

        // Scale for kiosk terminal context
        mascot.setScale({
          core: isMobile ? 0.5 : 0.7,
          particles: isMobile ? 0.8 : 1.2
        })

        // Enable backdrop with Walmart blue theme
        mascot.setBackdrop({
          enabled: true,
          radius: 3.2,
          intensity: 0.75,
          blendMode: 'normal',
          falloff: 'smooth',
          edgeSoftness: 0.95,
          coreTransparency: 0.35,
          responsive: true,
          color: '#0071CE'  // Walmart blue backdrop
        })

        mascotRef.current = mascot

        // Initial greeting gesture
        setTimeout(() => {
          if (mascot.express) {
            mascot.express('wave')
          }
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

  // Update mascot emotion using Semantic Performance API
  const updateMascotEmotion = async (emotion: string, action: string, frustration: number) => {
    if (!mascotRef.current || !mascotRef.current.perform) return

    // Map action to semantic performance
    const performanceMap: Record<string, string> = {
      'guide': 'guiding',
      'offer_help': frustration > 60 ? 'offering_urgent_help' : 'offering_help',
      'celebrate': frustration < 20 ? 'celebrating_epic' : 'celebrating'
    }

    const performance = performanceMap[action] || 'responding_neutral'

    // Update context and perform semantic action
    await mascotRef.current.perform?.(performance, {
      context: {
        frustration,
        urgency: frustration > 60 ? 'high' : frustration > 30 ? 'medium' : 'low',
        magnitude: frustration < 20 ? 'epic' : frustration > 60 ? 'major' : 'moderate'
      }
    })

    // Notify parent component with simple emotion fallback
    if (onEmotionChange) {
      onEmotionChange(emotion, action)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    // Set mascot to "listening" state using semantic performance
    if (mascotRef.current && mascotRef.current.perform) {
      await mascotRef.current.perform('listening')
    }

    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 800))

    try {
      let data

      // Try API first
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userMessage,
            context: 'checkout'
          }),
        })

        if (res.status === 429) {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: 'Please wait a moment before sending another message.',
            emotion: 'calm',
            sentiment: 'neutral'
          }])
          setLoading(false)
          return
        }

        if (res.ok) {
          const apiData = await res.json()
          if (!apiData.error) {
            data = apiData
          }
        }
      } catch (apiError) {
        console.log('API unavailable, using demo mode')
      }

      // Fallback to demo mode if API fails
      if (!data) {
        setDemoMode(true)
        data = getDemoResponse(userMessage)
      }

      // Add AI message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message,
        emotion: data.emotion,
        sentiment: data.sentiment
      }])

      // Update frustration level
      setFrustrationLevel(data.frustrationLevel || 0)

      // Update mascot based on AI's emotion detection
      updateMascotEmotion(data.emotion, data.action, data.frustrationLevel || 0)

    } catch (error) {
      console.error('Chat error:', error)

      // Final fallback
      const fallback = getDemoResponse(userMessage)
      setDemoMode(true)

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: fallback.message,
        emotion: fallback.emotion,
        sentiment: fallback.sentiment
      }])

      setFrustrationLevel(fallback.frustrationLevel)
      updateMascotEmotion(fallback.emotion, fallback.action, fallback.frustrationLevel)
    } finally {
      setLoading(false)
    }
  }

  // Example prompts
  const examplePrompts = [
    "Help me scan an item",
    "How do I use a coupon?",
    "What payment do you accept?",
    "I need assistance",
  ]

  return (
    <div style={{
      position: 'relative',
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 400px',
      gap: '1.5rem',
      alignItems: 'start',
      minHeight: '650px'
    }}>
      {/* Chat Interface - Walmart Blue Theme */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '650px',
        background: 'linear-gradient(180deg, rgba(0, 113, 206, 0.05) 0%, rgba(252, 186, 3, 0.03) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '16px',
        border: '2px solid rgba(0, 113, 206, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Kiosk-Style Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '2px solid rgba(0, 113, 206, 0.3)',
          background: 'linear-gradient(180deg, rgba(0, 113, 206, 0.15) 0%, rgba(0, 113, 206, 0.05) 100%)',
          position: 'relative'
        }}>
          {/* Status Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.75rem',
            fontSize: '0.7rem',
            opacity: 0.6,
            textTransform: 'uppercase',
            letterSpacing: '0.8px'
          }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span style={{ color: '#10B981' }}>● ONLINE</span>
              {demoMode && <span style={{ color: '#FCBA03' }}>⚠ DEMO MODE</span>}
            </div>
            <div>STATION 04</div>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '0.25rem'
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  background: 'linear-gradient(135deg, #0071CE 0%, #004C91 100%)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  boxShadow: '0 2px 8px rgba(0, 113, 206, 0.3)'
                }}>
                  🤖
                </div>
                <div>
                  <h3 style={{
                    fontSize: '1.15rem',
                    fontWeight: '700',
                    color: '#0071CE',
                    marginBottom: '0.15rem',
                    letterSpacing: '-0.01em'
                  }}>
                    Self-Checkout Assistant
                  </h3>
                  <p style={{
                    fontSize: '0.75rem',
                    opacity: 0.7,
                    margin: 0
                  }}>
                    {demoMode ? 'Demo Mode • Smart Responses' : 'Powered by Claude AI'}
                  </p>
                </div>
              </div>
            </div>

            {/* Customer Sentiment Monitor */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: '0.35rem'
            }}>
              <div style={{
                fontSize: '0.7rem',
                opacity: 0.6,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Customer Sentiment
              </div>
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'center'
              }}>
                <div style={{
                  width: '90px',
                  height: '5px',
                  background: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div style={{
                    width: `${Math.max(100 - frustrationLevel, 0)}%`,
                    height: '100%',
                    background: frustrationLevel > 60
                      ? 'linear-gradient(90deg, #EF4444, #DC2626)'
                      : frustrationLevel > 30
                      ? 'linear-gradient(90deg, #FCBA03, #F59E0B)'
                      : 'linear-gradient(90deg, #10B981, #059669)',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
                <span style={{
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                  background: frustrationLevel > 60
                    ? 'rgba(239, 68, 68, 0.2)'
                    : frustrationLevel > 30
                    ? 'rgba(252, 186, 3, 0.2)'
                    : 'rgba(16, 185, 129, 0.2)',
                  color: frustrationLevel > 60 ? '#EF4444' : frustrationLevel > 30 ? '#FCBA03' : '#10B981',
                  border: `1px solid ${frustrationLevel > 60 ? '#EF4444' : frustrationLevel > 30 ? '#FCBA03' : '#10B981'}40`
                }}>
                  {frustrationLevel > 60 ? 'NEEDS HELP' : frustrationLevel > 30 ? 'NEUTRAL' : 'POSITIVE'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                animation: 'slideInUp 0.3s ease-out'
              }}
            >
              <div style={{
                maxWidth: '75%',
                padding: '1rem 1.25rem',
                background: msg.role === 'user'
                  ? 'linear-gradient(135deg, rgba(221, 74, 154, 0.3) 0%, rgba(255, 107, 157, 0.2) 100%)'
                  : 'rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                border: `1px solid ${msg.role === 'user' ? 'rgba(221, 74, 154, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                color: 'white',
                fontSize: '0.95rem',
                lineHeight: '1.5'
              }}>
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{
              display: 'flex',
              justifyContent: 'flex-start'
            }}>
              <div style={{
                padding: '1rem 1.25rem',
                background: 'rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                borderRadius: '20px 20px 20px 4px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                gap: '0.5rem'
              }}>
                <div className="typing-dot" />
                <div className="typing-dot" style={{ animationDelay: '0.2s' }} />
                <div className="typing-dot" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Example prompts */}
        {messages.length <= 1 && (
          <div style={{
            padding: '0 1.5rem 1rem 1.5rem'
          }}>
            <div style={{
              fontSize: '0.8rem',
              opacity: 0.6,
              marginBottom: '0.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Try asking:
            </div>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              {examplePrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => setInput(prompt)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'rgba(221, 74, 154, 0.15)',
                    border: '1px solid rgba(221, 74, 154, 0.3)',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(221, 74, 154, 0.25)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(221, 74, 154, 0.15)'
                    e.currentTarget.style.transform = 'translateY(0)'
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
          padding: '1.5rem',
          borderTop: '1px solid rgba(221, 74, 154, 0.2)',
          background: 'rgba(0, 0, 0, 0.2)'
        }}>
          <div style={{
            display: 'flex',
            gap: '0.75rem'
          }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything about checkout..."
              disabled={loading}
              style={{
                flex: 1,
                padding: '1rem 1.25rem',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(221, 74, 154, 0.3)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.4)'
                e.currentTarget.style.borderColor = 'rgba(221, 74, 154, 0.5)'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(221, 74, 154, 0.1)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)'
                e.currentTarget.style.borderColor = 'rgba(221, 74, 154, 0.3)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              style={{
                padding: '1rem 1.75rem',
                background: loading || !input.trim()
                  ? 'rgba(221, 74, 154, 0.2)'
                  : 'linear-gradient(135deg, #DD4A9A 0%, #C44569 100%)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '0.95rem',
                fontWeight: '600',
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                opacity: loading || !input.trim() ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!loading && input.trim()) {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(221, 74, 154, 0.4)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {loading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>

      {/* Walmart-Style Checkout Kiosk */}
      {!isMobile && (
        <div style={{
          position: 'relative',
          height: '650px',
          background: 'linear-gradient(180deg, rgba(0, 113, 206, 0.08) 0%, rgba(20, 20, 20, 0.95) 100%)',
          borderRadius: '16px',
          border: '2px solid rgba(0, 113, 206, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Kiosk Header */}
          <div style={{
            padding: '1rem 1.25rem',
            background: 'linear-gradient(180deg, rgba(0, 113, 206, 0.2) 0%, rgba(0, 113, 206, 0.08) 100%)',
            borderBottom: '2px solid rgba(0, 113, 206, 0.3)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              opacity: 0.7,
              fontWeight: '600'
            }}>
              AI Visual Assistant
            </div>
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center'
            }}>
              <div style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#10B981',
                boxShadow: '0 0 8px #10B981',
                animation: 'pulse 2s ease-in-out infinite'
              }} />
              <span style={{
                fontSize: '0.7rem',
                color: '#10B981',
                fontWeight: '600'
              }}>ACTIVE</span>
            </div>
          </div>

          {/* Kiosk Screen Area */}
          <div style={{
            flex: 1,
            position: 'relative',
            background: 'linear-gradient(135deg, rgba(0, 113, 206, 0.03) 0%, rgba(0, 0, 0, 0.6) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            overflow: 'hidden'
          }}>
            {/* Terminal Background Pattern */}
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `
                linear-gradient(rgba(0, 113, 206, 0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 113, 206, 0.03) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px',
              opacity: 0.3,
              pointerEvents: 'none'
            }} />

            {/* Mascot Canvas */}
            <div style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <canvas
                ref={canvasRef}
                id="assistant-mascot"
                style={{
                  width: '100%',
                  height: '100%',
                  filter: 'drop-shadow(0 0 30px rgba(0, 113, 206, 0.4)) drop-shadow(0 10px 40px rgba(252, 186, 3, 0.2))',
                }}
              />
            </div>

            {/* Corner Accents */}
            <div style={{
              position: 'absolute',
              top: '1rem',
              left: '1rem',
              width: '40px',
              height: '40px',
              borderTop: '3px solid rgba(0, 113, 206, 0.4)',
              borderLeft: '3px solid rgba(0, 113, 206, 0.4)',
              borderRadius: '4px 0 0 0'
            }} />
            <div style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              width: '40px',
              height: '40px',
              borderTop: '3px solid rgba(0, 113, 206, 0.4)',
              borderRight: '3px solid rgba(0, 113, 206, 0.4)',
              borderRadius: '0 4px 0 0'
            }} />
            <div style={{
              position: 'absolute',
              bottom: '1rem',
              left: '1rem',
              width: '40px',
              height: '40px',
              borderBottom: '3px solid rgba(252, 186, 3, 0.4)',
              borderLeft: '3px solid rgba(252, 186, 3, 0.4)',
              borderRadius: '0 0 0 4px'
            }} />
            <div style={{
              position: 'absolute',
              bottom: '1rem',
              right: '1rem',
              width: '40px',
              height: '40px',
              borderBottom: '3px solid rgba(252, 186, 3, 0.4)',
              borderRight: '3px solid rgba(252, 186, 3, 0.4)',
              borderRadius: '0 0 4px 0'
            }} />
          </div>

          {/* Kiosk Footer - Payment Icons */}
          <div style={{
            padding: '1rem 1.25rem',
            background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 113, 206, 0.1) 100%)',
            borderTop: '2px solid rgba(0, 113, 206, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.7rem',
              opacity: 0.7
            }}>
              <span>PAYMENT METHODS</span>
              <span>📱 💳 💵</span>
            </div>
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '0.5rem',
              background: 'rgba(0, 113, 206, 0.1)',
              borderRadius: '6px',
              border: '1px solid rgba(0, 113, 206, 0.2)'
            }}>
              <div style={{
                fontSize: '1.5rem',
                filter: 'grayscale(0.3)'
              }}>🤖</div>
              <div style={{
                flex: 1,
                fontSize: '0.75rem',
                lineHeight: '1.3'
              }}>
                <div style={{ fontWeight: '600', color: '#0071CE' }}>Emotion-Aware AI</div>
                <div style={{ opacity: 0.7, fontSize: '0.7rem' }}>Responds to your sentiment in real-time</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .typing-dot {
          width: 8px;
          height: 8px;
          background: rgba(221, 74, 154, 0.6);
          border-radius: 50%;
          animation: typingDot 1.4s infinite;
        }

        @keyframes typingDot {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.4;
          }
          30% {
            transform: translateY(-8px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
