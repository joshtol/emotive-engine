/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Rhythm Core
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 
 * @fileoverview Core rhythm timing engine for musical synchronization
 * @author Emotive Engine Team
 * @module core/rhythm
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║ CONCEPT                                                                           
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Central timing engine that provides musical time references to all subsystems.    
 * ║ Does NOT dictate what animations do - only provides timing information.           
 * ║ Each subsystem maintains its own rhythm configuration in its files.              
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 * 
 * ARCHITECTURE:
 * • Provides beat events and musical time references
 * • Supports multiple time signatures and tempo changes
 * • Enables audio synchronization from external sources
 * • Each gesture/emotion/behavior defines its own rhythm response
 * 
 * ┌──────────────────────────────────────────────────────────────────────────────────┐
 * │  TIMING FLOW                                                                      │
 * │                                                                                   │
 * │  Audio Input ──┐                                                                 │
 * │                ↓                                                                  │
 * │  [Rhythm Engine] ← Internal Clock                                                │
 * │        ↓                                                                          │
 * │   Beat Events → Subsystems (each with own rhythm config)                        │
 * │                                                                                   │
 * └──────────────────────────────────────────────────────────────────────────────────┘
 */

class RhythmEngine {
    constructor() {
        // Core timing properties
        this.bpm = 120;                    // Default BPM (beats per minute)
        this.timeSignature = [4, 4];       // Default 4/4 time
        this.isPlaying = false;            // Whether rhythm is active
        
        // Musical time tracking
        this.startTime = 0;                // When rhythm started
        this.currentBeat = 0;              // Current beat number
        this.currentBar = 0;               // Current bar/measure number
        this.beatProgress = 0;             // Progress within current beat (0-1)
        this.barProgress = 0;              // Progress within current bar (0-1)
        
        // Timing calculations
        this.beatDuration = 60000 / this.bpm;  // Milliseconds per beat
        this.barDuration = this.beatDuration * this.timeSignature[0];
        this.lastBeatTime = 0;             // Timestamp of last beat
        this.nextBeatTime = 0;             // Timestamp of next beat
        
        // Event listeners
        this.listeners = new Map();        // Event type -> Set of callbacks
        this.beatCallbacks = new Set();    // Callbacks for every beat
        this.barCallbacks = new Set();     // Callbacks for every bar
        
        // Subdivisions for finer timing
        this.subdivisions = {
            sixteenth: 0,    // 16th note position
            eighth: 0,       // 8th note position
            triplet: 0,      // Triplet position
            swing: 0         // Swing timing offset
        };
        
        // Sync state
        this.audioSync = null;             // External audio sync source
        this.syncOffset = 0;               // Timing offset for sync
        this.autoSync = false;             // Auto-detect tempo from audio
        
        // Musical dynamics
        this.intensity = 1.0;              // Current musical intensity (0-1)
        this.groove = 0;                   // Groove/swing amount (0-1)
        this.humanize = 0.05;              // Timing humanization factor
        
        // Pattern tracking
        this.patterns = new Map();         // Named rhythm patterns
        this.currentPattern = null;        // Active rhythm pattern
        
        // Initialize default patterns
        this.initializePatterns();
    }
    
    /**
     * Initialize default rhythm patterns
     */
    initializePatterns() {
        // Basic patterns - these are just timing references
        // Actual animations define their own responses to these patterns
        
        // Common time signatures
        this.patterns.set('4/4', {
            name: '4/4',
            description: 'Common time - 4 beats per bar',
            timeSignature: [4, 4],
            groove: 0,
            accents: [1, 0.5, 0.7, 0.5]  // Beat emphasis pattern
        });
        
        this.patterns.set('straight', {
            name: 'straight',
            description: 'Straight, even timing',
            groove: 0,
            accents: [1, 0.5, 0.7, 0.5]  // Beat emphasis pattern
        });
        
        this.patterns.set('swing', {
            name: 'swing',
            description: 'Swing/shuffle timing',
            groove: 0.67,  // 2:1 swing ratio
            accents: [1, 0.3, 0.8, 0.3]
        });
        
        this.patterns.set('3/4', {
            name: '3/4',
            description: 'Waltz time - 3 beats per bar',
            timeSignature: [3, 4],
            accents: [1, 0.5, 0.5]
        });
        
        this.patterns.set('waltz', {
            name: 'waltz',
            description: '3/4 waltz timing',
            timeSignature: [3, 4],
            accents: [1, 0.5, 0.5]
        });
        
        this.patterns.set('6/8', {
            name: '6/8',
            description: 'Compound duple time',
            timeSignature: [6, 8],
            accents: [1, 0.3, 0.3, 0.7, 0.3, 0.3]
        });
        
        this.patterns.set('5/4', {
            name: '5/4',
            description: 'Complex meter - 5 beats per bar',
            timeSignature: [5, 4],
            accents: [1, 0.5, 0.6, 0.5, 0.7]
        });
        
        this.patterns.set('7/8', {
            name: '7/8',
            description: 'Irregular meter',
            timeSignature: [7, 8],
            accents: [1, 0.5, 0.5, 0.7, 0.5, 0.5, 0.6]
        });
        
        this.patterns.set('dubstep', {
            name: 'dubstep',
            description: 'Dubstep half-time feel',
            accents: [0.2, 0.2, 1, 0.2],  // Heavy on beat 3
            subdivisions: { wobble: true }
        });
        
        this.patterns.set('breakbeat', {
            name: 'breakbeat',
            description: 'Broken beat pattern',
            accents: [1, 0.2, 0.7, 0.9, 0.2, 0.8, 0.4, 0.2]
        });
    }
    
    /**
     * Start the rhythm engine
     */
    start() {
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        this.startTime = performance.now();
        this.lastBeatTime = this.startTime;
        this.nextBeatTime = this.startTime + this.beatDuration;
        this.currentBeat = 0;
        this.currentBar = 0;
        
        // Emit start event
        this.emit('start', {
            bpm: this.bpm,
            timeSignature: this.timeSignature,
            pattern: this.currentPattern
        });
        
        // Start update loop
        this.update();
    }
    
    /**
     * Stop the rhythm engine
     */
    stop() {
        if (!this.isPlaying) return;
        
        this.isPlaying = false;
        this.emit('stop', {
            totalBeats: this.currentBeat,
            totalBars: this.currentBar
        });
    }
    
    /**
     * Main update loop
     */
    update() {
        if (!this.isPlaying) return;
        
        const now = performance.now();
        const elapsed = now - this.startTime;
        
        // Calculate musical time positions
        const beatsSinceStart = elapsed / this.beatDuration;
        const newBeat = Math.floor(beatsSinceStart);
        this.beatProgress = beatsSinceStart % 1;
        
        // Check for beat change
        if (newBeat > this.currentBeat) {
            this.onBeat(newBeat);
        }
        
        // Calculate bar position
        const newBar = Math.floor(newBeat / this.timeSignature[0]);
        if (newBar > this.currentBar) {
            this.onBar(newBar);
        }
        
        this.currentBeat = newBeat;
        this.currentBar = newBar;
        this.barProgress = (newBeat % this.timeSignature[0]) / this.timeSignature[0];
        
        // Calculate subdivisions
        this.updateSubdivisions();
        
        // Emit continuous update
        this.emit('update', this.getTimeInfo());
        
        // Continue loop
        requestAnimationFrame(() => this.update());
    }
    
    /**
     * Handle beat event
     */
    onBeat(beatNumber) {
        const beatInBar = beatNumber % this.timeSignature[0];
        const accent = this.getAccent(beatInBar);
        
        // Add humanization
        const humanTiming = this.humanize * (Math.random() - 0.5) * this.beatDuration;
        
        const beatInfo = {
            beat: beatNumber,
            beatInBar: beatInBar,
            bar: this.currentBar,
            accent: accent,
            intensity: this.intensity * accent,
            humanTiming: humanTiming,
            timestamp: performance.now()
        };
        
        // Emit beat event
        this.emit('beat', beatInfo);
        
        // Call beat callbacks
        this.beatCallbacks.forEach(callback => callback(beatInfo));
        
        // Update timing
        this.lastBeatTime = performance.now();
        this.nextBeatTime = this.lastBeatTime + this.beatDuration;
    }
    
    /**
     * Handle bar event
     */
    onBar(barNumber) {
        const barInfo = {
            bar: barNumber,
            timeSignature: this.timeSignature,
            pattern: this.currentPattern,
            timestamp: performance.now()
        };
        
        // Emit bar event
        this.emit('bar', barInfo);
        
        // Call bar callbacks
        this.barCallbacks.forEach(callback => callback(barInfo));
    }
    
    /**
     * Update subdivision timings
     */
    updateSubdivisions() {
        // Calculate subdivision positions within beat
        this.subdivisions.sixteenth = (this.beatProgress * 4) % 1;
        this.subdivisions.eighth = (this.beatProgress * 2) % 1;
        this.subdivisions.triplet = (this.beatProgress * 3) % 1;
        
        // Apply swing/groove
        if (this.groove > 0) {
            const swingRatio = 0.5 + this.groove * 0.17; // Max 67% swing
            if (this.subdivisions.eighth < 0.5) {
                this.subdivisions.swing = this.subdivisions.eighth / swingRatio;
            } else {
                this.subdivisions.swing = 0.5 + (this.subdivisions.eighth - 0.5) / (1 - swingRatio);
            }
        } else {
            this.subdivisions.swing = this.subdivisions.eighth;
        }
    }
    
    /**
     * Get accent level for beat position
     */
    getAccent(beatInBar) {
        if (this.currentPattern && this.patterns.has(this.currentPattern)) {
            const pattern = this.patterns.get(this.currentPattern);
            if (pattern.accents && pattern.accents[beatInBar] !== undefined) {
                return pattern.accents[beatInBar];
            }
        }
        
        // Default accent pattern (strong on 1, medium on 3 in 4/4)
        if (beatInBar === 0) return 1.0;
        if (beatInBar === 2 && this.timeSignature[0] === 4) return 0.7;
        return 0.5;
    }
    
    /**
     * Get current time information
     */
    getTimeInfo() {
        return {
            // Absolute time
            elapsed: performance.now() - this.startTime,
            
            // Musical time
            beat: this.currentBeat,
            bar: this.currentBar,
            beatInBar: this.currentBeat % this.timeSignature[0],
            
            // Progress values (0-1)
            beatProgress: this.beatProgress,
            barProgress: this.barProgress,
            
            // Subdivisions
            subdivisions: { ...this.subdivisions },
            
            // Timing info
            bpm: this.bpm,
            beatDuration: this.beatDuration,
            timeSignature: [...this.timeSignature],
            
            // Musical properties
            intensity: this.intensity,
            groove: this.groove,
            pattern: this.currentPattern,
            
            // Next beat timing
            nextBeatIn: this.nextBeatTime - performance.now(),
            
            // Accent for current beat
            accent: this.getAccent(this.currentBeat % this.timeSignature[0])
        };
    }
    
    /**
     * Set BPM (beats per minute)
     */
    setBPM(bpm) {
        this.bpm = Math.max(20, Math.min(300, bpm));
        this.beatDuration = 60000 / this.bpm;
        this.barDuration = this.beatDuration * this.timeSignature[0];
        
        this.emit('tempoChange', { bpm: this.bpm });
    }
    
    /**
     * Set time signature
     */
    setTimeSignature(numerator, denominator) {
        this.timeSignature = [numerator, denominator];
        this.barDuration = this.beatDuration * numerator;
        
        this.emit('timeSignatureChange', { 
            timeSignature: this.timeSignature 
        });
    }
    
    /**
     * Set rhythm pattern
     */
    setPattern(patternName) {
        if (!this.patterns.has(patternName)) {
            return;
        }
        
        const pattern = this.patterns.get(patternName);
        this.currentPattern = patternName;
        
        // Apply pattern settings
        if (pattern.timeSignature) {
            this.setTimeSignature(...pattern.timeSignature);
        }
        if (pattern.groove !== undefined) {
            this.groove = pattern.groove;
        }
        
        this.emit('patternChange', { pattern: patternName });
    }
    
    /**
     * Register for beat events
     */
    onBeatCallback(callback) {
        this.beatCallbacks.add(callback);
        return () => this.beatCallbacks.delete(callback);
    }
    
    /**
     * Register for bar events
     */
    onBarCallback(callback) {
        this.barCallbacks.add(callback);
        return () => this.barCallbacks.delete(callback);
    }
    
    /**
     * Emit event to listeners
     */
    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => callback(data));
        }
    }
    
    /**
     * Listen for events
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
        
        // Return unsubscribe function
        return () => {
            if (this.listeners.has(event)) {
                this.listeners.get(event).delete(callback);
            }
        };
    }
    
    /**
     * Sync to audio source (stub for future implementation)
     */
    syncToAudio(audioContext, audioSource) {
        this.audioSync = { context: audioContext, source: audioSource };
        // Future: Implement beat detection and tempo extraction
    }
    
    /**
     * Get rhythm adapter for subsystems
     * Returns timing info and utilities for rhythm-aware animations
     */
    getAdapter() {
        return {
            // Current time info
            getTimeInfo: () => this.getTimeInfo(),
            
            // Check if on beat (with tolerance)
            isOnBeat: (tolerance = 0.1) => {
                return this.beatProgress < tolerance || this.beatProgress > (1 - tolerance);
            },
            
            // Check if on specific subdivision
            isOnSubdivision: (subdivision, tolerance = 0.1) => {
                const value = this.subdivisions[subdivision] || 0;
                return value < tolerance || value > (1 - tolerance);
            },
            
            // Get interpolated value synced to beat
            getBeatSync: (min = 0, max = 1, curve = 'linear') => {
                let progress = this.beatProgress;
                
                // Apply curve
                switch(curve) {
                    case 'ease':
                        progress = 0.5 - Math.cos(progress * Math.PI) / 2;
                        break;
                    case 'bounce':
                        progress = Math.abs(Math.sin(progress * Math.PI));
                        break;
                    case 'pulse':
                        progress = Math.pow(Math.sin(progress * Math.PI), 2);
                        break;
                }
                
                return min + (max - min) * progress;
            },
            
            // Get value with musical accent
            getAccentedValue: (baseValue, accentMultiplier = 2) => {
                const accent = this.getAccent(this.currentBeat % this.timeSignature[0]);
                return baseValue * (1 + (accent - 0.5) * accentMultiplier);
            },
            
            // Subscribe to beat events
            onBeat: (callback) => this.onBeatCallback(callback),
            onBar: (callback) => this.onBarCallback(callback),
            
            // Musical time utilities
            beatsToMs: (beats) => beats * this.beatDuration,
            msToBeats: (ms) => ms / this.beatDuration,
            
            // Current musical state
            isPlaying: () => this.isPlaying,
            getBPM: () => this.bpm,
            getPattern: () => this.currentPattern
        };
    }
}

// Create singleton instance
const rhythmEngine = new RhythmEngine();

// Export both the engine and the class
export { rhythmEngine, RhythmEngine };
export default rhythmEngine;