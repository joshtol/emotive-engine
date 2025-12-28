// Type definitions for @joshtol/emotive-engine v3.2.0
// Project: https://github.com/joshtol/emotive-engine
// Definitions by: Emotive Engine Team

export = EmotiveEngine;
export as namespace EmotiveEngine;

declare namespace EmotiveEngine {
    // Animation Loop Manager
    export enum AnimationPriority {
        CRITICAL = 0,
        HIGH = 1,
        MEDIUM = 2,
        LOW = 3,
        IDLE = 4
    }

    export interface AnimationCallback {
        (deltaTime: number, timestamp: number): void;
    }

    export interface AnimationStats {
        fps: number;
        frameTime: number;
        callbackCount: number;
        totalCallbacks: number;
        droppedFrames: number;
        isRunning: boolean;
    }

    export class AnimationLoopManager {
        constructor();
        register(callback: AnimationCallback, priority?: AnimationPriority, context?: any): number;
        unregister(id: number): boolean;
        setPriority(id: number, priority: AnimationPriority): boolean;
        setEnabled(id: number, enabled: boolean): boolean;
        start(): void;
        stop(): void;
        pause(): void;
        resume(): void;
        getStats(): AnimationStats;
        setTargetFPS(fps: number): void;
        reset(): void;
    }

    export const animationLoopManager: AnimationLoopManager;

    // Gradient Cache
    export interface GradientStop {
        offset: number;
        color: string;
    }

    export interface CacheStats {
        hits: number;
        misses: number;
        evictions: number;
        size: number;
        maxSize: number;
        hitRate: number;
    }

    export class GradientCache {
        constructor(maxSize?: number, ttl?: number);
        getLinearGradient(
            ctx: CanvasRenderingContext2D,
            x0: number, y0: number,
            x1: number, y1: number,
            stops: GradientStop[]
        ): CanvasGradient;
        getRadialGradient(
            ctx: CanvasRenderingContext2D,
            x0: number, y0: number, r0: number,
            x1: number, y1: number, r1: number,
            stops: GradientStop[]
        ): CanvasGradient;
        clear(): void;
        setMaxSize(size: number): void;
        setTTL(ttl: number): void;
        getStats(): CacheStats;
        evict(count?: number): number;
    }

    export const gradientCache: GradientCache;

    // Context State Manager
    export interface ContextState {
        fillStyle?: string | CanvasGradient | CanvasPattern;
        strokeStyle?: string | CanvasGradient | CanvasPattern;
        globalAlpha?: number;
        globalCompositeOperation?: string;
        lineWidth?: number;
        lineCap?: CanvasLineCap;
        lineJoin?: CanvasLineJoin;
        shadowColor?: string;
        shadowBlur?: number;
        shadowOffsetX?: number;
        shadowOffsetY?: number;
        filter?: string;
    }

    export class ContextStateManager {
        constructor(ctx: CanvasRenderingContext2D);
        setState(state: ContextState): number;
        pushState(state?: ContextState): void;
        popState(): void;
        reset(): void;
        scoped<T>(state: ContextState, callback: () => T): T;
        getChangeCount(): number;
        getRedundantChanges(): number;
        resetStats(): void;
    }

    // Event Manager
    export interface EventListenerInfo {
        id: number;
        target: EventTarget;
        eventType: string;
        handler: EventListener;
        options?: AddEventListenerOptions;
        group: string;
        active: boolean;
    }

    export interface LeakAnalysis {
        totalListeners: number;
        byGroup: Record<string, number>;
        byEventType: Record<string, number>;
        potentialLeaks: EventListenerInfo[];
    }

    export interface AutoRemoveController {
        remove(): void;
    }

    export class EventManager {
        constructor();
        addEventListener(
            target: EventTarget,
            eventType: string,
            handler: EventListener,
            options?: AddEventListenerOptions,
            group?: string
        ): number;
        removeEventListener(id: number): boolean;
        removeGroup(group: string): number;
        removeAll(): void;
        getActiveListeners(): EventListenerInfo[];
        analyzeLeaks(): LeakAnalysis;
        once(
            target: EventTarget,
            eventType: string,
            handler: EventListener,
            options?: AddEventListenerOptions
        ): number;
        debounced(
            target: EventTarget,
            eventType: string,
            handler: EventListener,
            delay?: number,
            options?: AddEventListenerOptions
        ): number;
        throttled(
            target: EventTarget,
            eventType: string,
            handler: EventListener,
            delay?: number,
            options?: AddEventListenerOptions
        ): number;
        createAutoRemove(
            target: EventTarget,
            eventType: string,
            handler: EventListener,
            options?: AddEventListenerOptions
        ): AutoRemoveController;
    }

    export const eventManager: EventManager;

    // State Store
    export type StateValue = any;
    export type StatePath = string;
    export type StateUpdates = Record<string, StateValue>;

    export interface StateSubscriber {
        (state: any, changes: StateUpdates): void;
    }

    export interface ComputedFunction {
        (...values: StateValue[]): StateValue;
    }

    export class StateStore {
        constructor(initialState?: any);
        getState(path?: StatePath): StateValue;
        setState(pathOrUpdates: StatePath | StateUpdates, value?: StateValue): void;
        subscribe(pathOrCallback: StatePath | StateSubscriber, callback?: StateSubscriber): () => void;
        computed(name: string, dependencies: StatePath[], computeFn: ComputedFunction): void;
        undo(): boolean;
        reset(): void;
        getHistory(): any[];
        clearHistory(): void;
    }

    export const engineState: StateStore;

    // Main Emotive Mascot
    export interface EmotiveMascotConfig {
        canvas?: HTMLCanvasElement;
        canvasId?: string | HTMLCanvasElement;
        width?: number;
        height?: number;
        autoStart?: boolean;
        fps?: number;
        targetFPS?: number;
        adaptive?: boolean;
        theme?: Theme;
        enableAudio?: boolean;
        enableParticles?: boolean;
        enableGazeTracking?: boolean;
        defaultEmotion?: string;
    }

    export interface Theme {
        primary?: string;
        secondary?: string;
        accent?: string;
        background?: string;
        particles?: string[];
        core?: string;
        glow?: string;
    }

    export interface EmotionalState {
        valence: number;
        arousal: number;
        dominance?: number;
    }

    export interface FeelResult {
        success: boolean;
        error: string | null;
        parsed: ParsedIntent | null;
    }

    export interface ParsedIntent {
        emotion: string | null;
        gestures: string[];
        shape: string | null;
        undertone: string | null;
        intensity: number;
    }

    export interface FeelVocabulary {
        emotions: string[];
        undertones: string[];
        gestures: string[];
        shapes: string[];
    }

    export interface BackdropOptions {
        enabled?: boolean;
        radius?: number;
        shape?: 'circle' | 'ellipse' | 'fullscreen';
        color?: string;
        intensity?: number;
        blendMode?: 'normal' | 'multiply' | 'overlay' | 'screen';
        falloff?: 'linear' | 'smooth' | 'exponential' | 'custom';
        falloffCurve?: Array<{ stop: number; alpha: number }>;
        edgeSoftness?: number;
        coreTransparency?: number;
        blur?: number;
        responsive?: boolean;
        pulse?: boolean;
        offset?: { x: number; y: number };
        type?: 'radial-gradient' | 'vignette' | 'glow';
    }

    export interface AttachOptions {
        offsetX?: number;
        offsetY?: number;
        animate?: boolean;
        duration?: number;
        scale?: number;
        containParticles?: boolean;
    }

    export interface PerformanceMetrics {
        fps: number;
        frameTime: number;
        particleCount?: number;
    }

    export interface AudioAnalysis {
        beats?: any;
        tempo?: number;
        energy?: number;
    }

    export interface GazeState {
        x: number;
        y: number;
        enabled: boolean;
    }

    export interface Capabilities {
        audio: boolean;
        recording: boolean;
        timeline: boolean;
        export: boolean;
        shapes: boolean;
        gestures: boolean;
        emotions: boolean;
        particles: boolean;
        gazeTracking: boolean;
    }

    export interface TimelineEvent {
        type: 'emotion' | 'gesture' | 'shape';
        name: string;
        time: number;
        undertone?: string;
        config?: any;
    }

    export interface ScaleOptions {
        global?: number;
        core?: number;
        particles?: number;
    }

    export class EmotiveMascot {
        constructor(config?: EmotiveMascotConfig);

        // Lifecycle
        init(canvas: HTMLCanvasElement | string): Promise<void>;
        start(): void;
        stop(): void;
        pause(): void;
        resume(): void;
        destroy(): void;

        // LLM Integration - Natural Language API
        feel(intent: string): FeelResult;
        static getFeelVocabulary(): FeelVocabulary;
        parseIntent(intent: string): ParsedIntent;

        // Emotion & Expression
        setEmotion(emotion: string, undertoneOrDurationOrOptions?: string | number | { undertone?: string; duration?: number }, timestamp?: number): void;
        express(gestureName: string, timestamp?: number): void;
        triggerGesture(gestureName: string, timestamp?: number): void;
        chain(chainName: string): void;
        updateUndertone(undertone: string | null): void;

        // Shape Morphing
        morphTo(shape: string, config?: any): void;
        setShape(shape: string, configOrTimestamp?: any | number): void;

        // Audio
        loadAudio(source: string | Blob): Promise<void>;
        connectAudio(audioElement: HTMLAudioElement): void;
        disconnectAudio(audioElement?: HTMLAudioElement): void;
        getAudioAnalysis(): AudioAnalysis;
        getSpectrumData(): number[];
        startRhythmSync(bpm?: number): void;
        stopRhythmSync(): void;
        setSoundEnabled(enabled: boolean): void;
        setBPM(bpm: number): void;

        // Gaze Tracking
        enableGazeTracking(): void;
        disableGazeTracking(): void;
        setGazeTarget(x: number, y: number): void;
        getGazeState(): GazeState | null;

        // Positioning
        setPosition(x: number, y: number, z?: number): void;
        animateToPosition(x: number, y: number, z?: number, duration?: number, easing?: string): void;
        attachToElement(elementOrSelector: string | HTMLElement, options?: AttachOptions): EmotiveMascot;
        detachFromElement(): void;
        isAttachedToElement(): boolean;
        setContainment(bounds: { width: number; height: number } | null, scale?: number): void;

        // Visual Customization
        setScale(scaleOrOptions: number | ScaleOptions): EmotiveMascot;
        getScale(): number;
        setOpacity(opacity: number): EmotiveMascot;
        getOpacity(): number;
        fadeIn(duration?: number): EmotiveMascot;
        fadeOut(duration?: number): EmotiveMascot;
        setColor(color: string): EmotiveMascot;
        setGlowColor(color: string): EmotiveMascot;
        setTheme(theme: Theme): EmotiveMascot;
        setBackdrop(options: BackdropOptions): EmotiveMascot;
        getBackdrop(): BackdropOptions | null;

        // Particles
        clearParticles(): void;
        setMaxParticles(maxParticles: number): EmotiveMascot;
        getParticleCount(): number;
        setParticleSystemCanvasDimensions(width: number, height: number): EmotiveMascot;

        // Performance
        setQuality(level: 'low' | 'medium' | 'high'): void;
        setSpeed(speed: number): EmotiveMascot;
        getSpeed(): number;
        setFPS(fps: number): EmotiveMascot;
        getFPS(): number;
        isPaused(): boolean;
        getPerformanceMetrics(): PerformanceMetrics;
        batch(callback: (mascot: EmotiveMascot) => void): EmotiveMascot;

        // Timeline Recording
        startRecording(): void;
        stopRecording(): TimelineEvent[];
        playTimeline(timeline: TimelineEvent[]): void;
        stopPlayback(): void;
        getTimeline(): TimelineEvent[];
        loadTimeline(timeline: TimelineEvent[]): void;
        exportTimeline(): string;
        importTimeline(json: string): void;
        getCurrentTime(): number;
        seek(time: number): void;

        // Export
        getFrameData(format?: string): string;
        getFrameBlob(format?: string): Promise<Blob>;
        getAnimationData(): any;

        // Query
        getAvailableGestures(): string[];
        getAvailableEmotions(): string[];
        getAvailableShapes(): string[];
        getVersion(): string;
        getCapabilities(): Capabilities;

        // Events
        on(event: string, handler: Function): EmotiveMascot;
        off(event: string, handler?: Function): EmotiveMascot;

        // Component access (safe proxies)
        readonly renderer: any;
        readonly shapeMorpher: any;
        readonly gazeTracker: any;
        readonly canvas: HTMLCanvasElement;
    }

    // Particle System
    export interface ParticleConfig {
        count?: number;
        size?: number | [number, number];
        speed?: number | [number, number];
        life?: number | [number, number];
        color?: string | string[];
        shape?: 'circle' | 'square' | 'star' | 'triangle';
        emissionRate?: number;
        gravity?: number;
        wind?: [number, number];
    }

    export class ParticleSystem {
        constructor(config?: ParticleConfig);
        emit(x: number, y: number, count?: number): void;
        update(deltaTime: number): void;
        render(ctx: CanvasRenderingContext2D): void;
        clear(): void;
        setConfig(config: ParticleConfig): void;
        getParticleCount(): number;
    }

    // Animation Controller
    export interface AnimationState {
        name: string;
        duration: number;
        loop?: boolean;
        easing?: string;
    }

    export class AnimationController {
        constructor();
        addState(state: AnimationState): void;
        removeState(name: string): void;
        play(name: string, options?: any): void;
        stop(): void;
        pause(): void;
        resume(): void;
        getCurrentState(): AnimationState | null;
        setSpeed(speed: number): void;
    }

    // Renderer
    export interface RendererConfig {
        canvas: HTMLCanvasElement;
        antialias?: boolean;
        alpha?: boolean;
        preserveDrawingBuffer?: boolean;
    }

    export class EmotiveRenderer {
        constructor(config: RendererConfig);
        render(scene: any): void;
        clear(): void;
        resize(width: number, height: number): void;
        setQuality(quality: 'low' | 'medium' | 'high' | 'auto'): void;
        getStats(): any;
    }

    // Behaviors
    export interface Behavior {
        name: string;
        priority?: number;
        enabled?: boolean;
        update(deltaTime: number, state: any): void;
        render?(ctx: CanvasRenderingContext2D, state: any): void;
        start?(): void;
        stop?(): void;
    }

    export class IdleBehavior implements Behavior {
        name: string;
        update(deltaTime: number, state: any): void;
    }

    export class BreathingBehavior implements Behavior {
        name: string;
        update(deltaTime: number, state: any): void;
    }

    export class BlinkBehavior implements Behavior {
        name: string;
        update(deltaTime: number, state: any): void;
    }

    // Utils
    export namespace Utils {
        function lerp(a: number, b: number, t: number): number;
        function clamp(value: number, min: number, max: number): number;
        function random(min?: number, max?: number): number;
        function distance(x1: number, y1: number, x2: number, y2: number): number;
        function angle(x1: number, y1: number, x2: number, y2: number): number;
        function hsv2rgb(h: number, s: number, v: number): [number, number, number];
        function rgb2hsv(r: number, g: number, b: number): [number, number, number];
        function debounce<T extends Function>(fn: T, delay: number): T;
        function throttle<T extends Function>(fn: T, delay: number): T;
    }

    // Constants
    export namespace Constants {
        const VERSION: string;
        const DEFAULT_FPS: number;
        const MAX_PARTICLES: number;
        const DEFAULT_THEME: Theme;
    }

    // Events
    export interface EmotiveEvent {
        type: string;
        data?: any;
        timestamp: number;
    }

    export type EmotiveEventHandler = (event: EmotiveEvent) => void;

    // Module exports
    export function createMascot(config?: EmotiveMascotConfig): EmotiveMascot;
    export function createParticleSystem(config?: ParticleConfig): ParticleSystem;
    export function createAnimationController(): AnimationController;
    export function createRenderer(config: RendererConfig): EmotiveRenderer;
}