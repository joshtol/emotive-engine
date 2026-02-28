/**
 * EmotiveDebugger Stub — Minimal Build
 * No-op logging. RenderLayerOrchestrator calls emotiveDebugger.log().
 */
export const DebugLevel = { NONE: 0, ERROR: 1, WARN: 2, INFO: 3, DEBUG: 4, TRACE: 5 };

export class EmotiveDebugger {
    constructor() {
        this.logs = [];
        this.errors = [];
    }
    log() {}
    warn() {}
    error() {}
    info() {}
    debug() {}
    trace() {}
    profile() {}
    endProfile() {}
    getProfiles() { return []; }
    getErrors() { return []; }
    clearErrors() {}
    getMemorySnapshot() { return null; }
}

export class RuntimeCapabilities {
    constructor() {
        this.maxParticles = 500;
        this.maxFPS = 60;
    }
}

export const emotiveDebugger = new EmotiveDebugger();
export const runtimeCapabilities = new RuntimeCapabilities();
