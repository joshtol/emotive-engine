'use client'

import { ReactNode, CSSProperties } from 'react'

export interface GlassCardProps {
  children: ReactNode
  /** Custom accent color as RGB values (e.g., "218, 165, 32") */
  accentRgb?: string
  /** Click handler */
  onClick?: () => void
  /** Additional inline styles */
  style?: CSSProperties
  /** Additional class names */
  className?: string
  /** Padding size: 'sm' | 'md' | 'lg' */
  padding?: 'sm' | 'md' | 'lg'
  /** Whether to span multiple grid columns */
  span?: 1 | 2
  /** Whether to use stronger hover effect */
  strongHover?: boolean
  /** Custom border color override */
  borderColor?: string
  /** Custom background color override */
  bgColor?: string
  /** Whether the card is interactive (shows cursor pointer) */
  interactive?: boolean
}

const paddingSizes = {
  sm: '1.5rem',
  md: '2.5rem',
  lg: '3rem 2.5rem',
}

export default function GlassCard({
  children,
  accentRgb = '218, 165, 32',
  onClick,
  style,
  className = '',
  padding = 'md',
  span = 1,
  strongHover = false,
  borderColor,
  bgColor,
  interactive = true,
}: GlassCardProps) {
  const baseStyles: CSSProperties = {
    background: bgColor || `linear-gradient(135deg, rgba(${accentRgb}, 0.2) 0%, rgba(${accentRgb}, 0.1) 100%)`,
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    border: `1px solid ${borderColor || `rgba(${accentRgb}, 0.4)`}`,
    borderRadius: '24px',
    padding: paddingSizes[padding],
    cursor: interactive && onClick ? 'pointer' : 'default',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
    gridColumn: span === 2 ? 'span 2' : 'span 1',
    ...style,
  }

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive) return
    const target = e.currentTarget
    if (strongHover) {
      target.style.transform = 'translateY(-12px) scale(1.03)'
    } else {
      target.style.transform = 'translateY(-8px) scale(1.02)'
    }
    target.style.boxShadow = `0 20px 60px rgba(${accentRgb}, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.15)`
    target.style.borderColor = `rgba(${accentRgb}, 0.6)`
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive) return
    const target = e.currentTarget
    target.style.transform = 'translateY(0) scale(1)'
    target.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
    target.style.borderColor = borderColor || `rgba(${accentRgb}, 0.4)`
  }

  return (
    <div
      className={className}
      style={baseStyles}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Inner gradient overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, transparent 100%)',
          pointerEvents: 'none',
          borderRadius: 'inherit',
        }}
      />
      {children}
    </div>
  )
}
