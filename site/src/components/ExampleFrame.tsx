'use client'

import { useEffect, useState, useRef, useCallback } from 'react'

interface ExampleFrameProps {
  src: string
  title: string
}

export default function ExampleFrame({ src, title }: ExampleFrameProps) {
  const [isLoading, setIsLoading] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Handle iframe load
  const handleLoad = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setIsLoading(false)
  }, [])

  // Reset loading state when src changes and set up fallback timeout
  useEffect(() => {
    setIsLoading(true)

    // Fallback: if onLoad doesn't fire within 5 seconds, show content anyway
    // This handles cases where iframe is cached or onLoad doesn't fire
    timeoutRef.current = setTimeout(() => {
      setIsLoading(false)
    }, 5000)

    // Check if iframe is already loaded (cached content)
    const iframe = iframeRef.current
    if (iframe) {
      // For same-origin iframes, we can check readyState
      try {
        if (iframe.contentDocument?.readyState === 'complete') {
          handleLoad()
        }
      } catch {
        // Cross-origin - can't check, rely on onLoad event
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [src, handleLoad])

  return (
    <main style={{
      minHeight: 'calc(100vh - 80px)',
      background: '#0a0a0a',
      paddingTop: '80px',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    }}>
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'rgba(255,255,255,0.5)',
          fontSize: '14px',
          zIndex: 10,
        }}>
          Loading {title}...
        </div>
      )}
      <iframe
        ref={iframeRef}
        key={src}
        src={src}
        title={title}
        onLoad={handleLoad}
        style={{
          flex: 1,
          width: '100%',
          height: 'calc(100vh - 80px)',
          border: 'none',
          background: '#0a0a0a',
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.3s ease',
        }}
      />
    </main>
  )
}
