/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Audio Analysis System
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Real-time audio analysis for vocal visualization
 * @author Emotive Engine Team
 * @module core/AudioAnalyzer
 */

/**
 * AudioAnalyzer - Analyzes audio for vocal visualization
 */
export class AudioAnalyzer {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.source = null;
        this.elementSource = null;  // Track audio element source separately
        this.dataArray = null;
        this.isAnalyzing = false;
        this.connectedElement = null;
        this.gainNode = null;  // Store gain node for cleanup
        
        // Frequency band configuration
        this.frequencyBands = 32;
        this.smoothingFactor = 0.3; // Lower smoothing for better responsiveness
        
        // Vocal detection
        this.vocalRange = { min: 80, max: 1000 }; // Hz - typical vocal range
        this.currentAmplitude = 0;
        this.currentFrequencies = new Array(this.frequencyBands).fill(0);
        
        // Beat detection (for rhythm sync)
        this.beatThreshold = 0.3;
        this.lastBeatTime = 0;
        this.beatCallbacks = [];
    }
    
    /**
     * Initialize audio context and analyzer (only after user interaction)
     */
    init() {
        try {
            // Only create AudioContext if we don't already have one
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            // Resume context if it's suspended (common after user interaction)
            if (this.audioContext.state === 'suspended') {
                return this.audioContext.resume().then(() => {
                    this.createAnalyser();
                    return true;
                }).catch(() => false);
            } else {
                this.createAnalyser();
                return true;
            }
        } catch (error) {
            console.warn('AudioAnalyzer init failed:', error);
            return false;
        }
    }
    
    /**
     * Create analyser node and related components
     */
    createAnalyser() {
        if (!this.audioContext) return;
        
        if (!this.analyser) {
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048; // Good balance of frequency/time resolution
            this.analyser.smoothingTimeConstant = 0.5; // Moderate smoothing
            
            const bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(bufferLength);
        }
    }
    
    /**
     * Connect audio element for analysis
     * @param {HTMLAudioElement} audioElement - Audio element to analyze
     */
    connectAudioElement(audioElement) {
        if (!this.audioContext) {
            return;
        }

        try {
            // Create source from audio element (only if not already created)
            if (!this.elementSource || this.connectedElement !== audioElement) {
                this.elementSource = this.audioContext.createMediaElementSource(audioElement);
                this.elementSource.connect(this.analyser);
                this.elementSource.connect(this.audioContext.destination); // Pass through audio
            }
            this.source = this.elementSource;  // Set current source
            this.connectedElement = audioElement;
            this.isAnalyzing = true;

            // Start analysis loop
            this.analyze();
        } catch (error) {
            // If already connected, just restart analysis
            if (error.message && error.message.includes('already been used')) {
                this.source = this.elementSource;  // Use existing source
                this.connectedElement = audioElement;
                this.isAnalyzing = true;
                this.analyze();
            } else {
                // Audio context not available
            }
        }
    }
    
    
    /**
     * Main analysis loop
     */
    analyze() {
        if (!this.isAnalyzing) return;

        requestAnimationFrame(() => this.analyze());

        // Get frequency data
        this.analyser.getByteFrequencyData(this.dataArray);

        // Also try time domain data to see if mic is working
        const timeData = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteTimeDomainData(timeData);

        // Calculate overall amplitude
        let sum = 0;
        let vocalSum = 0;
        let vocalCount = 0;

        // Frequency to bin conversion
        const nyquist = this.audioContext.sampleRate / 2;
        const binHz = nyquist / this.dataArray.length;
        const vocalMinBin = Math.floor(this.vocalRange.min / binHz);
        const vocalMaxBin = Math.ceil(this.vocalRange.max / binHz);

        // Process frequency data
        for (let i = 0; i < this.dataArray.length; i++) {
            const value = this.dataArray[i] / 255; // Normalize to 0-1
            sum += value;

            // Check if in vocal range
            if (i >= vocalMinBin && i <= vocalMaxBin) {
                vocalSum += value;
                vocalCount++;
            }
        }

        // Calculate amplitudes
        this.currentAmplitude = sum / this.dataArray.length;
        const vocalAmplitude = vocalCount > 0 ? vocalSum / vocalCount : 0;

        // Extract frequency bands for visualization
        this.extractFrequencyBands();

        // Detect beats
        this.detectBeat(this.currentAmplitude);

        // Return analysis data
        return {
            amplitude: this.currentAmplitude,
            vocalAmplitude,
            frequencies: this.currentFrequencies,
            rawData: this.dataArray
        };
    }
    
    /**
     * Extract frequency bands for shape deformation
     */
    extractFrequencyBands() {
        const bandsPerBin = Math.floor(this.dataArray.length / this.frequencyBands);
        
        for (let i = 0; i < this.frequencyBands; i++) {
            let sum = 0;
            const startBin = i * bandsPerBin;
            const endBin = Math.min(startBin + bandsPerBin, this.dataArray.length);
            
            for (let j = startBin; j < endBin; j++) {
                sum += this.dataArray[j] / 255; // Normalize
            }
            
            // Apply smoothing
            const newValue = sum / bandsPerBin;
            this.currentFrequencies[i] = this.currentFrequencies[i] * this.smoothingFactor + 
                                         newValue * (1 - this.smoothingFactor);
        }
    }
    
    /**
     * Simple beat detection
     */
    detectBeat(amplitude) {
        const now = performance.now();
        
        // Simple threshold-based beat detection
        // Allow faster beats - 273ms = 220 BPM, but go down to 60ms for very fast tapping
        if (amplitude > this.beatThreshold && now - this.lastBeatTime > 60) {
            this.lastBeatTime = now;
            
            // Trigger beat callbacks
            this.beatCallbacks.forEach(callback => callback(amplitude));
        }
    }
    
    /**
     * Get current vocal instability (0-1)
     */
    getVocalInstability() {
        // Calculate instability based on frequency variance
        let variance = 0;
        const mean = this.currentFrequencies.reduce((a, b) => a + b, 0) / this.frequencyBands;
        
        for (let i = 0; i < this.frequencyBands; i++) {
            variance += Math.pow(this.currentFrequencies[i] - mean, 2);
        }
        
        variance = Math.sqrt(variance / this.frequencyBands);
        
        // Combine with amplitude for overall instability
        const instability = Math.min(1, variance * 2 + this.currentAmplitude * 0.5);
        return instability;
    }
    
    /**
     * Get analysis data formatted for ShapeMorpher
     */
    getShapeMorpherData() {
        return {
            instability: this.getVocalInstability(),
            frequencies: [...this.currentFrequencies],
            amplitude: this.currentAmplitude
        };
    }
    
    /**
     * Add beat detection callback
     */
    onBeat(callback) {
        this.beatCallbacks.push(callback);
    }
    
    /**
     * Stop analysis
     */
    stop() {
        this.isAnalyzing = false;
        
        if (this.gainNode) {
            try {
                this.gainNode.disconnect();
            } catch (_e) {
                // Ignore disconnect errors
            }
            this.gainNode = null;
        }
        
        // Reconnect element source to analyser if it was disconnected
        if (this.elementSource && this.connectedElement) {
            try {
                this.elementSource.connect(this.analyser);
            } catch (_e) {
                // Already connected, that's fine
            }
            this.source = this.elementSource;
        }
    }
    
    /**
     * Resume audio context (needed after user interaction)
     */
    async resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }
    
    /**
     * Cleanup
     */
    destroy() {
        this.stop();
        
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        
        this.analyser = null;
        this.dataArray = null;
        this.beatCallbacks = [];
    }
}