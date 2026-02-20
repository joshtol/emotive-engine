/**
 * EmotionDynamics — Decay & accumulation for multi-emotion slots.
 *
 * @module core/state/EmotionDynamics
 */

export class EmotionDynamics {
    /**
     * @param {import('./EmotiveStateMachine.js').default} stateMachine
     * @param {Object} [config]
     * @param {number} [config.decayRate=0.02] - Intensity lost per second
     * @param {number} [config.decayFloor=0] - Slots below this are removed
     * @param {number} [config.accumulationCap=1.0] - Max intensity per slot
     * @param {boolean} [config.enabled=false] - Opt-in
     */
    constructor(stateMachine, config = {}) {
        this._sm = stateMachine;
        this._decayRate = config.decayRate ?? 0.02;
        this._decayFloor = config.decayFloor ?? 0;
        this._accumulationCap = config.accumulationCap ?? 1.0;
        this._enabled = config.enabled ?? false;
        this._paused = false;
        this._onDecay = [];
        this._onNudge = [];
    }

    /**
     * Tick decay. Call every frame.
     * @param {number} deltaTimeSec - Seconds since last frame
     */
    update(deltaTimeSec) {
        if (!this._enabled || this._paused) return;

        const slots = this._sm.getSlots();
        const decay = this._decayRate * deltaTimeSec;

        for (const slot of slots) {
            if (slot.intensity <= this._decayFloor) continue;
            const before = slot.intensity;
            slot.intensity = Math.max(this._decayFloor, slot.intensity - decay);
            if (slot.intensity !== before) {
                for (const cb of this._onDecay) cb(slot.emotion, slot.intensity, before);
                // Emit decay event through stateMachine's event pipeline
                this._sm._emitEvent('emotionDecayed', { emotion: slot.emotion, intensity: slot.intensity, removed: false });
                this._sm._emitEvent('slotChanged', { emotion: slot.emotion, intensity: slot.intensity, action: 'decay' });
            }
        }

        // pruneEmptySlots emits emotionDecayed with removed: true for zeroed slots
        this._sm.pruneEmptySlots();
    }

    /**
     * Event-driven intensity nudge.
     * @param {string} emotion
     * @param {number} delta - Positive or negative
     */
    nudge(emotion, delta) {
        this._sm.nudgeEmotion(emotion, delta, this._accumulationCap);
        for (const cb of this._onNudge) cb(emotion, delta);
    }

    // Configuration
    setDecayRate(rate) { this._decayRate = Math.max(0, rate); }
    getDecayRate() { return this._decayRate; }
    setAccumulationCap(cap) { this._accumulationCap = Math.max(0, Math.min(1, cap)); }
    enable() { this._enabled = true; }
    disable() { this._enabled = false; }
    isEnabled() { return this._enabled; }
    pause() { this._paused = true; }
    resume() { this._paused = false; }
    reset() { this._sm.clearEmotions(); }

    // Callbacks
    onDecay(cb) { this._onDecay.push(cb); return () => { this._onDecay = this._onDecay.filter(c => c !== cb); }; }
    onNudge(cb) { this._onNudge.push(cb); return () => { this._onNudge = this._onNudge.filter(c => c !== cb); }; }

    destroy() {
        this._onDecay.length = 0;
        this._onNudge.length = 0;
    }
}
