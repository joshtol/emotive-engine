'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function EmotiveHeader() {
  const pathname = usePathname()

  return (
    <div className="emotive-header">
      <div className="emotive-logo">
        <Link href="/">
          <img src="/assets/emotive-engine-full-BW.svg" alt="Emotive Engine" className="emotive-logo-svg" />
        </Link>
      </div>

      <div className="header-navigation">
        <Link
          href="/"
          className={`nav-link ${pathname === '/' ? 'active' : ''}`}
        >
          Home
        </Link>
        <Link
          href="/demo"
          className={`nav-link ${pathname === '/demo' ? 'active' : ''}`}
        >
          Demo
        </Link>
        <Link
          href="/use-cases/cherokee"
          className={`nav-link ${pathname.startsWith('/use-cases/cherokee') ? 'active' : ''}`}
        >
          Cherokee
        </Link>
        <Link
          href="/use-cases/retail"
          className={`nav-link ${pathname.startsWith('/use-cases/retail') ? 'active' : ''}`}
        >
          Retail
        </Link>
        <Link
          href="/use-cases/smart-home"
          className={`nav-link ${pathname.startsWith('/use-cases/smart-home') ? 'active' : ''}`}
        >
          Smart Home
        </Link>
        <Link
          href="/use-cases/healthcare"
          className={`nav-link ${pathname.startsWith('/use-cases/healthcare') ? 'active' : ''}`}
        >
          Health
        </Link>
        <Link
          href="/use-cases/education"
          className={`nav-link ${pathname.startsWith('/use-cases/education') ? 'active' : ''}`}
        >
          Tutor
        </Link>
        <Link
          href="/docs"
          className={`nav-link ${pathname.startsWith('/docs') ? 'active' : ''}`}
        >
          Docs
        </Link>
      </div>
    </div>
  )
}


