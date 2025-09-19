/**
 * Emotive Engine - TypeScript Definitions
 * Public API for animation engine
 */

declare module 'emotive-engine' {
  /**
   * Timeline event types
   */
  interface TimelineEvent {
    type: 'gesture' | 'emotion' | 'shape';
    name: string;
    time: number;
  }

  /**
   * Audio analysis data
   */
  interface AudioAnalysis {
    bpm: number;
    beats: number[];
    energy: number;
    frequencies: number[];
  }

  /**
   * Animation data export
   */
  interface AnimationData {
    timeline: TimelineEvent[];
    duration: number;
    currentTime: number;
    emotion: string;
    shape: string;
  }

  /**
   * Engine capabilities
   */
  interface EngineCapabilities {
    audio: boolean;
    recording: boolean;
    timeline: boolean;
    export: boolean;
    shapes: boolean;
    gestures: boolean;
    emotions: boolean;
    particles: boolean;
  }

  /**
   * Quality level settings
   */
  type QualityLevel = 'low' | 'medium' | 'high';

  /**
   * Configuration options
   */
  interface EmotiveEngineConfig {
    targetFPS?: number;
    particleCount?: number;
    enableAudio?: boolean;
    enableParticles?: boolean;
    quality?: QualityLevel;
  }

  /**
   * Main Emotive Engine class
   */
  export default class EmotiveEngine {
    constructor(config?: EmotiveEngineConfig);

    // Initialization
    init(canvas: HTMLCanvasElement): Promise<void>;
    start(): void;
    stop(): void;
    pause(): void;
    resume(): void;
    destroy(): void;

    // Audio Management
    loadAudio(source: string | Blob): Promise<void>;
    getAudioAnalysis(): AudioAnalysis | null;
    setBPM(bpm: number): void;

    // Animation Control
    triggerGesture(gestureName: string, timestamp?: number): void;
    setEmotion(emotion: string, timestamp?: number): void;
    setShape(shape: string, timestamp?: number): void;
    setQuality(level: QualityLevel): void;

    // Timeline Recording
    startRecording(): void;
    stopRecording(): TimelineEvent[];
    playTimeline(timeline: TimelineEvent[]): void;
    stopPlayback(): void;
    getTimeline(): TimelineEvent[];
    loadTimeline(timeline: TimelineEvent[]): void;
    exportTimeline(): string;
    importTimeline(json: string): void;

    // Playback Control
    getCurrentTime(): number;
    seek(time: number): void;

    // Export Capabilities
    getFrameData(format?: string): string | null;
    getFrameBlob(format?: string): Promise<Blob | null>;
    getAnimationData(): AnimationData;

    // Query Methods
    getAvailableGestures(): string[];
    getAvailableEmotions(): string[];
    getAvailableShapes(): string[];
    getVersion(): string;
    getCapabilities(): EngineCapabilities;
  }

  export { EmotiveEngine };
}