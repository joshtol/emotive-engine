/**
 * RhythmInputEvaluator — Grades user tap timing against rhythm beats.
 *
 * @module core/audio/RhythmInputEvaluator
 */

export class RhythmInputEvaluator {
    /**
     * @param {Object} rhythmAdapter - rhythmEngine.getAdapter()
     * @param {Object} [config]
     * @param {Object} [config.windows] - Timing windows in ms
     * @param {Function} [config.emotionSource] - () => { windowMultiplier }
     */
    constructor(rhythmAdapter, config = {}) {
        this._adapter = rhythmAdapter;
        this._windows = {
            perfect: config.windows?.perfect ?? 30,
            great:   config.windows?.great   ?? 60,
            good:    config.windows?.good    ?? 100,
        };
        this._grades = {
            perfect: { multiplier: 2.0, label: 'Perfect' },
            great:   { multiplier: 1.5, label: 'Great' },
            good:    { multiplier: 1.0, label: 'Good' },
            miss:    { multiplier: 0.0, label: 'Miss' },
        };
        this._windowModifiers = { multiplier: 1.0 };
        this._emotionSource = config.emotionSource ?? null;
        this._history = [];
        this._maxHistory = 100;
        this._onEvaluate = [];

        // Emotion feedback loop (UP-RESONANCE-2 Feature 2)
        this._emotionFeedback = null;  // { perfect: {emotion, delta}, great: ..., good: ..., miss: ... }
        this._emotionTarget = null;    // (emotion, delta) => void
    }

    /**
     * Evaluate a tap against the nearest beat.
     * @param {number} [tapTimestamp=performance.now()] - Absolute page time
     * @returns {Object} { grade, offset, absOffset, multiplier, label, timestamp, targetTime }
     */
    evaluate(tapTimestamp = performance.now()) {
        const timeInfo = this._adapter.getTimeInfo();
        const {beatDuration} = timeInfo;

        // Convert absolute page time → rhythm-relative time
        const rhythmStartAbsolute = performance.now() - timeInfo.elapsed;
        const tapRelative = tapTimestamp - rhythmStartAbsolute;

        // Find nearest beat
        const currentBeatStart = tapRelative - (tapRelative % beatDuration);
        const nextBeatStart = currentBeatStart + beatDuration;
        const nearestBeat = (tapRelative - currentBeatStart) < (nextBeatStart - tapRelative)
            ? currentBeatStart : nextBeatStart;

        const offset = tapRelative - nearestBeat;
        return this._gradeOffset(offset, tapTimestamp, nearestBeat + rhythmStartAbsolute);
    }

    /**
     * Evaluate a tap against a specific target time (same time-base).
     * @param {number} tapTime
     * @param {number} targetTime
     * @returns {Object} Evaluation result
     */
    evaluateAgainst(tapTime, targetTime) {
        return this._gradeOffset(tapTime - targetTime, tapTime, targetTime);
    }

    /**
     * Evaluate a sequence of taps against a sequence of targets.
     * @param {number[]} tapTimes
     * @param {number[]} targetTimes
     * @returns {Object[]} Array of evaluation results
     */
    evaluateSequence(tapTimes, targetTimes) {
        const results = [];
        const used = new Set();

        for (const tap of tapTimes) {
            let bestIdx = -1;
            let bestDist = Infinity;
            for (let i = 0; i < targetTimes.length; i++) {
                if (used.has(i)) continue;
                const dist = Math.abs(tap - targetTimes[i]);
                if (dist < bestDist) {
                    bestDist = dist;
                    bestIdx = i;
                }
            }
            if (bestIdx >= 0) {
                used.add(bestIdx);
                results.push(this.evaluateAgainst(tap, targetTimes[bestIdx]));
            } else {
                results.push({ grade: 'miss', offset: 0, absOffset: 0, multiplier: 0, label: 'Miss', timestamp: tap, targetTime: null });
            }
        }
        return results;
    }

    /**
     * @private
     */
    _gradeOffset(offset, tapTime, targetTime) {
        const absOffset = Math.abs(offset);
        const emotionMod = this._emotionSource?.() ?? { windowMultiplier: 1.0 };
        const mod = this._windowModifiers.multiplier * (emotionMod.windowMultiplier || 1.0);

        let grade;
        if (absOffset <= this._windows.perfect * mod) grade = 'perfect';
        else if (absOffset <= this._windows.great * mod) grade = 'great';
        else if (absOffset <= this._windows.good * mod) grade = 'good';
        else grade = 'miss';

        const result = {
            grade,
            offset,
            absOffset,
            multiplier: this._grades[grade].multiplier,
            label: this._grades[grade].label,
            timestamp: tapTime,
            targetTime,
        };

        this._history.push(result);
        if (this._history.length > this._maxHistory) this._history.shift();
        for (const cb of this._onEvaluate) cb(result);

        // Emotion feedback loop — nudge emotion based on grade
        if (this._emotionFeedback && this._emotionTarget) {
            const fb = this._emotionFeedback[grade];
            if (fb) this._emotionTarget(fb.emotion, fb.delta);
        }

        return result;
    }

    /**
     * Set external window modifier (stacks with emotion source).
     * @param {number} multiplier - 0.3–3.0
     */
    setWindowModifier(multiplier) {
        this._windowModifiers.multiplier = Math.max(0.3, Math.min(3.0, multiplier));
    }

    /**
     * Set emotion source callback for rhythm modulation (Feature 7).
     * @param {Function} fn - () => { windowMultiplier, visualNoise, inputDelay, tempoShift }
     */
    setEmotionSource(fn) {
        this._emotionSource = fn;
    }

    /**
     * Get accuracy statistics from history.
     * @returns {Object} { perfect, great, good, miss, averageOffset, total }
     */
    getAccuracy() {
        if (!this._history.length) return { perfect: 0, great: 0, good: 0, miss: 0, averageOffset: 0, total: 0 };
        const counts = { perfect: 0, great: 0, good: 0, miss: 0 };
        let totalOffset = 0;
        for (const r of this._history) {
            counts[r.grade]++;
            totalOffset += r.offset;
        }
        return { ...counts, averageOffset: totalOffset / this._history.length, total: this._history.length };
    }

    getHistory() { return [...this._history]; }
    clearHistory() { this._history.length = 0; }

    /**
     * Register evaluation callback.
     * @param {Function} callback
     * @returns {Function} Unsubscribe function
     */
    onEvaluate(callback) {
        this._onEvaluate.push(callback);
        return () => { this._onEvaluate = this._onEvaluate.filter(cb => cb !== callback); };
    }

    /**
     * Configure automatic emotion nudges per grade (UP-RESONANCE-2 Feature 2).
     * @param {Object} config - Map of grade → { emotion, delta }
     * @param {Object} [config.perfect] - e.g. { emotion: 'joy', delta: 0.10 }
     * @param {Object} [config.great]   - e.g. { emotion: 'calm', delta: 0.05 }
     * @param {Object} [config.good]    - null for no effect
     * @param {Object} [config.miss]    - e.g. { emotion: 'anger', delta: 0.15 }
     */
    setEmotionFeedback(config) {
        this._emotionFeedback = config || null;
    }

    /**
     * Set the nudge function called when emotion feedback fires.
     * @param {Function} fn - (emotion, delta) => void
     */
    setEmotionTarget(fn) {
        this._emotionTarget = fn || null;
    }

    setWindows(windows) { Object.assign(this._windows, windows); }
    setGrades(grades) { Object.assign(this._grades, grades); }

    destroy() {
        this._history.length = 0;
        this._onEvaluate.length = 0;
    }
}
