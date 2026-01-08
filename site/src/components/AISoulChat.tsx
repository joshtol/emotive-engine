'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  feel?: string  // The feel() intent for this message
}

interface LLMResponse {
  message: string
  feel: string  // Natural language intent for feel() API
  emotion?: string  // Legacy field for backwards compat
  sentiment?: string
}

type LLMProvider = 'claude' | 'openai' | 'gemini' | 'demo'

interface AISoulChatProps {
  onFeel?: (intent: string) => void
  mascot?: any
  defaultProvider?: LLMProvider
}

// Provider configurations
const PROVIDERS: Record<LLMProvider, { name: string; color: string; available: boolean }> = {
  claude: { name: 'Claude', color: '#D97706', available: true },
  openai: { name: 'GPT-4', color: '#10B981', available: false },
  gemini: { name: 'Gemini', color: '#3B82F6', available: false },
  demo: { name: 'Demo Mode', color: '#8B5CF6', available: true }
}

// Demo responses that showcase the feel() API
const DEMO_RESPONSES: Record<string, { message: string; feel: string }> = {
  greeting: {
    message: "Hello! I'm so happy to meet you. I'm an AI with a crystalline soul - watch how I express emotions through light and movement.",
    feel: 'joyful, bouncing, sparkle'
  },
  curious: {
    message: "That's fascinating! Tell me more - I'm genuinely intrigued by what you're sharing.",
    feel: 'curious, leaning in'
  },
  thinking: {
    message: "Hmm, let me think about that for a moment...",
    feel: 'focused, breathing slowly'
  },
  excited: {
    message: "Yes! That's exactly it! I love when ideas click into place like that.",
    feel: 'excited, bouncing, star shape, sparkle'
  },
  empathy: {
    message: "I understand - that sounds really challenging. I'm here to help however I can.",
    feel: 'empathetic, gentle nod, heart shape'
  },
  confused: {
    message: "I'm not quite sure I follow - could you help me understand better?",
    feel: 'confused, tilting, subdued'
  },
  proud: {
    message: "You did it! I'm so proud of what you've accomplished here.",
    feel: 'euphoric, expanding, sun shape, glow'
  },
  calm: {
    message: "Take your time. There's no rush - I'm here whenever you're ready.",
    feel: 'calm, breathing deeply, settling'
  },
  playful: {
    message: "Haha! You have a great sense of humor. I like the way you think!",
    feel: 'joyful but playful, wiggle, bounce'
  },
  mysterious: {
    message: "There's more to this than meets the eye... Let me show you something special.",
    feel: 'mysterious, moon shape, shimmer, subdued'
  }
}

function getDemoResponse(message: string): { message: string; feel: string } {
  const msg = message.toLowerCase()

  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey') || msg.includes('start')) {
    return DEMO_RESPONSES.greeting
  }
  if (msg.includes('tell me') || msg.includes('explain') || msg.includes('what') || msg.includes('how')) {
    return DEMO_RESPONSES.curious
  }
  if (msg.includes('think') || msg.includes('consider') || msg.includes('hmm')) {
    return DEMO_RESPONSES.thinking
  }
  if (msg.includes('yes') || msg.includes('exactly') || msg.includes('perfect') || msg.includes('great')) {
    return DEMO_RESPONSES.excited
  }
  if (msg.includes('sad') || msg.includes('hard') || msg.includes('difficult') || msg.includes('frustrated')) {
    return DEMO_RESPONSES.empathy
  }
  if (msg.includes('confused') || msg.includes("don't understand") || msg.includes('unclear')) {
    return DEMO_RESPONSES.confused
  }
  if (msg.includes('did it') || msg.includes('success') || msg.includes('accomplished') || msg.includes('finished')) {
    return DEMO_RESPONSES.proud
  }
  if (msg.includes('relax') || msg.includes('calm') || msg.includes('peace') || msg.includes('breathe')) {
    return DEMO_RESPONSES.calm
  }
  if (msg.includes('funny') || msg.includes('lol') || msg.includes('haha') || msg.includes('joke')) {
    return DEMO_RESPONSES.playful
  }
  if (msg.includes('secret') || msg.includes('mystery') || msg.includes('special') || msg.includes('magic')) {
    return DEMO_RESPONSES.mysterious
  }

  // Default: curious response
  return DEMO_RESPONSES.curious
}

export default function AISoulChat({ onFeel, mascot, defaultProvider = 'demo' }: AISoulChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [provider, setProvider] = useState<LLMProvider>(defaultProvider)
  const [showProviderMenu, setShowProviderMenu] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Initial greeting
  useEffect(() => {
    const timer = setTimeout(() => {
      const greeting = DEMO_RESPONSES.greeting
      setMessages([{ role: 'assistant', content: greeting.message, feel: greeting.feel }])
      if (onFeel) onFeel(greeting.feel)
      if (mascot?.feel) mascot.feel(greeting.feel)
    }, 500)
    return () => clearTimeout(timer)
  }, [onFeel, mascot])

  const handleSend = useCallback(async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    // Show thinking state
    if (onFeel) onFeel('focused, leaning in')
    if (mascot?.feel) mascot.feel('focused, leaning in')

    try {
      let response: { message: string; feel: string }

      if (provider === 'demo') {
        // Demo mode - instant response
        await new Promise(resolve => setTimeout(resolve, 800))
        response = getDemoResponse(userMessage)
      } else if (provider === 'claude') {
        // Real Claude API
        const res = await fetch('/api/chat/feel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userMessage, provider })
        })

        if (!res.ok) {
          throw new Error('API error')
        }

        const data = await res.json()
        response = { message: data.message, feel: data.feel }
      } else {
        // Other providers not yet implemented
        throw new Error('Provider not available')
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.message,
        feel: response.feel
      }])

      // Trigger the feel!
      if (onFeel) onFeel(response.feel)
      if (mascot?.feel) mascot.feel(response.feel)

    } catch (error) {
      console.error('Chat error:', error)
      const fallback = {
        message: "I'm having a moment - let me gather my thoughts.",
        feel: 'confused, settling'
      }
      setMessages(prev => [...prev, { role: 'assistant', content: fallback.message, feel: fallback.feel }])
      if (onFeel) onFeel(fallback.feel)
      if (mascot?.feel) mascot.feel(fallback.feel)
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }, [input, loading, provider, onFeel, mascot])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleExampleClick = (feel: string) => {
    if (onFeel) onFeel(feel)
    if (mascot?.feel) mascot.feel(feel)
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      maxHeight: '500px',
      background: 'rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      border: '1px solid rgba(102, 126, 234, 0.2)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid rgba(102, 126, 234, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <h3 style={{
            margin: 0,
            fontSize: '1rem',
            fontWeight: 600,
            color: 'white',
          }}>
            Talk to the Crystal Soul
          </h3>
          <p style={{
            margin: '4px 0 0',
            fontSize: '0.75rem',
            color: 'rgba(255,255,255,0.5)',
          }}>
            Watch how I express emotions through the feel() API
          </p>
        </div>

        {/* Provider selector */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowProviderMenu(!showProviderMenu)}
            style={{
              padding: '6px 12px',
              fontSize: '0.75rem',
              background: `${PROVIDERS[provider].color}22`,
              border: `1px solid ${PROVIDERS[provider].color}44`,
              borderRadius: '8px',
              color: PROVIDERS[provider].color,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: PROVIDERS[provider].color,
            }} />
            {PROVIDERS[provider].name}
            <span style={{ opacity: 0.5 }}>▼</span>
          </button>

          {showProviderMenu && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '4px',
              background: 'rgba(20, 20, 30, 0.95)',
              border: '1px solid rgba(102, 126, 234, 0.2)',
              borderRadius: '8px',
              overflow: 'hidden',
              zIndex: 100,
            }}>
              {Object.entries(PROVIDERS).map(([key, { name, color, available }]) => (
                <button
                  key={key}
                  onClick={() => {
                    if (available) {
                      setProvider(key as LLMProvider)
                      setShowProviderMenu(false)
                    }
                  }}
                  disabled={!available}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '10px 16px',
                    background: provider === key ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                    border: 'none',
                    color: available ? 'white' : 'rgba(255,255,255,0.3)',
                    cursor: available ? 'pointer' : 'not-allowed',
                    fontSize: '0.85rem',
                    textAlign: 'left',
                  }}
                >
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: available ? color : 'rgba(255,255,255,0.2)',
                  }} />
                  {name}
                  {!available && <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>(coming soon)</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
            }}
          >
            <div style={{
              padding: '12px 16px',
              borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              background: msg.role === 'user'
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : 'rgba(102, 126, 234, 0.1)',
              border: msg.role === 'user' ? 'none' : '1px solid rgba(102, 126, 234, 0.2)',
              color: 'white',
              fontSize: '0.9rem',
              lineHeight: 1.5,
            }}>
              {msg.content}
            </div>
            {msg.feel && msg.role === 'assistant' && (
              <div style={{
                marginTop: '4px',
                padding: '4px 8px',
                fontSize: '0.7rem',
                color: 'rgba(165, 180, 252, 0.7)',
                fontFamily: 'monospace',
              }}>
                feel("{msg.feel}")
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div style={{
            alignSelf: 'flex-start',
            padding: '12px 16px',
            borderRadius: '16px',
            background: 'rgba(102, 126, 234, 0.1)',
            border: '1px solid rgba(102, 126, 234, 0.2)',
          }}>
            <span style={{ opacity: 0.5 }}>thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick feel buttons */}
      <div style={{
        padding: '8px 16px',
        borderTop: '1px solid rgba(102, 126, 234, 0.1)',
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        scrollbarWidth: 'none',
      }}>
        {[
          { label: '😊', feel: 'happy, bouncing' },
          { label: '🤔', feel: 'curious, leaning in' },
          { label: '😮', feel: 'surprised, expanding' },
          { label: '❤️', feel: 'loving, heart shape, glow' },
          { label: '🌟', feel: 'excited, star shape, sparkle' },
          { label: '🌙', feel: 'calm, moon shape, breathing' },
        ].map(({ label, feel }) => (
          <button
            key={feel}
            onClick={() => handleExampleClick(feel)}
            title={`feel("${feel}")`}
            style={{
              padding: '6px 12px',
              fontSize: '1rem',
              background: 'rgba(102, 126, 234, 0.1)',
              border: '1px solid rgba(102, 126, 234, 0.2)',
              borderRadius: '8px',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid rgba(102, 126, 234, 0.1)',
        display: 'flex',
        gap: '8px',
      }}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Say something..."
          disabled={loading}
          style={{
            flex: 1,
            padding: '12px 16px',
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(102, 126, 234, 0.2)',
            borderRadius: '12px',
            color: 'white',
            fontSize: '0.9rem',
            outline: 'none',
          }}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          style={{
            padding: '12px 20px',
            background: loading || !input.trim()
              ? 'rgba(102, 126, 234, 0.2)'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            fontWeight: 600,
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            opacity: loading || !input.trim() ? 0.5 : 1,
          }}
        >
          Send
        </button>
      </div>
    </div>
  )
}
