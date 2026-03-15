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
        case 'emotive-rec-started':
          setIsRecording(true)
          break
        case 'emotive-rec-stopped':
          setIsRecording(false)
          if (e.data.blob) {
            // Create a local blob URL for preview (iframe blob URLs can't be fetched cross-document)
            const localUrl = URL.createObjectURL(e.data.blob)
            setBlobUrl(localUrl)
            setShowModal(true)
            convertToMp4(e.data.blob)
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
  const pillExpanded = isRecording || showPrompt
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
        opacity: recReady ? 1 : 0.4,
        pointerEvents: recReady ? 'auto' : 'none',
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
        {isRecording ? 'REC ■' : 'Record and share!'}
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
          filter: brightness(1.15) !important;
        }
        .emotive-share-btn:hover {
          background: rgba(255, 255, 255, 0.14) !important;
          border-color: rgba(255, 255, 255, 0.25) !important;
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
            background: 'rgba(20, 20, 25, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '400px',
            width: '90vw',
            color: '#fff',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '16px', fontWeight: 600 }}>
                {converting ? 'Converting to MP4...' : convertError ? 'Recording ready!' : 'Recording ready!'}
              </span>
              <button
                onClick={closeModal}
                style={{
                  all: 'unset',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '20px',
                  borderRadius: '6px',
                }}
              >
                &times;
              </button>
            </div>
            <video
              src={mp4Url || blobUrl}
              autoPlay
              loop
              muted
              playsInline
              style={{ width: '100%', borderRadius: '10px', background: '#000', marginBottom: '16px' }}
            />
            {converting && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px',
                marginBottom: '10px',
                borderRadius: '10px',
                background: 'rgba(99, 102, 241, 0.12)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                fontSize: '13px',
                color: 'rgba(255,255,255,0.7)',
              }}>
                <span style={{
                  width: '14px',
                  height: '14px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#8b5cf6',
                  borderRadius: '50%',
                  animation: 'emotive-spin 0.8s linear infinite',
                }} />
                Converting to MP4 for sharing...
              </div>
            )}
            {canShare && (
              <button
                onClick={handleShare}
                disabled={converting}
                className="emotive-share-btn-primary"
                style={{
                  all: 'unset',
                  boxSizing: 'border-box',
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 600,
                  textAlign: 'center',
                  cursor: converting ? 'wait' : 'pointer',
                  background: converting
                    ? 'rgba(99, 102, 241, 0.4)'
                    : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#fff',
                  marginBottom: '10px',
                  letterSpacing: '0.3px',
                  opacity: converting ? 0.6 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                {converting ? 'Preparing...' : mp4Url ? 'Share MP4' : 'Share'}
              </button>
            )}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleCopy}
                className="emotive-share-btn"
                style={{
                  all: 'unset',
                  boxSizing: 'border-box',
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  fontSize: '13px',
                  fontWeight: 500,
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: 'rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.85)',
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
                  padding: '10px 16px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  fontSize: '13px',
                  fontWeight: 500,
                  textAlign: 'center',
                  cursor: converting ? 'wait' : 'pointer',
                  background: 'rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.85)',
                  opacity: converting ? 0.5 : 1,
                }}
              >
                {converting ? 'Converting...' : mp4Url ? 'Download MP4' : 'Download'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
