/**
 * GestureCompatibility - Core gesture compatibility and chord system
 * Defines which gestures can execute simultaneously vs sequentially
 * Part of the Emotive Engine core
 */

export class GestureCompatibility {
    constructor() {
        // Musical timing classes - defines when gestures should fire
        this.timingClasses = {
            downbeat: {
                gestures: ['bounce', 'jump', 'headBob', 'spin', 'orbit'],
                timing: 1.0,  // Fire on the beat
                priority: 1,
                description: 'Strong emphasis on the downbeat'
            },
            upbeat: {
                gestures: ['wave', 'nod', 'point', 'reach'],
                timing: 0.5,  // Fire on the half-beat
                priority: 2,
                description: 'Medium emphasis on upbeat'
            },
            offbeat: {
                gestures: ['wiggle', 'sway', 'lean', 'tilt', 'groove'],
                timing: 0.5,  // Fire between beats (syncopated)
                priority: 3,
                description: 'Syncopated, creates groove'
            },
            subdivision: {
                gestures: ['pulse', 'sparkle', 'flash', 'shimmer', 'flicker'],
                timing: 0.25,  // Can fire on quarter beats
                priority: 4,
                description: 'Quick accents and fills'
            },
            continuous: {
                gestures: ['breathe', 'float', 'rain'],
                timing: -1,  // Can start anytime, flows across beats
                priority: 5,
                description: 'Ambient, continuous motion'
            }
        };

        // Fill patterns for automatic motion between gestures
        this.fillPatterns = {
            subtle: ['breathe', 'float'],
            rhythmic: ['pulse', 'shimmer'],
            energetic: ['wiggle', 'sparkle'],
            smooth: ['sway', 'glow']
        };

        // Dynamic density settings based on BPM
        this.densityProfiles = {
            sparse: {
                fillProbability: 0.1,
                subdivisionLevel: 2,  // Half notes only
                description: 'Minimal movement'
            },
            moderate: {
                fillProbability: 0.3,
                subdivisionLevel: 4,  // Quarter notes
                description: 'Balanced movement'
            },
            dense: {
                fillProbability: 0.5,
                subdivisionLevel: 8,  // Eighth notes
                description: 'Busy, energetic'
            },
            chaos: {
                fillProbability: 0.8,
                subdivisionLevel: 16,  // Sixteenth notes
                description: 'Maximum energy'
            }
        };

        // Gesture group definitions
        this.groups = {
            // Primary movement - only one can execute at a time
            movement: {
                gestures: ['bounce', 'spin', 'orbit', 'sway', 'hula', 'jump', 'twist', 'groove'],
                maxSimultaneous: 1,
                priority: 1,
                description: 'Primary body movements - mutually exclusive'
            },

            // Secondary movements - can layer 2 together
            expression: {
                gestures: ['wave', 'nod', 'shake', 'point', 'lean', 'tilt', 'reach'],
                maxSimultaneous: 2,
                priority: 2,
                description: 'Expressive gestures - can combine up to 2'
            },

            // Dance moves - special category that can combine with effects
            dance: {
                gestures: ['headBob', 'wiggle', 'runningman', 'charleston'],
                maxSimultaneous: 1,
                priority: 2,
                description: 'Dance moves - one at a time but can add effects'
            },

            // Visual effects - all can stack
            effects: {
                gestures: ['pulse', 'glow', 'sparkle', 'flash', 'shimmer', 'flicker'],
                maxSimultaneous: -1, // Unlimited
                priority: 3,
                description: 'Visual effects - all can layer together'
            },

            // Ambient modifiers - always allowed to layer
            modifiers: {
                gestures: ['breathe', 'float', 'rain'],
                maxSimultaneous: -1, // Unlimited
                priority: 4,
                description: 'Ambient effects - always allowed'
            }
        };

        // Specific combinations that work well together
        this.enhancingCombinations = [
            ['bounce', 'sparkle'],
            ['spin', 'glow'],
            ['wave', 'pulse'],
            ['nod', 'pulse'],
            ['jump', 'flash'],
            ['sway', 'breathe'],
            ['float', 'shimmer'],
            ['orbit', 'sparkle'],
            ['headBob', 'pulse']
        ];

        // Gestures that should never combine
        this.incompatiblePairs = [
            ['bounce', 'jump'],
            ['spin', 'orbit'],
            ['wave', 'point'],
            ['nod', 'shake'],
            ['lean', 'tilt']
        ];

        // Pre-defined chord combinations
        this.chords = {
            celebrate: ['bounce', 'sparkle', 'pulse'],
            greeting: ['wave', 'nod', 'glow'],
            excited: ['jump', 'flash', 'wiggle'],
            mystical: ['float', 'shimmer', 'breathe'],
            party: ['headBob', 'pulse', 'sparkle'],
            smooth: ['sway', 'glow', 'breathe'],
            dramatic: ['spin', 'flash', 'sparkle']
        };

        // Chain definitions with simultaneous markers
        // '+' means simultaneous, '>' means sequential
        this.chains = {
            buildup: 'pulse > pulse > bounce+sparkle > spin+flash',
            cascade: 'wave > lean > tilt > spin > bounce+glow',
            celebrate: 'bounce+sparkle > spin > jump+flash > headBob+pulse',
            smooth: 'sway+breathe > float > orbit+shimmer > sway+glow',
            chaos: 'wiggle > shake+flash > spin+sparkle > bounce+pulse > twist',
            greeting: 'wave+glow > nod+pulse > wave',
            mystical: 'float+shimmer > orbit+breathe > spin+sparkle > float+glow',
            dance: 'headBob > bounce+pulse > spin > sway+glow > headBob+sparkle'
        };
    }

    /**
     * Check if two gestures can execute simultaneously
     * @param {string} gesture1 - First gesture name
     * @param {string} gesture2 - Second gesture name
     * @returns {boolean} - True if they can execute together
     */
    canExecuteSimultaneously(gesture1, gesture2) {
        // Check if they're the same gesture
        if (gesture1 === gesture2) return false;

        // Check if they're in incompatible list
        const incompatible = this.incompatiblePairs.some(pair =>
            (pair.includes(gesture1) && pair.includes(gesture2))
        );
        if (incompatible) return false;

        // Get groups for each gesture
        const group1 = this.getGestureGroup(gesture1);
        const group2 = this.getGestureGroup(gesture2);

        // If same group, check maxSimultaneous
        if (group1 === group2) {
            const group = this.groups[group1];
            return group && group.maxSimultaneous !== 1;
        }

        // Different groups can usually combine
        // Movement can't combine with other movement
        if (group1 === 'movement' && group2 === 'movement') return false;
        if (group1 === 'dance' && group2 === 'dance') return false;

        return true;
    }

    /**
     * Get the group a gesture belongs to
     * @param {string} gesture - Gesture name
     * @returns {string|null} - Group name or null
     */
    getGestureGroup(gesture) {
        for (const [groupName, group] of Object.entries(this.groups)) {
            if (group.gestures.includes(gesture)) {
                return groupName;
            }
        }
        return null;
    }

    /**
     * Get priority of a gesture
     * @param {string} gesture - Gesture name
     * @returns {number} - Priority value (lower = higher priority)
     */
    getGesturePriority(gesture) {
        const group = this.getGestureGroup(gesture);
        return group ? this.groups[group].priority : 99;
    }

    /**
     * Get compatible gestures from a list that can execute together
     * @param {Array} gestures - Array of gesture objects or names
     * @returns {Array} - Gestures that can execute simultaneously
     */
    getCompatibleGestures(gestures) {
        if (!gestures || gestures.length === 0) return [];
        if (gestures.length === 1) return gestures;

        const chord = [];
        const used = new Set();

        // Normalize to gesture names
        const normalizeGesture = (g) => typeof g === 'string' ? g : g.gestureName;

        // Sort by priority
        const sorted = [...gestures].sort((a, b) => {
            const priorityA = this.getGesturePriority(normalizeGesture(a));
            const priorityB = this.getGesturePriority(normalizeGesture(b));
            return priorityA - priorityB;
        });

        for (const gesture of sorted) {
            if (used.has(gesture)) continue;

            const gestureName = normalizeGesture(gesture);

            // Check if this gesture can combine with all in chord
            let canAdd = true;
            for (const chordItem of chord) {
                const chordGestureName = normalizeGesture(chordItem);
                if (!this.canExecuteSimultaneously(gestureName, chordGestureName)) {
                    canAdd = false;
                    break;
                }
            }

            if (canAdd) {
                // Check group limits
                const group = this.groups[this.getGestureGroup(gestureName)];
                if (group && group.maxSimultaneous > 0) {
                    const groupCount = chord.filter(c =>
                        this.getGestureGroup(normalizeGesture(c)) === this.getGestureGroup(gestureName)
                    ).length;
                    if (groupCount >= group.maxSimultaneous) {
                        continue; // Skip, group limit reached
                    }
                }

                chord.push(gesture);
                used.add(gesture);
            }
        }

        return chord;
    }

    /**
     * Parse a chain string into steps of simultaneous gestures
     * @param {string} chainString - Chain definition string
     * @returns {Array<Array<string>>} - Array of steps, each containing simultaneous gestures
     */
    parseChain(chainString) {
        if (!chainString) return [];

        // Handle predefined chains
        if (this.chains[chainString]) {
            chainString = this.chains[chainString];
        }

        const steps = chainString.split('>').map(s => s.trim());
        return steps.map(step => {
            // Split by + for simultaneous gestures
            return step.split('+').map(g => g.trim()).filter(g => g);
        });
    }

    /**
     * Check if gestures form an enhancing combination
     * @param {Array} gestures - Array of gesture names
     * @returns {boolean} - True if they enhance each other
     */
    isEnhancingCombination(gestures) {
        const gestureNames = gestures.map(g =>
            typeof g === 'string' ? g : g.gestureName
        );

        return this.enhancingCombinations.some(combo =>
            combo.every(gesture => gestureNames.includes(gesture))
        );
    }

    /**
     * Get a predefined chord by name
     * @param {string} chordName - Name of the chord
     * @returns {Array<string>|null} - Array of gesture names or null
     */
    getChord(chordName) {
        return this.chords[chordName] || null;
    }

    /**
     * Create a gesture chord command
     * @param {Array<string>} gestures - Gestures to combine
     * @returns {Object} - Chord command object
     */
    createChord(gestures) {
        const compatible = this.getCompatibleGestures(gestures);
        const isEnhancing = this.isEnhancingCombination(compatible);

        return {
            type: 'chord',
            gestures: compatible.map(g => typeof g === 'string' ? g : g.gestureName),
            isEnhancing,
            timestamp: Date.now()
        };
    }

    /**
     * Validate if a gesture exists in the system
     * @param {string} gesture - Gesture name
     * @returns {boolean} - True if gesture is valid
     */
    isValidGesture(gesture) {
        return this.getGestureGroup(gesture) !== null;
    }

    /**
     * Get all available gestures
     * @returns {Array<string>} - All gesture names
     */
    getAllGestures() {
        const gestures = [];
        for (const group of Object.values(this.groups)) {
            gestures.push(...group.gestures);
        }
        return [...new Set(gestures)];
    }

    /**
     * Get timing class for a gesture
     * @param {string} gesture - Gesture name
     * @returns {Object|null} - Timing class info
     */
    getGestureTiming(gesture) {
        for (const [className, timingClass] of Object.entries(this.timingClasses)) {
            if (timingClass.gestures.includes(gesture)) {
                return {
                    name: className,
                    ...timingClass
                };
            }
        }
        return null;
    }

    /**
     * Get next subdivision beat for a gesture
     * @param {string} gesture - Gesture name
     * @param {number} currentBeat - Current beat number
     * @param {number} subdivision - Beat subdivision (1, 0.5, 0.25, etc)
     * @returns {number} - Next beat to fire on
     */
    getNextBeatForGesture(gesture, currentBeat, subdivision = 1) {
        const timing = this.getGestureTiming(gesture);
        if (!timing) return currentBeat + 1;

        // Continuous gestures can start immediately
        if (timing.timing === -1) return currentBeat;

        // Calculate next appropriate beat based on timing class
        const beatInterval = timing.timing / subdivision;
        const nextBeat = Math.ceil(currentBeat / beatInterval) * beatInterval;

        // For offbeat gestures, add half beat offset
        if (timing.name === 'offbeat') {
            return nextBeat + 0.5;
        }

        return nextBeat;
    }

    /**
     * Get fill gestures based on density and BPM
     * @param {number} bpm - Current BPM
     * @param {string} intensity - Intensity level (sparse, moderate, dense, chaos)
     * @returns {Array<string>} - Suggested fill gestures
     */
    getFillGestures(bpm, intensity = 'moderate') {
        const profile = this.densityProfiles[intensity] || this.densityProfiles.moderate;

        // Determine fill pattern based on BPM
        let pattern;
        if (bpm < 80) {
            pattern = 'energetic';  // More movement for slow tempos
        } else if (bpm < 120) {
            pattern = 'rhythmic';
        } else if (bpm < 160) {
            pattern = 'smooth';
        } else {
            pattern = 'subtle';  // Less movement for fast tempos
        }

        // Return fills based on probability
        if (Math.random() < profile.fillProbability) {
            return this.fillPatterns[pattern] || [];
        }
        return [];
    }

    /**
     * Get next beat timing for a gesture (for rhythm game mode)
     * @param {string} gestureName - Name of the gesture
     * @param {number} currentBeat - Current beat number
     * @param {number} bpm - Current BPM
     * @returns {number} - Next beat to trigger on
     */
    getNextBeatTiming(gestureName, currentBeat, bpm) {
        // In rhythm game mode, this will be determined by the game logic
        // For now, just return the next appropriate beat based on gesture type
        const nextBeat = this.getNextBeatForGesture(gestureName, currentBeat);
        return nextBeat;
    }

    /**
     * Get intensity profile based on BPM
     * @param {number} bpm - Current BPM
     * @returns {string} - Intensity level
     */
    getIntensityFromBPM(bpm) {
        if (bpm < 60) return 'dense';      // Very slow needs more fills
        if (bpm < 100) return 'moderate';
        if (bpm < 140) return 'moderate';
        if (bpm < 180) return 'sparse';
        return 'sparse';  // Very fast needs less
    }

    /**
     * Create swing/shuffle timing
     * @param {number} straightBeat - Straight beat number
     * @param {number} swingRatio - Swing ratio (0.5 = straight, 0.67 = swing)
     * @returns {number} - Adjusted beat with swing
     */
    applySwingTiming(straightBeat, swingRatio = 0.67) {
        const beatPart = straightBeat % 1;
        if (beatPart === 0.5) {
            // Delay the offbeat for swing feel
            return Math.floor(straightBeat) + swingRatio;
        }
        return straightBeat;
    }
}

// Create singleton instance
const gestureCompatibility = new GestureCompatibility();

export default gestureCompatibility;