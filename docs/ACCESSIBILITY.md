# Accessibility Guide

Making Emotive Engine accessible to all users.

## Overview

Emotive Engine renders to a `<canvas>` element, which presents accessibility challenges since canvas content isn't natively accessible to screen readers. This guide covers best practices for making your mascot implementation inclusive.

---

## Reduced Motion Support

### Automatic Detection

Emotive Engine respects the `prefers-reduced-motion` media query:

```javascript
// Engine automatically detects this preference
// When enabled:
// - Gestures use fade instead of motion
// - Transitions are instant or very short
// - Particles are static or disabled
// - Auto-rotate is disabled
```

### Manual Control

```javascript
// Check user preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Configure based on preference
const mascot = new EmotiveMascot3D({
    enablePostProcessing: !prefersReducedMotion,
    autoRotate: false,  // Disable for reduced motion
    particleCount: prefersReducedMotion ? 0 : 200,
});

// Listen for preference changes
window.matchMedia('(prefers-reduced-motion: reduce)')
    .addEventListener('change', (e) => {
        if (e.matches) {
            mascot.disableParticles();
            mascot.disableAutoRotate();
        } else {
            mascot.enableParticles();
        }
    });
```

### CSS Fallback

```css
@media (prefers-reduced-motion: reduce) {
    #mascot-container {
        /* Prevent any CSS animations on container */
        animation: none !important;
        transition: none !important;
    }
}
```

---

## Screen Reader Support

### ARIA Labels

Wrap your mascot container with proper ARIA attributes:

```html
<div
    id="mascot-container"
    role="img"
    aria-label="Animated mascot character"
    aria-live="polite"
    aria-atomic="true"
>
    <!-- Canvas renders here -->
</div>

<!-- Hidden live region for state announcements -->
<div id="mascot-status" class="sr-only" aria-live="polite"></div>
```

### Announcing State Changes

```javascript
const statusEl = document.getElementById('mascot-status');

mascot.eventManager.on('emotion:change', ({ emotion }) => {
    statusEl.textContent = `Mascot is now feeling ${emotion}`;
});

mascot.eventManager.on('gesture:start', ({ gesture }) => {
    statusEl.textContent = `Mascot is ${gesture}ing`;
});
```

### Screen Reader Only CSS

```css
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}
```

---

## Keyboard Navigation

### Focus Management

```html
<div
    id="mascot-container"
    tabindex="0"
    role="application"
    aria-label="Interactive mascot - use arrow keys to interact"
>
</div>
```

### Keyboard Controls

```javascript
const container = document.getElementById('mascot-container');

container.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'Enter':
        case ' ':
            mascot.express('bounce');
            e.preventDefault();
            break;

        case 'ArrowUp':
            cycleEmotion(1);
            e.preventDefault();
            break;

        case 'ArrowDown':
            cycleEmotion(-1);
            e.preventDefault();
            break;

        case 'Escape':
            mascot.setEmotion('neutral');
            e.preventDefault();
            break;
    }
});

// Emotion cycling helper
const emotions = mascot.getAvailableEmotions();
let currentIndex = 0;

function cycleEmotion(direction) {
    currentIndex = (currentIndex + direction + emotions.length) % emotions.length;
    mascot.setEmotion(emotions[currentIndex]);
}
```

### Focus Indicators

```css
#mascot-container:focus {
    outline: 3px solid #4A90D9;
    outline-offset: 2px;
}

#mascot-container:focus:not(:focus-visible) {
    outline: none;  /* Hide for mouse users */
}

#mascot-container:focus-visible {
    outline: 3px solid #4A90D9;
    outline-offset: 2px;
}
```

---

## Color Contrast

### Ensure Sufficient Contrast

The mascot's glow and particle colors should have sufficient contrast against their background:

```javascript
// Light backgrounds: use darker mascot colors
const mascot = new EmotiveMascot3D({
    // Consider background when choosing material
    materialVariant: 'default',  // Adjust as needed
});

// Or set a contrasting background
document.getElementById('mascot-container').style.backgroundColor = '#1a1a2e';
```

### High Contrast Mode

```css
@media (prefers-contrast: high) {
    #mascot-container {
        background-color: #000;
        border: 2px solid #fff;
    }
}
```

---

## Alternative Content

### Static Fallback

Provide a static image for users who can't view the animation:

```html
<div id="mascot-container">
    <noscript>
        <img
            src="/mascot-static.png"
            alt="Emotive mascot character in neutral state"
            width="300"
            height="300"
        />
    </noscript>
</div>
```

### Text Description

```html
<figure>
    <div id="mascot-container" aria-hidden="true"></div>
    <figcaption class="sr-only">
        An animated 3D mascot character that responds to emotions and gestures.
        Currently displaying: <span id="current-state">neutral emotion</span>
    </figcaption>
</figure>
```

---

## Complete Accessible Implementation

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Accessible Mascot</title>
    <style>
        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        }

        #mascot-container {
            width: 300px;
            height: 300px;
            background: #1a1a2e;
            border-radius: 8px;
        }

        #mascot-container:focus-visible {
            outline: 3px solid #4A90D9;
            outline-offset: 2px;
        }

        .controls {
            margin-top: 1rem;
        }

        .controls button {
            padding: 0.5rem 1rem;
            margin-right: 0.5rem;
            cursor: pointer;
        }

        @media (prefers-reduced-motion: reduce) {
            #mascot-container {
                animation: none !important;
            }
        }
    </style>
</head>
<body>
    <main>
        <h1>Interactive Mascot</h1>

        <figure>
            <div
                id="mascot-container"
                tabindex="0"
                role="application"
                aria-label="Interactive mascot character. Press Enter to make it bounce, arrow keys to change emotions."
            >
                <noscript>
                    <img src="/mascot-static.png" alt="Mascot character" />
                </noscript>
            </div>
            <figcaption id="mascot-description" class="sr-only">
                Animated mascot currently showing neutral emotion.
            </figcaption>
        </figure>

        <!-- Live region for announcements -->
        <div id="mascot-status" class="sr-only" aria-live="polite" aria-atomic="true"></div>

        <!-- Visible controls -->
        <div class="controls" role="group" aria-label="Mascot controls">
            <button id="btn-joy" aria-pressed="false">Joy</button>
            <button id="btn-sadness" aria-pressed="false">Sadness</button>
            <button id="btn-bounce">Bounce</button>
        </div>
    </main>

    <script type="module">
        import { EmotiveMascot3D } from 'emotive-engine/3d';

        // Check reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Initialize mascot
        const container = document.getElementById('mascot-container');
        const statusEl = document.getElementById('mascot-status');
        const descriptionEl = document.getElementById('mascot-description');

        const mascot = new EmotiveMascot3D({
            enablePostProcessing: !prefersReducedMotion,
            autoRotate: false,
            particleCount: prefersReducedMotion ? 0 : 100,
        });

        mascot.init(container);
        mascot.start();

        // Announce state changes
        mascot.eventManager.on('emotion:change', ({ emotion }) => {
            statusEl.textContent = `Mascot emotion changed to ${emotion}`;
            descriptionEl.textContent = `Animated mascot currently showing ${emotion} emotion.`;

            // Update button states
            document.querySelectorAll('[aria-pressed]').forEach(btn => {
                btn.setAttribute('aria-pressed', btn.id === `btn-${emotion}`);
            });
        });

        mascot.eventManager.on('gesture:start', ({ gesture }) => {
            statusEl.textContent = `Mascot is performing ${gesture} gesture`;
        });

        // Keyboard navigation
        container.addEventListener('keydown', (e) => {
            const emotions = mascot.getAvailableEmotions();
            let currentIndex = emotions.indexOf(mascot._currentEmotion);

            switch (e.key) {
                case 'Enter':
                case ' ':
                    mascot.express('bounce');
                    e.preventDefault();
                    break;

                case 'ArrowUp':
                case 'ArrowRight':
                    currentIndex = (currentIndex + 1) % emotions.length;
                    mascot.setEmotion(emotions[currentIndex]);
                    e.preventDefault();
                    break;

                case 'ArrowDown':
                case 'ArrowLeft':
                    currentIndex = (currentIndex - 1 + emotions.length) % emotions.length;
                    mascot.setEmotion(emotions[currentIndex]);
                    e.preventDefault();
                    break;

                case 'Escape':
                    mascot.setEmotion('neutral');
                    e.preventDefault();
                    break;
            }
        });

        // Button controls
        document.getElementById('btn-joy').addEventListener('click', () => {
            mascot.setEmotion('joy');
        });

        document.getElementById('btn-sadness').addEventListener('click', () => {
            mascot.setEmotion('sadness');
        });

        document.getElementById('btn-bounce').addEventListener('click', () => {
            mascot.express('bounce');
        });

        // Listen for reduced motion preference changes
        window.matchMedia('(prefers-reduced-motion: reduce)')
            .addEventListener('change', (e) => {
                if (e.matches) {
                    mascot.disableParticles();
                    statusEl.textContent = 'Reduced motion mode enabled';
                } else {
                    mascot.enableParticles();
                    statusEl.textContent = 'Full animation mode enabled';
                }
            });
    </script>
</body>
</html>
```

---

## Testing Accessibility

### Automated Tools
- [axe DevTools](https://www.deque.com/axe/) - Browser extension
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Built into Chrome
- [WAVE](https://wave.webaim.org/) - Web accessibility evaluator

### Manual Testing
1. **Keyboard-only navigation** - Tab through your page, use Enter/Space
2. **Screen reader** - Test with VoiceOver (Mac), NVDA (Windows), or TalkBack (Android)
3. **Reduced motion** - Enable in OS settings and verify behavior
4. **High contrast** - Test with Windows High Contrast mode
5. **Zoom** - Test at 200% browser zoom

### Screen Reader Testing Commands

**VoiceOver (Mac):**
- `Cmd + F5` to enable
- `Ctrl + Option + arrows` to navigate
- `Ctrl + Option + Space` to activate

**NVDA (Windows):**
- `Insert + Down` to read from cursor
- `Tab` to move to next focusable element
- `Enter` or `Space` to activate

---

## WCAG Compliance Checklist

- [ ] **1.1.1** Non-text Content - Provide text alternatives (ARIA labels, descriptions)
- [ ] **1.4.1** Use of Color - Don't rely solely on color to convey information
- [ ] **1.4.3** Contrast - Ensure sufficient color contrast (4.5:1 for normal text)
- [ ] **2.1.1** Keyboard - All functionality available via keyboard
- [ ] **2.1.2** No Keyboard Trap - Users can navigate away with keyboard
- [ ] **2.3.1** Three Flashes - No content flashes more than 3x/second
- [ ] **2.4.7** Focus Visible - Focus indicator is visible
- [ ] **2.5.5** Target Size - Interactive elements at least 44x44px (touch)
- [ ] **4.1.2** Name, Role, Value - ARIA attributes correctly applied

---

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility Guide](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM](https://webaim.org/)
- [A11y Project](https://www.a11yproject.com/)
