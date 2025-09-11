/**
 * MusicDetector - Handles BPM and time signature detection
 * @module core/morpher/MusicDetector
 */

export class MusicDetector {
    constructor() {
        // Beat detection state
        this.onsetIntervals = [];
        this.onsetStrengths = [];
        this.lastOnsetTime = 0;
        this.onsetThreshold = 0.3;
        
        // BPM detection
        this.detectedBPM = 0;
        this.bpmConfidence = 0;
        this.lastBPMCalculation = 0;
        this.bpmCalculationInterval = 2000; // Recalculate every 2 seconds
        
        // BPM tracking
        this.bpmHistory = [];
        this.tempoLocked = false;
        this.fundamentalBPM = 0;
        
        // Time signature detection
        this.timeSignature = '4/4';
        this.downbeatPhase = 0;
        this.measureLength = 4;
        
        // Music state
        this.isMusicalContent = false;
        this.musicalityScore = 0;
    }

    /**
     * Calculate BPM from onset intervals with improved stability
     * @returns {number} Detected BPM
     */
    calculateBPM() {
        if (this.onsetIntervals.length < 4) return this.detectedBPM;
        
        // Use appropriate window size based on available data
        const analysisWindow = this.onsetIntervals.slice(-15);
        
        // Find tempo candidates using autocorrelation-like approach
        const tempoCandidates = this.findTempoCandidates(analysisWindow);
        if (tempoCandidates.length === 0) return this.detectedBPM;
        
        // Get the best tempo candidate
        const bestCandidate = tempoCandidates[0];
        const candidateBPM = Math.round(60000 / bestCandidate.interval);
        
        // If we haven't locked a tempo yet, establish the fundamental
        if (!this.tempoLocked && this.bpmHistory.length > 3) {
            // Check if we have consistent readings
            const recentBPMs = this.bpmHistory.slice(-3);
            const avgRecent = recentBPMs.reduce((a, b) => a + b, 0) / recentBPMs.length;
            const variance = recentBPMs.reduce((sum, bpm) => sum + Math.pow(bpm - avgRecent, 2), 0) / recentBPMs.length;
            
            // Lock faster with tighter variance requirement
            if (variance < 10) { // Less than ~3 BPM standard deviation
                this.fundamentalBPM = Math.round(avgRecent);
                this.tempoLocked = true;
                this.bpmConfidence = 1.0;
                console.log(`🔒 Tempo locked at ${this.fundamentalBPM} BPM`);
            }
        }
        
        // Check if new BPM is a harmonic of the fundamental
        let finalBPM = candidateBPM;
        if (this.tempoLocked) {
            const harmonic = this.checkHarmonicRelation(candidateBPM, this.fundamentalBPM);
            if (harmonic) {
                // It's a valid harmonic, adjust to fundamental
                finalBPM = this.fundamentalBPM;
                this.bpmConfidence = Math.min(1.0, this.bpmConfidence + 0.1);
            } else {
                // Not a harmonic - check if we should update fundamental
                this.bpmConfidence *= 0.9;
                
                // Only change if confidence is very low and new tempo is strong
                if (this.bpmConfidence < 0.3 && bestCandidate.strength > 0.8) {
                    this.fundamentalBPM = candidateBPM;
                    this.bpmConfidence = 0.5;
                    console.log(`🔄 Tempo updated to ${this.fundamentalBPM} BPM (confidence was low)`);
                } else {
                    // Stick with fundamental
                    finalBPM = this.fundamentalBPM;
                }
            }
        }
        
        // Update history
        this.bpmHistory.push(finalBPM);
        if (this.bpmHistory.length > 10) {
            this.bpmHistory.shift();
        }
        
        // Apply smoothing
        if (this.detectedBPM === 0) {
            this.detectedBPM = finalBPM;
        } else {
            const maxChange = this.tempoLocked ? 1 : 5;
            const diff = finalBPM - this.detectedBPM;
            if (Math.abs(diff) <= maxChange) {
                this.detectedBPM = finalBPM;
            } else {
                this.detectedBPM += Math.sign(diff) * maxChange;
            }
        }
        
        // Update rhythm engine if available
        if (window.rhythmIntegration && window.rhythmIntegration.updateBPM) {
            if (!window.rhythmManuallyStoppedForCurrentAudio) {
                window.rhythmIntegration.updateBPM(this.detectedBPM);
            }
        }
        
        return this.detectedBPM;
    }

    /**
     * Find tempo candidates from intervals
     * @param {Array} intervals - Time intervals between onsets
     * @returns {Array} Tempo candidates with confidence scores
     */
    findTempoCandidates(intervals) {
        const candidates = [];
        
        // Test different interval groupings (1x, 2x, 4x) for beat patterns
        for (let multiplier of [1, 2, 4]) {
            const testIntervals = intervals.map(i => i * multiplier);
            
            // Find clusters of similar intervals
            const clusters = this.clusterIntervals(testIntervals);
            
            for (let cluster of clusters) {
                const avgInterval = cluster.intervals.reduce((a, b) => a + b, 0) / cluster.intervals.length;
                const actualInterval = avgInterval / multiplier;
                
                // Calculate strength based on cluster size and consistency
                const strength = (cluster.intervals.length / intervals.length) * cluster.consistency;
                
                // Only consider if it would result in reasonable BPM
                const bpm = 60000 / actualInterval;
                // Prefer common BPM ranges (120-140 is very common)
                const commonBPMBonus = (bpm >= 120 && bpm <= 140) ? 0.2 : 0;
                if (bpm >= 60 && bpm <= 220) {
                    candidates.push({
                        interval: actualInterval,
                        strength: strength + commonBPMBonus,
                        multiplier: multiplier
                    });
                }
            }
        }
        
        // Sort by strength
        return candidates.sort((a, b) => b.strength - a.strength);
    }

    /**
     * Cluster similar intervals together
     * @param {Array} intervals - Time intervals
     * @returns {Array} Clustered intervals
     */
    clusterIntervals(intervals) {
        const sorted = [...intervals].sort((a, b) => a - b);
        const clusters = [];
        let currentCluster = [sorted[0]];
        
        for (let i = 1; i < sorted.length; i++) {
            const tolerance = currentCluster[0] * 0.08; // 8% tolerance
            if (sorted[i] - currentCluster[0] <= tolerance) {
                currentCluster.push(sorted[i]);
            } else {
                if (currentCluster.length >= 2) {
                    // Calculate consistency (inverse of variance)
                    const avg = currentCluster.reduce((a, b) => a + b, 0) / currentCluster.length;
                    const variance = currentCluster.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / currentCluster.length;
                    const consistency = 1 / (1 + variance / (avg * avg)); // Normalized by average
                    
                    clusters.push({
                        intervals: currentCluster,
                        consistency: consistency
                    });
                }
                currentCluster = [sorted[i]];
            }
        }
        
        // Don't forget the last cluster
        if (currentCluster.length >= 3) {
            const avg = currentCluster.reduce((a, b) => a + b, 0) / currentCluster.length;
            const variance = currentCluster.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / currentCluster.length;
            const consistency = 1 / (1 + variance / (avg * avg));
            clusters.push({
                intervals: currentCluster,
                consistency: consistency
            });
        }
        
        return clusters;
    }

    /**
     * Check if two BPMs are harmonically related
     * @param {number} bpm1 - First BPM
     * @param {number} bpm2 - Second BPM
     * @returns {boolean} True if harmonically related
     */
    checkHarmonicRelation(bpm1, bpm2) {
        const ratio = Math.max(bpm1, bpm2) / Math.min(bpm1, bpm2);
        const tolerance = 0.03;
        
        // Check for simple ratios (2:1, 3:2, 4:3, etc.)
        const simpleRatios = [2, 1.5, 1.333, 1.25];
        return simpleRatios.some(r => Math.abs(ratio - r) < tolerance);
    }

    /**
     * Detect time signature from onset patterns
     * @returns {string} Detected time signature
     */
    detectTimeSignature() {
        // Implementation will be moved from ShapeMorpher
        return this.timeSignature;
    }

    /**
     * Test for waltz pattern (3/4 time)
     * @param {Array} onsets - Onset times and strengths
     * @param {number} beatInterval - Beat interval in ms
     * @returns {boolean} True if waltz pattern detected
     */
    testWaltzPattern(onsets, beatInterval) {
        // Implementation will be moved from ShapeMorpher
        return false;
    }

    /**
     * Add onset event for analysis
     * @param {number} time - Onset time
     * @param {number} strength - Onset strength
     */
    addOnset(time, strength) {
        if (this.lastOnsetTime > 0) {
            const interval = time - this.lastOnsetTime;
            // Filter reasonable intervals (60-220 BPM range)
            if (interval > 273 && interval < 1000) {
                this.onsetIntervals.push(interval);
                if (this.onsetIntervals.length > 20) {
                    this.onsetIntervals.shift();
                }
            }
        }
        
        this.onsetStrengths.push({ time, strength });
        if (this.onsetStrengths.length > 40) {
            this.onsetStrengths.shift();
        }
        
        this.lastOnsetTime = time;
    }

    /**
     * Update music detection
     * @param {number} now - Current time
     */
    update(now) {
        // Periodically recalculate BPM
        if (now - this.lastBPMCalculation > this.bpmCalculationInterval) {
            this.calculateBPM();
            this.detectTimeSignature();
            this.lastBPMCalculation = now;
        }
    }

    /**
     * Reset music detection state
     */
    reset() {
        this.onsetIntervals = [];
        this.onsetStrengths = [];
        this.lastOnsetTime = 0;
        this.detectedBPM = 0;
        this.bpmConfidence = 0;
        this.timeSignature = '4/4';
        this.isMusicalContent = false;
    }

    /**
     * Get current music information
     */
    getMusicInfo() {
        return {
            bpm: this.detectedBPM,
            confidence: this.bpmConfidence,
            timeSignature: this.timeSignature,
            isMusical: this.isMusicalContent,
            musicalityScore: this.musicalityScore
        };
    }
}

export default MusicDetector;