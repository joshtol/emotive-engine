/**
 * DifficultyManager — Timing window presets and accessibility assists.
 *
 * UP-RESONANCE-2 Feature 5
 * @module core/audio/DifficultyManager
 */

const PRESETS = {
    easy:   { windowMultiplier: 1.5, label: 'Easy' },
    normal: { windowMultiplier: 1.0, label: 'Normal' },
    hard:   { windowMultiplier: 0.7, label: 'Hard' },
};

export class DifficultyManager {
    constructor() {
        this._preset = 'normal';
        this._assist = {
            autoRhythm: false,
            slowMode: false,
            visualMetronome: false,
        };
        this._slowModeMult = 0.75;
    }

    /**
     * Set difficulty preset.
     * @param {'easy'|'normal'|'hard'} preset
     */
    setDifficulty(preset) {
        if (!PRESETS[preset]) return;
        this._preset = preset;
    }

    /** @returns {string} Current preset name */
    getDifficulty() { return this._preset; }

    /** @returns {number} Window multiplier for current preset */
    getWindowMultiplier() { return PRESETS[this._preset].windowMultiplier; }

    /**
     * Set assist options.
     * @param {Object} opts
     * @param {boolean} [opts.autoRhythm] - All inputs auto-succeed at 'good'
     * @param {boolean} [opts.slowMode] - Reduce BPM by 25%
     * @param {boolean} [opts.visualMetronome] - Enable pulse guide
     */
    setAssist(opts) {
        if (opts.autoRhythm !== undefined) this._assist.autoRhythm = !!opts.autoRhythm;
        if (opts.slowMode !== undefined) this._assist.slowMode = !!opts.slowMode;
        if (opts.visualMetronome !== undefined) this._assist.visualMetronome = !!opts.visualMetronome;
    }

    /** @returns {Object} Current assist flags */
    getAssist() { return { ...this._assist }; }

    /** @returns {boolean} Whether autoRhythm is active */
    get autoRhythm() { return this._assist.autoRhythm; }

    /** @returns {number} BPM multiplier (1.0 or 0.75 if slowMode) */
    getBPMMultiplier() { return this._assist.slowMode ? this._slowModeMult : 1.0; }

    /** @returns {boolean} Whether visual metronome should show */
    get visualMetronome() { return this._assist.visualMetronome; }

    // Serialization
    serialize() {
        return { preset: this._preset, assist: { ...this._assist } };
    }

    deserialize(data) {
        if (!data) return;
        if (data.preset && PRESETS[data.preset]) this._preset = data.preset;
        if (data.assist) this.setAssist(data.assist);
    }
}
