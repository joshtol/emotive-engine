/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝
 *               ◐ ◑ ◒ ◓  TIMELINE RECORDER  ◓ ◒ ◑ ◐
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview TimelineRecorder - Animation Recording, Playback, and Export
 * @author Emotive Engine Team
 * @version 1.0.0
 * @module TimelineRecorder
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Manages timeline recording, playback, import/export, and seeking functionality.
 * ║ Records gestures, emotions, and shape changes with timestamps, enabling playback
 * ║ and export of animation sequences with audio synchronization.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🎬 RESPONSIBILITIES
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Start/stop timeline recording
 * │ • Play recorded timelines with event scheduling
 * │ • Export timelines to JSON with audio duration
 * │ • Import timelines from JSON
 * │ • Seek to specific timestamps
 * │ • Get current playback time
 * │ • Load/retrieve timeline data
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */

export class TimelineRecorder {
    /**
     * Create TimelineRecorder
     * @param {Function} getEngine - Function that returns the real engine instance
     * @param {Object} audioManager - AudioManager instance for duration tracking
     * @param {Object} state - State object {timeline, isRecording, recordingStartTime, isPlaying, playbackStartTime}
     */
    constructor(getEngine, audioManager, state) {
        this._getEngine = getEngine;
        this._audioManager = audioManager;
        this._state = state;
    }

    /**
     * Start recording animation sequence
     *
     * @example
     * timelineRecorder.startRecording();
     * // ... perform gestures, emotions, shapes ...
     * const timeline = timelineRecorder.stopRecording();
     */
    startRecording() {
        this._state.timeline.length = 0; // Clear array in place
        this._state.isRecording = true;
        this._state.recordingStartTime = Date.now();
    }

    /**
     * Stop recording
     * @returns {Array} Recorded timeline
     *
     * @example
     * const timeline = timelineRecorder.stopRecording();
     * console.log(`Recorded ${timeline.length} events`);
     */
    stopRecording() {
        this._state.isRecording = false;
        return [...this._state.timeline];
    }

    /**
     * Play recorded timeline
     * @param {Array} timeline - Timeline to play
     *
     * @example
     * // Play recorded timeline
     * timelineRecorder.playTimeline(recordedTimeline);
     *
     * @example
     * // Play imported timeline
     * const json = timelineRecorder.exportTimeline();
     * // ... later ...
     * timelineRecorder.importTimeline(json);
     * timelineRecorder.playTimeline(timelineRecorder.getTimeline());
     */
    playTimeline(timeline) {
        if (!timeline || !timeline.length) {
            this._state.isPlaying = false;
            return;
        }

        this._state.isPlaying = true;
        this._state.playbackStartTime = Date.now();

        // Schedule all events
        timeline.forEach(event => {
            setTimeout(() => {
                if (!this._state.isPlaying) return;

                const engine = this._getEngine();
                if (!engine) return;

                switch (event.type) {
                case 'gesture':
                    engine.express(event.name);
                    break;
                case 'emotion':
                    engine.setEmotion(event.name);
                    break;
                case 'shape':
                    engine.morphTo(event.name);
                    break;
                }
            }, event.time);
        });

        // Stop playback after last event
        const lastEventTime = Math.max(...timeline.map(e => e.time));
        setTimeout(() => {
            this._state.isPlaying = false;
        }, lastEventTime);
    }

    /**
     * Stop timeline playback
     *
     * @example
     * timelineRecorder.stopPlayback();
     */
    stopPlayback() {
        this._state.isPlaying = false;
    }

    /**
     * Get current timeline
     * @returns {Array} Current timeline (copy)
     *
     * @example
     * const timeline = timelineRecorder.getTimeline();
     * console.log('Events:', timeline.length);
     */
    getTimeline() {
        return [...this._state.timeline];
    }

    /**
     * Load timeline
     * @param {Array} timeline - Timeline to load
     *
     * @example
     * timelineRecorder.loadTimeline([
     *   { type: 'gesture', name: 'bounce', time: 0 },
     *   { type: 'emotion', name: 'excited', time: 500 }
     * ]);
     */
    loadTimeline(timeline) {
        this._state.timeline.length = 0; // Clear array
        this._state.timeline.push(...timeline); // Add new events
    }

    /**
     * Export timeline as JSON
     * @returns {string} JSON string with version, duration, and events
     *
     * @example
     * const json = timelineRecorder.exportTimeline();
     * localStorage.setItem('myAnimation', json);
     */
    exportTimeline() {
        return JSON.stringify({
            version: '1.0',
            duration: this._audioManager.getAudioDuration() || 0,
            events: this._state.timeline
        });
    }

    /**
     * Import timeline from JSON
     * @param {string} json - JSON string
     *
     * @example
     * const json = localStorage.getItem('myAnimation');
     * timelineRecorder.importTimeline(json);
     */
    importTimeline(json) {
        const data = JSON.parse(json);
        this._state.timeline.length = 0;
        this._state.timeline.push(...(data.events || []));
        this._audioManager.setAudioDuration(data.duration || 0);
    }

    /**
     * Get current playback time
     * @returns {number} Current time in milliseconds
     *
     * @example
     * const currentTime = timelineRecorder.getCurrentTime();
     * console.log(`Playback at ${currentTime}ms`);
     */
    getCurrentTime() {
        if (this._state.isPlaying) {
            return Date.now() - this._state.playbackStartTime;
        }
        return 0;
    }

    /**
     * Seek to specific time
     * @param {number} time - Time in milliseconds
     *
     * @example
     * // Jump to 5 seconds into the animation
     * timelineRecorder.seek(5000);
     */
    seek(time) {
        // Find all events up to this time and apply them
        const eventsToApply = this._state.timeline.filter(e => e.time <= time);

        // Apply the last event of each type
        const lastEvents = {};
        eventsToApply.forEach(event => {
            lastEvents[event.type] = event;
        });

        // Apply states
        const engine = this._getEngine();
        if (engine) {
            if (lastEvents.emotion) {
                engine.setEmotion(lastEvents.emotion.name);
            }
            if (lastEvents.shape) {
                engine.morphTo(lastEvents.shape.name);
            }
        }
    }

    /**
     * Export animation data including current state
     * @returns {Object} Animation state with timeline, duration, current time, emotion, shape
     *
     * @example
     * const data = timelineRecorder.getAnimationData();
     * console.log('Current emotion:', data.emotion);
     * console.log('Current shape:', data.shape);
     * console.log('Timeline events:', data.timeline.length);
     */
    getAnimationData() {
        const engine = this._getEngine();
        return {
            timeline: [...this._state.timeline],
            duration: this._audioManager.getAudioDuration() || 0,
            currentTime: this.getCurrentTime(),
            emotion: engine?.state?.emotion || 'neutral',
            shape: engine?.state?.currentShape || 'circle'
        };
    }
}
