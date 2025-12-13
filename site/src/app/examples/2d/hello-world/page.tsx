'use client'

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'

export default function HelloWorldExample() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mascotRef = useRef<any>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (!isReady || !canvasRef.current) return

    const initMascot = async () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const EmotiveMascot = (window as any).EmotiveMascot?.default || (window as any).EmotiveMascot
      if (!EmotiveMascot) {
        console.error('EmotiveMascot not loaded')
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
      mascot.setEmotion('joy')
      mascotRef.current = mascot
      ;(window as any).mascot = mascot

      console.log('Mascot ready! Try: mascot.setEmotion("calm")')
    }

    initMascot()

    return () => {
      if (mascotRef.current) {
        mascotRef.current.stop()
      }
    }
  }, [isReady])

  return (
    <>
      <Script
        src="/emotive-engine.js"
        strategy="afterInteractive"
        onLoad={() => setIsReady(true)}
      />

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
          Hello World
        </h1>
        <p style={{
          color: 'rgba(255,255,255,0.6)',
          marginBottom: '30px',
        }}>
          The simplest Emotive Engine example
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
          <canvas
            id="mascot-canvas"
            ref={canvasRef}
            style={{
              width: '100%',
              height: '100%',
              filter: 'drop-shadow(0 20px 60px rgba(0, 0, 0, 0.4))',
            }}
          />
        </div>

        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '30px',
        }}>
          <button
            onClick={() => mascotRef.current?.setEmotion('calm')}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '500',
              border: 'none',
              borderRadius: '8px',
              background: '#DD4A9A',
              color: 'white',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(221, 74, 154, 0.3)',
            }}
          >
            Calm
          </button>
          <button
            onClick={() => mascotRef.current?.setEmotion('excited')}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '500',
              border: 'none',
              borderRadius: '8px',
              background: '#DD4A9A',
              color: 'white',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(221, 74, 154, 0.3)',
            }}
          >
            Excited
          </button>
          <button
            onClick={() => mascotRef.current?.setEmotion('sadness')}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '500',
              border: 'none',
              borderRadius: '8px',
              background: '#DD4A9A',
              color: 'white',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(221, 74, 154, 0.3)',
            }}
          >
            Sadness
          </button>
        </div>

        <div style={{
          maxWidth: '600px',
          padding: '20px',
          background: 'rgba(221, 74, 154, 0.1)',
          border: '1px solid rgba(221, 74, 154, 0.3)',
          borderRadius: '8px',
          color: 'rgba(255,255,255,0.7)',
          fontSize: '14px',
          lineHeight: '1.6',
        }}>
          <strong>Try these in the browser console:</strong><br />
          <code style={{ background: 'rgba(0,0,0,0.4)', padding: '2px 6px', borderRadius: '4px', color: '#84CFC5' }}>
            mascot.setEmotion(&apos;joy&apos;)
          </code> - Change emotion<br />
          <code style={{ background: 'rgba(0,0,0,0.4)', padding: '2px 6px', borderRadius: '4px', color: '#84CFC5' }}>
            mascot.morphTo(&apos;heart&apos;)
          </code> - Morph shape<br />
          <code style={{ background: 'rgba(0,0,0,0.4)', padding: '2px 6px', borderRadius: '4px', color: '#84CFC5' }}>
            mascot.express(&apos;bounce&apos;)
          </code> - Trigger gesture
        </div>
      </main>
    </>
  )
}
