# 3D Coordinate System Documentation

## Coordinate Mapping

The 3D mascot uses a standard 3D coordinate system with the following mappings:

### Position Array: `[x, y, z]`

- **position[0] (X-axis)**: Horizontal movement (left-right on screen)
- **position[1] (Y-axis)**: Vertical movement (up-down on screen)
- **position[2] (Z-axis)**: Depth movement (toward/away from camera)

### 2D Particle to 3D Core Translation

When translating 2D particle gestures to 3D core movement:

```javascript
// 2D Particle Space
particle.x  // Horizontal position in pixels (left-right)
particle.y  // Vertical position in pixels (up-down)
particle.vx // Horizontal velocity
particle.vy // Vertical velocity

// Maps to 3D Space
props.position[0] = particle.x * scaleFactor;  // Horizontal
props.position[1] = particle.y * scaleFactor;  // Vertical
props.position[2] = particle.z || 0;           // Depth (optional)
```

### Scaling Factors

Different gestures require different scaling to look good in 3D space:

- **Small gestures** (orbit): `0.003` - Maps 50-280 pixel radius to small 3D movement
- **Medium gestures** (wiggle, sway): `0.05` - Maps accumulated velocity to visible motion
- **Generic translation**: `0.01` - Default scaling for unknown gestures

## Gesture Translation Examples

### Wiggle (Horizontal Side-to-Side)

```javascript
// 2D: Modifies particle.vx for horizontal velocity
particle.vx += Math.sin(progress * Math.PI * 2 * frequency) * amplitude * 0.05;

// Accumulate velocity into position
particle.x += particle.vx * 2.0;

// 3D: Map to horizontal axis only
props.position[0] = particle.x * 0.05;  // Horizontal wiggle
props.position[1] = 0;                   // No vertical
props.position[2] = 0;                   // No depth
```

### Orbit (Circular Motion)

```javascript
// 2D: Sets particle.x and particle.y directly for circular path
// 3D: Map both axes with small scaling
props.position[0] = particle.x * 0.003;   // Horizontal component
props.position[1] = -particle.y * 0.003;  // Vertical component (negated)
props.position[2] = particle.z || 0;      // Optional depth
```

### Bounce (Vertical Motion)

```javascript
// 2D: Modifies particle.vy for vertical velocity
// 3D: Map velocity to position
props.position[1] = particle.vy * 0.02;  // Vertical bounce
props.scale = 1.0 + Math.abs(particle.vy) * 0.005;  // Squash/stretch
```

## Important Notes

### All Three Coordinates Required

**Every 3D transform must set all three position coordinates**, even if some are zero:

```javascript
// ✅ CORRECT - All three coordinates set
props.position[0] = x;
props.position[1] = y;
props.position[2] = z;

// ❌ WRONG - Missing coordinates
props.position[0] = x;  // Other coordinates undefined
```

The 3D model always has all three coordinates. Setting them explicitly ensures predictable behavior.

### Velocity vs Position

Some gestures modify velocity (blending type), others set position directly (override type):

**Blending gestures** (wiggle, sway, jitter):
- Modify `particle.vx` and `particle.vy`
- Velocity must be accumulated into position: `particle.x += particle.vx * factor`
- Then map accumulated position to 3D

**Override gestures** (orbit, jump):
- Set `particle.x` and `particle.y` directly
- Map position values directly to 3D

### Coordinate System Origin

The 3D coordinate system is centered at `[0, 0, 0]`:
- Positive X = right
- Negative X = left
- Positive Y = up
- Negative Y = down
- Positive Z = toward camera
- Negative Z = away from camera

## Camera Setup

Default camera position from `WebGLRenderer`:

```javascript
this.cameraPosition = [0, 0, 3];  // Looking at origin from Z=3
this.cameraTarget = [0, 0, 0];    // Looking at center
```

The camera uses a perspective projection with:
- FOV: 45 degrees
- Near plane: 0.1
- Far plane: 100.0

## Adding New Gesture Translations

When adding a new gesture to `Core3DManager.translate2DTo3D()`:

1. **Analyze 2D behavior**: Does it modify velocity or position? Which axes?
2. **Choose scaling factor**: Start with 0.01 and adjust for visibility
3. **Set all three coordinates**: Always set `[x, y, z]` even if some are zero
4. **Test with debug logging**: Use console.log to verify particle values
5. **Match 2D motion**: The 3D translation should match the 2D visual behavior

Example template:

```javascript
} else if (gestureName === 'mygesture') {
    // MyGesture → describe the motion
    // Explain what particle properties are used and why
    props.position[0] = particle.x * 0.01;   // Horizontal component
    props.position[1] = particle.y * 0.01;   // Vertical component
    props.position[2] = 0;                   // No depth change
    // Optional: rotation or scale
    props.rotation[2] = particle.vx * 0.01;  // Roll based on horizontal velocity
}
```

## Common Issues

### Gesture Moves Wrong Direction

Check if the axis is inverted:
- Y-axis is often negated: `props.position[1] = -particle.y * scale`
- This accounts for different coordinate system conventions

### Gesture Too Small/Large

Adjust the scaling factor:
- Too small: Increase multiplier (0.01 → 0.05)
- Too large: Decrease multiplier (0.05 → 0.003)

### Gesture Doesn't Move At All

Check if velocity is being accumulated:
```javascript
// After gesture.apply()
virtualParticle.x += virtualParticle.vx * 2.0;
virtualParticle.y += virtualParticle.vy * 2.0;
```

Blending gestures need this accumulation step!

## Complete Gesture Translation Reference

All 20 gestures have been translated to 3D with correct coordinate mappings:

### Motion Gestures (Blending Type)

| Gesture | Position | Rotation | Scale | Description |
|---------|----------|----------|-------|-------------|
| **bounce** | `[0, vy*0.02, 0]` | `[0, 0, 0]` | `1 + |vy|*0.005` | Vertical bouncing |
| **pulse** | `[0, 0, 0]` | `[0, 0, 0]` | `1 + dist*0.01` | Radial expansion |
| **shake** | `[x*0.05, y*0.05, 0]` | `[0, 0, vx*0.01]` | `1.0` | Chaotic shaking |
| **nod** | `[0, y*0.05, 0]` | `[vy*0.02, 0, 0]` | `1.0` | Vertical nodding |
| **vibrate** | `[x*0.03, y*0.03, 0]` | `[0, 0, vx*0.005]` | `1.0` | High-frequency jitter |
| **orbit** | `[x*0.003, -y*0.003, z]` | `[0, 0, 0]` | `1.0` | Circular orbiting |
| **twitch** | `[x*0.04, y*0.04, 0]` | `[vy*0.01, vx*0.01, 0]` | `1.0` | Jerky movements |
| **sway** | `[x*0.05, y*0.02, 0]` | `[0, 0, x*0.008]` | `1.0` | Side-to-side swaying |
| **float** | `[0, -vy*0.02, (size-1)*0.3]` | `[0, 0, 0]` | `1 + (size-1)*0.2` | Upward floating |
| **jitter** | `[x*0.04, y*0.04, 0]` | `[0, 0, 0]` | `1.0` | Nervous jittery motion |
| **wiggle** | `[x*0.05, 0, 0]` | `[0, 0, 0]` | `1.0` | Horizontal side-to-side |

### Transform Gestures (Override Type)

| Gesture | Position | Rotation | Scale | Description |
|---------|----------|----------|-------|-------------|
| **spin** | `[0, 0, 0]` | `[0, angle, 0]` | `1.0` | Spinning rotation |
| **jump** | `[x*0.01, y*0.01, 0]` | `[0, 0, 0]` | `1 + (size-1)*0.3` | Vertical jumping |
| **morph** | `[0, 0, 0]` | `[0, 0, 0]` | `size` | Size morphing |
| **stretch** | `[x*0.01, y*0.01, 0]` | `[0, 0, 0]` | `1 + |vy|*0.01` | Directional stretching |
| **tilt** | `[x*0.03, 0, 0]` | `[0, 0, x*0.015]` | `1.0` | Tilting/leaning |
| **orbital** | `[cos(θ)*r*0.005, sin(θ)*r*0.005, 0]` | `[0, angle, 0]` | `1.0` | Large orbital motion |
| **hula** | `[x*0.004, y*0.004, 0]` | `[0, angle*0.5, 0]` | `1.0` | Circular hip motion |
| **scan** | `[x*0.03, 0, 0]` | `[0, x*0.01, 0]` | `1.0` | Scanning left-right |
| **twist** | `[0, 0, 0]` | `[0, progress*2π, 0]` | `1.0` | Full twisting rotation |

### Coordinate Legends

**Position variables:**
- `x`, `y` = `particle.x`, `particle.y` (accumulated position from velocity)
- `vx`, `vy` = `particle.vx`, `particle.vy` (velocity)
- `z` = `particle.z` (depth, if set)
- `size` = `particle.size` (size multiplier)
- `dist` = distance from center
- `angle` or `θ` = `Math.atan2(y, x)` (angle in radians)
- `r` = `Math.sqrt(x² + y²)` (radius)
- `progress` = gesture progress (0-1)

**Rotation axes:**
- `[pitch, yaw, roll]` or `[X, Y, Z]`
- X-axis (pitch) = nodding up/down
- Y-axis (yaw) = turning left/right
- Z-axis (roll) = tilting side-to-side

### Quick Reference: Axis Mapping

```
2D Particle → 3D Position
───────────────────────────
particle.x  → position[0]  (horizontal left-right)
particle.y  → position[1]  (vertical up-down)
particle.z  → position[2]  (depth forward-back)

Rotation Axes
──────────────
rotation[0] → X-axis (pitch - nod up/down)
rotation[1] → Y-axis (yaw - turn left/right)
rotation[2] → Z-axis (roll - tilt side/side)
```

### Scaling Strategy by Gesture Type

**Tiny movements (0.003):**
- orbit - Small circular motion

**Small movements (0.01-0.02):**
- bounce, float, jump, stretch - Controlled vertical motion
- Generic fallback

**Medium movements (0.03-0.04):**
- vibrate, twitch, jitter, tilt, scan - Moderate intensity
- hula - Circular motion

**Large movements (0.05):**
- shake, sway, wiggle, nod - High visibility motion

**Special:**
- pulse, morph - Scale-based, no position movement
- spin, twist - Pure rotation, no position movement
- orbital - Computed from radius (variable)

## Testing Gestures

To test a specific gesture translation:

```javascript
// In browser console with wiggle-test.html loaded
mascot.express('gestureName');

// Check console for particle values (if debug logging enabled)
// Observe: Does 3D motion match 2D particle behavior?
```

### Expected Behaviors

**Horizontal gestures** should move left-right:
- wiggle, sway, scan

**Vertical gestures** should move up-down:
- bounce, nod, jump, float

**Circular gestures** should move in circles:
- orbit, orbital, hula, spin (rotation only)

**Chaotic gestures** should move randomly:
- shake, vibrate, twitch, jitter

**Scale gestures** should grow/shrink:
- pulse, morph

**Complex gestures** combine multiple:
- tilt (position + rotation)
- twist (pure rotation over time)
