'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import PremiumAIAssistant from '@/components/PremiumAIAssistant'
import { useTimeoutManager } from '@/hooks/useTimeoutManager'

interface Problem {
  id: string
  subject: string
  question: string
  answer: string
  difficulty: 'easy' | 'medium' | 'hard'
  icon: string
  hints: string[]
  explanation: string
  mascotShape?: string
  mascotEmotion?: string
}

const DEMO_PROBLEMS: Problem[] = [
  {
    id: '1',
    subject: 'Math - Multiplication',
    question: 'What is 15 × 8?',
    answer: '120',
    difficulty: 'easy',
    icon: '📐',
    hints: [
      'Think about breaking 15 into 10 + 5',
      'Try: (10 × 8) + (5 × 8)',
      'That gives you 80 + 40'
    ],
    explanation: 'Great! 15 × 8 = 120. You can break it down as (10×8) + (5×8) = 80 + 40 = 120',
    mascotShape: 'crystal',
    mascotEmotion: 'calm'
  },
  {
    id: '2',
    subject: 'Chemistry',
    question: 'What is the chemical formula for water?',
    answer: 'H2O',
    difficulty: 'easy',
    icon: '🧪',
    hints: [
      'Water is made of hydrogen and oxygen',
      'It has 2 hydrogen atoms and 1 oxygen atom',
      'Use H for hydrogen and O for oxygen'
    ],
    explanation: 'Perfect! H₂O means 2 hydrogen atoms bonded to 1 oxygen atom - that\'s water!',
    mascotShape: 'heart',
    mascotEmotion: 'joy'
  },
  {
    id: '3',
    subject: 'Algebra',
    question: 'Solve for x: 3x + 7 = 22',
    answer: '5',
    difficulty: 'medium',
    icon: '📐',
    hints: [
      'First, subtract 7 from both sides',
      'That gives you 3x = 15',
      'Now divide both sides by 3'
    ],
    explanation: 'Excellent work! You isolated x by subtracting 7 (getting 3x = 15) then dividing by 3 to get x = 5',
    mascotShape: 'crystal',
    mascotEmotion: 'joy'
  },
  {
    id: '4',
    subject: 'Physics',
    question: 'What is the speed of light in vacuum? (in km/s)',
    answer: '299792',
    difficulty: 'hard',
    icon: '⚡',
    hints: [
      'It\'s approximately 300,000 km/s',
      'The exact value is 299,792.458 km/s',
      'You can round to 299792'
    ],
    explanation: 'Amazing! The speed of light is 299,792 km/s - one of the fundamental constants of the universe!',
    mascotShape: 'sun',
    mascotEmotion: 'joy'
  },
]

interface LearningSimulationProps {
  mascot?: any  // Guide mascot instance from parent
}

export default function LearningSimulation({ mascot }: LearningSimulationProps) {
  const { setTimeout: setManagedTimeout } = useTimeoutManager()
  const [currentProblem, setCurrentProblem] = useState(0)
  const [answer, setAnswer] = useState('120')
  const [attempts, setAttempts] = useState(0)
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | 'hint' | null>(null)
  const [showAIHelp, setShowAIHelp] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [currentHint, setCurrentHint] = useState(0)
  const [showExplanation, setShowExplanation] = useState(false)
  const [streak, setStreak] = useState(0)
  const mascotStageRef = useRef<HTMLDivElement>(null)
  const mascotRef = useRef<any>(mascot)
  const isAttachedRef = useRef<boolean>(false)
  const lastScrollYRef = useRef<number>(0)
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

  // Attach mascot to stage when scrolled into view
  // Only detach when scrolling UP past the attachment point, not when scrolling DOWN
  useEffect(() => {
    if (!mascot || !mascotStageRef.current) return

    // Track scroll direction
    const handleScroll = () => {
      lastScrollYRef.current = window.scrollY
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    lastScrollYRef.current = window.scrollY

    // Use Intersection Observer to detect when the stage comes into view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isAttachedRef.current) {
            // Stage is in view and mascot not yet attached
            if (typeof mascot.attachToElement !== 'function') {
              return
            }

            mascot.attachToElement(mascotStageRef.current, {
              animate: false,  // Instant snap - animation causes overshoot due to scroll offset
              scale: isMobile ? 0.7 : 0.5,  // 70% on mobile, 50% on desktop
              containParticles: true  // Keep particles within the stage bounds
            })

            // Set emotion to calm when attached
            mascot.setEmotion('calm')

            mascotRef.current = mascot
            isAttachedRef.current = true
          } else if (!entry.isIntersecting && isAttachedRef.current) {
            // Stage is out of view - but only detach if scrolling UP
            // When boundingClientRect.top > 0, element is below viewport (user scrolled UP)
            // When boundingClientRect.top < 0, element is above viewport (user scrolled DOWN)
            const elementBelowViewport = entry.boundingClientRect.top > 0

            // Only detach when scrolling UP (element goes below viewport)
            // Do NOT detach when scrolling DOWN (element goes above viewport)
            if (elementBelowViewport) {
              if (typeof mascot.detachFromElement === 'function') {
                mascot.detachFromElement()
              }

              mascotRef.current = null
              isAttachedRef.current = false
            }
            // If scrolling DOWN past the element, keep attached - mascot stays in place
          }
        })
      },
      {
        threshold: 0.2, // Trigger when 20% of the element is visible
        rootMargin: '0px'
      }
    )

    observer.observe(mascotStageRef.current)

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', handleScroll)
      if (mascot && typeof mascot.detachFromElement === 'function') {
        mascot.detachFromElement()
      }
      isAttachedRef.current = false
    }
  }, [mascot, isMobile])

  const checkAnswer = async () => {
    // Prevent checking if already correct
    if (feedback === 'correct') return

    const problem = DEMO_PROBLEMS[currentProblem]
    const correct = answer.toLowerCase().trim() === problem.answer.toLowerCase()

    if (correct) {
      setFeedback('correct')
      setShowExplanation(true)
      setStreak(streak + 1)

      // Mascot celebrates with morph and emotion
      // Use mascot prop directly for core operations (always available)
      if (mascot) {
        if (problem.mascotShape && mascot.morphTo) {
          mascot.morphTo(problem.mascotShape, { duration: 800 })
        }
        if (problem.mascotEmotion && mascot.setEmotion) {
          mascot.setEmotion(problem.mascotEmotion, 0.9)
        }
        if (mascot.express) {
          mascot.express('bounce')
          setManagedTimeout(() => {
            if (mascot?.express) {
              mascot.express('sparkle', { intensity: 0.8, duration: 1500 })
            }
          }, 300)
        }
      }
    } else {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)

      // Show frustration based on attempts
      // Use mascot prop directly for core operations (always available)
      if (mascot) {
        if (newAttempts >= 2) {
          setFeedback('hint')
          if (mascot.setEmotion) {
            mascot.setEmotion('empathy', 0.7)
          }
          if (mascot.express) {
            mascot.express('wobble')
          }
        } else {
          setFeedback('incorrect')
          if (mascot.setEmotion) {
            mascot.setEmotion('concern', 0.6)
          }
          if (mascot.express) {
            mascot.express('shake')
          }
        }
      }
    }
  }

  const handleNextProblem = () => {
    if (currentProblem < DEMO_PROBLEMS.length - 1) {
      const nextProblemIndex = currentProblem + 1
      setCurrentProblem(nextProblemIndex)
      setAnswer(DEMO_PROBLEMS[nextProblemIndex].answer)
      setFeedback(null)
      setAttempts(0)
      setCurrentHint(0)
      setShowExplanation(false)
    }
  }

  const showNextHint = () => {
    const problem = DEMO_PROBLEMS[currentProblem]
    if (currentHint < problem.hints.length - 1) {
      setCurrentHint(currentHint + 1)
      if (mascot?.express) {
        mascot.express('pulse', { intensity: 0.6 })
      }
    }
  }

  const handleLLMResponse = async (response: any) => {
    if (!mascot) return
    if (mascot.handleLLMResponse) {
      await mascot.handleLLMResponse(response)
    }
  }

  const problem = DEMO_PROBLEMS[currentProblem]
  const helpButton = (
    <button
      onClick={() => setShowAIHelp(!showAIHelp)}
      style={{
        padding: isMobile ? '0.5rem 0.875rem' : '0.6rem 1.25rem',
        background: showAIHelp ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' : 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)',
        borderRadius: isMobile ? '8px' : '10px',
        fontSize: isMobile ? '0.75rem' : '0.9rem',
        fontWeight: '700',
        color: 'white',
        border: `1px solid ${showAIHelp ? 'rgba(239, 68, 68, 0.3)' : 'rgba(20, 184, 166, 0.3)'}`,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? '0.35rem' : '0.5rem',
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap'
      }}
    >
      <span style={{ fontSize: isMobile ? '0.85rem' : '1rem' }}>{showAIHelp ? '✕' : '💬'}</span>
      <span>{showAIHelp ? 'Close' : 'Help'}</span>
    </button>
  )

  return (
    <div style={{
      position: 'relative',
      minHeight: isMobile ? 'auto' : '750px',
      display: isMobile ? 'flex' : 'grid',
      flexDirection: isMobile ? 'column' : undefined,
      gridTemplateColumns: isMobile ? undefined : showAIHelp ? '450px 1fr 480px' : '450px 1fr',
      gap: isMobile ? '0' : '2.5rem',
      padding: isMobile ? '0' : '2rem',
      overflow: 'hidden',
      transition: 'grid-template-columns 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      transform: 'translateZ(0)',
      willChange: 'transform',
      alignItems: 'start',
      width: '100%',
      maxWidth: '100%',
      boxSizing: 'border-box'
    }}>
      {/* Mascot Stage - Desktop (Hidden on mobile) */}
      {!isMobile && (
        <div
          ref={mascotStageRef}
          style={{
            position: 'sticky',
            top: '2rem',
            width: '100%',
            minHeight: '500px',
            background: 'radial-gradient(circle at center, rgba(124, 58, 237, 0.08) 0%, rgba(0, 0, 0, 0.2) 100%)',
            borderRadius: '20px',
            border: '2px solid rgba(124, 58, 237, 0.25)',
            boxShadow: 'inset 0 0 80px rgba(124, 58, 237, 0.1)',
            overflow: 'hidden',
            zIndex: 10
          }}
        />
      )}

      {/* Mascot Stage - Mobile */}
      {isMobile && (
        <div
          ref={mascotStageRef}
          style={{
            position: 'relative',
            width: '100%',
            height: '180px',
            minHeight: '180px',
            maxHeight: '180px',
            background: 'radial-gradient(circle at center, rgba(124, 58, 237, 0.08) 0%, rgba(0, 0, 0, 0.2) 100%)',
            borderRadius: '16px',
            border: '2px solid rgba(124, 58, 237, 0.25)',
            boxShadow: 'inset 0 0 60px rgba(124, 58, 237, 0.1)',
            overflow: 'visible',
            marginBottom: '0.75rem',
            zIndex: 10,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        />
      )}

      {/* Problem Column */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '100%',
        order: isMobile ? 2 : 1,
        boxSizing: 'border-box'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(26, 31, 58, 0.95) 0%, rgba(15, 18, 35, 0.98) 100%)',
          borderRadius: isMobile ? '0' : '24px',
          padding: isMobile ? '1.5rem' : '2rem',
          border: isMobile ? 'none' : '2px solid rgba(124, 58, 237, 0.2)',
          borderTop: isMobile ? '2px solid rgba(124, 58, 237, 0.2)' : undefined,
          borderBottom: isMobile ? '2px solid rgba(124, 58, 237, 0.2)' : undefined,
          boxShadow: '0 30px 90px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(124, 58, 237, 0.1)',
          position: 'relative',
          overflow: 'hidden',
          height: isMobile ? 'auto' : '680px',
          minHeight: isMobile ? 'auto' : '680px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: isMobile ? 'flex-start' : 'space-between',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, rgba(124, 58, 237, 0.8), transparent)' }} />

          {/* Header Section - Progress Bar */}
          <div style={{ flexShrink: 0 }}>
            <div style={{ marginBottom: isMobile ? '0.75rem' : '1.5rem', display: 'flex', gap: isMobile ? '0.25rem' : '0.5rem', justifyContent: 'center', width: '100%' }}>
              {DEMO_PROBLEMS.map((_, i) => (
                <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ height: isMobile ? '2.5px' : '3px', background: i <= currentProblem ? 'linear-gradient(90deg, #7C3AED, #14B8A6)' : 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', marginBottom: isMobile ? '0.3rem' : '0.6rem', transition: 'all 0.5s', boxShadow: i <= currentProblem ? '0 0 12px rgba(124, 58, 237, 0.5)' : 'none' }} />
                  <div style={{ fontSize: isMobile ? '0.55rem' : '0.75rem', opacity: i <= currentProblem ? 1 : 0.35, fontWeight: i === currentProblem ? '700' : '500', color: i <= currentProblem ? '#7C3AED' : 'rgba(255, 255, 255, 0.4)', transition: 'all 0.3s', letterSpacing: isMobile ? '0' : '0.5px', textTransform: 'uppercase' }}>{isMobile ? `${i + 1}` : `Problem ${i + 1}`}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Content Section - Flexible */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', minHeight: 0 }}>
            {/* Streak Counter - Top Right */}
            {streak > 0 && (
              <div style={{
                position: 'absolute',
                top: isMobile ? '3rem' : '4.5rem',
                right: isMobile ? '0.5rem' : '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? '0.25rem' : '0.5rem',
                padding: isMobile ? '0.25rem 0.5rem' : '0.5rem 1rem',
                background: isMobile ? 'rgba(245,158,11,0.25)' : 'linear-gradient(135deg, rgba(245,158,11,0.3) 0%, rgba(251,146,60,0.2) 100%)',
                borderRadius: '100px',
                border: isMobile ? '1px solid rgba(245,158,11,0.4)' : '2px solid rgba(245,158,11,0.5)',
                boxShadow: isMobile ? '0 2px 8px rgba(245,158,11,0.2)' : '0 6px 24px rgba(245,158,11,0.3)',
                animation: isMobile ? 'none' : 'pulse 2s ease-in-out infinite'
              }}>
                <span style={{ fontSize: isMobile ? '0.85rem' : '1.4rem' }}>🔥</span>
                {isMobile ? (
                  <div style={{ fontSize: '0.85rem', fontWeight: '900', color: '#F59E0B', lineHeight: 1 }}>{streak}</div>
                ) : (
                  <div>
                    <div style={{ fontSize: '0.6rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>Streak</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#F59E0B', lineHeight: 1 }}>{streak}</div>
                  </div>
                )}
              </div>
            )}

            {/* Problem Icon & Subject */}
            <div style={{
              fontSize: isMobile ? '1.75rem' : '2.5rem',
              marginBottom: isMobile ? '0.35rem' : '0.75rem',
              filter: 'drop-shadow(0 4px 16px rgba(124, 58, 237, 0.4))'
            }}>{problem.icon}</div>
            <div style={{
              fontSize: isMobile ? '0.6rem' : '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: isMobile ? '0.5px' : '1.5px',
              fontWeight: '600',
              marginBottom: isMobile ? '0.5rem' : '1rem',
              opacity: 0.6
            }}>
              {problem.difficulty} • {problem.subject}
            </div>

            {/* Question */}
            <h3 style={{
              fontSize: isMobile ? '1.15rem' : '1.75rem',
              marginBottom: isMobile ? '0.75rem' : '1.5rem',
              fontWeight: '800',
              letterSpacing: '-0.02em',
              lineHeight: 1.3,
              color: 'white',
              textShadow: '0 2px 20px rgba(124, 58, 237, 0.4)',
              padding: isMobile ? '0' : '0 1rem'
            }}>{problem.question}</h3>

            {/* Answer Input */}
            <div style={{ marginBottom: isMobile ? '0.75rem' : '1.5rem' }}>
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !feedback && checkAnswer()}
                placeholder="Type your answer..."
                disabled={feedback === 'correct'}
                style={{
                  padding: isMobile ? '0.75rem 0.875rem' : '1rem 1.5rem',
                  fontSize: isMobile ? '1rem' : '1.3rem',
                  width: '100%',
                  maxWidth: isMobile ? '100%' : '400px',
                  textAlign: 'center',
                  background: feedback === 'correct' ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.08)',
                  border: `2px solid ${feedback === 'correct' ? 'rgba(16,185,129,0.5)' : 'rgba(124, 58, 237, 0.4)'}`,
                  borderRadius: isMobile ? '8px' : '12px',
                  color: 'white',
                  outline: 'none',
                  fontWeight: '700',
                  transition: 'all 0.3s ease',
                  boxShadow: feedback === 'correct' ? '0 0 0 4px rgba(16,185,129,0.1)' : 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Action Button */}
            {feedback !== 'correct' ? (
              <button
                onClick={checkAnswer}
                disabled={!answer}
                style={{
                  padding: isMobile ? '0.75rem 1.5rem' : '1rem 3rem',
                  fontSize: isMobile ? '0.85rem' : '1rem',
                  fontWeight: '700',
                  background: answer ? 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)' : 'rgba(255,255,255,0.08)',
                  color: 'white',
                  border: 'none',
                  borderRadius: isMobile ? '8px' : '12px',
                  cursor: answer ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  opacity: answer ? 1 : 0.4,
                  boxShadow: answer ? '0 6px 24px rgba(124, 58, 237, 0.5)' : 'none',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  width: isMobile ? '100%' : 'auto'
                }}
                onMouseEnter={(e) => {
                  if (answer && !isMobile) {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 12px 48px rgba(124, 58, 237, 0.6)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isMobile) {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = answer ? '0 6px 24px rgba(124, 58, 237, 0.5)' : 'none'
                  }
                }}
              >
                Check Answer
              </button>
            ) : (
              <button
                onClick={handleNextProblem}
                disabled={currentProblem >= DEMO_PROBLEMS.length - 1}
                style={{
                  padding: isMobile ? '0.75rem 1.5rem' : '1rem 3rem',
                  fontSize: isMobile ? '0.85rem' : '1rem',
                  fontWeight: '700',
                  background: currentProblem < DEMO_PROBLEMS.length - 1
                    ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                    : 'rgba(255,255,255,0.08)',
                  color: 'white',
                  border: 'none',
                  borderRadius: isMobile ? '8px' : '12px',
                  cursor: currentProblem < DEMO_PROBLEMS.length - 1 ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: currentProblem < DEMO_PROBLEMS.length - 1 ? '0 6px 24px rgba(16, 185, 129, 0.5)' : 'none',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  opacity: currentProblem < DEMO_PROBLEMS.length - 1 ? 1 : 0.4,
                  width: isMobile ? '100%' : 'auto'
                }}
                onMouseEnter={(e) => {
                  if (currentProblem < DEMO_PROBLEMS.length - 1 && !isMobile) {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 12px 48px rgba(16, 185, 129, 0.6)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isMobile) {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = currentProblem < DEMO_PROBLEMS.length - 1 ? '0 6px 24px rgba(16, 185, 129, 0.5)' : 'none'
                  }
                }}
              >
                {currentProblem < DEMO_PROBLEMS.length - 1 ? 'Next Problem →' : 'All Complete! 🎉'}
              </button>
            )}
          </div>

          {/* Feedback Section - Flexibly positioned at bottom */}
          <div style={{ flexShrink: 0 }}>

            {/* Correct Feedback with Explanation */}
            {feedback === 'correct' && (
              <div style={{
                marginTop: isMobile ? '0.75rem' : '1.5rem',
                padding: isMobile ? '0.875rem' : '1.25rem',
                background: 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(5,150,105,0.15) 100%)',
                borderRadius: isMobile ? '10px' : '16px',
                border: '2px solid rgba(16,185,129,0.6)',
                boxShadow: '0 8px 32px rgba(16,185,129,0.4)',
                animation: 'slideInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
              }}>
                {/* Header with emoji and title inline */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? '0.4rem' : '0.75rem',
                  marginBottom: isMobile ? '0.6rem' : '1rem'
                }}>
                  <span style={{ fontSize: isMobile ? '1.25rem' : '2rem' }}>🎉</span>
                  <div style={{
                    fontSize: isMobile ? '1rem' : '1.4rem',
                    fontWeight: '900',
                    color: '#10B981'
                  }}>
                    Perfect! {streak > 1 && `${streak} in a row!`}
                  </div>
                </div>

                {/* Answer and Explanation - vertical on mobile, horizontal on desktop */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr',
                  gap: isMobile ? '0.6rem' : '1rem',
                  alignItems: 'stretch'
                }}>
                  {/* Answer Display */}
                  <div style={{
                    padding: isMobile ? '0.75rem' : '1.25rem',
                    background: 'rgba(0,0,0,0.25)',
                    borderRadius: isMobile ? '8px' : '12px',
                    border: '1px solid rgba(16,185,129,0.3)',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}>
                    <div style={{
                      fontSize: isMobile ? '0.6rem' : '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      fontWeight: '600',
                      marginBottom: isMobile ? '0.3rem' : '0.5rem',
                      opacity: 0.7
                    }}>Answer</div>
                    <div style={{
                      fontSize: isMobile ? '1.25rem' : '1.75rem',
                      fontWeight: '800',
                      color: '#10B981'
                    }}>{answer}</div>
                  </div>

                  {/* Explanation */}
                  {showExplanation && (
                    <div style={{
                      padding: isMobile ? '0.75rem' : '1.25rem',
                      background: 'rgba(0,0,0,0.3)',
                      borderRadius: isMobile ? '8px' : '12px',
                      border: '1px solid rgba(16,185,129,0.2)',
                      textAlign: 'left',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: isMobile ? '0.3rem' : '0.5rem',
                        marginBottom: isMobile ? '0.4rem' : '0.75rem'
                      }}>
                        <span style={{ fontSize: isMobile ? '0.9rem' : '1.25rem' }}>💡</span>
                        <span style={{
                          fontSize: isMobile ? '0.7rem' : '0.85rem',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          color: '#10B981'
                        }}>Explanation</span>
                      </div>
                      <div style={{
                        fontSize: isMobile ? '0.85rem' : '1rem',
                        lineHeight: '1.5',
                        opacity: 0.95,
                        color: 'rgba(255,255,255,0.9)'
                      }}>
                        {problem.explanation}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Incorrect Feedback */}
            {feedback === 'incorrect' && (
              <div style={{
                marginTop: isMobile ? '0.75rem' : '1.5rem',
                padding: isMobile ? '0.75rem 1rem' : '1.25rem 1.5rem',
                background: 'linear-gradient(135deg, rgba(239,68,68,0.2) 0%, rgba(220,38,38,0.15) 100%)',
                borderRadius: isMobile ? '10px' : '16px',
                border: '2px solid rgba(239,68,68,0.5)',
                boxShadow: '0 8px 32px rgba(239,68,68,0.3)',
                animation: 'shake 0.5s ease-in-out',
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? '0.6rem' : '1rem'
              }}>
                <div style={{ fontSize: isMobile ? '1.25rem' : '2rem' }}>❌</div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: isMobile ? '1rem' : '1.4rem',
                    fontWeight: '700',
                    color: '#EF4444',
                    marginBottom: '0.15rem'
                  }}>
                    Not quite!
                  </div>
                  <div style={{
                    fontSize: isMobile ? '0.85rem' : '1rem',
                    opacity: 0.9,
                    lineHeight: 1.4
                  }}>
                    Try again! 💪
                  </div>
                </div>
              </div>
            )}

            {/* Progressive Hint System */}
            {feedback === 'hint' && (
              <div style={{
                marginTop: isMobile ? '0.75rem' : '1.5rem',
                padding: isMobile ? '0.875rem' : '1.25rem',
                background: 'linear-gradient(135deg, rgba(245,158,11,0.25) 0%, rgba(251,191,36,0.15) 100%)',
                borderRadius: isMobile ? '10px' : '16px',
                border: '2px solid rgba(245,158,11,0.6)',
                boxShadow: '0 8px 32px rgba(245,158,11,0.4)'
              }}>
                {/* Header - inline on desktop, stacked on mobile */}
                <div style={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  alignItems: isMobile ? 'flex-start' : 'center',
                  justifyContent: 'space-between',
                  gap: isMobile ? '0.6rem' : '0',
                  marginBottom: isMobile ? '0.6rem' : '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.4rem' : '0.75rem' }}>
                    <span style={{ fontSize: isMobile ? '1.25rem' : '1.75rem' }}>💡</span>
                    <span style={{
                      fontSize: isMobile ? '0.95rem' : '1.3rem',
                      fontWeight: '800',
                      color: '#F59E0B'
                    }}>
                      Hint {currentHint + 1}/{problem.hints.length}
                    </span>
                  </div>

                  {/* Buttons */}
                  <div style={{ display: 'flex', gap: isMobile ? '0.5rem' : '0.75rem', width: isMobile ? '100%' : 'auto' }}>
                    {currentHint < problem.hints.length - 1 && (
                      <button
                        onClick={showNextHint}
                        style={{
                          padding: isMobile ? '0.5rem 0.875rem' : '0.75rem 1.25rem',
                          fontSize: isMobile ? '0.75rem' : '0.9rem',
                          fontWeight: '700',
                          background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: '0 4px 16px rgba(245,158,11,0.4)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          flex: isMobile ? '1' : '0'
                        }}
                      >
                        Next →
                      </button>
                    )}
                    <button
                      onClick={() => setShowAIHelp(true)}
                      style={{
                        padding: isMobile ? '0.5rem 0.875rem' : '0.75rem 1.25rem',
                        fontSize: isMobile ? '0.75rem' : '0.9rem',
                        fontWeight: '700',
                        background: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: '0 4px 16px rgba(20,184,166,0.4)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        flex: isMobile ? '1' : '0'
                      }}
                    >
                      💬 AI
                    </button>
                  </div>
                </div>

                {/* Hint text */}
                <div style={{
                  fontSize: isMobile ? '0.85rem' : '1.1rem',
                  lineHeight: '1.5',
                  padding: isMobile ? '0.75rem' : '1.25rem',
                  background: 'rgba(0,0,0,0.3)',
                  borderRadius: isMobile ? '8px' : '12px',
                  border: '1px solid rgba(245,158,11,0.3)',
                  textAlign: 'left'
                }}>
                  {problem.hints[currentHint]}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Tutor Column - Third column when active */}
      {showAIHelp && !isMobile && (
        <div style={{
          position: 'sticky',
          top: '2rem',
          width: '100%',
          height: '680px',
          background: 'linear-gradient(135deg, rgba(15, 18, 35, 0.98) 0%, rgba(26, 31, 58, 0.95) 100%)',          border: '2px solid rgba(20, 184, 166, 0.3)',
          borderRadius: '32px',
          overflow: 'hidden',
          boxShadow: '0 30px 90px rgba(0, 0, 0, 0.6)',
          animation: 'slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, rgba(20, 184, 166, 0.8), transparent)'
          }} />
          <div style={{
            position: 'relative',
            height: '100%',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <PremiumAIAssistant
              title="AI Tutor"
              subtitle="Powered by Claude Haiku 4.5"
              initialMessage="Hi! I'm your AI tutor. I can help you understand concepts, work through problems step-by-step, and answer any questions you have about your studies."
              context="education"
              examplePrompts={[
                "Help me solve this problem",
                "Explain this concept",
                "Give me a hint",
                "Check my work"
              ]}
              onLLMResponse={handleLLMResponse}
              onClose={() => setShowAIHelp(false)}
            />
          </div>
        </div>
      )}

      {/* Mobile AI Tutor Overlay - Inline with content */}
      {showAIHelp && isMobile && (
        <div style={{
          width: '100%',
          maxWidth: '100%',
          marginTop: '0',
          background: 'linear-gradient(135deg, rgba(15, 18, 35, 0.98) 0%, rgba(26, 31, 58, 0.95) 100%)',
          borderRadius: '0',
          border: 'none',
          borderTop: '2px solid rgba(124, 58, 237, 0.3)',
          borderBottom: '2px solid rgba(124, 58, 237, 0.3)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          minHeight: '500px',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box'
        }}>
          <PremiumAIAssistant
            title="AI Tutor"
            subtitle="Powered by Claude Haiku 4.5"
            initialMessage={isMobile ? "Hi! I'm your AI tutor. Ask me anything!" : "Hi! I'm your AI tutor. I can help you understand concepts and work through problems."}
            context="education"
            examplePrompts={isMobile ? [
              "Explain this concept"
            ] : [
              "Help me solve this problem",
              "Explain this concept",
              "Give me a hint",
              "Check my work"
            ]}
            onLLMResponse={handleLLMResponse}
            onClose={() => setShowAIHelp(false)}
          />
        </div>
      )}

      {isClient && document.getElementById('help-button-container') ? createPortal(helpButton, document.getElementById('help-button-container')!) : null}
    </div>
  )
}
