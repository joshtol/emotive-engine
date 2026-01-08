# Groove Animation System - Improvement Tasks

This document tracks improvements to the groove animation system in Emotive Engine 3D.

---

## Overview

The groove system provides ambient rhythm-synced animations when the mascot is listening to music. It creates subtle bounce, sway, scale pulse, and rotation that sync to detected BPM.

**Key Files:**
- `src/3d/animation/Rhythm3DAdapter.js` - Groove computation and presets
- `src/3d/Core3DManager.js` - Applies groove to geometry (lines 1540-1578)
- `src/3d/animation/BreathingAnimator.js` - Parallel idle animation system

---

## Task List

### High Priority

- [x] **1. Implement Easing Curves** *(Completed)*

  **Problem:** Each preset defines an `easing` property (`'sine'`, `'bounce'`) but it's never used. All grooves use raw sine waves.

  **Location:** `Rhythm3DAdapter.js` → `computeGroove()` (lines 456-498)

  **Implementation:**
  ```javascript
  // Add easing function helper
  _applyEasing(value, easingType) {
      switch (easingType) {
          case 'bounce':
              // Sharper attack, slower decay - snappier feel
              // Use abs(sin) with power curve for punch
              return Math.sign(value) * Math.pow(Math.abs(value), 0.7);
          case 'elastic':
              // Playful overshoot (for future use)
              return value * (1 + 0.1 * Math.sin(value * Math.PI * 3));
          case 'sine':
          default:
              return value; // Current behavior
      }
  }
  ```

  **Changes needed:**
  1. Add `_applyEasing()` method to Rhythm3DAdapter class
  2. In `computeGroove()`, apply easing to bounce/sway/pulse values before writing to `_target`
  3. Pass `preset.easing` to the function

  **Test:** Play music with groove2 (uses 'bounce' easing) - should feel snappier than groove1 (uses 'sine')

---

- [x] **2. Add Accent/Downbeat Response** *(Completed)*

  **Problem:** Strong beats (beat 1 of bar, accented beats) feel the same as weak beats. No "pop" on downbeats.

  **Location:** `Rhythm3DAdapter.js` → `computeGroove()` and `computeModulation()`

  **Implementation:**
  ```javascript
  // In computeGroove(), add accent boost
  const accentBoost = this.isOnBeat && this.accent > 0.7 ? 0.3 : 0;

  // Apply to bounce (extra vertical pop on accents)
  const bounce = Math.sin(bouncePhase) * bounceAmount * (1 + accentBoost);

  // Apply to scale (brief expansion on accents)
  const pulse = 1.0 + Math.sin(bouncePhase) * pulseAmount * (1 + accentBoost * 0.5);
  ```

  **Also add groove glow:**
  ```javascript
  // New channel in _target and modulation
  grooveGlow: 1.0  // Add to both objects

  // In computeGroove():
  const glowPulse = 1.0 + Math.sin(bouncePhase) * 0.15 * conf;
  const accentGlow = this.isOnBeat && this.accent > 0.7 ? 0.2 : 0;
  this._target.grooveGlow = glowPulse + accentGlow;
  ```

  **Changes needed:**
  1. Add `grooveGlow` to `modulation` and `_target` objects in constructor
  2. Compute `grooveGlow` in `computeGroove()`
  3. Smooth `grooveGlow` in `applySmoothing()`
  4. Apply in `Core3DManager.js` when idle (similar to grooveScale)

  **Test:** Play music with clear downbeats - mascot should "pop" slightly on beat 1

---

### Medium Priority

- [x] **3. Blend Groove with Gestures (Don't Disable)** *(Completed)*

  **Problem:** At `Core3DManager.js:1541`, groove is completely disabled when gestures are active. This creates a jarring on/off feel.

  **Current code:**
  ```javascript
  if (rhythmMod && !hasActiveGestures) {
      // Apply ambient groove when idle
  }
  ```

  **Improved approach:**
  ```javascript
  // Reduce groove to 30% during gestures instead of 0%
  const grooveBlend = hasActiveGestures ? 0.3 : 1.0;

  if (rhythmMod) {
      this.position = [
          blended.position[0] + rhythmMod.grooveOffset[0] * grooveBlend,
          blended.position[1] + rhythmMod.grooveOffset[1] * grooveBlend,
          blended.position[2] + rhythmMod.grooveOffset[2] * grooveBlend
      ];
  }
  ```

  **Changes needed:**
  1. Calculate `grooveBlend` factor based on gesture state
  2. Apply blend factor to all groove channels (offset, scale, rotation, glow)
  3. Consider smoothing the blend factor for gradual transitions

  **Test:** Trigger a gesture while music plays - groove should reduce but not disappear

---

- [x] **4. Add Groove Glow Channel** *(Completed - included in Task 2)*

  **Problem:** Groove affects position, scale, rotation but NOT glow. Missed opportunity for visual polish.

  **Location:**
  - `Rhythm3DAdapter.js` - add grooveGlow computation
  - `Core3DManager.js` - apply grooveGlow to material

  **Implementation:** (See task #2 for grooveGlow computation)

  **In Core3DManager.js, around line 1580:**
  ```javascript
  // Apply groove glow when idle
  if (rhythmMod && !hasActiveGestures && this.glowIntensityOverride === null) {
      this.glowIntensity = blended.glowIntensity * rhythmMod.grooveGlow;
  }
  ```

  **Test:** Play music - glow should subtly pulse with the beat

---

- [x] **5. Multi-Axis Motion (More Organic Feel)** *(Completed)*

  **Problem:** Motion is too constrained:
  - Bounce = Y only
  - Sway = X only
  - Rotation = Z only

  This creates a mechanical, 2D feel.

  **Implementation in `computeGroove()`:**
  ```javascript
  // Add subtle Z-drift (forward/back bobbing)
  const zDrift = Math.sin(swayPhase + Math.PI/3) * swayAmount * 0.3;

  // Add X/Y rotation for "head tilt" effect
  const tiltX = Math.sin(swayPhase * 0.5) * rotationAmount * 0.4;
  const tiltY = Math.cos(bouncePhase * 0.7) * rotationAmount * 0.25;

  // Write with phase offsets for organic feel
  this._target.grooveOffset = [sway, bounce, zDrift];
  this._target.grooveRotation = [tiltX, tiltY, rotationSway];
  ```

  **Key insight:** Use different phase relationships between axes so they don't move in lockstep.

  **Test:** Watch mascot groove - should feel more 3D and alive, less like a 2D sprite

---

### Low Priority

- [ ] **6. Beat-Sync Preset Transitions**

  **Problem:** When switching groove presets, the transition happens immediately. More musical to wait for a bar boundary.

  **Implementation:**
  ```javascript
  setGroove(grooveName, options = {}) {
      // ... existing validation ...

      if (options.quantize) {
          // Queue the change for next bar
          this._pendingGroove = grooveName;
          this._pendingGrooveOptions = options;
          return;
      }
      // ... rest of existing code ...
  }

  // In update(), check for pending groove at bar boundary
  if (this._pendingGroove && this.barProgress < 0.05) {
      // Start of new bar - apply pending groove
      this._applyGrooveChange(this._pendingGroove, this._pendingGrooveOptions);
      this._pendingGroove = null;
  }
  ```

  **Test:** Call `setGroove('groove2', { quantize: true })` mid-bar - should wait until next bar

---

- [ ] **7. Emotion-Aware Groove Selection**

  **Problem:** Groove character is independent of emotional state. A "happy" mascot grooves the same as a "sad" one.

  **Implementation approach:**
  ```javascript
  // In Core3DManager or EmotiveMascot3D
  _getEmotionGroove(emotion) {
      const emotionGrooveMap = {
          happy: 'groove2',      // Energetic
          excited: 'groove2',
          calm: 'groove1',       // Subtle
          neutral: 'groove1',
          sad: 'groove1',        // Subdued (could also reduce grooveConfidence)
          zen: 'groove3',        // Flowing
          love: 'groove3'
      };
      return emotionGrooveMap[emotion] || 'groove1';
  }

  // When emotion changes, update groove
  setEmotion(emotion) {
      // ... existing emotion logic ...
      if (this.rhythm3DAdapter?.isPlaying()) {
          const groove = this._getEmotionGroove(emotion);
          this.rhythm3DAdapter.setGroove(groove, { bars: 2 });
      }
  }
  ```

  **Test:** Change emotion while grooving - groove character should adapt

---

- [ ] **8. Coordinate Breathing with Groove**

  **Problem:** BreathingAnimator runs independently of groove. They can interfere or create odd rhythms.

  **Options:**

  **Option A: Sync breathing to bar timing**
  ```javascript
  // In BreathingAnimator, when rhythm is playing
  if (rhythmAdapter?.isPlaying()) {
      // One breath per bar (or 2 bars for slow tempos)
      const barDuration = 60000 / rhythmAdapter.getBPM() * 4;
      this.breathingSpeed = (Math.PI * 2) / barDuration * 1000;
  }
  ```

  **Option B: Reduce breathing during groove**
  ```javascript
  // When groove is active, reduce breathing depth
  const grooveActive = rhythmAdapter?.isPlaying();
  const breathMultiplier = grooveActive ? 0.4 : 1.0;
  return 1.0 + Math.sin(this.breathingPhase) * this.breathDepth * breathMultiplier;
  ```

  **Recommended:** Option B is simpler and avoids tempo-dependent breathing weirdness

  **Test:** Play music - breathing and groove should complement, not fight

---

## Implementation Order

Recommended sequence for implementing these improvements:

1. **Task 1 (Easing)** - Quick win, uses existing code path
2. **Task 2 (Accents)** - High impact, makes groove feel musical
3. **Task 4 (Groove Glow)** - Part of task 2, visual polish
4. **Task 5 (Multi-axis)** - Makes motion feel alive
5. **Task 3 (Gesture blend)** - Improves continuity
6. **Task 8 (Breathing)** - Cleanup/polish
7. **Task 6 (Beat-sync transitions)** - Musical polish
8. **Task 7 (Emotion grooves)** - Deep integration

---

## Testing Checklist

After implementing, verify with groove-test.html:

- [ ] Groove presets sound/look different from each other
- [ ] groove2 feels snappier than groove1 (easing working)
- [ ] Downbeats have visible "pop" (accent response)
- [ ] Glow pulses subtly with beat
- [ ] Motion feels 3D, not flat
- [ ] Starting a gesture doesn't kill groove completely
- [ ] Breathing doesn't fight with groove rhythm
- [ ] Preset transitions feel musical

---

## Notes

- All amplitude values are scaled by `grooveConfidence` (0.15 to 1.0) from BPM detection
- Groove only applies when `hasActiveGestures === false` (currently)
- All smoothing uses exponential interpolation with clamped deltaTime for frame-rate independence
- Presets can be morphed between using `grooveTransition` (0-1)
