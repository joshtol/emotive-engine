export type QuickNavAnalyticsAction = 'open' | 'close' | 'navigate';
export type QuickNavAnalyticsSource = 'click' | 'hotkey' | 'command' | 'auto-skimming';
export type QuickNavAnalyticsReason = 'escape' | 'backdrop' | 'button' | 'toggle';

export interface QuickNavAnalyticsEvent {
  type: QuickNavAnalyticsAction;
  sectionId?: string;
  index?: number;
  source?: QuickNavAnalyticsSource;
  reason?: QuickNavAnalyticsReason;
}

export interface QuickNavAnalyticsRecord extends QuickNavAnalyticsEvent {
  timestamp: number;
}

type QuickNavAnalyticsListener = (record: QuickNavAnalyticsRecord) => void;

const listeners = new Set<QuickNavAnalyticsListener>();

export function trackQuickNavEvent(event: QuickNavAnalyticsEvent): QuickNavAnalyticsRecord {
  const record: QuickNavAnalyticsRecord = {
    ...event,
    timestamp: Date.now(),
  };

  listeners.forEach((listener) => {
    try {
      listener(record);
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('QuickNav analytics listener error', error);
      }
    }
  });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('emotive:quicknav', { detail: record }));
  }

  return record;
}

export function onQuickNavEvent(listener: QuickNavAnalyticsListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
