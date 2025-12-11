'use client'

import { ReactNode, CSSProperties } from 'react'

export interface BentoGridProps {
  /** Grid items */
  children: ReactNode
  /** Whether viewing on mobile */
  isMobile?: boolean
  /** Gap between items (default: 1.5rem) */
  gap?: string
  /** Minimum column width for auto-fit (default: 300px) */
  minColumnWidth?: string
  /** Additional inline styles */
  style?: CSSProperties
  /** Additional class names */
  className?: string
}

export default function BentoGrid({
  children,
  isMobile = false,
  gap = '1.5rem',
  minColumnWidth = '300px',
  style,
  className = '',
}: BentoGridProps) {
  return (
    <div
      className={`uc-bento-grid ${className}`}
      style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : `repeat(auto-fit, minmax(${minColumnWidth}, 1fr))`,
        gap,
        gridAutoRows: 'minmax(200px, auto)',
        transform: 'translateZ(0)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
