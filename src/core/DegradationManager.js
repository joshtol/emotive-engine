/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝                                                                             
 *                   ◐ ◑ ◒ ◓  DEGRADATION MANAGER  ◓ ◒ ◑ ◐                   
 *                                                                                    
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Degradation Manager - Graceful Performance Optimization
 * @author Emotive Engine Team
 * @version 2.0.0
 * @module DegradationManager
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ The ADAPTIVE BRAIN that ensures smooth performance across all devices.            
 * ║ Detects browser capabilities and system performance, then gracefully              
 * ║ degrades features to maintain 60fps. Better to look simpler than to lag!          
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🎯 QUALITY LEVELS                                                                  
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • HIGH    : All features enabled, max particles                                   
 * │ • MEDIUM  : Reduced particles, simpler effects                                    
 * │ • LOW     : Minimal particles, basic animations                                   
 * │ • MINIMAL : Core functionality only, no particles                                 
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🔍 DETECTION METHODS                                                               
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Browser capability detection                                                    
 * │ • FPS monitoring (degrades if < 30fps)                                            
 * │ • Device memory estimation                                                        
 * │ • GPU tier detection                                                              
 * │ • Battery level monitoring                                                        
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */

import { browserCompatibility } from '../utils/browserCompatibility.js';
import { ErrorResponse, ErrorTypes } from './ErrorResponse.js';
import { getErrorLogger } from './ErrorLogger.js';

export class DegradationManager {
    constructor(config = {}) {
        this.config = {
            enableAutoOptimization: false, // TEMPORARILY DISABLED
            performanceThreshold: config.performanceThreshold || 30, // FPS
            memoryThreshold: config.memoryThreshold || 50, // MB
            degradationSteps: config.degradationSteps || 4,
            recoveryDelay: config.recoveryDelay || 1000, // ms - faster recovery
            enableManualControls: config.enableManualControls !== false,
            enableProgressiveEnhancement: config.enableProgressiveEnhancement !== false,
            ...config
        };

        // Error logger for degradation events
        this.errorLogger = getErrorLogger();

        // Degradation levels from optimal to emergency
        this.degradationLevels = [
            {
                name: 'optimal',
                particleLimit: 50,
                audioEnabled: true,
                fullEffects: true,
                targetFPS: 60,
                qualityLevel: 1.0,
                canvasScale: 1.0,
                animationComplexity: 1.0,
                description: 'Full features and effects',
                features: ['particles', 'audio', 'fullEffects', 'animations', 'highQuality']
            },
            {
                name: 'reduced',
                particleLimit: 25,
                audioEnabled: true,
                fullEffects: false,
                targetFPS: 45,
                qualityLevel: 0.8,
                canvasScale: 0.9,
                animationComplexity: 0.8,
                description: 'Reduced visual effects',
                features: ['particles', 'audio', 'animations', 'mediumQuality']
            },
            {
                name: 'minimal',
                particleLimit: 10,
                audioEnabled: false,
                fullEffects: false,
                targetFPS: 30,
                qualityLevel: 0.6,
                canvasScale: 0.8,
                animationComplexity: 0.6,
                description: 'Minimal visual effects, no audio',
                features: ['particles', 'animations', 'lowQuality']
            },
            {
                name: 'emergency',
                particleLimit: 5,  // Keep minimum particles even in emergency mode
                audioEnabled: false,
                fullEffects: false,
                targetFPS: 15,
                qualityLevel: 0.4,
                canvasScale: 0.7,
                animationComplexity: 0.4,
                description: 'Emergency mode - basic animation only',
                features: ['animations', 'particles']
            }
        ];

        this.currentLevel = 0; // Set to optimal since auto-optimization is disabled
        this.lastDegradationTime = 0;
        this.performanceHistory = [];
        this.maxHistorySize = 30; // 30 samples for averaging
        
        // Feature availability based on browser capabilities
        this.availableFeatures = this.assessAvailableFeatures();
        
        // Performance monitoring
        this.isMonitoring = false;
        this.monitoringInterval = null;
        
        // Recovery management
        this.recoveryTimeout = null;
        this.consecutiveGoodFrames = 0;
        this.requiredGoodFrames = 30; // 0.5 seconds at 60fps - faster recovery
        
        // Manual degradation controls
        this.manualOverride = null;
        this.disabledFeatures = new Set();
        
        // Progressive enhancement tracking
        this.enhancementHistory = [];
        this.capabilityTests = new Map();
        
        console.log('DegradationManager initialized:', {
            level: this.getCurrentLevel().name,
            availableFeatures: this.availableFeatures,
            browserCapabilities: browserCompatibility.capabilities
        });
    }

    /**
     * Assess available features based on browser capabilities
     * @returns {Object} Available features
     */
    assessAvailableFeatures() {
        const features = browserCompatibility.featureDetection.getFeatures();
        const capabilities = browserCompatibility.capabilities;
        
        return {
            audio: features.webAudio && features.audioContext,
            particles: features.canvas2d,
            animations: features.requestAnimationFrame,
            performance: features.performance,
            fullQuality: capabilities.level === 'full',
            reducedMotion: this.detectReducedMotion(),
            highContrast: this.detectHighContrast()
        };
    }

    /**
     * Detect user preference for reduced motion
     * @returns {boolean} True if reduced motion is preferred
     */
    detectReducedMotion() {
        try {
            return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        } catch (e) {
            return false;
        }
    }

    /**
     * Detect high contrast mode
     * @returns {boolean} True if high contrast is enabled
     */
    detectHighContrast() {
        try {
            return window.matchMedia('(prefers-contrast: high)').matches;
        } catch (e) {
            return false;
        }
    }

    /**
     * Start performance monitoring
     */
    startMonitoring() {
        // TEMPORARILY DISABLED - DO NOT MONITOR
        return;
        
        if (this.isMonitoring) return;
        
        this.isMonitoring = true;
        this.monitoringInterval = setInterval(() => {
            this.checkPerformance();
        }, 1000); // Check every second
        
        console.log('Performance monitoring started');
    }

    /**
     * Stop performance monitoring
     */
    stopMonitoring() {
        if (!this.isMonitoring) return;
        
        this.isMonitoring = false;
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        
        if (this.recoveryTimeout) {
            clearTimeout(this.recoveryTimeout);
            this.recoveryTimeout = null;
        }
        
        console.log('Performance monitoring stopped');
    }

    /**
     * Check current performance and apply degradation if needed
     * @param {Object} metrics - Performance metrics
     */
    checkPerformance(metrics = {}) {
        if (!this.config.enableAutoOptimization) return;
        
        const fps = metrics.fps || 60;
        const memoryUsage = metrics.memoryUsage || 0;
        
        // Add to performance history
        this.performanceHistory.push({ fps, memoryUsage, timestamp: Date.now() });
        if (this.performanceHistory.length > this.maxHistorySize) {
            this.performanceHistory.shift();
        }
        
        // Calculate average performance
        const avgFPS = this.performanceHistory.reduce((sum, sample) => sum + sample.fps, 0) / this.performanceHistory.length;
        const avgMemory = this.performanceHistory.reduce((sum, sample) => sum + sample.memoryUsage, 0) / this.performanceHistory.length;
        
        // Check if degradation is needed
        const needsDegradation = avgFPS < this.config.performanceThreshold || 
                                avgMemory > this.config.memoryThreshold;
        
        if (needsDegradation && this.canDegrade()) {
            this.applyDegradation();
        } else if (!needsDegradation && avgFPS > this.config.performanceThreshold * 1.1) {
            // Good performance - track for potential recovery (lower threshold for faster scaling up)
            this.consecutiveGoodFrames++;
            if (this.consecutiveGoodFrames >= this.requiredGoodFrames && this.canRecover()) {
                this.scheduleRecovery();
            }
        } else {
            this.consecutiveGoodFrames = 0;
        }
    }

    /**
     * Check if degradation can be applied
     * @returns {boolean} True if degradation is possible
     */
    canDegrade() {
        const now = Date.now();
        const timeSinceLastDegradation = now - this.lastDegradationTime;
        
        return this.currentLevel < this.degradationLevels.length - 1 && 
               timeSinceLastDegradation > 2000; // Minimum 2 seconds between degradations
    }

    /**
     * Check if recovery can be applied
     * @returns {boolean} True if recovery is possible
     */
    canRecover() {
        return this.currentLevel > 0;
    }

    /**
     * Apply degradation to the next level
     */
    applyDegradation() {
        if (!this.canDegrade()) return;
        
        this.currentLevel++;
        this.lastDegradationTime = Date.now();
        this.consecutiveGoodFrames = 0;
        
        const level = this.getCurrentLevel();
        // Silently apply performance degradation
        
        // Cancel any pending recovery
        if (this.recoveryTimeout) {
            clearTimeout(this.recoveryTimeout);
            this.recoveryTimeout = null;
        }
        
        // Emit degradation event
        this.emit('degradationApplied', {
            level: level.name,
            index: this.currentLevel,
            reason: 'performance',
            settings: level
        });
    }

    /**
     * Schedule recovery to a better performance level
     */
    scheduleRecovery() {
        if (this.recoveryTimeout) return; // Already scheduled
        
        this.recoveryTimeout = setTimeout(() => {
            this.applyRecovery();
            this.recoveryTimeout = null;
        }, this.config.recoveryDelay);
        
        console.log(`Recovery scheduled in ${this.config.recoveryDelay}ms`);
    }

    /**
     * Apply recovery to the previous level
     */
    applyRecovery() {
        if (!this.canRecover()) return;
        
        this.currentLevel--;
        this.consecutiveGoodFrames = 0;
        
        const level = this.getCurrentLevel();
        console.log(`Performance recovery applied: ${level.name} (${level.description})`);
        
        // Emit recovery event
        this.emit('recoveryApplied', {
            level: level.name,
            index: this.currentLevel,
            settings: level
        });
    }

    /**
     * Manually set degradation level
     * @param {number|string} level - Level index or name
     */
    setLevel(level) {
        let targetLevel;
        
        if (typeof level === 'string') {
            targetLevel = this.degradationLevels.findIndex(l => l.name === level);
            if (targetLevel === -1) {
                console.warn(`Unknown degradation level: ${level}`);
                return false;
            }
        } else if (typeof level === 'number') {
            targetLevel = Math.max(0, Math.min(this.degradationLevels.length - 1, level));
        } else {
            console.warn('Invalid degradation level type');
            return false;
        }
        
        const previousLevel = this.currentLevel;
        this.currentLevel = targetLevel;
        
        const levelInfo = this.getCurrentLevel();
        console.log(`Degradation level manually set: ${levelInfo.name}`);
        
        // Emit level change event
        this.emit('levelChanged', {
            previousLevel: this.degradationLevels[previousLevel].name,
            currentLevel: levelInfo.name,
            index: this.currentLevel,
            manual: true,
            settings: levelInfo
        });
        
        return true;
    }

    /**
     * Get current degradation level
     * @returns {Object} Current level configuration
     */
    getCurrentLevel() {
        return { ...this.degradationLevels[this.currentLevel] };
    }

    /**
     * Get all available degradation levels
     * @returns {Array<Object>} All degradation levels
     */
    getAllLevels() {
        return this.degradationLevels.map(level => ({ ...level }));
    }

    /**
     * Get feature availability
     * @returns {Object} Available features
     */
    getAvailableFeatures() {
        return { ...this.availableFeatures };
    }

    /**
     * Check if a specific feature is available
     * @param {string} feature - Feature name
     * @returns {boolean} True if feature is available
     */
    isFeatureAvailable(feature) {
        // Check if manually disabled first
        if (this.disabledFeatures.has(feature)) {
            return false;
        }
        
        const currentLevel = this.getCurrentLevel();
        
        switch (feature) {
            case 'audio':
                return this.availableFeatures.audio && currentLevel.audioEnabled;
            case 'particles':
                return this.availableFeatures.particles && currentLevel.particleLimit > 0;
            case 'fullEffects':
                return this.availableFeatures.fullQuality && currentLevel.fullEffects;
            case 'animations':
                return this.availableFeatures.animations;
            default:
                return this.availableFeatures[feature] || false;
        }
    }

    /**
     * Get recommended settings for current level
     * @returns {Object} Recommended settings
     */
    getRecommendedSettings() {
        const level = this.getCurrentLevel();
        const browserOpts = browserCompatibility.browserOptimizations.getOptimizations();
        
        return {
            maxParticles: Math.min(level.particleLimit, browserOpts.particleLimit),
            enableAudio: level.audioEnabled && this.availableFeatures.audio,
            enableFullEffects: level.fullEffects && this.availableFeatures.fullQuality,
            targetFPS: level.targetFPS,
            qualityLevel: level.qualityLevel,
            reducedMotion: this.availableFeatures.reducedMotion,
            highContrast: this.availableFeatures.highContrast
        };
    }

    /**
     * Get performance statistics
     * @returns {Object} Performance statistics
     */
    getPerformanceStats() {
        if (this.performanceHistory.length === 0) {
            return {
                avgFPS: 0,
                avgMemory: 0,
                samples: 0,
                currentLevel: this.getCurrentLevel().name
            };
        }
        
        const avgFPS = this.performanceHistory.reduce((sum, sample) => sum + sample.fps, 0) / this.performanceHistory.length;
        const avgMemory = this.performanceHistory.reduce((sum, sample) => sum + sample.memoryUsage, 0) / this.performanceHistory.length;
        const minFPS = Math.min(...this.performanceHistory.map(s => s.fps));
        const maxFPS = Math.max(...this.performanceHistory.map(s => s.fps));
        
        return {
            avgFPS: Math.round(avgFPS * 10) / 10,
            avgMemory: Math.round(avgMemory * 10) / 10,
            minFPS,
            maxFPS,
            samples: this.performanceHistory.length,
            currentLevel: this.getCurrentLevel().name,
            consecutiveGoodFrames: this.consecutiveGoodFrames,
            isMonitoring: this.isMonitoring
        };
    }

    /**
     * Reset to optimal level
     */
    reset() {
        this.currentLevel = 0;
        this.performanceHistory = [];
        this.consecutiveGoodFrames = 0;
        this.lastDegradationTime = 0;
        
        if (this.recoveryTimeout) {
            clearTimeout(this.recoveryTimeout);
            this.recoveryTimeout = null;
        }
        
        console.log('DegradationManager reset to optimal level');
        
        this.emit('reset', {
            level: this.getCurrentLevel().name
        });
    }

    /**
     * Event emitter functionality
     */
    emit(event, data) {
        // Simple event emission - can be enhanced with proper EventEmitter
        if (this.onEvent) {
            this.onEvent(event, data);
        }
    }

    /**
     * Set event callback
     * @param {Function} callback - Event callback function
     */
    setEventCallback(callback) {
        this.onEvent = callback;
    }

    /**
     * Manual degradation controls
     */

    /**
     * Manually disable a specific feature
     * @param {string} feature - Feature to disable
     * @returns {Object} Operation result
     */
    disableFeature(feature) {
        if (!this.config.enableManualControls) {
            return ErrorResponse.failure(
                ErrorTypes.FEATURE_NOT_SUPPORTED,
                'Manual controls are disabled',
                { feature, enableManualControls: this.config.enableManualControls }
            );
        }

        const validFeatures = ['particles', 'audio', 'fullEffects', 'animations'];
        if (!validFeatures.includes(feature)) {
            return ErrorResponse.failure(
                ErrorTypes.INVALID_PARAMETER,
                `Invalid feature: ${feature}`,
                { feature, validFeatures }
            );
        }

        this.disabledFeatures.add(feature);
        
        this.errorLogger.logError(
            ErrorResponse.warning(
                ErrorTypes.FEATURE_NOT_SUPPORTED,
                `Feature manually disabled: ${feature}`,
                { feature, disabledFeatures: Array.from(this.disabledFeatures) }
            )
        );

        this.emit('featureDisabled', { feature, manual: true });
        return ErrorResponse.success({ feature, disabled: true });
    }

    /**
     * Manually enable a specific feature
     * @param {string} feature - Feature to enable
     * @returns {Object} Operation result
     */
    enableFeature(feature) {
        if (!this.config.enableManualControls) {
            return ErrorResponse.failure(
                ErrorTypes.FEATURE_NOT_SUPPORTED,
                'Manual controls are disabled',
                { feature, enableManualControls: this.config.enableManualControls }
            );
        }

        if (!this.availableFeatures[feature]) {
            return ErrorResponse.failure(
                ErrorTypes.FEATURE_NOT_SUPPORTED,
                `Feature not available in browser: ${feature}`,
                { feature, availableFeatures: this.availableFeatures }
            );
        }

        this.disabledFeatures.delete(feature);
        
        console.log(`Feature manually enabled: ${feature}`, {
            feature,
            disabledFeatures: Array.from(this.disabledFeatures)
        });

        this.emit('featureEnabled', { feature, manual: true });
        return ErrorResponse.success({ feature, enabled: true });
    }

    /**
     * Set manual override for degradation level
     * @param {string|number|null} level - Level to override to, or null to remove override
     * @returns {Object} Operation result
     */
    setManualOverride(level) {
        if (!this.config.enableManualControls) {
            return ErrorResponse.failure(
                ErrorTypes.FEATURE_NOT_SUPPORTED,
                'Manual controls are disabled'
            );
        }

        if (level === null) {
            this.manualOverride = null;
            console.log('Manual override removed');
            this.emit('manualOverrideRemoved', {});
            return ErrorResponse.success({ override: null });
        }

        const setResult = this.setLevel(level);
        if (setResult) {
            this.manualOverride = this.currentLevel;
            console.log('Manual override set:', {
                level: this.getCurrentLevel().name
            });
            this.emit('manualOverrideSet', { level: this.getCurrentLevel().name });
            return ErrorResponse.success({ override: this.getCurrentLevel().name });
        }

        return ErrorResponse.failure(
            ErrorTypes.INVALID_PARAMETER,
            'Failed to set manual override',
            { level }
        );
    }

    /**
     * Progressive enhancement features
     */

    /**
     * Test browser capability for a specific feature
     * @param {string} feature - Feature to test
     * @param {Function} testFn - Test function that returns boolean
     * @returns {Object} Test result
     */
    testCapability(feature, testFn) {
        if (!this.config.enableProgressiveEnhancement) {
            return ErrorResponse.failure(
                ErrorTypes.FEATURE_NOT_SUPPORTED,
                'Progressive enhancement is disabled'
            );
        }

        try {
            const startTime = performance.now();
            const result = testFn();
            const duration = performance.now() - startTime;

            const testResult = {
                feature,
                supported: Boolean(result),
                duration,
                timestamp: Date.now()
            };

            this.capabilityTests.set(feature, testResult);
            
            console.log(`Capability test completed: ${feature}`, testResult);

            return ErrorResponse.success(testResult);
        } catch (error) {
            const testResult = {
                feature,
                supported: false,
                error: error.message,
                timestamp: Date.now()
            };

            this.capabilityTests.set(feature, testResult);
            
            this.errorLogger.logError(
                ErrorResponse.failure(
                    ErrorTypes.FEATURE_NOT_SUPPORTED,
                    `Capability test failed: ${feature}`,
                    { error: error.message, feature }
                )
            );

            return ErrorResponse.failure(
                ErrorTypes.FEATURE_NOT_SUPPORTED,
                `Capability test failed: ${error.message}`,
                testResult
            );
        }
    }

    /**
     * Get capability test results
     * @returns {Object} All capability test results
     */
    getCapabilityTests() {
        return Object.fromEntries(this.capabilityTests);
    }

    /**
     * Progressive enhancement based on detected capabilities
     * @returns {Object} Enhancement result
     */
    applyProgressiveEnhancement() {
        if (!this.config.enableProgressiveEnhancement) {
            return ErrorResponse.failure(
                ErrorTypes.FEATURE_NOT_SUPPORTED,
                'Progressive enhancement is disabled'
            );
        }

        const enhancements = [];
        const currentLevel = this.getCurrentLevel();

        // Test for enhanced audio capabilities
        if (this.availableFeatures.audio && currentLevel.audioEnabled) {
            const audioTest = this.capabilityTests.get('advancedAudio');
            if (audioTest && audioTest.supported) {
                enhancements.push('advancedAudio');
            }
        }

        // Test for enhanced particle capabilities
        if (this.availableFeatures.particles && currentLevel.particleLimit > 0) {
            const particleTest = this.capabilityTests.get('advancedParticles');
            if (particleTest && particleTest.supported) {
                enhancements.push('advancedParticles');
            }
        }

        // Test for enhanced animation capabilities
        if (this.availableFeatures.animations) {
            const animationTest = this.capabilityTests.get('advancedAnimations');
            if (animationTest && animationTest.supported) {
                enhancements.push('advancedAnimations');
            }
        }

        this.enhancementHistory.push({
            timestamp: Date.now(),
            level: currentLevel.name,
            enhancements: [...enhancements]
        });

        console.log('Progressive enhancement applied:', {
            enhancements,
            level: currentLevel.name
        });

        this.emit('progressiveEnhancementApplied', { enhancements });
        return ErrorResponse.success({ enhancements });
    }

    /**
     * Enhanced feature availability detection
     */

    /**
     * Get detailed feature availability report
     * @returns {Object} Detailed feature report
     */
    getFeatureAvailabilityReport() {
        const currentLevel = this.getCurrentLevel();
        const report = {
            currentLevel: currentLevel.name,
            availableFeatures: {},
            disabledFeatures: Array.from(this.disabledFeatures),
            manualOverride: this.manualOverride,
            browserCapabilities: this.availableFeatures,
            capabilityTests: this.getCapabilityTests(),
            recommendations: []
        };

        // Check each feature availability
        for (const feature of ['particles', 'audio', 'fullEffects', 'animations']) {
            const available = this.isFeatureAvailable(feature);
            const browserSupported = this.availableFeatures[feature];
            const levelSupported = currentLevel.features.includes(feature);
            const manuallyDisabled = this.disabledFeatures.has(feature);

            report.availableFeatures[feature] = {
                available,
                browserSupported,
                levelSupported,
                manuallyDisabled,
                reason: !available ? this.getFeatureUnavailableReason(feature) : null
            };

            // Generate recommendations
            if (!available && browserSupported && !manuallyDisabled) {
                if (!levelSupported) {
                    report.recommendations.push(`${feature} disabled due to performance level - consider improving performance`);
                }
            }
        }

        return report;
    }

    /**
     * Get reason why a feature is unavailable
     * @param {string} feature - Feature name
     * @returns {string} Reason for unavailability
     */
    getFeatureUnavailableReason(feature) {
        if (!this.availableFeatures[feature]) {
            return 'Browser does not support this feature';
        }
        
        if (this.disabledFeatures.has(feature)) {
            return 'Feature manually disabled';
        }
        
        const currentLevel = this.getCurrentLevel();
        if (!currentLevel.features.includes(feature)) {
            return `Feature disabled at ${currentLevel.name} performance level`;
        }
        
        return 'Unknown reason';
    }

    /**
     * Enhanced performance monitoring with degradation context
     */

    /**
     * Check performance with enhanced error handling
     * @param {Object} metrics - Performance metrics
     * @returns {Object} Performance check result
     */
    checkPerformanceEnhanced(metrics = {}) {
        try {
            // Skip if manual override is active
            if (this.manualOverride !== null) {
                return ErrorResponse.success({
                    message: 'Performance check skipped - manual override active',
                    manualOverride: this.getCurrentLevel().name
                });
            }

            this.checkPerformance(metrics);
            
            return ErrorResponse.success({
                message: 'Performance check completed',
                currentLevel: this.getCurrentLevel().name,
                metrics: this.getPerformanceStats()
            });
        } catch (error) {
            this.errorLogger.logError(
                ErrorResponse.failure(
                    ErrorTypes.PERFORMANCE_DEGRADED,
                    'Performance check failed',
                    { error: error.message, metrics }
                )
            );
            
            return ErrorResponse.failure(
                ErrorTypes.PERFORMANCE_DEGRADED,
                'Performance check failed',
                { error: error.message }
            );
        }
    }

    /**
     * Get comprehensive degradation status
     * @returns {Object} Complete degradation status
     */
    getDegradationStatus() {
        return {
            currentLevel: this.getCurrentLevel(),
            availableFeatures: this.getAvailableFeatures(),
            featureReport: this.getFeatureAvailabilityReport(),
            performanceStats: this.getPerformanceStats(),
            config: {
                enableAutoOptimization: this.config.enableAutoOptimization,
                enableManualControls: this.config.enableManualControls,
                enableProgressiveEnhancement: this.config.enableProgressiveEnhancement,
                performanceThreshold: this.config.performanceThreshold,
                memoryThreshold: this.config.memoryThreshold
            },
            history: {
                performance: this.performanceHistory.slice(-10), // Last 10 samples
                enhancements: this.enhancementHistory.slice(-5) // Last 5 enhancements
            }
        };
    }

    /**
     * Cleanup resources
     */
    destroy() {
        this.stopMonitoring();
        this.performanceHistory = [];
        this.enhancementHistory = [];
        this.capabilityTests.clear();
        this.disabledFeatures.clear();
        this.onEvent = null;
        this.manualOverride = null;
        
        console.log('DegradationManager destroyed');
    }
}

export default DegradationManager;