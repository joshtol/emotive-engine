'use client'

import { ReactNode, useState } from 'react'
import EmotiveHeader from '@/components/EmotiveHeader'
import EmotiveFooter from '@/components/EmotiveFooter'
import DocsSidebar from '@/components/docs/DocsSidebar'
import { NavSection } from '@/lib/markdown'

interface DocsLayoutClientProps {
  children: ReactNode
  navigation: NavSection[]
}

export default function DocsLayoutClient({ children, navigation }: DocsLayoutClientProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      {/* Docs Header */}
      <div className="docs-header-wrapper" style={{
        position: 'sticky',
        top: 0,
        zIndex: 100001,
        background: 'rgba(26, 26, 26, 0.98)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      }}>
        <EmotiveHeader
          docsNavigation={navigation}
          onMobileMenuChange={setIsMobileMenuOpen}
        />
      </div>

      <div style={{
        display: 'flex',
        minHeight: '100vh',
        background: 'linear-gradient(180deg, rgba(10,10,10,0.98) 0%, rgba(5,5,5,0.95) 100%)',
        color: 'white',
      }}>
        <DocsSidebar
          navigation={navigation}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        <main style={{
          flex: 1,
          overflowY: 'auto',
        }}>
          {children}
        </main>
      </div>

      <EmotiveFooter />
    </>
  )
}
