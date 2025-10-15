'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface SearchResult {
  title: string
  slug: string[]
  category: string
  excerpt: string
}

export default function DocsSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        setIsOpen(true)
      }

      // Escape to close
      if (e.key === 'Escape') {
        setIsOpen(false)
        inputRef.current?.blur()
      }

      // Arrow navigation
      if (isOpen && results.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          setSelectedIndex((prev) => (prev + 1) % results.length)
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          setSelectedIndex((prev) => (prev - 1 + results.length) % results.length)
        } else if (e.key === 'Enter') {
          e.preventDefault()
          if (results[selectedIndex]) {
            navigateToResult(results[selectedIndex])
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, results, selectedIndex])

  // Simple client-side search
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults([])
      return
    }

    // In production, this would call an API endpoint that searches markdown files
    // For now, we'll use a simple static search
    const mockResults: SearchResult[] = [
      {
        title: 'Constructor',
        slug: ['api', 'constructor'],
        category: 'API Reference',
        excerpt: 'Create a new Emotive Engine instance...'
      },
      {
        title: 'Emotion Control',
        slug: ['api', 'emotions'],
        category: 'API Reference',
        excerpt: 'Control emotional states and undertones...'
      },
      {
        title: 'Gesture System',
        slug: ['api', 'gestures'],
        category: 'API Reference',
        excerpt: 'Trigger animations and gesture chains...'
      },
      {
        title: 'Core Methods',
        slug: ['api', 'core-methods'],
        category: 'API Reference',
        excerpt: 'Lifecycle and control methods...'
      },
      {
        title: 'Events',
        slug: ['api', 'events'],
        category: 'API Reference',
        excerpt: 'Event system and listeners...'
      },
      {
        title: 'Quick Start',
        slug: ['guides', 'quick-start'],
        category: 'Getting Started',
        excerpt: 'Get up and running in 5 minutes...'
      },
      {
        title: 'Integration Guide',
        slug: ['guides', 'integration'],
        category: 'Getting Started',
        excerpt: 'Integrate into your project...'
      },
      {
        title: 'Basic Setup',
        slug: ['examples', 'basic-setup'],
        category: 'Examples',
        excerpt: 'Simple examples to get started...'
      }
    ]

    // Filter results based on query
    const filtered = mockResults.filter(result =>
      result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.category.toLowerCase().includes(searchQuery.toLowerCase())
    )

    setResults(filtered)
    setSelectedIndex(0)
  }

  const navigateToResult = (result: SearchResult) => {
    router.push(`/docs/${result.slug.join('/')}`)
    setIsOpen(false)
    setQuery('')
    setResults([])
  }

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
      {/* Search Input */}
      <div style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search docs... (⌘K)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            performSearch(e.target.value)
          }}
          onFocus={() => {
            setIsOpen(true)
            if (query) performSearch(query)
          }}
          style={{
            width: '100%',
            padding: '0.75rem 1rem 0.75rem 2.5rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(102, 126, 234, 0.3)',
            borderRadius: '8px',
            color: 'white',
            fontSize: '0.9rem',
            outline: 'none',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.5)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.3)'
          }}
        />

        {/* Search Icon */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(255, 255, 255, 0.5)"
          strokeWidth="2"
          style={{
            position: 'absolute',
            left: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
          }}
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </div>

      {/* Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 0.5rem)',
          left: 0,
          right: 0,
          background: 'rgba(5, 5, 5, 0.98)',
          border: '1px solid rgba(102, 126, 234, 0.3)',
          borderRadius: '8px',
          maxHeight: '400px',
          overflowY: 'auto',
          zIndex: 1000,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        }}>
          {results.map((result, index) => (
            <div
              key={result.slug.join('/')}
              onClick={() => navigateToResult(result)}
              style={{
                padding: '0.75rem 1rem',
                cursor: 'pointer',
                background: index === selectedIndex ? 'rgba(102, 126, 234, 0.2)' : 'transparent',
                borderBottom: index < results.length - 1 ? '1px solid rgba(102, 126, 234, 0.1)' : 'none',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => {
                setSelectedIndex(index)
                e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)'
              }}
              onMouseLeave={(e) => {
                if (index !== selectedIndex) {
                  e.currentTarget.style.background = 'transparent'
                }
              }}
            >
              <div style={{
                fontSize: '0.75rem',
                color: 'rgba(255, 255, 255, 0.5)',
                marginBottom: '0.25rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                {result.category}
              </div>
              <div style={{
                fontSize: '0.95rem',
                fontWeight: '600',
                color: '#ffffff',
                marginBottom: '0.25rem',
              }}>
                {result.title}
              </div>
              <div style={{
                fontSize: '0.85rem',
                color: 'rgba(255, 255, 255, 0.6)',
              }}>
                {result.excerpt}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {isOpen && query && results.length === 0 && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 0.5rem)',
          left: 0,
          right: 0,
          background: 'rgba(5, 5, 5, 0.98)',
          border: '1px solid rgba(102, 126, 234, 0.3)',
          borderRadius: '8px',
          padding: '1rem',
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.5)',
          zIndex: 1000,
        }}>
          No results found
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
          }}
        />
      )}
    </div>
  )
}
