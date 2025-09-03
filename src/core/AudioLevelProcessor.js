/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝                                                                             
 *                   ◐ ◑ ◒ ◓  AUDIO LEVEL PROCESSOR  ◓ ◒ ◑ ◐                   
 *                                                                                    
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Audio Level Processor - Real-time Audio Analysis & Reactivity
 * @author Emotive Engine Team
 * @version 2.0.0
 * @module AudioLevelProcessor
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Analyzes real-time audio input to make the mascot react to speech and sound.      
 * ║ Detects volume spikes, tracks audio history, and triggers emotional responses      
 * ║ based on audio levels. Makes the orb "listen" and respond to your voice!          
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🎤 AUDIO ANALYSIS FEATURES                                                        
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Real-time RMS level calculation                                                 
 * │ • Volume spike detection with cooldown                                            
 * │ • Audio level history tracking                                                    
 * │ • Frequency analysis via FFT                                                      
 * │ • Smooth level transitions                                                        
 * │ • Microphone permission handling                                                  
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 📊 PROCESSING PIPELINE                                                            
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ 1. Microphone → getUserMedia()                                                    
 * │ 2. MediaStream → AudioContext                                                     
 * │ 3. AudioContext → AnalyserNode                                                    
 * │ 4. AnalyserNode → Frequency Data (FFT)                                            
 * │ 5. Frequency Data → RMS Calculation                                               
 * │ 6. RMS → Spike Detection & Level Events                                           
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ ⚡ SPIKE DETECTION                                                                
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Threshold: Current level > average * spikeThreshold                            
 * │ • Cooldown: Minimum interval between spikes (default: 1000ms)                    
 * │ • Triggers: "nod" gesture for speech acknowledgment                              
 * │ • Sensitivity: Configurable via spikeThreshold (1.5 = 50% above average)         
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🔧 CONFIGURATION                                                                   
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ PARAMETER              DEFAULT    DESCRIPTION                                     
 * │ spikeThreshold         1.5        Multiplier for spike detection                  
 * │ minimumSpikeLevel      0.1        Minimum level to trigger spike                  
 * │ spikeMinInterval       1000       Cooldown between spikes (ms)                   
 * │ historySize            10         Audio level history buffer size                 
 * │ smoothingTimeConstant  0.8        FFT smoothing (0=none, 1=max)                  
 * │ fftSize                256        FFT bin size for frequency analysis             
 * │ levelUpdateThrottle    100        Throttle for level update events (ms)          
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 📡 EVENTS                                                                          
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • levelUpdate  : Emitted when audio level changes (throttled)                     
 * │ • volumeSpike  : Emitted when spike detected (with cooldown)                      
 * │ • error        : Emitted on processing errors                                     
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                USAGE EXAMPLE                                      
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ const processor = new AudioLevelProcessor({                                       
 * ║     spikeThreshold: 1.5,                                                          
 * ║     spikeMinInterval: 500                                                         
 * ║ });                                                                                
 * ║                                                                                    
 * ║ processor.on('volumeSpike', (level) => {                                          
 * ║     mascot.triggerGesture('nod');  // React to speech                            
 * ║ });                                                                                
 * ║                                                                                    
 * ║ processor.on('levelUpdate', (level) => {                                          
 * ║     mascot.setAudioLevel(level);   // Smooth breathing with speech               
 * ║ });                                                                                
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */
export class AudioLevelProcessor {
    constructor(config = {}) {
        // Configuration with defaults
        this.config = {
            spikeThreshold: config.spikeThreshold || 1.5,
            minimumSpikeLevel: config.minimumSpikeLevel || 0.1,
            spikeMinInterval: config.spikeMinInterval || 1000, // ms between spikes
            historySize: config.historySize || 10,
            smoothingTimeConstant: config.smoothingTimeConstant || 0.8,
            fftSize: config.fftSize || 256,
            levelUpdateThrottle: config.levelUpdateThrottle || 100, // ms
            ...config
        };
        
        // Audio context and analysis
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        
        // Audio level state
        this.currentLevel = 0;
        this.levelHistory = [];
        this.isActive = false;
        
        // Spike detection state
        this.lastVolumeSpike = 0;
        
        // Event throttling
        this.lastLevelEmit = 0;
        
        // Event callbacks
        this.callbacks = {
            levelUpdate: null,
            volumeSpike: null,
            error: null
        };
    }

    /**
     * Initialize audio level processing with provided audio context
     * @param {AudioContext} audioContext - Web Audio API context
     * @returns {boolean} Success status
     */
    initialize(audioContext) {
        try {
            if (!audioContext) {
                throw new Error('AudioContext is required for audio level processing');
            }
            
            // Validate AudioContext
            if (typeof audioContext.createAnalyser !== 'function') {
                throw new Error('Invalid AudioContext provided');
            }
            
            // Store audio context
            this.audioContext = audioContext;
            
            // Create audio analyser for level monitoring
            this.analyser = audioContext.createAnalyser();
            this.analyser.fftSize = this.config.fftSize;
            this.analyser.smoothingTimeConstant = this.config.smoothingTimeConstant;
            
            // Create data array for frequency analysis
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
            
            // Initialize state
            this.currentLevel = 0;
            this.levelHistory = [];
            this.lastVolumeSpike = 0;
            this.isActive = true;
            
            // Resume audio context if suspended
            if (audioContext.state === 'suspended') {
                audioContext.resume().catch(error => {
                    this.emitError('Failed to resume AudioContext', error);
                });
            }
            
            console.log('AudioLevelProcessor: Initialized successfully');
            return true;
            
        } catch (error) {
            this.emitError('Failed to initialize AudioLevelProcessor', error);
            return false;
        }
    }

    /**
     * Clean up audio level processing resources
     */
    cleanup() {
        try {
            // Reset state
            this.isActive = false;
            this.currentLevel = 0;
            this.levelHistory = [];
            this.lastVolumeSpike = 0;
            this.lastLevelEmit = 0;
            
            // Clear references
            this.audioContext = null;
            this.analyser = null;
            this.dataArray = null;
            
            console.log('AudioLevelProcessor: Cleaned up successfully');
            
        } catch (error) {
            this.emitError('Error during AudioLevelProcessor cleanup', error);
        }
    }

    /**
     * Update audio level from analyser (called each frame)
     * @param {number} deltaTime - Time since last frame in milliseconds
     */
    updateAudioLevel(deltaTime = 16) {
        if (!this.isActive || !this.analyser || !this.dataArray) {
            return;
        }
        
        try {
            // Get frequency data from analyser
            this.analyser.getByteFrequencyData(this.dataArray);
            
            // Calculate RMS (Root Mean Square) for accurate level detection
            const rms = this.calculateRMS();
            
            // Update current level with normalization and amplification
            this.currentLevel = Math.min(1, rms * 2); // Amplify for better sensitivity
            
            // Update audio level history for spike detection
            this.updateLevelHistory();
            
            // Check for volume spikes and trigger events
            this.detectVolumeSpikes();
            
            // Emit throttled level update events
            this.emitLevelUpdate();
            
        } catch (error) {
            this.emitError('Error updating audio level', error);
            this.currentLevel = 0;
        }
    }

    /**
     * Calculate RMS (Root Mean Square) from frequency data
     * @returns {number} RMS value normalized to 0-1 range
     */
    calculateRMS() {
        if (!this.dataArray || this.dataArray.length === 0) {
            return 0;
        }
        
        let sumSquares = 0;
        
        // Calculate sum of squares for all frequency bins
        for (let i = 0; i < this.dataArray.length; i++) {
            const normalized = this.dataArray[i] / 255; // Normalize to 0-1
            sumSquares += normalized * normalized;
        }
        
        // Return RMS value
        return Math.sqrt(sumSquares / this.dataArray.length);
    }

    /**
     * Update audio level history for spike detection analysis
     */
    updateLevelHistory() {
        // Add current level to history
        this.levelHistory.push(this.currentLevel);
        
        // Maintain history size limit
        if (this.levelHistory.length > this.config.historySize) {
            this.levelHistory.shift();
        }
    }

    /**
     * Detect volume spikes and emit events for gesture triggering
     */
    detectVolumeSpikes() {
        // Need sufficient history for spike detection
        if (this.levelHistory.length < 5) {
            return;
        }
        
        const currentTime = performance.now();
        
        // Prevent too frequent spike detection
        if (currentTime - this.lastVolumeSpike < this.config.spikeMinInterval) {
            return;
        }
        
        // Calculate average of previous levels (excluding current)
        const previousLevels = this.levelHistory.slice(0, -1);
        const averagePrevious = previousLevels.reduce((sum, level) => sum + level, 0) / previousLevels.length;
        
        // Check for volume spike conditions
        const isSpike = this.currentLevel >= averagePrevious * this.config.spikeThreshold &&
                       averagePrevious >= this.config.minimumSpikeLevel &&
                       this.currentLevel >= this.config.minimumSpikeLevel * 2;
        
        if (isSpike) {
            this.lastVolumeSpike = currentTime;
            
            // Emit volume spike event with detailed information
            this.emitVolumeSpike({
                level: this.currentLevel,
                previousAverage: averagePrevious,
                spikeRatio: this.currentLevel / averagePrevious,
                timestamp: currentTime,
                threshold: this.config.spikeThreshold,
                minimumLevel: this.config.minimumSpikeLevel
            });
            
            console.log(`AudioLevelProcessor: Volume spike detected - ${(this.currentLevel * 100).toFixed(1)}% (${this.config.spikeThreshold}x increase)`);
        }
    }

    /**
     * Clear audio level history
     */
    clearHistory() {
        this.levelHistory = [];
        console.log('AudioLevelProcessor: Audio level history cleared');
    }

    /**
     * Get current audio level
     * @returns {number} Current audio level (0-1)
     */
    getCurrentLevel() {
        return this.currentLevel;
    }

    /**
     * Get audio level history
     * @returns {Array<number>} Array of recent audio levels
     */
    getLevelHistory() {
        return [...this.levelHistory]; // Return copy to prevent external modification
    }

    /**
     * Get analyser node for external audio source connection
     * @returns {AnalyserNode|null} Web Audio analyser node
     */
    getAnalyser() {
        return this.analyser;
    }

    /**
     * Get current frequency data as array
     * @returns {Uint8Array|null} Frequency data array
     */
    getFrequencyData() {
        if (!this.dataArray) {
            return null;
        }
        
        // Return copy of current frequency data
        return new Uint8Array(this.dataArray);
    }

    /**
     * Check if audio level processing is active
     * @returns {boolean} Active status
     */
    isProcessingActive() {
        return this.isActive;
    }

    /**
     * Set callback for audio level updates
     * @param {Function} callback - Callback function receiving level data
     */
    onLevelUpdate(callback) {
        if (typeof callback === 'function') {
            this.callbacks.levelUpdate = callback;
        } else {
            throw new Error('Level update callback must be a function');
        }
    }

    /**
     * Set callback for volume spike events
     * @param {Function} callback - Callback function receiving spike data
     */
    onVolumeSpike(callback) {
        if (typeof callback === 'function') {
            this.callbacks.volumeSpike = callback;
        } else {
            throw new Error('Volume spike callback must be a function');
        }
    }

    /**
     * Set callback for error events
     * @param {Function} callback - Callback function receiving error data
     */
    onError(callback) {
        if (typeof callback === 'function') {
            this.callbacks.error = callback;
        } else {
            throw new Error('Error callback must be a function');
        }
    }

    /**
     * Remove all event callbacks
     */
    removeAllCallbacks() {
        this.callbacks = {
            levelUpdate: null,
            volumeSpike: null,
            error: null
        };
    }

    /**
     * Update configuration settings
     * @param {Object} newConfig - New configuration options
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        
        // Update analyser settings if active
        if (this.analyser) {
            if (newConfig.fftSize) {
                this.analyser.fftSize = this.config.fftSize;
                this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
            }
            
            if (newConfig.smoothingTimeConstant !== undefined) {
                this.analyser.smoothingTimeConstant = this.config.smoothingTimeConstant;
            }
        }
        
        console.log('AudioLevelProcessor: Configuration updated', newConfig);
    }

    /**
     * Get current configuration
     * @returns {Object} Current configuration object
     */
    getConfig() {
        return { ...this.config }; // Return copy to prevent external modification
    }

    /**
     * Get processing statistics
     * @returns {Object} Statistics object
     */
    getStats() {
        return {
            isActive: this.isActive,
            currentLevel: this.currentLevel,
            historySize: this.levelHistory.length,
            maxHistorySize: this.config.historySize,
            lastSpikeTime: this.lastVolumeSpike,
            timeSinceLastSpike: this.lastVolumeSpike > 0 ? performance.now() - this.lastVolumeSpike : 0,
            averageLevel: this.levelHistory.length > 0 ? 
                this.levelHistory.reduce((sum, level) => sum + level, 0) / this.levelHistory.length : 0
        };
    }

    /**
     * Emit throttled audio level update event
     */
    emitLevelUpdate() {
        const currentTime = performance.now();
        
        // Throttle level update events
        if (currentTime - this.lastLevelEmit < this.config.levelUpdateThrottle) {
            return;
        }
        
        this.lastLevelEmit = currentTime;
        
        if (this.callbacks.levelUpdate) {
            try {
                this.callbacks.levelUpdate({
                    level: this.currentLevel,
                    rawData: this.getFrequencyData(),
                    timestamp: currentTime,
                    history: this.getLevelHistory()
                });
            } catch (error) {
                console.warn('AudioLevelProcessor: Error in level update callback:', error);
            }
        }
    }

    /**
     * Emit volume spike event
     * @param {Object} spikeData - Spike detection data
     */
    emitVolumeSpike(spikeData) {
        if (this.callbacks.volumeSpike) {
            try {
                this.callbacks.volumeSpike(spikeData);
            } catch (error) {
                console.warn('AudioLevelProcessor: Error in volume spike callback:', error);
            }
        }
    }

    /**
     * Emit error event
     * @param {string} message - Error message
     * @param {Error} error - Original error object
     */
    emitError(message, error) {
        console.warn(`AudioLevelProcessor: ${message}`, error);
        
        if (this.callbacks.error) {
            try {
                this.callbacks.error({
                    message,
                    error,
                    timestamp: performance.now()
                });
            } catch (callbackError) {
                console.warn('AudioLevelProcessor: Error in error callback:', callbackError);
            }
        }
    }

    /**
     * Check if Web Audio API is supported
     * @returns {boolean} Support status
     */
    static isSupported() {
        return !!(window.AudioContext || window.webkitAudioContext);
    }
}

export default AudioLevelProcessor;