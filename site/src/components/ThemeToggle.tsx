'use client'

import { useEffect, useState, useCallback } from 'react'

type ThemeName = 'dark' | 'light' | 'night'

const themeCycle: ThemeName[] = ['dark', 'light', 'night']

export default function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeName>('dark')

  useEffect(() => {
    const saved = (typeof window !== 'undefined' && localStorage.getItem('emotive-theme')) as ThemeName | null
    if (saved && themeCycle.includes(saved)) {
      setTheme(saved)
      document.documentElement.className = `${saved}-theme`
    } else {
      document.documentElement.className = 'dark-theme'
    }
  }, [])

  useEffect(() => {
    document.documentElement.className = `${theme}-theme`
    if (typeof window !== 'undefined') localStorage.setItem('emotive-theme', theme)
  }, [theme])

  const onClick = useCallback(() => {
    const idx = themeCycle.indexOf(theme)
    const next = themeCycle[(idx + 1) % themeCycle.length]
    setTheme(next)
  }, [theme])

  const iconSrc = `/assets/themes/${theme}.svg`

  return (
    <button onClick={onClick} aria-label="Toggle theme" className="theme-toggle-button">
      <img src={iconSrc} alt={theme} />
    </button>
  )
}


