# Emotive Communication Engine - Integration Guide

## Table of Contents
1. [Quick Start](#quick-start)
2. [Framework Integration](#framework-integration)
3. [AI Agent Integration](#ai-agent-integration)
4. [Chatbot Integration](#chatbot-integration)
5. [Canvas Sizing and Responsive Design](#canvas-sizing-and-responsive-design)
6. [Audio Integration](#audio-integration)
7. [Error Handling Patterns](#error-handling-patterns)
8. [Gesture Patterns](#gesture-patterns)
9. [Mobile Integration](#mobile-integration)
10. [Performance Optimization](#performance-optimization)
11. [Advanced Usage](#advanced-usage)

## Quick Start

### Basic Setup

```javascript
import { EmotiveMascot } from 'emotive-communication-engine';

// Initialize the mascot
const mascot = new EmotiveMascot({
    canvas: document.getElementById('my-canvas'),
    enableAudio: true,
    targetFPS: 60,
    maxParticles: 50
});

// Start the animation
mascot.start();

// Express emotions and gestures
mascot.setEmotion('joy')
      .express('bounce')
      .chain('pulse', 'spin');
```

### Configuration Options

```javascript
const config = {
    canvas: canvasElement,          // Canvas element or ID
    targetFPS: 60,                  // Target frame rate (15-120)
    enableAudio: true,              // Enable ambient sounds and effects
    masterVolume: 0.5,              // Audio volume (0.0-1.0)
    maxParticles: 50,               // Maximum particle count (10-200)
    initialEmotion: 'neutral',      // Initial emotional state
    performanceMonitoring: true,    // Enable performance tracking
    autoOptimize: true,             // Enable automatic optimization
    accessibility: {                // Accessibility options
        reducedMotion: 'auto',      // Respect user preferences
        highContrast: 'auto'
    }
};
```

## Framework Integration

### React Integration

#### Basic React Component

```jsx
import React, { useEffect, useRef, useState } from 'react';
import { EmotiveMascot } from 'emotive-communication-engine';

function MascotComponent({ 
    emotion = 'neutral', 
    width = 300, 
    height = 300,
    enableAudio = true,
    onReady = () => {},
    onError = () => {}
}) {
    const canvasRef = useRef(null);
    const mascotRef = useRef(null);
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState(null);

    // Initialize mascot
    useEffect(() => {
        if (canvasRef.current && !mascotRef.current) {
            try {
                mascotRef.current = new EmotiveMascot({
                    canvas: canvasRef.current,
                    enableAudio,
                    autoStart: true,
                    performanceMonitoring: true
                });

                // Handle ready event
                mascotRef.current.on('ready', () => {
                    setIsReady(true);
                    onReady();
                });

                // Handle errors
                mascotRef.current.on('error', (err) => {
                    console.error('Mascot error:', err);
                    setError(err.message);
                    onError(err);
                });

                // Handle performance warnings
                mascotRef.current.on('performance:degradation', (level) => {
                    console.warn(`Performance degraded to level: ${level}`);
                });

            } catch (err) {
                console.error('Failed to initialize mascot:', err);
                setError(err.message);
                onError(err);
            }
        }

        // Cleanup on unmount
        return () => {
            if (mascotRef.current) {
                mascotRef.current.destroy();
                mascotRef.current = null;
            }
        };
    }, [enableAudio, onReady, onError]);

    // Update emotion when prop changes
    useEffect(() => {
        if (mascotRef.current && isReady) {
            const result = mascotRef.current.setEmotion(emotion);
            if (!result.success) {
                console.error('Failed to set emotion:', result.error);
                setError(result.error.message);
            }
        }
    }, [emotion, isReady]);

    // Handle canvas resize
    useEffect(() => {
        if (canvasRef.current) {
            canvasRef.current.width = width;
            canvasRef.current.height = height;
            
            if (mascotRef.current && isReady) {
                mascotRef.current.handleResize();
            }
        }
    }, [width, height, isReady]);

    return (
        <div className="mascot-container">
            <canvas 
                ref={canvasRef} 
                width={width} 
                height={height}
                style={{ 
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    display: 'block'
                }}
            />
            {!isReady && !error && (
                <div className="mascot-loading">Loading mascot...</div>
            )}
            {error && (
                <div className="mascot-error">
                    Error: {error}
                </div>
            )}
        </div>
    );
}

// Advanced React Hook for mascot management
function useMascot(canvasRef, options = {}) {
    const [mascot, setMascot] = useState(null);
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState(null);
    const [performance, setPerformance] = useState(null);

    useEffect(() => {
        if (canvasRef.current && !mascot) {
            try {
                const newMascot = new EmotiveMascot({
                    canvas: canvasRef.current,
                    ...options
                });

                newMascot.on('ready', () => {
                    setIsReady(true);
                    setError(null);
                });

                newMascot.on('error', (err) => {
                    setError(err);
                });

                newMascot.on('performance:update', (metrics) => {
                    setPerformance(metrics);
                });

                setMascot(newMascot);

            } catch (err) {
                setError(err);
            }
        }

        return () => {
            if (mascot) {
                mascot.destroy();
            }
        };
    }, [canvasRef, options]);

    const setEmotion = (emotion, options) => {
        if (mascot && isReady) {
            return mascot.setEmotion(emotion, options);
        }
        return { success: false, error: { message: 'Mascot not ready' } };
    };

    const express = (gesture) => {
        if (mascot && isReady) {
            return mascot.express(gesture);
        }
        return { success: false, error: { message: 'Mascot not ready' } };
    };

    return {
        mascot,
        isReady,
        error,
        performance,
        setEmotion,
        express
    };
}

export default MascotComponent;
export { useMascot };
```

#### React Context for Global Mascot State

```jsx
import React, { createContext, useContext, useReducer } from 'react';

const MascotContext = createContext();

const mascotReducer = (state, action) => {
    switch (action.type) {
        case 'SET_EMOTION':
            return { ...state, emotion: action.emotion };
        case 'SET_PERFORMANCE':
            return { ...state, performance: action.performance };
        case 'SET_ERROR':
            return { ...state, error: action.error };
        case 'CLEAR_ERROR':
            return { ...state, error: null };
        default:
            return state;
    }
};

export function MascotProvider({ children }) {
    const [state, dispatch] = useReducer(mascotReducer, {
        emotion: 'neutral',
        performance: null,
        error: null
    });

    const setEmotion = (emotion) => {
        dispatch({ type: 'SET_EMOTION', emotion });
    };

    const setPerformance = (performance) => {
        dispatch({ type: 'SET_PERFORMANCE', performance });
    };

    const setError = (error) => {
        dispatch({ type: 'SET_ERROR', error });
    };

    const clearError = () => {
        dispatch({ type: 'CLEAR_ERROR' });
    };

    return (
        <MascotContext.Provider value={{
            ...state,
            setEmotion,
            setPerformance,
            setError,
            clearError
        }}>
            {children}
        </MascotContext.Provider>
    );
}

export const useMascotContext = () => {
    const context = useContext(MascotContext);
    if (!context) {
        throw new Error('useMascotContext must be used within MascotProvider');
    }
    return context;
};
```

### Vue.js Integration

#### Vue 3 Composition API

```vue
<template>
  <div class="mascot-container">
    <canvas 
      ref="mascotCanvas" 
      :width="width" 
      :height="height"
      :style="canvasStyle"
    />
    <div v-if="!isReady && !error" class="mascot-loading">
      Loading mascot...
    </div>
    <div v-if="error" class="mascot-error">
      Error: {{ error }}
    </div>
    <div v-if="performance" class="mascot-performance">
      FPS: {{ performance.fps }} | Memory: {{ performance.memoryUsage }}MB
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { EmotiveMascot } from 'emotive-communication-engine';

// Props
const props = defineProps({
  emotion: {
    type: String,
    default: 'neutral'
  },
  width: {
    type: Number,
    default: 300
  },
  height: {
    type: Number,
    default: 300
  },
  enableAudio: {
    type: Boolean,
    default: true
  }
});

// Emits
const emit = defineEmits(['ready', 'error', 'performance-update']);

// Refs
const mascotCanvas = ref(null);
const mascot = ref(null);
const isReady = ref(false);
const error = ref(null);
const performance = ref(null);

// Computed
const canvasStyle = computed(() => ({
  border: '1px solid #ccc',
  borderRadius: '8px',
  display: 'block'
}));

// Methods
const initializeMascot = () => {
  if (!mascotCanvas.value) return;

  try {
    mascot.value = new EmotiveMascot({
      canvas: mascotCanvas.value,
      enableAudio: props.enableAudio,
      autoStart: true,
      performanceMonitoring: true
    });

    mascot.value.on('ready', () => {
      isReady.value = true;
      error.value = null;
      emit('ready');
    });

    mascot.value.on('error', (err) => {
      error.value = err.message;
      emit('error', err);
    });

    mascot.value.on('performance:update', (metrics) => {
      performance.value = metrics;
      emit('performance-update', metrics);
    });

  } catch (err) {
    error.value = err.message;
    emit('error', err);
  }
};

const updateEmotion = (newEmotion) => {
  if (mascot.value && isReady.value) {
    const result = mascot.value.setEmotion(newEmotion);
    if (!result.success) {
      error.value = result.error.message;
    }
  }
};

// Lifecycle
onMounted(() => {
  initializeMascot();
});

onUnmounted(() => {
  if (mascot.value) {
    mascot.value.destroy();
  }
});

// Watchers
watch(() => props.emotion, updateEmotion);

watch([() => props.width, () => props.height], () => {
  if (mascotCanvas.value) {
    mascotCanvas.value.width = props.width;
    mascotCanvas.value.height = props.height;
    
    if (mascot.value && isReady.value) {
      mascot.value.handleResize();
    }
  }
});

// Expose methods for parent component
defineExpose({
  express: (gesture) => {
    if (mascot.value && isReady.value) {
      return mascot.value.express(gesture);
    }
    return { success: false, error: { message: 'Mascot not ready' } };
  },
  setEmotion: updateEmotion,
  getMascot: () => mascot.value
});
</script>

<style scoped>
.mascot-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.mascot-loading {
  color: #666;
  font-style: italic;
}

.mascot-error {
  color: #d32f2f;
  font-weight: bold;
}

.mascot-performance {
  font-size: 12px;
  color: #666;
  font-family: monospace;
}
</style>
```

#### Vue 2 Options API

```vue
<template>
  <div class="mascot-container">
    <canvas 
      ref="mascotCanvas" 
      :width="width" 
      :height="height"
      style="border: 1px solid #ccc; border-radius: 8px; display: block;"
    />
    <div v-if="!isReady && !error">Loading mascot...</div>
    <div v-if="error" class="error">Error: {{ error }}</div>
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
    },
    width: {
      type: Number,
      default: 300
    },
    height: {
      type: Number,
      default: 300
    },
    enableAudio: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      mascot: null,
      isReady: false,
      error: null
    };
  },
  mounted() {
    this.initializeMascot();
  },
  beforeDestroy() {
    if (this.mascot) {
      this.mascot.destroy();
    }
  },
  watch: {
    emotion(newEmotion) {
      this.updateEmotion(newEmotion);
    },
    width() {
      this.handleResize();
    },
    height() {
      this.handleResize();
    }
  },
  methods: {
    initializeMascot() {
      try {
        this.mascot = new EmotiveMascot({
          canvas: this.$refs.mascotCanvas,
          enableAudio: this.enableAudio,
          autoStart: true
        });

        this.mascot.on('ready', () => {
          this.isReady = true;
          this.error = null;
          this.$emit('ready');
        });

        this.mascot.on('error', (error) => {
          this.error = error.message;
          this.$emit('error', error);
        });

      } catch (error) {
        this.error = error.message;
        this.$emit('error', error);
      }
    },
    
    updateEmotion(emotion) {
      if (this.mascot && this.isReady) {
        const result = this.mascot.setEmotion(emotion);
        if (!result.success) {
          this.error = result.error.message;
        }
      }
    },
    
    handleResize() {
      if (this.$refs.mascotCanvas) {
        this.$refs.mascotCanvas.width = this.width;
        this.$refs.mascotCanvas.height = this.height;
        
        if (this.mascot && this.isReady) {
          this.mascot.handleResize();
        }
      }
    },
    
    express(gesture) {
      if (this.mascot && this.isReady) {
        return this.mascot.express(gesture);
      }
      return { success: false, error: { message: 'Mascot not ready' } };
    }
  }
};
</script>
```

### Angular Integration

#### Angular Component

```typescript
import { 
  Component, 
  ElementRef, 
  Input, 
  Output, 
  EventEmitter,
  OnInit, 
  OnDestroy, 
  OnChanges,
  SimpleChanges,
  ViewChild,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { EmotiveMascot } from 'emotive-communication-engine';

@Component({
  selector: 'app-mascot',
  template: `
    <div class="mascot-container">
      <canvas 
        #mascotCanvas 
        [width]="width" 
        [height]="height"
        [style.border]="'1px solid #ccc'"
        [style.borderRadius]="'8px'"
        [style.display]="'block'">
      </canvas>
      <div *ngIf="!isReady && !error" class="mascot-loading">
        Loading mascot...
      </div>
      <div *ngIf="error" class="mascot-error">
        Error: {{ error }}
      </div>
      <div *ngIf="performance" class="mascot-performance">
        FPS: {{ performance.fps }} | Memory: {{ performance.memoryUsage }}MB
      </div>
    </div>
  `,
  styleUrls: ['./mascot.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MascotComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild('mascotCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  
  @Input() emotion: string = 'neutral';
  @Input() width: number = 300;
  @Input() height: number = 300;
  @Input() enableAudio: boolean = true;
  
  @Output() ready = new EventEmitter<void>();
  @Output() error = new EventEmitter<any>();
  @Output() performanceUpdate = new EventEmitter<any>();

  private mascot: EmotiveMascot | null = null;
  public isReady: boolean = false;
  public error: string | null = null;
  public performance: any = null;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.initializeMascot();
  }

  ngOnDestroy() {
    if (this.mascot) {
      this.mascot.destroy();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['emotion'] && this.mascot && this.isReady) {
      this.updateEmotion(changes['emotion'].currentValue);
    }
    
    if ((changes['width'] || changes['height']) && this.canvasRef) {
      this.handleResize();
    }
  }

  private initializeMascot() {
    try {
      this.mascot = new EmotiveMascot({
        canvas: this.canvasRef.nativeElement,
        enableAudio: this.enableAudio,
        autoStart: true,
        performanceMonitoring: true
      });

      this.mascot.on('ready', () => {
        this.isReady = true;
        this.error = null;
        this.ready.emit();
        this.cdr.detectChanges();
      });

      this.mascot.on('error', (err: any) => {
        this.error = err.message;
        this.error.emit(err);
        this.cdr.detectChanges();
      });

      this.mascot.on('performance:update', (metrics: any) => {
        this.performance = metrics;
        this.performanceUpdate.emit(metrics);
        this.cdr.detectChanges();
      });

    } catch (err: any) {
      this.error = err.message;
      this.error.emit(err);
      this.cdr.detectChanges();
    }
  }

  private updateEmotion(emotion: string) {
    if (this.mascot && this.isReady) {
      const result = this.mascot.setEmotion(emotion);
      if (!result.success) {
        this.error = result.error.message;
        this.cdr.detectChanges();
      }
    }
  }

  private handleResize() {
    if (this.canvasRef) {
      const canvas = this.canvasRef.nativeElement;
      canvas.width = this.width;
      canvas.height = this.height;
      
      if (this.mascot && this.isReady) {
        this.mascot.handleResize();
      }
    }
  }

  public express(gesture: string) {
    if (this.mascot && this.isReady) {
      return this.mascot.express(gesture);
    }
    return { success: false, error: { message: 'Mascot not ready' } };
  }

  public getMascot(): EmotiveMascot | null {
    return this.mascot;
  }
}
```

#### Angular Service for Global Mascot Management

```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { EmotiveMascot } from 'emotive-communication-engine';

interface MascotState {
  emotion: string;
  isReady: boolean;
  error: string | null;
  performance: any;
}

@Injectable({
  providedIn: 'root'
})
export class MascotService {
  private stateSubject = new BehaviorSubject<MascotState>({
    emotion: 'neutral',
    isReady: false,
    error: null,
    performance: null
  });

  public state$: Observable<MascotState> = this.stateSubject.asObservable();
  private mascots: Map<string, EmotiveMascot> = new Map();

  registerMascot(id: string, mascot: EmotiveMascot) {
    this.mascots.set(id, mascot);
    
    mascot.on('ready', () => {
      this.updateState({ isReady: true, error: null });
    });
    
    mascot.on('error', (error) => {
      this.updateState({ error: error.message });
    });
    
    mascot.on('performance:update', (performance) => {
      this.updateState({ performance });
    });
  }

  unregisterMascot(id: string) {
    const mascot = this.mascots.get(id);
    if (mascot) {
      mascot.destroy();
      this.mascots.delete(id);
    }
  }

  setGlobalEmotion(emotion: string) {
    this.mascots.forEach(mascot => {
      mascot.setEmotion(emotion);
    });
    this.updateState({ emotion });
  }

  expressGlobal(gesture: string) {
    this.mascots.forEach(mascot => {
      mascot.express(gesture);
    });
  }

  private updateState(partialState: Partial<MascotState>) {
    const currentState = this.stateSubject.value;
    this.stateSubject.next({ ...currentState, ...partialState });
  }

  getCurrentState(): MascotState {
    return this.stateSubject.value;
  }
}
```

### Svelte Integration

```svelte
<script>
  import { onMount, onDestroy } from 'svelte';
  import { EmotiveMascot } from 'emotive-communication-engine';

  export let emotion = 'neutral';
  export let width = 300;
  export let height = 300;
  export let enableAudio = true;

  let canvas;
  let mascot = null;
  let isReady = false;
  let error = null;
  let performance = null;

  onMount(() => {
    initializeMascot();
  });

  onDestroy(() => {
    if (mascot) {
      mascot.destroy();
    }
  });

  function initializeMascot() {
    try {
      mascot = new EmotiveMascot({
        canvas: canvas,
        enableAudio: enableAudio,
        autoStart: true,
        performanceMonitoring: true
      });

      mascot.on('ready', () => {
        isReady = true;
        error = null;
      });

      mascot.on('error', (err) => {
        error = err.message;
      });

      mascot.on('performance:update', (metrics) => {
        performance = metrics;
      });

    } catch (err) {
      error = err.message;
    }
  }

  function updateEmotion(newEmotion) {
    if (mascot && isReady) {
      const result = mascot.setEmotion(newEmotion);
      if (!result.success) {
        error = result.error.message;
      }
    }
  }

  export function express(gesture) {
    if (mascot && isReady) {
      return mascot.express(gesture);
    }
    return { success: false, error: { message: 'Mascot not ready' } };
  }

  // Reactive statements
  $: if (mascot && isReady) updateEmotion(emotion);
  $: if (canvas) {
    canvas.width = width;
    canvas.height = height;
    if (mascot && isReady) {
      mascot.handleResize();
    }
  }
</script>

<div class="mascot-container">
  <canvas 
    bind:this={canvas}
    {width}
    {height}
    style="border: 1px solid #ccc; border-radius: 8px; display: block;"
  />
  
  {#if !isReady && !error}
    <div class="loading">Loading mascot...</div>
  {/if}
  
  {#if error}
    <div class="error">Error: {error}</div>
  {/if}
  
  {#if performance}
    <div class="performance">
      FPS: {performance.fps} | Memory: {performance.memoryUsage}MB
    </div>
  {/if}
</div>

<style>
  .mascot-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }

  .loading {
    color: #666;
    font-style: italic;
  }

  .error {
    color: #d32f2f;
    font-weight: bold;
  }

  .performance {
    font-size: 12px;
    color: #666;
    font-family: monospace;
  }
</style>
```

## Canvas Sizing and Responsive Design

### Responsive Canvas Implementation

```javascript
class ResponsiveEmotiveMascot {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' 
            ? document.getElementById(container) 
            : container;
        
        this.options = {
            minSize: 200,
            maxSize: 500,
            aspectRatio: 1,
            maintainAspectRatio: true,
            ...options
        };
        
        this.canvas = this.createResponsiveCanvas();
        this.mascot = new EmotiveMascot({
            canvas: this.canvas,
            ...options
        });
        
        this.setupResponsiveHandling();
        this.setupIntersectionObserver();
    }
    
    createResponsiveCanvas() {
        const canvas = document.createElement('canvas');
        
        // Set CSS for responsive behavior
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.maxWidth = `${this.options.maxSize}px`;
        canvas.style.maxHeight = `${this.options.maxSize}px`;
        canvas.style.minWidth = `${this.options.minSize}px`;
        canvas.style.minHeight = `${this.options.minSize}px`;
        canvas.style.display = 'block';
        
        this.container.appendChild(canvas);
        this.updateCanvasSize();
        
        return canvas;
    }
    
    setupResponsiveHandling() {
        // Debounced resize handler
        let resizeTimeout;
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.updateCanvasSize();
            }, 100);
        };
        
        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', () => {
            setTimeout(handleResize, 100);
        });
        
        // Store cleanup function
        this.cleanup = () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(resizeTimeout);
        };
    }
    
    setupIntersectionObserver() {
        // Pause animation when not visible
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.mascot.resume();
                } else {
                    this.mascot.pause();
                }
            });
        }, { threshold: 0.1 });
        
        this.observer.observe(this.canvas);
    }
    
    updateCanvasSize() {
        const containerRect = this.container.getBoundingClientRect();
        const { minSize, maxSize, aspectRatio, maintainAspectRatio } = this.options;
        
        let width = containerRect.width;
        let height = containerRect.height;
        
        // Apply size constraints
        width = Math.max(minSize, Math.min(maxSize, width));
        height = Math.max(minSize, Math.min(maxSize, height));
        
        // Maintain aspect ratio if required
        if (maintainAspectRatio) {
            const size = Math.min(width, height);
            width = size;
            height = size / aspectRatio;
        }
        
        // Update canvas dimensions
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = width * dpr;
        this.canvas.height = height * dpr;
        
        // Scale canvas back down using CSS
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
        
        // Scale the drawing context
        const ctx = this.canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        
        // Notify mascot of resize
        if (this.mascot && this.mascot.handleResize) {
            this.mascot.handleResize();
        }
    }
    
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
        if (this.cleanup) {
            this.cleanup();
        }
        if (this.mascot) {
            this.mascot.destroy();
        }
    }
    
    // Proxy mascot methods
    setEmotion(...args) { return this.mascot.setEmotion(...args); }
    express(...args) { return this.mascot.express(...args); }
    chain(...args) { return this.mascot.chain(...args); }
    start() { return this.mascot.start(); }
    stop() { return this.mascot.stop(); }
}

// Usage
const responsiveMascot = new ResponsiveEmotiveMascot('mascot-container', {
    enableAudio: false,
    maxParticles: 25,
    minSize: 200,
    maxSize: 400
});
```

### CSS Grid and Flexbox Integration

```css
/* Flexbox container */
.mascot-flex-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;
    padding: 20px;
}

.mascot-flex-container canvas {
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
}

/* CSS Grid integration */
.mascot-grid-container {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    grid-template-rows: 1fr auto 1fr;
    min-height: 400px;
    gap: 20px;
}

.mascot-grid-item {
    grid-column: 2;
    grid-row: 2;
    display: flex;
    justify-content: center;
    align-items: center;
}

/* Responsive breakpoints */
@media (max-width: 768px) {
    .mascot-flex-container {
        min-height: 250px;
        padding: 10px;
    }
    
    .mascot-grid-container {
        min-height: 300px;
        gap: 10px;
    }
}

@media (max-width: 480px) {
    .mascot-flex-container {
        min-height: 200px;
        padding: 5px;
    }
    
    .mascot-grid-container {
        min-height: 250px;
        gap: 5px;
    }
}

/* Container queries (modern browsers) */
@container (max-width: 400px) {
    .mascot-container canvas {
        max-width: 200px;
        max-height: 200px;
    }
}

@container (min-width: 600px) {
    .mascot-container canvas {
        max-width: 400px;
        max-height: 400px;
    }
}
```

## Audio Integration

### Web Audio API Setup and Best Practices

```javascript
class AudioIntegrationManager {
    constructor(mascot) {
        this.mascot = mascot;
        this.audioContext = null;
        this.isAudioEnabled = false;
        this.userInteractionRequired = true;
        
        this.setupAudioIntegration();
    }
    
    async setupAudioIntegration() {
        // Check Web Audio API support
        if (!this.checkWebAudioSupport()) {
            console.warn('Web Audio API not supported');
            return false;
        }
        
        // Initialize audio context
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Handle audio context state changes
            this.audioContext.addEventListener('statechange', () => {
                console.log('Audio context state:', this.audioContext.state);
                this.handleAudioStateChange();
            });
            
            // Enable audio in mascot
            this.mascot.enableAudio(this.audioContext);
            this.isAudioEnabled = true;
            
            return true;
            
        } catch (error) {
            console.error('Failed to initialize audio context:', error);
            return false;
        }
    }
    
    checkWebAudioSupport() {
        return !!(window.AudioContext || window.webkitAudioContext);
    }
    
    handleAudioStateChange() {
        switch (this.audioContext.state) {
            case 'suspended':
                this.userInteractionRequired = true;
                this.showAudioPrompt();
                break;
            case 'running':
                this.userInteractionRequired = false;
                this.hideAudioPrompt();
                break;
            case 'closed':
                this.isAudioEnabled = false;
                break;
        }
    }
    
    async enableAudioWithUserInteraction() {
        if (!this.audioContext || this.audioContext.state !== 'suspended') {
            return false;
        }
        
        try {
            await this.audioContext.resume();
            console.log('Audio context resumed successfully');
            return true;
        } catch (error) {
            console.error('Failed to resume audio context:', error);
            return false;
        }
    }
    
    showAudioPrompt() {
        // Create audio enable button
        const prompt = document.createElement('div');
        prompt.id = 'audio-enable-prompt';
        prompt.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: #2196F3;
                color: white;
                padding: 10px 15px;
                border-radius: 5px;
                cursor: pointer;
                z-index: 1000;
                font-family: Arial, sans-serif;
                font-size: 14px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            ">
                🔊 Click to enable audio
            </div>
        `;
        
        prompt.addEventListener('click', async () => {
            const success = await this.enableAudioWithUserInteraction();
            if (success) {
                this.hideAudioPrompt();
            }
        });
        
        document.body.appendChild(prompt);
    }
    
    hideAudioPrompt() {
        const prompt = document.getElementById('audio-enable-prompt');
        if (prompt) {
            prompt.remove();
        }
    }
    
    // Audio effect management
    createCustomAudioEffect(name, audioBuffer) {
        if (!this.isAudioEnabled) return false;
        
        return this.mascot.registerAudioEffect(name, {
            buffer: audioBuffer,
            volume: 0.5,
            playbackRate: 1.0
        });
    }
    
    // Spatial audio for multiple mascots
    setupSpatialAudio(mascotId, x, y) {
        if (!this.isAudioEnabled) return false;
        
        const panner = this.audioContext.createPanner();
        panner.panningModel = 'HRTF';
        panner.distanceModel = 'inverse';
        panner.refDistance = 1;
        panner.maxDistance = 10000;
        panner.rolloffFactor = 1;
        panner.coneInnerAngle = 360;
        panner.coneOuterAngle = 0;
        panner.coneOuterGain = 0;
        
        // Set position
        panner.positionX.setValueAtTime(x, this.audioContext.currentTime);
        panner.positionY.setValueAtTime(y, this.audioContext.currentTime);
        panner.positionZ.setValueAtTime(-1, this.audioContext.currentTime);
        
        return panner;
    }
    
    // Audio visualization
    setupAudioVisualization() {
        if (!this.isAudioEnabled) return null;
        
        const analyser = this.audioContext.createAnalyser();
        analyser.fftSize = 256;
        
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        return {
            analyser,
            dataArray,
            getFrequencyData: () => {
                analyser.getByteFrequencyData(dataArray);
                return dataArray;
            }
        };
    }
}

// Usage example
const audioManager = new AudioIntegrationManager(mascot);

// Custom audio effects
fetch('/path/to/custom-sound.wav')
    .then(response => response.arrayBuffer())
    .then(data => audioManager.audioContext.decodeAudioData(data))
    .then(buffer => {
        audioManager.createCustomAudioEffect('customSound', buffer);
    });
```

### Audio Reactive Features

```javascript
class AudioReactiveMascot {
    constructor(canvas, options = {}) {
        this.mascot = new EmotiveMascot({
            canvas: canvas,
            enableAudio: true,
            ...options
        });
        
        this.audioAnalyser = null;
        this.microphoneStream = null;
        this.isListening = false;
        
        this.setupAudioReactivity();
    }
    
    async setupAudioReactivity() {
        try {
            // Get microphone access
            this.microphoneStream = await navigator.mediaDevices.getUserMedia({ 
                audio: true 
            });
            
            // Create audio context and analyser
            const audioContext = this.mascot.getAudioContext();
            const source = audioContext.createMediaStreamSource(this.microphoneStream);
            
            this.audioAnalyser = audioContext.createAnalyser();
            this.audioAnalyser.fftSize = 256;
            this.audioAnalyser.smoothingTimeConstant = 0.8;
            
            source.connect(this.audioAnalyser);
            
            // Start audio analysis
            this.startAudioAnalysis();
            
        } catch (error) {
            console.error('Failed to setup audio reactivity:', error);
        }
    }
    
    startAudioAnalysis() {
        if (!this.audioAnalyser) return;
        
        this.isListening = true;
        const bufferLength = this.audioAnalyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const analyze = () => {
            if (!this.isListening) return;
            
            this.audioAnalyser.getByteFrequencyData(dataArray);
            
            // Calculate audio level
            const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
            const normalizedLevel = average / 255;
            
            // React to audio level
            this.reactToAudioLevel(normalizedLevel, dataArray);
            
            requestAnimationFrame(analyze);
        };
        
        analyze();
    }
    
    reactToAudioLevel(level, frequencyData) {
        // Volume-based reactions
        if (level > 0.7) {
            this.mascot.express('bounce');
        } else if (level > 0.4) {
            this.mascot.express('pulse');
        }
        
        // Frequency-based reactions
        const lowFreq = this.getFrequencyRange(frequencyData, 0, 64);
        const midFreq = this.getFrequencyRange(frequencyData, 64, 128);
        const highFreq = this.getFrequencyRange(frequencyData, 128, 256);
        
        // React to different frequency ranges
        if (lowFreq > 0.6) {
            this.mascot.setEmotion('joy', 'intense');
        } else if (midFreq > 0.6) {
            this.mascot.setEmotion('surprise');
        } else if (highFreq > 0.6) {
            this.mascot.setEmotion('excitement');
        }
        
        // Adjust particle behavior based on audio
        const particleCount = Math.floor(level * 50);
        this.mascot.setParticleCount(particleCount);
    }
    
    getFrequencyRange(data, start, end) {
        const slice = data.slice(start, end);
        const average = slice.reduce((sum, value) => sum + value, 0) / slice.length;
        return average / 255;
    }
    
    stopListening() {
        this.isListening = false;
        
        if (this.microphoneStream) {
            this.microphoneStream.getTracks().forEach(track => track.stop());
        }
    }
    
    destroy() {
        this.stopListening();
        this.mascot.destroy();
    }
}

// Usage
const audioReactiveMascot = new AudioReactiveMascot(canvas, {
    maxParticles: 75,
    enableAudio: true
});
```

## Error Handling Patterns

### Comprehensive Error Management System

```javascript
class MascotErrorHandler {
    constructor() {
        this.errorLog = [];
        this.errorCallbacks = new Map();
        this.recoveryStrategies = new Map();
        this.maxRetries = 3;
        this.retryDelays = [1000, 2000, 5000]; // Progressive delays
        
        this.setupGlobalErrorHandling();
        this.registerDefaultRecoveryStrategies();
    }
    
    setupGlobalErrorHandling() {
        // Catch unhandled errors
        window.addEventListener('error', (event) => {
            this.handleGlobalError({
                type: 'javascript',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error
            });
        });
        
        // Catch unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleGlobalError({
                type: 'promise',
                message: event.reason?.message || 'Unhandled promise rejection',
                reason: event.reason
            });
        });
    }
    
    registerDefaultRecoveryStrategies() {
        // Canvas context recovery
        this.recoveryStrategies.set('canvas-context-lost', async (mascot, error) => {
            console.log('Attempting canvas context recovery...');
            
            // Wait for context restoration
            await new Promise(resolve => {
                const canvas = mascot.canvas;
                canvas.addEventListener('webglcontextrestored', resolve, { once: true });
                
                // Trigger context restoration
                const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                if (gl) {
                    gl.getExtension('WEBGL_lose_context')?.restoreContext();
                }
                
                // Fallback timeout
                setTimeout(resolve, 2000);
            });
            
            // Reinitialize mascot
            mascot.reinitialize();
            return true;
        });
        
        // Audio context recovery
        this.recoveryStrategies.set('audio-context-suspended', async (mascot, error) => {
            console.log('Attempting audio context recovery...');
            
            const audioContext = mascot.getAudioContext();
            if (audioContext && audioContext.state === 'suspended') {
                try {
                    await audioContext.resume();
                    return true;
                } catch (resumeError) {
                    console.error('Failed to resume audio context:', resumeError);
                    // Disable audio and continue
                    mascot.disableAudio();
                    return true;
                }
            }
            return false;
        });
        
        // Performance recovery
        this.recoveryStrategies.set('performance-critical', async (mascot, error) => {
            console.log('Applying performance recovery...');
            
            // Reduce quality settings
            mascot.setMaxParticles(Math.max(5, mascot.getMaxParticles() / 2));
            mascot.setTargetFPS(Math.max(15, mascot.getTargetFPS() / 2));
            mascot.disableAudio();
            
            // Clear particle system
            mascot.clearParticles();
            
            return true;
        });
        
        // Memory pressure recovery
        this.recoveryStrategies.set('memory-pressure', async (mascot, error) => {
            console.log('Applying memory pressure recovery...');
            
            // Force cleanup
            mascot.cleanup();
            
            // Reduce memory usage
            mascot.setMaxParticles(10);
            mascot.clearCaches();
            
            // Force garbage collection if available
            if (window.gc) {
                window.gc();
            }
            
            return true;
        });
    }
    
    handleMascotError(mascot, error) {
        // Log the error
        this.logError(error);
        
        // Notify error callbacks
        this.notifyErrorCallbacks(error);
        
        // Attempt recovery if strategy exists
        const strategy = this.recoveryStrategies.get(error.type);
        if (strategy) {
            this.attemptRecovery(mascot, error, strategy);
        } else {
            console.error('No recovery strategy for error type:', error.type);
        }
    }
    
    async attemptRecovery(mascot, error, strategy) {
        const retryCount = error.retryCount || 0;
        
        if (retryCount >= this.maxRetries) {
            console.error('Maximum retry attempts reached for error:', error.type);
            this.handleUnrecoverableError(mascot, error);
            return;
        }
        
        try {
            // Wait before retry
            if (retryCount > 0) {
                const delay = this.retryDelays[Math.min(retryCount - 1, this.retryDelays.length - 1)];
                await new Promise(resolve => setTimeout(resolve, delay));
            }
            
            // Attempt recovery
            const success = await strategy(mascot, error);
            
            if (success) {
                console.log(`Recovery successful for error type: ${error.type}`);
                this.logError({
                    type: 'recovery-success',
                    originalError: error,
                    retryCount: retryCount + 1
                });
            } else {
                // Retry with incremented count
                error.retryCount = retryCount + 1;
                this.attemptRecovery(mascot, error, strategy);
            }
            
        } catch (recoveryError) {
            console.error('Recovery attempt failed:', recoveryError);
            
            // Retry with incremented count
            error.retryCount = retryCount + 1;
            this.attemptRecovery(mascot, error, strategy);
        }
    }
    
    handleUnrecoverableError(mascot, error) {
        console.error('Unrecoverable error, switching to fallback mode:', error);
        
        // Show fallback UI
        this.showFallbackUI(mascot.canvas);
        
        // Notify user
        this.notifyUser('The mascot encountered an error and is temporarily unavailable.');
        
        // Log critical error
        this.logError({
            type: 'unrecoverable',
            originalError: error,
            timestamp: Date.now()
        });
    }
    
    showFallbackUI(canvas) {
        const ctx = canvas.getContext('2d');
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw fallback content
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw border
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
        
        // Draw message
        ctx.fillStyle = '#666';
        ctx.font = '16px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Mascot Unavailable', canvas.width / 2, canvas.height / 2 - 10);
        
        ctx.font = '12px Arial, sans-serif';
        ctx.fillText('Please refresh the page', canvas.width / 2, canvas.height / 2 + 15);
    }
    
    notifyUser(message) {
        // Create user notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff9800;
            color: white;
            padding: 12px 16px;
            border-radius: 4px;
            font-family: Arial, sans-serif;
            font-size: 14px;
            z-index: 10000;
            max-width: 300px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }
    
    logError(error) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            ...error
        };
        
        this.errorLog.unshift(logEntry);
        
        // Limit log size
        if (this.errorLog.length > 100) {
            this.errorLog = this.errorLog.slice(0, 100);
        }
        
        console.error('Mascot Error:', logEntry);
    }
    
    notifyErrorCallbacks(error) {
        this.errorCallbacks.forEach((callback, type) => {
            if (type === 'all' || type === error.type) {
                try {
                    callback(error);
                } catch (callbackError) {
                    console.error('Error in error callback:', callbackError);
                }
            }
        });
    }
    
    onError(type, callback) {
        this.errorCallbacks.set(type, callback);
    }
    
    getErrorLog() {
        return [...this.errorLog];
    }
    
    clearErrorLog() {
        this.errorLog = [];
    }
}

// Enhanced Mascot with Error Handling
class RobustEmotiveMascot {
    constructor(config) {
        this.config = config;
        this.errorHandler = new MascotErrorHandler();
        this.mascot = null;
        this.isInitialized = false;
        
        this.initialize();
        this.setupErrorHandling();
    }
    
    async initialize() {
        try {
            this.mascot = new EmotiveMascot(this.config);
            
            this.mascot.on('ready', () => {
                this.isInitialized = true;
            });
            
            this.mascot.on('error', (error) => {
                this.errorHandler.handleMascotError(this.mascot, error);
            });
            
        } catch (error) {
            this.errorHandler.handleMascotError(null, {
                type: 'initialization',
                message: error.message,
                error: error
            });
        }
    }
    
    setupErrorHandling() {
        // Handle specific error types
        this.errorHandler.onError('canvas-context-lost', (error) => {
            console.warn('Canvas context lost, attempting recovery...');
        });
        
        this.errorHandler.onError('performance-critical', (error) => {
            console.warn('Performance critical, reducing quality...');
        });
        
        this.errorHandler.onError('memory-pressure', (error) => {
            console.warn('Memory pressure detected, cleaning up...');
        });
    }
    
    // Proxy methods with error handling
    setEmotion(emotion, options) {
        if (!this.isInitialized) {
            return { success: false, error: { message: 'Mascot not initialized' } };
        }
        
        try {
            return this.mascot.setEmotion(emotion, options);
        } catch (error) {
            this.errorHandler.handleMascotError(this.mascot, {
                type: 'method-execution',
                method: 'setEmotion',
                message: error.message,
                error: error
            });
            return { success: false, error: { message: error.message } };
        }
    }
    
    express(gesture) {
        if (!this.isInitialized) {
            return { success: false, error: { message: 'Mascot not initialized' } };
        }
        
        try {
            return this.mascot.express(gesture);
        } catch (error) {
            this.errorHandler.handleMascotError(this.mascot, {
                type: 'method-execution',
                method: 'express',
                message: error.message,
                error: error
            });
            return { success: false, error: { message: error.message } };
        }
    }
    
    getErrorLog() {
        return this.errorHandler.getErrorLog();
    }
    
    destroy() {
        if (this.mascot) {
            this.mascot.destroy();
        }
    }
}

// Usage
const robustMascot = new RobustEmotiveMascot({
    canvas: document.getElementById('mascot-canvas'),
    enableAudio: true,
    maxParticles: 50,
    performanceMonitoring: true
});
```

## AI Agent Integration

### Emotional Response Mapping

Map AI confidence levels and states to appropriate emotions:

```javascript
class AIEmotionalMapper {
    constructor(mascot) {
        this.mascot = mascot;
        this.currentConfidence = 0;
        this.processingState = 'idle';
    }
    
    // Map confidence to emotion
    mapConfidenceToEmotion(confidence) {
        if (confidence > 0.9) return { emotion: 'joy', undertone: 'confident' };
        if (confidence > 0.7) return { emotion: 'joy', undertone: null };
        if (confidence > 0.5) return { emotion: 'neutral', undertone: 'confident' };
        if (confidence > 0.3) return { emotion: 'neutral', undertone: 'nervous' };
        if (confidence > 0.1) return { emotion: 'fear', undertone: 'nervous' };
        return { emotion: 'sadness', undertone: 'subdued' };
    }
    
    // Express AI thinking process
    startThinking() {
        this.processingState = 'thinking';
        this.mascot.setEmotion('neutral', 'nervous')
                   .express('pulse')
                   .chain('tilt', 'nod');
    }
    
    // Show AI response with confidence
    respondWithConfidence(confidence, responseType = 'answer') {
        this.currentConfidence = confidence;
        this.processingState = 'responding';
        
        const { emotion, undertone } = this.mapConfidenceToEmotion(confidence);
        
        // Choose gesture based on response type
        const gesturePatterns = {
            answer: ['nod', 'pulse'],
            question: ['tilt', 'bounce'],
            explanation: ['expand', 'drift', 'contract'],
            error: ['shake', 'flash']
        };
        
        this.mascot.setEmotion(emotion, undertone)
                   .chain(...gesturePatterns[responseType]);
    }
    
    // Handle AI errors gracefully
    handleError(errorType) {
        const errorMappings = {
            'network': { emotion: 'fear', gesture: 'shake' },
            'timeout': { emotion: 'sadness', gesture: 'contract' },
            'invalid_input': { emotion: 'surprise', gesture: 'tilt' },
            'processing_error': { emotion: 'anger', gesture: 'flash' }
        };
        
        const mapping = errorMappings[errorType] || errorMappings['processing_error'];
        this.mascot.setEmotion(mapping.emotion, 'subdued')
                   .express(mapping.gesture);
    }
}

// Usage example
const aiMapper = new AIEmotionalMapper(mascot);

// When AI starts processing
aiMapper.startThinking();

// When AI responds
aiMapper.respondWithConfidence(0.85, 'answer');

// When AI encounters an error
aiMapper.handleError('network');
```

### Real-time AI State Monitoring

```javascript
class AIStateMonitor {
    constructor(mascot) {
        this.mascot = mascot;
        this.stateHistory = [];
        this.currentTask = null;
    }
    
    // Monitor AI processing states
    updateState(state, metadata = {}) {
        this.stateHistory.push({
            state,
            timestamp: Date.now(),
            metadata
        });
        
        // Keep only last 10 states
        if (this.stateHistory.length > 10) {
            this.stateHistory.shift();
        }
        
        this.expressState(state, metadata);
    }
    
    expressState(state, metadata) {
        switch (state) {
            case 'idle':
                this.mascot.setEmotion('neutral');
                break;
                
            case 'listening':
                this.mascot.setEmotion('surprise', 'attentive')
                           .express('tilt');
                break;
                
            case 'processing':
                const complexity = metadata.complexity || 'medium';
                const undertone = complexity === 'high' ? 'intense' : 'nervous';
                this.mascot.setEmotion('neutral', undertone)
                           .express('pulse');
                break;
                
            case 'generating':
                this.mascot.setEmotion('joy', 'confident')
                           .chain('bounce', 'pulse');
                break;
                
            case 'complete':
                this.mascot.setEmotion('joy', 'confident')
                           .chain('nod', 'flash');
                break;
        }
    }
}
```

## Chatbot Integration

### Speech Reactivity Setup

```javascript
class ChatbotIntegration {
    constructor(mascot) {
        this.mascot = mascot;
        this.audioContext = null;
        this.speechSynthesis = null;
        this.isListening = false;
    }
    
    // Initialize speech capabilities
    async initializeSpeech() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.speechSynthesis = window.speechSynthesis;
            
            // Enable speech reactivity
            this.mascot.startSpeaking(this.audioContext);
            
            return true;
        } catch (error) {
            console.warn('Speech not available:', error);
            return false;
        }
    }
    
    // Handle user message
    onUserMessage(message) {
        // Show listening state
        this.mascot.setEmotion('surprise', 'attentive')
                   .express('tilt');
        
        // Process message and respond
        this.processMessage(message);
    }
    
    // Generate AI response with speech
    async respondWithSpeech(text, emotion = 'joy') {
        // Show thinking
        this.mascot.setEmotion('neutral', 'nervous')
                   .express('pulse');
        
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Start speaking animation
        this.mascot.setEmotion(emotion, 'confident');
        
        if (this.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance(text);
            
            utterance.onstart = () => {
                this.mascot.startSpeaking(this.audioContext);
            };
            
            utterance.onend = () => {
                this.mascot.stopSpeaking();
            };
            
            this.speechSynthesis.speak(utterance);
        }
        
        return text;
    }
    
    // Handle different message types
    processMessage(message) {
        const messageType = this.classifyMessage(message);
        
        const responses = {
            greeting: {
                text: "Hello! How can I help you today?",
                emotion: 'joy',
                gesture: 'bounce'
            },
            question: {
                text: "That's a great question! Let me think about that.",
                emotion: 'neutral',
                gesture: 'tilt'
            },
            compliment: {
                text: "Thank you so much! That means a lot to me.",
                emotion: 'love',
                gesture: 'pulse'
            },
            complaint: {
                text: "I'm sorry to hear that. Let me see how I can help.",
                emotion: 'sadness',
                gesture: 'nod'
            }
        };
        
        const response = responses[messageType] || responses.question;
        
        // Express appropriate gesture
        this.mascot.express(response.gesture);
        
        // Respond with speech
        this.respondWithSpeech(response.text, response.emotion);
    }
    
    classifyMessage(message) {
        const lower = message.toLowerCase();
        
        if (lower.includes('hello') || lower.includes('hi')) return 'greeting';
        if (lower.includes('thank') || lower.includes('great')) return 'compliment';
        if (lower.includes('problem') || lower.includes('wrong')) return 'complaint';
        if (lower.includes('?')) return 'question';
        
        return 'question';
    }
}

// Usage
const chatbot = new ChatbotIntegration(mascot);
await chatbot.initializeSpeech();

// Handle user input
chatbot.onUserMessage("Hello, how are you?");
```

## Gesture Patterns

### Common Interaction Patterns

```javascript
const GesturePatterns = {
    // Greeting sequences
    greeting: {
        formal: ['nod', 'pulse'],
        friendly: ['bounce', 'nod', 'pulse'],
        enthusiastic: ['bounce', 'spin', 'flash']
    },
    
    // Thinking and processing
    thinking: {
        light: ['tilt', 'pulse'],
        deep: ['tilt', 'pulse', 'nod'],
        confused: ['shake', 'tilt', 'shake']
    },
    
    // Emotional responses
    celebration: {
        mild: ['pulse', 'bounce'],
        excited: ['bounce', 'spin', 'flash'],
        triumphant: ['expand', 'spin', 'pulse', 'flash']
    },
    
    // Error and problem states
    error: {
        minor: ['shake', 'nod'],
        major: ['shake', 'contract', 'flash'],
        critical: ['shake', 'shake', 'contract']
    },
    
    // Attention and focus
    attention: {
        subtle: ['pulse'],
        clear: ['bounce', 'pulse'],
        urgent: ['flash', 'bounce', 'flash']
    }
};

// Pattern execution helper
class PatternExecutor {
    constructor(mascot) {
        this.mascot = mascot;
    }
    
    execute(category, type, emotion = null) {
        const pattern = GesturePatterns[category]?.[type];
        if (!pattern) {
            console.warn(`Pattern not found: ${category}.${type}`);
            return false;
        }
        
        if (emotion) {
            this.mascot.setEmotion(emotion);
        }
        
        this.mascot.chain(...pattern);
        return true;
    }
}

// Usage
const patterns = new PatternExecutor(mascot);

patterns.execute('greeting', 'enthusiastic', 'joy');
patterns.execute('thinking', 'deep', 'neutral');
patterns.execute('celebration', 'excited', 'joy');
```

### Dynamic Pattern Generation

```javascript
class DynamicPatternGenerator {
    constructor(mascot) {
        this.mascot = mascot;
        this.compatibilityMatrix = this.buildCompatibilityMatrix();
    }
    
    // Generate contextually appropriate patterns
    generatePattern(context, intensity = 'medium') {
        const baseGestures = this.getBaseGestures(context);
        const intensityModifier = this.getIntensityModifier(intensity);
        
        let pattern = [...baseGestures];
        
        // Add intensity-based gestures
        if (intensityModifier.length > 0) {
            pattern = pattern.concat(intensityModifier);
        }
        
        // Ensure compatibility
        pattern = this.optimizeCompatibility(pattern);
        
        return pattern;
    }
    
    getBaseGestures(context) {
        const contextMappings = {
            success: ['bounce', 'pulse'],
            failure: ['shake', 'contract'],
            thinking: ['tilt', 'pulse'],
            surprise: ['expand', 'flash'],
            greeting: ['nod', 'bounce']
        };
        
        return contextMappings[context] || ['pulse'];
    }
    
    getIntensityModifier(intensity) {
        const intensityMappings = {
            low: [],
            medium: ['nod'],
            high: ['spin', 'flash'],
            extreme: ['spin', 'flash', 'bounce']
        };
        
        return intensityMappings[intensity] || [];
    }
    
    optimizeCompatibility(pattern) {
        // Remove incompatible gesture sequences
        const optimized = [pattern[0]]; // Keep first gesture
        
        for (let i = 1; i < pattern.length; i++) {
            const prev = optimized[optimized.length - 1];
            const current = pattern[i];
            
            const compatibility = this.getCompatibility(prev, current);
            
            if (compatibility > 0.3) {
                optimized.push(current);
            } else {
                // Find a better transition gesture
                const bridge = this.findBridgeGesture(prev, current);
                if (bridge) {
                    optimized.push(bridge, current);
                }
            }
        }
        
        return optimized.slice(0, 3); // Limit to 3 gestures
    }
    
    getCompatibility(gesture1, gesture2) {
        return this.compatibilityMatrix[gesture1]?.[gesture2] || 0.5;
    }
    
    findBridgeGesture(from, to) {
        const bridges = ['pulse', 'nod', 'flash'];
        
        for (const bridge of bridges) {
            const fromBridge = this.getCompatibility(from, bridge);
            const bridgeTo = this.getCompatibility(bridge, to);
            
            if (fromBridge > 0.7 && bridgeTo > 0.7) {
                return bridge;
            }
        }
        
        return null;
    }
    
    buildCompatibilityMatrix() {
        // Simplified compatibility matrix
        return {
            bounce: { pulse: 0.8, nod: 0.9, spin: 0.6, shake: 0.3 },
            pulse: { bounce: 0.8, expand: 0.9, flash: 0.8, contract: 0.3 },
            shake: { tilt: 0.6, flash: 0.5, bounce: 0.3, pulse: 0.4 },
            spin: { drift: 0.9, flash: 0.7, bounce: 0.6, tilt: 0.8 },
            nod: { bounce: 0.9, pulse: 0.6, tilt: 0.7, shake: 0.2 },
            tilt: { nod: 0.7, spin: 0.8, shake: 0.6, pulse: 0.5 },
            expand: { contract: 0.95, pulse: 0.9, flash: 0.8, bounce: 0.5 },
            contract: { expand: 0.95, pulse: 0.3, bounce: 0.4, nod: 0.6 },
            flash: { pulse: 0.8, bounce: 0.7, spin: 0.7, expand: 0.8 },
            drift: { spin: 0.9, bounce: 0.6, tilt: 0.7, pulse: 0.5 }
        };
    }
}

// Usage
const generator = new DynamicPatternGenerator(mascot);

const successPattern = generator.generatePattern('success', 'high');
mascot.setEmotion('joy').chain(...successPattern);
```

## Mobile Integration

### Touch Event Handling

```javascript
class MobileTouchHandler {
    constructor(mascot, canvas) {
        this.mascot = mascot;
        this.canvas = canvas;
        this.touchStartTime = 0;
        this.touchStartPos = { x: 0, y: 0 };
        this.isTouch = false;
        
        this.setupTouchEvents();
    }
    
    setupTouchEvents() {
        // Touch events
        this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
        this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
        
        // Mouse events for desktop testing
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        
        // Prevent default touch behaviors
        this.canvas.addEventListener('touchstart', (e) => e.preventDefault());
        this.canvas.addEventListener('touchmove', (e) => e.preventDefault());
    }
    
    handleTouchStart(event) {
        this.isTouch = true;
        this.touchStartTime = Date.now();
        
        const touch = event.touches[0];
        this.touchStartPos = {
            x: touch.clientX,
            y: touch.clientY
        };
        
        // Immediate feedback
        this.mascot.express('pulse');
    }
    
    handleTouchEnd(event) {
        if (!this.isTouch) return;
        
        const duration = Date.now() - this.touchStartTime;
        const touch = event.changedTouches[0];
        const endPos = {
            x: touch.clientX,
            y: touch.clientY
        };
        
        const gesture = this.classifyTouch(duration, this.touchStartPos, endPos);
        this.executeGesture(gesture, duration);
        
        this.isTouch = false;
    }
    
    handleTouchMove(event) {
        // Handle drag gestures
        if (this.isTouch) {
            const touch = event.touches[0];
            const currentPos = {
                x: touch.clientX,
                y: touch.clientY
            };
            
            // Calculate drag distance
            const dragDistance = this.calculateDistance(this.touchStartPos, currentPos);
            
            if (dragDistance > 50) {
                this.mascot.express('drift');
            }
        }
    }
    
    // Mouse event handlers for desktop
    handleMouseDown(event) {
        this.isTouch = true;
        this.touchStartTime = Date.now();
        this.touchStartPos = { x: event.clientX, y: event.clientY };
        this.mascot.express('pulse');
    }
    
    handleMouseUp(event) {
        if (!this.isTouch) return;
        
        const duration = Date.now() - this.touchStartTime;
        const endPos = { x: event.clientX, y: event.clientY };
        
        const gesture = this.classifyTouch(duration, this.touchStartPos, endPos);
        this.executeGesture(gesture, duration);
        
        this.isTouch = false;
    }
    
    handleMouseMove(event) {
        if (this.isTouch) {
            const currentPos = { x: event.clientX, y: event.clientY };
            const dragDistance = this.calculateDistance(this.touchStartPos, currentPos);
            
            if (dragDistance > 50) {
                this.mascot.express('drift');
            }
        }
    }
    
    classifyTouch(duration, startPos, endPos) {
        const distance = this.calculateDistance(startPos, endPos);
        
        // Tap: short duration, minimal movement
        if (duration < 200 && distance < 20) {
            return 'tap';
        }
        
        // Hold: long duration, minimal movement
        if (duration > 500 && distance < 30) {
            return 'hold';
        }
        
        // Swipe: any duration, significant movement
        if (distance > 50) {
            const direction = this.getSwipeDirection(startPos, endPos);
            return `swipe_${direction}`;
        }
        
        // Default to tap
        return 'tap';
    }
    
    executeGesture(gestureType, duration) {
        const gestureMappings = {
            tap: {
                emotion: 'joy',
                gesture: 'bounce',
                undertone: null
            },
            hold: {
                emotion: 'love',
                gesture: 'expand',
                undertone: 'confident'
            },
            swipe_left: {
                emotion: 'surprise',
                gesture: 'drift',
                undertone: null
            },
            swipe_right: {
                emotion: 'surprise',
                gesture: 'drift',
                undertone: null
            },
            swipe_up: {
                emotion: 'joy',
                gesture: 'bounce',
                undertone: 'intense'
            },
            swipe_down: {
                emotion: 'sadness',
                gesture: 'contract',
                undertone: 'subdued'
            }
        };
        
        const mapping = gestureMappings[gestureType] || gestureMappings.tap;
        
        this.mascot.setEmotion(mapping.emotion, mapping.undertone)
                   .express(mapping.gesture);
    }
    
    calculateDistance(pos1, pos2) {
        const dx = pos2.x - pos1.x;
        const dy = pos2.y - pos1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    getSwipeDirection(startPos, endPos) {
        const dx = endPos.x - startPos.x;
        const dy = endPos.y - startPos.y;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            return dx > 0 ? 'right' : 'left';
        } else {
            return dy > 0 ? 'down' : 'up';
        }
    }
}

// Usage
const touchHandler = new MobileTouchHandler(mascot, canvas);
```

### Responsive Design Considerations

```javascript
class ResponsiveEmotiveMascot {
    constructor(config) {
        this.originalConfig = { ...config };
        this.adaptedConfig = this.adaptForDevice(config);
        this.mascot = new EmotiveMascot(this.adaptedConfig);
        
        this.setupResponsiveHandling();
    }
    
    adaptForDevice(config) {
        const adapted = { ...config };
        
        // Detect device capabilities
        const isMobile = /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent);
        const isLowEnd = navigator.hardwareConcurrency < 4;
        const hasLimitedMemory = navigator.deviceMemory && navigator.deviceMemory < 4;
        
        // Adjust for mobile devices
        if (isMobile) {
            adapted.maxParticles = Math.min(adapted.maxParticles || 50, 25);
            adapted.targetFPS = Math.min(adapted.targetFPS || 60, 30);
            adapted.enableAudio = false; // Disable audio on mobile by default
        }
        
        // Adjust for low-end devices
        if (isLowEnd || hasLimitedMemory) {
            adapted.maxParticles = Math.min(adapted.maxParticles || 50, 15);
            adapted.targetFPS = Math.min(adapted.targetFPS || 60, 30);
        }
        
        return adapted;
    }
    
    setupResponsiveHandling() {
        // Handle orientation changes
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleResize();
            }, 100);
        });
        
        // Handle window resize
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Monitor performance and adapt
        this.performanceMonitor = setInterval(() => {
            this.adaptPerformance();
        }, 5000);
    }
    
    handleResize() {
        // Resize canvas if needed
        const canvas = this.mascot.canvas;
        const container = canvas.parentElement;
        
        if (container) {
            const containerRect = container.getBoundingClientRect();
            const size = Math.min(containerRect.width, containerRect.height, 500);
            
            canvas.width = size;
            canvas.height = size;
            
            // Update canvas manager
            this.mascot.canvasManager.resize();
        }
    }
    
    adaptPerformance() {
        const metrics = this.mascot.getPerformanceMetrics();
        const targetFPS = this.adaptedConfig.targetFPS;
        
        if (metrics.fps < targetFPS * 0.7) {
            // Reduce particle count
            const currentMax = this.mascot.particleSystem.maxParticles;
            const newMax = Math.max(5, Math.floor(currentMax * 0.8));
            
            this.mascot.particleSystem.setMaxParticles(newMax);
            console.log(`Performance adaptation: reduced particles to ${newMax}`);
        }
    }
    
    // Expose mascot methods
    start() { return this.mascot.start(); }
    stop() { return this.mascot.stop(); }
    setEmotion(...args) { return this.mascot.setEmotion(...args); }
    express(...args) { return this.mascot.express(...args); }
    chain(...args) { return this.mascot.chain(...args); }
    
    // Cleanup
    destroy() {
        if (this.performanceMonitor) {
            clearInterval(this.performanceMonitor);
        }
        
        window.removeEventListener('orientationchange', this.handleResize);
        window.removeEventListener('resize', this.handleResize);
        
        this.mascot.stop();
    }
}

// Usage
const responsiveMascot = new ResponsiveEmotiveMascot({
    canvasId: 'my-canvas',
    enableAudio: true,
    targetFPS: 60,
    maxParticles: 50
});

responsiveMascot.start();
```

## Error Handling

### Comprehensive Error Management

```javascript
class EmotiveErrorHandler {
    constructor(mascot) {
        this.mascot = mascot;
        this.errorLog = [];
        this.maxLogSize = 100;
        this.errorCallbacks = new Map();
        
        this.setupErrorHandling();
    }
    
    setupErrorHandling() {
        // Global error handler
        window.addEventListener('error', this.handleGlobalError.bind(this));
        window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));
        
        // Mascot-specific error handling
        this.mascot.on('error', this.handleMascotError.bind(this));
        
        // Performance degradation handling
        this.mascot.on('performanceDegradation', this.handlePerformanceDegradation.bind(this));
    }
    
    handleGlobalError(event) {
        this.logError({
            type: 'global',
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            error: event.error
        });
        
        // Show error state in mascot
        this.mascot.setEmotion('anger', 'subdued')
                   .express('shake');
    }
    
    handleUnhandledRejection(event) {
        this.logError({
            type: 'promise',
            message: event.reason?.message || 'Unhandled promise rejection',
            reason: event.reason
        });
        
        // Show warning state
        this.mascot.setEmotion('fear', 'nervous')
                   .express('tilt');
    }
    
    handleMascotError(error) {
        this.logError({
            type: 'mascot',
            message: error.message,
            context: error.context,
            error: error
        });
        
        // Attempt recovery
        this.attemptRecovery(error);
    }
    
    handlePerformanceDegradation(data) {
        this.logError({
            type: 'performance',
            message: `Performance degraded: ${data.fps} FPS`,
            data: data
        }, 'warning');
        
        // Show performance warning
        this.mascot.setEmotion('sadness', 'tired')
                   .express('contract');
    }
    
    logError(errorData, level = 'error') {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level: level,
            ...errorData
        };
        
        this.errorLog.unshift(logEntry);
        
        // Limit log size
        if (this.errorLog.length > this.maxLogSize) {
            this.errorLog = this.errorLog.slice(0, this.maxLogSize);
        }
        
        // Notify callbacks
        this.notifyErrorCallbacks(logEntry);
        
        // Console logging
        const consoleMethod = level === 'warning' ? 'warn' : 'error';
        console[consoleMethod]('Emotive Engine Error:', logEntry);
    }
    
    attemptRecovery(error) {
        const recoveryStrategies = {
            'canvas-context-lost': () => {
                // Attempt to restore canvas context
                setTimeout(() => {
                    this.mascot.canvasManager.resize();
                    this.mascot.setEmotion('neutral');
                }, 1000);
            },
            
            'audio-context-suspended': () => {
                // Try to resume audio context
                if (this.mascot.soundSystem.context) {
                    this.mascot.soundSystem.context.resume();
                }
            },
            
            'performance-critical': () => {
                // Reduce quality settings
                this.mascot.particleSystem.setMaxParticles(10);
                this.mascot.config.targetFPS = 30;
            },
            
            'memory-pressure': () => {
                // Clear caches and reduce memory usage
                this.mascot.particleSystem.clear();
                if (window.gc) window.gc();
            }
        };
        
        const strategy = recoveryStrategies[error.type];
        if (strategy) {
            try {
                strategy();
                this.logError({
                    type: 'recovery',
                    message: `Recovery attempted for ${error.type}`,
                    originalError: error
                }, 'info');
            } catch (recoveryError) {
                this.logError({
                    type: 'recovery-failed',
                    message: `Recovery failed for ${error.type}`,
                    originalError: error,
                    recoveryError: recoveryError
                });
            }
        }
    }
    
    // Public API for error handling
    onError(callback) {
        const id = Date.now() + Math.random();
        this.errorCallbacks.set(id, callback);
        return id;
    }
    
    offError(id) {
        this.errorCallbacks.delete(id);
    }
    
    notifyErrorCallbacks(errorData) {
        this.errorCallbacks.forEach(callback => {
            try {
                callback(errorData);
            } catch (error) {
                console.error('Error in error callback:', error);
            }
        });
    }
    
    getErrorLog() {
        return [...this.errorLog];
    }
    
    clearErrorLog() {
        this.errorLog = [];
    }
    
    getErrorStats() {
        const stats = {
            total: this.errorLog.length,
            byType: {},
            byLevel: {},
            recent: this.errorLog.slice(0, 10)
        };
        
        this.errorLog.forEach(entry => {
            stats.byType[entry.type] = (stats.byType[entry.type] || 0) + 1;
            stats.byLevel[entry.level] = (stats.byLevel[entry.level] || 0) + 1;
        });
        
        return stats;
    }
}

// Usage
const errorHandler = new EmotiveErrorHandler(mascot);

// Listen for errors
errorHandler.onError((error) => {
    console.log('Error occurred:', error);
    
    // Show user-friendly message
    if (error.level === 'error') {
        showUserNotification('Something went wrong, but we\'re handling it!');
    }
});

// Get error statistics
const stats = errorHandler.getErrorStats();
console.log('Error statistics:', stats);
```

## Performance Optimization

### Adaptive Performance Management

```javascript
class PerformanceOptimizer {
    constructor(mascot) {
        this.mascot = mascot;
        this.performanceHistory = [];
        this.optimizationLevel = 0; // 0 = none, 1 = light, 2 = aggressive
        this.targetFPS = mascot.config.targetFPS || 60;
        this.minFPS = Math.max(15, this.targetFPS * 0.5);
        
        this.startMonitoring();
    }
    
    startMonitoring() {
        this.monitoringInterval = setInterval(() => {
            this.analyzePerformance();
        }, 2000); // Check every 2 seconds
    }
    
    analyzePerformance() {
        const metrics = this.mascot.getPerformanceMetrics();
        const currentFPS = metrics.fps || 0;
        
        // Store performance data
        this.performanceHistory.push({
            timestamp: Date.now(),
            fps: currentFPS,
            particles: metrics.particleCount || 0,
            optimizationLevel: this.optimizationLevel
        });
        
        // Keep only last 30 samples (1 minute of data)
        if (this.performanceHistory.length > 30) {
            this.performanceHistory.shift();
        }
        
        // Analyze trends
        this.optimizeBasedOnTrends(currentFPS);
    }
    
    optimizeBasedOnTrends(currentFPS) {
        const recentSamples = this.performanceHistory.slice(-5);
        const averageFPS = recentSamples.reduce((sum, sample) => sum + sample.fps, 0) / recentSamples.length;
        
        // Determine if optimization is needed
        if (averageFPS < this.minFPS && this.optimizationLevel < 2) {
            this.increaseOptimization();
        } else if (averageFPS > this.targetFPS * 0.9 && this.optimizationLevel > 0) {
            this.decreaseOptimization();
        }
    }
    
    increaseOptimization() {
        this.optimizationLevel++;
        
        switch (this.optimizationLevel) {
            case 1:
                this.applyLightOptimization();
                break;
            case 2:
                this.applyAggressiveOptimization();
                break;
        }
        
        console.log(`Performance optimization increased to level ${this.optimizationLevel}`);
    }
    
    decreaseOptimization() {
        this.optimizationLevel--;
        
        switch (this.optimizationLevel) {
            case 0:
                this.restoreOriginalSettings();
                break;
            case 1:
                this.applyLightOptimization();
                break;
        }
        
        console.log(`Performance optimization decreased to level ${this.optimizationLevel}`);
    }
    
    applyLightOptimization() {
        // Reduce particle count by 25%
        const currentMax = this.mascot.particleSystem.maxParticles;
        const newMax = Math.max(10, Math.floor(currentMax * 0.75));
        this.mascot.particleSystem.setMaxParticles(newMax);
        
        // Slightly reduce target FPS
        this.mascot.config.targetFPS = Math.max(30, this.targetFPS * 0.85);
    }
    
    applyAggressiveOptimization() {
        // Reduce particle count by 50%
        const currentMax = this.mascot.particleSystem.maxParticles;
        const newMax = Math.max(5, Math.floor(currentMax * 0.5));
        this.mascot.particleSystem.setMaxParticles(newMax);
        
        // Reduce target FPS significantly
        this.mascot.config.targetFPS = Math.max(20, this.targetFPS * 0.6);
        
        // Disable audio if enabled
        if (this.mascot.soundSystem.isAvailable()) {
            this.mascot.soundSystem.setMasterVolume(0);
        }
    }
    
    restoreOriginalSettings() {
        // Restore original particle count
        this.mascot.particleSystem.setMaxParticles(this.mascot.config.maxParticles || 50);
        
        // Restore original FPS target
        this.mascot.config.targetFPS = this.targetFPS;
        
        // Restore audio
        if (this.mascot.soundSystem.isAvailable()) {
            this.mascot.soundSystem.setMasterVolume(this.mascot.config.masterVolume || 0.5);
        }
    }
    
    getPerformanceReport() {
        const recent = this.performanceHistory.slice(-10);
        const averageFPS = recent.reduce((sum, sample) => sum + sample.fps, 0) / recent.length;
        
        return {
            currentOptimizationLevel: this.optimizationLevel,
            averageFPS: averageFPS,
            targetFPS: this.targetFPS,
            minFPS: this.minFPS,
            performanceGrade: this.getPerformanceGrade(averageFPS),
            recommendations: this.getRecommendations(averageFPS)
        };
    }
    
    getPerformanceGrade(fps) {
        if (fps >= this.targetFPS * 0.9) return 'A';
        if (fps >= this.targetFPS * 0.7) return 'B';
        if (fps >= this.targetFPS * 0.5) return 'C';
        if (fps >= this.targetFPS * 0.3) return 'D';
        return 'F';
    }
    
    getRecommendations(fps) {
        const recommendations = [];
        
        if (fps < this.minFPS) {
            recommendations.push('Consider reducing particle count');
            recommendations.push('Lower target FPS for better stability');
            recommendations.push('Disable audio on low-end devices');
        }
        
        if (fps > this.targetFPS * 1.2) {
            recommendations.push('Performance headroom available');
            recommendations.push('Could increase visual quality');
        }
        
        return recommendations;
    }
    
    destroy() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
    }
}

// Usage
const optimizer = new PerformanceOptimizer(mascot);

// Get performance report
setInterval(() => {
    const report = optimizer.getPerformanceReport();
    console.log('Performance Report:', report);
}, 10000);
```

## Advanced Usage

### Custom Emotion System

```javascript
class CustomEmotionSystem {
    constructor(mascot) {
        this.mascot = mascot;
        this.customEmotions = new Map();
        this.emotionBlends = new Map();
    }
    
    // Define custom emotions
    defineEmotion(name, properties) {
        this.customEmotions.set(name, {
            primaryColor: properties.color,
            glowIntensity: properties.glow || 1.0,
            particleRate: properties.particleRate || 1.0,
            particleBehavior: properties.behavior || 'ambient',
            coreSize: properties.coreSize || 1.0,
            breathRate: properties.breathRate || 1.0,
            breathDepth: properties.breathDepth || 1.0,
            ...properties
        });
    }
    
    // Create emotion blends
    createBlend(name, emotion1, emotion2, ratio = 0.5) {
        const props1 = this.getEmotionProperties(emotion1);
        const props2 = this.getEmotionProperties(emotion2);
        
        if (!props1 || !props2) {
            throw new Error(`Cannot blend unknown emotions: ${emotion1}, ${emotion2}`);
        }
        
        const blended = this.interpolateProperties(props1, props2, ratio);
        this.emotionBlends.set(name, blended);
    }
    
    // Set custom emotion
    setCustomEmotion(name, undertone = null) {
        const properties = this.customEmotions.get(name) || this.emotionBlends.get(name);
        
        if (!properties) {
            throw new Error(`Unknown custom emotion: ${name}`);
        }
        
        // Apply to mascot (would need to extend EmotiveStateMachine)
        this.mascot.stateMachine.setCustomEmotion(properties, undertone);
        
        return this.mascot;
    }
    
    getEmotionProperties(emotionName) {
        // Get from custom emotions first, then built-in
        return this.customEmotions.get(emotionName) || 
               this.mascot.stateMachine.getEmotionProperties(emotionName);
    }
    
    interpolateProperties(props1, props2, ratio) {
        return {
            primaryColor: this.interpolateColor(props1.primaryColor, props2.primaryColor, ratio),
            glowIntensity: this.lerp(props1.glowIntensity, props2.glowIntensity, ratio),
            particleRate: this.lerp(props1.particleRate, props2.particleRate, ratio),
            particleBehavior: ratio < 0.5 ? props1.particleBehavior : props2.particleBehavior,
            coreSize: this.lerp(props1.coreSize, props2.coreSize, ratio),
            breathRate: this.lerp(props1.breathRate, props2.breathRate, ratio),
            breathDepth: this.lerp(props1.breathDepth, props2.breathDepth, ratio)
        };
    }
    
    interpolateColor(color1, color2, ratio) {
        // Simple color interpolation (would use proper color utilities)
        return ratio < 0.5 ? color1 : color2;
    }
    
    lerp(a, b, t) {
        return a + (b - a) * t;
    }
}

// Usage
const customEmotions = new CustomEmotionSystem(mascot);

// Define custom emotions
customEmotions.defineEmotion('excitement', {
    color: '#FF4500',
    glow: 1.5,
    particleRate: 2.0,
    behavior: 'burst',
    coreSize: 1.2,
    breathRate: 1.5
});

customEmotions.defineEmotion('melancholy', {
    color: '#4682B4',
    glow: 0.6,
    particleRate: 0.3,
    behavior: 'falling',
    coreSize: 0.8,
    breathRate: 0.7
});

// Create emotion blends
customEmotions.createBlend('bittersweet', 'joy', 'melancholy', 0.6);

// Use custom emotions
customEmotions.setCustomEmotion('excitement');
customEmotions.setCustomEmotion('bittersweet');
```

This comprehensive integration guide provides real-world examples and patterns for integrating the Emotive Communication Engine into various applications, from AI agents to chatbots to mobile applications, with proper error handling and performance optimization strategies.