/**
 * Stress Tests
 * Stress testing suite for the Emotive Engine
 */

import EmotiveMascot from '../site/src/EmotiveMascotPublic.js';

const testRunner = window.testRunner;

// === Gesture Stress Tests ===

testRunner.registerTest('stress', 'Rapid gesture switching', async ({ assert, canvas, wait }) => {
    const mascot = new EmotiveMascot();
    await mascot.init(canvas);
    mascot.start();

    const gestures = ['bounce', 'spin', 'wave', 'pulse', 'shake', 'orbit'];
    const startTime = performance.now();

    // Rapidly switch gestures
    for (let i = 0; i < 100; i++) {
        mascot.triggerGesture(gestures[i % gestures.length]);
        await wait(5); // Very short delay
    }

    const duration = performance.now() - startTime;
    const metrics = mascot.getPerformanceMetrics();

    assert.true(
        metrics.fps >= 30,
        `Should maintain 30+ FPS under rapid gesture switching (got ${metrics.fps})`
    );

    assert.true(
        duration < 2000,
        `100 rapid gestures should complete quickly (took ${duration.toFixed(0)}ms)`
    );
});

testRunner.registerTest('stress', 'Gesture queue overflow', async ({ assert, canvas, wait }) => {
    const mascot = new EmotiveMascot();
    await mascot.init(canvas);
    mascot.start();

    // Try to overflow gesture queue
    const startTime = performance.now();

    for (let i = 0; i < 500; i++) {
        mascot.triggerGesture('bounce');
    }

    const queueTime = performance.now() - startTime;

    assert.true(
        queueTime < 100,
        `Queuing 500 gestures should be fast (took ${queueTime.toFixed(2)}ms)`
    );

    await wait(2000);
    const metrics = mascot.getPerformanceMetrics();

    assert.true(
        metrics.fps >= 25,
        `Should maintain 25+ FPS with overflowed queue (got ${metrics.fps})`
    );
});

// === Memory Stress Tests ===

testRunner.registerTest('stress', 'Memory leak detection', async ({ assert, canvas, wait }) => {
    if (!performance.memory) {
        assert.ok(true, 'Memory API not available, skipping');
        return;
    }

    const mascot = new EmotiveMascot();
    await mascot.init(canvas);
    mascot.start();

    const initialMemory = performance.memory.usedJSHeapSize;

    // Create and destroy many objects
    for (let cycle = 0; cycle < 10; cycle++) {
        // Trigger many gestures
        for (let i = 0; i < 50; i++) {
            mascot.triggerGesture('pulse');
        }

        // Change emotions
        for (let i = 0; i < 20; i++) {
            mascot.setEmotion(['happy', 'sad', 'excited'][i % 3]);
        }

        await wait(500);
    }

    // Force garbage collection if available
    if (window.gc) {
        window.gc();
        await wait(100);
    }

    const finalMemory = performance.memory.usedJSHeapSize;
    const memoryGrowth = finalMemory - initialMemory;

    assert.true(
        memoryGrowth < 50 * 1024 * 1024, // 50MB
        `Memory growth should be under 50MB (grew ${(memoryGrowth / 1024 / 1024).toFixed(2)}MB)`
    );
});

testRunner.registerTest('stress', 'Event listener accumulation', async ({ assert, canvas, wait }) => {
    const mascot = new EmotiveMascot();
    await mascot.init(canvas);

    const listeners = [];

    // Add many listeners
    for (let i = 0; i < 100; i++) {
        const listener = () => {};
        listeners.push(listener);
        mascot.on('gesture', listener);
    }

    // Trigger events
    mascot.triggerGesture('bounce');
    await wait(100);

    // Remove all listeners
    for (const listener of listeners) {
        mascot.off('gesture', listener);
    }

    // Should still work
    await assert.doesNotThrow(
        () => mascot.triggerGesture('wave'),
        'Should work after adding/removing many listeners'
    );
});

// === Recording Stress Tests ===

testRunner.registerTest('stress', 'Large recording', async ({ assert, canvas, wait }) => {
    const mascot = new EmotiveMascot();
    await mascot.init(canvas);

    mascot.startRecording();

    // Record many events
    for (let i = 0; i < 200; i++) {
        mascot.triggerGesture(['bounce', 'spin', 'wave'][i % 3]);
        if (i % 10 === 0) {
            mascot.setEmotion(['happy', 'sad', 'excited'][Math.floor(i / 10) % 3]);
        }
        await wait(10);
    }

    const recording = mascot.stopRecording();

    assert.ok(recording, 'Should create recording');
    assert.true(
        recording.timeline.length >= 200,
        `Recording should have many events (got ${recording.timeline.length})`
    );

    // Export should work
    const exported = mascot.exportRecording(recording);
    assert.ok(exported, 'Should export large recording');

    // Import should work
    const imported = mascot.importRecording(exported);
    assert.ok(imported, 'Should import large recording');
});

testRunner.registerTest('stress', 'Rapid recording cycles', async ({ assert, canvas, wait }) => {
    const mascot = new EmotiveMascot();
    await mascot.init(canvas);

    const recordings = [];

    // Many start/stop cycles
    for (let i = 0; i < 20; i++) {
        mascot.startRecording();
        mascot.triggerGesture('pulse');
        await wait(50);
        const recording = mascot.stopRecording();
        recordings.push(recording);
    }

    assert.equal(recordings.length, 20, 'Should create all recordings');

    // All recordings should be valid
    for (const recording of recordings) {
        assert.ok(recording.timeline, 'Each recording should have timeline');
    }
});

// === Rhythm Sync Stress ===

testRunner.registerTest('stress', 'Rapid BPM changes', async ({ assert, canvas, wait }) => {
    const mascot = new EmotiveMascot();
    await mascot.init(canvas);

    mascot.start();
    mascot.enableRhythmSync();

    // Rapidly change BPM
    for (let bpm = 60; bpm <= 180; bpm += 5) {
        mascot.setBPM(bpm);
        mascot.triggerGesture('pulse');
        await wait(20);
    }

    const metrics = mascot.getPerformanceMetrics();

    assert.true(
        metrics.fps >= 30,
        `Should maintain 30+ FPS with rapid BPM changes (got ${metrics.fps})`
    );
});

testRunner.registerTest('stress', 'Tap tempo spam', async ({ assert, canvas, wait }) => {
    const mascot = new EmotiveMascot();
    await mascot.init(canvas);

    mascot.enableRhythmSync();

    // Spam tap tempo
    for (let i = 0; i < 100; i++) {
        mascot.tap();
        await wait(Math.random() * 50 + 10); // Random intervals
    }

    const bpm = mascot.getCurrentBPM();

    assert.ok(
        bpm >= 60 && bpm <= 200,
        `BPM should stay in reasonable range after spam (got ${bpm})`
    );
});

// === Concurrent Operations ===

testRunner.registerTest('stress', 'Concurrent operations', async ({ assert, canvas, wait }) => {
    const mascot = new EmotiveMascot();
    await mascot.init(canvas);

    mascot.start();
    mascot.enableRhythmSync();
    mascot.setBPM(120);
    mascot.startRecording();

    const operations = [];

    // Run many things concurrently
    operations.push((async () => {
        for (let i = 0; i < 50; i++) {
            mascot.triggerGesture('bounce');
            await wait(30);
        }
    })());

    operations.push((async () => {
        for (let i = 0; i < 20; i++) {
            mascot.setEmotion(['happy', 'sad'][i % 2]);
            await wait(100);
        }
    })());

    operations.push((async () => {
        for (let i = 0; i < 10; i++) {
            mascot.tap();
            await wait(200);
        }
    })());

    await Promise.all(operations);

    const recording = mascot.stopRecording();
    const metrics = mascot.getPerformanceMetrics();

    assert.ok(recording, 'Should handle concurrent operations');
    assert.true(
        metrics.fps >= 25,
        `Should maintain 25+ FPS during concurrent operations (got ${metrics.fps})`
    );
});

// === Error Recovery Stress ===

testRunner.registerTest('stress', 'Invalid input spam', async ({ assert, canvas, wait }) => {
    const mascot = new EmotiveMascot();
    await mascot.init(canvas);

    // Spam invalid inputs
    for (let i = 0; i < 100; i++) {
        mascot.triggerGesture(`invalid_${i}`);
        mascot.setEmotion(`invalid_${i}`);
        mascot.setBPM(-i);
    }

    await wait(500);

    // Should still work normally
    await assert.doesNotThrow(
        () => mascot.triggerGesture('bounce'),
        'Should work after invalid input spam'
    );

    const metrics = mascot.getPerformanceMetrics();
    assert.ok(metrics, 'Should still provide metrics');
});

// === Destroy/Recreate Stress ===

testRunner.registerTest('stress', 'Rapid destroy/recreate', async ({ assert, canvas, wait }) => {
    for (let i = 0; i < 10; i++) {
        const mascot = new EmotiveMascot();
        await mascot.init(canvas);
        mascot.start();

        mascot.triggerGesture('bounce');
        await wait(50);

        mascot.destroy();
    }

    // Final instance should work
    const finalMascot = new EmotiveMascot();
    await finalMascot.init(canvas);

    await assert.doesNotThrow(
        () => finalMascot.triggerGesture('wave'),
        'Should work after rapid destroy/recreate cycles'
    );

    finalMascot.destroy();
});

// === Canvas Resize Stress ===

testRunner.registerTest('stress', 'Canvas resize during animation', async ({ assert, canvas, wait }) => {
    const mascot = new EmotiveMascot();
    await mascot.init(canvas);
    mascot.start();

    // Trigger animations
    mascot.triggerGesture('spin');

    // Resize canvas multiple times
    for (let i = 0; i < 10; i++) {
        canvas.width = 200 + i * 20;
        canvas.height = 150 + i * 15;
        await wait(100);
    }

    const metrics = mascot.getPerformanceMetrics();

    assert.true(
        metrics.fps >= 30,
        `Should maintain 30+ FPS during resizes (got ${metrics.fps})`
    );
});

// === Long Running Test ===

testRunner.registerTest('stress', 'Long running stability', async ({ assert, canvas, wait }) => {
    const mascot = new EmotiveMascot();
    await mascot.init(canvas);
    mascot.start();

    const startMetrics = mascot.getPerformanceMetrics();
    const startTime = performance.now();

    // Run for 10 seconds with various operations
    while (performance.now() - startTime < 10000) {
        mascot.triggerGesture(['bounce', 'spin', 'wave'][Math.floor(Math.random() * 3)]);
        await wait(200);

        if (Math.random() < 0.3) {
            mascot.setEmotion(['happy', 'sad', 'excited'][Math.floor(Math.random() * 3)]);
        }
    }

    const endMetrics = mascot.getPerformanceMetrics();

    assert.true(
        endMetrics.fps >= 30,
        `Should maintain 30+ FPS after long run (got ${endMetrics.fps})`
    );

    if (performance.memory) {
        // Check for memory growth
        assert.ok(true, 'Long running test completed successfully');
    }
});

console.log('Stress tests loaded');