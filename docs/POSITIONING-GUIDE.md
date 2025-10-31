# 3D Mascot Positioning Guide

## Quick Start

The 3D mascot is positioned at the origin `[0, 0, 0]` by default and faces the camera.

```javascript
const mascot = new EmotiveMascot3D({
    coreGeometry: 'crystal',
    enableParticles: true
});

await mascot.init(canvas);
mascot.start();
```

## Coordinate System

```
        Y+ (up)
         |
         |
         |_________ X+ (right)
        /
       /
      Z+ (toward camera)
```

- **X-axis**: Left (-) to Right (+)
- **Y-axis**: Down (-) to Up (+)
- **Z-axis**: Away from camera (-) to Toward camera (+)

## Positioning the Core

Access the core's position directly:

```javascript
// Move mascot to the right
mascot.core3D.position = [2, 0, 0];

// Move mascot up
mascot.core3D.position = [0, 2, 0];

// Move mascot away from camera
mascot.core3D.position = [0, 0, -1];

// Combine all three
mascot.core3D.position = [1, 1, -0.5];  // Right, up, slightly back
```

## Canvas Positioning

The mascot renders within its canvas element. Position the canvas itself using CSS:

```html
<style>
    #mascot-canvas {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 400px;
        height: 400px;
    }
</style>
```

## Common Positions

### Bottom-Right Corner (Floating Assistant)

```css
#mascot-canvas {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 300px;
    height: 300px;
    pointer-events: none; /* Click-through to content below */
}
```

### Centered on Page

```css
#mascot-canvas {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 600px;
    height: 600px;
}
```

### Side Panel

```css
.mascot-container {
    position: fixed;
    right: 0;
    top: 0;
    width: 400px;
    height: 100vh;
    background: rgba(0, 0, 0, 0.8);
}

#mascot-canvas {
    width: 100%;
    height: 400px;
    margin-top: 100px;
}
```

## Scaling

Control the apparent size of the mascot:

### Via Core Scale

```javascript
// Make mascot larger
mascot.core3D.scale = 2.0;

// Make mascot smaller
mascot.core3D.scale = 0.5;
```

### Via Canvas Size

```html
<!-- Larger canvas = larger mascot appearance -->
<canvas id="mascot-canvas" width="800" height="600"></canvas>

<!-- Smaller canvas = smaller mascot appearance -->
<canvas id="mascot-canvas" width="400" height="300"></canvas>
```

### Via CSS Transform

```css
#mascot-canvas {
    transform: scale(1.5);  /* 150% size */
}
```

## Camera Distance

The mascot's apparent size is also affected by camera distance:

```javascript
// Default: camera at Z=3 looking at origin
mascot.core3D.renderer.cameraPosition = [0, 0, 3];

// Closer view (mascot appears larger)
mascot.core3D.renderer.cameraPosition = [0, 0, 2];

// Farther view (mascot appears smaller)
mascot.core3D.renderer.cameraPosition = [0, 0, 5];
```

## Responsive Positioning

Adjust position based on viewport size:

```javascript
function positionMascot() {
    const canvas = document.getElementById('mascot-canvas');

    if (window.innerWidth < 768) {
        // Mobile: smaller, bottom-center
        canvas.style.width = '200px';
        canvas.style.height = '200px';
        canvas.style.bottom = '10px';
        canvas.style.left = '50%';
        canvas.style.transform = 'translateX(-50%)';
    } else {
        // Desktop: larger, bottom-right
        canvas.style.width = '400px';
        canvas.style.height = '400px';
        canvas.style.bottom = '20px';
        canvas.style.right = '20px';
        canvas.style.left = 'auto';
        canvas.style.transform = 'none';
    }
}

window.addEventListener('resize', positionMascot);
positionMascot();
```

## Rotation

Rotate the core around its center:

```javascript
// Rotate around Y-axis (spin)
mascot.core3D.rotation = [0, Math.PI / 4, 0];  // 45 degrees

// Rotate around X-axis (pitch)
mascot.core3D.rotation = [Math.PI / 6, 0, 0];  // 30 degrees

// Rotate around Z-axis (roll)
mascot.core3D.rotation = [0, 0, Math.PI / 8];  // 22.5 degrees
```

Rotation values are in radians:
- 90° = `Math.PI / 2`
- 180° = `Math.PI`
- 360° = `Math.PI * 2`

## Animated Movement

Smoothly move the mascot between positions:

```javascript
function animateToPosition(target, duration = 1000) {
    const start = [...mascot.core3D.position];
    const startTime = Date.now();

    function update() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);

        mascot.core3D.position = [
            start[0] + (target[0] - start[0]) * eased,
            start[1] + (target[1] - start[1]) * eased,
            start[2] + (target[2] - start[2]) * eased
        ];

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    update();
}

// Usage
animateToPosition([2, 1, 0], 1500);  // Move to right+up over 1.5 seconds
```

## Z-Index and Layering

Control mascot layering with CSS:

```css
#mascot-canvas {
    z-index: 1000;  /* Above most content */
}

/* Or below other elements */
#mascot-canvas {
    z-index: 1;
}

/* Ensure particles layer correctly */
.mascot-container > canvas {
    position: absolute;
    top: 0;
    left: 0;
}
```

## Performance Considerations

### Reduce Canvas Size on Mobile

```javascript
const canvas = document.getElementById('mascot-canvas');
const isMobile = window.innerWidth < 768;

canvas.width = isMobile ? 400 : 800;
canvas.height = isMobile ? 300 : 600;
```

### Disable Particles on Low-End Devices

```javascript
const mascot = new EmotiveMascot3D({
    coreGeometry: 'crystal',
    enableParticles: !navigator.hardwareConcurrency || navigator.hardwareConcurrency > 2
});
```

### Use Lower Resolution Canvas with CSS Scaling

```html
<!-- Small canvas, scaled up with CSS -->
<canvas id="mascot-canvas"
        width="400"
        height="300"
        style="width: 800px; height: 600px;">
</canvas>
```

## Examples

### Floating Corner Assistant

```html
<canvas id="mascot-canvas" width="400" height="400"></canvas>

<style>
    #mascot-canvas {
        position: fixed;
        bottom: 20px;
        right: 20px;
        border-radius: 50%;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        pointer-events: none;
        z-index: 1000;
    }
</style>

<script type="module">
    import { EmotiveMascot3D } from './dist/emotive-mascot-3d.js';

    const mascot = new EmotiveMascot3D({
        coreGeometry: 'sphere',
        enableParticles: true
    });

    await mascot.init(document.getElementById('mascot-canvas'));
    mascot.start();
    mascot.setEmotion('joy');
</script>
```

### Hero Section Mascot

```html
<div class="hero">
    <div class="hero-content">
        <h1>Welcome!</h1>
        <p>Meet our assistant</p>
    </div>
    <canvas id="mascot-canvas" width="600" height="600"></canvas>
</div>

<style>
    .hero {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 50px;
        min-height: 100vh;
    }

    #mascot-canvas {
        max-width: 600px;
    }
</style>
```

### Interactive Chat Mascot

```javascript
// Position mascot next to chat messages
function positionNearMessage(messageElement) {
    const rect = messageElement.getBoundingClientRect();
    const canvas = document.getElementById('mascot-canvas');

    canvas.style.position = 'fixed';
    canvas.style.left = (rect.right + 20) + 'px';
    canvas.style.top = rect.top + 'px';

    // React to message
    mascot.express('nod');
}
```
