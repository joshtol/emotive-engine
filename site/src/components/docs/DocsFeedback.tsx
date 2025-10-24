'use client'

import { useState } from 'react'

interface DocsFeedbackProps {
  docPath: string
}

export default function DocsFeedback({ docPath }: DocsFeedbackProps) {
  const [feedback, setFeedback] = useState<'helpful' | 'not-helpful' | null>(null)
  const [showThankYou, setShowThankYou] = useState(false)

  const submitFeedback = async (isHelpful: boolean) => {
    setFeedback(isHelpful ? 'helpful' : 'not-helpful')
    setShowThankYou(true)

    // Hide thank you message after 3 seconds
    setTimeout(() => setShowThankYou(false), 3000)

    // In production, send to Firestore
    try {
      // Example Firestore call (uncomment when ready):
      // const { collection, addDoc } = await import('firebase/firestore')
      // const { db } = await import('@/lib/firebase')
      //
      // await addDoc(collection(db, 'doc_feedback'), {
      //   docPath,
      //   helpful: isHelpful,
      //   timestamp: new Date(),
      //   userAgent: navigator.userAgent,
      // })

    } catch (error) {
      console.error('Failed to submit feedback:', error)
    }
  }

  return (
    <div style={{
      marginTop: '3rem',
      padding: '1.5rem',
      background: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid rgba(102, 126, 234, 0.2)',
      borderRadius: '12px',
    }}>
      {!showThankYou ? (
        <>
          <div style={{
            fontSize: '1rem',
            fontWeight: '600',
            marginBottom: '1rem',
            color: 'rgba(255, 255, 255, 0.9)',
          }}>
            Was this page helpful?
          </div>

          <div style={{
            display: 'flex',
            gap: '1rem',
          }}>
            <button
              onClick={() => submitFeedback(true)}
              disabled={feedback !== null}
              style={{
                padding: '0.75rem 1.5rem',
                background: feedback === 'helpful' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(102, 126, 234, 0.1)',
                border: feedback === 'helpful' ? '1px solid #10b981' : '1px solid rgba(102, 126, 234, 0.3)',
                borderRadius: '8px',
                color: feedback === 'helpful' ? '#10b981' : 'white',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: feedback !== null ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                opacity: feedback && feedback !== 'helpful' ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (feedback === null) {
                  e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)'
                  e.currentTarget.style.borderColor = '#10b981'
                }
              }}
              onMouseLeave={(e) => {
                if (feedback === null) {
                  e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)'
                  e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.3)'
                }
              }}
            >
              👍 Yes
            </button>

            <button
              onClick={() => submitFeedback(false)}
              disabled={feedback !== null}
              style={{
                padding: '0.75rem 1.5rem',
                background: feedback === 'not-helpful' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(102, 126, 234, 0.1)',
                border: feedback === 'not-helpful' ? '1px solid #ef4444' : '1px solid rgba(102, 126, 234, 0.3)',
                borderRadius: '8px',
                color: feedback === 'not-helpful' ? '#ef4444' : 'white',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: feedback !== null ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                opacity: feedback && feedback !== 'not-helpful' ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (feedback === null) {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'
                  e.currentTarget.style.borderColor = '#ef4444'
                }
              }}
              onMouseLeave={(e) => {
                if (feedback === null) {
                  e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)'
                  e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.3)'
                }
              }}
            >
              👎 No
            </button>
          </div>

          {feedback && (
            <div style={{
              marginTop: '1rem',
              fontSize: '0.85rem',
              color: 'rgba(255, 255, 255, 0.6)',
            }}>
              Help us improve by{' '}
              <a
                href={`https://github.com/joshtol/emotive-engine/issues/new?title=Docs%20Feedback:%20${docPath}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#667eea',
                  textDecoration: 'underline',
                }}
              >
                opening an issue
              </a>
            </div>
          )}
        </>
      ) : (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          color: '#10b981',
          fontSize: '1rem',
          fontWeight: '600',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Thank you for your feedback!
        </div>
      )}
    </div>
  )
}
