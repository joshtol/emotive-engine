'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

interface Platform {
  id: string
  name: string
  aspectRatio: string
  maxDuration: number
  resolution: string
  format: string
}

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  recordedBlob: Blob | null
  trackInfo: { path: string; name: string } | null
}

const platforms: Platform[] = [
  {
    id: 'tiktok',
    name: 'TikTok',
    aspectRatio: '9:16',
    maxDuration: 180, // 3 minutes
    resolution: '1080x1920',
    format: 'MP4'
  },
  {
    id: 'reels',
    name: 'Instagram Reels',
    aspectRatio: '9:16',
    maxDuration: 90, // 1.5 minutes
    resolution: '1080x1920',
    format: 'MP4'
  },
  {
    id: 'youtube-shorts',
    name: 'YouTube Shorts',
    aspectRatio: '9:16',
    maxDuration: 60, // 1 minute
    resolution: '1080x1920',
    format: 'MP4'
  },
  {
    id: 'twitter',
    name: 'Twitter/X',
    aspectRatio: '16:9',
    maxDuration: 140, // 2.3 minutes
    resolution: '1920x1080',
    format: 'MP4'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    aspectRatio: '16:9',
    maxDuration: 240, // 4 minutes
    resolution: '1920x1080',
    format: 'MP4'
  }
]

export default function ExportModal({ isOpen, onClose, recordedBlob, trackInfo }: ExportModalProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(platforms[0])
  const [selectedStart, setSelectedStart] = useState(0)
  const [selectedEnd, setSelectedEnd] = useState(0)
  const [videoDuration, setVideoDuration] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [audioWaveform, setAudioWaveform] = useState<number[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [dragType, setDragType] = useState<'start' | 'end' | 'scrub' | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (recordedBlob) {
      console.log('🔄 Setting up video duration detection...')
      
      // Check for custom duration first
      const customBlob = recordedBlob as any
      if (customBlob.customDuration && customBlob.customDuration > 0) {
        console.log('✅ Using custom duration from recording:', customBlob.customDuration)
        setVideoDuration(customBlob.customDuration)
        setSelectedStart(0)
        setSelectedEnd(Math.min(customBlob.customDuration, selectedPlatform.maxDuration))
        generateAudioWaveform(recordedBlob)
        return
      }
      
      // Create video element to get duration
      const video = document.createElement('video')
      video.src = URL.createObjectURL(recordedBlob)
      video.muted = true // Mute to avoid audio conflicts
      video.preload = 'metadata'
      
      const handleLoadedMetadata = () => {
        const duration = video.duration || 0
        console.log('📹 Video metadata loaded via temp element:', {
          duration: duration,
          platformMaxDuration: selectedPlatform.maxDuration,
          isValid: !isNaN(duration) && duration > 0 && duration !== Infinity,
          blobSize: recordedBlob.size
        })
        
        if (!isNaN(duration) && duration > 0 && duration !== Infinity) {
          setVideoDuration(duration)
          setSelectedStart(0) // Always start from beginning
          setSelectedEnd(Math.min(duration, selectedPlatform.maxDuration))
          generateAudioWaveform(recordedBlob)
          console.log('✅ Duration set successfully:', duration)
        } else {
          console.error('❌ Invalid/infinite video duration detected:', duration)
          // Calculate estimated duration based on blob size
          // Rough estimation: ~200KB per second for decent quality WebM
          const estimatedDuration = Math.max(15, recordedBlob.size / 200000)
          console.log('🔄 Using estimated duration based on blob size:', estimatedDuration)
          setVideoDuration(estimatedDuration)
          setSelectedStart(0)
          setSelectedEnd(Math.min(estimatedDuration, selectedPlatform.maxDuration))
        }
        
        URL.revokeObjectURL(video.src)
      }
      
      const handleError = () => {
        console.error('❌ Temp video element failed to load metadata')
        URL.revokeObjectURL(video.src)
      }
      
      video.addEventListener('loadedmetadata', handleLoadedMetadata)
      video.addEventListener('error', handleError)
      
      return () => {
        URL.revokeObjectURL(video.src)
      }
    }
  }, [recordedBlob, selectedPlatform])

  const generateAudioWaveform = async (blob: Blob) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const arrayBuffer = await blob.arrayBuffer()
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
      
      const channelData = audioBuffer.getChannelData(0)
      const samples = 200 // Number of waveform points
      const blockSize = Math.floor(channelData.length / samples)
      const waveform: number[] = []
      
      for (let i = 0; i < samples; i++) {
        let sum = 0
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(channelData[i * blockSize + j])
        }
        waveform.push(sum / blockSize)
      }
      
      setAudioWaveform(waveform)
      audioContext.close()
    } catch (error) {
      console.error('Failed to generate waveform:', error)
    }
  }

  const handlePlatformChange = (platform: Platform) => {
    setSelectedPlatform(platform)
    // Adjust end time if it exceeds platform limit
    if (selectedEnd > platform.maxDuration) {
      setSelectedEnd(platform.maxDuration)
    }
  }

  const exportVideo = async () => {
    if (!recordedBlob || !trackInfo) {
      console.error('❌ No recorded blob or track info available')
      return
    }

    setIsExporting(true)
    
    try {
      console.log('📥 Exporting video:', {
        blobSize: recordedBlob.size,
        platform: selectedPlatform.name,
        selection: { start: selectedStart, end: selectedEnd }
      })
      
      // For now, just download the original recorded video
      // TODO: Later we can implement proper trimming and format conversion
      const url = URL.createObjectURL(recordedBlob)
      
      // Create download link
      const a = document.createElement('a')
      a.href = url
      a.download = `${trackInfo.name.replace(/\s+/g, '-').toLowerCase()}-${selectedPlatform.name.toLowerCase()}.webm`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      
      URL.revokeObjectURL(url)
      console.log('✅ Video exported successfully')
      
      setIsExporting(false)
      onClose()
      
    } catch (error) {
      console.error('❌ Export failed:', error)
      setIsExporting(false)
    }
  }

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds) || isNaN(seconds) || seconds === 0) {
      return '0:00'
    }
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || videoDuration === 0) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = Math.max(0, Math.min(1, clickX / rect.width))
    const clickTime = percentage * videoDuration
    
    // Seek to clicked time regardless of selection
    videoRef.current.currentTime = clickTime
    setCurrentTime(clickTime)
    console.log('📍 Timeline clicked:', { clickTime, percentage, videoDuration })
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, type: 'start' | 'end' | 'scrub') => {
    setIsDragging(true)
    setDragType(type)
    e.preventDefault()
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !videoRef.current || videoDuration === 0) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const percentage = Math.max(0, Math.min(1, mouseX / rect.width))
    const mouseTime = percentage * videoDuration
    
    if (dragType === 'start') {
      const newStart = Math.max(0, Math.min(mouseTime, selectedEnd - 0.1))
      setSelectedStart(newStart)
    } else if (dragType === 'end') {
      const newEnd = Math.min(videoDuration, Math.max(mouseTime, selectedStart + 0.1))
      setSelectedEnd(newEnd)
    } else if (dragType === 'scrub') {
      videoRef.current.currentTime = mouseTime
      setCurrentTime(mouseTime)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setDragType(null)
  }

  const playPause = () => {
    if (!videoRef.current || videoDuration === 0) return
    
    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      videoRef.current.play()
      setIsPlaying(true)
    }
    console.log('🎮 Play/pause toggled:', !isPlaying)
  }

  const playSelectedClip = () => {
    if (!videoRef.current || videoDuration === 0) return
    
    videoRef.current.currentTime = selectedStart
    setIsPlaying(true)
    videoRef.current.play()
    
    console.log('🎬 Playing selected clip:', { start: selectedStart, end: selectedEnd })
    
    // Stop at selected end
    const checkTime = () => {
      if (videoRef.current && videoRef.current.currentTime >= selectedEnd) {
        videoRef.current.pause()
        setIsPlaying(false)
        console.log('⏹️ Clip playback stopped at end')
      } else if (videoRef.current && !videoRef.current.paused) {
        requestAnimationFrame(checkTime)
      }
    }
    requestAnimationFrame(checkTime)
  }

  // Debug logging
  console.log('🔄 ExportModal render state:', {
    isOpen, mounted: !!mounted, 
    hasBlob: !!recordedBlob, 
    blobSize: recordedBlob?.size || 0,
    blobType: recordedBlob?.type || 'none',
    hasTrackInfo: !!trackInfo,
    videoDuration,
    selectedStart,
    selectedEnd
  })

  if (!isOpen || !mounted || !recordedBlob || !trackInfo) {
    console.log('❌ ExportModal not rendering:', { isOpen, mounted: !!mounted, hasBlob: !!recordedBlob, hasTrackInfo: !!trackInfo })
    return null
  }

  const modalContent = (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content export-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Export Video</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="track-info">
            <h3>{trackInfo.name}</h3>
            <p>Duration: {formatTime(videoDuration)}</p>
          </div>
          
          {/* Advanced Timeline - Moved to top */}
          <div className="advanced-timeline">
            <div className="timeline-header">
              <span>Select Clip</span>
              <span>Selection: {formatTime(selectedEnd - selectedStart)}</span>
            </div>
            
            <div 
              className="timeline-container"
              onClick={handleTimelineClick}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Audio Waveform */}
              <div className="waveform-track">
                {audioWaveform.map((amplitude, index) => (
                  <div
                    key={index}
                    className="waveform-bar"
                    style={{
                      height: `${amplitude * 100}%`,
                      left: `${(index / audioWaveform.length) * 100}%`
                    }}
                  />
                ))}
              </div>
              
              {/* Selection Range */}
              <div 
                className="selection-range"
                style={{ 
                  left: `${(selectedStart / videoDuration) * 100}%`,
                  width: `${((selectedEnd - selectedStart) / videoDuration) * 100}%`
                }}
              />
              
              {/* Start Handle */}
              <div 
                className="selection-handle start-handle"
                style={{ left: `${(selectedStart / videoDuration) * 100}%` }}
                onMouseDown={(e) => handleMouseDown(e, 'start')}
              />
              
              {/* End Handle */}
              <div 
                className="selection-handle end-handle"
                style={{ left: `${(selectedEnd / videoDuration) * 100}%` }}
                onMouseDown={(e) => handleMouseDown(e, 'end')}
              />
              
              {/* Current Time Indicator */}
              <div 
                className="current-time-indicator"
                style={{ left: `${(currentTime / videoDuration) * 100}%` }}
              />
            </div>
            
            <div className="timeline-labels">
              <span>0:00</span>
              <span>{formatTime(videoDuration)}</span>
            </div>
          </div>
          
          {/* Video Preview */}
          <div className="video-preview">
            <video
              ref={videoRef}
              src={recordedBlob ? URL.createObjectURL(recordedBlob) : undefined}
              onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              onLoadStart={() => {
                console.log('🎥 Video load started')
              }}
              onLoadedMetadata={() => {
                console.log('🎥 Video metadata loaded:', {
                  duration: videoRef.current?.duration,
                  currentSrc: videoRef.current?.currentSrc,
                  readyState: videoRef.current?.readyState,
                  src: videoRef.current?.src
                })
                if (videoRef.current && !isNaN(videoRef.current.duration) && videoRef.current.duration > 0) {
                  const duration = videoRef.current.duration
                  setVideoDuration(duration)
                  setSelectedStart(0)
                  setSelectedEnd(Math.min(duration, selectedPlatform.maxDuration))
                  console.log('✅ Video duration set to:', duration)
                } else {
                  console.error('❌ Invalid duration in metadata:', videoRef.current?.duration)
                }
              }}
              onLoadedData={() => {
                console.log('🎥 Video data loaded:', {
                  duration: videoRef.current?.duration,
                  valid: videoRef.current && !isNaN(videoRef.current.duration) && videoRef.current.duration > 0
                })
                if (videoRef.current && !isNaN(videoRef.current.duration) && videoRef.current.duration > 0) {
                  const duration = videoRef.current.duration
                  setVideoDuration(duration)
                  setSelectedStart(0)  
                  setSelectedEnd(Math.min(duration, selectedPlatform.maxDuration))
                }
              }}
              onCanPlay={() => {
                console.log('🎥 Video can play:', {
                  duration: videoRef.current?.duration,
                  readyState: videoRef.current?.readyState
                })
              }}
              onError={(e) => {
                console.error('❌ Video playback error:', e)
                console.error('❌ Video element details:', {
                  src: videoRef.current?.src,
                  currentSrc: videoRef.current?.currentSrc,
                  error: videoRef.current?.error,
                  networkState: videoRef.current?.networkState,
                  readyState: videoRef.current?.readyState
                })
              }}
              controls
              preload="metadata"
              style={{ width: '100%', maxHeight: '300px' }}
            />
            <div className="video-controls">
              <button onClick={playPause} className="play-btn">
                {isPlaying ? '⏸️' : '▶️'}
              </button>
              <button onClick={playSelectedClip} className="play-clip-btn">
                Play Selected Clip
              </button>
              <span className="time-display">
                {formatTime(currentTime)} / {formatTime(videoDuration)}
              </span>
            </div>
          </div>
          
          <div className="platform-selection">
            <h4>Select Platform</h4>
            <div className="platform-grid">
              {platforms.map((platform) => (
                <div 
                  key={platform.id}
                  className={`platform-option ${selectedPlatform.id === platform.id ? 'selected' : ''}`}
                  onClick={() => handlePlatformChange(platform)}
                >
                  <div className="platform-name">{platform.name}</div>
                  <div className="platform-specs">
                    <div>{platform.aspectRatio}</div>
                    <div>{platform.resolution}</div>
                    <div>Max: {formatTime(platform.maxDuration)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="modal-cancel" onClick={onClose}>Cancel</button>
          <button 
            className="export-button" 
            onClick={exportVideo}
            disabled={isExporting}
          >
            {isExporting ? 'Exporting...' : `Export for ${selectedPlatform.name}`}
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
