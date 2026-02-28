// Type definitions for @joshtol/emotive-engine/minimal v3.4.0
// Ultra-light loading screen build — no audio, plugins, or manager overhead

export interface MinimalMascotConfig {
    canvasId?: string | HTMLCanvasElement;
    targetFPS?: number;
    maxParticles?: number;
    defaultEmotion?: string;
    renderingStyle?: string;
    enableGazeTracking?: boolean;
    enableIdleBehaviors?: boolean;
    topOffset?: number;
    offsetX?: number;
    offsetY?: number;
    offsetZ?: number;
    renderSize?: { width: number; height: number };
    classicConfig?: {
        coreColor?: string;
        coreSizeDivisor?: number;
        glowMultiplier?: number;
        defaultGlowColor?: string;
        particleSizeMultiplier?: number;
    };
}

export interface MinimalMascotState {
    emotion: string;
    undertone: string | null;
    shape: string;
    isRunning: boolean;
}

export interface SetEmotionOptions {
    undertone?: string | null;
    duration?: number;
    intensity?: number;
}

export class MinimalMascot {
    constructor(config?: MinimalMascotConfig);
    init(canvasOrId: string | HTMLCanvasElement): Promise<MinimalMascot>;
    start(): MinimalMascot;
    stop(): MinimalMascot;
    setEmotion(emotion: string, options?: string | SetEmotionOptions | null): MinimalMascot;
    express(gesture: string, options?: Record<string, unknown>): MinimalMascot;
    setShape(shape: string): MinimalMascot;
    setPosition(x: number, y: number, z?: number): MinimalMascot;
    resize(width: number, height: number): MinimalMascot;
    getState(): MinimalMascotState;
    on(event: string, callback: (...args: unknown[]) => void): MinimalMascot;
    off(event: string, callback: (...args: unknown[]) => void): MinimalMascot;
    destroy(): void;
}

export default MinimalMascot;

// Emotion utilities
export function getEmotion(name: string): object | null;
export function getEmotionVisualParams(name: string): object;
export function hasEmotion(name: string): boolean;
export function listEmotions(): string[];

// Gesture utilities
export function getGesture(name: string): object | null;
export function applyGesture(name: string, renderer: unknown, options?: object): void;
export function listGestures(): string[];
export const GESTURE_TYPES: Record<string, string>;

// Core systems
export class EmotiveRenderer {
    constructor(canvasManager: unknown, options?: object);
}
export class ParticleSystem {
    constructor(maxParticles?: number, errorBoundary?: unknown);
}
export class EventManager {
    constructor(options?: object);
    on(event: string, callback: (...args: unknown[]) => void): void;
    off(event: string, callback: (...args: unknown[]) => void): void;
    emit(event: string, data?: unknown): void;
}

// Version info
export const VERSION: string;
export const ENGINE_NAME: string;
export const BUILD_TYPE: string;
export const FEATURES: Record<string, boolean>;
