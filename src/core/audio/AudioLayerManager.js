/**
 * AudioLayerManager — Stem-based adaptive music with crossfade mixing.
 *
 * @module core/audio/AudioLayerManager
 */

export class AudioLayerManager {
    /**
     * @param {AudioContext} audioContext
     */
    constructor(audioContext) {
        this._ctx = audioContext;
        this._layers = new Map(); // name → { buffer, gainNode, sourceNode, loop, baseGain }
        this._masterGain = audioContext.createGain();
        this._masterGain.connect(audioContext.destination);
        this._currentMix = {};
        this._crossfadeId = 0;
        this._isPlaying = false;
        this._playOffset = 0;
        this._playStartTime = 0;
        this._emotionMod = null;
        this._baseBPM = null;
    }

    /**
     * Add a named audio layer.
     * @param {string} name
     * @param {Object} config - { src: string|Blob|ArrayBuffer, loop?: boolean, gain?: number }
     */
    async addLayer(name, config) {
        let buffer;
        if (config.src instanceof ArrayBuffer) {
            buffer = await this._ctx.decodeAudioData(config.src);
        } else if (config.src instanceof Blob) {
            const arrayBuf = await config.src.arrayBuffer();
            buffer = await this._ctx.decodeAudioData(arrayBuf);
        } else if (typeof config.src === 'string') {
            const response = await fetch(config.src);
            const arrayBuf = await response.arrayBuffer();
            buffer = await this._ctx.decodeAudioData(arrayBuf);
        }

        const gainNode = this._ctx.createGain();
        const baseGain = config.gain ?? 0;
        gainNode.gain.setValueAtTime(baseGain, this._ctx.currentTime);
        gainNode.connect(this._masterGain);

        this._layers.set(name, {
            buffer,
            gainNode,
            sourceNode: null,
            loop: config.loop ?? true,
            baseGain,
        });
        this._currentMix[name] = baseGain;
    }

    /**
     * Remove a layer.
     * @param {string} name
     */
    removeLayer(name) {
        const layer = this._layers.get(name);
        if (!layer) return;
        if (layer.sourceNode) {
            try {
                layer.sourceNode.stop();
            } catch {
                /* already stopped */
            }
        }
        layer.gainNode.disconnect();
        this._layers.delete(name);
        delete this._currentMix[name];
    }

    /**
     * Start all layers simultaneously from the same offset.
     * @param {number} [offsetMs=0] - Start offset in ms
     */
    play(offsetMs = 0) {
        if (this._isPlaying) this.stop();

        const offsetSec = offsetMs / 1000;
        this._playOffset = offsetSec;
        this._playStartTime = this._ctx.currentTime;
        this._isPlaying = true;

        for (const [, layer] of this._layers) {
            const source = this._ctx.createBufferSource();
            source.buffer = layer.buffer;
            source.loop = layer.loop;
            source.connect(layer.gainNode);
            source.start(0, offsetSec);
            layer.sourceNode = source;
        }
    }

    /**
     * Pause playback (remembers position).
     */
    pause() {
        if (!this._isPlaying) return;
        this._playOffset += this._ctx.currentTime - this._playStartTime;
        this._stopAllSources();
        this._isPlaying = false;
    }

    /**
     * Stop all layers and reset position.
     */
    stop() {
        this._stopAllSources();
        this._isPlaying = false;
        this._playOffset = 0;
    }

    /** @private */
    _stopAllSources() {
        for (const [, layer] of this._layers) {
            if (layer.sourceNode) {
                try {
                    layer.sourceNode.stop();
                } catch {
                    /* already stopped */
                }
                layer.sourceNode = null;
            }
        }
    }

    /**
     * Immediately set mix levels.
     * @param {Object} mix - { layerName: gain (0-1), ... }
     */
    setMix(mix) {
        const t = this._ctx.currentTime;
        for (const [name, gain] of Object.entries(mix)) {
            const layer = this._layers.get(name);
            if (layer) {
                layer.gainNode.gain.setValueAtTime(Math.max(0, Math.min(1, gain)), t);
                this._currentMix[name] = gain;
            }
        }
    }

    /**
     * Smoothly crossfade to target mix.
     * @param {Object} targetMix - { layerName: gain, ... }
     * @param {number} [durationMs=1000]
     * @returns {Promise<void>} Resolves when crossfade completes
     */
    crossfadeTo(targetMix, durationMs = 1000) {
        const id = ++this._crossfadeId;
        const t = this._ctx.currentTime;
        const durSec = durationMs / 1000;

        for (const [name, targetGain] of Object.entries(targetMix)) {
            const layer = this._layers.get(name);
            if (layer) {
                const clampedGain = Math.max(0.0001, Math.min(1, targetGain));
                layer.gainNode.gain.setValueAtTime(layer.gainNode.gain.value || 0.0001, t);
                layer.gainNode.gain.linearRampToValueAtTime(clampedGain, t + durSec);
                this._currentMix[name] = targetGain;
            }
        }

        return new Promise(resolve => {
            setTimeout(() => {
                if (this._crossfadeId === id) resolve();
                else resolve(); // Different crossfade started, still resolve
            }, durationMs);
        });
    }

    /**
     * Configure emotion-based modulation offsets.
     * @param {Object} config - { emotionName: { layerName: gainOffset, ... }, ... }
     */
    setEmotionModulation(config) {
        this._emotionMod = config;
    }

    /**
     * Apply current emotional state to the mix.
     * @param {Object} emotionalState - { dominant, undercurrents, slots }
     */
    applyEmotionState(emotionalState) {
        if (!this._emotionMod || !emotionalState?.dominant) return;

        const offsets = {};
        // Dominant emotion
        const domMod = this._emotionMod[emotionalState.dominant.emotion];
        if (domMod) {
            for (const [layer, offset] of Object.entries(domMod)) {
                offsets[layer] = (offsets[layer] || 0) + offset * emotionalState.dominant.intensity;
            }
        }
        // Undercurrents at reduced weight
        for (const uc of emotionalState.undercurrents || []) {
            const ucMod = this._emotionMod[uc.emotion];
            if (ucMod) {
                for (const [layer, offset] of Object.entries(ucMod)) {
                    offsets[layer] = (offsets[layer] || 0) + offset * uc.intensity * 0.25;
                }
            }
        }

        // Apply offsets to current base mix
        const newMix = { ...this._currentMix };
        for (const [layer, offset] of Object.entries(offsets)) {
            if (layer in newMix) {
                newMix[layer] = Math.max(0, Math.min(1, newMix[layer] + offset));
            }
        }
        this.setMix(newMix);
    }

    /**
     * Adjust playback rate to match target BPM.
     * @param {number} targetBPM
     * @param {number} [sourceBPM] - BPM the stems were authored at
     */
    syncToBPM(targetBPM, sourceBPM) {
        if (sourceBPM) this._baseBPM = sourceBPM;
        if (!this._baseBPM) return;

        const rate = targetBPM / this._baseBPM;
        for (const [, layer] of this._layers) {
            if (layer.sourceNode) {
                layer.sourceNode.playbackRate.value = rate;
            }
        }
    }

    /**
     * Set master volume.
     * @param {number} volume - 0-1
     */
    setMasterVolume(volume) {
        this._masterGain.gain.setValueAtTime(
            Math.max(0, Math.min(1, volume)),
            this._ctx.currentTime
        );
    }

    getLayerNames() {
        return [...this._layers.keys()];
    }
    getCurrentMix() {
        return { ...this._currentMix };
    }
    isPlaying() {
        return this._isPlaying;
    }

    destroy() {
        this.stop();
        for (const [, layer] of this._layers) {
            layer.gainNode.disconnect();
        }
        this._layers.clear();
        this._masterGain.disconnect();
    }
}
