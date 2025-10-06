# Element Targeting System

The Element Targeting system provides comprehensive DOM element targeting
capabilities for the Emotive Engine mascot. This modular system allows the
mascot to intelligently position itself relative to DOM elements with advanced
features like callbacks, animations, effects, and accessibility support.

## Overview

The Element Targeting system is organized into specialized modules, each
handling specific aspects of element targeting:

- **ElementTargeting.js** - Core targeting functionality
- **ElementTargetingCallbacks.js** - Callback-based targeting with sequences and
  conditions
- **ElementTargetingAdvanced.js** - Advanced features like path following,
  easing, and collision detection
- **ElementTargetingContext.js** - Context-aware targeting with scroll, physics,
  and responsive behavior
- **ElementTargetingInteractions.js** - Interactive targeting with mouse, touch,
  and keyboard events
- **ElementTargetingAnimations.js** - Animated targeting with bounce, shake,
  pulse, and custom animations
- **ElementTargetingEffects.js** - Visual effects like trails, particles, and
  glow effects
- **ElementTargetingAccessibility.js** - Accessibility features including screen
  reader support and keyboard navigation

## Quick Start

```javascript
// Get the element targeting system
const elementTargeting = mascot.positionController.getElementTargeting();

// Basic element targeting
elementTargeting.moveToElement('.button', 'right', { x: 20, y: 0 });

// With callback
elementTargeting.moveToElementWithCallback(
    '.button',
    () => {
        console.log('Mascot reached the button!');
    },
    'right',
    { x: 20, y: 0 }
);

// With animation
elementTargeting.moveToElementWithBounce('.button', {
    duration: 1000,
    intensity: 50,
});

// With effects
elementTargeting.moveToElementWithTrail('.button', {
    color: '#00ff88',
    width: 3,
});
```

## Core Methods

### Basic Element Targeting

```javascript
// Move to element with position and offset
moveToElement(selector, position, offset, options);

// Watch element and follow its movements
watchElement(selector, position, offset, options);

// Stop watching all elements
stopWatchingAll();
```

### Callback-Based Targeting

```javascript
// Move to element and execute callback when reached
moveToElementWithCallback(selector, callback, position, offset, options);

// Move through a sequence of elements with callbacks
moveToElementSequence(sequence, options);

// Move to element with delay before callback
moveToElementWithDelay(selector, callback, delay, position, offset);

// Move to element with conditional callback
moveToElementWithCondition(selector, condition, callback, position, offset);

// Move to element with repeating callback
moveToElementWithRepeat(selector, callback, interval, position, offset);

// Move to element with proximity-based callback
moveToElementWithProximity(selector, callback, proximity, position, offset);
```

### Advanced Targeting

```javascript
// Move to element following a custom path
moveToElementWithPath(selector, pathPoints, position, offset, options);

// Move to element with custom easing
moveToElementWithEasing(selector, easingFunction, duration, position, offset);

// Move to element while avoiding obstacles
moveToElementWithCollision(
    selector,
    obstacles,
    avoidanceDistance,
    position,
    offset
);

// Move to element with audio-reactive movement
moveToElementWithAudio(selector, audioStream, sensitivity, position, offset);

// Move to element following user's gaze
moveToElementWithGaze(selector, gazeOptions, position, offset);
```

### Context-Aware Targeting

```javascript
// Move to element with scroll-based movement
moveToElementWithScroll(selector, scrollOptions, position, offset);

// Move to element with physics-based movement
moveToElementWithPhysics(selector, physicsOptions, position, offset);

// Move to center of multiple elements
moveToElementWithGroup(elementSelectors, position, offset);

// Move to element with responsive behavior
moveToElementWithResponsive(selector, responsiveOptions, position, offset);

// Move to element with accessibility features
moveToElementWithAccessibility(
    selector,
    accessibilityOptions,
    position,
    offset
);
```

### Interactive Targeting

```javascript
// Move to element and follow mouse hover
moveToElementWithHover(selector, hoverOptions, position, offset);

// Move to element and track clicks
moveToElementWithClick(selector, clickOptions, position, offset);

// Move to element and track touch gestures
moveToElementWithTouch(selector, touchOptions, position, offset);

// Move to element and track focus events
moveToElementWithFocus(selector, focusOptions, position, offset);

// Move to element and track keyboard events
moveToElementWithKeyboard(selector, keyboardOptions, position, offset);
```

### Animated Targeting

```javascript
// Move to element with bounce animation
moveToElementWithBounce(selector, bounceOptions, position, offset);

// Move to element with shake animation
moveToElementWithShake(selector, shakeOptions, position, offset);

// Move to element with pulse animation
moveToElementWithPulse(selector, pulseOptions, position, offset);

// Move to element with wiggle animation
moveToElementWithWiggle(selector, wiggleOptions, position, offset);

// Move to element with custom animation
moveToElementWithCustom(
    selector,
    animationFunction,
    animationOptions,
    position,
    offset
);
```

### Visual Effects

```javascript
// Move to element with trail effect
moveToElementWithTrail(selector, trailOptions, position, offset);

// Move to element with particle effect
moveToElementWithParticles(selector, particleOptions, position, offset);

// Move to element with glow effect
moveToElementWithGlow(selector, glowOptions, position, offset);
```

### Accessibility Features

```javascript
// Move to element with screen reader support
moveToElementWithScreenReader(selector, screenReaderOptions, position, offset);

// Move to element with keyboard navigation
moveToElementWithKeyboard(selector, keyboardOptions, position, offset);

// Move to element with high contrast mode
moveToElementWithHighContrast(selector, contrastOptions, position, offset);

// Move to element with reduced motion support
moveToElementWithReducedMotion(selector, motionOptions, position, offset);

// Move to element with focus management
moveToElementWithFocus(selector, focusOptions, position, offset);

// Announce message to screen reader
announceToScreenReader(message);

// Navigate focus order
navigateFocus(direction);

// Enable/disable accessibility features
enableAccessibility(options);
disableAccessibility(options);
```

## Position Options

### Position Values

- `'left'` - Position to the left of the element
- `'right'` - Position to the right of the element
- `'top'` - Position above the element
- `'bottom'` - Position below the element
- `'center'` - Position at the center of the element

### Offset Object

```javascript
{
    x: 20,  // Horizontal offset in pixels
    y: 0    // Vertical offset in pixels
}
```

## Configuration Options

### Callback Options

```javascript
{
    onComplete: () => {},      // Called when animation completes
    onStart: () => {},         // Called when animation starts
    onProgress: (progress) => {}, // Called during animation progress
    repeat: false,             // Whether to repeat the callback
    proximity: 50              // Proximity threshold in pixels
}
```

### Animation Options

```javascript
{
    duration: 1000,            // Animation duration in milliseconds
    intensity: 50,             // Animation intensity
    bounces: 3,                // Number of bounces
    frequency: 20,             // Animation frequency
    easing: 'easeOutCubic'     // Easing function
}
```

### Effect Options

```javascript
{
    color: '#00ff88',          // Effect color
    width: 3,                  // Effect width
    opacity: 0.8,              // Effect opacity
    intensity: 50,             // Effect intensity
    radius: 100                // Effect radius
}
```

### Accessibility Options

```javascript
{
    screenReader: true,        // Enable screen reader support
    keyboardNavigation: true,  // Enable keyboard navigation
    highContrast: false,       // Enable high contrast mode
    reducedMotion: false,      // Respect reduced motion preference
    announcements: true        // Enable announcements
}
```

## Examples

### Basic Usage

```javascript
const elementTargeting = mascot.positionController.getElementTargeting();

// Move to a button
elementTargeting.moveToElement('.submit-button', 'right', { x: 20, y: 0 });

// Move to a form with callback
elementTargeting.moveToElementWithCallback(
    '.contact-form',
    () => {
        mascot.setEmotion('excited');
        mascot.express('nod');
    },
    'bottom',
    { x: 0, y: 20 }
);
```

### Advanced Usage

```javascript
// Move through a sequence of elements
const sequence = [
    { selector: '.step-1', callback: () => console.log('Step 1'), delay: 500 },
    { selector: '.step-2', callback: () => console.log('Step 2'), delay: 500 },
    { selector: '.step-3', callback: () => console.log('Step 3'), delay: 500 },
];

elementTargeting.moveToElementSequence(sequence, {
    onComplete: () => console.log('Sequence complete!'),
});

// Move with physics simulation
elementTargeting.moveToElementWithPhysics('.target', {
    mass: 1,
    damping: 0.98,
    springConstant: 0.1,
    maxVelocity: 10,
});

// Move with visual effects
elementTargeting.moveToElementWithTrail('.destination', {
    color: '#ff6b9d',
    width: 5,
    opacity: 0.9,
    fadeSpeed: 0.95,
});
```

### Accessibility Usage

```javascript
// Enable accessibility features
elementTargeting.enableAccessibility({
    screenReader: true,
    keyboardNavigation: true,
    reducedMotion: true,
});

// Move with screen reader support
elementTargeting.moveToElementWithScreenReader('.important-button', {
    announce: true,
    announcement: 'Mascot moved to important button',
    role: 'button',
    label: 'Submit form',
});

// Move with reduced motion support
elementTargeting.moveToElementWithReducedMotion('.target', {
    instant: true,
});
```

## Integration with PositionController

The Element Targeting system is automatically available through the
PositionController:

```javascript
// Get the element targeting system
const elementTargeting = mascot.positionController.getElementTargeting();

// Use any of the targeting methods
elementTargeting.moveToElementWithCallback(
    '.button',
    () => {
        mascot.setEmotion('joy');
        mascot.express('wave');
    },
    'right',
    { x: 20, y: 0 }
);
```

## Best Practices

1. **Use appropriate positioning**: Choose the right position ('left', 'right',
   'top', 'bottom', 'center') based on your UI layout
2. **Set reasonable offsets**: Use offsets to prevent the mascot from
   overlapping with UI elements
3. **Handle callbacks gracefully**: Always provide meaningful callback functions
   for better user experience
4. **Consider accessibility**: Enable accessibility features for users with
   disabilities
5. **Optimize performance**: Use appropriate animation durations and effects to
   maintain smooth performance
6. **Clean up resources**: Call cleanup functions when done to prevent memory
   leaks

## Troubleshooting

### Common Issues

1. **Element not found**: Ensure the CSS selector is correct and the element
   exists in the DOM
2. **Animation not smooth**: Check if the animation duration is appropriate and
   if there are performance issues
3. **Callback not firing**: Verify that the proximity threshold is appropriate
   and the mascot can reach the element
4. **Accessibility not working**: Ensure accessibility features are enabled and
   the browser supports the required APIs

### Debug Mode

Enable debug logging by setting the debug flag:

```javascript
elementTargeting.debug = true;
```

This will log detailed information about targeting operations to the console.

## API Reference

For complete API documentation, see the individual module files:

- [ElementTargeting.js](./ElementTargeting.js)
- [ElementTargetingCallbacks.js](./ElementTargetingCallbacks.js)
- [ElementTargetingAdvanced.js](./ElementTargetingAdvanced.js)
- [ElementTargetingContext.js](./ElementTargetingContext.js)
- [ElementTargetingInteractions.js](./ElementTargetingInteractions.js)
- [ElementTargetingAnimations.js](./ElementTargetingAnimations.js)
- [ElementTargetingEffects.js](./ElementTargetingEffects.js)
- [ElementTargetingAccessibility.js](./ElementTargetingAccessibility.js)
