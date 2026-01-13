/**
 * Type Definition Tests for Emotive Engine
 *
 * These tests verify that TypeScript definitions match the implementation.
 * Run with: npx tsd (requires tsd package)
 *
 * Note: This file uses tsd's expectType, expectError, etc. assertions.
 * If tsd is not installed, these serve as documentation of expected types.
 */

import { expectType, expectError, expectAssignable } from 'tsd';
import EmotiveEngine from '../../types/index';
import {
    EmotiveMascot3D,
    EmotiveMascot3DConfig,
    GeometryType,
    EmotionName,
    GestureName,
    EventManager,
    FeelResult
} from '../../types/3d';

// ═══════════════════════════════════════════════════════════════════════════════
// EmotiveMascot (2D) Type Tests
// ═══════════════════════════════════════════════════════════════════════════════

// Constructor accepts empty config
declare const mascot2D: EmotiveEngine.EmotiveMascot;

// Constructor accepts partial config
const mascot2DWithConfig = new EmotiveEngine.EmotiveMascot({
    canvasId: 'test-canvas',
    targetFPS: 60
});

// Lifecycle methods exist
expectType<EmotiveEngine.EmotiveMascot>(mascot2D.init(document.createElement('div')));
expectType<void>(mascot2D.start());
expectType<void>(mascot2D.stop());

// Emotion methods exist and chain
expectType<EmotiveEngine.EmotiveMascot>(mascot2D.setEmotion('joy'));
expectType<EmotiveEngine.EmotiveMascot>(mascot2D.setEmotion('joy', 500));

// Gesture methods exist and chain
expectType<EmotiveEngine.EmotiveMascot>(mascot2D.express('bounce'));
expectType<EmotiveEngine.EmotiveMascot>(mascot2D.chain(['bounce', 'pulse']));

// feel() returns FeelResult
expectType<EmotiveEngine.FeelResult>(mascot2D.feel('happy'));

// Helper methods return arrays
expectType<string[]>(mascot2D.getAvailableEmotions());
expectType<string[]>(mascot2D.getAvailableGestures());

// ═══════════════════════════════════════════════════════════════════════════════
// EmotiveMascot3D Type Tests
// ═══════════════════════════════════════════════════════════════════════════════

// Constructor accepts empty config
declare const mascot3D: EmotiveMascot3D;

// Constructor accepts full config
const config: EmotiveMascot3DConfig = {
    canvasId: 'test-canvas',
    coreGeometry: 'sphere',
    targetFPS: 60,
    enableParticles: true,
    defaultEmotion: 'neutral',
    enablePostProcessing: true,
    enableShadows: false,
    enableControls: true,
    autoRotate: false,
    enableBlinking: true,
    enableBreathing: true,
    cameraDistance: 2.5,
    fov: 45,
    minZoom: 1,
    maxZoom: 5,
    materialVariant: 'default',
    assetBasePath: '/assets'
};

const mascot3DWithConfig = new EmotiveMascot3D(config);

// Lifecycle methods
expectType<EmotiveMascot3D>(mascot3D.init(document.createElement('div')));
expectType<Promise<void>>(mascot3D.start());
expectType<void>(mascot3D.stop());
expectType<void>(mascot3D.destroy());

// setEmotion accepts multiple signatures
expectType<EmotiveMascot3D>(mascot3D.setEmotion('joy'));
expectType<EmotiveMascot3D>(mascot3D.setEmotion('joy', 'excitement'));
expectType<EmotiveMascot3D>(mascot3D.setEmotion('joy', { undertone: 'calm' }));
expectType<EmotiveMascot3D>(mascot3D.setEmotion('joy', 500));
expectType<EmotiveMascot3D>(mascot3D.setEmotion('joy', null));

// Gesture methods chain
expectType<EmotiveMascot3D>(mascot3D.express('bounce'));
expectType<EmotiveMascot3D>(mascot3D.chain(['bounce', 'pulse', 'shake']));

// Morph methods chain
expectType<EmotiveMascot3D>(mascot3D.morphTo('heart'));
expectType<EmotiveMascot3D>(mascot3D.morphTo('sphere'));

// feel() returns result object
const feelResult: FeelResult = mascot3D.feel('happy and bouncing');
expectType<boolean>(feelResult.success);
expectType<object | undefined>(feelResult.parsed);
expectType<string | undefined>(feelResult.error);

// Position methods
expectType<EmotiveMascot3D>(mascot3D.setPosition(0, 0, 0));
expectType<{ x: number; y: number; z: number }>(mascot3D.getPosition());

// Camera controls
expectType<EmotiveMascot3D>(mascot3D.enableAutoRotate());
expectType<EmotiveMascot3D>(mascot3D.disableAutoRotate());
expectType<EmotiveMascot3D>(mascot3D.setCameraPreset('front'));

// Rhythm/audio methods
expectType<Promise<void>>(mascot3D.connectAudio(document.createElement('audio')));
expectType<void>(mascot3D.disconnectAudio());
expectType<EmotiveMascot3D>(mascot3D.enableRhythmSync());
expectType<EmotiveMascot3D>(mascot3D.disableRhythmSync());
expectType<EmotiveMascot3D>(mascot3D.enableGroove());
expectType<EmotiveMascot3D>(mascot3D.disableGroove());
expectType<EmotiveMascot3D>(mascot3D.setGroove('groove1'));

// Particle methods
expectType<EmotiveMascot3D>(mascot3D.enableParticles());
expectType<EmotiveMascot3D>(mascot3D.disableParticles());

// Crystal soul methods
expectType<EmotiveMascot3D>(mascot3D.enableCrystalSoul());
expectType<EmotiveMascot3D>(mascot3D.disableCrystalSoul());

// Helper methods return arrays
expectType<string[]>(mascot3D.getAvailableEmotions());
expectType<string[]>(mascot3D.getAvailableGestures());
expectType<string[]>(mascot3D.getAvailableGeometries());

// Accessibility
expectType<boolean>(mascot3D.prefersReducedMotion());
expectType<EmotiveMascot3D>(mascot3D.setReducedMotion(true));

// ═══════════════════════════════════════════════════════════════════════════════
// Type Union Tests (catch invalid values at compile time)
// ═══════════════════════════════════════════════════════════════════════════════

// Valid geometry types
const validGeometry: GeometryType = 'sphere';
const validGeometry2: GeometryType = 'heart';
const validGeometry3: GeometryType = 'moon';

// Valid emotion names
const validEmotion: EmotionName = 'joy';
const validEmotion2: EmotionName = 'neutral';
const validEmotion3: EmotionName = 'sadness';

// Valid gesture names
const validGesture: GestureName = 'bounce';
const validGesture2: GestureName = 'pulse';
const validGesture3: GestureName = 'shake';

// ═══════════════════════════════════════════════════════════════════════════════
// EventManager Type Tests
// ═══════════════════════════════════════════════════════════════════════════════

declare const eventManager: EventManager;

// Event methods
expectType<void>(eventManager.on('emotion:change', (data) => {}));
expectType<void>(eventManager.off('emotion:change', (data) => {}));
expectType<void>(eventManager.emit('emotion:change', { emotion: 'joy', undertone: null }));

// ═══════════════════════════════════════════════════════════════════════════════
// AnimationLoopManager Type Tests
// ═══════════════════════════════════════════════════════════════════════════════

const loopManager = new EmotiveEngine.AnimationLoopManager();

expectType<number>(loopManager.register((dt, ts) => {}, EmotiveEngine.AnimationPriority.HIGH));
expectType<boolean>(loopManager.unregister(1));
expectType<void>(loopManager.start());
expectType<void>(loopManager.stop());
expectType<EmotiveEngine.AnimationStats>(loopManager.getStats());

// ═══════════════════════════════════════════════════════════════════════════════
// GradientCache Type Tests
// ═══════════════════════════════════════════════════════════════════════════════

const gradientCache = new EmotiveEngine.GradientCache(100, 5000);
const ctx = document.createElement('canvas').getContext('2d')!;

expectType<CanvasGradient>(gradientCache.getLinearGradient(
    ctx, 0, 0, 100, 100,
    [{ offset: 0, color: '#000' }, { offset: 1, color: '#fff' }]
));

expectType<EmotiveEngine.CacheStats>(gradientCache.getStats());
expectType<void>(gradientCache.clear());
