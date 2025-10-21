'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import PremiumAIAssistant from '@/components/PremiumAIAssistant'

interface FormField {
  label: string
  value: string
  required: boolean
}

interface IntakeStep {
  id: number
  title: string
  icon: string
  fields: FormField[]
}

interface PatientIntakeSimulationProps {
  onStepChange?: (step: number, emotion: string) => void
  openAIChat?: () => void
}

const INTAKE_STEPS: IntakeStep[] = [
  {
    id: 0,
    title: 'Personal Information',
    icon: '👤',
    fields: [
      { label: 'Full Name', value: '', required: true },
      { label: 'Date of Birth', value: '', required: true },
      { label: 'Contact Number', value: '', required: true },
    ]
  },
  {
    id: 1,
    title: 'Insurance Details',
    icon: '💳',
    fields: [
      { label: 'Insurance Provider', value: '', required: true },
      { label: 'Policy Number', value: '', required: true },
      { label: 'Group Number', value: '', required: false },
    ]
  },
  {
    id: 2,
    title: 'Medical History',
    icon: '📋',
    fields: [
      { label: 'Current Medications', value: '', required: false },
      { label: 'Known Allergies', value: '', required: true },
      { label: 'Existing Conditions', value: '', required: false },
    ]
  },
  {
    id: 3,
    title: 'Review & Consent',
    icon: '✓',
    fields: [
      { label: 'HIPAA Consent', value: '', required: true },
      { label: 'Treatment Authorization', value: '', required: true },
    ]
  }
]

export default function PatientIntakeSimulation({ onStepChange, openAIChat }: PatientIntakeSimulationProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<IntakeStep[]>(INTAKE_STEPS)
  const [processing, setProcessing] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [showAIHelp, setShowAIHelp] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mascotRef = useRef<any>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Expose the open AI chat function to parent
  useEffect(() => {
    if (openAIChat) {
      (window as any).__openHealthcareAIChat = () => setShowAIHelp(true)
    }
    return () => {
      delete (window as any).__openHealthcareAIChat
    }
  }, [openAIChat])

  // Detect client-side mounting
  useEffect(() => {
    setIsClient(true)
  }, [])

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
        if (!EmotiveMascot) return

        const canvas = canvasRef.current
        if (!canvas) return

        const rect = canvas.getBoundingClientRect()
        const dpr = window.devicePixelRatio || 1
        canvas.setAttribute('width', Math.round(rect.width * dpr).toString())
        canvas.setAttribute('height', Math.round(rect.height * dpr).toString())

        const mascot = new EmotiveMascot({
          canvasId: 'patient-intake-mascot',
          enableAudio: false,
          soundEnabled: false,
          defaultEmotion: 'calm',
          enableGazeTracking: false,
          enableIdleBehaviors: true,
          targetFPS: isMobile ? 30 : 60,
          maxParticles: isMobile ? 50 : 100,
          primaryColor: '#4A90E2',  // Medical blue
          secondaryColor: '#10B981', // Healing green
        })

        await mascot.init(canvas)
        mascot.start()

        mascot.setPosition(0, 0, 0)
        mascot.setScale({
          core: isMobile ? 0.7 : 1.2,
          particles: isMobile ? 1.0 : 1.8
        })

        mascot.setBackdrop({
          enabled: true,
          radius: 3.0,
          intensity: 0.8,
          blendMode: 'normal',
          falloff: 'smooth',
          edgeSoftness: 0.95,
          coreTransparency: 0.3,
          responsive: true,
          color: '#4A90E2'
        })

        mascotRef.current = mascot

        // Calming breath gesture
        setTimeout(() => {
          mascot.express?.('breathe')
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

  // Handle step changes
  useEffect(() => {
    if (onStepChange) {
      onStepChange(currentStep, 'calm')
    }
  }, [currentStep, onStepChange])

  const handleNextStep = async () => {
    if (currentStep < INTAKE_STEPS.length - 1) {
      // Progress to next step
      setCurrentStep(currentStep + 1)

      // Mascot gives encouraging nod
      if (mascotRef.current && mascotRef.current.express) {
        mascotRef.current.express('nod', { intensity: 0.5, duration: 600 })
      }
    } else {
      // Submit form
      await handleSubmit()
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setProcessing(true)

    // Mascot performs processing animation
    if (mascotRef.current && mascotRef.current.perform) {
      await mascotRef.current.perform('processing', {
        context: {
          anxiety: 0,
          urgency: 'low',
          magnitude: 'moderate'
        }
      })
    }

    await new Promise(resolve => setTimeout(resolve, 2500))

    setProcessing(false)
    setCompleted(true)

    // Mascot celebrates successful completion!
    await handleLLMResponse({
      message: '',
      emotion: 'joy',
      sentiment: 'positive',
      action: 'celebrate',
      anxietyLevel: 0,
      shape: 'sun',
      gesture: 'sparkle'
    })

    // Add glow effect
    setTimeout(() => {
      if (mascotRef.current && mascotRef.current.express) {
        mascotRef.current.express('glow', { intensity: 0.8, duration: 2000 })
      }
    }, 500)

    // Return to calm state
    setTimeout(async () => {
      if (mascotRef.current) {
        if (mascotRef.current.setEmotion) {
          mascotRef.current.setEmotion('calm', 0.5)
        }
        if (mascotRef.current.morphTo) {
          mascotRef.current.morphTo('circle', { duration: 1500 })
        }
      }
    }, 3000)
  }

  const handleReset = () => {
    setCurrentStep(0)
    setFormData(INTAKE_STEPS)
    setProcessing(false)
    setCompleted(false)
  }

  const handleLLMResponse = async (response: any) => {
    if (!mascotRef.current) return

    if (mascotRef.current.handleLLMResponse) {
      try {
        await mascotRef.current.handleLLMResponse(response)
      } catch (error) {
        console.error('Error handling LLM response:', error)
        if (mascotRef.current.setEmotion) {
          mascotRef.current.setEmotion(response.emotion, 0.8)
        }
      }
    } else {
      if (mascotRef.current.setEmotion) {
        mascotRef.current.setEmotion(response.emotion, 0.8)
      }
      if (response.shape && mascotRef.current.morphTo) {
        mascotRef.current.morphTo(response.shape, { duration: 1000 })
      }
      if (response.gesture && mascotRef.current.express) {
        setTimeout(() => {
          if (mascotRef.current && mascotRef.current.express) {
            mascotRef.current.express(response.gesture, { intensity: 0.7 })
          }
        }, 300)
      }
    }
  }

  const currentStepData = INTAKE_STEPS[currentStep]
  const progress = ((currentStep + 1) / INTAKE_STEPS.length) * 100

  // Help button to be rendered in header
  const helpButton = (
    <button
      onClick={() => setShowAIHelp(!showAIHelp)}
      style={{
        padding: '0.6rem 1.25rem',
        background: showAIHelp
          ? 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)'
          : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        borderRadius: '10px',
        fontSize: '0.9rem',
        fontWeight: '700',
        color: 'white',
        border: showAIHelp
          ? '1px solid rgba(245, 158, 11, 0.3)'
          : '1px solid rgba(16, 185, 129, 0.3)',
        boxShadow: showAIHelp
          ? '0 2px 12px rgba(245, 158, 11, 0.3)'
          : '0 2px 12px rgba(16, 185, 129, 0.3)',
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-1px)'
        e.currentTarget.style.boxShadow = showAIHelp
          ? '0 4px 16px rgba(245, 158, 11, 0.4)'
          : '0 4px 16px rgba(16, 185, 129, 0.4)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = showAIHelp
          ? '0 2px 12px rgba(245, 158, 11, 0.3)'
          : '0 2px 12px rgba(16, 185, 129, 0.3)'
      }}
    >
      <span style={{ fontSize: '1rem' }}>{showAIHelp ? '✕' : '💬'}</span>
      <span>{showAIHelp ? 'Close Chat' : 'Get Help'}</span>
    </button>
  )

  return (
    <div style={{
      position: 'relative',
      minHeight: '800px',
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
      gap: isMobile ? '2rem' : '3rem',
      alignItems: 'center',
      padding: '2rem',
      overflow: 'hidden'
    }}>
      {/* Mascot - Calming Presence */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: isMobile ? '400px' : '600px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        order: isMobile ? 1 : 0,
        transform: showAIHelp && !isMobile ? 'translateX(-10%)' : 'translateX(0)',
        transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        <canvas
          ref={canvasRef}
          id="patient-intake-mascot"
          style={{
            width: '100%',
            height: '100%',
            filter: 'drop-shadow(0 20px 80px rgba(74, 144, 226, 0.6))',
          }}
        />
      </div>

      {/* Form Interface Card */}
      <div style={{
        position: 'relative',
        width: '100%',
        order: isMobile ? 2 : 1,
      }}>
        {/* Glass Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(26, 31, 58, 0.95) 0%, rgba(15, 18, 35, 0.98) 100%)',
          backdropFilter: 'blur(60px)',
          WebkitBackdropFilter: 'blur(60px)',
          borderRadius: '32px',
          padding: 'clamp(2rem, 4vw, 3rem)',
          border: '2px solid rgba(74, 144, 226, 0.2)',
          boxShadow: `
            0 30px 90px rgba(0, 0, 0, 0.5),
            0 0 0 1px rgba(74, 144, 226, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.05)
          `,
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Top accent line */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent, rgba(74, 144, 226, 0.8), transparent)'
          }} />

          {/* Ambient glow */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(74, 144, 226, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
            filter: 'blur(40px)',
          }} />

          {/* Progress indicator */}
          <div style={{
            marginBottom: '2.5rem',
            position: 'relative'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '0.75rem'
            }}>
              {INTAKE_STEPS.map((step, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    position: 'relative'
                  }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: i <= currentStep
                      ? 'linear-gradient(135deg, #4A90E2, #357ABD)'
                      : 'rgba(255, 255, 255, 0.08)',
                    border: i <= currentStep
                      ? '2px solid #4A90E2'
                      : '2px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 0.5rem auto',
                    fontSize: '1.5rem',
                    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: i <= currentStep ? '0 0 20px rgba(74, 144, 226, 0.4)' : 'none'
                  }}>
                    {i < currentStep ? '✓' : step.icon}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    opacity: i <= currentStep ? 1 : 0.4,
                    fontWeight: i === currentStep ? '700' : '500',
                    color: i <= currentStep ? '#4A90E2' : 'rgba(255, 255, 255, 0.4)',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase'
                  }}>
                    {step.title.split(' ')[0]}
                  </div>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div style={{
              height: '6px',
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #4A90E2, #10B981)',
                transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 0 12px rgba(74, 144, 226, 0.5)'
              }} />
            </div>
          </div>

          {/* Main content */}
          <div style={{ position: 'relative', minHeight: '350px' }}>
            {!completed ? (
              <div>
                <h3 style={{
                  fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
                  marginBottom: '1.5rem',
                  background: 'linear-gradient(135deg, #4A90E2 0%, #10B981 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontWeight: '800',
                  letterSpacing: '-0.02em',
                  textAlign: 'center'
                }}>
                  {currentStepData.title}
                </h3>

                {/* Form fields */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                  marginBottom: '2.5rem'
                }}>
                  {currentStepData.fields.map((field, i) => (
                    <div key={i}>
                      <label style={{
                        display: 'block',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        marginBottom: '0.6rem',
                        color: 'rgba(255, 255, 255, 0.9)',
                        letterSpacing: '0.3px'
                      }}>
                        {field.label} {field.required && <span style={{ color: '#F59E0B' }}>*</span>}
                      </label>
                      <input
                        type="text"
                        placeholder={`Enter ${field.label.toLowerCase()}...`}
                        disabled={processing}
                        style={{
                          width: '100%',
                          padding: '1rem 1.25rem',
                          background: 'rgba(0, 0, 0, 0.3)',
                          border: '1px solid rgba(74, 144, 226, 0.2)',
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
                          e.currentTarget.style.borderColor = 'rgba(74, 144, 226, 0.2)'
                          e.currentTarget.style.boxShadow = 'none'
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Navigation buttons */}
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  justifyContent: 'space-between'
                }}>
                  {currentStep > 0 && (
                    <button
                      onClick={handlePrevStep}
                      disabled={processing}
                      style={{
                        padding: '1.2rem 2rem',
                        fontSize: '1.1rem',
                        fontWeight: '700',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: 'white',
                        border: '2px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '14px',
                        cursor: processing ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                        opacity: processing ? 0.5 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (!processing) {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                          e.currentTarget.style.transform = 'translateY(-2px)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                        e.currentTarget.style.transform = 'translateY(0)'
                      }}
                    >
                      ← Back
                    </button>
                  )}
                  <button
                    onClick={handleNextStep}
                    disabled={processing}
                    style={{
                      flex: 1,
                      padding: '1.2rem 2rem',
                      fontSize: '1.1rem',
                      fontWeight: '700',
                      background: processing
                        ? 'rgba(74, 144, 226, 0.3)'
                        : currentStep === INTAKE_STEPS.length - 1
                        ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                        : 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '14px',
                      cursor: processing ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: processing ? 'none' : '0 6px 24px rgba(74, 144, 226, 0.4)',
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase'
                    }}
                    onMouseEnter={(e) => {
                      if (!processing) {
                        e.currentTarget.style.transform = 'translateY(-3px) scale(1.01)'
                        e.currentTarget.style.boxShadow = '0 10px 40px rgba(74, 144, 226, 0.6)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)'
                      e.currentTarget.style.boxShadow = '0 6px 24px rgba(74, 144, 226, 0.4)'
                    }}
                  >
                    {processing
                      ? 'Processing...'
                      : currentStep === INTAKE_STEPS.length - 1
                      ? 'Submit Form'
                      : 'Continue →'}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <h3 style={{
                  fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)',
                  marginBottom: '1.2rem',
                  background: 'linear-gradient(135deg, #10B981 0%, #4A90E2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontWeight: '900',
                  letterSpacing: '-0.02em'
                }}>
                  Form Submitted!
                </h3>
                <p style={{
                  fontSize: '1.25rem',
                  opacity: 0.85,
                  marginBottom: '1rem',
                  lineHeight: 1.7,
                  color: 'rgba(255, 255, 255, 0.8)'
                }}>
                  Look at the mascot celebrating your completion!
                </p>
                <p style={{
                  fontSize: '1.1rem',
                  opacity: 0.75,
                  marginBottom: '2.5rem',
                  lineHeight: 1.7,
                  color: 'rgba(255, 255, 255, 0.7)'
                }}>
                  Your patient intake form has been securely submitted. Our care team will review it before your appointment.
                </p>
                <button
                  onClick={handleReset}
                  style={{
                    padding: '1.4rem 3rem',
                    fontSize: '1.15rem',
                    fontWeight: '700',
                    background: 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)',
                    color: 'white',
                    border: '2px solid rgba(74, 144, 226, 0.3)',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 8px 32px rgba(74, 144, 226, 0.4)',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'
                    e.currentTarget.style.boxShadow = '0 12px 48px rgba(74, 144, 226, 0.6)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)'
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(74, 144, 226, 0.4)'
                  }}
                >
                  Start New Form
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Help Panel */}
      <div style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        width: isMobile ? '100%' : 'calc(50% - 1.5rem)',
        background: 'linear-gradient(135deg, rgba(15, 18, 35, 0.98) 0%, rgba(26, 31, 58, 0.95) 100%)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        border: '2px solid rgba(74, 144, 226, 0.3)',
        borderRadius: '32px',
        transform: showAIHelp ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 50,
        overflow: 'hidden',
        boxShadow: showAIHelp ? '0 30px 90px rgba(0, 0, 0, 0.6), inset 0 0 0 1px rgba(74, 144, 226, 0.1)' : 'none'
      }}>
        {/* Top accent line */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, rgba(74, 144, 226, 0.8), transparent)'
        }} />

        {/* AI Panel Header */}
        <div style={{
          padding: '2rem 2.5rem',
          borderBottom: '2px solid rgba(74, 144, 226, 0.2)',
          background: 'linear-gradient(135deg, rgba(74, 144, 226, 0.15) 0%, rgba(16, 185, 129, 0.08) 100%)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            marginBottom: '0.5rem'
          }}>
            <div style={{
              fontSize: '2.5rem',
              filter: 'drop-shadow(0 4px 16px rgba(74, 144, 226, 0.5))'
            }}>
              🩺
            </div>
            <div>
              <div style={{
                fontWeight: '800',
                fontSize: '1.4rem',
                background: 'linear-gradient(135deg, #4A90E2 0%, #10B981 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.01em'
              }}>
                Care Assistant
              </div>
              <div style={{
                fontSize: '0.9rem',
                opacity: 0.7,
                color: 'rgba(255, 255, 255, 0.6)',
                fontWeight: '500'
              }}>
                I'm here to help you feel comfortable
              </div>
            </div>
          </div>
        </div>

        {/* AI Assistant Content - Full Height */}
        <div style={{
          position: 'relative',
          height: '100%',
          overflow: 'hidden',
          zIndex: 10,
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            flex: 1,
            overflow: 'hidden',
            borderRadius: '32px'
          }}>
            <PremiumAIAssistant
              title="Healthcare Assistant"
              subtitle="Powered by Claude Haiku 4.5"
              initialMessage="Hi! I'm your healthcare assistant. I can help you with patient intake forms, insurance questions, and appointment scheduling."
              context="healthcare"
              examplePrompts={[
                "Help me fill out my forms",
                "What insurance do you accept?",
                "Schedule an appointment",
                "I need my medical records"
              ]}
              onLLMResponse={handleLLMResponse}
              onClose={() => setShowAIHelp(false)}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* Render help button in header using portal */}
      {isClient && document.getElementById('healthcare-help-button-container') ? (
        createPortal(helpButton, document.getElementById('healthcare-help-button-container')!)
      ) : null}
    </div>
  )
}
