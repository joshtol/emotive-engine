/**
 * ⚠️ REACT INTEGRATION TEMPLATE - Emotive Engine
 *
 * IMPORTANT: This is a TEMPLATE/GUIDE, not a working example!
 *
 * This file shows HOW to integrate Emotive Engine with React, but uses
 * placeholder patterns that need adaptation for your specific project.
 *
 * 📖 Before using this template:
 * 1. Study the working HTML examples first (especially hello-world.html)
 * 2. Understand the UMD bundle loading pattern
 * 3. Review the actual API methods available
 * 4. Test integration in a small prototype first
 *
 * 🚨 What's different from working examples:
 * - Uses ES module imports (your build tool must support this)
 * - Wraps mascot in React lifecycle hooks
 * - Requires proper bundler configuration (webpack, vite, etc.)
 * - May need additional setup for canvas refs
 *
 * ✅ Actual API methods (from working examples):
 * - mascot.init(canvas) - Initialize with canvas element
 * - mascot.setEmotion(emotion) - Change emotion
 * - mascot.express(gesture) - Trigger gesture
 * - mascot.morphTo(shape) - Change shape
 * - mascot.setBackdrop(config) - Configure backdrop glow
 * - mascot.setScale(config) - Scale mascot
 * - mascot.start() / mascot.stop() - Control animation
 * - mascot.on(event, handler) - Listen to events
 *
 * 📋 Valid emotions: joy, calm, excited, sadness, love, focused, empathy, neutral
 * 📋 Valid gestures: bounce, spin, pulse, glow, breathe, expand
 * 📋 Valid shapes: circle, heart, star, sun, moon
 * 📋 Real events: gesture, shapeMorphStarted, resize, paused, resumed
 *
 * 💡 Integration approach:
 * 1. Load UMD bundle via script tag in your HTML or use ES modules if configured
 * 2. Create canvas ref in React component
 * 3. Initialize mascot in useEffect after canvas mounts
 * 4. Clean up mascot on component unmount
 * 5. Update mascot state via props/effects
 *
 * See examples/hello-world.html for the simplest working implementation!
 *
 * Complexity: ⭐⭐⭐⭐ Advanced (Requires React + bundler knowledge)
 */

import React, { useEffect, useRef, useState } from 'react';

// OPTION 1: If using ES modules with a bundler
// import EmotiveMascot from 'emotive-engine';

// OPTION 2: If loaded via UMD bundle in HTML (more common)
// Access via: window.EmotiveMascot?.default || window.EmotiveMascot

/**
 * React wrapper component for Emotive Engine mascot
 *
 * This component manages the mascot lifecycle:
 * - Initializes mascot when canvas mounts
 * - Updates mascot when props change
 * - Cleans up mascot when component unmounts
 */
const EmotiveMascot = ({
  emotion = 'neutral',
  width = 400,
  height = 400,
  enableBackdrop = true,
  onReady
}) => {
  const canvasRef = useRef(null);
  const mascotRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // STEP 1: Initialize mascot when component mounts
  useEffect(() => {
    const initMascot = async () => {
      if (canvasRef.current && !mascotRef.current) {
        try {
          // Get EmotiveMascot from window (UMD bundle)
          // OR use imported class if using ES modules
          const EmotiveMascotClass = window.EmotiveMascot?.default || window.EmotiveMascot;

          if (!EmotiveMascotClass) {
            console.error('❌ EmotiveMascot not loaded. Make sure UMD bundle is included.');
            return;
          }

          // Create mascot instance with real API
          mascotRef.current = new EmotiveMascotClass({
            canvasId: canvasRef.current.id || 'mascot-canvas',
            targetFPS: 60,
            enableAudio: false,
            defaultEmotion: emotion,
            enableGazeTracking: false,
            enableIdleBehaviors: true
          });

          // CRITICAL: Initialize with canvas element
          await mascotRef.current.init(canvasRef.current);

          // Configure backdrop glow (optional)
          if (enableBackdrop) {
            mascotRef.current.setBackdrop({
              enabled: true,
              radius: 3.5,
              intensity: 0.9,
              blendMode: 'normal',
              falloff: 'smooth',
              edgeSoftness: 0.95,
              coreTransparency: 0.25,
              responsive: true
            });
          }

          // Start animation
          mascotRef.current.start();

          setIsInitialized(true);

          // Notify parent component
          if (onReady) {
            onReady(mascotRef.current);
          }

          console.log('✅ Mascot initialized in React component');

        } catch (error) {
          console.error('Failed to initialize mascot:', error);
        }
      }
    };

    initMascot();

    // STEP 2: Cleanup on unmount
    return () => {
      if (mascotRef.current) {
        mascotRef.current.stop();
        // Note: EmotiveMascot doesn't have destroy() method
        // The stop() method pauses animation
        mascotRef.current = null;
      }
    };
  }, []); // Empty deps - only run once on mount

  // STEP 3: Update emotion when prop changes
  useEffect(() => {
    if (isInitialized && mascotRef.current && emotion) {
      mascotRef.current.setEmotion(emotion);
    }
  }, [emotion, isInitialized]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        display: 'block',
        borderRadius: '12px',
        border: '2px solid rgba(221, 74, 154, 0.3)',
        boxShadow: '0 8px 32px rgba(221, 74, 154, 0.15)'
      }}
    />
  );
};

/**
 * Example usage component demonstrating real API methods
 */
const EmotiveDemo = () => {
  const [emotion, setEmotion] = useState('joy');
  const mascotRef = useRef(null);

  // Real emotions from working examples
  const emotions = [
    'joy', 'calm', 'excited', 'sadness',
    'love', 'focused', 'empathy', 'neutral'
  ];

  // Real gestures from working examples
  const gestures = ['bounce', 'spin', 'pulse', 'glow', 'breathe', 'expand'];

  // Real shapes from working examples
  const shapes = ['circle', 'heart', 'star', 'sun', 'moon'];

  // Trigger gesture using real API
  const handleGesture = (gesture) => {
    if (mascotRef.current) {
      mascotRef.current.express(gesture);
    }
  };

  // Morph shape using real API
  const handleShape = (shape) => {
    if (mascotRef.current) {
      mascotRef.current.morphTo(shape);
    }
  };

  // Handle mascot ready event
  const handleMascotReady = (mascot) => {
    mascotRef.current = mascot;

    // Set up event listeners (real events)
    mascot.on('gesture', (data) => {
      console.log('Gesture triggered:', data);
    });

    mascot.on('shapeMorphStarted', (data) => {
      console.log('Shape morphing:', data);
    });
  };

  return (
    <div style={{
      padding: '40px',
      textAlign: 'center',
      background: 'linear-gradient(135deg, #0a0a1a 0%, #16213e 50%, #1a1a2e 100%)',
      minHeight: '100vh',
      color: '#F2F1F1'
    }}>
      <h1 style={{
        fontSize: '32px',
        fontWeight: '600',
        background: 'linear-gradient(135deg, #DD4A9A 0%, #4090CE 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        marginBottom: '40px'
      }}>
        React Emotive Engine Demo
      </h1>

      <div style={{
        display: 'inline-block',
        marginBottom: '40px'
      }}>
        <EmotiveMascot
          emotion={emotion}
          onReady={handleMascotReady}
        />
      </div>

      <div style={{ marginTop: '30px', maxWidth: '600px', margin: '0 auto' }}>
        <h3 style={{ color: '#DD4A9A', marginBottom: '15px' }}>Emotions</h3>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {emotions.map(e => (
            <button
              key={e}
              onClick={() => setEmotion(e)}
              style={{
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                background: emotion === e ? '#DD4A9A' : 'rgba(64, 144, 206, 0.2)',
                color: '#F2F1F1',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '30px', maxWidth: '600px', margin: '30px auto 0' }}>
        <h3 style={{ color: '#DD4A9A', marginBottom: '15px' }}>Gestures</h3>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {gestures.map(g => (
            <button
              key={g}
              onClick={() => handleGesture(g)}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '8px',
                background: 'rgba(64, 144, 206, 0.2)',
                color: '#F2F1F1',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '30px', maxWidth: '600px', margin: '30px auto 0' }}>
        <h3 style={{ color: '#DD4A9A', marginBottom: '15px' }}>Shapes</h3>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {shapes.map(s => (
            <button
              key={s}
              onClick={() => handleShape(s)}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '8px',
                background: 'rgba(64, 144, 206, 0.2)',
                color: '#F2F1F1',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div style={{
        marginTop: '40px',
        padding: '20px',
        background: 'rgba(221, 74, 154, 0.1)',
        border: '1px solid rgba(221, 74, 154, 0.3)',
        borderRadius: '8px',
        maxWidth: '600px',
        margin: '40px auto 0',
        textAlign: 'left',
        fontSize: '14px',
        lineHeight: '1.6',
        color: '#B8B8B8'
      }}>
        <strong>💡 Integration Notes:</strong><br />
        • Load UMD bundle in your HTML or configure ES modules<br />
        • Initialize mascot after canvas mounts (useEffect)<br />
        • Clean up mascot on component unmount<br />
        • Use real API methods: setEmotion(), express(), morphTo()<br />
        • Listen to real events: gesture, shapeMorphStarted, resize<br /><br />

        <strong>📖 See working examples:</strong><br />
        Start with examples/hello-world.html to understand the basics!
      </div>
    </div>
  );
};

export default EmotiveMascot;
export { EmotiveDemo };
