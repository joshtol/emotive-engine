/**
 * TypeScript definitions for core system classes
 * Internal APIs for advanced usage and plugin development
 */

import { 
  EmotionType, 
  UndertoneType, 
  GestureType, 
  ParticleBehaviorType,
  EmotionalProperties,
  PerformanceMetrics,
  AudioStats,
  ParticleStats
} from './index';

// ============================================================================
// Core System Interfaces
// ============================================================================

/**
 * Canvas management system interface
 */
export interface ICanvasManager {
  /** Get the 2D rendering context */
  getContext(): CanvasRenderingContext2D;
  /** Get canvas dimensions */
  getDimensions(): { width: number; height: number };
  /** Get canvas center point */
  getCenter(): { x: number; y: number };
  /** Handle canvas resize */
  handleResize(): void;
  /** Get device pixel ratio */
  getPixelRatio(): number;
}

/**
 * Error boundary system interface
 */
export interface IErrorBoundary {
  /** Wrap a function with error handling */
  wrap<T extends (...args: any[]) => any>(
    fn: T, 
    context?: string, 
    fallbackReturn?: any
  ): T;
  /** Get error statistics */
  getErrorStats(): {
    totalErrors: number;
    errorsByContext: Record<string, number>;
    lastError: Error | null;
  };
}

/**
 * Emotive state machine interface
 */
export interface IEmotiveStateMachine {
  /** Set emotional state */
  setEmotion(emotion: EmotionType, undertone?: UndertoneType, duration?: number): boolean;
  /** Get current state */
  getCurrentState(): {
    emotion: EmotionType;
    undertone: UndertoneType | null;
    gesture: GestureType | null;
    gestureQueue: GestureType[];
    speaking: boolean;
    audioLevel: number;
  };
  /** Get emotional properties */
  getCurrentEmotionalProperties(): EmotionalProperties;
  /** Get available emotions */
  getAvailableEmotions(): EmotionType[];
  /** Get available undertones */
  getAvailableUndertones(): UndertoneType[];
  /** Update state */
  update(deltaTime: number): void;
}

/**
 * Gesture system interface
 */
export interface IGestureSystem {
  /** Execute a gesture */
  execute(gesture: GestureType, emotionalContext: any): boolean;
  /** Validate gesture chain */
  validateChain(gestures: GestureType[]): {
    isValid: boolean;
    warnings: string[];
    averageCompatibility: number;
  };
  /** Get available gestures */
  getAvailableGestures(): GestureType[];
  /** Check if gesture is active */
  isActive(): boolean;
  /** Get current gesture */
  getCurrentGestureId(): GestureType | null;
  /** Get queue length */
  getQueueLength(): number;
  /** Update gesture system */
  update(deltaTime: number): void;
}

/**
 * Particle system interface
 */
export interface IParticleSystem {
  /** Spawn particles */
  spawn(count: number, behavior: ParticleBehaviorType, emotionalContext: any): void;
  /** Update particles */
  update(deltaTime: number, emotionalContext: any): void;
  /** Get particle statistics */
  getStats(): ParticleStats;
  /** Clear all particles */
  clear(): void;
  /** Get active particles */
  getParticles(): any[];
}

/**
 * Renderer interface
 */
export interface IRenderer {
  /** Render the current frame */
  render(renderState: any, deltaTime: number): void;
  /** Update audio level */
  updateAudioLevel(level: number): void;
  /** Handle speech start */
  onSpeechStart(audioContext: AudioContext): void;
  /** Handle speech stop */
  onSpeechStop(): void;
}

/**
 * Sound system interface
 */
export interface ISoundSystem {
  /** Initialize sound system */
  initialize(): Promise<boolean>;
  /** Check if sound system is available */
  isAvailable(): boolean;
  /** Set master volume */
  setMasterVolume(volume: number, emotion?: EmotionType): void;
  /** Set ambient tone */
  setAmbientTone(emotion: EmotionType, duration?: number): void;
  /** Play gesture sound */
  playGestureSound(gesture: GestureType, emotion: EmotionType): void;
  /** Stop ambient tone */
  stopAmbientTone(fadeTime?: number): void;
  /** Cleanup resources */
  cleanup(): void;
}

// ============================================================================
// Controller Interfaces
// ============================================================================

/**
 * Animation controller interface
 */
export interface IAnimationController {
  /** Start animation loop */
  start(): boolean;
  /** Stop animation loop */
  stop(): boolean;
  /** Check if animating */
  isAnimating(): boolean;
  /** Set target FPS */
  setTargetFPS(fps: number): void;
  /** Get performance metrics */
  getPerformanceMetrics(): PerformanceMetrics;
  /** Set subsystems */
  setSubsystems(subsystems: any): void;
  /** Set event callback */
  setEventCallback(callback: (event: string, data: any) => void): void;
  /** Destroy controller */
  destroy(): void;
}

/**
 * Performance monitor interface
 */
export interface IPerformanceMonitor {
  /** Start frame timing */
  startFrame(): void;
  /** End frame timing */
  endFrame(): void;
  /** Update metrics */
  updateMetrics(): void;
  /** Get current metrics */
  getMetrics(): PerformanceMetrics;
  /** Check performance thresholds */
  checkThresholds(): boolean;
  /** Apply optimizations */
  applyOptimizations(): void;
  /** Revert optimizations */
  revertOptimizations(): void;
}

/**
 * Audio level processor interface
 */
export interface IAudioLevelProcessor {
  /** Initialize with audio context */
  initialize(audioContext: AudioContext): boolean;
  /** Update audio level */
  updateAudioLevel(deltaTime: number): void;
  /** Get current level */
  getCurrentLevel(): number;
  /** Get statistics */
  getStats(): AudioStats;
  /** Get analyser node */
  getAnalyser(): AnalyserNode | null;
  /** Check if processing is active */
  isProcessingActive(): boolean;
  /** Update configuration */
  updateConfig(config: any): void;
  /** Cleanup resources */
  cleanup(): void;
}

/**
 * Event manager interface
 */
export interface IEventManager {
  /** Add event listener */
  on(event: string, callback: Function): boolean;
  /** Remove event listener */
  off(event: string, callback: Function): void;
  /** Add one-time listener */
  once(event: string, callback: Function): boolean;
  /** Emit event */
  emit(event: string, data?: any): void;
  /** Remove all listeners */
  removeAllListeners(event?: string): number;
  /** Get listener count */
  listenerCount(event: string): number;
  /** Get event names */
  getEventNames(): string[];
  /** Get event statistics */
  getEventStats(): any;
  /** Cleanup resources */
  cleanup(): void;
}

/**
 * Resource manager interface
 */
export interface IResourceManager {
  /** Register a resource */
  register(name: string, resource: any, cleanupFn?: () => void): void;
  /** Unregister a resource */
  unregister(name: string): void;
  /** Get resource count */
  getResourceCount(): number;
  /** Validate resources */
  validateResources(): boolean;
  /** Cleanup all resources */
  cleanup(): void;
  /** Destroy manager */
  destroy(): void;
}

// ============================================================================
// Utility Interfaces
// ============================================================================

/**
 * Color utilities interface
 */
export interface ColorUtils {
  /** Interpolate between HSL colors */
  interpolateHsl(color1: string, color2: string, factor: number): string;
  /** Convert hex to HSL */
  hexToHsl(hex: string): { h: number; s: number; l: number };
  /** Convert HSL to hex */
  hslToHex(h: number, s: number, l: number): string;
  /** Adjust color brightness */
  adjustBrightness(color: string, factor: number): string;
}

/**
 * Easing functions interface
 */
export interface EasingUtils {
  /** Apply easing function */
  applyEasing(progress: number, easingType: string): number;
  /** Get available easing functions */
  getAvailableEasings(): string[];
}

// ============================================================================
// Configuration Interfaces for Core Systems
// ============================================================================

/**
 * Animation controller configuration
 */
export interface AnimationControllerConfig {
  /** Target frames per second */
  targetFPS?: number;
  /** Enable performance monitoring */
  enablePerformanceMonitoring?: boolean;
  /** Performance degradation threshold */
  performanceThreshold?: number;
}

/**
 * Degradation manager configuration
 */
export interface DegradationManagerConfig {
  /** Enable automatic quality degradation based on performance (default: false) */
  enableAutoOptimization?: boolean;
  /** FPS threshold below which degradation occurs (default: 30) */
  performanceThreshold?: number;
  /** Memory usage threshold in MB (default: 50) */
  memoryThreshold?: number;
  /** Number of degradation steps/quality levels (default: 4) */
  degradationSteps?: number;
  /** Delay in ms before attempting quality recovery (default: 1000) */
  recoveryDelay?: number;
  /** Allow manual quality level control (default: true) */
  enableManualControls?: boolean;
  /** Enable progressive feature enhancement (default: true) */
  enableProgressiveEnhancement?: boolean;
  /** FPS below which to emit warning without degradation (default: 50) */
  warningFPS?: number;
  /** FPS below which to trigger degradation (default: 30) */
  criticalFPS?: number;
  /** Consecutive good frames needed before recovery (default: 30) */
  requiredGoodFrames?: number;
}

/**
 * Performance monitor configuration
 */
export interface PerformanceMonitorConfig {
  /** Minimum acceptable FPS */
  minFPS?: number;
  /** Maximum acceptable frame time (ms) */
  maxFrameTime?: number;
  /** Maximum memory usage (MB) */
  maxMemoryMB?: number;
  /** Maximum particle count */
  maxParticles?: number;
  /** Enable automatic optimization */
  enableAutoOptimization?: boolean;
}

/**
 * Event manager configuration
 */
export interface EventManagerConfig {
  /** Maximum listeners per event */
  maxListeners?: number;
  /** Enable debugging */
  enableDebugging?: boolean;
  /** Enable monitoring */
  enableMonitoring?: boolean;
  /** Memory warning threshold */
  memoryWarningThreshold?: number;
}

// ============================================================================
// Core System Classes (for advanced usage)
// ============================================================================

/**
 * Canvas manager class
 */
export declare class CanvasManager implements ICanvasManager {
  constructor(canvas: HTMLCanvasElement);
  getContext(): CanvasRenderingContext2D;
  getDimensions(): { width: number; height: number };
  getCenter(): { x: number; y: number };
  handleResize(): void;
  getPixelRatio(): number;
}

/**
 * Error boundary class
 */
export declare class ErrorBoundary implements IErrorBoundary {
  constructor();
  wrap<T extends (...args: any[]) => any>(
    fn: T, 
    context?: string, 
    fallbackReturn?: any
  ): T;
  getErrorStats(): {
    totalErrors: number;
    errorsByContext: Record<string, number>;
    lastError: Error | null;
  };
}

/**
 * Animation controller class
 */
export declare class AnimationController implements IAnimationController {
  constructor(errorBoundary: IErrorBoundary, config?: AnimationControllerConfig);
  start(): boolean;
  stop(): boolean;
  isAnimating(): boolean;
  setTargetFPS(fps: number): void;
  getPerformanceMetrics(): PerformanceMetrics;
  setSubsystems(subsystems: any): void;
  setEventCallback(callback: (event: string, data: any) => void): void;
  destroy(): void;
}

/**
 * Performance monitor class
 */
export declare class PerformanceMonitor implements IPerformanceMonitor {
  constructor(config?: PerformanceMonitorConfig);
  startFrame(): void;
  endFrame(): void;
  updateMetrics(): void;
  getMetrics(): PerformanceMetrics;
  checkThresholds(): boolean;
  applyOptimizations(): void;
  revertOptimizations(): void;
}

/**
 * Audio level processor class
 */
export declare class AudioLevelProcessor implements IAudioLevelProcessor {
  constructor(config?: any);
  initialize(audioContext: AudioContext): boolean;
  updateAudioLevel(deltaTime: number): void;
  getCurrentLevel(): number;
  getStats(): AudioStats;
  getAnalyser(): AnalyserNode | null;
  isProcessingActive(): boolean;
  updateConfig(config: any): void;
  cleanup(): void;
}

/**
 * Event manager class
 */
export declare class EventManager implements IEventManager {
  constructor(config?: EventManagerConfig);
  on(event: string, callback: Function): boolean;
  off(event: string, callback: Function): void;
  once(event: string, callback: Function): boolean;
  emit(event: string, data?: any): void;
  removeAllListeners(event?: string): number;
  listenerCount(event: string): number;
  getEventNames(): string[];
  getEventStats(): any;
  cleanup(): void;
}

/**
 * Resource manager class
 */
export declare class ResourceManager implements IResourceManager {
  constructor();
  register(name: string, resource: any, cleanupFn?: () => void): void;
  unregister(name: string): void;
  getResourceCount(): number;
  validateResources(): boolean;
  cleanup(): void;
  destroy(): void;
}