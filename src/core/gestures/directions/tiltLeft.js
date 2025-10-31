/**
 * DIRECTION TEST: TILT LEFT (Z-axis rotation negative)
 * Tests negative Z-axis rotation (roll)
 * Expected: Mascot should tilt LEFT (left side down)
 */
export default {
    name: 'testTiltLeft',
    emoji: '⤺',
    type: 'override',
    description: 'TEST: Tilt LEFT (roll left)',

    config: {
        duration: 1000,
        musicalDuration: { musical: true, beats: 2 }
    },

    rhythm: {
        enabled: true,
        syncMode: 'beat',
        timingSync: 'nextBeat',
        durationSync: { mode: 'beats', beats: 2 },
        interruptible: true,
        priority: 5
    },

    apply(particle, progress) {
        // No 2D implementation - return false to use 3D-only mode
        return false;
    },

    '3d': {
        evaluate(progress) {
            // Smooth tilt left and back
            const rotationAmount = Math.sin(progress * Math.PI);

            return {
                position: [0, 0, 0],
                rotation: [0, 0, rotationAmount * 0.5],  // Z-axis: POSITIVE = tilt left (inverted from expected)
                scale: 1.0
            };
        }
    }
};
