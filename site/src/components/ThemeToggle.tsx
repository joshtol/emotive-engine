'use client'

import { useEffect, useState } from 'react'

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

  const onClick = () => {
    const idx = themeCycle.indexOf(theme)
    const next = themeCycle[(idx + 1) % themeCycle.length]
    setTheme(next)
  }

  const iconSrc = `/assets/themes/${theme}.svg`

  return (
    <button onClick={onClick} aria-label="Toggle theme" style={{ display:'flex', alignItems:'center', justifyContent:'center', width:'36px', height:'36px', borderRadius:'9999px', background:'rgba(55,65,81,.6)', border:'1px solid rgba(255,255,255,.08)' }}>
      <img src={iconSrc} width={18} height={18} alt={theme} />
    </button>
  )
}


