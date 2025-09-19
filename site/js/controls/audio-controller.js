/*!
 * Emotive Engine™ - Proprietary and Confidential
 * Copyright (c) 2025 Emotive Engine. All Rights Reserved.
 *
 * NOTICE: This code is proprietary and confidential. Unauthorized copying,
 * modification, or distribution is strictly prohibited and may result in
 * legal action. This software is licensed, not sold.
 *
 * Website: https://emotiveengine.com
 * License: https://emotive-engine.web.app/LICENSE.md
 */
/**
 * AudioController - Manages audio playback and controls
 * Handles audio file loading, demo tracks, and visualization
 */
class AudioController {
    constructor(options = {}) {
        // Configuration
        this.config = {
            // Element IDs
            audioPlayerId: options.audioPlayerId || 'audio-player',
            audioFileId: options.audioFileId || 'audio-file',
            loadAudioButtonId: options.loadAudioButtonId || 'load-audio-btn',
            loadSongButtonId: options.loadSongButtonId || 'load-song-btn',
            audioPlayerContainerId: options.audioPlayerContainerId || 'audio-player-container',
            audioVizSectionId: options.audioVizSectionId || 'audio-viz-section',

            // Default demo track
            demoTrackPath: options.demoTrackPath || '../assets/Electric Glow (Remix).wav',
            demoTrackName: options.demoTrackName || 'Electric Glow (Remix)',

            // Display settings
            autoShowPlayer: options.autoShowPlayer !== false,
            autoShowVisualizer: options.autoShowVisualizer !== false,
            hideVisualizerOnMobilePortrait: options.hideVisualizerOnMobilePortrait !== false,

            // Mobile detection thresholds
            mobileWidthThreshold: options.mobileWidthThreshold || 768,

            ...options
        };

        // State
        this.state = {
            isPlaying: false,
            currentTrack: null,
            audioConnected: false
        };

        // References
        this.mascot = null;
        this.app = null;
        this.audioPlayer = null;
        this.audioFile = null;
        this.playerContainer = null;
        this.vizSection = null;

        // Callbacks
        this.onPlay = options.onPlay || null;
        this.onPause = options.onPause || null;
        this.onEnded = options.onEnded || null;
        this.onFileLoaded = options.onFileLoaded || null;
    }

    /**
     * Initialize the controller
     */
    init(app = null, mascot = null) {
        this.app = app || window.app;
        this.mascot = mascot || window.mascot;

        // Get DOM elements
        this.audioPlayer = document.getElementById(this.config.audioPlayerId);
        this.audioFile = document.getElementById(this.config.audioFileId);
        this.playerContainer = document.getElementById(this.config.audioPlayerContainerId);
        this.vizSection = document.getElementById(this.config.audioVizSectionId);

        if (!this.audioPlayer) {
            console.warn('AudioController: Audio player element not found');
            return this;
        }

        // Set up event listeners
        this.setupEventListeners();

        return this;
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Audio player events
        if (this.audioPlayer) {
            this.audioPlayer.addEventListener('play', () => this.handlePlay());
            this.audioPlayer.addEventListener('pause', () => this.handlePause());
            this.audioPlayer.addEventListener('ended', () => this.handleEnded());
        }

        // File input change
        if (this.audioFile) {
            this.audioFile.addEventListener('change', (e) => this.handleFileSelect(e));
        }

        // Load demo track button
        const loadAudioBtn = document.getElementById(this.config.loadAudioButtonId);
        if (loadAudioBtn) {
            loadAudioBtn.addEventListener('click', () => this.loadDemoTrack());
        }

        // Load song button (opens file dialog)
        const loadSongBtn = document.getElementById(this.config.loadSongButtonId);
        if (loadSongBtn) {
            loadSongBtn.addEventListener('click', () => this.openFileDialog());
        }
    }

    /**
     * Handle play event
     */
    async handlePlay() {
        this.state.isPlaying = true;

        if (this.mascot) {
            // Reset music detection when audio starts playing
            if (this.mascot.shapeMorpher) {
                this.mascot.shapeMorpher.resetMusicDetection();
                // Clear the manual stop flag so rhythm can auto-start
                window.rhythmManuallyStoppedForCurrentAudio = false;
            }

            // Resume audio context if suspended
            if (this.mascot.audioAnalyzer?.audioContext) {
                await this.mascot.audioAnalyzer.resume();
            }

            // Connect audio to mascot
            this.mascot.connectAudio(this.audioPlayer);
            this.state.audioConnected = true;
        }

        // Start audio visualization
        if (window.startAudioViz) {
            window.startAudioViz();
        }

        // Start rhythm sync visualizer
        if (window.rhythmSyncVisualizer && !window.rhythmSyncVisualizer.state.active) {
            window.rhythmSyncVisualizer.start();
        }

        // Start ambient groove animation
        if (this.mascot?.renderer) {
            this.mascot.renderer.startGrooveBob({ intensity: 0.5, frequency: 1.0 });
        }

        // Trigger callback
        if (this.onPlay) {
            this.onPlay();
        }
    }

    /**
     * Handle pause event
     */
    handlePause() {
        this.state.isPlaying = false;

        // Stop audio visualization
        if (window.stopAudioViz) {
            window.stopAudioViz();
        }

        // Stop rhythm sync visualizer
        if (window.rhythmSyncVisualizer && window.rhythmSyncVisualizer.state.active) {
            window.rhythmSyncVisualizer.stop();
        }

        // Stop ambient groove animation
        if (this.mascot?.renderer?.ambientDanceAnimator) {
            this.mascot.renderer.ambientDanceAnimator.stopAmbientAnimation('grooveBob');
        }

        // Trigger callback
        if (this.onPause) {
            this.onPause();
        }
    }

    /**
     * Handle ended event
     */
    handleEnded() {
        this.state.isPlaying = false;

        if (this.mascot) {
            this.mascot.disconnectAudio();
            this.state.audioConnected = false;
        }

        // Stop audio visualization
        if (window.stopAudioViz) {
            window.stopAudioViz();
        }

        // Stop rhythm sync visualizer
        if (window.rhythmSyncVisualizer && window.rhythmSyncVisualizer.state.active) {
            window.rhythmSyncVisualizer.stop();
        }

        // Hide visualizer on mobile portrait
        if (this.config.hideVisualizerOnMobilePortrait && this.isMobilePortrait()) {
            this.hideVisualizer();
        }

        // Trigger callback
        if (this.onEnded) {
            this.onEnded();
        }
    }

    /**
     * Handle file selection
     */
    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        const url = URL.createObjectURL(file);
        this.loadAudioUrl(url, file.name);

        // Trigger callback
        if (this.onFileLoaded) {
            this.onFileLoaded(file);
        }
    }

    /**
     * Load demo track
     */
    loadDemoTrack() {
        this.loadAudioUrl(this.config.demoTrackPath, this.config.demoTrackName);

        // Auto-play the demo track
        if (this.audioPlayer) {
            this.audioPlayer.play();
        }
    }

    /**
     * Load audio from URL
     */
    loadAudioUrl(url, trackName = 'Unknown') {
        if (!this.audioPlayer) return;

        this.audioPlayer.src = url;
        this.state.currentTrack = trackName;

        // Show player and visualizer if configured
        if (this.config.autoShowPlayer) {
            this.showPlayer();
        }

        if (this.config.autoShowVisualizer) {
            this.showVisualizer();
        }
    }

    /**
     * Open file dialog
     */
    openFileDialog() {
        if (this.audioFile) {
            this.audioFile.click();
        }
    }

    /**
     * Show audio player
     */
    showPlayer() {
        if (this.playerContainer) {
            this.playerContainer.style.display = 'block';
        }
    }

    /**
     * Hide audio player
     */
    hidePlayer() {
        if (this.playerContainer) {
            this.playerContainer.style.display = 'none';
        }
    }

    /**
     * Show visualizer
     */
    showVisualizer() {
        if (this.vizSection) {
            this.vizSection.style.display = 'block';
        }
    }

    /**
     * Hide visualizer
     */
    hideVisualizer() {
        if (this.vizSection) {
            this.vizSection.style.display = 'none';
        }
    }

    /**
     * Check if device is mobile portrait
     */
    isMobilePortrait() {
        return window.innerWidth <= this.config.mobileWidthThreshold &&
               window.innerHeight > window.innerWidth;
    }

    /**
     * Play audio
     */
    play() {
        if (this.audioPlayer && this.audioPlayer.src) {
            this.audioPlayer.play();
        }
    }

    /**
     * Pause audio
     */
    pause() {
        if (this.audioPlayer) {
            this.audioPlayer.pause();
        }
    }

    /**
     * Stop audio
     */
    stop() {
        if (this.audioPlayer) {
            this.audioPlayer.pause();
            this.audioPlayer.currentTime = 0;
        }
    }

    /**
     * Get current state
     */
    getState() {
        return { ...this.state };
    }

    /**
     * Set mascot reference
     */
    setMascot(mascot) {
        this.mascot = mascot;
    }

    /**
     * Update configuration
     */
    updateConfig(config) {
        this.config = { ...this.config, ...config };
    }

    /**
     * Clean up
     */
    destroy() {
        this.stop();
        if (this.state.audioConnected && this.mascot) {
            this.mascot.disconnectAudio();
        }
    }
}

// Export class for ES6 modules
export { AudioController };

// LEGAL WARNING: This code is protected by copyright law and international treaties.
// Unauthorized reproduction or distribution of this code, or any portion of it,
// may result in severe civil and criminal penalties, and will be prosecuted
// to the maximum extent possible under the law.