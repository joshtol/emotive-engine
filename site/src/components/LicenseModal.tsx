'use client'

import { useState } from 'react'

interface LicenseModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LicenseModal({ isOpen, onClose }: LicenseModalProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownloadLicense = async () => {
    setIsDownloading(true)
    try {
      // Create a blob with the license content
      const licenseContent = `# Emotive Engine License (Dual: Non-Commercial + Commercial)

## 🔑 Simple Summary
- ✅ Free for **Artists, students, hobbyists, and educators**.  
- 💰 Paid license required for **corporations, businesses, and monetized projects**.  

This ensures individuals can create freely while businesses contribute financially when they profit from the engine.

---

## 1. Non-Commercial Use (Free)
You may use, copy, modify, and distribute the Emotive Engine **for non-commercial purposes only**, including:

- Personal art projects, music visuals, or experimental media.  
- Social media content (non-monetized TikTok, Instagram, YouTube, etc.).  
- Student projects, academic research, and educational demonstrations.  
- Hobbyist coding, personal websites, or open demos not tied to revenue.  

---

## 2. Definition of "Artist"
For the purposes of this license:  

- **Artist** means an **individual human creator** using the Emotive Engine in their own capacity, **not acting on behalf of, or under contract with, a company, brand, institution, or organization**.  
- Work created by an Artist must be **non-commercial in nature**, including personal art, experimental media, cultural installations, or independent social content.  
- If an Artist's work **directly supports a company, brand, or revenue-generating activity**, that use is considered **Commercial Use**, regardless of job title, employment, or self-identification.  

---

## 3. Commercial Use (License Required)
You must obtain a **Commercial License** if you use the Emotive Engine in any **for-profit or organizational context**, including but not limited to:

- Corporate, retail, or enterprise applications (checkout systems, kiosks, guided assistants, chat UIs).  
- AI/voice/UX systems that adapt emotion or animation.  
- SaaS products, advertising, branded experiences, or installations.  
- Monetized media (e.g., YouTube with ads, TikTok sponsorships, streaming overlays tied to revenue).  
- Any use by a company, brand, nonprofit, government body, or institution.  

📧 To inquire about a Commercial License, contact: **licensing@emotiveengine.com**  

Commercial licensing tiers (Indie / Startup / Enterprise) are available to scale with project size and usage.

---

## 4. Trademark
The name **"Emotive Engine™"** is claimed as a trademark of the author under common law rights.  

- You may use the name "Emotive Engine" in factual references (e.g., "built with Emotive Engine"), but **you may not use the name or any associated branding in promotional, commercial, or derivative works without written permission**.  
- If and when **"Emotive Engine"** is federally registered as a trademark, all rights and protections of registration will apply retroactively.  

---

## 5. Warranty & Liability
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT ANY WARRANTY, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.  
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER LIABILITY ARISING FROM USE OF THE SOFTWARE.  

---

## 6. Quick Examples

| Use Case                                | Allowed Free? | License Required? |
|-----------------------------------------|---------------|-------------------|
| Personal Twitch overlay visuals         | ✅ Yes         | No                |
| Student class project                   | ✅ Yes         | No                |
| AI chatbot with emotional avatar        | ❌ No          | Yes               |
| Retail checkout kiosk animation         | ❌ No          | Yes               |
| TikTok video (non-monetized)            | ✅ Yes         | No                |
| YouTube channel with ad revenue         | ❌ No          | Yes               |
| Museum installation by independent artist | ✅ Yes      | No                |
| Museum installation sponsored by a brand | ❌ No       | Yes               |

---

© 2025 Joshua Tollette. "Emotive Engine™" is a claimed trademark of the author. All rights reserved.`

      const blob = new Blob([licenseContent], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'Emotive-Engine-License.txt'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      // Download failed
    } finally {
      setIsDownloading(false)
    }
  }

  const handleContactLegal = () => {
    window.open('mailto:licensing@emotiveengine.com?subject=License Inquiry', '_blank')
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="license-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Emotive Engine License</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="modal-content">
          <div className="license-content">
            <div className="license-summary">
              <h3>🔑 Simple Summary</h3>
              <ul>
                <li>✅ Free for <strong>Artists, students, hobbyists, and educators</strong></li>
                <li>💰 Paid license required for <strong>corporations, businesses, and monetized projects</strong></li>
              </ul>
              <p>This ensures individuals can create freely while businesses contribute financially when they profit from the engine.</p>
            </div>

            <div className="license-section">
              <h3>1. Non-Commercial Use (Free)</h3>
              <p>You may use, copy, modify, and distribute the Emotive Engine <strong>for non-commercial purposes only</strong>, including:</p>
              <ul>
                <li>Personal art projects, music visuals, or experimental media</li>
                <li>Social media content (non-monetized TikTok, Instagram, YouTube, etc.)</li>
                <li>Student projects, academic research, and educational demonstrations</li>
                <li>Hobbyist coding, personal websites, or open demos not tied to revenue</li>
              </ul>
            </div>

            <div className="license-section">
              <h3>2. Definition of &quot;Artist&quot;</h3>
              <p>For the purposes of this license:</p>
              <ul>
                <li><strong>Artist</strong> means an <strong>individual human creator</strong> using the Emotive Engine in their own capacity, <strong>not acting on behalf of, or under contract with, a company, brand, institution, or organization</strong></li>
                <li>Work created by an Artist must be <strong>non-commercial in nature</strong>, including personal art, experimental media, cultural installations, or independent social content</li>
                <li>If an Artist&apos;s work <strong>directly supports a company, brand, or revenue-generating activity</strong>, that use is considered <strong>Commercial Use</strong>, regardless of job title, employment, or self-identification</li>
              </ul>
            </div>

            <div className="license-section">
              <h3>3. Commercial Use (License Required)</h3>
              <p>You must obtain a <strong>Commercial License</strong> if you use the Emotive Engine in any <strong>for-profit or organizational context</strong>, including but not limited to:</p>
              <ul>
                <li>Corporate, retail, or enterprise applications (checkout systems, kiosks, guided assistants, chat UIs)</li>
                <li>AI/voice/UX systems that adapt emotion or animation</li>
                <li>SaaS products, advertising, branded experiences, or installations</li>
                <li>Monetized media (e.g., YouTube with ads, TikTok sponsorships, streaming overlays tied to revenue)</li>
                <li>Any use by a company, brand, nonprofit, government body, or institution</li>
              </ul>
              <p>📧 To inquire about a Commercial License, contact: <strong>licensing@emotiveengine.com</strong></p>
              <p>Commercial licensing tiers (Indie / Startup / Enterprise) are available to scale with project size and usage.</p>
            </div>

            <div className="license-section">
              <h3>4. Trademark</h3>
              <p>The name <strong>&quot;Emotive Engine™&quot;</strong> is claimed as a trademark of the author under common law rights.</p>
              <ul>
                <li>You may use the name &quot;Emotive Engine&quot; in factual references (e.g., &quot;built with Emotive Engine&quot;), but <strong>you may not use the name or any associated branding in promotional, commercial, or derivative works without written permission</strong></li>
                <li>If and when <strong>&quot;Emotive Engine&quot;</strong> is federally registered as a trademark, all rights and protections of registration will apply retroactively</li>
              </ul>
            </div>

            <div className="license-section">
              <h3>5. Warranty & Liability</h3>
              <p>THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT ANY WARRANTY, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.</p>
              <p>IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER LIABILITY ARISING FROM USE OF THE SOFTWARE.</p>
            </div>

            <div className="license-section">
              <h3>6. Quick Examples</h3>
              <div className="examples-table">
                <table>
                  <thead>
                    <tr>
                      <th>Use Case</th>
                      <th>Allowed Free?</th>
                      <th>License Required?</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>Personal Twitch overlay visuals</td><td>✅ Yes</td><td>No</td></tr>
                    <tr><td>Student class project</td><td>✅ Yes</td><td>No</td></tr>
                    <tr><td>AI chatbot with emotional avatar</td><td>❌ No</td><td>Yes</td></tr>
                    <tr><td>Retail checkout kiosk animation</td><td>❌ No</td><td>Yes</td></tr>
                    <tr><td>TikTok video (non-monetized)</td><td>✅ Yes</td><td>No</td></tr>
                    <tr><td>YouTube channel with ad revenue</td><td>❌ No</td><td>Yes</td></tr>
                    <tr><td>Museum installation by independent artist</td><td>✅ Yes</td><td>No</td></tr>
                    <tr><td>Museum installation sponsored by a brand</td><td>❌ No</td><td>Yes</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="license-footer">
              <p>© 2025 Joshua Tollette. &quot;Emotive Engine™&quot; is a claimed trademark of the author. All rights reserved.</p>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button 
            className="action-btn download-btn" 
            onClick={handleDownloadLicense}
            disabled={isDownloading}
          >
            {isDownloading ? 'Downloading...' : 'Download License'}
          </button>
          <button 
            className="action-btn contact-btn" 
            onClick={handleContactLegal}
          >
            Contact Legal Team
          </button>
        </div>
      </div>
    </div>
  )
}
