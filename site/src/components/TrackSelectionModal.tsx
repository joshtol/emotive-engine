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
}

export default function TrackSelectionModal({ isOpen, onClose, onTrackSelect }: TrackSelectionModalProps) {
  const [tracks, setTracks] = useState<Track[]>([])
  const [mounted, setMounted] = useState(false)

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
              <div key={index} className="track-item" onClick={() => handleTrackSelect(track)}>
                <div className="track-info">
                  <div className="track-name">{track.name}</div>
                  <div className="track-filename">{track.filename}</div>
                </div>
                <div className="track-play-icon">▶</div>
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

  return createPortal(modalContent, document.body)
}
