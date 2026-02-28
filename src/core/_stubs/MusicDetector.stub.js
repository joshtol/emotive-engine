/**
 * MusicDetector Stub — Minimal Build
 * No-op implementation. ShapeMorpher calls update(), calculateBPM(), etc.
 */
export class MusicDetector {
    constructor() {
        this.detectedTimeSignature = null;
        this.timeSignatureConfidence = 0;
        this.timeSignatureLocked = false;
        this.forceFastDetection = false;
    }
    update() {}
    calculateBPM() { return 0; }
    findTempoCandidates() { return []; }
    clusterIntervals() { return []; }
    checkHarmonicRelation() { return false; }
    detectTimeSignature() { return '4/4'; }
    testWaltzPattern() { return false; }
    reset() {}
}
