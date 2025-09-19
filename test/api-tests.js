/**
 * API Tests
 * Test suite for Emotive Engine public API
 */

import EmotiveMascot from '../site/src/EmotiveMascotPublic.js';

const testRunner = window.testRunner;

// === Initialization Tests ===

testRunner.registerTest('api', 'Engine initialization', async ({ assert, canvas }) => {
    const mascot = new EmotiveMascot();
    await mascot.init(canvas);
    assert.ok(mascot._initialized, 'Engine should be initialized');
});

testRunner.registerTest('api', 'Double initialization prevention', async ({ assert, canvas }) => {
    const mascot = new EmotiveMascot();
    await mascot.init(canvas);

    // Second init should return immediately
    const start = performance.now();
    await mascot.init(canvas);
    const duration = performance.now() - start;

    assert.true(duration < 10, 'Second init should be instant');
});

testRunner.registerTest('api', 'Invalid canvas handling', async ({ assert }) => {
    const mascot = new EmotiveMascot();
    await assert.throws(
        () => mascot.init(null),
        'Canvas element is required',
        'Should throw error for null canvas'
    );
});

// === Gesture Tests ===

testRunner.registerTest('api', 'Trigger basic gesture', async ({ assert, canvas, wait }) => {
    const mascot = new EmotiveMascot();
    await mascot.init(canvas);

    // Should not throw
    await assert.doesNotThrow(
        () => mascot.triggerGesture('bounce'),
        'Should trigger bounce gesture without error'
    );

    await wait(100); // Let animation start
});

testRunner.registerTest('api', 'Trigger multiple gestures', async ({ assert, canvas, wait }) => {
    const mascot = new EmotiveMascot();
    await mascot.init(canvas);

    const gestures = ['bounce', 'spin', 'pulse', 'wave'];

    for (const gesture of gestures) {
        await assert.doesNotThrow(
            () => mascot.triggerGesture(gesture),
            `Should trigger ${gesture} gesture`
        );
        await wait(50);
    }
});

testRunner.registerTest('api', 'Invalid gesture handling', async ({ assert, canvas }) => {
    const mascot = new EmotiveMascot();
    await mascot.init(canvas);

    // Should handle gracefully (not throw)
    await assert.doesNotThrow(
        () => mascot.triggerGesture('nonexistent_gesture'),
        'Should handle invalid gesture gracefully'
    );
});

testRunner.registerTest('api', 'Gesture before initialization', async ({ assert }) => {
    const mascot = new EmotiveMascot();

    // Should throw error about initialization
    const result = mascot.triggerGesture('bounce');
    assert.equal(result, undefined, 'Should return undefined when not initialized');
});

// === Emotion Tests ===

testRunner.registerTest('api', 'Set basic emotion', async ({ assert, canvas }) => {
    const mascot = new EmotiveMascot();
    await mascot.init(canvas);

    await assert.doesNotThrow(
        () => mascot.setEmotion('happy'),
        'Should set happy emotion'
    );
});

testRunner.registerTest('api', 'Set emotion with undertone', async ({ assert, canvas }) => {
    const mascot = new EmotiveMascot();
    await mascot.init(canvas);

    await assert.doesNotThrow(
        () => mascot.setEmotion('happy', 'energetic'),
        'Should set emotion with undertone'
    );
});

testRunner.registerTest('api', 'Cycle through emotions', async ({ assert, canvas, wait }) => {
    const mascot = new EmotiveMascot();
    await mascot.init(canvas);

    const emotions = ['happy', 'sad', 'excited', 'calm', 'neutral'];

    for (const emotion of emotions) {
        await assert.doesNotThrow(
            () => mascot.setEmotion(emotion),
            `Should set ${emotion} emotion`
        );
        await wait(100);
    }
});

testRunner.registerTest('api', 'Invalid emotion fallback', async ({ assert, canvas }) => {
    const mascot = new EmotiveMascot();
    await mascot.init(canvas);

    // Should fallback to neutral
    const result = mascot.setEmotion('invalid_emotion');
    assert.equal(result, 'neutral', 'Should fallback to neutral for invalid emotion');
});

// === Control Tests ===

testRunner.registerTest('api', 'Start and stop animation', async ({ assert, canvas, wait }) => {
    const mascot = new EmotiveMascot();
    await mascot.init(canvas);

    mascot.start();
    await wait(100);
    assert.ok(mascot.isAnimating(), 'Should be animating after start');

    mascot.stop();
    await wait(100);
    assert.false(mascot.isAnimating(), 'Should not be animating after stop');
});

testRunner.registerTest('api', 'Pause and resume animation', async ({ assert, canvas, wait }) => {
    const mascot = new EmotiveMascot();
    await mascot.init(canvas);

    mascot.start();
    await wait(100);

    mascot.pause();
    assert.ok(mascot.isPaused(), 'Should be paused');

    mascot.resume();
    assert.false(mascot.isPaused(), 'Should not be paused after resume');
});

// === Recording Tests ===

testRunner.registerTest('api', 'Start and stop recording', async ({ assert, canvas, wait }) => {
    const mascot = new EmotiveMascot();
    await mascot.init(canvas);

    mascot.startRecording();
    assert.true(mascot.isRecording(), 'Should be recording');

    // Record some gestures
    mascot.triggerGesture('bounce');
    await wait(100);
    mascot.triggerGesture('spin');
    await wait(100);

    const recording = mascot.stopRecording();
    assert.ok(recording, 'Should return recording data');
    assert.ok(recording.timeline, 'Recording should have timeline');
    assert.true(recording.timeline.length >= 2, 'Timeline should have recorded gestures');
});

testRunner.registerTest('api', 'Playback recording', async ({ assert, canvas, wait }) => {
    const mascot = new EmotiveMascot();
    await mascot.init(canvas);

    // Create a simple recording
    mascot.startRecording();
    mascot.triggerGesture('pulse');
    await wait(200);
    mascot.setEmotion('happy');
    await wait(200);
    const recording = mascot.stopRecording();

    // Playback
    await assert.doesNotThrow(
        async () => await mascot.playRecording(recording),
        'Should playback recording without error'
    );
});

testRunner.registerTest('api', 'Export and import recording', async ({ assert, canvas, wait }) => {
    const mascot = new EmotiveMascot();
    await mascot.init(canvas);

    // Create recording
    mascot.startRecording();
    mascot.triggerGesture('wave');
    await wait(100);
    const recording = mascot.stopRecording();

    // Export
    const exported = mascot.exportRecording(recording);
    assert.typeOf(exported, 'string', 'Export should be a string');

    // Import
    const imported = mascot.importRecording(exported);
    assert.ok(imported, 'Should import recording');
    assert.ok(imported.timeline, 'Imported recording should have timeline');
});

// === Configuration Tests ===

testRunner.registerTest('api', 'Get current emotion', async ({ assert, canvas }) => {
    const mascot = new EmotiveMascot();
    await mascot.init(canvas);

    mascot.setEmotion('excited');
    const emotion = mascot.getCurrentEmotion();
    assert.equal(emotion, 'excited', 'Should return current emotion');
});

testRunner.registerTest('api', 'Get performance metrics', async ({ assert, canvas, wait }) => {
    const mascot = new EmotiveMascot();
    await mascot.init(canvas);

    mascot.start();
    await wait(500); // Let some frames render

    const metrics = mascot.getPerformanceMetrics();
    assert.ok(metrics, 'Should return performance metrics');
    assert.typeOf(metrics.fps, 'number', 'Should have FPS metric');
    assert.typeOf(metrics.frameTime, 'number', 'Should have frame time metric');
});

testRunner.registerTest('api', 'Set sound enabled', async ({ assert, canvas }) => {
    const mascot = new EmotiveMascot();
    await mascot.init(canvas);

    await assert.doesNotThrow(
        () => mascot.setSoundEnabled(false),
        'Should disable sound'
    );

    await assert.doesNotThrow(
        () => mascot.setSoundEnabled(true),
        'Should enable sound'
    );
});

// === Rhythm Sync Tests ===

testRunner.registerTest('api', 'Enable rhythm sync', async ({ assert, canvas }) => {
    const mascot = new EmotiveMascot();
    await mascot.init(canvas);

    await assert.doesNotThrow(
        () => mascot.enableRhythmSync(),
        'Should enable rhythm sync'
    );
});

testRunner.registerTest('api', 'Set BPM', async ({ assert, canvas }) => {
    const mascot = new EmotiveMascot();
    await mascot.init(canvas);

    mascot.enableRhythmSync();

    await assert.doesNotThrow(
        () => mascot.setBPM(120),
        'Should set BPM to 120'
    );

    await assert.doesNotThrow(
        () => mascot.setBPM(140),
        'Should set BPM to 140'
    );
});

testRunner.registerTest('api', 'Tap tempo', async ({ assert, canvas, wait }) => {
    const mascot = new EmotiveMascot();
    await mascot.init(canvas);

    mascot.enableRhythmSync();

    // Simulate taps
    for (let i = 0; i < 4; i++) {
        mascot.tap();
        await wait(500); // ~120 BPM
    }

    const bpm = mascot.getCurrentBPM();
    assert.ok(bpm > 100 && bpm < 140, `BPM should be around 120 (got ${bpm})`);
});

// === Cleanup Tests ===

testRunner.registerTest('api', 'Destroy engine', async ({ assert, canvas }) => {
    const mascot = new EmotiveMascot();
    await mascot.init(canvas);

    mascot.start();

    await assert.doesNotThrow(
        () => mascot.destroy(),
        'Should destroy engine without error'
    );

    assert.false(mascot._initialized, 'Should not be initialized after destroy');
});

testRunner.registerTest('api', 'Multiple destroy calls', async ({ assert, canvas }) => {
    const mascot = new EmotiveMascot();
    await mascot.init(canvas);

    mascot.destroy();

    // Second destroy should not throw
    await assert.doesNotThrow(
        () => mascot.destroy(),
        'Second destroy should not throw'
    );
});

// === Event Tests ===

testRunner.registerTest('api', 'Event emission', async ({ assert, canvas, wait }) => {
    const mascot = new EmotiveMascot();
    await mascot.init(canvas);

    let eventFired = false;

    mascot.on('gesture', (data) => {
        eventFired = true;
        assert.equal(data.gesture, 'bounce', 'Event should contain gesture name');
    });

    mascot.triggerGesture('bounce');
    await wait(100);

    assert.true(eventFired, 'Gesture event should fire');
});

testRunner.registerTest('api', 'Remove event listener', async ({ assert, canvas, wait }) => {
    const mascot = new EmotiveMascot();
    await mascot.init(canvas);

    let callCount = 0;
    const listener = () => callCount++;

    mascot.on('gesture', listener);
    mascot.triggerGesture('wave');
    await wait(50);

    mascot.off('gesture', listener);
    mascot.triggerGesture('wave');
    await wait(50);

    assert.equal(callCount, 1, 'Listener should only be called once');
});

console.log('API tests loaded');