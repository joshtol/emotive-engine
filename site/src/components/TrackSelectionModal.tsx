'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface Track {
  name: string
  filename: string
  duration?: string
}

interface TrackSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onTrackSelect: (trackPath: string) => void
  onRecordTrack?: (trackPath: string, trackName: string) => void
}

export default function TrackSelectionModal({ isOpen, onClose, onTrackSelect, onRecordTrack }: TrackSelectionModalProps) {
  const [tracks, setTracks] = useState<Track[]>([])
  const [mounted, setMounted] = useState(false)
  const [showRecordingPopup, setShowRecordingPopup] = useState(false)
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null)

  // Demo tracks - you can expand this list as you add more tracks
  const demoTracks: Track[] = [
    { name: 'Electric Glow (Female)', filename: 'electric-glow-f.wav' },
    { name: 'Electric Glow (Male)', filename: 'electric-glow-m.wav' }
  ]

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setTracks(demoTracks)
    }
  }, [isOpen])

  const handleTrackSelect = (track: Track) => {
    const trackPath = `/assets/tracks/music/${track.filename}`
    onTrackSelect(trackPath)
    onClose()
  }

  const handleRecordClick = (track: Track) => {
    setSelectedTrack(track)
    setShowRecordingPopup(true)
  }

  const handleStartRecording = () => {
    if (selectedTrack && onRecordTrack) {
      const trackPath = `/assets/tracks/music/${selectedTrack.filename}`
      onRecordTrack(trackPath, selectedTrack.name)
      setShowRecordingPopup(false)
      onClose()
    }
  }

  if (!isOpen || !mounted) return null

  const modalContent = (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Select Demo Track</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="track-list">
            {tracks.map((track, index) => (
              <div key={index} className="track-item">
                <div className="track-info" onClick={() => handleTrackSelect(track)}>
                  <div className="track-name">{track.name}</div>
                  <div className="track-filename">{track.filename}</div>
                </div>
                <div className="track-actions">
                  <button className="track-play-button" onClick={() => handleTrackSelect(track)}>
                    ▶
                  </button>
                  {onRecordTrack && (
                    <button className="track-record-button" onClick={() => handleRecordClick(track)}>
                      🎥
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="modal-cancel" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )

  const recordingPopup = showRecordingPopup && selectedTrack && (
    <div className="modal-overlay" onClick={() => setShowRecordingPopup(false)}>
      <div className="modal-content recording-popup" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Record Animation</h3>
          <button className="modal-close" onClick={() => setShowRecordingPopup(false)}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="recording-explanation">
            <h4>What does recording do?</h4>
            <p>Recording captures the mascot's animation synchronized to the music track. After you start recording, the track will play normally and you can use all the controls to create your animation.</p>
            <p>The recording will capture everything you see on screen, including all the visual effects and mascot movements.</p>
          </div>
          
          <div className="track-selection">
            <p><strong>Selected track:</strong> {selectedTrack.name}</p>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="modal-cancel" onClick={() => setShowRecordingPopup(false)}>Cancel</button>
          <button className="start-recording-button" onClick={handleStartRecording}>
            Start Recording
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(
    <>
      {modalContent}
      {recordingPopup}
    </>, 
    document.body
  )
}
