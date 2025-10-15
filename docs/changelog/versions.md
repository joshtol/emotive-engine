---
title: "Version History"
category: "Changelog"
order: 1
description: "Release notes and version history"
---

# Version History

## [2.6.0] - 2025-01-14

### Rotation & Braking System Overhaul

**Major Changes:**
- Converted entire rotation system from radians to degrees for simplicity
- Redesigned RotationBrake class for smooth, predictable deceleration
- Time-based easing using quartic ease-out function
- Automatic target calculation to nearest upright position

**Demo Improvements:**
- Updated rotation slider to -10 to 10 range
- Added gradient background to rotation slider
- Enhanced slider thumb with gradient and shadows
- Simplified brake button to single-click only

**Technical Details:**
- Removed 200+ lines of complex physics calculations
- Replaced with ~100 lines of simple, working code
- Eliminated unit conversion bugs between radians/degrees
- Fixed race conditions between brake and renderer updates

---

## [2.5.0] - 2025-01-11

### Visual Effects & Polish

**New Features:**
- Added chromatic aberration effect on impact gestures
- Renamed Sparkle effect to Flicker
- Added new Sparkle effect with firefly-like glow particles
- Improved star particle shape from 4-pointed to 5-pointed

**Technical Improvements:**
- Refactored special effects to use CSS animations
- Fixed canvas element targeting for post-processing
- Optimized effect update loop with proper fade timing

---

## [2.4.0] - 2025-01-11

### Production Readiness

**Code Cleanup:**
- Removed all console.log statements (126 total)
- Fixed syntax errors from incomplete console removal
- Fixed drop shadow rendering issue
- Fixed orbital gesture to keep core stationary

**Bug Fixes:**
- Fixed bass sensitivity in web audio
- Fixed rhythm sync BPM detection jumping
- Fixed gesture animations not triggering independently
- Fixed flash gesture wave pattern
- Fixed core dimming issue

---

## [2.3.0] - 2025-01-10

### Advanced Audio-Reactive System

**Spectral Analysis:**
- Implemented real-time spectral flux onset detection
- Created 32-band FFT frequency analyzer
- Added adaptive thresholding system
- Developed spectral contrast detection

**Bass Response:**
- Engineered bass thump detection (20-250Hz)
- Dynamic threshold calculation
- Randomized directional wobble effect
- Smooth decay system with hold times

**Vocal Effects:**
- Subtle shimmer/ripple for vocal presence
- 2-3 point glitch system
- Glow boost effect on vocal onsets

---

## [2.2.0] - 2025-01-10

### Shape Morphing Improvements

**Shape System:**
- Removed eclipse and solar shapes
- Fixed moon shadow behavior
- Enhanced sun rays with fire-like animation
- Smoothed lunar eclipse animations

**Musical Quantization:**
- Adaptive granularity based on BPM
- Phase-aware quantization
- BPM-based strength curve
- Cubic interpolation for blending

**Morph Queue:**
- Automatic morph queueing
- Force override option
- Queue management methods

---

## [2.1.0] - 2025-01-09

### Musical Time-Based Animation

**Revolutionary Features (Patent-Pending):**
- Gesture scheduling in musical time vs clock time
- 60,000ms/BPM conversion algorithm
- Hierarchical rhythm modulation system
- Musical boundary quantization

**New Systems:**
- MusicalDuration class for tempo-adaptive animations
- GestureScheduler with musical boundaries
- Per-gesture queue management

---

## [2.0.0] - 2025-01-08

### Emotion-Driven Particle System

**Major Innovation:**
- Created emotion matrix with behavioral undertones
- Developed 40+ unique gesture animations
- Implemented particle physics with emotional responsiveness
- Built modular gesture system

**Core Features:**
- 12 primary emotions
- 6 behavioral undertones
- Dynamic particle count based on emotion
- Z-coordinate system for 3D depth

---

## [1.0.0] - 2025-01-07

### Initial Release

- Basic particle engine with canvas rendering
- Simple emotion states
- Foundation for gesture system
- Basic orbital and wave animations

---

## Upgrade Guide

### Migrating from 2.5.x to 2.6.x

The rotation system now uses degrees instead of radians:

```javascript
// Old (v2.5.x)
mascot.setRotationSpeed(0.05) // radians per second

// New (v2.6.x)
mascot.setRotationSpeed(5) // degrees per frame
```

### Migrating from 2.3.x to 2.4.x

No breaking changes. Console logging removed for production readiness.

### Migrating from 1.x to 2.x

Major API overhaul. See [Migration Guide](/docs/guides/migration-v2) for details.
