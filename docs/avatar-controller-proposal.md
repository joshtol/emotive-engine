# AvatarController Site Contract

**Status**: Approved for implementation (Phase 2 - API contract)

The AvatarController coordinates the site scroll experience with the Emotive Engine mascot. It sits between the React app (via `ScrollExperienceProvider`) and the engine SDK, providing a typed, event-driven contract that downstream SDK work can rely on.

## Core Responsibilities

- Maintain a waypoint registry derived from ScrollExperience sections, including offsets, path anchors, and optional speed hints.
- Marshal scroll-intent decisions into mascot positioning commands (`moveToSection`, `stop`, `destroy`).
- Relay default gestures or emotion chains when a section lock is acquired.
- Surface lifecycle events (`onReady`, `onError`, `onPathStart`, `onPathComplete`, `onSectionEnter`, `onSectionLeave`).
- Provide imperative helpers for site UI (Quick Nav, Scroll Hint, Scene Layer) while guarding access to engine internals.

## Type Definitions

```ts
export interface SectionOffset {
  x: number;
  y: number;
}

export interface SectionMeta {
  id: string;                   // ScrollExperience section id
  title: string;                // Display label
  subtitle: string;             // Secondary label (QuickNav overlay, analytics)
  pathAnchor: number;           // 0-1 horizontal anchor multiplier
  offset: SectionOffset;        // Default engine offset relative to viewport
  speed?: number;               // Optional path speed override (px/s)
}

export interface GestureConfig {
  sectionId: string;
  emotion?: string;             // Default emotion when entering the section
  gesture?: string;             // Single gesture to play
  chain?: string;               // Gesture chain id (takes precedence over `gesture`)
  delayMs?: number;             // Optional debounce before gesture trigger
}

export interface AvatarControllerOptions {
  engine: EmotiveEngine;                              // Live SDK instance
  sections: SectionMeta[];                            // Registry from ScrollExperienceProvider
  getScrollExperience: () => ScrollExperienceValue;   // Lazy accessor to latest intent/lock state
  canvas: HTMLCanvasElement;                          // Mascot canvas element
  gestureRegistry?: GestureConfig[];                  // Optional default gestures per section
  onReady?: (controller: AvatarController) => void;
  onError?: (error: Error) => void;
}

export interface MoveToSectionOptions {
  immediate?: boolean;           // Skip animation when true
  reason?: 'quicknav' | 'lock' | 'scroll' | 'api';
}

export interface AvatarControllerEvents {
  onPathStart?: (sectionId: string) => void;
  onPathComplete?: (sectionId: string) => void;
  onSectionEnter?: (sectionId: string) => void;
  onSectionLeave?: (sectionId: string) => void;
}
```

The site wrapper injects events through composition:

```ts
new AvatarController({
  engine,
  sections,
  canvas,
  getScrollExperience,
  gestureRegistry,
  onReady,
  onError,
  ...events,
});
```

## Public API Surface

| Method | Description | Notes |
| --- | --- | --- |
| `init(options: AvatarControllerOptions & AvatarControllerEvents): Promise<void>` | Binds engine positioning, registers gestures, and hydrates waypoints. | Must be idempotent. Repeated calls rehydrate the registry. |
| `destroy(): void` | Cancels in-flight paths, removes listeners, clears registries. | Safe to call repeatedly. |
| `stop(): void` | Stops the active path without destroying configuration. | Used during route transitions or hard locks. |
| `moveToSection(sectionId: string, opts?: MoveToSectionOptions): Promise<void>` | Navigates the mascot to a section waypoint, using engine pathing when available. | Respects gesture registry and calls `onPathStart/Complete`. |
| `syncWithScroll(state: ScrollExperienceValue): void` | Consumes intent+lock+sections and auto-moves when locks or skimming demands it. | Invoked by Home page effect on every state change. |
| `setEmotion(emotion: string): void` | Set active emotion on the mascot. | No-op if engine emotion controller missing. |
| `express(gestureId: string, options?: { chain?: boolean }): void` | Trigger a gesture or chain explicitly. | Ignores redundant triggers while chain is running. |
| `updateSections(sections: SectionMeta[]): void` | Recomputes waypoint registry and refreshes anchors. | Used when layout changes or responsive breakpoints shift offsets. |
| `registerGestures(registry: GestureConfig[]): void` | Override or extend default gestures post-init. | Clears previous map before applying. |

## Internal Behaviours

- **Waypoint resolution**: `buildWaypoint(section: SectionMeta)` clamps anchors to 8-92% of viewport width and stores speed/offset hints for reuse.
- **Pathing**: Prefers `engine.positionController.getElementTargeting().moveToElementWithPath`. Falls back to `setOffset` if targeting is unavailable.
- **Lock integration**: When ScrollLock reports a new section, the controller automatically calls `moveToSection` unless an explicit navigation is in progress.
- **Error handling**: All engine calls are wrapped; unknown errors feed `onError` and are rethrown only in development.
- **Cleanup**: `destroy` unsubscribes listeners, cancels animation handles, and resets the gesture registry map.

## Analytics & Quick Nav

Quick Nav navigation emits analytics records via `trackQuickNavEvent` (see `site/src/lib/quicknav-analytics.ts`). When the overlay triggers `onTrack`, the Home page re-emits through the tracker so downstream listeners receive:

```ts
export interface QuickNavAnalyticsRecord {
  type: 'open' | 'close' | 'navigate';
  source?: 'click' | 'hotkey' | 'command' | 'auto-skimming';
  reason?: 'escape' | 'backdrop' | 'button' | 'toggle';
  sectionId?: string;
  index?: number;
  timestamp: number;
}
```

The AvatarController should eventually expose cue hooks (for example `onCueRequired(sectionId, gimbalState)`) so the overlay can validate that the engine acknowledged a navigation before marking a section as "locked." This remains an open item for Phase 2 implementation.

## Next Steps

1. **Engine SDK alignment** - expose a typed `SiteController` wrapper that mirrors the AvatarController method signatures (`moveToElementWithPath`, `setOffset`, gesture helpers).
2. **Cue hooks** - add explicit callbacks from the controller when a waypoint path completes to update Quick Nav progress badges in real time.
3. **Scene orchestration** - once Phase 3 begins, layer the scene manager within `syncWithScroll` so section locks can spawn or dispose scenes.

This contract supersedes earlier drafts and should be treated as the canonical reference for Phase 2 SDK and site integration work.
