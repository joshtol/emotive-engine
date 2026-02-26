/**
 * EmotiveDemoBundle - Complete bundle for public demo with protected internals
 * This bundles all necessary modules while hiding implementation details
 */

import EmotiveMascotPublic from './EmotiveMascotPublic.js';
import rhythmIntegration from './core/audio/rhythmIntegration.js';
import { rhythmEngine } from './core/audio/rhythm.js';
import GestureScheduler from './core/GestureScheduler.js';
import FPSCounter from './utils/FPSCounter.js';

// Create protected wrappers that hide internal implementation
const protectedRhythmIntegration = {
    initialize: () => rhythmIntegration.initialize(),
    start: (bpm, pattern) => rhythmIntegration.start(bpm, pattern),
    stop: () => rhythmIntegration.stop(),
    setBPM: bpm => rhythmIntegration.setBPM(bpm),
    getBPM: () => rhythmIntegration.getBPM(),
};

const protectedRhythmEngine = {
    on: (event, callback) => rhythmEngine.on(event, callback),
    off: (event, callback) => rhythmEngine.off(event, callback),
    bpm: rhythmEngine.bpm,
};

// Make EmotiveMascotPublic the default export (it's the constructor)
// But attach the other modules as properties so they're accessible
EmotiveMascotPublic.rhythmIntegration = protectedRhythmIntegration;
EmotiveMascotPublic.rhythmEngine = protectedRhythmEngine;
EmotiveMascotPublic.GestureScheduler = GestureScheduler;
EmotiveMascotPublic.FPSCounter = FPSCounter;

// Export for UMD bundle - this makes EmotiveMascotPublic the constructor
export default EmotiveMascotPublic;
