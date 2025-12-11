'use client'

import { useState, useRef, useEffect } from 'react'
import { useTimeoutManager } from '@/hooks/useTimeoutManager'

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
  mascot?: any  // Guide mascot instance from parent
}

const INITIAL_ROOMS_DESKTOP: Room[] = [
  {
    id: 'living',
    name: 'Living Room',
    icon: '🛋️',
    devices: [
      { id: 'living-light', type: 'light', name: 'Main Lights', status: true, icon: '💡' },
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
      { id: 'living-light', type: 'light', name: 'Main Lights', status: true, icon: '💡' },
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

// SSS presets for crystal materials (for 3D mode)
const sssPresets: Record<string, any> = {
  quartz: {
    sssStrength: 0.8,
    sssAbsorption: [2.8, 2.9, 3.0],
    sssScatterDistance: [0.2, 0.2, 0.25],
    sssThicknessBias: 0.60,
    sssThicknessScale: 1.8,
    sssCurvatureScale: 3.0,
    sssAmbient: 0.12,
    frostiness: 0.15,
    innerGlowStrength: 0.20,
    fresnelIntensity: 1.5,
    causticIntensity: 1.2
  },
  amethyst: {
    sssStrength: 2.5,
    sssAbsorption: [3.0, 0.05, 4.5],
    sssScatterDistance: [0.4, 0.05, 0.5],
    sssThicknessBias: 0.70,
    sssThicknessScale: 2.0,
    sssCurvatureScale: 3.0,
    sssAmbient: 0.08,
    frostiness: 0.18,
    innerGlowStrength: 0.12,
    fresnelIntensity: 1.4,
    causticIntensity: 1.0,
    emotionColorBleed: 0.35
  }
}

// Helper to apply SSS preset to mascot (for 3D mode)
const applySSSPreset = (mascotInstance: any, presetName: string) => {
  if (!presetName || !mascotInstance?.core3D?.customMaterial?.uniforms) return
  const preset = sssPresets[presetName]
  if (!preset) return

  const u = mascotInstance.core3D.customMaterial.uniforms
  if (u.sssStrength) u.sssStrength.value = preset.sssStrength
  if (u.sssAbsorption) u.sssAbsorption.value.set(...preset.sssAbsorption)
  if (u.sssScatterDistance) u.sssScatterDistance.value.set(...preset.sssScatterDistance)
  if (u.sssThicknessBias) u.sssThicknessBias.value = preset.sssThicknessBias
  if (u.sssThicknessScale) u.sssThicknessScale.value = preset.sssThicknessScale
  if (u.sssCurvatureScale) u.sssCurvatureScale.value = preset.sssCurvatureScale
  if (u.sssAmbient) u.sssAmbient.value = preset.sssAmbient
  if (u.frostiness) u.frostiness.value = preset.frostiness
  if (u.innerGlowStrength) u.innerGlowStrength.value = preset.innerGlowStrength
  if (u.fresnelIntensity) u.fresnelIntensity.value = preset.fresnelIntensity
  if (preset.causticIntensity !== undefined && u.causticIntensity) {
    u.causticIntensity.value = preset.causticIntensity
  }
  if (u.emotionColorBleed) {
    u.emotionColorBleed.value = preset.emotionColorBleed ?? 0.0
  }
}

// Color scheme for smart home hub
const COLORS = {
  primary: '#FF6B35',      // Vibrant Orange
  secondary: '#004E89',    // Deep Blue
  accent: '#F7931E',       // Warm Amber
  success: '#00A878',      // Teal Green
  background: {
    main: 'rgba(0, 20, 40, 0.95)',
    card: 'linear-gradient(135deg, rgba(255, 107, 53, 0.08) 0%, rgba(0, 78, 137, 0.05) 100%)',
    cardBorder: 'rgba(255, 107, 53, 0.2)',
    input: 'rgba(0, 0, 0, 0.5)',
  },
  text: {
    primary: '#FF6B35',
    secondary: '#00A878',
    muted: 'rgba(255, 255, 255, 0.6)',
  },
  button: {
    active: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
    inactive: 'rgba(255, 107, 53, 0.1)',
    border: 'rgba(255, 107, 53, 0.3)',
    activeBorder: 'rgba(255, 107, 53, 0.5)',
  }
}

export default function SmartHomeSimulation({ onDeviceChange, mascot }: SmartHomeSimulationProps) {
  const { setTimeout: setManagedTimeout } = useTimeoutManager()
  const [isMobile, setIsMobile] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [rooms, setRooms] = useState<Room[]>([])
  const [activeScene, setActiveScene] = useState<string | null>(null)
  const [showAIHelp, setShowAIHelp] = useState(false)
  const [energyUsage, setEnergyUsage] = useState(42)
  const mascotStageRef = useRef<HTMLDivElement>(null)
  const mascotRef = useRef<any>(mascot)
  const isAttachedRef = useRef<boolean>(false)
  const lastScrollYRef = useRef<number>(0)

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

  // NO AUTO-SCROLL - User controls scrolling manually

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

  // Attach mascot to stage when scrolled into view
  // Only detach when scrolling UP past the attachment point, not when scrolling DOWN
  useEffect(() => {
    if (!mascot || !mascotStageRef.current) return

    // Track scroll direction
    const handleScroll = () => {
      lastScrollYRef.current = window.scrollY
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    lastScrollYRef.current = window.scrollY

    // Use Intersection Observer to detect when the stage comes into view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isAttachedRef.current) {
            // Stage is in view and mascot not yet attached
            if (typeof mascot.attachToElement !== 'function') {
              return
            }

            mascot.attachToElement(mascotStageRef.current, {
              animate: false,  // Instant snap - animation causes overshoot due to scroll offset
              scale: isMobile ? 0.7 : 0.5,  // 70% on mobile, 50% on desktop
              containParticles: true  // Keep particles within the stage bounds
            })

            // Set emotion to calm when attached
            mascot.setEmotion('calm')

            mascotRef.current = mascot
            isAttachedRef.current = true
          } else if (!entry.isIntersecting && isAttachedRef.current) {
            // Stage is out of view - but only detach if scrolling UP
            // When boundingClientRect.top > 0, element is below viewport (user scrolled UP)
            // When boundingClientRect.top < 0, element is above viewport (user scrolled DOWN)
            const elementBelowViewport = entry.boundingClientRect.top > 0

            // Only detach when scrolling UP (element goes below viewport)
            // Do NOT detach when scrolling DOWN (element goes above viewport)
            if (elementBelowViewport) {
              if (typeof mascot.detachFromElement === 'function') {
                mascot.detachFromElement()
              }

              mascotRef.current = null
              isAttachedRef.current = false
            }
            // If scrolling DOWN past the element, keep attached - mascot stays in place
          }
        })
      },
      {
        threshold: 0.2, // Trigger when 20% of the element is visible
        rootMargin: '0px'
      }
    )

    observer.observe(mascotStageRef.current)

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', handleScroll)
      if (mascot && typeof mascot.detachFromElement === 'function') {
        mascot.detachFromElement()
      }
      isAttachedRef.current = false
    }
  }, [mascot, isMobile])

  const toggleDevice = async (roomId: string, deviceId: string) => {
    const device = rooms.find(r => r.id === roomId)?.devices.find(d => d.id === deviceId)
    if (!device) return

    // Calculate new status BEFORE updating state (for correct reaction logic)
    const newStatus = typeof device.status === 'boolean' ? !device.status : device.status
    const turningOn = newStatus === true

    setRooms(prevRooms =>
      prevRooms.map(room =>
        room.id === roomId
          ? {
              ...room,
              devices: room.devices.map(d =>
                d.id === deviceId
                  ? { ...d, status: newStatus }
                  : d
              )
            }
          : room
      )
    )

    // Device-specific mascot reactions
    // Use mascot prop directly for core operations (always available)
    // Use mascotRef.current for attachment-dependent operations
    if (mascot) {
      if (device.type === 'light') {
        // Main Lights: toggle core glow on/off
        if (deviceId === 'living-light') {
          // Toggle core glow visibility (3D inner soul) using public API
          if (mascot.setCoreGlowEnabled) {
            mascot.setCoreGlowEnabled(turningOn)
          }
          // Glow gesture for visual feedback
          if (mascot.express) {
            await mascot.express('glow', { intensity: turningOn ? 0.8 : 0.4, duration: 600 })
          }
          // Emotion shift based on light state
          if (mascot.setEmotion) {
            mascot.setEmotion(turningOn ? 'joy' : 'calm', turningOn ? 0.7 : 0.4)
          }
        } else if (deviceId === 'bedroom-light') {
          // Bedroom ambient: softer reaction with color warmth
          if (mascot.express) {
            await mascot.express('pulse', { intensity: 0.4, duration: 500 })
          }
          if (mascot.setEmotion) {
            mascot.setEmotion(turningOn ? 'calm' : 'neutral', 0.5)
          }
        } else if (deviceId === 'entry-light') {
          // Porch light: quick pulse
          if (mascot.express) {
            await mascot.express('pulse', { intensity: 0.6, duration: 400 })
          }
        } else {
          // Other lights: default glow
          if (mascot.express) {
            await mascot.express('glow', { intensity: 0.6, duration: 500 })
          }
        }
      } else if (device.type === 'lock') {
        // Smart lock: locked = secure (heart), unlocked = back to crystal
        const isLocked = turningOn
        if (mascot.morphTo) {
          mascot.morphTo(isLocked ? 'heart' : 'crystal', { duration: 800 })
        }
        if (mascot.setEmotion) {
          mascot.setEmotion(isLocked ? 'love' : 'neutral', isLocked ? 0.6 : 0.4)
        }
        if (mascot.express) {
          await mascot.express('bounce', { intensity: 0.4, duration: 400 })
        }
        // Reset to crystal after 2 seconds
        setManagedTimeout(() => {
          if (mascot?.morphTo) {
            mascot.morphTo('crystal', { duration: 800 })
          }
          if (mascot?.setEmotion) {
            mascot.setEmotion('neutral', 0.5)
          }
        }, 2000)
      } else if (device.type === 'camera') {
        // Camera: recording state with alert emotion
        const isRecording = turningOn
        if (mascot.setEmotion) {
          mascot.setEmotion(isRecording ? 'recording' : 'neutral', isRecording ? 0.8 : 0.4)
        }
        if (mascot.express) {
          await mascot.express('pulse', { intensity: isRecording ? 0.7 : 0.3, duration: 600 })
        }
        // Double pulse for "recording" emphasis
        if (isRecording) {
          setManagedTimeout(() => {
            mascot?.express?.('pulse', { intensity: 0.4, duration: 500 })
          }, 350)
        }
        // Reset emotion after 2 seconds
        setManagedTimeout(() => {
          mascot?.setEmotion?.('neutral', 0.5)
        }, 2000)
      } else if (device.type === 'blinds') {
        // Blinds: squish effect (flatten when closing, expand when opening)
        if (mascot.express) {
          await mascot.express('squish', { intensity: turningOn ? 0.6 : 0.4, duration: 600 })
        }
      } else if (device.type === 'speaker') {
        // Speaker: bounce with rhythm
        if (mascot.express) {
          await mascot.express('bounce', { intensity: turningOn ? 0.7 : 0.3, duration: 500 })
        }
        if (turningOn && mascot.setEmotion) {
          mascot.setEmotion('joy', 0.6)
          setManagedTimeout(() => {
            mascot?.setEmotion?.('neutral', 0.5)
          }, 1500)
        }
      } else {
        // Default: nod
        if (mascot.express) {
          await mascot.express('nod', { intensity: 0.4, duration: 400 })
        }
      }
    }

    if (onDeviceChange) {
      onDeviceChange(device.type, turningOn ? 'on' : 'off')
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

    // Thermostat: warm/cool reactions
    if (mascotRef.current) {
      const isWarmer = delta > 0
      // Pulse with direction-based intensity
      if (mascotRef.current.express) {
        mascotRef.current.express('pulse', { intensity: 0.4, duration: 350 })
      }
      // Emotion: warmer = energetic, cooler = calm
      if (mascotRef.current.setEmotion) {
        mascotRef.current.setEmotion(isWarmer ? 'joy' : 'calm', 0.5)
        // Reset after a moment
        setManagedTimeout(() => {
          mascotRef.current?.setEmotion?.('neutral', 0.5)
        }, 1000)
      }
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
        // Morph to rough with amethyst SSS preset for "leaving home" feel
        if (mascotRef.current.core3D) {
          mascotRef.current.core3D.onMaterialSwap = (swapInfo: { geometryType: string, material: any }) => {
            if (swapInfo.geometryType === 'rough' && swapInfo.material) {
              applySSSPreset(mascotRef.current, 'amethyst')
            }
            mascotRef.current.core3D.onMaterialSwap = null
          }
        }
        if (mascotRef.current.morphTo) {
          mascotRef.current.morphTo('rough', { duration: 1000 })
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
        // Set materialVariant to 'multiplexer' BEFORE morphing to moon
        // This enables the blend layer system needed for proper blood moon color grading
        if (mascotRef.current.core3D) {
          mascotRef.current.core3D.materialVariant = 'multiplexer'

          // Set up callback to animate blood moon AFTER moon geometry is swapped in
          mascotRef.current.core3D.onMaterialSwap = (swapInfo: { geometryType: string, material: any }) => {
            if (swapInfo.geometryType === 'moon' && swapInfo.material) {
              // Moon geometry is now active - animate the blood moon eclipse
              const uniforms = swapInfo.material.uniforms
              if (!uniforms) return

              // Initialize eclipse uniforms (start as normal full moon)
              if (uniforms.eclipseShadowPos) uniforms.eclipseShadowPos.value = [-2.0, 0.0]
              if (uniforms.eclipseProgress) uniforms.eclipseProgress.value = 0.0
              if (uniforms.emissiveStrength) uniforms.emissiveStrength.value = 0.0
              if (uniforms.shadowDarkness) uniforms.shadowDarkness.value = 1.0
              // Set to full moon phase (shadow offset 0,0)
              if (uniforms.shadowOffset) {
                uniforms.shadowOffset.value.x = 0
                uniforms.shadowOffset.value.y = 0
              }

              // Fast animation to blood moon (600ms)
              const startTime = performance.now()
              const animateLunarEclipse = (currentTime: number) => {
                if (!mascotRef.current?.core3D?.customMaterial?.uniforms) return
                const progress = Math.min((currentTime - startTime) / 600, 1.0)
                const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2
                if (uniforms.eclipseShadowPos) uniforms.eclipseShadowPos.value[0] = -2.0 + (2.0 * eased)
                if (uniforms.eclipseProgress) uniforms.eclipseProgress.value = eased
                if (uniforms.eclipseIntensity) uniforms.eclipseIntensity.value = eased
                if (uniforms.emissiveStrength) uniforms.emissiveStrength.value = 0.39 * eased
                if (uniforms.shadowDarkness) uniforms.shadowDarkness.value = 1.0 - (0.47 * eased)
                if (progress < 1.0) requestAnimationFrame(animateLunarEclipse)
              }
              requestAnimationFrame(animateLunarEclipse)
            }
            mascotRef.current.core3D.onMaterialSwap = null
          }
        }
        if (mascotRef.current.morphTo) {
          mascotRef.current.morphTo('moon', { duration: 1000 })
        }
        if (mascotRef.current.setEmotion) {
          mascotRef.current.setEmotion('excited', 0.8)
        }
        if (mascotRef.current.express) {
          await mascotRef.current.express('bounce', { intensity: 0.6, duration: 800 })
        }
      }
    }

    setManagedTimeout(() => {
      setActiveScene(null)
      // Turn off blood moon eclipse when resetting
      if (mascotRef.current?.core3D?.setMoonEclipse) {
        mascotRef.current.core3D.setMoonEclipse('off')
      }
      if (mascotRef.current) {
        // Reset materialVariant to null (no special material variant for crystal)
        // and reset SSS preset to quartz when morphing back to crystal
        if (mascotRef.current.core3D) {
          mascotRef.current.core3D.materialVariant = null
          mascotRef.current.core3D.onMaterialSwap = (swapInfo: { geometryType: string, material: any }) => {
            if (swapInfo.geometryType === 'crystal' && swapInfo.material) {
              applySSSPreset(mascotRef.current, 'quartz')
            }
            mascotRef.current.core3D.onMaterialSwap = null
          }
        }
        if (mascotRef.current.morphTo) {
          mascotRef.current.morphTo('crystal', { duration: 1000 })
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
        setManagedTimeout(() => {
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
      overflow: 'hidden',
      transform: 'translateZ(0)',
      willChange: 'transform',
      overscrollBehavior: 'none'
    }}>
      {isMobile ? (
        <>
          {/* Mascot Stage - Mobile (fixed at top, never moves) */}
          <div
            ref={mascotStageRef}
            style={{
              background: 'radial-gradient(circle at center, rgba(255, 107, 53, 0.08) 0%, rgba(0, 0, 0, 0.2) 100%)',
              borderRadius: '0 0 16px 16px',
              border: `2px solid ${COLORS.background.cardBorder}`,
              borderTop: 'none',
              width: '100%',
              height: '180px',
              minHeight: '180px',
              maxHeight: '180px',
              position: 'relative',
              overflow: 'visible',
              boxShadow: 'inset 0 0 60px rgba(255, 107, 53, 0.1)',
              zIndex: 10,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          />

          {!showAIHelp ? (
            /* DEVICE CONTROLS VIEW */
            <>
              <div style={{
                flex: 1,
                overflow: 'auto',
                padding: '0.65rem',
                background: COLORS.background.main,
                WebkitOverflowScrolling: 'touch',
                overscrollBehavior: 'contain'
              }}>
                {/* Scene buttons */}
                <div style={{
                  display: 'flex',
                  gap: '0.4rem',
                  marginBottom: '0.75rem',
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
                          ? COLORS.button.active
                          : COLORS.button.inactive,
                        border: `1px solid ${activeScene === scene.id ? COLORS.button.activeBorder : COLORS.button.border}`,
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
                  gap: '0.65rem',
                  marginBottom: '0.75rem'
                }}>
                  {rooms.map((room) => (
                    <div
                      key={room.id}
                      style={{
                        background: COLORS.background.card,
                        borderRadius: '12px',
                        padding: '0.85rem',
                        border: `1px solid ${COLORS.background.cardBorder}`
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
                          color: COLORS.text.primary,
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
                                    ? `linear-gradient(135deg, ${COLORS.success} 0%, #008F65 100%)`
                                    : 'rgba(255, 255, 255, 0.1)',
                                  border: `1px solid ${device.status ? COLORS.success : 'rgba(255, 255, 255, 0.2)'}`,
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
                                    background: COLORS.button.inactive,
                                    border: `1px solid ${COLORS.button.border}`,
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
                                  color: COLORS.text.secondary,
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
                                    background: COLORS.button.inactive,
                                    border: `1px solid ${COLORS.button.border}`,
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
                  padding: '0.85rem',
                  background: 'rgba(0, 168, 120, 0.1)',
                  borderRadius: '10px',
                  border: `1px solid ${COLORS.text.secondary}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.65rem'
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
                    background: COLORS.button.active,
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
              {/* Header with close */}
              <div style={{
                padding: '0.75rem 1rem',
                background: 'rgba(0, 0, 0, 0.5)',
                borderBottom: `1px solid ${COLORS.background.cardBorder}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0
              }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: COLORS.button.inactive,
                      border: `2px solid ${COLORS.button.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem'
                    }}>
                      🏠
                    </div>
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: '800', color: COLORS.text.primary }}>
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
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  WebkitOverflowScrolling: 'touch',
                  overscrollBehavior: 'contain'
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
                        ? COLORS.button.active
                        : COLORS.button.inactive,
                      border: msg.role === 'user'
                        ? 'none'
                        : `1px solid ${COLORS.button.border}`,
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
                      border: `1px solid ${COLORS.button.border}`,
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
                          background: 'rgba(255, 107, 53, 0.05)',
                          border: `1px solid ${COLORS.background.cardBorder}`,
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
                borderTop: `1px solid ${COLORS.button.border}`,
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
                    background: COLORS.background.input,
                    border: `1px solid ${COLORS.button.border}`,
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
                      : COLORS.button.inactive,
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
          gridTemplateColumns: '400px 500px 1fr',
          gap: '2rem',
          padding: '2rem',
          minHeight: '700px',
          alignItems: 'stretch'
        }}>
          {/* LEFT: Quick Controls & Scenes */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.05) 0%, rgba(0, 78, 137, 0.03) 100%)',
            borderRadius: '20px',
            border: `1px solid ${COLORS.background.cardBorder}`,
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            overflow: 'auto',
            overscrollBehavior: 'contain'
          }}>
            <div>
              <h2 style={{
                fontSize: '1.8rem',
                fontWeight: '900',
                marginBottom: '0.5rem',
                background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.accent} 100%)`,
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
                      : COLORS.button.inactive,
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

            {/* Main Rooms - Living Room & Bedroom on left */}
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {rooms.slice(0, 2).map((room) => (
                <div
                  key={room.id}
                  style={{
                    background: COLORS.background.card,
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
                      color: COLORS.text.primary,
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
                                ? `linear-gradient(135deg, ${COLORS.success} 0%, #008F65 100%)`
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
                                background: COLORS.button.inactive,
                                border: `1px solid ${COLORS.button.border}`,
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
                                background: COLORS.button.inactive,
                                border: `1px solid ${COLORS.button.border}`,
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

          {/* CENTER: Mascot Stage */}
          <div
            ref={mascotStageRef}
            style={{
              background: 'radial-gradient(circle at center, rgba(255, 107, 53, 0.08) 0%, rgba(0, 0, 0, 0.2) 100%)',
              borderRadius: '20px',
              border: `2px solid ${COLORS.background.cardBorder}`,
              minHeight: '500px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: 'inset 0 0 80px rgba(255, 107, 53, 0.1)',
              zIndex: 10
            }}
          />

          {/* RIGHT: Remaining Rooms + Compact AI Chat */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            overflow: 'auto',
            overscrollBehavior: 'contain'
          }}>
            {/* Other Rooms - Kitchen & Front Door */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '1rem'
            }}>
              {rooms.slice(2).map((room) => (
                <div
                  key={room.id}
                  style={{
                    background: COLORS.background.card,
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
                      color: COLORS.text.primary,
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
                                ? `linear-gradient(135deg, ${COLORS.success} 0%, #008F65 100%)`
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
                                background: COLORS.button.inactive,
                                border: `1px solid ${COLORS.button.border}`,
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
                                background: COLORS.button.inactive,
                                border: `1px solid ${COLORS.button.border}`,
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

            {/* Compact AI Chat */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.05) 0%, rgba(0, 78, 137, 0.03) 100%)',
              borderRadius: '20px',
              border: `1px solid ${COLORS.background.cardBorder}`,
              display: 'flex',
              flexDirection: 'column',
              height: '600px',
              flex: 1
            }}>
            {/* Compact Chat Header */}
            <div style={{
              padding: '1rem 1.25rem',
              borderBottom: `1px solid ${COLORS.background.cardBorder}`,
              background: 'rgba(0, 0, 0, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: COLORS.button.inactive,
                  border: `2px solid ${COLORS.button.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem'
                }}>
                  🏠
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '1rem', fontWeight: '800', color: COLORS.text.primary }}>
                    AI Assistant
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
              gap: '1rem',
              overscrollBehavior: 'contain'
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
                      : COLORS.button.inactive,
                    border: msg.role === 'user'
                      ? 'none'
                      : `1px solid ${COLORS.button.border}`,
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
                    border: `1px solid ${COLORS.button.border}`,
                    color: 'white',
                    fontSize: '1rem'
                  }}>
                    Typing...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Compact Chat Input */}
            <div style={{
              padding: '1rem',
              borderTop: '1px solid rgba(139, 92, 246, 0.2)',
              background: 'rgba(0, 0, 0, 0.2)',
              display: 'flex',
              gap: '0.5rem'
            }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask about your home..."
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: 'rgba(0, 0, 0, 0.5)',
                  border: `1px solid ${COLORS.button.border}`,
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '0.9rem',
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
                  borderRadius: '8px',
                  color: input.trim() && !loading ? 'white' : 'rgba(255, 255, 255, 0.3)',
                  fontSize: '0.9rem',
                  fontWeight: '700',
                  cursor: input.trim() && !loading ? 'pointer' : 'not-allowed'
                }}
              >
                Send
              </button>
            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
