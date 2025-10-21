'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import AILearningAssistant from './AILearningAssistant'

interface Problem {
  id: string
  subject: string
  question: string
  answer: string
  difficulty: 'easy' | 'medium' | 'hard'
  icon: string
}

const DEMO_PROBLEMS: Problem[] = [
  { id: '1', subject: 'Math', question: 'What is 15 × 8?', answer: '120', difficulty: 'easy', icon: '📐' },
  { id: '2', subject: 'Science', question: 'What is H₂O?', answer: 'water', difficulty: 'easy', icon: '🧪' },
  { id: '3', subject: 'Math', question: 'Solve: 3x + 7 = 22', answer: '5', difficulty: 'medium', icon: '📐' },
]

export default function LearningSimulation() {
  const [currentProblem, setCurrentProblem] = useState(0)
  const [answer, setAnswer] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | 'hint' | null>(null)
  const [showAIHelp, setShowAIHelp] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mascotRef = useRef<any>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__openEducationAIChat = () => setShowAIHelp(true)
    }
    return () => {
      delete (window as any).__openEducationAIChat
    }
  }, [])

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
          canvasId: 'learning-mascot',
          enableAudio: false,
          soundEnabled: false,
          defaultEmotion: 'neutral',
          targetFPS: isMobile ? 30 : 60,
          maxParticles: isMobile ? 50 : 100,
        })
        await mascot.init(canvas)
        mascot.start()
        mascot.setPosition(0, 0, 0)
        mascot.setScale({ core: isMobile ? 0.7 : 1.2, particles: isMobile ? 1.0 : 1.8 })
        mascot.setBackdrop({ enabled: true, radius: 3.0, intensity: 0.8 })
        mascotRef.current = mascot
        setTimeout(() => mascot.express?.('wave'), 500)
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

  const checkAnswer = () => {
    const correct = answer.toLowerCase().trim() === DEMO_PROBLEMS[currentProblem].answer.toLowerCase()
    if (correct) {
      setFeedback('correct')
      if (mascotRef.current?.express) mascotRef.current.express('bounce')
      setTimeout(() => {
        if (currentProblem < DEMO_PROBLEMS.length - 1) {
          setCurrentProblem(currentProblem + 1)
          setAnswer('')
          setFeedback(null)
          setAttempts(0)
        }
      }, 2000)
    } else {
      setAttempts(attempts + 1)
      if (attempts >= 1) {
        setFeedback('hint')
        if (mascotRef.current?.express) mascotRef.current.express('shake')
      } else {
        setFeedback('incorrect')
      }
    }
  }

  const handleLLMResponse = async (response: any) => {
    if (!mascotRef.current) return
    if (mascotRef.current.handleLLMResponse) {
      await mascotRef.current.handleLLMResponse(response)
    }
  }

  const problem = DEMO_PROBLEMS[currentProblem]
  const helpButton = (
    <button
      onClick={() => setShowAIHelp(!showAIHelp)}
      style={{
        padding: '0.6rem 1.25rem',
        background: showAIHelp ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' : 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)',
        borderRadius: '10px',
        fontSize: '0.9rem',
        fontWeight: '700',
        color: 'white',
        border: `1px solid ${showAIHelp ? 'rgba(239, 68, 68, 0.3)' : 'rgba(20, 184, 166, 0.3)'}`,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        letterSpacing: '0.5px',
        textTransform: 'uppercase'
      }}
    >
      <span style={{ fontSize: '1rem' }}>{showAIHelp ? '✕' : '💬'}</span>
      <span>{showAIHelp ? 'Close' : 'Get Help'}</span>
    </button>
  )

  return (
    <div style={{ position: 'relative', minHeight: '800px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '2rem' : '3rem', alignItems: 'center', padding: '2rem', overflow: 'hidden' }}>
      <div style={{ position: 'relative', width: '100%', height: isMobile ? '400px' : '600px', display: 'flex', alignItems: 'center', justifyContent: 'center', order: isMobile ? 1 : 0, transform: showAIHelp && !isMobile ? 'translateX(-10%)' : 'translateX(0)', transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}>
        <canvas ref={canvasRef} id="learning-mascot" style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 20px 80px rgba(124, 58, 237, 0.6))' }} />
      </div>
      <div style={{ position: 'relative', width: '100%', order: isMobile ? 2 : 1 }}>
        <div style={{ background: 'linear-gradient(135deg, rgba(26, 31, 58, 0.95) 0%, rgba(15, 18, 35, 0.98) 100%)', backdropFilter: 'blur(60px)', borderRadius: '32px', padding: 'clamp(2rem, 4vw, 3rem)', border: '2px solid rgba(124, 58, 237, 0.2)', boxShadow: '0 30px 90px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(124, 58, 237, 0.1)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, rgba(124, 58, 237, 0.8), transparent)' }} />
          <div style={{ marginBottom: '2.5rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            {DEMO_PROBLEMS.map((_, i) => (
              <div key={i} style={{ flex: 1, maxWidth: '100px', textAlign: 'center' }}>
                <div style={{ height: '3px', background: i <= currentProblem ? 'linear-gradient(90deg, #7C3AED, #14B8A6)' : 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', marginBottom: '0.6rem', transition: 'all 0.5s', boxShadow: i <= currentProblem ? '0 0 12px rgba(124, 58, 237, 0.5)' : 'none' }} />
                <div style={{ fontSize: '0.75rem', opacity: i <= currentProblem ? 1 : 0.35, fontWeight: i === currentProblem ? '700' : '500', color: i <= currentProblem ? '#7C3AED' : 'rgba(255, 255, 255, 0.4)', transition: 'all 0.3s', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Problem {i + 1}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{problem.icon}</div>
            <h3 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', marginBottom: '1rem', background: 'linear-gradient(135deg, #7C3AED 0%, #14B8A6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '800', letterSpacing: '-0.02em' }}>{problem.subject}</h3>
            <div style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '2rem', color: '#A78BFA' }}>{problem.question}</div>
            <div style={{ marginBottom: '2rem' }}>
              <input type="text" value={answer} onChange={(e) => setAnswer(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && checkAnswer()} placeholder="Your answer" style={{ padding: '1rem 2rem', fontSize: '1.2rem', width: '100%', maxWidth: '300px', textAlign: 'center', background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(124, 58, 237, 0.5)', borderRadius: '12px', color: 'white', outline: 'none' }} />
            </div>
            <button onClick={checkAnswer} disabled={!answer} style={{ padding: '1rem 3rem', fontSize: '1.1rem', fontWeight: '600', background: answer ? 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)' : 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '12px', cursor: answer ? 'pointer' : 'not-allowed', transition: 'all 0.3s', opacity: answer ? 1 : 0.5 }}>Check Answer</button>
            {feedback === 'correct' && <div style={{ marginTop: '2rem', padding: '1.5rem 2rem', background: 'rgba(20,184,166,0.2)', borderRadius: '12px', fontSize: '1.3rem', border: '2px solid rgba(20,184,166,0.5)' }}>🎉 Perfect! Great job!</div>}
            {feedback === 'hint' && <div style={{ marginTop: '2rem', padding: '1.5rem 2rem', background: 'rgba(245,158,11,0.2)', borderRadius: '12px', fontSize: '1.1rem', border: '2px solid rgba(245,158,11,0.5)' }}>🤔 Not quite. Try using the AI tutor for help!</div>}
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: isMobile ? '100%' : 'calc(50% - 1.5rem)', background: 'linear-gradient(135deg, rgba(15, 18, 35, 0.98) 0%, rgba(26, 31, 58, 0.95) 100%)', backdropFilter: 'blur(40px)', border: '2px solid rgba(124, 58, 237, 0.3)', borderRadius: '32px', transform: showAIHelp ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)', zIndex: 50, overflow: 'hidden', boxShadow: showAIHelp ? '0 30px 90px rgba(0, 0, 0, 0.6)' : 'none' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, rgba(124, 58, 237, 0.8), transparent)' }} />
        <div style={{ padding: '2rem 2.5rem', borderBottom: '2px solid rgba(124, 58, 237, 0.2)', background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.15) 0%, rgba(20, 184, 166, 0.08) 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '2.5rem' }}>🎓</div>
            <div>
              <div style={{ fontWeight: '800', fontSize: '1.4rem', background: 'linear-gradient(135deg, #7C3AED 0%, #14B8A6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.01em' }}>AI Tutor</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.7, color: 'rgba(255, 255, 255, 0.6)', fontWeight: '500' }}>I&apos;m here to guide your learning</div>
            </div>
          </div>
        </div>
        <div style={{ height: 'calc(100% - 120px)', overflow: 'hidden' }}>
          <AILearningAssistant onLLMResponse={handleLLMResponse} />
        </div>
      </div>
      {isClient && document.getElementById('help-button-container') ? createPortal(helpButton, document.getElementById('help-button-container')!) : null}
    </div>
  )
}
