/**
 * GestureCompatibility Stub — Minimal Build
 * MinimalMascot assigns this to gestureController.gestureCompatibility.
 * GestureController calls areCompatible(), canChain(), etc.
 */
export class GestureCompatibility {
    areCompatible() { return true; }
    canChain() { return true; }
    getCompatibilityInfo() { return { compatible: true, reason: 'minimal' }; }
    getIncompatibleGestures() { return []; }
    getTimingClass() { return 'medium'; }
    getChordInfo() { return null; }
    getChainInfo() { return null; }
}

const gestureCompatibility = new GestureCompatibility();
export default gestureCompatibility;
