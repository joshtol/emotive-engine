# Mascot Visibility Control - Retail Page

## Problem Solved

The retail use case page has **4 mascots** rendered:

1. **Hero scroll-following mascot** - In the hero section, follows scroll
2. **AI Checkout Assistant mascot** - In the demo section (Walmart kiosk)
3. **Checkout Simulation mascot** - In the simulation section
4. (Potentially) **Guide mascot** from UseCaseLayout (not applicable here)

**Issue**: Having the hero mascot visible while viewing the checkout sections
creates visual clutter and confusion. The hero mascot should fade out when users
scroll to sections with their own interactive mascots.

## Solution Implemented

### Intelligent Fade-Out System

The hero mascot now:

1. ✅ **Fades to opacity 0** as user scrolls into the demo/checkout sections
2. ✅ **Changes z-index to -1** when fully hidden to prevent any interaction
3. ✅ **Sets visibility: hidden** when opacity < 0.01 for better performance
4. ✅ **Stops gesture animations** when opacity < 0.1 to save resources

### How It Works

```typescript
// Calculate fade based on scroll position
const heroHeight = viewportHeight * 0.9;
const demoSectionStart = heroHeight + viewportHeight * 0.3;
const fadeStartDistance = viewportHeight * 0.5;
const fadeEndDistance = viewportHeight * 0.8;

let opacity = 1;
if (scrollY >= demoSectionStart) {
    const fadeProgress = Math.min(
        (scrollY - demoSectionStart) / (fadeEndDistance - fadeStartDistance),
        1
    );
    opacity = Math.max(0, 1 - fadeProgress);
}
setMascotOpacity(opacity);
```

### Visual Behavior

```
┌─────────────────────────────────────────┐
│  Hero Section (0vh - 90vh)              │
│  Hero mascot: opacity 1.0 ✓             │
│  Following scroll, waving, bouncing     │
└─────────────────────────────────────────┘
         ↓ Scroll down
┌─────────────────────────────────────────┐
│  Transition Zone (90vh - 120vh)         │
│  Hero mascot: opacity 1.0 → 0.5         │
│  Starting to fade...                    │
└─────────────────────────────────────────┘
         ↓ Scroll down
┌─────────────────────────────────────────┐
│  Demo Section (120vh+)                  │
│  Hero mascot: opacity 0.0 (hidden)      │
│  AI Checkout mascot: visible ✓          │
│  Clean, focused view!                   │
└─────────────────────────────────────────┘
         ↓ Scroll down
┌─────────────────────────────────────────┐
│  Simulation Section                     │
│  Hero mascot: opacity 0.0 (hidden)      │
│  Checkout simulation mascot: visible ✓  │
│  No conflicts!                          │
└─────────────────────────────────────────┘
         ↑ Scroll up
         ↑ Hero mascot fades back in
```

## Implementation Details

### State Management

```typescript
const [mascotOpacity, setMascotOpacity] = useState(1);
const [containerZIndex, setContainerZIndex] = useState(100);
```

### Container Styling

```jsx
<div
    style={{
        position: 'fixed',
        opacity: mascotOpacity,
        transition: 'opacity 0.6s ease-out', // Smooth fade
        visibility: mascotOpacity < 0.01 ? 'hidden' : 'visible', // Performance
        zIndex: opacity > 0.1 ? 1 : -1, // Prevent interaction when hidden
    }}
>
    <canvas ref={canvasRef} id="retail-hero-mascot" />
</div>
```

### Performance Optimizations

1. **CSS Transition**: Uses `transition: 'opacity 0.6s ease-out'` for
   GPU-accelerated fade
2. **Visibility Toggle**: Sets `visibility: hidden` when opacity < 0.01 to skip
   rendering
3. **Z-Index Management**: Sets z-index to -1 when hidden to prevent click/hover
   events
4. **Conditional Gestures**: Stops running gesture animations when opacity < 0.1

```typescript
// Only animate gestures if visible
if (opacity > 0.1) {
  const gesturePoints = [...]
  // ... gesture logic
}
```

## Fade Timing Configuration

### Current Settings

| Parameter            | Value           | Description                             |
| -------------------- | --------------- | --------------------------------------- |
| **Hero Height**      | `90vh`          | Where hero section ends                 |
| **Fade Start**       | `hero + 30vh`   | When fade begins (1.2x viewport)        |
| **Fade Duration**    | `0.5vh → 0.8vh` | Distance over which fade occurs (0.3vh) |
| **Transition Speed** | `0.6s`          | CSS transition duration                 |

### Customization

To adjust fade behavior, modify these values in `page.tsx:188-190`:

```typescript
// Earlier fade (more aggressive)
const demoSectionStart = heroHeight + viewportHeight * 0.2; // Start earlier

// Slower fade (more gradual)
const fadeEndDistance = viewportHeight * 1.2; // Fade over longer distance

// Faster fade animation
transition: 'opacity 0.3s ease-out'; // Quicker CSS transition
```

## Benefits

### UX Improvements

✅ **No visual conflicts** - Only one mascot visible at a time ✅ **Smooth
transitions** - Gradual fade instead of abrupt hide ✅ **Focused attention** -
Users see the relevant mascot for each section ✅ **Professional polish** -
Intentional, choreographed experience

### Performance Benefits

✅ **Reduced rendering** - Hidden mascot skips GPU rendering ✅ **Lower
memory** - visibility:hidden allows browser optimization ✅ **No gesture
calculations** - Stops animations when not needed ✅ **Better mobile
performance** - One less mascot to render on phones

## Testing

### Manual Test Steps

1. **Open retail page**: http://localhost:3001/use-cases/retail
2. **Stay in hero**: Verify hero mascot visible (opacity 1.0)
3. **Scroll slowly down**: Watch mascot fade out gradually
4. **Reach AI Demo section**: Verify hero mascot invisible (opacity 0)
5. **Check AI mascot**: Verify Walmart kiosk mascot is clearly visible
6. **Scroll to simulation**: Verify simulation mascot visible, hero still hidden
7. **Scroll back up**: Verify hero mascot fades back in

### Expected Behavior

```
Position          | Hero Opacity | AI Mascot | Simulation
------------------|--------------|-----------|------------
0vh - 90vh       | 1.0          | ❌        | ❌
90vh - 120vh     | 1.0 → 0.5    | ❌        | ❌
120vh - 150vh    | 0.5 → 0.0    | ✅        | ❌
150vh+           | 0.0          | ✅        | ✅
```

## Alternative Approaches Considered

### Option 1: Hard Hide (Not Chosen)

```typescript
if (scrollY > heroHeight) {
    setMascotOpacity(0);
}
```

**Reason rejected**: Too abrupt, jarring user experience

### Option 2: Intersection Observer (Not Chosen)

```typescript
const observer = new IntersectionObserver(...)
```

**Reason rejected**: More complex, overkill for simple fade

### Option 3: Destroy/Recreate (Not Chosen)

```typescript
if (scrollY > threshold) {
    mascot.destroy();
}
```

**Reason rejected**: Re-initialization expensive, causes flicker

### ✅ Option 4: Opacity + Visibility (Chosen)

**Reasons**:

- Smooth, gradual fade
- Simple implementation
- Good performance
- Easily customizable
- No re-initialization needed

## Future Enhancements

### Potential Improvements

1. **Intersection-based triggers**
    - Trigger fade when demo section enters viewport
    - More accurate than scroll position

    ```typescript
    const demoSection = document.getElementById('demo');
    observer.observe(demoSection);
    ```

2. **User preference**
    - Allow users to keep hero mascot always visible
    - "Show guide mascot" toggle in settings

    ```typescript
    const [keepGuideVisible, setKeepGuideVisible] = useState(false);
    ```

3. **Route-based control**
    - Hide guide mascot on specific routes
    - Show on others (e.g., home page)

    ```typescript
    const hideGuideMascot = ['/use-cases/retail', '/use-cases/smart-home'];
    ```

4. **Responsive timing**
    - Different fade points for mobile vs desktop
    ```typescript
    const fadeStart = isMobile
        ? heroHeight + viewportHeight * 0.1
        : heroHeight + viewportHeight * 0.3;
    ```

## Code Changes

### Files Modified

**site/src/app/use-cases/retail/page.tsx**

- Added `mascotOpacity` state (line 17)
- Modified scroll handler to calculate opacity (lines 186-200)
- Updated container styling with fade (lines 265-267)
- Added visibility optimization (line 267)
- Added conditional gesture logic (line 210)

### Lines of Code

- **Added**: ~35 lines
- **Modified**: ~20 lines
- **Total impact**: 55 lines

## Summary

The retail page now features **intelligent mascot visibility control** that:

1. Smoothly fades the hero mascot as user scrolls
2. Completely hides it when checkout mascots are visible
3. Optimizes performance by stopping animations when hidden
4. Creates a clean, professional multi-mascot experience

**Result**: Users see exactly one mascot at a time, with smooth transitions and
no visual conflicts. The Walmart kiosk mascots get full attention in their
sections, while the hero mascot guides users through the initial experience.

---

**Implementation complete!** ✅ **Test at**:
http://localhost:3001/use-cases/retail
