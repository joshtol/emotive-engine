/**
 * ModifierManager — Timed, auto-expiring modifiers for rhythm/visual pipeline.
 *
 * UP-RESONANCE-2 Feature 6
 * @module core/state/ModifierManager
 */

export class ModifierManager {
    /**
     * @param {Function} [emit] - (eventName, data) => void for bus events
     */
    constructor(emit) {
        this._modifiers = new Map();
        this._emit = emit || (() => {});
    }

    /**
     * Apply a named modifier.
     * @param {string} name - Unique modifier name
     * @param {Object} config
     * @param {number|null} [config.duration] - ms, or null for permanent
     * @param {number} [config.rhythmWindowMult] - Timing window multiplier
     * @param {number} [config.visualNoise] - Visual jitter amount
     * @param {number} [config.inputDelay] - Input delay in ms
     * @param {number} [config.tempoShift] - Tempo shift factor
     * @param {Function} [config.onTick] - (remainingMs) => void
     * @param {Function} [config.onExpire] - () => void
     */
    applyModifier(name, config) {
        this._modifiers.set(name, {
            name,
            config: { ...config },
            remaining: config.duration ?? null,
            startTime: Date.now(),
        });
        this._emit('modifierApplied', { name, config });
    }

    /**
     * Remove a modifier by name.
     * @param {string} name
     */
    removeModifier(name) {
        const mod = this._modifiers.get(name);
        if (mod) {
            this._modifiers.delete(name);
            this._emit('modifierExpired', { name, manual: true });
        }
    }

    /**
     * Tick all modifiers. Call each frame.
     * @param {number} deltaMs - Milliseconds since last frame
     */
    update(deltaMs) {
        const expired = [];
        for (const [name, mod] of this._modifiers) {
            if (mod.remaining !== null) {
                mod.remaining -= deltaMs;
                if (mod.remaining <= 0) {
                    expired.push(name);
                    if (mod.config.onExpire) mod.config.onExpire();
                    continue;
                }
            }
            if (mod.config.onTick) mod.config.onTick(mod.remaining);
        }
        for (const name of expired) {
            this._modifiers.delete(name);
            this._emit('modifierExpired', { name, manual: false });
        }
    }

    /**
     * Get composite modifiers from all active modifiers.
     * rhythmWindowMult and tempoShift are multiplicative.
     * visualNoise and inputDelay are additive.
     * @returns {Object}
     */
    getCompositeModifiers() {
        let rhythmWindowMult = 1.0;
        let tempoShift = 0;
        let visualNoise = 0;
        let inputDelay = 0;

        for (const mod of this._modifiers.values()) {
            const c = mod.config;
            if (c.rhythmWindowMult !== undefined) rhythmWindowMult *= c.rhythmWindowMult;
            if (c.tempoShift !== undefined) tempoShift += c.tempoShift;
            if (c.visualNoise !== undefined) visualNoise += c.visualNoise;
            if (c.inputDelay !== undefined) inputDelay += c.inputDelay;
        }

        return { rhythmWindowMult, tempoShift, visualNoise, inputDelay };
    }

    /**
     * Get all active modifiers.
     * @returns {Array<{name: string, remaining: number|null, config: Object}>}
     */
    getActiveModifiers() {
        return [...this._modifiers.values()].map(m => ({
            name: m.name,
            remaining: m.remaining,
            config: { ...m.config },
        }));
    }

    /**
     * Check if a modifier is active.
     * @param {string} name
     * @returns {boolean}
     */
    hasModifier(name) {
        return this._modifiers.has(name);
    }

    /** Clear all modifiers. */
    clear() {
        this._modifiers.clear();
    }

    // Serialization
    serialize() {
        const mods = [];
        for (const m of this._modifiers.values()) {
            const { onTick, onExpire, ...serializableConfig } = m.config;
            mods.push({ name: m.name, remaining: m.remaining, config: serializableConfig });
        }
        return mods;
    }

    deserialize(data) {
        if (!Array.isArray(data)) return;
        this._modifiers.clear();
        for (const m of data) {
            this._modifiers.set(m.name, {
                name: m.name,
                config: m.config || {},
                remaining: m.remaining,
                startTime: Date.now(),
            });
        }
    }
}
