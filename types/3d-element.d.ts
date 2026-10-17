// Type definitions for @joshtol/emotive-engine/3d-<element> v3.5.0
// (3d-fire, 3d-water, 3d-ice, 3d-electric, 3d-earth, 3d-nature, 3d-light, 3d-void)
// Project: https://github.com/joshtol/emotive-engine
// Definitions by: Emotive Engine Team

// Each single-element entry has the full 3D API; only that element and its gestures
// are registered at runtime, so express() with another element's gesture is a no-op
// warning. Gesture names per element are listed in ./3d-elementals.d.ts.
export * from './3d';
export { default } from './3d';
