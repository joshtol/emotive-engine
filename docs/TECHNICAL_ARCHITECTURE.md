# Technical Architecture & Portfolio Highlights

This document outlines the technical architecture of the **Emotive Engine**, a hybrid 2D/3D animation system designed for real-time emotional expression in AI interfaces.

---

## 🏗️ Core Architecture

The engine is built on a **Hybrid Rendering Architecture** that seamless bridges lightweight Canvas 2D with high-fidelity WebGL 3D.

### 1. Hybrid Rendering Pipeline
Unlike traditional engines that choose either 2D or 3D, Emotive Engine runs both simultaneously to leverage the strengths of each:

*   **2D Core (Canvas):** Handles the "soul" of the mascot—fluid particle systems, physics-based gesture animations, and computationally cheap effects.
    *   *Why?* Canvas is superior for handling hundreds of soft, alpha-blended particles with minimal GPU overhead on mobile devices.
*   **3D Core (Three.js/WebGL):** Renders the central geometry (Crystal, Moon, Sphere) with physically based materials, refraction, and dynamic lighting.
    *   *Why?* Allows for "impossible" materials like light-emitting crystals and glass refraction that purely 2D cannot simulate.

**Key Innovation:** The `Particle3DTranslator` system.
*   The engine runs particle simulations in a 2D physics space (x, y, z-index).
*   The `Particle3DTranslator` maps these 2D behaviors into 3D world space using spherical coordinate mapping.
*   *Result:* Complex 2D behaviors like "Popcorn" or "Zen Orbit" work natively in 3D without rewriting the physics engine.

### 2. Emotional State Machine
The visual output is driven by a deterministic state machine that translates abstract emotional labels into renderable parameters.

*   **Input:** `mascot.feel('joy')` or `mascot.feel('curious, leaning in')`
*   **Translation Layer:**
    *   **Undertones:** Modifies base emotions with saturation shifts (e.g., "Intense" = +60% saturation, "Subdued" = -50% saturation).
    *   **Breathing:** Each emotion has a unique "breath rate" and "depth" (e.g., Fear = shallow/fast, Calm = deep/slow).
    *   **Eye Expression:** Procedural eye shapes interpolate between 40+ presets (e.g., `squint`, `wide`, `happy-arc`).

### 3. Rhythm Synchronization Engine
The engine includes a custom **Audio Analysis & Rhythm System** (`Rhythm3DAdapter`) that syncs animations to musical time.

*   **Beat Detection:** Real-time BPM analysis.
*   **Groove Templates:** Animations don't just "bounce on beat"—they follow groove patterns (Swing, Waltz, Dubstep).
*   **Implementation:** Gestures like `bounce` or `nod` can lock to the nearest beat grid, ensuring the mascot dances in time with audio.

---

## 🔮 3D Technical Deep Dive

The `src/3d` module contains advanced graphics programming implementations:

### Tidal Locking System (`FacingBehavior.js`)
*   **Physics:** Simulates the "tidal locking" of celestial bodies (like the Moon facing Earth).
*   **Implementation:** Decouples the object's rotation from the camera's orbit. The "Moon" geometry rotates its UVs to always face the active camera, while maintaining accurate lighting normals from the simulated "Sun".

### Eclipse Simulation (`SolarEclipse.js` / `LunarEclipse.js`)
*   **Solar:** Renders a procedural corona shader that reacts to occlusion, creating "Bailey's Beads" and "Diamond Ring" effects during transition.
*   **Lunar:** Simulates Rayleigh scattering (Blood Moon) by interpolating material transmission and emissive colors through a "penumbra" gradient.

### "Crystal Soul" Shader
*   **Concept:** A geometry-agnostic "inner light" that exists inside refractive shells (Glass/Crystal).
*   **Technique:** Uses a multi-pass render.
    1.  Render the "Soul" mesh to an off-screen buffer.
    2.  Render the outer "Shell" with a custom `MeshPhysicalMaterial`.
    3.  Sample the "Soul" buffer onto the shell's refraction map, distorting UVs based on surface normals to simulate varying thickness and index of refraction (IOR).

---

## 🛠️ Code Quality Standards

This project demonstrates senior-level engineering practices:

*   **No "God Objects":** Rendering logic is split into specialized animators (`BlinkAnimator`, `BreathingAnimator`, `GestureAnimator`).
*   **Memory Management:**
    *   **Object Pooling:** `ParticlePool.js` recycles particle instances to prevent Garbage Collection (GC) pauses during high-load animations.
    *   **Reference Counting:** Geometries and materials are cached and disposed of deterministically.
*   **Testing:** 300+ unit tests using Vitest, covering physics accuracy, memory leaks, and state transitions.
*   **Performance:**
    *   **Offscreen Canvas:** Expensive gradient generation happens once on an offscreen canvas.
    *   **Frustum Culling:** 3D particles outside the camera view are skipped.
    *   **Degradation System:** Automatically reduces particle count and disables bloom on low-FPS devices.

---

*This project serves as a demonstration of advanced frontend graphics engineering, bridging the gap between technical implementation and user experience design.*
