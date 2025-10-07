# Emotive Engine Site Integration Master Plan

## Phase 0 · Alignment & Setup
- [ ] [SITE] Confirm spec baseline (<code>site-reimagine.md</code>) and document gaps vs original request.
  - Notes: Align Claude structure with Tailwind utility workflow; plan to replace single CSS file with Tailwind  modules and component-level styles.
- [ ] [SITE] Inventory current site routes/components; capture screenshots or screen recordings.
  - Notes: Routes: / (home), /demo, /use-cases; key UI in site/src/components (HeroMascot, sections, HUD) with layouts under site/src/app. Capture visuals later if required.
- [ ] [ENGINE] Validate engine build currently served at <code>site/public/emotive-engine.js</code> and identify SDK delta.
  - Notes: Confirm bundle originates from root build (Rollup config) and that replacing with SDK export keeps demo intact; plan to rerun npm run build after modifications.
- [ ] [ALL] Align expectations on success metrics (demo flow, avatar behavior, analytics).
  - Notes: ______________________________________________________________________

## Phase 1 · Scroll Intent & Lock System
- [ ] [SITE] Draft event model (velocity sampling, dwell window, thresholds).
  - Notes: Sample scroll every 100ms; track last 60 events; classify intents as Exploring (<1200px/s), Seeking (1200-4000px/s or >400px delta), Skimming (>4000px/s or >2000px delta); include ±100px buffer for lock dwell and hard break after 100px beyond buffer.
- [ ] [SITE] Implement <code>useScrollIntent</code> hook returning intent, velocity, confidence.
  - Notes: Hook reads passive scroll listener + rAF sampler, returns state {intent, velocity, distance, confidence}; expose event timestamps for lock manager; Debounce updates to 60fps and provide cleanup. 
- [ ] [SITE] Implement <code>useScrollLock</code> hook managing section lock/release, buffer windows.
  - Notes: Maintain state machine (flowing vs locked); accept lockThreshold=100, buffer=±100; expose lock(), unlock(), onHardBreak callback; integrate with intent (seeking/skimming triggers unlock).
- [ ] [SITE] Create Quick Navigation controller (overlay toggle, section metadata).
  - Notes: Controller consumes sections registry {id,title,waypoint}; listens to intent (skimming) + keyboard to toggle; ensures focus trap + Tailwind overlay components.*
- [ ] [SITE] Integrate hooks into <code>HomePage</code> replacing direct <code>window.scroll</code> wiring.
  - Notes: Replace manual scroll listener with useScrollIntent/useScrollLock providers; share context for sections + pass to Avatar controller; ensure cleanup on unmount.
- [ ] [SITE] QA scenarios: slow explore, rapid skim, keyboard nav, touch scroll.
  - Notes: Test desktop wheel vs trackpad, mobile touch inertia, keyboard PgUp/PgDn, summary overlay activation, lock break thresholds across breakpoints.

## Phase 2 · Avatar Orchestration Layer
- [ ] [SITE] Specify API contract for <code>AvatarController</code> (path, gestures, emotions, callbacks).
  - Notes: ______________________________________________________________________
- [ ] [ENGINE] Implement controller wrapper in the engine SDK with forward/reverse path support.
  - Notes: Provide EmotiveEngine.SiteController class bridging to pathTo/pathReverse; accept waypoints config, maintain cleanup, expose async init returning engine instance. Ensure compatibility with existing demo initialization.
  - **Pause:** Confirm desired method names, return types, and scene callbacks before coding the wrapper.
- [ ] [SITE] Refactor <code>HeroMascot</code> into canvas host plus controller bootstrap.
  - Notes: ______________________________________________________________________
- [ ] [SITE] Migrate section targeting logic into controller waypoint registry.
  - Notes: ______________________________________________________________________
- [ ] [SITE] Add watchdog for cleanup (<code>stop</code>, <code>destroy</code>, route transitions).
  - Notes: ______________________________________________________________________
- [ ] [SITE] Validate: resume on focus, window resize, mobile orientation.
  - Notes: ______________________________________________________________________

## Phase 3 · Scene System & Canvas Demos
- [ ] [SITE] Define scene interface (<code>init</code>, <code>update</code>, <code>handleIntent</code>, <code>dispose</code>).
  - Notes: ______________________________________________________________________
- [ ] [SITE] Implement base scene manager with lifecycle tied to scroll lock states.
  - Notes: ______________________________________________________________________
- [ ] [SITE] Build individual scenes:
  - **Pause:** Align on interaction beats, UI references, and success criteria for each scene before implementation.
  - [ ] [SITE] Retail Checkout Canvas demo.
    - Notes: _________________________________________________________________
  - [ ] [SITE] Healthcare Form Canvas demo.
    - Notes: _________________________________________________________________
  - [ ] [SITE] Education Tutor Canvas demo.
    - Notes: _________________________________________________________________
  - [ ] [SITE] Smart Home Dashboard Canvas demo.
    - Notes: _________________________________________________________________
  - [ ] [SITE] Automotive Dashboard Canvas demo.
    - Notes: _________________________________________________________________
- [ ] [SITE] Wire scene completion to scroll unlock plus avatar call-to-action.
  - Notes: ______________________________________________________________________
- [ ] [ALL] Performance test (FPS, memory) across scenes.
  - Notes: ______________________________________________________________________

## Phase 4 · Experience Layer & UI Enhancements
- [ ] [SITE] Implement Scroll Hint plus avatar prompt alignment.
  - Notes: ______________________________________________________________________
- [ ] [SITE] Build Quick Nav overlay (sections, progress ring, jump actions).
  - Notes: ______________________________________________________________________
  - **Pause:** Confirm overlay layout, activation triggers, and keyboard behaviour before wiring UI state.
- [ ] [SITE] Translate Claude's CSS concepts into Tailwind utility classes and modular @layer files (avoid a single monolithic stylesheet).
  - Notes: ______________________________________________________________________
- [ ] [SITE] Add Summary button (60s mode) with condensed scene playback.
  - Notes: ______________________________________________________________________
  - **Pause:** Define exact summary script, gestures, and timing expectations before implementation.
- [ ] [SITE] Create progress indicator or timeline synced with intent state.
  - Notes: ______________________________________________________________________
- [ ] [SITE] Integrate MessageHUD with intent updates, avatar cues.
  - Notes: ______________________________________________________________________
- [ ] [SITE] Accessibility review (focus order, ARIA roles, reduced motion).
  - Notes: ______________________________________________________________________

## Phase 5 · Engine Enhancements Required
- [ ] [ENGINE] Publish typed SDK module (<code>src/sdk/site-controller.ts</code>).
  - Notes: ______________________________________________________________________
  - **Pause:** Lock in exported API surface (class vs factory, init flow) so we stay aligned with the demo requirements.
- [ ] [ENGINE] Add timeline-aware <code>pathTo</code> with reversal and easing presets.
  - Notes: ______________________________________________________________________
- [ ] [ENGINE] Expose intent listeners (<code>onScrollIntentChange</code>, <code>onSceneState</code>).
  - Notes: ______________________________________________________________________
- [ ] [ENGINE] Provide scene helper API (resource pooling, RAF scheduling).
  - Notes: ______________________________________________________________________
- [ ] [ENGINE] Extend configuration registry for quick nav or lock thresholds.
  - Notes: ______________________________________________________________________
- [ ] [ENGINE] Regression test rhythm demo and legacy integrations.
  - Notes: ______________________________________________________________________

## Phase 6 · Content & Documentation
- [ ] [SITE] Update acquisition demo spec with implemented architecture plus deltas.
  - Notes: ______________________________________________________________________
- [ ] [SITE] Create contributor guide: scroll-intent, avatar controller, scenes.
  - Notes: ______________________________________________________________________
- [ ] [SITE] Produce <code>_template.ts</code> files for scenes, intent-aware sections.
  - Notes: ______________________________________________________________________
- [ ] [SITE] Record walkthrough (video or GIF) demonstrating flows.
  - Notes: ______________________________________________________________________
- [ ] [ENGINE] Document engine upgrades in <code>ENGINE_CONFIG</code> and SDK README.
  - Notes: ______________________________________________________________________

## Phase 7 · Validation & Launch
- [ ] [SITE] Automated tests (unit for hooks, integration for controller).
  - Notes: ______________________________________________________________________
- [ ] [SITE] Manual QA matrix (desktop, tablet, mobile, throttled network).
  - Notes: ______________________________________________________________________
- [ ] [SITE] Verify analytics or events (scroll intent, scene completions).
  - Notes: ______________________________________________________________________
  - **Pause:** Choose event names, payloads, and logging target before instrumenting.
- [ ] [ALL] Prepare rollback plan (feature flag, import toggle).
  - Notes: ______________________________________________________________________
- [ ] [ALL] Final review and personal sign-off.
  - Notes: ______________________________________________________________________
- [ ] [SITE] Deploy preview, collect feedback, launch production.
  - Notes: ______________________________________________________________________

---

# Build & Run Checklist
- After any **[ENGINE]** change: from repo root run <code>npm run build</code> and confirm <code>site/public/emotive-engine.js</code> updates.
- After any **[SITE]** change: in <code>site/</code> run <code>npm run dev</code> (or restart the dev server) and verify updates in the browser.

---
# Reference Implementation Snippets (Claude Spec)
*Note: adapt these layouts to Tailwind utility classes and scoped  files rather than a single global stylesheet.*


## File Structure
~~~text
/emotive-demo/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── scroll-intent-detector.js
│   ├── avatar-controller.js
│   ├── scene-manager.js
│   ├── scenes/
│   │   ├── retail-scene.js
│   │   ├── healthcare-scene.js
│   │   ├── education-scene.js
│   │   ├── smart-home-scene.js
│   │   └── automotive-scene.js
│   └── main.js
└── README.md
~~~

## HTML Skeleton (index.html)
~~~html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Emotive Engine - Real-Time Emotional AI</title>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>
    <div id="avatar-container">
        <div id="avatar">🤖</div>
        <div id="avatar-speech" class="avatar-speech"></div>
        <div id="gesture-indicator" class="gesture-indicator"></div>
    </div>
    <nav id="quick-nav" class="quick-nav hidden">
        <h3>Quick Navigation</h3>
        <ul id="nav-list"></ul>
    </nav>
    <div id="scroll-hint" class="scroll-hint">
        <div class="scroll-hint-text">Scroll to explore</div>
        <div class="scroll-arrow">↓</div>
    </div>
    <header class="header">
        <div class="logo">
            <div class="logo-mark">E</div>
            <span>Emotive Engine</span>
        </div>
        <button id="summary-btn" class="summary-btn hidden">60s Summary</button>
    </header>
    <section id="section-0" class="section hero" data-waypoint="0" data-scene-type="intro">
        <div class="hero-badge">REAL-TIME EMOTIONAL AI</div>
        <h1>Meet Your AI Guide</h1>
        <p class="subtitle">I'll show you around. Try scrolling—I respond to your pace and can interact with everything you see.</p>
        <p class="subtitle-hint">Scroll fast to skip ahead, or take your time to explore each demo.</p>
    </section>
    <!-- Additional sections omitted for brevity -->
    <script src="js/main.js" type="module"></script>
</body>
</html>
~~~

## Scroll Intent Detector (js/scroll-intent-detector.js)
~~~javascript
export class ScrollIntentDetector {
    constructor({ onIntentChange, onScroll, samplingInterval = 100 } = {}) {
        this.onIntentChange = onIntentChange;
        this.onScroll = onScroll;
        this.samplingInterval = samplingInterval;
        this.scrollPositions = [];
        this.lastIntent = 'EXPLORING';
        this.isLocked = false;
        this.init();
    }

    init() {
        window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
        this.sampler = setInterval(() => this.sampleScroll(), this.samplingInterval);
    }

    handleScroll() {
        const position = window.scrollY;
        const timestamp = performance.now();
        this.scrollPositions.push({ position, timestamp });
        if (this.scrollPositions.length > 60) {
            this.scrollPositions.shift();
        }
        this.onScroll?.(position);
    }

    sampleScroll() {
        if (this.scrollPositions.length < 2) return;
        const latest = this.scrollPositions[this.scrollPositions.length - 1];
        const previous = this.scrollPositions[0];
        const distance = latest.position - previous.position;
        const time = (latest.timestamp - previous.timestamp) / 1000;
        const velocity = distance / Math.max(time, 0.01);
        const intent = this.classifyIntent(velocity, distance);
        if (intent !== this.lastIntent) {
            this.lastIntent = intent;
            this.onIntentChange?.(intent, { velocity, distance });
        }
    }

    classifyIntent(velocity, distance) {
        const absVelocity = Math.abs(velocity);
        const absDistance = Math.abs(distance);
        if (absVelocity > 4000 || absDistance > 2000) return 'SKIMMING';
        if (absVelocity > 1200 || absDistance > 400) return 'SEEKING';
        return 'EXPLORING';
    }

    destroy() {
        window.removeEventListener('scroll', this.handleScroll);
        clearInterval(this.sampler);
    }
}
~~~

## Avatar Controller (js/avatar-controller.js)
~~~javascript
export class AvatarController {
    constructor({ engine, scenes, scrollIntentDetector }) {
        this.engine = engine;
        this.scenes = scenes;
        this.scrollIntentDetector = scrollIntentDetector;
        this.currentWaypoint = 0;
        this.isLocked = false;
        this.pathHistory = [];
        this.init();
    }

    async init() {
        await this.engine.initialize();
        this.bindEvents();
        this.gotoWaypoint(0);
    }

    bindEvents() {
        this.scrollIntentDetector.onIntentChange = (intent, meta) => {
            switch (intent) {
                case 'EXPLORING':
                    this.handleExploring(meta);
                    break;
                case 'SEEKING':
                    this.handleSeeking(meta);
                    break;
                case 'SKIMMING':
                    this.handleSkimming(meta);
                    break;
            }
        };
    }

    gotoWaypoint(index, reverse = false) {
        const waypoint = waypoints[index];
        if (!waypoint) return;
        this.currentWaypoint = index;
        this.engine.moveTo(waypoint.position, { reverse, easing: 'easeInOutCubic' });
        this.engine.setEmotion(waypoint.emotion);
        this.engine.performGesture(waypoint.gesture);
        if (waypoint.scene) {
            this.scenes.activate(waypoint.scene, { reverse });
        }
    }

    handleExploring(_meta) {
        if (!this.isLocked) {
            this.engine.setTempo?.('normal');
        }
    }

    handleSeeking(_meta) {
        if (!this.isLocked) {
            this.gotoWaypoint(this.currentWaypoint + 1);
        }
    }

    handleSkimming(_meta) {
        this.scenes.deactivateCurrent?.();
        this.engine.cancelLocks?.();
    }
}
~~~

## Scene Manager (js/scene-manager.js)
~~~javascript
export class SceneManager {
    constructor({ canvasContainer }) {
        this.canvasContainer = canvasContainer;
        this.activeScene = null;
        this.scenes = new Map();
    }

    register(name, sceneFactory) {
        this.scenes.set(name, sceneFactory);
    }

    activate(name, options = {}) {
        if (this.activeScene) {
            this.activeScene.dispose();
        }
        const factory = this.scenes.get(name);
        if (!factory) return;
        this.activeScene = factory();
        this.activeScene.init(this.canvasContainer, options);
    }

    deactivateCurrent() {
        if (this.activeScene) {
            this.activeScene.dispose();
            this.activeScene = null;
        }
    }
}
~~~

## Main Application Controller (js/main.js)
~~~javascript
import { ScrollIntentDetector } from './scroll-intent-detector.js';
import { AvatarController } from './avatar-controller.js';
import { SceneManager } from './scene-manager.js';
import { createRetailScene } from './scenes/retail-scene.js';
import { createHealthcareScene } from './scenes/healthcare-scene.js';
import { createEducationScene } from './scenes/education-scene.js';
import { createSmartHomeScene } from './scenes/smart-home-scene.js';
import { createAutomotiveScene } from './scenes/automotive-scene.js';

const canvasContainer = document.querySelector('#avatar-container');
const sceneManager = new SceneManager({ canvasContainer });
sceneManager.register('retail', createRetailScene);
sceneManager.register('healthcare', createHealthcareScene);
sceneManager.register('education', createEducationScene);
sceneManager.register('smart-home', createSmartHomeScene);
sceneManager.register('automotive', createAutomotiveScene);

const scrollIntentDetector = new ScrollIntentDetector();
const emotiveEngine = new EmotiveEngine({ canvas: canvasContainer });
const avatarController = new AvatarController({
    engine: emotiveEngine,
    scenes: sceneManager,
    scrollIntentDetector
});

scrollIntentDetector.onIntentChange = (intent) => {
    document.body.dataset.scrollIntent = intent.toLowerCase();
};
~~~

## Retail Scene Example (js/scenes/retail-scene.js)
~~~javascript
export function createRetailScene() {
    let ctx;
    let animationFrame;

    return {
        init(container) {
            const canvas = document.createElement('canvas');
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
            container.appendChild(canvas);
            ctx = canvas.getContext('2d');
            this.animate();
        },

        animate() {
            animationFrame = requestAnimationFrame(() => this.animate());
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.fillStyle = '#FF6B9D';
            ctx.fillRect(100, 100, 200, 300);
        },

        handleIntent(intent) {
            if (intent === 'SKIMMING') {
                this.fastForward();
            }
        },

        fastForward() {
            // Implement accelerated animations
        },

        dispose() {
            cancelAnimationFrame(animationFrame);
            ctx?.canvas.remove();
        }
    };
}
~~~

## Configuration Hook (excerpt)
~~~javascript
const waypoints = [
    {
        id: 'hero',
        selector: '#section-0',
        gesture: 'wave',
        emotion: 'friendly',
        scene: 'intro',
        lock: true
    },
    {
        id: 'retail',
        selector: '#section-1',
        gesture: 'point',
        emotion: 'confident',
        scene: 'retail',
        lock: true
    },
    // ...additional waypoints
];
~~~

## Scroll Lock Threshold
~~~javascript
const LOCK_THRESHOLD = 100; // Pixels before breaking lock
~~~

## Avatar Path Integration Snippet
~~~javascript
moveTo(x, y, immediate) {
    emotiveEngine.pathTo(x, y, {
        duration: immediate ? 0 : 600,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    });
}
~~~

---

*Use this document as the working blueprint; check items off, capture decisions in the notes fields, and reference the Claude-generated snippets while adapting them to the Next.js site and engine SDK.*
