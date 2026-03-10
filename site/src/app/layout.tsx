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
  viewportFit: 'cover', // Extend to edges on notched devices
}

export const metadata: Metadata = {
  title: 'Emotive Engine - Emotion-Driven Animation',
  description: 'Open-source character animation engine. 8 elemental GLSL shaders, 169 gestures, Canvas 2D + WebGL 3D.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    shortcut: '/favicon.ico',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'Emotive Engine - Emotion-Driven Animation',
    description: 'Open-source character animation engine. 8 elemental GLSL shaders, 169 gestures, Canvas 2D + WebGL 3D.',
    url: 'https://joshtol.github.io/emotive-engine',
    siteName: 'Emotive Engine',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Emotive Engine - Elemental crystal shader effects',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Emotive Engine - Emotion-Driven Animation',
    description: 'Open-source character animation engine. 8 elemental GLSL shaders, 169 gestures, Canvas 2D + WebGL 3D.',
    images: ['/og-image.png'],
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


