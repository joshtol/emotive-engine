'use client'

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'

const emotions = ['joy', 'calm', 'excited', 'sadness', 'love', 'focused']
const shapes = ['circle', 'heart', 'star', 'sun', 'moon']
const gestures = ['bounce', 'spin', 'pulse', 'glow', 'breathe']

export default function BasicUsageExample() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mascotRef = useRef<any>(null)
  const [isReady, setIsReady] = useState(false)
  const [isAnimating, setIsAnimating] = useState(true)
  const [status, setStatus] = useState('Initializing...')

  useEffect(() => {
    if (!isReady || !canvasRef.current) return

    const initMascot = async () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const EmotiveMascot = (window as any).EmotiveMascot?.default || (window as any).EmotiveMascot
      if (!EmotiveMascot) {
        setStatus('Error: EmotiveMascot not loaded')
        return
      }

      canvas.width = 400
      canvas.height = 400

      const mascot = new EmotiveMascot({
        canvasId: 'mascot-canvas',
        targetFPS: 60,
        enableAudio: false,
        defaultEmotion: 'neutral',
        enableGazeTracking: false,
        enableIdleBehaviors: false
      })

      await mascot.init(canvas)

      mascot.setBackdrop({
        enabled: true,
        radius: 3.5,
        intensity: 0.9,
        blendMode: 'normal',
        falloff: 'smooth',
        edgeSoftness: 0.95,
        coreTransparency: 0.25,
        responsive: true
      })

      mascot.start()
      mascotRef.current = mascot
      ;(window as any).mascot = mascot

      setTimeout(() => {
        mascot.setEmotion('joy')
        setTimeout(() => mascot.express('bounce'), 300)
        setStatus('Ready! Try the buttons or keyboard shortcuts.')
      }, 500)
    }

    initMascot()

    // Keyboard shortcuts
    const handleKeydown = (e: KeyboardEvent) => {
      if (!mascotRef.current) return
      switch(e.key.toLowerCase()) {
        case ' ':
          e.preventDefault()
          randomAction()
          break
        case 'b':
          mascotRef.current.express('bounce')
          setStatus('Bounce!')
          break
        case 's':
          mascotRef.current.express('spin')
          setStatus('Spin!')
          break
      }
    }
    document.addEventListener('keydown', handleKeydown)

    return () => {
      document.removeEventListener('keydown', handleKeydown)
      if (mascotRef.current) mascotRef.current.stop()
    }
  }, [isReady])

  const setEmotion = (emotion: string) => {
    if (!mascotRef.current) return
    mascotRef.current.setEmotion(emotion)
    setStatus(`Emotion: ${emotion}`)

    const emotionGestures: Record<string, string> = {
      joy: 'bounce', calm: 'breathe', excited: 'spin',
      sadness: 'pulse', love: 'glow', focused: 'pulse'
    }
    const gesture = emotionGestures[emotion]
    if (gesture) setTimeout(() => mascotRef.current?.express(gesture), 300)
  }

  const toggleAnimation = () => {
    if (!mascotRef.current) return
    if (isAnimating) {
      mascotRef.current.stop()
      setIsAnimating(false)
      setStatus('Animation stopped')
    } else {
      mascotRef.current.start()
      setIsAnimating(true)
      setStatus('Animation started')
    }
  }

  const randomAction = () => {
    if (!mascotRef.current) return
    const actions = [
      () => {
        const emotion = emotions[Math.floor(Math.random() * emotions.length)]
        setEmotion(emotion)
      },
      () => {
        const gesture = gestures[Math.floor(Math.random() * gestures.length)]
        mascotRef.current.express(gesture)
        setStatus(`Gesture: ${gesture}`)
      },
      () => {
        const shape = shapes[Math.floor(Math.random() * shapes.length)]
        mascotRef.current.morphTo(shape)
        setStatus(`Shape: ${shape}`)
      }
    ]
    actions[Math.floor(Math.random() * actions.length)]()
  }

  const buttonStyle = {
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: '500' as const,
    border: 'none',
    borderRadius: '8px',
    background: '#DD4A9A',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s',
  }

  const secondaryButtonStyle = {
    ...buttonStyle,
    background: 'rgba(64, 144, 206, 0.2)',
    border: '1px solid rgba(64, 144, 206, 0.3)',
  }

  return (
    <>
      <Script src="/emotive-engine.js" strategy="afterInteractive" onLoad={() => setIsReady(true)} />

      <main style={{
        minHeight: 'calc(100vh - 160px)',
        background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
        color: 'white',
        paddingTop: '100px',
        paddingBottom: '60px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '600',
          background: 'linear-gradient(135deg, #DD4A9A 0%, #4090CE 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '8px',
        }}>
          Basic Usage
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '30px' }}>
          Explore emotions, gestures, and effects
        </p>

        <div style={{
          width: '400px',
          height: '400px',
          border: '2px solid rgba(221, 74, 154, 0.3)',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(221, 74, 154, 0.15)',
          marginBottom: '30px',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #0a0a1a 0%, #16213e 50%, #1a1a2e 100%)',
        }}>
          <canvas id="mascot-canvas" ref={canvasRef} style={{ width: '100%', height: '100%' }} />
        </div>

        <div style={{ maxWidth: '700px', width: '100%', padding: '0 20px' }}>
          {/* Emotions */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ color: '#DD4A9A', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
              Emotions
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {emotions.map(e => (
                <button key={e} onClick={() => setEmotion(e)} style={buttonStyle}>
                  {e.charAt(0).toUpperCase() + e.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Shapes */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ color: '#DD4A9A', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
              Shapes
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
              {shapes.map(s => (
                <button key={s} onClick={() => { mascotRef.current?.morphTo(s); setStatus(`Shape: ${s}`) }} style={buttonStyle}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Gestures */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ color: '#DD4A9A', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
              Gestures
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
              {gestures.map(g => (
                <button key={g} onClick={() => { mascotRef.current?.express(g); setStatus(`Gesture: ${g}`) }} style={buttonStyle}>
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '20px' }}>
            <button onClick={randomAction} style={secondaryButtonStyle}>Random Action</button>
            <button onClick={toggleAnimation} style={secondaryButtonStyle}>
              {isAnimating ? 'Stop' : 'Start'} Animation
            </button>
          </div>

          {/* Status */}
          <div style={{
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '14px',
            textAlign: 'center',
            background: 'rgba(132, 207, 197, 0.2)',
            border: '1px solid rgba(132, 207, 197, 0.3)',
            color: '#84CFC5',
          }}>
            {status}
          </div>
        </div>

        <div style={{
          maxWidth: '700px',
          marginTop: '30px',
          padding: '20px',
          background: 'rgba(221, 74, 154, 0.1)',
          border: '1px solid rgba(221, 74, 154, 0.3)',
          borderRadius: '8px',
          color: 'rgba(255,255,255,0.7)',
          fontSize: '14px',
          lineHeight: '1.6',
        }}>
          <strong>Keyboard shortcuts:</strong> Space = Random | B = Bounce | S = Spin
        </div>
      </main>
    </>
  )
}
