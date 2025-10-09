# Scroll Intent Event Model

## Purpose
Capture user scroll behavior snapshots (velocity, distance, direction) and translate them into high-level intents for page orchestration.

## Sampling Strategy
- Listen to passive `scroll` events and mirror values through `requestAnimationFrame` to normalize to roughly 60 Hz updates.
- Maintain a rolling window of the last 60 samples (~1 second at 60 fps) storing timestamp, scrollY, delta, and computed velocity.
- Derive velocity as `deltaPx / deltaTime` (pixels per second) and keep both absolute and signed values for direction awareness.

## Intent Classification
- **Exploring** - default browsing; velocity < 1200 px/s and per-sample delta < 400 px.
- **Seeking** - deliberate navigation; velocity 1200-4000 px/s or single delta >= 400 px.
- **Skimming** - rapid scanning; velocity > 4000 px/s or single delta >= 2000 px.
- **Idle** - no movement for >= 250 ms; used to kick lock timers or avatar idle cues.

## Confidence Model
- Confidence ranges 0-1 based on:
  - Ratio of samples supporting the current intent within the window.
  - Recency weighting (latest 10 samples count double).
  - Conflict penalty when more than 30% of the window disagrees with the active intent.
- Downshift confidence immediately after intent flips to avoid thrashing.

## Data Shape
```ts
interface ScrollIntentSample {
  timestamp: number;
  y: number;
  delta: number;
  velocity: number;
}

interface ScrollIntentState {
  intent: 'EXPLORING' | 'SEEKING' | 'SKIMMING' | 'IDLE';
  velocity: number;
  distance: number;
  confidence: number;
  samples: ScrollIntentSample[];
  up: boolean;
}
```
- `distance` accumulates travel since the last intent change to support lock buffers.
- `up` tracks direction switches for release rules and avatar path decisions.

## Lock Buffer Guidance
- Apply a 100 px soft buffer for locked sections; remain locked until the buffer is exceeded and confidence > 0.6 for SEEKING/SKIMMING.
- Trigger a hard break once the user travels > 100 px beyond the buffer regardless of confidence to prevent trapping.

## Telemetry Hooks
- Expose `onIntentChange`, `onConfidenceChange`, and `onHardBreak` callbacks for instrumentation or analytics.
- Provide a `debug` option that streams samples to a listener when `NODE_ENV !== 'production'`.

## Integration Touchpoints
- `useScrollIntent` hook (Phase 1) publishes the `ScrollIntentState`, cached samples, and telemetry callbacks.
- `useScrollLock` hook consumes `intent`, `distance`, and `confidence` to drive lock/release transitions. It exposes `{ state, lockSection, unlock }` with defaults of `buffer=100` and `lockThreshold=100` so sections can opt in without extra wiring; downstream listeners can tap `useScrollExperience` for shared access.
- `HomePage` (`site/src/app/page.tsx`) replaces manual scroll listeners with the hook; it now writes `data-scroll-intent` on the `<body>` element for lightweight consumers, feeds `ScrollExperienceProvider`, and cancels mascot paths when users start skimming.
- Avatar controller subscribes to intent transitions (e.g., fast-forward scenes on `SKIMMING`).
- Quick Navigation overlay listens for `SKIMMING` plus keyboard modifiers to open overlay.

## Open Questions
1. Do we need separate thresholds for touch vs wheel input?
2. Should `Seeking` and `Skimming` bridge to distinct avatar gestures or share a single fast path?
3. Where should global debug telemetry mount (console vs in-app panel)?

## Recipe to Modify
1. Adjust threshold constants in `INTENT_THRESHOLDS` and update associated documentation tables.
2. Extend unit tests under `__tests__/scroll-intent.test.ts` for new classifications.
3. Run `npm run test` to validate confidence scoring and buffer math.
4. Update this document plus registries referencing new intents when extending behavior.
\n**Integrations**\n- QuickNav overlay consumes ScrollExperience intent/lock state; skimming intent auto-opens the overlay and Ctrl/Cmd+K toggles it for keyboard navigation.\n

