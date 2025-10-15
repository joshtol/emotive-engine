'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NavSection } from '@/lib/markdown'
import DocsSearch from './DocsSearch'

interface DocsSidebarProps {
  navigation: NavSection[]
}

export default function DocsSidebar({ navigation }: DocsSidebarProps) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isActive = (slug: string[]) => {
    const path = `/docs/${slug.join('/')}`
    return pathname === path
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        style={{
          display: 'none',
          position: 'fixed',
          top: '80px',
          left: '1rem',
          zIndex: 1001,
          background: 'rgba(102, 126, 234, 0.2)',
          border: '1px solid rgba(102, 126, 234, 0.4)',
          borderRadius: '8px',
          padding: '0.75rem',
          cursor: 'pointer',
          color: 'white',
        }}
        className="mobile-menu-button"
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

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          style={{
            display: 'none',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
          }}
          className="mobile-overlay"
        />
      )}

      <aside
        style={{
          width: '280px',
          height: '100vh',
          position: 'sticky',
          top: 0,
          overflowY: 'auto',
          borderRight: '1px solid rgba(102, 126, 234, 0.2)',
          padding: '2rem 1.5rem',
          background: 'rgba(5, 5, 5, 0.95)',
        }}
        className={`docs-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}
      >
      <Link
        href="/docs"
        style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          color: '#667eea',
          textDecoration: 'none',
          marginBottom: '1.5rem',
          display: 'block',
        }}
      >
        Documentation
      </Link>

      {/* Search */}
      <div style={{ marginBottom: '2rem' }}>
        <DocsSearch />
      </div>

      <nav>
        {navigation.map((section) => (
          <div key={section.category} style={{ marginBottom: '2rem' }}>
            <h3 style={{
              fontSize: '0.75rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              color: 'rgba(255, 255, 255, 0.5)',
              marginBottom: '0.75rem',
            }}>
              {section.category}
            </h3>

            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {section.items.map((item) => {
                const active = isActive(item.slug)

                return (
                  <li key={item.slug.join('/')} style={{ marginBottom: '0.5rem' }}>
                    <Link
                      href={`/docs/${item.slug.join('/')}`}
                      style={{
                        display: 'block',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        color: active ? '#667eea' : 'rgba(255, 255, 255, 0.8)',
                        background: active ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease',
                        borderLeft: active ? '2px solid #667eea' : '2px solid transparent',
                      }}
                      onMouseEnter={(e) => {
                        if (!active) {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!active) {
                          e.currentTarget.style.background = 'transparent'
                        }
                      }}
                    >
                      {item.title}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Quick Links */}
      <div style={{
        marginTop: '2rem',
        paddingTop: '2rem',
        borderTop: '1px solid rgba(102, 126, 234, 0.2)',
      }}>
        <h3 style={{
          fontSize: '0.75rem',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
          color: 'rgba(255, 255, 255, 0.5)',
          marginBottom: '0.75rem',
        }}>
          Quick Links
        </h3>

        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <li style={{ marginBottom: '0.5rem' }}>
            <Link
              href="/demo"
              style={{
                display: 'block',
                padding: '0.5rem 0.75rem',
                fontSize: '0.9rem',
                color: 'rgba(255, 255, 255, 0.8)',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#667eea'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'
              }}
            >
              Live Demo →
            </Link>
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <a
              href="https://github.com/joshtol/emotive-engine"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                padding: '0.5rem 0.75rem',
                fontSize: '0.9rem',
                color: 'rgba(255, 255, 255, 0.8)',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#667eea'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'
              }}
            >
              GitHub →
            </a>
          </li>
        </ul>
      </div>
    </aside>

    {/* Mobile Styles */}
    <style jsx global>{`
      @media (max-width: 768px) {
        .mobile-menu-button {
          display: block !important;
        }

        .mobile-overlay {
          display: block !important;
        }

        .docs-sidebar {
          position: fixed !important;
          left: -100%;
          top: 0;
          z-index: 1000;
          transition: left 0.3s ease;
          height: 100vh;
          box-shadow: 2px 0 10px rgba(0, 0, 0, 0.3);
        }

        .docs-sidebar.mobile-open {
          left: 0 !important;
        }
      }
    `}</style>
    </>
  )
}
