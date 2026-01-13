// Type definitions for @joshtol/emotive-engine/3d v3.2.0
// Project: https://github.com/joshtol/emotive-engine
// Definitions by: Emotive Engine Team

import * as THREE from 'three';

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type GeometryType =
    | 'sphere'
    | 'crystal'
    | 'rough'
    | 'heart'
    | 'moon'
    | 'sun'
    | 'torus'
    | 'icosahedron'
    | 'octahedron'
    | 'tetrahedron'
    | 'dodecahedron'
    | 'ring'
    | 'smooth-icosahedron'
    | 'faceted-icosahedron';

export type EmotionName =
    | 'neutral'
    | 'joy'
    | 'calm'
    | 'love'
    | 'excited'
    | 'euphoria'
    | 'sadness'
    | 'anger'
    | 'fear'
    | 'surprise'
    | 'disgust'
    | 'focused'
    | 'suspicion'
    | 'resting'
    | 'glitch';

export type GestureName =
    // Motion gestures
    | 'bounce'
    | 'pulse'
    | 'shake'
    | 'nod'
    | 'vibrate'
    | 'orbit'
    | 'twitch'
    | 'sway'
    | 'float'
    | 'jitter'
    | 'wiggle'
    | 'headBob'
    | 'lean'
    | 'point'
    | 'reach'
    | 'sparkle'
    | 'shimmer'
    | 'groove'
    | 'rain'
    // Transform gestures
    | 'spin'
    | 'jump'
    | 'morph'
    | 'stretch'
    | 'tilt'
    | 'orbital'
    | 'hula'
    | 'twist'
    // Effect gestures
    | 'wave'
    | 'drift'
    | 'flicker'
    | 'burst'
    | 'directional'
    | 'settle'
    | 'fade'
    | 'hold'
    | 'breathe'
    | 'expand'
    | 'contract'
    | 'flash'
    | 'glow'
    | 'peek'
    | 'runningman'
    | 'charleston';

export type ChainPreset =
    | 'rise'
    | 'flow'
    | 'burst'
    | 'drift'
    | 'chaos'
    | 'morph'
    | 'rhythm'
    | 'spiral'
    | 'routine'
    | 'radiance'
    | 'twinkle'
    | 'stream';

export type CameraPreset = 'front' | 'side' | 'top' | 'bottom' | 'angle' | 'back';

export type BlendMode =
    | 'Multiply'
    | 'Linear Burn'
    | 'Color Burn'
    | 'Color Dodge'
    | 'Screen'
    | 'Overlay'
    | 'Add'
    | 'Soft Light'
    | 'Hard Light'
    | 'Vivid Light'
    | 'Linear Light'
    | 'Difference'
    | 'Exclusion'
    | 'Darken'
    | 'Lighten'
    | 'Subtract'
    | 'Divide'
    | 'Pin Light';

// ═══════════════════════════════════════════════════════════════════════════════
// EMOTIVE MASCOT 3D
// ═══════════════════════════════════════════════════════════════════════════════

export interface EmotiveMascot3DConfig {
    /** Canvas element ID */
    canvasId?: string;
    /** Core geometry type */
    coreGeometry?: GeometryType;
    /** Target frames per second */
    targetFPS?: number;
    /** Enable particle effects */
    enableParticles?: boolean;
    /** Default emotion state */
    defaultEmotion?: EmotionName;
    /** Maximum number of particles */
    maxParticles?: number;
    /** Enable post-processing (bloom, color grading) */
    enablePostProcessing?: boolean;
    /** Enable shadow casting */
    enableShadows?: boolean;
    /** Enable camera orbit controls */
    enableControls?: boolean;
    /** Enable camera auto-rotation */
    autoRotate?: boolean;
    /** Auto-rotation speed */
    autoRotateSpeed?: number;
    /** Camera distance from origin */
    cameraDistance?: number;
    /** Camera field of view */
    fov?: number;
    /** Minimum zoom distance */
    minZoom?: number;
    /** Maximum zoom distance */
    maxZoom?: number;
    /** Material variant ('multiplexer' for advanced shaders) */
    materialVariant?: string | null;
    /** Enable blinking animation */
    enableBlinking?: boolean;
    /** Enable breathing animation */
    enableBreathing?: boolean;
}

export interface SetEmotionOptions {
    undertone?: string;
}

export class EmotiveMascot3D {
    constructor(config?: EmotiveMascot3DConfig);

    /** Configuration object */
    config: EmotiveMascot3DConfig;

    /** 3D core manager */
    core3D: Core3DManager | null;

    /** Current emotion state */
    emotion: EmotionName;

    /** Current undertone modifier */
    undertone: string | null;

    /** Whether animation loop is running */
    isRunning: boolean;

    // ─────────────────────────────────────────────────────────────────────────
    // LIFECYCLE
    // ─────────────────────────────────────────────────────────────────────────

    /** Initialize the 3D engine */
    init(container: HTMLElement): EmotiveMascot3D;

    /** Start animation loop */
    start(): void;

    /** Stop animation loop */
    stop(): void;

    /** Clean up all resources */
    destroy(): void;

    // ─────────────────────────────────────────────────────────────────────────
    // EMOTIONS
    // ─────────────────────────────────────────────────────────────────────────

    /** Set emotional state */
    setEmotion(emotion: EmotionName, options?: string | SetEmotionOptions): void;

    /** Update undertone without changing emotion */
    setUndertone(undertone: string | null): void;

    /** Update undertone (alias for setUndertone) */
    updateUndertone(undertone: string | null): void;

    // ─────────────────────────────────────────────────────────────────────────
    // GESTURES
    // ─────────────────────────────────────────────────────────────────────────

    /** Express a gesture */
    express(gestureName: GestureName): void;

    /** Execute a gesture chain */
    chain(chainName: ChainPreset | string | string[]): void;

    // ─────────────────────────────────────────────────────────────────────────
    // SHAPE MORPHING
    // ─────────────────────────────────────────────────────────────────────────

    /** Morph to a different geometry */
    morphTo(shapeName: GeometryType): void;

    // ─────────────────────────────────────────────────────────────────────────
    // AUTO-ROTATION
    // ─────────────────────────────────────────────────────────────────────────

    /** Enable camera auto-rotation */
    enableAutoRotate(): void;

    /** Disable camera auto-rotation */
    disableAutoRotate(): void;

    /** Whether auto-rotation is enabled */
    readonly autoRotateEnabled: boolean;

    // ─────────────────────────────────────────────────────────────────────────
    // PARTICLES
    // ─────────────────────────────────────────────────────────────────────────

    /** Enable particle effects */
    enableParticles(): void;

    /** Disable particle effects */
    disableParticles(): void;

    /** Whether particles are enabled */
    readonly particlesEnabled: boolean;

    // ─────────────────────────────────────────────────────────────────────────
    // BLINKING
    // ─────────────────────────────────────────────────────────────────────────

    /** Enable blinking animation */
    enableBlinking(): void;

    /** Disable blinking animation */
    disableBlinking(): void;

    /** Whether blinking is enabled */
    readonly blinkingEnabled: boolean;

    // ─────────────────────────────────────────────────────────────────────────
    // BREATHING
    // ─────────────────────────────────────────────────────────────────────────

    /** Enable breathing animation */
    enableBreathing(): void;

    /** Disable breathing animation */
    disableBreathing(): void;

    /** Whether breathing is enabled */
    readonly breathingEnabled: boolean;

    // ─────────────────────────────────────────────────────────────────────────
    // WOBBLE
    // ─────────────────────────────────────────────────────────────────────────

    /** Enable wobble/shake effects */
    enableWobble(): void;

    /** Disable wobble/shake effects */
    disableWobble(): void;

    /** Whether wobble is enabled */
    readonly wobbleEnabled: boolean;

    // ─────────────────────────────────────────────────────────────────────────
    // CAMERA
    // ─────────────────────────────────────────────────────────────────────────

    /** Set camera to a preset position */
    setCameraPreset(preset: CameraPreset, duration?: number): void;

    // ─────────────────────────────────────────────────────────────────────────
    // RHYTHM SYNC
    // ─────────────────────────────────────────────────────────────────────────

    /** Enable rhythm sync for 3D animations */
    enableRhythmSync(): void;

    /** Disable rhythm sync for 3D animations */
    disableRhythmSync(): void;

    /** Whether rhythm sync is enabled */
    readonly rhythmSyncEnabled: boolean;

    /** Enable ambient groove (subtle idle animation synced to beat) */
    enableGroove(): void;

    /** Disable ambient groove */
    disableGroove(): void;

    /** Set beat sync strength for gesture animations */
    setBeatSyncStrength(strength: number): void;

    /** Set groove configuration for idle animations */
    setGrooveConfig(config: GrooveConfig): void;

    /** Check if rhythm is currently playing */
    isRhythmPlaying(): boolean;

    /** Get current BPM from rhythm system */
    getRhythmBPM(): number;

    /** Start rhythm playback for 3D animations */
    startRhythm(bpm?: number, pattern?: RhythmPattern): void;

    /** Stop rhythm playback */
    stopRhythm(): void;

    /** Set rhythm BPM */
    setRhythmBPM(bpm: number): void;

    /** Set rhythm pattern */
    setRhythmPattern(pattern: RhythmPattern): void;

    // ─────────────────────────────────────────────────────────────────────────
    // AUDIO CONNECTION
    // ─────────────────────────────────────────────────────────────────────────

    /** Connect an audio element for audio-reactive animations */
    connectAudio(audioElement: HTMLAudioElement): Promise<void>;

    /** Disconnect audio and stop audio-reactive animations */
    disconnectAudio(): void;

    // ─────────────────────────────────────────────────────────────────────────
    // CORE GLOW
    // ─────────────────────────────────────────────────────────────────────────

    /** Enable or disable the inner soul/core glow */
    setCoreGlowEnabled(enabled: boolean): void;

    /** Check if core glow is currently enabled */
    isCoreGlowEnabled(): boolean;

    // ─────────────────────────────────────────────────────────────────────────
    // MORPHING
    // ─────────────────────────────────────────────────────────────────────────

    /** Check if a geometry morph is currently in progress */
    isMorphing(): boolean;

    /** Get current morph state for debugging or UI display */
    getMorphState(): MorphState | null;

    /** Grow in from scale 0 (pop-in animation) */
    growIn(duration?: number): void;

    // ─────────────────────────────────────────────────────────────────────────
    // SSS PRESETS
    // ─────────────────────────────────────────────────────────────────────────

    /** Apply an SSS (Subsurface Scattering) preset to the crystal material */
    setSSSPreset(presetName: SSSPresetName): boolean;

    /** Set the geometry type (alias for morphTo) */
    setGeometry(geometryName: GeometryType, options?: MorphOptions): void;

    // ─────────────────────────────────────────────────────────────────────────
    // ECLIPSE EFFECTS
    // ─────────────────────────────────────────────────────────────────────────

    /** Start a solar eclipse animation */
    startSolarEclipse(options?: EclipseOptions): void;

    /** Start a lunar eclipse animation (blood moon) */
    startLunarEclipse(options?: EclipseOptions): void;

    /** Stop any active eclipse animation */
    stopEclipse(): void;

    // ─────────────────────────────────────────────────────────────────────────
    // POSITIONING
    // ─────────────────────────────────────────────────────────────────────────

    /** Set position offset of the mascot */
    setPosition(x: number, y: number, z?: number): void;

    /** Get current position */
    getPosition(): { x: number; y: number; z: number };

    /** Animate to a target position smoothly */
    animateToPosition(x: number, y: number, z?: number, duration?: number, easing?: string): void;

    /** Attach mascot to a DOM element with automatic position tracking */
    attachToElement(elementOrSelector: HTMLElement | string, options?: AttachOptions): EmotiveMascot3D;

    /** Check if mascot is attached to an element */
    isAttachedToElement(): boolean;

    /** Detach mascot from tracked element */
    detachFromElement(): EmotiveMascot3D;

    // ─────────────────────────────────────────────────────────────────────────
    // ACCESSIBILITY
    // ─────────────────────────────────────────────────────────────────────────

    /** Check if user prefers reduced motion */
    prefersReducedMotion(): boolean;

    /** Set reduced motion mode manually */
    setReducedMotion(enabled: boolean): EmotiveMascot3D;

    // ─────────────────────────────────────────────────────────────────────────
    // NATURAL LANGUAGE INTERFACE
    // ─────────────────────────────────────────────────────────────────────────

    /** Parse natural language and apply emotions/gestures */
    feel(description: string): FeelResult;

    // ─────────────────────────────────────────────────────────────────────────
    // HELPER METHODS
    // ─────────────────────────────────────────────────────────────────────────

    /** Get list of available emotions */
    getAvailableEmotions(): string[];

    /** Get list of available gestures */
    getAvailableGestures(): string[];

    /** Get list of available geometries */
    getAvailableGeometries(): string[];

    /** Set groove preset */
    setGroove(preset: string): EmotiveMascot3D;

    /** Enable crystal soul effect */
    enableCrystalSoul(): EmotiveMascot3D;

    /** Disable crystal soul effect */
    disableCrystalSoul(): EmotiveMascot3D;

    // ─────────────────────────────────────────────────────────────────────────
    // EVENT MANAGER
    // ─────────────────────────────────────────────────────────────────────────

    /** Event manager for subscribing to mascot events */
    readonly eventManager: EventManager;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADDITIONAL TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type RhythmPattern = 'straight' | 'swing' | 'waltz' | 'dubstep' | 'breakbeat' | string;

export type SSSPresetName = 'quartz' | 'emerald' | 'ruby' | 'sapphire' | 'amethyst' | 'topaz' | 'citrine' | 'diamond';

export interface GrooveConfig {
    /** Vertical bounce amplitude (default: 0.02) */
    grooveBounceAmount?: number;
    /** Horizontal sway amplitude (default: 0.015) */
    grooveSwayAmount?: number;
    /** Scale pulse amplitude (default: 0.03) */
    groovePulseAmount?: number;
    /** Rotation sway amplitude (default: 0.02) */
    grooveRotationAmount?: number;
}

export interface MorphOptions {
    /** Transition duration in ms (default: 800ms) */
    duration?: number;
    /** Material variant to use */
    materialVariant?: string;
    /** Callback when material is swapped */
    onMaterialSwap?: (info: any) => void;
}

export interface MorphState {
    progress: number;
    fromGeometry: GeometryType | null;
    toGeometry: GeometryType | null;
    isMorphing: boolean;
}

export interface EclipseOptions {
    /** Eclipse type */
    type?: 'total' | 'annular' | 'partial' | 'penumbral';
    /** Duration in ms (default: 10000) */
    duration?: number;
}

export interface AttachOptions {
    /** X offset from element center (default: 0) */
    offsetX?: number;
    /** Y offset from element center (default: 0) */
    offsetY?: number;
    /** Animate to position (default: true) */
    animate?: boolean;
    /** Animation duration in ms (default: 1000) */
    duration?: number;
    /** Scale factor for mascot (default: 1) */
    scale?: number;
    /** Whether to contain particles within element bounds (default: true) */
    containParticles?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FEEL RESULT
// ═══════════════════════════════════════════════════════════════════════════════

export interface FeelResult {
    /** Whether the feel() call succeeded */
    success: boolean;
    /** Parsed intent data (emotion, gestures, etc.) */
    parsed?: {
        emotion?: EmotionName;
        undertone?: string;
        gestures?: GestureName[];
        geometry?: GeometryType;
    };
    /** Error message if success is false */
    error?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// EVENT MANAGER
// ═══════════════════════════════════════════════════════════════════════════════

export type EventName =
    | 'emotion:change'
    | 'gesture:start'
    | 'gesture:end'
    | 'morph:start'
    | 'morph:end'
    | 'position:change'
    | 'scale:change'
    | 'rhythm:start'
    | 'rhythm:stop'
    | 'bpm:change'
    | 'accessibility:reducedMotion';

export interface EventManager {
    /** Subscribe to an event */
    on(event: EventName, handler: (data: any) => void): void;

    /** Unsubscribe from an event */
    off(event: EventName, handler: (data: any) => void): void;

    /** Emit an event */
    emit(event: EventName, data: any): void;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CORE 3D MANAGER
// ═══════════════════════════════════════════════════════════════════════════════

export interface Core3DManagerOptions {
    geometry?: GeometryType;
    emotion?: EmotionName;
    enableParticles?: boolean;
    enablePostProcessing?: boolean;
    enableShadows?: boolean;
    enableControls?: boolean;
    autoRotate?: boolean;
    autoRotateSpeed?: number;
    cameraDistance?: number;
    fov?: number;
    minZoom?: number;
    maxZoom?: number;
    materialVariant?: string | null;
    enableBlinking?: boolean;
    enableBreathing?: boolean;
}

export class Core3DManager {
    constructor(canvas: HTMLCanvasElement, options?: Core3DManagerOptions);

    /** Three.js renderer wrapper */
    renderer: ThreeRenderer;

    /** Current geometry type */
    geometryType: GeometryType;

    /** Current emotion */
    emotion: EmotionName;

    /** Current glow color [r, g, b] normalized 0-1 */
    glowColor: [number, number, number];

    /** Current glow intensity */
    glowIntensity: number;

    /** Core mesh object */
    coreMesh: THREE.Mesh | THREE.Group | null;

    /** Custom material (if applicable) */
    customMaterial: THREE.Material | null;

    /** Whether breathing animation is enabled */
    breathingEnabled: boolean;

    /** Whether rotation is disabled */
    rotationDisabled: boolean;

    /** Particle orchestrator (WebGL particles) */
    particleOrchestrator: Particle3DOrchestrator | null;

    /** Solar eclipse effect manager */
    solarEclipse: SolarEclipse | null;

    /** Lunar eclipse effect manager */
    lunarEclipse: LunarEclipse | null;

    /** Crystal soul inner glow effect */
    crystalSoul: CrystalSoul | null;

    // ─────────────────────────────────────────────────────────────────────────
    // METHODS
    // ─────────────────────────────────────────────────────────────────────────

    /** Set emotion and update visuals */
    setEmotion(emotion: EmotionName, undertone?: string | null): void;

    /** Play a gesture animation */
    playGesture(gestureName: GestureName): void;

    /** Morph to a different geometry */
    morphToShape(shapeName: GeometryType): void;

    /** Render a frame */
    render(deltaTime: number): void;

    /** Set blend layer parameters */
    setBlendLayer(
        layerIndex: number,
        params: { mode?: number; strength?: number; enabled?: boolean }
    ): void;

    /** Enable/disable wobble */
    setWobbleEnabled(enabled: boolean): void;

    /** Enable/disable core glow */
    setCoreGlowEnabled(enabled: boolean): void;

    /** Clean up resources */
    destroy(): void;
}

// ═══════════════════════════════════════════════════════════════════════════════
// THREE RENDERER
// ═══════════════════════════════════════════════════════════════════════════════

export interface ThreeRendererOptions {
    enablePostProcessing?: boolean;
    enableShadows?: boolean;
    enableControls?: boolean;
    autoRotate?: boolean;
    autoRotateSpeed?: number;
    cameraDistance?: number;
    fov?: number;
    minZoom?: number;
    maxZoom?: number;
}

export class ThreeRenderer {
    constructor(canvas: HTMLCanvasElement, options?: ThreeRendererOptions);

    /** Three.js WebGL renderer */
    renderer: THREE.WebGLRenderer;

    /** Three.js scene */
    scene: THREE.Scene;

    /** Three.js camera */
    camera: THREE.PerspectiveCamera;

    /** Orbit controls (if enabled) */
    controls: any; // OrbitControls

    /** Create core mesh with geometry and material */
    createCoreMesh(
        geometry: THREE.BufferGeometry | THREE.Group,
        material?: THREE.Material
    ): THREE.Mesh | THREE.Group;

    /** Set camera to preset position */
    setCameraPreset(preset: CameraPreset, duration?: number): void;

    /** Render the scene */
    render(): void;

    /** Clean up resources */
    destroy(): void;
}

// ═══════════════════════════════════════════════════════════════════════════════
// EFFECTS
// ═══════════════════════════════════════════════════════════════════════════════

export class SolarEclipse {
    constructor(scene: THREE.Scene, sunMesh: THREE.Mesh);

    /** Corona disk mesh */
    coronaDisk: THREE.Mesh | null;

    /** Set eclipse progress (0 = no eclipse, 1 = total eclipse) */
    setProgress(progress: number): void;

    /** Set corona blend layer */
    setCoronaBlendLayer(
        layerIndex: number,
        params: { mode?: number; strength?: number; enabled?: boolean }
    ): void;

    /** Set shadow coverage for annular eclipse */
    setShadowCoverage(coverage: number): void;

    /** Clean up resources */
    dispose(): void;
}

export class LunarEclipse {
    constructor(moonMesh: THREE.Mesh);

    /** Set eclipse progress (0 = no eclipse, 1 = total eclipse) */
    setProgress(progress: number): void;

    /** Clean up resources */
    dispose(): void;
}

export class CrystalSoul {
    constructor(parentMesh: THREE.Mesh, options?: CrystalSoulOptions);

    /** Inner glow mesh */
    soulMesh: THREE.Mesh | null;

    /** Set glow color */
    setColor(color: [number, number, number]): void;

    /** Set glow intensity */
    setIntensity(intensity: number): void;

    /** Update animation */
    update(deltaTime: number): void;

    /** Clean up resources */
    dispose(): void;
}

export interface CrystalSoulOptions {
    radius?: number;
    color?: [number, number, number];
    intensity?: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PARTICLES
// ═══════════════════════════════════════════════════════════════════════════════

export class Particle3DOrchestrator {
    constructor(scene: THREE.Scene, options?: Particle3DOrchestratorOptions);

    /** Particle renderer */
    renderer: Particle3DRenderer;

    /** Set emotion for particle behavior */
    setEmotion(emotion: EmotionName, undertone?: string | null): void;

    /** Clear all particles */
    clear(): void;

    /** Update particles */
    update(deltaTime: number): void;

    /** Clean up resources */
    dispose(): void;
}

export interface Particle3DOrchestratorOptions {
    maxParticles?: number;
    radiusMultiplier?: number;
}

export class Particle3DRenderer {
    constructor(scene: THREE.Scene, maxParticles?: number);

    /** Set visibility */
    setVisible(visible: boolean): void;

    /** Render particles */
    render(): void;

    /** Clean up resources */
    dispose(): void;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MOON UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

export const MOON_PHASES: {
    NEW: number;
    CRESCENT_WAXING: number;
    FIRST_QUARTER: number;
    GIBBOUS_WAXING: number;
    FULL: number;
    GIBBOUS_WANING: number;
    LAST_QUARTER: number;
    CRESCENT_WANING: number;
};

/** Get array of moon phase names */
export function getMoonPhaseNames(): string[];

/** Get phase name from progress value */
export function getPhaseFromProgress(progress: number): string;

/** Set moon phase instantly */
export function setMoonPhase(
    core3D: Core3DManager,
    phase: number | keyof typeof MOON_PHASES
): void;

/** Animate moon phase transition */
export function animateMoonPhase(
    core3D: Core3DManager,
    targetPhase: number | keyof typeof MOON_PHASES,
    duration?: number
): void;

// ═══════════════════════════════════════════════════════════════════════════════
// BLEND MODE UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

/** Array of blend mode names */
export const blendModeNames: BlendMode[];

/** Get blend mode name by index */
export function getBlendModeName(index: number): BlendMode;

/** Get blend mode index by name */
export function getBlendModeIndex(name: BlendMode): number;

// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export default EmotiveMascot3D;
