'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  emotion?: string
  sentiment?: string
}

interface AILearningAssistantProps {
  onEmotionChange?: (emotion: string, gesture: string) => void
  onLLMResponse?: (response: any) => void
}

// Demo mode fallback responses
const DEMO_RESPONSES: Record<string, any> = {
  'math': {
    message: "Let's break down this problem step by step. First, identify what the question is asking for. What do you think is the first step?",
    emotion: 'calm',
    sentiment: 'neutral',
    action: 'guide',
    frustrationLevel: 15,
    confusionLevel: 20
  },
  'science': {
    message: "Great question! In science, observation is key. What patterns do you notice? Let's explore this concept together.",
    emotion: 'joy',
    sentiment: 'positive',
    action: 'encourage',
    frustrationLevel: 10,
    confusionLevel: 15
  },
  'hint': {
    message: "Here's a gentle hint: think about what you already know about this topic. How might that knowledge apply here?",
    emotion: 'empathy',
    sentiment: 'positive',
    action: 'hint',
    frustrationLevel: 30,
    confusionLevel: 40
  },
  'stuck': {
    message: "I can see you're working hard on this! Let's approach it from a different angle. What if we simplified the problem first?",
    emotion: 'empathy',
    sentiment: 'positive',
    action: 'offer_help',
    frustrationLevel: 60,
    confusionLevel: 70
  },
  'frustrated': {
    message: "It's completely okay to find this challenging—that means you're learning! Take a breath. Let's tackle this together, one small piece at a time.",
    emotion: 'empathy',
    sentiment: 'supportive',
    action: 'reassure',
    frustrationLevel: 85,
    confusionLevel: 80
  },
  'correct': {
    message: "Brilliant! You got it! 🎉 That's exactly the right approach. Can you see how you used problem-solving skills to figure that out?",
    emotion: 'triumph',
    sentiment: 'positive',
    action: 'celebrate',
    frustrationLevel: 0,
    confusionLevel: 0
  },
  'progress': {
    message: "You're making excellent progress! I can see you're understanding the concept. Keep going—you're on the right track!",
    emotion: 'joy',
    sentiment: 'positive',
    action: 'encourage',
    frustrationLevel: 5,
    confusionLevel: 10
  }
}

function getDemoResponse(userMessage: string): any {
  const msg = userMessage.toLowerCase()

  if (msg.includes('correct') || msg.includes('got it') || msg.includes('understand')) return DEMO_RESPONSES.correct
  if (msg.includes('frustrat') || msg.includes('hard') || msg.includes('give up')) return DEMO_RESPONSES.frustrated
  if (msg.includes('stuck') || msg.includes('confused') || msg.includes("don't get")) return DEMO_RESPONSES.stuck
  if (msg.includes('hint') || msg.includes('help') || msg.includes('clue')) return DEMO_RESPONSES.hint
  if (msg.includes('math') || msg.includes('equation') || msg.includes('solve')) return DEMO_RESPONSES.math
  if (msg.includes('science') || msg.includes('experiment') || msg.includes('why')) return DEMO_RESPONSES.science
  if (msg.includes('progress') || msg.includes('doing')) return DEMO_RESPONSES.progress

  // Default encouraging response
  return {
    message: "That's a thoughtful question! I'm here to help you discover the answer. What have you tried so far?",
    emotion: 'calm',
    sentiment: 'positive',
    action: 'encourage',
    frustrationLevel: 20,
    confusionLevel: 25
  }
}

export default function AILearningAssistant({ onEmotionChange, onLLMResponse }: AILearningAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your learning assistant. I'm here to help you understand concepts, not just give you answers. What are you working on?",
      emotion: 'joy',
      sentiment: 'positive'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [confusionLevel, setConfusionLevel] = useState(0)
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
          canvasId: 'learning-assistant-mascot',
          enableAudio: false,
          soundEnabled: false,
          defaultEmotion: 'joy',
          enableGazeTracking: true,
          enableIdleBehaviors: true,
          targetFPS: isMobile ? 30 : 60,
          maxParticles: isMobile ? 50 : 100,
          transitionDuration: 400,
          emotionTransitionSpeed: 300,
          // Education-themed colors
          primaryColor: '#7C3AED',  // Purple
          secondaryColor: '#14B8A6', // Teal
        })

        await mascot.init(canvas)
        mascot.start()

        // Position mascot centered
        mascot.setPosition(0, -20, 0)

        // Scale for education context
        mascot.setScale({
          core: isMobile ? 0.5 : 0.7,
          particles: isMobile ? 0.8 : 1.2
        })

        // Enable backdrop with education purple theme
        mascot.setBackdrop({
          enabled: true,
          radius: 3.2,
          intensity: 0.75,
          blendMode: 'normal',
          falloff: 'smooth',
          edgeSoftness: 0.95,
          coreTransparency: 0.35,
          responsive: true,
          color: '#7C3AED'  // Purple backdrop
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
  const updateMascotEmotion = async (emotion: string, action: string, confusion: number, frustration: number) => {
    if (!mascotRef.current || !mascotRef.current.perform) return

    // Map action to semantic performance
    const performanceMap: Record<string, string> = {
      'guide': 'guiding',
      'encourage': 'encouraging',
      'hint': confusion > 50 ? 'offering_hint_gentle' : 'offering_hint',
      'offer_help': frustration > 70 ? 'offering_urgent_help' : 'offering_help',
      'reassure': 'reassuring',
      'celebrate': frustration < 10 && confusion < 10 ? 'celebrating_epic' : 'celebrating'
    }

    const performance = performanceMap[action] || 'responding_neutral'

    // Update context and perform semantic action
    await mascotRef.current.perform?.(performance, {
      context: {
        confusion,
        frustration,
        urgency: frustration > 70 ? 'high' : frustration > 40 ? 'medium' : 'low',
        magnitude: confusion < 15 && frustration < 10 ? 'epic' : frustration > 70 ? 'major' : 'moderate'
      }
    })

    // Notify parent component
    if (onEmotionChange) {
      onEmotionChange(emotion, action)
    }

    // Pass to simulation for mascot updates
    if (onLLMResponse) {
      onLLMResponse({
        emotion,
        action,
        frustrationLevel: frustration,
        confusionLevel: confusion
      })
    }
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    // Set mascot to "listening" state
    if (mascotRef.current && mascotRef.current.perform) {
      await mascotRef.current.perform('listening')
    }

    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 800))

    try {
      let data

      // Try API first
      try {
        const res = await fetch('/api/education-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userMessage,
            context: 'learning'
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

      // Update levels
      setConfusionLevel(data.confusionLevel || 0)
      setFrustrationLevel(data.frustrationLevel || 0)

      // Update mascot based on AI's emotion detection
      updateMascotEmotion(
        data.emotion,
        data.action,
        data.confusionLevel || 0,
        data.frustrationLevel || 0
      )

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

      setConfusionLevel(fallback.confusionLevel)
      setFrustrationLevel(fallback.frustrationLevel)
      updateMascotEmotion(fallback.emotion, fallback.action, fallback.confusionLevel, fallback.frustrationLevel)
    } finally {
      setLoading(false)
    }
  }

  // Example prompts
  const examplePrompts = [
    "I'm stuck on this problem",
    "Can you give me a hint?",
    "Why does this work?",
    "I don't understand this",
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
      {/* Chat Interface - Education Purple Theme */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '650px',
        background: 'linear-gradient(180deg, rgba(124, 58, 237, 0.05) 0%, rgba(20, 184, 166, 0.03) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '16px',
        border: '2px solid rgba(124, 58, 237, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '2px solid rgba(124, 58, 237, 0.3)',
          background: 'linear-gradient(180deg, rgba(124, 58, 237, 0.15) 0%, rgba(124, 58, 237, 0.05) 100%)',
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
              <span style={{ color: '#14B8A6' }}>● LEARNING</span>
              {demoMode && <span style={{ color: '#F59E0B' }}>⚠ DEMO MODE</span>}
            </div>
            <div>SESSION 12</div>
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
                  background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  boxShadow: '0 2px 8px rgba(124, 58, 237, 0.3)'
                }}>
                  🎓
                </div>
                <div>
                  <h3 style={{
                    fontSize: '1.15rem',
                    fontWeight: '700',
                    color: '#7C3AED',
                    marginBottom: '0.15rem',
                    letterSpacing: '-0.01em'
                  }}>
                    Learning Assistant
                  </h3>
                  <p style={{
                    fontSize: '0.75rem',
                    opacity: 0.7,
                    margin: 0
                  }}>
                    {demoMode ? 'Demo Mode • Smart Guidance' : 'Powered by Claude AI'}
                  </p>
                </div>
              </div>
            </div>

            {/* Student State Monitor */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: '0.5rem'
            }}>
              <div style={{
                fontSize: '0.7rem',
                opacity: 0.6,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Understanding Level
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
                    width: `${Math.max(100 - confusionLevel, 0)}%`,
                    height: '100%',
                    background: confusionLevel > 60
                      ? 'linear-gradient(90deg, #EF4444, #DC2626)'
                      : confusionLevel > 30
                      ? 'linear-gradient(90deg, #F59E0B, #D97706)'
                      : 'linear-gradient(90deg, #14B8A6, #0D9488)',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
                <span style={{
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                  background: confusionLevel > 60
                    ? 'rgba(239, 68, 68, 0.2)'
                    : confusionLevel > 30
                    ? 'rgba(245, 158, 11, 0.2)'
                    : 'rgba(20, 184, 166, 0.2)',
                  color: confusionLevel > 60 ? '#EF4444' : confusionLevel > 30 ? '#F59E0B' : '#14B8A6',
                  border: `1px solid ${confusionLevel > 60 ? '#EF4444' : confusionLevel > 30 ? '#F59E0B' : '#14B8A6'}40`
                }}>
                  {confusionLevel > 60 ? 'STRUGGLING' : confusionLevel > 30 ? 'LEARNING' : 'CONFIDENT'}
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
                  ? 'linear-gradient(135deg, rgba(124, 58, 237, 0.3) 0%, rgba(167, 139, 250, 0.2) 100%)'
                  : 'rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                border: `1px solid ${msg.role === 'user' ? 'rgba(124, 58, 237, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
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
                    background: 'rgba(124, 58, 237, 0.15)',
                    border: '1px solid rgba(124, 58, 237, 0.3)',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(124, 58, 237, 0.25)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(124, 58, 237, 0.15)'
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
          borderTop: '1px solid rgba(124, 58, 237, 0.2)',
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
              placeholder="Ask a question or describe what you're learning..."
              disabled={loading}
              style={{
                flex: 1,
                padding: '1rem 1.25rem',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(124, 58, 237, 0.3)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.4)'
                e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.5)'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)'
                e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.3)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              style={{
                padding: '1rem 1.75rem',
                background: loading || !input.trim()
                  ? 'rgba(124, 58, 237, 0.2)'
                  : 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)',
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
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(124, 58, 237, 0.4)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {loading ? 'Thinking...' : 'Send'}
            </button>
          </div>
        </div>
      </div>

      {/* Education-Style Learning Terminal */}
      {!isMobile && (
        <div style={{
          position: 'relative',
          height: '650px',
          background: 'linear-gradient(180deg, rgba(124, 58, 237, 0.08) 0%, rgba(20, 20, 20, 0.95) 100%)',
          borderRadius: '16px',
          border: '2px solid rgba(124, 58, 237, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Terminal Header */}
          <div style={{
            padding: '1rem 1.25rem',
            background: 'linear-gradient(180deg, rgba(124, 58, 237, 0.2) 0%, rgba(124, 58, 237, 0.08) 100%)',
            borderBottom: '2px solid rgba(124, 58, 237, 0.3)',
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
              AI Tutor Companion
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
                background: '#14B8A6',
                boxShadow: '0 0 8px #14B8A6',
                animation: 'pulse 2s ease-in-out infinite'
              }} />
              <span style={{
                fontSize: '0.7rem',
                color: '#14B8A6',
                fontWeight: '600'
              }}>ACTIVE</span>
            </div>
          </div>

          {/* Terminal Screen Area */}
          <div style={{
            flex: 1,
            position: 'relative',
            background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.03) 0%, rgba(0, 0, 0, 0.6) 100%)',
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
                linear-gradient(rgba(124, 58, 237, 0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(124, 58, 237, 0.03) 1px, transparent 1px)
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
                id="learning-assistant-mascot"
                style={{
                  width: '100%',
                  height: '100%',
                  filter: 'drop-shadow(0 0 30px rgba(124, 58, 237, 0.4)) drop-shadow(0 10px 40px rgba(20, 184, 166, 0.2))',
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
              borderTop: '3px solid rgba(124, 58, 237, 0.4)',
              borderLeft: '3px solid rgba(124, 58, 237, 0.4)',
              borderRadius: '4px 0 0 0'
            }} />
            <div style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              width: '40px',
              height: '40px',
              borderTop: '3px solid rgba(124, 58, 237, 0.4)',
              borderRight: '3px solid rgba(124, 58, 237, 0.4)',
              borderRadius: '0 4px 0 0'
            }} />
            <div style={{
              position: 'absolute',
              bottom: '1rem',
              left: '1rem',
              width: '40px',
              height: '40px',
              borderBottom: '3px solid rgba(20, 184, 166, 0.4)',
              borderLeft: '3px solid rgba(20, 184, 166, 0.4)',
              borderRadius: '0 0 0 4px'
            }} />
            <div style={{
              position: 'absolute',
              bottom: '1rem',
              right: '1rem',
              width: '40px',
              height: '40px',
              borderBottom: '3px solid rgba(20, 184, 166, 0.4)',
              borderRight: '3px solid rgba(20, 184, 166, 0.4)',
              borderRadius: '0 0 4px 0'
            }} />
          </div>

          {/* Terminal Footer */}
          <div style={{
            padding: '1rem 1.25rem',
            background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.4) 0%, rgba(124, 58, 237, 0.1) 100%)',
            borderTop: '2px solid rgba(124, 58, 237, 0.3)',
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
              <span>SUBJECTS</span>
              <span>📐 📖 🧪</span>
            </div>
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '0.5rem',
              background: 'rgba(124, 58, 237, 0.1)',
              borderRadius: '6px',
              border: '1px solid rgba(124, 58, 237, 0.2)'
            }}>
              <div style={{
                fontSize: '1.5rem',
                filter: 'grayscale(0.3)'
              }}>🎓</div>
              <div style={{
                flex: 1,
                fontSize: '0.75rem',
                lineHeight: '1.3'
              }}>
                <div style={{ fontWeight: '600', color: '#7C3AED' }}>Adaptive Learning AI</div>
                <div style={{ opacity: 0.7, fontSize: '0.7rem' }}>Responds to your understanding in real-time</div>
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
          background: rgba(124, 58, 237, 0.6);
          borderRadius: 50%;
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
