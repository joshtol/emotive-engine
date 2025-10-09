'use client';

import { useEffect, useState } from 'react';
import { useScrollExperience } from './hooks/useScrollExperience';

interface ScrollHintProps {
  /** Show hint on initial mount */
  autoShow?: boolean;
  /** Auto-hide after this many milliseconds */
  autoHideDuration?: number;
}

export default function ScrollHint({ autoShow = true, autoHideDuration = 5000 }: ScrollHintProps) {
  const { intent, lock, activeSection, visitedSections } = useScrollExperience();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('Scroll to explore');

  // Show hint on mount if autoShow enabled
  useEffect(() => {
    if (autoShow && activeSection === 0 && visitedSections.size === 0) {
      setVisible(true);

      if (autoHideDuration > 0) {
        const timer = setTimeout(() => setVisible(false), autoHideDuration);
        return () => clearTimeout(timer);
      }
    }
  }, [autoShow, autoHideDuration, activeSection, visitedSections.size]);

  // Hide hint when user starts scrolling
  useEffect(() => {
    if (intent.intent !== 'EXPLORING' || visitedSections.size > 1) {
      setVisible(false);
    }
  }, [intent.intent, visitedSections.size]);

  // Update message based on intent and lock state
  useEffect(() => {
    if (lock.locked) {
      setMessage('Scroll to continue or press Ctrl+K for Quick Nav');
    } else if (intent.intent === 'SEEKING') {
      setMessage('Keep scrolling to explore sections');
    } else if (intent.intent === 'SKIMMING') {
      setMessage('Press Ctrl+K for Quick Navigation');
    } else {
      setMessage('Scroll to explore');
    }
  }, [intent.intent, lock.locked]);

  // Show hint briefly when section locks
  useEffect(() => {
    if (lock.locked) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [lock.locked]);

  if (!visible) {
    return null;
  }

  return (
    <div
      className="scroll-hint"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="scroll-hint-content">
        <span className="scroll-hint-text">{message}</span>
        <span className="scroll-hint-icon" aria-hidden="true">
          ↓
        </span>
      </div>

      <style jsx>{`
        .scroll-hint {
          position: fixed;
          bottom: 48px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
          pointer-events: none;
          animation: fadeInUp 0.5s ease-out;
        }

        .scroll-hint-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: rgba(15, 23, 42, 0.92);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 12px;
          backdrop-filter: blur(12px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        }

        .scroll-hint-text {
          font-size: 14px;
          font-weight: 500;
          color: #f8fafc;
          text-align: center;
          white-space: nowrap;
        }

        .scroll-hint-icon {
          font-size: 20px;
          color: #14b8a6;
          animation: bounce 2s infinite;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translate(-50%, 20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-8px);
          }
          60% {
            transform: translateY(-4px);
          }
        }

        @media (max-width: 768px) {
          .scroll-hint {
            bottom: 32px;
          }

          .scroll-hint-content {
            padding: 10px 20px;
          }

          .scroll-hint-text {
            font-size: 13px;
          }

          .scroll-hint-icon {
            font-size: 18px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .scroll-hint,
          .scroll-hint-icon {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
