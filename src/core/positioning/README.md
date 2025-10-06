# 🎯 Positioning System

The Emotive Engine's modular positioning system provides dynamic mascot
targeting capabilities.

## 📁 Architecture

```
src/core/positioning/
├── elementTargeting/     # Advanced DOM element targeting system
│   ├── ElementTargeting.js              # Core targeting functionality
│   ├── ElementTargetingCallbacks.js     # Callback-based targeting
│   ├── ElementTargetingAdvanced.js      # Advanced features (paths, easing, collision)
│   ├── ElementTargetingContext.js       # Context-aware targeting (scroll, physics)
│   ├── ElementTargetingInteractions.js  # Interactive targeting (mouse, touch, keyboard)
│   ├── ElementTargetingAnimations.js    # Animated targeting (bounce, shake, pulse)
│   ├── ElementTargetingEffects.js       # Visual effects (trails, particles, glow)
│   ├── ElementTargetingAccessibility.js # Accessibility features
│   ├── index.js                         # Element targeting exports
│   └── README.md                        # Element targeting documentation
├── InputTracking.js      # User input tracking (mouse, touch, audio)
├── Physics.js           # Physics-based movement (gravity, magnetism)
├── Animation.js         # Animation-based positioning (paths, time)
├── Responsive.js        # Responsive positioning (breakpoints, accessibility)
├── index.js             # Main orchestrator
└── README.md            # This file
```

## 🚀 Quick Start

### Basic Positioning

```javascript
// Get positioning system
const positioning = mascot.positionController.getPositioning();

// Move mascot to the right of a button
positioning.call('moveToElement', '.try-demo-button', 'right', { x: 20, y: 0 });

// Watch an element and follow it
const cleanup = positioning.call('watchElement', '.checkout-button', 'right', {
    x: 20,
    y: 0,
});
// Later: cleanup(); // Stop watching
```

### Advanced Element Targeting

```javascript
// Get the advanced element targeting system
const elementTargeting = mascot.positionController.getElementTargeting();

// Move to element with callback
elementTargeting.moveToElementWithCallback(
    '.button',
    () => {
        console.log('Mascot reached the button!');
        mascot.setEmotion('joy');
        mascot.express('nod');
    },
    'right',
    { x: 20, y: 0 }
);

// Move with bounce animation
elementTargeting.moveToElementWithBounce('.target', {
    duration: 1000,
    intensity: 50,
    bounces: 3,
});

// Move with visual effects
elementTargeting.moveToElementWithTrail('.destination', {
    color: '#00ff88',
    width: 3,
    opacity: 0.8,
});
```

## 📋 Available Methods

### Element Targeting (Basic)

- `moveToElement(targetSelector, position, offset)` - Move to any element
- `moveToButton(selector, position, offset)` - Move to button elements
- `moveToForm(selector, position, offset)` - Move to form elements
- `moveToModal(selector, position, offset)` - Move to modal elements
- `moveToNavigation(selector, position, offset)` - Move to navigation
- `moveToContent(selector, position, offset)` - Move to content areas
- `moveToSidebar(selector, position, offset)` - Move to sidebar
- `moveToHeader(selector, position, offset)` - Move to header
- `moveToFooter(selector, position, offset)` - Move to footer
- `watchElement(targetSelector, position, offset)` - Watch and follow element

### Advanced Element Targeting

Access via `mascot.positionController.getElementTargeting()`:

#### Callback-Based Targeting

- `moveToElementWithCallback(selector, callback, position, offset)` - Execute
  callback when reached
- `moveToElementSequence(sequence, options)` - Move through sequence of elements
- `moveToElementWithDelay(selector, callback, delay, position, offset)` -
  Delayed callback
- `moveToElementWithCondition(selector, condition, callback, position, offset)` -
  Conditional callback
- `moveToElementWithRepeat(selector, callback, interval, position, offset)` -
  Repeating callback
- `moveToElementWithProximity(selector, callback, proximity, position, offset)` -
  Proximity-based callback

#### Advanced Features

- `moveToElementWithPath(selector, pathPoints, position, offset)` - Follow
  custom path
- `moveToElementWithEasing(selector, easingFunction, duration, position, offset)` -
  Custom easing
- `moveToElementWithCollision(selector, obstacles, avoidanceDistance, position, offset)` -
  Avoid obstacles
- `moveToElementWithAudio(selector, audioStream, sensitivity, position, offset)` -
  Audio-reactive
- `moveToElementWithGaze(selector, gazeOptions, position, offset)` - Gaze
  tracking

#### Context-Aware Targeting

- `moveToElementWithScroll(selector, scrollOptions, position, offset)` -
  Scroll-based movement
- `moveToElementWithPhysics(selector, physicsOptions, position, offset)` -
  Physics simulation
- `moveToElementWithGroup(elementSelectors, position, offset)` - Multiple
  elements
- `moveToElementWithResponsive(selector, responsiveOptions, position, offset)` -
  Responsive behavior
- `moveToElementWithAccessibility(selector, accessibilityOptions, position, offset)` -
  Accessibility features

#### Interactive Targeting

- `moveToElementWithHover(selector, hoverOptions, position, offset)` - Mouse
  hover tracking
- `moveToElementWithClick(selector, clickOptions, position, offset)` - Click
  tracking
- `moveToElementWithTouch(selector, touchOptions, position, offset)` - Touch
  gesture tracking
- `moveToElementWithFocus(selector, focusOptions, position, offset)` - Focus
  event tracking
- `moveToElementWithKeyboard(selector, keyboardOptions, position, offset)` -
  Keyboard event tracking

#### Animated Targeting

- `moveToElementWithBounce(selector, bounceOptions, position, offset)` - Bounce
  animation
- `moveToElementWithShake(selector, shakeOptions, position, offset)` - Shake
  animation
- `moveToElementWithPulse(selector, pulseOptions, position, offset)` - Pulse
  animation
- `moveToElementWithWiggle(selector, wiggleOptions, position, offset)` - Wiggle
  animation
- `moveToElementWithCustom(selector, animationFunction, animationOptions, position, offset)` -
  Custom animation

#### Visual Effects

- `moveToElementWithTrail(selector, trailOptions, position, offset)` - Trail
  effect
- `moveToElementWithParticles(selector, particleOptions, position, offset)` -
  Particle effect
- `moveToElementWithGlow(selector, glowOptions, position, offset)` - Glow effect

#### Accessibility Features

- `moveToElementWithScreenReader(selector, screenReaderOptions, position, offset)` -
  Screen reader support
- `moveToElementWithKeyboard(selector, keyboardOptions, position, offset)` -
  Keyboard navigation
- `moveToElementWithHighContrast(selector, contrastOptions, position, offset)` -
  High contrast mode
- `moveToElementWithReducedMotion(selector, motionOptions, position, offset)` -
  Reduced motion support
- `announceToScreenReader(message)` - Announce to screen reader
- `navigateFocus(direction)` - Navigate focus order
- `enableAccessibility(options)` - Enable accessibility features

### Input Tracking

- `moveToMouse(offset, options)` - Follow mouse cursor
- `moveToTouch(offset, options)` - Follow touch position
- `moveToAudio(level, sensitivity, options)` - React to audio levels
- `moveToViewport(position, offset)` - Position relative to viewport

### Physics

- `moveToGrid(x, y, offset, options)` - Snap to grid position
- `moveToGravity(center, strength, options)` - Apply gravity effect
- `moveToMagnetic(targets, strength, options)` - Magnetic attraction
- `moveToAvoid(obstacles, distance, options)` - Avoid obstacles
- `moveToRandom(bounds, frequency, options)` - Random movement

### Animation

- `moveToPath(points, speed, options)` - Follow a path
- `moveToTime(duration, easing, options)` - Time-based movement
- `moveToScroll(progress, offset, options)` - Scroll-based positioning
- `animateTo(x, y, duration, easing)` - Animate to coordinates

### Responsive

- `moveToResponsive(breakpoints, options)` - Responsive positioning
- `moveToGroup(elements, position, offset)` - Position relative to group
- `moveToAccessibility(announcements, position, options)` -
  Accessibility-friendly positioning

## 🎨 Position Options

**Position values:**

- `'right'` - To the right of element
- `'left'` - To the left of element
- `'above'` - Above element
- `'below'` - Below element
- `'center'` - Center of element

**Offset format:**

```javascript
{ x: 20, y: 0 }  // 20px right, 0px vertical
```

## 🔧 Advanced Usage

### Watching Elements

```javascript
// Watch an element and update position when it moves
const cleanup = positioning.call('watchElement', '.dynamic-button', 'right', {
    x: 20,
    y: 0,
});

// Stop watching
cleanup();
```

### Responsive Positioning

```javascript
positioning.call('moveToResponsive', {
    mobile: { x: 100, y: 100 },
    tablet: { x: 200, y: 150 },
    desktop: { x: 300, y: 200 },
});
```

### Physics Effects

```javascript
// Apply gravity to center of screen
positioning.call('moveToGravity', { x: 0, y: 0 }, 0.1);

// Magnetic attraction to multiple buttons
positioning.call('moveToMagnetic', ['.btn1', '.btn2', '.btn3'], 0.05);
```

### Path Following

```javascript
// Follow a path of points
positioning.call(
    'moveToPath',
    [
        { x: 100, y: 100 },
        { x: 200, y: 150 },
        { x: 300, y: 100 },
    ],
    1
); // 1 point per second
```

## 🎯 Use Cases

### Tutorials

```javascript
// Guide user to next step
positioning.call('moveToElement', '.next-step-button', 'right', {
    x: 20,
    y: 0,
});
```

### Checkout Flow

```javascript
// Follow checkout progress
positioning.call('watchElement', '.checkout-step.active', 'right', {
    x: 20,
    y: 0,
});
```

### Interactive Elements

```javascript
// Follow mouse for interactive feedback
positioning.call('moveToMouse', { x: 20, y: 20 });
```

### Accessibility

```javascript
// Position for screen readers
positioning.call(
    'moveToAccessibility',
    [
        {
            text: 'Mascot is now positioned near the submit button',
            condition: () => true,
        },
    ],
    'bottom-right'
);
```

## 🛠️ Development

### Adding New Methods

1. Add method to appropriate module (e.g., `ElementTargeting.js`)
2. Register method in `index.js` `registerMethods()` function
3. Update this README with new method documentation

### Module Structure

Each module follows this pattern:

```javascript
class ModuleName {
    constructor(positionController) {
        this.positionController = positionController;
        // Initialize module
    }

    methodName(params) {
        // Implementation
        return cleanupFunction; // Optional
    }

    destroy() {
        // Cleanup
    }
}
```

## 🐛 Troubleshooting

### Element Not Found

```javascript
// Check if element exists
const element = document.querySelector('.my-element');
if (!element) {
    console.warn('Element not found: .my-element');
}
```

### Performance Issues

- Use `watchElement` sparingly
- Call `cleanup()` when done
- Avoid too many simultaneous positioning methods

### Responsive Issues

- Test on different screen sizes
- Use `moveToResponsive` for breakpoint-specific positioning
- Check viewport dimensions

## 📚 Examples

### Tutorial Flow

```javascript
const elementTargeting = mascot.positionController.getElementTargeting();

// Guide user through tutorial steps
const tutorialSequence = [
    {
        selector: '.step-1',
        callback: () => mascot.setEmotion('neutral'),
        delay: 1000,
    },
    {
        selector: '.step-2',
        callback: () => mascot.setEmotion('excited'),
        delay: 1000,
    },
    {
        selector: '.step-3',
        callback: () => mascot.setEmotion('joy'),
        delay: 1000,
    },
];

elementTargeting.moveToElementSequence(tutorialSequence, {
    onComplete: () => {
        mascot.setEmotion('euphoria');
        mascot.express('celebrate');
    },
});
```

### Interactive Button Feedback

```javascript
// Move to button with hover effects
elementTargeting.moveToElementWithHover('.interactive-button', {
    onMouseEnter: () => {
        mascot.setEmotion('excited');
        mascot.express('wave');
    },
    onMouseLeave: () => {
        mascot.setEmotion('neutral');
    },
    followMouse: true,
    hoverDistance: 100,
});

// Move to button with click feedback
elementTargeting.moveToElementWithClick('.clickable-button', {
    onClick: (event, clickCount) => {
        if (clickCount === 1) {
            mascot.setEmotion('joy');
            mascot.express('nod');
        } else if (clickCount === 2) {
            mascot.setEmotion('euphoria');
            mascot.express('celebrate');
        }
    },
    maxClicks: 3,
});
```

### Accessibility-First Design

```javascript
// Enable accessibility features
elementTargeting.enableAccessibility({
    screenReader: true,
    keyboardNavigation: true,
    reducedMotion: true,
});

// Move with screen reader announcements
elementTargeting.moveToElementWithScreenReader('.important-action', {
    announce: true,
    announcement: 'Mascot is now positioned near the important action button',
    role: 'button',
    label: 'Perform important action',
});

// Move with keyboard navigation support
elementTargeting.moveToElementWithKeyboard('.keyboard-accessible', {
    onEnter: () => mascot.express('nod'),
    onEscape: () => mascot.express('wave'),
    targetKeys: ['Enter', 'Space', 'Escape'],
});
```

### Visual Effects for Engagement

```javascript
// Move with trail effect for eye-catching movement
elementTargeting.moveToElementWithTrail('.destination', {
    color: '#ff6b9d',
    width: 5,
    opacity: 0.9,
    fadeSpeed: 0.95,
});

// Move with particle burst effect
elementTargeting.moveToElementWithParticles('.celebration-target', {
    count: 30,
    color: '#00ff88',
    size: 3,
    speed: 3,
    life: 1500,
});

// Move with glow effect for emphasis
elementTargeting.moveToElementWithGlow('.highlighted-element', {
    color: '#ffd700',
    intensity: 75,
    radius: 120,
});
```

### Responsive Design

```javascript
// Move with responsive behavior
elementTargeting.moveToElementWithResponsive('.responsive-element', {
    mobile: { offsetX: 50, offsetY: 0 },
    tablet: { offsetX: 100, offsetY: 0 },
    desktop: { offsetX: 150, offsetY: 0 },
});

// Move to group of elements
elementTargeting.moveToElementWithGroup(
    ['.element-1', '.element-2', '.element-3'],
    'center',
    { x: 0, y: 0 }
);
```

## 📖 Documentation

- **Element Targeting System**: See
  `src/core/positioning/elementTargeting/README.md` for comprehensive
  documentation
- **Development Guide**: See `DEVELOPMENT.md` for more examples and integration
  patterns
- **API Reference**: See individual module files for complete API documentation

---

_Part of the Emotive Engine - AI Communication without Uncanny Valley_
