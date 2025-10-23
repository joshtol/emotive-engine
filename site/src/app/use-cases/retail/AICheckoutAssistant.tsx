'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  emotion?: string
  sentiment?: string
}

interface LLMResponse {
  message: string
  emotion: string
  sentiment: string
  action: string
  frustrationLevel: number
  shape?: string
  gesture?: string
}

interface AICheckoutAssistantProps {
  onLLMResponse?: (response: LLMResponse) => void
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

export default function AICheckoutAssistant({ onLLMResponse }: AICheckoutAssistantProps) {
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
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile
  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Auto-scroll disabled - let user control viewport
  // useEffect(() => {
  //   if (messagesContainerRef.current) {
  //     messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
  //   }
  // }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    // Notify parent that user is talking
    if (onLLMResponse) {
      onLLMResponse({
        message: '',
        emotion: 'neutral',
        sentiment: 'neutral',
        action: 'listen',
        frustrationLevel: 20,
        gesture: 'settle'
      })
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

      // Notify parent component to update mascot with full LLM response
      if (onLLMResponse) {
        onLLMResponse(data)
      }

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

      // Notify parent component with full LLM response
      if (onLLMResponse) {
        onLLMResponse(fallback)
      }
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
      width: '100%',
      minHeight: '650px'
    }}>
      {/* Premium Slate Glass Interface */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'transparent',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Top glass reflection */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '200px',
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 1
        }} />

        {/* Ambient glow particles */}
        <div style={{
          position: 'absolute',
          top: '10%',
          right: '15%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(0, 217, 255, 0.08) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          animation: 'float 8s ease-in-out infinite',
          zIndex: 0
        }} />
        <div style={{
          position: 'absolute',
          bottom: '20%',
          left: '10%',
          width: '250px',
          height: '250px',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.06) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          animation: 'float 10s ease-in-out infinite reverse',
          zIndex: 0
        }} />

        {/* Ultra-Premium Header */}
        <div style={{
          padding: '2.5rem 2.5rem 2rem 2.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.02) 0%, transparent 100%)',
          position: 'relative',
          zIndex: 2
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem'
          }}>
            {/* Premium icon with gradient border */}
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)',
              border: '1px solid rgba(0, 217, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.75rem',
              boxShadow: '0 8px 32px rgba(0, 217, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Shine effect */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
                animation: 'shine 3s ease-in-out infinite'
              }} />
              💬
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{
                fontSize: '1.75rem',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #00D9FF 0%, #10B981 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                margin: 0,
                lineHeight: 1.2,
                letterSpacing: '-0.03em',
                textShadow: '0 0 40px rgba(0, 217, 255, 0.3)'
              }}>
                AI Assistant
              </h3>
              <p style={{
                fontSize: '0.875rem',
                color: 'rgba(255, 255, 255, 0.4)',
                margin: '0.375rem 0 0 0',
                fontWeight: '500',
                letterSpacing: '0.3px'
              }}>
                Powered by Claude Haiku 4.5
              </p>
            </div>
            {/* Status indicator */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: 'rgba(16, 185, 129, 0.1)',
              borderRadius: '100px',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}>
              <div style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#10B981',
                boxShadow: '0 0 12px rgba(16, 185, 129, 0.8)',
                animation: 'pulse 2s ease-in-out infinite'
              }} />
              <span style={{
                fontSize: '0.75rem',
                fontWeight: '600',
                color: 'rgba(16, 185, 129, 0.9)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Online
              </span>
            </div>
          </div>
        </div>

        {/* Messages - Premium Glass Bubbles */}
        <div ref={messagesContainerRef} style={{
          flex: 1,
          overflowY: 'auto',
          padding: '2rem 2.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          position: 'relative',
          zIndex: 2
        }}>
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                animation: 'slideInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <div style={{
                maxWidth: '70%',
                padding: '1rem 1.375rem',
                background: msg.role === 'user'
                  ? 'linear-gradient(135deg, rgba(0, 217, 255, 0.2) 0%, rgba(16, 185, 129, 0.15) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)',                borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                border: msg.role === 'user'
                  ? '1px solid rgba(0, 217, 255, 0.2)'
                  : '1px solid rgba(255, 255, 255, 0.06)',
                boxShadow: msg.role === 'user'
                  ? `0 8px 32px rgba(0, 217, 255, 0.15),
                     inset 0 1px 0 rgba(255, 255, 255, 0.1),
                     inset 0 0 20px rgba(0, 217, 255, 0.05)`
                  : `0 8px 32px rgba(0, 0, 0, 0.2),
                     inset 0 1px 0 rgba(255, 255, 255, 0.03)`,
                color: 'white',
                fontSize: '0.9375rem',
                lineHeight: '1.6',
                fontWeight: msg.role === 'user' ? '500' : '400',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Subtle inner glow for user messages */}
                {msg.role === 'user' && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.1) 0%, transparent 100%)',
                    pointerEvents: 'none'
                  }} />
                )}
                <div style={{ position: 'relative', zIndex: 1 }}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div style={{
              display: 'flex',
              justifyContent: 'flex-start'
            }}>
              <div style={{
                padding: '1.125rem 1.5rem',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.02) 100%)',                borderRadius: '20px 20px 20px 4px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
                display: 'flex',
                gap: '0.625rem'
              }}>
                <div className="typing-dot" />
                <div className="typing-dot" style={{ animationDelay: '0.2s' }} />
                <div className="typing-dot" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Example Prompts - Premium Glass Pills */}
        {messages.length <= 1 && (
          <div style={{
            padding: '0 2.5rem 1.5rem 2.5rem',
            position: 'relative',
            zIndex: 2
          }}>
            <div style={{
              fontSize: '0.75rem',
              opacity: 0.4,
              marginBottom: '0.875rem',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontWeight: '600'
            }}>
              Suggested Questions
            </div>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.625rem'
            }}>
              {examplePrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => setInput(prompt)}
                  style={{
                    padding: '0.75rem 1.25rem',
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)',                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '100px',
                    color: 'rgba(255, 255, 255, 0.85)',
                    fontSize: '0.8125rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 217, 255, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)'
                    e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.3)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 217, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)'
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.03)'
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Premium Glass Input Bar */}
        <div style={{
          padding: '2rem 2.5rem 2.5rem 2.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.04)',
          background: 'linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.2) 100%)',
          position: 'relative',
          zIndex: 2
        }}>
          <div style={{
            display: 'flex',
            gap: '0.875rem',
            alignItems: 'center',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)',            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '0.5rem',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
          }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              disabled={loading}
              style={{
                flex: 1,
                padding: '0.875rem 1.25rem',
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '0.9375rem',
                fontWeight: '400',
                outline: 'none',
                caretColor: '#00D9FF'
              }}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              style={{
                padding: '0.875rem 1.75rem',
                background: loading || !input.trim()
                  ? 'linear-gradient(135deg, rgba(0, 217, 255, 0.2) 0%, rgba(16, 185, 129, 0.15) 100%)'
                  : 'linear-gradient(135deg, rgba(0, 217, 255, 0.4) 0%, rgba(16, 185, 129, 0.3) 100%)',                border: loading || !input.trim()
                  ? '1px solid rgba(0, 217, 255, 0.15)'
                  : '1px solid rgba(0, 217, 255, 0.3)',
                borderRadius: '16px',
                color: loading || !input.trim() ? 'rgba(255, 255, 255, 0.4)' : 'white',
                fontSize: '0.9375rem',
                fontWeight: '600',
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: loading || !input.trim() ? 0.5 : 1,
                boxShadow: loading || !input.trim()
                  ? 'none'
                  : '0 4px 20px rgba(0, 217, 255, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                if (!loading && input.trim()) {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 217, 255, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 217, 255, 0.5) 0%, rgba(16, 185, 129, 0.4) 100%)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 217, 255, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 217, 255, 0.4) 0%, rgba(16, 185, 129, 0.3) 100%)'
              }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>Sending</span>
                  <span style={{ animation: 'ellipsis 1.5s infinite' }}>...</span>
                </span>
              ) : (
                'Send'
              )}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(10px, -10px);
          }
        }

        @keyframes shine {
          0% {
            left: -100%;
          }
          50%, 100% {
            left: 100%;
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            box-shadow: 0 0 12px rgba(16, 185, 129, 0.8);
          }
          50% {
            opacity: 0.6;
            box-shadow: 0 0 20px rgba(16, 185, 129, 1);
          }
        }

        .typing-dot {
          width: 7px;
          height: 7px;
          background: linear-gradient(135deg, rgba(0, 217, 255, 0.8) 0%, rgba(16, 185, 129, 0.6) 100%);
          border-radius: 50%;
          animation: typingDot 1.4s infinite;
          box-shadow: 0 0 8px rgba(0, 217, 255, 0.4);
        }

        @keyframes typingDot {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.3;
          }
          30% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }

        @keyframes ellipsis {
          0% {
            content: '';
          }
          25% {
            content: '.';
          }
          50% {
            content: '..';
          }
          75%, 100% {
            content: '...';
          }
        }

        /* Custom scrollbar for premium feel */
        div::-webkit-scrollbar {
          width: 6px;
        }

        div::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }

        div::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(0, 217, 255, 0.4) 0%, rgba(16, 185, 129, 0.3) 100%);
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        div::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgba(0, 217, 255, 0.6) 0%, rgba(16, 185, 129, 0.5) 100%);
        }

        input::placeholder {
          color: rgba(255, 255, 255, 0.3);
          font-weight: 400;
        }
      `}</style>
    </div>
  )
}
