'use client'

import { useState, useRef, useEffect } from 'react'

interface Room {
  id: string
  name: string
  icon: string
  devices: Device[]
}

interface Device {
  id: string
  type: 'light' | 'thermostat' | 'lock' | 'camera' | 'blinds' | 'speaker'
  name: string
  status: boolean | number
  icon: string
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface SmartHomeSimulationProps {
  onDeviceChange?: (deviceType: string, action: string) => void
}

const INITIAL_ROOMS_DESKTOP: Room[] = [
  {
    id: 'living',
    name: 'Living Room',
    icon: '🛋️',
    devices: [
      { id: 'living-light', type: 'light', name: 'Main Lights', status: false, icon: '💡' },
      { id: 'living-temp', type: 'thermostat', name: 'Temperature', status: 72, icon: '🌡️' },
      { id: 'living-blinds', type: 'blinds', name: 'Smart Blinds', status: false, icon: '🪟' },
      { id: 'living-speaker', type: 'speaker', name: 'HomePod', status: false, icon: '🔊' },
    ]
  },
  {
    id: 'bedroom',
    name: 'Bedroom',
    icon: '🛏️',
    devices: [
      { id: 'bedroom-light', type: 'light', name: 'Ambient Lights', status: false, icon: '💡' },
      { id: 'bedroom-temp', type: 'thermostat', name: 'Temperature', status: 68, icon: '🌡️' },
    ]
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    icon: '🍳',
    devices: [
      { id: 'kitchen-light', type: 'light', name: 'Kitchen Lights', status: false, icon: '💡' },
      { id: 'kitchen-camera', type: 'camera', name: 'Security Cam', status: true, icon: '📹' },
    ]
  },
  {
    id: 'entry',
    name: 'Front Door',
    icon: '🚪',
    devices: [
      { id: 'entry-lock', type: 'lock', name: 'Smart Lock', status: true, icon: '🔒' },
      { id: 'entry-camera', type: 'camera', name: 'Doorbell Cam', status: true, icon: '🎥' },
      { id: 'entry-light', type: 'light', name: 'Porch Light', status: false, icon: '💡' },
    ]
  },
]

const INITIAL_ROOMS_MOBILE: Room[] = [
  {
    id: 'living',
    name: 'Living Room',
    icon: '🛋️',
    devices: [
      { id: 'living-light', type: 'light', name: 'Main Lights', status: false, icon: '💡' },
      { id: 'living-temp', type: 'thermostat', name: 'Temperature', status: 72, icon: '🌡️' },
    ]
  },
  {
    id: 'entry',
    name: 'Front Door',
    icon: '🚪',
    devices: [
      { id: 'entry-lock', type: 'lock', name: 'Smart Lock', status: true, icon: '🔒' },
      { id: 'entry-camera', type: 'camera', name: 'Doorbell Cam', status: true, icon: '🎥' },
      { id: 'entry-light', type: 'light', name: 'Porch Light', status: false, icon: '💡' },
    ]
  },
]

export default function SmartHomeSimulation({ onDeviceChange }: SmartHomeSimulationProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [rooms, setRooms] = useState<Room[]>([])
  const [activeScene, setActiveScene] = useState<string | null>(null)
  const [showAIHelp, setShowAIHelp] = useState(false)
  const [energyUsage, setEnergyUsage] = useState(42)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mascotRef = useRef<any>(null)

  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your smart home assistant. I can help you control devices, create scenes, and answer questions."
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    (window as any).__openSmartHomeAIChat = () => setShowAIHelp(true)
    return () => {
      delete (window as any).__openSmartHomeAIChat
    }
  }, [])

  useEffect(() => {
    setIsClient(true)
    const isMobileDevice = window.innerWidth < 768
    setIsMobile(isMobileDevice)
    setRooms(isMobileDevice ? INITIAL_ROOMS_MOBILE : INITIAL_ROOMS_DESKTOP)

    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      setRooms(mobile ? INITIAL_ROOMS_MOBILE : INITIAL_ROOMS_DESKTOP)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Initialize mascot - ONCE
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
          canvasId: 'home-control-mascot',
          enableAudio: false,
          soundEnabled: false,
          defaultEmotion: 'neutral',
          enableGazeTracking: false,
          enableIdleBehaviors: true,
          targetFPS: isMobile ? 30 : 60,
          maxParticles: isMobile ? 40 : 100,
          primaryColor: '#8B5CF6',
          secondaryColor: '#06B6D4',
        })

        await mascot.init(canvas)
        mascot.start()

        mascot.setPosition(0, 0, 0)
        mascot.setScale({
          core: isMobile ? 1.3 : 1.2,
          particles: isMobile ? 1.5 : 1.8
        })

        mascot.setBackdrop({
          enabled: true,
          radius: 3.5,
          intensity: 0.9,
          blendMode: 'normal',
          falloff: 'smooth',
          edgeSoftness: 0.95,
          coreTransparency: 0.2,
          responsive: true
        })

        mascotRef.current = mascot

        setTimeout(() => {
          mascot.express?.('wave')
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

  const toggleDevice = (roomId: string, deviceId: string) => {
    setRooms(prevRooms =>
      prevRooms.map(room =>
        room.id === roomId
          ? {
              ...room,
              devices: room.devices.map(device =>
                device.id === deviceId
                  ? {
                      ...device,
                      status: typeof device.status === 'boolean' ? !device.status : device.status
                    }
                  : device
              )
            }
          : room
      )
    )

    if (mascotRef.current && mascotRef.current.express) {
      mascotRef.current.express('nod', { intensity: 0.4, duration: 400 })
    }

    const device = rooms.find(r => r.id === roomId)?.devices.find(d => d.id === deviceId)
    if (device && onDeviceChange) {
      onDeviceChange(device.type, device.status ? 'off' : 'on')
    }
  }

  const adjustTemperature = (roomId: string, deviceId: string, delta: number) => {
    setRooms(prevRooms =>
      prevRooms.map(room =>
        room.id === roomId
          ? {
              ...room,
              devices: room.devices.map(device =>
                device.id === deviceId && typeof device.status === 'number'
                  ? {
                      ...device,
                      status: Math.max(60, Math.min(85, device.status + delta))
                    }
                  : device
              )
            }
          : room
      )
    )

    if (mascotRef.current && mascotRef.current.express) {
      mascotRef.current.express('pulse', { intensity: 0.3, duration: 300 })
    }
  }

  const activateScene = async (scene: string) => {
    setActiveScene(scene)

    if (scene === 'good-morning') {
      setRooms(prevRooms =>
        prevRooms.map(room => ({
          ...room,
          devices: room.devices.map(device => {
            if (device.type === 'light') return { ...device, status: true }
            if (device.type === 'blinds') return { ...device, status: true }
            if (device.type === 'thermostat') return { ...device, status: 72 }
            return device
          })
        }))
      )

      if (mascotRef.current) {
        if (mascotRef.current.morphTo) {
          mascotRef.current.morphTo('sun', { duration: 1000 })
        }
        if (mascotRef.current.setEmotion) {
          mascotRef.current.setEmotion('euphoria', 0.9)
        }
        if (mascotRef.current.express) {
          await mascotRef.current.express('bounce', { intensity: 0.6, duration: 800 })
        }
      }
    } else if (scene === 'leave-home') {
      setRooms(prevRooms =>
        prevRooms.map(room => ({
          ...room,
          devices: room.devices.map(device => {
            if (device.type === 'light') return { ...device, status: false }
            if (device.type === 'lock') return { ...device, status: true }
            if (device.type === 'camera') return { ...device, status: true }
            if (device.type === 'speaker') return { ...device, status: false }
            if (device.type === 'thermostat') return { ...device, status: 68 }
            return device
          })
        }))
      )

      if (mascotRef.current) {
        if (mascotRef.current.morphTo) {
          mascotRef.current.morphTo('lunar', { duration: 1000 })
        }
        if (mascotRef.current.setEmotion) {
          mascotRef.current.setEmotion('sadness', 0.7)
        }
        if (mascotRef.current.express) {
          await mascotRef.current.express('wave', { intensity: 0.5, duration: 600 })
        }
      }
    } else if (scene === 'movie-night') {
      setRooms(prevRooms =>
        prevRooms.map(room => ({
          ...room,
          devices: room.devices.map(device => {
            if (device.type === 'light' && room.id === 'living') return { ...device, status: false }
            if (device.type === 'blinds') return { ...device, status: false }
            if (device.type === 'speaker' && room.id === 'living') return { ...device, status: true }
            if (device.type === 'thermostat') return { ...device, status: 70 }
            return device
          })
        }))
      )

      if (mascotRef.current) {
        if (mascotRef.current.morphTo) {
          mascotRef.current.morphTo('star', { duration: 1000 })
        }
        if (mascotRef.current.setEmotion) {
          mascotRef.current.setEmotion('excitement', 0.8)
        }
        if (mascotRef.current.express) {
          await mascotRef.current.express('sparkle', { intensity: 0.8, duration: 1000 })
        }
      }
    }

    setTimeout(() => {
      setActiveScene(null)
      if (mascotRef.current) {
        if (mascotRef.current.morphTo) {
          mascotRef.current.morphTo('circle', { duration: 1000 })
        }
        if (mascotRef.current.setEmotion) {
          mascotRef.current.setEmotion('neutral', 0.5)
        }
      }
    }, 2000)
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

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    // Mascot listens
    if (mascotRef.current) {
      if (mascotRef.current.setEmotion) {
        mascotRef.current.setEmotion('neutral', 0.6)
      }
      if (mascotRef.current.express) {
        mascotRef.current.express('settle', { intensity: 0.3, duration: 500 })
      }
    }

    await new Promise(resolve => setTimeout(resolve, 800))

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          context: 'smart-home'
        }),
      })

      if (!res.ok) throw new Error('Failed to get response')

      const data = await res.json()

      setMessages(prev => [...prev, { role: 'assistant', content: data.message }])

      // Trigger mascot reaction
      await handleLLMResponse({
        message: data.message,
        emotion: data.emotion || 'joy',
        sentiment: data.sentiment || 'positive',
        action: data.action || 'none',
        frustrationLevel: data.frustrationLevel || 0,
        shape: data.shape,
        gesture: data.gesture
      })

    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again!"
      }])

      if (mascotRef.current && mascotRef.current.setEmotion) {
        mascotRef.current.setEmotion('surprise', 0.6)
      }
    } finally {
      setLoading(false)
    }
  }

  const activeDevices = rooms.reduce((count, room) => {
    return count + room.devices.filter(d =>
      (typeof d.status === 'boolean' && d.status) ||
      (typeof d.status === 'number')
    ).length
  }, 0)

  const totalDevices = rooms.reduce((count, room) => count + room.devices.length, 0)

  const examplePrompts = isMobile ? [
    "Turn on lights",
    "Set temperature",
    "Lock doors"
  ] : [
    "Turn on living room lights",
    "Set temperature to 72°F",
    "Create movie scene",
    "Lock all doors"
  ]

  // Don't render until client-side
  if (!isClient) {
    return (
      <div style={{
        position: 'relative',
        height: '80vh',
        minHeight: '80vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '1rem' }}>Loading...</div>
      </div>
    )
  }

  return (
    <div style={{
      position: 'relative',
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {isMobile ? (
        <>
          {!showAIHelp ? (
            /* DEVICE CONTROLS VIEW */
            <>
              <div style={{
                height: '22vh',
                minHeight: '140px',
                maxHeight: '180px',
                width: '100%',
                position: 'relative',
                background: 'rgba(0, 0, 0, 0.3)',
                borderBottom: '1px solid rgba(139, 92, 246, 0.3)'
              }}>
                <canvas
                  ref={canvasRef}
                  id="home-control-mascot"
                  style={{
                    width: '100%',
                    height: '100%',
                    filter: 'drop-shadow(0 10px 40px rgba(139, 92, 246, 0.6))',
                  }}
                />
              </div>

              <div style={{
                flex: 1,
                overflow: 'auto',
                padding: '0.75rem',
                background: 'linear-gradient(180deg, rgba(10,10,10,0.95) 0%, rgba(15,15,35,0.98) 100%)'
              }}>
                {/* Scene buttons */}
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  marginBottom: '1rem',
                  flexWrap: 'wrap'
                }}>
                  {[
                    { id: 'good-morning', label: 'Morning', icon: '☀️' },
                    { id: 'leave-home', label: 'Leave', icon: '🚪' },
                    { id: 'movie-night', label: 'Movie', icon: '🍿' }
                  ].map(scene => (
                    <button
                      key={scene.id}
                      onClick={() => activateScene(scene.id)}
                      disabled={activeScene === scene.id}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        background: activeScene === scene.id
                          ? 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)'
                          : 'rgba(139, 92, 246, 0.1)',
                        border: `1px solid ${activeScene === scene.id ? 'rgba(139, 92, 246, 0.5)' : 'rgba(139, 92, 246, 0.3)'}`,
                        borderRadius: '10px',
                        color: 'white',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        cursor: activeScene === scene.id ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <span>{scene.icon}</span>
                      <span>{scene.label}</span>
                    </button>
                  ))}
                </div>

                {/* Rooms grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr',
                  gap: '0.75rem',
                  marginBottom: '1rem'
                }}>
                  {rooms.map((room) => (
                    <div
                      key={room.id}
                      style={{
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(6, 182, 212, 0.05) 100%)',
                        borderRadius: '12px',
                        padding: '1rem',
                        border: '1px solid rgba(139, 92, 246, 0.2)'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.75rem'
                      }}>
                        <span style={{ fontSize: '1.5rem' }}>{room.icon}</span>
                        <h3 style={{
                          fontSize: '1rem',
                          fontWeight: '700',
                          color: '#8B5CF6',
                          margin: 0
                        }}>
                          {room.name}
                        </h3>
                      </div>

                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem'
                      }}>
                        {room.devices.map((device) => (
                          <div
                            key={device.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '0.5rem 0.75rem',
                              background: 'rgba(0, 0, 0, 0.2)',
                              borderRadius: '8px'
                            }}
                          >
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}>
                              <span style={{ fontSize: '1.1rem' }}>{device.icon}</span>
                              <span style={{
                                fontSize: '0.85rem',
                                fontWeight: '500'
                              }}>
                                {device.name}
                              </span>
                            </div>

                            {typeof device.status === 'boolean' ? (
                              <button
                                onClick={() => toggleDevice(room.id, device.id)}
                                style={{
                                  padding: '0.35rem 0.75rem',
                                  background: device.status
                                    ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                                    : 'rgba(255, 255, 255, 0.1)',
                                  border: `1px solid ${device.status ? '#10B981' : 'rgba(255, 255, 255, 0.2)'}`,
                                  borderRadius: '6px',
                                  color: 'white',
                                  fontSize: '0.7rem',
                                  fontWeight: '700',
                                  cursor: 'pointer',
                                  textTransform: 'uppercase'
                                }}
                              >
                                {device.status ? 'ON' : 'OFF'}
                              </button>
                            ) : (
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem'
                              }}>
                                <button
                                  onClick={() => adjustTemperature(room.id, device.id, -1)}
                                  style={{
                                    width: '24px',
                                    height: '24px',
                                    background: 'rgba(139, 92, 246, 0.2)',
                                    border: '1px solid rgba(139, 92, 246, 0.4)',
                                    borderRadius: '4px',
                                    color: 'white',
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  −
                                </button>
                                <span style={{
                                  fontSize: '0.85rem',
                                  fontWeight: '700',
                                  color: '#06B6D4',
                                  minWidth: '40px',
                                  textAlign: 'center'
                                }}>
                                  {device.status}°
                                </span>
                                <button
                                  onClick={() => adjustTemperature(room.id, device.id, 1)}
                                  style={{
                                    width: '24px',
                                    height: '24px',
                                    background: 'rgba(139, 92, 246, 0.2)',
                                    border: '1px solid rgba(139, 92, 246, 0.4)',
                                    borderRadius: '4px',
                                    color: 'white',
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  +
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Energy usage */}
                <div style={{
                  padding: '1rem',
                  background: 'rgba(6, 182, 212, 0.1)',
                  borderRadius: '10px',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.75rem'
                }}>
                  <div>
                    <div style={{
                      fontSize: '0.7rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      opacity: 0.7,
                      marginBottom: '0.25rem'
                    }}>
                      Energy Today
                    </div>
                    <div style={{
                      fontSize: '1.5rem',
                      fontWeight: '800',
                      color: '#06B6D4'
                    }}>
                      {energyUsage}%
                    </div>
                  </div>
                  <div style={{ fontSize: '2rem' }}>⚡</div>
                </div>

                <button
                  onClick={() => setShowAIHelp(true)}
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    textTransform: 'uppercase'
                  }}
                >
                  🏠 Ask AI Assistant
                </button>
              </div>
            </>
          ) : (
            /* AI CHAT VIEW */
            <>
              <div style={{
                height: '22vh',
                minHeight: '140px',
                maxHeight: '180px',
                width: '100%',
                position: 'relative',
                background: 'rgba(0, 0, 0, 0.3)',
                borderBottom: '1px solid rgba(139, 92, 246, 0.3)'
              }}>
                <canvas
                  ref={canvasRef}
                  id="home-control-mascot"
                  style={{
                    width: '100%',
                    height: '100%',
                    filter: 'drop-shadow(0 10px 40px rgba(139, 92, 246, 0.6))',
                  }}
                />
              </div>

              {/* Header with close */}
              <div style={{
                padding: '0.75rem 1rem',
                background: 'rgba(0, 0, 0, 0.5)',
                borderBottom: '1px solid rgba(139, 92, 246, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(139, 92, 246, 0.2)',
                    border: '2px solid rgba(139, 92, 246, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem'
                  }}>
                    🏠
                  </div>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#8B5CF6' }}>
                      Home Assistant
                    </div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>
                      Claude Haiku 4.5
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowAIHelp(false)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    fontSize: '1.1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Chat messages */}
              <div style={{
                flex: 1,
                overflow: 'auto',
                padding: '1rem',
                background: 'linear-gradient(180deg, rgba(10,10,10,0.95) 0%, rgba(15,15,35,0.98) 100%)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                {messages.map((msg, i) => (
                  <div key={i} style={{
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%'
                  }}>
                    <div style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '16px',
                      background: msg.role === 'user'
                        ? 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)'
                        : 'rgba(139, 92, 246, 0.1)',
                      border: msg.role === 'user'
                        ? 'none'
                        : '1px solid rgba(139, 92, 246, 0.3)',
                      color: 'white',
                      fontSize: '0.95rem',
                      lineHeight: 1.5
                    }}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div style={{ alignSelf: 'flex-start', maxWidth: '85%' }}>
                    <div style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '16px',
                      background: 'rgba(139, 92, 246, 0.1)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      color: 'white',
                      fontSize: '0.95rem'
                    }}>
                      Typing...
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Example prompts */}
              {messages.length === 1 && (
                <div style={{
                  padding: '0.5rem 1rem 1rem 1rem',
                  background: 'rgba(10,10,10,0.95)',
                  borderTop: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                  <div style={{ fontSize: '0.75rem', opacity: 0.5, marginBottom: '0.5rem' }}>
                    SUGGESTED
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {examplePrompts.map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setInput(prompt)
                        }}
                        style={{
                          padding: '0.75rem',
                          background: 'rgba(139, 92, 246, 0.05)',
                          border: '1px solid rgba(139, 92, 246, 0.2)',
                          borderRadius: '10px',
                          color: 'rgba(255, 255, 255, 0.8)',
                          fontSize: '0.85rem',
                          textAlign: 'left',
                          cursor: 'pointer'
                        }}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div style={{
                padding: '1rem',
                background: 'rgba(10,10,10,0.95)',
                borderTop: '1px solid rgba(139, 92, 246, 0.3)',
                display: 'flex',
                gap: '0.75rem'
              }}>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '0.75rem 1rem',
                    background: 'rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '0.95rem',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || loading}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: input.trim() && !loading
                      ? 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)'
                      : 'rgba(139, 92, 246, 0.2)',
                    border: 'none',
                    borderRadius: '10px',
                    color: input.trim() && !loading ? 'white' : 'rgba(255, 255, 255, 0.3)',
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    cursor: input.trim() && !loading ? 'pointer' : 'not-allowed'
                  }}
                >
                  Send
                </button>
              </div>
            </>
          )}
        </>
      ) : (
        /* DESKTOP - Three column layout */
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 500px 1fr',
          gap: '2rem',
          padding: '2rem',
          minHeight: '700px',
          alignItems: 'stretch'
        }}>
          {/* LEFT: Device Controls */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(6, 182, 212, 0.03) 100%)',
            borderRadius: '20px',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            overflow: 'auto'
          }}>
            <div>
              <h2 style={{
                fontSize: '1.8rem',
                fontWeight: '900',
                marginBottom: '0.5rem',
                background: 'linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Home Control
              </h2>
              <p style={{
                fontSize: '1rem',
                color: 'rgba(255, 255, 255, 0.6)',
                margin: 0
              }}>
                {activeDevices} of {totalDevices} devices active
              </p>
            </div>

            {/* Quick Scenes */}
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              flexWrap: 'wrap'
            }}>
              {[
                { id: 'good-morning', label: 'Good Morning', icon: '☀️' },
                { id: 'leave-home', label: 'Leave Home', icon: '🚪' },
                { id: 'movie-night', label: 'Movie Night', icon: '🍿' }
              ].map(scene => (
                <button
                  key={scene.id}
                  onClick={() => activateScene(scene.id)}
                  disabled={activeScene === scene.id}
                  style={{
                    flex: 1,
                    padding: '0.75rem 1.25rem',
                    background: activeScene === scene.id
                      ? 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)'
                      : 'rgba(139, 92, 246, 0.1)',
                    border: `1px solid ${activeScene === scene.id ? 'rgba(139, 92, 246, 0.5)' : 'rgba(139, 92, 246, 0.3)'}`,
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: activeScene === scene.id ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <span>{scene.icon}</span>
                  <span>{scene.label}</span>
                </button>
              ))}
            </div>

            {/* Rooms */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1rem',
              flex: 1
            }}>
              {rooms.map((room) => (
                <div
                  key={room.id}
                  style={{
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(6, 182, 212, 0.05) 100%)',
                    borderRadius: '16px',
                    padding: '1.25rem',
                    border: '1px solid rgba(139, 92, 246, 0.2)'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '1rem'
                  }}>
                    <span style={{ fontSize: '1.5rem' }}>{room.icon}</span>
                    <h3 style={{
                      fontSize: '1.1rem',
                      fontWeight: '700',
                      color: '#8B5CF6',
                      margin: 0
                    }}>
                      {room.name}
                    </h3>
                  </div>

                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.6rem'
                  }}>
                    {room.devices.map((device) => (
                      <div
                        key={device.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.6rem 0.85rem',
                          background: 'rgba(0, 0, 0, 0.2)',
                          borderRadius: '10px'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem'
                        }}>
                          <span style={{ fontSize: '1.2rem' }}>{device.icon}</span>
                          <span style={{
                            fontSize: '0.9rem',
                            fontWeight: '500'
                          }}>
                            {device.name}
                          </span>
                        </div>

                        {typeof device.status === 'boolean' ? (
                          <button
                            onClick={() => toggleDevice(room.id, device.id)}
                            style={{
                              padding: '0.4rem 0.85rem',
                              background: device.status
                                ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                                : 'rgba(255, 255, 255, 0.1)',
                              border: `1px solid ${device.status ? '#10B981' : 'rgba(255, 255, 255, 0.2)'}`,
                              borderRadius: '7px',
                              color: 'white',
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              cursor: 'pointer',
                              textTransform: 'uppercase'
                            }}
                          >
                            {device.status ? 'ON' : 'OFF'}
                          </button>
                        ) : (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            <button
                              onClick={() => adjustTemperature(room.id, device.id, -1)}
                              style={{
                                width: '26px',
                                height: '26px',
                                background: 'rgba(139, 92, 246, 0.2)',
                                border: '1px solid rgba(139, 92, 246, 0.4)',
                                borderRadius: '5px',
                                color: 'white',
                                fontSize: '0.95rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              −
                            </button>
                            <span style={{
                              fontSize: '0.9rem',
                              fontWeight: '700',
                              color: '#06B6D4',
                              minWidth: '42px',
                              textAlign: 'center'
                            }}>
                              {device.status}°
                            </span>
                            <button
                              onClick={() => adjustTemperature(room.id, device.id, 1)}
                              style={{
                                width: '26px',
                                height: '26px',
                                background: 'rgba(139, 92, 246, 0.2)',
                                border: '1px solid rgba(139, 92, 246, 0.4)',
                                borderRadius: '5px',
                                color: 'white',
                                fontSize: '0.95rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Energy Monitor */}
            <div style={{
              padding: '1.25rem',
              background: 'rgba(6, 182, 212, 0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  opacity: 0.7,
                  marginBottom: '0.35rem'
                }}>
                  Energy Usage Today
                </div>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: '800',
                  color: '#06B6D4'
                }}>
                  {energyUsage}%
                </div>
              </div>
              <div style={{ fontSize: '3rem' }}>⚡</div>
            </div>
          </div>

          {/* CENTER: Mascot */}
          <div style={{
            height: '700px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            <canvas
              ref={canvasRef}
              id="home-control-mascot"
              style={{
                width: '100%',
                height: '100%',
                filter: 'drop-shadow(0 20px 80px rgba(139, 92, 246, 0.6))',
              }}
            />
          </div>

          {/* RIGHT: AI Chat */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(6, 182, 212, 0.03) 100%)',
            borderRadius: '20px',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Chat Header */}
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid rgba(139, 92, 246, 0.2)',
              background: 'rgba(0, 0, 0, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'rgba(139, 92, 246, 0.2)',
                  border: '2px solid rgba(139, 92, 246, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>
                  🏠
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#8B5CF6' }}>
                    AI Assistant
                  </div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.6 }}>
                    Claude Haiku 4.5
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div style={{
              flex: 1,
              overflow: 'auto',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {messages.map((msg, i) => (
                <div key={i} style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%'
                }}>
                  <div style={{
                    padding: '1rem 1.25rem',
                    borderRadius: '16px',
                    background: msg.role === 'user'
                      ? 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)'
                      : 'rgba(139, 92, 246, 0.1)',
                    border: msg.role === 'user'
                      ? 'none'
                      : '1px solid rgba(139, 92, 246, 0.3)',
                    color: 'white',
                    fontSize: '1rem',
                    lineHeight: 1.5
                  }}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ alignSelf: 'flex-start', maxWidth: '80%' }}>
                  <div style={{
                    padding: '1rem 1.25rem',
                    borderRadius: '16px',
                    background: 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    color: 'white',
                    fontSize: '1rem'
                  }}>
                    Typing...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Example prompts */}
            {messages.length === 1 && (
              <div style={{
                padding: '0 1.5rem 1rem 1.5rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
                <div style={{ fontSize: '0.75rem', opacity: 0.5, marginBottom: '0.75rem' }}>
                  SUGGESTED QUESTIONS
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {examplePrompts.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setInput(prompt)
                      }}
                      style={{
                        padding: '0.75rem',
                        background: 'rgba(139, 92, 246, 0.05)',
                        border: '1px solid rgba(139, 92, 246, 0.2)',
                        borderRadius: '10px',
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontSize: '0.9rem',
                        textAlign: 'left',
                        cursor: 'pointer'
                      }}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Input */}
            <div style={{
              padding: '1.5rem',
              borderTop: '1px solid rgba(139, 92, 246, 0.2)',
              background: 'rgba(0, 0, 0, 0.2)',
              display: 'flex',
              gap: '0.75rem'
            }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '1rem',
                  background: 'rgba(0, 0, 0, 0.5)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '1rem',
                  outline: 'none'
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || loading}
                style={{
                  padding: '1rem 2rem',
                  background: input.trim() && !loading
                    ? 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)'
                    : 'rgba(139, 92, 246, 0.2)',
                  border: 'none',
                  borderRadius: '10px',
                  color: input.trim() && !loading ? 'white' : 'rgba(255, 255, 255, 0.3)',
                  fontSize: '1rem',
                  fontWeight: '700',
                  cursor: input.trim() && !loading ? 'pointer' : 'not-allowed'
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
