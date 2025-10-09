# Quick Reference: Use Case Portfolio

## 🔗 Direct Links (Send These!)

### Production URLs (when deployed)
```
Landing Page:     https://yourdomain.com/
Cherokee:         https://yourdomain.com/use-cases/cherokee
Retail:           https://yourdomain.com/use-cases/retail
Healthcare:       https://yourdomain.com/use-cases/healthcare
Education:        https://yourdomain.com/use-cases/education
Smart Home:       https://yourdomain.com/use-cases/smart-home
```

### Local Development
```
Landing Page:     http://localhost:3003/
Cherokee:         http://localhost:3003/use-cases/cherokee
Retail:           http://localhost:3003/use-cases/retail
Healthcare:       http://localhost:3003/use-cases/healthcare
Education:        http://localhost:3003/use-cases/education
Smart Home:       http://localhost:3003/use-cases/smart-home
```

## 📁 File Structure

```
site/src/
├── app/
│   ├── page.tsx                          → Portfolio landing page
│   ├── page-original.tsx                 → Original homepage (backup)
│   └── use-cases/
│       ├── cherokee/page.tsx             → Cherokee language learning ★
│       ├── retail/page.tsx               → Retail checkout
│       ├── healthcare/page.tsx           → Healthcare intake
│       ├── education/page.tsx            → Math tutor
│       └── smart-home/page.tsx           → Smart home hub
└── components/
    ├── UseCaseLayout.tsx                 → Shared layout component
    ├── HeroMascot.tsx                    → Mascot component
    ├── EmotiveHeader.tsx                 → Header
    ├── EmotiveFooter.tsx                 → Footer
    └── MessageHUD.tsx                    → Toast messages
```

## 🎨 Color Scheme Per Use Case

| Use Case    | Color Code | Color Name | Emoji |
|-------------|-----------|------------|-------|
| Cherokee    | #14B8A6   | Teal       | ᏣᎳᎩ    |
| Retail      | #FF6B9D   | Pink       | 🛒    |
| Healthcare  | #96CEB4   | Green      | ❤️    |
| Education   | #45B7D1   | Blue       | 📚    |
| Smart Home  | #4ECDC4   | Cyan       | 🏠    |

## 🧩 Adding a New Use Case

### 1. Create Directory
```bash
mkdir site/src/app/use-cases/your-use-case
```

### 2. Create Page Component
```typescript
// site/src/app/use-cases/your-use-case/page.tsx
'use client'

import { useState, useCallback } from 'react'
import UseCaseLayout from '@/components/UseCaseLayout'

export default function YourUseCasePage() {
  const [mascot, setMascot] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])

  const addMessage = useCallback((type: string, content: string, duration = 3000) => {
    const id = Date.now().toString()
    setMessages(prev => [...prev, { id, type, content, duration, dismissible: true }])
  }, [])

  const removeMessage = useCallback((id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id))
  }, [])

  const handleMascotReady = useCallback((mascotInstance: any) => {
    setMascot(mascotInstance)

    // Your welcome animation
    setTimeout(() => {
      mascotInstance?.setEmotion?.('joy')
      mascotInstance?.express?.('wave')
      addMessage('info', 'Welcome message!', 3000)
    }, 1000)
  }, [addMessage])

  return (
    <UseCaseLayout
      mascot={mascot}
      onMascotReady={handleMascotReady}
      messages={messages}
      onMessageDismiss={removeMessage}
      onMessage={addMessage}
    >
      {/* Your UI here */}
    </UseCaseLayout>
  )
}
```

### 3. Add to Landing Page
Edit `site/src/app/page.tsx` and add to `useCases` array:

```typescript
{
  id: 'your-use-case',
  title: 'Your Use Case',
  subtitle: 'Descriptive Subtitle',
  description: 'What this use case demonstrates...',
  color: '#YOURCOLOR',
  icon: '🎯',
  path: '/use-cases/your-use-case'
}
```

## 🎭 Mascot Emotions & Gestures

### Emotions
```typescript
// Standard emotion change (500ms transition)
mascot.setEmotion('joy')        // Happy, positive
mascot.setEmotion('calm')       // Relaxed, neutral
mascot.setEmotion('curious')    // Interested, attentive
mascot.setEmotion('encouraging') // Supportive
mascot.setEmotion('empathetic') // Understanding
mascot.setEmotion('concerned')  // Worried
mascot.setEmotion('focused')    // Concentrating

// Instant emotion change (0ms transition)
// Use for rapid UI interactions to prevent particle artifacts
mascot.setEmotion('joy', 0)     // Instant transition
mascot.setEmotion('calm', 0)    // No transition delay

// Custom transition duration
mascot.setEmotion('joy', 1000)  // 1 second transition

// With undertone
mascot.setEmotion('joy', 'energetic')  // Emotion + undertone
mascot.setEmotion('joy', { undertone: 'energetic', duration: 0 })  // All options
```

### Gestures
```typescript
mascot.express('wave')          // Greeting
mascot.express('bounce')        // Excited
mascot.express('celebrate')     // Success!
mascot.express('breathe')       // Calm, rhythmic
mascot.express('nod')          // Acknowledgment
mascot.express('pulse')        // Attention
mascot.express('sparkle')      // Magical moment
mascot.express('sympathize')   // Empathy
```

## 💬 Message System

### Adding Messages
```typescript
addMessage('info', 'Informational message', 3000)
addMessage('success', 'Success message!', 2000)
addMessage('warning', 'Warning message', 4000)
addMessage('error', 'Error message', 5000)
```

### Duration Guidelines
- Quick feedback: 2000ms
- Standard message: 3000ms
- Important info: 4000-5000ms

## 🚀 Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Type check
npx tsc --noEmit

# Lint
npm run lint
```

## 📊 Use Case Audience Map

| Use Case    | Target Audience                          | Send Link To                |
|-------------|------------------------------------------|----------------------------|
| Cherokee    | Cultural institutions, Cherokee Nation   | Heritage Center, educators |
| Retail      | POS vendors, retail tech companies      | Walmart, Target, Amazon    |
| Healthcare  | EMR vendors, clinic management          | Epic, Cerner, athenahealth |
| Education   | EdTech platforms, online learning       | Khan Academy, Coursera     |
| Smart Home  | IoT platforms, home automation          | Google Home, Apple, Amazon |

## 🎯 Phase 2 Priority: Cherokee Enhancement

**Next Steps:**
1. Cherokee syllabary SVG library (85 characters)
2. Morphing animation system
3. Audio pronunciation integration
4. 7-clan color theming
5. Word-building interaction
6. Progress tracking

**Resources Needed:**
- Cherokee syllabary font/SVG files
- Native speaker audio recordings
- Cultural consultant approval
- Cherokee Nation partnership

---

**Quick Start:** `npm run dev` → Visit http://localhost:3003
**Documentation:** See PHASE1-COMPLETE.md for full details
**Strategy:** See NEWNEW.md for vision and roadmap
