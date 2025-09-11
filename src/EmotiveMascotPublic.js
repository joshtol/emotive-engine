/**
 * EmotiveMascotPublic - Public API wrapper for Emotive Engine
 * Provides safe, controlled access to engine functionality
 * @module EmotiveMascotPublic
 */

import EmotiveMascot from './EmotiveMascot.js';

class EmotiveMascotPublic {
    constructor(config = {}) {
        // Store config for later initialization
        this._config = this._sanitizeConfig(config);
        this._engine = null;
        this._timeline = [];
        this._isRecording = false;
        this._recordingStartTime = 0;
        this._playbackStartTime = 0;
        this._isPlaying = false;
        this._audioBlob = null;
        this._audioDuration = 0;
        this._initialized = false;
        
        // Bind public methods
        this.init = this.init.bind(this);
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.pause = this.pause.bind(this);
        this.resume = this.resume.bind(this);
    }

    /**
     * Sanitize configuration to prevent access to internal features
     * @private
     */
    _sanitizeConfig(config) {
        const safeConfig = { ...config };
        
        // Remove any debug or internal flags
        delete safeConfig.enableDebug;
        delete safeConfig.enableInternalAPIs;
        delete safeConfig.exposeInternals;
        
        // Force production mode
        safeConfig.mode = 'production';
        
        return safeConfig;
    }

    /**
     * Initialize the engine
     * @param {HTMLCanvasElement} canvas - Canvas element to render to
     * @returns {Promise<void>}
     */
    async init(canvas) {
        if (this._initialized) {
            return Promise.resolve();
        }
        
        // Create engine instance with canvas
        const engineConfig = {
            ...this._config,
            canvasId: canvas  // This accepts either string ID or element
        };
        
        // Create and initialize the engine
        this._engine = new EmotiveMascot(engineConfig);
        
        // Store canvas reference
        this.canvas = this._engine.canvas;
        this._initialized = true;
        
        // The initialize method is synchronous, but we keep async for future compatibility
        return Promise.resolve();
    }

    /**
     * Start the animation engine
     */
    start() {
        if (!this._engine) throw new Error('Engine not initialized. Call init() first.');
        this._engine.start();
    }

    /**
     * Stop the animation engine
     */
    stop() {
        if (!this._engine) throw new Error('Engine not initialized. Call init() first.');
        this._engine.stop();
    }

    /**
     * Pause the animation
     */
    pause() {
        if (!this._engine) throw new Error('Engine not initialized. Call init() first.');
        this._engine.pause();
    }

    /**
     * Resume the animation
     */
    resume() {
        if (!this._engine) throw new Error('Engine not initialized. Call init() first.');
        this._engine.resume();
    }

    // === Audio Management ===

    /**
     * Load audio from URL or Blob
     * @param {string|Blob} source - Audio URL or Blob
     * @returns {Promise<void>}
     */
    async loadAudio(source) {
        if (source instanceof Blob) {
            this._audioBlob = source;
            const audioUrl = URL.createObjectURL(source);
            await this._loadAudioFromUrl(audioUrl);
            URL.revokeObjectURL(audioUrl);
        } else {
            await this._loadAudioFromUrl(source);
        }
    }

    /**
     * Load audio from URL
     * @private
     */
    async _loadAudioFromUrl(url) {
        // Load audio and get duration
        const audio = new Audio(url);
        await new Promise((resolve, reject) => {
            audio.addEventListener('loadedmetadata', () => {
                this._audioDuration = audio.duration * 1000; // Convert to ms
                resolve();
            });
            audio.addEventListener('error', reject);
            audio.load();
        });
        
        // Connect to engine's audio system
        if (this._engine.soundSystem) {
            await this._engine.soundSystem.loadAudioFromURL(url);
        }
    }

    /**
     * Get audio analysis data
     * @returns {Object} Audio analysis (beats, tempo, energy)
     */
    getAudioAnalysis() {
        if (!this._engine || !this._engine.audioAnalyzer) return null;
        
        return {
            bpm: this._engine.rhythmIntegration?.getBPM() || 0,
            beats: this._engine.rhythmIntegration?.getBeatMarkers() || [],
            energy: this._engine.audioAnalyzer?.getEnergyLevel() || 0,
            frequencies: this._engine.audioAnalyzer?.getFrequencyData() || []
        };
    }
    
    /**
     * Connect microphone for audio input
     * @returns {Promise<void>}
     */
    async connectMicrophone() {
        if (!this._engine) throw new Error('Engine not initialized. Call init() first.');
        
        try {
            // Get microphone stream
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Connect to audio handler if available
            if (this._engine.audioHandler) {
                await this._engine.audioHandler.connectMicrophone();
            }
            
            return Promise.resolve();
        } catch (error) {
            console.error('Microphone connection failed:', error);
            throw error;
        }
    }
    
    /**
     * Disconnect microphone
     */
    disconnectMicrophone() {
        if (!this._engine) return;
        
        if (this._engine.audioHandler) {
            this._engine.audioHandler.disconnectMicrophone();
        }
    }
    
    /**
     * Connect audio element for visualization
     * @param {HTMLAudioElement} audioElement - Audio element to connect
     */
    connectAudio(audioElement) {
        if (!this._engine) throw new Error('Engine not initialized. Call init() first.');
        
        if (this._engine.connectAudio) {
            this._engine.connectAudio(audioElement);
        }
    }
    
    /**
     * Get spectrum data for visualization
     * @returns {Array} Frequency spectrum data
     */
    getSpectrumData() {
        if (!this._engine || !this._engine.audioAnalyzer) return [];
        
        // Get frequency data if available
        if (this._engine.audioAnalyzer.getFrequencyData) {
            return this._engine.audioAnalyzer.getFrequencyData();
        }
        
        return [];
    }
    
    /**
     * Start rhythm sync
     * @param {number} [bpm] - Optional BPM to sync to
     */
    startRhythmSync(bpm) {
        if (!this._engine) throw new Error('Engine not initialized. Call init() first.');
        
        if (this._engine.rhythmIntegration) {
            if (bpm) {
                this._engine.rhythmIntegration.setBPM(bpm);
            }
            this._engine.rhythmIntegration.start();
        }
    }
    
    /**
     * Stop rhythm sync
     */
    stopRhythmSync() {
        if (!this._engine) return;
        
        if (this._engine.rhythmIntegration) {
            this._engine.rhythmIntegration.stop();
        }
    }
    
    /**
     * Get performance metrics
     * @returns {Object} Performance data
     */
    getPerformanceMetrics() {
        if (!this._engine) return { fps: 0, frameTime: 0 };
        
        // Try to get from performance monitor
        if (this._engine.performanceMonitor) {
            return {
                fps: this._engine.performanceMonitor.getCurrentFPS() || 0,
                frameTime: this._engine.performanceMonitor.getAverageFrameTime() || 0,
                particleCount: this._engine.particleSystem?.activeParticles || 0
            };
        }
        
        // Fallback to animation controller
        if (this._engine.animationController) {
            return {
                fps: this._engine.animationController.currentFPS || 0,
                frameTime: 1000 / 60, // Default to 60fps timing
                particleCount: 0
            };
        }
        
        return { fps: 0, frameTime: 0, particleCount: 0 };
    }

    // === Animation Control ===

    /**
     * Trigger a gesture
     * @param {string} gestureName - Name of gesture to trigger
     * @param {number} [timestamp] - Optional timestamp for recording
     */
    triggerGesture(gestureName, timestamp) {
        if (!this._engine) throw new Error('Engine not initialized. Call init() first.');
        
        // Record if in recording mode
        if (this._isRecording) {
            const time = timestamp || (Date.now() - this._recordingStartTime);
            this._timeline.push({
                type: 'gesture',
                name: gestureName,
                time: time
            });
        }
        
        // Trigger in engine
        this._engine.express(gestureName);
    }

    /**
     * Set emotion state
     * @param {string} emotion - Emotion name
     * @param {string|Object} [undertoneOrOptions] - Undertone string or options object
     * @param {number} [timestamp] - Optional timestamp for recording
     */
    setEmotion(emotion, undertoneOrOptions, timestamp) {
        if (!this._engine) throw new Error('Engine not initialized. Call init() first.');
        
        // Handle different parameter formats
        let undertone = null;
        let recordTime = timestamp;
        
        if (typeof undertoneOrOptions === 'string') {
            // It's an undertone
            undertone = undertoneOrOptions;
        } else if (typeof undertoneOrOptions === 'number') {
            // It's a timestamp (no undertone provided)
            recordTime = undertoneOrOptions;
        } else if (undertoneOrOptions && typeof undertoneOrOptions === 'object') {
            // It's an options object
            undertone = undertoneOrOptions.undertone;
        }
        
        // Record if in recording mode
        if (this._isRecording) {
            const time = recordTime || (Date.now() - this._recordingStartTime);
            this._timeline.push({
                type: 'emotion',
                name: emotion,
                undertone: undertone,
                time: time
            });
        }
        
        // Set in engine with undertone
        if (undertone) {
            this._engine.setEmotion(emotion, { undertone: undertone });
        } else {
            this._engine.setEmotion(emotion);
        }
    }

    /**
     * Set shape
     * @param {string} shape - Shape name
     * @param {number} [timestamp] - Optional timestamp for recording
     */
    setShape(shape, timestamp) {
        // Record if in recording mode
        if (this._isRecording) {
            const time = timestamp || (Date.now() - this._recordingStartTime);
            this._timeline.push({
                type: 'shape',
                name: shape,
                time: time
            });
        }
        
        // Set in engine
        this._engine.morphTo(shape);
    }

    /**
     * Set BPM manually
     * @param {number} bpm - Beats per minute
     */
    setBPM(bpm) {
        if (this._engine.rhythmIntegration) {
            this._engine.rhythmIntegration.setBPM(bpm);
        }
    }

    /**
     * Set quality level for performance
     * @param {string} level - 'low', 'medium', 'high'
     */
    setQuality(level) {
        const qualityMap = {
            'low': { particleCount: 50, fps: 30 },
            'medium': { particleCount: 100, fps: 60 },
            'high': { particleCount: 200, fps: 60 }
        };
        
        const settings = qualityMap[level] || qualityMap['medium'];
        
        if (this._engine.performanceMonitor) {
            this._engine.performanceMonitor.setTargetFPS(settings.fps);
        }
        
        if (this._engine.particleSystem) {
            this._engine.particleSystem.setMaxParticles(settings.particleCount);
        }
    }

    // === Timeline Recording ===

    /**
     * Start recording animation sequence
     */
    startRecording() {
        this._timeline = [];
        this._isRecording = true;
        this._recordingStartTime = Date.now();
    }

    /**
     * Stop recording
     * @returns {Array} Recorded timeline
     */
    stopRecording() {
        this._isRecording = false;
        return this._timeline;
    }

    /**
     * Play recorded timeline
     * @param {Array} timeline - Timeline to play
     */
    playTimeline(timeline) {
        if (!timeline || !timeline.length) return;
        
        this._isPlaying = true;
        this._playbackStartTime = Date.now();
        
        // Schedule all events
        timeline.forEach(event => {
            setTimeout(() => {
                if (!this._isPlaying) return;
                
                switch (event.type) {
                    case 'gesture':
                        this._engine.express(event.name);
                        break;
                    case 'emotion':
                        this._engine.setEmotion(event.name);
                        break;
                    case 'shape':
                        this._engine.morphTo(event.name);
                        break;
                }
            }, event.time);
        });
        
        // Stop playback after last event
        const lastEventTime = Math.max(...timeline.map(e => e.time));
        setTimeout(() => {
            this._isPlaying = false;
        }, lastEventTime);
    }

    /**
     * Stop timeline playback
     */
    stopPlayback() {
        this._isPlaying = false;
    }

    /**
     * Get current timeline
     * @returns {Array} Current timeline
     */
    getTimeline() {
        return [...this._timeline];
    }

    /**
     * Load timeline
     * @param {Array} timeline - Timeline to load
     */
    loadTimeline(timeline) {
        this._timeline = [...timeline];
    }

    /**
     * Export timeline as JSON
     * @returns {string} JSON string
     */
    exportTimeline() {
        return JSON.stringify({
            version: '1.0',
            duration: this._audioDuration || 0,
            events: this._timeline
        });
    }

    /**
     * Import timeline from JSON
     * @param {string} json - JSON string
     */
    importTimeline(json) {
        const data = JSON.parse(json);
        this._timeline = data.events || [];
        this._audioDuration = data.duration || 0;
    }

    // === Playback Control ===

    /**
     * Get current playback time
     * @returns {number} Current time in milliseconds
     */
    getCurrentTime() {
        if (this._isPlaying) {
            return Date.now() - this._playbackStartTime;
        }
        return 0;
    }

    /**
     * Seek to specific time
     * @param {number} time - Time in milliseconds
     */
    seek(time) {
        // Find all events up to this time and apply them
        const eventsToApply = this._timeline.filter(e => e.time <= time);
        
        // Apply the last event of each type
        const lastEvents = {};
        eventsToApply.forEach(event => {
            lastEvents[event.type] = event;
        });
        
        // Apply states
        if (lastEvents.emotion) {
            this._engine.setEmotion(lastEvents.emotion.name);
        }
        if (lastEvents.shape) {
            this._engine.morphTo(lastEvents.shape.name);
        }
    }

    // === Export Capabilities ===

    /**
     * Get current frame as data URL
     * @param {string} [format='png'] - Image format
     * @returns {string} Data URL
     */
    getFrameData(format = 'png') {
        const canvas = this.canvas || this._engine.canvas;
        if (!canvas) return null;
        
        return canvas.toDataURL(`image/${format}`);
    }

    /**
     * Get current frame as Blob
     * @param {string} [format='png'] - Image format
     * @returns {Promise<Blob>} Image blob
     */
    async getFrameBlob(format = 'png') {
        const canvas = this.canvas || this._engine.canvas;
        if (!canvas) return null;
        
        return new Promise(resolve => {
            canvas.toBlob(blob => resolve(blob), `image/${format}`);
        });
    }

    /**
     * Export animation data
     * @returns {Object} Animation state
     */
    getAnimationData() {
        return {
            timeline: this._timeline,
            duration: this._audioDuration,
            currentTime: this.getCurrentTime(),
            emotion: this._engine.state?.emotion || 'neutral',
            shape: this._engine.state?.currentShape || 'circle'
        };
    }

    // === Query Methods ===

    /**
     * Get available gestures
     * @returns {Array<string>} List of gesture names
     */
    getAvailableGestures() {
        return [
            // Motion
            'bounce', 'pulse', 'shake', 'spin', 'nod', 'tilt',
            'drift', 'vibrate', 'sway', 'float', 'wave',
            // Transform
            'expand', 'contract', 'stretch', 'morph', 'jump',
            // Effects
            'flash', 'glow', 'flicker',
            // Complex
            'scan', 'hula', 'orbit', 'breathe', 'settle'
        ];
    }

    /**
     * Get available emotions
     * @returns {Array<string>} List of emotion names
     */
    getAvailableEmotions() {
        return [
            'neutral', 'joy', 'sadness', 'anger', 'fear',
            'surprise', 'disgust', 'love', 'euphoria',
            'excited', 'suspicion', 'resting'
        ];
    }

    /**
     * Get available shapes
     * @returns {Array<string>} List of shape names
     */
    getAvailableShapes() {
        return [
            'circle', 'square', 'triangle', 'star',
            'heart', 'moon', 'sun'
        ];
    }

    /**
     * Get engine version
     * @returns {string} Version string
     */
    getVersion() {
        return '2.4.0';
    }

    /**
     * Get engine capabilities
     * @returns {Object} Capabilities object
     */
    getCapabilities() {
        return {
            audio: true,
            recording: true,
            timeline: true,
            export: true,
            shapes: true,
            gestures: true,
            emotions: true,
            particles: true
        };
    }

    /**
     * Destroy the engine and clean up resources
     */
    destroy() {
        this.stop();
        this._timeline = [];
        this._isRecording = false;
        this._isPlaying = false;
        
        if (this._engine.destroy) {
            this._engine.destroy();
        }
    }
}

// Export as default
export default EmotiveMascotPublic;

// Also export as named for flexibility
export { EmotiveMascotPublic };