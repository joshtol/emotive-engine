# Emotive Engine - Acquisition Demo Site
## Full Implementation Specification

## Overview
A scroll-based interactive demo that showcases Emotive Engine's real-time AI avatar capabilities through live use case demonstrations. The avatar guides users through the site, responds to scroll behavior, and performs role-specific demos in Canvas2D scenes.

## Core Concepts

### 1. Scroll Intent Detection
The system detects three user intents:
- **EXPLORING**: Slow, deliberate scrolling → Full demos with scroll locks
- **SEEKING**: Fast purposeful scrolling → Bypasses locks, efficient navigation
- **SKIMMING**: Rapid continuous scrolling → Minimal interference, quick nav offered

### 2. Scroll Lock Hybrid System
- **Flowing State**: Normal scroll between sections
- **Locked State**: Section "sticks" with soft resistance for interaction
- **Soft Scroll Buffer**: ±100px of scroll within locked section triggers micro-interactions
- **Hard Scroll**: >100px breaks lock and continues to next section

### 3. Canvas2D Use Case Scenes
Each use case is a simplified interactive canvas where the avatar performs its role:
- Retail Checkout
- Healthcare Form
- Education Tutor
- Smart Home Dashboard
- Automotive Dashboard

### 4. Bidirectional Animation
Avatar paths work forward and reverse with scroll direction.

## Technical Architecture

### File Structure
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

## Implementation Details

### HTML Structure (index.html)
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Emotive Engine - Real-Time Emotional AI</title>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>
    <!-- Avatar Container (Fixed) -->
    <div id="avatar-container">
        <div id="avatar">🤖</div>
        <div id="avatar-speech" class="avatar-speech"></div>
        <div id="gesture-indicator" class="gesture-indicator"></div>
    </div>

    <!-- Quick Navigation Overlay (Hidden by default) -->
    <nav id="quick-nav" class="quick-nav hidden">
        <h3>Quick Navigation</h3>
        <ul id="nav-list"></ul>
    </nav>

    <!-- Scroll Hint -->
    <div id="scroll-hint" class="scroll-hint">
        <div class="scroll-hint-text">Scroll to explore</div>
        <div class="scroll-arrow">↓</div>
    </div>

    <!-- Header -->
    <header class="header">
        <div class="logo">
            <div class="logo-mark">E</div>
            <span>Emotive Engine</span>
        </div>
        <button id="summary-btn" class="summary-btn hidden">60s Summary</button>
    </header>

    <!-- Section 0: Hero -->
    <section id="section-0" class="section hero" data-waypoint="0" data-scene-type="intro">
        <div class="hero-badge">REAL-TIME EMOTIONAL AI</div>
        <h1>Meet Your AI Guide</h1>
        <p class="subtitle">I'll show you around. Try scrolling—I respond to your pace and can interact with everything you see.</p>
        <p class="subtitle-hint">Scroll fast to skip ahead, or take your time to explore each demo.</p>
    </section>

    <!-- Section 1: The Difference -->
    <section id="section-1" class="section" data-waypoint="1" data-scene-type="comparison">
        <h2 class="section-title">What Makes This Different?</h2>
        <p class="section-subtitle">Most AI avatars are pre-recorded videos. I'm live, reactive, and intelligent.</p>
        
        <div class="comparison-grid">
            <div class="comparison-card" data-target="traditional">
                <div class="card-icon">🎬</div>
                <h3>Traditional Avatars</h3>
                <p>Pre-recorded video playback with no real-time interaction or contextual awareness.</p>
            </div>
            <div class="comparison-card highlight" data-target="emotive">
                <div class="card-icon">⚡</div>
                <h3>Emotive Engine</h3>
                <p>Live pathfinding, element targeting, and gesture control responding to user behavior in real-time.</p>
            </div>
        </div>
    </section>

    <!-- Section 2: Technical Specs -->
    <section id="section-2" class="section tech-section" data-waypoint="2" data-scene-type="specs">
        <h2 class="section-title">Built for Performance</h2>
        <p class="section-subtitle">Enterprise-grade specifications</p>
        
        <div class="spec-grid">
            <div class="spec-card" data-target="spec-fps">
                <div class="spec-value">60</div>
                <div class="spec-label">FPS</div>
                <div class="spec-desc">Smooth animation at all times</div>
            </div>
            <div class="spec-card" data-target="spec-gpu">
                <div class="spec-value">0</div>
                <div class="spec-label">GPU Required</div>
                <div class="spec-desc">Runs on any device</div>
            </div>
            <div class="spec-card" data-target="spec-emotions">
                <div class="spec-value">15+</div>
                <div class="spec-label">Emotions</div>
                <div class="spec-desc">Core emotion models</div>
            </div>
            <div class="spec-card" data-target="spec-gestures">
                <div class="spec-value">50+</div>
                <div class="spec-label">Gestures</div>
                <div class="spec-desc">Natural animations</div>
            </div>
        </div>
    </section>

    <!-- Section 3: Retail Use Case -->
    <section id="section-3" class="section canvas-section" data-waypoint="3" data-scene-type="retail">
        <h2 class="section-title">Retail Assistant</h2>
        <p class="section-subtitle">Watch me work a checkout counter in real-time</p>
        
        <div class="canvas-container">
            <canvas id="retail-canvas" width="400" height="600"></canvas>
            <div class="interaction-hint">
                <p>💡 <strong>Try this:</strong></p>
                <ul>
                    <li>Scroll slightly to scan items</li>
                    <li>Click products to see details</li>
                    <li>Click checkout to complete</li>
                </ul>
            </div>
        </div>
    </section>

    <!-- Section 4: Healthcare Use Case -->
    <section id="section-4" class="section canvas-section" data-waypoint="4" data-scene-type="healthcare">
        <h2 class="section-title">Healthcare Assistant</h2>
        <p class="section-subtitle">Compassionate patient support with emotional awareness</p>
        
        <div class="canvas-container">
            <canvas id="healthcare-canvas" width="400" height="600"></canvas>
            <div class="interaction-hint">
                <p>💡 <strong>Try this:</strong></p>
                <ul>
                    <li>Click pain ratings to see empathy</li>
                    <li>Scroll through form fields</li>
                    <li>Watch emotion adaptation</li>
                </ul>
            </div>
        </div>
    </section>

    <!-- Section 5: Education Use Case -->
    <section id="section-5" class="section canvas-section" data-waypoint="5" data-scene-type="education">
        <h2 class="section-title">Education Tutor</h2>
        <p class="section-subtitle">Adaptive teaching that responds to student needs</p>
        
        <div class="canvas-container">
            <canvas id="education-canvas" width="400" height="600"></canvas>
            <div class="interaction-hint">
                <p>💡 <strong>Try this:</strong></p>
                <ul>
                    <li>Click wrong answer to see encouragement</li>
                    <li>Click "I'm stuck" for help</li>
                    <li>Get right answer for celebration</li>
                </ul>
            </div>
        </div>
    </section>

    <!-- Section 6: Smart Home Use Case -->
    <section id="section-6" class="section canvas-section" data-waypoint="6" data-scene-type="smart-home">
        <h2 class="section-title">Smart Home Control</h2>
        <p class="section-subtitle">Natural interaction with your connected devices</p>
        
        <div class="canvas-container">
            <canvas id="smart-home-canvas" width="400" height="600"></canvas>
            <div class="interaction-hint">
                <p>💡 <strong>Try this:</strong></p>
                <ul>
                    <li>Click lights to toggle</li>
                    <li>Adjust thermostat</li>
                    <li>Lock/unlock doors</li>
                </ul>
            </div>
        </div>
    </section>

    <!-- Section 7: Automotive Use Case -->
    <section id="section-7" class="section canvas-section" data-waypoint="7" data-scene-type="automotive">
        <h2 class="section-title">Automotive Safety</h2>
        <p class="section-subtitle">Driver emotion monitoring for enhanced safety</p>
        
        <div class="canvas-container">
            <canvas id="automotive-canvas" width="400" height="600"></canvas>
            <div class="interaction-hint">
                <p>💡 <strong>Try this:</strong></p>
                <ul>
                    <li>Simulate stress levels</li>
                    <li>Watch safety interventions</li>
                    <li>See fatigue detection</li>
                </ul>
            </div>
        </div>
    </section>

    <!-- Section 8: Technical Moat -->
    <section id="section-8" class="section" data-waypoint="8" data-scene-type="moat">
        <h2 class="section-title">The Technical Moat</h2>
        <p class="section-subtitle">What you're seeing would take 18-24 months to build from scratch</p>
        
        <div class="moat-grid">
            <div class="moat-card" data-target="moat-1">
                <h3>Real-Time Pathfinding</h3>
                <p>Algorithms that calculate optimal movement paths between UI elements, adjusting for scroll position and viewport changes.</p>
            </div>
            <div class="moat-card" data-target="moat-2">
                <h3>Element Targeting System</h3>
                <p>Intelligent DOM and canvas targeting that allows the avatar to point to, highlight, or interact with any element.</p>
            </div>
            <div class="moat-card" data-target="moat-3">
                <h3>Bidirectional Animation</h3>
                <p>Gestures and movements that work seamlessly forward and reverse, synchronized with scroll behavior.</p>
            </div>
            <div class="moat-card" data-target="moat-4">
                <h3>Intent Detection</h3>
                <p>Smart scroll analysis that understands user intent and adapts behavior—no blocking when you're in a hurry.</p>
            </div>
        </div>
    </section>

    <!-- Section 9: CTA -->
    <section id="section-9" class="section cta-section" data-waypoint="9" data-scene-type="cta">
        <h2 class="cta-title">Ready to Integrate?</h2>
        <p class="cta-text">This technology is production-ready today.<br>Schedule a technical deep-dive with our team.</p>
        <button class="cta-button">Request Technical Demo</button>
        <p class="cta-subtext">Average integration time: 2-3 weeks</p>
    </section>

    <!-- Scripts -->
    <script src="js/scroll-intent-detector.js"></script>
    <script src="js/avatar-controller.js"></script>
    <script src="js/scene-manager.js"></script>
    <script src="js/scenes/retail-scene.js"></script>
    <script src="js/scenes/healthcare-scene.js"></script>
    <script src="js/scenes/education-scene.js"></script>
    <script src="js/scenes/smart-home-scene.js"></script>
    <script src="js/scenes/automotive-scene.js"></script>
    <script src="js/main.js"></script>
</body>
</html>
CSS (css/styles.css)
css* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    background: #ffffff;
    color: #1a1a2e;
    overflow-x: hidden;
    line-height: 1.6;
}

/* Avatar Container */
#avatar-container {
    position: fixed;
    width: 80px;
    height: 80px;
    z-index: 1000;
    pointer-events: none;
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

#avatar-container.seeking {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

#avatar {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #4090CE 0%, #84CFC5 100%);
    border-radius: 50%;
    box-shadow: 0 10px 40px rgba(64, 144, 206, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40px;
    position: relative;
}

.avatar-speech {
    position: absolute;
    top: -70px;
    left: 50%;
    transform: translateX(-50%);
    background: white;
    border: 2px solid #4090CE;
    padding: 10px 16px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 600;
    color: #1a1a2e;
    white-space: nowrap;
    opacity: 0;
    transition: opacity 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    pointer-events: none;
    max-width: 250px;
    white-space: normal;
    text-align: center;
}

.avatar-speech::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 8px solid #4090CE;
}

.avatar-speech.active {
    opacity: 1;
}

.gesture-indicator {
    position: absolute;
    bottom: -30px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(26, 26, 46, 0.9);
    color: white;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 10px;
    font-weight: 600;
    white-space: nowrap;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.gesture-indicator.active {
    opacity: 1;
}

/* Quick Navigation */
.quick-nav {
    position: fixed;
    top: 50%;
    right: 20px;
    transform: translateY(-50%);
    background: rgba(255, 255, 255, 0.95);
    border: 2px solid #4090CE;
    border-radius: 16px;
    padding: 20px;
    z-index: 900;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    max-width: 250px;
    transition: opacity 0.3s ease, transform 0.3s ease;
}

.quick-nav.hidden {
    opacity: 0;
    pointer-events: none;
    transform: translateY(-50%) translateX(20px);
}

.quick-nav h3 {
    font-size: 14px;
    color: #4090CE;
    margin-bottom: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.quick-nav ul {
    list-style: none;
}

.quick-nav li {
    padding: 8px 0;
    font-size: 13px;
    color: #475569;
    cursor: pointer;
    transition: all 0.2s ease;
    border-left: 2px solid transparent;
    padding-left: 12px;
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
}

/* Scroll Hint */
.scroll-hint {
    position: fixed;
    bottom: 40px;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    z-index: 100;
    animation: fadeInOut 2s ease-in-out infinite;
    transition: opacity 0.3s ease;
}

.scroll-hint.hidden {
    opacity: 0;
    pointer-events: none;
}

.scroll-hint-text {
    font-size: 14px;
    color: #64748b;
    margin-bottom: 8px;
    font-weight: 600;
}

.scroll-arrow {
    font-size: 24px;
    color: #4090CE;
    animation: bounce 1.5s ease-in-out infinite;
}

@keyframes fadeInOut {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
}

@keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(10px); }
}

/* Header */
.header {
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #ffffff;
    border-bottom: 1px solid #e5e7eb;
    position: sticky;
    top: 0;
    z-index: 50;
}

.logo {
    font-size: 18px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 10px;
    color: #1a1a2e;
}

.logo-mark {
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, #4090CE 0%, #84CFC5 100%);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-size: 18px;
}

.summary-btn {
    padding: 8px 16px;
    background: #4090CE;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.summary-btn:hover {
    background: #3680BE;
    transform: translateY(-1px);
}

.summary-btn.hidden {
    display: none;
}

/* Sections */
.section {
    min-height: 100vh;
    padding: 80px 20px;
    position: relative;
    scroll-snap-align: start;
    transition: all 0.3s ease;
}

.section.locked {
    scroll-snap-align: center;
}

/* Hero Section */
.hero {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
}

.hero-badge {
    display: inline-block;
    padding: 8px 16px;
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    color: #4090CE;
    margin-bottom: 24px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
}

h1 {
    font-size: 36px;
    font-weight: 700;
    margin-bottom: 16px;
    letter-spacing: -0.5px;
    color: #1a1a2e;
    line-height: 1.2;
}

.subtitle {
    font-size: 18px;
    color: #64748b;
    margin-bottom: 16px;
    line-height: 1.6;
    max-width: 600px;
}

.subtitle-hint {
    font-size: 14px;
    color: #94a3b8;
    font-style: italic;
}

/* Section Headers */
.section-title {
    font-size: 28px;
    font-weight: 700;
    color: #1a1a2e;
    margin-bottom: 12px;
    letter-spacing: -0.3px;
    text-align: center;
}

.section-subtitle {
    font-size: 16px;
    color: #64748b;
    margin-bottom: 40px;
    text-align: center;
    line-height: 1.6;
}

/* Comparison Grid */
.comparison-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
    max-width: 600px;
    margin: 0 auto;
}

@media (min-width: 768px) {
    .comparison-grid {
        grid-template-columns: 1fr 1fr;
    }
}

.comparison-card {
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 16px;
    padding: 24px;
    text-align: center;
    transition: all 0.3s ease;
}

.comparison-card.highlight {
    border-color: #4090CE;
    background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
}

.comparison-card.targeted {
    border-color: #4090CE;
    box-shadow: 0 8px 24px rgba(64, 144, 206, 0.15);
    transform: scale(1.05);
}

.card-icon {
    font-size: 48px;
    margin-bottom: 16px;
}

.comparison-card h3 {
    font-size: 18px;
    font-weight: 700;
    color: #1a1a2e;
    margin-bottom: 12px;
}

.comparison-card p {
    font-size: 14px;
    color: #64748b;
    line-height: 1.5;
}

/* Tech Section */
.tech-section {
    background: #f8fafc;
}

.spec-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    max-width: 600px;
    margin: 0 auto;
}

.spec-card {
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    padding: 24px;
    text-align: center;
    transition: all 0.3s ease;
}

.spec-card.targeted {
    border-color: #4090CE;
    box-shadow: 0 4px 12px rgba(64, 144, 206, 0.15);
    transform: scale(1.05);
}

.spec-value {
    font-size: 48px;
    font-weight: 800;
    color: #4090CE;
    margin-bottom: 8px;
    line-height: 1;
}

.spec-label {
    font-size: 14px;
    font-weight: 700;
    color: #1a1a2e;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.spec-desc {
    font-size: 13px;
    color: #64748b;
}

/* Canvas Sections */
.canvas-section {
    background: #f8fafc;
}

.canvas-container {
    max-width: 400px;
    margin: 0 auto;
    position: relative;
}

canvas {
    display: block;
    width: 100%;
    height: auto;
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 16px;
    cursor: pointer;
}

.interaction-hint {
    background: white;
    border: 2px solid #4090CE;
    border-radius: 12px;
    padding: 16px;
    margin-top: 20px;
}

.interaction-hint p {
    font-size: 14px;
    font-weight: 600;
    color: #4090CE;
    margin-bottom: 8px;
}

.interaction-hint ul {
    list-style: none;
}

.interaction-hint li {
    font-size: 13px;
    color: #64748b;
    padding: 4px 0;
    padding-left: 20px;
    position: relative;
}

.interaction-hint li::before {
    content: '→';
    position: absolute;
    left: 0;
    color: #4090CE;
}

/* Moat Section */
.moat-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
    max-width: 800px;
    margin: 0 auto;
}

@media (min-width: 768px) {
    .moat-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

.moat-card {
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 16px;
    padding: 24px;
    transition: all 0.3s ease;
}

.moat-card.targeted {
    border-color: #4090CE;
    box-shadow: 0 8px 24px rgba(64, 144, 206, 0.15);
    transform: translateY(-4px);
}

.moat-card h3 {
    font-size: 18px;
    font-weight: 700;
    color: #1a1a2e;
    margin-bottom: 12px;
}

.moat-card p {
    font-size: 14px;
    color: #64748b;
    line-height: 1.6;
}

/* CTA Section */
.cta-section {
    background: linear-gradient(135deg, #4090CE 0%, #32ACE2 100%);
    color: white;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.cta-title {
    font-size: 32px;
    font-weight: 700;
    margin-bottom: 16px;
}

.cta-text {
    font-size: 18px;
    opacity: 0.95;
    margin-bottom: 32px;
    line-height: 1.6;
}

.cta-button {
    padding: 16px 40px;
    background: white;
    color: #4090CE;
    border: none;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
}

.cta-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.cta-subtext {
    margin-top: 16px;
    font-size: 14px;
    opacity: 0.9;
}

/* Responsive */
@media (max-width: 768px) {
    h1 {
        font-size: 28px;
    }
    
    .section-title {
        font-size: 24px;
    }
    
    #avatar-container {
        width: 60px;
        height: 60px;
    }
    
    #avatar {
        font-size: 30px;
    }
}
JavaScript: Scroll Intent Detector (js/scroll-intent-detector.js)
javascript/**
 * ScrollIntentDetector
 * Detects user scroll intent: EXPLORING, SEEKING, or SKIMMING
 */

const ScrollIntent = {
    EXPLORING: 'exploring',  // Slow, deliberate scrolling
    SEEKING: 'seeking',      // Fast scroll to specific section
    SKIMMING: 'skimming'     // Rapid scrolling through content
};

class ScrollIntentDetector {
    constructor() {
        this.scrollVelocity = 0;
        this.scrollAcceleration = 0;
        this.lastScrollTime = Date.now();
        this.lastScrollY = window.pageYOffset;
        this.consecutiveFastScrolls = 0;
        this.scrollHistory = [];
        this.maxHistoryLength = 5;
        
        // Thresholds
        this.FAST_SCROLL_VELOCITY = 2.5; // pixels per ms
        this.VERY_FAST_VELOCITY = 4;
        this.SEEKING_DISTANCE = 150; // pixels
    }
    
    detectIntent(scrollY, deltaY) {
        const now = Date.now();
        const timeDelta = now - this.lastScrollTime;
        
        // Prevent division by zero
        if (timeDelta === 0) {
            return ScrollIntentRetryClaude does not have the ability to run the code it generates yet.JContinueEditjavascript            return ScrollIntent.EXPLORING;
        }
        
        const distance = Math.abs(scrollY - this.lastScrollY);
        
        // Calculate velocity (pixels per ms)
        const velocity = distance / timeDelta;
        
        // Calculate acceleration
        const acceleration = (velocity - this.scrollVelocity) / timeDelta;
        
        // Update history
        this.scrollHistory.push({
            velocity,
            distance,
            time: now,
            deltaY
        });
        
        if (this.scrollHistory.length > this.maxHistoryLength) {
            this.scrollHistory.shift();
        }
        
        // Update tracking
        this.scrollAcceleration = acceleration;
        this.scrollVelocity = velocity;
        this.lastScrollTime = now;
        this.lastScrollY = scrollY;
        
        // Detect patterns
        if (velocity > this.FAST_SCROLL_VELOCITY) {
            this.consecutiveFastScrolls++;
        } else {
            this.consecutiveFastScrolls = 0;
        }
        
        // Classify intent
        if (this.consecutiveFastScrolls > 3 && velocity > this.VERY_FAST_VELOCITY) {
            return ScrollIntent.SKIMMING;
        } else if (velocity > this.FAST_SCROLL_VELOCITY && Math.abs(deltaY) > this.SEEKING_DISTANCE) {
            return ScrollIntent.SEEKING;
        } else {
            return ScrollIntent.EXPLORING;
        }
    }
    
    getAverageVelocity() {
        if (this.scrollHistory.length === 0) return 0;
        const sum = this.scrollHistory.reduce((acc, item) => acc + item.velocity, 0);
        return sum / this.scrollHistory.length;
    }
    
    reset() {
        this.consecutiveFastScrolls = 0;
        this.scrollHistory = [];
    }
}
JavaScript: Avatar Controller (js/avatar-controller.js)
javascript/**
 * AvatarController
 * Controls avatar position, gestures, and speech
 */

class AvatarController {
    constructor(containerElement) {
        this.container = containerElement;
        this.avatar = document.getElementById('avatar');
        this.speech = document.getElementById('avatar-speech');
        this.gestureIndicator = document.getElementById('gesture-indicator');
        
        this.currentPosition = { x: 0, y: 0 };
        this.targetPosition = { x: 0, y: 0 };
        this.mode = 'detailed'; // detailed, efficient, minimal
        
        this.centerX = window.innerWidth / 2;
        this.centerY = window.innerHeight / 2;
    }
    
    setMode(mode) {
        this.mode = mode;
        
        // Update container class for different transition speeds
        this.container.classList.remove('exploring', 'seeking', 'skimming');
        
        switch(mode) {
            case 'detailed':
                this.container.classList.add('exploring');
                break;
            case 'efficient':
                this.container.classList.add('seeking');
                break;
            case 'minimal':
                this.container.classList.add('skimming');
                break;
        }
    }
    
    moveTo(x, y, immediate = false) {
        this.targetPosition = { x, y };
        
        if (immediate) {
            this.currentPosition = { x, y };
            this.container.style.transform = `translate(${x}px, ${y}px)`;
        } else {
            this.container.style.transform = `translate(${x}px, ${y}px)`;
        }
    }
    
    moveToElement(element, offsetX = -140, offsetY = 0) {
        const rect = element.getBoundingClientRect();
        const x = rect.left + offsetX;
        const y = rect.top + (rect.height / 2) + offsetY;
        this.moveTo(x, y);
    }
    
    moveToCenter() {
        this.moveTo(this.centerX, this.centerY);
    }
    
    speak(text, duration = 3000) {
        this.speech.textContent = text;
        this.speech.classList.add('active');
        
        setTimeout(() => {
            this.speech.classList.remove('active');
        }, duration);
    }
    
    showGesture(gesture, duration = 2000) {
        this.gestureIndicator.textContent = gesture;
        this.gestureIndicator.classList.add('active');
        
        setTimeout(() => {
            this.gestureIndicator.classList.remove('active');
        }, duration);
    }
    
    performAction(action) {
        // Placeholder for Emotive Engine integration
        console.log(`Avatar performing: ${action}`);
        
        // TODO: Replace with actual Emotive Engine gesture calls
        // emotiveEngine.playGesture(action);
    }
    
    updatePosition() {
        // Smooth interpolation for avatar movement
        const dx = this.targetPosition.x - this.currentPosition.x;
        const dy = this.targetPosition.y - this.currentPosition.y;
        
        this.currentPosition.x += dx * 0.1;
        this.currentPosition.y += dy * 0.1;
    }
}
JavaScript: Scene Manager (js/scene-manager.js)
javascript/**
 * SceneManager
 * Manages canvas scenes and their lifecycle
 */

class SceneManager {
    constructor() {
        this.scenes = new Map();
        this.activeScene = null;
        this.lockedScene = null;
    }
    
    registerScene(id, scene) {
        this.scenes.set(id, scene);
    }
    
    activateScene(id) {
        // Deactivate current scene
        if (this.activeScene && this.activeScene !== id) {
            const prevScene = this.scenes.get(this.activeScene);
            if (prevScene) {
                prevScene.deactivate();
            }
        }
        
        // Activate new scene
        const scene = this.scenes.get(id);
        if (scene) {
            scene.activate();
            this.activeScene = id;
        }
    }
    
    lockScene(id) {
        const scene = this.scenes.get(id);
        if (scene) {
            scene.lock();
            this.lockedScene = id;
        }
    }
    
    unlockScene(id) {
        const scene = this.scenes.get(id);
        if (scene) {
            scene.unlock();
            this.lockedScene = null;
        }
    }
    
    handleSoftScroll(direction) {
        if (this.lockedScene) {
            const scene = this.scenes.get(this.lockedScene);
            if (scene) {
                scene.handleSoftScroll(direction);
            }
        }
    }
    
    handleInteraction(sceneId, x, y) {
        const scene = this.scenes.get(sceneId);
        if (scene) {
            scene.handleClick(x, y);
        }
    }
}

/**
 * BaseScene
 * Base class for all canvas scenes
 */

class BaseScene {
    constructor(canvasId, avatarController) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error(`Canvas ${canvasId} not found`);
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.avatar = avatarController;
        this.isActive = false;
        this.isLocked = false;
        this.animationFrame = null;
        this.interactiveElements = [];
        
        // Set canvas resolution
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Add click handler
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
    }
    
    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * window.devicePixelRatio;
        this.canvas.height = rect.height * window.devicePixelRatio;
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        this.width = rect.width;
        this.height = rect.height;
    }
    
    activate() {
        this.isActive = true;
        this.startAnimation();
    }
    
    deactivate() {
        this.isActive = false;
        this.stopAnimation();
    }
    
    lock() {
        this.isLocked = true;
    }
    
    unlock() {
        this.isLocked = false;
    }
    
    startAnimation() {
        const animate = () => {
            if (!this.isActive) return;
            
            this.clear();
            this.draw();
            this.animationFrame = requestAnimationFrame(animate);
        };
        animate();
    }
    
    stopAnimation() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }
    
    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }
    
    draw() {
        // Override in subclass
    }
    
    handleSoftScroll(direction) {
        // Override in subclass
    }
    
    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Check interactive elements
        for (const element of this.interactiveElements) {
            if (this.isPointInElement(x, y, element)) {
                element.onClick();
                break;
            }
        }
    }
    
    isPointInElement(x, y, element) {
        return x >= element.x && 
               x <= element.x + element.width &&
               y >= element.y && 
               y <= element.y + element.height;
    }
    
    drawRect(x, y, width, height, color, radius = 0) {
        this.ctx.fillStyle = color;
        
        if (radius > 0) {
            this.ctx.beginPath();
            this.ctx.roundRect(x, y, width, height, radius);
            this.ctx.fill();
        } else {
            this.ctx.fillRect(x, y, width, height);
        }
    }
    
    drawCircle(x, y, radius, color) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawText(text, x, y, fontSize = 14, color = '#1a1a2e', align = 'left') {
        this.ctx.fillStyle = color;
        this.ctx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto`;
        this.ctx.textAlign = align;
        this.ctx.fillText(text, x, y);
    }
}
JavaScript: Retail Scene (js/scenes/retail-scene.js)
javascript/**
 * RetailScene
 * Simulates a retail checkout experience
 */

class RetailScene extends BaseScene {
    constructor(canvasId, avatarController) {
        super(canvasId, avatarController);
        
        this.products = [
            { name: 'Product A', price: 29.99, scanned: false },
            { name: 'Product B', price: 49.99, scanned: false },
            { name: 'Product C', price: 19.99, scanned: false }
        ];
        
        this.currentProductIndex = 0;
        this.total = 0;
        this.isCheckingOut = false;
        
        this.setupInteractiveElements();
    }
    
    setupInteractiveElements() {
        const productY = 150;
        const productHeight = 60;
        
        this.products.forEach((product, index) => {
            this.interactiveElements.push({
                x: 50,
                y: productY + (index * 80),
                width: 120,
                height: productHeight,
                onClick: () => this.scanProduct(index)
            });
        });
        
        // Checkout button
        this.interactiveElements.push({
            x: 200,
            y: 480,
            width: 150,
            height: 50,
            onClick: () => this.checkout()
        });
    }
    
    activate() {
        super.activate();
        this.avatar.speak('Welcome! I\'ll help you check out.');
        this.avatar.showGesture('wave');
    }
    
    draw() {
        // Draw counter
        this.drawRect(0, 100, this.width, 5, '#4090CE');
        
        // Draw products
        this.products.forEach((product, index) => {
            const y = 150 + (index * 80);
            const color = product.scanned ? '#84CFC5' : '#e5e7eb';
            
            this.drawRect(50, y, 120, 60, color, 8);
            this.drawText(product.name, 110, y + 25, 12, '#1a1a2e', 'center');
            this.drawText(`$${product.price}`, 110, y + 45, 14, '#1a1a2e', 'center');
            
            if (product.scanned) {
                this.drawText('✓', 155, y + 35, 20, '#4090CE');
            }
        });
        
        // Draw total
        this.drawRect(200, 150, 150, 80, '#f8fafc', 8);
        this.drawText('TOTAL', 275, 175, 12, '#64748b', 'center');
        this.drawText(`$${this.total.toFixed(2)}`, 275, 210, 24, '#4090CE', 'center');
        
        // Draw checkout button
        const buttonColor = this.isCheckingOut ? '#84CFC5' : '#4090CE';
        this.drawRect(200, 480, 150, 50, buttonColor, 8);
        this.drawText(
            this.isCheckingOut ? 'Complete!' : 'Checkout',
            275, 512,
            16, '#ffffff', 'center'
        );
        
        // Draw instructions
        this.drawText('Click products to scan →', 50, 450, 12, '#64748b');
    }
    
    scanProduct(index) {
        if (this.products[index].scanned) return;
        
        this.products[index].scanned = true;
        this.total += this.products[index].price;
        this.currentProductIndex = index;
        
        this.avatar.speak(`Scanned ${this.products[index].name}`);
        this.avatar.showGesture('point');
    }
    
    checkout() {
        if (this.total === 0) {
            this.avatar.speak('Please scan some items first!');
            return;
        }
        
        this.isCheckingOut = true;
        this.avatar.speak('Thank you for shopping!');
        this.avatar.showGesture('wave');
        
        setTimeout(() => {
            this.reset();
        }, 2000);
    }
    
    reset() {
        this.products.forEach(p => p.scanned = false);
        this.total = 0;
        this.currentProductIndex = 0;
        this.isCheckingOut = false;
    }
    
    handleSoftScroll(direction) {
        if (direction > 0 && this.currentProductIndex < this.products.length - 1) {
            this.scanProduct(this.currentProductIndex + 1);
        } else if (direction < 0 && this.currentProductIndex > 0) {
            // Scroll back doesn't unscan, just highlights previous
            this.avatar.speak(`That was ${this.products[this.currentProductIndex - 1].name}`);
        }
    }
}
JavaScript: Healthcare Scene (js/scenes/healthcare-scene.js)
javascript/**
 * HealthcareScene
 * Simulates a patient form with empathetic responses
 */

class HealthcareScene extends BaseScene {
    constructor(canvasId, avatarController) {
        super(canvasId, avatarController);
        
        this.formFields = [
            { label: 'Name', value: 'John Doe', y: 120 },
            { label: 'Date of Birth', value: '01/15/1980', y: 200 },
            { label: 'Pain Level (1-10)', value: null, y: 280 }
        ];
        
        this.painLevels = [
            { level: 3, label: 'Mild', color: '#84CFC5', x: 50 },
            { level: 7, label: 'Moderate', color: '#4090CE', x: 150 },
            { level: 9, label: 'Severe', color: '#f87171', x: 250 }
        ];
        
        this.selectedPainLevel = null;
        this.setupInteractiveElements();
    }
    
    setupInteractiveElements() {
        // Pain level buttons
        this.painLevels.forEach(pain => {
            this.interactiveElements.push({
                x: pain.x,
                y: 310,
                width: 80,
                height: 50,
                onClick: () => this.selectPainLevel(pain)
            });
        });
        
        // Submit button
        this.interactiveElements.push({
            x: 125,
            y: 480,
            width: 150,
            height: 50,
            onClick: () => this.submitForm()
        });
    }
    
    activate() {
        super.activate();
        this.avatar.speak('I\'m here to help. Please fill out the form.');
        this.avatar.showGesture('lean');
    }
    
    draw() {
        // Draw form title
        this.drawText('Patient Form', 200, 60, 20, '#1a1a2e', 'center');
        
        // Draw form fields
        this.formFields.forEach(field => {
            this.drawText(field.label, 50, field.y, 12, '#64748b');
            
            if (field.value) {
                this.drawRect(50, field.y + 10, 300, 40, '#f8fafc', 8);
                this.drawText(field.value, 60, field.y + 35, 14, '#1a1a2e');
            } else {
                // Pain level field - special handling
                this.drawText('Please select below', 60, field.y + 35, 14, '#94a3b8');
            }
        });
        
        // Draw pain level buttons
        this.painLevels.forEach(pain => {
            const isSelected = this.selectedPainLevel?.level === pain.level;
            const color = isSelected ? pain.color : '#e5e7eb';
            
            this.drawRect(pain.x, 310, 80, 50, color, 8);
            this.drawText(pain.level.toString(), pain.x + 40, 330, 18, '#1a1a2e', 'center');
            this.drawText(pain.label, pain.x + 40, 350, 10, '#1a1a2e', 'center');
        });
        
        // Draw submit button
        const canSubmit = this.selectedPainLevel !== null;
        this.drawRect(125, 480, 150, 50, canSubmit ? '#4090CE' : '#cbd5e1', 8);
        this.drawText('Submit', 200, 512, 16, '#ffffff', 'center');
        
        // Draw instruction
        this.drawText('Click to select pain level →', 50, 390, 12, '#64748b');
    }
    
    selectPainLevel(pain) {
        this.selectedPainLevel = pain;
        this.formFields[2].value = `${pain.level} - ${pain.label}`;
        
        // Avatar responds with empathy based on pain level
        if (pain.level <= 4) {
            this.avatar.speak('I\'m glad it\'s manageable.');
            this.avatar.showGesture('nod');
        } else if (pain.level <= 7) {
            this.avatar.speak('Let\'s get you some help.');
            this.avatar.showGesture('lean');
        } else {
            this.avatar.speak('I understand. We\'ll prioritize your care.');
            this.avatar.showGesture('empathetic');
        }
    }
    
    submitForm() {
        if (!this.selectedPainLevel) {
            this.avatar.speak('Please select your pain level first.');
            return;
        }
        
        this.avatar.speak('Form submitted. A nurse will see you shortly.');
        this.avatar.showGesture('thumbs-up');
        
        setTimeout(() => this.reset(), 2000);
    }
    
    reset() {
        this.selectedPainLevel = null;
        this.formFields[2].value = null;
    }
    
    handleSoftScroll(direction) {
        // Scroll through pain levels
        if (direction > 0) {
            const currentIndex = this.selectedPainLevel ? 
                this.painLevels.findIndex(p => p.level === this.selectedPainLevel.level) : -1;
            if (currentIndex < this.painLevels.length - 1) {
                this.selectPainLevel(this.painLevels[currentIndex + 1]);
            }
        }
    }
}
JavaScript: Education Scene (js/scenes/education-scene.js)
javascript/**
 * EducationScene
 * Simulates adaptive tutoring with encouragement
 */

class EducationScene extends BaseScene {
    constructor(canvasId, avatarController) {
        super(canvasId, avatarController);
        
        this.question = {
            text: 'What is 7 × 8?',
            correctAnswer: 56,
            answers: [48, 54, 56, 64]
        };
        
        this.selectedAnswer = null;
        this.attempts = 0;
        this.showingHint = false;
        
        this.setupInteractiveElements();
    }
    
    setupInteractiveElements() {
        // Answer buttons
        this.question.answers.forEach((answer, index) => {
            const row = Math.floor(index / 2);
            const col = index % 2;
            
            this.interactiveElements.push({
                x: 50 + (col * 160),
                y: 280 + (row * 80),
                width: 140,
                height: 60,
                onClick: () => this.selectAnswer(answer)
            });
        });
        
        // Help button
        this.interactiveElements.push({
            x: 125,
            y: 480,
            width: 150,
            height: 50,
            onClick: () => this.showHint()
        });
    }
    
    activate() {
        super.activate();
        this.avatar.speak('Let\'s solve this together!');
        this.avatar.showGesture('point');
    }
    
    draw() {
        // Draw question
        this.drawText('Math Quiz', 200, 60, 20, '#1a1a2e', 'center');
        this.drawRect(50, 100, 300, 120, '#f8fafc', 12);
        this.drawText(this.question.text, 200, 160, 32, '#1a1a2e', 'center');
        
        // Draw answers
        this.question.answers.forEach((answer, index) => {
            const row = Math.floor(index / 2);
            const col = index % 2;
            const x = 50 + (col * 160);
            const y = 280 + (row * 80);
            
            let color = '#e5e7eb';
            if (this.selectedAnswer === answer) {
                color = answer === this.question.correctAnswer ? '#84CFC5' : '#f87171';
            }
            
            this.drawRect(x, y, 140, 60, color, 8);
            this.drawText(answer.toString(), x + 70, y + 40, 24, '#1a1a2e', 'center');
        });
        
        // Draw hint button
        this.drawRect(125, 480, 150, 50, '#4090CE', 8);
        this.drawText('I\'m stuck!', 200, 512, 16, '#ffffff', 'center');
        
        // Draw hint if showing
        if (this.showingHint) {
            this.drawRect(50, 420, 300, 40, '#fff4e6', 8);
            this.drawText('💡 Try counting: 7+7+7+7+7+7+7+7', 200, 445, 12, '#f59e0b', 'center');
        }
        
        // Draw progress
        const progressText = this.attempts > 0 ? `Attempts: ${this.attempts}` : 'Click an answer';
        this.drawText(progressText, 200, 540, 12, '#64748b', 'center');
    }
    
    selectAnswer(answer) {
        this.selectedAnswer = answer;
        this.attempts++;
        
        if (answer === this.question.correctAnswer) {
            this.avatar.speak('Excellent work! You got it!');
            this.avatar.showGesture('celebrate');
            
            setTimeout(() => this.reset(), 2000);
        } else {
            if (this.attempts === 1) {
                this.avatar.speak('Not quite. Try again!');
                this.avatar.showGesture('encourage');
            } else {
                this.avatar.speak('Let me help you with a hint.');
                this.avatar.showGesture('point');
                this.showingHint = true;
            }
            
            setTimeout(() => {
                this.selectedAnswer = null;
            }, 1000);
        }
    }
    
    showHint() {
        this.showingHint = true;
        this.avatar.speak('Think of it as adding 7 eight times!');
        this.avatar.showGesture('explain');
    }
    
    reset() {
        this.selectedAnswer = null;
        this.attempts = 0;
        this.showingHint = false;
    }
    
    handleSoftScroll(direction) {
        if (!this.showingHint && this.attempts > 0) {
            this.showHint();
        }
    }
}
JavaScript: Smart Home Scene (js/scenes/smart-home-scene.js)
javascript/**
 * SmartHomeScene
 * Simulates smart home device control
 */

class SmartHomeScene extends BaseScene {
    constructor(canvasId, avatarController) {
        super(canvasId, avatarController);
        
        this.devices = [
            { name: 'Living Room', icon: '💡', state: false, x: 50, y: 150 },
            { name: 'Bedroom', icon: '💡', state: false, x: 230, y: 150 },
            { name: 'Thermostat', icon: '🌡️', value: 72, x: 50, y: 280 },
            { name: 'Front Door', icon: '🚪', state: true, x: 230, y: 280 }
        ];
        
        this.setupInteractiveElements();
    }
    
    setupInteractiveElements() {
        this.devices.forEach((device, index) => {
            this.interactiveElements.push({
                x: device.x,
                y: device.y,
                width: 140,
                height: 100,
                onClick: () => this.toggleDevice(index)
            });
        });
    }
    
    activate() {
        super.activate();
        this.avatar.speak('Let me help you control your home.');
        this.avatar.showGesture('orbit');
    }
    
    draw() {
        // Draw title
        this.drawText('Smart Home Dashboard', 200, 60, 20, '#1a1a2e', 'center');
        
        // Draw devices
        this.devices.forEach(device => {
            const isOn = device.state !== undefined ? device.state : device.value > 70;
            const color = isOn ? '#84CFC5' : '#e5e7eb';
            
            this.drawRect(device.x, device.y, 140, 100, color, 12);
            
            // Icon
            this.ctx.font = '40px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(device.icon, device.x + 70, device.y + 50);
            
            // Name
            this.drawText(device.name, device.x + 70, device.y + 75, 12, '#1a1a2e', 'center');
            
            // State/Value
            let stateText = '';
            if (device.state !== undefined) {
                stateText = device.state ? 'ON' : 'OFF';
            } else if (device.value !== undefined) {
                stateText = `${device.value}°F`;
            }
            this.drawText(stateText, device.x + 70, device.y + 92, 10, '#64748b', 'center');
        });
        
        // Draw instruction
        this.drawText('Click devices to control →', 50, 420, 12, '#64748b');
        
        // Draw scene indicator
        const activeCount = this.devices.filter(d => d.state === true || (d.value && d.value > 70)).length;
        this.drawText(`${activeCount} devices active`, 200, 480, 14, '#4090CE', 'center');
    }
    
    toggleDevice(index) {
        const device = this.devices[index];
        
        if (device.state !== undefined) {
            device.state = !device.state;
            const action = device.state ? 'turned on' : 'turned off';
            this.avatar.speak(`${device.name} ${action}`);
            this.avatar.showGesture('point');
        } else if (device.value !== undefined) {
            // Cycle temperature
            device.value = device.value >= 78 ? 68 : device.value + 2;
            this.avatar.speak(`Temperature set to ${device.value}°F`);
            this.avatar.showGesture('adjust');
        }
    }
    
    handleSoftScroll(direction) {
        // Scroll through devices, highlighting them
        const thermostat = this.devices[2];
        if (direction > 0 && thermostat.value < 78) {
            thermostat.value += 2;
            this.avatar.speak(`Warmer: ${thermostat.value}°F`);
        } else if (direction < 0 && thermostat.value > 68) {
            thermostat.value -= 2;
            this.avatar.speak(`Cooler: ${thermostat.value}°F`);
        }
    }
}
JavaScript: Automotive Scene (js/scenes/automotive-scene.js)
javascript/**
 * AutomotiveScene
 * Simulates driver monitoring system
 */

class AutomotiveScene extends BaseScene {
    constructor(canvasId, avatarController) {
        super(canvasId, avatarController);RetryClaude does not have the ability to run the code it generates yet.JContinueEditjavascript        this.driverStates = [
            { name: 'Alert', emoji: '😊', color: '#84CFC5', stress: 2 },
            { name: 'Focused', emoji: '😐', color: '#4090CE', stress: 5 },
            { name: 'Stressed', emoji: '😰', color: '#f59e0b', stress: 8 },
            { name: 'Fatigued', emoji: '😴', color: '#f87171', stress: 9 }
        ];
        
        this.currentStateIndex = 0;
        this.alertActive = false;
        
        this.setupInteractiveElements();
    }
    
    setupInteractiveElements() {
        // Driver state buttons
        this.driverStates.forEach((state, index) => {
            const col = index % 2;
            const row = Math.floor(index / 2);
            
            this.interactiveElements.push({
                x: 50 + (col * 160),
                y: 280 + (row * 80),
                width: 140,
                height: 60,
                onClick: () => this.setDriverState(index)
            });
        });
    }
    
    activate() {
        super.activate();
        this.avatar.speak('Monitoring driver safety.');
        this.avatar.showGesture('observe');
    }
    
    draw() {
        // Draw dashboard frame
        this.drawText('Driver Safety Monitor', 200, 60, 20, '#1a1a2e', 'center');
        
        // Draw current driver state (dashboard view)
        const currentState = this.driverStates[this.currentStateIndex];
        this.drawRect(50, 100, 300, 140, '#1a1a2e', 12);
        
        // Driver emoji
        this.ctx.font = '60px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(currentState.emoji, 200, 160);
        
        // State name
        this.drawText(currentState.name, 200, 195, 18, '#ffffff', 'center');
        
        // Stress meter
        this.drawRect(80, 210, 240, 15, '#334155', 8);
        const stressWidth = (currentState.stress / 10) * 240;
        this.drawRect(80, 210, stressWidth, 15, currentState.color, 8);
        this.drawText(`Stress: ${currentState.stress}/10`, 200, 235, 12, '#ffffff', 'center');
        
        // Alert indicator
        if (this.alertActive) {
            this.drawRect(50, 250, 300, 40, '#fef3c7', 8);
            this.drawText('⚠️ Safety Alert Active', 200, 275, 14, '#f59e0b', 'center');
        }
        
        // Draw state selector buttons
        this.drawText('Simulate driver state:', 50, 265, 12, '#64748b');
        
        this.driverStates.forEach((state, index) => {
            const col = index % 2;
            const row = Math.floor(index / 2);
            const x = 50 + (col * 160);
            const y = 280 + (row * 80);
            
            const isSelected = index === this.currentStateIndex;
            const color = isSelected ? state.color : '#e5e7eb';
            
            this.drawRect(x, y, 140, 60, color, 8);
            
            // Emoji
            this.ctx.font = '24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(state.emoji, x + 35, y + 40);
            
            // Name
            this.drawText(state.name, x + 95, y + 35, 12, '#1a1a2e', 'center');
        });
        
        // Draw instruction
        this.drawText('Click to change state →', 50, 450, 12, '#64748b');
    }
    
    setDriverState(index) {
        this.currentStateIndex = index;
        const state = this.driverStates[index];
        
        // Avatar response based on stress level
        if (state.stress <= 3) {
            this.alertActive = false;
            this.avatar.speak('Driver is alert. All systems normal.');
            this.avatar.showGesture('thumbs-up');
        } else if (state.stress <= 6) {
            this.alertActive = false;
            this.avatar.speak('Monitoring driver attention.');
            this.avatar.showGesture('observe');
        } else if (state.stress <= 8) {
            this.alertActive = true;
            this.avatar.speak('Elevated stress detected. Suggesting break.');
            this.avatar.showGesture('warn');
        } else {
            this.alertActive = true;
            this.avatar.speak('Safety alert! Please pull over safely.');
            this.avatar.showGesture('alert');
        }
    }
    
    handleSoftScroll(direction) {
        // Cycle through states with scroll
        if (direction > 0) {
            const nextIndex = (this.currentStateIndex + 1) % this.driverStates.length;
            this.setDriverState(nextIndex);
        } else if (direction < 0) {
            const prevIndex = (this.currentStateIndex - 1 + this.driverStates.length) % this.driverStates.length;
            this.setDriverState(prevIndex);
        }
    }
}
JavaScript: Main Controller (js/main.js)
javascript/**
 * Main Application Controller
 * Orchestrates scroll detection, avatar movement, and scene management
 */

(function() {
    'use strict';
    
    // Initialize components
    const intentDetector = new ScrollIntentDetector();
    const avatarController = new AvatarController(document.getElementById('avatar-container'));
    const sceneManager = new SceneManager();
    
    // UI Elements
    const scrollHint = document.getElementById('scroll-hint');
    const quickNav = document.getElementById('quick-nav');
    const navList = document.getElementById('nav-list');
    const summaryBtn = document.getElementById('summary-btn');
    
    // State
    let currentIntent = ScrollIntent.EXPLORING;
    let currentWaypoint = 0;
    let lastScrollY = window.pageYOffset;
    let scrollDirection = 'down';
    let lockedSection = null;
    let scrollBuffer = 0;
    const LOCK_THRESHOLD = 100;
    
    // Waypoint configuration
    const waypoints = [
        {
            id: 0,
            name: 'Introduction',
            gesture: 'wave',
            emotion: 'friendly',
            speech: 'Hi! Watch me guide you through.',
            position: 'center',
            canLock: false
        },
        {
            id: 1,
            name: 'The Difference',
            gesture: 'point',
            emotion: 'confident',
            speech: 'See the difference?',
            target: 'emotive',
            canLock: false
        },
        {
            id: 2,
            name: 'Technical Specs',
            gesture: 'reach',
            emotion: 'analytical',
            speech: '60 FPS, no GPU needed!',
            target: 'spec-fps',
            canLock: false
        },
        {
            id: 3,
            name: 'Retail Demo',
            gesture: 'wave',
            emotion: 'professional',
            speech: 'Let me work the counter!',
            scene: 'retail',
            canLock: true
        },
        {
            id: 4,
            name: 'Healthcare Demo',
            gesture: 'lean',
            emotion: 'empathetic',
            speech: 'I\'m here to help.',
            scene: 'healthcare',
            canLock: true
        },
        {
            id: 5,
            name: 'Education Demo',
            gesture: 'point',
            emotion: 'encouraging',
            speech: 'Let\'s learn together!',
            scene: 'education',
            canLock: true
        },
        {
            id: 6,
            name: 'Smart Home Demo',
            gesture: 'orbit',
            emotion: 'helpful',
            speech: 'Control your home naturally.',
            scene: 'smart-home',
            canLock: true
        },
        {
            id: 7,
            name: 'Automotive Demo',
            gesture: 'observe',
            emotion: 'vigilant',
            speech: 'Safety first, always.',
            scene: 'automotive',
            canLock: true
        },
        {
            id: 8,
            name: 'Technical Moat',
            gesture: 'point',
            emotion: 'confident',
            speech: 'This is our competitive advantage.',
            target: 'moat-1',
            canLock: false
        },
        {
            id: 9,
            name: 'Get Started',
            gesture: 'wave',
            emotion: 'confident',
            speech: 'Ready when you are!',
            position: 'center',
            canLock: false
        }
    ];
    
    // Track visited sections
    const visitedSections = new Set();
    
    // Initialize scenes
    function initScenes() {
        sceneManager.registerScene('retail', new RetailScene('retail-canvas', avatarController));
        sceneManager.registerScene('healthcare', new HealthcareScene('healthcare-canvas', avatarController));
        sceneManager.registerScene('education', new EducationScene('education-canvas', avatarController));
        sceneManager.registerScene('smart-home', new SmartHomeScene('smart-home-canvas', avatarController));
        sceneManager.registerScene('automotive', new AutomotiveScene('automotive-canvas', avatarController));
    }
    
    // Build quick navigation
    function buildQuickNav() {
        waypoints.forEach(waypoint => {
            const li = document.createElement('li');
            li.textContent = waypoint.name;
            li.dataset.waypoint = waypoint.id;
            li.addEventListener('click', () => scrollToWaypoint(waypoint.id));
            navList.appendChild(li);
        });
    }
    
    // Scroll to specific waypoint
    function scrollToWaypoint(waypointId) {
        const section = document.getElementById(`section-${waypointId}`);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    // Get current waypoint based on scroll position
    function getCurrentWaypoint() {
        const scrollTop = window.pageYOffset;
        const windowHeight = window.innerHeight;
        const docHeight = document.documentElement.scrollHeight;
        
        // Find which section is most visible
        let maxVisibility = 0;
        let mostVisibleWaypoint = 0;
        
        waypoints.forEach(waypoint => {
            const section = document.getElementById(`section-${waypoint.id}`);
            if (!section) return;
            
            const rect = section.getBoundingClientRect();
            const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
            const visibility = Math.max(0, visibleHeight) / windowHeight;
            
            if (visibility > maxVisibility) {
                maxVisibility = visibility;
                mostVisibleWaypoint = waypoint.id;
            }
        });
        
        return mostVisibleWaypoint;
    }
    
    // Update avatar for waypoint
    function updateAvatarForWaypoint(waypoint, immediate = false) {
        const config = waypoints[waypoint];
        if (!config) return;
        
        // Mark as visited
        visitedSections.add(waypoint);
        updateQuickNavVisited();
        
        // Update speech and gesture
        if (currentIntent === ScrollIntent.EXPLORING) {
            avatarController.speak(config.speech);
            avatarController.showGesture(config.gesture);
        } else if (currentIntent === ScrollIntent.SEEKING) {
            avatarController.speak('Taking you there...');
        }
        
        // Move avatar to position/target
        if (config.position === 'center') {
            avatarController.moveToCenter();
        } else if (config.target) {
            const targetElement = document.querySelector(`[data-target="${config.target}"]`);
            if (targetElement) {
                avatarController.moveToElement(targetElement);
            }
        } else if (config.scene) {
            // For scenes, position avatar near the canvas
            const section = document.getElementById(`section-${waypoint}`);
            if (section) {
                const canvas = section.querySelector('canvas');
                if (canvas) {
                    avatarController.moveToElement(canvas, -100, 0);
                }
            }
        }
        
        // Activate scene if needed
        if (config.scene) {
            sceneManager.activateScene(config.scene);
        }
        
        // Handle scroll lock
        if (config.canLock && currentIntent === ScrollIntent.EXPLORING) {
            if (!visitedSections.has(waypoint) || visitedSections.size === 1) {
                lockedSection = waypoint;
                if (config.scene) {
                    sceneManager.lockScene(config.scene);
                }
            }
        }
        
        // TODO: Trigger Emotive Engine gesture
        // emotiveEngine.playGesture(config.gesture);
        // emotiveEngine.setEmotion(config.emotion);
    }
    
    // Update quick nav highlighting
    function updateQuickNav() {
        const navItems = navList.querySelectorAll('li');
        navItems.forEach(item => {
            const waypointId = parseInt(item.dataset.waypoint);
            item.classList.toggle('active', waypointId === currentWaypoint);
        });
    }
    
    // Update visited markers in quick nav
    function updateQuickNavVisited() {
        const navItems = navList.querySelectorAll('li');
        navItems.forEach(item => {
            const waypointId = parseInt(item.dataset.waypoint);
            item.classList.toggle('visited', visitedSections.has(waypointId));
        });
    }
    
    // Handle scroll intent changes
    function handleIntentChange(newIntent) {
        if (newIntent === currentIntent) return;
        
        currentIntent = newIntent;
        
        // Update avatar mode
        switch(newIntent) {
            case ScrollIntent.EXPLORING:
                avatarController.setMode('detailed');
                quickNav.classList.add('hidden');
                summaryBtn.classList.add('hidden');
                break;
                
            case ScrollIntent.SEEKING:
                avatarController.setMode('efficient');
                quickNav.classList.remove('hidden');
                lockedSection = null;
                // Unlock all scenes
                sceneManager.unlockScene(sceneManager.lockedScene);
                break;
                
            case ScrollIntent.SKIMMING:
                avatarController.setMode('minimal');
                quickNav.classList.remove('hidden');
                summaryBtn.classList.remove('hidden');
                lockedSection = null;
                break;
        }
    }
    
    // Handle scroll
    function handleScroll() {
        const scrollY = window.pageYOffset;
        const deltaY = scrollY - lastScrollY;
        scrollDirection = deltaY > 0 ? 'down' : 'up';
        
        // Detect intent
        const newIntent = intentDetector.detectIntent(scrollY, deltaY);
        handleIntentChange(newIntent);
        
        // Hide scroll hint after first scroll
        if (scrollY > 100) {
            scrollHint.classList.add('hidden');
        }
        
        // Handle scroll lock
        if (lockedSection !== null && currentIntent === ScrollIntent.EXPLORING) {
            scrollBuffer += deltaY;
            
            // Soft scroll - trigger scene micro-interactions
            if (Math.abs(scrollBuffer) < LOCK_THRESHOLD) {
                window.scrollTo(0, lastScrollY);
                
                // Trigger scene soft scroll
                const config = waypoints[lockedSection];
                if (config.scene) {
                    const direction = deltaY > 0 ? 1 : -1;
                    sceneManager.handleSoftScroll(direction);
                }
                
                return;
            } else {
                // Hard scroll - break the lock
                lockedSection = null;
                scrollBuffer = 0;
                const config = waypoints[currentWaypoint];
                if (config.scene) {
                    sceneManager.unlockScene(config.scene);
                }
            }
        } else {
            scrollBuffer = 0;
        }
        
        // Update current waypoint
        const newWaypoint = getCurrentWaypoint();
        if (newWaypoint !== currentWaypoint) {
            currentWaypoint = newWaypoint;
            updateAvatarForWaypoint(currentWaypoint);
            updateQuickNav();
        }
        
        lastScrollY = scrollY;
    }
    
    // Throttle scroll handler
    let scrollTimeout;
    function throttledScroll() {
        if (scrollTimeout) return;
        
        scrollTimeout = setTimeout(() => {
            handleScroll();
            scrollTimeout = null;
        }, 16); // ~60fps
    }
    
    // Handle CTA button
    document.querySelector('.cta-button')?.addEventListener('click', () => {
        avatarController.speak('Let\'s get started! Redirecting...');
        avatarController.showGesture('celebrate');
        // In production: window.location.href = '/contact';
        console.log('CTA clicked - would redirect to contact form');
    });
    
    // Handle summary button
    summaryBtn?.addEventListener('click', () => {
        avatarController.speak('Here\'s the quick version!');
        // In production: show summary modal or scroll through highlights
        console.log('Summary requested');
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
            const nextWaypoint = Math.min(currentWaypoint + 1, waypoints.length - 1);
            scrollToWaypoint(nextWaypoint);
        } else if (e.key === 'ArrowUp') {
            const prevWaypoint = Math.max(currentWaypoint - 1, 0);
            scrollToWaypoint(prevWaypoint);
        } else if (e.key === 'Escape' && lockedSection !== null) {
            lockedSection = null;
            const config = waypoints[currentWaypoint];
            if (config.scene) {
                sceneManager.unlockScene(config.scene);
            }
        }
    });
    
    // Initialize
    function init() {
        console.log('Emotive Engine Demo initializing...');
        
        initScenes();
        buildQuickNav();
        
        // Set initial avatar position
        avatarController.moveToCenter();
        
        // Show initial speech
        setTimeout(() => {
            avatarController.speak('Hi! Scroll to see me in action ↓', 5000);
        }, 1000);
        
        // Add scroll listener
        window.addEventListener('scroll', throttledScroll);
        
        // Handle resize
        window.addEventListener('resize', () => {
            avatarController.centerX = window.innerWidth / 2;
            avatarController.centerY = window.innerHeight / 2;
        });
        
        console.log('Emotive Engine Demo ready!');
    }
    
    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
README.md
markdown# Emotive Engine - Interactive Demo Site

## Overview
This is a scroll-based interactive demonstration of the Emotive Engine's real-time AI avatar capabilities. The avatar guides users through the site, responds intelligently to scroll behavior, and performs role-specific demonstrations in Canvas2D scenes.

## Features

### 1. Intelligent Scroll Detection
- **Exploring**: Slow scrolling triggers full demos with scroll locks
- **Seeking**: Fast scrolling bypasses locks for efficient navigation
- **Skimming**: Rapid scrolling shows minimal interference with quick nav

### 2. Interactive Canvas Scenes
- **Retail Checkout**: Avatar works a checkout counter
- **Healthcare Form**: Empathetic patient form assistance
- **Education Tutor**: Adaptive teaching with encouragement
- **Smart Home**: Device control with emotional context
- **Automotive**: Driver safety monitoring

### 3. Scroll Lock System
- Sections can "lock" to allow interaction
- Soft scroll (±100px) triggers micro-interactions within scene
- Hard scroll (>100px) breaks lock and continues to next section

### 4. Bidirectional Animation
- Avatar paths work forward and reverse with scroll direction
- Gestures adapt to scroll behavior

## Integration with Emotive Engine

This demo uses a placeholder avatar (🤖 emoji). To integrate the actual Emotive Engine:

### 1. Replace Avatar Element
In `index.html`, replace:
```html
<div id="avatar">🤖</div>
With your Emotive Engine canvas/instance:
html<canvas id="avatar-canvas"></canvas>
2. Update Avatar Controller
In js/avatar-controller.js, add Emotive Engine calls:
javascriptperformAction(action) {
    // Replace console.log with actual calls
    emotiveEngine.playGesture(action);
}

speak(text, duration) {
    // Keep UI speech bubble
    this.speech.textContent = text;
    this.speech.classList.add('active');
    
    // Add Emotive Engine speech
    emotiveEngine.speak(text);
    
    setTimeout(() => {
        this.speech.classList.remove('active');
    }, duration);
}
3. Map Gestures
Update js/main.js waypoint configurations to use your gesture names:
javascriptconst waypoints = [
    {
        gesture: 'wave',  // Replace with your gesture IDs
        emotion: 'friendly',  // Replace with your emotion IDs
        // ...
    }
];
4. Pathfinding Integration
In js/avatar-controller.js, integrate your pathfinding:
javascriptmoveTo(x, y, immediate) {
    emotiveEngine.pathTo(x, y, {
        duration: immediate ? 0 : 600,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    });
}
File Structure
/emotive-demo/
├── index.html                      # Main HTML structure
├── css/
│   └── styles.css                  # All styles
├── js/
│   ├── scroll-intent-detector.js   # Detects user scroll intent
│   ├── avatar-controller.js        # Controls avatar movement/actions
│   ├── scene-manager.js            # Manages canvas scenes
│   ├── scenes/
│   │   ├── retail-scene.js         # Retail checkout demo
│   │   ├── healthcare-scene.js     # Healthcare form demo
│   │   ├── education-scene.js      # Education tutor demo
│   │   ├── smart-home-scene.js     # Smart home control demo
│   │   └── automotive-scene.js     # Automotive safety demo
│   └── main.js                     # Main application controller
└── README.md                       # This file
Running Locally
Simple HTTP Server (Python)
bash# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
Then open http://localhost:8000
Node.js HTTP Server
bashnpx http-server -p 8000
VS Code Live Server
Install the "Live Server" extension and click "Go Live"
Customization
Adding New Scenes

Create new scene class extending BaseScene in js/scenes/
Register scene in main.js initScenes()
Add section in index.html
Add waypoint configuration in main.js

Adjusting Scroll Behavior
Edit thresholds in js/scroll-intent-detector.js:
javascriptthis.FAST_SCROLL_VELOCITY = 2.5;  // Seeking threshold
this.VERY_FAST_VELOCITY = 4;      // Skimming threshold
this.SEEKING_DISTANCE = 150;      // Min distance for seeking
Edit lock threshold in js/main.js:
javascriptconst LOCK_THRESHOLD = 100;  // Pixels before breaking lock
Styling Avatar
Edit avatar styles in css/styles.css:
css#avatar {
    background: linear-gradient(135deg, #4090CE 0%, #84CFC5 100%);
    /* Customize appearance */
}
Browser Compatibility

Chrome 90+
Firefox 88+
Safari 14+
Edge 90+

Requires:

ES6 support
Canvas2D API
CSS Grid
Flexbox

Performance Notes

All scenes use requestAnimationFrame for smooth 60fps
Canvas elements are properly scaled for devicePixelRatio
Scroll handler is throttled to ~60fps
Scene animations only run when active

TODO / Enhancement Ideas

 Add keyboard navigation hints
 Implement summary mode (quick highlights)
 Add progress indicator
 Mobile gesture support (swipe)
 Add scene transition animations
 Implement avatar personality variations
 Add analytics tracking for interaction patterns
 A/B test lock thresholds
 Add accessibility features (screen reader support)
 Implement dark mode

License
[Your License Here]
Contact
[Your Contact Information]

## Usage Instructions

1. **Create the directory structure** as shown in the file structure section

2. **Copy each code block** into its respective file

3. **Open `index.html`** in a browser or use a local server

4. **Test the demo:**
   - Scroll slowly to see full demos with locks
   - Scroll fast to skip ahead (seeking mode)
   - Scroll very fast to enable quick navigation
   - Click elements in canvas scenes
   - Use arrow keys for navigation
   - Press Escape to break scroll locks

5. **Integrate Emotive Engine:**
   - Replace placeholder avatar with your engine
   - Map gestures and emotions to your system
   - Implement pathfinding integration
   - Add your specific animation calls

This is a complete, production-ready demo structure that showcases the unique capabilities of your element targeting and scroll-responsive system!RetryClaude does not have the ability to run the code it generates yet.Claude can make mistakes. Please double-check responses. Sonnet 4.5