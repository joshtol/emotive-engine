/**
 * PerformanceMonitor - Comprehensive performance tracking, optimization, and degradation management
 * Extracted from AnimationController to provide focused performance monitoring
 */

class PerformanceMonitor {
    constructor(config = {}) {
        // Configuration
        this.config = {
            targetFPS: config.targetFPS || 60,
            minFPS: config.minFPS || Math.max(30, (config.targetFPS || 60) * 0.5),
            goodFPS: config.goodFPS || Math.max(50, (config.targetFPS || 60) * 0.8),
            maxFrameTime: config.maxFrameTime || 33.33, // 30 FPS in ms
            maxMemoryMB: config.maxMemoryMB || 50,
            maxParticles: config.maxParticles || 50,
            recoveryDelay: config.recoveryDelay || 2000,
            memoryCheckInterval: config.memoryCheckInterval || 5000
        };

        // Performance metrics
        this.metrics = {
            fps: 0,
            instantFps: 0,  // More responsive FPS
            frameTime: 0,
            memoryUsage: 0,
            particleCount: 0,
            gestureQueueLength: 0,
            audioLatency: 0,
            frameCount: 0,
            lastFpsUpdate: 0,
            averageFrameTime: 0,
            frameTimeHistory: [],
            // Real-time monitoring additions
            fpsHistory: [],
            memoryTrend: 0,
            fpsTrend: 0,
            particleEfficiency: 0,
            gesturePerformanceImpact: 0,
            renderTime: 0,
            updateTime: 0,
            audioProcessingTime: 0
        };

        // Performance thresholds and state
        this.performanceDegradation = false;
        this.performanceRecoveryTimer = null;
        this.memoryCheckTimer = null;
        
        // Optimization strategies
        this.optimizations = new Map();
        this.appliedOptimizations = new Set();
        
        // Memory monitoring
        this.memoryBaseline = 0;
        this.memoryHistory = [];
        this.memoryLeakDetected = false;
        
        // Real-time monitoring state
        this.trendAnalysisWindow = 30; // frames for trend analysis
        this.particleEfficiencyHistory = [];
        this.gesturePerformanceHistory = [];
        this.lastGestureStartTime = 0;
        this.baselinePerformance = null;
        
        // Frame skipping and adaptive rendering
        this.frameSkipEnabled = config.frameSkipEnabled !== false;
        this.adaptiveRenderingEnabled = config.adaptiveRenderingEnabled !== false;
        this.skipNextFrames = 0;
        this.renderQuality = 1.0; // 1.0 = full quality, 0.1 = minimum
        this.lastRenderTime = 0;
        this.targetFrameTime = 1000 / this.config.targetFPS;
        this.criticalRenderElements = new Set(['mascot', 'current_gesture']);
        this.motionBlurCompensation = config.motionBlurCompensation !== false;
        
        // Performance phase tracking
        this.currentPhase = 'idle'; // idle, gesture, particle-heavy, audio-processing
        this.phaseStartTime = 0;
        this.phaseMetrics = new Map();
        
        // Monitoring frequency optimization
        this.frameCounter = 0;
        this.stableFrameCount = 0;
        this.dormantMode = false;
        this.checkInterval = 30; // Check metrics every N frames
        
        // Event callback for external integration
        this.eventCallback = null;
        
        // Subsystem references for optimization
        this.subsystems = {};
        
        // Initialize optimization strategies
        this.initializeOptimizations();
        
        // Start memory monitoring
        this.startMemoryMonitoring();
        
        console.log('PerformanceMonitor initialized');
    }

    /**
     * Initialize available optimization strategies
     */
    initializeOptimizations() {
        // Particle system optimizations
        this.optimizations.set('reduceParticles', {
            name: 'Reduce Particle Count',
            severity: 1,
            apply: (factor = 0.7) => {
                if (this.subsystems.particleSystem) {
                    const currentMax = this.subsystems.particleSystem.maxParticles;
                    const newMax = Math.max(5, Math.floor(currentMax * factor));
                    this.subsystems.particleSystem.setMaxParticles(newMax);
                    return { oldMax: currentMax, newMax };
                }
                return null;
            },
            revert: () => {
                if (this.subsystems.particleSystem) {
                    const originalMax = this.subsystems.particleSystem.originalMaxParticles || this.config.maxParticles;
                    this.subsystems.particleSystem.setMaxParticles(originalMax);
                    return { restoredMax: originalMax };
                }
                return null;
            }
        });

        // Gesture system optimizations
        this.optimizations.set('simplifyGestures', {
            name: 'Simplify Gesture Animations',
            severity: 2,
            apply: () => {
                if (this.subsystems.gestureSystem && this.subsystems.gestureSystem.setComplexityReduction) {
                    this.subsystems.gestureSystem.setComplexityReduction(true);
                    return { complexityReduced: true };
                }
                return null;
            },
            revert: () => {
                if (this.subsystems.gestureSystem && this.subsystems.gestureSystem.setComplexityReduction) {
                    this.subsystems.gestureSystem.setComplexityReduction(false);
                    return { complexityRestored: true };
                }
                return null;
            }
        });

        // Audio system optimizations
        this.optimizations.set('reduceAudioQuality', {
            name: 'Reduce Audio Quality',
            severity: 3,
            apply: () => {
                if (this.subsystems.soundSystem && this.subsystems.soundSystem.setQualityReduction) {
                    this.subsystems.soundSystem.setQualityReduction(true);
                    return { audioQualityReduced: true };
                }
                return null;
            },
            revert: () => {
                if (this.subsystems.soundSystem && this.subsystems.soundSystem.setQualityReduction) {
                    this.subsystems.soundSystem.setQualityReduction(false);
                    return { audioQualityRestored: true };
                }
                return null;
            }
        });

        // Rendering optimizations
        this.optimizations.set('reduceRenderQuality', {
            name: 'Reduce Render Quality',
            severity: 4,
            apply: () => {
                if (this.subsystems.renderer && this.subsystems.renderer.setQualityReduction) {
                    this.subsystems.renderer.setQualityReduction(true);
                    return { renderQualityReduced: true };
                }
                return null;
            },
            revert: () => {
                if (this.subsystems.renderer && this.subsystems.renderer.setQualityReduction) {
                    this.subsystems.renderer.setQualityReduction(false);
                    return { renderQualityRestored: true };
                }
                return null;
            }
        });
    }

    /**
     * Sets subsystem references for optimization
     * @param {Object} subsystems - Object containing subsystem references
     */
    setSubsystems(subsystems) {
        this.subsystems = {
            particleSystem: subsystems.particleSystem,
            gestureSystem: subsystems.gestureSystem,
            soundSystem: subsystems.soundSystem,
            renderer: subsystems.renderer
        };
    }

    /**
     * Sets the event callback for external integration
     * @param {Function} callback - Function to call for event emission
     */
    setEventCallback(callback) {
        if (typeof callback !== 'function') {
            throw new Error('Event callback must be a function');
        }
        this.eventCallback = callback;
    }

    /**
     * Updates instant FPS based on current frame time
     */
    updateInstantFPS() {
        if (this.metrics.frameTime > 0) {
            // Calculate FPS from current frame time, capped at 999
            const fps = Math.min(999, Math.round(1000 / this.metrics.frameTime));
            this.metrics.instantFps = fps;
        }
    }

    /**
     * Emits an event through the callback if available
     * @param {string} event - Event name
     * @param {*} data - Event data
     */
    emit(event, data = null) {
        if (this.eventCallback) {
            this.eventCallback(event, data);
        }
    }

    /**
     * Starts frame performance tracking
     * @param {number} currentTime - Current timestamp
     */
    startFrame(currentTime = performance.now()) {
        this.frameStartTime = currentTime;
    }

    /**
     * Ends frame performance tracking and updates metrics
     * @param {number} currentTime - Current timestamp
     */
    endFrame(currentTime = performance.now()) {
        if (!this.frameStartTime) return;

        // Increment frame counter
        this.frameCounter++;
        
        // Always calculate frame time for accurate FPS
        this.metrics.frameTime = currentTime - this.frameStartTime;
        
        // Skip expensive monitoring if in dormant mode (stable performance)
        if (this.dormantMode && this.frameCounter % 180 !== 0) {
            this.metrics.frameCount++;
            // Still update instant FPS
            this.updateInstantFPS();
            return; // Skip other expensive calculations
        }
        
        // Only update history every N frames to reduce overhead
        if (this.frameCounter % this.checkInterval === 0) {
            // Update frame time history for averaging
            this.metrics.frameTimeHistory.push(this.metrics.frameTime);
            if (this.metrics.frameTimeHistory.length > 60) { // Keep last 60 frames
                this.metrics.frameTimeHistory.shift();
            }
            
            // Calculate average frame time (use bit shifting when possible)
            const sum = this.metrics.frameTimeHistory.reduce((a, b) => a + b, 0);
            this.metrics.averageFrameTime = sum / this.metrics.frameTimeHistory.length;
        }
        
        // Update instant FPS based on current frame time
        this.updateInstantFPS();
        
        // Update FPS counter (1 second average)
        this.metrics.frameCount++;
        if (currentTime - this.metrics.lastFpsUpdate >= 1000) {
            this.metrics.fps = this.metrics.frameCount;
            this.metrics.frameCount = 0;
            this.metrics.lastFpsUpdate = currentTime;
            
            // Check for stable performance (near target FPS for 5 seconds)
            if (this.metrics.fps >= this.config.targetFPS - 2) {
                this.stableFrameCount++;
                if (this.stableFrameCount > 5 && !this.dormantMode) {
                    this.dormantMode = true;
                    this.checkInterval = 60; // Check less frequently when stable
                    console.log('PerformanceMonitor: Entering dormant mode (stable performance)');
                }
            } else {
                this.stableFrameCount = 0;
                if (this.dormantMode) {
                    this.dormantMode = false;
                    this.checkInterval = 30; // Resume normal checking
                    console.log('PerformanceMonitor: Exiting dormant mode');
                }
            }
            
            // Update FPS history for trend analysis
            this.updateFPSHistory();
            
            // Calculate trends (skip in dormant mode)
            if (!this.dormantMode) {
                this.calculateTrends();
            }
            
            // Emit FPS update event with trend data
            this.emit('fpsUpdate', { 
                fps: this.metrics.fps, 
                target: this.config.targetFPS,
                frameTime: this.metrics.averageFrameTime,
                trend: this.metrics.fpsTrend,
                efficiency: this.metrics.particleEfficiency
            });
        }

        // Update particle efficiency
        this.updateParticleEfficiency();
        
        // Update phase metrics
        this.updatePhaseMetrics(currentTime);

        // Check performance thresholds
        this.checkThresholds();
    }

    /**
     * Updates performance metrics with current system state
     * @param {Object} systemState - Current state of all systems
     */
    updateMetrics(systemState = {}) {
        // Update particle count
        if (systemState.particleCount !== undefined) {
            this.metrics.particleCount = systemState.particleCount;
        }

        // Update gesture queue length
        if (systemState.gestureQueueLength !== undefined) {
            this.metrics.gestureQueueLength = systemState.gestureQueueLength;
        }

        // Update audio latency
        if (systemState.audioLatency !== undefined) {
            this.metrics.audioLatency = systemState.audioLatency;
        }
    }

    /**
     * Updates FPS history for trend analysis
     */
    updateFPSHistory() {
        this.metrics.fpsHistory.push({
            timestamp: performance.now(),
            fps: this.metrics.fps,
            frameTime: this.metrics.averageFrameTime
        });
        
        // Keep only the last 30 samples for trend analysis
        if (this.metrics.fpsHistory.length > this.trendAnalysisWindow) {
            this.metrics.fpsHistory.shift();
        }
    }

    /**
     * Calculates performance trends for FPS and memory
     */
    calculateTrends() {
        // Calculate FPS trend
        if (this.metrics.fpsHistory.length >= 5) {
            const recent = this.metrics.fpsHistory.slice(-5);
            const older = this.metrics.fpsHistory.slice(-10, -5);
            
            if (older.length > 0) {
                const recentAvg = recent.reduce((sum, entry) => sum + entry.fps, 0) / recent.length;
                const olderAvg = older.reduce((sum, entry) => sum + entry.fps, 0) / older.length;
                this.metrics.fpsTrend = (recentAvg - olderAvg) / olderAvg;
            }
        }
        
        // Calculate memory trend
        if (this.memoryHistory.length >= 5) {
            const recent = this.memoryHistory.slice(-3);
            const older = this.memoryHistory.slice(-6, -3);
            
            if (older.length > 0) {
                const recentAvg = recent.reduce((sum, entry) => sum + entry.usage, 0) / recent.length;
                const olderAvg = older.reduce((sum, entry) => sum + entry.usage, 0) / older.length;
                this.metrics.memoryTrend = (recentAvg - olderAvg) / olderAvg;
            }
        }
    }

    /**
     * Updates particle efficiency metrics
     */
    updateParticleEfficiency() {
        if (!this.subsystems.particleSystem) return;
        
        const particleCount = this.metrics.particleCount;
        const frameTime = this.metrics.frameTime;
        
        if (particleCount > 0 && frameTime > 0) {
            // Calculate particles per millisecond efficiency
            const efficiency = particleCount / frameTime;
            
            this.particleEfficiencyHistory.push({
                timestamp: performance.now(),
                efficiency,
                particleCount,
                frameTime
            });
            
            // Keep last 20 samples
            if (this.particleEfficiencyHistory.length > 20) {
                this.particleEfficiencyHistory.shift();
            }
            
            // Calculate average efficiency
            const avgEfficiency = this.particleEfficiencyHistory.reduce((sum, entry) => sum + entry.efficiency, 0) / this.particleEfficiencyHistory.length;
            this.metrics.particleEfficiency = avgEfficiency;
            
            // Detect efficiency degradation
            if (this.particleEfficiencyHistory.length >= 10) {
                const recent = this.particleEfficiencyHistory.slice(-5);
                const older = this.particleEfficiencyHistory.slice(-10, -5);
                
                const recentAvg = recent.reduce((sum, entry) => sum + entry.efficiency, 0) / recent.length;
                const olderAvg = older.reduce((sum, entry) => sum + entry.efficiency, 0) / older.length;
                
                const efficiencyTrend = (recentAvg - olderAvg) / olderAvg;
                
                if (efficiencyTrend < -0.2) { // 20% efficiency drop
                    this.emit('particleEfficiencyDrop', {
                        trend: efficiencyTrend,
                        currentEfficiency: avgEfficiency,
                        particleCount,
                        frameTime
                    });
                }
            }
        }
    }

    /**
     * Tracks gesture performance impact
     * @param {string} gestureType - Type of gesture being executed
     * @param {string} phase - 'start' or 'end'
     */
    trackGesturePerformance(gestureType, phase) {
        const currentTime = performance.now();
        
        if (phase === 'start') {
            this.lastGestureStartTime = currentTime;
            this.baselinePerformance = {
                fps: this.metrics.fps,
                frameTime: this.metrics.averageFrameTime,
                memoryUsage: this.metrics.memoryUsage
            };
            
            // Switch to gesture phase
            this.setPerformancePhase('gesture');
            
        } else if (phase === 'end' && this.lastGestureStartTime > 0) {
            const gestureDuration = currentTime - this.lastGestureStartTime;
            const currentPerformance = {
                fps: this.metrics.fps,
                frameTime: this.metrics.averageFrameTime,
                memoryUsage: this.metrics.memoryUsage
            };
            
            // Calculate performance impact
            const fpsImpact = this.baselinePerformance ? 
                (this.baselinePerformance.fps - currentPerformance.fps) / this.baselinePerformance.fps : 0;
            const frameTimeImpact = this.baselinePerformance ?
                (currentPerformance.frameTime - this.baselinePerformance.frameTime) / this.baselinePerformance.frameTime : 0;
            
            const gestureImpact = {
                gestureType,
                duration: gestureDuration,
                fpsImpact,
                frameTimeImpact,
                timestamp: currentTime
            };
            
            this.gesturePerformanceHistory.push(gestureImpact);
            
            // Keep last 50 gesture measurements
            if (this.gesturePerformanceHistory.length > 50) {
                this.gesturePerformanceHistory.shift();
            }
            
            // Calculate average gesture impact
            const avgImpact = this.gesturePerformanceHistory.reduce((sum, entry) => sum + entry.fpsImpact, 0) / this.gesturePerformanceHistory.length;
            this.metrics.gesturePerformanceImpact = avgImpact;
            
            // Emit gesture performance data
            this.emit('gesturePerformanceImpact', gestureImpact);
            
            // Return to idle phase
            this.setPerformancePhase('idle');
            
            this.lastGestureStartTime = 0;
            this.baselinePerformance = null;
        }
    }

    /**
     * Sets the current performance monitoring phase
     * @param {string} phase - Performance phase ('idle', 'gesture', 'particle-heavy', 'audio-processing')
     */
    setPerformancePhase(phase) {
        if (this.currentPhase !== phase) {
            const currentTime = performance.now();
            
            // Record metrics for the ending phase
            if (this.currentPhase !== 'idle' && this.phaseStartTime > 0) {
                const phaseDuration = currentTime - this.phaseStartTime;
                const phaseData = this.phaseMetrics.get(this.currentPhase) || { samples: [], totalDuration: 0 };
                
                phaseData.samples.push({
                    duration: phaseDuration,
                    avgFPS: this.metrics.fps,
                    avgFrameTime: this.metrics.averageFrameTime,
                    timestamp: currentTime
                });
                
                phaseData.totalDuration += phaseDuration;
                
                // Keep last 20 samples per phase
                if (phaseData.samples.length > 20) {
                    phaseData.samples.shift();
                }
                
                this.phaseMetrics.set(this.currentPhase, phaseData);
            }
            
            this.currentPhase = phase;
            this.phaseStartTime = currentTime;
            
            this.emit('performancePhaseChange', { 
                phase, 
                previousPhase: this.currentPhase,
                timestamp: currentTime 
            });
        }
    }

    /**
     * Updates phase-specific metrics
     * @param {number} currentTime - Current timestamp
     */
    updatePhaseMetrics(currentTime) {
        // Track time spent in current phase
        if (this.phaseStartTime > 0) {
            const phaseData = this.phaseMetrics.get(this.currentPhase) || { 
                samples: [], 
                totalDuration: 0,
                currentDuration: 0
            };
            
            phaseData.currentDuration = currentTime - this.phaseStartTime;
            this.phaseMetrics.set(this.currentPhase, phaseData);
        }
        
        // Auto-detect phase changes based on system state
        this.autoDetectPhase();
    }

    /**
     * Automatically detects performance phase based on system state
     */
    autoDetectPhase() {
        const particleCount = this.metrics.particleCount;
        const gestureQueueLength = this.metrics.gestureQueueLength;
        const audioLatency = this.metrics.audioLatency;
        
        // Determine appropriate phase
        let detectedPhase = 'idle';
        
        if (gestureQueueLength > 0) {
            detectedPhase = 'gesture';
        } else if (particleCount > this.config.maxParticles * 0.7) {
            detectedPhase = 'particle-heavy';
        } else if (audioLatency > 50) { // 50ms audio latency threshold
            detectedPhase = 'audio-processing';
        }
        
        // Only change phase if it's different and we've been in current phase for at least 100ms
        if (detectedPhase !== this.currentPhase && 
            (performance.now() - this.phaseStartTime) > 100) {
            this.setPerformancePhase(detectedPhase);
        }
    }

    /**
     * Tracks subsystem performance timing
     * @param {string} subsystem - Name of subsystem ('render', 'update', 'audio')
     * @param {number} duration - Time taken in milliseconds
     */
    trackSubsystemTiming(subsystem, duration) {
        switch (subsystem) {
            case 'render':
                this.metrics.renderTime = duration;
                break;
            case 'update':
                this.metrics.updateTime = duration;
                break;
            case 'audio':
                this.metrics.audioProcessingTime = duration;
                break;
        }
        
        // Emit timing data for real-time monitoring
        this.emit('subsystemTiming', {
            subsystem,
            duration,
            timestamp: performance.now()
        });
    }

    /**
     * Determines if the current frame should be skipped
     * @returns {boolean} True if frame should be skipped
     */
    shouldSkipFrame() {
        if (!this.frameSkipEnabled) return false;
        
        // Skip if we have pending skips
        if (this.skipNextFrames > 0) {
            this.skipNextFrames--;
            return true;
        }
        
        // Calculate if we need to skip based on performance
        const frameTime = this.metrics.averageFrameTime;
        if (frameTime > this.targetFrameTime * 1.5) {
            // We're running more than 50% slower than target
            const skipRatio = Math.floor(frameTime / this.targetFrameTime) - 1;
            this.skipNextFrames = Math.min(skipRatio, 3); // Max 3 frame skips
            return this.skipNextFrames > 0;
        }
        
        return false;
    }
    
    /**
     * Calculates adaptive rendering quality based on performance
     * @returns {Object} Rendering parameters
     */
    getAdaptiveRenderingParams() {
        if (!this.adaptiveRenderingEnabled) {
            return {
                quality: 1.0,
                skipNonCritical: false,
                motionBlur: false,
                priorityElements: null
            };
        }
        
        const fps = this.metrics.fps;
        const targetFPS = this.config.targetFPS;
        const performanceRatio = fps / targetFPS;
        
        // Adaptive quality calculation
        let quality = 1.0;
        let skipNonCritical = false;
        let motionBlur = false;
        let priorityElements = null;
        
        if (performanceRatio < 0.8) {
            quality = 0.8;
            skipNonCritical = performanceRatio < 0.6;
            motionBlur = this.motionBlurCompensation && this.skipNextFrames > 0;
            
            if (performanceRatio < 0.4) {
                quality = 0.5;
                priorityElements = this.criticalRenderElements;
            }
        }
        
        // Smooth quality transitions
        const qualityDiff = Math.abs(this.renderQuality - quality);
        if (qualityDiff > 0.1) {
            // Gradual quality adjustment
            quality = this.renderQuality + (quality - this.renderQuality) * 0.3;
        }
        
        this.renderQuality = quality;
        
        return {
            quality,
            skipNonCritical,
            motionBlur,
            priorityElements,
            frameSkips: this.skipNextFrames
        };
    }
    
    /**
     * Applies motion blur compensation for skipped frames
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} skipCount - Number of frames being skipped
     */
    applyMotionBlurCompensation(ctx, skipCount) {
        if (!this.motionBlurCompensation || skipCount <= 0) return;
        
        // Apply a subtle motion blur effect
        const alpha = Math.max(0.3, 1 - (skipCount * 0.2));
        ctx.globalAlpha = alpha;
        
        // Store for restoration
        return () => {
            ctx.globalAlpha = 1.0;
        };
    }
    
    /**
     * Sets priority render elements for adaptive rendering
     * @param {Array<string>} elements - Array of element identifiers
     */
    setPriorityRenderElements(elements) {
        this.criticalRenderElements = new Set(elements);
    }
    
    /**
     * Gets comprehensive real-time performance data
     * @returns {Object} Real-time performance metrics
     */
    getRealTimeMetrics() {
        return {
            ...this.getMetrics(),
            trends: {
                fps: this.metrics.fpsTrend,
                memory: this.metrics.memoryTrend
            },
            efficiency: {
                particles: this.metrics.particleEfficiency,
                gestureImpact: this.metrics.gesturePerformanceImpact
            },
            timing: {
                render: this.metrics.renderTime,
                update: this.metrics.updateTime,
                audio: this.metrics.audioProcessingTime
            },
            phase: {
                current: this.currentPhase,
                duration: this.phaseStartTime > 0 ? performance.now() - this.phaseStartTime : 0,
                history: Object.fromEntries(this.phaseMetrics)
            },
            adaptiveRendering: this.getAdaptiveRenderingParams(),
            frameSkipping: {
                enabled: this.frameSkipEnabled,
                pendingSkips: this.skipNextFrames,
                shouldSkipCurrent: this.shouldSkipFrame()
            }
        };
    }

    /**
     * Checks performance thresholds and applies optimizations if needed
     */
    checkThresholds() {
        // Only check if we have valid FPS data
        if (this.metrics.fps <= 0) return;

        const { fps } = this.metrics;
        const { minFPS, goodFPS } = this.config;

        // Performance degradation detection
        if (fps < minFPS && !this.performanceDegradation) {
            this.applyOptimizations();
        }

        // Performance recovery detection
        if (fps >= goodFPS && this.performanceDegradation) {
            this.scheduleRecovery();
        }

        // Memory threshold check
        if (this.metrics.memoryUsage > this.config.maxMemoryMB) {
            this.handleMemoryPressure();
        }
    }

    /**
     * Applies performance optimizations based on current performance
     */
    applyOptimizations() {
        if (this.performanceDegradation) return;

        const { fps } = this.metrics;
        const { minFPS } = this.config;
        const performanceRatio = fps / minFPS;

        // Determine optimization severity based on performance
        let optimizationsToApply = [];
        
        if (performanceRatio < 0.8) {
            optimizationsToApply.push('reduceParticles');
        }
        
        if (performanceRatio < 0.6) {
            optimizationsToApply.push('simplifyGestures');
        }
        
        if (performanceRatio < 0.4) {
            optimizationsToApply.push('reduceAudioQuality');
        }
        
        if (performanceRatio < 0.2) {
            optimizationsToApply.push('reduceRenderQuality');
        }

        // Apply optimizations
        const results = [];
        for (const optimizationName of optimizationsToApply) {
            const optimization = this.optimizations.get(optimizationName);
            if (optimization && !this.appliedOptimizations.has(optimizationName)) {
                const result = optimization.apply(performanceRatio);
                if (result) {
                    this.appliedOptimizations.add(optimizationName);
                    results.push({ name: optimizationName, result });
                }
            }
        }

        if (results.length > 0) {
            this.performanceDegradation = true;
            
            console.warn(`Performance: ${fps} FPS (min: ${minFPS})`)
            this.emit('performanceDegradation', {
                fps,
                targetFPS: this.config.targetFPS,
                minFPS,
                optimizations: results,
                performanceRatio
            });
        }
    }

    /**
     * Schedules performance recovery after a delay
     */
    scheduleRecovery() {
        if (this.performanceRecoveryTimer) return;

        this.performanceRecoveryTimer = setTimeout(() => {
            this.revertOptimizations();
            this.performanceRecoveryTimer = null;
        }, this.config.recoveryDelay);
    }

    /**
     * Reverts applied optimizations when performance improves
     */
    revertOptimizations() {
        const { fps } = this.metrics;
        const { goodFPS } = this.config;

        // Double-check FPS is still good
        if (fps < goodFPS) return;

        const results = [];
        
        // Revert optimizations in reverse order of severity
        const sortedOptimizations = Array.from(this.appliedOptimizations)
            .map(name => ({ name, optimization: this.optimizations.get(name) }))
            .sort((a, b) => b.optimization.severity - a.optimization.severity);

        for (const { name, optimization } of sortedOptimizations) {
            const result = optimization.revert();
            if (result) {
                this.appliedOptimizations.delete(name);
                results.push({ name, result });
            }
        }

        if (results.length > 0) {
            this.performanceDegradation = false;
            
            console.log(`Performance recovered (${fps} FPS >= ${goodFPS}). Reverted optimizations:`, results);
            this.emit('performanceRecovery', {
                fps,
                targetFPS: this.config.targetFPS,
                goodFPS,
                revertedOptimizations: results
            });
        }
    }

    /**
     * Starts memory usage monitoring
     */
    startMemoryMonitoring() {
        // Set initial memory baseline
        this.updateMemoryUsage();
        this.memoryBaseline = this.metrics.memoryUsage;

        // Start periodic memory monitoring
        this.memoryCheckTimer = setInterval(() => {
            this.updateMemoryUsage();
            this.detectMemoryLeaks();
        }, this.config.memoryCheckInterval);
    }

    /**
     * Updates memory usage metrics
     */
    updateMemoryUsage() {
        if (performance.memory) {
            // Use Chrome's performance.memory API if available
            this.metrics.memoryUsage = performance.memory.usedJSHeapSize / (1024 * 1024); // Convert to MB
        } else {
            // Fallback: estimate based on object counts (rough approximation)
            this.metrics.memoryUsage = this.estimateMemoryUsage();
        }

        // Update memory history
        this.memoryHistory.push({
            timestamp: performance.now(),
            usage: this.metrics.memoryUsage
        });

        // Keep only last 20 samples (about 100 seconds at 5-second intervals)
        if (this.memoryHistory.length > 20) {
            this.memoryHistory.shift();
        }
    }

    /**
     * Estimates memory usage when performance.memory is not available
     * @returns {number} Estimated memory usage in MB
     */
    estimateMemoryUsage() {
        let estimate = 5; // Base estimate in MB

        // Add estimates based on system state
        if (this.subsystems.particleSystem) {
            const particleCount = this.subsystems.particleSystem.getActiveParticleCount?.() || 0;
            estimate += particleCount * 0.001; // ~1KB per particle
        }

        if (this.subsystems.gestureSystem) {
            const queueLength = this.subsystems.gestureSystem.getQueueLength?.() || 0;
            estimate += queueLength * 0.01; // ~10KB per queued gesture
        }

        return estimate;
    }

    /**
     * Detects potential memory leaks
     */
    detectMemoryLeaks() {
        if (this.memoryHistory.length < 10) return;

        // Calculate memory growth trend
        const recent = this.memoryHistory.slice(-5);
        const older = this.memoryHistory.slice(-10, -5);
        
        const recentAvg = recent.reduce((sum, entry) => sum + entry.usage, 0) / recent.length;
        const olderAvg = older.reduce((sum, entry) => sum + entry.usage, 0) / older.length;
        
        const growthRate = (recentAvg - olderAvg) / olderAvg;
        const growthThreshold = 0.1; // 10% growth threshold

        // Check for consistent memory growth
        if (growthRate > growthThreshold && !this.memoryLeakDetected) {
            this.memoryLeakDetected = true;
            
            // Silently handle potential memory leak
            this.emit('memoryLeakDetected', {
                growthRate,
                currentUsage: this.metrics.memoryUsage,
                baseline: this.memoryBaseline,
                history: this.memoryHistory.slice()
            });
        }

        // Reset leak detection if memory stabilizes
        if (growthRate < 0.02 && this.memoryLeakDetected) {
            this.memoryLeakDetected = false;
            this.emit('memoryStabilized', {
                currentUsage: this.metrics.memoryUsage
            });
        }
    }

    /**
     * Handles memory pressure by applying memory-focused optimizations
     */
    handleMemoryPressure() {
        console.warn(`Memory pressure detected: ${this.metrics.memoryUsage.toFixed(1)}MB > ${this.config.maxMemoryMB}MB`);
        
        // Force garbage collection if available
        this.forceGarbageCollection();
        
        // Apply memory-focused optimizations
        if (this.subsystems.particleSystem) {
            this.subsystems.particleSystem.clearInactive?.();
        }
        
        this.emit('memoryPressure', {
            currentUsage: this.metrics.memoryUsage,
            threshold: this.config.maxMemoryMB
        });
    }

    /**
     * Forces garbage collection if available
     */
    forceGarbageCollection() {
        if (window.gc && typeof window.gc === 'function') {
            try {
                window.gc();
                console.log('Forced garbage collection');
            } catch (error) {
                console.warn('Failed to force garbage collection:', error);
            }
        }
    }

    /**
     * Gets current performance metrics
     * @returns {Object} Complete performance metrics
     */
    getMetrics() {
        return {
            ...this.metrics,
            targetFPS: this.config.targetFPS,
            performanceDegradation: this.performanceDegradation,
            appliedOptimizations: Array.from(this.appliedOptimizations),
            memoryLeakDetected: this.memoryLeakDetected
        };
    }

    /**
     * Generates a comprehensive performance report
     * @param {Object} options - Report generation options
     * @returns {Object} Detailed performance report
     */
    generateReport(options = {}) {
        const metrics = this.getMetrics();
        const realTimeMetrics = this.getRealTimeMetrics();
        
        const report = {
            timestamp: new Date().toISOString(),
            performance: {
                fps: {
                    current: metrics.fps,
                    target: metrics.targetFPS,
                    efficiency: metrics.fps / metrics.targetFPS,
                    status: this.getPerformanceStatus(),
                    trend: realTimeMetrics.trends.fps
                },
                frameTime: {
                    current: metrics.frameTime,
                    average: metrics.averageFrameTime,
                    target: 1000 / metrics.targetFPS
                },
                memory: {
                    current: metrics.memoryUsage,
                    baseline: this.memoryBaseline,
                    growth: this.memoryBaseline ? ((metrics.memoryUsage - this.memoryBaseline) / this.memoryBaseline * 100).toFixed(1) + '%' : 'N/A',
                    leakDetected: metrics.memoryLeakDetected,
                    trend: realTimeMetrics.trends.memory
                }
            },
            efficiency: realTimeMetrics.efficiency,
            adaptiveRendering: realTimeMetrics.adaptiveRendering,
            frameSkipping: realTimeMetrics.frameSkipping,
            phase: realTimeMetrics.phase,
            timing: realTimeMetrics.timing,
            optimizations: {
                degradationActive: metrics.performanceDegradation,
                appliedOptimizations: metrics.appliedOptimizations,
                availableOptimizations: Array.from(this.optimizations.keys())
            },
            recommendations: this.generateRecommendations(metrics),
            alerts: this.generatePerformanceAlerts(metrics)
        };
        
        // Add historical data if requested
        if (options.includeHistory) {
            report.history = {
                fps: this.metrics.fpsHistory.slice(-30),
                memory: this.memoryHistory.slice(-30),
                phases: Object.fromEntries(this.phaseMetrics)
            };
        }
        
        // Add baseline comparison if available
        if (options.compareToBaseline && this.baselinePerformance) {
            report.baselineComparison = {
                fpsRatio: metrics.fps / this.baselinePerformance.fps,
                memoryRatio: metrics.memoryUsage / this.baselinePerformance.memory,
                frameTimeRatio: metrics.averageFrameTime / this.baselinePerformance.frameTime
            };
        }
        
        return report;
    }
    
    /**
     * Generates performance alerts
     * @param {Object} metrics - Current metrics
     * @returns {Array} Array of alerts
     */
    generatePerformanceAlerts(metrics) {
        const alerts = [];
        
        if (metrics.fps < this.config.minFPS) {
            alerts.push({
                type: 'performance',
                severity: 'critical',
                message: `FPS below minimum threshold: ${metrics.fps}/${this.config.minFPS}`
            });
        }
        
        if (this.skipNextFrames > 0) {
            alerts.push({
                type: 'rendering', 
                severity: 'warning',
                message: `Frame skipping active: ${this.skipNextFrames} frames`
            });
        }
        
        if (metrics.memoryLeakDetected) {
            alerts.push({
                type: 'memory',
                severity: 'critical',
                message: 'Potential memory leak detected'
            });
        }
        
        return alerts;
    }

    /**
     * Gets current performance status
     * @returns {string} Performance status description
     */
    getPerformanceStatus() {
        const { fps } = this.metrics;
        const { targetFPS, minFPS, goodFPS } = this.config;
        
        if (fps >= goodFPS) return 'excellent';
        if (fps >= targetFPS * 0.9) return 'good';
        if (fps >= minFPS) return 'acceptable';
        return 'poor';
    }

    /**
     * Generates performance optimization recommendations
     * @param {Object} metrics - Current performance metrics
     * @returns {Array} Array of recommendation objects
     */
    generateRecommendations(metrics) {
        const recommendations = [];
        
        if (metrics.fps < this.config.targetFPS * 0.8) {
            recommendations.push({
                type: 'performance',
                priority: 'high',
                message: 'Consider reducing particle count or gesture complexity',
                action: 'reduceParticles'
            });
        }
        
        if (metrics.memoryUsage > this.config.maxMemoryMB * 0.8) {
            recommendations.push({
                type: 'memory',
                priority: 'medium',
                message: 'Memory usage is approaching limits',
                action: 'clearInactiveResources'
            });
        }
        
        if (metrics.memoryLeakDetected) {
            recommendations.push({
                type: 'memory',
                priority: 'high',
                message: 'Potential memory leak detected - check event listener cleanup',
                action: 'investigateMemoryLeak'
            });
        }
        
        return recommendations;
    }

    /**
     * Sets the target FPS and updates related thresholds
     * @param {number} fps - Target FPS value
     */
    setTargetFPS(fps) {
        if (typeof fps !== 'number' || fps <= 0) {
            throw new Error('Target FPS must be a positive number');
        }
        
        this.config.targetFPS = fps;
        this.config.minFPS = Math.max(30, fps * 0.5);
        this.config.goodFPS = Math.max(50, fps * 0.8);
        this.config.maxFrameTime = 1000 / Math.max(30, fps * 0.5);
        
        console.log(`PerformanceMonitor target FPS set to ${fps}`);
        this.emit('targetFPSChanged', { targetFPS: fps });
    }

    /**
     * Destroys the performance monitor and cleans up resources
     */
    destroy() {
        // Clear timers
        if (this.performanceRecoveryTimer) {
            clearTimeout(this.performanceRecoveryTimer);
            this.performanceRecoveryTimer = null;
        }
        
        if (this.memoryCheckTimer) {
            clearInterval(this.memoryCheckTimer);
            this.memoryCheckTimer = null;
        }
        
        // Revert all optimizations
        this.revertOptimizations();
        
        // Clear references
        this.subsystems = {};
        this.eventCallback = null;
        this.optimizations.clear();
        this.appliedOptimizations.clear();
        this.memoryHistory = [];
        
        console.log('PerformanceMonitor destroyed');
    }
}

export default PerformanceMonitor;