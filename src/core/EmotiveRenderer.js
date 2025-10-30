/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝
 *                      ◐ ◑ ◒ ◓  EMOTIVE RENDERER  ◓ ◒ ◑ ◐
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Emotive Renderer - Visual Rendering Engine
 * @author Emotive Engine Team
 * @version 2.4.0
 * @module EmotiveRenderer
 * @complexity ⭐⭐⭐⭐ Advanced (Large file >150KB with complex canvas/WebGL logic)
 * @audience Modify this when changing visual output, particle rendering, or effects
 * @see docs/ARCHITECTURE.md for rendering pipeline overview
 * @changelog 2.4.0 - Added offscreen canvas caching for glow gradients
 * @changelog 2.3.0 - Optimized color transitions to use main render loop
 * @changelog 2.2.0 - Dynamic visual resampling on resize for consistent quality
 * @changelog 2.1.0 - Implemented undertone saturation system for glow colors
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ The VISUAL ARTIST of the Emotive Engine. Renders the iconic orb with its          
 * ║ glowing core, breathing animation, eye expressions, and gesture animations.       
 * ║ Creates the minimalist yet expressive visual that defines Emotive.                
 * ║                                                                                    
 * ║ NEW: Undertone saturation creates visual depth by adjusting glow color            
 * ║ saturation based on emotional intensity (intense→electric, subdued→ghostly)       
 * ║ NEW: Dynamic visual resampling ensures consistent quality at any canvas size      
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🎨 VISUAL COMPONENTS                                                              
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • White Core      : The solid center orb (#FFFFFF)                                
 * │ • Colored Glow    : Emotional aura surrounding the core                           
 * │ • Eye Shape       : Arc-based expressions (happiness, sadness, focus)             
 * │ • Breathing       : Subtle size pulsation for life-like quality                   
 * │ • Gesture Motion  : Position, scale, and rotation animations                      
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🎭 RENDERING PIPELINE                                                             
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ 1. Clear canvas or apply motion blur                                              
 * │ 2. Calculate breathing scale factor                                               
 * │ 3. Apply gesture transformations (position, scale, rotation)                      
 * │ 4. Draw colored glow layers (3 gradient circles)                                  
 * │ 5. Draw white core circle                                                         
 * │ 6. Draw eye expression if not neutral                                             
 * │ 7. Apply special effects (jitter, zen morph, etc.)                                
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ ⚙️  CONFIGURABLE PROPERTIES                                                       
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • coreSizeDivisor  : Orb size relative to canvas (default: 12)                    
 * │ • glowMultiplier   : Glow radius vs core (default: 2.5x)                          
 * │ • breathingSpeed   : Breaths per minute (default: 16)                             
 * │ • breathingDepth   : Scale variation % (default: 8%)                              
 * │ • renderingStyle   : 'classic' | 'soft' | 'sharp'                                 
 * │ • referenceSize    : Reference canvas size for scaling (default: 400)             
 * │ • baseScale        : Global scale multiplier (default: 1.0)                       
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 👁️ EYE EXPRESSION SYSTEM                                                          
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Openness    : 0.0 (closed) to 1.0 (fully open)                                  
 * │ • Arc         : -1.0 (sad ∩) to 1.0 (happy ∪)                                    
 * │ • Asymmetry   : Different shapes for left/right eyes                              
 * │ • Blinking    : Smooth open/close animations                                      
 * │ • Zen Morph   : Special ∩∩ shape for meditation                                   
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ ❌ PERFORMANCE CRITICAL                                                           
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ ✗ Gradient caching     → Recreating gradients kills FPS                          
 * │ ✗ Canvas save/restore  → Excessive use causes slowdown                           
 * │ ✗ Clear rect timing    → Motion blur depends on this                             
 * │ ✗ Animation frame IDs  → Must track to prevent memory leaks                      
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */

// import { interpolateHsl, applyUndertoneSaturation, rgbToHex, hexToRgb } from '../utils/colorUtils.js'; // Unused imports - available for future use
import GestureCompositor from './GestureCompositor.js';
import { getEmotion } from './emotions/index.js';
import { emotionCache } from './cache/EmotionCache.js';
import { getEffect, applyEffect, isEffectActive } from './effects/index.js';
// import { getGesture } from './gestures/index.js'; // Unused import - available for future use
// import musicalDuration from './MusicalDuration.js'; // Unused import - available for future use

// Import modular renderer components
import { GestureAnimator } from './renderer/GestureAnimator.js';
import { ColorUtilities } from './renderer/ColorUtilities.js';
import { SpecialEffects } from './renderer/SpecialEffects.js';
import { EyeRenderer } from './renderer/EyeRenderer.js';
import { BreathingAnimator } from './renderer/BreathingAnimator.js';
import { GlowRenderer } from './renderer/GlowRenderer.js';
import { CoreRenderer } from './renderer/CoreRenderer.js';
import { CelestialRenderer } from './renderer/CelestialRenderer.js';
import { ZenModeRenderer } from './renderer/ZenModeRenderer.js';
import { ZenModeController } from './renderer/ZenModeController.js';
import { EpisodicEffectController } from './renderer/EpisodicEffectController.js';
import { RotationManager } from './renderer/RotationManager.js';
import { GazeTracker } from './renderer/GazeTracker.js';
import { CanvasSetupManager } from './renderer/CanvasSetupManager.js';
import { RenderPerformanceManager } from './renderer/RenderPerformanceManager.js';
import { TransformMerger } from './renderer/TransformMerger.js';
import { StateUpdateManager } from './renderer/StateUpdateManager.js';
import { DimensionCalculator } from './renderer/DimensionCalculator.js';
import { RadiusCalculator } from './renderer/RadiusCalculator.js';
import { PositionJitterManager } from './renderer/PositionJitterManager.js';
import { AmbientDanceAnimator } from './renderer/AmbientDanceAnimator.js';
import { BackdropRenderer } from './renderer/BackdropRenderer.js';
import { SleepManager } from './renderer/SleepManager.js';
import { EmotionalStateManager } from './renderer/EmotionalStateManager.js';
import { animationLoopManager, AnimationPriority } from './AnimationLoopManager.js';
import { gradientCache } from './renderer/GradientCache.js';

class EmotiveRenderer {
    constructor(canvasManager, options = {}) {
        this.canvasManager = canvasManager;
        this.ctx = canvasManager.getContext();
        
        if (!this.ctx) {
            // Canvas context not available
        }
        
        // Gesture compositor for emotion/undertone modulation
        this.gestureCompositor = new GestureCompositor();
        
        // Initialize current undertone
        this.currentUndertone = null;
        
        // Initialize modular components
        this.gestureAnimator = new GestureAnimator(this);
        this.colorUtilities = new ColorUtilities();
        this.specialEffects = new SpecialEffects(this);
        this.eyeRenderer = new EyeRenderer(this);
        this.breathingAnimator = new BreathingAnimator(this);
        this.glowRenderer = new GlowRenderer(this);
        this.coreRenderer = new CoreRenderer(this);
        this.celestialRenderer = new CelestialRenderer();
        this.zenModeRenderer = new ZenModeRenderer();
        this.zenModeController = new ZenModeController(this);
        this.episodicEffectController = new EpisodicEffectController(this);
        this.rotationManager = new RotationManager(this);
        this.gazeTracker = new GazeTracker(this);
        this.canvasSetupManager = new CanvasSetupManager(this);
        this.renderPerformanceManager = new RenderPerformanceManager(this);
        this.transformMerger = new TransformMerger(this);
        this.stateUpdateManager = new StateUpdateManager(this);
        this.dimensionCalculator = new DimensionCalculator(this);
        this.radiusCalculator = new RadiusCalculator(this);
        this.positionJitterManager = new PositionJitterManager(this);
        this.ambientDanceAnimator = new AmbientDanceAnimator(this);
        this.backdropRenderer = new BackdropRenderer(this);
        this.sleepManager = new SleepManager(this);
        this.emotionalStateManager = new EmotionalStateManager(this);

        // Configuration - matching original Emotive proportions
        this.config = {
            coreColor: options.coreColor || '#FFFFFF',
            coreSizeDivisor: options.coreSizeDivisor || 12,  // Core radius = min(width,height) / 12
            glowMultiplier: options.glowMultiplier || 2.5,   // Glow radius = core radius * 2.5
            defaultGlowColor: options.defaultGlowColor || '#14B8A6',  // Teal
            breathingSpeed: options.breathingSpeed || 0.42,  // 16 breaths/min (0.42 rad/s = 4 sec/cycle = 15-16 bpm)
            breathingDepth: options.breathingDepth || 0.08,  // 8% size variation for visible breathing
            renderingStyle: options.renderingStyle || 'classic',
            baseScale: options.baseScale || 1.0,  // Global scale multiplier for entire system
            referenceSize: 400,  // Reference canvas size for scale calculations
            topOffset: options.topOffset || 0,  // Vertical offset to align with layout
            positionController: options.positionController || null  // Position controller for eccentric positioning
        };
        
        // Initialize scaleFactor based on current canvas size
        const canvasSize = Math.min(
            this.canvasManager.width || 400, 
            this.canvasManager.height || 400
        );
        this.scaleFactor = (canvasSize / this.config.referenceSize) * this.config.baseScale;
        
        // State
        this.state = {
            emotion: 'neutral',
            glowColor: this.config.defaultGlowColor,
            glowIntensity: 1.0,
            breathRate: 1.0,
            breathDepth: this.config.breathingDepth,
            coreJitter: false,
            speaking: false,
            recording: false,
            sleeping: false,
            blinking: false,
            blinkingEnabled: true,  // Add flag to control blinking
            gazeOffset: { x: 0, y: 0 },
            gazeIntensity: 0,
            gazeLocked: false,
            gazeTrackingEnabled: false,  // Whether to track mouse/touch
            gazeTarget: { x: 0, y: 0 },  // Target position for gaze (-1 to 1)
            zenVortexIntensity: 1.0,  // Adjustable whirlpool intensity for zen
            effectiveCenter: { x: 0, y: 0, scale: 1.0 },  // Effective center with position offsets
            // Suspicion state
            squintAmount: 0,         // 0-1, how much the eye is narrowed
            targetSquintAmount: 0,   // Target squint amount to animate to
            scanPhase: 0,            // Current phase of scanning animation
            lastScanTime: 0,         // Last time we did a scan
            isSuspicious: false,     // Track if we're in suspicion mode
            // Custom scale for breathing
            customScale: null,       // When set, overrides normal breathing scale
            // Undertone modifiers - initialize with defaults
            sizeMultiplier: 1.0,
            jitterAmount: 0,
            episodicFlutter: false,
            glowRadiusMult: 1.0,
            breathRateMult: 1.0,
            breathDepthMult: 1.0,
            breathIrregular: false,
            particleRateMult: 1.0,
            // Glow and color effects - initialize with defaults
            glowPulse: 0,
            brightnessFlicker: 0,
            brightnessMult: 1.0,
            saturationMult: 1.0,
            hueShift: 0,
            // Rotation state (managed by RotationManager)
            manualRotation: 0,        // Current rotation angle in DEGREES
            rotationSpeed: 0,         // Rotation speed in DEGREES per frame
            lastRotationUpdate: performance.now()
        };
        
        // Animation state (now delegated to modules)
        // Breathing is handled by BreathingAnimator
        // Blinking is handled by EyeRenderer
        
        // Track animation frame IDs to prevent memory leaks
        this.animationFrameIds = {
            colorTransition: null,
            eyeClose: null,
            eyeOpen: null,
            zenEnter: null,
            zenExit: null
        };

        // Track loop manager callback IDs
        this.loopCallbackIds = {
            eyeClose: null,
            eyeOpen: null,
            zenEnter: null,
            zenExit: null
        };

        // Timeout tracking for cleanup
        this.wakeJitterTimeout = null;

        // Offscreen canvas for double buffering
        this.offscreenCanvas = null;
        this.offscreenCtx = null;
        this.initOffscreenCanvas();

        // Store canvas reference for gaze tracking
        this.canvas = canvasManager.canvas;
        
        // Cache for expensive gradients
        this.glowCache = new Map();
        this.maxCacheSize = 10;
        
        // Gesture animations
        this.gestureAnimations = {
            bounce: {
                active: false,
                startTime: 0,
                progress: 0,
                params: null
            },
            pulse: {
                active: false,
                startTime: 0,
                progress: 0,
                params: null
            },
            shake: {
                active: false,
                startTime: 0,
                progress: 0,
                params: null
            },
            spin: {
                active: false,
                startTime: 0,
                progress: 0,
                params: null
            },
            nod: {
                active: false,
                startTime: 0,
                progress: 0,
                params: null
            },
            tilt: {
                active: false,
                startTime: 0,
                progress: 0,
                params: null
            },
            expand: {
                active: false,
                startTime: 0,
                progress: 0,
                params: null
            },
            contract: {
                active: false,
                startTime: 0,
                progress: 0,
                params: null
            },
            flash: {
                active: false,
                startTime: 0,
                progress: 0,
                params: null
            },
            drift: {
                active: false,
                startTime: 0,
                progress: 0,
                params: null,
                startX: 0,
                startY: 0
            },
            stretch: {
                active: false,
                startTime: 0,
                progress: 0,
                params: null
            },
            glow: {
                active: false,
                startTime: 0,
                progress: 0,
                params: null
            },
            flicker: {
                active: false,
                startTime: 0,
                progress: 0,
                params: null
            },
            vibrate: {
                active: false,
                startTime: 0,
                progress: 0,
                params: null
            },
            wave: {
                active: false,
                startTime: 0,
                progress: 0,
                params: null
            },
            breathe: {
                active: false,
                startTime: 0,
                progress: 0,
                params: null
            },
            morph: {
                active: false,
                startTime: 0,
                progress: 0,
                params: null
            },
            slowBlink: {
                active: false,
                startTime: 0,
                progress: 0,
                params: null
            },
            look: {
                active: false,
                startTime: 0,
                progress: 0,
                params: null,
                targetX: 0,
                targetY: 0
            },
            settle: {
                active: false,
                startTime: 0,
                progress: 0,
                params: null
            },
            breathIn: {
                active: false,
                startTime: 0,
                progress: 0,
                params: null
            },
            breathOut: {
                active: false,
                startTime: 0,
                progress: 0,
                params: null
            },
            breathHold: {
                active: false,
                startTime: 0,
                progress: 0,
                params: null
            },
            breathHoldEmpty: {
                active: false,
                startTime: 0,
                progress: 0,
                params: null
            },
            jump: {
                active: false,
                startTime: 0,
                progress: 0,
                params: null
            },
            orbital: {
                active: false,
                startTime: 0,
                progress: 0,
                params: null
            },
            hula: {
                active: false,
                startTime: 0,
                progress: 0,
                params: null
            }
        };

        // Episodic effects for undertones (now managed by EpisodicEffectController)
        // Reference to episodicEffects for backward compatibility
        Object.defineProperty(this, 'episodicEffects', {
            get: () => this.episodicEffectController.getEpisodicEffects(),
            enumerable: true
        });
        
        // Speaking animation
        this.speakingRings = [];
        this.maxRings = 5;
        this.ringSpawnTimer = 0;
        this.ringSpawnInterval = 200; // ms between rings
        
        // Recording animation (rings move inward)
        this.recordingRings = [];
        this.recordingPulse = 0;
        
        // Sleep state - consolidated here for visualization
        this.sleepZ = [];

        // Zen state animation (now managed by ZenModeController)
        // Reference to zenTransition for backward compatibility
        Object.defineProperty(this, 'zenTransition', {
            get: () => this.zenModeController.getZenTransition(),
            enumerable: true
        });
        
        // Standardized color transition system
        this.colorTransition = {
            active: false,
            fromColor: this.state.glowColor,
            toColor: this.state.glowColor,
            fromIntensity: this.state.glowIntensity,
            toIntensity: this.state.glowIntensity,
            progress: 0,
            startTime: 0,
            duration: 1500  // Default 1.5s
        };
        
        // Comprehensive undertone modifiers
        this.undertoneModifiers = {
            nervous: {
                // Color - subtle shimmer, no major shift
                hueShift: 0,          // No hue change
                saturationMult: 1.05, // Tiny bit more vivid
                brightnessMult: 1.0,  // Normal brightness
                brightnessFlicker: 0.05, // 5% brightness variation
                // Visual
                sizeMultiplier: 1.0,  // Normal size
                jitterAmount: 0,      // No constant jitter - handled by episodic flutter
                episodicFlutter: true, // Occasional butterfly moments
                glowRadiusMult: 1.0,  // Normal glow
                glowPulse: 0.05,      // 5% subtle heartbeat pulse
                // Breathing
                breathRateMult: 1.1,  // Slightly faster
                breathDepthMult: 0.9, // Slightly shallower
                breathIrregular: true, // Occasional catch in rhythm
            },
            confident: {
                // Color - warmer, vibrant
                hueShift: 15,         // Warmer but not overwhelming
                saturationMult: 1.2,  // More vibrant
                brightnessMult: 1.1,  // Slightly brighter
                // Visual
                sizeMultiplier: 1.0,  // Normal size until episodes
                jitterAmount: 0,      // Rock solid
                episodicPowerPose: true, // Occasional chest puffs
                glowRadiusMult: 1.15, // Slightly expanded glow
                // Breathing
                breathRateMult: 0.95, // Slightly slower, controlled
                breathDepthMult: 1.1, // Fuller breaths
                breathIrregular: false,
            },
            tired: {
                // Color - slightly cooler, less saturated
                hueShift: -5,         // Slightly cooler
                saturationMult: 0.7,  // Less vibrant
                brightnessMult: 0.85, // Slightly darker
                // Visual
                sizeMultiplier: 0.95, // Slightly smaller
                jitterAmount: 0,
                episodicMicroSleep: true, // Occasional drowsy sags
                glowRadiusMult: 0.9,  // Slightly reduced glow
                // Breathing
                breathRateMult: 0.8,  // Slower
                breathDepthMult: 1.2, // Deeper breaths
                breathIrregular: false,
            },
            intense: {
                // Color - high contrast, saturated
                hueShift: 5,          // Very slightly warmer
                saturationMult: 1.3,  // More saturated
                brightnessMult: 1.15, // Brighter
                // Visual
                sizeMultiplier: 1.0,  // Normal until focus moments
                jitterAmount: 0,      // Still, focused
                episodicLaserFocus: true, // Brief concentration moments
                glowRadiusMult: 1.2,  // Expanded glow
                // Breathing
                breathRateMult: 1.2,  // Faster but controlled
                breathDepthMult: 0.9, // Shallower, focused breaths
                breathIrregular: false,
            },
            subdued: {
                // Color - slightly muted
                hueShift: -10,        // Slightly cooler
                saturationMult: 0.75, // Somewhat muted
                brightnessMult: 0.9,  // Slightly dimmed
                // Visual
                sizeMultiplier: 0.95, // Slightly smaller
                jitterAmount: 0,
                episodicWithdrawal: true, // Brief inward pulls
                glowRadiusMult: 0.85, // Slightly reduced glow
                // Breathing
                breathRateMult: 0.9,  // Slightly slower
                breathDepthMult: 0.9, // Slightly shallow
                breathIrregular: false,
            }
        };
        
        // Performance
        this.lastFrameTime = 0;

        // Create gesture delegation methods dynamically
        this._createGestureDelegates();
    }
    
    /**
     * Scale a value based on current canvas size vs reference size
     * Used to scale hard-coded values like shadowBlur, lineWidth, etc.
     * @param {number} value - The base value to scale
     * @returns {number} The scaled value
     */
    scaleValue(value) {
        return value * this.scaleFactor;
    }
    
    /**
     * Initialize offscreen canvas for double buffering
     */
    initOffscreenCanvas() {
        // Create offscreen canvas
        this.offscreenCanvas = document.createElement('canvas');
        this.offscreenCtx = this.offscreenCanvas.getContext('2d', {
            alpha: true,
            desynchronized: true,  // Reduces latency
            willReadFrequently: false
        });
        
        if (!this.offscreenCtx) {
            // Offscreen context not available
        }
        
        // Match dimensions
        this.updateOffscreenSize();
    }
    
    /**
     * Update offscreen canvas size to match main canvas
     */
    updateOffscreenSize() {
        if (this.offscreenCanvas && this.canvasManager) {
            const {width} = this.canvasManager.canvas;
            const {height} = this.canvasManager.canvas;

            if (this.offscreenCanvas.width !== width || this.offscreenCanvas.height !== height) {
                this.offscreenCanvas.width = width;
                this.offscreenCanvas.height = height;

                // CRITICAL: Only scale offscreen context if main canvas context is DPR-scaled
                // For fixed-size canvases (with width/height attributes), CanvasManager doesn't
                // apply DPR scaling, so we shouldn't scale the offscreen context either
                // Check if canvas is DPR-scaled: canvas.width > logical width means DPR scaling is applied
                const isDprScaled = this.canvasManager.canvas.width > this.canvasManager.width;

                if (this.offscreenCtx) {
                    this.offscreenCtx.setTransform(1, 0, 0, 1, 0, 0);
                    if (isDprScaled && this.canvasManager.dpr) {
                        this.offscreenCtx.scale(this.canvasManager.dpr, this.canvasManager.dpr);
                    }
                }
            }
        }
    }
    
    /**
     * Update effective center coordinates from position controller
     * @param {Object} effectiveCenter - {x, y, scale} coordinates
     */
    updateEffectiveCenter(effectiveCenter) {
        this.state.effectiveCenter = effectiveCenter;
    }
    
    /**
     * Get effective center coordinates (with position offsets applied)
     * @returns {Object} Effective center {x, y, scale}
     */
    getEffectiveCenter() {
        const baseCenter = this.canvasManager.getCenter();
        let effectiveCenter;
        if (this.config.positionController) {
            effectiveCenter = this.config.positionController.getEffectiveCenter(baseCenter.x, baseCenter.y);
        } else {
            effectiveCenter = { x: baseCenter.x, y: baseCenter.y, scale: 1.0 };
        }
        
        // Include gaze offset so particles spawn from the same center as the visual mascot
        effectiveCenter.x += this.state.gazeOffset.x;
        effectiveCenter.y += this.state.gazeOffset.y;
        
        return effectiveCenter;
    }
    
    /**
     * Main render method
     */
    render(state, deltaTime, gestureTransform = null) {
        // Frame initialization: performance markers and cleanup (delegated to RenderPerformanceManager)
        const frameStartTime = this.renderPerformanceManager.initializeFrame();

        // Merge ambient dance and gesture transforms (delegated to TransformMerger)
        gestureTransform = this.transformMerger.mergeAndStoreTransforms(gestureTransform, deltaTime);

        // Setup canvas: offscreen size, dimensions, context switching (delegated to CanvasSetupManager)
        const { logicalWidth, logicalHeight, originalCtx } = this.canvasSetupManager.setupCanvas();

        // Render backdrop, apply decay, clear offscreen (delegated to CanvasSetupManager)
        this.canvasSetupManager.performCanvasSetup(logicalWidth, logicalHeight, originalCtx, deltaTime);

        // Update frame state: undertone modifiers, color transitions, timers, gaze offset (delegated to StateUpdateManager)
        this.stateUpdateManager.performFrameStateUpdates(deltaTime);

        // Calculate dimensions, positions, and base transforms (delegated to DimensionCalculator)
        const dims = this.dimensionCalculator.calculateRenderDimensions(logicalWidth, logicalHeight, state, gestureTransform);
        const { scaleMultiplier, glowMultiplier, gestureTransforms, centerX, centerY } = dims;
        let { rotationAngle } = dims;

        // Calculate core/glow radii with all modifiers (delegated to RadiusCalculator)
        const radiusData = this.radiusCalculator.calculateRadii(state, scaleMultiplier, glowMultiplier);
        let { coreRadius, glowRadius } = radiusData;
        const { effectiveGlowIntensity, sleepOpacityMod, glowOpacityMod } = radiusData;

        // Apply position modifications: zen levitation, blink squish, jitter, final position (delegated to PositionJitterManager)
        const posData = this.positionJitterManager.applyAllModifications(centerX, centerY, rotationAngle, coreRadius, glowRadius);
        const { coreX, coreY } = posData;
        ({ rotationAngle, coreRadius, glowRadius } = posData);
        
        // Check if brake is active and update rotation accordingly
        const now = performance.now();

        // Update rotation state (handles brake and normal rotation)
        this.rotationManager.updateRotation(now);

        // Calculate total rotation (gestures + manual rotation)
        const totalRotation = this.rotationManager.calculateTotalRotation(rotationAngle);

        // Apply rotation if present
        if (totalRotation !== 0) {
            this.ctx.save();
            this.ctx.translate(coreX, coreY);
            this.rotationManager.applyRotation(this.ctx, totalRotation);
            this.ctx.translate(-coreX, -coreY);
        }

        // Render glow with visual effects
        if (isEffectActive('recording-glow', this.state)) {
            // Recording takes precedence over normal glow
            applyEffect('recording-glow', this.ctx, {
                x: coreX,
                y: coreY,
                radius: glowRadius,
                deltaTime
            });
        } else if (isEffectActive('zen-vortex', this.state)) {
            // Zen vortex handles its own visuals
            // Skip normal glow to prevent flash
        } else {
            // Normal glow with sleep dimming
            if (this.state.sleeping || this.state.emotion === 'resting' || isEffectActive('sleeping', this.state)) {
                this.ctx.save();
                this.ctx.globalAlpha = glowOpacityMod;
                this.glowRenderer.renderGlow(coreX, coreY, glowRadius, { intensity: effectiveGlowIntensity });
                this.ctx.restore();
            } else {
                this.glowRenderer.renderGlow(coreX, coreY, glowRadius, { intensity: effectiveGlowIntensity });
            }
        }
        
        // Render flash wave if present
        if (gestureTransforms && gestureTransforms.flashWave) {
            const wave = gestureTransforms.flashWave;
            const {ctx} = this;
            
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            
            // Create a ring gradient for the wave
            const innerR = coreRadius * wave.innerRadius;
            const outerR = coreRadius * wave.outerRadius;
            
            if (outerR > innerR) {
                // Use cached gradient for flash wave
                const gradient = gradientCache.getRadialGradient(
                    ctx, coreX, coreY, innerR, coreX, coreY, outerR,
                    [
                        { offset: 0, color: 'rgba(255, 255, 255, 0)' },
                        { offset: 0.2, color: `rgba(255, 255, 255, ${wave.intensity * 0.15})` },
                        { offset: 0.5, color: `rgba(255, 255, 255, ${wave.intensity * 0.25})` }, // Peak in center
                        { offset: 0.8, color: `rgba(255, 255, 255, ${wave.intensity * 0.15})` },
                        { offset: 1, color: 'rgba(255, 255, 255, 0)' }
                    ]
                );

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(coreX, coreY, outerR, 0, Math.PI * 2);
                ctx.arc(coreX, coreY, Math.max(0, innerR), 0, Math.PI * 2, true);
                ctx.fill();
            }
            
            ctx.restore();
        }
        
        // Apply speaking pulse effect
        if (isEffectActive('speaking-pulse', this.state)) {
            applyEffect('speaking-pulse', this.ctx, {
                x: coreX,
                y: coreY,
                radius: coreRadius,
                audioLevel: this.state.audioLevel || 0,
                deltaTime
            });
        }
        
        // Recording indicator will be drawn after all transforms are restored
        
        // Apply sleep opacity to core
        if (this.state.sleeping || this.state.emotion === 'resting') {
            this.ctx.globalAlpha = sleepOpacityMod;
        }
        
        // Render core (will cover REC if they overlap)
        // Delegate core rendering to CoreRenderer
        // First update the shape morpher if available
        let shapePoints = null;
        let currentShadow = null;
        if (this.shapeMorpher) {
            this.shapeMorpher.update();
            // Get the canvas points relative to center (0,0) since CoreRenderer will translate
            shapePoints = this.shapeMorpher.getCanvasPoints(0, 0, coreRadius);
            currentShadow = this.shapeMorpher.getCurrentShadow();
        }
        
        // Render sun effects BEFORE core (so they appear behind)
        let renderingSunEffects = false;
        if (currentShadow && (currentShadow.type === 'sun' || currentShadow.type === 'solar-hybrid')) {
            this.renderSunEffects(coreX, coreY, coreRadius, currentShadow);
            renderingSunEffects = true;
        }
        
        // Drop shadow removed - was causing dimming
        
        // Update core rotation based on BPM (like a record player)
        // Only rotate if BPM is greater than 0 (rhythm is active)
        // Shapes that should NOT rotate: moon, heart
        
        // Render the core shape with rotation
        // Note: We already applied rotation to the canvas, but CoreRenderer does its own transform
        // So we need to pass the rotation value to it
        this.coreRenderer.renderCore(coreX, coreY, coreRadius, {
            scaleX: 1,
            scaleY: 1,
            rotation: totalRotation,
            shapePoints
        });
        
        // Update and render sparkles BEFORE moon shadow so they don't cover it
        if (this.specialEffects) {
            this.specialEffects.update(deltaTime);
            this.specialEffects.renderSparkles();
        }
        
        // Check if we're dealing with solar transitions
        const currentShape = this.shapeMorpher ? this.shapeMorpher.currentShape : null;
        const targetShape = this.shapeMorpher ? this.shapeMorpher.targetShape : null;
        const isTransitioningToSolar = this.shapeMorpher && targetShape === 'solar' && this.shapeMorpher.isTransitioning;
        const isTransitioningFromSolar = this.shapeMorpher && currentShape === 'solar' && this.shapeMorpher.isTransitioning;
        const isAtSolar = currentShadow && currentShadow.type === 'solar-hybrid';
        
        // Check specific transition directions
        const isSolarToMoon = this.shapeMorpher && this.shapeMorpher.isTransitioning &&
            currentShape === 'solar' && targetShape === 'moon';
        const isMoonToSolar = this.shapeMorpher && this.shapeMorpher.isTransitioning &&
            currentShape === 'moon' && targetShape === 'solar';
        
        // Render moon/lunar shadows AFTER core AND sparkles (as top overlay)
        // Always render moon shadow EXCEPT when transitioning FROM moon TO solar
        if (currentShadow && (currentShadow.type === 'crescent' || currentShadow.type === 'lunar') && 
            !isMoonToSolar) {
            // Shadow is rendered in the already-rotated coordinate space
            this.renderMoonShadow(coreX, coreY, coreRadius, currentShadow, shapePoints, false, 0);
        }
        
        // For solar-hybrid, render lunar overlay on top of sun
        // Skip when transitioning FROM solar TO moon (let moon's shadow handle it)
        if (((isAtSolar && currentShadow.lunarOverlay) || isTransitioningToSolar || isTransitioningFromSolar) && 
            !isSolarToMoon) {
            // Use the lunar overlay from solar definition
            const lunarShadow = (isAtSolar && currentShadow.lunarOverlay) ? currentShadow.lunarOverlay : {
                type: 'lunar',
                coverage: 1.0,
                color: 'rgba(0, 0, 0, 1.0)',
                progression: 'center'
            };
            
            // Calculate shadow offset for Bailey's Beads
            let shadowOffsetX = 0;
            let shadowOffsetY = 0;
            let morphProgress = 0;
            
            if (this.shapeMorpher) {
                morphProgress = this.shapeMorpher.getProgress();

                const slideDistance = coreRadius * 2.5;
                
                if (isTransitioningToSolar && morphProgress < 1) {
                    // Shadow sliding in from bottom-left
                    shadowOffsetX = -slideDistance * (1 - morphProgress);
                    shadowOffsetY = slideDistance * (1 - morphProgress);
                } else if (isTransitioningFromSolar && morphProgress < 1) {
                    // Shadow sliding out to top-right
                    shadowOffsetX = slideDistance * morphProgress;
                    shadowOffsetY = -slideDistance * morphProgress;
                }
            }
            
            // Render the shadow
            this.renderMoonShadow(coreX, coreY, coreRadius, lunarShadow, shapePoints, true);
            
            // Render Bailey's Beads during transitions
            // Show beads when transitioning TO solar (which will have rays) or FROM solar (which had rays)
            // But only if we're actually rendering or about to render sun effects
            const willHaveSunEffects = isTransitioningToSolar || renderingSunEffects;
            
            if ((isTransitioningToSolar || isTransitioningFromSolar) && willHaveSunEffects) {
                this.renderBaileysBeads(coreX, coreY, coreRadius, shadowOffsetX, shadowOffsetY, morphProgress, isTransitioningToSolar, true);
                
                // Trigger chromatic aberration when shadow is near center
                const shadowNearCenter = Math.abs(shadowOffsetX) < 30 && Math.abs(shadowOffsetY) < 30;
                if (shadowNearCenter && this.specialEffects) {
                    // Stronger aberration as shadow gets closer to center
                    const distance = Math.sqrt(shadowOffsetX * shadowOffsetX + shadowOffsetY * shadowOffsetY);
                    const intensity = Math.max(0.1, 0.5 * (1 - distance / 30));
                    this.specialEffects.triggerChromaticAberration(intensity);
                }
            }
        }
        
        // Reset alpha
        if (this.state.sleeping || this.state.emotion === 'resting') {
            this.ctx.globalAlpha = 1;
        }
        
        // Restore context if rotated
        if (totalRotation !== 0) {
            this.ctx.restore();
        }
        
        // Recording indicator is now handled by the recording-glow effect module
        // which draws a small indicator in the corner
        
        // Add sleep indicator if sleeping
        if (this.state.sleeping) {
            this.renderSleepIndicator(centerX, centerY - glowRadius - this.scaleValue(20), deltaTime);
        }
        
        // Restore original context AFTER all rendering is done
        this.ctx = originalCtx;

        // Blit offscreen canvas to main canvas
        // CRITICAL: Specify dimensions to properly scale DPR-sized offscreen canvas
        // back to logical size on the main canvas
        originalCtx.drawImage(this.offscreenCanvas, 0, 0, logicalWidth, logicalHeight);
        
        // Draw recording indicator on TOP of everything, with no transforms
        if (isEffectActive('recording-glow', this.state)) {
            const recordingEffect = getEffect('recording-glow');
            if (recordingEffect && recordingEffect.drawRecordingIndicator) {
                // Use original context to draw on top of the blitted image
                recordingEffect.drawRecordingIndicator(originalCtx, this.canvas.width, this.canvas.height);
            }
        }

        // Performance marker: Frame end
        const frameEndTime = performance.now();
        const frameTime = frameEndTime - frameStartTime;
        if (this.performanceMonitor) {
            this.performanceMonitor.markFrameEnd();
            this.performanceMonitor.recordFrameTime(frameTime);
        }
    }
    
    // renderGlow method removed - now handled by GlowRenderer module
    
    // getCachedGlow method removed - now handled by GlowRenderer module
    
    /**
     * Render recording glow (pulsating red)
     */
    renderRecordingGlow(x, y, radius, intensity) {
        // Get canvas dimensions with fallbacks
        const canvasWidth = this.canvas?.width || 600;
        const canvasHeight = this.canvas?.height || 600;
        
        // Limit radius to prevent clipping at canvas boundaries
        const maxRadius = Math.min(radius, 
            x - 10,  // Distance to left edge
            y - 10,  // Distance to top edge
            canvasWidth - x - 10,  // Distance to right edge
            canvasHeight - y - 10  // Distance to bottom edge
        );
        const safeRadius = Math.max(50, maxRadius); // Ensure minimum radius
        
        // Use cached gradient for the recording glow
        const gradient = gradientCache.getRadialGradient(
            this.ctx, x, y, 0, x, y, safeRadius,
            [
                { offset: 0, color: this.hexToRgba('#FF0000', 0.7 * intensity) },
                { offset: 0.3, color: this.hexToRgba('#FF0000', 0.5 * intensity) },
                { offset: 0.6, color: this.hexToRgba('#FF0000', 0.3 * intensity) },
                { offset: 0.85, color: this.hexToRgba('#FF0000', 0.1 * intensity) }, // Fade earlier
                { offset: 1, color: this.hexToRgba('#FF0000', 0) }
            ]
        );
        
        // Draw the recording glow
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, safeRadius, 0, Math.PI * 2);
        this.ctx.fill();
    }
    

    /**
     * Render drop shadow for depth
     */
    renderDropShadow(x, y, radius, shapePoints) {
        const {ctx} = this;
        
        // Skip shadow during rapid animations for better performance
        const isAnimating = this.shapeMorpher && this.shapeMorpher.isTransitioning;
        const hasAudioDeformation = this.shapeMorpher && 
                                   (this.shapeMorpher.audioDeformation > 0.1 || 
                                    this.shapeMorpher.vocalEnergy > 0.1);
        
        if (!hasAudioDeformation && (!isAnimating || this.shapeMorpher.morphProgress > 0.8)) {
            ctx.save();
            ctx.translate(x, y);
            
            const shadowOffset = this.scaleValue(2);
            ctx.translate(0, shadowOffset);
            
            // Use simpler shadow for complex deformed shapes
            if (shapePoints && shapePoints.length > 32) {
                // Simple dark circle shadow when shape is complex
                ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
                ctx.beginPath();
                ctx.arc(0, 0, radius * 1.05, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Shadow gradient - dark center fading to transparent
                const shadowGradient = ctx.createRadialGradient(0, 0, radius * 0.7, 0, 0, radius * 1.2);
                shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0.2)');
                shadowGradient.addColorStop(0.8, 'rgba(0, 0, 0, 0.1)');
                shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                
                ctx.fillStyle = shadowGradient;
                ctx.beginPath();
                if (shapePoints) {
                    // Scale points for shadow
                    const scale = 1.1;
                    const step = shapePoints.length > 20 ? 2 : 1; // Skip points for performance
                    ctx.moveTo(shapePoints[0].x * scale, shapePoints[0].y * scale);
                    for (let i = step; i < shapePoints.length; i += step) {
                        ctx.lineTo(shapePoints[i].x * scale, shapePoints[i].y * scale);
                    }
                    ctx.closePath();
                } else {
                    ctx.arc(0, 0, radius * 1.1, 0, Math.PI * 2);
                }
                ctx.fill();
            }
            ctx.restore();
        }
    }
    
    /**
     * Render sun effects (corona, rays, etc)
     */
    renderSunEffects(x, y, radius, shadow) {
        // Delegate to CelestialRenderer
        return this.celestialRenderer.renderSunEffects(this.ctx, x, y, radius, shadow);
    }

    renderBaileysBeads(x, y, radius, shadowOffsetX, shadowOffsetY, morphProgress, isTransitioningToSolar, hasSunRays) {
        // Delegate to CelestialRenderer
        return this.celestialRenderer.renderBaileysBeads(
            this.ctx, x, y, radius, shadowOffsetX, shadowOffsetY, morphProgress,
            isTransitioningToSolar, hasSunRays, this.scaleValue.bind(this)
        );
    }

    renderMoonShadow(x, y, radius, shadow, shapePoints, isSolarOverlay = false, _rotation = 0) {
        // Delegate to CelestialRenderer
        return this.celestialRenderer.renderMoonShadow(
            this.ctx, x, y, radius, shadow, shapePoints, isSolarOverlay, _rotation, this.shapeMorpher
        );
    }

    renderZenCore(x, y, radius) {
        // Delegate to ZenModeRenderer
        return this.zenModeRenderer.renderZenCore(
            this.ctx, x, y, radius, this.state, this.zenTransition,
            this.gestureTransform, this.scaleValue.bind(this)
        );
    }

    renderSpeakingRings(centerX, centerY, coreRadius, deltaTime) {
        return this.specialEffects.renderSpeakingRings(centerX, centerY, coreRadius, deltaTime);
    }
    
    
    // Recording rings method removed - now using pulsating glow instead
    
    /**
     * Render recording indicator - stylized REC text only
     */
    renderRecordingIndicator(x, y) {
        return this.specialEffects.renderRecordingIndicator(x, y);
    }
    
    
    /**
     * Render sleep indicator (Z's) with cell-shaded style and gradient fade
     * Delegates to SleepManager
     */
    renderSleepIndicator(x, y, deltaTime) {
        return this.sleepManager.renderSleepIndicator(x, y, deltaTime);
    }
    
    
    /**
     * Update animation timers
     */
    updateTimers(deltaTime) {
        // Update breathing animation via BreathingAnimator
        this.breathingAnimator.update(deltaTime, this.state.emotion, this.currentUndertone);
        
        // Update special breathing modifiers
        if (this.state.emotion === 'zen') {
            this.breathingAnimator.setBreathRateMultiplier(0.15);
            this.breathingAnimator.setBreathDepthMultiplier(2.5);
        } else if (this.state.sleeping) {
            this.breathingAnimator.setBreathRateMultiplier(0.5);
            this.breathingAnimator.setBreathDepthMultiplier(1.2);
        } else {
            this.breathingAnimator.setBreathRateMultiplier(1.0);
            this.breathingAnimator.setBreathDepthMultiplier(1.0);
        }
        
        // Apply irregular breathing for nervous/tired
        this.breathingAnimator.setIrregularBreathing(this.state.breathIrregular);
        
        // Update blinking via EyeRenderer
        this.eyeRenderer.setBlinkingEnabled(this.state.blinkingEnabled && !this.state.sleeping && this.state.emotion !== 'zen');
        this.eyeRenderer.update(deltaTime);
        
        // Sync blinking state back to our state for compatibility
        this.state.blinking = this.eyeRenderer.blinking;
        
        // Note: Idle detection is handled by IdleBehavior.js, not here
    }
    
    /**
     * Apply all undertone modifiers to current state
     * @param {string|null|Object} undertone - Undertone name or weighted modifier object
     */
    /**
     * Apply undertone modifiers to renderer state
     * Delegates to EmotionalStateManager
     * @param {string|Object|null} undertone - Undertone name or weighted modifier object
     */
    applyUndertoneModifiers(undertone) {
        this.emotionalStateManager.applyUndertoneModifiers(undertone);
    }
    
    /**
     * Apply undertone shifts to a color using saturation-based depth
     * @param {string} baseColor - Base hex color
     * @param {string|null|Object} undertone - Undertone name or weighted modifier object
     * @returns {string} Modified hex color
     * 
     * Undertone saturation creates visual depth:
     * - INTENSE   : +60% saturation (electric, overwhelming)
     * - CONFIDENT : +30% saturation (bold, present) 
     * - NERVOUS   : +15% saturation (slightly heightened)
     * - CLEAR     :   0% saturation (normal midtone)
     * - TIRED     : -20% saturation (washed out, fading)
     * - SUBDUED   : -50% saturation (ghostly, withdrawn)
     */
    applyUndertoneToColor(baseColor, undertone) {
        return this.colorUtilities.applyUndertoneToColor(baseColor, undertone);
    }
    
    hexToRgb(hex) {
        return this.colorUtilities.hexToRgb(hex);
    }
    
    rgbToHsl(r, g, b) {
        return this.colorUtilities.rgbToHsl(r, g, b);
    }
    
    hslToHex(h, s, l) {
        return this.colorUtilities.hslToHex(h, s, l);
    }
    
    hexToRgba(hex, alpha = 1) {
        const rgb = this.hexToRgb(hex);
        if (!rgb) return `rgba(255, 255, 255, ${alpha})`;
        return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
    }
    
    startColorTransition(targetColor, targetIntensity, duration = 1500) {
        this.colorUtilities.currentColor = this.state.glowColor;
        this.colorUtilities.currentIntensity = this.state.glowIntensity;
        this.colorUtilities.startColorTransition(targetColor, targetIntensity, duration);
        this.colorTransition = this.colorUtilities.colorTransition;
    }
    
    updateColorTransition(deltaTime) {
        const result = this.colorUtilities.updateColorTransition(deltaTime);
        if (result) {
            this.state.glowColor = result.color;
            this.state.glowIntensity = result.intensity;
            this.colorTransition = this.colorUtilities.colorTransition;
        }
    }
    
    /**
     * Update just the undertone without resetting emotion
     * Delegates to EmotionalStateManager
     * @param {string|Object|null} undertone - Undertone name or weighted modifier object
     */
    updateUndertone(undertone) {
        this.emotionalStateManager.updateUndertone(undertone);
    }
    
    /**
     * Set emotional state
     * Delegates to EmotionalStateManager
     * @param {string} emotion - Emotion name
     * @param {Object} properties - Emotion properties
     * @param {string|Object|null} undertone - Optional undertone modifier
     */
    setEmotionalState(emotion, properties, undertone = null) {
        this.emotionalStateManager.setEmotionalState(emotion, properties, undertone);
    }
    
    /**
     * Set BPM for rhythm features
     * @param {number} _bpm - Beats per minute (unused but kept for API compatibility)
     */
    setBPM(_bpm) {
        // BPM-locked rotation has been removed
        // This method is kept for other rhythm-related features
    }

    /**
     * Set manual rotation speed
     * @param {number} speed - Rotation speed in degrees per frame (like velocity)
     */
    setRotationSpeed(speed) {
        this.rotationManager.setRotationSpeed(speed);
    }

    /**
     * Set manual rotation angle directly (for scratching)
     * @param {number} angle - Rotation angle in DEGREES
     */
    setRotationAngle(angle) {
        this.rotationManager.setRotationAngle(angle);
    }
    
    /**
     * Set gaze data from GazeTracker
     * @param {Object} gazeData - Contains offset, proximity, and lock status
     */
    setGazeOffset(gazeData) {
        // Handle both old format (just offset) and new format (full data)
        if (typeof gazeData === 'object' && gazeData !== null) {
            if (Object.prototype.hasOwnProperty.call(gazeData, 'x') && Object.prototype.hasOwnProperty.call(gazeData, 'y')) {
                // Old format - just offset
                this.state.gazeOffset = gazeData;
            } else {
                // New format - full gaze data
                this.state.gazeOffset = gazeData.offset || { x: 0, y: 0 };
                this.state.gazeIntensity = gazeData.proximity || 0;
                this.state.gazeLocked = gazeData.isLocked || false;
            }
        }
        
        // Reset idle timer on interaction
        this.idleTimer = 0;
        if (this.isAsleep) {
            this.wakeUp();
        }
    }
    
    /**
     * Get current orb position (center + gaze offset)
     */
    getCurrentOrbPosition() {
        const logicalWidth = this.canvasManager.width;
        const logicalHeight = this.canvasManager.height;
        const centerX = logicalWidth / 2;
        const centerY = logicalHeight / 2 - this.config.topOffset;
        
        return {
            x: centerX + this.state.gazeOffset.x,
            y: centerY + this.state.gazeOffset.y
        };
    }
    
    /**
     * Sets a custom scale for the orb (used for breathing exercises)
     * @param {number} scale - Scale factor (1.0 = normal)
     */
    setCustomScale(scale) {
        this.state.customScale = scale;
    }
    
    /**
     * Start speaking animation
     */
    startSpeaking() {
        this.state.speaking = true;
        this.speakingRings = [];
        this.ringSpawnTimer = 0;
    }
    
    /**
     * Stop speaking animation
     */
    stopSpeaking() {
        this.state.speaking = false;
        this.speakingRings = [];
    }
    
    /**
     * Enter sleep mode with animation
     * Delegates to SleepManager
     */
    enterSleepMode() {
        this.sleepManager.enterSleepMode();
    }

    /**
     * Wake up from sleep with animation
     * Delegates to SleepManager
     */
    wakeUp() {
        this.sleepManager.wakeUp();
    }
    
    /**
     * Enter zen meditation mode with animation
     */
    enterZenMode(targetColor, targetIntensity) {
        this.zenModeController.enterZenMode(targetColor, targetIntensity);
    }
    
    /**
     * Exit zen meditation mode with awakening animation
     */
    exitZenMode(targetEmotion, targetColor, targetIntensity) {
        this.zenModeController.exitZenMode(targetEmotion, targetColor, targetIntensity);
    }
    
    /**
     * Start recording mode
     */
    startRecording() {
        this.state.recording = true;
    }
    
    /**
     * Stop recording mode
     */
    stopRecording() {
        this.state.recording = false;
    }
    
    /**
     * Get random blink time (2-6 seconds)
     */
    
    /**
     * Set whether blinking is enabled
     * @param {boolean} enabled - Whether blinking should be enabled
     */
    setBlinkingEnabled(enabled) {
        this.state.blinkingEnabled = enabled;
        if (!enabled) {
            // If disabling blinking, immediately stop any current blink
            this.state.blinking = false;
            // Reset blinking via EyeRenderer
            this.eyeRenderer.blinking = false;
            this.eyeRenderer.blinkTimer = 0;
        }
    }

    /**
     * Set gaze tracking enabled state
     * @param {boolean} enabled - Whether gaze tracking should be enabled
     */
    setGazeTracking(enabled) {
        this.gazeTracker.setEnabled(enabled);
    }

    /**
     * Initialize gaze tracking event listeners (delegated to GazeTracker)
     * @deprecated Use gazeTracker.initialize() directly
     */
    initGazeTracking() {
        this.gazeTracker.initialize();
    }

    /**
     * Clean up gaze tracking event listeners (delegated to GazeTracker)
     * @deprecated Use gazeTracker.cleanup() directly
     */
    cleanupGazeTracking() {
        this.gazeTracker.cleanup();
    }

    /**
     * Reset canvas context to fix rendering artifacts after tab switch
     */
    resetCanvasContext() {
        if (!this.canvas || !this.ctx) return;

        // Save current dimensions
        const {width} = this.canvas;
        const {height} = this.canvas;

        // Reset all canvas state
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.globalAlpha = 1;
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';

        // Clear the entire canvas
        this.ctx.clearRect(0, 0, width, height);

        // Also reset offscreen canvas if it exists
        if (this.offscreenCanvas && this.offscreenCtx) {
            this.offscreenCtx.setTransform(1, 0, 0, 1, 0, 0);
            this.offscreenCtx.globalAlpha = 1;
            this.offscreenCtx.globalCompositeOperation = 'source-over';
            this.offscreenCtx.imageSmoothingEnabled = true;
            this.offscreenCtx.imageSmoothingQuality = 'high';
            this.offscreenCtx.clearRect(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);
        }

        // Reset context state manager if it exists
        if (this.contextStateManager) {
            this.contextStateManager.reset();
        }

        // Force a clean render on next frame
        this.forceCleanRender = true;
    }

    
    /**
     * Set quality level for degradation manager compatibility
     * @param {number} quality - Quality level (0-1)
     */
    setQualityLevel(quality) {
        this.qualityLevel = Math.max(0, Math.min(1, quality));
        
        // Adjust rendering parameters based on quality
        if (this.qualityLevel < 0.5) {
            // Low quality mode
            this.ctx.imageSmoothingEnabled = false;
            this.state.breathDepth *= 0.5; // Reduce animation complexity
        } else if (this.qualityLevel < 0.8) {
            // Medium quality
            this.ctx.imageSmoothingEnabled = true;
            this.ctx.imageSmoothingQuality = 'medium';
        } else {
            // High quality
            this.ctx.imageSmoothingEnabled = true;
            this.ctx.imageSmoothingQuality = 'high';
        }
    }
    
    /**
     * Set quality reduction (for degradation manager)
     * @param {boolean} enabled - Whether quality reduction is enabled
     */
    setQualityReduction(enabled) {
        if (enabled) {
            this.setQualityLevel(0.5);
        } else {
            this.setQualityLevel(1.0);
        }
    }
    
    /**
     * Handle canvas context recovery
     * @param {CanvasRenderingContext2D} newContext - New context after recovery
     */
    handleContextRecovery(newContext) {
        this.ctx = newContext;
    }
    
    /**
     * Get the current undertone modifier for particle system
     * @returns {Object|null} Current undertone modifier or null
     */
    getUndertoneModifier() {
        // Use the new weighted method from state machine if available
        if (this.stateMachine && this.stateMachine.getWeightedUndertoneModifiers) {
            return this.stateMachine.getWeightedUndertoneModifiers();
        }
        
        // Fallback to old method
        if (!this.currentUndertone || !this.undertoneModifiers[this.currentUndertone]) {
            return null;
        }
        return this.undertoneModifiers[this.currentUndertone];
    }
    
    /**
     * Apply all active gesture animations
     * Returns combined transform object
     */
    // Gesture animations moved to GestureAnimator module
    applyGestureAnimations() {
        return this.gestureAnimator.applyGestureAnimations();
    }
      
    /**
     * Start a gesture animation - delegates to GestureAnimator
     */
    startGesture(gestureName) {
        // Simply delegate to GestureAnimator
        return this.gestureAnimator.startGesture(gestureName);
    }
    
    /**
     * Get current active gesture information for particle system
     * @returns {Object|null} Current gesture with particleMotion and progress, or null
     */
    getCurrentGesture() {
        // Delegate to GestureAnimator to get current gesture
        return this.gestureAnimator.getCurrentGesture();
    }
    
    /**
     * Programmatically create gesture delegation methods
     * This avoids 42 lines of boilerplate by dynamically forwarding start* methods to gestureAnimator
     * @private
     */
    _createGestureDelegates() {
        const gestures = [
            'Bounce', 'Pulse', 'Shake', 'Spin', 'Nod', 'Tilt', 'Expand', 'Contract',
            'Flash', 'Drift', 'Stretch', 'Glow', 'Flicker', 'Vibrate', 'Orbital', 'Hula',
            'Wave', 'Breathe', 'Morph', 'SlowBlink', 'Look', 'Settle', 'BreathIn', 'BreathOut',
            'BreathHold', 'BreathHoldEmpty', 'Jump', 'Sway', 'Float', 'Rain', 'RunningMan', 'Charleston',
            'Sparkle', 'Shimmer', 'Wiggle', 'Groove', 'Point', 'Lean', 'Reach', 'HeadBob', 'Orbit'
        ];

        gestures.forEach(gesture => {
            const methodName = `start${gesture}`;
            this[methodName] = () => this.gestureAnimator[methodName]();
        });
    }

    // Ambient dance animations - manually defined due to parameter requirements
    startGrooveSway(options) { this.ambientDanceAnimator.startAmbientAnimation('grooveSway', options); }
    startGrooveBob(options) { this.ambientDanceAnimator.startAmbientAnimation('grooveBob', options); }
    startGrooveFlow(options) { this.ambientDanceAnimator.startAmbientAnimation('grooveFlow', options); }
    startGroovePulse(options) { this.ambientDanceAnimator.startAmbientAnimation('groovePulse', options); }
    startGrooveStep(options) { this.ambientDanceAnimator.startAmbientAnimation('grooveStep', options); }
    
    /**
     * Stop all active gestures - delegates to GestureAnimator
     */
    stopAllGestures() {
        this.gestureAnimator.stopAllGestures();
        this.currentGesture = null;
    }
    
    /**
     * Check if any gesture is active - delegates to GestureAnimator
     */
    isGestureActive() {
        return Object.values(this.gestureAnimator.gestureAnimations).some(anim => anim.active);
    }
    
    /**
     * Clean up resources
     */
    destroy() {
        // Cancel all animation frames to prevent memory leaks
        for (const key in this.animationFrameIds) {
            if (this.animationFrameIds[key]) {
                cancelAnimationFrame(this.animationFrameIds[key]);
                this.animationFrameIds[key] = null;
            }
        }

        // Unregister all animation loop callbacks to prevent accumulation
        for (const key in this.loopCallbackIds) {
            if (this.loopCallbackIds[key]) {
                animationLoopManager.unregister(this.loopCallbackIds[key]);
                this.loopCallbackIds[key] = null;
            }
        }

        // Clean up sleep manager (handles eyeClose/eyeOpen callbacks and wakeJitterTimeout)
        if (this.sleepManager) {
            this.sleepManager.cleanup();
        }

        // Clean up gaze tracking
        if (this.gazeTracker) {
            this.gazeTracker.cleanup();
        }

        // Clear any pending timeouts
        if (this.wakeJitterTimeout) {
            clearTimeout(this.wakeJitterTimeout);
            this.wakeJitterTimeout = null;
        }

        // Clear animation states
        this.colorTransition.active = false;
        if (this.zenTransition) {
            this.zenTransition.active = false;
        }

        // Clean up gaze tracking listeners
        this.cleanupGazeTracking();

        // Clear other resources
        this.speakingRings = [];

        // Clear gesture compositor cache
        if (this.gestureCompositor) {
            this.gestureCompositor.clearCache();
        }

        // Destroy modular components
        if (this.specialEffects) {
            this.specialEffects.destroy();
        }
    }
}

export default EmotiveRenderer;
