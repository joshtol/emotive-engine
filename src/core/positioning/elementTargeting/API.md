# Element Targeting API Reference

Complete API documentation for the Element Targeting system.

## Core Classes

### ElementTargeting

Base class providing core element targeting functionality.

#### Constructor

```javascript
constructor(positionController);
```

#### Methods

##### moveToElement(selector, position, offset, options)

Move mascot to a DOM element.

**Parameters:**

- `selector` (string): CSS selector for target element
- `position` (string): Position relative to element ('left', 'right', 'top',
  'bottom', 'center')
- `offset` (object): Pixel offset {x, y}
- `options` (object): Additional options

**Returns:** void

**Example:**

```javascript
elementTargeting.moveToElement('.button', 'right', { x: 20, y: 0 });
```

##### watchElement(selector, position, offset, options)

Watch an element and update mascot position when it moves.

**Parameters:**

- `selector` (string): CSS selector for target element
- `position` (string): Position relative to element
- `offset` (object): Pixel offset {x, y}
- `options` (object): Additional options

**Returns:** Function - Cleanup function to stop watching

**Example:**

```javascript
const cleanup = elementTargeting.watchElement('.draggable', 'right', {
    x: 20,
    y: 0,
});
// Later: cleanup();
```

##### stopWatchingAll()

Stop watching all elements.

**Returns:** void

### ElementTargetingCallbacks

Provides callback-based element targeting.

#### Methods

##### moveToElementWithCallback(selector, callback, position, offset, options)

Move to element and execute callback when reached.

**Parameters:**

- `selector` (string): CSS selector for target element
- `callback` (function): Callback to execute when reached
- `position` (string): Position relative to element
- `offset` (object): Pixel offset {x, y}
- `options` (object): Options including proximity, repeat, etc.

**Returns:** Function - Cleanup function

**Example:**

```javascript
const cleanup = elementTargeting.moveToElementWithCallback(
    '.button',
    () => {
        console.log('Reached button!');
    },
    'right',
    { x: 20, y: 0 }
);
```

##### moveToElementSequence(sequence, options)

Move through a sequence of elements with callbacks.

**Parameters:**

- `sequence` (array): Array of {selector, callback, position, offset, delay}
  objects
- `options` (object): Sequence options

**Returns:** Function - Cleanup function

**Example:**

```javascript
const sequence = [
    { selector: '.step-1', callback: () => console.log('Step 1'), delay: 500 },
    { selector: '.step-2', callback: () => console.log('Step 2'), delay: 500 },
];
elementTargeting.moveToElementSequence(sequence);
```

##### moveToElementWithDelay(selector, callback, delay, position, offset)

Move to element with delay before callback.

**Parameters:**

- `selector` (string): CSS selector for target element
- `callback` (function): Callback to execute after delay
- `delay` (number): Delay in milliseconds
- `position` (string): Position relative to element
- `offset` (object): Pixel offset {x, y}

**Returns:** Function - Cleanup function

##### moveToElementWithCondition(selector, condition, callback, position, offset)

Move to element with conditional callback.

**Parameters:**

- `selector` (string): CSS selector for target element
- `condition` (function): Condition function that returns boolean
- `callback` (function): Callback to execute if condition is true
- `position` (string): Position relative to element
- `offset` (object): Pixel offset {x, y}

**Returns:** Function - Cleanup function

##### moveToElementWithRepeat(selector, callback, interval, position, offset)

Move to element with repeating callback.

**Parameters:**

- `selector` (string): CSS selector for target element
- `callback` (function): Callback to repeat while at element
- `interval` (number): Repeat interval in milliseconds
- `position` (string): Position relative to element
- `offset` (object): Pixel offset {x, y}

**Returns:** Function - Cleanup function

##### moveToElementWithProximity(selector, callback, proximity, position, offset)

Move to element with proximity-based callback.

**Parameters:**

- `selector` (string): CSS selector for target element
- `callback` (function): Callback to execute when within proximity
- `proximity` (number): Proximity threshold in pixels
- `position` (string): Position relative to element
- `offset` (object): Pixel offset {x, y}

**Returns:** Function - Cleanup function

### ElementTargetingAdvanced

Provides advanced targeting features.

#### Methods

##### moveToElementWithPath(selector, pathPoints, position, offset, options)

Move to element following a custom path.

**Parameters:**

- `selector` (string): CSS selector for target element
- `pathPoints` (array): Array of {x, y} points defining the path
- `position` (string): Position relative to element
- `offset` (object): Pixel offset {x, y}
- `options` (object): Path options including speed, loop, etc.

**Returns:** Function - Cleanup function

**Example:**

```javascript
const pathPoints = [
    { x: 100, y: 100 },
    { x: 200, y: 150 },
    { x: 300, y: 100 },
];
elementTargeting.moveToElementWithPath('.target', pathPoints, 'right', {
    x: 20,
    y: 0,
});
```

##### moveToElementWithEasing(selector, easingFunction, duration, position, offset)

Move to element with custom easing.

**Parameters:**

- `selector` (string): CSS selector for target element
- `easingFunction` (function): Custom easing function
- `duration` (number): Animation duration in milliseconds
- `position` (string): Position relative to element
- `offset` (object): Pixel offset {x, y}

**Returns:** void

##### moveToElementWithCollision(selector, obstacles, avoidanceDistance, position, offset)

Move to element while avoiding obstacles.

**Parameters:**

- `selector` (string): CSS selector for target element
- `obstacles` (array): Array of obstacle selectors or positions
- `avoidanceDistance` (number): Distance to maintain from obstacles
- `position` (string): Position relative to element
- `offset` (object): Pixel offset {x, y}

**Returns:** void

##### moveToElementWithAudio(selector, audioStream, sensitivity, position, offset)

Move to element with audio-reactive movement.

**Parameters:**

- `selector` (string): CSS selector for target element
- `audioStream` (MediaStream): Audio stream for analysis
- `sensitivity` (number): Audio sensitivity multiplier
- `position` (string): Position relative to element
- `offset` (object): Pixel offset {x, y}

**Returns:** void

##### moveToElementWithGaze(selector, gazeOptions, position, offset)

Move to element following user's gaze.

**Parameters:**

- `selector` (string): CSS selector for target element
- `gazeOptions` (object): Gaze tracking options
- `position` (string): Position relative to element
- `offset` (object): Pixel offset {x, y}

**Returns:** void

#### Utility Methods

##### addObstacle(obstacle)

Add obstacle for collision detection.

**Parameters:**

- `obstacle` (string|object): Obstacle selector or position object

**Returns:** void

##### removeObstacle(obstacle)

Remove obstacle from collision detection.

**Parameters:**

- `obstacle` (string|object): Obstacle to remove

**Returns:** void

##### clearObstacles()

Clear all obstacles.

**Returns:** void

### ElementTargetingContext

Provides context-aware targeting.

#### Methods

##### moveToElementWithScroll(selector, scrollOptions, position, offset)

Move to element with scroll-based movement.

**Parameters:**

- `selector` (string): CSS selector for target element
- `scrollOptions` (object): Scroll-based movement options
- `position` (string): Position relative to element
- `offset` (object): Pixel offset {x, y}

**Returns:** Function - Cleanup function

**Example:**

```javascript
elementTargeting.moveToElementWithScroll(
    '.target',
    {
        startScroll: 50,
        endScroll: 300,
        onProgress: progress => console.log(`Progress: ${progress}`),
    },
    'right',
    { x: 20, y: 0 }
);
```

##### moveToElementWithPhysics(selector, physicsOptions, position, offset)

Move to element with physics-based movement.

**Parameters:**

- `selector` (string): CSS selector for target element
- `physicsOptions` (object): Physics simulation options
- `position` (string): Position relative to element
- `offset` (object): Pixel offset {x, y}

**Returns:** Function - Cleanup function

**Example:**

```javascript
elementTargeting.moveToElementWithPhysics(
    '.target',
    {
        mass: 1,
        damping: 0.98,
        springConstant: 0.1,
        maxVelocity: 10,
    },
    'right',
    { x: 20, y: 0 }
);
```

##### moveToElementWithGroup(elementSelectors, position, offset)

Move to center of multiple elements.

**Parameters:**

- `elementSelectors` (array): Array of CSS selectors
- `position` (string): Position relative to group center
- `offset` (object): Pixel offset {x, y}

**Returns:** void

##### moveToElementWithResponsive(selector, responsiveOptions, position, offset)

Move to element with responsive behavior.

**Parameters:**

- `selector` (string): CSS selector for target element
- `responsiveOptions` (object): Responsive behavior options
- `position` (string): Position relative to element
- `offset` (object): Pixel offset {x, y}

**Returns:** Function - Cleanup function

##### moveToElementWithAccessibility(selector, accessibilityOptions, position, offset)

Move to element with accessibility features.

**Parameters:**

- `selector` (string): CSS selector for target element
- `accessibilityOptions` (object): Accessibility options
- `position` (string): Position relative to element
- `offset` (object): Pixel offset {x, y}

**Returns:** void

#### Utility Methods

##### getCurrentBreakpoint()

Get current breakpoint based on window width.

**Returns:** string - Current breakpoint name

##### setBreakpoints(breakpoints)

Set custom breakpoints.

**Parameters:**

- `breakpoints` (object): Custom breakpoint values

**Returns:** void

##### enableAccessibility()

Enable accessibility features.

**Returns:** void

##### disableAccessibility()

Disable accessibility features.

**Returns:** void

### ElementTargetingInteractions

Provides interactive targeting.

#### Methods

##### moveToElementWithHover(selector, hoverOptions, position, offset)

Move to element and follow mouse hover.

**Parameters:**

- `selector` (string): CSS selector for target element
- `hoverOptions` (object): Hover interaction options
- `position` (string): Position relative to element
- `offset` (object): Pixel offset {x, y}

**Returns:** Function - Cleanup function

**Example:**

```javascript
elementTargeting.moveToElementWithHover(
    '.interactive',
    {
        onMouseEnter: () => console.log('Mouse entered'),
        onMouseLeave: () => console.log('Mouse left'),
        followMouse: true,
        hoverDistance: 50,
    },
    'right',
    { x: 20, y: 0 }
);
```

##### moveToElementWithClick(selector, clickOptions, position, offset)

Move to element and track clicks.

**Parameters:**

- `selector` (string): CSS selector for target element
- `clickOptions` (object): Click interaction options
- `position` (string): Position relative to element
- `offset` (object): Pixel offset {x, y}

**Returns:** Function - Cleanup function

##### moveToElementWithTouch(selector, touchOptions, position, offset)

Move to element and track touch gestures.

**Parameters:**

- `selector` (string): CSS selector for target element
- `touchOptions` (object): Touch interaction options
- `position` (string): Position relative to element
- `offset` (object): Pixel offset {x, y}

**Returns:** Function - Cleanup function

##### moveToElementWithFocus(selector, focusOptions, position, offset)

Move to element and track focus events.

**Parameters:**

- `selector` (string): CSS selector for target element
- `focusOptions` (object): Focus interaction options
- `position` (string): Position relative to element
- `offset` (object): Pixel offset {x, y}

**Returns:** Function - Cleanup function

##### moveToElementWithKeyboard(selector, keyboardOptions, position, offset)

Move to element and track keyboard events.

**Parameters:**

- `selector` (string): CSS selector for target element
- `keyboardOptions` (object): Keyboard interaction options
- `position` (string): Position relative to element
- `offset` (object): Pixel offset {x, y}

**Returns:** Function - Cleanup function

#### Utility Methods

##### stopAllInteractions()

Stop all active interactions.

**Returns:** void

### ElementTargetingAnimations

Provides animated targeting.

#### Methods

##### moveToElementWithBounce(selector, bounceOptions, position, offset)

Move to element with bounce animation.

**Parameters:**

- `selector` (string): CSS selector for target element
- `bounceOptions` (object): Bounce animation options
- `position` (string): Position relative to element
- `offset` (object): Pixel offset {x, y}

**Returns:** Function - Cleanup function

**Example:**

```javascript
elementTargeting.moveToElementWithBounce(
    '.target',
    {
        duration: 1000,
        intensity: 50,
        bounces: 3,
    },
    'right',
    { x: 20, y: 0 }
);
```

##### moveToElementWithShake(selector, shakeOptions, position, offset)

Move to element with shake animation.

**Parameters:**

- `selector` (string): CSS selector for target element
- `shakeOptions` (object): Shake animation options
- `position` (string): Position relative to element
- `offset` (object): Pixel offset {x, y}

**Returns:** Function - Cleanup function

##### moveToElementWithPulse(selector, pulseOptions, position, offset)

Move to element with pulse animation.

**Parameters:**

- `selector` (string): CSS selector for target element
- `pulseOptions` (object): Pulse animation options
- `position` (string): Position relative to element
- `offset` (object): Pixel offset {x, y}

**Returns:** Function - Cleanup function

##### moveToElementWithWiggle(selector, wiggleOptions, position, offset)

Move to element with wiggle animation.

**Parameters:**

- `selector` (string): CSS selector for target element
- `wiggleOptions` (object): Wiggle animation options
- `position` (string): Position relative to element
- `offset` (object): Pixel offset {x, y}

**Returns:** Function - Cleanup function

##### moveToElementWithCustom(selector, animationFunction, animationOptions, position, offset)

Move to element with custom animation.

**Parameters:**

- `selector` (string): CSS selector for target element
- `animationFunction` (function): Custom animation function
- `animationOptions` (object): Animation options
- `position` (string): Position relative to element
- `offset` (object): Pixel offset {x, y}

**Returns:** Function - Cleanup function

#### Utility Methods

##### queueAnimations(animationQueue)

Queue multiple animations to play in sequence.

**Parameters:**

- `animationQueue` (array): Array of animation objects

**Returns:** void

##### stopAllAnimations()

Stop all active animations.

**Returns:** void

### ElementTargetingEffects

Provides visual effects.

#### Methods

##### moveToElementWithTrail(selector, trailOptions, position, offset)

Move to element with trail effect.

**Parameters:**

- `selector` (string): CSS selector for target element
- `trailOptions` (object): Trail effect options
- `position` (string): Position relative to element
- `offset` (object): Pixel offset {x, y}

**Returns:** Function - Cleanup function

**Example:**

```javascript
elementTargeting.moveToElementWithTrail(
    '.target',
    {
        color: '#00ff88',
        width: 3,
        opacity: 0.8,
        fadeSpeed: 0.95,
    },
    'right',
    { x: 20, y: 0 }
);
```

##### moveToElementWithParticles(selector, particleOptions, position, offset)

Move to element with particle effect.

**Parameters:**

- `selector` (string): CSS selector for target element
- `particleOptions` (object): Particle effect options
- `position` (string): Position relative to element
- `offset` (object): Pixel offset {x, y}

**Returns:** Function - Cleanup function

##### moveToElementWithGlow(selector, glowOptions, position, offset)

Move to element with glow effect.

**Parameters:**

- `selector` (string): CSS selector for target element
- `glowOptions` (object): Glow effect options
- `position` (string): Position relative to element
- `offset` (object): Pixel offset {x, y}

**Returns:** Function - Cleanup function

#### Utility Methods

##### stopAllEffects()

Stop all active effects.

**Returns:** void

### ElementTargetingAccessibility

Provides accessibility features.

#### Methods

##### moveToElementWithScreenReader(selector, screenReaderOptions, position, offset)

Move to element with screen reader support.

**Parameters:**

- `selector` (string): CSS selector for target element
- `screenReaderOptions` (object): Screen reader options
- `position` (string): Position relative to element
- `offset` (object): Pixel offset {x, y}

**Returns:** void

**Example:**

```javascript
elementTargeting.moveToElementWithScreenReader(
    '.button',
    {
        announce: true,
        announcement: 'Mascot moved to button',
        role: 'button',
        label: 'Submit form',
    },
    'right',
    { x: 20, y: 0 }
);
```

##### moveToElementWithKeyboard(selector, keyboardOptions, position, offset)

Move to element with keyboard navigation.

**Parameters:**

- `selector` (string): CSS selector for target element
- `keyboardOptions` (object): Keyboard navigation options
- `position` (string): Position relative to element
- `offset` (object): Pixel offset {x, y}

**Returns:** void

##### moveToElementWithHighContrast(selector, contrastOptions, position, offset)

Move to element with high contrast mode.

**Parameters:**

- `selector` (string): CSS selector for target element
- `contrastOptions` (object): High contrast options
- `position` (string): Position relative to element
- `offset` (object): Pixel offset {x, y}

**Returns:** void

##### moveToElementWithReducedMotion(selector, motionOptions, position, offset)

Move to element with reduced motion support.

**Parameters:**

- `selector` (string): CSS selector for target element
- `motionOptions` (object): Reduced motion options
- `position` (string): Position relative to element
- `offset` (object): Pixel offset {x, y}

**Returns:** void

##### moveToElementWithFocus(selector, focusOptions, position, offset)

Move to element with focus management.

**Parameters:**

- `selector` (string): CSS selector for target element
- `focusOptions` (object): Focus management options
- `position` (string): Position relative to element
- `offset` (object): Pixel offset {x, y}

**Returns:** void

#### Utility Methods

##### announceToScreenReader(message)

Announce message to screen reader.

**Parameters:**

- `message` (string): Message to announce

**Returns:** void

##### navigateFocus(direction)

Navigate focus order.

**Parameters:**

- `direction` (string): 'next' or 'previous'

**Returns:** void

##### enableAccessibility(options)

Enable accessibility features.

**Parameters:**

- `options` (object): Accessibility options to enable

**Returns:** void

##### disableAccessibility(options)

Disable accessibility features.

**Parameters:**

- `options` (object): Accessibility options to disable

**Returns:** void

##### isAccessibilityEnabled(feature)

Check if accessibility feature is enabled.

**Parameters:**

- `feature` (string): Feature name

**Returns:** boolean - True if feature is enabled

##### getAccessibilityOptions()

Get current accessibility options.

**Returns:** object - Current accessibility options

### ElementTargetingAll

Combined class that includes all targeting features.

#### Constructor

```javascript
constructor(positionController);
```

#### Methods

All methods from the individual modules are available through this combined
class.

#### Utility Methods

##### destroy()

Destroy all targeting modules.

**Returns:** void

## Configuration Options

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

### Common Options

#### Callback Options

```javascript
{
    onComplete: () => {},      // Called when animation completes
    onStart: () => {},         // Called when animation starts
    onProgress: (progress) => {}, // Called during animation progress
    repeat: false,             // Whether to repeat the callback
    proximity: 50              // Proximity threshold in pixels
}
```

#### Animation Options

```javascript
{
    duration: 1000,            // Animation duration in milliseconds
    intensity: 50,             // Animation intensity
    bounces: 3,                // Number of bounces
    frequency: 20,             // Animation frequency
    easing: 'easeOutCubic'     // Easing function
}
```

#### Effect Options

```javascript
{
    color: '#00ff88',          // Effect color
    width: 3,                  // Effect width
    opacity: 0.8,              // Effect opacity
    intensity: 50,             // Effect intensity
    radius: 100                // Effect radius
}
```

#### Accessibility Options

```javascript
{
    screenReader: true,        // Enable screen reader support
    keyboardNavigation: true,  // Enable keyboard navigation
    highContrast: false,       // Enable high contrast mode
    reducedMotion: false,      // Respect reduced motion preference
    announcements: true        // Enable announcements
}
```

## Error Handling

All methods include error handling for common issues:

- **Element not found**: Methods will log a warning if the target element
  doesn't exist
- **Invalid parameters**: Methods will validate parameters and provide helpful
  error messages
- **Performance issues**: Methods include performance optimizations and cleanup
  mechanisms

## Browser Compatibility

The Element Targeting system is compatible with:

- **Modern browsers**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **Mobile browsers**: iOS Safari 12+, Chrome Mobile 60+
- **Accessibility**: Screen readers, keyboard navigation, reduced motion support

## Performance Considerations

- **Cleanup**: Always call cleanup functions when done to prevent memory leaks
- **Throttling**: Methods include built-in throttling for performance
- **Efficient DOM queries**: CSS selectors are cached for better performance
- **Animation optimization**: Uses requestAnimationFrame for smooth animations

## Examples

See the main README.md file for comprehensive examples and usage patterns.
