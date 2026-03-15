'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'

interface ExampleFrameProps {
  src: string
  title: string
}

export default function ExampleFrame({ src, title }: ExampleFrameProps) {
  const [isLoading, setIsLoading] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Recording state
  const [isRecording, setIsRecording] = useState(false)
  const [recReady, setRecReady] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [mp4Url, setMp4Url] = useState<string | null>(null)
  const [converting, setConverting] = useState(false)
  const [convertError, setConvertError] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [headerEl, setHeaderEl] = useState<Element | null>(null)

  // Find the header element for the portal (may render after this component)
  useEffect(() => {
    const h = document.querySelector('.emotive-header')
    if (h) {
      setHeaderEl(h)
      return
    }
    // Header may not exist yet — watch for it
    const obs = new MutationObserver(() => {
      const el = document.querySelector('.emotive-header')
      if (el) {
        obs.disconnect()
        setHeaderEl(el)
      }
    })
    obs.observe(document.body, { childList: true, subtree: true })
    return () => obs.disconnect()
  }, [])

  // Handle iframe load
  const handleLoad = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setIsLoading(false)
    // Ping the iframe to re-send ready (in case we missed it)
    const iframe = iframeRef.current
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'emotive-rec-ping' }, '*')
    }
  }, [])

  // Reset loading state when src changes and set up fallback timeout
  useEffect(() => {
    setIsLoading(true)
    setRecReady(false)
    setIsRecording(false)

    timeoutRef.current = setTimeout(() => {
      setIsLoading(false)
    }, 5000)

    const iframe = iframeRef.current
    if (iframe) {
      try {
        if (iframe.contentDocument?.readyState === 'complete') {
          handleLoad()
        }
      } catch {
        // Cross-origin
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [src, handleLoad])

  // Convert WebM blob to MP4 via server-side ffmpeg
  const convertToMp4 = useCallback(async (webmBlob: Blob) => {
    setConverting(true)
    setConvertError(false)
    try {
      const convertResp = await fetch('/api/convert-video', {
        method: 'POST',
        body: webmBlob,
      })
      if (!convertResp.ok) throw new Error('Conversion failed')
      const mp4Blob = await convertResp.blob()
      const url = URL.createObjectURL(mp4Blob)
      setMp4Url(url)
    } catch {
      setConvertError(true)
    } finally {
      setConverting(false)
    }
  }, [])

  // Listen for messages from the iframe's record.js
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (!e.data || !e.data.type) return
      switch (e.data.type) {
        case 'emotive-rec-ready':
          setRecReady(true)
          break
        case 'emotive-rec-countdown':
          setCountdown(e.data.count || 0)
          break
        case 'emotive-rec-started':
          setCountdown(0)
          setIsRecording(true)
          break
        case 'emotive-rec-stopped':
          setIsRecording(false)
          if (e.data.blob) {
            const localUrl = URL.createObjectURL(e.data.blob)
            setBlobUrl(localUrl)
            setShowModal(true)
            if (e.data.format === 'mp4') {
              // Already recorded as MP4 natively — no conversion needed
              setMp4Url(localUrl)
            } else {
              // WebM recording — try server-side conversion to MP4
              convertToMp4(e.data.blob)
            }
          } else if (e.data.blobUrl) {
            setBlobUrl(e.data.blobUrl)
            setShowModal(true)
          }
          break
        case 'emotive-rec-error':
          setIsRecording(false)
          console.warn('Recording error:', e.data.error)
          break
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [convertToMp4])

  const toggleRecording = useCallback(() => {
    const iframe = iframeRef.current
    if (!iframe?.contentWindow || !recReady) return
    if (isRecording) {
      iframe.contentWindow.postMessage({ type: 'emotive-rec-stop' }, '*')
    } else {
      iframe.contentWindow.postMessage({ type: 'emotive-rec-start' }, '*')
    }
  }, [isRecording, recReady])

  const closeModal = useCallback(() => {
    setShowModal(false)
    setCopied(false)
    setConvertError(false)
    if (blobUrl) {
      const url = blobUrl
      setTimeout(() => URL.revokeObjectURL(url), 300)
      setBlobUrl(null)
    }
    if (mp4Url) {
      const url = mp4Url
      setTimeout(() => URL.revokeObjectURL(url), 300)
      setMp4Url(null)
    }
  }, [blobUrl, mp4Url])

  const [copied, setCopied] = useState(false)

  const handleDownload = useCallback(() => {
    const url = mp4Url || blobUrl
    if (!url) return
    const a = document.createElement('a')
    a.download = mp4Url ? 'emotive-engine.mp4' : 'emotive-engine.webm'
    a.href = url
    a.click()
  }, [blobUrl, mp4Url])

  const handleShare = useCallback(async () => {
    // Prefer MP4 for maximum platform compatibility
    const url = mp4Url || blobUrl
    if (!url) return
    const isMp4 = !!mp4Url
    try {
      const resp = await fetch(url)
      const blob = await resp.blob()
      const file = new File(
        [blob],
        isMp4 ? 'emotive-engine.mp4' : 'emotive-engine.webm',
        { type: isMp4 ? 'video/mp4' : 'video/webm' },
      )
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Made with Emotive Engine' })
      } else {
        await navigator.share({ title: 'Made with Emotive Engine', text: 'Check out this animation made with Emotive Engine!' })
      }
    } catch {
      // user cancelled or unsupported
    }
  }, [blobUrl, mp4Url])

  const handleCopy = useCallback(async () => {
    if (!blobUrl) return
    try {
      const resp = await fetch(blobUrl)
      const blob = await resp.blob()
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ])
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API may not support video — fall back to download
      handleDownload()
    }
  }, [blobUrl, handleDownload])

  // Check if Web Share API is available
  const canShare = typeof navigator !== 'undefined' && !!navigator.share

  // Slide-out prompt: show "Record and share!" then collapse back to dot
  const [showPrompt, setShowPrompt] = useState(false)
  useEffect(() => {
    if (!recReady || isRecording) return
    const expandTimer = setTimeout(() => setShowPrompt(true), 1200)
    const collapseTimer = setTimeout(() => setShowPrompt(false), 5000)
    return () => { clearTimeout(expandTimer); clearTimeout(collapseTimer) }
  }, [recReady, isRecording])

  // Record button rendered into the header via portal
  const pillExpanded = isRecording || showPrompt || countdown > 0
  const recordButton = headerEl ? createPortal(
    <button
      onClick={toggleRecording}
      className="emotive-rec-header-btn"
      aria-label={isRecording ? 'Stop recording' : 'Record animation'}
      style={{
        all: 'unset',
        boxSizing: 'border-box',
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '0px',
        padding: '0',
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '22px',
        cursor: 'pointer',
        transition: 'background 0.2s, border-color 0.2s',
        userSelect: 'none',
        zIndex: 10,
        opacity: recReady && !countdown ? 1 : 0.4,
        pointerEvents: recReady && !countdown ? 'auto' : 'none',
        overflow: 'hidden',
      } as React.CSSProperties}
    >
      {/* Red dot */}
      <span style={{
        width: '36px',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span style={{
          width: '14px',
          height: '14px',
          borderRadius: '50%',
          background: '#e53e3e',
          animation: isRecording ? 'emotive-rec-pulse 1s ease-in-out infinite' : 'none',
        }} />
      </span>
      {/* Sliding label */}
      <span style={{
        color: 'rgba(255, 255, 255, 0.85)',
        fontSize: '12px',
        fontWeight: 500,
        letterSpacing: '0.3px',
        whiteSpace: 'nowrap',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        overflow: 'hidden',
        maxWidth: pillExpanded ? '160px' : '0px',
        opacity: pillExpanded ? 1 : 0,
        paddingRight: pillExpanded ? '14px' : '0px',
        transition: 'max-width 0.4s ease, opacity 0.3s ease, padding-right 0.4s ease',
      }}>
        {countdown > 0 ? `Starting in ${countdown}...` : isRecording ? 'REC ■' : 'Record and share!'}
      </span>
    </button>,
    headerEl
  ) : null

  return (
    <>
      <style>{`
        @keyframes emotive-rec-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        @keyframes emotive-spin {
          to { transform: rotate(360deg); }
        }
        .emotive-rec-header-btn:hover {
          background: rgba(0, 0, 0, 0.65) !important;
          border-color: rgba(255, 255, 255, 0.2) !important;
        }
        .emotive-share-btn-primary:hover {
          background: rgba(221, 74, 154, 0.15) !important;
          border-color: rgba(221, 74, 154, 0.5) !important;
        }
        .emotive-share-btn:hover {
          background: rgba(255, 255, 255, 0.05) !important;
          border-color: rgba(255, 255, 255, 0.2) !important;
          color: rgba(255, 255, 255, 0.85) !important;
        }
        .emotive-modal-close:hover {
          color: rgba(255, 255, 255, 0.7) !important;
        }
      `}</style>

      {recordButton}

      <main style={{
        minHeight: 'calc(100vh - 80px)',
        background: '#0a0a0a',
        paddingTop: 0,
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
            height: '100vh',
            border: 'none',
            background: '#0a0a0a',
            opacity: isLoading ? 0 : 1,
            transition: 'opacity 0.3s ease',
          }}
        />
      </main>

      {/* Share Modal */}
      {showModal && blobUrl && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100000,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{
            background: 'rgba(14, 14, 14, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(242, 241, 241, 0.08)',
            borderRadius: '16px',
            padding: '20px',
            maxWidth: '340px',
            width: '88vw',
            color: '#F2F1F1',
            fontFamily: 'var(--font-space-grotesk, "Space Grotesk", system-ui, sans-serif)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7)',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                letterSpacing: '0.3px',
                color: '#B8B8B8',
              }}>
                {converting ? 'Converting...' : 'Recording ready'}
              </span>
              <button
                onClick={closeModal}
                className="emotive-modal-close"
                style={{
                  all: 'unset',
                  cursor: 'pointer',
                  color: 'rgba(255,255,255,0.35)',
                  fontSize: '18px',
                  lineHeight: 1,
                  padding: '2px',
                  transition: 'color 0.2s ease',
                }}
              >
                &#x2715;
              </button>
            </div>

            {/* Video preview */}
            <video
              src={mp4Url || blobUrl}
              autoPlay
              loop
              muted
              playsInline
              style={{
                width: '100%',
                borderRadius: '8px',
                background: '#000',
                marginBottom: '14px',
              }}
            />

            {/* Converting indicator */}
            {converting && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '8px',
                marginBottom: '10px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.03)',
                fontSize: '0.75rem',
                color: '#888',
                letterSpacing: '0.3px',
              }}>
                <span style={{
                  width: '12px',
                  height: '12px',
                  border: '2px solid rgba(255,255,255,0.08)',
                  borderTopColor: '#888',
                  borderRadius: '50%',
                  animation: 'emotive-spin 0.8s linear infinite',
                }} />
                Converting to MP4...
              </div>
            )}

            {/* Actions — all same weight, row of three */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {canShare && (
                <button
                  onClick={handleShare}
                  disabled={converting}
                  className="emotive-share-btn-primary"
                  style={{
                    all: 'unset',
                    boxSizing: 'border-box',
                    flex: 1,
                    padding: '0.6rem 0.5rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(221, 74, 154, 0.35)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    textAlign: 'center',
                    cursor: converting ? 'wait' : 'pointer',
                    background: 'rgba(221, 74, 154, 0.08)',
                    color: converting ? '#666' : '#DD4A9A',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {converting ? '...' : mp4Url ? 'Share' : 'Share'}
                </button>
              )}
              <button
                onClick={handleCopy}
                className="emotive-share-btn"
                style={{
                  all: 'unset',
                  boxSizing: 'border-box',
                  flex: 1,
                  padding: '0.6rem 0.5rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: 'transparent',
                  color: 'rgba(255, 255, 255, 0.6)',
                  transition: 'all 0.2s ease',
                }}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={handleDownload}
                disabled={converting}
                className="emotive-share-btn"
                style={{
                  all: 'unset',
                  boxSizing: 'border-box',
                  flex: 1,
                  padding: '0.6rem 0.5rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  textAlign: 'center',
                  cursor: converting ? 'wait' : 'pointer',
                  background: 'transparent',
                  color: 'rgba(255, 255, 255, 0.6)',
                  opacity: converting ? 0.4 : 1,
                  transition: 'all 0.2s ease',
                }}
              >
                {converting ? '...' : 'Download'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
