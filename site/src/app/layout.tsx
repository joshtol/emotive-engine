import type { Metadata, Viewport } from 'next'
import { Poppins, Montserrat } from 'next/font/google'
import './globals.css'

// Optimized: Only load weights actually used (reduces font file size by ~60%)
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400','600','700'], // Removed unused 300, 500
  variable: '--font-poppins',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
  adjustFontFallback: true // Reduce CLS from font loading
})
const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['600','700'], // Only weights used in headings
  variable: '--font-montserrat',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
  adjustFontFallback: true
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export const metadata: Metadata = {
  title: 'Emotive Engine - Rhythm Game',
  description: 'Interactive rhythm-based animation engine with musical time synchronization',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    shortcut: '/favicon.ico',
    apple: '/favicon.svg',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Resource hints for faster external connections */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.anthropic.com" />
      </head>
      <body className={`${poppins.variable} ${montserrat.variable}`}>
        <div className="emotive-container" style={{
          background: 'linear-gradient(180deg, #0a0a0a 0%, #050505 50%, #0a0a0a 100%)',
          position: 'relative',
          scrollBehavior: 'smooth'
        }}>{children}</div>
      </body>
    </html>
  )
}


