/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝                                                                             
 *                  ◐ ◑ ◒ ◓  MOBILE OPTIMIZATION  ◓ ◒ ◑ ◐                  
 *                                                                                    
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Mobile Optimization - Touch & Mobile Device Support
 * @author Emotive Engine Team
 * @version 2.0.0
 * @module MobileOptimization
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Makes the orb TOUCHABLE and mobile-friendly. Handles all the quirks of           
 * ║ mobile browsers, touch events, viewport changes, and battery optimization.        
 * ║ Ensures smooth performance even on low-end phones.                               
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 📱 MOBILE FEATURES                                                                 
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Touch event handling (tap, swipe, pinch)                                        
 * │ • Viewport resize handling                                                        
 * │ • Orientation change detection                                                    
 * │ • Battery-aware performance                                                       
 * │ • Reduced particle count on mobile                                                
 * │ • Touch-friendly interaction zones                                                
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */

export class MobileOptimization {
    constructor(config = {}) {
        this.config = {
            enableTouchOptimization: config.enableTouchOptimization !== false,
            enableViewportHandling: config.enableViewportHandling !== false,
            enableBatteryOptimization: config.enableBatteryOptimization !== false,
            enableOrientationSupport: config.enableOrientationSupport !== false,
            enableResponsiveScaling: config.enableResponsiveScaling !== false,
            touchSensitivity: config.touchSensitivity || 1.0,
            doubleTapDelay: config.doubleTapDelay || 300,
            swipeThreshold: config.swipeThreshold || 50,
            pinchThreshold: config.pinchThreshold || 0.1,
            ...config
        };
        
        // Device detection
        this.isMobile = this.detectMobile();
        this.isTablet = this.detectTablet();
        this.isTouchDevice = this.detectTouch();
        this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        this.isAndroid = /Android/.test(navigator.userAgent);
        
        // Touch state
        this.touches = new Map();
        this.lastTouchTime = 0;
        this.lastTapTime = 0;
        this.tapCount = 0;
        this.touchStartPosition = null;
        this.isPinching = false;
        this.isRotating = false;
        this.lastPinchDistance = 0;
        this.lastRotation = 0;
        
        // Gesture recognition
        this.currentGesture = null;
        this.gestureStartTime = 0;
        this.gestureHistory = [];
        
        // Viewport state
        this.viewportSize = { width: window.innerWidth, height: window.innerHeight };
        this.orientation = this.getOrientation();
        this.pixelRatio = window.devicePixelRatio || 1;
        this.lastViewportChange = 0;
        
        // Battery state
        this.batteryLevel = 1.0;
        this.isCharging = true;
        this.lowPowerMode = false;
        
        // Performance adjustments for mobile
        this.mobilePerformanceSettings = {
            reducedParticles: this.isMobile,
            simplifiedAnimations: this.isMobile,
            lowerFrameRate: this.isMobile,
            reducedEffects: this.isMobile || this.isTablet,
            targetFPS: this.isMobile ? 30 : 60,
            maxParticles: this.isMobile ? 20 : 50
        };
        
        // Canvas optimization
        this.canvasScale = 1.0;
        this.useOffscreenCanvas = this.supportsOffscreenCanvas();
        
        // Event handlers bound to this
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        this.handleTouchCancel = this.handleTouchCancel.bind(this);
        this.handleOrientationChange = this.handleOrientationChange.bind(this);
        this.handleViewportChange = this.handleViewportChange.bind(this);
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
        
        // Initialize
        this.initialize();
    }
    
    /**
     * Initialize mobile optimization
     */
    initialize() {
        if (this.config.enableTouchOptimization && this.isTouchDevice) {
            this.setupTouchHandlers();
        }
        
        if (this.config.enableViewportHandling) {
            this.setupViewportHandlers();
        }
        
        if (this.config.enableBatteryOptimization) {
            this.setupBatteryMonitoring();
        }
        
        if (this.config.enableOrientationSupport) {
            this.setupOrientationHandlers();
        }
        
        // Apply initial optimizations
        this.applyMobileOptimizations();
    }
    
    /**
     * Detect if device is mobile
     * @returns {boolean} True if mobile device
     */
    detectMobile() {
        const userAgent = navigator.userAgent.toLowerCase();
        const mobileKeywords = ['android', 'iphone', 'ipod', 'windows phone', 'blackberry'];
        
        // Check user agent
        const isMobileUA = mobileKeywords.some(keyword => userAgent.includes(keyword));
        
        // Check screen size
        const isMobileSize = window.innerWidth <= 768;
        
        // Check for touch and small screen
        const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        return isMobileUA || (isMobileSize && hasTouch);
    }
    
    /**
     * Detect if device is tablet
     * @returns {boolean} True if tablet device
     */
    detectTablet() {
        const userAgent = navigator.userAgent.toLowerCase();
        const isIPad = /ipad/.test(userAgent);
        const isAndroidTablet = /android/.test(userAgent) && !/mobile/.test(userAgent);
        const isWindowsTablet = /windows/.test(userAgent) && /touch/.test(userAgent);
        
        // Check screen size for tablet range
        const isTabletSize = window.innerWidth > 768 && window.innerWidth <= 1024;
        const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        return isIPad || isAndroidTablet || isWindowsTablet || (isTabletSize && hasTouch);
    }
    
    /**
     * Detect touch support
     * @returns {boolean} True if touch is supported
     */
    detectTouch() {
        return 'ontouchstart' in window || 
               navigator.maxTouchPoints > 0 || 
               navigator.msMaxTouchPoints > 0;
    }
    
    /**
     * Check if offscreen canvas is supported
     * @returns {boolean} True if OffscreenCanvas is supported
     */
    supportsOffscreenCanvas() {
        return typeof OffscreenCanvas !== 'undefined';
    }
    
    /**
     * Set up touch event handlers
     */
    setupTouchHandlers() {
        const canvas = this.getCanvas();
        if (!canvas) return;
        
        // Prevent default touch behaviors
        canvas.style.touchAction = 'none';
        canvas.style.userSelect = 'none';
        canvas.style.webkitUserSelect = 'none';
        
        // Add touch event listeners
        canvas.addEventListener('touchstart', this.handleTouchStart, { passive: false });
        canvas.addEventListener('touchmove', this.handleTouchMove, { passive: false });
        canvas.addEventListener('touchend', this.handleTouchEnd, { passive: false });
        canvas.addEventListener('touchcancel', this.handleTouchCancel, { passive: false });
        
        // Prevent context menu on long press
        canvas.addEventListener('contextmenu', e => e.preventDefault());
    }
    
    /**
     * Set up viewport change handlers
     */
    setupViewportHandlers() {
        window.addEventListener('resize', this.handleViewportChange);
        window.addEventListener('orientationchange', this.handleOrientationChange);
        
        // Handle visibility changes for battery optimization
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
        
        // Handle viewport meta changes
        this.setupViewportMeta();
    }
    
    /**
     * Set up viewport meta tag for mobile
     */
    setupViewportMeta() {
        let viewportMeta = document.querySelector('meta[name="viewport"]');
        
        if (!viewportMeta) {
            viewportMeta = document.createElement('meta');
            viewportMeta.name = 'viewport';
            document.head.appendChild(viewportMeta);
        }
        
        // Set optimal viewport for mobile
        viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    }
    
    /**
     * Set up battery monitoring
     */
    async setupBatteryMonitoring() {
        if (!navigator.getBattery) return;
        
        try {
            const battery = await navigator.getBattery();
            
            this.batteryLevel = battery.level;
            this.isCharging = battery.charging;
            
            // Listen for battery changes
            battery.addEventListener('levelchange', () => {
                this.batteryLevel = battery.level;
                this.onBatteryChange();
            });
            
            battery.addEventListener('chargingchange', () => {
                this.isCharging = battery.charging;
                this.onBatteryChange();
            });
            
            // Initial battery optimization
            this.onBatteryChange();
        } catch (_error) {
            // Ignore battery optimization errors
        }
    }
    
    /**
     * Set up orientation change handlers
     */
    setupOrientationHandlers() {
        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', event => {
                this.handleDeviceOrientation(event);
            });
        }
    }
    
    /**
     * Handle touch start
     * @param {TouchEvent} event - Touch event
     */
    handleTouchStart(event) {
        event.preventDefault();
        
        const now = Date.now();
        this.gestureStartTime = now;
        
        // Store all touches
        for (const touch of event.touches) {
            this.touches.set(touch.identifier, {
                id: touch.identifier,
                startX: touch.clientX,
                startY: touch.clientY,
                currentX: touch.clientX,
                currentY: touch.clientY,
                startTime: now
            });
        }
        
        // Handle different touch counts
        if (event.touches.length === 1) {
            this.handleSingleTouchStart(event.touches[0]);
        } else if (event.touches.length === 2) {
            this.handleMultiTouchStart(event.touches);
        }
        
        // Emit touch event
        this.emitTouchEvent('touchStart', {
            touches: Array.from(this.touches.values()),
            timestamp: now
        });
    }
    
    /**
     * Handle single touch start
     * @param {Touch} touch - Touch object
     */
    handleSingleTouchStart(touch) {
        const now = Date.now();
        
        // Check for double tap
        if (now - this.lastTapTime < this.config.doubleTapDelay) {
            this.tapCount++;
        } else {
            this.tapCount = 1;
        }
        
        this.lastTapTime = now;
        this.touchStartPosition = { x: touch.clientX, y: touch.clientY };
    }
    
    /**
     * Handle multi-touch start
     * @param {TouchList} touches - Touch list
     */
    handleMultiTouchStart(touches) {
        if (touches.length === 2) {
            // Initialize pinch/rotate
            const touch1 = touches[0];
            const touch2 = touches[1];
            
            this.lastPinchDistance = this.getDistance(
                touch1.clientX, touch1.clientY,
                touch2.clientX, touch2.clientY
            );
            
            this.lastRotation = this.getAngle(
                touch1.clientX, touch1.clientY,
                touch2.clientX, touch2.clientY
            );
            
            this.isPinching = true;
        }
    }
    
    /**
     * Handle touch move
     * @param {TouchEvent} event - Touch event
     */
    handleTouchMove(event) {
        event.preventDefault();
        
        // Update touch positions
        for (const touch of event.touches) {
            const storedTouch = this.touches.get(touch.identifier);
            if (storedTouch) {
                storedTouch.currentX = touch.clientX;
                storedTouch.currentY = touch.clientY;
            }
        }
        
        // Handle gestures based on touch count
        if (event.touches.length === 1) {
            this.handleSingleTouchMove(event.touches[0]);
        } else if (event.touches.length === 2) {
            this.handleMultiTouchMove(event.touches);
        }
        
        // Emit touch event
        this.emitTouchEvent('touchMove', {
            touches: Array.from(this.touches.values()),
            gesture: this.currentGesture
        });
    }
    
    /**
     * Handle single touch move
     * @param {Touch} touch - Touch object
     */
    handleSingleTouchMove(touch) {
        const storedTouch = this.touches.get(touch.identifier);
        if (!storedTouch) return;
        
        const deltaX = touch.clientX - storedTouch.startX;
        const deltaY = touch.clientY - storedTouch.startY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // Detect swipe gesture
        if (distance > this.config.swipeThreshold) {
            const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                this.currentGesture = deltaX > 0 ? 'swipeRight' : 'swipeLeft';
            } else {
                this.currentGesture = deltaY > 0 ? 'swipeDown' : 'swipeUp';
            }
        } else {
            this.currentGesture = 'pan';
        }
    }
    
    /**
     * Handle multi-touch move
     * @param {TouchList} touches - Touch list
     */
    handleMultiTouchMove(touches) {
        if (touches.length !== 2) return;
        
        const touch1 = touches[0];
        const touch2 = touches[1];
        
        // Calculate pinch
        const currentDistance = this.getDistance(
            touch1.clientX, touch1.clientY,
            touch2.clientX, touch2.clientY
        );
        
        const pinchDelta = currentDistance - this.lastPinchDistance;
        const pinchRatio = currentDistance / this.lastPinchDistance;
        
        if (Math.abs(pinchDelta) > this.config.pinchThreshold) {
            this.currentGesture = pinchRatio > 1 ? 'pinchOut' : 'pinchIn';
            
            // Emit pinch event
            this.emitTouchEvent('pinch', {
                scale: pinchRatio,
                delta: pinchDelta
            });
        }
        
        // Calculate rotation
        const currentRotation = this.getAngle(
            touch1.clientX, touch1.clientY,
            touch2.clientX, touch2.clientY
        );
        
        const rotationDelta = currentRotation - this.lastRotation;
        
        if (Math.abs(rotationDelta) > 5) { // 5 degree threshold
            this.currentGesture = 'rotate';
            
            // Emit rotation event
            this.emitTouchEvent('rotate', {
                angle: currentRotation,
                delta: rotationDelta
            });
        }
        
        this.lastPinchDistance = currentDistance;
        this.lastRotation = currentRotation;
    }
    
    /**
     * Handle touch end
     * @param {TouchEvent} event - Touch event
     */
    handleTouchEnd(event) {
        event.preventDefault();
        
        const now = Date.now();
        
        // Process ended touches
        for (const touch of event.changedTouches) {
            const storedTouch = this.touches.get(touch.identifier);
            
            if (storedTouch) {
                const duration = now - storedTouch.startTime;
                const deltaX = storedTouch.currentX - storedTouch.startX;
                const deltaY = storedTouch.currentY - storedTouch.startY;
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                
                // Detect tap
                if (duration < 300 && distance < 10) {
                    if (this.tapCount === 2) {
                        this.emitTouchEvent('doubleTap', {
                            x: storedTouch.currentX,
                            y: storedTouch.currentY
                        });
                        this.tapCount = 0;
                    } else {
                        this.emitTouchEvent('tap', {
                            x: storedTouch.currentX,
                            y: storedTouch.currentY
                        });
                    }
                }
                
                // Detect long press
                if (duration > 500 && distance < 10) {
                    this.emitTouchEvent('longPress', {
                        x: storedTouch.currentX,
                        y: storedTouch.currentY
                    });
                }
                
                this.touches.delete(touch.identifier);
            }
        }
        
        // Reset gesture state
        if (event.touches.length === 0) {
            this.currentGesture = null;
            this.isPinching = false;
            this.isRotating = false;
        }
        
        // Emit touch end event
        this.emitTouchEvent('touchEnd', {
            gesture: this.currentGesture,
            duration: now - this.gestureStartTime
        });
    }
    
    /**
     * Handle touch cancel
     * @param {TouchEvent} event - Touch event
     */
    handleTouchCancel(event) {
        // Clear all touches
        this.touches.clear();
        this.currentGesture = null;
        this.isPinching = false;
        this.isRotating = false;
        
        this.emitTouchEvent('touchCancel', {});
    }
    
    /**
     * Handle orientation change
     * @param {Event} event - Orientation change event
     */
    handleOrientationChange(event) {
        this.orientation = this.getOrientation();
        
        // Emit orientation change event
        this.emitTouchEvent('orientationChange', {
            orientation: this.orientation,
            angle: window.orientation || 0
        });
        
        // Apply orientation-specific optimizations
        this.applyOrientationOptimizations();
    }
    
    /**
     * Handle device orientation
     * @param {DeviceOrientationEvent} event - Device orientation event
     */
    handleDeviceOrientation(event) {
        // Could be used for gyroscope-based interactions
        const { alpha, beta, gamma } = event;
        
        this.emitTouchEvent('deviceOrientation', {
            alpha, // Z axis rotation
            beta,  // X axis rotation
            gamma  // Y axis rotation
        });
    }
    
    /**
     * Handle viewport change
     * @param {Event} event - Resize event
     */
    handleViewportChange(event) {
        const now = Date.now();
        
        // Debounce viewport changes
        if (now - this.lastViewportChange < 100) return;
        
        this.lastViewportChange = now;
        this.viewportSize = {
            width: window.innerWidth,
            height: window.innerHeight
        };
        
        // Update pixel ratio
        this.pixelRatio = window.devicePixelRatio || 1;
        
        // Emit viewport change event
        this.emitTouchEvent('viewportChange', {
            size: this.viewportSize,
            pixelRatio: this.pixelRatio,
            orientation: this.getOrientation()
        });
        
        // Apply responsive scaling
        if (this.config.enableResponsiveScaling) {
            this.applyResponsiveScaling();
        }
    }
    
    /**
     * Handle visibility change
     * @param {Event} event - Visibility change event
     */
    handleVisibilityChange(event) {
        const isVisible = !document.hidden;
        
        this.emitTouchEvent('visibilityChange', {
            visible: isVisible
        });
        
        // Apply optimizations based on visibility
        if (!isVisible && this.config.enableBatteryOptimization) {
            // Reduce performance when app is in background
            this.applyBackgroundOptimizations();
        } else {
            // Restore performance when app is visible
            this.restorePerformance();
        }
    }
    
    /**
     * Get current orientation
     * @returns {string} Orientation (portrait or landscape)
     */
    getOrientation() {
        return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
    }
    
    /**
     * Get distance between two points
     * @param {number} x1 - First X coordinate
     * @param {number} y1 - First Y coordinate
     * @param {number} x2 - Second X coordinate
     * @param {number} y2 - Second Y coordinate
     * @returns {number} Distance
     */
    getDistance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    /**
     * Get angle between two points
     * @param {number} x1 - First X coordinate
     * @param {number} y1 - First Y coordinate
     * @param {number} x2 - Second X coordinate
     * @param {number} y2 - Second Y coordinate
     * @returns {number} Angle in degrees
     */
    getAngle(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    }
    
    /**
     * Apply mobile optimizations
     */
    applyMobileOptimizations() {
        if (!this.isMobile && !this.isTablet) return;
        
        const optimizations = {
            ...this.mobilePerformanceSettings,
            canvasScale: this.calculateOptimalCanvasScale(),
            useWebGL: false, // Disable WebGL on mobile for battery
            useOffscreenCanvas: this.useOffscreenCanvas
        };
        
        // Emit optimization settings
        this.emitTouchEvent('mobileOptimizations', optimizations);
        
        return optimizations;
    }
    
    /**
     * Apply orientation-specific optimizations
     */
    applyOrientationOptimizations() {
        const isLandscape = this.orientation === 'landscape';
        
        const optimizations = {
            layoutMode: isLandscape ? 'horizontal' : 'vertical',
            particleDirection: isLandscape ? 'horizontal' : 'vertical',
            uiScale: isLandscape ? 0.8 : 1.0
        };
        
        this.emitTouchEvent('orientationOptimizations', optimizations);
        
        return optimizations;
    }
    
    /**
     * Apply responsive scaling
     */
    applyResponsiveScaling() {
        const baseWidth = 375; // iPhone 6/7/8 width as base
        const scaleFactor = Math.min(
            this.viewportSize.width / baseWidth,
            2.0 // Max scale factor
        );
        
        this.canvasScale = scaleFactor;
        
        this.emitTouchEvent('responsiveScale', {
            scale: this.canvasScale,
            viewport: this.viewportSize
        });
        
        return this.canvasScale;
    }
    
    /**
     * Apply background optimizations for battery saving
     */
    applyBackgroundOptimizations() {
        const optimizations = {
            targetFPS: 5, // Very low FPS in background
            particlesEnabled: false,
            animationsEnabled: false,
            audioEnabled: false
        };
        
        this.emitTouchEvent('backgroundOptimizations', optimizations);
        
        return optimizations;
    }
    
    /**
     * Restore performance settings
     */
    restorePerformance() {
        const settings = this.applyMobileOptimizations();
        
        this.emitTouchEvent('performanceRestore', settings);
        
        return settings;
    }
    
    /**
     * Handle battery change
     */
    onBatteryChange() {
        this.lowPowerMode = this.batteryLevel < 0.2 && !this.isCharging;
        
        if (this.lowPowerMode) {
            // Apply low power optimizations
            const optimizations = {
                targetFPS: 15,
                maxParticles: 5,
                reducedEffects: true,
                audioEnabled: false
            };
            
            this.emitTouchEvent('lowPowerMode', {
                batteryLevel: this.batteryLevel,
                isCharging: this.isCharging,
                optimizations
            });
        }
    }
    
    /**
     * Calculate optimal canvas scale for device
     * @returns {number} Scale factor
     */
    calculateOptimalCanvasScale() {
        // Balance between quality and performance
        if (this.isMobile) {
            return Math.min(this.pixelRatio, 2); // Cap at 2x for mobile
        } else if (this.isTablet) {
            return Math.min(this.pixelRatio, 2.5); // Slightly higher for tablets
        }
        
        return this.pixelRatio; // Full resolution for desktop
    }
    
    /**
     * Get canvas element
     * @returns {HTMLCanvasElement} Canvas element
     */
    getCanvas() {
        // This would be set by the main application
        return this.canvas || document.querySelector('canvas');
    }
    
    /**
     * Set canvas element
     * @param {HTMLCanvasElement} canvas - Canvas element
     */
    setCanvas(canvas) {
        this.canvas = canvas;
        
        if (this.config.enableTouchOptimization && this.isTouchDevice) {
            this.setupTouchHandlers();
        }
    }
    
    /**
     * Emit touch event
     * @param {string} eventType - Event type
     * @param {Object} data - Event data
     */
    emitTouchEvent(eventType, data) {
        if (this.onTouchEvent) {
            this.onTouchEvent(eventType, data);
        }
    }
    
    /**
     * Get mobile optimization status
     * @returns {Object} Status report
     */
    getStatus() {
        return {
            device: {
                isMobile: this.isMobile,
                isTablet: this.isTablet,
                isTouchDevice: this.isTouchDevice,
                isIOS: this.isIOS,
                isAndroid: this.isAndroid
            },
            viewport: {
                size: this.viewportSize,
                orientation: this.orientation,
                pixelRatio: this.pixelRatio,
                canvasScale: this.canvasScale
            },
            battery: {
                level: this.batteryLevel,
                isCharging: this.isCharging,
                lowPowerMode: this.lowPowerMode
            },
            touch: {
                activeTouches: this.touches.size,
                currentGesture: this.currentGesture,
                isPinching: this.isPinching,
                isRotating: this.isRotating
            },
            performance: this.mobilePerformanceSettings
        };
    }
    
    /**
     * Destroy mobile optimization
     */
    destroy() {
        const canvas = this.getCanvas();
        
        if (canvas) {
            canvas.removeEventListener('touchstart', this.handleTouchStart);
            canvas.removeEventListener('touchmove', this.handleTouchMove);
            canvas.removeEventListener('touchend', this.handleTouchEnd);
            canvas.removeEventListener('touchcancel', this.handleTouchCancel);
        }
        
        window.removeEventListener('resize', this.handleViewportChange);
        window.removeEventListener('orientationchange', this.handleOrientationChange);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        
        this.touches.clear();
        this.gestureHistory = [];
        
    }
}

export default MobileOptimization;