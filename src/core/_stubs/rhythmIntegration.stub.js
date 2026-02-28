/**
 * Rhythm Integration Stub — Minimal Build
 * No-op implementation. GestureController calls registerConfig() — this safely ignores it.
 */
class RhythmIntegrationStub {
    constructor() {
        this.enabled = false;
    }
    registerConfig() {}
    getConfig() { return null; }
    initialize() {}
    update() {}
    destroy() {}
}

const rhythmIntegration = new RhythmIntegrationStub();
export { RhythmIntegrationStub as RhythmIntegration };
export default rhythmIntegration;
