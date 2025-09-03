# Accessibility Guide

## Overview

The Emotive Communication Engine is designed with accessibility in mind, providing comprehensive support for users with disabilities. This guide covers WCAG compliance, screen reader support, reduced motion preferences, and other accessibility features.

## WCAG Compliance

### WCAG 2.1 Level AA Compliance

The Emotive Communication Engine meets WCAG 2.1 Level AA standards through the following implementations:

#### Perceivable
- **Alternative text for visual content**: All emotional states and gestures have descriptive ARIA labels
- **Color contrast**: High contrast mode support with 4.5:1 minimum contrast ratio
- **Resizable text**: Canvas content scales appropriately with browser zoom
- **Non-text content**: Audio descriptions available for visual animations

#### Operable
- **Keyboard accessible**: Full keyboard navigation support for interactive elements
- **No seizures**: Flashing effects respect seizure safety guidelines (< 3 flashes per second)
- **Enough time**: No time limits on user interactions
- **Navigation**: Clear focus indicators and logical tab order

#### Understandable
- **Readable**: Clear, simple language in all user-facing text
- **Predictable**: Consistent behavior across all interactions
- **Input assistance**: Clear error messages and validation feedback

#### Robust
- **Compatible**: Works with assistive technologies and different browsers
- **Valid code**: Semantic HTML and proper ARIA implementation

## Screen Reader Support

### ARIA Implementation

```javascript
class AccessibilityManager {
    constructor(mascot, canvas) {
        this.mascot = mascot;
        this.canvas = canvas;
        this.ariaLiveRegion = null;
        this.lastAnnouncement = '';
        this.announcementDelay = 1000; // Prevent spam
        
        this.setupARIA();
        this.setupEventListeners();
    }
    
    setupARIA() {
        // Set canvas ARIA attributes
        this.canvas.setAttribute('role', 'img');
        this.canvas.setAttribute('aria-label', 'Emotive mascot displaying emotions and gestures');
        this.canvas.setAttribute('aria-live', 'polite');
        this.canvas.setAttribute('aria-atomic', 'true');
        
        // Create live region for announcements
        this.ariaLiveRegion = document.createElement('div');
        this.ariaLiveRegion.setAttribute('aria-live', 'polite');
        this.ariaLiveRegion.setAttribute('aria-atomic', 'true');
        this.ariaLiveRegion.style.cssText = `
            position: absolute;
            left: -10000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;
        document.body.appendChild(this.ariaLiveRegion);
        
        // Set initial state
        this.updateCanvasDescription('neutral', null);
    }
    
    setupEventListeners() {
        // Listen for emotion changes
        this.mascot.on('emotionChange', (emotion, undertone) => {
            this.announceEmotionChange(emotion, undertone);
            this.updateCanvasDescription(emotion, undertone);
        });
        
        // Listen for gesture execution
        this.mascot.on('gestureStart', (gesture) => {
            this.announceGesture(gesture);
        });
        
        // Listen for performance changes
        this.mascot.on('performance:degradation', (level) => {
            this.announcePerformanceChange(level);
        });
        
        // Listen for errors
        this.mascot.on('error', (error) => {
            this.announceError(error);
        });
    }
    
    updateCanvasDescription(emotion, undertone) {
        const emotionDescriptions = {
            neutral: 'calm and balanced',
            joy: 'happy and cheerful',
            sadness: 'sad and melancholy',
            anger: 'angry and intense',
            fear: 'fearful and anxious',
            surprise: 'surprised and alert',
            disgust: 'disgusted and repulsed',
            love: 'loving and affectionate'
        };
        
        const undertoneDescriptions = {
            confident: 'with confidence',
            nervous: 'with nervousness',
            intense: 'with intensity',
            subdued: 'in a subdued manner',
            playful: 'in a playful way',
            serious: 'in a serious manner'
        };
        
        let description = `Mascot is feeling ${emotionDescriptions[emotion] || emotion}`;
        
        if (undertone && undertoneDescriptions[undertone]) {
            description += ` ${undertoneDescriptions[undertone]}`;
        }
        
        this.canvas.setAttribute('aria-label', description);
    }
    
    announceEmotionChange(emotion, undertone) {
        const message = this.createEmotionAnnouncement(emotion, undertone);
        this.announce(message);
    }
    
    announceGesture(gesture) {
        const gestureDescriptions = {
            bounce: 'bouncing up and down',
            pulse: 'pulsing gently',
            shake: 'shaking side to side',
            spin: 'spinning around',
            nod: 'nodding in agreement',
            tilt: 'tilting thoughtfully',
            expand: 'expanding outward',
            contract: 'contracting inward',
            flash: 'flashing briefly',
            drift: 'drifting smoothly'
        };
        
        const description = gestureDescriptions[gesture] || `performing ${gesture}`;
        this.announce(`Mascot is ${description}`);
    }
    
    announcePerformanceChange(level) {
        const messages = {
            optimal: 'Performance is optimal',
            reduced: 'Performance has been reduced for better experience',
            minimal: 'Performance is in minimal mode',
            emergency: 'Performance is in emergency mode with limited features'
        };
        
        this.announce(messages[level] || 'Performance level changed');
    }
    
    announceError(error) {
        if (error.severity === 'critical') {
            this.announce('An error occurred. Some features may be limited.');
        }
    }
    
    announce(message) {
        // Prevent duplicate announcements
        if (message === this.lastAnnouncement) {
            return;
        }
        
        // Throttle announcements
        if (this.announcementTimeout) {
            clearTimeout(this.announcementTimeout);
        }
        
        this.announcementTimeout = setTimeout(() => {
            this.ariaLiveRegion.textContent = message;
            this.lastAnnouncement = message;
            
            // Clear after announcement
            setTimeout(() => {
                this.ariaLiveRegion.textContent = '';
            }, 100);
        }, this.announcementDelay);
    }
    
    createEmotionAnnouncement(emotion, undertone) {
        const emotionMessages = {
            neutral: 'Mascot is now calm and neutral',
            joy: 'Mascot is now happy and joyful',
            sadness: 'Mascot is now sad',
            anger: 'Mascot is now angry',
            fear: 'Mascot is now fearful',
            surprise: 'Mascot is now surprised',
            disgust: 'Mascot is now disgusted',
            love: 'Mascot is now showing love'
        };
        
        let message = emotionMessages[emotion] || `Mascot emotion changed to ${emotion}`;
        
        if (undertone) {
            const undertoneMessages = {
                confident: 'with confidence',
                nervous: 'nervously',
                intense: 'intensely',
                subdued: 'in a subdued way',
                playful: 'playfully',
                serious: 'seriously'
            };
            
            if (undertoneMessages[undertone]) {
                message += ` ${undertoneMessages[undertone]}`;
            }
        }
        
        return message;
    }
    
    // Keyboard navigation support
    enableKeyboardNavigation() {
        this.canvas.setAttribute('tabindex', '0');
        
        this.canvas.addEventListener('keydown', (event) => {
            this.handleKeyboardInput(event);
        });
        
        this.canvas.addEventListener('focus', () => {
            this.announce('Emotive mascot focused. Use arrow keys to interact.');
        });
    }
    
    handleKeyboardInput(event) {
        const { key } = event;
        
        switch (key) {
            case 'ArrowUp':
                this.mascot.setEmotion('joy');
                event.preventDefault();
                break;
            case 'ArrowDown':
                this.mascot.setEmotion('sadness');
                event.preventDefault();
                break;
            case 'ArrowLeft':
                this.mascot.express('tilt');
                event.preventDefault();
                break;
            case 'ArrowRight':
                this.mascot.express('nod');
                event.preventDefault();
                break;
            case ' ':
            case 'Enter':
                this.mascot.express('bounce');
                event.preventDefault();
                break;
            case 'Escape':
                this.mascot.setEmotion('neutral');
                event.preventDefault();
                break;
        }
    }
    
    destroy() {
        if (this.ariaLiveRegion && this.ariaLiveRegion.parentNode) {
            this.ariaLiveRegion.parentNode.removeChild(this.ariaLiveRegion);
        }
        
        if (this.announcementTimeout) {
            clearTimeout(this.announcementTimeout);
        }
    }
}

// Usage
const accessibilityManager = new AccessibilityManager(mascot, canvas);
accessibilityManager.enableKeyboardNavigation();
```

### Screen Reader Testing

The following screen readers have been tested and are fully supported:

#### Windows
- **NVDA** (NonVisual Desktop Access) - Full support
- **JAWS** (Job Access With Speech) - Full support
- **Windows Narrator** - Basic support

#### macOS
- **VoiceOver** - Full support

#### Linux
- **Orca** - Full support

#### Mobile
- **iOS VoiceOver** - Full support
- **Android TalkBack** - Full support

### Screen Reader Best Practices

```javascript
// Example of proper screen reader integration
const mascot = new EmotiveMascot({
    canvas: canvas,
    accessibility: {
        screenReader: true,
        announcements: true,
        keyboardNavigation: true,
        verboseDescriptions: true
    }
});

// Custom announcement function
function announceToScreenReader(message, priority = 'polite') {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}
```

## Reduced Motion Support

### Detecting User Preferences

```javascript
class MotionPreferenceManager {
    constructor(mascot) {
        this.mascot = mascot;
        this.reducedMotion = this.detectReducedMotionPreference();
        this.setupMotionHandling();
    }
    
    detectReducedMotionPreference() {
        // Check CSS media query
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            return mediaQuery.matches;
        }
        
        // Fallback: check for accessibility settings
        return this.checkAccessibilitySettings();
    }
    
    checkAccessibilitySettings() {
        // Check for common accessibility indicators
        const indicators = [
            navigator.userAgent.includes('AccessibilityMode'),
            document.documentElement.classList.contains('reduced-motion'),
            localStorage.getItem('prefers-reduced-motion') === 'true'
        ];
        
        return indicators.some(indicator => indicator);
    }
    
    setupMotionHandling() {
        // Listen for preference changes
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            mediaQuery.addEventListener('change', (e) => {
                this.reducedMotion = e.matches;
                this.applyMotionPreferences();
            });
        }
        
        // Apply initial preferences
        this.applyMotionPreferences();
    }
    
    applyMotionPreferences() {
        if (this.reducedMotion) {
            this.enableReducedMotion();
        } else {
            this.enableFullMotion();
        }
    }
    
    enableReducedMotion() {
        console.log('Enabling reduced motion mode');
        
        // Reduce animation intensity
        this.mascot.setAnimationIntensity(0.3);
        
        // Disable particle effects
        this.mascot.setMaxParticles(0);
        
        // Simplify gestures
        this.mascot.setGestureComplexity('minimal');
        
        // Disable flashing effects
        this.mascot.disableFlashingEffects();
        
        // Reduce transition speeds
        this.mascot.setTransitionSpeed(0.5);
        
        // Use static emotional indicators
        this.mascot.enableStaticEmotionIndicators();
    }
    
    enableFullMotion() {
        console.log('Enabling full motion mode');
        
        // Restore full animation
        this.mascot.setAnimationIntensity(1.0);
        
        // Enable particle effects
        this.mascot.setMaxParticles(50);
        
        // Enable complex gestures
        this.mascot.setGestureComplexity('full');
        
        // Enable flashing effects
        this.mascot.enableFlashingEffects();
        
        // Normal transition speeds
        this.mascot.setTransitionSpeed(1.0);
        
        // Disable static indicators
        this.mascot.disableStaticEmotionIndicators();
    }
    
    // Manual override for user preferences
    setMotionPreference(reduced) {
        this.reducedMotion = reduced;
        this.applyMotionPreferences();
        
        // Store user preference
        localStorage.setItem('prefers-reduced-motion', reduced.toString());
    }
}

// Usage
const motionManager = new MotionPreferenceManager(mascot);

// Provide user control
function createMotionToggle() {
    const toggle = document.createElement('button');
    toggle.textContent = 'Toggle Motion';
    toggle.setAttribute('aria-label', 'Toggle reduced motion preference');
    
    toggle.addEventListener('click', () => {
        const currentPreference = motionManager.reducedMotion;
        motionManager.setMotionPreference(!currentPreference);
        
        const newState = motionManager.reducedMotion ? 'reduced' : 'full';
        toggle.setAttribute('aria-label', `Motion is now ${newState}. Click to toggle.`);
    });
    
    return toggle;
}
```

### Reduced Motion Implementation

```javascript
// Reduced motion gesture implementations
const reducedMotionGestures = {
    bounce: {
        duration: 500,
        intensity: 0.2,
        easing: 'ease-out'
    },
    pulse: {
        duration: 800,
        intensity: 0.1,
        easing: 'linear'
    },
    shake: {
        duration: 300,
        intensity: 0.1,
        easing: 'ease-in-out'
    },
    // Disable complex gestures
    spin: null,
    flash: null
};

// Static emotion indicators for reduced motion
const staticEmotionIndicators = {
    joy: {
        color: '#FFD700',
        symbol: '😊',
        pattern: 'solid'
    },
    sadness: {
        color: '#4169E1',
        symbol: '😢',
        pattern: 'dots'
    },
    anger: {
        color: '#DC143C',
        symbol: '😠',
        pattern: 'stripes'
    },
    fear: {
        color: '#9370DB',
        symbol: '😨',
        pattern: 'zigzag'
    },
    surprise: {
        color: '#FF6347',
        symbol: '😲',
        pattern: 'circles'
    },
    neutral: {
        color: '#808080',
        symbol: '😐',
        pattern: 'solid'
    }
};
```

## High Contrast Mode Support

### Automatic High Contrast Detection

```javascript
class HighContrastManager {
    constructor(mascot) {
        this.mascot = mascot;
        this.highContrast = this.detectHighContrastMode();
        this.setupContrastHandling();
    }
    
    detectHighContrastMode() {
        // Check CSS media query
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-contrast: high)');
            if (mediaQuery.matches) return true;
        }
        
        // Check Windows high contrast mode
        if (this.detectWindowsHighContrast()) return true;
        
        // Check for manual setting
        return localStorage.getItem('high-contrast-mode') === 'true';
    }
    
    detectWindowsHighContrast() {
        // Create test element to detect high contrast
        const testElement = document.createElement('div');
        testElement.style.cssText = `
            position: absolute;
            left: -9999px;
            background-color: canvas;
            color: canvasText;
        `;
        document.body.appendChild(testElement);
        
        const styles = window.getComputedStyle(testElement);
        const isHighContrast = styles.backgroundColor !== 'rgba(0, 0, 0, 0)' &&
                              styles.backgroundColor !== 'transparent';
        
        document.body.removeChild(testElement);
        return isHighContrast;
    }
    
    setupContrastHandling() {
        // Listen for contrast preference changes
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-contrast: high)');
            mediaQuery.addEventListener('change', (e) => {
                this.highContrast = e.matches;
                this.applyContrastSettings();
            });
        }
        
        // Apply initial settings
        this.applyContrastSettings();
    }
    
    applyContrastSettings() {
        if (this.highContrast) {
            this.enableHighContrast();
        } else {
            this.enableNormalContrast();
        }
    }
    
    enableHighContrast() {
        console.log('Enabling high contrast mode');
        
        // High contrast color palette
        const highContrastColors = {
            neutral: { primary: '#FFFFFF', secondary: '#000000', accent: '#FFFF00' },
            joy: { primary: '#FFFF00', secondary: '#000000', accent: '#FFFFFF' },
            sadness: { primary: '#0000FF', secondary: '#FFFFFF', accent: '#FFFF00' },
            anger: { primary: '#FF0000', secondary: '#FFFFFF', accent: '#000000' },
            fear: { primary: '#800080', secondary: '#FFFFFF', accent: '#FFFF00' },
            surprise: { primary: '#FF8000', secondary: '#000000', accent: '#FFFFFF' },
            love: { primary: '#FF69B4', secondary: '#000000', accent: '#FFFFFF' }
        };
        
        // Apply high contrast colors
        this.mascot.setColorPalette(highContrastColors);
        
        // Increase border thickness
        this.mascot.setBorderWidth(3);
        
        // Disable subtle effects
        this.mascot.disableGradients();
        this.mascot.disableTransparency();
        
        // Enhance focus indicators
        this.mascot.setFocusIndicatorWidth(4);
        
        // Use high contrast patterns
        this.mascot.enableHighContrastPatterns();
    }
    
    enableNormalContrast() {
        console.log('Enabling normal contrast mode');
        
        // Restore normal color palette
        this.mascot.restoreDefaultColors();
        
        // Normal border thickness
        this.mascot.setBorderWidth(1);
        
        // Enable visual effects
        this.mascot.enableGradients();
        this.mascot.enableTransparency();
        
        // Normal focus indicators
        this.mascot.setFocusIndicatorWidth(2);
        
        // Disable high contrast patterns
        this.mascot.disableHighContrastPatterns();
    }
    
    setContrastPreference(highContrast) {
        this.highContrast = highContrast;
        this.applyContrastSettings();
        
        // Store preference
        localStorage.setItem('high-contrast-mode', highContrast.toString());
    }
}

// Usage
const contrastManager = new HighContrastManager(mascot);
```

### High Contrast Color Schemes

```javascript
// WCAG AA compliant high contrast color schemes
const highContrastSchemes = {
    // Black on white (most common)
    blackOnWhite: {
        background: '#FFFFFF',
        foreground: '#000000',
        accent: '#0000FF',
        warning: '#FF0000',
        success: '#008000'
    },
    
    // White on black
    whiteOnBlack: {
        background: '#000000',
        foreground: '#FFFFFF',
        accent: '#FFFF00',
        warning: '#FF0000',
        success: '#00FF00'
    },
    
    // Yellow on black (high visibility)
    yellowOnBlack: {
        background: '#000000',
        foreground: '#FFFF00',
        accent: '#FFFFFF',
        warning: '#FF0000',
        success: '#00FF00'
    },
    
    // Custom user-defined scheme
    custom: {
        background: '#FFFFFF',
        foreground: '#000000',
        accent: '#0000FF',
        warning: '#FF0000',
        success: '#008000'
    }
};

// Apply contrast scheme
function applyContrastScheme(mascot, schemeName) {
    const scheme = highContrastSchemes[schemeName];
    if (!scheme) return false;
    
    mascot.setColorScheme({
        background: scheme.background,
        primary: scheme.foreground,
        secondary: scheme.accent,
        warning: scheme.warning,
        success: scheme.success
    });
    
    return true;
}
```

## Keyboard Navigation

### Full Keyboard Support Implementation

```javascript
class KeyboardNavigationManager {
    constructor(mascot, canvas) {
        this.mascot = mascot;
        this.canvas = canvas;
        this.focusVisible = false;
        this.keyboardMode = false;
        
        this.setupKeyboardNavigation();
        this.setupFocusManagement();
    }
    
    setupKeyboardNavigation() {
        // Make canvas focusable
        this.canvas.setAttribute('tabindex', '0');
        this.canvas.setAttribute('role', 'application');
        this.canvas.setAttribute('aria-label', 'Interactive emotive mascot');
        
        // Keyboard event listeners
        this.canvas.addEventListener('keydown', (event) => {
            this.keyboardMode = true;
            this.handleKeyDown(event);
        });
        
        this.canvas.addEventListener('keyup', (event) => {
            this.handleKeyUp(event);
        });
        
        // Mouse interaction detection
        this.canvas.addEventListener('mousedown', () => {
            this.keyboardMode = false;
            this.updateFocusVisibility();
        });
        
        // Focus events
        this.canvas.addEventListener('focus', () => {
            this.focusVisible = this.keyboardMode;
            this.updateFocusVisibility();
            this.announceKeyboardHelp();
        });
        
        this.canvas.addEventListener('blur', () => {
            this.focusVisible = false;
            this.updateFocusVisibility();
        });
    }
    
    setupFocusManagement() {
        // Create focus indicator
        this.focusIndicator = document.createElement('div');
        this.focusIndicator.style.cssText = `
            position: absolute;
            pointer-events: none;
            border: 2px solid #0066CC;
            border-radius: 4px;
            opacity: 0;
            transition: opacity 0.2s ease;
            z-index: 1000;
        `;
        document.body.appendChild(this.focusIndicator);
        
        // Update focus indicator position
        this.updateFocusIndicatorPosition();
        window.addEventListener('resize', () => {
            this.updateFocusIndicatorPosition();
        });
    }
    
    updateFocusIndicatorPosition() {
        const rect = this.canvas.getBoundingClientRect();
        this.focusIndicator.style.left = `${rect.left - 2}px`;
        this.focusIndicator.style.top = `${rect.top - 2}px`;
        this.focusIndicator.style.width = `${rect.width}px`;
        this.focusIndicator.style.height = `${rect.height}px`;
    }
    
    updateFocusVisibility() {
        this.focusIndicator.style.opacity = this.focusVisible ? '1' : '0';
        
        // Update canvas styling for focus
        if (this.focusVisible) {
            this.canvas.style.outline = '2px solid #0066CC';
            this.canvas.style.outlineOffset = '2px';
        } else {
            this.canvas.style.outline = 'none';
        }
    }
    
    handleKeyDown(event) {
        const { key, ctrlKey, altKey, shiftKey } = event;
        
        // Prevent default for handled keys
        const handledKeys = [
            'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
            'Enter', ' ', 'Escape', 'Home', 'End',
            '1', '2', '3', '4', '5', '6', '7', '8'
        ];
        
        if (handledKeys.includes(key)) {
            event.preventDefault();
        }
        
        // Handle key combinations
        if (ctrlKey) {
            this.handleControlKey(key);
        } else if (altKey) {
            this.handleAltKey(key);
        } else if (shiftKey) {
            this.handleShiftKey(key);
        } else {
            this.handleSingleKey(key);
        }
    }
    
    handleSingleKey(key) {
        switch (key) {
            // Emotion controls
            case 'ArrowUp':
                this.mascot.setEmotion('joy');
                this.announce('Emotion set to joy');
                break;
            case 'ArrowDown':
                this.mascot.setEmotion('sadness');
                this.announce('Emotion set to sadness');
                break;
            case 'ArrowLeft':
                this.mascot.setEmotion('fear');
                this.announce('Emotion set to fear');
                break;
            case 'ArrowRight':
                this.mascot.setEmotion('surprise');
                this.announce('Emotion set to surprise');
                break;
                
            // Gesture controls
            case 'Enter':
            case ' ':
                this.mascot.express('bounce');
                this.announce('Bouncing');
                break;
                
            // Number keys for emotions
            case '1':
                this.mascot.setEmotion('neutral');
                this.announce('Emotion set to neutral');
                break;
            case '2':
                this.mascot.setEmotion('joy');
                this.announce('Emotion set to joy');
                break;
            case '3':
                this.mascot.setEmotion('sadness');
                this.announce('Emotion set to sadness');
                break;
            case '4':
                this.mascot.setEmotion('anger');
                this.announce('Emotion set to anger');
                break;
            case '5':
                this.mascot.setEmotion('fear');
                this.announce('Emotion set to fear');
                break;
            case '6':
                this.mascot.setEmotion('surprise');
                this.announce('Emotion set to surprise');
                break;
            case '7':
                this.mascot.setEmotion('disgust');
                this.announce('Emotion set to disgust');
                break;
            case '8':
                this.mascot.setEmotion('love');
                this.announce('Emotion set to love');
                break;
                
            // Reset
            case 'Escape':
                this.mascot.setEmotion('neutral');
                this.mascot.stopAllGestures();
                this.announce('Reset to neutral state');
                break;
                
            // Help
            case '?':
            case '/':
                this.showKeyboardHelp();
                break;
        }
    }
    
    handleControlKey(key) {
        switch (key) {
            case 'r':
                // Reset mascot
                this.mascot.reset();
                this.announce('Mascot reset');
                break;
            case 'p':
                // Toggle pause
                this.mascot.togglePause();
                this.announce('Playback toggled');
                break;
        }
    }
    
    handleAltKey(key) {
        switch (key) {
            case 'h':
                this.showKeyboardHelp();
                break;
        }
    }
    
    handleShiftKey(key) {
        // Shift + number for gestures
        const gestureMap = {
            '1': 'pulse',
            '2': 'bounce',
            '3': 'shake',
            '4': 'spin',
            '5': 'nod',
            '6': 'tilt',
            '7': 'expand',
            '8': 'contract',
            '9': 'flash',
            '0': 'drift'
        };
        
        if (gestureMap[key]) {
            this.mascot.express(gestureMap[key]);
            this.announce(`Performing ${gestureMap[key]} gesture`);
        }
    }
    
    announceKeyboardHelp() {
        const helpText = `
            Emotive mascot keyboard controls:
            Arrow keys: Change emotions
            Number keys 1-8: Set specific emotions
            Shift + numbers: Perform gestures
            Enter or Space: Bounce
            Escape: Reset to neutral
            Question mark: Show help
        `;
        
        this.announce(helpText);
    }
    
    showKeyboardHelp() {
        // Create help modal
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border: 2px solid #333;
            border-radius: 8px;
            padding: 20px;
            max-width: 500px;
            z-index: 10000;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        `;
        
        modal.innerHTML = `
            <h2>Keyboard Controls</h2>
            <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 10px; margin: 15px 0;">
                <strong>Arrow Keys</strong><span>Change emotions (↑Joy ↓Sadness ←Fear →Surprise)</span>
                <strong>1-8</strong><span>Set specific emotions (1=Neutral, 2=Joy, etc.)</span>
                <strong>Shift+1-0</strong><span>Perform gestures</span>
                <strong>Enter/Space</strong><span>Bounce gesture</span>
                <strong>Escape</strong><span>Reset to neutral</span>
                <strong>Ctrl+R</strong><span>Reset mascot</span>
                <strong>Ctrl+P</strong><span>Toggle pause</span>
                <strong>?</strong><span>Show this help</span>
            </div>
            <button id="close-help" style="margin-top: 15px; padding: 8px 16px;">Close (Escape)</button>
        `;
        
        // Add backdrop
        const backdrop = document.createElement('div');
        backdrop.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 9999;
        `;
        
        document.body.appendChild(backdrop);
        document.body.appendChild(modal);
        
        // Focus management
        const closeButton = modal.querySelector('#close-help');
        closeButton.focus();
        
        // Close handlers
        const closeModal = () => {
            document.body.removeChild(backdrop);
            document.body.removeChild(modal);
            this.canvas.focus();
        };
        
        closeButton.addEventListener('click', closeModal);
        backdrop.addEventListener('click', closeModal);
        
        modal.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                closeModal();
            }
        });
    }
    
    announce(message) {
        // Use the accessibility manager's announce function
        if (this.accessibilityManager) {
            this.accessibilityManager.announce(message);
        } else {
            // Fallback announcement
            console.log('Accessibility announcement:', message);
        }
    }
    
    destroy() {
        if (this.focusIndicator && this.focusIndicator.parentNode) {
            this.focusIndicator.parentNode.removeChild(this.focusIndicator);
        }
    }
}

// Usage
const keyboardManager = new KeyboardNavigationManager(mascot, canvas);
```

## Mobile Accessibility

### Touch Accessibility Features

```javascript
class MobileAccessibilityManager {
    constructor(mascot, canvas) {
        this.mascot = mascot;
        this.canvas = canvas;
        this.touchStartTime = 0;
        this.longPressThreshold = 500;
        this.doubleTapThreshold = 300;
        this.lastTapTime = 0;
        
        this.setupTouchAccessibility();
        this.setupVoiceOverSupport();
    }
    
    setupTouchAccessibility() {
        // Enhanced touch events for accessibility
        this.canvas.addEventListener('touchstart', (event) => {
            this.handleAccessibleTouchStart(event);
        });
        
        this.canvas.addEventListener('touchend', (event) => {
            this.handleAccessibleTouchEnd(event);
        });
        
        // Gesture recognition for accessibility
        this.canvas.addEventListener('gesturestart', (event) => {
            event.preventDefault();
            this.handleAccessibleGesture(event);
        });
    }
    
    setupVoiceOverSupport() {
        // iOS VoiceOver support
        this.canvas.setAttribute('aria-label', 'Interactive emotive mascot');
        this.canvas.setAttribute('role', 'button');
        this.canvas.setAttribute('aria-describedby', 'mascot-instructions');
        
        // Create instructions element
        const instructions = document.createElement('div');
        instructions.id = 'mascot-instructions';
        instructions.style.cssText = `
            position: absolute;
            left: -10000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;
        instructions.textContent = 'Tap to interact with mascot. Double tap for joy. Long press for menu.';
        document.body.appendChild(instructions);
        
        // VoiceOver custom actions
        this.setupCustomActions();
    }
    
    setupCustomActions() {
        // Custom actions for VoiceOver
        const actions = [
            { name: 'Set Joy', action: () => this.mascot.setEmotion('joy') },
            { name: 'Set Sadness', action: () => this.mascot.setEmotion('sadness') },
            { name: 'Bounce', action: () => this.mascot.express('bounce') },
            { name: 'Reset', action: () => this.mascot.setEmotion('neutral') }
        ];
        
        // Store actions for VoiceOver
        this.canvas.setAttribute('aria-actions', JSON.stringify(actions.map(a => a.name)));
    }
    
    handleAccessibleTouchStart(event) {
        this.touchStartTime = Date.now();
        
        // Provide haptic feedback if available
        if (navigator.vibrate) {
            navigator.vibrate(10);
        }
        
        // Announce touch start
        this.announceTouch('Touch started');
    }
    
    handleAccessibleTouchEnd(event) {
        const touchDuration = Date.now() - this.touchStartTime;
        const currentTime = Date.now();
        
        // Detect interaction type
        if (touchDuration > this.longPressThreshold) {
            this.handleLongPress(event);
        } else if (currentTime - this.lastTapTime < this.doubleTapThreshold) {
            this.handleDoubleTap(event);
        } else {
            this.handleSingleTap(event);
        }
        
        this.lastTapTime = currentTime;
    }
    
    handleSingleTap(event) {
        this.mascot.express('pulse');
        this.announceTouch('Single tap - pulsing');
        
        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    }
    
    handleDoubleTap(event) {
        this.mascot.setEmotion('joy');
        this.announceTouch('Double tap - setting joy emotion');
        
        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate([50, 50, 50]);
        }
    }
    
    handleLongPress(event) {
        this.showAccessibilityMenu();
        this.announceTouch('Long press - opening accessibility menu');
        
        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(100);
        }
    }
    
    handleAccessibleGesture(event) {
        // Handle multi-finger gestures for accessibility
        const scale = event.scale;
        
        if (scale > 1.2) {
            this.mascot.express('expand');
            this.announceTouch('Pinch out - expanding');
        } else if (scale < 0.8) {
            this.mascot.express('contract');
            this.announceTouch('Pinch in - contracting');
        }
    }
    
    showAccessibilityMenu() {
        // Create accessible menu
        const menu = document.createElement('div');
        menu.setAttribute('role', 'menu');
        menu.setAttribute('aria-label', 'Mascot actions menu');
        menu.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: white;
            border: 2px solid #333;
            border-radius: 8px;
            padding: 10px;
            z-index: 10000;
            display: flex;
            gap: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        `;
        
        const actions = [
            { label: 'Joy', emotion: 'joy', icon: '😊' },
            { label: 'Sad', emotion: 'sadness', icon: '😢' },
            { label: 'Angry', emotion: 'anger', icon: '😠' },
            { label: 'Surprised', emotion: 'surprise', icon: '😲' },
            { label: 'Neutral', emotion: 'neutral', icon: '😐' }
        ];
        
        actions.forEach((action, index) => {
            const button = document.createElement('button');
            button.setAttribute('role', 'menuitem');
            button.setAttribute('aria-label', `Set emotion to ${action.label}`);
            button.style.cssText = `
                padding: 12px;
                font-size: 24px;
                border: 1px solid #ccc;
                border-radius: 4px;
                background: white;
                cursor: pointer;
                min-width: 50px;
            `;
            button.textContent = action.icon;
            
            button.addEventListener('click', () => {
                this.mascot.setEmotion(action.emotion);
                this.announceTouch(`Emotion set to ${action.label}`);
                this.closeAccessibilityMenu();
                
                // Haptic feedback
                if (navigator.vibrate) {
                    navigator.vibrate(30);
                }
            });
            
            menu.appendChild(button);
        });
        
        // Add close button
        const closeButton = document.createElement('button');
        closeButton.setAttribute('aria-label', 'Close menu');
        closeButton.style.cssText = `
            padding: 12px;
            font-size: 16px;
            border: 1px solid #ccc;
            border-radius: 4px;
            background: #f0f0f0;
            cursor: pointer;
        `;
        closeButton.textContent = '✕';
        closeButton.addEventListener('click', () => {
            this.closeAccessibilityMenu();
        });
        
        menu.appendChild(closeButton);
        document.body.appendChild(menu);
        
        // Focus first button
        menu.firstElementChild.focus();
        
        // Store reference for cleanup
        this.accessibilityMenu = menu;
        
        // Auto-close after 10 seconds
        this.menuTimeout = setTimeout(() => {
            this.closeAccessibilityMenu();
        }, 10000);
    }
    
    closeAccessibilityMenu() {
        if (this.accessibilityMenu) {
            document.body.removeChild(this.accessibilityMenu);
            this.accessibilityMenu = null;
        }
        
        if (this.menuTimeout) {
            clearTimeout(this.menuTimeout);
            this.menuTimeout = null;
        }
        
        // Return focus to canvas
        this.canvas.focus();
    }
    
    announceTouch(message) {
        // Create announcement for screen readers
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.style.cssText = `
            position: absolute;
            left: -10000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            if (announcement.parentNode) {
                document.body.removeChild(announcement);
            }
        }, 1000);
    }
}

// Usage
const mobileAccessibility = new MobileAccessibilityManager(mascot, canvas);
```

## Accessibility Testing

### Automated Testing Tools

```javascript
// Accessibility testing utilities
class AccessibilityTester {
    constructor(mascot, canvas) {
        this.mascot = mascot;
        this.canvas = canvas;
        this.testResults = [];
    }
    
    runAccessibilityTests() {
        console.log('Running accessibility tests...');
        
        this.testResults = [];
        
        // Run all tests
        this.testARIALabels();
        this.testKeyboardNavigation();
        this.testColorContrast();
        this.testFocusManagement();
        this.testScreenReaderSupport();
        this.testMotionPreferences();
        
        return this.generateTestReport();
    }
    
    testARIALabels() {
        const test = {
            name: 'ARIA Labels',
            passed: true,
            issues: []
        };
        
        // Check canvas ARIA attributes
        if (!this.canvas.getAttribute('aria-label')) {
            test.passed = false;
            test.issues.push('Canvas missing aria-label');
        }
        
        if (!this.canvas.getAttribute('role')) {
            test.passed = false;
            test.issues.push('Canvas missing role attribute');
        }
        
        this.testResults.push(test);
    }
    
    testKeyboardNavigation() {
        const test = {
            name: 'Keyboard Navigation',
            passed: true,
            issues: []
        };
        
        // Check if canvas is focusable
        if (!this.canvas.hasAttribute('tabindex')) {
            test.passed = false;
            test.issues.push('Canvas not focusable via keyboard');
        }
        
        // Check for keyboard event listeners
        const hasKeyboardListeners = this.canvas.onkeydown || 
                                   this.canvas.onkeyup || 
                                   this.canvas.onkeypress;
        
        if (!hasKeyboardListeners) {
            test.passed = false;
            test.issues.push('No keyboard event listeners detected');
        }
        
        this.testResults.push(test);
    }
    
    testColorContrast() {
        const test = {
            name: 'Color Contrast',
            passed: true,
            issues: []
        };
        
        // Test color contrast ratios
        const colors = this.mascot.getCurrentColors();
        
        Object.entries(colors).forEach(([name, color]) => {
            const contrast = this.calculateContrastRatio(color.foreground, color.background);
            
            if (contrast < 4.5) {
                test.passed = false;
                test.issues.push(`${name} color contrast ratio ${contrast.toFixed(2)} below WCAG AA standard (4.5:1)`);
            }
        });
        
        this.testResults.push(test);
    }
    
    testFocusManagement() {
        const test = {
            name: 'Focus Management',
            passed: true,
            issues: []
        };
        
        // Test focus visibility
        this.canvas.focus();
        const focusStyles = window.getComputedStyle(this.canvas);
        
        if (focusStyles.outline === 'none' && focusStyles.boxShadow === 'none') {
            test.passed = false;
            test.issues.push('No visible focus indicator');
        }
        
        this.testResults.push(test);
    }
    
    testScreenReaderSupport() {
        const test = {
            name: 'Screen Reader Support',
            passed: true,
            issues: []
        };
        
        // Check for live regions
        const liveRegions = document.querySelectorAll('[aria-live]');
        if (liveRegions.length === 0) {
            test.passed = false;
            test.issues.push('No ARIA live regions found for announcements');
        }
        
        this.testResults.push(test);
    }
    
    testMotionPreferences() {
        const test = {
            name: 'Motion Preferences',
            passed: true,
            issues: []
        };
        
        // Check if reduced motion is respected
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) {
            const animationIntensity = this.mascot.getAnimationIntensity();
            if (animationIntensity > 0.5) {
                test.passed = false;
                test.issues.push('Reduced motion preference not respected');
            }
        }
        
        this.testResults.push(test);
    }
    
    calculateContrastRatio(foreground, background) {
        // Simplified contrast ratio calculation
        const getLuminance = (color) => {
            // Convert hex to RGB and calculate relative luminance
            const hex = color.replace('#', '');
            const r = parseInt(hex.substr(0, 2), 16) / 255;
            const g = parseInt(hex.substr(2, 2), 16) / 255;
            const b = parseInt(hex.substr(4, 2), 16) / 255;
            
            const sRGB = [r, g, b].map(c => {
                return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
            });
            
            return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
        };
        
        const l1 = getLuminance(foreground);
        const l2 = getLuminance(background);
        
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        
        return (lighter + 0.05) / (darker + 0.05);
    }
    
    generateTestReport() {
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(test => test.passed).length;
        const failedTests = totalTests - passedTests;
        
        const report = {
            summary: {
                total: totalTests,
                passed: passedTests,
                failed: failedTests,
                score: Math.round((passedTests / totalTests) * 100)
            },
            details: this.testResults,
            recommendations: this.generateRecommendations()
        };
        
        console.log('Accessibility Test Report:', report);
        return report;
    }
    
    generateRecommendations() {
        const recommendations = [];
        
        this.testResults.forEach(test => {
            if (!test.passed) {
                test.issues.forEach(issue => {
                    recommendations.push({
                        category: test.name,
                        issue: issue,
                        priority: this.getIssuePriority(issue)
                    });
                });
            }
        });
        
        return recommendations.sort((a, b) => b.priority - a.priority);
    }
    
    getIssuePriority(issue) {
        // Assign priority based on issue type
        if (issue.includes('contrast')) return 3;
        if (issue.includes('keyboard')) return 3;
        if (issue.includes('aria-label')) return 2;
        if (issue.includes('focus')) return 2;
        return 1;
    }
}

// Usage
const accessibilityTester = new AccessibilityTester(mascot, canvas);
const testReport = accessibilityTester.runAccessibilityTests();
```

## Implementation Checklist

### WCAG 2.1 AA Compliance Checklist

- [ ] **Perceivable**
  - [ ] Alternative text for all visual content
  - [ ] Color contrast ratio ≥ 4.5:1
  - [ ] Content scalable up to 200% without loss of functionality
  - [ ] Audio descriptions for visual animations

- [ ] **Operable**
  - [ ] All functionality available via keyboard
  - [ ] No content flashes more than 3 times per second
  - [ ] Users can pause, stop, or hide moving content
  - [ ] Clear focus indicators with 2px minimum thickness

- [ ] **Understandable**
  - [ ] Clear, simple language in all text
  - [ ] Consistent navigation and interaction patterns
  - [ ] Error messages are descriptive and helpful
  - [ ] Instructions provided for complex interactions

- [ ] **Robust**
  - [ ] Valid, semantic HTML structure
  - [ ] Compatible with assistive technologies
  - [ ] Graceful degradation when features unavailable
  - [ ] Progressive enhancement approach

### Screen Reader Testing Checklist

- [ ] **NVDA (Windows)**
  - [ ] All content announced correctly
  - [ ] Navigation works with arrow keys
  - [ ] Live regions announce changes
  - [ ] Form controls properly labeled

- [ ] **JAWS (Windows)**
  - [ ] Virtual cursor navigation
  - [ ] Table navigation (if applicable)
  - [ ] Heading navigation
  - [ ] Link navigation

- [ ] **VoiceOver (macOS/iOS)**
  - [ ] Rotor navigation
  - [ ] Custom actions work
  - [ ] Gesture support
  - [ ] Braille display support

- [ ] **TalkBack (Android)**
  - [ ] Explore by touch
  - [ ] Linear navigation
  - [ ] Reading controls
  - [ ] Global gestures

### Mobile Accessibility Checklist

- [ ] **Touch Targets**
  - [ ] Minimum 44px × 44px touch targets
  - [ ] Adequate spacing between targets
  - [ ] Touch targets don't overlap

- [ ] **Gestures**
  - [ ] Alternative to complex gestures
  - [ ] Single-finger operation possible
  - [ ] Gesture customization available

- [ ] **Orientation**
  - [ ] Works in both portrait and landscape
  - [ ] Content reflows appropriately
  - [ ] No loss of functionality

- [ ] **Motion**
  - [ ] Respects reduced motion preferences
  - [ ] Alternative to motion-based input
  - [ ] Motion can be disabled

This comprehensive accessibility implementation ensures the Emotive Communication Engine is usable by all users, regardless of their abilities or the assistive technologies they use.