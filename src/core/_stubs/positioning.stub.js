/**
 * PositioningSystem Stub — Minimal Build
 * No-op. PositionController creates an instance but MinimalMascot never calls positioning methods.
 */
export default class PositioningSystem {
    constructor() {
        this.methods = new Map();
    }
    call() {}
    getAvailableMethods() { return []; }
    hasMethod() { return false; }
    stopAll() {}
    destroy() {}
}
