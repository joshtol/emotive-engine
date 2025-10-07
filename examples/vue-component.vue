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
import EmotiveEngine from 'emotive-engine';

export default {
  name: 'EmotiveMascot',
  
  props: {
    emotion: {
      type: String,
      default: 'neutral',
      validator(value) {
        return [
          'neutral', 'joy', 'sadness', 'anger', 'fear', 'surprise',
          'disgust', 'love', 'curiosity', 'excitement', 'contemplation',
          'determination', 'serenity', 'pride', 'embarrassment', 'amusement',
          'awe', 'satisfaction', 'sympathy', 'triumph', 'speaking', 'suspicion'
        ].includes(value);
      }
    },
    
    particleCount: {
      type: Number,
      default: 100
    },
    
    width: {
      type: Number,
      default: 400
    },
    
    height: {
      type: Number,
      default: 400
    },
    
    glowIntensity: {
      type: Number,
      default: 1.2
    },
    
    undertone: {
      type: String,
      default: null,
      validator(value) {
        return !value || [
          'calm', 'energetic', 'melancholic', 
          'hopeful', 'anxious', 'confident'
        ].includes(value);
      }
    },
    
    autoStart: {
      type: Boolean,
      default: true
    }
  },
  
  data() {
    return {
      mascot: null,
      isBreathing: false,
      currentGesture: null
    };
  },
  
  watch: {
    emotion(newEmotion) {
      if (this.mascot) {
        this.mascot.setEmotion(newEmotion);
      }
    },
    
    undertone(newUndertone) {
      if (this.mascot && newUndertone) {
        this.mascot.addUndertone(newUndertone);
      }
    }
  },
  
  mounted() {
    this.initializeMascot();
  },
  
  beforeUnmount() {
    if (this.mascot) {
      this.mascot.destroy();
      this.mascot = null;
    }
  },
  
  methods: {
    initializeMascot() {
      if (!this.$refs.emotiveCanvas) return;
      
      // Create mascot instance
      this.mascot = new EmotiveEngine({
        canvas: this.$refs.emotiveCanvas,
        emotion: this.emotion,
        particleCount: this.particleCount,
        width: this.width,
        height: this.height,
        glowIntensity: this.glowIntensity,
        enableGestures: true,
        adaptivePerformance: true
      });
      
      // Apply undertone if provided
      if (this.undertone) {
        this.mascot.addUndertone(this.undertone);
      }
      
      // Set up event listeners
      this.mascot.on('stateChange', this.handleStateChange);
      this.mascot.on('gestureComplete', this.handleGestureComplete);
      this.mascot.on('breathePhase', this.handleBreathePhase);
      
      // Auto start if enabled
      if (this.autoStart) {
        this.mascot.start();
      }
      
      // Emit ready event
      this.$emit('ready', this.mascot);
    },
    
    handleStateChange(state) {
      this.$emit('stateChange', state);
    },
    
    handleGestureComplete(gestureName) {
      this.currentGesture = null;
      this.$emit('gestureComplete', gestureName);
    },
    
    handleBreathePhase(phase) {
      this.$emit('breathePhase', phase);
    },
    
    // Public methods that can be called via refs
    setEmotion(emotion, intensity) {
      if (this.mascot) {
        this.mascot.setEmotion(emotion, intensity);
      }
    },
    
    addGesture(gestureName, options) {
      if (this.mascot) {
        this.currentGesture = gestureName;
        this.mascot.addGesture(gestureName, options);
      }
    },
    
    queueGestures(gestures) {
      if (this.mascot) {
        this.mascot.queueGestures(gestures);
      }
    },
    
    blendEmotions(emotions, weights) {
      if (this.mascot) {
        this.mascot.blendEmotions(emotions, weights);
      }
    },
    
    startBreathing(pattern = 'calm') {
      if (this.mascot && !this.isBreathing) {
        this.mascot.breathe(pattern);
        this.isBreathing = true;
      }
    },
    
    stopBreathing() {
      if (this.mascot && this.isBreathing) {
        this.mascot.stopBreathing();
        this.isBreathing = false;
      }
    },
    
    setBreathePattern(inhale, hold1, exhale, hold2) {
      if (this.mascot) {
        this.mascot.setBreathePattern(inhale, hold1, exhale, hold2);
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
    },
    
    resize(width, height) {
      if (this.mascot) {
        this.mascot.resize(width, height);
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
  border-radius: 10px;
}
</style>

<!-- Example usage in parent component:

<template>
  <div class="app">
    <h1>Vue Emotive Engine Demo</h1>
    
    <EmotiveMascot
      ref="mascot"
      :emotion="currentEmotion"
      :particle-count="100"
      :width="400"
      :height="400"
      undertone="calm"
      @ready="onMascotReady"
      @stateChange="onStateChange"
      @gestureComplete="onGestureComplete"
    />
    
    <div class="controls">
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
      <button 
        v-for="gesture in gestures" 
        :key="gesture"
        @click="triggerGesture(gesture)"
      >
        {{ gesture }}
      </button>
    </div>
    
    <div class="breathing-controls">
      <button @click="toggleBreathing">
        {{ isBreathing ? 'Stop' : 'Start' }} Breathing
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
      currentEmotion: 'neutral',
      isBreathing: false,
      emotions: [
        'neutral', 'joy', 'curiosity', 
        'contemplation', 'excitement', 'love'
      ],
      gestures: ['wave', 'nod', 'pulse', 'bounce']
    };
  },
  
  methods: {
    onMascotReady(mascot) {
      console.log('Mascot ready!', mascot);
    },
    
    onStateChange(state) {
      console.log('State changed:', state);
    },
    
    onGestureComplete(gestureName) {
      console.log('Gesture completed:', gestureName);
    },
    
    triggerGesture(gesture) {
      this.$refs.mascot.addGesture(gesture);
    },
    
    toggleBreathing() {
      if (this.isBreathing) {
        this.$refs.mascot.stopBreathing();
      } else {
        this.$refs.mascot.startBreathing('calm');
      }
      this.isBreathing = !this.isBreathing;
    }
  }
};
</script>

-->