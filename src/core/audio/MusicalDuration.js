/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Musical Duration System
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Musical time calculation for tempo-aware gesture durations
 * @author Emotive Engine Team
 * @module core/MusicalDuration
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Converts between musical time (beats/bars) and clock time (milliseconds).        
 * ║ Ensures all gesture durations are perfect subdivisions of the beat, making        
 * ║ animations musically coherent at any tempo.                                      
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 */

import rhythmEngine from './rhythm.js';

class MusicalDuration {
    constructor() {
        // Standard note durations in beats (4/4 time)
        this.noteDurations = {
            'whole': 4,
            'half': 2,
            'quarter': 1,
            'eighth': 0.5,
            'sixteenth': 0.25,
            'triplet': 0.333,
            'dotted-quarter': 1.5,
            'dotted-half': 3
        };
        
        // Cache for performance with LRU eviction
        this.cache = new Map();
        this.maxCacheSize = 100; // Maximum cache entries
        this.cacheAccessOrder = []; // LRU tracking for cache keys
        this.lastBPM = 0;
        
        // Pre-warm cache with common BPMs and durations
        this.prewarmCache();
    }
    
    /**
     * Pre-calculate common durations to prevent first-run lag
     */
    prewarmCache() {
        const commonBPMs = [60, 90, 120, 140, 160, 180];
        const commonDurations = [
            { musical: true, beats: 1 },      // 1 beat
            { musical: true, bars: 1 },       // 1 bar
            { musical: true, beats: 0.5 },    // Half beat
            { musical: true, beats: 2 }       // 2 beats
        ];
        
        commonBPMs.forEach(bpm => {
            commonDurations.forEach(duration => {
                const key = `${bpm}_${JSON.stringify(duration)}`;
                const ms = this.toMilliseconds(duration, bpm);

                // LRU eviction: Remove oldest key when limit reached
                if (this.cache.size >= this.maxCacheSize) {
                    const oldestKey = this.cacheAccessOrder.shift();
                    this.cache.delete(oldestKey);
                }

                this.cache.set(key, ms);
                this.cacheAccessOrder.push(key);
            });
        });
    }
    
    /**
     * Convert musical duration to milliseconds
     * @param {Object} duration - Musical duration config
     * @param {number} [bpm] - Optional BPM override
     * @returns {number} Duration in milliseconds
     */
    toMilliseconds(duration, bpm = null) {
        const currentBPM = bpm || rhythmEngine.bpm || 120;
        
        // Handle different duration formats
        if (typeof duration === 'number') {
            // Already in milliseconds
            return duration;
        }
        
        if (typeof duration === 'object' && duration.musical) {
            const beatDuration = 60000 / currentBPM;
            
            if (duration.beats !== undefined) {
                // Specified in beats
                return duration.beats * beatDuration;
            } else if (duration.bars !== undefined) {
                // Specified in bars (assume 4/4)
                const timeSignature = rhythmEngine.timeSignature || [4, 4];
                return duration.bars * timeSignature[0] * beatDuration;
            } else if (duration.subdivision !== undefined) {
                // Specified as note value
                const beats = this.noteDurations[duration.subdivision] || 1;
                return beats * beatDuration;
            }
        }
        
        // Default fallback
        return 1000;
    }
    
    /**
     * Convert milliseconds to musical duration
     * @param {number} ms - Duration in milliseconds
     * @param {number} [bpm] - Optional BPM override
     * @returns {Object} Musical duration
     */
    toMusical(ms, bpm = null) {
        const currentBPM = bpm || rhythmEngine.bpm || 120;
        const beatDuration = 60000 / currentBPM;
        const beats = ms / beatDuration;
        
        // Find closest standard duration
        let closestNote = 'quarter';
        let closestDiff = Math.abs(beats - 1);
        
        for (const [note, duration] of Object.entries(this.noteDurations)) {
            const diff = Math.abs(beats - duration);
            if (diff < closestDiff) {
                closestDiff = diff;
                closestNote = note;
            }
        }
        
        return {
            musical: true,
            beats,
            bars: beats / 4,
            closestSubdivision: closestNote,
            exact: closestDiff < 0.01
        };
    }
    
    /**
     * Calculate gesture phases with musical timing
     * @param {Array} phases - Array of phase configurations
     * @param {number} totalBeats - Total duration in beats
     * @returns {Array} Phases with calculated timings
     */
    calculatePhases(phases, totalBeats) {
        if (!phases || phases.length === 0) {
            return [{ name: 'main', beats: totalBeats, start: 0, end: 1 }];
        }
        
        // Calculate total beats from phases
        const phaseBeats = phases.reduce((sum, phase) => sum + (phase.beats || 1), 0);
        const scaleFactor = totalBeats / phaseBeats;
        
        let cumulativeBeats = 0;
        return phases.map(phase => {
            const beats = (phase.beats || 1) * scaleFactor;
            const start = cumulativeBeats / totalBeats;
            cumulativeBeats += beats;
            const end = cumulativeBeats / totalBeats;
            
            return {
                name: phase.name,
                beats,
                start,
                end,
                duration: this.toMilliseconds({ musical: true, beats })
            };
        });
    }
    
    /**
     * Get progress through current beat
     * @returns {number} Progress 0-1 through current beat
     */
    getBeatProgress() {
        const timeInfo = rhythmEngine.getTimeInfo();
        return timeInfo ? timeInfo.beatProgress : 0;
    }
    
    /**
     * Get progress through current bar
     * @returns {number} Progress 0-1 through current bar
     */
    getBarProgress() {
        const timeInfo = rhythmEngine.getTimeInfo();
        return timeInfo ? timeInfo.barProgress : 0;
    }
    
    /**
     * Calculate when next musical boundary occurs
     * @param {string} boundary - 'beat', 'bar', 'phrase'
     * @returns {number} Milliseconds until boundary
     */
    timeToNextBoundary(boundary = 'beat') {
        const timeInfo = rhythmEngine.getTimeInfo();
        if (!timeInfo) return 100;
        
        switch (boundary) {
        case 'beat':
            return timeInfo.nextBeatIn;
        case 'bar': {
            const beatsInBar = timeInfo.timeSignature[0];
            const beatsToBar = beatsInBar - timeInfo.beatInBar;
            return beatsToBar * timeInfo.beatDuration;
        }
        case 'phrase': {
            // Assume 4-bar phrases
            const barsInPhrase = 4;
            const beatsInBar = timeInfo.timeSignature[0];
            const currentBar = timeInfo.bar || 0;
            const barsToPhrase = barsInPhrase - (currentBar % barsInPhrase);
            return barsToPhrase * beatsInBar * timeInfo.beatDuration;
        }
        default:
            return timeInfo.nextBeatIn;
        }
    }
    
    /**
     * Quantize a duration to nearest musical subdivision
     * @param {number} ms - Duration in milliseconds
     * @param {string} subdivision - Target subdivision
     * @returns {number} Quantized duration in ms
     */
    quantize(ms, subdivision = 'eighth') {
        const bpm = rhythmEngine.bpm || 120;
        const beatDuration = 60000 / bpm;
        const targetBeats = this.noteDurations[subdivision] || 1;
        const targetMs = targetBeats * beatDuration;
        
        // Round to nearest multiple of target
        const multiple = Math.round(ms / targetMs);
        return multiple * targetMs;
    }
    
    /**
     * Check if we're on a musical boundary
     * @param {string} boundary - 'beat', 'bar', 'phrase'
     * @param {number} tolerance - Tolerance in ms
     * @returns {boolean}
     */
    isOnBoundary(boundary = 'beat', tolerance = 50) {
        const timeToNext = this.timeToNextBoundary(boundary);
        const timeInfo = rhythmEngine.getTimeInfo();
        
        if (!timeInfo) return false;
        
        // Check if we just passed or are about to hit boundary
        return timeToNext < tolerance || 
               (timeInfo.beatDuration - timeToNext) < tolerance;
    }
    
    /**
     * Get tempo-adaptive animation parameters
     * @param {number} baseTempo - Reference tempo
     * @returns {Object} Animation adjustment factors
     */
    getTempoAdaptation(baseTempo = 120) {
        const currentTempo = rhythmEngine.bpm || 120;
        const tempoRatio = currentTempo / baseTempo;
        
        return {
            speed: tempoRatio,
            energy: Math.min(2, Math.max(0.5, tempoRatio)),
            smoothness: tempoRatio < 0.8 ? 1.2 : tempoRatio > 1.5 ? 0.8 : 1,
            intensity: tempoRatio > 1.3 ? 1.2 : tempoRatio < 0.7 ? 0.8 : 1
        };
    }
}

// Create singleton instance
const musicalDuration = new MusicalDuration();

export { musicalDuration, MusicalDuration };
export default musicalDuration;