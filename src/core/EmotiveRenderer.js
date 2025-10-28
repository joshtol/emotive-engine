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
import { RotationBrake } from './animation/RotationBrake.js';
import { AmbientDanceAnimator } from './renderer/AmbientDanceAnimator.js';
import { BackdropRenderer } from './renderer/BackdropRenderer.js';
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
        this.rotationBrake = new RotationBrake(this);
        this.ambientDanceAnimator = new AmbientDanceAnimator(this);
        this.backdropRenderer = new BackdropRenderer(this);

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
            // Manual rotation control (not BPM-locked)
            manualRotation: 0,        // Current rotation angle in DEGREES
            rotationSpeed: 0,         // Rotation speed in DEGREES per frame (like velocity in demo)
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
        
        // Episodic effects for undertones
        this.episodicEffects = {
            nervous: {
                active: false,
                startTime: 0,
                duration: 0,
                intensity: 0,
                nextTrigger: 3000 + Math.random() * 2000 // 3-5 seconds
            },
            confident: {
                active: false,
                startTime: 0,
                duration: 0,
                intensity: 0,
                nextTrigger: 4000 + Math.random() * 2000 // 4-6 seconds
            },
            tired: {
                active: false,
                startTime: 0,
                duration: 0,
                intensity: 0,
                nextTrigger: 5000 + Math.random() * 2000 // 5-7 seconds
            },
            intense: {
                active: false,
                startTime: 0,
                duration: 0,
                intensity: 0,
                nextTrigger: 3000 + Math.random() * 3000 // 3-6 seconds
            },
            subdued: {
                active: false,
                startTime: 0,
                duration: 0,
                intensity: 0,
                nextTrigger: 4000 + Math.random() * 3000 // 4-7 seconds
            }
        };
        
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
        
        // Zen state animation
        this.zenTransition = {
            active: false,
            phase: null, // 'entering', 'in', 'exiting'
            startTime: 0,
            previousEmotion: null,
            targetEmotion: null,
            scaleX: 1.0,
            scaleY: 1.0,
            arcHeight: 0,
            lotusMorph: 0, // 0 = circle, 1 = full lotus
            petalSpread: 0, // 0 = closed, 1 = fully open
            smileCurve: 0  // 0 = straight, 1 = full smile
        };
        
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
        // Performance marker: Frame start
        if (this.performanceMonitor) {
            this.performanceMonitor.markFrameStart();
        }
        const frameStartTime = performance.now();

        // Handle forced clean render after tab switch
        if (this.forceCleanRender) {
            this.forceCleanRender = false;
            // Clear any rendering artifacts
            if (this.canvas && this.ctx) {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }
        }

        // Get ambient dance transform and merge with gesture transform
        const ambientTransform = this.ambientDanceAnimator.getTransform(deltaTime);
        if (gestureTransform) {
            // Merge transforms
            gestureTransform.x = (gestureTransform.x || 0) + (ambientTransform.x || 0);
            gestureTransform.y = (gestureTransform.y || 0) + (ambientTransform.y || 0);
            gestureTransform.rotation = (gestureTransform.rotation || 0) + (ambientTransform.rotation || 0);
            gestureTransform.scale = (gestureTransform.scale || 1) * (ambientTransform.scale || 1);
        } else {
            gestureTransform = ambientTransform;
        }

        // Store gestureTransform for use in other methods
        this.gestureTransform = gestureTransform;

        // Update offscreen canvas size if needed
        this.updateOffscreenSize();
        
        // Get logical dimensions from canvasManager (not scaled by DPR)
        const logicalWidth = this.canvasManager.width || this.canvas.width || 400;
        const logicalHeight = this.canvasManager.height || this.canvas.height || 400;
        
        // Store original context and switch to offscreen for double buffering
        const originalCtx = this.ctx;
        this.ctx = this.offscreenCtx;

        // RENDER BACKDROP TO MAIN CANVAS FIRST (persists, not subject to decay/clear)
        // Calculate backdrop position early - needs centerX, centerY, coreRadius
        // We'll calculate these now for backdrop, then again later for full render
        const backdropCanvasSize = Math.min(logicalWidth, logicalHeight);
        const backdropEffectiveCenter = this.getEffectiveCenter();
        const backdropCenterX = backdropEffectiveCenter.x;
        const backdropCenterY = backdropEffectiveCenter.y - this.config.topOffset;
        const backdropScaleFactor = (backdropCanvasSize / this.config.referenceSize) * this.config.baseScale * (backdropEffectiveCenter.coreScale || backdropEffectiveCenter.scale);
        const backdropBaseRadius = (this.config.referenceSize / this.config.coreSizeDivisor) * backdropScaleFactor;
        const backdropCoreRadius = backdropBaseRadius; // Simple estimate, will be refined later

        // Update and render backdrop to MAIN canvas (not offscreen)
        this.backdropRenderer.update(deltaTime);
        if (this.audioAnalyzer && this.audioAnalyzer.currentAmplitude) {
            this.backdropRenderer.setAudioIntensity(this.audioAnalyzer.currentAmplitude);
        }
        this.backdropRenderer.render(backdropCenterX, backdropCenterY, backdropCoreRadius, originalCtx);

        // Apply decay to main canvas to prevent glow accumulation
        // Scale decay with particle count to handle high-particle emotions like euphoria
        const particleCount = this.particleSystem ? this.particleSystem.particles.length : 0;
        // Base decay: 12%, increased up to 20% for high particle counts
        const decayRate = 0.12 + Math.min(0.08, particleCount * 0.003);

        originalCtx.save();
        originalCtx.globalCompositeOperation = 'destination-out';
        originalCtx.fillStyle = `rgba(0, 0, 0, ${decayRate})`;
        originalCtx.fillRect(0, 0, logicalWidth, logicalHeight);
        originalCtx.restore();

        // Clear offscreen canvas for fresh render
        this.ctx.clearRect(0, 0, logicalWidth, logicalHeight);
        
        // Update undertone modifiers every frame during transitions
        if (this.stateMachine && this.stateMachine.getWeightedUndertoneModifiers) {
            const weightedModifier = this.stateMachine.getWeightedUndertoneModifiers();
            if (weightedModifier) {
                this.applyUndertoneModifiers(weightedModifier);
            } else {
                // Reset to defaults when no undertone
                this.applyUndertoneModifiers(null);
            }
        }
        
        // Update color transition (if active)
        if (this.colorTransition && this.colorTransition.active) {
            this.updateColorTransition(deltaTime);
        }
        
        // Update animation timers
        this.updateTimers(deltaTime);
        
        // Update gaze offset
        if (this.state.gazeTrackingEnabled) {
            // When gaze tracking is enabled, follow mouse/touch
            const smoothing = 0.15;
            const maxOffset = 50; // Maximum pixels the orb can move
            this.state.gazeOffset.x += (this.state.gazeTarget.x * maxOffset - this.state.gazeOffset.x) * smoothing;
            this.state.gazeOffset.y += (this.state.gazeTarget.y * maxOffset - this.state.gazeOffset.y) * smoothing;
        } else {
            // When gaze tracking is disabled, return to center
            const smoothing = 0.1;
            this.state.gazeOffset.x += (0 - this.state.gazeOffset.x) * smoothing;
            this.state.gazeOffset.y += (0 - this.state.gazeOffset.y) * smoothing;
        }
        
        // Calculate dimensions - using logical size for proper scaling
        const canvasSize = Math.min(logicalWidth, logicalHeight);
        
        // Get effective center coordinates (with position offsets applied)
        const effectiveCenter = this.getEffectiveCenter();
        let centerX = effectiveCenter.x;
        let centerY = effectiveCenter.y - this.config.topOffset;
        
        // Apply vertical offset for certain emotions (like excited for exclamation mark)
        if (state.properties && state.properties.verticalOffset) {
            centerY = effectiveCenter.y - this.config.topOffset + (logicalHeight * state.properties.verticalOffset);
        }
        
        // Calculate global scale factor for core rendering (uses coreScale for independent control)
        this.scaleFactor = (canvasSize / this.config.referenceSize) * this.config.baseScale * (effectiveCenter.coreScale || effectiveCenter.scale);

        // Store particle scale factor separately for particle system
        this.particleScaleFactor = (canvasSize / this.config.referenceSize) * this.config.baseScale * (effectiveCenter.particleScale || effectiveCenter.scale);
        
        // Apply gesture transform if present
        let scaleMultiplier = 1;
        let rotationAngle = 0;
        let glowMultiplier = 1;
        
        if (gestureTransform) {
            centerX += gestureTransform.x || 0;
            centerY += gestureTransform.y || 0;
            scaleMultiplier = gestureTransform.scale || 1;
            rotationAngle = (gestureTransform.rotation || 0) * Math.PI / 180;
            glowMultiplier = gestureTransform.glowIntensity || 1;
        }

        // Apply gesture animations (delegate to GestureAnimator)
        const gestureTransforms = this.gestureAnimator.applyGestureAnimations();
        if (gestureTransforms) {
            centerX += gestureTransforms.offsetX || 0;
            centerY += gestureTransforms.offsetY || 0;
            scaleMultiplier *= gestureTransforms.scale || 1;
            rotationAngle += (gestureTransforms.rotation || 0) * Math.PI / 180;
            // DON'T MULTIPLY - just use the glow value directly to prevent accumulation
            glowMultiplier = gestureTransforms.glow || 1;
        }
        
        // Apply zen levitation - lazy floating when in zen state
        if (this.state.emotion === 'zen' && this.zenTransition.phase === 'in') {
            const time = Date.now() / 1000;
            // Lazy vertical float - slow sine wave
            const floatY = Math.sin(time * 0.3) * 15 * this.scaleFactor; // Very slow, 15px amplitude
            // Gentle horizontal sway - even slower
            const swayX = Math.sin(time * 0.2) * 8 * this.scaleFactor; // Subtle 8px sway
            // Small rotation for ethereal effect
            const floatRotation = Math.sin(time * 0.25) * 0.05; // ±3 degrees
            
            centerY += floatY;
            centerX += swayX;
            rotationAngle += floatRotation;
        }
        
        // Apply sleep state modifications (with animated dimming)
        let sleepOpacityMod = 1;
        let sleepScaleMod = 1;
        let glowOpacityMod = 1;
        if (this.state.sleeping || this.state.emotion === 'resting' || isEffectActive('sleeping', this.state)) {
            const sleepEffect = getEffect('sleeping');
            if (sleepEffect) {
                const dimming = sleepEffect.getDimmingValues();
                // Use effect's dimming values
                sleepOpacityMod = this.state.sleepDimness !== undefined ? this.state.sleepDimness : dimming.orbDimming;
                glowOpacityMod = dimming.glowDimming; // Dim glow even more
                sleepScaleMod = this.state.sleepScale !== undefined ? this.state.sleepScale : 0.9;
            } else {
                // Fallback values
                sleepOpacityMod = this.state.sleepDimness !== undefined ? this.state.sleepDimness : 0.3;
                glowOpacityMod = 0.2;
                sleepScaleMod = this.state.sleepScale !== undefined ? this.state.sleepScale : 0.9;
            }
            this.state.breathRate = 0.5;  // Slower breathing
            this.state.breathDepth = 0.15; // Deeper breaths
        }
        
        // Calculate breathing factors - INVERSE for core and glow
        // Use custom scale if set (for breathing exercises), otherwise use normal breathing
        let coreBreathFactor, glowBreathFactor;
        
        if (this.state.customScale !== null) {
            // Use custom scale directly for breathing exercises
            coreBreathFactor = this.state.customScale;
            glowBreathFactor = 1 + (this.state.customScale - 1) * 0.5; // Glow follows at half intensity
        } else {
            // Normal breathing behavior
            // Zen uses full breath depth regardless of breathRate
            const _effectiveBreathDepth = this.state.emotion === 'zen' ? this.state.breathDepth :
                this.state.breathDepth * this.state.breathRate; // Calculated but unused - kept for future use
            // Get breathing scale from BreathingAnimator
            const breathingScale = this.breathingAnimator.getBreathingScale();
            coreBreathFactor = breathingScale;
            glowBreathFactor = 1 - (breathingScale - 1) * 0.5; // Glow breathes opposite, less pronounced
        }
        
        // Add nervous glow pulse if needed
        if (this.state.undertone === 'nervous' && this.undertoneModifiers.nervous.glowPulse) {
            const nervousPulse = Math.sin(Date.now() / 200) * this.undertoneModifiers.nervous.glowPulse; // Fast subtle pulse
            glowBreathFactor *= (1 + nervousPulse);
        }
        
        // Calculate core dimensions - using unified scale factor
        const baseRadius = (this.config.referenceSize / this.config.coreSizeDivisor) * this.scaleFactor;
        
        // Apply emotion core size from state properties
        const emotionSizeMult = (state.properties && state.properties.coreSize) ? state.properties.coreSize : 1.0;
        
        // Apply undertone size multiplier
        const undertoneSizeMult = this.state.sizeMultiplier || 1.0;
        
        let coreRadius = baseRadius * emotionSizeMult * coreBreathFactor * scaleMultiplier * sleepScaleMod * undertoneSizeMult;
        let glowRadius = baseRadius * this.config.glowMultiplier * glowBreathFactor * this.state.glowIntensity * scaleMultiplier * sleepScaleMod * undertoneSizeMult * glowMultiplier;  // Apply gesture glow multiplier

        // Use state glow intensity directly multiplied by gesture glow
        const effectiveGlowIntensity = this.state.glowIntensity * glowMultiplier;
        
        
        // Apply blinking (only when not sleeping or zen)
        if (!this.state.sleeping && this.state.emotion !== 'zen') {
            const blinkScale = this.eyeRenderer.getBlinkScale();
            coreRadius *= blinkScale; // Apply blink squish
        }
        
        // Apply jitter if needed (anger, fear, or undertone jitter)
        let jitterX = 0, jitterY = 0;
        const jitterAmount = this.state.jitterAmount || 0;
        
        // Handle episodic effects for undertones
        if (this.currentUndertone && this.episodicEffects[this.currentUndertone]) {
            const episode = this.episodicEffects[this.currentUndertone];
            const _modifier = this.undertoneModifiers[this.currentUndertone]; // Available for future use
            const now = performance.now();
            
            // Check if it's time to trigger a new episode
            if (!episode.active && now >= episode.nextTrigger) {
                episode.active = true;
                episode.startTime = now;
                
                // Set episode parameters based on undertone type
                switch(this.currentUndertone) {
                case 'nervous':
                    episode.duration = 500 + Math.random() * 500; // 0.5-1 second
                    episode.intensity = 2 + Math.random(); // 2-3px flutter
                    episode.nextTrigger = now + 3000 + Math.random() * 2000; // 3-5 seconds
                    break;
                case 'confident':
                    episode.duration = 1000 + Math.random() * 1000; // 1-2 seconds
                    episode.intensity = 0.15; // 15% size expansion
                    episode.nextTrigger = now + 4000 + Math.random() * 2000; // 4-6 seconds
                    break;
                case 'tired':
                    episode.duration = 1000 + Math.random() * 2000; // 1-3 seconds
                    episode.intensity = 0.2; // 20% size reduction
                    episode.nextTrigger = now + 5000 + Math.random() * 2000; // 5-7 seconds
                    break;
                case 'intense':
                    episode.duration = 500 + Math.random() * 500; // 0.5-1 second
                    episode.intensity = 0.5; // 50% glow boost, 5% size shrink
                    episode.nextTrigger = now + 3000 + Math.random() * 3000; // 3-6 seconds
                    break;
                case 'subdued':
                    episode.duration = 2000 + Math.random() * 1000; // 2-3 seconds
                    episode.intensity = 0.3; // 30% glow dim, 10% size shrink
                    episode.nextTrigger = now + 4000 + Math.random() * 3000; // 4-7 seconds
                    break;
                }
            }
            
            // Apply episode effects if active
            if (episode.active) {
                const elapsed = now - episode.startTime;
                
                if (elapsed < episode.duration) {
                    const progress = elapsed / episode.duration;
                    
                    // Apply different effects based on undertone
                    switch(this.currentUndertone) {
                    case 'nervous': {
                        // Quick shiver that settles
                        const damping = 1 - progress;
                        const frequency = 15;
                        const flutter = Math.sin(progress * Math.PI * frequency) * damping;
                        jitterX = flutter * episode.intensity;
                        jitterY = flutter * episode.intensity * 0.7;
                        break;
                    }
                            
                    case 'confident': {
                        // Smooth chest puff that settles
                        const puffCurve = Math.sin(progress * Math.PI); // Smooth rise and fall
                        coreRadius *= (1 + episode.intensity * puffCurve);
                        glowRadius *= (1 + episode.intensity * 0.5 * puffCurve);
                        break;
                    }
                            
                    case 'tired': {
                        // Drowsy sag with slow recovery
                        const sagCurve = Math.sin(progress * Math.PI * 0.5); // Slow droop
                        coreRadius *= (1 - episode.intensity * sagCurve);
                        // Also affect vertical position slightly
                        jitterY += sagCurve * 5; // Slight downward sag
                        break;
                    }
                            
                    case 'intense': {
                        // Sharp contraction with glow surge
                        const focusCurve = 1 - Math.cos(progress * Math.PI); // Quick in-out
                        coreRadius *= (1 - 0.05 * focusCurve); // 5% shrink
                        glowRadius *= (1 + episode.intensity * focusCurve); // 50% glow boost
                        break;
                    }
                            
                    case 'subdued': {
                        // Gentle inward pull
                        const withdrawCurve = Math.sin(progress * Math.PI * 0.5); // Slow pull
                        coreRadius *= (1 - 0.1 * withdrawCurve); // 10% shrink
                        glowRadius *= (1 - episode.intensity * withdrawCurve); // 30% glow dim
                        break;
                    }
                    }
                } else {
                    // Episode finished
                    episode.active = false;
                }
            }
        } else if (this.state.coreJitter || jitterAmount > 0) {
            // Regular jitter for other emotions
            const jitterStrength = Math.max(jitterAmount, this.state.coreJitter ? this.scaleValue(2) : 0);
            jitterX = (Math.random() - 0.5) * jitterStrength;
            jitterY = (Math.random() - 0.5) * jitterStrength;
        }
        
        // Calculate positions with gaze offset
        const coreX = centerX + this.state.gazeOffset.x + jitterX;
        const coreY = centerY + this.state.gazeOffset.y + jitterY;
        
        // Check if brake is active and update rotation accordingly
        const now = performance.now();

        if (this.rotationBrake && this.rotationBrake.isBraking()) {
            // Brake is active - let it control rotation
            const brakeUpdate = this.rotationBrake.updateBrake(now);
            if (brakeUpdate) {
                this.state.manualRotation = brakeUpdate.rotation;
                this.state.rotationSpeed = brakeUpdate.complete ? 0 : brakeUpdate.speed;
            }
        } else if (this.state.rotationSpeed !== 0) {
            // Normal rotation update - just add velocity each frame (DEGREES)
            this.state.manualRotation += this.state.rotationSpeed;
        }

        // Calculate total rotation (gestures + manual rotation)
        // Convert manual rotation from degrees to radians for rendering
        const totalRotation = rotationAngle + (this.state.manualRotation * Math.PI / 180);

        // Apply rotation if present
        if (totalRotation !== 0) {
            this.ctx.save();
            this.ctx.translate(coreX, coreY);
            this.ctx.rotate(totalRotation);
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
                const {currentShape: innerCurrentShape} = this.shapeMorpher;
                const {targetShape: innerTargetShape} = this.shapeMorpher;
                const _fromLunar = innerCurrentShape === 'lunar' || innerCurrentShape === 'eclipse'; // Unused - kept for future use
                const _toLunar = innerTargetShape === 'lunar' || innerTargetShape === 'eclipse'; // Unused - kept for future use
                
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
        const {ctx} = this;
        const time = Date.now() / 100;
        
        ctx.save();
        ctx.translate(x, y);
        
        // 1. Surface texture - turbulent plasma
        if (shadow.texture && (shadow.textureOpacity === undefined || shadow.textureOpacity > 0)) {
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            ctx.globalAlpha = shadow.textureOpacity !== undefined ? shadow.textureOpacity : 1;
            
            const offset = time * 0.05 * (shadow.turbulence || 0.3) / 0.3;
            const textureGradient = ctx.createRadialGradient(
                Math.sin(offset) * radius * 0.15,
                Math.cos(offset * 0.7) * radius * 0.15,
                radius * 0.2,
                0, 0, radius
            );
            textureGradient.addColorStop(0, 'rgba(255, 255, 200, 0)');
            textureGradient.addColorStop(0.4, 'rgba(255, 200, 100, 0.1)');
            textureGradient.addColorStop(0.7, 'rgba(255, 150, 50, 0.08)');
            textureGradient.addColorStop(1, 'rgba(255, 100, 30, 0.05)');
            
            ctx.fillStyle = textureGradient;
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        }
        
        // 2. Bright corona layers
        const coronaOpacity = shadow.coronaOpacity !== undefined ? shadow.coronaOpacity : 1;
        if (coronaOpacity > 0) {
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            
            // Inner bright glow
            const innerGlow = ctx.createRadialGradient(0, 0, radius * 0.5, 0, 0, radius * 1.1);
            innerGlow.addColorStop(0, `rgba(255, 255, 255, ${0.8 * coronaOpacity})`);
            innerGlow.addColorStop(0.3, `rgba(255, 250, 200, ${0.6 * coronaOpacity})`);
            innerGlow.addColorStop(0.5, `rgba(255, 200, 100, ${0.4 * coronaOpacity})`);
            innerGlow.addColorStop(0.7, `rgba(255, 150, 50, ${0.2 * coronaOpacity})`);
            innerGlow.addColorStop(1, 'rgba(255, 100, 20, 0)');
            
            ctx.fillStyle = innerGlow;
            ctx.beginPath();
            ctx.arc(0, 0, radius * 1.1, 0, Math.PI * 2);
            ctx.fill();
            
            // Outer corona with animation
            for (let i = 0; i < 2; i++) {
                const scale = 1.3 + i * 0.4;
                const opacity = (0.35 - i * 0.15) * coronaOpacity;
                const wobble = Math.sin(time * 0.1 + i) * 0.05;
                
                const coronaGradient = ctx.createRadialGradient(
                    0, 0, radius * (0.9 + wobble), 
                    0, 0, radius * (scale + wobble)
                );
                coronaGradient.addColorStop(0, 'rgba(255, 255, 200, 0)');
                coronaGradient.addColorStop(0.4, `rgba(255, 200, 100, ${opacity * 0.5})`);
                coronaGradient.addColorStop(0.7, `rgba(255, 150, 50, ${opacity})`);
                coronaGradient.addColorStop(0.9, `rgba(255, 100, 30, ${opacity * 0.5})`);
                coronaGradient.addColorStop(1, 'rgba(255, 50, 10, 0)');
                
                ctx.fillStyle = coronaGradient;
                ctx.beginPath();
                ctx.arc(0, 0, radius * (scale + wobble), 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.restore();
        }
        
        // 3. Optimized ethereal flame pennants - TONS of rays
        if (shadow.flares) {
            ctx.save();
            
            // Pre-calculate common values
            const wave1 = Math.sin(time * 0.08);
            const wave2 = Math.sin(time * 0.12);
            const wave3 = Math.sin(time * 0.16);
            
            // Create single gradient for all flames
            const grad = ctx.createLinearGradient(0, -radius, 0, -radius * 3);
            grad.addColorStop(0, 'rgba(255, 255, 230, 0.4)');
            grad.addColorStop(0.2, 'rgba(255, 220, 150, 0.25)');
            grad.addColorStop(0.5, 'rgba(255, 180, 80, 0.15)');
            grad.addColorStop(0.8, 'rgba(255, 120, 40, 0.08)');
            grad.addColorStop(1, 'rgba(255, 60, 20, 0)');
            
            ctx.fillStyle = grad;
            ctx.globalCompositeOperation = 'screen';
            
            // Single path for ALL flames
            ctx.beginPath();
            
            // Helper function for flame shape
            const addFlame = (angle, length, width, wave) => {
                const cos = Math.cos(angle);
                const sin = Math.sin(angle);
                const baseX = cos * radius;
                const baseY = sin * radius;
                const tipX = cos * (radius + length);
                const tipY = sin * (radius + length);
                const perpX = -sin * width * 0.5;
                const perpY = cos * width * 0.5;
                const waveOffset = wave * width * 0.3;
                
                // Simple triangle with slight curve
                ctx.moveTo(baseX - perpX, baseY - perpY);
                ctx.quadraticCurveTo(
                    (baseX + tipX) * 0.5 + perpX * waveOffset,
                    (baseY + tipY) * 0.5 + perpY * waveOffset,
                    tipX, tipY
                );
                ctx.quadraticCurveTo(
                    (baseX + tipX) * 0.5 - perpX * waveOffset,
                    (baseY + tipY) * 0.5 - perpY * waveOffset,
                    baseX + perpX, baseY + perpY
                );
            };
            
            // Layer 1: Long primary rays (8)
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2 + wave1 * 0.1;
                const length = radius * (1.8 + Math.sin(time * 0.1 + i * 0.5) * 0.4);
                const width = radius * 0.18;
                const wave = Math.sin(time * 0.15 + i);
                addFlame(angle, length, width, wave);
            }
            
            // Layer 2: Medium rays between primaries (12)
            for (let i = 0; i < 12; i++) {
                const angle = ((i + 0.5) / 12) * Math.PI * 2 + wave2 * 0.08;
                const length = radius * (1.2 + Math.sin(time * 0.13 + i * 0.7) * 0.3);
                const width = radius * 0.12;
                const wave = Math.sin(time * 0.18 + i * 1.2);
                addFlame(angle, length, width, wave);
            }
            
            // Layer 3: Short rays filling gaps (15)
            for (let i = 0; i < 15; i++) {
                const angle = (i / 15) * Math.PI * 2 + wave3 * 0.05;
                const length = radius * (0.7 + Math.sin(time * 0.17 + i * 0.9) * 0.25);
                const width = radius * 0.08;
                const wave = Math.sin(time * 0.2 + i * 1.5);
                addFlame(angle, length, width, wave);
            }
            
            // Layer 4: Tiny rays for density (15)
            for (let i = 0; i < 15; i++) {
                const angle = ((i + 0.25) / 15) * Math.PI * 2;
                const length = radius * (0.4 + Math.sin(time * 0.22 + i) * 0.2);
                const width = radius * 0.06;
                // Simple triangles for tiny rays
                const cos = Math.cos(angle);
                const sin = Math.sin(angle);
                const baseX = cos * radius;
                const baseY = sin * radius;
                const tipX = cos * (radius + length);
                const tipY = sin * (radius + length);
                const perpX = -sin * width * 0.5;
                const perpY = cos * width * 0.5;
                
                ctx.moveTo(baseX - perpX, baseY - perpY);
                ctx.lineTo(tipX, tipY);
                ctx.lineTo(baseX + perpX, baseY + perpY);
            }
            
            // Single fill operation for all rays!
            ctx.fill();
            ctx.restore();
        }
        
        // 4. Bright rim lighting
        const rimGradient = ctx.createRadialGradient(0, 0, radius * 0.95, 0, 0, radius * 1.05);
        rimGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        rimGradient.addColorStop(0.7, 'rgba(255, 255, 200, 0.2)');
        rimGradient.addColorStop(0.9, 'rgba(255, 200, 100, 0.5)');
        rimGradient.addColorStop(1, 'rgba(255, 150, 50, 0.3)');
        
        ctx.fillStyle = rimGradient;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 1.05, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
    
    /**
     * Render Bailey's Beads for solar eclipse
     */
    renderBaileysBeads(x, y, radius, shadowOffsetX, shadowOffsetY, morphProgress, isTransitioningToSolar, hasSunRays) {
        const {ctx} = this;
        
        // NEVER show beads if there are no sun rays visible
        if (!hasSunRays) {
            this._beadStartTime = null;
            return;
        }
        
        // Check if this is a lunar-solar transition (shadow stays centered)
        const isLunarSolarTransition = Math.abs(shadowOffsetX) < 1 && Math.abs(shadowOffsetY) < 1;
        
        // Show beads when shadow is approaching center OR for lunar-solar transitions
        // Different thresholds for entering vs leaving
        const threshold = isTransitioningToSolar ? 30 : 15; // Disappear faster when leaving
        const shadowNearCenter = Math.abs(shadowOffsetX) < threshold && Math.abs(shadowOffsetY) < threshold;
        
        if (!shadowNearCenter && !isLunarSolarTransition) {
            // Reset when not near center (unless it's lunar-solar)
            this._beadStartTime = null;
            return;
        }
        
        // Generate different beads for entering vs leaving
        const _beadKey = isTransitioningToSolar ? 'entering' : 'leaving'; // Unused - kept for future use
        
        // Check if we need to generate new beads (first time shadow centers for this transition)
        if (!this._beadStartTime) {
            const beadCount = Math.floor(Math.random() * 4) + 1; // 1-4 beads
            
            this._currentBeads = [];
            
            // Create beads with random order
            const angles = [];
            for (let i = 0; i < beadCount; i++) {
                angles.push(Math.random() * Math.PI * 2);
            }
            
            // Shuffle the order they'll appear
            const order = Array.from({length: beadCount}, (_, i) => i);
            for (let i = order.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [order[i], order[j]] = [order[j], order[i]];
            }
            
            for (let i = 0; i < beadCount; i++) {
                this._currentBeads.push({
                    angle: angles[i],
                    size: 3 + Math.random() * 5, // Random size 3-8
                    order: order[i], // Order in sequence
                    delay: order[i] * 200 // 200ms between each bead
                });
            }
            
            this._beadStartTime = Date.now();
        }
        
        const elapsedTime = Date.now() - this._beadStartTime;
        
        // Render the beads as chromatic lens flares (one at a time)
        const beads = this._currentBeads || [];
        
        beads.forEach(bead => {
            // Check if this bead should be visible yet
            if (elapsedTime < bead.delay) return;
            
            // Calculate fade in (300ms fade)
            const beadAge = elapsedTime - bead.delay;
            const fadeInDuration = 300;
            const opacity = Math.min(1, beadAge / fadeInDuration);
            
            // Calculate bead position on the edge of the sun (not shadow)
            const beadX = x + Math.cos(bead.angle) * radius;
            const beadY = y + Math.sin(bead.angle) * radius;
            
            ctx.save();
            ctx.translate(beadX, beadY);
            ctx.globalAlpha = opacity;
            
            // Draw chromatic aberration lens flare
            const size = this.scaleValue(bead.size);
            
            // Chromatic layers - RGB separated for aberration effect
            const colors = [
                { color: `rgba(255, 100, 100, ${0.6 * opacity})`, offset: -2 },  // Red
                { color: `rgba(100, 255, 100, ${0.6 * opacity})`, offset: 0 },   // Green  
                { color: `rgba(100, 100, 255, ${0.6 * opacity})`, offset: 2 }    // Blue
            ];
            
            ctx.globalCompositeOperation = 'screen';
            
            colors.forEach(({ color, offset }) => {
                // Create radial gradient for each color channel
                const gradient = ctx.createRadialGradient(
                    offset, offset, 0,
                    offset, offset, size * 2
                );
                
                gradient.addColorStop(0, color);
                gradient.addColorStop(0.2, color.replace(`${0.6 * opacity}`, `${0.4 * opacity}`));
                gradient.addColorStop(0.5, color.replace(`${0.6 * opacity}`, `${0.2 * opacity}`));
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(offset, offset, size * 2, 0, Math.PI * 2);
                ctx.fill();
            });
            
            // Add bright white core
            ctx.globalCompositeOperation = 'lighter';
            const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
            coreGradient.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
            coreGradient.addColorStop(0.3, `rgba(255, 255, 255, ${0.5 * opacity})`);
            coreGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = coreGradient;
            ctx.beginPath();
            ctx.arc(0, 0, size, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        });
    }
    
    /**
     * Render moon/lunar shadow overlay
     * @param {boolean} isSolarOverlay - True if this is being called for solar eclipse effect
     * @param {number} _rotation - Rotation angle to apply (unused but kept for API consistency)
     */
    renderMoonShadow(x, y, radius, shadow, shapePoints, isSolarOverlay = false, _rotation = 0) {
        const {ctx} = this;

        ctx.save();
        ctx.globalAlpha = 1; // Always render shadow at full opacity, even in resting state
        ctx.translate(x, y);

        // Don't apply rotation - we're already in rotated coordinate space

        if (shadow.type === 'crescent') {
            // Crescent moon - smooth shadow without pixelation
            
            // Get morph progress to animate the shadow sliding in
            let shadowProgress = 1.0; // Default to fully visible
            let animatedOffset = shadow.offset || 0.7; // Default to the shadow's offset

            if (this.shapeMorpher) {
                const morphProgress = this.shapeMorpher.getProgress();
                const _currentShape = this.shapeMorpher.currentShape; // Unused - kept for future use
                const {targetShape} = this.shapeMorpher;

                // Animate shadow sliding in when morphing TO moon (and shadow.offset is not being controlled)
                if (targetShape === 'moon' && morphProgress !== undefined && morphProgress < 1 && !shadow.shadowX) {
                    // Shadow slides in from the left
                    shadowProgress = morphProgress;
                    const baseOffset = 0.7;
                    // Animate the offset - starts far left (-2) and slides to final position
                    animatedOffset = -2 + (baseOffset + 2) * shadowProgress;
                }
                // FROM MOON TO ANY SHAPE - ShapeMorpher is already controlling via shadow.offset
                // so we just use whatever offset is provided in the shadow object
            }
            // Calculate shadow offset - shadow rotates with the moon
            const angleRad = (shadow.angle || -30) * Math.PI / 180;
            const offsetX = Math.cos(angleRad) * radius * animatedOffset;
            const offsetY = Math.sin(angleRad) * radius * animatedOffset;
            
            // Enable high quality rendering
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            
            // Clip to the moon shape
            ctx.beginPath();
            if (shapePoints) {
                ctx.moveTo(shapePoints[0].x, shapePoints[0].y);
                for (let i = 1; i < shapePoints.length; i++) {
                    ctx.lineTo(shapePoints[i].x, shapePoints[i].y);
                }
                ctx.closePath();
            } else {
                ctx.arc(0, 0, radius, 0, Math.PI * 2);
            }
            ctx.clip();
            
            // Use a single smooth gradient for the entire shadow
            const shadowGradient = ctx.createRadialGradient(
                offsetX, offsetY, radius * 0.9,
                offsetX, offsetY, radius * 1.1
            );
            
            // More gradient stops for smoother transition
            // Also fade opacity based on shadowProgress for smoother appearance
            const baseCoverage = shadow.coverage !== undefined ? shadow.coverage : 0.85;
            const shadowOpacity = Math.min(1, shadowProgress * 1.2) * (baseCoverage / 0.85);
            shadowGradient.addColorStop(0, `rgba(0, 0, 0, ${1 * shadowOpacity})`);
            shadowGradient.addColorStop(0.80, `rgba(0, 0, 0, ${1 * shadowOpacity})`);
            shadowGradient.addColorStop(0.88, `rgba(0, 0, 0, ${0.98 * shadowOpacity})`);
            shadowGradient.addColorStop(0.91, `rgba(0, 0, 0, ${0.95 * shadowOpacity})`);
            shadowGradient.addColorStop(0.93, `rgba(0, 0, 0, ${0.9 * shadowOpacity})`);
            shadowGradient.addColorStop(0.95, `rgba(0, 0, 0, ${0.8 * shadowOpacity})`);
            shadowGradient.addColorStop(0.96, `rgba(0, 0, 0, ${0.65 * shadowOpacity})`);
            shadowGradient.addColorStop(0.97, `rgba(0, 0, 0, ${0.45 * shadowOpacity})`);
            shadowGradient.addColorStop(0.98, `rgba(0, 0, 0, ${0.25 * shadowOpacity})`);
            shadowGradient.addColorStop(0.99, `rgba(0, 0, 0, ${0.1 * shadowOpacity})`);
            shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.fillStyle = shadowGradient;
            ctx.beginPath();
            // Always use a circular shadow - crescent effect only works with circles
            ctx.arc(offsetX, offsetY, radius * 1.1, 0, Math.PI * 2);
            ctx.fill();
            
        } else if (shadow.type === 'lunar') {
            // Lunar eclipse - diffuse reddish shadow
            const diffusion = shadow.diffusion !== undefined ? shadow.diffusion : 1;
            const sharpness = 1 - diffusion;
            
            // Get morph progress to animate the shadow sliding in for solar
            let shadowOffsetX = 0;
            let shadowOffsetY = 0;
            
            if (this.shapeMorpher) {
                const morphProgress = this.shapeMorpher.getProgress();
                const {currentShape} = this.shapeMorpher;
                const {targetShape} = this.shapeMorpher;
                
                // Don't skip animation for moon-solar transitions anymore
                
                // Animate shadow sliding in when morphing TO solar (for solar overlay)
                if (isSolarOverlay && targetShape === 'solar' && morphProgress !== undefined && morphProgress < 1) {
                    // Shadow slides in from bottom-left
                    const slideDistance = radius * 2.5;
                    // Start from bottom-left, move to center
                    shadowOffsetX = -slideDistance * (1 - morphProgress);
                    shadowOffsetY = slideDistance * (1 - morphProgress);
                }
                // Animate shadow sliding out when morphing FROM solar
                else if (isSolarOverlay && currentShape === 'solar' && targetShape !== 'solar' && targetShape !== null && morphProgress !== undefined && morphProgress < 1) {
                    // Shadow slides out to top-right
                    const slideDistance = radius * 2.5;
                    // Move from center to top-right
                    shadowOffsetX = slideDistance * morphProgress;
                    shadowOffsetY = -slideDistance * morphProgress;
                }
            }
            
            // Apply translation for shadow animation
            ctx.translate(shadowOffsetX, shadowOffsetY);
            
            // For solar overlay, clip to the sun's core area only (not the corona)
            if (isSolarOverlay) {
                // Clip to a circle at the shadow's position that only covers the core
                ctx.save();
                ctx.beginPath();
                // Create a clipping region that's the intersection of the sun and the shadow
                ctx.arc(-shadowOffsetX, -shadowOffsetY, radius, 0, Math.PI * 2); // Sun position (inverse of shadow offset)
                ctx.clip();
            } else {
                // Regular lunar clipping
                ctx.beginPath();
                ctx.arc(0, 0, radius, 0, Math.PI * 2);
                ctx.clip();
            }
            
            // Penumbra (diffuse outer shadow) - MUCH DARKER
            const penumbraRadius = radius * (1.8 - sharpness * 0.5);
            const penumbraGradient = ctx.createRadialGradient(
                0, 0, radius * 0.2,
                0, 0, penumbraRadius
            );
            
            const baseOpacity = shadow.coverage || 0.9;
            
            // Use custom color if specified (for solar eclipse), otherwise use default lunar red
            if (shadow.color && shadow.color.includes('0, 0, 0')) {
                // Black shadow for solar eclipse
                penumbraGradient.addColorStop(0, `rgba(0, 0, 0, ${baseOpacity})`);
                penumbraGradient.addColorStop(0.3 + sharpness * 0.2, `rgba(0, 0, 0, ${baseOpacity * 0.95})`);
                penumbraGradient.addColorStop(0.6 + sharpness * 0.2, `rgba(0, 0, 0, ${baseOpacity * 0.8})`);
                penumbraGradient.addColorStop(0.85, `rgba(0, 0, 0, ${baseOpacity * 0.4})`);
                penumbraGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            } else {
                // Default reddish lunar eclipse colors
                penumbraGradient.addColorStop(0, `rgba(10, 2, 0, ${baseOpacity})`);
                penumbraGradient.addColorStop(0.3 + sharpness * 0.2, `rgba(20, 5, 0, ${baseOpacity * 0.95})`);
                penumbraGradient.addColorStop(0.6 + sharpness * 0.2, `rgba(40, 10, 5, ${baseOpacity * 0.8})`);
                penumbraGradient.addColorStop(0.85, `rgba(60, 15, 10, ${baseOpacity * 0.4})`);
                penumbraGradient.addColorStop(1, 'rgba(80, 20, 15, 0)');
            }
            
            ctx.fillStyle = penumbraGradient;
            ctx.beginPath();
            ctx.arc(0, 0, penumbraRadius, 0, Math.PI * 2);
            ctx.fill();
            
            // Umbra (sharp inner shadow) - only when sharp
            if (sharpness > 0.3) {
                const umbraRadius = radius * (0.8 + sharpness * 0.3);
                const umbraGradient = ctx.createRadialGradient(
                    0, 0, 0,
                    0, 0, umbraRadius
                );
                
                // Use black for solar eclipse, reddish for lunar
                if (shadow.color && shadow.color.includes('0, 0, 0')) {
                    umbraGradient.addColorStop(0, `rgba(0, 0, 0, ${baseOpacity})`);
                    umbraGradient.addColorStop(0.5, `rgba(0, 0, 0, ${baseOpacity * 0.9})`);
                    umbraGradient.addColorStop(0.8, `rgba(0, 0, 0, ${baseOpacity * 0.5})`);
                    umbraGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                } else {
                    umbraGradient.addColorStop(0, `rgba(0, 0, 0, ${baseOpacity})`);
                    umbraGradient.addColorStop(0.5, `rgba(10, 2, 0, ${baseOpacity * 0.9})`);
                    umbraGradient.addColorStop(0.8, `rgba(20, 5, 0, ${baseOpacity * 0.5})`);
                    umbraGradient.addColorStop(1, 'rgba(30, 8, 5, 0)');
                }
                
                ctx.fillStyle = umbraGradient;
                ctx.beginPath();
                ctx.arc(0, 0, umbraRadius, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Restore extra save for solar overlay clipping
        if (isSolarOverlay) {
            ctx.restore();
        }
        
        ctx.restore();
    }
    
    /**
     * Render zen meditation core with arc shape
     */
    renderZenCore(x, y, radius) {
        this.ctx.save();
        
        // Apply shake offset if in awakening phase
        if (this.state.shakeOffset) {
            x += this.state.shakeOffset;
        }
        
        // Apply drift Y if in awakening phase
        if (this.state.driftY) {
            y += this.state.driftY;
        }
        
        this.ctx.translate(x, y);
        
        // Apply gesture rotation if present (for spin gesture)
        if (this.gestureTransform && this.gestureTransform.rotation !== undefined) {
            this.ctx.rotate(this.gestureTransform.rotation * Math.PI / 180);
        }
        
        // Calculate zen energy pulsation (slow breathing effect)
        const time = Date.now() / 1000; // Time in seconds
        const basePulse = Math.sin(time * 0.5) * 0.5 + 1.5; // Base pulsation
        
        // Scale glow intensity based on transition phase
        // Very dim during bloom/retract, bright when fully in zen
        let glowIntensity = 0.1; // Start very dim
        if (this.zenTransition.phase === 'in') {
            // Full brightness when fully in zen
            glowIntensity = 1.0;
        } else if (this.zenTransition.phase === 'entering') {
            // Gradually brighten only after lotus is mostly formed
            glowIntensity = Math.max(0.1, (this.zenTransition.lotusMorph - 0.7) * 3.3); // Stay dim until 70% bloomed
        } else if (this.zenTransition.phase === 'exiting') {
            // Quickly dim when exiting
            glowIntensity = Math.max(0.1, this.zenTransition.lotusMorph * 0.5);
        }
        const zenPulse = basePulse * glowIntensity; // Apply intensity scaling
        
        // Apply glow when lotus is morphing or fully formed
        if (this.zenTransition.lotusMorph > 0) {
            // Single smooth shadow glow 
            this.ctx.shadowBlur = this.scaleValue(100) * zenPulse;
            this.ctx.shadowColor = `rgba(255, 223, 0, ${0.5 * zenPulse})`;
            
            // INNER RADIANCE GRADIENT - Much darker during transitions
            const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 4);
            
            // During transitions, use much darker colors to see lotus
            if (this.zenTransition.phase !== 'in') {
                // Dark golden during transition - lotus will show as even darker cutout
                gradient.addColorStop(0, `rgba(184, 134, 11, ${0.8})`); // Dark goldenrod core
                gradient.addColorStop(0.3, `rgba(153, 101, 21, ${0.6})`); // Darker gold
                gradient.addColorStop(0.6, `rgba(139, 69, 19, ${0.4})`); // Saddle brown
                gradient.addColorStop(1, 'rgba(101, 67, 33, 0)'); // Dark brown edge
            } else {
                // Full brightness only when fully in zen
                gradient.addColorStop(0, `rgba(255, 255, 255, ${1.0 * zenPulse})`); // Pure white core
                gradient.addColorStop(0.1, `rgba(255, 255, 240, ${1.0 * zenPulse})`); // Bright cream
                gradient.addColorStop(0.2, `rgba(255, 250, 205, ${0.95 * zenPulse})`); // Warm light
                gradient.addColorStop(0.35, `rgba(255, 240, 150, ${0.85 * zenPulse})`); // Bright gold
                gradient.addColorStop(0.5, `rgba(255, 223, 0, ${0.7 * zenPulse})`); // Vibrant gold
                gradient.addColorStop(0.65, `rgba(255, 215, 0, ${0.5 * zenPulse})`); // Fading gold
                gradient.addColorStop(0.8, `rgba(255, 215, 0, ${0.3 * zenPulse})`); // Softer edge
                gradient.addColorStop(0.9, `rgba(255, 215, 0, ${0.15 * zenPulse})`); // Very soft
                gradient.addColorStop(0.95, `rgba(255, 215, 0, ${0.05 * zenPulse})`); // Almost gone
                gradient.addColorStop(1, 'rgba(255, 215, 0, 0)'); // Fully transparent edge
            }
            
            this.ctx.fillStyle = gradient;
            this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.3})`; // Dimmer edge during transition
            this.ctx.lineWidth = this.scaleValue(2);
            
            // STEP 1: Draw a circle with lotus cutout using evenodd fill rule
            this.ctx.beginPath();
            
            // Draw outer circle (clockwise)
            this.ctx.arc(0, 0, radius, 0, Math.PI * 2, false);
            
            // CLEAN LOTUS SILHOUETTE - matching reference image
            const _lotusSize = radius * 0.95; // Lotus fills nearly ALL of the orb (unused - kept for future use)
            
            // MORPHING LOTUS PETALS - animated based on lotusMorph value
            const morph = this.zenTransition.lotusMorph;
            const spread = this.zenTransition.petalSpread;
            const smile = this.zenTransition.smileCurve;
            
            // Center/Top petal - morphs from small circle to full petal
            // Only draw lotus if morph is significant (avoid tiny artifacts)
            if (morph > 0.1) {
                const centerPetalBase = radius * (0.05 + 0.15 * morph);
                this.ctx.moveTo(0, centerPetalBase); // Start at base center
                this.ctx.bezierCurveTo(
                    -radius * (0.05 + 0.25 * morph * spread), radius * 0.1,    // Left control
                    -radius * (0.05 + 0.3 * morph * spread), -radius * (0.1 + 0.4 * morph),  // Left control up
                    0, -radius * (0.2 + 0.65 * morph)                // Top point
                );
                this.ctx.bezierCurveTo(
                    radius * (0.05 + 0.3 * morph * spread), -radius * (0.1 + 0.4 * morph),   // Right control up
                    radius * (0.05 + 0.25 * morph * spread), radius * 0.1,     // Right control
                    0, centerPetalBase                 // Back to base
                );
                
                if (morph > 0.3) { // Only show side petals after some morphing
                    const sidePetalAlpha = (morph - 0.3) / 0.7; // Fade in from 30% to 100%
                
                    // Left petal - fades in and spreads
                    this.ctx.moveTo(-radius * 0.1 * sidePetalAlpha, radius * 0.2); 
                    this.ctx.bezierCurveTo(
                        -radius * (0.1 + 0.4 * sidePetalAlpha * spread), radius * 0.1,    
                        -radius * (0.2 + 0.5 * sidePetalAlpha * spread), -radius * (0.1 + 0.2 * sidePetalAlpha),   
                        -radius * (0.1 + 0.4 * sidePetalAlpha * spread), -radius * (0.2 + 0.45 * sidePetalAlpha)   
                    );
                    this.ctx.bezierCurveTo(
                        -radius * (0.05 + 0.15 * sidePetalAlpha), -radius * (0.1 + 0.4 * sidePetalAlpha),   
                        -radius * 0.05 * sidePetalAlpha, radius * 0.1,   
                        -radius * 0.1 * sidePetalAlpha, radius * 0.2     
                    );
                
                    // Right petal - fades in and spreads
                    this.ctx.moveTo(radius * 0.1 * sidePetalAlpha, radius * 0.2); 
                    this.ctx.bezierCurveTo(
                        radius * (0.1 + 0.4 * sidePetalAlpha * spread), radius * 0.1,     
                        radius * (0.2 + 0.5 * sidePetalAlpha * spread), -radius * (0.1 + 0.2 * sidePetalAlpha),    
                        radius * (0.1 + 0.4 * sidePetalAlpha * spread), -radius * (0.2 + 0.45 * sidePetalAlpha)    
                    );
                    this.ctx.bezierCurveTo(
                        radius * (0.05 + 0.15 * sidePetalAlpha), -radius * (0.1 + 0.4 * sidePetalAlpha),    
                        radius * 0.05 * sidePetalAlpha, radius * 0.1,    
                        radius * 0.1 * sidePetalAlpha, radius * 0.2      
                    );
                }
            
                // Bottom smile - morphs from straight to curved smile
                if (smile > 0) {
                    const _smileDepth = radius * 0.2 * smile; // How deep the smile curves (unused - kept for future use)
                    this.ctx.moveTo(-radius * 0.6, radius * (0.5 - 0.1 * smile));   // Corners rise with smile
                    this.ctx.quadraticCurveTo(
                        0, radius * (0.5 + 0.1 * smile),     // Center dips for smile
                        radius * 0.6, radius * (0.5 - 0.1 * smile)  // Right corner rises
                    );
                }
            }
            
            this.ctx.closePath();
            
            // Fill with gradient using evenodd rule to create the lotus cutout
            this.ctx.fill('evenodd');
            // Don't stroke the lotus cutout, only the outer circle
            this.ctx.beginPath();
            this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
            this.ctx.stroke();
            
            // Only add additional glow layers when fully in zen, not during transitions
            if (this.zenTransition.phase === 'in') {
                // Additional EXPANSIVE glow layers for inner radiance
                // Layer 1: BRILLIANT lotus core intensifier - from lower quarter
                const lotusRadius = radius * 2.0; // Larger radius for more expansion
                const arcHeight = this.zenTransition.arcHeight * radius; // Get arc height from transition state
                const glowOriginY = radius * 0.5; // Lower quarter origin
                const lotusGlow = this.ctx.createRadialGradient(0, glowOriginY, 0, 0, glowOriginY, lotusRadius * 1.2);
                lotusGlow.addColorStop(0, `rgba(255, 255, 255, ${1.0 * zenPulse})`);
                lotusGlow.addColorStop(0.25, `rgba(255, 252, 240, ${0.8 * zenPulse})`);
                lotusGlow.addColorStop(0.5, `rgba(255, 245, 200, ${0.6 * zenPulse})`);
                lotusGlow.addColorStop(0.75, `rgba(255, 235, 150, ${0.4 * zenPulse})`);
                lotusGlow.addColorStop(1, 'rgba(255, 223, 0, 0)');
                this.ctx.fillStyle = lotusGlow;
                this.ctx.fill();
                
                // Layer 2: GAUSSIAN outer halo for smooth falloff
                const outerHalo = this.ctx.createRadialGradient(0, -arcHeight/2, radius * 0.5, 0, -arcHeight/2, radius * 5);
                outerHalo.addColorStop(0, 'rgba(255, 223, 0, 0)');
                outerHalo.addColorStop(0.1, `rgba(255, 223, 0, ${0.25 * zenPulse})`);
                outerHalo.addColorStop(0.2, `rgba(255, 220, 0, ${0.2 * zenPulse})`);
                outerHalo.addColorStop(0.35, `rgba(255, 215, 0, ${0.15 * zenPulse})`);
                outerHalo.addColorStop(0.5, `rgba(255, 215, 0, ${0.1 * zenPulse})`);
                outerHalo.addColorStop(0.65, `rgba(255, 215, 0, ${0.06 * zenPulse})`);
                outerHalo.addColorStop(0.8, `rgba(255, 215, 0, ${0.03 * zenPulse})`);
                outerHalo.addColorStop(0.9, `rgba(255, 215, 0, ${0.01 * zenPulse})`);
                outerHalo.addColorStop(1, 'rgba(255, 215, 0, 0)');
                this.ctx.fillStyle = outerHalo;
                this.ctx.fill();
            }
        } else {
            // Draw horizontal line or circle during transition
            // Start with very dim golden color that brightens with lotus
            
            // No glow during transition to prevent flash
            this.ctx.shadowBlur = 0;
            this.ctx.shadowColor = 'transparent';
            
            // Use very dim golden color during transition
            const dimIntensity = 0.3; // Keep consistently dim during transition
            this.ctx.fillStyle = `rgba(255, 215, 0, ${dimIntensity})`;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Very subtle gradient during transition to see lotus clearly
            const coreGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
            coreGradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
            coreGradient.addColorStop(0.5, 'rgba(255, 250, 230, 0.1)');
            coreGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
            this.ctx.fillStyle = coreGradient;
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }
    
    /**
     * Render speaking animation rings
     */
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
     */
    renderSleepIndicator(x, y, deltaTime) {
        return this.specialEffects.renderSleepIndicator(x, y, deltaTime);
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
    applyUndertoneModifiers(undertone) {
        // Handle weighted modifier from state machine
        if (undertone && typeof undertone === 'object' && undertone.weight !== undefined) {
            const {weight} = undertone;
            
            // Apply weighted modifiers for smooth transitions
            // Use default value of 1.0 if property is undefined
            this.state.sizeMultiplier = 1.0 + ((undertone.sizeMultiplier || 1.0) - 1.0) * weight;
            this.state.jitterAmount = (undertone.jitterAmount || 0) * weight;
            this.state.episodicFlutter = weight > 0.5 ? (undertone.episodicFlutter || false) : false;
            this.state.glowRadiusMult = 1.0 + ((undertone.glowRadiusMult || 1.0) - 1.0) * weight;
            this.state.breathRateMult = 1.0 + ((undertone.breathRateMult || 1.0) - 1.0) * weight;
            this.state.breathDepthMult = 1.0 + ((undertone.breathDepthMult || 1.0) - 1.0) * weight;
            this.state.breathIrregular = weight > 0.5 ? (undertone.breathIrregular || false) : false;
            this.state.particleRateMult = 1.0;
            
            // Apply weighted glow and color effects
            this.state.glowPulse = (undertone.glowPulse || 0) * weight;
            this.state.brightnessFlicker = (undertone.brightnessFlicker || 0) * weight;
            this.state.brightnessMult = 1.0 + ((undertone.brightnessMult || 1.0) - 1.0) * weight;
            this.state.saturationMult = 1.0 + ((undertone.saturationMult || 1.0) - 1.0) * weight;
            this.state.hueShift = (undertone.hueShift || 0) * weight;
            return;
        }
        
        // String-based undertone handling
        if (!undertone || !this.undertoneModifiers[undertone]) {
            // Reset to defaults if no undertone - CLEAR ALL GLOW EFFECTS
            this.state.sizeMultiplier = 1.0;
            this.state.jitterAmount = 0;
            this.state.episodicFlutter = false;
            this.state.glowRadiusMult = 1.0;
            this.state.breathRateMult = 1.0;
            this.state.breathDepthMult = 1.0;
            this.state.breathIrregular = false;
            this.state.particleRateMult = 1.0;
            
            // Reset all glow and color effects to prevent accumulation
            this.state.glowPulse = 0;
            this.state.brightnessFlicker = 0;
            this.state.brightnessMult = 1.0;
            this.state.saturationMult = 1.0;
            this.state.hueShift = 0;
            return;
        }
        
        const modifier = this.undertoneModifiers[undertone];
        
        // Apply all modifiers directly
        this.state.sizeMultiplier = modifier.sizeMultiplier;
        this.state.jitterAmount = modifier.jitterAmount || 0;
        this.state.episodicFlutter = modifier.episodicFlutter || false;
        this.state.glowRadiusMult = modifier.glowRadiusMult;
        this.state.breathRateMult = modifier.breathRateMult;
        this.state.breathDepthMult = modifier.breathDepthMult;
        this.state.breathIrregular = modifier.breathIrregular || false;
        this.state.particleRateMult = 1.0;
        
        // Apply all glow and color effects
        this.state.glowPulse = modifier.glowPulse || 0;
        this.state.brightnessFlicker = modifier.brightnessFlicker || 0;
        this.state.brightnessMult = modifier.brightnessMult || 1.0;
        this.state.saturationMult = modifier.saturationMult || 1.0;
        this.state.hueShift = modifier.hueShift || 0;
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
     */
    updateUndertone(undertone) {
        // Clear glow cache when undertone changes (colors will change)
        if (this.state.undertone !== undertone) {
            this.glowCache.clear();
        }
        
        // Store undertone for color processing
        this.state.undertone = undertone;
        this.currentUndertone = undertone;
        
        // Get weighted undertone modifier from state machine if available
        const weightedModifier = this.stateMachine && this.stateMachine.getWeightedUndertoneModifiers ? 
            this.stateMachine.getWeightedUndertoneModifiers() : null;
        
        // Apply all undertone modifiers (visual, breathing only - no particles)
        this.applyUndertoneModifiers(weightedModifier || undertone);
        
        // Update colors with the new undertone
        if (this.state.emotion) {
            const emotionConfig = emotionCache && emotionCache.isInitialized ? 
                emotionCache.getEmotion(this.state.emotion) : getEmotion(this.state.emotion);
            if (emotionConfig) {
                const baseColor = emotionConfig.glowColor || this.config.defaultGlowColor;
                const targetColor = this.applyUndertoneToColor(baseColor, weightedModifier || undertone);
                
                // Start color transition to new undertone color (faster for responsiveness)
                this.startColorTransition(targetColor, 200); // 200ms transition
            }
        }
    }
    
    /**
     * Set emotional state
     */
    setEmotionalState(emotion, properties, undertone = null) {
        
        // Clear glow cache when emotion or undertone changes (colors will change)
        if (this.state.emotion !== emotion || this.state.undertone !== undertone) {
            this.glowCache.clear();
        }
        
        // Store undertone for color processing
        this.state.undertone = undertone;
        this.currentUndertone = undertone;
        
        // Get weighted undertone modifier from state machine if available
        const weightedModifier = this.stateMachine && this.stateMachine.getWeightedUndertoneModifiers ? 
            this.stateMachine.getWeightedUndertoneModifiers() : null;
        
        // Apply all undertone modifiers (visual, breathing, particles)
        this.applyUndertoneModifiers(weightedModifier || undertone);
        
        // Get base color and apply undertone shifts
        const baseColor = properties.glowColor || this.config.defaultGlowColor;
        
        // Get target color - for suspicion, use the dynamic color directly
        let targetColor;
        if (emotion === 'suspicion') {
            // Use the dynamic color from properties (includes threat level)
            targetColor = properties.glowColor || baseColor;
        } else {
            targetColor = this.applyUndertoneToColor(baseColor, weightedModifier || undertone);
        }
        
        // Apply intensity modifier from undertone
        const modifier = weightedModifier || (undertone ? this.undertoneModifiers[undertone] : null);
        const baseIntensity = properties.glowIntensity || 1.0;
        
        // Get the glow multiplier - check for glowRadiusMult or use default of 1.0
        let glowMult = 1.0;
        if (modifier) {
            if (weightedModifier) {
                // For weighted modifiers, check if glowRadiusMult exists
                // Check for NaN in weight calculation
                const weight = modifier.weight || 0;
                if (modifier.glowRadiusMult !== undefined && isFinite(modifier.glowRadiusMult) && isFinite(weight)) {
                    glowMult = 1.0 + (modifier.glowRadiusMult - 1.0) * weight;
                } else {
                    glowMult = 1.0;
                }
            } else {
                // For non-weighted modifiers, use glowRadiusMult if it exists
                glowMult = modifier.glowRadiusMult !== undefined ? modifier.glowRadiusMult : 1.0;
            }
        }
        
        const targetIntensity = baseIntensity * glowMult;
        
        // Determine transition duration based on emotion
        let duration = 1500; // Default 1.5s
        if (emotion === 'anger' || emotion === 'fear') {
            duration = 800; // Quick transitions for urgent emotions
        } else if (emotion === 'sadness' || emotion === 'resting') {
            duration = 2000; // Slower for calming emotions
        } else if (emotion === 'zen') {
            duration = 2000; // Zen gets special timing during lotus bloom
        }
        
        // Update emotion state BEFORE handling transitions to avoid timing issues
        const previousEmotion = this.state.emotion;
        this.state.emotion = emotion;
        
        // Handle suspicion state
        if (emotion === 'suspicion') {
            this.state.isSuspicious = true;
            // Store target squint amount, we'll animate to it
            this.state.targetSquintAmount = properties && properties.coreSquint ? properties.coreSquint : 0.4;
            if (this.state.squintAmount === undefined) {
                this.state.squintAmount = 0; // Start from no squint
            }
            this.state.lastScanTime = Date.now();
            this.state.scanPhase = 0;
        } else {
            this.state.isSuspicious = false;
            this.state.targetSquintAmount = 0;
            if (this.state.squintAmount === undefined) {
                this.state.squintAmount = 0;
            }
        }
        
        // Handle zen state transitions specially
        if (emotion === 'zen' && previousEmotion !== 'zen') {
            // Entering zen - will handle its own color transition during lotus bloom
            this.enterZenMode(targetColor, targetIntensity);
        } else if (previousEmotion === 'zen' && emotion !== 'zen') {
            // Exiting zen - will handle its own color transition during lotus close
            this.exitZenMode(emotion, targetColor, targetIntensity);
        } else {
            // Standard color transition for all other state changes
            this.startColorTransition(targetColor, targetIntensity, duration);
        }
        
        // Apply breathing with undertone modifiers
        const baseBreathRate = properties.breathRate || 1.0;
        const baseBreathDepth = properties.breathDepth || this.config.breathingDepth;
        this.state.breathRate = modifier ? baseBreathRate * modifier.breathRateMult : baseBreathRate;
        this.state.breathDepth = modifier ? baseBreathDepth * modifier.breathDepthMult : baseBreathDepth;
        
        // Jitter combines emotion jitter with undertone jitter
        this.state.coreJitter = properties.coreJitter || (modifier && modifier.jitterAmount > 0);
        this.state.emotionEyeOpenness = properties.eyeOpenness;
        this.state.emotionEyeArc = properties.eyeArc;
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
        // Direct degrees per frame, no conversion needed
        this.state.rotationSpeed = speed;
    }

    /**
     * Set manual rotation angle directly (for scratching)
     * @param {number} angle - Rotation angle in DEGREES
     */
    setRotationAngle(angle) {
        this.state.manualRotation = angle;
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
     */
    enterSleepMode() {
        this.state.sleeping = true;
        this.sleepZ = []; // Reset Z's
        this.state.eyeOpenness = 1.0; // Start with eyes open
        
        // Initialize dimming values (start at full brightness)
        this.state.sleepDimness = 1.0;
        this.state.sleepScale = 1.0;
        
        // Force end any active blink
        this.state.blinking = false;
        
        // Animate eye closing, then dimming
        this.animateEyeClose();
        
    }
    
    /**
     * Animate eye closing for sleep, then dim
     */
    animateEyeClose() {
        // Cancel any existing eye animations
        if (this.loopCallbackIds.eyeClose) {
            animationLoopManager.unregister(this.loopCallbackIds.eyeClose);
            this.loopCallbackIds.eyeClose = null;
        }
        if (this.loopCallbackIds.eyeOpen) {
            animationLoopManager.unregister(this.loopCallbackIds.eyeOpen);
            this.loopCallbackIds.eyeOpen = null;
        }
        
        const startTime = performance.now();
        const eyeCloseDuration = 2000; // 2 seconds to close eyes
        const dimDuration = 1000; // 1 second to dim after eyes close
        
        const animate = () => {
            if (!this.state.sleeping) {
                // Clean up loop callback ID
                this.loopCallbackIds.eyeClose = null;
                return; // Stop if woken up
            }
            
            const elapsed = performance.now() - startTime;
            
            if (elapsed < eyeCloseDuration) {
                // Phase 1: Close eyes
                const progress = elapsed / eyeCloseDuration;
                const eased = 1 - Math.pow(progress, 2);
                this.state.eyeOpenness = 0.1 + eased * 0.9; // Close to 0.1 (nearly closed)
                
                // Keep full brightness during eye closing
                this.state.sleepDimness = 1.0;
                this.state.sleepScale = 1.0;
                
                // Continue animation on next frame
            } else if (elapsed < eyeCloseDuration + dimDuration) {
                // Phase 2: Dim the orb
                const dimProgress = (elapsed - eyeCloseDuration) / dimDuration;
                const dimEased = 1 - Math.pow(1 - dimProgress, 3); // Ease out cubic
                
                // Keep eyes closed
                this.state.eyeOpenness = 0.1;
                
                // Animate dimming and scaling
                this.state.sleepDimness = 1.0 - (dimEased * 0.4); // Dim to 0.6
                this.state.sleepScale = 1.0 - (dimEased * 0.1); // Scale to 0.9
                
                // Continue animation on next frame
            } else {
                // Final state
                this.state.eyeOpenness = 0.1;
                this.state.sleepDimness = 0.6;
                this.state.sleepScale = 0.9;
                // Clean up loop callback ID
                this.loopCallbackIds.eyeClose = null;
            }
        };

        // Register with AnimationLoopManager
        this.loopCallbackIds.eyeClose = animationLoopManager.register(
            animate,
            AnimationPriority.HIGH, // Eye animations are high priority
            this
        );
    }
    
    /**
     * Wake up from sleep with animation
     */
    wakeUp() {
        if (!this.state.sleeping) return;
        
        this.state.sleeping = false;
        this.state.breathRate = 1.0;
        this.state.breathDepth = this.config.breathingDepth;
        this.sleepZ = []; // Clear Z's
        
        // Reset blinking state
        this.state.blinking = false;
        // Blinking now handled by EyeRenderer
        this.eyeRenderer.blinking = false;
        this.eyeRenderer.blinkTimer = 0;
        
        // Animate eye opening
        this.animateEyeOpen();

        // Clear any existing jitter timeout
        if (this.wakeJitterTimeout) {
            clearTimeout(this.wakeJitterTimeout);
        }

        // Quick shake animation
        this.state.coreJitter = true;
        this.wakeJitterTimeout = setTimeout(() => {
            this.state.coreJitter = false;
            this.wakeJitterTimeout = null;
        }, 200);
        
    }
    
    /**
     * Animate eye opening after wake - brighten first, then open eyes
     */
    animateEyeOpen() {
        // Cancel any existing eye animations
        if (this.loopCallbackIds.eyeOpen) {
            animationLoopManager.unregister(this.loopCallbackIds.eyeOpen);
            this.loopCallbackIds.eyeOpen = null;
        }
        if (this.loopCallbackIds.eyeClose) {
            animationLoopManager.unregister(this.loopCallbackIds.eyeClose);
            this.loopCallbackIds.eyeClose = null;
        }
        
        const startTime = performance.now();
        const brightenDuration = 500; // 0.5 seconds to brighten
        const eyeOpenDuration = 1000; // 1 second to open eyes
        
        const animate = () => {
            const elapsed = performance.now() - startTime;
            
            if (elapsed < brightenDuration) {
                // Phase 1: Brighten the orb
                const progress = elapsed / brightenDuration;
                const eased = Math.sin(progress * Math.PI / 2); // Smooth acceleration
                
                // Animate brightening and scaling back
                this.state.sleepDimness = 0.6 + (eased * 0.4); // Brighten from 0.6 to 1.0
                this.state.sleepScale = 0.9 + (eased * 0.1); // Scale from 0.9 to 1.0
                
                // Keep eyes closed during brightening
                this.state.eyeOpenness = 0.1;
                
                // Continue animation on next frame
            } else if (elapsed < brightenDuration + eyeOpenDuration) {
                // Phase 2: Open eyes
                const eyeProgress = (elapsed - brightenDuration) / eyeOpenDuration;
                const eyeEased = Math.sin(eyeProgress * Math.PI / 2); // Smooth acceleration
                
                // Keep full brightness
                this.state.sleepDimness = 1.0;
                this.state.sleepScale = 1.0;
                
                // Animate eye opening
                this.state.eyeOpenness = 0.1 + eyeEased * 0.9; // Open from 0.1 to 1.0
                
                // Continue animation on next frame
            } else {
                // Final state
                this.state.eyeOpenness = 1.0;
                this.state.sleepDimness = 1.0;
                this.state.sleepScale = 1.0;
                // Clean up loop callback ID
                this.loopCallbackIds.eyeOpen = null;
            }
        };

        // Register with AnimationLoopManager
        this.loopCallbackIds.eyeOpen = animationLoopManager.register(
            animate,
            AnimationPriority.HIGH, // Eye animations are high priority
            this
        );
    }
    
    /**
     * Enter zen meditation mode with animation
     */
    enterZenMode(targetColor, targetIntensity) {
        // Cancel any existing zen animations
        if (this.animationFrameIds.zenEnter) {
            cancelAnimationFrame(this.animationFrameIds.zenEnter);
            this.animationFrameIds.zenEnter = null;
        }
        if (this.animationFrameIds.zenExit) {
            cancelAnimationFrame(this.animationFrameIds.zenExit);
            this.animationFrameIds.zenExit = null;
        }
        
        // Set to zen color with target intensity
        this.state.glowColor = targetColor;
        this.state.glowIntensity = targetIntensity; // Keep the glow
        
        // Cancel any active color transition
        this.colorTransition.active = false;
        
        this.zenTransition = {
            active: true,
            phase: 'entering',
            startTime: performance.now(),
            previousEmotion: this.state.emotion,
            targetEmotion: null,
            scaleX: 1.0,
            scaleY: 1.0,
            arcHeight: 0,
            lotusMorph: 0,     // 0 = no lotus, 1 = full lotus
            petalSpread: 0,    // 0 = closed petals, 1 = full spread
            smileCurve: 0      // 0 = no smile, 1 = full smile
        };
        
        const animate = () => {
            if (!this.zenTransition.active || this.zenTransition.phase !== 'entering') {
                // Clean up loop callback ID
                this.loopCallbackIds.zenEnter = null;
                return;
            }
            
            const elapsed = performance.now() - this.zenTransition.startTime;
            const lotusMorphDuration = 400; // 0.4s for lotus to bloom - smooth transition
            
            if (elapsed < lotusMorphDuration) {
                // Direct lotus blooming - no intro animation
                const lotusProgress = elapsed / lotusMorphDuration;
                const lotusEased = 1 - Math.pow(1 - lotusProgress, 2); // Ease out quad
                
                // Direct lotus bloom without arc or narrowing
                this.zenTransition.scaleX = 1.0;
                this.zenTransition.scaleY = 1.0;  // Full size
                this.zenTransition.arcHeight = 0;  // No arc
                
                // Morph the lotus shape directly
                this.zenTransition.lotusMorph = lotusEased; // 0 to 100%
                this.zenTransition.petalSpread = lotusEased;
                
                // Smile appears gradually
                this.zenTransition.smileCurve = Math.sin(lotusProgress * Math.PI / 2); // Smooth ease
                
                // Register with AnimationLoopManager
                this.loopCallbackIds.zenEnter = animationLoopManager.register(
                    animate,
                    AnimationPriority.MEDIUM, // Zen animations are medium priority
                    this
                );
            } else {
                // Final state - in meditation with full lotus, then start floating
                this.zenTransition.phase = 'in';
                this.zenTransition.scaleX = 1.0;
                this.zenTransition.scaleY = 1.0;  // Full size
                this.zenTransition.arcHeight = 0;  // No arc
                this.zenTransition.lotusMorph = 1.0;
                this.zenTransition.petalSpread = 1.0;
                this.zenTransition.smileCurve = 1.0;
                
                // Set gentle vortex for zen state
                this.state.zenVortexIntensity = 1.0;  // Can be adjusted: 0.5 = very gentle, 2.0 = strong
                // Clean up loop callback ID
                this.loopCallbackIds.zenEnter = null;
            }
        };
        
        // Register with AnimationLoopManager
        this.loopCallbackIds.zenEnter = animationLoopManager.register(
            animate,
            AnimationPriority.MEDIUM, // Zen animations are medium priority
            this
        );
    }
    
    /**
     * Exit zen meditation mode with awakening animation
     */
    exitZenMode(targetEmotion, targetColor, targetIntensity) {
        if (!this.zenTransition.active || this.zenTransition.phase !== 'in') return;
        
        // Cancel any existing zen animations
        if (this.animationFrameIds.zenEnter) {
            cancelAnimationFrame(this.animationFrameIds.zenEnter);
            this.animationFrameIds.zenEnter = null;
        }
        if (this.animationFrameIds.zenExit) {
            cancelAnimationFrame(this.animationFrameIds.zenExit);
            this.animationFrameIds.zenExit = null;
        }
        
        this.zenTransition.phase = 'exiting';
        this.zenTransition.startTime = performance.now();
        this.zenTransition.targetEmotion = targetEmotion;
        
        const animate = () => {
            if (!this.zenTransition.active || this.zenTransition.phase !== 'exiting') {
                // Clean up loop callback ID
                this.loopCallbackIds.zenExit = null;
                return;
            }
            
            const elapsed = performance.now() - this.zenTransition.startTime;
            const straightenDuration = 150; // 0.15s to straighten arc - FAST
            const awakeDuration = 200; // 0.2s for awakening gestures - FAST
            const expandDuration = 200; // 0.2s to expand back - FAST
            const settleDuration = 100; // 0.1s for final settle - FAST
            
            if (elapsed < straightenDuration) {
                // Phase 1: Lotus closing and arc straightening - start color transition
                const progress = elapsed / straightenDuration;
                const eased = 1 - Math.pow(1 - progress, 2);
                
                // Start color transition at beginning of exit
                if (progress === 0 || !this.colorTransition.active) {
                    this.startColorTransition(targetColor, targetIntensity, straightenDuration);
                }
                
                this.zenTransition.arcHeight = 1.5 * (1 - eased); // Flatten arc from full height
                
                // Close lotus petals quickly
                this.zenTransition.smileCurve = 1.0 * (1 - eased); // Smile fades first
                if (progress > 0.3) {
                    const petalProgress = (progress - 0.3) / 0.7;
                    this.zenTransition.petalSpread = 1.0 * (1 - petalProgress); // Petals close
                }
                if (progress > 0.5) {
                    const morphProgress = (progress - 0.5) / 0.5;
                    this.zenTransition.lotusMorph = 1.0 * (1 - morphProgress); // Lotus disappears
                }
                
                // Register with AnimationLoopManager
                this.loopCallbackIds.zenExit = animationLoopManager.register(
                    animate,
                    AnimationPriority.MEDIUM, // Zen animations are medium priority
                    this
                );
            } else if (elapsed < straightenDuration + awakeDuration) {
                // Phase 2: Awakening gestures
                const awakeProgress = (elapsed - straightenDuration) / awakeDuration;
                
                // Lotus is fully closed by now
                this.zenTransition.lotusMorph = 0;
                this.zenTransition.petalSpread = 0;
                this.zenTransition.smileCurve = 0;
                
                // Slow blink (0-0.3)
                if (awakeProgress < 0.2) {
                    const blinkProg = awakeProgress / 0.2;
                    this.zenTransition.scaleY = 1.0 - (Math.sin(blinkProg * Math.PI) * 0.8);
                }
                // Gentle shake (0.3-0.6)
                else if (awakeProgress < 0.6) {
                    const shakeProg = (awakeProgress - 0.2) / 0.4;
                    this.zenTransition.scaleY = 1.0;
                    // Add small X offset for shake (will be applied in render)
                    this.state.shakeOffset = Math.sin(shakeProg * Math.PI * 4) * 3;
                }
                // Upward drift with brighten (0.6-1.0)
                else {
                    const driftProg = (awakeProgress - 0.6) / 0.4;
                    this.state.driftY = -10 * driftProg;
                    this.state.glowIntensity = 1.0 + (0.5 * driftProg); // Brighten
                }
                
                // Register with AnimationLoopManager
                this.loopCallbackIds.zenExit = animationLoopManager.register(
                    animate,
                    AnimationPriority.MEDIUM, // Zen animations are medium priority
                    this
                );
            } else if (elapsed < straightenDuration + awakeDuration + expandDuration) {
                // Phase 3: Horizontal expansion (sunrise)
                const expandProgress = (elapsed - straightenDuration - awakeDuration) / expandDuration;
                const expandEased = Math.sin(expandProgress * Math.PI / 2);
                
                this.zenTransition.scaleX = 1.0;
                this.zenTransition.scaleY = 0.2 + (expandEased * 0.8); // Expand vertically back to 1.0 (sunrise)
                this.state.driftY = -10 * (1 - expandProgress); // Return to center
                this.state.glowIntensity = 1.5 - (0.5 * expandProgress); // Normal glow
                
                // Register with AnimationLoopManager
                this.loopCallbackIds.zenExit = animationLoopManager.register(
                    animate,
                    AnimationPriority.MEDIUM, // Zen animations are medium priority
                    this
                );
            } else if (elapsed < straightenDuration + awakeDuration + expandDuration + settleDuration) {
                // Phase 4: Final settle pulse
                const settleProgress = (elapsed - straightenDuration - awakeDuration - expandDuration) / settleDuration;
                const pulse = Math.sin(settleProgress * Math.PI);
                
                this.zenTransition.scaleX = 1.0 + (pulse * 0.05);
                this.zenTransition.scaleY = 1.0 + (pulse * 0.05);
                
                // Register with AnimationLoopManager
                this.loopCallbackIds.zenExit = animationLoopManager.register(
                    animate,
                    AnimationPriority.MEDIUM, // Zen animations are medium priority
                    this
                );
            } else {
                // Complete - reset to normal
                this.zenTransition.active = false;
                this.zenTransition.phase = null;
                this.zenTransition.scaleX = 1.0;
                this.zenTransition.scaleY = 1.0;
                this.zenTransition.arcHeight = 0;
                this.zenTransition.lotusMorph = 0;
                this.zenTransition.petalSpread = 0;
                this.zenTransition.smileCurve = 0;
                this.state.shakeOffset = 0;
                this.state.driftY = 0;
                // Clean up loop callback ID
                this.loopCallbackIds.zenExit = null;
            }
        };
        
        // Register with AnimationLoopManager
        this.loopCallbackIds.zenExit = animationLoopManager.register(
            animate,
            AnimationPriority.MEDIUM, // Zen animations are medium priority
            this
        );
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
        this.state.gazeTrackingEnabled = enabled;
        if (enabled) {
            // Start tracking mouse/touch position
            if (!this.gazeTrackingInitialized) {
                this.initGazeTracking();
            }
        } else {
            // Reset gaze to center when disabled
            this.state.gazeTarget = { x: 0, y: 0 };
        }
    }

    /**
     * Initialize gaze tracking event listeners
     */
    initGazeTracking() {
        // Always set up listeners once
        if (this.gazeTrackingInitialized) return;

        this.handleMouseMove = e => {
            if (!this.state.gazeTrackingEnabled) return;

            const rect = this.canvas.getBoundingClientRect();
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const x = e.clientX - rect.left - centerX;
            const y = e.clientY - rect.top - centerY;

            // Normalize to -1 to 1 range
            this.state.gazeTarget = {
                x: x / centerX,
                y: y / centerY
            };
        };

        this.handleTouchMove = e => {
            if (!this.state.gazeTrackingEnabled) return;

            if (e.touches.length > 0) {
                const touch = e.touches[0];
                const rect = this.canvas.getBoundingClientRect();
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const x = touch.clientX - rect.left - centerX;
                const y = touch.clientY - rect.top - centerY;

                // Normalize to -1 to 1 range
                this.state.gazeTarget = {
                    x: x / centerX,
                    y: y / centerY
                };
            }
        };

        document.addEventListener('mousemove', this.handleMouseMove);
        document.addEventListener('touchmove', this.handleTouchMove);
        this.gazeTrackingInitialized = true;
    }

    /**
     * Clean up gaze tracking event listeners
     */
    cleanupGazeTracking() {
        if (!this.gazeTrackingInitialized) return;

        if (this.handleMouseMove) {
            document.removeEventListener('mousemove', this.handleMouseMove);
        }
        if (this.handleTouchMove) {
            document.removeEventListener('touchmove', this.handleTouchMove);
        }
        this.gazeTrackingInitialized = false;
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
    
    // Individual start methods for each gesture - delegate to GestureAnimator
    startBounce() { this.gestureAnimator.startBounce(); }
    startPulse() { this.gestureAnimator.startPulse(); }
    startShake() { this.gestureAnimator.startShake(); }
    startSpin() { this.gestureAnimator.startSpin(); }
    startNod() { this.gestureAnimator.startNod(); }
    startTilt() { this.gestureAnimator.startTilt(); }
    startExpand() { this.gestureAnimator.startExpand(); }
    startContract() { this.gestureAnimator.startContract(); }
    startFlash() { this.gestureAnimator.startFlash(); }
    startDrift() { this.gestureAnimator.startDrift(); }
    startStretch() { this.gestureAnimator.startStretch(); }
    startGlow() { this.gestureAnimator.startGlow(); }
    startFlicker() { this.gestureAnimator.startFlicker(); }
    startVibrate() { this.gestureAnimator.startVibrate(); }
    startOrbital() { this.gestureAnimator.startOrbital(); }
    startHula() { this.gestureAnimator.startHula(); }
    startWave() { this.gestureAnimator.startWave(); }
    startBreathe() { this.gestureAnimator.startBreathe(); }
    startMorph() { this.gestureAnimator.startMorph(); }
    startSlowBlink() { this.gestureAnimator.startSlowBlink(); }
    startLook() { this.gestureAnimator.startLook(); }
    startSettle() { this.gestureAnimator.startSettle(); }
    startBreathIn() { this.gestureAnimator.startBreathIn(); }
    startBreathOut() { this.gestureAnimator.startBreathOut(); }
    startBreathHold() { this.gestureAnimator.startBreathHold(); }
    startBreathHoldEmpty() { this.gestureAnimator.startBreathHoldEmpty(); }
    startJump() { this.gestureAnimator.startJump(); }
    startSway() { this.gestureAnimator.startSway(); }
    startFloat() { this.gestureAnimator.startFloat(); }
    startRain() { this.gestureAnimator.startRain(); }
    startRunningMan() { this.gestureAnimator.startRunningMan(); }
    startCharleston() { this.gestureAnimator.startCharleston(); }

    // Ambient dance animations
    startGrooveSway(options) { this.ambientDanceAnimator.startAmbientAnimation('grooveSway', options); }
    startGrooveBob(options) { this.ambientDanceAnimator.startAmbientAnimation('grooveBob', options); }
    startGrooveFlow(options) { this.ambientDanceAnimator.startAmbientAnimation('grooveFlow', options); }
    startGroovePulse(options) { this.ambientDanceAnimator.startAmbientAnimation('groovePulse', options); }
    startGrooveStep(options) { this.ambientDanceAnimator.startAmbientAnimation('grooveStep', options); }
    startSparkle() { this.gestureAnimator.startSparkle(); }
    startShimmer() { this.gestureAnimator.startShimmer(); }
    startWiggle() { this.gestureAnimator.startWiggle(); }
    startGroove() { this.gestureAnimator.startGroove(); }
    startPoint() { this.gestureAnimator.startPoint(); }
    startLean() { this.gestureAnimator.startLean(); }
    startReach() { this.gestureAnimator.startReach(); }
    startHeadBob() { this.gestureAnimator.startHeadBob(); }
    startOrbit() { this.gestureAnimator.startOrbit(); }
    
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