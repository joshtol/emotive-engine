'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface UndertoneDialProps {
  currentUndertone: string
  onUndertoneChange: (undertone: string) => void
}

const UNDERTONES = [
  { name: 'none', label: 'CLEAR', saturation: 0, angle: 0 },
  { name: 'nervous', label: 'NERVOUS', saturation: 15, angle: 60 },
  { name: 'confident', label: 'CONFIDENT', saturation: 30, angle: 120 },
  { name: 'tired', label: 'TIRED', saturation: -20, angle: 180 },
  { name: 'intense', label: 'INTENSE', saturation: 60, angle: 240 },
  { name: 'subdued', label: 'SUBDUED', saturation: -50, angle: 300 }
]

export default function UndertoneDial({ currentUndertone, onUndertoneChange }: UndertoneDialProps) {
  const [isDragging, setIsDragging] = useState(false)
  const dialRef = useRef<HTMLDivElement>(null)
  const [rotation, setRotation] = useState(0)

  // Calculate rotation based on current undertone
  useEffect(() => {
    const undertone = UNDERTONES.find(u => u.name === currentUndertone)
    if (undertone) {
      setRotation(undertone.angle)
    }
  }, [currentUndertone])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true)
    e.preventDefault()
  }, [])

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !dialRef.current) return

    const rect = dialRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const deltaX = e.clientX - centerX
    const deltaY = e.clientY - centerY
    
    let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI)
    angle = (angle + 90 + 360) % 360 // Normalize to 0-360, starting from top

    // Find closest undertone
    const closestUndertone = UNDERTONES.reduce((closest, undertone) => {
      const diff = Math.abs(angle - undertone.angle)
      const closestDiff = Math.abs(angle - closest.angle)
      return diff < closestDiff ? undertone : closest
    })

    setRotation(angle)
    onUndertoneChange(closestUndertone.name)
  }

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging])

  const handleDialClick = useCallback((e: React.MouseEvent) => {
    if (!dialRef.current) return
    
    const rect = dialRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const deltaX = e.clientX - centerX
    const deltaY = e.clientY - centerY
    
    let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI)
    angle = (angle + 90 + 360) % 360 // Normalize to 0-360, starting from top
    
    // Find closest undertone
    const closestUndertone = UNDERTONES.reduce((closest, undertone) => {
      const diff = Math.abs(angle - undertone.angle)
      const closestDiff = Math.abs(angle - closest.angle)
      return diff < closestDiff ? undertone : closest
    })
    
    setRotation(closestUndertone.angle)
    onUndertoneChange(closestUndertone.name)
  }, [onUndertoneChange])

  return (
    <div className="undertone-dial-container">
      <h2 className="section-header">UNDERTONE</h2>
      <div className="single-fade-rule"></div>
      
      <div className="undertone-dial-wrapper">
        <div 
          ref={dialRef}
          className="undertone-dial"
          onMouseDown={handleMouseDown}
          onClick={handleDialClick}
        >
          {/* Center indicator */}
          <div className="dial-center">
            <div className="dial-pointer" style={{ transform: `translate(-50%, -100%) rotate(${rotation}deg)` }}></div>
          </div>
        </div>
        
        {/* Current undertone display */}
        <div className="current-undertone">
          {UNDERTONES.find(u => u.name === currentUndertone)?.label || 'CLEAR'}
        </div>
      </div>
    </div>
  )
}
