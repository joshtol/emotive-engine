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
        this.dataArray = null;
        this.isAnalyzing = false;
        
        // Frequency band configuration
        this.frequencyBands = 32;
        this.smoothingFactor = 0.8; // Smoothing for visual stability
        
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
     * Initialize audio context and analyzer
     */
    async init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048; // Good balance of frequency/time resolution
            this.analyser.smoothingTimeConstant = this.smoothingFactor;
            
            const bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(bufferLength);
            
            return true;
        } catch (error) {
            console.error('Failed to initialize audio context:', error);
            return false;
        }
    }
    
    /**
     * Connect audio element for analysis
     * @param {HTMLAudioElement} audioElement - Audio element to analyze
     */
    connectAudioElement(audioElement) {
        if (!this.audioContext) {
            console.error('Audio context not initialized');
            return;
        }
        
        // Disconnect previous source if exists
        if (this.source) {
            this.source.disconnect();
        }
        
        try {
            this.source = this.audioContext.createMediaElementSource(audioElement);
            this.source.connect(this.analyser);
            this.source.connect(this.audioContext.destination); // Pass through audio
            this.isAnalyzing = true;
            
            // Start analysis loop
            this.analyze();
        } catch (error) {
            console.error('Failed to connect audio element:', error);
        }
    }
    
    /**
     * Connect microphone for real-time analysis
     */
    async connectMicrophone() {
        if (!this.audioContext) {
            console.error('Audio context not initialized');
            return;
        }
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Disconnect previous source
            if (this.source) {
                this.source.disconnect();
            }
            
            this.source = this.audioContext.createMediaStreamSource(stream);
            this.source.connect(this.analyser);
            this.isAnalyzing = true;
            
            // Start analysis loop
            this.analyze();
            
            return stream; // Return stream for cleanup
        } catch (error) {
            console.error('Failed to access microphone:', error);
            return null;
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
            vocalAmplitude: vocalAmplitude,
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
        if (amplitude > this.beatThreshold && now - this.lastBeatTime > 100) {
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
        
        if (this.source) {
            this.source.disconnect();
            this.source = null;
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