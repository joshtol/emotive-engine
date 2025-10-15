'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NavSection } from '@/lib/markdown'
import DocsSearch from './DocsSearch'

interface DocsSidebarProps {
  navigation: NavSection[]
}

export default function DocsSidebar({ navigation }: DocsSidebarProps) {
  const pathname = usePathname()

  const isActive = (slug: string[]) => {
    const path = `/docs/${slug.join('/')}`
    return pathname === path
  }

  return (
    <aside style={{
      width: '280px',
      height: '100vh',
      position: 'sticky',
      top: 0,
      overflowY: 'auto',
      borderRight: '1px solid rgba(102, 126, 234, 0.2)',
      padding: '2rem 1.5rem',
      background: 'rgba(5, 5, 5, 0.95)',
    }}>
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
  )
}
