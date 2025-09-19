/**
 * Performance Tests
 * Performance testing suite for the Emotive Engine
 */

import EmotiveMascot from '../site/src/EmotiveMascotPublic.js';

const testRunner = window.testRunner;

// === FPS Tests ===

testRunner.registerTest('performance', 'Maintain 60 FPS idle', async ({ assert, canvas, wait }) => {
    const mascot = new EmotiveMascot();
    await mascot.init(canvas);

    mascot.start();
    await wait(1000); // Let it stabilize

    // Measure FPS for 2 seconds
    await wait(2000);

    const metrics = mascot.getPerformanceMetrics();
    assert.true(
        metrics.fps >= 55,
        `FPS should be near 60 when idle (got ${metrics.fps})`
    );
});

testRunner.registerTest('performance', 'FPS with single gesture', async ({ assert, canvas, wait }) => {
    const mascot = new EmotiveMascot();
    await mascot.init(canvas);

    mascot.start();
    await wait(500);

    // Trigger gesture and measure
    mascot.triggerGesture('bounce');
    await wait(2000);

    const metrics = mascot.getPerformanceMetrics();
    assert.true(
        metrics.fps >= 50,
        `FPS should stay above 50 with gesture (got ${metrics.fps})`
    );
});

testRunner.registerTest('performance', 'FPS with multiple gestures', async ({ assert, canvas, wait }) => {
    const mascot = new EmotiveMascot();
    await mascot.init(canvas);

    mascot.start();
    await wait(500);

    // Trigger multiple gestures
    mascot.triggerGesture('bounce');
    mascot.triggerGesture('pulse');
    mascot.triggerGesture('glow');
    await wait(2000);

    const metrics = mascot.getPerformanceMetrics();
    assert.true(
        metrics.fps >= 45,
        `FPS should stay above 45 with multiple gestures (got ${metrics.fps})`
    );
});

// === Memory Tests ===

testRunner.registerTest('performance', 'Memory baseline', async ({ assert, canvas, wait }) => {
    if (!performance.memory) {
        assert.ok(true, 'Memory API not available, skipping');
        return;
    }

    const mascot = new EmotiveMascot();
    await mascot.init(canvas);

    const initialMemory = performance.memory.usedJSHeapSize;

    mascot.start();
    await wait(1000);

    const currentMemory = performance.memory.usedJSHeapSize;
    const increase = currentMemory - initialMemory;

    assert.true(
        increase < 10 * 1024 * 1024, // 10MB
        `Memory increase should be under 10MB (got ${(increase / 1024 / 1024).toFixed(2)}MB)`
    );
});

testRunner.registerTest('performance', 'Memory with gesture spam', async ({ assert, canvas, wait }) => {
    if (!performance.memory) {
        assert.ok(true, 'Memory API not available, skipping');
        return;
    }

    const mascot = new EmotiveMascot();
    await mascot.init(canvas);

    mascot.start();
    const initialMemory = performance.memory.usedJSHeapSize;

    // Spam gestures
    for (let i = 0; i < 100; i++) {
        mascot.triggerGesture('pulse');
        await wait(10);
    }

    await wait(1000); // Let GC run

    const finalMemory = performance.memory.usedJSHeapSize;
    const increase = finalMemory - initialMemory;

    assert.true(
        increase < 20 * 1024 * 1024, // 20MB
        `Memory increase should be under 20MB after gesture spam (got ${(increase / 1024 / 1024).toFixed(2)}MB)`
    );
});

// === Frame Time Tests ===

testRunner.registerTest('performance', 'Frame time consistency', async ({ assert, canvas, wait }) => {
    const mascot = new EmotiveMascot();
    await mascot.init(canvas);

    mascot.start();
    await wait(1000);

    const samples = [];
    for (let i = 0; i < 60; i++) {
        const metrics = mascot.getPerformanceMetrics();
        samples.push(metrics.frameTime);
        await wait(16); // One frame
    }

    // Calculate variance
    const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
    const variance = samples.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / samples.length;
    const stdDev = Math.sqrt(variance);

    assert.true(
        stdDev < 5,
        `Frame time should be consistent (std dev: ${stdDev.toFixed(2)}ms)`
    );
});

// === Gesture Queue Tests ===

testRunner.registerTest('performance', 'Gesture queue performance', async ({ assert, canvas, wait }) => {
    const mascot = new EmotiveMascot();
    await mascot.init(canvas);

    mascot.start();
    const startTime = performance.now();

    // Queue many gestures
    for (let i = 0; i < 20; i++) {
        mascot.triggerGesture(['bounce', 'spin', 'wave'][i % 3]);
    }

    const queueTime = performance.now() - startTime;

    assert.true(
        queueTime < 50,
        `Queuing 20 gestures should be fast (took ${queueTime.toFixed(2)}ms)`
    );

    // Check FPS while processing queue
    await wait(2000);
    const metrics = mascot.getPerformanceMetrics();

    assert.true(
        metrics.fps >= 40,
        `FPS should stay above 40 while processing queue (got ${metrics.fps})`
    );
});

// === Emotion Transition Tests ===

testRunner.registerTest('performance', 'Emotion transition performance', async ({ assert, canvas, wait }) => {
    const mascot = new EmotiveMascot();
    await mascot.init(canvas);

    mascot.start();
    await wait(500);

    const emotions = ['happy', 'sad', 'excited', 'calm', 'angry'];
    const startTime = performance.now();

    // Rapid emotion changes
    for (const emotion of emotions) {
        mascot.setEmotion(emotion);
        await wait(100);
    }

    const transitionTime = performance.now() - startTime;
    const metrics = mascot.getPerformanceMetrics();

    assert.true(
        metrics.fps >= 45,
        `FPS should stay above 45 during emotion transitions (got ${metrics.fps})`
    );
});

// === Rhythm Sync Performance ===

testRunner.registerTest('performance', 'Rhythm sync overhead', async ({ assert, canvas, wait }) => {
    const mascot = new EmotiveMascot();
    await mascot.init(canvas);

    mascot.start();
    await wait(1000);

    // Baseline FPS
    const baselineMetrics = mascot.getPerformanceMetrics();
    const baselineFPS = baselineMetrics.fps;

    // Enable rhythm sync
    mascot.enableRhythmSync();
    mascot.setBPM(120);
    await wait(2000);

    const rhythmMetrics = mascot.getPerformanceMetrics();
    const fpsDrop = baselineFPS - rhythmMetrics.fps;

    assert.true(
        fpsDrop < 5,
        `Rhythm sync should not drop FPS by more than 5 (dropped ${fpsDrop.toFixed(1)})`
    );
});

testRunner.registerTest('performance', 'Beat-synced gestures', async ({ assert, canvas, wait }) => {
    const mascot = new EmotiveMascot();
    await mascot.init(canvas);

    mascot.start();
    mascot.enableRhythmSync();
    mascot.setBPM(120); // 500ms per beat

    const startTime = performance.now();

    // Trigger gestures on beat
    for (let i = 0; i < 8; i++) {
        mascot.triggerGesture('pulse');
        await wait(500); // Wait for beat
    }

    const metrics = mascot.getPerformanceMetrics();

    assert.true(
        metrics.fps >= 50,
        `FPS should stay above 50 with beat-synced gestures (got ${metrics.fps})`
    );
});

// === Particle Performance ===

testRunner.registerTest('performance', 'Particle system performance', async ({ assert, canvas, wait }) => {
    const mascot = new EmotiveMascot({
        particleIntensity: 1.0,
        maxParticles: 100
    });
    await mascot.init(canvas);

    mascot.start();

    // Trigger particle-heavy gestures
    mascot.triggerGesture('sparkle');
    mascot.triggerGesture('shimmer');
    await wait(2000);

    const metrics = mascot.getPerformanceMetrics();

    assert.true(
        metrics.fps >= 45,
        `FPS should stay above 45 with particles (got ${metrics.fps})`
    );

    assert.true(
        metrics.particleCount <= 100,
        `Particle count should respect limit (got ${metrics.particleCount})`
    );
});

// === Recording Performance ===

testRunner.registerTest('performance', 'Recording overhead', async ({ assert, canvas, wait }) => {
    const mascot = new EmotiveMascot();
    await mascot.init(canvas);

    mascot.start();
    await wait(1000);

    // Baseline FPS
    const baselineMetrics = mascot.getPerformanceMetrics();

    // Start recording
    mascot.startRecording();

    // Perform actions while recording
    for (let i = 0; i < 10; i++) {
        mascot.triggerGesture('bounce');
        mascot.setEmotion(['happy', 'excited'][i % 2]);
        await wait(200);
    }

    const recordingMetrics = mascot.getPerformanceMetrics();
    mascot.stopRecording();

    const fpsDrop = baselineMetrics.fps - recordingMetrics.fps;

    assert.true(
        fpsDrop < 3,
        `Recording should not drop FPS by more than 3 (dropped ${fpsDrop.toFixed(1)})`
    );
});

testRunner.registerTest('performance', 'Playback performance', async ({ assert, canvas, wait }) => {
    const mascot = new EmotiveMascot();
    await mascot.init(canvas);

    // Create a recording
    mascot.startRecording();
    for (let i = 0; i < 5; i++) {
        mascot.triggerGesture(['bounce', 'spin', 'wave'][i % 3]);
        await wait(200);
    }
    const recording = mascot.stopRecording();

    mascot.start();
    await wait(500);

    // Measure playback performance
    const startTime = performance.now();
    await mascot.playRecording(recording);
    const playbackTime = performance.now() - startTime;

    const metrics = mascot.getPerformanceMetrics();

    assert.true(
        metrics.fps >= 50,
        `FPS should stay above 50 during playback (got ${metrics.fps})`
    );
});

// === Initialization Performance ===

testRunner.registerTest('performance', 'Initialization time', async ({ assert, canvas }) => {
    const startTime = performance.now();

    const mascot = new EmotiveMascot();
    await mascot.init(canvas);

    const initTime = performance.now() - startTime;

    assert.true(
        initTime < 500,
        `Initialization should complete under 500ms (took ${initTime.toFixed(2)}ms)`
    );
});

testRunner.registerTest('performance', 'Multiple instances', async ({ assert, wait }) => {
    const canvases = [];
    const mascots = [];

    // Create multiple canvases
    for (let i = 0; i < 3; i++) {
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 200;
        document.body.appendChild(canvas);
        canvases.push(canvas);
    }

    const startTime = performance.now();

    // Initialize multiple instances
    for (const canvas of canvases) {
        const mascot = new EmotiveMascot();
        await mascot.init(canvas);
        mascot.start();
        mascots.push(mascot);
    }

    await wait(2000);

    // Check combined performance
    let totalFPS = 0;
    for (const mascot of mascots) {
        const metrics = mascot.getPerformanceMetrics();
        totalFPS += metrics.fps;
    }
    const avgFPS = totalFPS / mascots.length;

    assert.true(
        avgFPS >= 40,
        `Average FPS across instances should be above 40 (got ${avgFPS.toFixed(1)})`
    );

    // Cleanup
    for (const mascot of mascots) {
        mascot.destroy();
    }
    for (const canvas of canvases) {
        canvas.remove();
    }
});

console.log('Performance tests loaded');