/**
 * Timeline — Beat-aligned sequence playback with sections and loops.
 *
 * @module core/timeline/Timeline
 */

import { TimelineSection } from './TimelineSection.js';

export class Timeline {
    /**
     * @param {Object} mascot - EmotiveMascotPublic or engine instance
     * @param {Object} [rhythmEngine] - Optional rhythm engine for beat-aligned scheduling
     */
    constructor(mascot, rhythmEngine = null) {
        this._mascot = mascot;
        this._rhythm = rhythmEngine;
        this._events = [];
        this._sections = new Map();
        this._isPlaying = false;
        this._startTime = 0;
        this._pauseOffset = 0;
        this._timers = [];
        this._loopState = null;
        this._onBeatCallbacks = [];
        this._onSectionCallbacks = [];
        this._rafId = null;
    }

    /**
     * Add an event at absolute time (ms).
     * @param {number} timeMs
     * @param {string} action - 'emotion'|'gesture'|'morph'|'audioLayer'|'nudge'|'callback'
     * @param {*} value
     * @param {Object} [options]
     * @returns {Timeline} this
     */
    at(timeMs, action, value, options = null) {
        this._events.push({ time: timeMs, beat: null, bar: null, action, value, options });
        return this;
    }

    /**
     * Add an event at a specific beat.
     * @param {number} beat
     * @param {string} action
     * @param {*} value
     * @param {Object} [options]
     * @returns {Timeline} this
     */
    atBeat(beat, action, value, options = null) {
        const time = this._beatsToMs(beat);
        this._events.push({ time, beat, bar: null, action, value, options });
        return this;
    }

    /**
     * Add an event at a specific bar.
     * @param {number} bar
     * @param {string} action
     * @param {*} value
     * @param {Object} [options]
     * @returns {Timeline} this
     */
    atBar(bar, action, value, options = null) {
        const time = this._beatsToMs(bar * 4); // Assuming 4/4
        this._events.push({ time, beat: bar * 4, bar, action, value, options });
        return this;
    }

    /**
     * Define a named section.
     * @param {string} name
     * @param {number} startBeat
     * @param {number} endBeat
     * @returns {Timeline} this
     */
    section(name, startBeat, endBeat) {
        this._sections.set(name, new TimelineSection(name, startBeat, endBeat));
        return this;
    }

    /**
     * Play from beginning or a time offset.
     * @param {number} [fromMs=0]
     */
    play(fromMs = 0) {
        this.stop();
        this._isPlaying = true;
        this._pauseOffset = fromMs;
        this._startTime = performance.now() - fromMs;
        this._scheduleEvents(fromMs);
        this._startBeatLoop();
    }

    /**
     * Play a specific section.
     * @param {string} sectionName
     */
    playSection(sectionName) {
        const section = this._sections.get(sectionName);
        if (!section) return;
        this._fireSectionCallbacks(sectionName, 'enter');
        const startMs = this._beatsToMs(section.startBeat);
        const endMs = this._beatsToMs(section.endBeat);
        this.play(startMs);
        // Schedule stop at section end
        const dur = endMs - startMs;
        this._timers.push(
            setTimeout(() => {
                this._fireSectionCallbacks(sectionName, 'exit');
                if (!this._loopState) this.stop();
            }, dur)
        );
    }

    /**
     * Loop a section N times.
     * @param {string} sectionName
     * @param {number} [times=1]
     */
    loop(sectionName, times = 1) {
        const section = this._sections.get(sectionName);
        if (!section) return;
        this._loopState = { section: sectionName, remaining: times };
        this._playLoopIteration();
    }

    /** @private */
    _playLoopIteration() {
        if (!this._loopState || this._loopState.remaining <= 0) {
            this._loopState = null;
            return;
        }
        this._loopState.remaining--;
        const section = this._sections.get(this._loopState.section);
        const startMs = this._beatsToMs(section.startBeat);
        const endMs = this._beatsToMs(section.endBeat);
        const dur = endMs - startMs;

        this.stop();
        this._isPlaying = true;
        this._startTime = performance.now() - startMs;
        this._scheduleEvents(startMs, endMs);
        this._startBeatLoop();

        this._timers.push(
            setTimeout(() => {
                this._playLoopIteration();
            }, dur)
        );
    }

    /**
     * Pause playback.
     */
    pause() {
        if (!this._isPlaying) return;
        this._pauseOffset = performance.now() - this._startTime;
        this._clearTimers();
        this._isPlaying = false;
    }

    /**
     * Resume from paused position.
     */
    resume() {
        if (this._isPlaying) return;
        this.play(this._pauseOffset);
    }

    /**
     * Stop playback and reset.
     */
    stop() {
        this._clearTimers();
        this._isPlaying = false;
        this._loopState = null;
        if (this._rafId) {
            cancelAnimationFrame(this._rafId);
            this._rafId = null;
        }
    }

    /**
     * Register a callback that fires every N beats.
     * @param {number} everyNBeats
     * @param {Function} callback
     * @returns {Function} Unsubscribe
     */
    onBeat(everyNBeats, callback) {
        const entry = { every: everyNBeats, callback, lastBeat: -1 };
        this._onBeatCallbacks.push(entry);
        return () => {
            this._onBeatCallbacks = this._onBeatCallbacks.filter(e => e !== entry);
        };
    }

    /**
     * Register a section enter/exit callback.
     * @param {string} sectionName
     * @param {'enter'|'exit'} event
     * @param {Function} callback
     * @returns {Function} Unsubscribe
     */
    onSection(sectionName, event, callback) {
        const entry = { section: sectionName, event, callback };
        this._onSectionCallbacks.push(entry);
        return () => {
            this._onSectionCallbacks = this._onSectionCallbacks.filter(e => e !== entry);
        };
    }

    /**
     * Load events from a TimelineRecorder recording.
     * @param {Array} recorded - Array of { type, name, time, ... }
     */
    loadFromRecording(recorded) {
        this._events = [];
        for (const event of recorded) {
            const action = event.type === 'shape' ? 'morph' : event.type;
            this.at(event.time, action, event.name, event.config || null);
        }
    }

    /**
     * Get elapsed time in ms since playback started.
     * @returns {number}
     */
    getElapsed() {
        if (!this._isPlaying) return this._pauseOffset;
        return performance.now() - this._startTime;
    }

    /**
     * Get current beat number.
     * @returns {number}
     */
    getCurrentBeat() {
        return this.getElapsed() / this._getBeatDurationMs();
    }

    /** @private */
    _scheduleEvents(fromMs, untilMs = Infinity) {
        const sorted = [...this._events].sort((a, b) => a.time - b.time);
        for (const event of sorted) {
            if (event.time < fromMs || event.time >= untilMs) continue;
            const delay = event.time - fromMs;
            this._timers.push(
                setTimeout(
                    () => {
                        if (this._isPlaying) this._executeEvent(event);
                    },
                    Math.max(0, delay)
                )
            );
        }
    }

    /** @private */
    _executeEvent(event) {
        switch (event.action) {
            case 'emotion':
                if (this._mascot.setEmotion) {
                    this._mascot.setEmotion(event.value, event.options || undefined);
                }
                break;
            case 'gesture':
                if (this._mascot.express) this._mascot.express(event.value);
                else if (this._mascot.triggerGesture) this._mascot.triggerGesture(event.value);
                break;
            case 'morph':
                if (this._mascot.morphTo)
                    this._mascot.morphTo(event.value, event.options || undefined);
                break;
            case 'audioLayer':
                // event.value is a mix object like { combat: 1.0 }
                // Consumer must wire this to AudioLayerManager
                break;
            case 'nudge':
                if (this._mascot.nudgeEmotion && event.value) {
                    this._mascot.nudgeEmotion(event.value.emotion, event.value.delta);
                }
                break;
            case 'callback':
                if (typeof event.value === 'function') event.value();
                break;
        }
    }

    /** @private */
    _startBeatLoop() {
        const beatDur = this._getBeatDurationMs();
        const tick = () => {
            if (!this._isPlaying) return;
            const elapsed = this.getElapsed();
            const currentBeat = Math.floor(elapsed / beatDur);
            for (const entry of this._onBeatCallbacks) {
                if (currentBeat > entry.lastBeat && currentBeat % entry.every === 0) {
                    entry.lastBeat = currentBeat;
                    entry.callback(currentBeat);
                }
            }
            this._rafId = requestAnimationFrame(tick);
        };
        this._rafId = requestAnimationFrame(tick);
    }

    /** @private */
    _fireSectionCallbacks(sectionName, event) {
        for (const entry of this._onSectionCallbacks) {
            if (entry.section === sectionName && entry.event === event) {
                entry.callback();
            }
        }
    }

    /** @private */
    _clearTimers() {
        for (const t of this._timers) clearTimeout(t);
        this._timers = [];
    }

    /** @private */
    _beatsToMs(beats) {
        return beats * this._getBeatDurationMs();
    }

    /** @private */
    _getBeatDurationMs() {
        if (this._rhythm) {
            const adapter = this._rhythm.getAdapter?.();
            if (adapter) {
                const info = adapter.getTimeInfo();
                if (info?.beatDuration) return info.beatDuration;
            }
        }
        return 500; // Default 120 BPM
    }

    destroy() {
        this.stop();
        this._events = [];
        this._sections.clear();
        this._onBeatCallbacks = [];
        this._onSectionCallbacks = [];
    }
}
