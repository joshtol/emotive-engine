// Type definitions for @joshtol/emotive-engine v2.4.0
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
        width?: number;
        height?: number;
        autoStart?: boolean;
        fps?: number;
        adaptive?: boolean;
        theme?: Theme;
        enableAudio?: boolean;
        enableParticles?: boolean;
    }

    export interface Theme {
        primary: string;
        secondary: string;
        accent: string;
        background?: string;
        particles?: string[];
    }

    export interface EmotionalState {
        valence: number;
        arousal: number;
        dominance?: number;
    }

    export class EmotiveMascot {
        constructor(config?: EmotiveMascotConfig);
        init(container: HTMLElement): void;
        start(): void;
        stop(): void;
        pause(): void;
        resume(): void;
        destroy(): void;
        setEmotion(emotion: string | EmotionalState): void;
        setTheme(theme: Theme): void;
        setBPM(bpm: number): void;
        addBehavior(behavior: Behavior): void;
        removeBehavior(name: string): void;
        on(event: string, handler: Function): void;
        off(event: string, handler?: Function): void;
        getState(): any;
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