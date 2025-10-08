'use client'

import { useState } from 'react'
import Link from 'next/link'
import EmotiveHeader from '@/components/EmotiveHeader'
import EmotiveFooter from '@/components/EmotiveFooter'

export default function HealthcarePage() {
  const [formStep, setFormStep] = useState(0)
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    symptoms: ''
  })

  const formSteps = [
    { label: 'Personal Info', emoji: '👤' },
    { label: 'Medical History', emoji: '📋' },
    { label: 'Current Symptoms', emoji: '🩺' }
  ]

  return (
    <div className="emotive-container">
      <EmotiveHeader />
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0f3a2e 0%, #0a261d 100%)',
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
            color: '#96CEB4'
          }}>
            🏥 Healthcare Forms
          </h1>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
            marginBottom: '1rem',
            opacity: 0.9
          }}>
            Patient Intake with Empathy
          </h2>
          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.3rem)',
            opacity: 0.7,
            maxWidth: '700px',
            margin: '0 auto 2rem auto',
            lineHeight: 1.6
          }}>
            Reduce patient anxiety with empathetic guidance through medical intake forms
            and complex healthcare workflows—transforming stress into confidence.
          </p>
        </div>

        {/* Interactive Demo */}
        <div style={{
          background: 'rgba(150,206,180,0.08)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '3rem 2rem',
          border: '1px solid rgba(150,206,180,0.25)',
          marginBottom: '4rem',
          boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)'
        }}>
          <h3 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            marginBottom: '2rem',
            textAlign: 'center',
            color: '#96CEB4'
          }}>
            Patient Intake Form
          </h3>

          {/* Progress Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '3rem',
            position: 'relative'
          }}>
            {formSteps.map((step, index) => (
              <div
                key={index}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  position: 'relative'
                }}
              >
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: index <= formStep
                    ? 'rgba(150,206,180,0.3)'
                    : 'rgba(255,255,255,0.1)',
                  border: index <= formStep
                    ? '2px solid #96CEB4'
                    : '2px solid rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.5rem auto',
                  fontSize: '2rem',
                  transition: 'all 0.3s'
                }}>
                  {step.emoji}
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  opacity: index <= formStep ? 1 : 0.5
                }}>
                  {step.label}
                </div>
              </div>
            ))}
          </div>

          {/* Form Content */}
          <div style={{
            textAlign: 'center',
            minHeight: '200px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '1rem'
            }}>
              {formSteps[formStep].emoji}
            </div>
            <p style={{
              fontSize: '1.2rem',
              marginBottom: '2rem',
              opacity: 0.9
            }}>
              {formStep === 0 && "Let's start with your basic information. Take your time!"}
              {formStep === 1 && "Great! Now, let's review your medical history."}
              {formStep === 2 && "Almost done! Tell us about your current symptoms."}
            </p>

            <div style={{
              display: 'flex',
              gap: '1rem',
              marginTop: '2rem'
            }}>
              {formStep > 0 && (
                <button
                  onClick={() => setFormStep(formStep - 1)}
                  style={{
                    padding: '1rem 2rem',
                    fontSize: '1.1rem',
                    background: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                >
                  ← Previous
                </button>
              )}
              {formStep < formSteps.length - 1 ? (
                <button
                  onClick={() => setFormStep(formStep + 1)}
                  style={{
                    padding: '1rem 2rem',
                    fontSize: '1.1rem',
                    background: 'linear-gradient(135deg, #96CEB4 0%, #6FAF8D 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(150,206,180,0.4)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={() => setFormStep(0)}
                  style={{
                    padding: '1rem 2rem',
                    fontSize: '1.1rem',
                    background: 'linear-gradient(135deg, #96CEB4 0%, #6FAF8D 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                >
                  ✓ Complete (Restart Demo)
                </button>
              )}
            </div>

            {formStep === formSteps.length - 1 && (
              <div style={{
                marginTop: '2rem',
                padding: '1rem 2rem',
                background: 'rgba(150,206,180,0.2)',
                borderRadius: '8px',
                fontSize: '1.1rem'
              }}>
                🎉 Excellent work! You've completed the intake form.
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
            color: '#96CEB4'
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
              background: 'rgba(150,206,180,0.08)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              borderRadius: '16px',
              border: '1px solid rgba(150,206,180,0.25)',
              boxShadow: '0 4px 20px rgba(31, 38, 135, 0.1)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(150,206,180,0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(31, 38, 135, 0.1)'
            }}
            >
              <h4 style={{ fontSize: '1.3rem', marginBottom: '0.8rem', color: '#96CEB4' }}>
                🤝 Empathetic Guidance
              </h4>
              <p style={{ opacity: 0.8, lineHeight: 1.6 }}>
                Delivers compassionate encouragement and reassurance as patients navigate complex medical forms and sensitive questions.
              </p>
            </div>
            <div style={{
              padding: '2rem',
              background: 'rgba(150,206,180,0.08)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              borderRadius: '16px',
              border: '1px solid rgba(150,206,180,0.25)',
              boxShadow: '0 4px 20px rgba(31, 38, 135, 0.1)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(150,206,180,0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(31, 38, 135, 0.1)'
            }}
            >
              <h4 style={{ fontSize: '1.3rem', marginBottom: '0.8rem', color: '#96CEB4' }}>
                📊 Progress Tracking
              </h4>
              <p style={{ opacity: 0.8, lineHeight: 1.6 }}>
                Clear visual progress indicators reduce anxiety by showing exactly how much remains—making lengthy forms feel manageable.
              </p>
            </div>
            <div style={{
              padding: '2rem',
              background: 'rgba(150,206,180,0.08)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              borderRadius: '16px',
              border: '1px solid rgba(150,206,180,0.25)',
              boxShadow: '0 4px 20px rgba(31, 38, 135, 0.1)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(150,206,180,0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(31, 38, 135, 0.1)'
            }}
            >
              <h4 style={{ fontSize: '1.3rem', marginBottom: '0.8rem', color: '#96CEB4' }}>
                🔒 Privacy Focused
              </h4>
              <p style={{ opacity: 0.8, lineHeight: 1.6 }}>
                Proactively reassures patients about data privacy and HIPAA compliance at every step of the healthcare journey.
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
            color: '#96CEB4'
          }}>
            Target Market
          </h3>
          <p style={{
            fontSize: '1.2rem',
            opacity: 0.8,
            marginBottom: '2rem'
          }}>
            🎯 Epic Systems • Cerner • Clinic Management Platforms • EMR Vendors • Patient Portals
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
              background: 'rgba(150,206,180,0.2)',
              borderRadius: '8px',
              textDecoration: 'none',
              color: 'white',
              fontSize: '1.1rem',
              border: '1px solid rgba(150,206,180,0.4)',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(150,206,180,0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(150,206,180,0.2)'
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
