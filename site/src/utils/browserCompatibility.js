/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝                                                                             
 *                 ◐ ◑ ◒ ◓  BROWSER COMPATIBILITY  ◓ ◒ ◑ ◐                 
 *                                                                                    
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Browser Compatibility - Feature Detection & Graceful Degradation
 * @author Emotive Engine Team
 * @version 2.0.0
 * @module BrowserCompatibility
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ The COMPATIBILITY LAYER of the engine. Ensures the Emotive Engine runs           
 * ║ smoothly across all modern browsers by detecting features, providing              
 * ║ polyfills, and enabling graceful degradation when features are missing.           
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🌐 BROWSER FEATURES                                                               
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Web Audio API detection and fallbacks                                           
 * │ • Canvas 2D context recovery and management                                       
 * │ • RequestAnimationFrame polyfills                                                 
 * │ • Device pixel ratio handling                                                     
 * │ • Performance API detection                                                       
 * │ • Media device capabilities                                                       
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Feature detection utilities
 */
export class FeatureDetection {
    constructor() {
        // Cache detection results to avoid repeated expensive checks
        if (FeatureDetection._cachedFeatures) {
            this.features = FeatureDetection._cachedFeatures;
            this.capabilities = FeatureDetection._cachedCapabilities;
            return;
        }
        
        this.features = {
            webAudio: this.detectWebAudio(),
            canvas2d: this.detectCanvas2D(),
            requestAnimationFrame: this.detectRequestAnimationFrame(),
            devicePixelRatio: this.detectDevicePixelRatio(),
            audioContext: this.detectAudioContext(),
            mediaDevices: this.detectMediaDevices(),
            performance: this.detectPerformance(),
            intersectionObserver: this.detectIntersectionObserver()
        };
        
        this.capabilities = this.assessCapabilities();
        
        // Cache results for future instantiations
        FeatureDetection._cachedFeatures = this.features;
        FeatureDetection._cachedCapabilities = this.capabilities;
    }

    /**
     * Detect Web Audio API support
     * @returns {boolean} True if Web Audio API is supported
     */
    detectWebAudio() {
        try {
            return !!(window.AudioContext || window.webkitAudioContext);
        } catch (e) {
            return false;
        }
    }

    /**
     * Detect Canvas 2D support
     * @returns {boolean} True if Canvas 2D is supported
     */
    detectCanvas2D() {
        try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext && canvas.getContext('2d'));
        } catch (e) {
            return false;
        }
    }

    /**
     * Detect requestAnimationFrame support
     * @returns {boolean} True if requestAnimationFrame is supported
     */
    detectRequestAnimationFrame() {
        return !!(window.requestAnimationFrame || 
                 window.webkitRequestAnimationFrame || 
                 window.mozRequestAnimationFrame || 
                 window.oRequestAnimationFrame || 
                 window.msRequestAnimationFrame);
    }

    /**
     * Detect device pixel ratio support
     * @returns {boolean} True if devicePixelRatio is supported
     */
    detectDevicePixelRatio() {
        return typeof window.devicePixelRatio === 'number';
    }

    /**
     * Detect AudioContext support (more specific than Web Audio)
     * @returns {boolean} True if AudioContext is supported
     */
    detectAudioContext() {
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) return false;
            
            // Don't create a test context - just check if the class exists
            // Creating contexts is expensive and has limits
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Detect MediaDevices API support
     * @returns {boolean} True if MediaDevices API is supported
     */
    detectMediaDevices() {
        return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    }

    /**
     * Detect Performance API support
     * @returns {boolean} True if Performance API is supported
     */
    detectPerformance() {
        return !!(window.performance && window.performance.now);
    }

    /**
     * Detect Intersection Observer support
     * @returns {boolean} True if Intersection Observer is supported
     */
    detectIntersectionObserver() {
        return typeof window.IntersectionObserver === 'function';
    }

    /**
     * Assess overall browser capabilities
     * @returns {Object} Capability assessment
     */
    assessCapabilities() {
        const score = Object.values(this.features).filter(Boolean).length;
        const total = Object.keys(this.features).length;
        const percentage = (score / total) * 100;

        let level = 'basic';
        if (percentage >= 90) level = 'full';
        else if (percentage >= 70) level = 'good';
        else if (percentage >= 50) level = 'limited';

        return {
            score,
            total,
            percentage,
            level,
            recommendations: this.getRecommendations(level)
        };
    }

    /**
     * Get recommendations based on capability level
     * @param {string} level - Capability level
     * @returns {Array<string>} Array of recommendations
     */
    getRecommendations(level) {
        const recommendations = [];

        if (!this.features.webAudio) {
            recommendations.push('Audio features will be disabled');
        }
        if (!this.features.requestAnimationFrame) {
            recommendations.push('Animation will use setTimeout fallback');
        }
        if (!this.features.performance) {
            recommendations.push('Performance monitoring will be limited');
        }
        if (level === 'basic') {
            recommendations.push('Consider using minimal build for better performance');
        }

        return recommendations;
    }

    /**
     * Get all detected features
     * @returns {Object} Feature detection results
     */
    getFeatures() {
        return { ...this.features };
    }

    /**
     * Get capability assessment
     * @returns {Object} Capability assessment
     */
    getCapabilities() {
        return { ...this.capabilities };
    }
}

/**
 * Polyfill manager for missing browser features
 */
export class PolyfillManager {
    constructor() {
        this.polyfills = new Map();
        this.applied = new Set();
    }

    /**
     * Register a polyfill
     * @param {string} feature - Feature name
     * @param {Function} polyfillFn - Polyfill function
     */
    register(feature, polyfillFn) {
        this.polyfills.set(feature, polyfillFn);
    }

    /**
     * Apply a specific polyfill
     * @param {string} feature - Feature name
     * @returns {boolean} True if polyfill was applied
     */
    apply(feature) {
        if (this.applied.has(feature)) {
            return true; // Already applied
        }

        const polyfillFn = this.polyfills.get(feature);
        if (!polyfillFn) {
            // No polyfill registered for feature
            return false;
        }

        try {
            polyfillFn();
            this.applied.add(feature);
            // Applied polyfill for feature
            return true;
        } catch (error) {
            // Failed to apply polyfill for feature
            return false;
        }
    }

    /**
     * Apply all registered polyfills
     * @returns {Array<string>} Array of successfully applied polyfills
     */
    applyAll() {
        const applied = [];
        for (const feature of this.polyfills.keys()) {
            if (this.apply(feature)) {
                applied.push(feature);
            }
        }
        return applied;
    }

    /**
     * Check if a polyfill has been applied
     * @param {string} feature - Feature name
     * @returns {boolean} True if polyfill has been applied
     */
    isApplied(feature) {
        return this.applied.has(feature);
    }
}

/**
 * RequestAnimationFrame polyfill
 */
export function polyfillRequestAnimationFrame() {
    if (window.requestAnimationFrame) return;

    // Try vendor prefixes first
    window.requestAnimationFrame = 
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(callback) {
            return window.setTimeout(function() {
                callback(Date.now());
            }, 1000 / 60); // 60 FPS fallback
        };

    window.cancelAnimationFrame = 
        window.webkitCancelAnimationFrame ||
        window.mozCancelAnimationFrame ||
        window.oCancelAnimationFrame ||
        window.msCancelAnimationFrame ||
        function(id) {
            window.clearTimeout(id);
        };
}

/**
 * Performance.now polyfill
 */
export function polyfillPerformanceNow() {
    if (window.performance && window.performance.now) return;

    if (!window.performance) {
        window.performance = {};
    }

    const startTime = Date.now();
    window.performance.now = function() {
        return Date.now() - startTime;
    };
}

/**
 * Web Audio API polyfill (basic fallback)
 */
export function polyfillWebAudio() {
    if (window.AudioContext || window.webkitAudioContext) return;

    // Create a minimal AudioContext-like interface
    window.AudioContext = function() {
        this.state = 'suspended';
        this.sampleRate = 44100;
        this.currentTime = 0;
        this.destination = {
            connect: function() {},
            disconnect: function() {}
        };

        this.createGain = function() {
            return {
                gain: { value: 1 },
                connect: function() {},
                disconnect: function() {}
            };
        };

        this.createOscillator = function() {
            return {
                frequency: { value: 440 },
                type: 'sine',
                start: function() {},
                stop: function() {},
                connect: function() {},
                disconnect: function() {}
            };
        };

        this.createAnalyser = function() {
            return {
                fftSize: 2048,
                frequencyBinCount: 1024,
                getByteFrequencyData: function(array) {
                    // Fill with zeros
                    for (let i = 0; i < array.length; i++) {
                        array[i] = 0;
                    }
                },
                connect: function() {},
                disconnect: function() {}
            };
        };

        this.resume = function() {
            this.state = 'running';
            return Promise.resolve();
        };

        this.suspend = function() {
            this.state = 'suspended';
            return Promise.resolve();
        };

        this.close = function() {
            this.state = 'closed';
            return Promise.resolve();
        };
    };

    // Web Audio API not supported - using fallback implementation
}

/**
 * Canvas context recovery utilities
 */
export class CanvasContextRecovery {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = null;
        this.isContextLost = false;
        this.recoveryCallbacks = [];
        
        this.setupContextLossHandling();
    }

    /**
     * Set up context loss and recovery handling
     */
    setupContextLossHandling() {
        this.canvas.addEventListener('webglcontextlost', (event) => {
            event.preventDefault();
            this.isContextLost = true;
            // Canvas context lost
        });

        this.canvas.addEventListener('webglcontextrestored', () => {
            this.isContextLost = false;
            this.context = this.canvas.getContext('2d');
            // Canvas context restored
            
            // Execute recovery callbacks
            this.recoveryCallbacks.forEach(callback => {
                try {
                    callback(this.context);
                } catch (error) {
                    // Context recovery callback failed
                }
            });
        });
    }

    /**
     * Get the canvas context with recovery handling
     * @returns {CanvasRenderingContext2D|null} Canvas context or null if lost
     */
    getContext() {
        if (this.isContextLost) {
            return null;
        }

        if (!this.context) {
            try {
                this.context = this.canvas.getContext('2d');
            } catch (error) {
                // Failed to get canvas context
                return null;
            }
        }

        return this.context;
    }

    /**
     * Add a callback to execute when context is recovered
     * @param {Function} callback - Recovery callback
     */
    onRecovery(callback) {
        this.recoveryCallbacks.push(callback);
    }

    /**
     * Check if context is currently lost
     * @returns {boolean} True if context is lost
     */
    isLost() {
        return this.isContextLost;
    }

    /**
     * Attempt to recover the context manually
     * @returns {boolean} True if recovery was successful
     */
    recover() {
        if (!this.isContextLost) {
            return true;
        }

        try {
            this.context = this.canvas.getContext('2d');
            if (this.context) {
                this.isContextLost = false;
                return true;
            }
        } catch (error) {
            // Manual context recovery failed
        }

        return false;
    }
}

/**
 * Browser-specific optimization manager
 */
export class BrowserOptimizations {
    constructor() {
        // Cache browser detection
        if (BrowserOptimizations._cachedBrowser) {
            this.browser = BrowserOptimizations._cachedBrowser;
            this.optimizations = BrowserOptimizations._cachedOptimizations;
            return;
        }
        
        this.browser = this.detectBrowser();
        this.optimizations = new Map();
        this.setupOptimizations();
        
        // Cache for future instances
        BrowserOptimizations._cachedBrowser = this.browser;
        BrowserOptimizations._cachedOptimizations = this.optimizations;
    }

    /**
     * Detect the current browser
     * @returns {Object} Browser information
     */
    detectBrowser() {
        const userAgent = navigator.userAgent;
        
        let name = 'unknown';
        let version = 'unknown';
        
        if (userAgent.includes('Chrome')) {
            name = 'chrome';
            const match = userAgent.match(/Chrome\/(\d+)/);
            version = match ? match[1] : 'unknown';
        } else if (userAgent.includes('Firefox')) {
            name = 'firefox';
            const match = userAgent.match(/Firefox\/(\d+)/);
            version = match ? match[1] : 'unknown';
        } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
            name = 'safari';
            const match = userAgent.match(/Version\/(\d+)/);
            version = match ? match[1] : 'unknown';
        } else if (userAgent.includes('Edge')) {
            name = 'edge';
            const match = userAgent.match(/Edge\/(\d+)/);
            version = match ? match[1] : 'unknown';
        }

        return { name, version, userAgent };
    }

    /**
     * Set up browser-specific optimizations
     */
    setupOptimizations() {
        // Chrome optimizations
        this.optimizations.set('chrome', {
            preferredAnimationMethod: 'requestAnimationFrame',
            audioContextOptions: { latencyHint: 'interactive' },
            canvasOptimizations: ['willReadFrequently'],
            particleLimit: 50
        });

        // Firefox optimizations
        this.optimizations.set('firefox', {
            preferredAnimationMethod: 'requestAnimationFrame',
            audioContextOptions: { latencyHint: 'balanced' },
            canvasOptimizations: [],
            particleLimit: 40
        });

        // Safari optimizations
        this.optimizations.set('safari', {
            preferredAnimationMethod: 'requestAnimationFrame',
            audioContextOptions: { latencyHint: 'playback' },
            canvasOptimizations: [],
            particleLimit: 30
        });

        // Edge optimizations
        this.optimizations.set('edge', {
            preferredAnimationMethod: 'requestAnimationFrame',
            audioContextOptions: { latencyHint: 'interactive' },
            canvasOptimizations: ['willReadFrequently'],
            particleLimit: 45
        });
    }

    /**
     * Get optimizations for the current browser
     * @returns {Object} Browser-specific optimizations
     */
    getOptimizations() {
        return this.optimizations.get(this.browser.name) || this.optimizations.get('chrome');
    }

    /**
     * Get browser information
     * @returns {Object} Browser information
     */
    getBrowser() {
        return { ...this.browser };
    }

    /**
     * Apply canvas optimizations
     * @param {HTMLCanvasElement} canvas - Canvas element
     * @param {CanvasRenderingContext2D} context - Canvas context
     */
    applyCanvasOptimizations(canvas, context) {
        const opts = this.getOptimizations();
        
        if (opts.canvasOptimizations.includes('willReadFrequently')) {
            try {
                // Re-get context with optimization hint
                const optimizedContext = canvas.getContext('2d', { willReadFrequently: true });
                if (optimizedContext) {
                    // Applied willReadFrequently optimization
                }
            } catch (error) {
                // Failed to apply canvas optimization
            }
        }
    }

    /**
     * Get recommended particle limit for current browser
     * @returns {number} Recommended particle limit
     */
    getRecommendedParticleLimit() {
        return this.getOptimizations().particleLimit;
    }

    /**
     * Get audio context options for current browser
     * @returns {Object} Audio context options
     */
    getAudioContextOptions() {
        return this.getOptimizations().audioContextOptions;
    }
}

/**
 * Initialize all polyfills and compatibility features
 * @returns {Object} Initialization results
 */
let _initializationCache = null;

export function initializeBrowserCompatibility() {
    // Return cached result if already initialized
    if (_initializationCache) {
        return _initializationCache;
    }
    
    const featureDetection = new FeatureDetection();
    const polyfillManager = new PolyfillManager();
    const browserOptimizations = new BrowserOptimizations();

    // Register polyfills
    polyfillManager.register('requestAnimationFrame', polyfillRequestAnimationFrame);
    polyfillManager.register('performanceNow', polyfillPerformanceNow);
    polyfillManager.register('webAudio', polyfillWebAudio);

    // Apply necessary polyfills based on feature detection
    const appliedPolyfills = [];
    
    if (!featureDetection.features.requestAnimationFrame) {
        if (polyfillManager.apply('requestAnimationFrame')) {
            appliedPolyfills.push('requestAnimationFrame');
        }
    }
    
    if (!featureDetection.features.performance) {
        if (polyfillManager.apply('performanceNow')) {
            appliedPolyfills.push('performanceNow');
        }
    }
    
    if (!featureDetection.features.webAudio) {
        if (polyfillManager.apply('webAudio')) {
            appliedPolyfills.push('webAudio');
        }
    }

    // Cache the result
    _initializationCache = {
        featureDetection,
        polyfillManager,
        browserOptimizations,
        appliedPolyfills,
        capabilities: featureDetection.getCapabilities(),
        browser: browserOptimizations.getBrowser()
    };
    
    return _initializationCache;
}

// Create singleton instance lazily
let _browserCompatibilityInstance = null;

export function getBrowserCompatibility() {
    if (!_browserCompatibilityInstance) {
        _browserCompatibilityInstance = initializeBrowserCompatibility();
    }
    return _browserCompatibilityInstance;
}

// Export getter for backward compatibility
export const browserCompatibility = getBrowserCompatibility();