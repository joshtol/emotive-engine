# Element Attachment & Containment Examples

This guide demonstrates how to attach the mascot to specific DOM elements, scale it down for compact layouts, and constrain particles within element boundaries.

## Basic Attachment

Attach the mascot to any DOM element:

```javascript
const mascot = new EmotiveMascot({
    canvasId: 'mascot-canvas',
    emotion: 'neutral'
});

mascot.start();

// Attach to element by ID
mascot.attachToElement('#checkout-cart');

// Attach to element by selector
mascot.attachToElement('.chat-panel');

// Attach to DOM element reference
const element = document.getElementById('mascot-stage');
mascot.attachToElement(element);
```

## Scaling for Compact Layouts

Scale the mascot down for cards, chat interfaces, or mobile layouts:

```javascript
// Small mascot (30% scale) for shopping cart
mascot.attachToElement('#cart', {
    scale: 0.3,
    animate: true,
    duration: 800
});

// Medium mascot (50% scale) for sidebar
mascot.attachToElement('.sidebar', {
    scale: 0.5
});

// Large mascot (150% scale) for hero section
mascot.attachToElement('#hero', {
    scale: 1.5
});
```

## Particle Containment

Constrain particles to stay within the element boundaries:

```javascript
// Particles bounce off element edges
mascot.attachToElement('#product-card', {
    scale: 0.4,
    containParticles: true  // Particles stay within bounds
});

// Manual containment with setContainment
const element = document.getElementById('container');
const rect = element.getBoundingClientRect();

mascot.setContainment(
    { width: rect.width, height: rect.height },
    0.6  // 60% scale
);
```

## Scroll-Based Attachment

Attach the mascot when an element scrolls into view using Intersection Observer:

```javascript
const mascot = new EmotiveMascot({
    canvasId: 'mascot-canvas',
    emotion: 'neutral'
});
mascot.start();

const stage = document.getElementById('checkout-stage');

const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Stage scrolled into view - attach mascot
                mascot.attachToElement(entry.target, {
                    scale: 0.3,
                    containParticles: true,
                    animate: true,
                    duration: 800
                });

                // Change emotion when attached
                mascot.setEmotion('calm');
            } else {
                // Stage scrolled out of view - detach
                mascot.detachFromElement();
                mascot.setEmotion('neutral');
            }
        });
    },
    {
        threshold: 0.2,  // Trigger when 20% visible
        rootMargin: '0px'
    }
);

observer.observe(stage);
```

## E-commerce Checkout Flow

Complete example for a shopping cart mascot:

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        #checkout-stage {
            width: 400px;
            height: 500px;
            background: radial-gradient(circle, rgba(0, 217, 255, 0.08), rgba(0, 0, 0, 0.2));
            border-radius: 20px;
            border: 2px solid rgba(0, 217, 255, 0.25);
            position: relative;
            overflow: hidden;
        }
    </style>
</head>
<body>
    <!-- Mascot follows scroll in hero -->
    <canvas id="mascot-canvas"></canvas>

    <!-- Checkout stage -->
    <div id="checkout-stage"></div>

    <script type="module">
        import EmotiveMascot from './emotive-engine-lean.js';

        const mascot = new EmotiveMascot({
            canvasId: 'mascot-canvas',
            emotion: 'neutral'
        });

        mascot.start();

        // Attach when scrolled into view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    mascot.attachToElement(entry.target, {
                        scale: 0.3,              // Small 30% size
                        containParticles: true,  // Particles bounce within stage
                        animate: true,
                        duration: 800
                    });
                    mascot.setEmotion('calm');
                } else {
                    mascot.detachFromElement();
                }
            });
        }, { threshold: 0.2 });

        observer.observe(document.getElementById('checkout-stage'));
    </script>
</body>
</html>
```

## Chat Interface Integration

Compact mascot for chat panels:

```javascript
const mascot = new EmotiveMascot({
    canvasId: 'mascot-canvas',
    emotion: 'neutral'
});

mascot.start();

// Attach to chat panel
mascot.attachToElement('#chat-panel', {
    scale: 0.4,
    containParticles: true,
    offsetY: -50  // Position slightly above center
});

// React to messages
function onUserMessage() {
    mascot.setEmotion('neutral');
    mascot.express('settle');
}

function onBotResponse(emotion) {
    mascot.setEmotion(emotion);
}
```

## Detachment

Remove mascot from element and return to viewport center:

```javascript
// Detach from element
mascot.detachFromElement();

// Check if attached
if (mascot.isAttachedToElement()) {
    console.log('Mascot is currently attached');
}
```

## Advanced: Dynamic Containment

Adjust containment bounds dynamically:

```javascript
// Initial attachment
mascot.attachToElement('#container', {
    scale: 0.5,
    containParticles: true
});

// Update bounds when container resizes
window.addEventListener('resize', () => {
    const element = document.getElementById('container');
    const rect = element.getBoundingClientRect();

    mascot.setContainment(
        { width: rect.width, height: rect.height },
        0.5
    );
});
```

## Best Practices

### 1. Use Appropriate Scale for Context

- **Hero sections**: 1.0 - 1.5 (normal to large)
- **Chat interfaces**: 0.4 - 0.5 (compact)
- **Shopping carts**: 0.3 - 0.4 (small)
- **Mobile cards**: 0.3 - 0.5 (small to compact)

### 2. Enable Containment for Bounded Elements

Always use `containParticles: true` when:
- Element has defined dimensions (cards, panels)
- Particles would escape and overlap other UI
- Working with small or medium-sized containers

### 3. Match Emotions to Context

```javascript
// Calm emotions work well when attached to compact spaces
mascot.setEmotion('calm');    // Gentle, contained
mascot.setEmotion('neutral'); // Stable, balanced

// Avoid high-energy emotions in small containers
// mascot.setEmotion('excited'); // ❌ Too many particles!
```

### 4. Animate Transitions

```javascript
mascot.attachToElement('#stage', {
    animate: true,      // ✅ Smooth transition
    duration: 800,
    scale: 0.3,
    containParticles: true
});
```

### 5. Clean Up on Detach

```javascript
// Detachment automatically:
// - Returns mascot to viewport center
// - Resets scale to 1.0
// - Clears particle containment
mascot.detachFromElement();
```

## Common Patterns

### Tabbed Interface

```javascript
const tabs = document.querySelectorAll('.tab');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const panelId = tab.dataset.panel;
        mascot.attachToElement(`#${panelId}`, {
            scale: 0.5,
            containParticles: true
        });
    });
});
```

### Modal Dialog

```javascript
function openModal() {
    modal.style.display = 'block';
    mascot.attachToElement('#modal-content', {
        scale: 0.4,
        containParticles: true,
        animate: true
    });
    mascot.setEmotion('calm');
}

function closeModal() {
    modal.style.display = 'none';
    mascot.detachFromElement();
}
```

### Product Card Grid

```javascript
const cards = document.querySelectorAll('.product-card');

cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        mascot.attachToElement(card, {
            scale: 0.35,
            containParticles: true,
            duration: 400
        });
    });
});
```
