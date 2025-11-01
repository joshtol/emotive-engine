# 🧪 Quick Test Script

Open your browser console in `directional-test-suite.html` and run these tests:

## Test 1: Pure PBR (Should work - default state)

```javascript
mascot.setRenderLayers({
    base: 1,
    overlay: 0,
    overlayBlend: 0,
    effectFlags: 0,
});
```

**Expected:** Realistic gem with specular highlights

## Test 2: Add Normals Overlay (50% blend)

```javascript
mascot.setRenderLayers({ base: 1, overlay: 1, overlayBlend: 0.5 });
```

**Expected:** PBR with rainbow shimmer (holographic!)

## Test 3: Pure Normals (100% blend)

```javascript
mascot.setOverlayBlend(1.0);
```

**Expected:** Full rainbow, no PBR

## Test 4: Add Edges

```javascript
mascot.setRenderLayers({ effectFlags: 0x1 });
```

**Expected:** Rainbow + white edge highlighting

## Test 5: Eclipse Mode

```javascript
mascot.setRenderLayers({
    base: 0,
    overlay: 0,
    overlayBlend: 0,
    effectFlags: 0x1,
});
```

**Expected:** Black with white edges only

## Test 6: Ultimate Crystal

```javascript
mascot.setRenderLayers({
    base: 1,
    overlay: 1,
    overlayBlend: 0.4,
    effectFlags: 0x3,
});
mascot.setWireframe(true);
```

**Expected:** PBR + rainbow + edges + rim + wireframe!

## Test 7: Smooth Blend Animation

```javascript
// Animate from 0% to 100% overlay
let blend = 0;
setInterval(() => {
    blend = (blend + 0.01) % 1.0;
    mascot.setOverlayBlend(blend);
}, 50);
```

**Expected:** Smooth morph between PBR and rainbow

## Test 8: Neon Mode

```javascript
mascot.setRenderLayers({
    base: 3,
    overlay: 1,
    overlayBlend: 0.8,
    effectFlags: 0x1,
});
```

**Expected:** Vibrant colors with glowing edges
