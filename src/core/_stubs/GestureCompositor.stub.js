/**
 * GestureCompositor Stub — Minimal Build
 * EmotiveRenderer creates new GestureCompositor().
 * GestureAnimator calls gestureCompositor.compose(gestureName, emotion, undertone).
 * Returning null makes GestureAnimator fall back to the gesture's default config.
 */
export default class GestureCompositor {
    compose() { return null; }
}
