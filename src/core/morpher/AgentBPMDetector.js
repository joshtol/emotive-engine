/**
 * AgentBPMDetector - Fast, agent-based BPM detection
 * Uses multiple competing hypotheses that converge on the true tempo
 * @module core/morpher/AgentBPMDetector
 */

export class AgentBPMDetector {
    constructor() {
        // Agent pool
        this.agents = [];
        this.maxAgents = 8;

        // Detection state
        this.isActive = false;
        this.confidence = 0;
        this.lockedBPM = 0;
        this.lastBeatTime = 0;

        // Audio analysis
        this.peakHistory = [];
        this.maxHistoryLength = 100; // ~3 seconds at 30fps

        // Configuration
        this.minBPM = 40;
        this.maxBPM = 300;
        this.convergenceThreshold = 0.7; // Lower threshold for faster lock
        this.subdivisionPreference = {
            slow: { min: 40, max: 80, prefer: 1 },     // Keep normal for slow (40-80 is already slow)
            normal: { min: 80, max: 140, prefer: 1 },  // Normal for mid
            fast: { min: 140, max: 180, prefer: 0.5 }, // Half for moderately fast
            veryfast: { min: 180, max: 300, prefer: 0.5 } // Half for very fast
        };
    }

    /**
     * BPM Agent - represents one tempo hypothesis
     */
    createAgent(bpm, subdivision = 1) {
        return {
            bpm,
            subdivision,
            effectiveBPM: bpm * subdivision,
            phase: 0,
            confidence: 0.5,
            hits: 0,
            misses: 0,
            lastBeatTime: performance.now(),
            beatInterval: 60000 / (bpm * subdivision)
        };
    }

    /**
     * Initialize agents with diverse starting hypotheses
     */
    initializeAgents(initialGuess = 120) {
        this.agents = [];

        // Prefer lower subdivisions - if initial guess is high, try halving it
        let subdivisions = [1]; // Start with normal

        if (initialGuess > 180) {
            // Very fast - prefer half speed
            subdivisions = [0.5, 0.75, 1];
        } else if (initialGuess > 140) {
            // Fast - try half and normal
            subdivisions = [0.5, 0.75, 1];
        } else if (initialGuess < 60) {
            // Very slow - try doubling
            subdivisions = [1, 1.5, 2];
        } else {
            // Normal range - try various
            subdivisions = [0.5, 1, 1.5];
        }

        subdivisions.forEach(sub => {
            const agent = this.createAgent(initialGuess, sub);
            // Give preference to lower effective BPMs
            if (initialGuess * sub < 140) {
                agent.confidence = 0.6; // Slight boost for sensible BPMs
            }
            this.agents.push(agent);
        });

        // Add some agents that try to find a lower BPM if initial is high
        if (initialGuess > 140) {
            this.agents.push(this.createAgent(initialGuess / 2, 1));
            this.agents.push(this.createAgent(initialGuess / 2, 1.5));
        }
    }

    /**
     * Process new audio peak/onset
     */
    processPeak(strength, time = performance.now()) {
        // Add to history
        this.peakHistory.push({ strength, time });
        if (this.peakHistory.length > this.maxHistoryLength) {
            this.peakHistory.shift();
        }

        // Only process if we have enough history
        if (this.peakHistory.length < 4) return;

        // If not active, initialize from FFT guess
        if (!this.isActive || this.agents.length === 0) {
            const fftGuess = this.getFFTEstimate();
            this.initializeAgents(fftGuess);
            this.isActive = true;
        }

        // If already locked, be more conservative about changes
        if (this.lockedBPM > 0 && this.confidence > 0.7) {
            // Only update agents, don't evolve as aggressively
            this.agents.forEach(agent => {
                this.scoreAgent(agent, time, strength);
            });

            // Only evolve if confidence has dropped significantly
            if (this.confidence < 0.6) {
                this.evolveAgents();
                this.checkConvergence();
            }
        } else {
            // Not locked yet, be aggressive
            // Score each agent against the peak
            this.agents.forEach(agent => {
                this.scoreAgent(agent, time, strength);
            });

            // Evolution step
            this.evolveAgents();

            // Check for convergence
            this.checkConvergence();
        }
    }

    /**
     * Score agent based on how well it predicts this peak
     */
    scoreAgent(agent, peakTime, peakStrength) {
        const timeSinceLastBeat = peakTime - agent.lastBeatTime;
        const expectedNextBeat = agent.beatInterval;

        // Calculate phase alignment (0-1, where 1 is perfect)
        const phaseDiff = Math.abs((timeSinceLastBeat % expectedNextBeat) / expectedNextBeat - 0.5) * 2;
        const alignment = 1 - phaseDiff;

        // Strong peaks matter more
        const _weightedAlignment = alignment * peakStrength;

        // Update agent stats (more aggressive confidence building)
        if (alignment > 0.7) { // Lower threshold
            agent.hits++;
            agent.confidence = Math.min(1, agent.confidence + 0.1); // Faster increase

            // Update phase if we're close
            if (alignment > 0.85) {
                agent.lastBeatTime = peakTime;
            }
        } else if (alignment < 0.3) {
            agent.misses++;
            agent.confidence = Math.max(0, agent.confidence - 0.03);
        }

        // Decay confidence slowly for inactive agents
        agent.confidence *= 0.998; // Slower decay
    }

    /**
     * Evolve agents - kill weak ones, spawn variations of strong ones
     */
    evolveAgents() {
        // Sort by confidence
        this.agents.sort((a, b) => b.confidence - a.confidence);

        // Kill weakest if we have too many
        if (this.agents.length > this.maxAgents) {
            this.agents = this.agents.slice(0, this.maxAgents);
        }

        // If top agent is very confident, spawn slight variations
        const bestAgent = this.agents[0];
        if (bestAgent.confidence > 0.7 && this.agents.length < this.maxAgents) {
            // Try slight BPM variations
            const variation = 1 + (Math.random() - 0.5) * 0.02; // ±1%
            const newAgent = this.createAgent(
                bestAgent.bpm * variation,
                bestAgent.subdivision
            );
            newAgent.confidence = bestAgent.confidence * 0.8;
            this.agents.push(newAgent);
        }

        // Kill agents with very low confidence
        this.agents = this.agents.filter(a => a.confidence > 0.1);
    }

    /**
     * Check if agents have converged on a tempo
     */
    checkConvergence() {
        if (this.agents.length === 0) return;

        const bestAgent = this.agents[0];

        // Need high confidence and clear winner
        if (bestAgent.confidence > this.convergenceThreshold) {
            // Check if other top agents agree (within 5% for faster convergence)
            const similarAgents = this.agents.filter(a =>
                Math.abs(a.effectiveBPM - bestAgent.effectiveBPM) / bestAgent.effectiveBPM < 0.05
            );

            // Only need 2 agents to agree for faster lock
            if (similarAgents.length >= Math.min(2, this.agents.length * 0.3)) {
                // We have convergence!
                this.lockedBPM = Math.round(bestAgent.bpm);
                this.confidence = bestAgent.confidence;

                // Auto-select best subdivision
                this.autoSelectSubdivision();

                return true;
            }
        }

        return false;
    }

    /**
     * Auto-select subdivision based on BPM range
     */
    autoSelectSubdivision() {
        for (const [range, config] of Object.entries(this.subdivisionPreference)) {
            if (this.lockedBPM >= config.min && this.lockedBPM < config.max) {
                // Find agent with preferred subdivision
                const preferredAgent = this.agents.find(a =>
                    Math.abs(a.bpm - this.lockedBPM) < 2 &&
                    Math.abs(a.subdivision - config.prefer) < 0.1
                );

                if (preferredAgent) {
                    return config.prefer;
                }
            }
        }
        return 1; // Default
    }

    /**
     * Get rough BPM estimate from FFT (frequency domain)
     */
    getFFTEstimate() {
        if (this.peakHistory.length < 4) return 120; // Default

        // Calculate intervals between recent peaks
        const recentPeaks = this.peakHistory.slice(-10);
        const intervals = [];

        for (let i = 1; i < recentPeaks.length; i++) {
            intervals.push(recentPeaks[i].time - recentPeaks[i-1].time);
        }

        if (intervals.length === 0) return 120;

        // Find most common interval (mode)
        intervals.sort((a, b) => a - b);
        const median = intervals[Math.floor(intervals.length / 2)];

        // Convert to BPM
        let estimatedBPM = 60000 / median;

        // Sanity check - if way out of range, try doubling/halving
        if (estimatedBPM < this.minBPM) {
            estimatedBPM *= 2;
        } else if (estimatedBPM > this.maxBPM) {
            estimatedBPM /= 2;
        }

        return Math.max(this.minBPM, Math.min(this.maxBPM, estimatedBPM));
    }

    /**
     * Force reset detection with new seed
     */
    reset(seedBPM = null) {
        this.agents = [];
        this.confidence = 0;
        this.lockedBPM = 0;
        this.peakHistory = [];

        if (seedBPM) {
            this.initializeAgents(seedBPM);
        }
    }

    /**
     * Get current best BPM estimate
     */
    getBPM() {
        if (this.lockedBPM > 0 && this.confidence > 0.8) {
            return this.lockedBPM;
        }

        if (this.agents.length > 0) {
            return Math.round(this.agents[0].bpm);
        }

        return 0;
    }

    /**
     * Get recommended subdivision
     */
    getSubdivision() {
        if (this.agents.length > 0) {
            const bestAgent = this.agents[0];

            // Check BPM range preferences
            const {bpm} = bestAgent;
            for (const [range, config] of Object.entries(this.subdivisionPreference)) {
                if (bpm >= config.min && bpm < config.max) {
                    return config.prefer;
                }
            }

            return bestAgent.subdivision;
        }
        return 1;
    }

    /**
     * Get detection status
     */
    getStatus() {
        return {
            bpm: this.getBPM(),
            subdivision: this.getSubdivision(),
            confidence: this.confidence,
            locked: this.lockedBPM > 0 && this.confidence > 0.8,
            agentCount: this.agents.length,
            topAgents: this.agents.slice(0, 3).map(a => ({
                bpm: Math.round(a.bpm),
                subdivision: a.subdivision,
                confidence: a.confidence.toFixed(2)
            }))
        };
    }
}