'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useRef, useCallback, useEffect } from 'react'
import TrackSelectionModal from './TrackSelectionModal'

interface NavSection {
  category: string
  items: Array<{
    title: string
    slug: string[]
  }>
}

interface EmotiveHeaderProps {
  showMusicControls?: boolean
  mascot?: any
  onMessage?: (type: string, content: string, duration?: number) => void
  docsNavigation?: NavSection[]
  onMobileMenuChange?: (isOpen: boolean) => void
}

export default function EmotiveHeader({ showMusicControls = false, mascot, onMessage, docsNavigation, onMobileMenuChange }: EmotiveHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isUseCasesOpen, setIsUseCasesOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [mobileUseCasesExpanded, setMobileUseCasesExpanded] = useState(false)
  const [mobileDocsExpanded, setMobileDocsExpanded] = useState<Record<string, boolean>>({})

  // Notify parent when mobile menu state changes
  const toggleMobileMenu = useCallback(() => {
    const newState = !isMobileMenuOpen
    setIsMobileMenuOpen(newState)
    // Expand Use Cases by default when opening mobile menu, unless on docs pages
    if (newState) {
      const isDocsPage = pathname.startsWith('/docs')
      setMobileUseCasesExpanded(!isDocsPage)
    }
    onMobileMenuChange?.(newState)
  }, [isMobileMenuOpen, onMobileMenuChange, pathname])
  const [showTrackModal, setShowTrackModal] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentAudio, setCurrentAudio] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const useCases = [
    { name: 'Cherokee', href: '/use-cases/cherokee' },
    { name: 'Retail', href: '/use-cases/retail' },
    { name: 'Smart Home', href: '/use-cases/smart-home' },
    { name: 'Education', href: '/use-cases/education' },
  ]

  const isUseCaseActive = pathname.startsWith('/use-cases')

  // Dropdown handlers with delay
  const handleDropdownEnter = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
    setIsUseCasesOpen(true)
  }, [])

  const handleDropdownLeave = useCallback(() => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsUseCasesOpen(false)
    }, 300) // 300ms delay before closing
  }, [])

  // Audio handling
  const connectAudioToMascot = useCallback(async (audioElement: HTMLAudioElement) => {
    if (mascot && audioElement) {
      try {
        if (typeof mascot.connectAudio === 'function') {
          await mascot.connectAudio(audioElement)
        }
      } catch (error) {
        console.error('Failed to connect audio:', error)
      }
    }
  }, [mascot])

  const disconnectAudioFromMascot = useCallback(() => {
    if (mascot) {
      try {
        if (typeof mascot.disconnectAudio === 'function') {
          mascot.disconnectAudio()
        }
      } catch (error) {
        console.error('Failed to disconnect audio:', error)
      }
    }
  }, [mascot])

  const handleTrackSelect = useCallback(async (trackPath: string) => {
    try {
      if (audioRef.current) {
        audioRef.current.pause()
        disconnectAudioFromMascot()
      }

      const audio = new Audio()
      audio.preload = 'auto'

      // Add event listeners BEFORE setting src and playing
      const handlePlay = async () => {
        setIsPlaying(true)
        if (mascot) {
          await connectAudioToMascot(audio)
        }
      }

      const handlePause = () => {
        setIsPlaying(false)
        if (mascot) {
          disconnectAudioFromMascot()
        }
      }

      const handleEnded = () => {
        setIsPlaying(false)
        if (mascot) disconnectAudioFromMascot()
      }

      audio.addEventListener('play', handlePlay)
      audio.addEventListener('pause', handlePause)
      audio.addEventListener('ended', handleEnded)

      // Now set the src and play
      audioRef.current = audio
      audio.src = trackPath
      setCurrentAudio(trackPath)

      await audio.play()
      onMessage?.('success', 'Track loaded', 2000)
    } catch (error) {
      console.error('Failed to load track:', error);
      onMessage?.('error', 'Failed to load track', 3000)
    }
  }, [disconnectAudioFromMascot, onMessage, mascot, connectAudioToMascot])

  const handlePlayPause = useCallback(async () => {
    if (!audioRef.current) return

    try {
      const audio = audioRef.current
      if (audio.paused) {
        await audio.play()
        setIsPlaying(true)
      } else {
        audio.pause()
        setIsPlaying(false)
      }
    } catch (error) {
      onMessage?.('error', 'Playback failed', 3000)
    }
  }, [onMessage])

  // Audio event listeners - kept for cleanup but actual listeners are added in handleTrackSelect
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    // Cleanup function - listeners are now added in handleTrackSelect
    return () => {
      // Audio element will be cleaned up when new track is selected
    }
  }, [mascot, connectAudioToMascot, disconnectAudioFromMascot])

  return (
    <>
      <div className="emotive-header">
        <div className="emotive-logo">
          <Link href="/">
            <img src="/assets/emotive-engine-full-BW.svg" alt="Emotive Engine" className="emotive-logo-svg" />
          </Link>
        </div>

        {/* Music Controls (only on demo page) */}
        {showMusicControls && (
          <div className="header-music-controls">
            {/* Play/Pause button (shows when audio is loaded) */}
            {currentAudio && (
              <button
                onClick={handlePlayPause}
                className="music-control-btn"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {isPlaying ? (
                    <>
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </>
                  ) : (
                    <polygon points="5 3 19 12 5 21 5 3" />
                  )}
                </svg>
              </button>
            )}

            {/* Music button (always shows on demo page) */}
            <button
              onClick={() => setShowTrackModal(true)}
              className="music-control-btn"
              title="Select Demo Track"
            >
              <img src="/assets/system-bar/music.svg" alt="music" className="music-icon" />
            </button>
          </div>
        )}

        {/* Mobile Hamburger Menu */}
        <button
          onClick={toggleMobileMenu}
          className="mobile-menu-btn"
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {isMobileMenuOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <>
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>

        <div className="header-navigation">
        <Link
          href="/"
          className={`nav-link ${pathname === '/' ? 'active' : ''}`}
        >
          Home
        </Link>
        <Link
          href="/demo"
          className={`nav-link ${pathname === '/demo' ? 'active' : ''}`}
        >
          Demo
        </Link>

        {/* Use Cases Dropdown */}
        <div
          className="use-cases-dropdown"
          onMouseEnter={handleDropdownEnter}
          onMouseLeave={handleDropdownLeave}
        >
          <button
            className={`nav-link use-cases-trigger ${isUseCaseActive ? 'active' : ''}`}
            onClick={() => setIsUseCasesOpen(!isUseCasesOpen)}
            aria-expanded={isUseCasesOpen}
            aria-haspopup="true"
          >
            Use Cases
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{
                marginLeft: '0.25rem',
                transform: isUseCasesOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {isUseCasesOpen && (
            <div className="use-cases-menu">
              {useCases.map((useCase) => (
                <Link
                  key={useCase.href}
                  href={useCase.href}
                  prefetch={false}
                  className={`use-case-item ${pathname.startsWith(useCase.href) ? 'active' : ''}`}
                  onClick={() => setIsUseCasesOpen(false)}
                  onMouseEnter={() => router.prefetch(useCase.href)}
                  onTouchStart={() => router.prefetch(useCase.href)}
                >
                  {useCase.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        <Link
          href="/docs"
          className={`nav-link ${pathname.startsWith('/docs') ? 'active' : ''}`}
        >
          Docs
        </Link>
      </div>
    </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          <div className="mobile-menu-overlay" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="mobile-menu">
            <Link href="/" className="mobile-menu-item" onClick={() => setIsMobileMenuOpen(false)}>
              Home
            </Link>
            <Link href="/demo" className="mobile-menu-item" onClick={() => setIsMobileMenuOpen(false)}>
              Demo
            </Link>

            {/* Use Cases - Collapsible */}
            <button
              className="mobile-menu-divider mobile-menu-collapsible"
              onClick={() => setMobileUseCasesExpanded(!mobileUseCasesExpanded)}
            >
              Use Cases
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{
                  marginLeft: 'auto',
                  transform: mobileUseCasesExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {mobileUseCasesExpanded && useCases.map((useCase) => (
              <Link
                key={useCase.href}
                href={useCase.href}
                prefetch={false}
                className="mobile-menu-item mobile-menu-subitem"
                onClick={() => setIsMobileMenuOpen(false)}
                onTouchStart={() => router.prefetch(useCase.href)}
              >
                {useCase.name}
              </Link>
            ))}

            <Link href="/docs" className="mobile-menu-item" onClick={() => setIsMobileMenuOpen(false)}>
              Docs
            </Link>

            {/* Docs Navigation (only shows when on docs pages) */}
            {docsNavigation && docsNavigation.length > 0 && (
              <>
                <div className="mobile-menu-divider" style={{ marginTop: '1.5rem' }}>Documentation</div>
                {docsNavigation.map((section) => {
                  const sectionExpanded = mobileDocsExpanded[section.category] || false
                  return (
                    <div key={section.category}>
                      <button
                        className="mobile-menu-section-title mobile-menu-collapsible"
                        onClick={() => setMobileDocsExpanded(prev => ({
                          ...prev,
                          [section.category]: !sectionExpanded
                        }))}
                      >
                        {section.category}
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          style={{
                            marginLeft: 'auto',
                            transform: sectionExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s ease',
                          }}
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                      {sectionExpanded && section.items.map((item) => (
                        <Link
                          key={item.slug.join('/')}
                          href={`/docs/${item.slug.join('/')}`}
                          className={`mobile-menu-item mobile-menu-subitem ${pathname === `/docs/${item.slug.join('/')}` ? 'active' : ''}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {item.title}
                        </Link>
                      ))}
                    </div>
                  )
                })}
              </>
            )}
          </div>
        </>
      )}

      {/* Track Selection Modal */}
      <TrackSelectionModal
        isOpen={showTrackModal}
        onClose={() => setShowTrackModal(false)}
        onTrackSelect={handleTrackSelect}
      />

      {/* Styles for dropdown */}
      <style jsx global>{`
        .use-cases-dropdown {
          position: relative;
          display: inline-block;
        }

        .use-cases-trigger {
          display: flex;
          align-items: center;
          cursor: pointer;
          border: none;
          background: transparent;
        }

        .use-cases-menu {
          position: absolute;
          top: calc(100% + 0.5rem);
          left: 0;
          min-width: 220px;
          background: linear-gradient(135deg, rgba(20, 20, 22, 0.97) 0%, rgba(26, 26, 30, 0.97) 100%);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(102, 126, 234, 0.2);
          border-radius: 16px;
          box-shadow:
            0 20px 60px rgba(0, 0, 0, 0.8),
            0 8px 20px rgba(102, 126, 234, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
          padding: 0.5rem;
          z-index: 100003;
          animation: slideDown 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .use-case-item {
          display: block;
          padding: 0.875rem 1rem;
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          font-weight: 500;
          font-size: 0.9375rem;
          line-height: 1.4;
          white-space: nowrap;
          border-radius: 12px;
          position: relative;
          overflow: hidden;
        }

        .use-case-item::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: transparent;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 0 2px 2px 0;
        }

        .use-case-item:hover {
          background: linear-gradient(90deg, rgba(102, 126, 234, 0.15) 0%, rgba(102, 126, 234, 0.08) 100%);
          color: rgba(255, 255, 255, 1);
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
        }

        .use-case-item:hover::before {
          background: linear-gradient(180deg, rgba(102, 126, 234, 0.8) 0%, rgba(102, 126, 234, 0.4) 100%);
        }

        .use-case-item.active {
          background: linear-gradient(90deg, rgba(221, 74, 154, 0.15) 0%, rgba(221, 74, 154, 0.08) 100%);
          color: #DD4A9A;
          font-weight: 600;
        }

        .use-case-item.active::before {
          background: linear-gradient(180deg, #DD4A9A 0%, rgba(221, 74, 154, 0.6) 100%);
        }

        .use-case-item.active:hover {
          background: linear-gradient(90deg, rgba(221, 74, 154, 0.22) 0%, rgba(221, 74, 154, 0.12) 100%);
          box-shadow: 0 4px 12px rgba(221, 74, 154, 0.2);
        }

        /* Mobile responsive dropdown */
        @media (max-width: 1024px) {
          .use-cases-menu {
            right: 0;
            left: auto;
          }
        }

        @media (max-width: 768px) {
          .use-cases-dropdown {
            display: none;
          }
        }

        /* Music Controls */
        .header-music-controls {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 0.75rem;
          z-index: 10;
        }

        .music-control-btn {
          width: 2.5rem;
          height: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(102, 126, 234, 0.15);
          border: 1px solid rgba(102, 126, 234, 0.3);
          border-radius: 8px;
          color: rgba(255, 255, 255, 0.9);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .music-control-btn:hover {
          background: rgba(102, 126, 234, 0.25);
          border-color: rgba(102, 126, 234, 0.5);
        }

        .music-control-btn svg {
          fill: currentColor;
        }

        .music-icon {
          width: 70%;
          height: 70%;
          filter: brightness(0) invert(1) opacity(0.7);
          transition: opacity 0.2s ease;
        }

        .music-control-btn:hover .music-icon {
          opacity: 1;
        }

        /* Mobile Menu Button */
        .mobile-menu-btn {
          display: none;
          position: absolute;
          right: 1rem;
          width: 2.75rem;
          height: 2.75rem;
          align-items: center;
          justify-content: center;
          background: rgba(102, 126, 234, 0.1);
          border: 1px solid rgba(102, 126, 234, 0.3);
          border-radius: 8px;
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
          z-index: 100003;
        }

        .mobile-menu-btn:hover {
          background: rgba(102, 126, 234, 0.2);
          border-color: rgba(102, 126, 234, 0.5);
        }

        /* Mobile Menu Overlay & Menu */
        .mobile-menu-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          z-index: 100002;
        }

        .mobile-menu {
          display: none;
          position: fixed;
          top: 0;
          right: 0;
          width: min(85vw, 320px);
          height: 100vh;
          background: rgba(26, 26, 26, 0.98);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-left: 1px solid rgba(102, 126, 234, 0.3);
          padding: 5rem 0 2rem 0;
          overflow-y: auto;
          z-index: 100003;
          animation: slideInRight 0.3s ease;
        }

        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        .mobile-menu-item {
          display: block;
          padding: 1rem 1.5rem;
          color: rgba(255, 255, 255, 0.85);
          text-decoration: none;
          font-weight: 500;
          font-size: 1rem;
          transition: all 0.2s ease;
          border-left: 3px solid transparent;
        }

        .mobile-menu-item:hover {
          background: rgba(102, 126, 234, 0.1);
          border-left-color: rgba(102, 126, 234, 0.5);
          color: white;
        }

        .mobile-menu-subitem {
          padding-left: 2.5rem;
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .mobile-menu-divider {
          padding: 0.75rem 1.5rem;
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-top: 0.5rem;
          display: block;
          width: 100%;
          text-align: left;
          background: none;
          border: none;
          cursor: default;
        }

        .mobile-menu-collapsible {
          display: flex;
          align-items: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .mobile-menu-collapsible:hover {
          color: rgba(255, 255, 255, 0.8);
        }

        .mobile-menu-section-title {
          padding: 0.5rem 1.5rem 0.25rem 2.5rem;
          color: rgba(255, 255, 255, 0.4);
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          display: block;
          width: 100%;
          text-align: left;
          background: none;
          border: none;
        }

        .mobile-menu-section-title.mobile-menu-collapsible {
          display: flex;
          align-items: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .mobile-menu-section-title.mobile-menu-collapsible:hover {
          color: rgba(255, 255, 255, 0.6);
        }

        .mobile-menu-item.active {
          background: rgba(102, 126, 234, 0.15);
          border-left-color: rgba(102, 126, 234, 0.8);
          color: #667eea;
        }

        @media (max-width: 768px) {
          .header-navigation {
            display: none !important;
          }

          .mobile-menu-btn {
            display: flex !important;
          }

          .mobile-menu-overlay,
          .mobile-menu {
            display: block !important;
          }

          .header-music-controls {
            left: auto;
            right: 4.5rem;
            transform: none;
          }
        }
      `}</style>
    </>
  )
}


