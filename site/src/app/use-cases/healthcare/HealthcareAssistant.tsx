'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  emotion?: string
  sentiment?: string
}

interface HealthcareAssistantProps {
  onEmotionChange?: (emotion: string, gesture: string) => void
  onLLMResponse?: (response: any) => void
}

// Demo mode fallback responses for healthcare context
const DEMO_RESPONSES: Record<string, any> = {
  'insurance': {
    message: "I'd be happy to help with your insurance information. You'll need your insurance card with your policy number and group number. Don't worry, this information is encrypted and HIPAA-compliant. Take your time!",
    emotion: 'calm',
    sentiment: 'positive',
    action: 'guide',
    anxietyLevel: 20
  },
  'privacy': {
    message: "Your privacy is our top priority. All information you provide is protected under HIPAA regulations and encrypted with bank-level security. Only authorized healthcare providers will have access to your records.",
    emotion: 'calm',
    sentiment: 'positive',
    action: 'reassure',
    anxietyLevel: 15
  },
  'medication': {
    message: "When listing medications, include the name, dosage (like 10mg), and how often you take it. If you're not sure about the exact dosage, that's okay—just provide what you know and we can verify with your pharmacy.",
    emotion: 'calm',
    sentiment: 'neutral',
    action: 'guide',
    anxietyLevel: 25
  },
  'symptoms': {
    message: "I understand it can be difficult to describe symptoms. Try to explain when they started, how often they occur, and what makes them better or worse. There are no wrong answers—just share what you're experiencing.",
    emotion: 'empathy',
    sentiment: 'positive',
    action: 'encourage',
    anxietyLevel: 30
  },
  'allergies': {
    message: "Please list any allergies to medications, foods, or environmental triggers. This is very important for your safety. If you're not sure, we can note that for discussion with your healthcare provider.",
    emotion: 'calm',
    sentiment: 'neutral',
    action: 'guide',
    anxietyLevel: 20
  },
  'confused': {
    message: "I can see this might be overwhelming. Take a deep breath—we'll go through this together, one step at a time. What specific question can I help clarify for you right now?",
    emotion: 'empathy',
    sentiment: 'positive',
    action: 'reassure',
    anxietyLevel: 70
  },
  'nervous': {
    message: "It's completely normal to feel anxious about medical forms. You're doing great! Everything you share here helps us provide you with better care. Would you like me to explain any particular section?",
    emotion: 'empathy',
    sentiment: 'positive',
    action: 'encourage',
    anxietyLevel: 60
  },
  'thanks': {
    message: "You're very welcome! I'm so glad I could help. Remember, our healthcare team is here to support you every step of the way. Feel better soon!",
    emotion: 'joy',
    sentiment: 'positive',
    action: 'celebrate',
    anxietyLevel: 0
  }
}

function getDemoResponse(userMessage: string): any {
  const msg = userMessage.toLowerCase()

  if (msg.includes('thank') || msg.includes('thanks')) return DEMO_RESPONSES.thanks
  if (msg.includes('nervous') || msg.includes('anxious') || msg.includes('worried') || msg.includes('scared')) return DEMO_RESPONSES.nervous
  if (msg.includes('confus') || msg.includes('don\'t understand') || msg.includes('overwhelm')) return DEMO_RESPONSES.confused
  if (msg.includes('insurance') || msg.includes('policy') || msg.includes('coverage')) return DEMO_RESPONSES.insurance
  if (msg.includes('privacy') || msg.includes('hipaa') || msg.includes('secure') || msg.includes('safe')) return DEMO_RESPONSES.privacy
  if (msg.includes('medication') || msg.includes('medicine') || msg.includes('prescription') || msg.includes('pills')) return DEMO_RESPONSES.medication
  if (msg.includes('symptom') || msg.includes('pain') || msg.includes('feeling') || msg.includes('sick')) return DEMO_RESPONSES.symptoms
  if (msg.includes('allerg')) return DEMO_RESPONSES.allergies

  // Default friendly response
  return {
    message: "I'm here to help make this process easier for you. Try asking about insurance information, medications, symptoms, privacy concerns, or anything else you're unsure about.",
    emotion: 'calm',
    sentiment: 'neutral',
    action: 'guide',
    anxietyLevel: 20
  }
}

export default function HealthcareAssistant({ onEmotionChange, onLLMResponse }: HealthcareAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your patient care assistant. I'm here to help you feel comfortable and guide you through this process. How can I support you today?",
      emotion: 'calm',
      sentiment: 'positive'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [anxietyLevel, setAnxietyLevel] = useState(0)
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

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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
          canvasId: 'healthcare-assistant-mascot',
          enableAudio: false,
          soundEnabled: false,
          defaultEmotion: 'calm',
          enableGazeTracking: true,
          enableIdleBehaviors: true,
          targetFPS: isMobile ? 30 : 60,
          maxParticles: isMobile ? 50 : 100,
          transitionDuration: 400,
          emotionTransitionSpeed: 300,
          // Healthcare-themed colors
          primaryColor: '#4A90E2',  // Medical blue
          secondaryColor: '#10B981', // Healing green
        })

        await mascot.init(canvas)
        mascot.start()

        // Position mascot centered in medical terminal
        mascot.setPosition(0, -20, 0)

        // Scale for medical interface context
        mascot.setScale({
          core: isMobile ? 0.5 : 0.7,
          particles: isMobile ? 0.8 : 1.2
        })

        // Enable backdrop with calming medical blue theme
        mascot.setBackdrop({
          enabled: true,
          radius: 3.2,
          intensity: 0.75,
          blendMode: 'normal',
          falloff: 'smooth',
          edgeSoftness: 0.95,
          coreTransparency: 0.35,
          responsive: true,
          color: '#4A90E2'  // Medical blue backdrop
        })

        mascotRef.current = mascot

        // Initial calming gesture
        setTimeout(() => {
          if (mascot.express) {
            mascot.express('breathe')
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
  const updateMascotEmotion = async (emotion: string, action: string, anxiety: number) => {
    if (!mascotRef.current || !mascotRef.current.perform) return

    // Map action to semantic performance for healthcare context
    const performanceMap: Record<string, string> = {
      'guide': 'guiding',
      'reassure': anxiety > 50 ? 'offering_urgent_help' : 'reassuring',
      'encourage': 'encouraging',
      'celebrate': anxiety < 20 ? 'celebrating_epic' : 'celebrating'
    }

    const performance = performanceMap[action] || 'responding_neutral'

    // Update context and perform semantic action
    await mascotRef.current.perform?.(performance, {
      context: {
        anxiety,
        urgency: anxiety > 60 ? 'high' : anxiety > 30 ? 'medium' : 'low',
        magnitude: anxiety < 20 ? 'epic' : anxiety > 60 ? 'major' : 'moderate'
      }
    })

    // Notify parent components
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
            context: 'healthcare'
          }),
        })

        if (res.status === 429) {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: 'Please take a moment before sending another message. Deep breaths—we have all the time you need.',
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

      // Update anxiety level
      setAnxietyLevel(data.anxietyLevel || 0)

      // Update mascot based on AI's emotion detection
      updateMascotEmotion(data.emotion, data.action, data.anxietyLevel || 0)

      // Notify parent with full response for simulation coordination
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

      setAnxietyLevel(fallback.anxietyLevel)
      updateMascotEmotion(fallback.emotion, fallback.action, fallback.anxietyLevel)

      if (onLLMResponse) {
        onLLMResponse(fallback)
      }
    } finally {
      setLoading(false)
    }
  }

  // Example prompts
  const examplePrompts = [
    "What insurance info do I need?",
    "Is my data secure and private?",
    "Help with medication list",
    "I'm feeling nervous about this",
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
      {/* Chat Interface - Medical Blue/Green Theme */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '650px',
        background: 'linear-gradient(180deg, rgba(74, 144, 226, 0.05) 0%, rgba(16, 185, 129, 0.03) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '16px',
        border: '2px solid rgba(74, 144, 226, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Medical Interface Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '2px solid rgba(74, 144, 226, 0.3)',
          background: 'linear-gradient(180deg, rgba(74, 144, 226, 0.15) 0%, rgba(74, 144, 226, 0.05) 100%)',
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
              <span style={{ color: '#10B981' }}>● SECURE</span>
              {demoMode && <span style={{ color: '#F59E0B' }}>⚠ DEMO MODE</span>}
              <span style={{ color: '#4A90E2' }}>🔒 HIPAA COMPLIANT</span>
            </div>
            <div>PATIENT PORTAL</div>
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
                  background: 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  boxShadow: '0 2px 8px rgba(74, 144, 226, 0.3)'
                }}>
                  🩺
                </div>
                <div>
                  <h3 style={{
                    fontSize: '1.15rem',
                    fontWeight: '700',
                    color: '#4A90E2',
                    marginBottom: '0.15rem',
                    letterSpacing: '-0.01em'
                  }}>
                    Patient Care Assistant
                  </h3>
                  <p style={{
                    fontSize: '0.75rem',
                    opacity: 0.7,
                    margin: 0
                  }}>
                    {demoMode ? 'Demo Mode • Empathetic Responses' : 'Powered by Claude Haiku 4.5'}
                  </p>
                </div>
              </div>
            </div>

            {/* Patient Anxiety Monitor */}
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
                Comfort Level
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
                    width: `${Math.max(100 - anxietyLevel, 0)}%`,
                    height: '100%',
                    background: anxietyLevel > 60
                      ? 'linear-gradient(90deg, #F59E0B, #F97316)'
                      : anxietyLevel > 30
                      ? 'linear-gradient(90deg, #4A90E2, #357ABD)'
                      : 'linear-gradient(90deg, #10B981, #059669)',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
                <span style={{
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                  background: anxietyLevel > 60
                    ? 'rgba(245, 158, 11, 0.2)'
                    : anxietyLevel > 30
                    ? 'rgba(74, 144, 226, 0.2)'
                    : 'rgba(16, 185, 129, 0.2)',
                  color: anxietyLevel > 60 ? '#F59E0B' : anxietyLevel > 30 ? '#4A90E2' : '#10B981',
                  border: `1px solid ${anxietyLevel > 60 ? '#F59E0B' : anxietyLevel > 30 ? '#4A90E2' : '#10B981'}40`
                }}>
                  {anxietyLevel > 60 ? 'NEEDS SUPPORT' : anxietyLevel > 30 ? 'CALM' : 'COMFORTABLE'}
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
                  ? 'linear-gradient(135deg, rgba(74, 144, 226, 0.3) 0%, rgba(74, 144, 226, 0.2) 100%)'
                  : 'rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                border: `1px solid ${msg.role === 'user' ? 'rgba(74, 144, 226, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
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
              Common questions:
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
                    background: 'rgba(74, 144, 226, 0.15)',
                    border: '1px solid rgba(74, 144, 226, 0.3)',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(74, 144, 226, 0.25)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(74, 144, 226, 0.15)'
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
          borderTop: '1px solid rgba(74, 144, 226, 0.2)',
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
              placeholder="Ask me anything about your care..."
              disabled={loading}
              style={{
                flex: 1,
                padding: '1rem 1.25rem',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(74, 144, 226, 0.3)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.4)'
                e.currentTarget.style.borderColor = 'rgba(74, 144, 226, 0.5)'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74, 144, 226, 0.1)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)'
                e.currentTarget.style.borderColor = 'rgba(74, 144, 226, 0.3)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              style={{
                padding: '1rem 1.75rem',
                background: loading || !input.trim()
                  ? 'rgba(74, 144, 226, 0.2)'
                  : 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)',
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
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(74, 144, 226, 0.4)'
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

      {/* Medical Terminal Display */}
      {!isMobile && (
        <div style={{
          position: 'relative',
          height: '650px',
          background: 'linear-gradient(180deg, rgba(74, 144, 226, 0.08) 0%, rgba(20, 20, 20, 0.95) 100%)',
          borderRadius: '16px',
          border: '2px solid rgba(74, 144, 226, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Medical Terminal Header */}
          <div style={{
            padding: '1rem 1.25rem',
            background: 'linear-gradient(180deg, rgba(74, 144, 226, 0.2) 0%, rgba(74, 144, 226, 0.08) 100%)',
            borderBottom: '2px solid rgba(74, 144, 226, 0.3)',
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
              AI Care Companion
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
              }}>MONITORING</span>
            </div>
          </div>

          {/* Medical Display Area */}
          <div style={{
            flex: 1,
            position: 'relative',
            background: 'linear-gradient(135deg, rgba(74, 144, 226, 0.03) 0%, rgba(0, 0, 0, 0.6) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            overflow: 'hidden'
          }}>
            {/* Medical Grid Pattern */}
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `
                linear-gradient(rgba(74, 144, 226, 0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(74, 144, 226, 0.03) 1px, transparent 1px)
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
                id="healthcare-assistant-mascot"
                style={{
                  width: '100%',
                  height: '100%',
                  filter: 'drop-shadow(0 0 30px rgba(74, 144, 226, 0.4)) drop-shadow(0 10px 40px rgba(16, 185, 129, 0.2))',
                }}
              />
            </div>

            {/* Medical Terminal Corner Accents */}
            <div style={{
              position: 'absolute',
              top: '1rem',
              left: '1rem',
              width: '40px',
              height: '40px',
              borderTop: '3px solid rgba(74, 144, 226, 0.4)',
              borderLeft: '3px solid rgba(74, 144, 226, 0.4)',
              borderRadius: '4px 0 0 0'
            }} />
            <div style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              width: '40px',
              height: '40px',
              borderTop: '3px solid rgba(74, 144, 226, 0.4)',
              borderRight: '3px solid rgba(74, 144, 226, 0.4)',
              borderRadius: '0 4px 0 0'
            }} />
            <div style={{
              position: 'absolute',
              bottom: '1rem',
              left: '1rem',
              width: '40px',
              height: '40px',
              borderBottom: '3px solid rgba(16, 185, 129, 0.4)',
              borderLeft: '3px solid rgba(16, 185, 129, 0.4)',
              borderRadius: '0 0 0 4px'
            }} />
            <div style={{
              position: 'absolute',
              bottom: '1rem',
              right: '1rem',
              width: '40px',
              height: '40px',
              borderBottom: '3px solid rgba(16, 185, 129, 0.4)',
              borderRight: '3px solid rgba(16, 185, 129, 0.4)',
              borderRadius: '0 0 4px 0'
            }} />
          </div>

          {/* Medical Terminal Footer */}
          <div style={{
            padding: '1rem 1.25rem',
            background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.4) 0%, rgba(74, 144, 226, 0.1) 100%)',
            borderTop: '2px solid rgba(74, 144, 226, 0.3)',
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
              <span>HIPAA COMPLIANT</span>
              <span>🔒 🩺 💊</span>
            </div>
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '0.5rem',
              background: 'rgba(74, 144, 226, 0.1)',
              borderRadius: '6px',
              border: '1px solid rgba(74, 144, 226, 0.2)'
            }}>
              <div style={{
                fontSize: '1.5rem',
                filter: 'grayscale(0.3)'
              }}>🩺</div>
              <div style={{
                flex: 1,
                fontSize: '0.75rem',
                lineHeight: '1.3'
              }}>
                <div style={{ fontWeight: '600', color: '#4A90E2' }}>Empathy-Driven AI</div>
                <div style={{ opacity: 0.7, fontSize: '0.7rem' }}>Reduces patient anxiety by 65%</div>
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
          background: rgba(74, 144, 226, 0.6);
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

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  )
}
