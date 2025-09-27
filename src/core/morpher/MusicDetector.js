/**
 * MusicDetector - Handles BPM and time signature detection
 * @module core/morpher/MusicDetector
 */

import { AgentBPMDetector } from './AgentBPMDetector.js';

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

        // Agent-based detector for fast convergence
        this.agentDetector = new AgentBPMDetector();
        this.useAgentDetection = true; // Flag to enable/disable

        // Time signature detection
        this.timeSignature = '4/4';
        this.detectedTimeSignature = null;
        this.timeSignatureConfidence = 0;
        this.timeSignatureHistory = [];
        this.timeSignatureLocked = false;
        this.downbeatPhase = 0;
        this.measureLength = 4;
        this.measureStartTime = 0;

        // Music state
        this.isMusicalContent = false;
        this.musicalityScore = 0;

        // Fast detection mode
        this.forceFastDetection = false;
    }

    /**
     * Calculate BPM from onset intervals with improved stability
     * @returns {number} Detected BPM
     */
    calculateBPM() {
        // Try agent detector first for faster results
        if (this.useAgentDetection) {
            const agentStatus = this.agentDetector.getStatus();
            if (agentStatus.locked && agentStatus.confidence > 0.6) { // Lower threshold
                // Use agent's locked BPM
                this.detectedBPM = agentStatus.bpm;
                this.bpmConfidence = agentStatus.confidence;
                this.tempoLocked = true;
                this.fundamentalBPM = agentStatus.bpm;

                // Update history
                this.bpmHistory.push(this.detectedBPM);
                if (this.bpmHistory.length > 10) {
                    this.bpmHistory.shift();
                }

                return this.detectedBPM;
            } else if (agentStatus.bpm > 0 && agentStatus.confidence > 0.4) { // Lower threshold
                // Use agent's estimate if somewhat confident
                this.detectedBPM = agentStatus.bpm;
                this.bpmConfidence = agentStatus.confidence;

                // Also mark as tempo locked if confidence is decent
                if (agentStatus.confidence > 0.6) {
                    this.tempoLocked = true;
                }

                return this.detectedBPM;
            }
        }

        // Fall back to original method if agent not ready
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
            if (variance < 5) { // Less than ~2 BPM standard deviation - much tighter
                this.fundamentalBPM = Math.round(avgRecent);
                this.tempoLocked = true;
                this.bpmConfidence = 1.0;
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
            const maxChange = this.tempoLocked ? 1 : 2; // Reduced from 5 to 2 for stability
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
        for (const multiplier of [1, 2, 4]) {
            const testIntervals = intervals.map(i => i * multiplier);
            
            // Find clusters of similar intervals
            const clusters = this.clusterIntervals(testIntervals);
            
            for (const cluster of clusters) {
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
                        multiplier
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
            const tolerance = currentCluster[0] * 0.03; // 3% tolerance - tighter for stable BPM
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
                        consistency
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
                consistency
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
        // Need at least a detected BPM and some onset data
        const minOnsets = this.forceFastDetection ? 6 : 12;
        if (this.detectedBPM === 0 || this.onsetStrengths.length < minOnsets) {
            return this.timeSignature;
        }
        
        // If already locked, don't change unless we're in fast mode (just reset)
        if (this.timeSignatureLocked && !this.forceFastDetection) {
            return this.detectedTimeSignature || this.timeSignature;
        }
        
        const beatInterval = 60000 / this.detectedBPM;
        
        // Only test the most common measure length first (4 beats)
        // We'll be conservative and mostly detect 4/4 unless very clear pattern
        const measureLength = 4;
        const beatBins = new Array(measureLength).fill(0).map(() => ({
            strength: 0,
            bassWeight: 0,
            count: 0
        }));
        
        // Align recent onsets to a 4-beat grid
        const recentOnsets = this.onsetStrengths.slice(-Math.min(20, this.onsetStrengths.length));
        if (recentOnsets.length === 0) return this.timeSignature;
        const startTime = recentOnsets[0].time;
        
        for (const onset of recentOnsets) {
            const timeSinceStart = onset.time - startTime;
            const beatPosition = (timeSinceStart / beatInterval) % measureLength;
            const binIndex = Math.round(beatPosition) % measureLength;
            
            beatBins[binIndex].strength += onset.strength;
            beatBins[binIndex].bassWeight += onset.bassWeight || 0;
            beatBins[binIndex].count++;
        }
        
        // Normalize bins
        let maxStrength = 0;
        for (const bin of beatBins) {
            if (bin.count > 0) {
                bin.strength /= bin.count;
                bin.bassWeight /= bin.count;
                maxStrength = Math.max(maxStrength, bin.strength + bin.bassWeight);
            }
        }
        
        // Default to 4/4 for most music
        let detectedSig = '4/4';
        
        // Only detect 3/4 if we have a VERY clear waltz pattern
        // (strong-weak-weak with no emphasis on beat 4)
        if (beatBins[0].strength > beatBins[1].strength * 2 &&
            beatBins[0].strength > beatBins[2].strength * 2 &&
            beatBins[3].count < beatBins[0].count * 0.5) {
            // Might be 3/4, but need more confidence
            const waltzConfidence = this.testWaltzPattern(recentOnsets, beatInterval);
            if (waltzConfidence > 0.8) {
                detectedSig = '3/4';
            }
        }
        
        // Add to history
        this.timeSignatureHistory.push(detectedSig);
        if (this.timeSignatureHistory.length > 3) {
            this.timeSignatureHistory.shift();
        }
        
        // Lock faster - only need 2 readings in fast mode, 3 normally
        const minReadings = this.forceFastDetection ? 2 : 3;
        if (this.timeSignatureHistory.length >= minReadings) {
            const counts = {};
            for (const sig of this.timeSignatureHistory) {
                counts[sig] = (counts[sig] || 0) + 1;
            }
            
            // Find most common
            let mostCommon = '4/4';
            let maxCount = 0;
            for (const [sig, count] of Object.entries(counts)) {
                if (count > maxCount) {
                    maxCount = count;
                    mostCommon = sig;
                }
            }
            
            // Lock if we have agreement (at least 2 out of 3)
            if (maxCount >= 2) {
                this.detectedTimeSignature = mostCommon;
                this.timeSignatureLocked = true;
                this.timeSignatureConfidence = maxCount / 3;
                
                // Update rhythm engine if available
                if (window.rhythmIntegration && window.rhythmIntegration.setTimeSignature) {
                    window.rhythmIntegration.setTimeSignature(this.detectedTimeSignature);
                }
                
                
                // Also directly update UI in case rhythmIntegration doesn't
                const timeSigDisplay = document.getElementById('time-sig-display');
                if (timeSigDisplay) {
                    timeSigDisplay.textContent = this.detectedTimeSignature;
                }
            }
        }
        
        return this.detectedTimeSignature || this.timeSignature;
    }

    /**
     * Test for waltz pattern (3/4 time)
     * @param {Array} onsets - Onset times and strengths
     * @param {number} beatInterval - Beat interval in ms
     * @returns {number} Confidence score (0-1) for waltz pattern
     */
    testWaltzPattern(onsets, beatInterval) {
        // Look for groups of 3 beats with strong-weak-weak pattern
        let waltzGroups = 0;
        let totalGroups = 0;
        
        for (let i = 0; i < onsets.length - 2; i += 3) {
            if (i + 2 < onsets.length) {
                totalGroups++;
                const first = onsets[i].strength + (onsets[i].bassWeight || 0);
                const second = onsets[i + 1].strength + (onsets[i + 1].bassWeight || 0);
                const third = onsets[i + 2].strength + (onsets[i + 2].bassWeight || 0);
                
                // Check for strong-weak-weak pattern
                if (first > second * 1.5 && first > third * 1.5) {
                    waltzGroups++;
                }
            }
        }
        
        return totalGroups > 0 ? waltzGroups / totalGroups : 0;
    }

    /**
     * Add onset event for analysis
     * @param {number} time - Onset time
     * @param {number} strength - Onset strength
     * @param {number} bassWeight - Optional bass weight for downbeat detection
     */
    addOnset(time, strength, bassWeight = 0) {
        // Feed to agent detector for fast convergence
        if (this.useAgentDetection) {
            this.agentDetector.processPeak(strength, time);
        }

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

        this.onsetStrengths.push({ time, strength, bassWeight });
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
     * Get recommended subdivision for current BPM
     */
    getRecommendedSubdivision() {
        if (this.useAgentDetection) {
            return this.agentDetector.getSubdivision();
        }

        // Fallback logic based on BPM ranges - prefer lower subdivisions
        if (this.detectedBPM < 60) return 2;     // Double for very slow
        if (this.detectedBPM < 80) return 1;     // Normal for slow
        if (this.detectedBPM > 180) return 0.5;  // Half for very fast
        if (this.detectedBPM > 140) return 0.5;  // Half for fast
        return 1; // Normal for mid-range (80-140)
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
        this.bpmHistory = [];
        this.tempoLocked = false;
        this.fundamentalBPM = 0;
        this.timeSignature = '4/4';
        this.detectedTimeSignature = null;
        this.timeSignatureConfidence = 0;
        this.timeSignatureHistory = [];

        // Reset agent detector
        if (this.agentDetector) {
            this.agentDetector.reset();
        }
        this.timeSignatureLocked = false;
        this.isMusicalContent = false;
        this.forceFastDetection = false;
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