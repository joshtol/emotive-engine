# Analytics Events Documentation

**Version:** 1.0.0
**Last Updated:** 2025-10-08

## Overview

This document describes all analytics events emitted by the Emotive Engine site. Events track user interactions with scroll behaviors, navigation, and interactive canvas scenes.

## Event Categories

### 1. QuickNav Events

**Location:** `site/src/lib/quicknav-analytics.ts`
**Window Event:** `emotive:quicknav`

#### Event Structure

```typescript
interface QuickNavAnalyticsRecord {
  type: 'open' | 'close' | 'navigate'
  sectionId?: string
  index?: number
  source?: 'click' | 'hotkey' | 'command' | 'auto-skimming'
  reason?: 'escape' | 'backdrop' | 'button' | 'toggle'
  timestamp: number
}
```

#### Event: QuickNav Open

**Trigger:** User opens QuickNav overlay
**Type:** `open`
**Sources:**
- `hotkey` - Ctrl+K keyboard shortcut
- `auto-skimming` - Auto-opens when SKIMMING intent detected
- `command` - Opened via programmatic command

**Example Payload:**
```json
{
  "type": "open",
  "source": "hotkey",
  "timestamp": 1728396123456
}
```

#### Event: QuickNav Close

**Trigger:** User closes QuickNav overlay
**Type:** `close`
**Reasons:**
- `escape` - Pressed Escape key
- `backdrop` - Clicked outside overlay
- `button` - Clicked close button
- `toggle` - Pressed Ctrl+K again

**Example Payload:**
```json
{
  "type": "close",
  "reason": "escape",
  "timestamp": 1728396130789
}
```

#### Event: QuickNav Navigate

**Trigger:** User navigates to a section via QuickNav
**Type:** `navigate`
**Fields:**
- `sectionId` - Target section identifier (e.g., "retail", "healthcare")
- `index` - Zero-based position in section list
- `source` - Always `click` for user-initiated navigation

**Example Payload:**
```json
{
  "type": "navigate",
  "sectionId": "retail",
  "index": 1,
  "source": "click",
  "timestamp": 1728396135012
}
```

**Usage Location:** `site/src/components/QuickNavOverlay.tsx:22`

---

### 2. Scroll Intent Events

**Location:** `site/src/components/hooks/useScrollExperience.tsx`
**Context Provider:** `ScrollExperienceProvider`

#### Intent Classification

**Intent Types:**
- `IDLE` - No scrolling activity
- `EXPLORING` - Slow, deliberate scrolling (< 1200 px/s)
- `SEEKING` - Medium-speed navigation (1200-3000 px/s)
- `SKIMMING` - Fast scrolling or large jumps (> 3000 px/s or delta > 2500px)

#### Event Structure

```typescript
interface ScrollIntentState {
  intent: 'IDLE' | 'EXPLORING' | 'SEEKING' | 'SKIMMING'
  confidence: number // 0-1 confidence score
  velocity: number // pixels per second
  delta: number // pixels per sample
}
```

#### Tracking Intent Changes

**Not currently emitted as window events.** To track intent changes, use the `useScrollExperience` hook:

```typescript
const { intent } = useScrollExperience()

useEffect(() => {
  // Track intent changes
  console.log('Intent changed:', intent.intent, 'confidence:', intent.confidence)
}, [intent.intent])
```

**Recommended Analytics Integration:**

```typescript
// In site/src/app/page.tsx or analytics provider
useEffect(() => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('emotive:scroll-intent', {
      detail: {
        intent: intent.intent,
        confidence: intent.confidence,
        velocity: intent.velocity,
        timestamp: Date.now()
      }
    }))
  }
}, [intent.intent])
```

---

### 3. Avatar Navigation Events

**Location:** `site/src/lib/avatar-controller.ts`
**Lifecycle Callbacks:** `AvatarControllerEvents`

#### Event Structure

```typescript
interface AvatarControllerEvents {
  onPathStart?: (sectionId: string) => void
  onPathComplete?: (sectionId: string) => void
  onSectionEnter?: (sectionId: string) => void
  onSectionLeave?: (sectionId: string) => void
}
```

#### Event: Path Start

**Trigger:** Avatar begins navigation to a section
**Callback:** `onPathStart(sectionId)`
**Usage:** `site/src/app/page.tsx:456`

**Example:**
```typescript
onPathStart: (sectionId) => {
  console.log('🛤️ Avatar navigation started:', sectionId)
  // Track path start
}
```

#### Event: Path Complete

**Trigger:** Avatar reaches destination section
**Callback:** `onPathComplete(sectionId)`
**Side Effects:**
- Section marked as "locked" in `lockedSections` Set
- QuickNav badge shows "locked" indicator
- Triggers scroll lock for section

**Usage:** `site/src/app/page.tsx:459`

**Example:**
```typescript
onPathComplete: (sectionId) => {
  console.log('✅ Avatar navigation completed:', sectionId)
  setLockedSections((prev) => new Set(prev).add(sectionId))
}
```

#### Event: Section Enter

**Trigger:** Avatar enters a section (after path complete)
**Callback:** `onSectionEnter(sectionId)`
**Usage:** `site/src/app/page.tsx:467`

#### Event: Section Leave

**Trigger:** Avatar starts navigating to a different section
**Callback:** `onSectionLeave(sectionId)`
**Not currently implemented in page.tsx** - Available for future use

**Recommended Analytics Integration:**

```typescript
// In site/src/app/page.tsx
onPathStart: (sectionId) => {
  window.dispatchEvent(new CustomEvent('emotive:avatar-path-start', {
    detail: { sectionId, timestamp: Date.now() }
  }))
}
```

---

### 4. Scene Events

**Location:** `site/src/lib/scene-manager.ts`
**Callback:** `onSceneComplete`

#### Event Structure

```typescript
interface SceneManagerOptions {
  onSceneComplete?: (sectionId: string) => void
}
```

#### Event: Scene Complete

**Trigger:** Canvas scene finishes demo sequence
**Callback:** `onSceneComplete(sectionId)`
**Side Effects:**
- Scroll lock released
- Avatar celebrates (emotion: 'joy', gesture: 'celebration')
- Success message displayed to user

**Usage:** `site/src/app/page.tsx:411`

**Scenes:**
- `retail` - Product scanning checkout
- `smart-home` - Device dashboard
- `music` - Math problem solver (EducationScene)
- `service` - Patient intake form (HealthcareScene)

**Example Payload Structure:**
```typescript
{
  sectionId: 'retail',
  duration: 4500, // milliseconds (if tracked)
  completionType: 'auto' | 'fast-forward' | 'user-complete'
}
```

**Current Implementation:**
```typescript
onSceneComplete: (sectionId) => {
  releaseLock('scene-complete')
  if (mascot) {
    mascot.setEmotion?.('joy')
    mascot.express?.('celebration')
  }
  addMessage('success', `${sectionId} demo complete!`, 2000)

  // Recommended: Track scene completion
  // window.dispatchEvent(new CustomEvent('emotive:scene-complete', {
  //   detail: { sectionId, timestamp: Date.now() }
  // }))
}
```

---

### 5. Scroll Lock Events

**Location:** `site/src/components/hooks/useScrollLock.ts`
**Context:** `ScrollExperienceProvider`

#### Lock State Structure

```typescript
interface ScrollLockState {
  locked: boolean
  lockedAt: number | null
  unlockedAt: number | null
  lockTarget: string | null
  distanceFromLock: number
}
```

#### Event: Scroll Lock Acquired

**Trigger:** User scrolls into a section and avatar navigation begins
**State Change:** `locked: true`

**Recommended Analytics:**
```typescript
useEffect(() => {
  if (lock.locked) {
    window.dispatchEvent(new CustomEvent('emotive:scroll-lock', {
      detail: {
        lockTarget: lock.lockTarget,
        lockedAt: lock.lockedAt,
        timestamp: Date.now()
      }
    }))
  }
}, [lock.locked])
```

#### Event: Scroll Lock Released

**Trigger:** Scene completes or user scrolls past threshold
**State Change:** `locked: false`
**Release Reasons:**
- `scene-complete` - Scene finished successfully
- `hard-break` - User scrolled past buffer + threshold (200px)
- `intent-seeking` - User in SEEKING mode and exceeded buffer (100px)

---

## Analytics Integration Examples

### Google Analytics 4

```typescript
// site/src/lib/analytics/ga4.ts
import { onQuickNavEvent } from '@/lib/quicknav-analytics'

// Track QuickNav events
onQuickNavEvent((record) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', `quicknav_${record.type}`, {
      section_id: record.sectionId,
      source: record.source,
      reason: record.reason,
      timestamp: record.timestamp,
    })
  }
})

// Track scroll intent changes
const { intent } = useScrollExperience()
useEffect(() => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'scroll_intent_change', {
      intent: intent.intent,
      confidence: intent.confidence,
      velocity: intent.velocity,
    })
  }
}, [intent.intent])
```

### Segment

```typescript
// site/src/lib/analytics/segment.ts
import { onQuickNavEvent } from '@/lib/quicknav-analytics'

onQuickNavEvent((record) => {
  if (typeof window !== 'undefined' && window.analytics) {
    window.analytics.track('QuickNav Interaction', {
      action: record.type,
      sectionId: record.sectionId,
      source: record.source,
      reason: record.reason,
    })
  }
})
```

### Custom Event Listener

```typescript
// Listen to all emotive events
window.addEventListener('emotive:quicknav', (e) => {
  console.log('QuickNav event:', e.detail)
})

window.addEventListener('emotive:scroll-intent', (e) => {
  console.log('Intent changed:', e.detail)
})

window.addEventListener('emotive:scene-complete', (e) => {
  console.log('Scene completed:', e.detail)
})
```

---

## Testing Analytics

### Development Console Logging

Enable verbose analytics logging:

```typescript
// In site/src/app/page.tsx
const DEBUG_ANALYTICS = process.env.NODE_ENV !== 'production'

if (DEBUG_ANALYTICS) {
  onQuickNavEvent((record) => {
    console.log('[Analytics] QuickNav:', record)
  })
}
```

### Vitest Unit Tests

Test file: `site/src/lib/__tests__/quicknav-analytics.test.ts`

```typescript
import { describe, expect, it, vi } from 'vitest'
import { trackQuickNavEvent, onQuickNavEvent } from '../quicknav-analytics'

describe('trackQuickNavEvent', () => {
  it('emits window event with timestamp', () => {
    const listener = vi.fn()
    window.addEventListener('emotive:quicknav', listener)

    trackQuickNavEvent({ type: 'open', source: 'hotkey' })

    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: expect.objectContaining({
          type: 'open',
          source: 'hotkey',
          timestamp: expect.any(Number)
        })
      })
    )
  })
})
```

---

## Future Analytics Enhancements

### Planned Events

1. **Mascot Interaction Events**
   - `emotive:mascot-click` - User clicks mascot
   - `emotive:mascot-emotion-change` - Emotion changes (joy, neutral, surprised)
   - `emotive:mascot-gesture` - Gesture performed (wave, celebration)

2. **Performance Metrics**
   - `emotive:scene-fps` - Canvas FPS during scene playback
   - `emotive:avatar-path-duration` - Time taken for avatar navigation
   - `emotive:scroll-lock-duration` - Time user spent in locked sections

3. **User Journey Tracking**
   - `emotive:section-sequence` - Order of sections visited
   - `emotive:completion-rate` - Percentage of scenes completed
   - `emotive:summary-mode-triggered` - User activated 60s summary mode

### Schema Versioning

All events should include a `schemaVersion` field for future compatibility:

```typescript
{
  type: 'open',
  source: 'hotkey',
  timestamp: 1728396123456,
  schemaVersion: '1.0.0'
}
```

---

## Support

For questions or analytics integration support:
- Documentation: `site/docs/ANALYTICS_EVENTS.md`
- Implementation: `site/src/lib/quicknav-analytics.ts`
- Examples: `site/src/app/page.tsx` (lifecycle callbacks)
