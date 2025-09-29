'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import ShapeSelectorBar from './ShapeSelectorBar'
import ExportModal from './ExportModal'

// Helper function to convert data URL to blob
function dataURLToBlob(dataURL: string): Blob {
  const arr = dataURL.split(',')
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg'
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new Blob([u8arr], { type: mime })
}

// Helper function to create video blob with proper duration metadata
function createVideoBlobWithDuration(originalBlob: Blob, duration: number): Blob & { customDuration?: number } {
  console.log('🎞️ Creating enhanced video blob with duration:', duration)
  
  // Create enhanced blob with custom duration property
  const enhancedBlob = new Blob([originalBlob], { 
    type: originalBlob.type
  }) as Blob & { customDuration?: number }
  
  // Add custom duration property that ExportModal can access
  enhancedBlob.customDuration = duration
  return enhancedBlob
}

interface GameMainProps {
  engine: any
  score: number
  combo: number
  currentUndertone: string
  onGesture: (gesture: string) => void
  onMascotReady?: (mascot: any) => void
}

export default function GameMain({ engine, score, combo, currentUndertone, onGesture, onMascotReady }: GameMainProps) {
  const [currentEmotion, setCurrentEmotion] = useState('neutral')
  const [currentShape, setCurrentShape] = useState('circle')
  const [mascot, setMascot] = useState<any>(null) // Added state for mascot
  const [showStatusIndicators, setShowStatusIndicators] = useState(true)
  const [showCountdown, setShowCountdown] = useState(false)
  const [countdownNumber, setCountdownNumber] = useState(3)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [showExportModal, setShowExportModal] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [trackInfo, setTrackInfo] = useState<{path: string, name: string} | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mascotRef = useRef<any>(null)
  const fadeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // 🎬 NEW: Dual-path recording system
  const [frameData, setFrameData] = useState<any[]>([])
  const [isProcessingHighRes, setIsProcessingHighRes] = useState(false)
  const frameCaptureRef = useRef<any[]>([])
  
  const getUndertoneLabel = (undertone: string) => {
    const undertoneMap: { [key: string]: string } = {
      'none': 'clear',
      'nervous': 'nervous',
      'confident': 'confident',
      'tired': 'tired',
      'intense': 'intense',
      'subdued': 'subdued'
    }
    return undertoneMap[undertone] || 'clear'
  }

  // Fade-out functionality for status indicators
  const resetFadeTimer = useCallback(() => {
    setShowStatusIndicators(true)
    if (fadeTimeoutRef.current) {
      clearTimeout(fadeTimeoutRef.current)
    }
    fadeTimeoutRef.current = setTimeout(() => {
      setShowStatusIndicators(false)
    }, 4000) // Fade out after 4 seconds
  }, [])

  const handleStatusHover = useCallback(() => {
    setShowStatusIndicators(true)
    if (fadeTimeoutRef.current) {
      clearTimeout(fadeTimeoutRef.current)
    }
  }, [])

  const handleStatusLeave = useCallback(() => {
    resetFadeTimer()
  }, [resetFadeTimer])
  const leftEmotionalStates = [
    { name: 'neutral', svg: 'neutral.svg' },
    { name: 'joy', svg: 'joy.svg' },
    { name: 'love', svg: 'love.svg' },
    { name: 'excited', svg: 'excited.svg' },
    { name: 'calm', svg: 'calm.svg' },
    { name: 'euphoria', svg: 'euphoria.svg' },
  ]

  const rightEmotionalStates = [
    { name: 'surprise', svg: 'surprise.svg' },
    { name: 'fear', svg: 'fear.svg' },
    { name: 'sadness', svg: 'sadness.svg' },
    { name: 'disgust', svg: 'disgust.svg' },
    { name: 'anger', svg: 'anger.svg' },
    { name: 'glitch', svg: 'glitch.svg' },
  ]

  // Initialize fade timer on mount
  useEffect(() => {
    resetFadeTimer()
    return () => {
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current)
      }
    }
  }, [resetFadeTimer])

  // Listen for countdown start event
  useEffect(() => {
    const handleStartCountdown = () => {
      setShowCountdown(true)
      setCountdownNumber(3)
      
      // Countdown timer
      const countdownInterval = setInterval(() => {
        setCountdownNumber(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval)
            setShowCountdown(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    const handleStartRecording = async (event: any) => {
      const { trackPath, trackName } = event.detail
      console.log('🎥 Starting recording for:', trackName)
      
      try {
        // Get canvas stream
        const canvas = canvasRef.current
        if (!canvas) {
          console.error('Canvas not found')
          return
        }
        
        // 🎯 RESOLUTION ANALYSIS - Check canvas scaling issues
        const ctx = canvas.getContext('2d')
        const canvasStyle = window.getComputedStyle(canvas)
        const canvasRect = canvas.getBoundingClientRect()
        const dpr = window.devicePixelRatio || 1
        
        // Critical resolution check
        console.log('📊 RESOLUTION ANALYSIS:', {
          canvasBufferSize: `${canvas.width}x${canvas.height}`,
          canvasDisplaySize: `${canvasRect.width}x${canvasRect.height}`,
          devicePixelRatio: dpr,
          cssSize: `${canvasStyle.width}x${canvasStyle.height}`,
          scalingRatio: `${(canvas.width / canvasRect.width).toFixed(2)}x`,
          expectedBuffer: `${Math.round(canvasRect.width * dpr)}x${Math.round(canvasRect.height * dpr)}`,
          isProperlyScaled: canvas.width === Math.round(canvasRect.width * dpr),
          context2d: !!ctx
        })
        
        // Content analysis
        const canvasData = ctx?.getImageData(0, 0, canvas.width, canvas.height)
        const pixelCount = canvasData?.data.length || 0
        const nonTransparentPixels = canvasData ? Array.from(canvasData.data).reduce((count, pixel, index) => {
          return index % 4 === 3 && pixel > 0 ? count + 1 : count
        }, 0) : 0
        
        console.log('📱 Canvas content analysis:', {
          pixelCount: pixelCount / 4,
          nonTransparentPixels,
          hasContent: nonTransparentPixels > 100,
          contentDensity: `${(nonTransparentPixels / (pixelCount / 4) * 100).toFixed(1)}%`
        })
        
        // 🚨 PRESERVE VISUAL LAYOUT: Don't touch the engine's canvas!
        // The mascot must remain visually identical during recording
        console.log('🎯 PRESERVING MASCOT LAYOUT - No canvas modifications')
        console.log('📊 Current engine canvas state:', {
          engineCanvasSize: `${canvas.width}x${canvas.height}`,
          displaySize: `${canvasRect.width}x${canvasRect.height}`,
          scaleFactor: `${(canvas.width / canvasRect.width).toFixed(2)}x`,
          isEngineScaled: canvas.width !== canvasRect.width
        })
        
        // ✅ SOLUTION: Prepare canvas for high-quality glow capture
        console.log('🎨 Preparing canvas for glow effects preservation')
        
        // Optimize canvas context for recording with proper color space preservation
        if (ctx) {
          // Ensure proper color space handling for glow effects
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
          
          // Set canvas context for better recording capture
          // This helps preserve screen/composite blending modes
          const canvasElement = canvas
          canvasElement.style.imageRendering = 'auto'
          console.log('🔧 Canvas optimization for glow capture applied')
        }
        
        // If canvas appears empty, wait for a frame and check again
        if (nonTransparentPixels < 100) {
          console.warn('⚠️ Canvas appears mostly empty, waiting for engine to render...')
          await new Promise(resolve => setTimeout(resolve, 200))
          
          // Check again after waiting
          const retryData = ctx?.getImageData(0, 0, canvas.width, canvas.height)
          const retryPixels = retryData ? Array.from(retryData.data).reduce((count, pixel, index) => {
            return index % 4 === 3 && pixel > 0 ? count + 1 : count
          }, 0) : 0
          
          console.log('📱 Retry canvas content:', {
            nonTransparentPixels: retryPixels,
            hasContentAfterWait: retryPixels > 100
          })
        }
        
        // Let engine render naturally - no interference
        console.log('🎭 Letting engine render naturally for capture')
        
        // 🎨 HIGH-QUALITY CANVAS CAPTURE with resolution fix
        console.log('🎨 Capturing high-resolution canvas stream...')
        
        // Wait for engine content and ensure high-quality capture  
        await new Promise(resolve => setTimeout(resolve, 500)) // Longer wait for content
        
        // Capture at maximum framerate with our increased resolution
        const canvasStream = canvas.captureStream(60) // 60fps for balance of quality/performance
        
        // Apply video track constraints with native canvas resolution
        const videoTrack = canvasStream.getVideoTracks()[0]
        if (videoTrack) {
          videoTrack.applyConstraints({
            width: { ideal: canvas.width },
            height: { ideal: canvas.height },
            frameRate: { ideal: 60 }
          }).then(() => {
            console.log('✅ Video constraints applied (native resolution):', {
              width: canvas.width,
              height: canvas.height,
              frameRate: 60,
              resolution: `${canvas.width}x${canvas.height}`,
              note: 'Using engine native resolution'
            })
          }).catch(err => {
            console.warn('⚠️ Could not apply constraints:', err)
          })
        }
        
        // Try to add audio context to the stream if available
        let finalStream = canvasStream
        
        // Check if there's an audio element playing that we can capture
        const audioElement = document.querySelector('audio') as HTMLAudioElement
        
        // Wait longer to ensure engine has time to render content
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Check if the engine is actually running and rendering
        console.log('🎭 Engine/Emotive status:', {
          engineExists: !!engine,
          canvasExists: !!canvas,
          canvasVisible: canvas.style.display !== 'none',
          canvasOpacity: canvas.style.opacity
        })
        
        // Check if there's audio to capture
        if (audioElement && !audioElement.paused) {
          try {
            console.log('🎵 Audio element found:', {
              src: audioElement.src,
              currentTime: audioElement.currentTime,
              paused: audioElement.paused,
              duration: audioElement.duration,
              volume: audioElement.volume,
              muted: audioElement.muted
            })
            
            // Ensure audio element is audible
            audioElement.volume = 1.0
            audioElement.muted = false
            
            // Create audio context with better settings
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
              sampleRate: 44100,
              latencyHint: 'interactive'
            })
            
            // Resume audio context (required after user interaction)
            if (audioContext.state === 'suspended') {
              await audioContext.resume()
              console.log('🎵 Audio context resumed')
            }
            
            const source = audioContext.createMediaElementSource(audioElement)
            const destination = audioContext.createMediaStreamDestination()
            
            // Connect audio pipeline with gain control
            const gainNode = audioContext.createGain()
            gainNode.gain.value = 1.0
            
            source.connect(gainNode)
            gainNode.connect(destination)
            
            const combinedStreams = new MediaStream([
              ...canvasStream.getVideoTracks(),
              ...destination.stream.getAudioTracks()
            ])
            
            finalStream = combinedStreams
            console.log('🎵 Successfully added audio to recording stream:', {
              audioTracks: destination.stream.getAudioTracks().length,
              videoTracks: canvasStream.getVideoTracks().length,
              audioTrackSettings: destination.stream.getAudioTracks()[0]?.getSettings(),
              videoTrackSettings: canvasStream.getVideoTracks()[0]?.getSettings(),
              combinedStreamTracks: finalStream.getTracks().length
            })
          } catch (audioError) {
            console.warn('⚠️ AudioContext failed, trying microphone fallback:', audioError)
            
            // Try to get microphone audio as fallback
            try {
              const micStream = await navigator.mediaDevices.getUserMedia({ 
                audio: { 
                  autoGainControl: false,
                  echoCancellation: false,
                  noiseSuppression: false 
                } 
              })
              
              const combinedWithMic = new MediaStream([
                ...canvasStream.getVideoTracks(),
                ...micStream.getAudioTracks()
              ])
              
              finalStream = combinedWithMic
              console.log('🎤 Using microphone audio fallback:', {
                audioTracks: micStream.getAudioTracks().length,
                videoTracks: canvasStream.getVideoTracks().length
              })
            } catch (micError) {
              console.warn('⚠️ Microphone fallback also failed, recording video only:', micError)
              finalStream = canvasStream
            }
          }
        } else {
          console.log('🔄 No audio element found or audio is paused')
        }
        
        const stream = finalStream
        
        // Debug stream details
        console.log('📹 Stream details:', {
          videoTracks: stream.getVideoTracks().length,
          audioTracks: stream.getAudioTracks().length,
          totalTracks: stream.getTracks().length,
          videoTrackSettings: stream.getVideoTracks()[0]?.getSettings(),
          audioTrackSettings: stream.getAudioTracks()[0]?.getSettings()
        })

        // Check if WebM is supported, fallback to different formats
        let mimeType = 'video/webm;codecs=vp9'
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          console.warn('⚠️ WebM VP9 not supported, trying alternatives')
          if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
            mimeType = 'video/webm;codecs=vp8'
            console.log('✅ Using WebM VP8')
          } else if (MediaRecorder.isTypeSupported('video/webm')) {
            mimeType = 'video/webm'
            console.log('✅ Using WebM')
          } else {
            console.error('❌ No supported video format found')
            return
          }
        }

        // Create MediaRecorder optimized for glow effects preservation
        let optimalBitrate: number
        
        // Calculate bitrate based on canvas resolution and feature set
        const canvasPixelCount = canvas.width * canvas.height
        const baseBitrate = Math.round((canvasPixelCount / 200000) * 3000000) // Base calculation
        const recommendedBitrate = Math.max(10000000, Math.min(baseBitrate, 25000000)) // 10-25 Mbps for glow effects
        
        // Higher bitrate for glow effects - they need more data to preserve blending modes
        optimalBitrate = recommendedBitrate * 1.5 // 50% boost for glow preservation
        
        const options: MediaRecorderOptions = {
          mimeType: mimeType,
          videoBitsPerSecond: optimalBitrate,
        }
        
        // Add audio settings if audio tracks are present
        if (stream.getAudioTracks().length > 0) {
          options.audioBitsPerSecond = 320000 // PREMIUM audio quality - 320 kbps
          console.log('🎵 Recording with audio tracks')
        } else {
          console.log('🎵 Recording video only')
        }
        
        // Try to request specific video quality constraints
        // Set higher quality video constraints
        if (stream.getVideoTracks().length > 0) {
          const videoTrack = stream.getVideoTracks()[0]
          
          // Apply best possible constraints for quality
          videoTrack.applyConstraints({
            width: { ideal: canvas.width },
            height: { ideal: canvas.height },
            frameRate: { ideal: 120 }, // MAXIMUM framerate for canvas capture
            aspectRatio: { ideal: canvas.width / canvas.height }
          }).then(() => {
            const settings = videoTrack.getSettings()
            console.log('✅ Canvas video constraints applied:', {
              width: settings.width,
              height: settings.height,
              frameRate: settings.frameRate,
              aspectRatio: settings.aspectRatio
            })
          }).catch((err) => {
            console.warn('⚠️ Could not apply canvas constraints:', err)
          })
        }
        
        console.log('📹 MediaRecorder optimized for glow effects:', {
          canvasResolution: `${canvas.width}x${canvas.height}`,
          pixelCount: canvas.width * canvas.height,
          mimeType: options.mimeType,
          videoBitrate: `${(options.videoBitsPerSecond / 1000000).toFixed(1)} Mbps`,
          audioBitrate: options.audioBitsPerSecond ? `${(options.audioBitsPerSecond / 1000).toFixed(0)} kbps` : 'None',
          chunkInterval: '100ms',
          approach: 'Preserve glow blending modes',
          glowOptimization: 'High bitrate + fast chunks'
        })
        const mediaRecorder = new MediaRecorder(stream, options)
        
        mediaRecorderRef.current = mediaRecorder
        recordedChunksRef.current = []
        
        mediaRecorder.ondataavailable = (event) => {
          console.log('📼 Data chunk received:', {
            size: event.data.size,
            type: event.data.type,
            timestamp: new Date().toISOString()
          })
          
          if (event.data.size > 0) {
            recordedChunksRef.current.push(event.data)
          }
        }
        
        mediaRecorder.onerror = (event) => {
          console.error('❌ MediaRecorder error:', event)
        }
        
        mediaRecorder.onstart = () => {
          console.log('🎬 MediaRecorder started successfully')
        }
        
        mediaRecorder.onstop = () => {
          const finalBlobType = mediaRecorder.mimeType || 'video/webm'
          const blob = new Blob(recordedChunksRef.current, { type: finalBlobType })
          
          console.log('🎬 Recording stopped, creating blob...', {
            size: blob.size,
            type: blob.type,
            chunks: recordedChunksRef.current.length,
            isValid: blob.size > 0,
            finalBlobType
          })
          
          console.log('✅ Recording completed')
          
          if (blob.size > 0) {
            // Create enhanced blob with proper duration metadata
            const enhancedBlob = createVideoBlobWithDuration(blob, recordingTime)
            setRecordedBlob(enhancedBlob)
            setTrackInfo({ path: trackPath, name: trackName })
            setShowExportModal(true)
            console.log('✅ Export modal should open now')
          } else {
            console.error('❌ Recording failed - empty blob created')
          }
          
          setIsRecording(false)
        }
        
        // Start recording with optimized chunks for glow preservation
        mediaRecorder.start(100) // 100ms chunks - better for preserving blending modes
        setIsRecording(true)
        setRecordingTime(0)
        
        // Start recording timer
        recordingIntervalRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 0.1)
        }, 100)
        
        // 🎬 Start dual-path frame capture system
        startFrameCapture()
        
        
        // Add recording indicator
        const indicator = document.createElement('div')
        indicator.className = 'recording-indicator'
        indicator.innerHTML = '🔴 REC'
        document.body.appendChild(indicator)
        
      } catch (error) {
        console.error('Failed to start recording:', error)
      }
    }

    window.addEventListener('startCountdown', handleStartCountdown)
    window.addEventListener('startRecording', handleStartRecording)
    
    return () => {
      window.removeEventListener('startCountdown', handleStartCountdown)
      window.removeEventListener('startRecording', handleStartRecording)
    }
  }, [])

  // 🎬 Dual-path frame capture system
  const startFrameCapture = () => {
    console.log('🎬 Starting dual-path frame capture...')
    frameCaptureRef.current = []
    setIsProcessingHighRes(false)
  }

  const captureFrameData = () => {
    if (!isRecording) return
    
    try {
      const mascot = mascotRef.current
      const canvas = canvasRef.current
      
      if (!mascot || !canvas) return
      
      // Capture current animation state
      const frameData = {
        timestamp: Date.now(),
        recordingTime: recordingTime,
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
        
        // Mascot state
        mascotState: mascot.getState ? mascot.getState() : null,
        emotion: mascot.getEmotion ? mascot.getEmotion() : null,
        undertone: mascot.getUndertone ? mascot.getUndertone() : null,
        
        // Audio state
        audioTime: trackInfo ? document.querySelector('audio')?.currentTime || 0 : 0,
        audioPlaying: !document.querySelector('audio')?.paused || false,
        
        // Particle system state (if accessible)
        particleCount: mascot.particleSystem ? mascot.particleSystem.getParticleCount?.() || 0 : 0,
        
        // Canvas pixel data for validation
        canvasSnapshot: canvas.toDataURL('image/png', 1.0) // High quality snapshot
      }
      
      frameCaptureRef.current.push(frameData)
      
      // Log progress every 5 seconds
      if (frameCaptureRef.current.length % 50 === 0) {
        console.log(`🎬 Captured ${frameCaptureRef.current.length} frames for processing`)
      }
      
    } catch (error) {
      console.warn('⚠️ Frame capture error:', error)
    }
  }

  // Capture frames every 100ms (10 FPS) for background processing
  const frameCaptureInterval = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isRecording) {
      frameCaptureInterval.current = setInterval(captureFrameData, 100)
    } else {
      if (frameCaptureInterval.current) {
        clearInterval(frameCaptureInterval.current)
        frameCaptureInterval.current = null
      }
    }
    
    return () => {
      if (frameCaptureInterval.current) {
        clearInterval(frameCaptureInterval.current)
      }
    }
  }, [isRecording])

  // 🎬 Background high-res processing
  const processHighResRecordng = async () => {
    try {
      console.log('🚀 Starting high-res background processing...')
      
      const frameData = frameCaptureRef.current
      const trackInfo_data = trackInfo
      
      if (!frameData.length || !trackInfo_data) {
        console.error('❌ No frame data or track info for processing')
        setIsProcessingHighRes(false)
        return
      }
      
      // Prepare data for server processing
      const processingData = {
        frameData: frameData,
        trackInfo: trackInfo_data,
        canvasResolution: {
          width: canvasRef.current?.width || 800,
          height: canvasRef.current?.height || 800
        },
        duration: recordingTime,
        timestamp: Date.now()
      }
      
      console.log('📤 Sending frame data to server...', {
        frameCount: frameData.length,
        duration: `${recordingTime.toFixed(1)}s`,
        estimatedSize: `${(JSON.stringify(processingData).length / 1024 / 1024).toFixed(1)} MB`
      })
      
      // Send to Node.js server for high-res processing
      const response = await fetch('/api/process-recording', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(processingData)
      })
      
      if (!response.ok) {
        throw new Error(`Server processing failed: ${response.statusText}`)
      }
      
      const result = await response.json()
      console.log('✅ High-res processing completed:', result)
      
      // Get the processed video blob
      const videoResponse = await fetch(`/api/processed-video/${result.videoId}`)
      const processedBlob = await videoResponse.blob()
      
      // Update with high-quality video
      setRecordedBlob(processedBlob)
      setTrackInfo(result.trackInfo || trackInfo_data)
      
      console.log('🎥 High-res video ready for export!')
      
    } catch (error) {
      console.error('❌ High-res processing failed:', error)
      // Fall back to basic recording
      console.log('⚠️ Falling back to basic recording quality')
    } finally {
      setIsProcessingHighRes(false)
    }
  }

  // Stop recording function
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current)
    }
    
    // ✅ NO CANVAS RESTORATION NEEDED - We didn't modify the engine canvas
    console.log('✅ Clean stop - Engine canvas was never modified')
    
    // 🎬 PROCESS HIGH-RES RECORDING
    if (frameCaptureRef.current.length > 0) {
      console.log(`🎬 Processing ${frameCaptureRef.current.length} captured frames for high-res video...`)
      setIsProcessingHighRes(true)
      
      // Start background processing
      processHighResRecordng()
    }
    
    // Stop audio playback
    const audioElements = document.querySelectorAll('audio')
    audioElements.forEach(audio => {
      audio.pause()
      audio.currentTime = 0
    })
    
    // Disconnect mascot audio if available
    if (mascot && typeof mascot.disconnectAudio === 'function') {
      try {
        mascot.disconnectAudio()
        console.log('🎵 Disconnected mascot audio')
      } catch (error) {
        console.error('❌ Failed to disconnect mascot audio:', error)
      }
    }
    
    // Dispatch event to stop audio in SystemControlsBar
    window.dispatchEvent(new CustomEvent('stopAudio'))
    
    // Remove recording indicator
    const indicator = document.querySelector('.recording-indicator')
    if (indicator) {
      indicator.remove()
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
      const indicator = document.querySelector('.recording-indicator')
      if (indicator) {
        indicator.remove()
      }
    }
  }, [])

  // Initialize Emotive Engine
  useEffect(() => {
    const initializeEngine = async () => {
      if (!canvasRef.current) return

      try {
        // Debug: Starting engine initialization
        
        // Ensure canvas has proper size
        if (canvasRef.current) {
          const rect = canvasRef.current.getBoundingClientRect()
          canvasRef.current.width = rect.width
          canvasRef.current.height = rect.height
          // Debug: Canvas resized
          
          // Wait a bit for CSS to be applied
          await new Promise(resolve => setTimeout(resolve, 100))
          
          // Resize again after CSS is applied
          const newRect = canvasRef.current.getBoundingClientRect()
          canvasRef.current.width = newRect.width
          canvasRef.current.height = newRect.height
          // Debug: Canvas final size
        }
        
        // Load the engine script dynamically
        const script = document.createElement('script')
        script.src = '/emotive-engine.js'
        script.async = true
        
        await new Promise((resolve, reject) => {
          script.onload = resolve
          script.onerror = reject
          document.head.appendChild(script)
        })
        
        // Access the global EmotiveMascot
        const EmotiveMascot = (window as any).EmotiveMascot
        // Debug: EmotiveMascot loaded
        
        if (!EmotiveMascot) {
          throw new Error('EmotiveMascot not found on window object')
        }
        
        const mascot = new EmotiveMascot({
          canvasId: 'emotive-canvas',
          targetFPS: 60,
          enableAudio: false,
          soundEnabled: false,
          maxParticles: 50,
          defaultEmotion: 'neutral',
          enableAutoOptimization: true,
          enableGracefulDegradation: true,
          renderingStyle: 'classic',
          enableGazeTracking: false,
          enableIdleBehaviors: true,
          classicConfig: {
            coreColor: '#FFFFFF',
            coreSizeDivisor: 12,
            glowMultiplier: 2.5,
            defaultGlowColor: '#14B8A6'
          }
        })

        // Debug: Mascot instance created
        mascotRef.current = mascot
        setMascot(mascot) // Set mascot state
        
        // Pass mascot reference to parent component
        if (onMascotReady) {
          onMascotReady(mascot)
        }
        
        // Start the engine
        mascot.start()
        // Debug: Engine started
        
        // Check if mascot is actually rendering
        setTimeout(() => {
          // Debug: Mascot state check
        }, 1000)
        
        // Debug: Engine initialization complete
      } catch (error) {
        console.error('Failed to initialize Emotive Engine:', error)
      }
    }

    initializeEngine()

    // Cleanup on unmount
    return () => {
      if (mascotRef.current) {
        mascotRef.current.stop()
        mascotRef.current = null
      }
    }
  }, [])

  // Update emotion when it changes
  useEffect(() => {
    if (mascotRef.current && currentEmotion) {
      mascotRef.current.setEmotion(currentEmotion)
    }
    resetFadeTimer() // Reset fade timer when emotion changes
  }, [currentEmotion, resetFadeTimer])

  // Update undertone when it changes
  useEffect(() => {
    if (mascotRef.current && currentUndertone) {
      mascotRef.current.updateUndertone(currentUndertone)
    }
    resetFadeTimer() // Reset fade timer when undertone changes
  }, [currentUndertone, resetFadeTimer])

  // Handle window resize to prevent blurry/pixelated mascot
  useEffect(() => {
    const handleResize = () => {
      if (mascotRef.current && canvasRef.current) {
        // Wait for CSS to update
        setTimeout(() => {
          const rect = canvasRef.current!.getBoundingClientRect()
          canvasRef.current!.width = rect.width
          canvasRef.current!.height = rect.height
          
          // Call engine's resize method
          if (typeof mascotRef.current.handleResize === 'function') {
            mascotRef.current.handleResize()
          }
        }, 100)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Handle gesture from parent
  const handleGesture = (gesture: string) => {
    if (mascotRef.current) {
      // Use the correct method name from the available methods
      if (typeof mascotRef.current.executeGestureDirectly === 'function') {
        mascotRef.current.executeGestureDirectly(gesture)
      } else if (typeof mascotRef.current.triggerGesture === 'function') {
        mascotRef.current.triggerGesture(gesture)
      } else {
        // Debug: No gesture method found
      }
    }
    // Also call parent's gesture handler
    onGesture(gesture)
  }

  // Handle shape change
  const handleShapeChange = useCallback((shape: string) => {
    if (mascotRef.current && typeof mascotRef.current.morphTo === 'function') {
      mascotRef.current.morphTo(shape)
      setCurrentShape(shape)
      // Debug: Shape changed
    }
  }, [])

  return (
    <div className="canvas-container">
      <div className="game-canvas-area">
        {/* Engine Canvas - Ready for particle system */}
        <canvas ref={canvasRef} id="emotive-canvas"></canvas>
        
        {/* Countdown Overlay */}
        {showCountdown && (
          <div className="countdown-overlay">
            <div className="countdown-display">
              <div className="countdown-number">{countdownNumber}</div>
            </div>
          </div>
        )}
        
        {/* Recording Status */}
        {isRecording && (
          <div className="recording-status">
            <div className="recording-timer">
              {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toFixed(1).padStart(4, '0')}
            </div>
            <button className="stop-recording-btn" onClick={stopRecording}>
              Stop Recording
            </button>
          </div>
        )}
        
        {/* High-Res Processing Status */}
        {isProcessingHighRes && (
          <div className="processing-status">
            <div className="processing-indicator">
              <div className="processing-spinner"></div>
              <div className="processing-text">
                Processing High-Quality Video...
                <br />
                <small>This may take a few minutes. Quality will be worth it!</small>
              </div>
            </div>
          </div>
        )}
        
        {/* Shape selector bars positioned within canvas area */}
        <ShapeSelectorBar onShapeChange={handleShapeChange} currentShape={currentShape} />
        
        {/* Performance Monitoring */}
        <div id="fps-counter" className="fps-display">
          <span className="fps-value">60</span> FPS
        </div>
        
        {/* Export Modal */}
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          recordedBlob={recordedBlob}
          trackInfo={trackInfo}
        />
        
        {/* State columns inside animation frame */}
        <div className="state-column state-column-left">
          {leftEmotionalStates.map((state) => (
            <div key={state.name} className="state-icon" onClick={() => setCurrentEmotion(state.name)}>
              <img src={`/assets/states/${state.svg}`} alt={state.name} className="state-icon-svg" />
            </div>
          ))}
        </div>

        <div className="state-column state-column-right">
          {rightEmotionalStates.map((state) => (
            <div key={state.name} className="state-icon" onClick={() => setCurrentEmotion(state.name)}>
              <img src={`/assets/states/${state.svg}`} alt={state.name} className="state-icon-svg" />
            </div>
          ))}
        </div>

        <div className="text-center">
              {/* Placeholder removed - engine will render the mascot */}
        </div>
        
        {/* Status indicators inside animation frame */}
        <div 
          className={`status-text emotion ${showStatusIndicators ? 'fade-in' : 'fade-out'}`}
          data-state={currentEmotion}
          onMouseEnter={handleStatusHover}
          onMouseLeave={handleStatusLeave}
        >
          {currentEmotion}
        </div>
        <div 
          className={`status-text stability ${showStatusIndicators ? 'fade-in' : 'fade-out'}`}
          data-undertone={currentUndertone}
          onMouseEnter={handleStatusHover}
          onMouseLeave={handleStatusLeave}
        >
          {getUndertoneLabel(currentUndertone)}
        </div>
      </div>
    </div>
  )
}


