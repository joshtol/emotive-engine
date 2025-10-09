'use client';

import { useEffect, type ReactNode } from 'react';
import { useScrollExperience } from '@/components/hooks/useScrollExperience';
import { trackQuickNavEvent, type QuickNavAnalyticsEvent } from '@/lib/quicknav-analytics';

interface QuickNavOverlayProps {
  visible: boolean;
  onRequestClose: () => void;
  onTrack?: (event: QuickNavAnalyticsEvent) => void;
}

export default function QuickNavOverlay({ visible, onRequestClose, onTrack }: QuickNavOverlayProps) {
  const { sections, visitedSections, activeSection } = useScrollExperience();
  const emitTrack = onTrack ?? trackQuickNavEvent;

  const visitedCount = visitedSections.size;
  const totalSections = sections.length;

  const summaryLabel = totalSections === 0
    ? 'No sections available'
    : `${visitedCount} of ${totalSections} visited`;

  const handleSectionClick = (sectionId: string, index: number) => {
    emitTrack({ type: 'navigate', sectionId, index, source: 'click' });

    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    // Note: Don't close QuickNav - it should stay visible during SKIMMING
  };

  return (
    <nav className={`quick-nav ${visible ? '' : 'hidden'}`}>
      <h3>Quick Navigation</h3>
      <p className="quick-nav-summary">{summaryLabel}</p>
      <ul>
        {sections.map((section, index) => {
          const isVisited = visitedSections.has(section.id);
          const isActive = activeSection === section.id;

          return (
            <li
              key={section.id}
              className={`${isActive ? 'active' : ''} ${isVisited ? 'visited' : ''}`}
              onClick={() => handleSectionClick(section.id, index)}
            >
              {section.title}
            </li>
          );
        })}
      </ul>
      <style jsx>{`
        .quick-nav {
          position: fixed;
          top: 50%;
          right: 20px;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          padding: 20px 16px;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          z-index: 1000;
          max-width: 220px;
          opacity: 1;
          pointer-events: auto;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .quick-nav.hidden {
          opacity: 0;
          pointer-events: none;
          transform: translateY(-50%) translateX(20px);
        }

        .quick-nav h3 {
          font-size: 14px;
          color: #4090CE;
          margin: 0 0 8px 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
        }

        .quick-nav-summary {
          font-size: 11px;
          color: #64748b;
          margin: 0 0 12px 0;
        }

        .quick-nav ul {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .quick-nav li {
          padding: 8px 0;
          padding-left: 12px;
          font-size: 13px;
          color: #475569;
          cursor: pointer;
          transition: all 0.2s ease;
          border-left: 2px solid transparent;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .quick-nav li:hover {
          color: #4090CE;
          border-left-color: #4090CE;
          padding-left: 16px;
        }

        .quick-nav li.active {
          color: #4090CE;
          border-left-color: #4090CE;
          font-weight: 600;
        }

        .quick-nav li.visited::before {
          content: '✓ ';
          color: #84CFC5;
          font-weight: bold;
        }
      `}</style>
    </nav>
  );
}
