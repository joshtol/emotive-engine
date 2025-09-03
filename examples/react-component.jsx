import React, { useEffect, useRef, useState } from 'react';
import EmotiveEngine from 'emotive-engine';

const EmotiveMascot = ({ 
  emotion = 'neutral',
  particleCount = 100,
  width = 400,
  height = 400,
  onStateChange
}) => {
  const canvasRef = useRef(null);
  const mascotRef = useRef(null);
  const [currentEmotion, setCurrentEmotion] = useState(emotion);
  
  useEffect(() => {
    // Initialize mascot when component mounts
    if (canvasRef.current && !mascotRef.current) {
      mascotRef.current = new EmotiveEngine({
        canvas: canvasRef.current,
        emotion,
        particleCount,
        width,
        height,
        glowIntensity: 1.2,
        enableGestures: true
      });
      
      // Start animation
      mascotRef.current.start();
      
      // Set up event listeners
      mascotRef.current.on('stateChange', (state) => {
        setCurrentEmotion(state.emotion);
        if (onStateChange) {
          onStateChange(state);
        }
      });
    }
    
    // Cleanup on unmount
    return () => {
      if (mascotRef.current) {
        mascotRef.current.destroy();
        mascotRef.current = null;
      }
    };
  }, []);
  
  // Update emotion when prop changes
  useEffect(() => {
    if (mascotRef.current && emotion !== currentEmotion) {
      mascotRef.current.setEmotion(emotion);
    }
  }, [emotion]);
  
  // Expose methods via ref
  useEffect(() => {
    if (mascotRef.current) {
      // Make mascot methods available to parent
      canvasRef.current.mascot = mascotRef.current;
    }
  }, [mascotRef.current]);
  
  return (
    <canvas 
      ref={canvasRef}
      width={width}
      height={height}
      style={{ 
        display: 'block',
        borderRadius: '10px'
      }}
    />
  );
};

// Example usage component
const EmotiveDemo = () => {
  const [emotion, setEmotion] = useState('neutral');
  const [isBreathing, setIsBreathing] = useState(false);
  const mascotRef = useRef(null);
  
  const emotions = [
    'neutral', 'joy', 'curiosity', 'contemplation',
    'excitement', 'love', 'fear', 'suspicion'
  ];
  
  const gestures = ['wave', 'nod', 'pulse', 'bounce'];
  
  const handleGesture = (gesture) => {
    if (mascotRef.current?.mascot) {
      mascotRef.current.mascot.addGesture(gesture);
    }
  };
  
  const toggleBreathing = () => {
    if (mascotRef.current?.mascot) {
      if (isBreathing) {
        mascotRef.current.mascot.stopBreathing();
      } else {
        mascotRef.current.mascot.breathe('calm');
      }
      setIsBreathing(!isBreathing);
    }
  };
  
  return (
    <div style={{ 
      padding: '20px',
      textAlign: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: 'white' }}>React Emotive Engine Example</h1>
      
      <div style={{ 
        display: 'inline-block',
        background: 'rgba(255, 255, 255, 0.1)',
        padding: '20px',
        borderRadius: '20px',
        backdropFilter: 'blur(10px)'
      }}>
        <div ref={mascotRef}>
          <EmotiveMascot 
            emotion={emotion}
            onStateChange={(state) => console.log('State:', state)}
          />
        </div>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h3 style={{ color: 'white' }}>Emotions</h3>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {emotions.map(e => (
            <button
              key={e}
              onClick={() => setEmotion(e)}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '8px',
                background: emotion === e ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              {e}
            </button>
          ))}
        </div>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h3 style={{ color: 'white' }}>Gestures</h3>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          {gestures.map(g => (
            <button
              key={g}
              onClick={() => handleGesture(g)}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              {g}
            </button>
          ))}
        </div>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <button
          onClick={toggleBreathing}
          style={{
            padding: '12px 30px',
            border: 'none',
            borderRadius: '8px',
            background: isBreathing ? 'rgba(255, 100, 100, 0.3)' : 'rgba(100, 255, 100, 0.3)',
            color: 'white',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          {isBreathing ? 'Stop Breathing' : 'Start Breathing'}
        </button>
      </div>
    </div>
  );
};

export default EmotiveMascot;
export { EmotiveDemo };