/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Shape Morphing System
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Musical shape morphing system using modular shapes
 * @author Emotive Engine Team
 * @module core/ShapeMorpher
 */

import { MusicalDuration } from './MusicalDuration.js';
import { rhythmEngine } from './rhythm.js';
import { SHAPE_DEFINITIONS } from './shapes/shapeDefinitions.js';

// Import modular components
import { AudioDeformer } from './morpher/AudioDeformer.js';
import { MusicDetector } from './morpher/MusicDetector.js';
import { TransitionManager } from './morpher/TransitionManager.js';

/**
 * ShapeMorpher class - manages smooth transitions between shapes
 */
class ShapeMorpher {
    constructor(options = {}) {
        // Configuration
        this.numPoints = options.numPoints || 64;
        this.morphDuration = options.morphDuration || 1000; // Default 1 second
        this.easing = options.easing || 'easeInOutCubic';
        
        // Initialize modular components
        this.transitionManager = new TransitionManager(this);
        this.audioDeformer = new AudioDeformer(this);
        this.musicDetector = new MusicDetector();
        
        // State - delegated to TransitionManager
        this.currentShape = 'circle';
        this.targetShape = null;
        this.morphProgress = 0;
        this.visualProgress = 0; // Smoothed visual progress for rendering
        this.morphStartTime = null;
        this.isTransitioning = false;
        
        // Shape data cache
        this.shapeCache = new Map();
        this.currentPoints = [];
        this.targetPoints = [];
        
        // Musical timing
        this.musicalDuration = null;
        this.onBeat = false;
        
        // Audio deformation with throttling - delegated to AudioDeformer
        this.audioDeformation = 0;
        this.vocalEnergy = 0;
        this.lastAudioUpdate = 0;
        this.lastVocalUpdate = 0;  // Separate timestamp for vocal updates
        this.audioUpdateInterval = 33; // Update at ~30fps max
        
        // Enhanced audio visualization
        this.audioAnalyzer = null; // Reference to audio analyzer for frequency data
        this.frequencyData = new Array(32).fill(0); // Store frequency bands
        this.glitchPoints = []; // Track points that are glitching
        this.undulationPhase = 0; // Phase for wave animation
        this.undulationDirection = 1; // Random direction for bass wobble
        this.beatGlitchIntensity = 0; // Intensity of beat-triggered glitches
        
        // Frequency-specific energy tracking
        this.bassEnergy = 0; // Low frequency energy (20-250 Hz)
        this.vocalPresence = 0; // Mid frequency energy (250-4000 Hz)
        
        // Rolling averages for dynamic thresholds
        this.bassHistory = new Array(60).fill(0); // 2 seconds at 30fps
        this.vocalHistory = new Array(60).fill(0);
        this.historyIndex = 0;
        
        // Cooldown timers to prevent effect spam
        this.bassEffectCooldown = 0;
        this.vocalEffectCooldown = 0;
        
        // Threshold multipliers (can be adjusted for mic vs audio)
        this.bassThresholdMultiplier = 1.2;  // Lowered from 1.8 for testing
        this.vocalThresholdMultiplier = 1.1;  // Even lower for more frequent vocal triggers
        
        // Effect states
        this.bassEffectActive = false;
        this.vocalEffectActive = false;
        
        // Transient detection
        this.transientHoldTime = 0;
        this.vocalGlowBoost = 0;
        
        // Callbacks
        this.onComplete = null;
        this.onProgress = null;
        
        // Morph queue
        this.queuedMorph = null;
        
        // Initialize with circle shape
        this.currentPoints = this.getShapePoints('circle');
        this.shapesLoaded = true; // Static definitions are always loaded
        
        // Pre-warm the shape cache to prevent first-run choppiness
        this.prewarmCache();
    }
    
    /**
     * Pre-warm the shape cache to prevent first-run lag
     */
    prewarmCache() {
        // Pre-generate all common shapes
        const commonShapes = [
            'circle', 'heart', 'star', 'sun', 'moon', 
            'lunar', 'square', 'triangle'
        ];
        
        commonShapes.forEach(shape => {
            if (SHAPE_DEFINITIONS[shape]) {
                // Generate and cache the points
                this.getShapePoints(shape);
            }
        });
        
        // Also pre-calculate some common easing values
        const testProgress = [0, 0.25, 0.5, 0.75, 1];
        testProgress.forEach(t => {
            this.applyEasing(t); // Warm up easing calculations
        });
    }
    
    /**
     * Get shape points from cache or generate
     */
    getShapePoints(shapeName) {
        if (!this.shapeCache.has(shapeName)) {
            const shapeDef = SHAPE_DEFINITIONS[shapeName];
            if (!shapeDef || !shapeDef.points) {
                console.warn(`Shape ${shapeName} not found, using circle`);
                const circlePoints = SHAPE_DEFINITIONS.circle.points;
                this.shapeCache.set(shapeName, circlePoints);
                return circlePoints;
            }
            // Clone the points array to avoid mutations
            const points = shapeDef.points.map(p => ({ ...p }));
            this.shapeCache.set(shapeName, points);
            return points;
        }
        return this.shapeCache.get(shapeName);
    }
    
    /**
     * Start morphing to a new shape
     * @param {string} targetShape - Target shape name
     * @param {Object} options - Morph options
     */
    morphTo(targetShape, options = {}) {
        if (!this.shapesLoaded) {
            console.warn('ShapeMorpher: Shapes not loaded yet');
            return;
        }
        
        if (targetShape === this.currentShape && !this.isTransitioning) {
            return; // Already at target shape
        }
        
        // Handle queueing or forcing
        if (this.isTransitioning && !options.force) {
            // Queue this morph for after current one completes
            this.queuedMorph = { targetShape, options };
            return 'queued'; // Return status so caller knows it was queued
        } else if (this.isTransitioning && options.force) {
            // Force interrupt current morph
            this.completeMorph(true); // Skip to end without processing queue
        }
        
        // Get transition configuration
        const transitionConfig = this.getTransitionConfig(this.currentShape, targetShape);
        
        // Set up transition
        this.targetShape = targetShape;
        this.targetPoints = this.getShapePoints(targetShape);
        this.morphStartTime = Date.now();
        this.isTransitioning = true;
        this.morphProgress = 0;
        this.visualProgress = 0; // Reset visual progress
        
        // Configure timing - use transition config duration if available
        if (options.duration === 'bar' || options.duration === 'beat') {
            // Musical timing
            this.musicalDuration = new MusicalDuration();
            const musicalConfig = {
                musical: true,
                [options.duration === 'bar' ? 'bars' : 'beats']: 1
            };
            this.morphDuration = this.musicalDuration.toMilliseconds(musicalConfig);
            this.onBeat = true;
        } else {
            // Fixed duration - prefer transition config duration
            this.morphDuration = transitionConfig?.duration || options.duration || 1000;
            this.musicalDuration = null;
            this.onBeat = false;
        }
        
        // Store options
        this.morphMode = options.mode || 'smooth';
        this.transitionConfig = transitionConfig;
        
        // Callbacks
        this.onComplete = options.onComplete;
        this.onProgress = options.onProgress;
        
    }
    
    /**
     * Update morph animation
     * @param {number} deltaTime - Time since last update (can be from RAF timestamp)
     */
    update(deltaTime) {
        if (!this.isTransitioning || !this.targetShape) return;
        
        // Calculate progress based on total elapsed time
        const currentTime = Date.now();
        const elapsed = currentTime - this.morphStartTime;
        let progress = Math.min(elapsed / this.morphDuration, 1);
        
        // Apply musical quantization if needed
        if (this.musicalDuration && this.onBeat) {
            const bpm = rhythmEngine.bpm || 120;
            
            // Adaptive granularity - use coarser quantization at higher BPMs
            let subdivision;
            if (bpm > 140) {
                subdivision = 2; // 8th notes for fast tempos
            } else if (bpm > 100) {
                subdivision = 4; // 16th notes for medium tempos  
            } else {
                subdivision = 8; // 32nd notes for slow tempos
            }
            
            // Quantize to nearest subdivision
            const beatDuration = 60000 / bpm;
            const totalBeats = this.morphDuration / beatDuration;
            const currentBeat = progress * totalBeats;
            const quantizedBeat = Math.round(currentBeat * subdivision) / subdivision;
            const quantizedProgress = Math.min(1, quantizedBeat / totalBeats);
            
            // BPM-based strength - weaker quantization at extremes (very slow or very fast)
            const bpmFactor = bpm < 90 ? 
                Math.max(0.3, (bpm - 60) / 30) :  // 0.3 at 60bpm, 1.0 at 90bpm (weaker for slow)
                Math.max(0.4, Math.min(1, 1 - ((bpm - 90) / 90))); // 1.0 at 90bpm, 0.4 at 180bpm (weaker for fast)
            const baseStrength = 0.3 + (bpmFactor * 0.5); // Range: 0.3 to 0.8 based on BPM
            
            // Phase-aware quantization - weaker at start/end, stronger in middle
            const phaseMultiplier = Math.sin(progress * Math.PI); // 0 at edges, 1 at center
            const quantizationStrength = baseStrength * (0.3 + phaseMultiplier * 0.7); // Further modulated by phase
            
            // Apply smoothed quantization with cubic interpolation (smoothstep)
            const t = quantizationStrength;
            const cubicT = t * t * (3 - 2 * t); // Smoothstep for S-curve blending
            progress = progress + (quantizedProgress - progress) * cubicT;
        }
        
        // Apply easing
        this.morphProgress = this.applyEasing(progress);
        
        // Smooth visual progress for ultra-smooth rendering
        // Heavy smoothing: 80% of previous frame, 20% of new
        this.visualProgress = this.visualProgress * 0.8 + this.morphProgress * 0.2;
        
        // Snap to final value when very close to avoid infinite approach
        if (Math.abs(this.visualProgress - this.morphProgress) < 0.001) {
            this.visualProgress = this.morphProgress;
        }
        
        // Notify progress
        if (this.onProgress) {
            this.onProgress(this.morphProgress);
        }
        
        // Check if complete (use logical progress, not visual)
        if (this.morphProgress >= 1) {
            this.visualProgress = 1; // Ensure visual completes too
            this.completeMorph();
        }
    }
    
    /**
     * Complete the morph transition
     * @param {boolean} skipQueue - Skip processing queued morphs (for force override)
     */
    completeMorph(skipQueue = false) {
        this.currentShape = this.targetShape;
        this.currentPoints = [...this.targetPoints];
        this.targetShape = null;
        this.isTransitioning = false;
        this.morphProgress = 0;
        this.visualProgress = 0; // Reset visual progress
        
        if (this.onComplete) {
            this.onComplete(this.currentShape);
        }
        
        // Process queued morph if exists and not skipping
        if (!skipQueue && this.queuedMorph) {
            const queued = this.queuedMorph;
            this.queuedMorph = null; // Clear queue before morphing
            
            // Small delay to ensure smooth transition
            setTimeout(() => {
                this.morphTo(queued.targetShape, queued.options);
            }, 50);
        }
    }
    
    /**
     * Check if there's a queued morph
     * @returns {boolean} True if morph is queued
     */
    hasQueuedMorph() {
        return this.queuedMorph !== null;
    }
    
    /**
     * Clear the morph queue
     */
    clearQueue() {
        this.queuedMorph = null;
    }
    
    /**
     * Get shape points in canvas coordinates
     * @param {number} centerX - Center X coordinate
     * @param {number} centerY - Center Y coordinate  
     * @param {number} radius - Shape radius
     * @returns {Array} Points in canvas coordinates
     */
    getCanvasPoints(centerX, centerY, radius) {
        let normalizedPoints;
        
        try {
            normalizedPoints = this.getInterpolatedPoints();
        } catch (e) {
            console.error('Error getting interpolated points:', e);
            normalizedPoints = this.generateFallbackCircle();
        }
        
        const canvasPoints = [];
        
        // Handle case where points aren't loaded yet
        if (!normalizedPoints || normalizedPoints.length === 0) {
            // Return fallback circle points
            for (let i = 0; i < this.numPoints; i++) {
                const angle = (i / this.numPoints) * Math.PI * 2;
                canvasPoints.push({
                    x: centerX + Math.cos(angle) * radius,
                    y: centerY + Math.sin(angle) * radius
                });
            }
            return canvasPoints;
        }
        
        // Ensure we're working with an array
        const pointsArray = Array.isArray(normalizedPoints) ? normalizedPoints : [];
        
        for (let i = 0; i < pointsArray.length; i++) {
            const point = pointsArray[i];
            if (!point || typeof point.x !== 'number' || typeof point.y !== 'number') {
                // Add fallback point
                const angle = (i / pointsArray.length) * Math.PI * 2;
                canvasPoints.push({
                    x: centerX + Math.cos(angle) * radius,
                    y: centerY + Math.sin(angle) * radius
                });
            } else {
                // Convert normalized (0-1) to canvas coordinates
                const x = centerX + (point.x - 0.5) * radius * 2;
                const y = centerY + (point.y - 0.5) * radius * 2;
                canvasPoints.push({ x, y });
            }
        }
        
        // Ensure we have enough points
        while (canvasPoints.length < this.numPoints) {
            const i = canvasPoints.length;
            const angle = (i / this.numPoints) * Math.PI * 2;
            canvasPoints.push({
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius
            });
        }
        
        return canvasPoints;
    }
    
    /**
     * Get interpolated shape points
     * @returns {Array} Current interpolated points
     */
    getInterpolatedPoints() {
        // Ensure we always have points
        if (!this.currentPoints || this.currentPoints.length === 0) {
            this.currentPoints = this.generateFallbackCircle();
        }
        
        if (!this.isTransitioning) {
            return this.applyAudioDeformation(this.currentPoints);
        }
        
        const points = [];
        for (let i = 0; i < this.numPoints; i++) {
            const current = this.currentPoints[i];
            const target = this.targetPoints[i];
            
            // Handle missing points
            if (!current || !target) {
                console.warn(`Missing point at index ${i}`);
                const angle = (i / this.numPoints) * Math.PI * 2;
                points.push({
                    x: 0.5 + Math.cos(angle) * 0.5,
                    y: 0.5 + Math.sin(angle) * 0.5
                });
                continue;
            }
            
            // Interpolate based on mode - use visualProgress for smooth rendering
            const progress = this.visualProgress;
            let x, y;
            if (this.morphMode === 'spiral') {
                // Spiral interpolation
                const angle = progress * Math.PI * 2;
                const spiral = Math.sin(angle + i * 0.2) * 0.02 * (1 - Math.abs(progress - 0.5) * 2);
                x = current.x + (target.x - current.x) * progress + spiral;
                y = current.y + (target.y - current.y) * progress + spiral;
            } else if (this.morphMode === 'wave') {
                // Wave interpolation
                const wave = Math.sin(i * 0.3 + progress * Math.PI * 4) * 0.01;
                x = current.x + (target.x - current.x) * progress + wave;
                y = current.y + (target.y - current.y) * progress + wave;
            } else {
                // Smooth interpolation
                x = current.x + (target.x - current.x) * progress;
                y = current.y + (target.y - current.y) * progress;
            }
            
            points.push({ x, y });
        }
        
        return this.applyAudioDeformation(points);
    }
    
    /**
     * Apply audio-reactive deformation to points
     */
    applyAudioDeformation(points) {
        // Validate points
        if (!points || points.length === 0) {
            return this.generateFallbackCircle();
        }
        
        // Get fresh frequency data if analyzer is available
        if (this.audioAnalyzer && this.audioAnalyzer.currentFrequencies && this.audioAnalyzer.currentFrequencies.length > 0) {
            this.frequencyData = [...this.audioAnalyzer.currentFrequencies];
            
            // Debug: Show ALL bands to see what's happening
            if (Math.random() < 0.01) { // Log 1% of the time
                console.log('ALL BANDS:', this.frequencyData.map((v, i) => `${i}:${v.toFixed(2)}`).join(' '));
            }
            
            // We have 32 frequency bands (0-31) that cover the full spectrum
            // Approximate mapping: each band covers ~750 Hz (24000 Hz / 32 bands)
            // Band 0-1: Sub-bass
            // Band 2-4: Bass
            // Band 5-15: Midrange
            // Band 16-25: Upper mids/presence
            // Band 26-31: Treble
            
            // BASS THUMP DETECTION: Only trigger on meaty kicks
            let currentBassEnergy = 0;
            let bassCount = 0;
            
            // Focus on low bass (bands 0-2) for the real thumps
            for (let i = 0; i <= 2 && i < this.frequencyData.length; i++) {
                currentBassEnergy += this.frequencyData[i];
                bassCount++;
            }
            if (bassCount > 0) {
                currentBassEnergy /= bassCount;
            }
            
            // Initialize bass thump detection
            if (!this.bassPeakHistory) {
                this.bassPeakHistory = [];
                this.bassThumpTimer = 0;
            }
            
            // Track recent bass peaks
            this.bassPeakHistory.push(currentBassEnergy);
            if (this.bassPeakHistory.length > 20) { // ~0.6 seconds of history
                this.bassPeakHistory.shift();
            }
            
            // Calculate dynamic threshold
            const avgBass = this.bassPeakHistory.reduce((a, b) => a + b, 0) / this.bassPeakHistory.length;
            const maxBass = Math.max(...this.bassPeakHistory);
            
            // THUMP = small increase above baseline
            const isThump = currentBassEnergy > avgBass * 1.08 && // Just 8% above average
                           currentBassEnergy > 0.5; // Lower threshold
            
            if (isThump) {
                this.bassEnergy = Math.min(1.0, (currentBassEnergy - avgBass) * 5); // Stronger effect
                this.bassThumpTimer = 12; // Shorter hold (12 frames ~0.4 seconds)
                
                // Debug log
                if (Math.random() < 0.2) {
                    console.log(`🔊 BASS THUMP! Energy: ${currentBassEnergy.toFixed(2)}, Avg: ${avgBass.toFixed(2)}`);
                }
            } else if (this.bassThumpTimer > 0) {
                this.bassThumpTimer--;
                this.bassEnergy *= 0.9; // Slower decay for smooth wobble
            } else {
                this.bassEnergy = 0;
            }
            
            // VOCAL PRESENCE DETECTION: 2-4 kHz range where vocals cut through
            // With FFT 2048 and 48kHz sample rate:
            // - 1024 bins cover 0-24kHz
            // - Each bin = ~23.4 Hz
            // - 32 bands get 32 bins each (1024/32)
            // - Each band = ~750 Hz
            
            // Band mapping (LINEAR):
            // Band 2: 1500-2250 Hz
            // Band 3: 2250-3000 Hz  } Vocal presence range
            // Band 4: 3000-3750 Hz
            // Band 5: 3750-4500 Hz
            
            let vocalPresenceEnergy = 0;
            let vocalBandCount = 0;
            
            // SPECTRAL FLUX: Detect onsets in the VOCAL RANGE you identified (bands 4-15, emphasis on 11)
            // This targets the actual vocal/lead frequencies in Electric Glow
            
            // Initialize spectral history if needed
            if (!this.spectralHistory) {
                this.spectralHistory = [];
                this.spectralFluxHistory = [];
                // Music detection initialization
                this.onsetThreshold = 0;
                this.musicDetector.reset();
                this.detectedBPM = 0;
                
                // Time signature detection
                this.onsetStrengths = []; // Array of {time: ms, strength: 0-1, bassWeight: 0-1}
                this.detectedTimeSignature = null;
                this.timeSignatureConfidence = 0;
                this.measureStartTime = 0;
                this.timeSignatureHistory = [];
                this.timeSignatureLocked = false;
            }
            
            // Store current spectrum
            const currentSpectrum = [...this.frequencyData];
            
            // SIMPLER APPROACH: Look for changes in vocal bands with bass rejection
            let spectralFlux = 0;
            let bassFlux = 0;
            
            if (this.spectralHistory.length > 0) {
                const prevSpectrum = this.spectralHistory[this.spectralHistory.length - 1];
                
                // Calculate bass flux (bands 0-2)
                for (let i = 0; i <= 2 && i < currentSpectrum.length; i++) {
                    const diff = currentSpectrum[i] - prevSpectrum[i];
                    if (diff > 0) bassFlux += diff;
                }
                
                // Calculate flux in extended vocal range (bands 4-15)
                // But weight the center (9-13) more heavily
                for (let i = 4; i <= 15 && i < currentSpectrum.length; i++) {
                    const diff = currentSpectrum[i] - prevSpectrum[i];
                    if (diff > 0) {
                        // Extra weight for bands 9-13
                        const weight = (i >= 9 && i <= 13) ? 2.0 : 1.0;
                        spectralFlux += diff * weight;
                    }
                }
                
                // Suppress if there's a strong bass hit (likely a drum)
                if (bassFlux > 0.15) {
                    spectralFlux *= 0.3; // Reduce by 70% for drum hits
                }
            }
            
            // Store history (keep last 30 frames for ~1 second at 30fps)
            this.spectralHistory.push(currentSpectrum);
            if (this.spectralHistory.length > 30) {
                this.spectralHistory.shift();
            }
            
            // Store flux history for adaptive thresholding
            this.spectralFluxHistory.push(spectralFlux);
            if (this.spectralFluxHistory.length > 30) {
                this.spectralFluxHistory.shift();
            }
            
            // Calculate adaptive threshold (median + margin)
            if (this.spectralFluxHistory.length >= 10) {
                const sorted = [...this.spectralFluxHistory].sort((a, b) => a - b);
                const median = sorted[Math.floor(sorted.length / 2)];
                const mean = sorted.reduce((a, b) => a + b, 0) / sorted.length;
                
                // Threshold is slightly above the median to catch significant onsets
                this.onsetThreshold = median + (mean - median) * 0.5;
            }
            
            // Detect onset (transient/attack) - focus on stronger transients for BPM
            // Use higher threshold for BPM detection vs vocal detection
            const isVocalOnset = spectralFlux > this.onsetThreshold * 1.2 && spectralFlux > 0.02;
            const isBeatOnset = spectralFlux > this.onsetThreshold * 2.0 && spectralFlux > 0.05; // Stronger threshold for beats
            
            // Smooth the detection with a short hold time
            if (isVocalOnset) {
                this.transientHoldTime = 8; // Hold for 8 frames (~250ms) for visible glitches
                this.vocalGlowBoost = 0.3; // Add 30% glow boost on vocal onset
            }
            
            // BPM DETECTION: Only track stronger onsets that are likely beats
            if (isBeatOnset) {
                const now = performance.now();
                
                // Store onset strength for time signature detection
                const onsetStrength = {
                    time: now,
                    strength: spectralFlux / (this.onsetThreshold || 1), // Normalized strength
                    bassWeight: bassFlux // Keep bass weight for downbeat detection
                };
                this.onsetStrengths.push(onsetStrength);
                // Keep last 40 onsets (about 16-20 beats)
                if (this.onsetStrengths.length > 40) {
                    this.onsetStrengths.shift();
                }
                
                // Delegate onset tracking to music detector
                this.musicDetector.addOnset(now, spectralFlux);
                
            }
            
            // Update BPM detection through music detector
            this.musicDetector.update(performance.now());
            this.detectedBPM = this.musicDetector.detectedBPM;
            this.bpmConfidence = this.musicDetector.bpmConfidence;
            
            // Update local references for compatibility
            if (this.detectedBPM > 0 && this.bpmConfidence > 0.8) {
                // Clear fast mode once we've detected BPM with confidence
                if (this.forceFastDetection) {
                    this.forceFastDetection = false;
                    console.log('✅ Fast detection complete');
                }
            }
            
            if (this.transientHoldTime > 0) {
                this.transientHoldTime--;
            }
            
            // Decay glow boost smoothly
            if (this.vocalGlowBoost > 0) {
                this.vocalGlowBoost *= 0.92; // Smooth decay
            }
            
            // Set vocal presence based on flux intensity
            this.vocalPresence = spectralFlux;
            
            // No spectral contrast needed
            const spectralContrast = 0;
            
            // Update rolling averages for smarter detection
            this.bassHistory[this.historyIndex] = this.bassEnergy;
            this.vocalHistory[this.historyIndex] = this.vocalPresence;
            this.historyIndex = (this.historyIndex + 1) % this.bassHistory.length;
            
            // Calculate averages
            const bassAvg = this.bassHistory.reduce((a, b) => a + b, 0) / this.bassHistory.length;
            const vocalAvg = this.vocalHistory.reduce((a, b) => a + b, 0) / this.vocalHistory.length;
            
            // Bass effect is now controlled by thump detection above
            this.bassEffectActive = this.bassThumpTimer > 0;
            
            // ENHANCED VOCAL DETECTION
            // Vocals are present when:
            // 1. Bands 9-13 have high contrast vs background
            // 2. Energy is above minimum threshold
            // 3. Either sudden spike OR sustained presence
            
            this.lastVocalPresence = this.lastVocalPresence || 0;
            const vocalDelta = this.vocalPresence - this.lastVocalPresence;
            this.lastVocalPresence = this.vocalPresence;
            
            // Transient detection - triggers on musical onsets
            this.vocalEffectActive = this.transientHoldTime > 0;
            
        }
        
        // If no analyzer, fallback to using audioDeformation for effects
        if (!this.audioAnalyzer || this.frequencyData.every(f => f === 0)) {
            // Simple fallback - use audioDeformation to trigger effects
            if (this.audioDeformation > 0.3) {
                this.bassEffectActive = true;
                this.bassEnergy = this.audioDeformation * 0.5;
            }
            if (this.vocalEnergy > 0.3) {
                this.vocalEffectActive = true;
                this.vocalPresence = this.vocalEnergy;
            }
        }
        
        // No deformation if no audio
        const hasAudio = this.audioDeformation !== 0 || this.bassEnergy > 0.01 || 
                        this.vocalPresence > 0.01;
        if (!hasAudio) {
            return points;
        }
        
        const deformed = [];
        const center = { x: 0.5, y: 0.5 };
        const time = Date.now() / 1000; // Time in seconds
        
        // Update undulation phase only when bass is active
        if (this.bassEffectActive) {
            // Randomly change direction occasionally
            if (Math.random() < 0.05) { // 5% chance per frame
                this.undulationDirection *= -1; // Reverse direction
            }
            this.undulationPhase += 0.08 * this.undulationDirection; // Apply direction
        }
        
        // Update glitch points on beat
        if (this.audioAnalyzer && this.beatGlitchIntensity > 0) {
            this.beatGlitchIntensity *= 0.9; // Decay glitch intensity
        }
        
        // Create SUBTLE glitch points when vocal presence is detected
        if (this.vocalEffectActive && Math.random() < 0.2) { // 20% chance (reduced)
            this.glitchPoints = [];
            const numGlitches = 2 + Math.floor(Math.random() * 2); // 2-3 points (fewer)
            for (let i = 0; i < numGlitches; i++) {
                this.glitchPoints.push({
                    index: Math.floor(Math.random() * points.length),
                    intensity: 0.02 + Math.random() * 0.03, // 0.02-0.05 intensity (much subtler)
                    decay: 0.94 + Math.random() * 0.02 // Slightly slower decay for smoothness
                });
            }
        }
        
        // Update existing glitch points
        this.glitchPoints = this.glitchPoints.filter(g => {
            g.intensity *= g.decay;
            return g.intensity > 0.01;
        });
        
        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            
            // Handle invalid point
            if (!point || typeof point.x === 'undefined' || typeof point.y === 'undefined') {
                const angle = (i / points.length) * Math.PI * 2;
                deformed.push({
                    x: 0.5 + Math.cos(angle) * 0.5,
                    y: 0.5 + Math.sin(angle) * 0.5
                });
                continue;
            }
            
            // Calculate base position
            const dx = point.x - center.x;
            const dy = point.y - center.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);
            
            // 1. Base expansion from overall amplitude - always active for responsiveness
            const baseExpansion = Math.abs(this.audioDeformation) * 0.12; // Reduced to 12%
            
            // 2. Bass-triggered wiggle effect
            let undulation = 0;
            let breathPulse = 0;
            
            if (this.bassEffectActive) {
                // Strong bass-driven undulation
                const waveCount = 2; // 2 waves for clean look
                const wiggleIntensity = this.bassEnergy * 0.25; // Increased from 0.15 to 0.25
                undulation = Math.sin(angle * waveCount + this.undulationPhase) * wiggleIntensity;
                
                // Subtle breathing pulse synced with undulation
                breathPulse = Math.sin(this.undulationPhase * 0.5) * this.bassEnergy * 0.08; // Increased from 0.05
            }
            
            // 5. Check for glitch points - SUBTLE shimmer/ripple effect
            let glitchOffset = 0;
            const glitchPoint = this.glitchPoints.find(g => g.index === i);
            if (glitchPoint) {
                // Create a subtle ripple/shimmer instead of harsh glitch
                const shimmerTime = Date.now() * 0.015; // Slower oscillation
                const shimmer = Math.sin(shimmerTime + i * 0.5) * Math.cos(shimmerTime * 0.7);
                glitchOffset = glitchPoint.intensity * shimmer * 0.5; // Can go in or out, very subtle
            }
            
            // Combine all deformations - simpler, more selective
            const totalDeformation = 1 + baseExpansion + undulation + breathPulse + glitchOffset;
            
            const newDistance = distance * Math.max(0.8, totalDeformation); // Never shrink below 80%
            
            deformed.push({
                x: center.x + Math.cos(angle) * newDistance,
                y: center.y + Math.sin(angle) * newDistance
            });
        }
        
        return deformed;
    }
    
    /**
     * Set audio deformation from analyzer with throttling
     * @param {number} value - Deformation value (-1 to 1)
     */
    setAudioDeformation(value) {
        const now = Date.now();
        if (now - this.lastAudioUpdate > this.audioUpdateInterval) {
            this.audioDeformation = Math.max(-1, Math.min(1, value));
            this.lastAudioUpdate = now;
        }
    }
    
    /**
     * Set vocal energy from analyzer with throttling
     * @param {number} value - Energy value (0 to 1)
     */
    setVocalEnergy(value) {
        const now = Date.now();
        if (now - this.lastVocalUpdate > this.audioUpdateInterval) {
            this.vocalEnergy = Math.max(0, Math.min(1, value));
            this.lastVocalUpdate = now;
        }
    }
    
    /**
     * Get transition configuration
     */
    getTransitionConfig(from, to) {
        const fromShape = SHAPE_DEFINITIONS[from];
        const toShape = SHAPE_DEFINITIONS[to];
        
        // Special transitions for moon - add a dreamy quality
        if (to === 'moon') {
            return {
                type: 'to_moon',
                easing: 'easeInOutCubic',  // Smooth acceleration/deceleration
                duration: 1500,  // Slightly longer for dramatic effect
                glowIntensity: 1.5,  // Extra glow during transition
                fadeInCrescent: true  // Fade in the crescent shadow
            };
        }
        
        
        // Moon to lunar - special eclipse transition
        if (from === 'moon' && to === 'lunar') {
            return {
                type: 'moon_to_lunar',
                easing: 'easeInOutSine',
                duration: 2000,  // Slower for dramatic effect
                slideOutCrescent: false, // Don't use standard slide
                description: 'Crescent shadow moves to center and becomes lunar eclipse'
            };
        }
        
        // All other moon transitions - shadow slides away first
        if (from === 'moon') {
            return {
                type: 'from_moon', 
                easing: 'easeInOutCubic',
                duration: 1000,
                slideOutCrescent: true,  // Shadow ALWAYS slides away
                shadowSlideRatio: 0.4,   // First 40% for shadow slide
                description: 'Moon shadow slides away THEN morphs to target'
            };
        }
        
        
        // Other shapes to lunar - morph to circle first, then eclipse comes in
        if (to === 'lunar') {
            return {
                type: 'eclipse_enter_lunar',
                startAngle: -30  // Eclipse enters from top-left like moon crescent
            };
        }
        
        // Lunar to moon - special case: shadow exits to crescent position and stays
        if (from === 'lunar' && to === 'moon') {
            return {
                type: 'lunar_to_moon',
                exitAngle: -30
            };
        }
        
        // Lunar to other shapes - eclipse exits first, then morph to target shape
        if (from === 'lunar') {
            return {
                type: 'eclipse_exit_lunar',
                exitAngle: -30  // Eclipse exits at same angle
            };
        }
        
        // Special eclipse transitions for other shapes
        if (fromShape?.shadow?.type === 'none' && toShape?.shadow?.type === 'solar') {
            return {
                type: 'eclipse_enter',
                direction: 'right'
            };
        }
        
        if (fromShape?.shadow?.type === 'solar' && toShape?.shadow?.type === 'none') {
            return {
                type: 'eclipse_exit',
                direction: 'left'
            };
        }
        
        // Sun transitions need effect fading/blooming
        if (from === 'sun' && to !== 'sun') {
            return {
                type: 'sun_fade',
                fadeEffects: true
            };
        }
        
        if (from !== 'sun' && to === 'sun') {
            return {
                type: 'sun_bloom',
                bloomEffects: true
            };
        }
        
        return {
            type: 'standard'
        };
    }
    
    /**
     * Get current shadow configuration
     * @returns {Object} Shadow configuration
     */
    getCurrentShadow() {
        const currentDef = SHAPE_DEFINITIONS[this.currentShape];
        const targetDef = this.targetShape ? SHAPE_DEFINITIONS[this.targetShape] : null;
        
        const currentShadow = currentDef?.shadow || { type: 'none' };
        const targetShadow = targetDef?.shadow || null;
        
        // If not transitioning, return current shadow
        if (!this.isTransitioning || !targetShadow) {
            return currentShadow;
        }
        
        // Handle eclipse progressions and other special transitions
        const easedProgress = this.morphProgress;
        
        
        // FROM MOON - ALWAYS slide shadow away first (other shapes)
        if (this.transitionConfig && this.transitionConfig.type === 'from_moon' && this.transitionConfig.slideOutCrescent) {
            const slideRatio = this.transitionConfig.shadowSlideRatio || 0.4;
            
            // PHASE 1: Shadow slides away
            if (easedProgress < slideRatio) {
                const slideProgress = easedProgress / slideRatio; // 0 to 1 during slide
                const angle = -30 * Math.PI / 180; // Moon shadow angle (bottom-left)
                
                // Shadow continues sliding in its direction (away to bottom-left)
                const startOffset = 0.7;  // Where moon shadow normally sits
                const endOffset = 2.5;    // Far off screen
                const currentOffset = startOffset + (endOffset - startOffset) * slideProgress;
                
                const offsetX = Math.cos(angle) * currentOffset;
                const offsetY = Math.sin(angle) * currentOffset;
                
                // Keep full opacity while sliding, slight fade at the end
                const coverage = slideProgress > 0.8 ? 0.85 * (1 - (slideProgress - 0.8) * 5) : 0.85;
                
                return {
                    type: 'crescent',
                    coverage: coverage,
                    angle: -30,
                    offset: currentOffset,
                    shadowX: offsetX,
                    shadowY: offsetY
                };
            }
            
            // PHASE 2: No shadow, morph can proceed
            return { type: 'none' };
        }
        
        // Moon to lunar - smooth crescent to eclipse transition
        if (this.transitionConfig && this.transitionConfig.type === 'moon_to_lunar') {
            const angle = this.transitionConfig.startAngle * Math.PI / 180;
            const offsetProgress = 1 - easedProgress; // Goes from 1 to 0 (crescent position to center)
            const offsetX = Math.cos(angle) * 0.7 * offsetProgress;
            const offsetY = Math.sin(angle) * 0.7 * offsetProgress;
            
            // Smooth transition from crescent to lunar
            const lunarBlend = Math.pow(easedProgress, 2); // Quadratic for smooth blend
            
            // Gradually change from crescent to lunar shadow
            if (easedProgress < 0.6) {
                // Still mostly crescent, moving to center
                return {
                    type: 'crescent',
                    coverage: 0.85 * (1 - lunarBlend * 0.2), // Slight fade
                    angle: this.transitionConfig.startAngle,
                    offset: 0.7 * offsetProgress,
                    shadowX: offsetX,
                    shadowY: offsetY
                };
            } else {
                // Smooth blend to lunar shadow
                const blendPhase = (easedProgress - 0.6) / 0.4; // 0 to 1 for last 40%
                const smoothBlend = Math.sin(blendPhase * Math.PI / 2); // Smooth S-curve
                
                return {
                    type: 'lunar',
                    coverage: 0.85 + 0.1 * smoothBlend, // Gradually increase to 0.95
                    color: `rgba(80, 20, 0, ${0.7 + 0.2 * smoothBlend})`, // Fade in red
                    shadowX: offsetX * (1 - smoothBlend), // Smooth center
                    shadowY: offsetY * (1 - smoothBlend),
                    diffusion: smoothBlend,
                    shadowProgress: easedProgress
                };
            }
        }
        
        // Eclipse entering lunar - smooth shadow entry
        if (this.transitionConfig && this.transitionConfig.type === 'eclipse_enter_lunar') {
            // First 30%: Just morph shape, no shadow (reduced from 40%)
            if (easedProgress < 0.3) {
                return { type: 'none' };
            }
            
            // Last 70%: Shadow smoothly enters and transforms
            const shadowProgress = (easedProgress - 0.3) / 0.7; // 0 to 1 for shadow animation
            const smoothProgress = Math.sin(shadowProgress * Math.PI / 2); // Smooth ease-in
            const angle = this.transitionConfig.startAngle * Math.PI / 180;
            const offsetProgress = 1 - smoothProgress; // Goes from 1 to 0
            const offsetX = Math.cos(angle) * 0.7 * offsetProgress;
            const offsetY = Math.sin(angle) * 0.7 * offsetProgress;
            
            // Smooth transition throughout
            if (shadowProgress < 0.7) {
                // Crescent shadow sliding in with gradual fade
                const fadeIn = Math.pow(shadowProgress / 0.7, 0.5); // Smooth fade in
                return {
                    type: 'crescent',
                    coverage: 0.85 * fadeIn,
                    angle: this.transitionConfig.startAngle,
                    offset: 0.7 * offsetProgress,
                    shadowX: offsetX,
                    shadowY: offsetY
                };
            } else {
                // Smooth blend to lunar
                const blendProgress = (shadowProgress - 0.7) / 0.3; // Last 30% for blend
                const smoothBlend = Math.sin(blendProgress * Math.PI / 2); // Smooth curve
                
                return {
                    type: 'lunar',
                    coverage: 0.85 + 0.1 * smoothBlend,
                    color: `rgba(80, 20, 0, ${0.6 + 0.3 * smoothBlend})`,
                    shadowX: offsetX * (1 - smoothBlend),
                    shadowY: offsetY * (1 - smoothBlend),
                    diffusion: smoothBlend,
                    shadowProgress: shadowProgress
                };
            }
        }
        
        // Lunar to moon - smooth shadow transformation and movement
        if (this.transitionConfig && this.transitionConfig.type === 'lunar_to_moon') {
            const angle = this.transitionConfig.exitAngle * Math.PI / 180;
            
            // Smooth movement curve
            const movementCurve = Math.sin(easedProgress * Math.PI / 2); // Smooth ease-out
            const offsetX = Math.cos(angle) * 0.7 * movementCurve;
            const offsetY = Math.sin(angle) * 0.7 * movementCurve;
            
            // Smooth blend between lunar and crescent
            if (easedProgress < 0.6) {
                // Lunar shadow gradually transforming
                const transformPhase = easedProgress / 0.6;
                const smoothTransform = Math.pow(transformPhase, 0.7);
                
                return {
                    type: 'lunar',
                    coverage: 0.95 - (0.1 * smoothTransform),
                    color: `rgba(80, 20, 0, ${0.9 - 0.3 * smoothTransform})`,
                    shadowX: offsetX * 0.7, // Start moving earlier
                    shadowY: offsetY * 0.7,
                    diffusion: 1 - smoothTransform
                };
            } else {
                // Smooth transition to crescent
                const crescentPhase = (easedProgress - 0.6) / 0.4;
                const fadeIn = Math.sin(crescentPhase * Math.PI / 2);
                
                return {
                    type: 'crescent',
                    coverage: 0.85 * fadeIn + 0.1, // Smooth fade in
                    angle: this.transitionConfig.exitAngle,
                    offset: 0.7,
                    shadowX: offsetX,
                    shadowY: offsetY
                };
            }
        }
        
        // Eclipse exiting lunar - smooth shadow exit
        if (this.transitionConfig && this.transitionConfig.type === 'eclipse_exit_lunar') {
            // First 70%: Shadow smoothly exits
            if (easedProgress < 0.7) {
                const shadowProgress = easedProgress / 0.7; // 0 to 1 for shadow exit
                const smoothExit = Math.sin(shadowProgress * Math.PI / 2); // Smooth acceleration
                const angle = this.transitionConfig.exitAngle * Math.PI / 180;
                
                // Gradual transformation and movement
                if (shadowProgress < 0.4) {
                    // Lunar shadow gradually transforming
                    const transformPhase = shadowProgress / 0.4;
                    const diffusion = 1 - transformPhase;
                    const moveStart = transformPhase * 0.3; // Start moving early
                    
                    return {
                        type: 'lunar',
                        coverage: 0.95 - (0.1 * transformPhase),
                        color: `rgba(80, 20, 0, ${0.9 - 0.2 * transformPhase})`,
                        shadowX: Math.cos(angle) * 0.7 * moveStart,
                        shadowY: Math.sin(angle) * 0.7 * moveStart,
                        diffusion: diffusion
                    };
                } else {
                    // Smooth exit as crescent
                    const exitPhase = (shadowProgress - 0.4) / 0.6;
                    const smoothMove = Math.pow(exitPhase, 0.8);
                    const offsetX = Math.cos(angle) * 0.7 * smoothMove;
                    const offsetY = Math.sin(angle) * 0.7 * smoothMove;
                    const fadeOut = 1 - Math.pow(exitPhase, 2); // Gradual fade
                    
                    return {
                        type: 'crescent',
                        coverage: 0.85 * fadeOut,
                        angle: this.transitionConfig.exitAngle,
                        offset: 0.7 * smoothMove,
                        shadowX: offsetX,
                        shadowY: offsetY
                    };
                }
            }
            
            // Last 30%: Just morph shape, no shadow
            return { type: 'none' };
        }
        
        // Solar eclipse transitions
        if (this.transitionConfig && this.transitionConfig.type === 'eclipse_enter') {
            const shadowX = 1.5 - (easedProgress * 1.5); // From right
            
            return {
                ...targetShadow,
                shadowX: shadowX,
                shadowProgress: easedProgress
            };
        } else if (this.transitionConfig.type === 'eclipse_exit') {
            const shadowX = -easedProgress * 1.5; // To left
            
            return {
                ...currentShadow,
                coverage: currentShadow.coverage * (1 - easedProgress),
                shadowX: shadowX,
                shadowProgress: 1 - easedProgress
            };
        } else if (this.transitionConfig.type === 'sun_fade') {
            // Smooth fading of sun effects
            const fadeMultiplier = 1 - easedProgress;
            
            // Gradual fade with different timing for each effect
            return {
                ...currentShadow,
                intensity: (currentShadow.intensity || 1) * Math.pow(fadeMultiplier, 0.7), // Slower fade
                corona: currentShadow.corona,
                coronaOpacity: fadeMultiplier, // Fade corona smoothly
                flares: currentShadow.flares,
                flaresOpacity: Math.pow(fadeMultiplier, 1.5), // Flares fade faster
                texture: currentShadow.texture,
                textureOpacity: Math.pow(fadeMultiplier, 2), // Texture fades fastest
                turbulence: (currentShadow.turbulence || 0.3) * fadeMultiplier
            };
        } else if (this.transitionConfig.type === 'sun_bloom') {
            // Smooth blooming of sun effects
            const bloomProgress = easedProgress;
            
            // Gradual bloom with different timing for each effect
            return {
                ...targetShadow,
                intensity: (targetShadow.intensity || 1) * Math.pow(bloomProgress, 1.5), // Start slow
                corona: targetShadow.corona,
                coronaOpacity: Math.pow(bloomProgress, 0.8), // Corona blooms gradually
                flares: targetShadow.flares,
                flaresOpacity: bloomProgress > 0.3 ? Math.pow((bloomProgress - 0.3) / 0.7, 0.7) : 0, // Flares appear later
                texture: targetShadow.texture,
                textureOpacity: bloomProgress > 0.5 ? Math.pow((bloomProgress - 0.5) / 0.5, 2) : 0, // Texture appears last
                turbulence: (targetShadow.turbulence || 0.3) * bloomProgress
            };
        }
        
        // Standard transition
        if (currentShadow.type !== 'none' || targetShadow.type !== 'none') {
            const coverage = (currentShadow.coverage || 0) + 
                           ((targetShadow.coverage || 0) - (currentShadow.coverage || 0)) * easedProgress;
            
            return {
                type: targetShadow.type !== 'none' ? targetShadow.type : currentShadow.type,
                coverage: coverage,
                angle: targetShadow.angle || currentShadow.angle || 0,
                softness: targetShadow.softness || currentShadow.softness || 0.2,
                progress: easedProgress
            };
        }
        
        return currentShadow;
    }
    
    /**
     * Get custom renderer for current shape
     * @returns {Function|null} Custom render function
     */
    getCurrentRenderer() {
        // For now, return null - rendering is handled by EmotiveRenderer
        // This can be extended later if we want shape-specific rendering
        return null;
    }
    
    /**
     * Apply easing function
     */
    applyEasing(t) {
        const easing = this.transitionConfig?.easing || this.easing || 'linear';
        switch (easing) {
            case 'linear':
                return t;
            case 'easeInQuad':
                return t * t;
            case 'easeOutQuad':
                return t * (2 - t);
            case 'easeInOutQuad':
                return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            case 'easeInOutSine':
                return -(Math.cos(Math.PI * t) - 1) / 2;
            case 'easeInOutCubic':
            default:
                return t < 0.5 
                    ? 4 * t * t * t 
                    : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }
    }
    
    /**
     * Calculate BPM from onset intervals with improved stability
     */
    calculateBPM() {
        return this.musicDetector.calculateBPM();
    }
    
    /**
     * Find tempo candidates from onset intervals
     */
    findTempoCandidates(intervals) {
        return this.musicDetector.findTempoCandidates(intervals);
    }
    
    /**
     * Cluster similar intervals together
     */
    clusterIntervals(intervals) {
        return this.musicDetector.clusterIntervals(intervals);
    }
    
    /**
     * Check if BPM is a harmonic of the fundamental
     */
    checkHarmonicRelation(bpm1, bpm2) {
        return this.musicDetector.checkHarmonicRelation(bpm1, bpm2);
    }
    
    /**
     * Detect time signature from onset patterns
     */
    detectTimeSignature() {
        // Need at least a detected BPM and some onset data
        const minOnsets = this.forceFastDetection ? 6 : 12;
        if (this.detectedBPM === 0 || this.onsetStrengths.length < minOnsets) {
            return;
        }
        
        // If already locked, don't change unless we're in fast mode (just reset)
        if (this.timeSignatureLocked && !this.forceFastDetection) {
            return;
        }
        
        const beatInterval = 60000 / this.detectedBPM;
        
        // Only test the most common measure length first (4 beats)
        // We'll be conservative and mostly detect 4/4 unless very clear pattern
        const measureLength = 4;
        const beatBins = new Array(measureLength).fill(0).map(() => ({
            strength: 0,
            bassWeight: 0,
            count: 0
        }));
        
        // Align recent onsets to a 4-beat grid
        const recentOnsets = this.onsetStrengths.slice(-Math.min(20, this.onsetStrengths.length));
        if (recentOnsets.length === 0) return;
        const startTime = recentOnsets[0].time;
        
        for (let onset of recentOnsets) {
            const timeSinceStart = onset.time - startTime;
            const beatPosition = (timeSinceStart / beatInterval) % measureLength;
            const binIndex = Math.round(beatPosition) % measureLength;
            
            beatBins[binIndex].strength += onset.strength;
            beatBins[binIndex].bassWeight += onset.bassWeight;
            beatBins[binIndex].count++;
        }
        
        // Normalize bins
        let maxStrength = 0;
        for (let bin of beatBins) {
            if (bin.count > 0) {
                bin.strength /= bin.count;
                bin.bassWeight /= bin.count;
                maxStrength = Math.max(maxStrength, bin.strength + bin.bassWeight);
            }
        }
        
        // Default to 4/4 for most music
        let detectedSig = '4/4';
        
        // Only detect 3/4 if we have a VERY clear waltz pattern
        // (strong-weak-weak with no emphasis on beat 4)
        if (beatBins[0].strength > beatBins[1].strength * 2 &&
            beatBins[0].strength > beatBins[2].strength * 2 &&
            beatBins[3].count < beatBins[0].count * 0.5) {
            // Might be 3/4, but need more confidence
            const waltzConfidence = this.testWaltzPattern(recentOnsets, beatInterval);
            if (waltzConfidence > 0.8) {
                detectedSig = '3/4';
            }
        }
        
        // Add to history
        this.timeSignatureHistory.push(detectedSig);
        if (this.timeSignatureHistory.length > 3) {
            this.timeSignatureHistory.shift();
        }
        
        // Lock faster - only need 2 readings in fast mode, 3 normally
        const minReadings = this.forceFastDetection ? 2 : 3;
        if (this.timeSignatureHistory.length >= minReadings) {
            const counts = {};
            for (let sig of this.timeSignatureHistory) {
                counts[sig] = (counts[sig] || 0) + 1;
            }
            
            // Find most common
            let mostCommon = '4/4';
            let maxCount = 0;
            for (let [sig, count] of Object.entries(counts)) {
                if (count > maxCount) {
                    maxCount = count;
                    mostCommon = sig;
                }
            }
            
            // Lock if we have agreement (at least 2 out of 3)
            if (maxCount >= 2) {
                this.detectedTimeSignature = mostCommon;
                this.timeSignatureLocked = true;
                this.timeSignatureConfidence = maxCount / 3;
                
                // Update rhythm engine if available
                if (window.rhythmIntegration && window.rhythmIntegration.setTimeSignature) {
                    window.rhythmIntegration.setTimeSignature(this.detectedTimeSignature);
                }
                
                console.log(`🎼 Time signature locked: ${this.detectedTimeSignature} (confidence: ${Math.round(this.timeSignatureConfidence * 100)}%)`);
                
                // Also directly update UI in case rhythmIntegration doesn't
                const timeSigDisplay = document.getElementById('time-sig-display');
                if (timeSigDisplay) {
                    timeSigDisplay.textContent = this.detectedTimeSignature;
                }
            }
        }
    }
    
    /**
     * Test specifically for 3/4 waltz pattern
     */
    testWaltzPattern(onsets, beatInterval) {
        // Look for groups of 3 beats with strong-weak-weak pattern
        let waltzGroups = 0;
        let totalGroups = 0;
        
        for (let i = 0; i < onsets.length - 2; i += 3) {
            if (i + 2 < onsets.length) {
                totalGroups++;
                const first = onsets[i].strength + onsets[i].bassWeight;
                const second = onsets[i + 1].strength + onsets[i + 1].bassWeight;
                const third = onsets[i + 2].strength + onsets[i + 2].bassWeight;
                
                // Check for strong-weak-weak pattern
                if (first > second * 1.5 && first > third * 1.5) {
                    waltzGroups++;
                }
            }
        }
        
        return totalGroups > 0 ? waltzGroups / totalGroups : 0;
    }
    
    
    /**
     * Reset music detection when new audio is loaded
     */
    resetMusicDetection() {
        // Store if we should force fast detection (for resampling)
        this.forceFastDetection = true;
        
        // Reset music detector
        this.musicDetector.reset();
        
        // Reset local references
        this.onsetThreshold = 0;
        this.detectedBPM = 0;
        this.bpmConfidence = 0;
        
        // Reset time signature detection (still local for now)
        this.onsetStrengths = [];
        this.detectedTimeSignature = null;
        this.timeSignatureConfidence = 0;
        this.measureStartTime = 0;
        this.timeSignatureHistory = [];
        this.timeSignatureLocked = false;
        
        // Reset spectral analysis
        this.spectralHistory = [];
        this.spectralFluxHistory = [];
        
        // Clear UI displays
        const timeSigDisplay = document.getElementById('time-sig-display');
        if (timeSigDisplay) {
            timeSigDisplay.textContent = '—';
        }
        
        console.log('🔄 Music detection reset - fast detection mode enabled');
    }
    
    /**
     * Get current detected BPM and time signature
     */
    getCurrentMusicInfo() {
        return {
            bpm: this.detectedBPM,
            timeSignature: this.detectedTimeSignature,
            bpmLocked: this.tempoLocked,
            timeSigLocked: this.timeSignatureLocked
        };
    }
    
    /**
     * Fallback circle generation
     */
    generateFallbackCircle() {
        const points = [];
        for (let i = 0; i < this.numPoints; i++) {
            const angle = (i / this.numPoints) * Math.PI * 2;
            points.push({
                x: 0.5 + Math.cos(angle) * 0.5,
                y: 0.5 + Math.sin(angle) * 0.5
            });
        }
        return points;
    }
    
    /**
     * Get current state
     */
    getState() {
        return {
            currentShape: this.currentShape,
            targetShape: this.targetShape,
            isTransitioning: this.isTransitioning,
            progress: this.morphProgress,
            audioDeformation: this.audioDeformation,
            vocalEnergy: this.vocalEnergy
        };
    }
    
    /**
     * Get progress (0-1)
     * @param {boolean} visual - Return smoothed visual progress instead of logical
     */
    getProgress(visual = true) {
        // Default to visual progress for smooth rendering
        return visual ? this.visualProgress : this.morphProgress;
    }
    
    /**
     * Check if currently transitioning
     */
    isInTransition() {
        return this.isTransitioning;
    }
}

export default ShapeMorpher;