<!--
  ⚠️ VUE INTEGRATION TEMPLATE - Emotive Engine

  IMPORTANT: This is a TEMPLATE/GUIDE, not a working example!

  This file shows HOW to integrate Emotive Engine with Vue, but uses
  placeholder patterns that need adaptation for your specific project.

  📖 Before using this template:
  1. Study the working HTML examples first (especially hello-world.html)
  2. Understand the UMD bundle loading pattern
  3. Review the actual API methods available
  4. Test integration in a small prototype first

  🚨 What's different from working examples:
  - Uses ES module imports (your build tool must support this)
  - Wraps mascot in Vue lifecycle hooks
  - Requires proper bundler configuration (vite, webpack, etc.)
  - May need additional setup for canvas refs

  ✅ Actual API methods (from working examples):
  - mascot.init(canvas) - Initialize with canvas element
  - mascot.setEmotion(emotion) - Change emotion
  - mascot.express(gesture) - Trigger gesture
  - mascot.morphTo(shape) - Change shape
  - mascot.setBackdrop(config) - Configure backdrop glow
  - mascot.setScale(config) - Scale mascot
  - mascot.start() / mascot.stop() - Control animation
  - mascot.on(event, handler) - Listen to events

  📋 Valid emotions: joy, calm, excited, sadness, love, focused, empathy, neutral
  📋 Valid gestures: bounce, spin, pulse, glow, breathe, expand
  📋 Valid shapes: circle, heart, star, sun, moon
  📋 Real events: gesture, shapeMorphStarted, resize, paused, resumed

  💡 Integration approach:
  1. Load UMD bundle via script tag in your HTML or use ES modules if configured
  2. Create canvas ref in Vue component
  3. Initialize mascot in mounted() hook after canvas is available
  4. Clean up mascot in beforeUnmount() hook
  5. Update mascot state via watchers

  See examples/hello-world.html for the simplest working implementation!

  Complexity: ⭐⭐⭐⭐ Advanced (Requires Vue + bundler knowledge)
-->

<template>
  <div class="emotive-container">
    <canvas
      ref="emotiveCanvas"
      :width="width"
      :height="height"
      class="emotive-canvas"
    />
  </div>
</template>

<script>
// OPTION 1: If using ES modules with a bundler
// import EmotiveMascot from 'emotive-engine';

// OPTION 2: If loaded via UMD bundle in HTML (more common)
// Access via: window.EmotiveMascot?.default || window.EmotiveMascot

export default {
  name: 'EmotiveMascot',

  props: {
    // Emotion prop - valid emotions from working examples
    emotion: {
      type: String,
      default: 'neutral',
      validator(value) {
        return [
          'joy', 'calm', 'excited', 'sadness',
          'love', 'focused', 'empathy', 'neutral'
        ].includes(value);
      }
    },

    // Canvas dimensions
    width: {
      type: Number,
      default: 400
    },

    height: {
      type: Number,
      default: 400
    },

    // Enable backdrop glow
    enableBackdrop: {
      type: Boolean,
      default: true
    },

    // Auto start animation
    autoStart: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      mascot: null,
      isInitialized: false
    };
  },

  watch: {
    // Update emotion when prop changes
    emotion(newEmotion) {
      if (this.mascot && this.isInitialized) {
        this.mascot.setEmotion(newEmotion);
      }
    }
  },

  // STEP 1: Initialize mascot when component mounts
  async mounted() {
    await this.initializeMascot();
  },

  // STEP 2: Clean up mascot when component unmounts
  beforeUnmount() {
    if (this.mascot) {
      this.mascot.stop();
      // Note: EmotiveMascot doesn't have destroy() method
      // The stop() method pauses animation
      this.mascot = null;
    }
  },

  methods: {
    // Initialize mascot with real API
    async initializeMascot() {
      if (!this.$refs.emotiveCanvas) {
        console.error('❌ Canvas ref not available');
        return;
      }

      try {
        // Get EmotiveMascot from window (UMD bundle)
        // OR use imported class if using ES modules
        const EmotiveMascotClass = window.EmotiveMascot?.default || window.EmotiveMascot;

        if (!EmotiveMascotClass) {
          console.error('❌ EmotiveMascot not loaded. Make sure UMD bundle is included.');
          return;
        }

        // Create mascot instance with real API
        this.mascot = new EmotiveMascotClass({
          canvasId: this.$refs.emotiveCanvas.id || 'mascot-canvas',
          targetFPS: 60,
          enableAudio: false,
          defaultEmotion: this.emotion,
          enableGazeTracking: false,
          enableIdleBehaviors: true
        });

        // CRITICAL: Initialize with canvas element
        await this.mascot.init(this.$refs.emotiveCanvas);

        // Configure backdrop glow (optional)
        if (this.enableBackdrop) {
          this.mascot.setBackdrop({
            enabled: true,
            radius: 3.5,
            intensity: 0.9,
            blendMode: 'normal',
            falloff: 'smooth',
            edgeSoftness: 0.95,
            coreTransparency: 0.25,
            responsive: true
          });
        }

        // Set up event listeners (real events)
        this.setupEventListeners();

        // Auto start if enabled
        if (this.autoStart) {
          this.mascot.start();
        }

        this.isInitialized = true;

        // Emit ready event to parent
        this.$emit('ready', this.mascot);

        console.log('✅ Mascot initialized in Vue component');

      } catch (error) {
        console.error('Failed to initialize mascot:', error);
      }
    },

    // Set up event listeners for real mascot events
    setupEventListeners() {
      if (!this.mascot) return;

      // Listen for gesture events
      this.mascot.on('gesture', (data) => {
        this.$emit('gesture', data);
      });

      // Listen for shape morph events
      this.mascot.on('shapeMorphStarted', (data) => {
        this.$emit('shapeMorphStarted', data);
      });

      // Listen for resize events
      this.mascot.on('resize', (data) => {
        this.$emit('resize', data);
      });

      // Listen for pause/resume events
      this.mascot.on('paused', () => {
        this.$emit('paused');
      });

      this.mascot.on('resumed', () => {
        this.$emit('resumed');
      });
    },

    // Public methods using real API
    setEmotion(emotion) {
      if (this.mascot && this.isInitialized) {
        this.mascot.setEmotion(emotion);
      }
    },

    express(gesture) {
      if (this.mascot && this.isInitialized) {
        this.mascot.express(gesture);
      }
    },

    morphTo(shape) {
      if (this.mascot && this.isInitialized) {
        this.mascot.morphTo(shape);
      }
    },

    setScale(config) {
      if (this.mascot && this.isInitialized) {
        this.mascot.setScale(config);
      }
    },

    start() {
      if (this.mascot) {
        this.mascot.start();
      }
    },

    stop() {
      if (this.mascot) {
        this.mascot.stop();
      }
    }
  }
};
</script>

<style scoped>
.emotive-container {
  display: inline-block;
  position: relative;
}

.emotive-canvas {
  display: block;
  border-radius: 12px;
  border: 2px solid rgba(221, 74, 154, 0.3);
  box-shadow: 0 8px 32px rgba(221, 74, 154, 0.15);
}
</style>

<!--
  ========================================
  EXAMPLE USAGE IN PARENT COMPONENT
  ========================================

  This shows how to use the EmotiveMascot component with real API methods.

<template>
  <div class="app">
    <h1>Vue Emotive Engine Demo</h1>

    <EmotiveMascot
      ref="mascot"
      :emotion="currentEmotion"
      :width="400"
      :height="400"
      @ready="onMascotReady"
      @gesture="onGesture"
      @shapeMorphStarted="onShapeMorph"
    />

    <div class="controls">
      <h3>Emotions</h3>
      <button
        v-for="emotion in emotions"
        :key="emotion"
        @click="currentEmotion = emotion"
        :class="{ active: currentEmotion === emotion }"
      >
        {{ emotion }}
      </button>
    </div>

    <div class="gesture-controls">
      <h3>Gestures</h3>
      <button
        v-for="gesture in gestures"
        :key="gesture"
        @click="triggerGesture(gesture)"
      >
        {{ gesture }}
      </button>
    </div>

    <div class="shape-controls">
      <h3>Shapes</h3>
      <button
        v-for="shape in shapes"
        :key="shape"
        @click="triggerShape(shape)"
      >
        {{ shape }}
      </button>
    </div>
  </div>
</template>

<script>
import EmotiveMascot from './EmotiveMascot.vue';

export default {
  components: {
    EmotiveMascot
  },

  data() {
    return {
      currentEmotion: 'joy',
      // Real emotions from working examples
      emotions: [
        'joy', 'calm', 'excited', 'sadness',
        'love', 'focused', 'empathy', 'neutral'
      ],
      // Real gestures from working examples
      gestures: ['bounce', 'spin', 'pulse', 'glow', 'breathe', 'expand'],
      // Real shapes from working examples
      shapes: ['circle', 'heart', 'star', 'sun', 'moon']
    };
  },

  methods: {
    onMascotReady(mascot) {
      console.log('✅ Mascot ready!', mascot);
    },

    onGesture(data) {
      console.log('Gesture triggered:', data);
    },

    onShapeMorph(data) {
      console.log('Shape morphing:', data);
    },

    triggerGesture(gesture) {
      this.$refs.mascot.express(gesture);
    },

    triggerShape(shape) {
      this.$refs.mascot.morphTo(shape);
    }
  }
};
</script>

<style scoped>
.app {
  padding: 40px;
  text-align: center;
  background: linear-gradient(135deg, #0a0a1a 0%, #16213e 50%, #1a1a2e 100%);
  min-height: 100vh;
  color: #F2F1F1;
}

h1 {
  font-size: 32px;
  font-weight: 600;
  background: linear-gradient(135deg, #DD4A9A 0%, #4090CE 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 40px;
}

h3 {
  color: #DD4A9A;
  margin-bottom: 15px;
  margin-top: 30px;
}

.controls,
.gesture-controls,
.shape-controls {
  max-width: 600px;
  margin: 30px auto;
}

button {
  padding: 12px 24px;
  margin: 5px;
  border: none;
  border-radius: 8px;
  background: rgba(64, 144, 206, 0.2);
  color: #F2F1F1;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
}

button:hover {
  background: rgba(64, 144, 206, 0.3);
  transform: translateY(-2px);
}

button.active {
  background: #DD4A9A;
  box-shadow: 0 4px 12px rgba(221, 74, 154, 0.3);
}
</style>

-->
