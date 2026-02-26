/**
 * BPMDetector - Simple interval-based BPM detection
 *
 * Algorithm:
 * 1. Receive peak events with timestamps
 * 2. Measure intervals between consecutive peaks
 * 3. Build histogram of intervals → BPM
 * 4. Lock when one BPM dominates
 *
 * @module core/morpher/AgentBPMDetector
 */

export class AgentBPMDetector {
    constructor() {
        // BPM range
        this.minBPM = 60;
        this.maxBPM = 180;

        // Peak tracking
        this.lastPeakTime = 0;
        this.peakCount = 0;

        // Interval collection
        this.intervals = [];
        this.maxIntervals = 40;

        // BPM voting histogram
        this.bpmVotes = new Map();

        // Output
        this.currentBPM = 0;
        this.lockedBPM = 0;
        this.confidence = 0;
        this.isActive = false;

        // 3-Stage Lock System:
        // Stage 0: Detecting - collecting data, no lock yet
        // Stage 1: Initial Lock - fast lock for user feedback, refinement window open
        // Stage 2: Refinement - can apply ONE halve/double correction
        // Stage 3: Final Lock - micro-tuning only, then memory cleanup
        this.lockStage = 0;
        this.stage1LockTime = 0;           // When Stage 1 lock occurred
        this.stage2CorrectionApplied = false;
        this.correctionType = 'none';      // 'none', 'halved', or 'doubled'
        this._recentSubdivisionChecks = []; // Rolling buffer for Stage 2 evidence
        this._stage3StartTime = 0;         // When Stage 3 began
        this._stage3StableTime = 0;        // How long BPM has been stable in Stage 3
        this._memoryCleanedUp = false;     // Flag to prevent repeated cleanup
        this._microTuneBPM = 0;            // Fractional BPM for micro-tuning accumulation

        // Groove confidence: smooth value for animation intensity scaling
        // Maps lockStage to target: Stage 0=15%, Stage 1=40%, Stage 2=65%, Stage 3=85%, Finalized=100%
        // Never decreases within a song, smoothly interpolates toward target
        this.grooveConfidence = 0.15;      // Start at minimal groove
        this._grooveConfidenceTarget = 0.15;

        // Debug logging - periodic to avoid spam
        this._lastLogTime = 0;
        this._logIntervalMs = 2000; // Log every 2 seconds
        this._recentIntervals = []; // Track intervals since last log
        this._recentRawBPMs = []; // Track raw BPMs before normalization
        this._recentNormalizedBPMs = []; // Track BPMs after normalization
        this._skippedPeaks = 0; // Count of skipped weak peaks
        this._skippedIntervals = 0; // Count of out-of-range intervals

        // Log buffer for copy-to-clipboard functionality
        this._logBuffer = [];
        this._maxLogEntries = 20; // Keep last 20 log entries

    }

    /**
     * Process a detected peak/onset
     * @param {number} strength - Peak strength (0-1)
     * @param {number} time - Timestamp in ms
     */
    processPeak(strength, time = performance.now()) {
        this.isActive = true;
        this.peakCount++;

        // Log every peak for debugging (first 10 peaks only) - uncomment for debugging
        // if (this.peakCount <= 10) {
        //     console.warn(`[BPM] Peak #${this.peakCount}: strength=${strength.toFixed(3)}, time=${Math.round(time)}`);
        // }

        // Skip weak peaks
        if (strength < 0.1) {
            this._skippedPeaks++;
            return;
        }

        // Calculate interval from last peak
        if (this.lastPeakTime > 0) {
            const interval = time - this.lastPeakTime;

            // Valid interval: 250ms (240 BPM) to 2000ms (30 BPM)
            if (interval >= 250 && interval <= 2000) {
                this.intervals.push(interval);
                this._recentIntervals.push(Math.round(interval));
                if (this.intervals.length > this.maxIntervals) {
                    this.intervals.shift();
                }

                // Vote for this interval's BPM
                this.voteForInterval(interval);
            } else {
                this._skippedIntervals++;
            }
        }

        this.lastPeakTime = time;

        // Update BPM estimate
        this.updateBPM();

        // Periodic debug logging
        this._debugLog(time);
    }

    /**
     * Vote for a BPM based on interval
     */
    voteForInterval(interval) {
        // Convert to BPM
        const rawBPM = 60000 / interval;

        // Track raw BPM before normalization
        this._recentRawBPMs.push(Math.round(rawBPM));

        // Normalize to 60-180 range using octave folding
        // But prefer NOT doubling/halving if close to boundaries
        let bpm = rawBPM;

        // Only normalize if clearly outside the range (with 5% tolerance at edges)
        const minWithTolerance = this.minBPM * 0.95; // 57 BPM
        const maxWithTolerance = this.maxBPM * 1.05; // 189 BPM

        if (bpm < minWithTolerance) {
            // Double until in range
            while (bpm < this.minBPM) bpm *= 2;
        } else if (bpm > maxWithTolerance) {
            // Halve until in range
            while (bpm > this.maxBPM) bpm /= 2;
        }
        // If bpm is between 57-60 or 180-189, clamp to valid range
        bpm = Math.max(this.minBPM, Math.min(this.maxBPM, bpm));

        // Track normalized BPM
        this._recentNormalizedBPMs.push(Math.round(bpm));

        // Round to nearest integer
        const bpmInt = Math.round(bpm);

        // Vote for this BPM and neighbors (±2 BPM, gaussian weighted)
        for (let offset = -2; offset <= 2; offset++) {
            const voteBPM = bpmInt + offset;
            if (voteBPM >= this.minBPM && voteBPM <= this.maxBPM) {
                // Gaussian weight: center gets 1.0, ±1 gets 0.6, ±2 gets 0.14
                const weight = Math.exp(-(offset * offset) / 2);
                const current = this.bpmVotes.get(voteBPM) || 0;
                this.bpmVotes.set(voteBPM, current + weight);
            }
        }

        // Decay all votes to favor recent data
        for (const [bpmKey, votes] of this.bpmVotes) {
            const decayed = votes * 0.95;
            if (decayed < 0.3) {
                this.bpmVotes.delete(bpmKey);
            } else {
                this.bpmVotes.set(bpmKey, decayed);
            }
        }
    }

    /**
     * Find winning BPM from votes - implements 3-stage lock system
     */
    updateBPM() {
        if (this.bpmVotes.size === 0 || this.intervals.length < 3) return;

        const now = performance.now();

        // Find winner and total
        let bestBPM = 0;
        let bestVotes = 0;
        let totalVotes = 0;

        for (const [bpm, votes] of this.bpmVotes) {
            totalVotes += votes;
            if (votes > bestVotes) {
                bestVotes = votes;
                bestBPM = bpm;
            }
        }

        if (bestBPM === 0) return;

        // Calculate cluster votes (sum of votes within ±2 BPM of winner)
        let clusterVotes = 0;
        for (let offset = -2; offset <= 2; offset++) {
            const nearbyBPM = bestBPM + offset;
            clusterVotes += this.bpmVotes.get(nearbyBPM) || 0;
        }
        const effectiveVotes = clusterVotes;

        // Check half-BPM votes (for subdivision detection)
        const halfBPM = Math.round(bestBPM / 2);
        let halfBPMVotes = 0;
        if (halfBPM >= this.minBPM) {
            for (let offset = -2; offset <= 2; offset++) {
                halfBPMVotes += this.bpmVotes.get(halfBPM + offset) || 0;
            }
        }

        // Check double-BPM votes (for songs detected too slow)
        const doubleBPM = bestBPM * 2;
        let doubleBPMVotes = 0;
        if (doubleBPM <= this.maxBPM) {
            for (let offset = -2; offset <= 2; offset++) {
                doubleBPMVotes += this.bpmVotes.get(doubleBPM + offset) || 0;
            }
        }

        // Calculate subdivision evidence (used in Stage 2)
        let alternatingScore = 0;
        let pairVariancePercent = 0;
        const halfVoteRatio = effectiveVotes > 0 ? halfBPMVotes / effectiveVotes : 0;

        if (this.intervals.length >= 6) {
            const recentIntervals = this.intervals.slice(-8);
            const avgInterval = recentIntervals.reduce((a, b) => a + b, 0) / recentIntervals.length;

            // Alternating pattern detection
            let alternatingCount = 0;
            for (let i = 0; i < recentIntervals.length - 1; i++) {
                const currAboveAvg = recentIntervals[i] > avgInterval;
                const nextAboveAvg = recentIntervals[i + 1] > avgInterval;
                if (currAboveAvg !== nextAboveAvg) {
                    alternatingCount++;
                }
            }
            alternatingScore = alternatingCount / (recentIntervals.length - 1);

            // Pair sum variance
            const pairSums = [];
            for (let i = 0; i < recentIntervals.length - 1; i += 2) {
                pairSums.push(recentIntervals[i] + recentIntervals[i + 1]);
            }
            if (pairSums.length >= 2) {
                const avgPairSum = pairSums.reduce((a, b) => a + b, 0) / pairSums.length;
                const pairSumVariance = pairSums.reduce((sum, ps) => sum + Math.abs(ps - avgPairSum), 0) / pairSums.length;
                pairVariancePercent = pairSumVariance / avgPairSum;
            }
        }

        // Confidence = cluster's share of votes
        this.confidence = totalVotes > 0 ? effectiveVotes / totalVotes : 0;

        // Check interval consistency
        let intervalConsistency = 0;
        if (this.intervals.length >= 4) {
            const expectedInterval = 60000 / bestBPM;
            const subdivisionInterval = expectedInterval / 2;
            const recentIntervals = this.intervals.slice(-8);
            let consistentCount = 0;
            for (const interval of recentIntervals) {
                const matchesBeat = Math.abs(interval - expectedInterval) / expectedInterval < 0.15;
                const matchesSubdivision = Math.abs(interval - subdivisionInterval) / subdivisionInterval < 0.15;
                const matchesDouble = Math.abs(interval - expectedInterval * 2) / (expectedInterval * 2) < 0.15;
                if (matchesBeat || matchesSubdivision || matchesDouble) {
                    consistentCount++;
                }
            }
            intervalConsistency = consistentCount / recentIntervals.length;
        }

        // Smooth currentBPM transition (for display before lock)
        if (this.currentBPM === 0) {
            this.currentBPM = bestBPM;
        } else {
            const alpha = this.intervals.length < 6 ? 0.5 : 0.3;
            this.currentBPM = this.currentBPM * (1 - alpha) + bestBPM * alpha;
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // 3-STAGE LOCK SYSTEM
        // ═══════════════════════════════════════════════════════════════════════════

        // STAGE 0: Initial detection - try to lock quickly
        if (this.lockStage === 0) {
            // Store debug info
            this._lastLockCheck = {
                intervalCount: this.intervals.length,
                bestVotes: bestVotes.toFixed(1),
                clusterVotes: effectiveVotes.toFixed(1),
                confidence: `${(this.confidence * 100).toFixed(0)}%`,
                consistency: `${(intervalConsistency * 100).toFixed(0)}%`,
                bestBPM,
                adjustedBPM: bestBPM,
                isSubdivision: false,
                stage: 0,
                failReasons: []
            };

            // Simple lock criteria - no subdivision gating, lock fast for UX
            const minIntervals = bestBPM > 120 ? 12 : 8;
            const confidenceThreshold = 0.20;
            const consistencyThreshold = 0.45;

            if (this.intervals.length < minIntervals) {
                this._lastLockCheck.failReasons.push(`intervals<${minIntervals}`);
            }
            if (effectiveVotes <= 5) {
                this._lastLockCheck.failReasons.push('votes<=5');
            }
            if (this.confidence <= confidenceThreshold) {
                this._lastLockCheck.failReasons.push(`conf<=${(confidenceThreshold*100).toFixed(0)}%`);
            }
            if (intervalConsistency <= consistencyThreshold) {
                this._lastLockCheck.failReasons.push(`consistency<=${(consistencyThreshold*100).toFixed(0)}%`);
            }

            if (this.intervals.length >= minIntervals &&
                effectiveVotes > 5 &&
                this.confidence > confidenceThreshold &&
                intervalConsistency > consistencyThreshold) {

                // Stage 1 lock - fast initial lock, refinement coming
                this.lockedBPM = Math.round(this.currentBPM);
                this.lockStage = 1;
                this.stage1LockTime = now;
            }
        }

        // STAGE 1 & 2: Refinement window - collect subdivision evidence, allow ONE correction
        if (this.lockStage === 1 || this.lockStage === 2) {
            // Store subdivision check
            this._recentSubdivisionChecks.push({
                alternatingScore,
                pairVariance: pairVariancePercent,
                halfVoteRatio,
                time: now
            });
            if (this._recentSubdivisionChecks.length > 15) {
                this._recentSubdivisionChecks.shift();
            }

            // Calculate evidence for halving
            const positiveChecks = this._recentSubdivisionChecks.filter(c =>
                c.alternatingScore > 0.70 && c.pairVariance < 0.10
            ).length;

            // Also check average metrics
            const avgAltScore = this._recentSubdivisionChecks.reduce((s, c) => s + c.alternatingScore, 0) / this._recentSubdivisionChecks.length;
            const avgPairVar = this._recentSubdivisionChecks.reduce((s, c) => s + c.pairVariance, 0) / this._recentSubdivisionChecks.length;
            const avgHalfRatio = this._recentSubdivisionChecks.reduce((s, c) => s + c.halfVoteRatio, 0) / this._recentSubdivisionChecks.length;

            // Check for doubling (song detected too slow)
            const avgInterval = this.intervals.length > 0
                ? this.intervals.reduce((a, b) => a + b, 0) / this.intervals.length
                : 0;
            const doubleVoteRatio = effectiveVotes > 0 ? doubleBPMVotes / effectiveVotes : 0;

            // Calculate interval variance for debug (with outlier filtering)
            let intervalVarianceDebug = 0;
            let filteredCountDebug = 0;
            if (this.intervals.length >= 8) {
                const recentInts = this.intervals.slice(-12);
                const sorted = [...recentInts].sort((a, b) => a - b);
                const median = sorted[Math.floor(sorted.length / 2)];
                const filtered = recentInts.filter(i => Math.abs(i - median) / median < 0.5);
                filteredCountDebug = filtered.length;
                if (filtered.length >= 6) {
                    const avgInt = filtered.reduce((a, b) => a + b, 0) / filtered.length;
                    intervalVarianceDebug = filtered.reduce((sum, i) => sum + Math.abs(i - avgInt), 0) / filtered.length / avgInt;
                }
            }

            // Update debug info
            this._lastLockCheck = {
                intervalCount: this.intervals.length,
                bestBPM,
                adjustedBPM: this.lockedBPM,
                halfBPM,
                stage: this.lockStage,
                subdivisionChecks: this._recentSubdivisionChecks.length,
                positiveChecks,
                avgAltScore: `${(avgAltScore * 100).toFixed(0)}%`,
                avgPairVar: `${(avgPairVar * 100).toFixed(1)}%`,
                avgHalfRatio: `${(avgHalfRatio * 100).toFixed(0)}%`,
                intervalVariance: `${(intervalVarianceDebug * 100).toFixed(1)}%`,
                filteredCount: filteredCountDebug,
                correctionApplied: this.stage2CorrectionApplied,
                failReasons: []
            };

            // Stage 2 halving trigger (if in Stage 1, auto-advance to Stage 2)
            if (!this.stage2CorrectionApplied &&
                this._recentSubdivisionChecks.length >= 10 &&
                halfBPM >= this.minBPM) {

                // PATH A: Strong alternating pattern evidence (visible subdivisions)
                const shouldHalveByPattern = positiveChecks >= 7 &&   // 7/10+ checks positive
                    avgAltScore > 0.70 &&                    // Strong alternating pattern
                    avgPairVar < 0.10 &&                     // Consistent pair sums
                    this.lockedBPM > 100;                    // Only halve fast tempos

                // PATH B: Significant half-BPM votes (for fingerpicking where subdivisions
                // aren't detected by onset detector, but some intervals hit the half-tempo)
                // This catches Landslide-style songs where bass notes are consistent but
                // the actual tempo is half of what we detected
                // TIGHTENED: 40% threshold and >150 BPM to avoid false halving on fast syncopated songs
                const shouldHalveByVotes = avgHalfRatio > 0.40 &&   // 40%+ votes for half-BPM (was 25%)
                    this.lockedBPM > 150 &&                         // Only very fast detections (was 130)
                    halfBPM >= 65 && halfBPM <= 85;                 // Tighter range for acoustic ballads

                // PATH C: Very consistent high-tempo intervals (fingerpicking signature)
                // Real fast songs (EDM, punk) have varied intervals due to syncopation
                // Fingerpicking produces metronomic subdivisions with low variance
                // Use median-based outlier rejection to handle occasional missed beats
                let intervalVariance = 0;
                let filteredIntervalCount = 0;
                if (this.intervals.length >= 8) {
                    const recentInts = this.intervals.slice(-12);
                    // Sort to find median
                    const sorted = [...recentInts].sort((a, b) => a - b);
                    const median = sorted[Math.floor(sorted.length / 2)];
                    // Filter out intervals >50% away from median (likely missed beats or doubles)
                    const filtered = recentInts.filter(i => Math.abs(i - median) / median < 0.5);
                    filteredIntervalCount = filtered.length;
                    if (filtered.length >= 6) {
                        const avgInt = filtered.reduce((a, b) => a + b, 0) / filtered.length;
                        intervalVariance = filtered.reduce((sum, i) => sum + Math.abs(i - avgInt), 0) / filtered.length / avgInt;
                    }
                }
                // Require enough consistent intervals after filtering
                // TIGHT threshold: fingerpicking produces ~3% variance, real fast songs ~8%+
                const shouldHalveByConsistency = this.lockedBPM > 140 &&  // Very fast detection
                    halfBPM >= 65 && halfBPM <= 85 &&                     // Half in acoustic ballad range
                    filteredIntervalCount >= 8 &&                         // Enough consistent intervals
                    intervalVariance < 0.05;                              // Very consistent intervals (<5% variance)

                if (shouldHalveByPattern || shouldHalveByVotes || shouldHalveByConsistency) {
                    this.lockedBPM = Math.round(this.lockedBPM / 2);
                    this.lockStage = 2;
                    this.stage2CorrectionApplied = true;
                    this.correctionType = 'halved';
                    // Debug: const reason = shouldHalveByPattern
                    //     ? `pattern: ${positiveChecks}/${this._recentSubdivisionChecks.length} checks, altScore=${(avgAltScore*100).toFixed(0)}%`
                }
            }

            // Stage 2 doubling trigger (for songs detected too slow)
            if (!this.stage2CorrectionApplied &&
                this._recentSubdivisionChecks.length >= 10 &&
                doubleBPM <= this.maxBPM) {

                // Doubling conditions: very slow intervals + strong double-BPM votes
                const shouldDouble = avgInterval > 900 &&    // Very slow (<67 BPM)
                    doubleVoteRatio > 0.5 &&                 // Significant double-BPM votes
                    this.lockedBPM < 75;                     // Only double slow tempos

                if (shouldDouble) {
                    this.lockedBPM = Math.round(this.lockedBPM * 2);
                    this.lockStage = 2;
                    this.stage2CorrectionApplied = true;
                    this.correctionType = 'doubled';
                }
            }

            // Stage 1 → Stage 2 transition: after collecting enough subdivision evidence
            // This ensures Stage 2 (yellow) is visible in the UI as a distinct refinement phase
            const timeSinceLock = now - this.stage1LockTime;
            if (this.lockStage === 1 && this._recentSubdivisionChecks.length >= 6) {
                this.lockStage = 2;
            }

            // Exit Stage 2 → Stage 3 conditions
            const conclusivelyNotSubdivision = this._recentSubdivisionChecks.length >= 12 && positiveChecks < 3;
            const timeoutReached = timeSinceLock > 10000; // 10 seconds

            if (this.lockStage === 2 && (this.stage2CorrectionApplied || conclusivelyNotSubdivision || timeoutReached)) {
                this.lockStage = 3;
                this._stage3StartTime = now;
            }
        }

        // STAGE 3: Final lock - micro-tuning only, then cleanup
        if (this.lockStage === 3) {
            const timeSinceStage3 = now - this._stage3StartTime;

            // Micro-tuning: allow small adjustments within ±5%
            const recentIntervals = this.intervals.slice(-8);
            if (recentIntervals.length >= 4) {
                const avgRecentInterval = recentIntervals.reduce((a, b) => a + b, 0) / recentIntervals.length;
                const recentBPM = 60000 / avgRecentInterval;
                const drift = Math.abs(recentBPM - this.lockedBPM) / this.lockedBPM;

                if (drift < 0.05) {
                    // Small drift - accumulate micro-adjustments fractionally
                    // Initialize microTuneBPM on first Stage 3 entry
                    if (this._microTuneBPM === 0) {
                        this._microTuneBPM = this.lockedBPM;
                    }
                    // Smooth fractional adjustment (10% weight for faster response)
                    this._microTuneBPM = this._microTuneBPM * 0.90 + recentBPM * 0.10;
                    const newBPM = Math.round(this._microTuneBPM);
                    if (newBPM !== this.lockedBPM) {
                        this.lockedBPM = newBPM;
                    }
                    this._stage3StableTime += 100; // Assume ~100ms between calls
                } else {
                    // Large drift - might be track change, don't adjust
                    this._stage3StableTime = 0;
                }
            }

            // Final cleanup after 5 seconds OR stable for 3 seconds (only once)
            const shouldFinalize = (timeSinceStage3 > 5000 || this._stage3StableTime > 3000) && !this._memoryCleanedUp;

            if (shouldFinalize && this.lockStage === 3) {
                this._performMemoryCleanup();
                this._memoryCleanedUp = true;
                // lockStage stays at 3 to indicate fully locked
            }

            this._lastLockCheck = {
                stage: 3,
                lockedBPM: this.lockedBPM,
                correctionType: this.correctionType,
                timeSinceStage3: `${(timeSinceStage3 / 1000).toFixed(1)}s`,
                stableTime: `${(this._stage3StableTime / 1000).toFixed(1)}s`,
                finalized: shouldFinalize,
                failReasons: []
            };
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // GROOVE CONFIDENCE UPDATE
        // Maps lockStage to animation intensity, smoothly interpolated, never decreases
        // ═══════════════════════════════════════════════════════════════════════════
        this._updateGrooveConfidence();
    }

    /**
     * Update groove confidence based on current lock stage
     * This value is used by Rhythm3DAdapter to scale animation amplitudes
     * @private
     */
    _updateGrooveConfidence() {
        // Map lockStage to target confidence
        // Stage 0 (Detecting): 15% - tentative, searching
        // Stage 1 (Initial Lock): 40% - found something, building confidence
        // Stage 2 (Refinement): 65% - refining, getting comfortable
        // Stage 3 (Final Lock): 85% - confident, grooving
        // Finalized: 100% - locked in, full groove
        const stageTargets = [0.15, 0.40, 0.65, 0.85];

        if (this._memoryCleanedUp) {
            // Finalized - full groove
            this._grooveConfidenceTarget = 1.0;
        } else {
            this._grooveConfidenceTarget = stageTargets[this.lockStage] || 0.15;
        }

        // Smoothly interpolate toward target (but never decrease)
        // Use exponential smoothing: ~0.1 per call means ~10 calls to reach halfway
        const smoothingFactor = 0.08;
        const newConfidence = this.grooveConfidence + (this._grooveConfidenceTarget - this.grooveConfidence) * smoothingFactor;

        // Only increase, never decrease (maintain achieved groove level)
        if (newConfidence > this.grooveConfidence) {
            this.grooveConfidence = newConfidence;
        }
    }

    /**
     * Clean up memory after final lock
     * Keeps minimal state for drift detection
     * @private
     */
    _performMemoryCleanup() {
        // Keep only last 8 intervals for drift detection
        if (this.intervals.length > 8) {
            this.intervals = this.intervals.slice(-8);
        }

        // Clear voting histogram - no longer needed
        this.bpmVotes.clear();

        // Clear subdivision history - no longer needed
        this._subdivisionHistory = [];
        this._recentSubdivisionChecks = [];

        // Clear debug arrays
        this._recentIntervals = [];
        this._recentRawBPMs = [];
        this._recentNormalizedBPMs = [];

    }

    /**
     * Process frequency frame (for compatibility with frame-based detection)
     */
    processFrame(_frequencyData, _time = performance.now()) {
        // This detector is peak-based, not frame-based
        // The 3D engine calls processPeak directly from its own onset detection
        // This method is here for API compatibility only
    }

    /**
     * Reset detection
     */
    reset() {
        this.intervals = [];
        this.bpmVotes.clear();
        this.lastPeakTime = 0;
        this.peakCount = 0;
        this.currentBPM = 0;
        this.lockedBPM = 0;
        this.confidence = 0;
        this.isActive = false;

        // Reset 3-stage lock state
        this.lockStage = 0;
        this.stage1LockTime = 0;
        this.stage2CorrectionApplied = false;
        this.correctionType = 'none';
        this._recentSubdivisionChecks = [];
        this._stage3StartTime = 0;
        this._stage3StableTime = 0;
        this._memoryCleanedUp = false;
        this._microTuneBPM = 0;

        // Reset groove confidence
        this.grooveConfidence = 0.15;
        this._grooveConfidenceTarget = 0.15;

        // Also reset debug state
        this._lastLogTime = 0;
        this._recentIntervals = [];
        this._recentRawBPMs = [];
        this._recentNormalizedBPMs = [];
        this._skippedPeaks = 0;
        this._skippedIntervals = 0;
        this._logBuffer = [];
        this._lastLockCheck = null;
        this._subdivisionHistory = [];

    }

    getBPM() {
        return this.lockedBPM > 0 ? this.lockedBPM : Math.round(this.currentBPM) || 0;
    }

    getSubdivision() {
        return 1;
    }

    getStatus() {
        return {
            bpm: this.getBPM(),
            subdivision: 1,
            confidence: this.confidence,
            locked: this.lockedBPM > 0,
            lockStage: this.lockStage,
            correctionType: this.correctionType,
            finalized: this._memoryCleanedUp,  // True only after final lock + cleanup
            grooveConfidence: this.grooveConfidence,  // Smooth animation intensity (0.15-1.0)
            agentCount: this.bpmVotes.size,
            peakCount: this.peakCount,
            histogramSize: this.bpmVotes.size,
            topAgents: this.getTopCandidates(5),
            intervalCount: this.intervals.length
        };
    }

    getTopCandidates(count = 5) {
        return [...this.bpmVotes.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, count)
            .map(([bpm, score]) => ({
                bpm,
                score: score.toFixed(1),
                interval: Math.round(60000 / bpm)
            }));
    }

    getTopIntervals(count = 5) {
        return this.getTopCandidates(count).map(c => ({
            interval: c.interval,
            bpm: c.bpm,
            weight: c.score
        }));
    }

    /**
     * Periodic debug logging - called from processPeak
     */
    _debugLog(time) {
        // Only log every 2 seconds
        if (time - this._lastLogTime < this._logIntervalMs) return;
        this._lastLogTime = time;

        // Skip if nothing to report
        if (this._recentIntervals.length === 0 && this._skippedPeaks === 0) return;

        // Build log entry for buffer
        const lines = [];

        // Stage names for display
        const stageNames = ['Detecting', 'Initial Lock', 'Refinement', 'Final Lock'];
        const stageName = stageNames[this.lockStage] || 'Unknown';

        lines.push('═══════════════════════════════════════════════════');
        lines.push(`Status: Stage ${this.lockStage} (${stageName}) | Current: ${Math.round(this.currentBPM)} BPM | Locked: ${this.lockedBPM || '-'}`);

        // Peak stats
        lines.push(`Peaks: ${this.peakCount} total | ${this._skippedPeaks} skipped (weak) | ${this._skippedIntervals} intervals out-of-range`);

        // Recent intervals (raw data)
        if (this._recentIntervals.length > 0) {
            lines.push(`Recent intervals (ms): [${this._recentIntervals.join(', ')}]`);
        }

        // Raw BPMs before normalization
        if (this._recentRawBPMs.length > 0) {
            lines.push(`Raw BPMs (before normalize): [${this._recentRawBPMs.join(', ')}]`);
        }

        // Normalized BPMs
        if (this._recentNormalizedBPMs.length > 0) {
            lines.push(`Normalized BPMs (60-180): [${this._recentNormalizedBPMs.join(', ')}]`);
        }

        // Top candidates from histogram
        const topCandidates = this.getTopCandidates(5);
        if (topCandidates.length > 0) {
            const candStr = topCandidates.map(c => `${c.bpm}(${c.score})`).join(', ');
            lines.push(`Top candidates: ${candStr}`);
        }

        // Lock check status (stage-aware)
        if (this._lastLockCheck) {
            const lc = this._lastLockCheck;
            if (lc.stage === 0) {
                // Stage 0: Detection phase
                if (lc.failReasons && lc.failReasons.length > 0) {
                    lines.push(`Stage 0: NOT locking - ${lc.failReasons.join(', ')}`);
                } else {
                    lines.push(`Stage 0: Ready to lock at ${lc.bestBPM} BPM`);
                }
            } else if (lc.stage === 1 || lc.stage === 2) {
                // Stage 1/2: Refinement phase
                lines.push(`Stage ${lc.stage}: Locked=${lc.adjustedBPM} BPM | checks=${lc.subdivisionChecks} positive=${lc.positiveChecks}`);
                lines.push(`  altScore=${lc.avgAltScore} pairVar=${lc.avgPairVar} halfRatio=${lc.avgHalfRatio}`);
                if (lc.correctionApplied) {
                    lines.push(`  Correction applied: ${this.correctionType}`);
                }
            } else if (lc.stage === 3) {
                // Stage 3: Final lock phase
                lines.push(`Stage 3: Final=${lc.lockedBPM} BPM | correction=${lc.correctionType} | time=${lc.timeSinceStage3} stable=${lc.stableTime}`);
                if (lc.finalized) {
                    lines.push('  FINALIZED - memory cleaned');
                }
            }
        }

        // Interval pattern info (helps diagnose subdivision detection)
        if (this.intervals.length >= 6) {
            const recentIntervals = this.intervals.slice(-8);
            const avgInterval = recentIntervals.reduce((a, b) => a + b, 0) / recentIntervals.length;
            const variance = recentIntervals.reduce((sum, i) => sum + Math.abs(i - avgInterval), 0) / recentIntervals.length;
            const variancePct = (variance / avgInterval * 100).toFixed(1);

            // Calculate alternating score
            let alternatingCount = 0;
            for (let i = 0; i < recentIntervals.length - 1; i++) {
                const currAboveAvg = recentIntervals[i] > avgInterval;
                const nextAboveAvg = recentIntervals[i + 1] > avgInterval;
                if (currAboveAvg !== nextAboveAvg) alternatingCount++;
            }
            const altScore = (alternatingCount / (recentIntervals.length - 1) * 100).toFixed(0);

            lines.push(`Interval pattern: variance=${variancePct}% alternating=${altScore}% (>70% triggers subdivision)`);
        }

        // Interval histogram summary
        const allIntervals = [...this.intervals].map(i => Math.round(i));
        if (allIntervals.length > 0) {
            const min = Math.min(...allIntervals);
            const max = Math.max(...allIntervals);
            const avg = Math.round(allIntervals.reduce((a, b) => a + b, 0) / allIntervals.length);
            lines.push(`Interval buffer (${allIntervals.length}/${this.maxIntervals}): min=${min}ms max=${max}ms avg=${avg}ms (=${Math.round(60000/avg)} BPM)`);
        }

        lines.push('═══════════════════════════════════════════════════');

        // Store in buffer with timestamp
        const timestamp = new Date().toLocaleTimeString('en-US', {
            hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
        this._logBuffer.push({
            time: timestamp,
            lines
        });

        // Trim buffer to max entries
        while (this._logBuffer.length > this._maxLogEntries) {
            this._logBuffer.shift();
        }

        // Reset recent trackers
        this._recentIntervals = [];
        this._recentRawBPMs = [];
        this._recentNormalizedBPMs = [];
        this._skippedPeaks = 0;
        this._skippedIntervals = 0;
    }

    /**
     * Get the debug log buffer as a string for clipboard copy
     * @returns {string} Formatted log buffer
     */
    getDebugLog() {
        if (this._logBuffer.length === 0) {
            return 'No BPM debug logs yet. Play audio to generate logs.';
        }

        let output = '=== BPM Debug Log ===\n\n';

        for (const entry of this._logBuffer) {
            output += `[${entry.time}]\n`;
            for (const line of entry.lines) {
                output += `${line}\n`;
            }
            output += '\n';
        }

        return output;
    }

    /**
     * Clear the debug log buffer
     */
    clearDebugLog() {
        this._logBuffer = [];
    }
}
