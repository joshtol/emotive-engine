/**
 * GrooveTemplates - Musical rhythm patterns and groove definitions
 * Provides pre-defined rhythmic patterns that make the mascot dance musically
 */

class GrooveTemplates {
    constructor() {
        // Core groove definitions with emphasis patterns
        this.templates = {
            straight: {
                name: 'Straight',
                timeSignature: '4/4',
                baseMovement: 'grooveBob', // Continuous base layer
                transitionStyle: 'transitionLean',
                pattern: {
                    emphasis: [1, 0, 0.5, 0], // Strong on 1, medium on 3
                    velocities: [1.0, 0, 0.6, 0],
                    subdivisions: [0, 0.5] // Only play on beats and offbeats
                },
                swing: 0,
                humanization: 0.05, // 5% timing variance for human feel
                preferredGestures: {
                    downbeat: ['bounce', 'headBob', 'jump'],
                    offbeat: ['pulse', 'breathe'],
                    fills: ['sparkle', 'glow']
                },
                compositeMove: null, // No special composite for straight
                intensity: 'moderate',
                description: 'Standard 4/4 rhythm, good for pop/rock'
            },

            swing: {
                name: 'Swing',
                timeSignature: '4/4',
                baseMovement: 'grooveFlow',
                transitionStyle: 'transitionGlide',
                compositeMove: 'swingOut',
                pattern: {
                    emphasis: [1, 0, 0.66, 0], // Swung eighth notes
                    velocities: [1.0, 0, 0.7, 0],
                    subdivisions: [0, 0.66] // Delayed upbeat for swing feel
                },
                swing: 0.67, // 67% swing ratio (2:1 triplet feel)
                humanization: 0.08,
                preferredGestures: {
                    downbeat: ['sway', 'lean', 'bounce'],
                    offbeat: ['wiggle', 'pulse'],
                    fills: ['shimmer', 'float']
                },
                intensity: 'moderate',
                description: 'Jazz swing feel with triplet subdivision'
            },

            shuffle: {
                name: 'Shuffle',
                timeSignature: '4/4',
                baseMovement: 'grooveBob',
                transitionStyle: 'transitionLean',
                compositeMove: null,
                pattern: {
                    emphasis: [1, 0.25, 0.5, 0.75], // Driving shuffle
                    velocities: [1.0, 0.3, 0.7, 0.3],
                    subdivisions: [0, 0.25, 0.5, 0.75]
                },
                swing: 0.75, // Heavy shuffle
                humanization: 0.06,
                preferredGestures: {
                    downbeat: ['bounce', 'headBob'],
                    upbeat: ['twist', 'wiggle'],
                    offbeat: ['pulse', 'breathe'],
                    fills: ['sparkle', 'flash']
                },
                intensity: 'dense',
                description: 'Blues/rock shuffle with heavy swing'
            },

            latin: {
                name: 'Latin',
                timeSignature: '4/4',
                baseMovement: 'grooveSway',
                transitionStyle: 'transitionRoll',
                compositeMove: 'latinHips',
                pattern: {
                    // Clave-inspired pattern: 1 e + a 2 e + a 3 e + a 4 e + a
                    emphasis: [1, 0, 0.375, 0.5, 0, 0.75, 0, 0],
                    velocities: [1.0, 0, 0.8, 0.9, 0, 0.8, 0, 0],
                    subdivisions: [0, 0.375, 0.5, 0.75] // Syncopated
                },
                swing: 0,
                humanization: 0.04,
                preferredGestures: {
                    downbeat: ['sway', 'wiggle'],
                    syncopation: ['twist', 'lean'],
                    offbeat: ['pulse', 'shimmer'],
                    fills: ['sparkle', 'shake']
                },
                intensity: 'dense',
                description: 'Latin clave rhythm with syncopation'
            },

            breakbeat: {
                name: 'Breakbeat',
                timeSignature: '4/4',
                baseMovement: 'grooveStep',
                transitionStyle: 'transitionGlide',
                compositeMove: null,
                pattern: {
                    // Classic Amen break pattern simplified
                    emphasis: [1, 0, 0, 0.75, 0.25, 0.5, 0, 0.625],
                    velocities: [1.0, 0, 0, 0.9, 0.6, 0.8, 0, 0.7],
                    subdivisions: [0, 0.25, 0.5, 0.625, 0.75] // Complex syncopation
                },
                swing: 0,
                humanization: 0.03, // Tighter timing for electronic feel
                preferredGestures: {
                    downbeat: ['bounce', 'twist'],
                    syncopation: ['flash', 'shake'],
                    offbeat: ['pulse', 'wiggle'],
                    fills: ['sparkle', 'glitch']
                },
                intensity: 'chaos',
                description: 'Hip-hop/DnB breakbeat pattern'
            },

            waltz: {
                name: 'Waltz',
                timeSignature: '3/4',
                baseMovement: 'grooveFlow',
                transitionStyle: 'transitionGlide',
                compositeMove: null,
                pattern: {
                    emphasis: [1, 0.33, 0.67], // 1-2-3, 1-2-3
                    velocities: [1.0, 0.5, 0.5],
                    subdivisions: [0, 0.33, 0.67]
                },
                swing: 0,
                humanization: 0.07,
                preferredGestures: {
                    downbeat: ['sway', 'float'],
                    weak: ['breathe', 'lean'],
                    fills: ['shimmer', 'glow']
                },
                intensity: 'sparse',
                description: '3/4 waltz time'
            },

            techno: {
                name: 'Techno',
                timeSignature: '4/4',
                baseMovement: 'groovePulse',
                transitionStyle: 'transitionLean',
                compositeMove: 'robotPop',
                pattern: {
                    // Four-on-the-floor with 16th note variations
                    emphasis: [1, 0.25, 0.5, 0.75, 1, 0.25, 0.5, 0.75],
                    velocities: [1.0, 0.6, 1.0, 0.6, 1.0, 0.6, 1.0, 0.6],
                    subdivisions: [0, 0.25, 0.5, 0.75] // All subdivisions
                },
                swing: 0,
                humanization: 0.02, // Very tight, machine-like
                preferredGestures: {
                    downbeat: ['pulse', 'bounce'],
                    subdivision: ['flash', 'glitch'],
                    fills: ['sparkle', 'strobe']
                },
                intensity: 'dense',
                description: 'Driving techno four-on-the-floor'
            },

            ambient: {
                name: 'Ambient',
                timeSignature: '4/4',
                baseMovement: 'groovePulse',
                transitionStyle: 'transitionGlide',
                compositeMove: null,
                pattern: {
                    emphasis: [0.8, 0, 0.3, 0, 0.5, 0, 0.3, 0],
                    velocities: [0.8, 0, 0.3, 0, 0.5, 0, 0.3, 0],
                    subdivisions: [0, 0.5] // Sparse
                },
                swing: 0,
                humanization: 0.15, // Very loose timing
                preferredGestures: {
                    downbeat: ['float', 'breathe'],
                    offbeat: ['sway', 'shimmer'],
                    fills: ['glow', 'pulse']
                },
                intensity: 'sparse',
                description: 'Floating ambient rhythm'
            },

            funk: {
                name: 'Funk',
                timeSignature: '4/4',
                baseMovement: 'grooveSway',
                transitionStyle: 'transitionRoll',
                compositeMove: 'funkChicken',
                pattern: {
                    // "One" emphasis with 16th note ghost notes
                    emphasis: [1.2, 0.125, 0.25, 0, 0.625, 0.75, 0, 0.875],
                    velocities: [1.2, 0.3, 0.4, 0, 0.8, 0.6, 0, 0.4],
                    subdivisions: [0, 0.125, 0.25, 0.625, 0.75, 0.875]
                },
                swing: 0.1, // Slight swing
                humanization: 0.06,
                preferredGestures: {
                    one: ['bounce', 'twist'], // THE ONE
                    ghost: ['wiggle', 'pulse'], // Ghost notes
                    syncopation: ['lean', 'shake'],
                    fills: ['flash', 'sparkle']
                },
                intensity: 'chaos',
                description: 'Funky syncopated rhythm with THE ONE'
            },

            trap: {
                name: 'Trap',
                timeSignature: '4/4',
                baseMovement: 'grooveStep',
                transitionStyle: 'transitionLean',
                compositeMove: null,
                pattern: {
                    // Hi-hat rolls and syncopated kicks
                    emphasis: [1, 0, 0, 0.375, 0, 0.75, 0.875, 0],
                    velocities: [1.0, 0, 0, 0.7, 0, 0.8, 0.6, 0],
                    subdivisions: [0, 0.375, 0.75, 0.875] // Triplet feel
                },
                swing: 0,
                humanization: 0.03,
                preferredGestures: {
                    downbeat: ['bounce', 'lean'],
                    hihat: ['shake', 'shimmer'],
                    syncopation: ['twist', 'flash'],
                    fills: ['sparkle', 'glitch']
                },
                intensity: 'moderate',
                description: 'Trap rhythm with triplet hi-hats'
            }
        };

        // Transition rules for smooth groove changes
        this.transitions = {
            instant: 0, // Change immediately
            nextBar: 1, // Change on next bar line
            nextPhrase: 4, // Change on next 4-bar phrase
            fadeIn: 8 // Gradually introduce over 8 beats
        };

        // Current active groove
        this.currentGroove = null;
        this.transitionMode = 'nextBar';
        this.pendingGroove = null;
    }

    /**
     * Get a groove template by name
     */
    getTemplate(name) {
        return this.templates[name.toLowerCase()] || this.templates.straight;
    }

    /**
     * Get emphasis for current beat and subdivision
     */
    getEmphasis(groove, beatNumber, subdivision) {
        if (!groove || !groove.pattern) return 0;

        const beatInMeasure = beatNumber % 4; // Assuming 4/4 for now
        const _position = beatInMeasure + subdivision; // Unused - kept for future use

        // Find closest pattern position
        const patternIndex = groove.pattern.subdivisions.findIndex(
            sub => Math.abs(sub - subdivision) < 0.01
        );

        if (patternIndex === -1) return 0;

        return groove.pattern.emphasis[patternIndex] || 0;
    }

    /**
     * Get velocity for current position
     */
    getVelocity(groove, beatNumber, subdivision) {
        if (!groove || !groove.pattern) return 1.0;

        const beatInMeasure = beatNumber % 4;
        const _position = beatInMeasure + subdivision; // Unused - kept for future use

        const patternIndex = groove.pattern.subdivisions.findIndex(
            sub => Math.abs(sub - subdivision) < 0.01
        );

        if (patternIndex === -1) return 0;

        return groove.pattern.velocities[patternIndex] || 0;
    }

    /**
     * Get preferred gesture for current position
     */
    getPreferredGesture(groove, beatNumber, subdivision, availableGestures = []) {
        if (!groove || !groove.preferredGestures) return null;

        // Determine the beat type
        let beatType;
        if (subdivision === 0) {
            beatType = 'downbeat';
        } else if (subdivision === 0.5) {
            beatType = 'offbeat';
        } else if (subdivision === 0.25 || subdivision === 0.75) {
            beatType = 'subdivision';
        } else {
            beatType = 'syncopation';
        }

        // Special case for THE ONE in funk
        if (groove.name === 'Funk' && beatNumber % 4 === 0 && subdivision === 0) {
            beatType = 'one';
        }

        const preferred = groove.preferredGestures[beatType] || groove.preferredGestures.fills;
        if (!preferred || preferred.length === 0) return null;

        // Filter to available gestures if provided
        if (availableGestures.length > 0) {
            const available = preferred.filter(g => availableGestures.includes(g));
            if (available.length > 0) {
                return available[Math.floor(Math.random() * available.length)];
            }
        }

        // Return random from preferred
        return preferred[Math.floor(Math.random() * preferred.length)];
    }

    /**
     * Apply humanization to timing
     */
    humanizeTiming(groove, timing) {
        if (!groove || !groove.humanization) return timing;

        const variance = groove.humanization;
        const offset = (Math.random() - 0.5) * variance;
        return Math.max(0, Math.min(1, timing + offset));
    }

    /**
     * Apply swing to subdivision
     */
    applySwing(groove, subdivision) {
        if (!groove || !groove.swing || groove.swing === 0) return subdivision;

        // Apply swing to upbeats (0.5)
        if (Math.abs(subdivision - 0.5) < 0.01) {
            return 0.5 + (groove.swing - 0.5) * 0.5;
        }

        // Apply swing to 16th note upbeats (0.25, 0.75)
        if (Math.abs(subdivision - 0.25) < 0.01) {
            return 0.25 + (groove.swing - 0.5) * 0.25;
        }
        if (Math.abs(subdivision - 0.75) < 0.01) {
            return 0.75 + (groove.swing - 0.5) * 0.25;
        }

        return subdivision;
    }

    /**
     * Set active groove with optional transition
     */
    setGroove(name, transitionMode = null) {
        const groove = this.getTemplate(name);
        if (!groove) return false;

        const mode = transitionMode || this.transitionMode;

        if (mode === 'instant' || !this.currentGroove) {
            this.currentGroove = groove;
            this.pendingGroove = null;
        } else {
            this.pendingGroove = groove;
            // Transition will happen based on mode
        }

        return true;
    }

    /**
     * Handle beat transition
     */
    onBeat(beatNumber) {
        if (!this.pendingGroove) return;

        const shouldTransition =
            (this.transitionMode === 'nextBar' && beatNumber % 4 === 0) ||
            (this.transitionMode === 'nextPhrase' && beatNumber % 16 === 0);

        if (shouldTransition) {
            this.currentGroove = this.pendingGroove;
            this.pendingGroove = null;
        }
    }

    /**
     * Get base movement for current groove
     */
    getBaseMovement() {
        return this.currentGroove?.baseMovement || null;
    }

    /**
     * Get transition style for current groove
     */
    getTransitionStyle() {
        return this.currentGroove?.transitionStyle || 'transitionLean';
    }

    /**
     * Get composite move for current groove
     */
    getCompositeMove() {
        return this.currentGroove?.compositeMove || null;
    }

    /**
     * Check if we should trigger composite move
     * @param {number} beatNumber - Current beat number
     * @returns {boolean} True if composite should trigger
     */
    shouldTriggerComposite(beatNumber) {
        if (!this.currentGroove?.compositeMove) return false;

        // Trigger composite every 4 or 8 bars depending on intensity
        const interval = this.currentGroove.intensity === 'sparse' ? 32 : 16;
        return beatNumber % interval === 0;
    }

    /**
     * Get layered gesture configuration for current position
     * @param {number} beatNumber - Current beat number
     * @param {number} subdivision - Current subdivision (0, 0.25, 0.5, 0.75)
     * @returns {Object} Configuration with base, accent, and transition layers
     */
    getLayeredGestures(beatNumber, subdivision) {
        if (!this.currentGroove) return null;

        const config = {
            base: this.getBaseMovement(),
            accent: null,
            transition: null,
            composite: null,
            velocity: 1.0
        };

        // Check for composite move trigger
        if (this.shouldTriggerComposite(beatNumber) && subdivision === 0) {
            config.composite = this.getCompositeMove();
        }

        // Get accent gesture based on emphasis
        const emphasis = this.getEmphasis(this.currentGroove, beatNumber, subdivision);
        const velocity = this.getVelocity(this.currentGroove, beatNumber, subdivision);

        if (emphasis > 0.3 && velocity > 0.3) {
            config.accent = this.getPreferredGesture(
                this.currentGroove,
                beatNumber,
                subdivision
            );
            config.velocity = velocity;
        }

        // Add transition if changing positions
        if (config.accent && Math.random() < 0.3) {
            config.transition = this.getTransitionStyle();
        }

        return config;
    }

    /**
     * Get all available groove names
     */
    getGrooveNames() {
        return Object.keys(this.templates);
    }

    /**
     * Get groove info for UI
     */
    getGrooveInfo(name) {
        const template = this.templates[name];
        if (!template) return null;

        return {
            name: template.name,
            timeSignature: template.timeSignature,
            description: template.description,
            intensity: template.intensity,
            swing: template.swing,
            baseMovement: template.baseMovement,
            compositeMove: template.compositeMove
        };
    }
}

// Export as ES6 module
// No longer polluting global scope with window assignment
export default GrooveTemplates;