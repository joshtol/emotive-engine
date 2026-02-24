/**
 * AudioBridge - Audio integration for EmotiveMascot3D
 *
 * Handles:
 * - Audio element connection with CORS workaround via buffer decoding
 * - Dual analyzer setup (main analyzer + buffer analyzer for CORS bypass)
 * - BPM detection with agent-based detector
 * - Event binding/cleanup for play/pause/seek
 *
 * Extracted from src/3d/index.js to reduce god-class size.
 */

import { AgentBPMDetector } from '../../core/morpher/AgentBPMDetector.js';
import { AUDIO } from '../../core/config/defaults.js';

export class AudioBridge {
    /**
     * Create an AudioBridge instance
     * @param {Object} options - Configuration options
     * @param {Function} options.onRhythmStart - Callback when rhythm should start (bpm, feel)
     * @param {Function} options.onRhythmStop - Callback when rhythm should stop
     * @param {Function} options.onBPMChange - Callback when BPM changes (bpm)
     * @param {Function} options.onGrooveConfidenceChange - Callback when groove confidence changes (confidence)
     */
    constructor(options = {}) {
        this.options = options;

        // Audio context and nodes
        this._audioContext = null;
        this._analyzerNode = null;
        this._analyzerConnected = false;

        // Audio element tracking
        this._audioElement = null;
        this._audioSourceNode = null;
        this._connectedAudioElement = null;
        this._audioHandlers = null;

        // Buffer analysis (CORS bypass)
        this._decodedAudioBuffer = null;
        this._audioBufferDuration = null;
        this._analysisSourceNode = null;
        this._bufferAnalyzerNode = null;
        this._analysisGainNode = null;
        this._analysisStartTime = null;

        // BPM detection
        this._bpmDetector = null;
        this._bpmDetectionInterval = null;
        this._detectedBPM = 0;
        this._bpmConfidence = 0;
        this._bpmLocked = false;
    }

    /**
     * Connect an audio element for audio-reactive animations
     * This starts rhythm sync automatically when audio plays
     * @param {HTMLAudioElement} audioElement - Audio element to connect
     * @returns {Promise<void>}
     */
    async connectAudio(audioElement) {
        if (!audioElement) return;

        this._audioElement = audioElement;

        // Create audio context and analyzer if not exists
        if (!this._audioContext) {
            this._audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        // Resume context if suspended (browser autoplay policy)
        if (this._audioContext.state === 'suspended') {
            await this._audioContext.resume();
        }

        // Create analyzer node
        if (!this._analyzerNode) {
            this._analyzerNode = this._audioContext.createAnalyser();
            this._analyzerNode.fftSize = AUDIO.FFT_SIZE;
            this._analyzerNode.smoothingTimeConstant = AUDIO.SMOOTHING_TIME_CONSTANT;
        }

        // Try to use fetch + decodeAudioData to bypass CORS tainted audio issue
        // MediaElementSourceNode often returns all zeros due to CORS even with crossOrigin set
        const audioUrl = audioElement.src;

        // blob: URLs work with fetch in same origin - they're user-uploaded files
        if (audioUrl) {
            try {
                const response = await fetch(audioUrl);
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await this._audioContext.decodeAudioData(arrayBuffer);

                // Store the decoded buffer for playback sync
                this._decodedAudioBuffer = audioBuffer;
                this._audioBufferDuration = audioBuffer.duration;
            } catch (err) {
                console.warn('[Audio] Buffer decode failed, falling back to MediaElementSource:', err.message);
            }
        }

        // Connect audio element to analyzer (for playback through speakers)
        // Note: createMediaElementSource can only be called ONCE per audio element
        if (this._connectedAudioElement === audioElement && this._audioSourceNode) {
            try {
                this._audioSourceNode.connect(this._analyzerNode);
            } catch {
                // Already connected, ignore
            }
        } else {
            if (this._audioSourceNode) {
                try {
                    this._audioSourceNode.disconnect();
                } catch {
                    // Ignore if already disconnected
                }
            }

            try {
                this._audioSourceNode = this._audioContext.createMediaElementSource(audioElement);
                this._audioSourceNode.connect(this._analyzerNode);
                this._connectedAudioElement = audioElement;
            } catch (err) {
                console.error('[Audio] ERROR creating MediaElementSource:', err.message);
            }
        }

        // Only connect analyzer to destination once
        if (!this._analyzerConnected) {
            this._analyzerNode.connect(this._audioContext.destination);
            this._analyzerConnected = true;
        }

        // Start rhythm when audio plays
        const onPlay = () => {
            // Detect BPM or use default
            const bpm = this._detectedBPM || 120;
            this.options.onRhythmStart?.(bpm, 'straight');

            // If we have a decoded buffer, create a buffer source for analysis
            // This runs in parallel with the audio element (muted) purely for FFT data
            if (this._decodedAudioBuffer && !this._analysisSourceNode) {
                this._startBufferAnalysis(audioElement.currentTime);
            }
        };

        const onPause = () => {
            this.options.onRhythmStop?.();
            this._stopBufferAnalysis();
        };

        const onEnded = () => {
            this.options.onRhythmStop?.();
            this._stopBufferAnalysis();
        };

        // Sync buffer analysis position when seeking
        const onSeeked = () => {
            if (this._decodedAudioBuffer && this._analysisSourceNode && !audioElement.paused) {
                this._stopBufferAnalysis();
                this._startBufferAnalysis(audioElement.currentTime);
            }
        };

        // Store handlers for cleanup
        this._audioHandlers = { onPlay, onPause, onEnded, onSeeked };

        audioElement.addEventListener('play', onPlay);
        audioElement.addEventListener('pause', onPause);
        audioElement.addEventListener('ended', onEnded);
        audioElement.addEventListener('seeked', onSeeked);

        // If already playing, start rhythm immediately
        if (!audioElement.paused) {
            onPlay();
        }

        // Start buffer analysis BEFORE BPM detection so analyzer exists when interval runs
        // This creates the buffer analyzer that bypasses CORS tainted audio issues
        if (this._decodedAudioBuffer && !this._analysisSourceNode) {
            this._startBufferAnalysis(audioElement.currentTime);
        }

        // Start BPM detection with analyzer validation
        // Will automatically retry/rebuild if analyzer returns zeros
        this._startBPMDetectionWithValidation();
    }

    /**
     * Disconnect audio and stop audio-reactive animations
     */
    disconnectAudio() {
        // Stop rhythm
        this.options.onRhythmStop?.();

        // Stop buffer analysis
        this._stopBufferAnalysis();

        // Remove event listeners
        if (this._audioElement && this._audioHandlers) {
            this._audioElement.removeEventListener('play', this._audioHandlers.onPlay);
            this._audioElement.removeEventListener('pause', this._audioHandlers.onPause);
            this._audioElement.removeEventListener('ended', this._audioHandlers.onEnded);
            if (this._audioHandlers.onSeeked) {
                this._audioElement.removeEventListener('seeked', this._audioHandlers.onSeeked);
            }
        }

        // Stop BPM detection
        this._stopBPMDetection();

        // Disconnect audio source node
        if (this._audioSourceNode) {
            try {
                this._audioSourceNode.disconnect();
            } catch {
                // Ignore
            }
        }

        // Clean up audio nodes (but keep context for reuse)
        this._audioElement = null;
        this._audioHandlers = null;
        this._connectedAudioElement = null;
        this._audioSourceNode = null;
        this._decodedAudioBuffer = null;
        this._bufferAnalyzerNode = null;
    }

    /**
     * Get the analyzer node for external use (e.g., visualizations)
     * @returns {AnalyserNode|null}
     */
    getAnalyzerNode() {
        return this._bufferAnalyzerNode || this._analyzerNode;
    }

    /**
     * Get the audio context
     * @returns {AudioContext|null}
     */
    getAudioContext() {
        return this._audioContext;
    }

    /**
     * Check if audio is currently playing
     * @returns {boolean}
     */
    isPlaying() {
        return this._audioElement && !this._audioElement.paused;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // BPM DETECTION API
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Get BPM detection status
     * @returns {Object} Detection status object
     */
    getBPMStatus() {
        if (!this._bpmDetector) {
            return {
                bpm: this._detectedBPM || 120,
                subdivision: 1,
                confidence: 0,
                locked: false,
                lockStage: 0,
                correctionType: 'none',
                finalized: false,
                grooveConfidence: 1.0,  // Default to full when no detection active
                agentCount: 0,
                peakCount: 0,
                histogramSize: 0,
                topAgents: [],
                intervalCount: 0
            };
        }
        return this._bpmDetector.getStatus();
    }

    /**
     * Get BPM debug log for clipboard copy
     * @returns {string} Formatted debug log
     */
    getBPMDebugLog() {
        if (!this._bpmDetector || !this._bpmDetector.getDebugLog) {
            return 'No BPM detector active or debug log unavailable.';
        }
        return this._bpmDetector.getDebugLog();
    }

    /**
     * Reset BPM detection to start fresh
     * @param {number} [seedBPM] - Optional initial BPM guess
     */
    resetBPMDetection(seedBPM = null) {
        if (this._bpmDetector) {
            this._bpmDetector.reset(seedBPM);
        }
        this._bpmLocked = false;
        this._bpmConfidence = 0;
        this._detectedBPM = seedBPM || 120;
    }

    /**
     * Get detected BPM
     * @returns {number}
     */
    getDetectedBPM() {
        return this._detectedBPM;
    }

    /**
     * Check if BPM is locked
     * @returns {boolean}
     */
    isBPMLocked() {
        return this._bpmLocked;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PRIVATE: BPM DETECTION
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Start BPM detection with analyzer validation and auto-retry
     * If analyzer returns zeros, tears down and rebuilds the audio pipeline
     * @private
     */
    _startBPMDetectionWithValidation() {
        const maxRetries = 3;
        let retryCount = 0;

        const attemptStart = () => {
            retryCount++;

            // Start detection
            this._startBPMDetection();

            // Validate after short delay - analyzer either works immediately or not at all
            setTimeout(() => {
                const isWorking = this._validateAnalyzerWorking();

                if (isWorking) {
                    // Validation passed
                } else if (retryCount < maxRetries) {
                    console.warn(`[BPM] Analyzer validation FAILED - rebuilding audio pipeline (attempt ${retryCount + 1})`);

                    // Stop current detection
                    this._stopBPMDetection();

                    // Rebuild buffer analysis pipeline
                    this._rebuildBufferAnalysis();

                    // Retry after rebuild
                    setTimeout(attemptStart, 100);
                } else {
                    console.error('[BPM] Analyzer validation FAILED after max retries - detection may not work');
                }
            }, 300); // Check after 300ms - enough time to see data if working
        };

        attemptStart();
    }

    /**
     * Check if the buffer analyzer is working (required for BPM detection)
     * @returns {boolean} true if buffer analyzer is producing data
     * @private
     */
    _validateAnalyzerWorking() {
        // Only use buffer analyzer - main analyzer is unreliable due to CORS tainting
        if (!this._bufferAnalyzerNode) {
            return false;
        }

        const testArray = new Uint8Array(this._bufferAnalyzerNode.frequencyBinCount);

        // Sample multiple times to catch transient audio
        let maxVal = 0;
        let activeTimeDomainSamples = 0;

        for (let i = 0; i < 10; i++) {
            this._bufferAnalyzerNode.getByteFrequencyData(testArray);
            maxVal = Math.max(maxVal, Math.max(...testArray));

            this._bufferAnalyzerNode.getByteTimeDomainData(testArray);
            const timeMin = Math.min(...testArray);
            const timeMax = Math.max(...testArray);

            // Time domain not centered at 128 means audio is flowing
            if (timeMin < 115 || timeMax > 141) {
                activeTimeDomainSamples++;
            }
        }

        // Check if BPM detector has already received peaks
        if (this._bpmDetector && this._bpmDetector.peakCount > 0) {
            return true;
        }

        if (activeTimeDomainSamples > 0) {
            return true;
        }

        if (maxVal > 5) {
            return true;
        }

        return false;
    }

    /**
     * Start agent-based BPM detection for accurate tempo lock
     * @private
     */
    _startBPMDetection() {
        // Always reset detector when starting (handles track changes)
        if (!this._bpmDetector) {
            this._bpmDetector = new AgentBPMDetector();
        }
        this._bpmDetector.reset();
        this._detectedBPM = 0;

        // Initialize groove confidence to tentative (0.15) at detection start
        this.options.onGrooveConfidenceChange?.(0.15);

        // Always stop existing interval to reset closure state (lastPeakTime, fluxHistory, etc.)
        // This ensures fresh detection state when switching tracks without page refresh
        if (this._bpmDetectionInterval) {
            clearInterval(this._bpmDetectionInterval);
            this._bpmDetectionInterval = null;
        }

        // Create dataArray lazily based on the actual analyzer being used
        let dataArray = null;
        let lastPeakTime = 0;
        let prevEnergy = 0;
        let prevTimeDomainAmplitude = 0; // Track previous amplitude for spike detection
        const fluxHistory = [];
        const fluxHistorySize = 20;

        this._bpmDetectionInterval = setInterval(() => {
            if (!this._audioElement || this._audioElement.paused) return;

            // Only use buffer analyzer - main analyzer is unreliable due to CORS tainting
            // Buffer analyzer uses fetch+decodeAudioData which bypasses CORS restrictions
            if (!this._bufferAnalyzerNode) {
                return;
            }

            // Create/recreate dataArray if needed
            const bufferLength = this._bufferAnalyzerNode.frequencyBinCount;
            if (!dataArray || dataArray.length !== bufferLength) {
                dataArray = new Uint8Array(bufferLength);
            }

            this._bufferAnalyzerNode.getByteFrequencyData(dataArray);

            // Calculate low frequency energy (bass) - first 16 bins
            let lowFreqEnergy = 0;
            for (let i = 0; i < 16; i++) {
                lowFreqEnergy += dataArray[i];
            }
            lowFreqEnergy /= 16;

            // Calculate TOTAL energy across all bins for broadband detection
            let totalEnergy = 0;
            for (let i = 0; i < bufferLength; i++) {
                totalEnergy += dataArray[i];
            }
            totalEnergy /= bufferLength;

            // Also get time-domain data for transient detection
            // Time domain is better for catching sharp clicks/pops that may not show in FFT
            const timeDomainArray = new Uint8Array(bufferLength);
            this._bufferAnalyzerNode.getByteTimeDomainData(timeDomainArray);

            // Calculate peak-to-peak amplitude in time domain (deviation from 128 center)
            let timeDomainMax = 0;
            let timeDomainMin = 255;
            for (let i = 0; i < bufferLength; i++) {
                timeDomainMax = Math.max(timeDomainMax, timeDomainArray[i]);
                timeDomainMin = Math.min(timeDomainMin, timeDomainArray[i]);
            }
            const timeDomainAmplitude = timeDomainMax - timeDomainMin;

            // Calculate amplitude CHANGE (spike detection for real music)
            // This detects transients even in continuous audio
            const amplitudeChange = timeDomainAmplitude - prevTimeDomainAmplitude;
            prevTimeDomainAmplitude = timeDomainAmplitude;

            // Spectral flux: positive change in energy (onset detection)
            // Use ONLY bass energy for music - bass notes typically fall on beats
            // while higher frequency notes are often subdivisions/arpeggios
            // 100% bass weighting filters out melodic fingerpicking patterns
            const flux = Math.max(0, lowFreqEnergy - prevEnergy);
            prevEnergy = lowFreqEnergy; // Track bass energy for next frame

            // Track flux history for adaptive threshold
            fluxHistory.push(flux);
            if (fluxHistory.length > fluxHistorySize) {
                fluxHistory.shift();
            }

            // Calculate adaptive threshold based on recent flux
            // With fftSize=2048, we have more frequency bins, so flux values are smaller per-bin
            // Lower multiplier (1.1) and minimum (2) to catch quieter onsets
            const avgFlux = fluxHistory.reduce((a, b) => a + b, 0) / fluxHistory.length;
            const threshold = avgFlux * 1.1 + 2;

            const now = performance.now();
            const timeSinceLastPeak = now - lastPeakTime;

            // Detect onset using spectral flux (energy change) - works for all audio
            const fluxOnset = flux > threshold;

            // Time-domain onset detection:
            // For DISCRETE sounds (clicks/silence): absolute amplitude works
            // For CONTINUOUS audio (music): need amplitude SPIKE detection
            // Use amplitude change > 30 as spike threshold for real music
            // But also allow absolute amplitude > 40 for discrete clicks (when coming from silence)
            const isDiscreteClick = timeDomainAmplitude > 40 && prevTimeDomainAmplitude < 10; // Coming from silence
            const isAmplitudeSpike = amplitudeChange > 30; // Sudden increase in continuous audio
            const timeDomainOnset = (isDiscreteClick || isAmplitudeSpike) && totalEnergy > 1;

            // Minimum gap between peaks:
            // - 350ms allows up to 171 BPM (covers most music including fast EDM)
            // - Music above 171 BPM will detect at half tempo (e.g., 180 BPM → 90 BPM)
            // - Fingerpicking halving is handled via half-BPM vote ratio in AgentBPMDetector
            // - 280ms was too aggressive - caused noisy intervals that broke pattern detection
            const isOnset = (fluxOnset || timeDomainOnset) && timeSinceLastPeak > 350;

            if (isOnset) {
                // Feed peak to the agent detector
                // Use higher strength if time-domain detected (sharp transient)
                const peakStrength = timeDomainOnset
                    ? Math.min(1, timeDomainAmplitude / 100)
                    : Math.min(1, flux / 50);

                this._bpmDetector.processPeak(peakStrength, now);

                // Get detection status
                const status = this._bpmDetector.getStatus();

                // Update detected BPM
                if (status.bpm > 0) {
                    this._detectedBPM = status.bpm;
                    this._bpmConfidence = status.confidence;
                    this._bpmLocked = status.locked;

                    // Only update rhythm engine when we have confidence
                    if (status.locked) {
                        this.options.onBPMChange?.(status.bpm);
                    }

                    // Pass grooveConfidence to rhythm adapter for animation amplitude scaling
                    // This creates the "tentative → locked" animation behavior
                    if (status.grooveConfidence !== undefined) {
                        this.options.onGrooveConfidenceChange?.(status.grooveConfidence);
                    }
                }

                lastPeakTime = now;
            }
        }, 10); // Check every 10ms - needed to catch short transients like clicks
    }

    /**
     * Stop BPM detection
     * @private
     */
    _stopBPMDetection() {
        if (this._bpmDetectionInterval) {
            clearInterval(this._bpmDetectionInterval);
            this._bpmDetectionInterval = null;
        }
        // Reset detection state but keep detector for reuse
        this._bpmLocked = false;
        this._bpmConfidence = 0;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PRIVATE: BUFFER ANALYSIS (CORS BYPASS)
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Tear down and rebuild the buffer analysis pipeline
     * @private
     */
    _rebuildBufferAnalysis() {
        // Stop and disconnect everything
        this._stopBufferAnalysis();

        // Also disconnect the gain node completely
        if (this._analysisGainNode) {
            try {
                this._analysisGainNode.disconnect();
            } catch {
                // Already disconnected, ignore
            }
            this._analysisGainNode = null;
        }

        // Force recreation of all nodes
        this._bufferAnalyzerNode = null;

        // Restart buffer analysis from current playback position
        if (this._decodedAudioBuffer && this._audioElement) {
            this._startBufferAnalysis(this._audioElement.currentTime);
        }
    }

    /**
     * Start a buffer source node for FFT analysis (bypasses CORS tainted audio)
     * @private
     */
    _startBufferAnalysis(startTime = 0) {
        if (!this._decodedAudioBuffer || !this._audioContext) return;

        // Create a SEPARATE analyzer node for buffer analysis
        // This is necessary because the MediaElementSource taints the main analyzer
        // and getByteFrequencyData() returns zeros for tainted analyzers
        const needsRestart = !this._bufferAnalyzerNode;
        if (!this._bufferAnalyzerNode) {
            this._bufferAnalyzerNode = this._audioContext.createAnalyser();
            // Large FFT to capture more audio per frame (2048 samples = ~46ms at 44.1kHz)
            // This ensures short transients fall within the analysis window
            this._bufferAnalyzerNode.fftSize = 2048;
            // Minimal smoothing - we want to see transients immediately, not averaged out
            // 0.3 was too high for short clicks - they were being smoothed away
            this._bufferAnalyzerNode.smoothingTimeConstant = 0.1;
        }

        // Create a new buffer source (they're one-shot, can't be restarted)
        this._analysisSourceNode = this._audioContext.createBufferSource();
        this._analysisSourceNode.buffer = this._decodedAudioBuffer;

        // Create gain node FIRST (before connecting anything)
        // This ensures the full graph exists before source starts
        if (!this._analysisGainNode) {
            this._analysisGainNode = this._audioContext.createGain();
            // CRITICAL: gain=0 causes Chrome to optimize away the audio path entirely!
            // Use a tiny non-zero value that's effectively inaudible (-60dB = 0.001)
            this._analysisGainNode.gain.value = 0.001;
            this._analysisGainNode.connect(this._audioContext.destination);
        }

        // Connect the FULL chain BEFORE starting the source
        // source -> analyzer -> gain -> destination
        // All connections must exist before start() or Chrome may not process audio
        this._analysisSourceNode.connect(this._bufferAnalyzerNode);
        this._bufferAnalyzerNode.connect(this._analysisGainNode);

        // Now start playback from the current position
        this._analysisSourceNode.start(0, startTime);
        this._analysisStartTime = this._audioContext.currentTime - startTime;

        // Restart BPM detection AFTER source is connected and started
        // This ensures the analyzer has audio data when the interval polls it
        if (needsRestart && this._bpmDetectionInterval) {
            this._stopBPMDetection();
            this._startBPMDetection();
        }
    }

    /**
     * Stop the buffer analysis source
     * @private
     */
    _stopBufferAnalysis() {
        if (this._analysisSourceNode) {
            try {
                this._analysisSourceNode.stop();
                this._analysisSourceNode.disconnect();
            } catch {
                // Already stopped
            }
            this._analysisSourceNode = null;
        }

        // Disconnect buffer analyzer to prevent old analyzers staying connected
        // when track switches (multiple analyzers feeding into gain node = bad data)
        if (this._bufferAnalyzerNode) {
            try {
                this._bufferAnalyzerNode.disconnect();
            } catch {
                // Already disconnected
            }
            // Null it out to force recreation on next track
            // This ensures completely fresh analyzer state
            this._bufferAnalyzerNode = null;
        }

        // Also disconnect the gain node to break all old connections
        if (this._analysisGainNode) {
            try {
                this._analysisGainNode.disconnect();
                // Reconnect to destination (it's the final node in chain)
                this._analysisGainNode.connect(this._audioContext.destination);
            } catch {
                // Ignore
            }
        }
    }

    /**
     * Destroy the audio bridge and clean up all resources
     */
    destroy() {
        this.disconnectAudio();

        // Close audio context
        if (this._audioContext) {
            try {
                this._audioContext.close();
            } catch {
                // Ignore
            }
            this._audioContext = null;
        }

        this._analyzerNode = null;
        this._analyzerConnected = false;
    }
}

export default AudioBridge;
