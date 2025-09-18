/**
 * AudioDeformer - Handles audio-based shape deformation
 * @module core/morpher/AudioDeformer
 */

export class AudioDeformer {
    constructor(morpher) {
        this.morpher = morpher;
        
        // Audio deformation state
        this.audioDeformation = 0;
        this.vocalEnergy = 0;
        this.vocalEffectActive = false;
        this.beatGlitchIntensity = 0;
        this.glitchPoints = [];
        
        // Frequency analysis
        this.bassEnergy = 0;
        this.vocalPresence = 0;
        this.highFreqEnergy = 0;
        
        // Transient detection
        this.transientActive = false;
        this.transientStrength = 0;
        this.transientDecay = 0.92;
        this.transientHoldTime = 8;
        this.transientHoldCounter = 0;
    }

    /**
     * Apply audio deformation to shape points
     * @param {Array} points - Shape points to deform
     * @returns {Array} Deformed points
     */
    applyAudioDeformation(points) {
        // Validate points
        if (!points || points.length === 0) {
            return this.morpher.generateFallbackCircle();
        }
        
        // Get fresh frequency data if analyzer is available
        if (this.morpher.audioAnalyzer && this.morpher.audioAnalyzer.currentFrequencies && this.morpher.audioAnalyzer.currentFrequencies.length > 0) {
            this.morpher.frequencyData = [...this.morpher.audioAnalyzer.currentFrequencies];
            
            
            // We have 32 frequency bands (0-31) that cover the full spectrum
            // Approximate mapping: each band covers ~750 Hz (24000 Hz / 32 bands)
            // Band 0-1: Sub-bass
            // Band 2-4: Bass
            // Band 5-15: Midrange
            // Band 16-25: Upper mids/presence
            // Band 26-31: Treble
            
            // BASS THUMP DETECTION: Only trigger on meaty kicks
            let currentBassEnergy = 0;
            let bassCount = 0;
            
            // Focus on low bass (bands 0-2) for the real thumps
            for (let i = 0; i <= 2 && i < this.morpher.frequencyData.length; i++) {
                currentBassEnergy += this.morpher.frequencyData[i];
                bassCount++;
            }
            if (bassCount > 0) {
                currentBassEnergy /= bassCount;
            }
            
            // Initialize bass thump detection
            if (!this.morpher.bassPeakHistory) {
                this.morpher.bassPeakHistory = [];
                this.morpher.bassThumpTimer = 0;
            }
            
            // Track recent bass peaks
            this.morpher.bassPeakHistory.push(currentBassEnergy);
            if (this.morpher.bassPeakHistory.length > 20) { // ~0.6 seconds of history
                this.morpher.bassPeakHistory.shift();
            }
            
            // Calculate dynamic threshold
            const avgBass = this.morpher.bassPeakHistory.reduce((a, b) => a + b, 0) / this.morpher.bassPeakHistory.length;
            const maxBass = Math.max(...this.morpher.bassPeakHistory);
            
            // THUMP = small increase above baseline
            // Check if we're using microphone (lower levels) or audio file (higher levels)
            const isMicrophoneMode = this.morpher.audioAnalyzer && this.morpher.audioAnalyzer.microphoneStream;
            const minThreshold = isMicrophoneMode ? 0.15 : 0.25; // Lower threshold for both, but mic is lowest
            
            const isThump = currentBassEnergy > avgBass * 1.08 && // Just 8% above average
                           currentBassEnergy > minThreshold;
            
            if (isThump) {
                // Boost the effect more for microphone input
                const effectMultiplier = isMicrophoneMode ? 8 : 6; // Increase audio multiplier too
                this.bassEnergy = Math.min(1.0, (currentBassEnergy - avgBass) * effectMultiplier);
                this.morpher.bassThumpTimer = 12; // Shorter hold (12 frames ~0.4 seconds)
            } else if (this.morpher.bassThumpTimer > 0) {
                this.morpher.bassThumpTimer--;
                this.bassEnergy *= 0.9; // Slower decay for smooth wobble
            } else {
                this.bassEnergy = 0;
            }
            
            // VOCAL PRESENCE DETECTION: 2-4 kHz range where vocals cut through
            // With FFT 2048 and 48kHz sample rate:
            // - 1024 bins cover 0-24kHz
            // - Each bin = ~23.4 Hz
            // - 32 bands get 32 bins each (1024/32)
            // - Each band = ~750 Hz
            
            // Band mapping (LINEAR):
            // Band 2: 1500-2250 Hz
            // Band 3: 2250-3000 Hz  } Vocal presence range
            // Band 4: 3000-3750 Hz
            // Band 5: 3750-4500 Hz
            
            let vocalPresenceEnergy = 0;
            let vocalBandCount = 0;
            
            // SPECTRAL FLUX: Detect onsets in the VOCAL RANGE you identified (bands 4-15, emphasis on 11)
            // This targets the actual vocal/lead frequencies in Electric Glow
            
            // Initialize spectral history if needed
            if (!this.morpher.spectralHistory) {
                this.morpher.spectralHistory = [];
                this.morpher.spectralFluxHistory = [];
                // Music detection initialization
                this.morpher.onsetThreshold = 0;
                this.morpher.musicDetector.reset();
                this.morpher.detectedBPM = 0;
                
                // Time signature detection
                this.morpher.onsetStrengths = []; // Array of {time: ms, strength: 0-1, bassWeight: 0-1}
                this.morpher.detectedTimeSignature = null;
                this.morpher.timeSignatureConfidence = 0;
                this.morpher.measureStartTime = 0;
                this.morpher.timeSignatureHistory = [];
                this.morpher.timeSignatureLocked = false;
            }
            
            // Store current spectrum
            const currentSpectrum = [...this.morpher.frequencyData];
            
            // SIMPLER APPROACH: Look for changes in vocal bands with bass rejection
            let spectralFlux = 0;
            let bassFlux = 0;
            
            if (this.morpher.spectralHistory.length > 0) {
                const prevSpectrum = this.morpher.spectralHistory[this.morpher.spectralHistory.length - 1];
                
                // Calculate bass flux (bands 0-2)
                for (let i = 0; i <= 2 && i < currentSpectrum.length; i++) {
                    const diff = currentSpectrum[i] - prevSpectrum[i];
                    if (diff > 0) bassFlux += diff;
                }
                
                // Calculate flux in extended vocal range (bands 4-15)
                // But weight the center (9-13) more heavily
                for (let i = 4; i <= 15 && i < currentSpectrum.length; i++) {
                    const diff = currentSpectrum[i] - prevSpectrum[i];
                    if (diff > 0) {
                        // Extra weight for bands 9-13
                        const weight = (i >= 9 && i <= 13) ? 2.0 : 1.0;
                        spectralFlux += diff * weight;
                    }
                }
                
                // Suppress if there's a strong bass hit (likely a drum)
                if (bassFlux > 0.15) {
                    spectralFlux *= 0.3; // Reduce by 70% for drum hits
                }
            }
            
            // Store history (keep last 30 frames for ~1 second at 30fps)
            this.morpher.spectralHistory.push(currentSpectrum);
            if (this.morpher.spectralHistory.length > 30) {
                this.morpher.spectralHistory.shift();
            }
            
            // Store flux history for adaptive thresholding
            this.morpher.spectralFluxHistory.push(spectralFlux);
            if (this.morpher.spectralFluxHistory.length > 30) {
                this.morpher.spectralFluxHistory.shift();
            }
            
            // Calculate adaptive threshold (median + margin)
            if (this.morpher.spectralFluxHistory.length >= 10) {
                const sorted = [...this.morpher.spectralFluxHistory].sort((a, b) => a - b);
                const median = sorted[Math.floor(sorted.length / 2)];
                const mean = sorted.reduce((a, b) => a + b, 0) / sorted.length;
                
                // Threshold is slightly above the median to catch significant onsets
                this.morpher.onsetThreshold = median + (mean - median) * 0.5;
            }
            
            // Detect onset (transient/attack) - focus on stronger transients for BPM
            // Use higher threshold for BPM detection vs vocal detection
            const isVocalOnset = spectralFlux > this.morpher.onsetThreshold * 1.2 && spectralFlux > 0.02;
            const isBeatOnset = spectralFlux > this.morpher.onsetThreshold * 2.0 && spectralFlux > 0.05; // Stronger threshold for beats
            
            // Smooth the detection with a short hold time
            if (isVocalOnset) {
                this.transientHoldTime = 8; // Hold for 8 frames (~250ms) for visible glitches
                this.morpher.vocalGlowBoost = 0.3; // Add 30% glow boost on vocal onset
            }
            
            // BPM DETECTION: Only track stronger onsets that are likely beats
            if (isBeatOnset) {
                const now = performance.now();
                
                // Store onset strength for time signature detection
                const onsetStrength = {
                    time: now,
                    strength: spectralFlux / (this.morpher.onsetThreshold || 1), // Normalized strength
                    bassWeight: bassFlux // Keep bass weight for downbeat detection
                };
                this.morpher.onsetStrengths.push(onsetStrength);
                // Keep last 40 onsets (about 16-20 beats)
                if (this.morpher.onsetStrengths.length > 40) {
                    this.morpher.onsetStrengths.shift();
                }
                
                // Delegate onset tracking to music detector
                this.morpher.musicDetector.addOnset(now, spectralFlux);
                
            }
            
            // Update BPM detection through music detector
            this.morpher.musicDetector.update(performance.now());
            this.morpher.detectedBPM = this.morpher.musicDetector.detectedBPM;
            this.morpher.bpmConfidence = this.morpher.musicDetector.bpmConfidence;
            
            // Update local references for compatibility
            if (this.morpher.detectedBPM > 0 && this.morpher.bpmConfidence > 0.8) {
                // Clear fast mode once we've detected BPM with confidence
                if (this.morpher.forceFastDetection) {
                    this.morpher.forceFastDetection = false;
                }
            }
            
            if (this.transientHoldTime > 0) {
                this.transientHoldTime--;
            }
            
            // Decay glow boost smoothly
            if (this.morpher.vocalGlowBoost > 0) {
                this.morpher.vocalGlowBoost *= 0.92; // Smooth decay
            }
            
            // Set vocal presence based on flux intensity
            this.vocalPresence = spectralFlux;
            
            // No spectral contrast needed
            const spectralContrast = 0;
            
            // Update rolling averages for smarter detection
            this.morpher.bassHistory[this.morpher.historyIndex] = this.bassEnergy;
            this.morpher.vocalHistory[this.morpher.historyIndex] = this.vocalPresence;
            this.morpher.historyIndex = (this.morpher.historyIndex + 1) % this.morpher.bassHistory.length;
            
            // Calculate averages
            const bassAvg = this.morpher.bassHistory.reduce((a, b) => a + b, 0) / this.morpher.bassHistory.length;
            const vocalAvg = this.morpher.vocalHistory.reduce((a, b) => a + b, 0) / this.morpher.vocalHistory.length;
            
            // Bass effect is now controlled by thump detection above
            this.morpher.bassEffectActive = this.morpher.bassThumpTimer > 0;
            
            // ENHANCED VOCAL DETECTION
            // Vocals are present when:
            // 1. Bands 9-13 have high contrast vs background
            // 2. Energy is above minimum threshold
            // 3. Either sudden spike OR sustained presence
            
            this.morpher.lastVocalPresence = this.morpher.lastVocalPresence || 0;
            const vocalDelta = this.vocalPresence - this.morpher.lastVocalPresence;
            this.morpher.lastVocalPresence = this.vocalPresence;
            
            // Transient detection - triggers on musical onsets
            this.vocalEffectActive = this.transientHoldTime > 0;
            
        }
        
        // If no analyzer or no frequency data, fallback to using audioDeformation for effects
        // This is especially important for microphone input where bass frequencies might be weak
        const hasFrequencyData = this.morpher.frequencyData && this.morpher.frequencyData.some(f => f > 0.01);
        if (!this.morpher.audioAnalyzer || !hasFrequencyData) {
            // Enhanced fallback for microphone input
            // Use audioDeformation as a proxy for bass effect when no frequency data
            if (this.audioDeformation > 0.15) { // Lower threshold for mic sensitivity
                this.morpher.bassEffectActive = true;
                this.bassEnergy = Math.min(1.0, this.audioDeformation * 0.8); // Stronger response
                
                // Simulate bass thump timer for wobble effect
                if (!this.morpher.bassThumpTimer || this.morpher.bassThumpTimer <= 0) {
                    this.morpher.bassThumpTimer = 12; // Start wobble
                }
            } else if (this.morpher.bassThumpTimer > 0) {
                // Decay the wobble
                this.morpher.bassThumpTimer--;
                this.bassEnergy *= 0.9;
            }
            
            // Use vocalEnergy for vocal effects
            if (this.vocalEnergy > 0.2) { // Lower threshold for mic
                this.vocalEffectActive = true;
                this.vocalPresence = this.vocalEnergy;
            }
        }
        
        // ONLY apply fallback bass wobble for microphone input when no frequency data
        // This ensures wobble works for mic but NOT for web audio
        if (!hasFrequencyData && this.audioDeformation > 0.15 && !this.morpher.bassEffectActive) {
            this.morpher.bassEffectActive = true;
            this.bassEnergy = Math.max(this.bassEnergy, this.audioDeformation * 0.8);
            if (!this.morpher.bassThumpTimer || this.morpher.bassThumpTimer <= 0) {
                this.morpher.bassThumpTimer = 12;
            }
        }
        
        // No deformation if no audio
        const hasAudio = this.audioDeformation !== 0 || this.bassEnergy > 0.01 || 
                        this.vocalPresence > 0.01;
        if (!hasAudio) {
            return points;
        }
        
        const deformed = [];
        const center = { x: 0.5, y: 0.5 };
        const time = Date.now() / 1000; // Time in seconds
        
        // Update undulation phase only when bass is active
        if (this.morpher.bassEffectActive) {
            // Randomly change direction occasionally
            if (Math.random() < 0.05) { // 5% chance per frame
                this.morpher.undulationDirection *= -1; // Reverse direction
            }
            this.morpher.undulationPhase += 0.08 * this.morpher.undulationDirection; // Apply direction
        }
        
        // Update glitch points on beat
        if (this.morpher.audioAnalyzer && this.beatGlitchIntensity > 0) {
            this.beatGlitchIntensity *= 0.9; // Decay glitch intensity
        }
        
        // Create SUBTLE glitch points when vocal presence is detected
        if (this.vocalEffectActive && Math.random() < 0.2) { // 20% chance (reduced)
            this.glitchPoints = [];
            const numGlitches = 2 + Math.floor(Math.random() * 2); // 2-3 points (fewer)
            for (let i = 0; i < numGlitches; i++) {
                this.glitchPoints.push({
                    index: Math.floor(Math.random() * points.length),
                    intensity: 0.02 + Math.random() * 0.03, // 0.02-0.05 intensity (much subtler)
                    decay: 0.94 + Math.random() * 0.02 // Slightly slower decay for smoothness
                });
            }
        }
        
        // Update existing glitch points
        this.glitchPoints = this.glitchPoints.filter(g => {
            g.intensity *= g.decay;
            return g.intensity > 0.01;
        });
        
        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            
            // Handle invalid point
            if (!point || typeof point.x === 'undefined' || typeof point.y === 'undefined') {
                const angle = (i / points.length) * Math.PI * 2;
                deformed.push({
                    x: 0.5 + Math.cos(angle) * 0.5,
                    y: 0.5 + Math.sin(angle) * 0.5
                });
                continue;
            }
            
            // Calculate base position
            const dx = point.x - center.x;
            const dy = point.y - center.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);
            
            // 1. Base expansion from overall amplitude - always active for responsiveness
            const baseExpansion = Math.abs(this.audioDeformation) * 0.12; // Reduced to 12%
            
            // 2. Bass-triggered wiggle effect
            let undulation = 0;
            let breathPulse = 0;
            
            if (this.morpher.bassEffectActive) {
                // Strong bass-driven undulation
                const waveCount = 2; // 2 waves for clean look
                const wiggleIntensity = this.bassEnergy * 0.25; // Increased from 0.15 to 0.25
                undulation = Math.sin(angle * waveCount + this.morpher.undulationPhase) * wiggleIntensity;
                
                // Subtle breathing pulse synced with undulation
                breathPulse = Math.sin(this.morpher.undulationPhase * 0.5) * this.bassEnergy * 0.08; // Increased from 0.05
            }
            
            // 5. Check for glitch points - SUBTLE shimmer/ripple effect
            let glitchOffset = 0;
            const glitchPoint = this.glitchPoints.find(g => g.index === i);
            if (glitchPoint) {
                // Create a subtle ripple/shimmer instead of harsh glitch
                const shimmerTime = Date.now() * 0.015; // Slower oscillation
                const shimmer = Math.sin(shimmerTime + i * 0.5) * Math.cos(shimmerTime * 0.7);
                glitchOffset = glitchPoint.intensity * shimmer * 0.5; // Can go in or out, very subtle
            }
            
            // Combine all deformations - simpler, more selective
            const totalDeformation = 1 + baseExpansion + undulation + breathPulse + glitchOffset;
            
            const newDistance = distance * Math.max(0.8, totalDeformation); // Never shrink below 80%
            
            deformed.push({
                x: center.x + Math.cos(angle) * newDistance,
                y: center.y + Math.sin(angle) * newDistance
            });
        }
        
        return deformed;
    }

    /**
     * Set audio deformation value
     * @param {number} value - Deformation value (0-1)
     */
    setAudioDeformation(value) {
        this.audioDeformation = Math.max(0, Math.min(1, value));
        this.vocalEffectActive = value > 0.01;
    }

    /**
     * Set vocal energy for shape pulsing
     * @param {number} value - Energy value (0-1)
     */
    setVocalEnergy(value) {
        this.vocalEnergy = Math.max(0, Math.min(1, value));
        this.vocalEffectActive = value > 0.01;
    }

    /**
     * Update frequency band energies
     * @param {Object} frequencyData - Frequency analysis data
     */
    updateFrequencyBands(frequencyData) {
        if (frequencyData) {
            this.bassEnergy = frequencyData.bass || 0;
            this.vocalPresence = frequencyData.vocal || 0;
            this.highFreqEnergy = frequencyData.high || 0;
        }
    }

    /**
     * Process transient/beat detection
     * @param {number} amplitude - Current audio amplitude
     * @param {number} threshold - Beat threshold
     */
    processTransient(amplitude, threshold) {
        if (amplitude > threshold) {
            this.transientActive = true;
            this.transientStrength = amplitude;
            this.transientHoldCounter = this.transientHoldTime;
        } else if (this.transientHoldCounter > 0) {
            this.transientHoldCounter--;
        } else {
            this.transientStrength *= this.transientDecay;
            if (this.transientStrength < 0.01) {
                this.transientActive = false;
            }
        }
    }

    /**
     * Get current deformation state
     */
    getState() {
        return {
            audioDeformation: this.audioDeformation,
            vocalEnergy: this.vocalEnergy,
            vocalEffectActive: this.vocalEffectActive,
            beatGlitchIntensity: this.beatGlitchIntensity,
            transientActive: this.transientActive,
            transientStrength: this.transientStrength
        };
    }

    /**
     * Reset all audio effects
     */
    reset() {
        this.audioDeformation = 0;
        this.vocalEnergy = 0;
        this.vocalEffectActive = false;
        this.beatGlitchIntensity = 0;
        this.glitchPoints = [];
        this.transientActive = false;
        this.transientStrength = 0;
    }
}

export default AudioDeformer;