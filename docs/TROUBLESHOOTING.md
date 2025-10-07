# Troubleshooting Guide

## Common Issues and Solutions

This guide covers the most frequently encountered issues when integrating and using the Emotive Communication Engine, along with step-by-step solutions and preventive measures.

## Canvas and Rendering Issues

### Issue: Canvas Not Rendering

**Symptoms:**
- Blank canvas element
- No mascot visible
- Console errors about canvas context

**Causes:**
- Canvas element not found
- Canvas context creation failed
- Canvas size issues
- CSS styling conflicts

**Solutions:**

1. **Verify Canvas Element**
```javascript
// Check if canvas exists
const canvas = document.getElementById('mascot-canvas');
if (!canvas) {
    console.error('Canvas element not found');
    return;
}

// Verify canvas is properly sized
console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);
```

2. **Check Canvas Context**
```javascript
const mascot = new EmotiveMascot({
    canvas: canvas,
    debug: true // Enable debug logging
});

// Listen for initialization errors
mascot.on('error', (error) => {
    if (error.type === 'canvas-init') {
        console.error('Canvas initialization failed:', error.message);
    }
});
```

3. **Fix Canvas Sizing**
```css
/* Ensure canvas has proper dimensions */
#mascot-canvas {
    width: 300px;
    height: 300px;
    border: 1px solid #ccc; /* Temporary border to verify size */
}
```

```javascript
// Set canvas size programmatically
const canvas = document.getElementById('mascot-canvas');
canvas.width = 300;
canvas.height = 300;
```

### Issue: Canvas Context Lost

**Symptoms:**
- Mascot disappears suddenly
- Console error: "Canvas context lost"
- Rendering stops working

**Solutions:**

1. **Enable Context Recovery**
```javascript
const mascot = new EmotiveMascot({
    canvas: canvas,
    contextRecovery: true // Enable automatic recovery
});

// Handle context loss events
mascot.on('contextLost', () => {
    console.log('Canvas context lost, attempting recovery...');
});

mascot.on('contextRestored', () => {
    console.log('Canvas context restored successfully');
});
```

2. **Manual Context Recovery**
```javascript
// Listen for context loss
canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    console.log('WebGL context lost');
});

canvas.addEventListener('webglcontextrestored', () => {
    console.log('WebGL context restored');
    // Reinitialize mascot if needed
    mascot.reinitialize();
});
```

### Issue: Poor Rendering Performance

**Symptoms:**
- Low FPS (< 30)
- Choppy animations
- Browser becomes unresponsive

**Solutions:**

1. **Reduce Particle Count**
```javascript
const mascot = new EmotiveMascot({
    canvas: canvas,
    maxParticles: 15, // Reduce from default 50
    performanceMonitoring: true
});

// Monitor and adjust dynamically
mascot.on('performance:fps', (fps) => {
    if (fps < 30) {
        const currentMax = mascot.getMaxParticles();
        mascot.setMaxParticles(Math.max(5, currentMax - 5));
    }
});
```

2. **Enable Performance Optimizations**
```javascript
const mascot = new EmotiveMascot({
    canvas: canvas,
    autoOptimize: true,
    degradationThreshold: 30, // Start optimizing below 30 FPS
    qualityLevel: 'medium' // Use medium quality
});
```

## Audio System Issues

### Issue: Audio Not Working

**Symptoms:**
- No sound effects
- No ambient tones
- Console errors about audio context

**Causes:**
- Web Audio API not supported
- Audio context suspended
- User interaction required
- Audio files not loaded

**Solutions:**

1. **Check Web Audio API Support**
```javascript
function checkAudioSupport() {
    if (!window.AudioContext && !window.webkitAudioContext) {
        console.warn('Web Audio API not supported');
        return false;
    }
    return true;
}

// Initialize with audio fallback
const mascot = new EmotiveMascot({
    canvas: canvas,
    enableAudio: checkAudioSupport(),
    audioFallback: true // Enable fallback for unsupported browsers
});
```

2. **Handle Audio Context Suspension**
```javascript
// Audio context requires user interaction in modern browsers
document.addEventListener('click', async () => {
    const audioContext = mascot.getAudioContext();
    if (audioContext && audioContext.state === 'suspended') {
        try {
            await audioContext.resume();
            console.log('Audio context resumed');
        } catch (error) {
            console.error('Failed to resume audio context:', error);
        }
    }
}, { once: true });
```

3. **Graceful Audio Degradation**
```javascript
const mascot = new EmotiveMascot({
    canvas: canvas,
    enableAudio: true,
    audioGracefulDegradation: true
});

// Handle audio initialization failure
mascot.on('audio:error', (error) => {
    console.warn('Audio system error:', error.message);
    // Continue without audio
});

mascot.on('audio:ready', () => {
    console.log('Audio system initialized successfully');
});
```

### Issue: Audio Latency or Glitches

**Symptoms:**
- Delayed sound effects
- Crackling or distorted audio
- Audio cuts out intermittently

**Solutions:**

1. **Optimize Audio Settings**
```javascript
const mascot = new EmotiveMascot({
    canvas: canvas,
    enableAudio: true,
    audioBufferSize: 2048, // Increase buffer size
    audioSampleRate: 22050, // Reduce sample rate
    audioQuality: 'medium' // Use medium quality
});
```

2. **Reduce Audio Complexity**
```javascript
// Disable ambient tones if experiencing issues
const mascot = new EmotiveMascot({
    canvas: canvas,
    enableAudio: true,
    ambientTones: false, // Disable ambient tones
    gestureSounds: true // Keep gesture sounds only
});
```

## Performance Issues

### Issue: High Memory Usage

**Symptoms:**
- Browser becomes slow
- Memory usage increases over time
- Mobile devices crash or reload

**Solutions:**

1. **Enable Memory Monitoring**
```javascript
const mascot = new EmotiveMascot({
    canvas: canvas,
    memoryMonitoring: true,
    memoryLimit: 25 // MB limit
});

// Monitor memory usage
mascot.on('memory:warning', (usage) => {
    console.warn(`High memory usage: ${usage}MB`);
});

mascot.on('memory:critical', (usage) => {
    console.error(`Critical memory usage: ${usage}MB`);
    // Force cleanup
    mascot.cleanup();
});
```

2. **Implement Periodic Cleanup**
```javascript
// Clean up resources periodically
setInterval(() => {
    mascot.cleanup();
    
    // Force garbage collection if available
    if (window.gc) {
        window.gc();
    }
}, 60000); // Every minute
```

3. **Proper Resource Management**
```javascript
// Ensure proper cleanup on page unload
window.addEventListener('beforeunload', () => {
    mascot.destroy(); // This cleans up all resources
});

// Clean up when switching pages in SPA
function navigateAway() {
    mascot.destroy();
}
```

### Issue: Frame Rate Drops

**Symptoms:**
- Inconsistent FPS
- Stuttering animations
- Performance degrades over time

**Solutions:**

1. **Enable Automatic Optimization**
```javascript
const mascot = new EmotiveMascot({
    canvas: canvas,
    autoOptimize: true,
    performanceMonitoring: true,
    targetFPS: 30 // Set realistic target
});

// Handle performance degradation
mascot.on('performance:degradation', (level) => {
    console.log(`Performance optimized to level: ${level}`);
});
```

2. **Manual Performance Tuning**
```javascript
// Reduce load based on device capabilities
const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isLowEnd = navigator.hardwareConcurrency < 4;

const mascot = new EmotiveMascot({
    canvas: canvas,
    maxParticles: isMobile ? 15 : (isLowEnd ? 25 : 50),
    targetFPS: isMobile ? 30 : 60,
    enableAudio: !isMobile // Disable audio on mobile
});
```

## Integration Issues

### Issue: Framework Integration Problems

**Symptoms:**
- Mascot not initializing in React/Vue/Angular
- Component lifecycle conflicts
- State management issues

**Solutions:**

#### React Integration
```jsx
import React, { useEffect, useRef, useState } from 'react';
import { EmotiveMascot } from 'emotive-communication-engine';

function MascotComponent({ emotion = 'neutral' }) {
    const canvasRef = useRef(null);
    const mascotRef = useRef(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Initialize mascot
        if (canvasRef.current && !mascotRef.current) {
            mascotRef.current = new EmotiveMascot({
                canvas: canvasRef.current,
                autoStart: true
            });

            mascotRef.current.on('ready', () => {
                setIsReady(true);
            });

            mascotRef.current.on('error', (error) => {
                console.error('Mascot error:', error);
            });
        }

        // Cleanup on unmount
        return () => {
            if (mascotRef.current) {
                mascotRef.current.destroy();
                mascotRef.current = null;
            }
        };
    }, []);

    // Update emotion when prop changes
    useEffect(() => {
        if (mascotRef.current && isReady) {
            const result = mascotRef.current.setEmotion(emotion);
            if (!result.success) {
                console.error('Failed to set emotion:', result.error);
            }
        }
    }, [emotion, isReady]);

    return (
        <div>
            <canvas 
                ref={canvasRef} 
                width={300} 
                height={300}
                style={{ border: '1px solid #ccc' }}
            />
            {!isReady && <div>Loading mascot...</div>}
        </div>
    );
}

export default MascotComponent;
```

#### Vue Integration
```vue
<template>
  <div>
    <canvas 
      ref="mascotCanvas" 
      :width="300" 
      :height="300"
      style="border: 1px solid #ccc"
    />
    <div v-if="!isReady">Loading mascot...</div>
  </div>
</template>

<script>
import { EmotiveMascot } from 'emotive-communication-engine';

export default {
  name: 'MascotComponent',
  props: {
    emotion: {
      type: String,
      default: 'neutral'
    }
  },
  data() {
    return {
      mascot: null,
      isReady: false
    };
  },
  mounted() {
    this.initializeMascot();
  },
  beforeUnmount() {
    if (this.mascot) {
      this.mascot.destroy();
    }
  },
  watch: {
    emotion(newEmotion) {
      if (this.mascot && this.isReady) {
        const result = this.mascot.setEmotion(newEmotion);
        if (!result.success) {
          console.error('Failed to set emotion:', result.error);
        }
      }
    }
  },
  methods: {
    initializeMascot() {
      this.mascot = new EmotiveMascot({
        canvas: this.$refs.mascotCanvas,
        autoStart: true
      });

      this.mascot.on('ready', () => {
        this.isReady = true;
      });

      this.mascot.on('error', (error) => {
        console.error('Mascot error:', error);
      });
    }
  }
};
</script>
```

#### Angular Integration
```typescript
import { Component, ElementRef, Input, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { EmotiveMascot } from 'emotive-communication-engine';

@Component({
  selector: 'app-mascot',
  template: `
    <div>
      <canvas 
        #mascotCanvas 
        [width]="300" 
        [height]="300"
        style="border: 1px solid #ccc">
      </canvas>
      <div *ngIf="!isReady">Loading mascot...</div>
    </div>
  `
})
export class MascotComponent implements OnInit, OnDestroy {
  @ViewChild('mascotCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() emotion: string = 'neutral';

  private mascot: EmotiveMascot | null = null;
  public isReady: boolean = false;

  ngOnInit() {
    this.initializeMascot();
  }

  ngOnDestroy() {
    if (this.mascot) {
      this.mascot.destroy();
    }
  }

  ngOnChanges() {
    if (this.mascot && this.isReady) {
      const result = this.mascot.setEmotion(this.emotion);
      if (!result.success) {
        console.error('Failed to set emotion:', result.error);
      }
    }
  }

  private initializeMascot() {
    this.mascot = new EmotiveMascot({
      canvas: this.canvasRef.nativeElement,
      autoStart: true
    });

    this.mascot.on('ready', () => {
      this.isReady = true;
    });

    this.mascot.on('error', (error) => {
      console.error('Mascot error:', error);
    });
  }
}
```

### Issue: Responsive Design Problems

**Symptoms:**
- Canvas doesn't resize properly
- Mascot appears distorted on different screen sizes
- Performance issues on mobile devices

**Solutions:**

1. **Responsive Canvas Setup**
```javascript
class ResponsiveMascot {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.canvas = this.createResponsiveCanvas();
        this.mascot = new EmotiveMascot({
            canvas: this.canvas,
            ...options
        });
        
        this.setupResponsiveHandling();
    }
    
    createResponsiveCanvas() {
        const canvas = document.createElement('canvas');
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.maxWidth = '500px';
        canvas.style.maxHeight = '500px';
        
        this.container.appendChild(canvas);
        this.resizeCanvas();
        
        return canvas;
    }
    
    setupResponsiveHandling() {
        // Handle window resize
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });
        
        // Handle orientation change
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.resizeCanvas();
            }, 100);
        });
    }
    
    resizeCanvas() {
        const containerRect = this.container.getBoundingClientRect();
        const size = Math.min(containerRect.width, containerRect.height, 500);
        
        this.canvas.width = size;
        this.canvas.height = size;
        
        // Notify mascot of resize
        if (this.mascot && this.mascot.canvasManager) {
            this.mascot.canvasManager.handleResize();
        }
    }
}

// Usage
const responsiveMascot = new ResponsiveMascot('mascot-container', {
    enableAudio: false,
    maxParticles: 25
});
```

2. **CSS for Responsive Design**
```css
.mascot-container {
    width: 100%;
    max-width: 500px;
    aspect-ratio: 1;
    margin: 0 auto;
    position: relative;
}

.mascot-container canvas {
    width: 100%;
    height: 100%;
    display: block;
}

/* Mobile optimizations */
@media (max-width: 768px) {
    .mascot-container {
        max-width: 300px;
    }
}

@media (max-width: 480px) {
    .mascot-container {
        max-width: 250px;
    }
}
```

## Error Handling and Recovery

### Issue: Unhandled Errors Crashing Application

**Symptoms:**
- Application stops working
- Console shows unhandled errors
- No graceful degradation

**Solutions:**

1. **Comprehensive Error Handling**
```javascript
const mascot = new EmotiveMascot({
    canvas: canvas,
    errorHandling: 'graceful' // Enable graceful error handling
});

// Handle all error types
mascot.on('error', (error) => {
    console.error('Mascot error:', error);
    
    switch (error.type) {
        case 'canvas-init':
            showUserMessage('Canvas initialization failed. Please refresh the page.');
            break;
        case 'audio-init':
            showUserMessage('Audio not available. Continuing with visual effects only.');
            break;
        case 'performance-critical':
            showUserMessage('Performance issues detected. Reducing quality.');
            break;
        default:
            showUserMessage('An error occurred. Some features may be limited.');
    }
});

// Handle warnings
mascot.on('warning', (warning) => {
    console.warn('Mascot warning:', warning);
    // Log warnings but don't show to user
});

function showUserMessage(message) {
    // Show user-friendly error message
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        
        // Hide after 5 seconds
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
}
```

2. **Automatic Recovery Mechanisms**
```javascript
class RobustMascot {
    constructor(config) {
        this.config = config;
        this.mascot = null;
        this.retryCount = 0;
        this.maxRetries = 3;
        
        this.initialize();
    }
    
    initialize() {
        try {
            this.mascot = new EmotiveMascot(this.config);
            
            this.mascot.on('error', (error) => {
                this.handleError(error);
            });
            
            this.mascot.on('ready', () => {
                this.retryCount = 0; // Reset retry count on success
            });
            
        } catch (error) {
            this.handleInitializationError(error);
        }
    }
    
    handleError(error) {
        console.error('Mascot error:', error);
        
        if (error.severity === 'critical' && this.retryCount < this.maxRetries) {
            this.attemptRecovery();
        }
    }
    
    handleInitializationError(error) {
        console.error('Initialization error:', error);
        
        if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            console.log(`Retrying initialization (${this.retryCount}/${this.maxRetries})...`);
            
            setTimeout(() => {
                this.initialize();
            }, 1000 * this.retryCount); // Exponential backoff
        } else {
            console.error('Failed to initialize after maximum retries');
            this.showFallbackUI();
        }
    }
    
    attemptRecovery() {
        this.retryCount++;
        console.log(`Attempting recovery (${this.retryCount}/${this.maxRetries})...`);
        
        // Clean up current instance
        if (this.mascot) {
            this.mascot.destroy();
        }
        
        // Reinitialize with reduced settings
        const recoveryConfig = {
            ...this.config,
            maxParticles: Math.max(5, (this.config.maxParticles || 50) / 2),
            enableAudio: false,
            qualityLevel: 'low'
        };
        
        setTimeout(() => {
            this.config = recoveryConfig;
            this.initialize();
        }, 1000);
    }
    
    showFallbackUI() {
        // Show static fallback when mascot fails completely
        const canvas = document.getElementById(this.config.canvasId);
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = '#666';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Mascot unavailable', canvas.width / 2, canvas.height / 2);
        }
    }
}

// Usage
const robustMascot = new RobustMascot({
    canvasId: 'mascot-canvas',
    enableAudio: true,
    maxParticles: 50
});
```

## Browser Compatibility Issues

### Issue: Older Browser Support

**Symptoms:**
- Features not working in older browsers
- Console errors about unsupported APIs
- Degraded functionality

**Solutions:**

1. **Feature Detection and Polyfills**
```javascript
// Check for required features
function checkBrowserSupport() {
    const support = {
        canvas: !!document.createElement('canvas').getContext,
        webAudio: !!(window.AudioContext || window.webkitAudioContext),
        requestAnimationFrame: !!window.requestAnimationFrame,
        performance: !!window.performance
    };
    
    return support;
}

// Initialize with appropriate fallbacks
const support = checkBrowserSupport();

const mascot = new EmotiveMascot({
    canvas: canvas,
    enableAudio: support.webAudio,
    polyfills: {
        requestAnimationFrame: !support.requestAnimationFrame,
        performance: !support.performance
    },
    fallbackMode: !support.canvas
});
```

2. **Progressive Enhancement**
```javascript
// Start with basic functionality and enhance
let mascotConfig = {
    canvas: canvas,
    enableAudio: false,
    maxParticles: 10,
    qualityLevel: 'low'
};

// Enhance for modern browsers
if (checkBrowserSupport().webAudio) {
    mascotConfig.enableAudio = true;
}

if (navigator.hardwareConcurrency > 4) {
    mascotConfig.maxParticles = 50;
    mascotConfig.qualityLevel = 'high';
}

const mascot = new EmotiveMascot(mascotConfig);
```

## Debugging and Diagnostics

### Enable Debug Mode

```javascript
const mascot = new EmotiveMascot({
    canvas: canvas,
    debug: true,
    verbose: true // Extra detailed logging
});

// Access debug information
mascot.on('debug', (info) => {
    console.log('Debug:', info);
});

// Get diagnostic information
const diagnostics = mascot.getDiagnostics();
console.log('Diagnostics:', diagnostics);
```

### Performance Profiling

```javascript
// Profile specific operations
console.time('mascot-init');
const mascot = new EmotiveMascot({ canvas: canvas });
console.timeEnd('mascot-init');

// Monitor frame performance
mascot.on('frameStart', () => {
    console.time('frame');
});

mascot.on('frameEnd', () => {
    console.timeEnd('frame');
});

// Memory usage tracking
setInterval(() => {
    const metrics = mascot.getPerformanceMetrics();
    console.log('Memory usage:', metrics.memoryUsage, 'MB');
}, 5000);
```

### Common Debug Commands

```javascript
// Check system status
console.log('Mascot status:', mascot.getStatus());

// Validate configuration
console.log('Config validation:', mascot.validateConfig());

// Check feature support
console.log('Feature support:', mascot.getFeatureSupport());

// Get performance report
console.log('Performance report:', mascot.getPerformanceReport());

// List active optimizations
console.log('Active optimizations:', mascot.getActiveOptimizations());
```

## Getting Help

If you're still experiencing issues after trying these solutions:

1. **Check the Console**: Look for error messages and warnings
2. **Enable Debug Mode**: Use `debug: true` in your configuration
3. **Test in Different Browsers**: Isolate browser-specific issues
4. **Reduce Complexity**: Start with minimal configuration and add features gradually
5. **Check Performance**: Use the performance monitoring tools
6. **Review Integration**: Ensure proper framework integration patterns

For additional support, refer to:
- [Integration Guide](./INTEGRATION_GUIDE.md) for framework-specific help
- [Performance Guide](./PERFORMANCE.md) for optimization strategies
- [Browser Compatibility](./BROWSER_COMPATIBILITY.md) for browser-specific issues