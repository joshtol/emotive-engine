'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Script from 'next/script'

const patterns: Record<string, { times: number[], emotion: string, name: string }> = {
  calm: { times: [4, 4, 4, 4], emotion: 'calm', name: 'Calm' },
  focus: { times: [4, 7, 8, 0], emotion: 'focused', name: 'Focus' },
  sleep: { times: [4, 6, 8, 0], emotion: 'calm', name: 'Sleep' },
  energize: { times: [3, 3, 3, 3], emotion: 'excited', name: 'Energize' },
  meditate: { times: [6, 3, 6, 3], emotion: 'calm', name: 'Meditate' },
  relief: { times: [4, 4, 6, 2], emotion: 'calm', name: 'Relief' },
}

export default function BreathingAppExample() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mascotRef = useRef<any>(null)
  const [isReady, setIsReady] = useState(false)
  const [currentPattern, setCurrentPattern] = useState<string | null>(null)
  const [phase, setPhase] = useState('Ready')
  const [breathCount, setBreathCount] = useState(0)
  const [sessionTime, setSessionTime] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!isReady || !canvasRef.current) return

    const initMascot = async () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const EmotiveMascot = (window as any).EmotiveMascot?.default || (window as any).EmotiveMascot
      if (!EmotiveMascot) return

      canvas.width = 350
      canvas.height = 350

      const mascot = new EmotiveMascot({
        canvasId: 'mascot-canvas',
        targetFPS: 60,
        enableAudio: false,
        defaultEmotion: 'calm',
        enableGazeTracking: false,
        enableIdleBehaviors: true
      })

      await mascot.init(canvas)
      mascot.setBackdrop({ enabled: true, radius: 3.5, intensity: 0.9, blendMode: 'normal', falloff: 'smooth', edgeSoftness: 0.95, coreTransparency: 0.25, responsive: true })
      mascot.setEmotion('calm')
      mascot.morphTo('circle')
      mascot.start()
      mascotRef.current = mascot
    }

    initMascot()
    return () => { mascotRef.current?.stop() }
  }, [isReady])

  const stopBreathing = useCallback(() => {
    if (intervalRef.current) clearTimeout(intervalRef.current)
    if (timerRef.current) clearInterval(timerRef.current)
    intervalRef.current = null
    timerRef.current = null
    setCurrentPattern(null)
    setPhase('Ready')
    mascotRef.current?.setScale({ core: 1.0 })
    mascotRef.current?.setEmotion('calm')
  }, [])

  const startPattern = useCallback((patternName: string) => {
    stopBreathing()
    const pattern = patterns[patternName]
    if (!pattern || !mascotRef.current) return

    setCurrentPattern(patternName)
    setBreathCount(0)
    setSessionTime(0)
    mascotRef.current.setEmotion(pattern.emotion)
    mascotRef.current.morphTo('circle')

    const [inhale, hold1, exhale, hold2] = pattern.times
    const phases = [
      { name: 'Inhale', duration: inhale * 1000, gesture: 'expand', scale: 1.3 },
      { name: 'Hold', duration: hold1 * 1000, gesture: null, scale: 1.3 },
      { name: 'Exhale', duration: exhale * 1000, gesture: 'breathe', scale: 0.9 },
      { name: 'Hold', duration: hold2 * 1000, gesture: null, scale: 0.9 }
    ].filter(p => p.duration > 0)

    let phaseIdx = 0
    const runPhase = () => {
      const current = phases[phaseIdx % phases.length]
      setPhase(current.name)
      if (current.gesture) mascotRef.current?.express(current.gesture)
      mascotRef.current?.setScale({ core: current.scale })
      if (current.name === 'Exhale') setBreathCount(c => c + 1)
      phaseIdx++
      intervalRef.current = setTimeout(runPhase, current.duration)
    }
    runPhase()
    timerRef.current = setInterval(() => setSessionTime(t => t + 1), 1000)
  }, [stopBreathing])

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

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
        <h1 style={{ fontSize: '32px', fontWeight: '600', background: 'linear-gradient(135deg, #DD4A9A 0%, #4090CE 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '8px' }}>
          Breathing App
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '30px' }}>Guided breathing exercises with visual feedback</p>

        <div style={{
          width: '350px', height: '350px', margin: '0 auto 30px', borderRadius: '50%',
          border: '2px solid rgba(221, 74, 154, 0.3)', boxShadow: currentPattern ? '0 8px 60px rgba(64, 144, 206, 0.4)' : '0 8px 32px rgba(221, 74, 154, 0.15)',
          overflow: 'hidden', background: 'radial-gradient(circle, #0a0a1a 0%, #16213e 100%)', position: 'relative',
          transition: 'box-shadow 0.3s ease',
        }}>
          <canvas id="mascot-canvas" ref={canvasRef} style={{ width: '100%', height: '100%' }} />
          {currentPattern && (
            <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', padding: '8px 20px', background: 'rgba(0,0,0,0.7)', borderRadius: '20px', color: '#84CFC5', fontSize: '14px', fontWeight: '600' }}>
              {phase}
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', maxWidth: '500px', marginBottom: '30px' }}>
          {Object.entries(patterns).map(([key, p]) => (
            <button key={key} onClick={() => startPattern(key)} style={{
              padding: '16px 12px', textAlign: 'center', border: 'none', borderRadius: '8px', cursor: 'pointer',
              background: currentPattern === key ? 'rgba(64, 144, 206, 0.3)' : 'rgba(221, 74, 154, 0.2)',
              borderWidth: '1px', borderStyle: 'solid',
              borderColor: currentPattern === key ? '#4090CE' : 'rgba(221, 74, 154, 0.3)',
              color: 'white',
            }}>
              <span style={{ display: 'block', fontWeight: '600', marginBottom: '4px' }}>{p.name}</span>
              <span style={{ display: 'block', fontSize: '12px', color: '#84CFC5', opacity: 0.8 }}>{p.times.join('-')}</span>
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', maxWidth: '400px', marginBottom: '20px' }}>
          <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(42, 42, 42, 0.6)', borderRadius: '12px' }}>
            <div style={{ fontSize: '12px', color: '#B8B8B8', marginBottom: '8px' }}>Session Time</div>
            <div style={{ fontSize: '24px', fontWeight: '600', color: '#DD4A9A' }}>{formatTime(sessionTime)}</div>
          </div>
          <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(42, 42, 42, 0.6)', borderRadius: '12px' }}>
            <div style={{ fontSize: '12px', color: '#B8B8B8', marginBottom: '8px' }}>Breaths</div>
            <div style={{ fontSize: '24px', fontWeight: '600', color: '#DD4A9A' }}>{breathCount}</div>
          </div>
          <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(42, 42, 42, 0.6)', borderRadius: '12px' }}>
            <div style={{ fontSize: '12px', color: '#B8B8B8', marginBottom: '8px' }}>Phase</div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#DD4A9A' }}>{phase}</div>
          </div>
        </div>

        {currentPattern && (
          <button onClick={stopBreathing} style={{ padding: '12px 24px', fontSize: '16px', border: '1px solid rgba(64, 144, 206, 0.3)', borderRadius: '8px', background: 'rgba(64, 144, 206, 0.2)', color: 'white', cursor: 'pointer' }}>
            Stop Session
          </button>
        )}
      </main>
    </>
  )
}
