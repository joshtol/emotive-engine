'use client'

import { useState } from 'react'
import LicenseModal from './LicenseModal'

export default function EmotiveFooter() {
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false)

  return (
    <>
      <div className="legal-footer">
        <div className="footer-content">
          <span className="trademark">emotive ENGINE™</span>
          <span className="separator">•</span>
          <span className="copyright">© 2025 Joshua Tollette</span>
          <div className="footer-links">
            <button 
              className="footer-link" 
              onClick={() => setIsLicenseModalOpen(true)}
            >
              License
            </button>
          </div>
        </div>
      </div>
      
      <LicenseModal 
        isOpen={isLicenseModalOpen}
        onClose={() => setIsLicenseModalOpen(false)}
      />
    </>
  )
}
