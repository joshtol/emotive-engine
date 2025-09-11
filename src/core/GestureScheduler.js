/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Gesture Scheduler
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Rhythm-aware gesture scheduling system
 * @author Emotive Engine Team
 * @module core/GestureScheduler
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ The CHOREOGRAPHER of the Emotive Engine. Ensures gestures trigger on musical      
 * ║ time, creating a mascot that truly dances to the beat rather than just moving     
 * ║ with rhythm-influenced parameters.                                                
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 */

import { getGesture } from './gestures/index.js';
import rhythmEngine from './rhythm.js';
import rhythmIntegration from './rhythmIntegration.js';
import musicalDuration from './MusicalDuration.js';

class GestureScheduler {
    constructor(mascot) {
        this.mascot = mascot;
        this.queue = [];
        this.activeGestures = new Map(); // Track active gestures and their end times
        this.gestureQueues = new Map();  // Per-gesture queues for overlapping requests
        this.currentGesture = null;
        this.currentGestureStartTime = 0;
        this.isProcessing = false;
        this.processInterval = null;
        this.lastProcessTime = 0;
        
        // Visual feedback callbacks
        this.onGestureQueued = null;
        this.onGestureTriggered = null;
        this.onGestureCompleted = null;
        
        // Start processing loop
        this.startProcessing();
        
        // Listen to rhythm events
        this.setupRhythmListeners();
    }
    
    /**
     * Setup rhythm engine event listeners
     */
    setupRhythmListeners() {
        // Process queue on every beat
        rhythmEngine.on('beat', (beatInfo) => {
            if (rhythmIntegration.isEnabled()) {
                this.processQueueOnBeat(beatInfo);
            }
        });
        
        // Process on subdivisions for finer timing
        rhythmEngine.on('subdivision', (subdivisionInfo) => {
            if (rhythmIntegration.isEnabled()) {
                this.processQueueOnSubdivision(subdivisionInfo);
            }
        });
    }
    
    /**
     * Request a gesture to be played
     * @param {string} gestureName - Name of the gesture
     * @param {Object} options - Additional options
     * @returns {Object} Queue item reference
     */
    requestGesture(gestureName, options = {}) {
        const gesture = getGesture(gestureName);
        if (!gesture) {
            return null;
        }
        
        // If rhythm is not active, play immediately
        if (!rhythmIntegration.isEnabled() || options.immediate) {
            this.executeGesture({ gestureName, gesture, options });
            return null;
        }
        
        // Check if this gesture is currently active
        if (this.activeGestures.has(gestureName)) {
            const activeEndTime = this.activeGestures.get(gestureName);
            
            // Check queue limits
            const queueLimit = gesture.rhythm?.maxQueue || 1;
            const currentQueue = this.gestureQueues.get(gestureName) || [];
            
            if (currentQueue.length >= queueLimit) {
                return null; // Don't queue more
            }
            
            // Calculate when to trigger after current one ends
            const triggerTime = this.calculateTriggerTime(gesture, {
                ...options,
                afterTime: Math.max(activeEndTime, ...currentQueue.map(q => q.endTime || activeEndTime))
            });
            
            // Calculate this gesture's end time
            const duration = this.calculateGestureDuration(gesture);
            const endTime = triggerTime + duration;
            
            const queueItem = {
                gestureName,
                gesture,
                options,
                triggerTime,
                endTime,
                queued: performance.now(),
                priority: options.priority || gesture.rhythm?.priority || 0,
                id: Math.random().toString(36).substr(2, 9)
            };
            
            // Add to gesture-specific queue
            if (!this.gestureQueues.has(gestureName)) {
                this.gestureQueues.set(gestureName, []);
            }
            this.gestureQueues.get(gestureName).push(queueItem);
            
            // Notify UI with queue depth
            if (this.onGestureQueued) {
                this.onGestureQueued(queueItem, currentQueue.length + 1);
            }
            
            return queueItem;
        }
        
        // Calculate when to trigger based on rhythm
        const triggerTime = this.calculateTriggerTime(gesture, options);
        
        // Check if we should interrupt current gesture
        const interruptionMode = this.determineInterruption(gesture);
        
        // Calculate end time
        const duration = this.calculateGestureDuration(gesture);
        const endTime = triggerTime + duration;
        
        const queueItem = {
            gestureName,
            gesture,
            options,
            triggerTime,
            endTime,
            interruptionMode,
            queued: performance.now(),
            priority: options.priority || gesture.rhythm?.priority || 0,
            id: Math.random().toString(36).substr(2, 9)
        };
        
        // Add to main queue
        this.queue.push(queueItem);
        this.queue.sort((a, b) => {
            // Sort by trigger time, then priority
            if (Math.abs(a.triggerTime - b.triggerTime) < 50) {
                return b.priority - a.priority;
            }
            return a.triggerTime - b.triggerTime;
        });
        
        // Notify UI
        if (this.onGestureQueued) {
            this.onGestureQueued(queueItem, 0);
        }
        
        return queueItem;
    }
    
    /**
     * Calculate gesture duration in milliseconds
     * @param {Object} gesture - Gesture configuration
     * @returns {number} Duration in milliseconds
     */
    calculateGestureDuration(gesture) {
        // Check for musical duration
        if (gesture.config?.musicalDuration) {
            return musicalDuration.toMilliseconds(gesture.config.musicalDuration);
        }
        
        // Check for rhythm duration
        if (gesture.rhythm?.durationSync?.mode === 'beats') {
            const beats = gesture.rhythm.durationSync.beats || 2;
            return musicalDuration.toMilliseconds({ musical: true, beats });
        }
        
        // Fall back to fixed duration
        return gesture.config?.duration || 1000;
    }
    
    /**
     * Calculate when a gesture should trigger based on rhythm
     * @param {Object} gesture - Gesture configuration
     * @param {Object} options - Additional options
     * @returns {number} Timestamp when gesture should trigger
     */
    calculateTriggerTime(gesture, options) {
        const now = performance.now();
        const timeInfo = rhythmEngine.getTimeInfo();
        
        // Use afterTime if provided (for queued gestures)
        const startTime = options.afterTime || now;
        
        // Get timing preference from gesture rhythm config
        const timingMode = options.timing || gesture.rhythm?.timingSync || 'nextBeat';
        
        // Default to immediate if no valid time info
        if (!timeInfo || typeof timeInfo.nextBeatIn === 'undefined') {
            return startTime + 100; // Small delay to avoid issues
        }
        
        // Calculate bar duration if not provided
        const barDuration = timeInfo.barDuration || (timeInfo.beatDuration * timeInfo.timeSignature[0]);
        const beatsUntilBar = (timeInfo.timeSignature[0] - timeInfo.beatInBar) % timeInfo.timeSignature[0];
        const timeToNextBar = beatsUntilBar * timeInfo.beatDuration;
        
        let triggerTime;
        
        switch (timingMode) {
            case 'immediate':
                // Some gestures like flash might be immediate
                triggerTime = now;
                break;
                
            case 'nextBeat':
                // Trigger on the next beat
                triggerTime = now + Math.max(50, timeInfo.nextBeatIn); // At least 50ms delay
                break;
                
            case 'nextDownbeat':
                // Trigger on the next downbeat (beat 1 of a bar)
                triggerTime = now + (timeInfo.beatInBar === 0 ? barDuration : timeToNextBar);
                break;
                
            case 'nextBar':
                // Trigger at the start of the next bar
                triggerTime = now + timeToNextBar;
                break;
                
            case 'nextPhrase':
                // Trigger at the start of the next 4-bar phrase
                const barsToNextPhrase = (4 - (timeInfo.bar % 4)) % 4 || 4;
                triggerTime = now + (barsToNextPhrase * barDuration);
                break;
                
            case 'subdivision':
                // Snap to nearest subdivision
                const subdivision = gesture.rhythm?.subdivision || 'eighth';
                triggerTime = this.calculateNextSubdivision(timeInfo, subdivision);
                break;
                
            case 'swing':
                // For swing patterns, align with swing points
                if (rhythmEngine.getPattern() === 'swing') {
                    triggerTime = this.calculateSwingPoint(timeInfo);
                } else {
                    triggerTime = now + Math.max(50, timeInfo.nextBeatIn);
                }
                break;
                
            default:
                // Default to next beat
                triggerTime = now + Math.max(50, timeInfo.nextBeatIn);
        }
        
        // Apply anticipation if specified (trigger slightly before beat)
        if (gesture.rhythm?.anticipation) {
            triggerTime -= gesture.rhythm.anticipation;
        }
        
        return triggerTime;
    }
    
    /**
     * Calculate next subdivision timing
     * @param {Object} timeInfo - Current time information
     * @param {string} subdivision - Subdivision type
     * @returns {number} Next subdivision timestamp
     */
    calculateNextSubdivision(timeInfo, subdivision) {
        const now = performance.now();
        const subdivisionDurations = {
            'whole': timeInfo.barDuration,
            'half': timeInfo.barDuration / 2,
            'quarter': timeInfo.beatDuration,
            'eighth': timeInfo.beatDuration / 2,
            'sixteenth': timeInfo.beatDuration / 4,
            'triplet': timeInfo.beatDuration / 3
        };
        
        const duration = subdivisionDurations[subdivision] || timeInfo.beatDuration;
        const timeSinceLastBeat = now - timeInfo.lastBeatTime;
        const timeToNext = duration - (timeSinceLastBeat % duration);
        
        return now + timeToNext;
    }
    
    /**
     * Calculate swing point timing
     * @param {Object} timeInfo - Current time information
     * @returns {number} Next swing point timestamp
     */
    calculateSwingPoint(timeInfo) {
        const now = performance.now();
        const swingRatio = 0.67; // Classic swing ratio
        const beatProgress = timeInfo.beatProgress || 0;
        
        if (beatProgress < swingRatio) {
            // Next swing point is the late eighth
            const timeToSwing = (swingRatio - beatProgress) * timeInfo.beatDuration;
            return now + timeToSwing;
        } else {
            // Next swing point is the next beat
            return now + Math.max(50, timeInfo.nextBeatIn);
        }
    }
    
    /**
     * Determine how to handle interruption of current gesture
     * @param {Object} newGesture - New gesture to play
     * @returns {string} Interruption mode
     */
    determineInterruption(newGesture) {
        if (!this.currentGesture) {
            return 'immediate';
        }
        
        const current = getGesture(this.currentGesture);
        if (!current) {
            return 'immediate';
        }
        
        // Check if gestures can blend
        if (this.canBlend(current, newGesture)) {
            return 'blend';
        }
        
        // Check current gesture progress
        const now = performance.now();
        const elapsed = now - this.currentGestureStartTime;
        const duration = current.config?.duration || 1000;
        const progress = elapsed / duration;
        
        // Check interruption rules
        if (current.rhythm?.interruptible === false && progress < 0.8) {
            return 'queue'; // Must wait
        }
        
        if (progress > 0.9) {
            return 'queue'; // Almost done, just wait
        }
        
        // Check for musical crossfade point
        const timeInfo = rhythmEngine.getTimeInfo();
        if (timeInfo && timeInfo.nextBeatIn < 100) {
            return 'crossfadeOnBeat';
        }
        
        return 'crossfade';
    }
    
    /**
     * Check if two gestures can blend together
     * @param {Object} gesture1 - First gesture
     * @param {Object} gesture2 - Second gesture
     * @returns {boolean} True if can blend
     */
    canBlend(gesture1, gesture2) {
        // Check if either gesture explicitly allows blending
        if (gesture1.rhythm?.blendable === false || gesture2.rhythm?.blendable === false) {
            return false;
        }
        
        // Check gesture types
        const type1 = gesture1.type;
        const type2 = gesture2.type;
        
        // Blending gestures can mix with anything
        if (type1 === 'blending' && type2 === 'blending') {
            return true;
        }
        
        // Override gestures can't blend
        if (type1 === 'override' || type2 === 'override') {
            return false;
        }
        
        // Effect gestures can usually blend
        if (type1 === 'effect' || type2 === 'effect') {
            return true;
        }
        
        return false;
    }
    
    /**
     * Execute a gesture
     * @param {Object} queueItem - Queue item to execute
     */
    executeGesture(queueItem) {
        const { gestureName, gesture, options, interruptionMode } = queueItem;
        const now = performance.now();
        
        // Handle interruption
        if (this.currentGesture && interruptionMode !== 'blend') {
            // Might need to stop current gesture
            if (interruptionMode === 'immediate' || interruptionMode === 'crossfade') {
                // Let AnimationController handle the transition
            }
        }
        
        // Calculate duration and mark as active
        const duration = this.calculateGestureDuration(gesture);
        const endTime = now + duration;
        this.activeGestures.set(gestureName, endTime);
        
        // Update current gesture
        if (interruptionMode !== 'blend') {
            this.currentGesture = gestureName;
            this.currentGestureStartTime = now;
        }
        
        // Trigger the gesture
        this.mascot.express(gestureName, options);
        
        // Notify UI
        if (this.onGestureTriggered) {
            this.onGestureTriggered(queueItem);
        }
        
        // Schedule completion and queue processing
        setTimeout(() => {
            // Mark as inactive
            this.activeGestures.delete(gestureName);
            
            if (this.currentGesture === gestureName) {
                this.currentGesture = null;
            }
            
            // Check if there are queued instances
            const gestureQueue = this.gestureQueues.get(gestureName);
            if (gestureQueue && gestureQueue.length > 0) {
                const nextItem = gestureQueue.shift();
                // Add to main queue for processing
                this.queue.push(nextItem);
                this.queue.sort((a, b) => a.triggerTime - b.triggerTime);
            }
            
            // Cleanup empty queue
            if (gestureQueue && gestureQueue.length === 0) {
                this.gestureQueues.delete(gestureName);
            }
            
            if (this.onGestureCompleted) {
                this.onGestureCompleted(queueItem);
            }
        }, duration);
    }
    
    /**
     * Process queue on beat
     * @param {Object} beatInfo - Beat information
     */
    processQueueOnBeat(beatInfo) {
        const now = performance.now();
        
        // Process items scheduled for this beat
        const toExecute = [];
        this.queue = this.queue.filter(item => {
            if (item.triggerTime <= now + 50) { // 50ms tolerance
                toExecute.push(item);
                return false;
            }
            return true;
        });
        
        // Execute in priority order
        toExecute.forEach(item => this.executeGesture(item));
    }
    
    /**
     * Process queue on subdivision
     * @param {Object} subdivisionInfo - Subdivision information
     */
    processQueueOnSubdivision(subdivisionInfo) {
        const now = performance.now();
        
        // Only process items specifically waiting for subdivisions
        const toExecute = [];
        this.queue = this.queue.filter(item => {
            if (item.gesture.rhythm?.timingSync === 'subdivision' && 
                item.triggerTime <= now + 25) { // Tighter tolerance for subdivisions
                toExecute.push(item);
                return false;
            }
            return true;
        });
        
        toExecute.forEach(item => this.executeGesture(item));
    }
    
    /**
     * Start the processing loop
     */
    startProcessing() {
        if (this.processInterval) return;
        
        // Use setInterval for consistent timing checks
        this.processInterval = setInterval(() => {
            this.processQueue();
        }, 16); // ~60fps checking
    }
    
    /**
     * Process the queue
     */
    processQueue() {
        const now = performance.now();
        
        // Process any items that are ready
        const toExecute = [];
        this.queue = this.queue.filter(item => {
            if (item.triggerTime <= now) {
                toExecute.push(item);
                return false; // Remove from queue
            }
            return true; // Keep in queue
        });
        
        // Execute ready gestures
        toExecute.forEach(item => {
            this.executeGesture(item);
        });
    }
    
    /**
     * Stop the processing loop
     */
    stopProcessing() {
        if (this.processInterval) {
            clearInterval(this.processInterval);
            this.processInterval = null;
        }
    }
    
    /**
     * Clear the queue
     */
    clearQueue() {
        this.queue = [];
    }
    
    /**
     * Get queue status
     * @returns {Object} Queue status information
     */
    getStatus() {
        return {
            queueLength: this.queue.length,
            currentGesture: this.currentGesture,
            nextGesture: this.queue[0] || null,
            isProcessing: this.isProcessing
        };
    }
}

export default GestureScheduler;