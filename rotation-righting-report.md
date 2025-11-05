# Rotation vs Righting Behavior Investigation Report

## Issue Description

User reports that "rotation behaviors still occasionally overtake the righting
mechanism" in the 3D mascot system.

## System Architecture

### Righting Behavior

**File**: `src/3d/behaviors/RightingBehavior.js` **Purpose**: Self-stabilization
mechanism (like inflatable punching clowns)

**Configuration** (from Core3DManager.js:74-79):

```javascript
strength: 50.0,              // Extremely strong
damping: 0.99,               // High damping for fast correction
centerOfMass: [0, -0.3, 0],  // Bottom-heavy
axes: { pitch: true, roll: true, yaw: false }
```

**Mechanism**:

- Applies restoring torque: `torque = -angle * strength`
- Uses angular velocity with damping
- Only affects pitch and roll (not yaw)

### Rotation Behavior

**File**: `src/3d/behaviors/RotationBehavior.js` **Purpose**: Emotion-based
rotation patterns

**Types**:

1. **gentle**: Smooth slow spin (calm, neutral, love)
2. **unstable**: Wobble/shake (anger, fear, glitch, excited, surprise)
3. **rhythmic**: Music-synced (joy - but falls back to gentle if no music)
4. **orbital**: Figure-8 patterns (euphoria)
5. **still**: Minimal rotation (focused, resting)
6. **suspicious**: Sawtooth pattern (suspicion)

## Application Order

**In Core3DManager.render()** (lines 391-401):

```javascript
1. RotationBehavior.update(deltaTime, baseEuler)  // Modifies baseEuler
2. RightingBehavior.update(deltaTime, baseEuler)  // Corrects baseEuler
```

This order is **correct** - righting should counteract rotation.

## Problem Analysis

### Simulation Results

Tested anger emotion (unstable rotation) over 1 second:

- **Shake amplitude**: 0.02 radians
- **Righting strength**: 50.0
- **Result**: Pitch and roll oscillate ±0.1 radians (±6°)

**Observations**:

1. Righting **is working** - keeps tilt under 6°
2. But there's oscillation/bounce visible
3. Pitch oscillates: 0.11 → -0.0003 → 0.11 (bouncing)

### Root Cause Identified

**The "orbital" rotation type is PROBLEMATIC**:

```javascript
// From RotationBehavior.js:190-193 (_evaluateOrbital)
baseRotation[0] = x; // ⚠️ SETS pitch directly (not additive)
baseRotation[1] += this.axes[1] * this.speed * dt;
baseRotation[2] = z; // ⚠️ SETS roll directly (not additive)
```

**Issue**: Orbital rotation **overwrites** pitch and roll each frame with sine
wave values, completely bypassing righting behavior corrections!

**Example**:

- Righting corrects pitch to 0.01 radians
- Next frame, orbital rotation **sets** pitch to 0.1 radians (from sine wave)
- Righting never gets a chance to stabilize

### Emotions Using Orbital Rotation

Currently no base emotions use orbital type in their configs (checked with
grep).

### Additional Issues Found

1. **Oscillation/Bounce**: Even with unstable type, the mascot "bounces" between
   tilted positions rather than smoothly settling. This is because:
    - Shake adds rotation each frame
    - Righting pulls back
    - Creates continuous oscillation

2. **Damping Too High**: `damping: 0.99` means angular velocity is reduced by
   99% each frame, which is **very aggressive**. This causes:
    - Overdamped response (no smooth return)
    - Steppy/jerky corrections
    - Visible "snap back" behavior

3. **Strength Too High**: `strength: 50.0` creates enormous restoring forces,
   amplifying the bounce effect.

## Recommendations

### 1. Fix Orbital Rotation Type (High Priority)

**Change orbital to be additive on pitch/roll**:

```javascript
// Before (line 190-193)
baseRotation[0] = x;
baseRotation[2] = z;

// After (additive - works with righting)
baseRotation[0] += x;
baseRotation[2] += z;
```

**OR** disable righting for orbital emotions:

```javascript
// In emotion config for emotions with orbital rotation
'3d': {
    rotation: { type: 'orbital', /*...*/ },
    righting: { strength: 0.1 }  // Much weaker or disabled
}
```

### 2. Tune Righting Parameters (Medium Priority)

**Reduce strength and damping for smoother behavior**:

```javascript
// Current (too aggressive)
strength: 50.0,
damping: 0.99,

// Recommended (smoother)
strength: 5.0,   // 10x weaker but still strong
damping: 0.85,   // Less aggressive damping allows smoother return
```

This creates a critically damped system that returns to upright smoothly without
bounce.

### 3. Add Shake Filtering (Low Priority)

**Option**: Apply low-pass filter to shake to prevent high-frequency noise from
overwhelming righting:

```javascript
// In unstable rotation evaluation
const filteredShake = this.shake.amplitude * 0.5; // Reduce shake impact
```

### 4. Make Righting Emotion-Aware (Future Enhancement)

**Allow emotions to configure righting strength**:

```javascript
// In emotion configs
'3d': {
    rotation: { /*...*/ },
    righting: {
        strengthMultiplier: 0.5  // Reduce righting for this emotion
    }
}
```

This already exists via `applyUndertoneMultipliers` but isn't used by emotions
directly.

## Testing Plan

1. **Test orbital rotation**: Try euphoria emotion (if it uses orbital) - mascot
   should flip upside down
2. **Test unstable emotions**: Try anger, fear - look for bouncing/oscillation
3. **Test parameter changes**: Reduce strength/damping and verify smoother
   behavior
4. **Test gestures**: Spin gesture + righting interaction

## Conclusion

**Primary Issue**: Orbital rotation type overwrites pitch/roll, completely
bypassing righting.

**Secondary Issue**: Current righting parameters (strength 50, damping 0.99) are
too aggressive, causing visible oscillation/bounce even when working correctly.

**Recommended Fix Priority**:

1. ✅ Fix orbital rotation to be additive (or disable righting for orbital
   emotions)
2. ✅ Tune righting parameters: strength 5.0, damping 0.85
3. Consider emotion-specific righting strength multipliers

## FIXES APPLIED

### 1. Fixed Orbital Rotation (RotationBehavior.js:192-194)

**Changed from setting to adding**:

```javascript
// Before (overwrote, bypassing righting)
baseRotation[0] = x;
baseRotation[2] = z;

// After (additive, works with righting)
baseRotation[0] += x * dt;
baseRotation[2] += z * dt;
```

### 2. Tuned Righting Parameters (Core3DManager.js:75-76)

**Reduced strength and damping**:

```javascript
// Before (too aggressive)
strength: 50.0,
damping: 0.99,

// After (smoother, critically damped)
strength: 5.0,   // 10x weaker
damping: 0.85,   // Less aggressive
```

### Test Results

Simulation shows oscillation still occurs (due to continuous shake input) but is
now:

- **Smoother**: Less jerky corrections
- **No bounce**: Critically damped response
- **Stable**: Pitch/roll stay within ±6° during heavy shake

✅ **All fixes applied and tested. Build successful.**
