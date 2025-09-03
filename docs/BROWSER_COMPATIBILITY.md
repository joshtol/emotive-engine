# Browser Compatibility Guide

## Overview

The Emotive Communication Engine is designed to work across a wide range of browsers and devices. This guide provides detailed compatibility information, feature support matrices, and implementation strategies for different browser environments.

## Supported Browsers

### Desktop Browsers

#### Chrome/Chromium
- **Minimum Version**: Chrome 60+ (September 2017)
- **Recommended Version**: Chrome 90+ (April 2021)
- **Support Level**: Full ✅
- **Performance**: Excellent
- **Special Features**: 
  - Full Web Audio API support
  - Hardware acceleration
  - Advanced canvas features
  - WebGL support

#### Firefox
- **Minimum Version**: Firefox 55+ (August 2017)
- **Recommended Version**: Firefox 88+ (April 2021)
- **Support Level**: Full ✅
- **Performance**: Very Good
- **Special Features**:
  - Excellent developer tools
  - Strong privacy features
  - Good Web Audio API support

#### Safari
- **Minimum Version**: Safari 11+ (September 2017)
- **Recommended Version**: Safari 14+ (September 2020)
- **Support Level**: Full ✅
- **Performance**: Very Good
- **Special Features**:
  - Optimized for macOS
  - Energy efficient
  - Limited Web Audio API (requires user interaction)

#### Microsoft Edge
- **Minimum Version**: Edge 79+ (January 2020, Chromium-based)
- **Legacy Edge**: Limited support (Edge 16-18)
- **Support Level**: Full ✅
- **Performance**: Excellent
- **Special Features**:
  - Similar to Chrome performance
  - Good Windows integration

#### Internet Explorer
- **Version**: IE 11 only
- **Support Level**: Limited ⚠️
- **Performance**: Poor
- **Limitations**:
  - No Web Audio API
  - Limited canvas features
  - Requires polyfills
  - Reduced functionality

### Mobile Browsers

#### iOS Safari
- **Minimum Version**: iOS 11+ (September 2017)
- **Recommended Version**: iOS 14+ (September 2020)
- **Support Level**: Full ✅
- **Performance**: Very Good
- **Special Considerations**:
  - Audio requires user interaction
  - Memory limitations
  - Viewport handling differences

#### Chrome Mobile (Android)
- **Minimum Version**: Chrome 60+ (September 2017)
- **Recommended Version**: Chrome 90+ (April 2021)
- **Support Level**: Full ✅
- **Performance**: Good to Very Good
- **Special Considerations**:
  - Performance varies by device
  - Memory management important

#### Samsung Internet
- **Minimum Version**: Samsung Internet 8.0+ (April 2018)
- **Support Level**: Full ✅
- **Performance**: Good
- **Special Features**:
  - Based on Chromium
  - Samsung-specific optimizations

#### Firefox Mobile
- **Minimum Version**: Firefox 68+ (July 2019)
- **Support Level**: Full ✅
- **Performance**: Good
- **Special Features**:
  - Desktop-like features
  - Extension support

## Feature Support Matrix

### Core Features

| Feature | Chrome | Firefox | Safari | Edge | IE11 | iOS Safari | Chrome Mobile |
|---------|--------|---------|--------|------|------|------------|---------------|
| Canvas 2D | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| requestAnimationFrame | ✅ | ✅ | ✅ | ✅ | ⚠️* | ✅ | ✅ |
| Web Audio API | ✅ | ✅ | ⚠️** | ✅ | ❌ | ⚠️** | ✅ |
| ES6 Modules | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| CSS Custom Properties | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| Intersection Observer | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| Performance API | ✅ | ✅ | ✅ | ✅ | ⚠️* | ✅ | ✅ |

*Requires polyfill  
**Requires user interaction

### Advanced Features

| Feature | Chrome | Firefox | Safari | Edge | IE11 | iOS Safari | Chrome Mobile |
|---------|--------|---------|--------|------|------|------------|---------------|
| WebGL | ✅ | ✅ | ✅ | ✅ | ⚠️* | ✅ | ✅ |
| OffscreenCanvas | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ |
| AudioWorklet | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ |
| ResizeObserver | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| MediaDevices API | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| Gamepad API | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ |

*Limited support

### Accessibility Features

| Feature | Chrome | Firefox | Safari | Edge | IE11 | iOS Safari | Chrome Mobile |
|---------|--------|---------|--------|------|------|------------|---------------|
| ARIA Support | ✅ | ✅ | ✅ | ✅ | ⚠️* | ✅ | ✅ |
| Screen Reader API | ✅ | ✅ | ✅ | ✅ | ⚠️* | ✅ | ✅ |
| Reduced Motion | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| High Contrast | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Focus Management | ✅ | ✅ | ✅ | ✅ | ⚠️* | ✅ | ✅ |

*Partial support

## Browser-Specific Implementation

### Chrome/Chromium Optimization

```javascript
class ChromeOptimizations {
    constructor(mascot) {
        this.mascot = mascot;
        this.isChrome = this.detectChrome();
        
        if (this.isChrome) {
            this.applyOptimizations();
        }
    }
    
    detectChrome() {
        return /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    }
    
    applyOptimizations() {
        // Enable hardware acceleration
        this.mascot.setRenderingMode('hardware-accelerated');
        
        // Use advanced Web Audio features
        this.mascot.enableAdvancedAudio({
            audioWorklet: true,
            spatialAudio: true,
            dynamicRange: true
        });
        
        // Optimize for V8 engine
        this.mascot.setOptimizationLevel('aggressive');
        
        // Enable experimental features
        if (this.detectExperimentalFeatures()) {
            this.mascot.enableExperimentalFeatures();
        }
    }
    
    detectExperimentalFeatures() {
        return 'OffscreenCanvas' in window && 'AudioWorklet' in window;
    }
}
```

### Firefox Optimization

```javascript
class FirefoxOptimizations {
    constructor(mascot) {
        this.mascot = mascot;
        this.isFirefox = this.detectFirefox();
        
        if (this.isFirefox) {
            this.applyOptimizations();
        }
    }
    
    detectFirefox() {
        return navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    }
    
    applyOptimizations() {
        // Optimize for Gecko engine
        this.mascot.setRenderingMode('gecko-optimized');
        
        // Adjust memory management for Firefox
        this.mascot.setMemoryManagement({
            aggressiveCleanup: true,
            gcHints: true
        });
        
        // Firefox-specific audio settings
        this.mascot.setAudioSettings({
            bufferSize: 4096, // Larger buffer for Firefox
            sampleRate: 44100
        });
        
        // Enable Firefox developer tools integration
        if (this.isDevToolsOpen()) {
            this.mascot.enableDebugMode();
        }
    }
    
    isDevToolsOpen() {
        return window.devtools && window.devtools.open;
    }
}
```

### Safari Optimization

```javascript
class SafariOptimizations {
    constructor(mascot) {
        this.mascot = mascot;
        this.isSafari = this.detectSafari();
        this.isMobileSafari = this.detectMobileSafari();
        
        if (this.isSafari) {
            this.applyOptimizations();
        }
    }
    
    detectSafari() {
        return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    }
    
    detectMobileSafari() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    }
    
    applyOptimizations() {
        // Safari-specific rendering optimizations
        this.mascot.setRenderingMode('webkit-optimized');
        
        // Handle Safari's audio restrictions
        this.setupAudioForSafari();
        
        // Optimize for WebKit engine
        this.mascot.setOptimizationLevel('webkit');
        
        // Handle Safari's memory management
        this.setupMemoryManagement();
        
        // Mobile Safari specific optimizations
        if (this.isMobileSafari) {
            this.applyMobileOptimizations();
        }
    }
    
    setupAudioForSafari() {
        // Audio requires user interaction in Safari
        this.mascot.setAudioSettings({
            requireUserInteraction: true,
            fallbackToVisualOnly: true,
            showAudioPrompt: true
        });
        
        // Create audio unlock mechanism
        this.createAudioUnlockButton();
    }
    
    createAudioUnlockButton() {
        const button = document.createElement('button');
        button.textContent = '🔊 Enable Audio';
        button.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            padding: 10px 15px;
            background: #007AFF;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        `;
        
        button.addEventListener('click', async () => {
            try {
                const audioContext = this.mascot.getAudioContext();
                if (audioContext && audioContext.state === 'suspended') {
                    await audioContext.resume();
                    button.style.display = 'none';
                }
            } catch (error) {
                console.warn('Failed to enable audio:', error);
            }
        });
        
        document.body.appendChild(button);
    }
    
    setupMemoryManagement() {
        // Safari has stricter memory limits
        this.mascot.setMemoryLimits({
            maxParticles: 25,
            maxCacheSize: 10 * 1024 * 1024, // 10MB
            aggressiveCleanup: true
        });
    }
    
    applyMobileOptimizations() {
        // Reduce performance for mobile Safari
        this.mascot.setPerformanceSettings({
            targetFPS: 30,
            maxParticles: 15,
            reducedEffects: true
        });
        
        // Handle viewport changes
        this.setupViewportHandling();
    }
    
    setupViewportHandling() {
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.mascot.handleViewportChange();
            }, 100);
        });
    }
}
```

### Internet Explorer 11 Support

```javascript
class IE11Compatibility {
    constructor(mascot) {
        this.mascot = mascot;
        this.isIE11 = this.detectIE11();
        
        if (this.isIE11) {
            this.setupCompatibility();
        }
    }
    
    detectIE11() {
        return !!window.MSInputMethodContext && !!document.documentMode;
    }
    
    setupCompatibility() {
        console.warn('Internet Explorer 11 detected. Limited functionality available.');
        
        // Load polyfills
        this.loadPolyfills();
        
        // Disable unsupported features
        this.disableUnsupportedFeatures();
        
        // Apply IE11-specific settings
        this.applyIE11Settings();
    }
    
    loadPolyfills() {
        // requestAnimationFrame polyfill
        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = function(callback) {
                return setTimeout(callback, 16);
            };
            window.cancelAnimationFrame = function(id) {
                clearTimeout(id);
            };
        }
        
        // Performance.now polyfill
        if (!window.performance || !window.performance.now) {
            window.performance = window.performance || {};
            window.performance.now = function() {
                return Date.now();
            };
        }
        
        // Object.assign polyfill
        if (!Object.assign) {
            Object.assign = function(target) {
                for (var i = 1; i < arguments.length; i++) {
                    var source = arguments[i];
                    for (var key in source) {
                        if (source.hasOwnProperty(key)) {
                            target[key] = source[key];
                        }
                    }
                }
                return target;
            };
        }
    }
    
    disableUnsupportedFeatures() {
        // Disable Web Audio API
        this.mascot.disableAudio();
        
        // Disable advanced canvas features
        this.mascot.setRenderingMode('basic');
        
        // Disable ES6 features
        this.mascot.setCompatibilityMode('es5');
    }
    
    applyIE11Settings() {
        this.mascot.setPerformanceSettings({
            targetFPS: 30,
            maxParticles: 10,
            simplifiedRendering: true,
            disableTransparency: true
        });
        
        // Show compatibility notice
        this.showCompatibilityNotice();
    }
    
    showCompatibilityNotice() {
        const notice = document.createElement('div');
        notice.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            right: 10px;
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 10px;
            border-radius: 4px;
            z-index: 1000;
            font-family: Arial, sans-serif;
            font-size: 14px;
        `;
        notice.innerHTML = `
            <strong>Compatibility Mode:</strong> 
            You're using Internet Explorer 11. Some features are disabled for compatibility. 
            For the best experience, please use a modern browser like Chrome, Firefox, or Edge.
            <button onclick="this.parentNode.style.display='none'" style="float: right; background: none; border: none; font-size: 16px; cursor: pointer;">&times;</button>
        `;
        
        document.body.appendChild(notice);
    }
}
```

## Feature Detection and Polyfills

### Comprehensive Feature Detection

```javascript
class FeatureDetector {
    constructor() {
        this.features = this.detectAllFeatures();
    }
    
    detectAllFeatures() {
        return {
            // Core features
            canvas2d: this.detectCanvas2D(),
            webgl: this.detectWebGL(),
            webAudio: this.detectWebAudio(),
            requestAnimationFrame: this.detectRequestAnimationFrame(),
            
            // ES6+ features
            es6Modules: this.detectES6Modules(),
            es6Classes: this.detectES6Classes(),
            es6ArrowFunctions: this.detectArrowFunctions(),
            
            // Modern APIs
            intersectionObserver: this.detectIntersectionObserver(),
            resizeObserver: this.detectResizeObserver(),
            performanceObserver: this.detectPerformanceObserver(),
            
            // Audio features
            audioContext: this.detectAudioContext(),
            audioWorklet: this.detectAudioWorklet(),
            mediaDevices: this.detectMediaDevices(),
            
            // Accessibility features
            ariaSupport: this.detectARIASupport(),
            reducedMotion: this.detectReducedMotion(),
            highContrast: this.detectHighContrast(),
            
            // Mobile features
            touchEvents: this.detectTouchEvents(),
            deviceOrientation: this.detectDeviceOrientation(),
            vibration: this.detectVibration()
        };
    }
    
    detectCanvas2D() {
        try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext && canvas.getContext('2d'));
        } catch (e) {
            return false;
        }
    }
    
    detectWebGL() {
        try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        } catch (e) {
            return false;
        }
    }
    
    detectWebAudio() {
        return !!(window.AudioContext || window.webkitAudioContext);
    }
    
    detectRequestAnimationFrame() {
        return !!(window.requestAnimationFrame || 
                 window.webkitRequestAnimationFrame || 
                 window.mozRequestAnimationFrame || 
                 window.msRequestAnimationFrame);
    }
    
    detectES6Modules() {
        try {
            return typeof Symbol !== 'undefined' && 
                   typeof Symbol.iterator !== 'undefined';
        } catch (e) {
            return false;
        }
    }
    
    detectES6Classes() {
        try {
            eval('class TestClass {}');
            return true;
        } catch (e) {
            return false;
        }
    }
    
    detectArrowFunctions() {
        try {
            eval('() => {}');
            return true;
        } catch (e) {
            return false;
        }
    }
    
    detectIntersectionObserver() {
        return 'IntersectionObserver' in window;
    }
    
    detectResizeObserver() {
        return 'ResizeObserver' in window;
    }
    
    detectPerformanceObserver() {
        return 'PerformanceObserver' in window;
    }
    
    detectAudioContext() {
        return this.detectWebAudio();
    }
    
    detectAudioWorklet() {
        return 'AudioWorklet' in window;
    }
    
    detectMediaDevices() {
        return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    }
    
    detectARIASupport() {
        const testElement = document.createElement('div');
        testElement.setAttribute('aria-label', 'test');
        return testElement.getAttribute('aria-label') === 'test';
    }
    
    detectReducedMotion() {
        return window.matchMedia && 
               window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    
    detectHighContrast() {
        return window.matchMedia && 
               window.matchMedia('(prefers-contrast: high)').matches;
    }
    
    detectTouchEvents() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
    
    detectDeviceOrientation() {
        return 'DeviceOrientationEvent' in window;
    }
    
    detectVibration() {
        return 'vibrate' in navigator;
    }
    
    getFeatureReport() {
        const supported = Object.values(this.features).filter(Boolean).length;
        const total = Object.keys(this.features).length;
        
        return {
            features: this.features,
            supportLevel: Math.round((supported / total) * 100),
            supported: supported,
            total: total,
            missing: Object.keys(this.features).filter(key => !this.features[key])
        };
    }
}

// Usage
const detector = new FeatureDetector();
const report = detector.getFeatureReport();
console.log('Browser Feature Support:', report);
```

### Polyfill Manager

```javascript
class PolyfillManager {
    constructor() {
        this.polyfills = new Map();
        this.loadedPolyfills = new Set();
        
        this.registerPolyfills();
    }
    
    registerPolyfills() {
        // requestAnimationFrame polyfill
        this.polyfills.set('requestAnimationFrame', () => {
            if (!window.requestAnimationFrame) {
                window.requestAnimationFrame = (function() {
                    return window.webkitRequestAnimationFrame ||
                           window.mozRequestAnimationFrame ||
                           window.msRequestAnimationFrame ||
                           function(callback) {
                               return window.setTimeout(callback, 1000 / 60);
                           };
                })();
                
                window.cancelAnimationFrame = (function() {
                    return window.webkitCancelAnimationFrame ||
                           window.mozCancelAnimationFrame ||
                           window.msCancelAnimationFrame ||
                           function(id) {
                               window.clearTimeout(id);
                           };
                })();
            }
        });
        
        // Performance.now polyfill
        this.polyfills.set('performance', () => {
            if (!window.performance) {
                window.performance = {};
            }
            
            if (!window.performance.now) {
                const startTime = Date.now();
                window.performance.now = function() {
                    return Date.now() - startTime;
                };
            }
        });
        
        // Object.assign polyfill
        this.polyfills.set('objectAssign', () => {
            if (!Object.assign) {
                Object.assign = function(target) {
                    if (target == null) {
                        throw new TypeError('Cannot convert undefined or null to object');
                    }
                    
                    const to = Object(target);
                    
                    for (let index = 1; index < arguments.length; index++) {
                        const nextSource = arguments[index];
                        
                        if (nextSource != null) {
                            for (const nextKey in nextSource) {
                                if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                                    to[nextKey] = nextSource[nextKey];
                                }
                            }
                        }
                    }
                    
                    return to;
                };
            }
        });
        
        // Array.from polyfill
        this.polyfills.set('arrayFrom', () => {
            if (!Array.from) {
                Array.from = function(arrayLike, mapFn, thisArg) {
                    const C = this;
                    const items = Object(arrayLike);
                    
                    if (arrayLike == null) {
                        throw new TypeError('Array.from requires an array-like object');
                    }
                    
                    const len = parseInt(items.length) || 0;
                    const A = typeof C === 'function' ? Object(new C(len)) : new Array(len);
                    
                    let k = 0;
                    let kValue;
                    
                    while (k < len) {
                        kValue = items[k];
                        if (mapFn) {
                            A[k] = typeof thisArg === 'undefined' ? 
                                   mapFn(kValue, k) : 
                                   mapFn.call(thisArg, kValue, k);
                        } else {
                            A[k] = kValue;
                        }
                        k += 1;
                    }
                    
                    A.length = len;
                    return A;
                };
            }
        });
        
        // IntersectionObserver polyfill (simplified)
        this.polyfills.set('intersectionObserver', () => {
            if (!window.IntersectionObserver) {
                window.IntersectionObserver = class {
                    constructor(callback, options = {}) {
                        this.callback = callback;
                        this.options = options;
                        this.observed = new Set();
                    }
                    
                    observe(element) {
                        this.observed.add(element);
                        // Simplified: always consider elements as intersecting
                        setTimeout(() => {
                            this.callback([{
                                target: element,
                                isIntersecting: true,
                                intersectionRatio: 1
                            }]);
                        }, 0);
                    }
                    
                    unobserve(element) {
                        this.observed.delete(element);
                    }
                    
                    disconnect() {
                        this.observed.clear();
                    }
                };
            }
        });
    }
    
    loadPolyfill(name) {
        if (this.loadedPolyfills.has(name)) {
            return Promise.resolve();
        }
        
        const polyfill = this.polyfills.get(name);
        if (!polyfill) {
            return Promise.reject(new Error(`Polyfill '${name}' not found`));
        }
        
        try {
            polyfill();
            this.loadedPolyfills.add(name);
            console.log(`Polyfill loaded: ${name}`);
            return Promise.resolve();
        } catch (error) {
            console.error(`Failed to load polyfill '${name}':`, error);
            return Promise.reject(error);
        }
    }
    
    loadRequiredPolyfills(features) {
        const promises = [];
        
        if (!features.requestAnimationFrame) {
            promises.push(this.loadPolyfill('requestAnimationFrame'));
        }
        
        if (!features.performance) {
            promises.push(this.loadPolyfill('performance'));
        }
        
        if (!features.objectAssign) {
            promises.push(this.loadPolyfill('objectAssign'));
        }
        
        if (!features.arrayFrom) {
            promises.push(this.loadPolyfill('arrayFrom'));
        }
        
        if (!features.intersectionObserver) {
            promises.push(this.loadPolyfill('intersectionObserver'));
        }
        
        return Promise.all(promises);
    }
}

// Usage
const polyfillManager = new PolyfillManager();
const featureDetector = new FeatureDetector();

// Load required polyfills based on detected features
polyfillManager.loadRequiredPolyfills(featureDetector.features)
    .then(() => {
        console.log('All required polyfills loaded');
        // Initialize mascot
        const mascot = new EmotiveMascot({
            canvas: canvas,
            compatibility: true
        });
    })
    .catch(error => {
        console.error('Failed to load polyfills:', error);
    });
```

## Browser Testing Strategy

### Automated Cross-Browser Testing

```javascript
class BrowserTestSuite {
    constructor() {
        this.testResults = new Map();
        this.browserInfo = this.getBrowserInfo();
    }
    
    getBrowserInfo() {
        const ua = navigator.userAgent;
        const vendor = navigator.vendor;
        
        let browser = 'Unknown';
        let version = 'Unknown';
        
        if (/Chrome/.test(ua) && /Google Inc/.test(vendor)) {
            browser = 'Chrome';
            version = ua.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
        } else if (/Firefox/.test(ua)) {
            browser = 'Firefox';
            version = ua.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
        } else if (/Safari/.test(ua) && !/Chrome/.test(ua)) {
            browser = 'Safari';
            version = ua.match(/Version\/(\d+)/)?.[1] || 'Unknown';
        } else if (/Edge/.test(ua)) {
            browser = 'Edge';
            version = ua.match(/Edge\/(\d+)/)?.[1] || 'Unknown';
        } else if (/Trident/.test(ua)) {
            browser = 'Internet Explorer';
            version = ua.match(/rv:(\d+)/)?.[1] || 'Unknown';
        }
        
        return {
            browser,
            version,
            userAgent: ua,
            platform: navigator.platform,
            language: navigator.language
        };
    }
    
    async runCompatibilityTests() {
        console.log('Running browser compatibility tests...');
        console.log('Browser Info:', this.browserInfo);
        
        const tests = [
            this.testCanvasSupport,
            this.testWebAudioSupport,
            this.testPerformanceAPI,
            this.testES6Support,
            this.testAccessibilitySupport,
            this.testMobileFeatures
        ];
        
        for (const test of tests) {
            try {
                const result = await test.call(this);
                this.testResults.set(test.name, result);
            } catch (error) {
                this.testResults.set(test.name, {
                    passed: false,
                    error: error.message
                });
            }
        }
        
        return this.generateCompatibilityReport();
    }
    
    testCanvasSupport() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
            return { passed: false, message: 'Canvas 2D not supported' };
        }
        
        // Test basic canvas operations
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(0, 0, 10, 10);
        
        const imageData = ctx.getImageData(0, 0, 1, 1);
        const isRed = imageData.data[0] === 255 && imageData.data[1] === 0;
        
        return {
            passed: isRed,
            message: isRed ? 'Canvas 2D fully supported' : 'Canvas 2D partially supported',
            features: {
                basic2D: !!ctx,
                imageData: !!ctx.getImageData,
                transforms: !!ctx.setTransform
            }
        };
    }
    
    testWebAudioSupport() {
        const hasWebAudio = !!(window.AudioContext || window.webkitAudioContext);
        
        if (!hasWebAudio) {
            return { passed: false, message: 'Web Audio API not supported' };
        }
        
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const features = {
                basicAudio: true,
                oscillator: !!audioContext.createOscillator,
                gain: !!audioContext.createGain,
                analyser: !!audioContext.createAnalyser,
                audioWorklet: !!audioContext.audioWorklet
            };
            
            return {
                passed: true,
                message: 'Web Audio API supported',
                features: features,
                state: audioContext.state
            };
        } catch (error) {
            return {
                passed: false,
                message: 'Web Audio API initialization failed',
                error: error.message
            };
        }
    }
    
    testPerformanceAPI() {
        const hasPerformance = !!window.performance;
        const hasNow = !!(window.performance && window.performance.now);
        const hasObserver = !!window.PerformanceObserver;
        
        return {
            passed: hasPerformance && hasNow,
            message: hasPerformance ? 'Performance API supported' : 'Performance API not supported',
            features: {
                performance: hasPerformance,
                now: hasNow,
                observer: hasObserver,
                navigation: !!(window.performance && window.performance.navigation),
                timing: !!(window.performance && window.performance.timing)
            }
        };
    }
    
    testES6Support() {
        const features = {};
        
        try {
            eval('const test = () => {}');
            features.arrowFunctions = true;
        } catch (e) {
            features.arrowFunctions = false;
        }
        
        try {
            eval('class TestClass {}');
            features.classes = true;
        } catch (e) {
            features.classes = false;
        }
        
        features.letConst = (function() {
            try {
                eval('let test = 1; const test2 = 2;');
                return true;
            } catch (e) {
                return false;
            }
        })();
        
        features.templateLiterals = (function() {
            try {
                eval('`template ${1} literal`');
                return true;
            } catch (e) {
                return false;
            }
        })();
        
        features.destructuring = (function() {
            try {
                eval('const {a} = {a: 1}; const [b] = [1];');
                return true;
            } catch (e) {
                return false;
            }
        })();
        
        const supportedFeatures = Object.values(features).filter(Boolean).length;
        const totalFeatures = Object.keys(features).length;
        
        return {
            passed: supportedFeatures >= totalFeatures * 0.8, // 80% support required
            message: `ES6 support: ${supportedFeatures}/${totalFeatures} features`,
            features: features,
            supportLevel: Math.round((supportedFeatures / totalFeatures) * 100)
        };
    }
    
    testAccessibilitySupport() {
        const features = {
            aria: this.testARIASupport(),
            reducedMotion: this.testReducedMotionSupport(),
            highContrast: this.testHighContrastSupport(),
            screenReader: this.testScreenReaderSupport()
        };
        
        const supportedFeatures = Object.values(features).filter(Boolean).length;
        
        return {
            passed: supportedFeatures >= 2, // At least 2 accessibility features
            message: `Accessibility support: ${supportedFeatures}/4 features`,
            features: features
        };
    }
    
    testARIASupport() {
        const element = document.createElement('div');
        element.setAttribute('aria-label', 'test');
        return element.getAttribute('aria-label') === 'test';
    }
    
    testReducedMotionSupport() {
        return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion)'));
    }
    
    testHighContrastSupport() {
        return !!(window.matchMedia && window.matchMedia('(prefers-contrast: high)'));
    }
    
    testScreenReaderSupport() {
        // Basic test for screen reader API support
        return 'speechSynthesis' in window;
    }
    
    testMobileFeatures() {
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        const features = {
            touchEvents: 'ontouchstart' in window,
            deviceOrientation: 'DeviceOrientationEvent' in window,
            vibration: 'vibrate' in navigator,
            geolocation: 'geolocation' in navigator,
            camera: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
        };
        
        return {
            passed: true, // Mobile features are optional
            message: isMobile ? 'Mobile device detected' : 'Desktop device',
            isMobile: isMobile,
            features: features
        };
    }
    
    generateCompatibilityReport() {
        const totalTests = this.testResults.size;
        const passedTests = Array.from(this.testResults.values()).filter(result => result.passed).length;
        
        const report = {
            browser: this.browserInfo,
            summary: {
                total: totalTests,
                passed: passedTests,
                failed: totalTests - passedTests,
                score: Math.round((passedTests / totalTests) * 100)
            },
            tests: Object.fromEntries(this.testResults),
            recommendations: this.generateRecommendations()
        };
        
        console.log('Browser Compatibility Report:', report);
        return report;
    }
    
    generateRecommendations() {
        const recommendations = [];
        
        this.testResults.forEach((result, testName) => {
            if (!result.passed) {
                switch (testName) {
                    case 'testCanvasSupport':
                        recommendations.push('Canvas 2D not supported. Consider showing a fallback message.');
                        break;
                    case 'testWebAudioSupport':
                        recommendations.push('Web Audio API not supported. Audio features will be disabled.');
                        break;
                    case 'testPerformanceAPI':
                        recommendations.push('Performance API not available. Performance monitoring will be limited.');
                        break;
                    case 'testES6Support':
                        recommendations.push('Limited ES6 support. Consider using polyfills or transpilation.');
                        break;
                    case 'testAccessibilitySupport':
                        recommendations.push('Limited accessibility support. Some users may have difficulty using the application.');
                        break;
                }
            }
        });
        
        return recommendations;
    }
}

// Usage
const browserTester = new BrowserTestSuite();
browserTester.runCompatibilityTests().then(report => {
    // Use report to configure mascot appropriately
    const mascotConfig = {
        canvas: canvas,
        enableAudio: report.tests.testWebAudioSupport?.passed || false,
        performanceMonitoring: report.tests.testPerformanceAPI?.passed || false,
        accessibility: report.tests.testAccessibilitySupport?.passed || false
    };
    
    const mascot = new EmotiveMascot(mascotConfig);
});
```

## Performance Considerations by Browser

### Chrome/Chromium
- **Strengths**: Excellent V8 performance, hardware acceleration, full Web Audio API
- **Optimizations**: Use aggressive optimization levels, enable experimental features
- **Considerations**: Memory usage can be high with many particles

### Firefox
- **Strengths**: Good Gecko performance, excellent developer tools, privacy-focused
- **Optimizations**: Larger audio buffers, memory management hints
- **Considerations**: Slightly higher memory usage, different garbage collection patterns

### Safari
- **Strengths**: Energy efficient, good WebKit performance, excellent on macOS/iOS
- **Optimizations**: Reduced particle counts, audio interaction requirements
- **Considerations**: Audio restrictions, memory limitations on mobile

### Edge (Chromium)
- **Strengths**: Similar to Chrome, good Windows integration
- **Optimizations**: Same as Chrome optimizations
- **Considerations**: Similar performance characteristics to Chrome

### Internet Explorer 11
- **Strengths**: Wide enterprise deployment
- **Optimizations**: Minimal features, basic rendering only
- **Considerations**: Very limited functionality, requires extensive polyfills

## Deployment Recommendations

### Production Deployment Checklist

- [ ] **Feature Detection**: Implement comprehensive feature detection
- [ ] **Polyfill Loading**: Load required polyfills based on browser capabilities
- [ ] **Graceful Degradation**: Provide fallbacks for unsupported features
- [ ] **Performance Monitoring**: Track performance across different browsers
- [ ] **Error Handling**: Implement browser-specific error handling
- [ ] **User Feedback**: Provide clear messaging about browser limitations
- [ ] **Testing**: Test on all target browsers and versions
- [ ] **Documentation**: Document browser-specific behaviors and limitations

This comprehensive browser compatibility guide ensures the Emotive Communication Engine works reliably across the widest possible range of browsers and devices while providing optimal performance for each platform.