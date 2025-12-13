'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Script from 'next/script'

export default function RhythmSyncExample() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mascotRef = useRef<any>(null)
  const [isReady, setIsReady] = useState(false)
  const [bpm, setBpm] = useState(120)
  const [isPlaying, setIsPlaying] = useState(false)
  const [beatCount, setBeatCount] = useState(0)
  const [tapTimes, setTapTimes] = useState<number[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

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
        defaultEmotion: 'neutral',
        enableGazeTracking: false,
        enableIdleBehaviors: false
      })

      await mascot.init(canvas)
      mascot.setBackdrop({ enabled: true, radius: 3.5, intensity: 0.9, falloff: 'smooth', edgeSoftness: 0.95, coreTransparency: 0.25, responsive: true })
      mascot.start()
      mascot.setEmotion('joy')
      mascotRef.current = mascot
    }

    initMascot()
    return () => { mascotRef.current?.stop() }
  }, [isReady])

  const startBeat = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    const interval = 60000 / bpm
    setBeatCount(0)
    setIsPlaying(true)

    const beat = () => {
      setBeatCount(c => c + 1)
      mascotRef.current?.express('pulse')
    }
    beat()
    intervalRef.current = setInterval(beat, interval)
  }, [bpm])

  const stopBeat = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = null
    setIsPlaying(false)
  }, [])

  const handleTap = useCallback(() => {
    const now = Date.now()
    setTapTimes(prev => {
      const times = [...prev, now].slice(-5)
      if (times.length >= 2) {
        const intervals = times.slice(1).map((t, i) => t - times[i])
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
        const calculatedBpm = Math.round(60000 / avgInterval)
        if (calculatedBpm >= 40 && calculatedBpm <= 240) {
          setBpm(calculatedBpm)
        }
      }
      return times
    })
    mascotRef.current?.express('bounce')
  }, [])

  useEffect(() => {
    if (isPlaying) {
      stopBeat()
      startBeat()
    }
  }, [bpm, isPlaying, startBeat, stopBeat])

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
          Rhythm Sync
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '30px' }}>Beat-synchronized animations with tap tempo</p>

        <div style={{ width: '350px', height: '350px', border: '2px solid rgba(221, 74, 154, 0.3)', borderRadius: '12px', overflow: 'hidden', background: 'linear-gradient(135deg, #0a0a1a 0%, #16213e 50%, #1a1a2e 100%)', marginBottom: '30px' }}>
          <canvas id="mascot-canvas" ref={canvasRef} style={{ width: '100%', height: '100%' }} />
        </div>

        <div style={{ fontSize: '48px', fontWeight: '700', color: '#DD4A9A', marginBottom: '8px' }}>{bpm} BPM</div>
        <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginBottom: '20px' }}>Beat: {beatCount}</div>

        <input
          type="range"
          min="40"
          max="240"
          value={bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
          style={{ width: '300px', marginBottom: '30px', accentColor: '#DD4A9A' }}
        />

        <div style={{ display: 'flex', gap: '12px', marginBottom: '30px' }}>
          <button
            onClick={isPlaying ? stopBeat : startBeat}
            style={{ padding: '16px 32px', fontSize: '18px', fontWeight: '600', border: 'none', borderRadius: '8px', background: isPlaying ? 'rgba(200,60,60,0.8)' : '#DD4A9A', color: 'white', cursor: 'pointer' }}
          >
            {isPlaying ? 'Stop' : 'Start'}
          </button>
          <button
            onClick={handleTap}
            style={{ padding: '16px 32px', fontSize: '18px', fontWeight: '600', border: '1px solid rgba(64, 144, 206, 0.3)', borderRadius: '8px', background: 'rgba(64, 144, 206, 0.2)', color: 'white', cursor: 'pointer' }}
          >
            Tap Tempo
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '30px' }}>
          {[60, 80, 100, 120, 140, 160].map(b => (
            <button key={b} onClick={() => setBpm(b)} style={{
              padding: '8px 16px', fontSize: '14px', border: '1px solid', borderRadius: '8px', cursor: 'pointer',
              background: bpm === b ? 'rgba(221, 74, 154, 0.3)' : 'rgba(255,255,255,0.05)',
              borderColor: bpm === b ? '#DD4A9A' : 'rgba(255,255,255,0.2)',
              color: 'white',
            }}>
              {b}
            </button>
          ))}
        </div>

        <div style={{ maxWidth: '400px', padding: '20px', background: 'rgba(221, 74, 154, 0.1)', border: '1px solid rgba(221, 74, 154, 0.3)', borderRadius: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '14px', lineHeight: '1.6' }}>
          <strong>Tap Tempo:</strong> Tap the button rhythmically to set the BPM automatically.
        </div>
      </main>
    </>
  )
}
