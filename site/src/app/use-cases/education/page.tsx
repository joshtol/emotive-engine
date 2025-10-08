'use client'

import { useState } from 'react'
import Link from 'next/link'
import EmotiveHeader from '@/components/EmotiveHeader'
import EmotiveFooter from '@/components/EmotiveFooter'


export default function EducationPage() {
  const [problemIndex, setProblemIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState('')

  const problems = [
    { question: '12 + 8 = ?', correctAnswer: '20' },
    { question: '15 - 7 = ?', correctAnswer: '8' },
    { question: '6 × 4 = ?', correctAnswer: '24' }
  ]

  const checkAnswer = () => {
    if (answer === problems[problemIndex].correctAnswer) {
      setFeedback('correct')
      setTimeout(() => {
        if (problemIndex < problems.length - 1) {
          setProblemIndex(problemIndex + 1)
          setAnswer('')
          setFeedback('')
        }
      }, 2000)
    } else if (answer) {
      setFeedback('hint')
    }
  }

  return (
    <div className="emotive-container">
      <EmotiveHeader />
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #1a2a3a 0%, #0f1923 100%)',
        color: 'white',
        padding: '2rem'
      }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <Link
          href="/"
          style={{
            color: 'rgba(255,255,255,0.7)',
            textDecoration: 'none',
            fontSize: '1rem',
            display: 'inline-block',
            marginBottom: '3rem',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'white'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
          }}
        >
          ← Back to Portfolio
        </Link>

        {/* Hero */}
        <div style={{
          textAlign: 'center',
          marginBottom: '4rem'
        }}>
          <h1 style={{
            fontSize: 'clamp(3rem, 8vw, 5rem)',
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: '#45B7D1'
          }}>
            📚 Education Tutor
          </h1>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
            marginBottom: '1rem',
            opacity: 0.9
          }}>
            Personalized Emotional Support
          </h2>
          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.3rem)',
            opacity: 0.7,
            maxWidth: '700px',
            margin: '0 auto 2rem auto',
            lineHeight: 1.6
          }}>
            Adaptive AI tutor that provides encouragement, hints, and emotional support
            during learning. Makes difficult subjects less intimidating.
          </p>
        </div>

        {/* Interactive Demo */}
        <div style={{
          background: 'rgba(69,183,209,0.08)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '3rem 2rem',
          border: '1px solid rgba(69,183,209,0.25)',
          marginBottom: '4rem',
          boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)'
        }}>
          <h3 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            marginBottom: '2rem',
            textAlign: 'center',
            color: '#45B7D1'
          }}>
            Try the Math Tutor
          </h3>

          <div style={{
            textAlign: 'center',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            {/* Progress */}
            <div style={{
              marginBottom: '2rem',
              fontSize: '1rem',
              opacity: 0.8
            }}>
              Problem {problemIndex + 1} of {problems.length}
            </div>

            {/* Problem */}
            <div style={{
              fontSize: '3rem',
              fontWeight: 'bold',
              marginBottom: '2rem',
              color: '#45B7D1'
            }}>
              {problems[problemIndex].question}
            </div>

            {/* Input */}
            <div style={{
              marginBottom: '2rem'
            }}>
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') checkAnswer()
                }}
                placeholder="Your answer"
                style={{
                  padding: '1rem 2rem',
                  fontSize: '1.5rem',
                  width: '200px',
                  textAlign: 'center',
                  background: 'rgba(255,255,255,0.1)',
                  border: '2px solid rgba(69,183,209,0.5)',
                  borderRadius: '8px',
                  color: 'white',
                  outline: 'none'
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={checkAnswer}
              disabled={!answer}
              style={{
                padding: '1rem 3rem',
                fontSize: '1.2rem',
                fontWeight: '600',
                background: answer
                  ? 'linear-gradient(135deg, #45B7D1 0%, #3498DB 100%)'
                  : 'rgba(255,255,255,0.1)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: answer ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s',
                opacity: answer ? 1 : 0.5
              }}
              onMouseEnter={(e) => {
                if (answer) {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(69,183,209,0.4)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              Check Answer
            </button>

            {/* Feedback */}
            {feedback === 'correct' && (
              <div style={{
                marginTop: '2rem',
                padding: '1.5rem 2rem',
                background: 'rgba(76,209,55,0.2)',
                borderRadius: '12px',
                fontSize: '1.3rem',
                border: '2px solid rgba(76,209,55,0.5)'
              }}>
                🎉 Excellent! You got it right!
              </div>
            )}

            {feedback === 'hint' && (
              <div style={{
                marginTop: '2rem',
                padding: '1.5rem 2rem',
                background: 'rgba(255,200,87,0.2)',
                borderRadius: '12px',
                fontSize: '1.1rem',
                border: '2px solid rgba(255,200,87,0.5)'
              }}>
                🤔 Not quite. Think about it step by step. You're doing great!
              </div>
            )}

            {problemIndex === problems.length - 1 && feedback === 'correct' && (
              <div style={{
                marginTop: '2rem',
                padding: '1.5rem 2rem',
                background: 'rgba(69,183,209,0.2)',
                borderRadius: '12px',
                fontSize: '1.1rem',
                border: '2px solid rgba(69,183,209,0.5)'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
                <div>All problems complete! You're amazing!</div>
                <button
                  onClick={() => {
                    setProblemIndex(0)
                    setAnswer('')
                    setFeedback('')
                  }}
                  style={{
                    marginTop: '1rem',
                    padding: '0.8rem 2rem',
                    fontSize: '1rem',
                    background: 'rgba(69,183,209,0.3)',
                    color: 'white',
                    border: '1px solid rgba(69,183,209,0.5)',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Start Over
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Key Features */}
        <div style={{
          marginBottom: '4rem'
        }}>
          <h3 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            marginBottom: '2rem',
            textAlign: 'center',
            color: '#45B7D1'
          }}>
            Key Features
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            <div style={{
              padding: '2rem',
              background: 'rgba(69,183,209,0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(69,183,209,0.2)'
            }}>
              <h4 style={{ fontSize: '1.3rem', marginBottom: '0.8rem', color: '#45B7D1' }}>
                💡 Adaptive Hints
              </h4>
              <p style={{ opacity: 0.8, lineHeight: 1.6 }}>
                Provides progressive hints based on struggle level without giving away answers.
              </p>
            </div>
            <div style={{
              padding: '2rem',
              background: 'rgba(69,183,209,0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(69,183,209,0.2)'
            }}>
              <h4 style={{ fontSize: '1.3rem', marginBottom: '0.8rem', color: '#45B7D1' }}>
                🎯 Personalized Pacing
              </h4>
              <p style={{ opacity: 0.8, lineHeight: 1.6 }}>
                Adjusts difficulty and speed based on student's emotional state and performance.
              </p>
            </div>
            <div style={{
              padding: '2rem',
              background: 'rgba(69,183,209,0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(69,183,209,0.2)'
            }}>
              <h4 style={{ fontSize: '1.3rem', marginBottom: '0.8rem', color: '#45B7D1' }}>
                🌟 Encouragement
              </h4>
              <p style={{ opacity: 0.8, lineHeight: 1.6 }}>
                Celebrates successes and provides emotional support during challenges.
              </p>
            </div>
          </div>
        </div>

        {/* Target Market */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '16px',
          padding: '3rem 2rem',
          border: '1px solid rgba(255,255,255,0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            marginBottom: '1.5rem',
            color: '#45B7D1'
          }}>
            Target Market
          </h3>
          <p style={{
            fontSize: '1.2rem',
            opacity: 0.8,
            marginBottom: '2rem'
          }}>
            🎯 EdTech Platforms • Online Learning Companies • Khan Academy • Duolingo
          </p>
        </div>

        {/* Footer Navigation */}
        <div style={{
          marginTop: '4rem',
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <Link
            href="/"
            style={{
              display: 'inline-block',
              padding: '1rem 2rem',
              background: 'rgba(69,183,209,0.2)',
              borderRadius: '8px',
              textDecoration: 'none',
              color: 'white',
              fontSize: '1.1rem',
              border: '1px solid rgba(69,183,209,0.4)',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(69,183,209,0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(69,183,209,0.2)'
            }}
          >
            ← Back to All Use Cases
          </Link>
        </div>
      </div>
    </div>
      <EmotiveFooter />
    </div>
  )
}
