'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import AISmartHomeAssistant from './AISmartHomeAssistant'

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

interface SmartHomeSimulationProps {
  onDeviceChange?: (deviceType: string, action: string) => void
}

const INITIAL_ROOMS: Room[] = [
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

export default function SmartHomeSimulation({ onDeviceChange }: SmartHomeSimulationProps) {
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS)
  const [activeScene, setActiveScene] = useState<string | null>(null)
  const [showAIHelp, setShowAIHelp] = useState(false)
  const [energyUsage, setEnergyUsage] = useState(42) // percentage
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mascotRef = useRef<any>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Expose the open AI chat function to parent
  useEffect(() => {
    (window as any).__openSmartHomeAIChat = () => setShowAIHelp(true)
    return () => {
      delete (window as any).__openSmartHomeAIChat
    }
  }, [])

  useEffect(() => {
    setIsClient(true)
  }, [])

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
          canvasId: 'home-control-mascot',
          enableAudio: false,
          soundEnabled: false,
          defaultEmotion: 'neutral',
          enableGazeTracking: false,
          enableIdleBehaviors: true,
          targetFPS: isMobile ? 30 : 60,
          maxParticles: isMobile ? 50 : 100,
          primaryColor: '#8B5CF6',
          secondaryColor: '#06B6D4',
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

    // Mascot reaction
    if (mascotRef.current && mascotRef.current.express) {
      mascotRef.current.express('nod', { intensity: 0.4, duration: 400 })
    }

    // Callback
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

    // Apply scene settings
    if (scene === 'good-morning') {
      // Turn on lights, adjust temp, open blinds
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

      // Mascot celebration
      if (mascotRef.current) {
        if (mascotRef.current.setEmotion) {
          mascotRef.current.setEmotion('joy', 0.8)
        }
        if (mascotRef.current.express) {
          await mascotRef.current.express('bounce', { intensity: 0.6, duration: 800 })
        }
      }
    } else if (scene === 'leave-home') {
      // Turn off lights, lock doors, arm security
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

      // Mascot acknowledges
      if (mascotRef.current && mascotRef.current.express) {
        await mascotRef.current.express('wave', { intensity: 0.5, duration: 600 })
      }
    } else if (scene === 'movie-night') {
      // Dim lights, close blinds, adjust temp
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

      // Mascot gets excited
      if (mascotRef.current) {
        if (mascotRef.current.setEmotion) {
          mascotRef.current.setEmotion('excitement', 0.7)
        }
        if (mascotRef.current.express) {
          await mascotRef.current.express('sparkle', { intensity: 0.8, duration: 1000 })
        }
      }
    }

    // Clear active scene after animation
    setTimeout(() => {
      setActiveScene(null)
      if (mascotRef.current && mascotRef.current.setEmotion) {
        mascotRef.current.setEmotion('neutral', 0.5)
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
    }
  }

  // Calculate active devices
  const activeDevices = rooms.reduce((count, room) => {
    return count + room.devices.filter(d =>
      (typeof d.status === 'boolean' && d.status) ||
      (typeof d.status === 'number')
    ).length
  }, 0)

  const totalDevices = rooms.reduce((count, room) => count + room.devices.length, 0)

  const helpButton = (
    <button
      onClick={() => setShowAIHelp(!showAIHelp)}
      style={{
        padding: '0.6rem 1.25rem',
        background: showAIHelp
          ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
          : 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
        borderRadius: '10px',
        fontSize: '0.9rem',
        fontWeight: '700',
        color: 'white',
        border: showAIHelp
          ? '1px solid rgba(239, 68, 68, 0.3)'
          : '1px solid rgba(139, 92, 246, 0.3)',
        boxShadow: showAIHelp
          ? '0 2px 12px rgba(239, 68, 68, 0.3)'
          : '0 2px 12px rgba(139, 92, 246, 0.3)',
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
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <span style={{ fontSize: '1rem' }}>{showAIHelp ? '✕' : '🏠'}</span>
      <span>{showAIHelp ? 'Close AI' : 'Ask AI'}</span>
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
      {/* Mascot - Centered and Prominent */}
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
          id="home-control-mascot"
          style={{
            width: '100%',
            height: '100%',
            filter: 'drop-shadow(0 20px 80px rgba(139, 92, 246, 0.6))',
          }}
        />
      </div>

      {/* Control Interface */}
      <div style={{
        position: 'relative',
        width: '100%',
        order: isMobile ? 2 : 1,
      }}>
        {/* Main Control Card - Bento Grid Style */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(26, 31, 58, 0.95) 0%, rgba(15, 18, 35, 0.98) 100%)',
          backdropFilter: 'blur(60px)',
          WebkitBackdropFilter: 'blur(60px)',
          borderRadius: '32px',
          padding: 'clamp(2rem, 4vw, 3rem)',
          border: '2px solid rgba(139, 92, 246, 0.2)',
          boxShadow: `
            0 30px 90px rgba(0, 0, 0, 0.5),
            0 0 0 1px rgba(139, 92, 246, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.05)
          `,
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Top accent */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.8), transparent)'
          }} />

          {/* Header with Stats - Bento Style */}
          <div style={{
            marginBottom: '2.5rem',
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: '1.5rem',
            alignItems: 'center'
          }}>
            <div>
              <h2 style={{
                fontFamily: 'var(--font-primary)',
                fontSize: 'clamp(2rem, 4vw, 2.8rem)',
                fontWeight: '900',
                marginBottom: '0.5rem',
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
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

            {/* Help button container for portal */}
            <div id="home-help-button-container" />
          </div>

          {/* Quick Scenes - Bento Pills */}
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            marginBottom: '2rem',
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
                  padding: '0.75rem 1.5rem',
                  background: activeScene === scene.id
                    ? 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)'
                    : 'rgba(139, 92, 246, 0.1)',
                  border: `1px solid ${activeScene === scene.id ? 'rgba(139, 92, 246, 0.5)' : 'rgba(139, 92, 246, 0.3)'}`,
                  borderRadius: '100px',
                  color: 'white',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: activeScene === scene.id ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  opacity: activeScene === scene.id ? 0.7 : 1
                }}
                onMouseEnter={(e) => {
                  if (activeScene !== scene.id) {
                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeScene !== scene.id) {
                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }
                }}
              >
                <span>{scene.icon}</span>
                <span>{scene.label}</span>
              </button>
            ))}
          </div>

          {/* Rooms - Bento Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.25rem',
            marginBottom: '1.5rem'
          }}>
            {rooms.map((room) => (
              <div
                key={room.id}
                style={{
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(6, 182, 212, 0.05) 100%)',
                  borderRadius: '20px',
                  padding: '1.5rem',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(139, 92, 246, 0.15)'
                  e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1.25rem'
                }}>
                  <span style={{ fontSize: '1.8rem' }}>{room.icon}</span>
                  <h3 style={{
                    fontSize: '1.2rem',
                    fontWeight: '700',
                    color: '#8B5CF6',
                    margin: 0,
                    letterSpacing: '-0.01em'
                  }}>
                    {room.name}
                  </h3>
                </div>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  {room.devices.map((device) => (
                    <div
                      key={device.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        background: 'rgba(0, 0, 0, 0.2)',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                      }}>
                        <span style={{ fontSize: '1.3rem' }}>{device.icon}</span>
                        <span style={{
                          fontSize: '0.9rem',
                          fontWeight: '500',
                          color: 'rgba(255, 255, 255, 0.9)'
                        }}>
                          {device.name}
                        </span>
                      </div>

                      {typeof device.status === 'boolean' ? (
                        <button
                          onClick={() => toggleDevice(room.id, device.id)}
                          style={{
                            padding: '0.4rem 0.9rem',
                            background: device.status
                              ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                              : 'rgba(255, 255, 255, 0.1)',
                            border: `1px solid ${device.status ? '#10B981' : 'rgba(255, 255, 255, 0.2)'}`,
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)'
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
                              width: '28px',
                              height: '28px',
                              background: 'rgba(139, 92, 246, 0.2)',
                              border: '1px solid rgba(139, 92, 246, 0.4)',
                              borderRadius: '6px',
                              color: 'white',
                              fontSize: '1rem',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(139, 92, 246, 0.3)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)'
                            }}
                          >
                            −
                          </button>
                          <span style={{
                            fontSize: '0.95rem',
                            fontWeight: '700',
                            color: '#06B6D4',
                            minWidth: '45px',
                            textAlign: 'center'
                          }}>
                            {device.status}°F
                          </span>
                          <button
                            onClick={() => adjustTemperature(room.id, device.id, 1)}
                            style={{
                              width: '28px',
                              height: '28px',
                              background: 'rgba(139, 92, 246, 0.2)',
                              border: '1px solid rgba(139, 92, 246, 0.4)',
                              borderRadius: '6px',
                              color: 'white',
                              fontSize: '1rem',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(139, 92, 246, 0.3)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)'
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

          {/* Energy Monitor - Apple Style */}
          <div style={{
            padding: '1.5rem',
            background: 'rgba(6, 182, 212, 0.1)',
            borderRadius: '16px',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                opacity: 0.7,
                marginBottom: '0.5rem'
              }}>
                Energy Usage Today
              </div>
              <div style={{
                fontSize: '2rem',
                fontWeight: '800',
                background: 'linear-gradient(135deg, #06B6D4 0%, #14B8A6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                {energyUsage}%
              </div>
            </div>
            <div style={{
              fontSize: '3rem'
            }}>
              ⚡
            </div>
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
        border: '2px solid rgba(139, 92, 246, 0.3)',
        borderRadius: '32px',
        transform: showAIHelp ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 50,
        overflow: 'hidden',
        boxShadow: showAIHelp ? '0 30px 90px rgba(0, 0, 0, 0.6), inset 0 0 0 1px rgba(139, 92, 246, 0.1)' : 'none'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, rgba(139, 92, 246, 0.8), transparent)'
        }} />

        <div style={{
          padding: '2rem 2.5rem',
          borderBottom: '2px solid rgba(139, 92, 246, 0.2)',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(6, 182, 212, 0.08) 100%)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem'
          }}>
            <div style={{
              fontSize: '2.5rem',
              filter: 'drop-shadow(0 4px 16px rgba(139, 92, 246, 0.5))'
            }}>
              🏠
            </div>
            <div>
              <div style={{
                fontWeight: '800',
                fontSize: '1.4rem',
                background: 'linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.01em'
              }}>
                AI Home Assistant
              </div>
              <div style={{
                fontSize: '0.9rem',
                opacity: 0.7,
                color: 'rgba(255, 255, 255, 0.6)',
                fontWeight: '500'
              }}>
                Control your home with natural language
              </div>
            </div>
          </div>
        </div>

        <div style={{
          height: 'calc(100% - 120px)',
          overflow: 'hidden'
        }}>
          <AISmartHomeAssistant onLLMResponse={handleLLMResponse} />
        </div>
      </div>

      {/* Render help button using portal */}
      {isClient && document.getElementById('home-help-button-container') ? (
        createPortal(helpButton, document.getElementById('home-help-button-container')!)
      ) : null}
    </div>
  )
}
