'use client'

import ThemeToggle from './ThemeToggle'

export default function EmotiveHeader() {
  return (
    <div className="emotive-header">
      <div className="emotive-logo">
        <img src="/assets/emotive-engine-full-BW.svg" alt="Emotive Engine" className="emotive-logo-svg" />
      </div>
      <div className="user-status" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <ThemeToggle />
        <div className="auth-pill">
          <span className="auth-guest-label">GUEST</span>
          <button className="auth-signin-btn" aria-label="Sign in">SIGN IN</button>
        </div>
      </div>
    </div>
  )
}


