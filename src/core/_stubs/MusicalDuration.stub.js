/**
 * MusicalDuration Stub — Minimal Build
 * GestureAnimator calls musicalDuration.toMilliseconds(config).
 * Returns fixed durations since there's no audio tempo in minimal builds.
 */
export class MusicalDuration {
    toMilliseconds(config) {
        if (typeof config === 'number') return config;
        if (config?.beats) return config.beats * 500; // 120 BPM default
        if (config?.bars) return config.bars * 2000;
        return 1000;
    }
    resolve(config) {
        return this.toMilliseconds(config);
    }
}

export const musicalDuration = new MusicalDuration();
export default musicalDuration;
