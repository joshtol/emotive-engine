import type { Metadata } from 'next'
import { Poppins, Montserrat } from 'next/font/google'
import './globals.css'

const poppins = Poppins({ subsets: ['latin'], weight: ['300','400','500','600','700'], variable: '--font-poppins' })
const montserrat = Montserrat({ subsets: ['latin'], weight: ['300','400','500','600','700'], variable: '--font-montserrat' })

export const metadata: Metadata = {
  title: 'Emotive Engine - Rhythm Game',
  description: 'Interactive rhythm-based animation engine with musical time synchronization',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${montserrat.variable}`}>
        <div className="emotive-container">{children}</div>
      </body>
    </html>
  )
}


