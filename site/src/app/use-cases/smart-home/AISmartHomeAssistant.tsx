'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  emotion?: string
  sentiment?: string
}

interface AISmartHomeAssistantProps {
  onEmotionChange?: (emotion: string, gesture: string) => void
  onLLMResponse?: (response: any) => void
}

// Demo mode fallback responses for smart home
const DEMO_RESPONSES: Record<string, any> = {
  'lights': {
    message: "I can help with that! To control your lights, just say which room you want to adjust. You can also set brightness levels or create lighting scenes.",
    emotion: 'calm',
    sentiment: 'positive',
    action: 'guide',
    frustrationLevel: 5
  },
  'temperature': {
    message: "Perfect! I'll help you find the ideal temperature. What temperature would you like? I can also set schedules to save energy while keeping you comfortable.",
    emotion: 'calm',
    sentiment: 'positive',
    action: 'guide',
    frustrationLevel: 5
  },
  'security': {
    message: "Your security is my priority! I can arm/disarm the system, show camera feeds, and send alerts. What would you like to check?",
    emotion: 'calm',
    sentiment: 'positive',
    action: 'reassure',
    frustrationLevel: 10
  },
  'energy': {
    message: "Great question! I'm monitoring your energy usage in real-time. I can suggest ways to save power and reduce your bills. Want to see your energy report?",
    emotion: 'joy',
    sentiment: 'positive',
    action: 'guide',
    frustrationLevel: 0
  },
  'scene': {
    message: "I love setting scenes! Whether it's 'Movie Night', 'Good Morning', or 'Relax Mode', I can control lights, temperature, and music all at once. Which scene sounds good?",
    emotion: 'joy',
    sentiment: 'positive',
    action: 'celebrate',
    frustrationLevel: 0
  },
  'help': {
    message: "I'm here to help! I can control lights, adjust temperature, manage security, monitor energy, and create custom scenes. What would you like to do?",
    emotion: 'empathy',
    sentiment: 'positive',
    action: 'offer_help',
    frustrationLevel: 15
  },
  'not_responding': {
    message: "I understand that's frustrating when devices don't respond. Let me check the connection... Try power cycling the device or check if it's connected to WiFi.",
    emotion: 'empathy',
    sentiment: 'negative',
    action: 'offer_help',
    frustrationLevel: 70
  },
  'automation': {
    message: "Automation makes life easier! I can create routines like 'Leave Home' (locks doors, arms security, turns off lights) or 'Arrive Home' (welcomes you with perfect settings). Want to set one up?",
    emotion: 'excitement',
    sentiment: 'positive',
    action: 'guide',
    frustrationLevel: 0
  }
}

function getDemoResponse(userMessage: string): any {
  const msg = userMessage.toLowerCase()

  if (msg.includes('light') || msg.includes('lamp') || msg.includes('bright')) return DEMO_RESPONSES.lights
  if (msg.includes('temperature') || msg.includes('thermostat') || msg.includes('heat') || msg.includes('cool') || msg.includes('warm') || msg.includes('cold')) return DEMO_RESPONSES.temperature
  if (msg.includes('security') || msg.includes('lock') || msg.includes('camera') || msg.includes('alarm')) return DEMO_RESPONSES.security
  if (msg.includes('energy') || msg.includes('power') || msg.includes('electric') || msg.includes('bill')) return DEMO_RESPONSES.energy
  if (msg.includes('scene') || msg.includes('mood') || msg.includes('movie') || msg.includes('relax')) return DEMO_RESPONSES.scene
  if (msg.includes('automat') || msg.includes('routine') || msg.includes('schedule')) return DEMO_RESPONSES.automation
  if (msg.includes('not work') || msg.includes('broken') || msg.includes('not responding') || msg.includes('offline')) return DEMO_RESPONSES.not_responding
  if (msg.includes('help') || msg.includes('what can you')) return DEMO_RESPONSES.help

  // Default friendly response
  return {
    message: "I'm your smart home assistant! I can help with lights, temperature, security, energy monitoring, and creating automated scenes. What would you like to control?",
    emotion: 'calm',
    sentiment: 'neutral',
    action: 'guide',
    frustrationLevel: 10
  }
}

export default function AISmartHomeAssistant({ onEmotionChange, onLLMResponse }: AISmartHomeAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your smart home AI assistant. How can I help you today?",
      emotion: 'joy',
      sentiment: 'positive'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [comfortLevel, setComfortLevel] = useState(85)
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

        const rect = canvas.getBoundingClientRect()
        const dpr = window.devicePixelRatio || 1
        canvas.setAttribute('width', Math.round(rect.width * dpr).toString())
        canvas.setAttribute('height', Math.round(rect.height * dpr).toString())

        const mascot = new EmotiveMascot({
          canvasId: 'smart-home-assistant-mascot',
          enableAudio: false,
          soundEnabled: false,
          defaultEmotion: 'joy',
          enableGazeTracking: true,
          enableIdleBehaviors: true,
          targetFPS: isMobile ? 30 : 60,
          maxParticles: isMobile ? 50 : 120,
          transitionDuration: 400,
          emotionTransitionSpeed: 300,
          // Smart home themed colors - indigo/violet
          primaryColor: '#8B5CF6',
          secondaryColor: '#06B6D4',
        })

        await mascot.init(canvas)
        mascot.start()

        mascot.setPosition(0, -20, 0)

        mascot.setScale({
          core: isMobile ? 0.5 : 0.7,
          particles: isMobile ? 0.8 : 1.2
        })

        mascot.setBackdrop({
          enabled: true,
          radius: 3.2,
          intensity: 0.75,
          blendMode: 'normal',
          falloff: 'smooth',
          edgeSoftness: 0.95,
          coreTransparency: 0.35,
          responsive: true,
          color: '#8B5CF6'
        })

        mascotRef.current = mascot

        // Initial greeting
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
  const updateMascotEmotion = async (emotion: string, action: string, comfort: number) => {
    if (!mascotRef.current) return

    // Use perform API if available
    if (mascotRef.current.perform) {
      const performanceMap: Record<string, string> = {
        'guide': 'guiding',
        'offer_help': comfort < 40 ? 'offering_urgent_help' : 'offering_help',
        'celebrate': comfort > 80 ? 'celebrating_epic' : 'celebrating',
        'reassure': 'reassuring'
      }

      const performance = performanceMap[action] || 'responding_neutral'

      await mascotRef.current.perform(performance, {
        context: {
          frustration: 100 - comfort,
          urgency: comfort < 40 ? 'high' : comfort < 70 ? 'medium' : 'low',
          magnitude: comfort > 80 ? 'epic' : comfort < 40 ? 'major' : 'moderate'
        }
      })
    }

    // Notify parent for backward compatibility
    if (onEmotionChange) {
      onEmotionChange(emotion, action)
    }

    // Notify with full LLM response structure
    if (onLLMResponse) {
      onLLMResponse({
        emotion,
        action,
        frustrationLevel: 100 - comfort
      })
    }
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')

    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    if (mascotRef.current?.perform) {
      await mascotRef.current.perform('listening')
    }

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
            context: 'smart_home'
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

      // Fallback to demo mode
      if (!data) {
        setDemoMode(true)
        data = getDemoResponse(userMessage)
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message,
        emotion: data.emotion,
        sentiment: data.sentiment
      }])

      const newComfort = Math.max(0, Math.min(100, 100 - (data.frustrationLevel || 0)))
      setComfortLevel(newComfort)

      updateMascotEmotion(data.emotion, data.action, newComfort)

    } catch (error) {
      console.error('Chat error:', error)

      const fallback = getDemoResponse(userMessage)
      setDemoMode(true)

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: fallback.message,
        emotion: fallback.emotion,
        sentiment: fallback.sentiment
      }])

      const newComfort = Math.max(0, Math.min(100, 100 - fallback.frustrationLevel))
      setComfortLevel(newComfort)
      updateMascotEmotion(fallback.emotion, fallback.action, newComfort)
    } finally {
      setLoading(false)
    }
  }

  const examplePrompts = [
    "Turn on living room lights",
    "Set temperature to 72°F",
    "Show security cameras",
    "Create a movie scene",
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
      {/* Chat Interface - Apple HomeKit Style */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '650px',
        background: 'linear-gradient(180deg, rgba(139, 92, 246, 0.05) 0%, rgba(6, 182, 212, 0.03) 100%)',        borderRadius: '16px',
        border: '2px solid rgba(139, 92, 246, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '2px solid rgba(139, 92, 246, 0.3)',
          background: 'linear-gradient(180deg, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0.05) 100%)',
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
              <span style={{ color: '#10B981' }}>● CONNECTED</span>
              {demoMode && <span style={{ color: '#F59E0B' }}>⚠ DEMO MODE</span>}
            </div>
            <div>HOME HUB</div>
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
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)'
                }}>
                  🏠
                </div>
                <div>
                  <h3 style={{
                    fontSize: '1.15rem',
                    fontWeight: '700',
                    color: '#8B5CF6',
                    marginBottom: '0.15rem',
                    letterSpacing: '-0.01em'
                  }}>
                    Smart Home AI
                  </h3>
                  <p style={{
                    fontSize: '0.75rem',
                    opacity: 0.7,
                    margin: 0
                  }}>
                    {demoMode ? 'Demo Mode • Intelligent Control' : 'Powered by Claude Haiku 4.5'}
                  </p>
                </div>
              </div>
            </div>

            {/* Comfort Monitor */}
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
                    width: `${comfortLevel}%`,
                    height: '100%',
                    background: comfortLevel < 40
                      ? 'linear-gradient(90deg, #EF4444, #DC2626)'
                      : comfortLevel < 70
                      ? 'linear-gradient(90deg, #F59E0B, #D97706)'
                      : 'linear-gradient(90deg, #10B981, #059669)',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
                <span style={{
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                  background: comfortLevel < 40
                    ? 'rgba(239, 68, 68, 0.2)'
                    : comfortLevel < 70
                    ? 'rgba(245, 158, 11, 0.2)'
                    : 'rgba(16, 185, 129, 0.2)',
                  color: comfortLevel < 40 ? '#EF4444' : comfortLevel < 70 ? '#F59E0B' : '#10B981',
                  border: `1px solid ${comfortLevel < 40 ? '#EF4444' : comfortLevel < 70 ? '#F59E0B' : '#10B981'}40`
                }}>
                  {comfortLevel < 40 ? 'ISSUE' : comfortLevel < 70 ? 'GOOD' : 'OPTIMAL'}
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
                  ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(99, 102, 241, 0.2) 100%)'
                  : 'rgba(0, 0, 0, 0.3)',                borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                border: `1px solid ${msg.role === 'user' ? 'rgba(139, 92, 246, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
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
                background: 'rgba(0, 0, 0, 0.3)',                borderRadius: '20px 20px 20px 4px',
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
                    background: 'rgba(139, 92, 246, 0.15)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.25)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.15)'
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
          borderTop: '1px solid rgba(139, 92, 246, 0.2)',
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
              placeholder="Ask me to control your home..."
              disabled={loading}
              style={{
                flex: 1,
                padding: '1rem 1.25rem',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.4)'
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)'
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              style={{
                padding: '1rem 1.75rem',
                background: loading || !input.trim()
                  ? 'rgba(139, 92, 246, 0.2)'
                  : 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
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
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(139, 92, 246, 0.4)'
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

      {/* Apple HomeKit Style Assistant Display */}
      {!isMobile && (
        <div style={{
          position: 'relative',
          height: '650px',
          background: 'linear-gradient(180deg, rgba(139, 92, 246, 0.08) 0%, rgba(20, 20, 20, 0.95) 100%)',
          borderRadius: '16px',
          border: '2px solid rgba(139, 92, 246, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Header */}
          <div style={{
            padding: '1rem 1.25rem',
            background: 'linear-gradient(180deg, rgba(139, 92, 246, 0.2) 0%, rgba(139, 92, 246, 0.08) 100%)',
            borderBottom: '2px solid rgba(139, 92, 246, 0.3)',
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

          {/* Screen Area */}
          <div style={{
            flex: 1,
            position: 'relative',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.03) 0%, rgba(0, 0, 0, 0.6) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            overflow: 'hidden'
          }}>
            {/* Background Pattern */}
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `
                linear-gradient(rgba(139, 92, 246, 0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(139, 92, 246, 0.03) 1px, transparent 1px)
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
                id="smart-home-assistant-mascot"
                style={{
                  width: '100%',
                  height: '100%',
                  filter: 'drop-shadow(0 0 30px rgba(139, 92, 246, 0.4)) drop-shadow(0 10px 40px rgba(6, 182, 212, 0.2))',
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
              borderTop: '3px solid rgba(139, 92, 246, 0.4)',
              borderLeft: '3px solid rgba(139, 92, 246, 0.4)',
              borderRadius: '4px 0 0 0'
            }} />
            <div style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              width: '40px',
              height: '40px',
              borderTop: '3px solid rgba(139, 92, 246, 0.4)',
              borderRight: '3px solid rgba(139, 92, 246, 0.4)',
              borderRadius: '0 4px 0 0'
            }} />
            <div style={{
              position: 'absolute',
              bottom: '1rem',
              left: '1rem',
              width: '40px',
              height: '40px',
              borderBottom: '3px solid rgba(6, 182, 212, 0.4)',
              borderLeft: '3px solid rgba(6, 182, 212, 0.4)',
              borderRadius: '0 0 0 4px'
            }} />
            <div style={{
              position: 'absolute',
              bottom: '1rem',
              right: '1rem',
              width: '40px',
              height: '40px',
              borderBottom: '3px solid rgba(6, 182, 212, 0.4)',
              borderRight: '3px solid rgba(6, 182, 212, 0.4)',
              borderRadius: '0 0 4px 0'
            }} />
          </div>

          {/* Footer */}
          <div style={{
            padding: '1rem 1.25rem',
            background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.4) 0%, rgba(139, 92, 246, 0.1) 100%)',
            borderTop: '2px solid rgba(139, 92, 246, 0.3)',
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
              <span>CONTROL METHODS</span>
              <span>🎤 💬 📱</span>
            </div>
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '0.5rem',
              background: 'rgba(139, 92, 246, 0.1)',
              borderRadius: '6px',
              border: '1px solid rgba(139, 92, 246, 0.2)'
            }}>
              <div style={{
                fontSize: '1.5rem',
                filter: 'grayscale(0.3)'
              }}>🏠</div>
              <div style={{
                flex: 1,
                fontSize: '0.75rem',
                lineHeight: '1.3'
              }}>
                <div style={{ fontWeight: '600', color: '#8B5CF6' }}>Emotion-Aware AI</div>
                <div style={{ opacity: 0.7, fontSize: '0.7rem' }}>Responds to your comfort level in real-time</div>
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
          background: rgba(139, 92, 246, 0.6);
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
