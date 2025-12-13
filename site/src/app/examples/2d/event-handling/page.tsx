'use client'

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'

interface LogEntry {
  id: number
  time: string
  type: string
  data: string
}

export default function EventHandlingExample() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mascotRef = useRef<any>(null)
  const [isReady, setIsReady] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [filter, setFilter] = useState('all')
  const logIdRef = useRef(0)

  const addLog = (type: string, data: any) => {
    const time = new Date().toLocaleTimeString()
    const entry: LogEntry = {
      id: logIdRef.current++,
      time,
      type,
      data: typeof data === 'object' ? JSON.stringify(data) : String(data)
    }
    setLogs(prev => [entry, ...prev].slice(0, 50))
  }

  useEffect(() => {
    if (!isReady || !canvasRef.current) return

    const initMascot = async () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const EmotiveMascot = (window as any).EmotiveMascot?.default || (window as any).EmotiveMascot
      if (!EmotiveMascot) return

      canvas.width = 300
      canvas.height = 300

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

      // Register event listeners
      mascot.on('emotionChange', (data: any) => addLog('emotion', data))
      mascot.on('morphStart', (data: any) => addLog('morph', data))
      mascot.on('morphComplete', (data: any) => addLog('morph', data))
      mascot.on('gestureStart', (data: any) => addLog('gesture', data))
      mascot.on('gestureComplete', (data: any) => addLog('gesture', data))
      mascot.on('stateChange', (data: any) => addLog('state', data))

      mascot.start()
      mascot.setEmotion('joy')
      mascotRef.current = mascot
      addLog('system', 'Mascot initialized')
    }

    initMascot()
    return () => { mascotRef.current?.stop() }
  }, [isReady])

  const filteredLogs = filter === 'all' ? logs : logs.filter(l => l.type === filter)

  const buttonStyle = {
    padding: '10px 16px', fontSize: '14px', border: 'none', borderRadius: '8px',
    background: '#DD4A9A', color: 'white', cursor: 'pointer',
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
        <h1 style={{ fontSize: '32px', fontWeight: '600', background: 'linear-gradient(135deg, #DD4A9A 0%, #4090CE 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '8px' }}>
          Event Handling
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '30px' }}>Monitor mascot events in real-time</p>

        <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '900px' }}>
          {/* Left: Canvas and controls */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '300px', height: '300px', border: '2px solid rgba(221, 74, 154, 0.3)', borderRadius: '12px', overflow: 'hidden', background: 'linear-gradient(135deg, #0a0a1a 0%, #16213e 50%, #1a1a2e 100%)', marginBottom: '20px' }}>
              <canvas id="mascot-canvas" ref={canvasRef} style={{ width: '100%', height: '100%' }} />
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '16px' }}>
              <button onClick={() => mascotRef.current?.setEmotion('joy')} style={buttonStyle}>Joy</button>
              <button onClick={() => mascotRef.current?.setEmotion('calm')} style={buttonStyle}>Calm</button>
              <button onClick={() => mascotRef.current?.setEmotion('excited')} style={buttonStyle}>Excited</button>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '16px' }}>
              <button onClick={() => mascotRef.current?.morphTo('heart')} style={buttonStyle}>Heart</button>
              <button onClick={() => mascotRef.current?.morphTo('star')} style={buttonStyle}>Star</button>
              <button onClick={() => mascotRef.current?.morphTo('circle')} style={buttonStyle}>Circle</button>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button onClick={() => mascotRef.current?.express('bounce')} style={buttonStyle}>Bounce</button>
              <button onClick={() => mascotRef.current?.express('spin')} style={buttonStyle}>Spin</button>
            </div>
          </div>

          {/* Right: Event log */}
          <div style={{ flex: 1, minWidth: '350px', maxWidth: '450px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
              {['all', 'emotion', 'morph', 'gesture', 'state', 'system'].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding: '6px 12px', fontSize: '12px', border: '1px solid', borderRadius: '16px', cursor: 'pointer',
                  background: filter === f ? 'rgba(64, 144, 206, 0.3)' : 'transparent',
                  borderColor: filter === f ? '#4090CE' : 'rgba(255,255,255,0.2)',
                  color: filter === f ? '#4090CE' : 'rgba(255,255,255,0.6)',
                }}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
              <button onClick={() => setLogs([])} style={{ ...buttonStyle, padding: '6px 12px', fontSize: '12px', background: 'rgba(100,100,100,0.3)' }}>Clear</button>
            </div>

            <div style={{ height: '400px', overflowY: 'auto', background: 'rgba(0,0,0,0.4)', borderRadius: '8px', padding: '12px', fontFamily: 'monospace', fontSize: '12px' }}>
              {filteredLogs.length === 0 ? (
                <div style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '20px' }}>No events yet. Try clicking the buttons!</div>
              ) : (
                filteredLogs.map(log => (
                  <div key={log.id} style={{ padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>{log.time}</span>
                    <span style={{ color: '#DD4A9A', marginLeft: '8px' }}>[{log.type}]</span>
                    <span style={{ color: '#84CFC5', marginLeft: '8px' }}>{log.data}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
