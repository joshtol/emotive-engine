# Manual QA Testing Matrix

**Version:** 1.0.0
**Last Updated:** 2025-10-08
**Test Environment:** http://localhost:3002 (dev) | Production TBD

## Overview

This document provides a comprehensive manual testing checklist for the Emotive Engine site integration. Test all scenarios across multiple devices and browsers before deployment.

---

## Test Environments

### Desktop
- **Chrome** (latest)
- **Firefox** (latest)
- **Safari** (latest, macOS only)
- **Edge** (latest)

### Tablet
- **iPad** (Safari, Chrome)
- **Android Tablet** (Chrome)

### Mobile
- **iPhone** (Safari)
- **Android** (Chrome)

### Network Conditions
- **Fast 4G** (baseline)
- **Slow 3G** (throttled)
- **Offline** (service worker, if applicable)

---

## Test Categories

## 1. Hero Section & Initial Load

### 1.1 Mascot Initialization
- [ ] Mascot canvas renders immediately on page load
- [ ] Mascot appears at correct position (80% width, 20% height from top-right)
- [ ] Mascot starts with neutral emotion
- [ ] Mascot morphs to circle shape within 500ms
- [ ] No JavaScript errors in console on load
- [ ] Canvas scales correctly on window resize

**Test Steps:**
1. Navigate to http://localhost:3002
2. Observe hero section mascot in top-right area
3. Verify smooth animation within 1 second
4. Open DevTools console, check for errors
5. Resize browser window, verify mascot repositions

**Expected Result:** Mascot renders smoothly with no errors, scales with window

---

### 1.2 ScrollHint Component
- [ ] ScrollHint appears automatically after page load
- [ ] Message displays: "Scroll to explore"
- [ ] Hint auto-hides after 5 seconds
- [ ] Bounce animation on arrow icon visible
- [ ] Hint is accessible (aria-live="polite")

**Test Steps:**
1. Load page and wait 1-2 seconds
2. Observe scroll hint overlay at bottom
3. Wait 5 seconds, verify it disappears
4. Use screen reader to verify accessibility

**Expected Result:** Hint appears, displays message, auto-hides after 5s

---

## 2. Scroll Intent Detection

### 2.1 EXPLORING Intent
- [ ] Slow scrolling (< 1200 px/s) triggers EXPLORING
- [ ] Confidence score increases with consistent slow scrolling
- [ ] No QuickNav auto-opens during EXPLORING
- [ ] Scenes play at normal speed

**Test Steps:**
1. Scroll very slowly down the page (mousewheel or trackpad)
2. Open DevTools console, check for intent logs
3. Verify QuickNav does NOT auto-open
4. Continue scrolling to a section with a scene

**Expected Result:** Intent = EXPLORING, scenes play normally

---

### 2.2 SEEKING Intent
- [ ] Medium scrolling (1200-3000 px/s) triggers SEEKING
- [ ] Sections lock when SEEKING through them
- [ ] Scroll lock releases after exceeding buffer (100px)
- [ ] Avatar navigates to locked section

**Test Steps:**
1. Scroll at moderate speed through sections
2. Notice scroll lock engages (scroll position "sticks")
3. Continue scrolling past buffer threshold
4. Verify lock releases

**Expected Result:** Intent = SEEKING, locks engage/release correctly

---

### 2.3 SKIMMING Intent
- [ ] Fast scrolling (> 3000 px/s) triggers SKIMMING
- [ ] QuickNav auto-opens during SKIMMING
- [ ] Scenes fast-forward to completion
- [ ] ScrollHint message updates: "Press Ctrl+K for Quick Navigation"

**Test Steps:**
1. Scroll rapidly down the page (fast mousewheel flick)
2. Verify QuickNav overlay opens automatically
3. Close QuickNav, continue skimming to a scene
4. Verify scene completes immediately (fast-forward)

**Expected Result:** Intent = SKIMMING, QuickNav auto-opens, scenes skip

---

## 3. QuickNav Overlay

### 3.1 Opening QuickNav
- [ ] **Ctrl+K** (or Cmd+K on Mac) opens QuickNav
- [ ] QuickNav opens during SKIMMING intent
- [ ] Overlay has backdrop blur effect
- [ ] Focus trap activates (Tab cycles through sections only)
- [ ] Analytics event emitted: `emotive:quicknav` with `type: "open"`

**Test Steps:**
1. Press Ctrl+K (Windows/Linux) or Cmd+K (Mac)
2. Verify overlay appears with section list
3. Press Tab repeatedly, ensure focus stays in overlay
4. Open DevTools, check for `emotive:quicknav` event

**Expected Result:** QuickNav opens, focus trapped, event tracked

---

### 3.2 Closing QuickNav
- [ ] **Escape** key closes QuickNav
- [ ] Clicking backdrop closes QuickNav
- [ ] **Ctrl+K** toggle closes QuickNav
- [ ] Focus returns to previously focused element
- [ ] Analytics event emitted with `reason: "escape"` or `"backdrop"`

**Test Steps:**
1. Open QuickNav with Ctrl+K
2. Press Escape, verify it closes
3. Open again, click outside overlay (backdrop)
4. Open again, press Ctrl+K to toggle closed
5. Verify focus returns to body or previous element

**Expected Result:** All close methods work, focus restored, events tracked

---

### 3.3 Section Navigation
- [ ] Clicking a section navigates to that section
- [ ] Avatar animates to section position
- [ ] Scroll smoothly transitions to section
- [ ] QuickNav closes after navigation
- [ ] Visited section badge appears (checkmark)
- [ ] Analytics event with `sectionId` and `index` emitted

**Test Steps:**
1. Open QuickNav
2. Click "Retail Experience" (or any section)
3. Observe avatar path animation
4. Verify scroll moves to section
5. Verify QuickNav closes
6. Reopen QuickNav, check for visited badge

**Expected Result:** Navigation smooth, section targeted, badge appears

---

### 3.4 Progress Tracking
- [ ] Progress ring fills as sections are visited
- [ ] "X of Y visited" label updates correctly
- [ ] Overall progress percentage accurate
- [ ] Locked badge appears after avatar completes navigation
- [ ] Locked badge shows on sections with completed scenes

**Test Steps:**
1. Open QuickNav, note "0 of 5 visited"
2. Navigate to a section, let avatar complete
3. Reopen QuickNav, verify "1 of 5 visited"
4. Check progress ring fill percentage
5. Verify locked badge on completed section

**Expected Result:** Progress updates accurately, badges display correctly

---

## 4. Avatar Navigation & Lifecycle

### 4.1 Path Start Event
- [ ] `onPathStart` callback fires when navigation begins
- [ ] Console logs: "🛤️ Path started"
- [ ] Avatar begins moving from current position
- [ ] Smooth easing animation (not instant jump)

**Test Steps:**
1. Open DevTools console
2. Click a section in QuickNav
3. Verify "🛤️ Path started" log appears
4. Observe avatar animation

**Expected Result:** Event fires, avatar animates smoothly

---

### 4.2 Path Complete Event
- [ ] `onPathComplete` callback fires when avatar arrives
- [ ] Section added to `lockedSections` Set
- [ ] QuickNav shows locked badge for section
- [ ] Scroll lock engages (if applicable)

**Test Steps:**
1. Navigate to a section via QuickNav
2. Wait for avatar to reach destination (~2-3s)
3. Check console for completion log
4. Reopen QuickNav, verify locked badge

**Expected Result:** Event fires, section locked, badge appears

---

### 4.3 Section Enter Event
- [ ] `onSectionEnter` callback fires after path complete
- [ ] Console logs: "📍 Section entered"
- [ ] Avatar applies section-specific gesture (if configured)

**Test Steps:**
1. Navigate to a section
2. Watch console for "📍 Section entered" log
3. Observe avatar gesture change (if applicable)

**Expected Result:** Event fires after arrival, gesture updates

---

### 4.4 Section Leave Event
- [ ] `onSectionLeave` callback fires when navigating away
- [ ] Previous section ID tracked correctly
- [ ] (Currently not implemented in page.tsx - verify placeholder works)

**Test Steps:**
1. Navigate to Section A
2. Navigate to Section B
3. Check console for "👋 Section left" log (if implemented)

**Expected Result:** Event fires when leaving section (if implemented)

---

## 5. Canvas Scenes

### 5.1 Retail Scene
- [ ] Scene initializes when section locks
- [ ] Products display: Headphones, Laptop, Mouse
- [ ] Scanning animation progresses automatically (1.5s per product)
- [ ] Payment step displays after scanning
- [ ] Completion triggers success state
- [ ] Scene completes in ~6-7 seconds (auto mode)

**Test Steps:**
1. Navigate to "Retail Experience" section
2. Wait for scroll lock
3. Observe scene canvas rendering
4. Watch product scanning sequence
5. Verify payment processing step
6. Check for completion message

**Expected Result:** Scene plays smoothly, completes automatically

---

### 5.2 Smart Home Scene
- [ ] Scene shows 4 devices: Lights, Thermostat, Security, Speaker
- [ ] Devices activate sequentially
- [ ] Pulse animation on active devices
- [ ] Progress indicator updates (0% → 100%)
- [ ] Scene completes after all devices activated (~8s)

**Test Steps:**
1. Navigate to "Smart Home" section
2. Observe device dashboard rendering
3. Watch activation sequence
4. Verify pulse animations
5. Check progress percentage updates

**Expected Result:** All devices activate, animations smooth, completes

---

### 5.3 Education Scene (Music Section)
- [ ] Math problem displays: 2x + 5 = 13
- [ ] Step-by-step equation breakdown shown
- [ ] Progress dots animate with pulse effect
- [ ] Hint system visible (if EXPLORING intent)
- [ ] Scene completes after showing solution (~6s)

**Test Steps:**
1. Navigate to "Music Experience" section
2. Observe math problem rendering
3. Watch step progression
4. Verify progress dots pulse
5. Check solution display

**Expected Result:** Problem solved step-by-step, completes

---

### 5.4 Healthcare Scene (Service Section)
- [ ] 4-step form displays: Personal Info, Insurance, Medical History, Review
- [ ] Progress bar fills as steps advance
- [ ] Field validation states visible
- [ ] Auto-advance every 2.5 seconds
- [ ] Scene completes after Review step (~10s)

**Test Steps:**
1. Navigate to "Service Experience" section
2. Observe patient intake form
3. Watch progress bar fill
4. Verify field states update
5. Check completion after Review

**Expected Result:** Form progresses through all steps, completes

---

### 5.5 Scene Intent Handling
- [ ] **SKIMMING:** Scene fast-forwards to completion
- [ ] **SEEKING:** Scene advances to next step
- [ ] **EXPLORING:** Scene plays at normal speed
- [ ] Scene completion triggers scroll unlock
- [ ] Avatar celebrates (emotion: 'joy', gesture: 'celebration')
- [ ] Success message displays: "{section} demo complete!"

**Test Steps:**
1. Navigate to a section, skim rapidly → verify fast-forward
2. Navigate to another section, scroll moderately → verify step advance
3. Navigate to another section, slow scroll → verify normal playback
4. For each, verify scroll unlocks after completion
5. Check avatar emotion changes to joy
6. Verify success message appears

**Expected Result:** Scenes respond to intent, unlock after completion

---

## 6. Scroll Lock System

### 6.1 Lock Acquisition
- [ ] Scroll locks when avatar navigation begins
- [ ] Lock target set to section ID
- [ ] `lockedAt` timestamp recorded
- [ ] `distanceFromLock` tracks scroll offset from lock point
- [ ] User can still scroll but position returns to lock

**Test Steps:**
1. Scroll into a section
2. Observe scroll "stickiness" (position snaps back)
3. Open DevTools, inspect scroll lock state
4. Verify `locked: true` in context

**Expected Result:** Scroll locks, user can test but returns

---

### 6.2 Lock Release - Scene Complete
- [ ] Lock releases when scene completes
- [ ] Release reason: "scene-complete"
- [ ] `unlockedAt` timestamp recorded
- [ ] Scroll resumes normal behavior

**Test Steps:**
1. Lock to a section, let scene play
2. Wait for completion message
3. Attempt to scroll freely
4. Verify scroll works normally

**Expected Result:** Lock releases after scene, scroll restored

---

### 6.3 Lock Release - Hard Break
- [ ] Lock releases if user scrolls past buffer + threshold (200px)
- [ ] Release reason: "hard-break"
- [ ] Works even if scene not complete

**Test Steps:**
1. Lock to a section
2. Aggressively scroll down (over 200px offset)
3. Verify lock releases
4. Scroll continues past section

**Expected Result:** Hard break releases lock after threshold

---

### 6.4 Lock Release - Intent Seeking
- [ ] Lock releases if SEEKING intent and past buffer (100px)
- [ ] Lock releases if SKIMMING intent (immediately)
- [ ] Release reason: "intent-seeking" or "intent-skimming"

**Test Steps:**
1. Lock to a section
2. Scroll moderately (SEEKING) past 100px
3. Verify lock releases
4. Lock to another section, skim rapidly
5. Verify lock releases immediately

**Expected Result:** Intent-based release works correctly

---

## 7. Responsive & Mobile

### 7.1 Mobile Layout
- [ ] Mascot scales appropriately on mobile
- [ ] QuickNav overlay full-screen on mobile
- [ ] Touch scrolling triggers intent detection
- [ ] Scenes render correctly in portrait and landscape
- [ ] All text readable (font sizes appropriate)

**Test Steps:**
1. Open site on mobile device (or use DevTools mobile emulation)
2. Verify mascot visible and scaled
3. Scroll with touch gestures
4. Open QuickNav with tap (if button added) or keyboard
5. Rotate device to landscape

**Expected Result:** Site responsive, all features work on mobile

---

### 7.2 Tablet Layout
- [ ] Mascot position adjusted for tablet viewport
- [ ] QuickNav overlay sized appropriately
- [ ] Touch and stylus input work
- [ ] Scenes render at correct canvas dimensions

**Test Steps:**
1. Open site on tablet (or emulate iPad in DevTools)
2. Test all scroll, navigation, scene interactions
3. Verify UI elements properly sized

**Expected Result:** Tablet experience optimized

---

### 7.3 Touch Gestures
- [ ] Swipe down = scroll down (EXPLORING/SEEKING)
- [ ] Fast swipe = SKIMMING intent
- [ ] Pinch-to-zoom disabled (or handled gracefully)
- [ ] Touch on mascot (if interactive) responds

**Test Steps:**
1. Use touch device
2. Perform slow swipe, moderate swipe, fast swipe
3. Verify intent detection works
4. Attempt pinch-to-zoom

**Expected Result:** Touch gestures mapped to intents correctly

---

## 8. Performance

### 8.1 Frame Rate (FPS)
- [ ] Mascot animation maintains 60fps
- [ ] Scene canvas rendering maintains 60fps
- [ ] Scroll performance smooth (no jank)
- [ ] No dropped frames during avatar navigation

**Test Steps:**
1. Open DevTools Performance tab
2. Start recording
3. Scroll through all sections, trigger scenes
4. Stop recording, analyze FPS graph
5. Target: 60fps sustained, no drops below 50fps

**Expected Result:** Consistent 60fps, no significant frame drops

---

### 8.2 Memory Usage
- [ ] Initial page load < 100MB heap
- [ ] Memory usage stable during scrolling
- [ ] No memory leaks after navigating all sections
- [ ] Scenes dispose of resources correctly (no accumulation)

**Test Steps:**
1. Open DevTools Memory tab
2. Take heap snapshot on load
3. Navigate all sections, trigger all scenes
4. Take another heap snapshot
5. Compare heap size, check for growth > 100MB

**Expected Result:** Heap growth < 100MB, no leaks

---

### 8.3 Network Performance
- [ ] Site loads in < 3 seconds on Fast 4G
- [ ] Site loads in < 8 seconds on Slow 3G
- [ ] Emotive engine script loads asynchronously
- [ ] Fonts load without blocking render
- [ ] No unnecessary re-fetches of assets

**Test Steps:**
1. Open DevTools Network tab
2. Set throttling to "Fast 4G"
3. Hard reload (Ctrl+Shift+R)
4. Check total load time in Network summary
5. Repeat with "Slow 3G"

**Expected Result:** Load times within targets

---

## 9. Accessibility (a11y)

### 9.1 Keyboard Navigation
- [ ] Tab order logical (header → hero → sections → footer)
- [ ] QuickNav focus trap works (Tab cycles sections)
- [ ] Escape key closes QuickNav
- [ ] No keyboard traps outside QuickNav
- [ ] All interactive elements keyboard-accessible

**Test Steps:**
1. Disconnect mouse
2. Use Tab key to navigate entire page
3. Verify focus order makes sense
4. Open QuickNav with Ctrl+K, Tab through sections
5. Close with Escape

**Expected Result:** Full keyboard accessibility

---

### 9.2 Screen Reader Support
- [ ] ARIA roles present (`role="dialog"` on QuickNav)
- [ ] `aria-live` regions announce changes
- [ ] `aria-label` on interactive elements
- [ ] Section headings properly structured (h1, h2, h3)
- [ ] Screen reader announces QuickNav open/close

**Test Steps:**
1. Enable screen reader (NVDA, JAWS, VoiceOver)
2. Navigate page with screen reader commands
3. Open QuickNav, verify announcement
4. Navigate sections, verify heading structure

**Expected Result:** Screen reader users can use all features

---

### 9.3 Reduced Motion
- [ ] `prefers-reduced-motion` respected
- [ ] Animations disabled or reduced if user preference set
- [ ] ScrollHint bounce animation disabled
- [ ] Avatar path animation simplified (or instant)
- [ ] Scene animations still functional but minimal

**Test Steps:**
1. Enable "Reduce motion" in OS settings
2. Reload site
3. Verify animations toned down or removed
4. Test all features still work

**Expected Result:** Reduced motion honored, features intact

---

### 9.4 Color Contrast
- [ ] Text meets WCAG AA contrast ratio (4.5:1)
- [ ] Interactive elements have sufficient contrast
- [ ] Focus indicators visible on all elements
- [ ] Color not sole indicator of state (use icons/text too)

**Test Steps:**
1. Use browser extension (e.g., axe DevTools)
2. Run accessibility audit
3. Check for contrast violations
4. Manually verify focus indicators visible

**Expected Result:** All contrast requirements met

---

## 10. Cross-Browser Compatibility

### 10.1 Chrome/Chromium
- [ ] All features work as expected
- [ ] No console errors or warnings
- [ ] Canvas rendering correct
- [ ] Animations smooth

**Test Steps:** Run full test suite in Chrome

---

### 10.2 Firefox
- [ ] Same as Chrome tests
- [ ] Verify canvas performance
- [ ] Check for Firefox-specific CSS issues

**Test Steps:** Run full test suite in Firefox

---

### 10.3 Safari (macOS)
- [ ] Same as Chrome tests
- [ ] Verify canvas rendering (Safari has WebKit differences)
- [ ] Check for Safari-specific JS issues
- [ ] Test on macOS Safari specifically

**Test Steps:** Run full test suite in Safari

---

### 10.4 Edge
- [ ] Same as Chrome tests (Chromium-based)
- [ ] Verify no Edge-specific quirks

**Test Steps:** Run full test suite in Edge

---

## 11. Error Handling

### 11.1 Script Load Failure
- [ ] If emotive-engine.js fails to load, graceful degradation
- [ ] Error message displayed (or silent fallback)
- [ ] Page still usable without mascot

**Test Steps:**
1. Block emotive-engine.js in DevTools Network tab
2. Reload page
3. Verify error handling

**Expected Result:** Site degrades gracefully

---

### 11.2 Canvas Unsupported
- [ ] If canvas not supported, fallback message shown
- [ ] Page content still accessible

**Test Steps:**
1. Use browser with canvas disabled (or mock)
2. Verify fallback behavior

**Expected Result:** Content accessible without canvas

---

## 12. Analytics Verification

### 12.1 QuickNav Events
- [ ] `emotive:quicknav` event fires on open
- [ ] Event fires on close with correct `reason`
- [ ] Event fires on navigate with `sectionId` and `index`
- [ ] Events have timestamps

**Test Steps:**
1. Open DevTools console
2. Add event listener: `window.addEventListener('emotive:quicknav', e => console.log(e.detail))`
3. Open QuickNav, close, navigate
4. Verify events logged

**Expected Result:** All events tracked correctly

---

### 12.2 Scroll Intent Tracking
- [ ] Intent changes detectable (via context or custom events)
- [ ] Confidence scores accurate
- [ ] (If custom events added) `emotive:scroll-intent` fires

**Test Steps:**
1. Add custom event listener for intent tracking
2. Scroll at different speeds
3. Log intent changes

**Expected Result:** Intent tracking functional

---

### 12.3 Avatar Lifecycle Tracking
- [ ] Lifecycle callbacks fire (onPathStart, onPathComplete, etc.)
- [ ] (If custom events added) Events emitted to window

**Test Steps:**
1. Monitor console logs for lifecycle events
2. Navigate sections via QuickNav
3. Verify events fire in sequence

**Expected Result:** Lifecycle tracked correctly

---

### 12.4 Scene Completion Tracking
- [ ] `onSceneComplete` callback fires after scene finishes
- [ ] Callback includes correct `sectionId`
- [ ] (If custom events added) `emotive:scene-complete` event fires

**Test Steps:**
1. Navigate to each scene section
2. Let scene complete
3. Verify callback/event fires

**Expected Result:** Scene completions tracked

---

## Test Execution Log

### Test Run 1 - Desktop (Chrome)
**Date:** __________
**Tester:** __________
**Result:** ☐ Pass ☐ Fail ☐ Partial
**Notes:**

---

### Test Run 2 - Desktop (Firefox)
**Date:** __________
**Tester:** __________
**Result:** ☐ Pass ☐ Fail ☐ Partial
**Notes:**

---

### Test Run 3 - Mobile (iPhone/Safari)
**Date:** __________
**Tester:** __________
**Result:** ☐ Pass ☐ Fail ☐ Partial
**Notes:**

---

### Test Run 4 - Mobile (Android/Chrome)
**Date:** __________
**Tester:** __________
**Result:** ☐ Pass ☐ Fail ☐ Partial
**Notes:**

---

### Test Run 5 - Slow 3G Network
**Date:** __________
**Tester:** __________
**Result:** ☐ Pass ☐ Fail ☐ Partial
**Notes:**

---

## Bug Tracking

| ID | Severity | Category | Description | Status | Fixed In |
|----|----------|----------|-------------|--------|----------|
| 1  |          |          |             |        |          |
| 2  |          |          |             |        |          |
| 3  |          |          |             |        |          |

**Severity Levels:**
- **Critical:** Blocks deployment, site unusable
- **High:** Major feature broken, affects UX significantly
- **Medium:** Feature works but has issues, workaround available
- **Low:** Minor visual/UX issue, cosmetic

---

## Sign-Off

### QA Lead
**Name:** __________
**Date:** __________
**Signature:** __________

### Product Owner
**Name:** __________
**Date:** __________
**Signature:** __________

---

**Testing Complete:** ☐ Ready for Deployment ☐ Needs Fixes
