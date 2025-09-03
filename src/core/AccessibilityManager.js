/**
 * AccessibilityManager - Comprehensive accessibility support system
 * Handles reduced motion, high contrast, screen readers, and keyboard navigation
 */

export class AccessibilityManager {
    constructor(config = {}) {
        this.config = {
            enableReducedMotion: config.enableReducedMotion !== false,
            enableHighContrast: config.enableHighContrast !== false,
            enableScreenReaderSupport: config.enableScreenReaderSupport !== false,
            enableKeyboardNavigation: config.enableKeyboardNavigation !== false,
            enableFocusIndicators: config.enableFocusIndicators !== false,
            announceStateChanges: config.announceStateChanges !== false,
            colorBlindMode: config.colorBlindMode || 'none', // none, protanopia, deuteranopia, tritanopia
            ...config
        };
        
        // Accessibility state
        this.reducedMotionPreferred = false;
        this.highContrastEnabled = false;
        this.screenReaderActive = false;
        this.keyboardNavigationActive = false;
        this.currentColorBlindMode = this.config.colorBlindMode;
        
        // Focus management
        this.focusableElements = new Map();
        this.currentFocusIndex = -1;
        this.focusHistory = [];
        
        // ARIA live region for announcements
        this.liveRegion = null;
        this.announcementQueue = [];
        
        // Color schemes for different accessibility needs
        this.colorSchemes = {
            normal: null, // Will be set from current colors
            highContrast: {
                primary: '#FFFFFF',
                secondary: '#000000',
                accent: '#FFFF00',
                background: '#000000',
                particles: '#FFFFFF'
            },
            protanopia: { // Red-blind
                primary: '#0066CC',
                secondary: '#FFCC00',
                accent: '#00CCFF',
                background: '#1A1A1A',
                particles: '#66CCFF'
            },
            deuteranopia: { // Green-blind
                primary: '#0099FF',
                secondary: '#FF9900',
                accent: '#FF00FF',
                background: '#1A1A1A',
                particles: '#9966FF'
            },
            tritanopia: { // Blue-blind
                primary: '#FF0066',
                secondary: '#00FF66',
                accent: '#FF6600',
                background: '#1A1A1A',
                particles: '#FFCC00'
            }
        };
        
        // Pattern overlays for color-blind modes
        this.patterns = {
            dots: 'dots',
            stripes: 'stripes',
            crosshatch: 'crosshatch',
            solid: 'solid'
        };
        
        // Emotional state patterns for color-blind users
        this.statePatterns = {
            idle: this.patterns.solid,
            happy: this.patterns.dots,
            excited: this.patterns.stripes,
            calm: this.patterns.solid,
            curious: this.patterns.crosshatch,
            frustrated: this.patterns.stripes,
            sad: this.patterns.dots,
            neutral: this.patterns.solid
        };
        
        // Initialize accessibility features
        this.initialize();
    }
    
    /**
     * Initialize accessibility features
     */
    initialize() {
        // Detect user preferences
        this.detectUserPreferences();
        
        // Set up ARIA live region
        this.setupLiveRegion();
        
        // Set up keyboard navigation if enabled
        if (this.config.enableKeyboardNavigation) {
            this.setupKeyboardNavigation();
        }
        
        // Listen for preference changes
        this.setupPreferenceListeners();
        
        console.log('AccessibilityManager initialized', {
            reducedMotion: this.reducedMotionPreferred,
            highContrast: this.highContrastEnabled,
            screenReader: this.screenReaderActive
        });
    }
    
    /**
     * Detect user accessibility preferences
     */
    detectUserPreferences() {
        // Detect reduced motion preference
        if (this.config.enableReducedMotion && window.matchMedia) {
            const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            this.reducedMotionPreferred = motionQuery.matches;
        }
        
        // Detect high contrast preference
        if (this.config.enableHighContrast && window.matchMedia) {
            const contrastQuery = window.matchMedia('(prefers-contrast: high)');
            this.highContrastEnabled = contrastQuery.matches;
            
            // Also check for Windows high contrast mode
            if (!this.highContrastEnabled) {
                const windowsHCQuery = window.matchMedia('(-ms-high-contrast: active)');
                this.highContrastEnabled = windowsHCQuery.matches;
            }
        }
        
        // Detect screen reader (heuristic approach)
        this.detectScreenReader();
    }
    
    /**
     * Detect if a screen reader is likely active
     */
    detectScreenReader() {
        // Check for ARIA attributes being actively used
        const hasAriaLive = document.querySelector('[aria-live]');
        const hasAriaAtomic = document.querySelector('[aria-atomic]');
        
        // Check for screen reader specific attributes
        const hasRole = document.querySelector('[role="application"]');
        
        // Check user agent for assistive technology hints
        const userAgent = navigator.userAgent.toLowerCase();
        const hasATHints = userAgent.includes('nvda') || 
                          userAgent.includes('jaws') || 
                          userAgent.includes('voiceover');
        
        this.screenReaderActive = !!(hasAriaLive || hasAriaAtomic || hasRole || hasATHints);
    }
    
    /**
     * Set up ARIA live region for announcements
     */
    setupLiveRegion() {
        if (!this.config.enableScreenReaderSupport) return;
        
        // Create live region if it doesn't exist
        this.liveRegion = document.getElementById('mascot-announcements');
        if (!this.liveRegion) {
            this.liveRegion = document.createElement('div');
            this.liveRegion.id = 'mascot-announcements';
            this.liveRegion.setAttribute('aria-live', 'polite');
            this.liveRegion.setAttribute('aria-atomic', 'true');
            this.liveRegion.style.position = 'absolute';
            this.liveRegion.style.left = '-10000px';
            this.liveRegion.style.width = '1px';
            this.liveRegion.style.height = '1px';
            this.liveRegion.style.overflow = 'hidden';
            document.body.appendChild(this.liveRegion);
        }
    }
    
    /**
     * Set up keyboard navigation
     */
    setupKeyboardNavigation() {
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
    }
    
    /**
     * Set up listeners for preference changes
     */
    setupPreferenceListeners() {
        if (window.matchMedia) {
            // Listen for reduced motion changes
            const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            motionQuery.addListener((e) => {
                this.reducedMotionPreferred = e.matches;
                this.onPreferenceChange('reducedMotion', e.matches);
            });
            
            // Listen for high contrast changes
            const contrastQuery = window.matchMedia('(prefers-contrast: high)');
            contrastQuery.addListener((e) => {
                this.highContrastEnabled = e.matches;
                this.onPreferenceChange('highContrast', e.matches);
            });
        }
    }
    
    /**
     * Handle keyboard navigation
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleKeyDown(event) {
        if (!this.config.enableKeyboardNavigation) return;
        
        switch (event.key) {
            case 'Tab':
                event.preventDefault();
                this.navigateFocus(event.shiftKey ? -1 : 1);
                break;
            case 'Enter':
            case ' ':
                this.activateCurrentFocus();
                break;
            case 'Escape':
                this.clearFocus();
                break;
            case 'ArrowLeft':
            case 'ArrowRight':
            case 'ArrowUp':
            case 'ArrowDown':
                this.handleArrowNavigation(event.key);
                break;
        }
        
        this.keyboardNavigationActive = true;
    }
    
    /**
     * Handle key up events
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleKeyUp(event) {
        // Could be used for specific key release actions
    }
    
    /**
     * Navigate focus between elements
     * @param {number} direction - Direction to navigate (1 or -1)
     */
    navigateFocus(direction) {
        const focusableArray = Array.from(this.focusableElements.values());
        if (focusableArray.length === 0) return;
        
        this.currentFocusIndex += direction;
        
        // Wrap around
        if (this.currentFocusIndex < 0) {
            this.currentFocusIndex = focusableArray.length - 1;
        } else if (this.currentFocusIndex >= focusableArray.length) {
            this.currentFocusIndex = 0;
        }
        
        const element = focusableArray[this.currentFocusIndex];
        this.setFocus(element);
        
        // Announce focus change
        if (element.label) {
            this.announce(`Focused on ${element.label}`);
        }
    }
    
    /**
     * Handle arrow key navigation
     * @param {string} key - Arrow key pressed
     */
    handleArrowNavigation(key) {
        // This would be implemented based on spatial navigation needs
        const directions = {
            'ArrowLeft': { x: -1, y: 0 },
            'ArrowRight': { x: 1, y: 0 },
            'ArrowUp': { x: 0, y: -1 },
            'ArrowDown': { x: 0, y: 1 }
        };
        
        const direction = directions[key];
        if (direction && this.onArrowNavigation) {
            this.onArrowNavigation(direction);
        }
    }
    
    /**
     * Register a focusable element
     * @param {string} id - Element identifier
     * @param {Object} element - Element properties
     */
    registerFocusableElement(id, element) {
        this.focusableElements.set(id, {
            id,
            label: element.label || id,
            bounds: element.bounds || null,
            action: element.action || null,
            type: element.type || 'button'
        });
    }
    
    /**
     * Unregister a focusable element
     * @param {string} id - Element identifier
     */
    unregisterFocusableElement(id) {
        this.focusableElements.delete(id);
    }
    
    /**
     * Set focus on an element
     * @param {Object} element - Element to focus
     */
    setFocus(element) {
        if (this.onFocusChange) {
            this.onFocusChange(element);
        }
        
        this.focusHistory.push(element.id);
        if (this.focusHistory.length > 10) {
            this.focusHistory.shift();
        }
    }
    
    /**
     * Clear current focus
     */
    clearFocus() {
        this.currentFocusIndex = -1;
        if (this.onFocusChange) {
            this.onFocusChange(null);
        }
        
        this.announce('Focus cleared');
    }
    
    /**
     * Activate the currently focused element
     */
    activateCurrentFocus() {
        const focusableArray = Array.from(this.focusableElements.values());
        if (this.currentFocusIndex >= 0 && this.currentFocusIndex < focusableArray.length) {
            const element = focusableArray[this.currentFocusIndex];
            if (element.action) {
                element.action();
                this.announce(`Activated ${element.label}`);
            }
        }
    }
    
    /**
     * Announce a message to screen readers
     * @param {string} message - Message to announce
     * @param {string} priority - Priority level (polite, assertive)
     */
    announce(message, priority = 'polite') {
        if (!this.config.enableScreenReaderSupport || !this.liveRegion) return;
        
        // Queue the announcement
        this.announcementQueue.push({ message, priority });
        
        // Process queue
        this.processAnnouncementQueue();
    }
    
    /**
     * Process announcement queue
     */
    processAnnouncementQueue() {
        if (this.announcementQueue.length === 0) return;
        
        const { message, priority } = this.announcementQueue.shift();
        
        // Update live region
        this.liveRegion.setAttribute('aria-live', priority);
        this.liveRegion.textContent = message;
        
        // Clear after a delay to allow screen reader to announce
        setTimeout(() => {
            if (this.liveRegion) {
                this.liveRegion.textContent = '';
            }
            
            // Process next announcement if any
            if (this.announcementQueue.length > 0) {
                this.processAnnouncementQueue();
            }
        }, 100);
    }
    
    /**
     * Get adjusted animation settings based on accessibility preferences
     * @param {Object} originalSettings - Original animation settings
     * @returns {Object} Adjusted settings
     */
    getAnimationSettings(originalSettings = {}) {
        if (!this.reducedMotionPreferred) {
            return originalSettings;
        }
        
        // Reduce or disable animations for users who prefer reduced motion
        return {
            ...originalSettings,
            duration: originalSettings.duration ? originalSettings.duration * 0.5 : 0,
            iterations: 1,
            easing: 'linear',
            particlesEnabled: false,
            complexAnimations: false,
            autoPlay: false
        };
    }
    
    /**
     * Get adjusted color scheme based on accessibility preferences
     * @param {Object} originalColors - Original color scheme
     * @returns {Object} Adjusted colors
     */
    getColorScheme(originalColors = {}) {
        // Store original colors if not set
        if (!this.colorSchemes.normal) {
            this.colorSchemes.normal = { ...originalColors };
        }
        
        // Apply high contrast if needed
        if (this.highContrastEnabled) {
            return this.colorSchemes.highContrast;
        }
        
        // Apply color blind mode if set
        if (this.currentColorBlindMode !== 'none' && this.colorSchemes[this.currentColorBlindMode]) {
            return this.colorSchemes[this.currentColorBlindMode];
        }
        
        return originalColors;
    }
    
    /**
     * Get pattern for current state (for color blind users)
     * @param {string} state - Current emotional state
     * @returns {string} Pattern identifier
     */
    getStatePattern(state) {
        if (this.currentColorBlindMode === 'none') {
            return this.patterns.solid;
        }
        
        return this.statePatterns[state] || this.patterns.solid;
    }
    
    /**
     * Apply pattern overlay to canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {string} pattern - Pattern type
     * @param {Object} bounds - Area to apply pattern
     */
    applyPatternOverlay(ctx, pattern, bounds) {
        if (pattern === this.patterns.solid) return;
        
        ctx.save();
        
        const patternCanvas = document.createElement('canvas');
        const patternCtx = patternCanvas.getContext('2d');
        
        switch (pattern) {
            case this.patterns.dots:
                this.createDotPattern(patternCtx, patternCanvas);
                break;
            case this.patterns.stripes:
                this.createStripePattern(patternCtx, patternCanvas);
                break;
            case this.patterns.crosshatch:
                this.createCrosshatchPattern(patternCtx, patternCanvas);
                break;
        }
        
        const canvasPattern = ctx.createPattern(patternCanvas, 'repeat');
        ctx.fillStyle = canvasPattern;
        ctx.globalAlpha = 0.3; // Semi-transparent overlay
        ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
        
        ctx.restore();
    }
    
    /**
     * Create dot pattern
     * @param {CanvasRenderingContext2D} ctx - Pattern canvas context
     * @param {HTMLCanvasElement} canvas - Pattern canvas
     */
    createDotPattern(ctx, canvas) {
        canvas.width = 10;
        canvas.height = 10;
        
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(5, 5, 2, 0, Math.PI * 2);
        ctx.fill();
    }
    
    /**
     * Create stripe pattern
     * @param {CanvasRenderingContext2D} ctx - Pattern canvas context
     * @param {HTMLCanvasElement} canvas - Pattern canvas
     */
    createStripePattern(ctx, canvas) {
        canvas.width = 10;
        canvas.height = 10;
        
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 10);
        ctx.lineTo(10, 0);
        ctx.stroke();
    }
    
    /**
     * Create crosshatch pattern
     * @param {CanvasRenderingContext2D} ctx - Pattern canvas context
     * @param {HTMLCanvasElement} canvas - Pattern canvas
     */
    createCrosshatchPattern(ctx, canvas) {
        canvas.width = 10;
        canvas.height = 10;
        
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1;
        
        // Diagonal lines
        ctx.beginPath();
        ctx.moveTo(0, 10);
        ctx.lineTo(10, 0);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(10, 10);
        ctx.stroke();
    }
    
    /**
     * Set color blind mode
     * @param {string} mode - Color blind mode
     */
    setColorBlindMode(mode) {
        const validModes = ['none', 'protanopia', 'deuteranopia', 'tritanopia'];
        if (!validModes.includes(mode)) {
            console.warn(`Invalid color blind mode: ${mode}`);
            return;
        }
        
        this.currentColorBlindMode = mode;
        this.announce(`Color blind mode set to ${mode}`);
        
        if (this.onColorSchemeChange) {
            this.onColorSchemeChange(this.getColorScheme());
        }
    }
    
    /**
     * Get accessibility status report
     * @returns {Object} Accessibility status
     */
    getStatus() {
        return {
            reducedMotion: this.reducedMotionPreferred,
            highContrast: this.highContrastEnabled,
            screenReader: this.screenReaderActive,
            keyboardNavigation: this.keyboardNavigationActive,
            colorBlindMode: this.currentColorBlindMode,
            focusedElement: this.currentFocusIndex >= 0 ? 
                Array.from(this.focusableElements.values())[this.currentFocusIndex] : null,
            registeredElements: this.focusableElements.size
        };
    }
    
    /**
     * Handle preference change
     * @param {string} preference - Preference that changed
     * @param {*} value - New value
     */
    onPreferenceChange(preference, value) {
        console.log(`Accessibility preference changed: ${preference} = ${value}`);
        
        // Notify about the change
        this.announce(`${preference} is now ${value ? 'enabled' : 'disabled'}`);
        
        // Trigger callbacks if set
        if (preference === 'reducedMotion' && this.onReducedMotionChange) {
            this.onReducedMotionChange(value);
        }
        
        if (preference === 'highContrast' && this.onHighContrastChange) {
            this.onHighContrastChange(value);
        }
    }
    
    /**
     * Create ARIA description for mascot state
     * @param {Object} state - Current mascot state
     * @returns {string} ARIA description
     */
    createStateDescription(state) {
        const descriptions = {
            idle: 'Mascot is idle and gently breathing',
            happy: 'Mascot is happy and bouncing',
            excited: 'Mascot is excited with particles flying',
            calm: 'Mascot is calm and peaceful',
            curious: 'Mascot is curious and looking around',
            frustrated: 'Mascot is frustrated and shaking',
            sad: 'Mascot is sad and drooping',
            neutral: 'Mascot is in a neutral state'
        };
        
        return descriptions[state.emotional] || 'Mascot is active';
    }
    
    /**
     * Destroy accessibility manager
     */
    destroy() {
        // Remove event listeners
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
        
        // Remove live region
        if (this.liveRegion && this.liveRegion.parentNode) {
            this.liveRegion.parentNode.removeChild(this.liveRegion);
        }
        
        // Clear data
        this.focusableElements.clear();
        this.announcementQueue = [];
        this.focusHistory = [];
        
        console.log('AccessibilityManager destroyed');
    }
}

export default AccessibilityManager;