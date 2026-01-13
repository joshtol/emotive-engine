# TODO

## Bugs

### 3D Demo: Auto-Rotate Toggle Race Condition

**File:** `site/public/examples/3d/3d-demo.html` (and possibly other 3D demos)

**Issue:** `setupVisualToggles(mascot)` is called synchronously at module load
time, but `mascot` is still `null` because it's initialized inside an async
IIFE. The toggle handlers capture a null reference.

**Code:**

```javascript
// Lines 270-272 - called synchronously while mascot is null
setupWobbleToggle(mascot);
setupParticlesToggle(mascot);
setupVisualToggles(mascot);

// But mascot is set asynchronously:
(async () => {
    mascot = new EmotiveMascot3D({...});
    // ...
})();
```

**Fix options:**

1. Move setup calls inside the async IIFE after mascot initialization
2. Make setup functions accept a getter function instead of direct reference
3. Use event delegation that checks mascot at click time (demo-utils.js already
   does this, but the reference is stale)

**Affected demos:** Check all demos in `examples/3d/` and
`site/public/examples/3d/` that use `setupVisualToggles()`.
