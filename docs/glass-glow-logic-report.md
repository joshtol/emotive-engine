# Glass vs Glow Logic Analysis Report

## Issue
Glow intensity accumulates on blink when glass material is active, causing runaway brightness.

---

## Current Architecture

### 1. Glow Intensity Flow

```
Emotion Base Value (e.g., joy: 1.6)
    ↓
Core3DManager.baseGlowIntensity (set on emotion change)
    ↓
GestureBlender.blend() (blends with gesture animations)
    ↓
Core3DManager.glowIntensity (blended result)
    ↓
BlinkManager adds glowBoost (LINE 543: += operator)  ← ACCUMULATION HAPPENS HERE
    ↓
ThreeRenderer.render(glowIntensity)
    ↓
    ├─ Glow Material: uniforms.glowIntensity (lerped)
    └─ Glass Material: emissiveIntensity = glowIntensity × 0.5 (lerped)
```

### 2. The Problem: Additive Blink Boost

**File:** `src/3d/Core3DManager.js:542-544`

```javascript
// Apply blink glow boost
if (blinkState.glowBoost) {
    this.glowIntensity += blinkState.glowBoost;  // ← ADDS to current value
}
```

**Why this causes runaway glow:**
1. Blink adds `glowBoost` (e.g., +0.2) to `this.glowIntensity`
2. `this.glowIntensity` gets passed to renderer
3. Glass material lerps toward: `(this.glowIntensity × 0.5)`
4. Because it lerps with factor 0.15, it never fully reaches target
5. Each frame, it accumulates a bit more
6. Over multiple blinks, this compounds and grows infinitely

**Example progression with joy (base 1.6):**
```
Frame 1: baseGlow 1.6 → blink adds 0.2 → glowIntensity = 1.8 → target emissive = 0.9
Frame 2: lerp from current → new current = 0.89
Frame 3: blink adds 0.2 again → glowIntensity = 2.0 → target emissive = 1.0
Frame 4: lerp from 0.89 → new current = 0.906
... continues accumulating
```

---

## Root Cause Analysis

### The Design Flaw

**Glow shader (ShaderMaterial) is resilient:**
- Uses: `uniforms.glowIntensity.value += (glowIntensity - currentIntensity) * 0.15`
- This is a **lerp toward target** - it always converges to the target value
- Even if blink adds temporary boost, it lerps back down when boost ends

**Glass material (MeshPhysicalMaterial) accumulates:**
- Uses: `emissiveIntensity += (targetEmissiveIntensity - currentEmissiveIntensity) * 0.15`
- This is **also a lerp**, BUT:
- The `glowIntensity` input has `+=` operation applied BEFORE it reaches renderer
- So the "target" keeps increasing each blink
- The lerp chases a moving target that never decreases

### Why Glow Material Doesn't Have This Issue

The glow material **appears** to handle blinks correctly because:
1. The lerp factor (0.15) is high enough that it converges quickly
2. The `+=` in blink boost is **temporary** - next frame without blink, target drops
3. Blinks are short duration, so accumulation resets

But glass material **exposes the flaw** because:
1. Emissive intensity is more sensitive to small changes
2. Visual threshold is different (harder to see small increments)
3. Same accumulation happens, just more visible

---

## Current State-Dependent Logic in Glass

### What Glass SHOULD Be

Glass material should be a **pure visual effect** with no state-dependent behavior:
- Input: `glowIntensity` value
- Output: Transparent material with internal emissive glow
- No special cases for emotions, blinks, gestures, etc.

### What Glass ACTUALLY Does

**File:** `src/3d/ThreeRenderer.js:504-519`

```javascript
} else if (this.coreMesh.material.emissive) {
    // MeshPhysicalMaterial (glass material)
    this._tempColor.setRGB(...glowColor);
    this.coreMesh.material.emissive.lerp(this._tempColor, 0.15);

    // Direct mapping: use glowIntensity as-is for glass emissive
    const targetEmissiveIntensity = glowIntensity * 0.5;
    const currentEmissiveIntensity = this.coreMesh.material.emissiveIntensity;
    this.coreMesh.material.emissiveIntensity += (targetEmissiveIntensity - currentEmissiveIntensity) * 0.15;

    // Also tint the base color slightly for more vibrant glow
    this._tempColor2.setRGB(...glowColor);
    this._tempColor2.lerp(this._white, 0.7);
    this.coreMesh.material.color.lerp(this._tempColor2, 0.15);
}
```

**Current behavior:**
- ✅ **GOOD:** Takes `glowIntensity` as input and scales by 0.5
- ✅ **GOOD:** Lerps emissive color to match emotion color
- ✅ **GOOD:** Tints base color for vibrancy
- ❌ **BAD:** Relies on upstream `glowIntensity` which has `+=` contamination from blink

---

## The Real Problem: Upstream Mutation

The issue is **not in the glass logic itself** - the glass logic is clean and stateless.

The issue is in **Core3DManager's blink handling:**

**File:** `src/3d/Core3DManager.js:542-544`

This code **mutates** `this.glowIntensity` by adding to it, rather than creating a new derived value.

### What Should Happen

```javascript
// DON'T mutate this.glowIntensity
// Instead, calculate a final value for rendering only
const renderGlowIntensity = this.glowIntensity + (blinkState.glowBoost || 0);
```

Then pass `renderGlowIntensity` to the renderer instead of `this.glowIntensity`.

---

## Special State Logic Found

### 1. Core Glow Toggle

**File:** `src/3d/Core3DManager.js:576`

```javascript
const effectiveGlowIntensity = this.coreGlowEnabled ? this.glowIntensity : 0.0;
```

**Verdict:** ✅ **ACCEPTABLE** - This is a user-facing toggle feature, not state-dependent logic.

### 2. Glow Intensity Override

**File:** `src/3d/Core3DManager.js:530-532`

```javascript
if (this.glowIntensityOverride === null) {
    this.glowIntensity = blended.glowIntensity;
}
```

**Verdict:** ✅ **ACCEPTABLE** - This is for manual testing/slider, not automatic state logic.

### 3. Blink Glow Boost (THE PROBLEM)

**File:** `src/3d/Core3DManager.js:542-544`

```javascript
if (blinkState.glowBoost) {
    this.glowIntensity += blinkState.glowBoost;
}
```

**Verdict:** ❌ **PROBLEMATIC** - This **mutates** the intensity value, causing accumulation.

---

## Recommended Fix

### Option A: Non-Mutating Blink Boost (Preferred)

Don't mutate `this.glowIntensity`. Instead, calculate final value at render time:

**File:** `src/3d/Core3DManager.js` (lines 542-586)

```javascript
// REMOVE this mutation:
// if (blinkState.glowBoost) {
//     this.glowIntensity += blinkState.glowBoost;
// }

// Later, at render time (line 576):
const blinkBoost = blinkState.isBlinking && blinkState.glowBoost ? blinkState.glowBoost : 0;
const effectiveGlowIntensity = this.coreGlowEnabled
    ? this.glowIntensity + blinkBoost
    : 0.0;

this.renderer.updateBloom(effectiveGlowIntensity);

this.renderer.render({
    position: this.position,
    rotation: this.rotation,
    scale: finalScale,
    glowColor: this.glowColor,
    glowIntensity: effectiveGlowIntensity  // ← Includes blink boost without mutation
});
```

**Benefits:**
- No mutation of state
- Blink boost is purely additive at render time
- No accumulation possible
- Glass and glow materials both receive clean input

---

## Conclusion

**The glass material logic is NOT the problem.** The glass material is a pure effect that correctly transforms `glowIntensity` into emissive properties.

**The problem is upstream:** The `+=` operation in blink glow boost (line 543) mutates the intensity value, which then propagates to both materials but is more visible in glass due to the emissive intensity being in a more sensitive visual range.

**Fix:** Move blink boost calculation to render time, making it additive without mutation.

---

## Summary

| Component | Current Behavior | Issue | Fix |
|-----------|-----------------|-------|-----|
| **Glass Material** | Pure transformation of glowIntensity → emissive | None | None needed |
| **Glow Material** | Pure transformation of glowIntensity → uniform | None | None needed |
| **Blink Manager** | Adds boost with `+=` operator | **Mutates state** | Calculate at render time |
| **Core3DManager** | Passes mutated value to renderer | **Propagates mutation** | Pass clean calculated value |

**Glass material has NO special state-dependent logic.** It is a pure visual effect as intended.

The accumulation bug exists in the **blink boost implementation**, not in the glass rendering logic.
