/**
 * Comprehensive TypeScript definitions for Emotive Mascot
 * Production-ready type definitions with complete API coverage
 */

// ============================================================================
// Core Types and Enums
// ============================================================================

/**
 * Available emotional states in the system
 * @example
 * ```typescript
 * const mascot = new EmotiveMascot();
 * mascot.setEmotion('happy'); // Type-safe emotion setting
 * ```
 */
export type EmotionType = 
  | 'neutral' 
  | 'happy' 
  | 'excited' 
  | 'calm' 
  | 'focused' 
  | 'sad' 
  | 'angry' 
  | 'surprised';

/**
 * Available undertone modifiers for emotional states
 * @example
 * ```typescript
 * mascot.setEmotion('happy', { undertone: 'gentle' });
 * ```
 */
export type UndertoneType = 
  | 'gentle' 
  | 'intense' 
  | 'playful' 
  | 'serious' 
  | 'warm' 
  | 'cool';

/**
 * Available gesture types for expression
 * @example
 * ```typescript
 * mascot.express('bounce').chain('pulse', 'wiggle');
 * ```
 */
export type GestureType = 
  | 'bounce' 
  | 'pulse' 
  | 'wiggle' 
  | 'spin' 
  | 'shake' 
  | 'float' 
  | 'shrink' 
  | 'expand' 
  | 'tilt' 
  | 'flash';

/**
 * Available particle behaviors for different emotional contexts
 */
export type ParticleBehaviorType = 
  | 'ambient' 
  | 'rising' 
  | 'falling' 
  | 'aggressive' 
  | 'scattering' 
  | 'burst' 
  | 'repelling' 
  | 'orbiting';

/**
 * Event types emitted by the EmotiveMascot system
 */
export type EventType = 
  | 'started' 
  | 'stopped' 
  | 'paused' 
  | 'resumed'
  | 'emotionChanged' 
  | 'gestureStarted' 
  | 'gestureCompleted' 
  | 'gestureChainStarted'
  | 'speechStarted' 
  | 'speechStopped' 
  | 'audioLevelUpdate' 
  | 'volumeSpike'
  | 'audioSourceConnected' 
  | 'volumeChanged' 
  | 'audioProcessingError'
  | 'performanceWarning' 
  | 'error';

// ============================================================================
// Configuration Interfaces
// ============================================================================

/**
 * Main configuration object for EmotiveMascot initialization
 * @example
 * ```typescript
 * const config: MascotConfig = {
 *   canvasId: 'my-canvas',
 *   enableAudio: true,
 *   maxParticles: 30,
 *   targetFPS: 60
 * };
 * const mascot = new EmotiveMascot(config);
 * ```
 */
export interface MascotConfig {
  /** Canvas element ID or HTMLCanvasElement reference */
  canvasId?: string | HTMLCanvasElement;
  /** Target frames per second for animation */
  targetFPS?: number;
  /** Enable audio features including ambient tones and gesture sounds */
  enableAudio?: boolean;
  /** Master volume level (0.0 to 1.0) */
  masterVolume?: number;
  /** Maximum number of particles to render simultaneously */
  maxParticles?: number;
  /** Default emotional state on initialization */
  defaultEmotion?: EmotionType;
  /** Volume spike detection threshold for speech reactivity */
  spikeThreshold?: number;
  /** Minimum audio level required to trigger volume spikes */
  minimumSpikeLevel?: number;
  /** Minimum interval between volume spike detections (ms) */
  spikeMinInterval?: number;
  /** Maximum number of event listeners per event type */
  maxEventListeners?: number;
  /** Enable event system debugging */
  enableEventDebugging?: boolean;
  /** Enable event system monitoring */
  enableEventMonitoring?: boolean;
  /** Memory warning threshold for event listeners */
  eventMemoryWarningThreshold?: number;
  /** Show FPS counter overlay */
  showFPS?: boolean;
  /** Show debug information overlay */
  showDebug?: boolean;
}

/**
 * Configuration for setting emotional states
 * @example
 * ```typescript
 * mascot.setEmotion('happy', {
 *   undertone: 'playful',
 *   duration: 1000
 * });
 * ```
 */
export interface EmotionConfig {
  /** Optional undertone modifier */
  undertone?: UndertoneType;
  /** Transition duration in milliseconds */
  duration?: number;
}

/**
 * Configuration for audio level processing
 */
export interface AudioConfig {
  /** Volume spike detection threshold multiplier */
  spikeThreshold?: number;
  /** Minimum audio level to consider for spike detection */
  minimumSpikeLevel?: number;
  /** Minimum time between spike detections (ms) */
  spikeMinInterval?: number;
  /** Audio level history buffer size */
  historySize?: number;
  /** Smoothing factor for audio level updates */
  smoothingFactor?: number;
}

// ============================================================================
// State and Data Interfaces
// ============================================================================

/**
 * Current emotional state information
 */
export interface EmotionalState {
  /** Current primary emotion */
  emotion: EmotionType;
  /** Current undertone modifier */
  undertone: UndertoneType | null;
  /** Current gesture being executed */
  gesture: GestureType | null;
  /** Queue of pending gestures */
  gestureQueue: GestureType[];
  /** Whether speech reactivity is active */
  speaking: boolean;
  /** Current audio level (0.0 to 1.0) */
  audioLevel: number;
}

/**
 * Visual properties for emotional states
 */
export interface EmotionalProperties {
  /** Primary color in hex format */
  primaryColor: string;
  /** Secondary color in hex format */
  secondaryColor: string;
  /** Glow intensity multiplier */
  glowIntensity: number;
  /** Particle spawn rate per second */
  particleRate: number;
  /** Default particle behavior */
  particleBehavior: ParticleBehaviorType;
  /** Core size multiplier */
  coreSize: number;
  /** Movement speed multiplier */
  movementSpeed: number;
  /** Pulsation intensity */
  pulsationIntensity: number;
}

/**
 * Performance metrics from the animation system
 */
export interface PerformanceMetrics {
  /** Current frames per second */
  fps: number;
  /** Frame time in milliseconds */
  frameTime: number;
  /** Whether animation is currently running */
  isRunning: boolean;
  /** Whether performance degradation is active */
  performanceDegradation: boolean;
  /** Time between frames in milliseconds */
  deltaTime: number;
  /** Total frame count since start */
  frameCount: number;
  /** Target FPS setting */
  targetFPS: number;
  /** Memory usage in MB (if available) */
  memoryUsage?: number;
  /** Current particle count */
  particleCount?: number;
  /** Gesture queue length */
  gestureQueueLength?: number;
  /** Audio processing latency in ms */
  audioLatency?: number;
}

/**
 * Audio processing statistics
 */
export interface AudioStats {
  /** Current audio level (0.0 to 1.0) */
  currentLevel: number;
  /** Peak level in current session */
  peakLevel: number;
  /** Average level over time */
  averageLevel: number;
  /** Number of volume spikes detected */
  spikeCount: number;
  /** Last spike timestamp */
  lastSpikeTime: number;
  /** Whether audio processing is active */
  isProcessingActive: boolean;
  /** Audio level history buffer */
  levelHistory: number[];
}

/**
 * Particle system statistics
 */
export interface ParticleStats {
  /** Number of currently active particles */
  activeParticles: number;
  /** Maximum particle limit */
  maxParticles: number;
  /** Object pool efficiency metrics */
  poolHits: number;
  /** Object pool miss count */
  poolMisses: number;
  /** Pool efficiency percentage */
  poolEfficiency: number;
}

/**
 * Event system statistics
 */
export interface EventStats {
  /** Total number of registered listeners */
  totalListeners: number;
  /** Number of unique event types */
  eventTypes: number;
  /** Events emitted in current session */
  eventsEmitted: number;
  /** Memory usage by event system */
  memoryUsage: number;
  /** Listener count by event type */
  listenersByType: Record<string, number>;
}

// ============================================================================
// Event Data Interfaces
// ============================================================================

/**
 * Data emitted with emotion change events
 */
export interface EmotionChangeData {
  /** New emotion that was set */
  emotion: EmotionType;
  /** Undertone modifier if specified */
  undertone: UndertoneType | null;
  /** Transition duration in milliseconds */
  duration: number;
}

/**
 * Data emitted with gesture events
 */
export interface GestureEventData {
  /** Gesture that was executed */
  gesture: GestureType;
  /** Emotional context at time of execution */
  emotionalContext: {
    emotion: EmotionType;
    properties: EmotionalProperties;
  };
}

/**
 * Data emitted with gesture chain events
 */
export interface GestureChainEventData {
  /** Array of gestures in the chain */
  gestures: GestureType[];
  /** Number of successfully queued gestures */
  successCount: number;
  /** Emotional context at time of execution */
  emotionalContext: {
    emotion: EmotionType;
    properties: EmotionalProperties;
  };
  /** Average compatibility score for the chain */
  compatibility: number;
}

/**
 * Data emitted with speech events
 */
export interface SpeechEventData {
  /** Web Audio API context */
  audioContext: AudioContext;
  /** Analyser node for connecting audio sources */
  analyser: AnalyserNode;
  /** Reference to the mascot instance */
  mascot: EmotiveMascot;
}

/**
 * Data emitted with audio level update events
 */
export interface AudioLevelData {
  /** Current audio level (0.0 to 1.0) */
  level: number;
  /** Raw frequency data array */
  rawData: number[];
  /** Timestamp of the measurement */
  timestamp: number;
}

/**
 * Data emitted with volume spike events
 */
export interface VolumeSpikeData {
  /** Audio level that triggered the spike */
  level: number;
  /** Ratio of current level to recent average */
  spikeRatio: number;
  /** Whether a gesture was triggered by this spike */
  gestureTriggered: boolean;
  /** Timestamp of the spike */
  timestamp: number;
}

/**
 * Data emitted with volume change events
 */
export interface VolumeChangeData {
  /** New volume level (0.0 to 1.0) */
  volume: number;
}

/**
 * Data emitted with audio processing error events
 */
export interface AudioErrorData {
  /** Error message */
  message: string;
  /** Error type/category */
  type: string;
  /** Additional error context */
  context?: any;
}

// ============================================================================
// Plugin System Interfaces
// ============================================================================

/**
 * Base interface for all plugin types
 */
export interface BasePlugin {
  /** Unique plugin name */
  name: string;
  /** Plugin version */
  version?: string;
  /** Plugin description */
  description?: string;
  /** Plugin author */
  author?: string;
}

/**
 * Custom emotion plugin definition
 */
export interface EmotionPlugin extends BasePlugin {
  /** Plugin type identifier */
  type: 'emotion';
  /** Emotion definition */
  definition: {
    /** Visual properties for this emotion */
    properties: EmotionalProperties;
    /** Compatible undertones */
    compatibleUndertones?: UndertoneType[];
    /** Transition preferences */
    transitions?: {
      /** Default transition duration */
      defaultDuration?: number;
      /** Preferred easing function */
      easing?: string;
    };
  };
}

/**
 * Custom gesture plugin definition
 */
export interface GesturePlugin extends BasePlugin {
  /** Plugin type identifier */
  type: 'gesture';
  /** Gesture definition */
  definition: {
    /** Animation duration in milliseconds */
    duration: number;
    /** Movement offset */
    movement: { x: number; y: number };
    /** Scale transformation */
    scale: number;
    /** Rotation in degrees */
    rotation: number;
    /** Easing function name */
    easing: string;
    /** Particle burst count */
    particleBurst: number;
    /** Glow intensity multiplier */
    glowIntensity: number;
    /** Gesture compatibility with other gestures */
    compatibility?: Record<GestureType, number>;
  };
}

/**
 * Custom particle behavior plugin definition
 */
export interface ParticleBehaviorPlugin extends BasePlugin {
  /** Plugin type identifier */
  type: 'particle';
  /** Behavior implementation */
  definition: {
    /** Update function for particle behavior */
    update: (particle: any, deltaTime: number, context: any) => void;
    /** Initialization function */
    initialize?: (particle: any, context: any) => void;
    /** Cleanup function */
    cleanup?: (particle: any) => void;
  };
}

/**
 * Custom audio effect plugin definition
 */
export interface AudioEffectPlugin extends BasePlugin {
  /** Plugin type identifier */
  type: 'audio';
  /** Audio effect definition */
  definition: {
    /** Effect initialization */
    initialize: (audioContext: AudioContext) => AudioNode;
    /** Effect parameter updates */
    updateParameters?: (node: AudioNode, parameters: any) => void;
    /** Effect cleanup */
    cleanup?: (node: AudioNode) => void;
  };
}

/**
 * Union type for all plugin types
 */
export type PluginDefinition = 
  | EmotionPlugin 
  | GesturePlugin 
  | ParticleBehaviorPlugin 
  | AudioEffectPlugin;

// ============================================================================
// Error Handling Interfaces
// ============================================================================

/**
 * Standardized error response format
 */
export interface ErrorResponse {
  /** Whether the operation was successful */
  success: false;
  /** Error details */
  error: {
    /** Error type/category */
    type: string;
    /** Human-readable error message */
    message: string;
    /** Additional error context */
    context: any;
    /** Error timestamp */
    timestamp: number;
  };
}

/**
 * Standardized success response format
 */
export interface SuccessResponse<T = any> {
  /** Whether the operation was successful */
  success: true;
  /** Response data */
  data: T;
}

/**
 * Union type for API responses
 */
export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;

// ============================================================================
// Main EmotiveMascot Class
// ============================================================================

/**
 * Main EmotiveMascot class - the primary interface for the Emotive Communication Engine
 * 
 * @example
 * ```typescript
 * // Basic usage
 * const mascot = new EmotiveMascot({ canvasId: 'my-canvas' });
 * mascot.setEmotion('happy')
 *       .express('bounce')
 *       .start();
 * 
 * // With event listeners
 * mascot.on('emotionChanged', (data) => {
 *   console.log(`Emotion changed to: ${data.emotion}`);
 * });
 * 
 * // Speech reactivity
 * navigator.mediaDevices.getUserMedia({ audio: true })
 *   .then(stream => {
 *     const audioContext = new AudioContext();
 *     const source = audioContext.createMediaStreamSource(stream);
 *     mascot.startSpeaking(audioContext);
 *     mascot.connectAudioSource(source);
 *   });
 * ```
 */
export declare class EmotiveMascot {
  /**
   * Creates a new EmotiveMascot instance
   * @param config Configuration options for the mascot
   */
  constructor(config?: MascotConfig);

  // ============================================================================
  // Core Animation Methods
  // ============================================================================

  /**
   * Sets the emotional state with optional undertone and transition duration
   * @param emotion The emotion to set
   * @param options Configuration for the emotion change
   * @returns This instance for method chaining
   * 
   * @example
   * ```typescript
   * mascot.setEmotion('happy', { undertone: 'playful', duration: 1000 });
   * ```
   */
  setEmotion(emotion: EmotionType, options?: EmotionConfig): this;

  /**
   * Executes a single gesture expression
   * @param gesture The gesture to execute
   * @returns This instance for method chaining
   * 
   * @example
   * ```typescript
   * mascot.express('bounce');
   * ```
   */
  express(gesture: GestureType): this;

  /**
   * Chains multiple gestures for sequential execution
   * @param gestures Gestures to chain together
   * @returns This instance for method chaining
   * 
   * @example
   * ```typescript
   * mascot.chain('bounce', 'pulse', 'wiggle');
   * ```
   */
  chain(...gestures: GestureType[]): this;

  /**
   * Starts the animation loop
   * @returns This instance for method chaining
   */
  start(): this;

  /**
   * Stops the animation loop and cleans up resources
   * @returns This instance for method chaining
   */
  stop(): this;

  /**
   * Pauses the animation loop (can be resumed)
   * @returns This instance for method chaining
   */
  pause(): this;

  /**
   * Resumes the animation loop from paused state
   * @returns This instance for method chaining
   */
  resume(): this;

  // ============================================================================
  // Speech Reactivity Methods
  // ============================================================================

  /**
   * Starts speech reactivity mode with audio level monitoring
   * @param audioContext Web Audio API context for audio processing
   * @returns This instance for method chaining
   * 
   * @example
   * ```typescript
   * const audioContext = new AudioContext();
   * mascot.startSpeaking(audioContext);
   * ```
   */
  startSpeaking(audioContext: AudioContext): this;

  /**
   * Stops speech reactivity mode
   * @returns This instance for method chaining
   */
  stopSpeaking(): this;

  /**
   * Connects an audio source to the speech analyser
   * @param audioSource Web Audio API source node
   * @returns This instance for method chaining
   * 
   * @example
   * ```typescript
   * const source = audioContext.createMediaStreamSource(stream);
   * mascot.connectAudioSource(source);
   * ```
   */
  connectAudioSource(audioSource: AudioNode): this;

  // ============================================================================
  // Audio Control Methods
  // ============================================================================

  /**
   * Sets master volume for all audio output
   * @param volume Volume level (0.0 to 1.0)
   * @returns This instance for method chaining
   */
  setVolume(volume: number): this;

  /**
   * Gets current master volume
   * @returns Current volume level (0.0 to 1.0)
   */
  getVolume(): number;

  /**
   * Updates audio level processor configuration
   * @param config New audio configuration options
   */
  updateAudioConfig(config: AudioConfig): void;

  // ============================================================================
  // Event System Methods
  // ============================================================================

  /**
   * Adds an event listener
   * @param event Event name to listen for
   * @param callback Function to call when event is emitted
   * @returns This instance for method chaining
   * 
   * @example
   * ```typescript
   * mascot.on('emotionChanged', (data) => {
   *   console.log(`New emotion: ${data.emotion}`);
   * });
   * ```
   */
  on<T extends EventType>(
    event: T, 
    callback: (data: T extends 'emotionChanged' ? EmotionChangeData :
               T extends 'gestureStarted' ? GestureEventData :
               T extends 'gestureChainStarted' ? GestureChainEventData :
               T extends 'speechStarted' ? SpeechEventData :
               T extends 'audioLevelUpdate' ? AudioLevelData :
               T extends 'volumeSpike' ? VolumeSpikeData :
               T extends 'volumeChanged' ? VolumeChangeData :
               T extends 'audioProcessingError' ? AudioErrorData :
               any) => void
  ): this;

  /**
   * Removes an event listener
   * @param event Event name
   * @param callback Function to remove
   * @returns This instance for method chaining
   */
  off(event: EventType, callback: Function): this;

  /**
   * Adds a one-time event listener
   * @param event Event name to listen for
   * @param callback Function to call once when event is emitted
   * @returns This instance for method chaining
   */
  once<T extends EventType>(
    event: T,
    callback: (data: any) => void
  ): this;

  /**
   * Removes all listeners for a specific event or all events
   * @param event Event name to clear, or undefined to clear all
   * @returns This instance for method chaining
   */
  removeAllListeners(event?: EventType): this;

  /**
   * Gets the number of listeners for an event
   * @param event Event name
   * @returns Number of listeners
   */
  listenerCount(event: EventType): number;

  /**
   * Gets all registered event names
   * @returns Array of event names
   */
  getEventNames(): EventType[];

  /**
   * Gets comprehensive event system statistics
   * @returns Event system statistics
   */
  getEventStats(): EventStats;

  // ============================================================================
  // State Query Methods
  // ============================================================================

  /**
   * Gets the current emotional state information
   * @returns Current emotional state
   */
  getCurrentState(): EmotionalState;

  /**
   * Gets the current emotional color
   * @returns Hex color string for current emotion
   */
  getEmotionalColor(): string;

  /**
   * Gets all available emotions
   * @returns Array of available emotion names
   */
  getAvailableEmotions(): EmotionType[];

  /**
   * Gets all available undertones
   * @returns Array of available undertone names
   */
  getAvailableUndertones(): UndertoneType[];

  /**
   * Gets all available gestures
   * @returns Array of available gesture names
   */
  getAvailableGestures(): GestureType[];

  // ============================================================================
  // Performance and Monitoring Methods
  // ============================================================================

  /**
   * Gets comprehensive performance metrics
   * @returns Current performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics;

  /**
   * Gets current audio level (0-1 range)
   * @returns Current audio level
   */
  getAudioLevel(): number;

  /**
   * Gets audio level processing statistics
   * @returns Audio processing statistics
   */
  getAudioStats(): AudioStats;

  /**
   * Gets particle system statistics
   * @returns Particle system statistics
   */
  getParticleStats(): ParticleStats;

  // ============================================================================
  // Plugin System Methods (Future Extension)
  // ============================================================================

  /**
   * Registers a plugin with the system
   * @param plugin Plugin definition to register
   * @returns Success/failure response
   */
  registerPlugin(plugin: PluginDefinition): ApiResponse<boolean>;

  /**
   * Unregisters a plugin from the system
   * @param name Plugin name to unregister
   * @returns Success/failure response
   */
  unregisterPlugin(name: string): ApiResponse<boolean>;

  /**
   * Gets all registered plugins
   * @returns Array of registered plugin names
   */
  getRegisteredPlugins(): string[];

  // ============================================================================
  // Lifecycle Methods
  // ============================================================================

  /**
   * Destroys the mascot instance and cleans up all resources
   */
  destroy(): void;
}

// ============================================================================
// Module Exports
// ============================================================================

export default EmotiveMascot;

/**
 * Version information
 */
export const VERSION: string;

/**
 * Feature detection utilities
 */
export interface FeatureDetection {
  /** Check if Web Audio API is supported */
  hasWebAudio(): boolean;
  /** Check if Canvas 2D is supported */
  hasCanvas2D(): boolean;
  /** Check if requestAnimationFrame is supported */
  hasRequestAnimationFrame(): boolean;
  /** Check if high DPI displays are supported */
  hasHighDPI(): boolean;
}

export const features: FeatureDetection;