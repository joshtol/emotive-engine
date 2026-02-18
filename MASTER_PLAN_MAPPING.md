# Emotive Engine: Combat & Progression Master Plan Mapping

This document maps the conceptual goals from the "Combat & Progression Master
Plan" to the specific files, functions, and architectural patterns within the
Emotive Engine codebase.

---

## I. Core Architecture & Game Loop

This section covers the fundamental components of the player character and the
main gameplay mechanics.

### The Player Entity

- **Concept:** A sentient, morphing Crystal that serves as the protagonist.
- **Codebase Mapping:** The player entity is implemented as the `EmotiveMascot`.
  The public-facing API for interacting with the mascot is
  `EmotiveMascotPublic`.
- **Key Files:**
    - `src/EmotiveMascot.js`: The core class for the player entity, containing
      the main logic.
    - `src/EmotiveMascotPublic.js`: The public API wrapper that provides a safe
      and controlled interface to the engine's functionality. This is the
      primary object you will interact with.
    - `src/mascot/`: This directory contains various managers for the mascot's
      systems (state, rendering, audio, etc.).

### Musical-Time Combat

- **Concept:** All elemental gestures (animations) are BPM-locked and subdivided
  into musical time.
- **Codebase Mapping:** The engine has a deep integration with musical timing.
  Gestures are defined with a `duration` and `beats` property. The engine's
  `rhythmEngine` and `MusicDetector` can synchronize animations to the BPM of a
  loaded audio track.
- **Key Files & Functions:**
    - `src/public/AudioManager.js`: Provides methods like `startRhythmSync()`,
      `stopRhythmSync()`, and `setBPM()`.
    - `src/core/audio/rhythm.js`: Contains the core `rhythmEngine`.
    - `src/core/morpher/MusicDetector.js`: Handles BPM and time signature
      detection.
    - `src/core/gestures/destruction/elemental/fireflourish.js`: An example of a
      gesture with `duration` and `beats` properties, showing how the timing is
      defined.

### The "Absorption" Skill

- **Concept:** Replaces traditional capturing; a rhythmic drain of an enemy's
  "energy" to potentially learn their specific elemental skills.
- **Codebase Mapping:** This is a new gameplay mechanic that is **not yet
  implemented**. The engine provides the necessary tools to build it.
- **Implementation Path:**
    1.  Create a new "absorb" gesture, likely in the
        `src/core/gestures/actions/` directory.
    2.  This gesture could trigger a `Timeline` sequence using the
        `TimelineRecorder` to create a rhythmic minigame (e.g., matching beats).
    3.  The game logic would track the "Absorbed Energy" as a separate resource.
    4.  Upon successful absorption, the game logic would unlock the target's
        gesture for the player by adding it to their list of available gestures.

### Skill Mastery

- **Concept:** Skills evolve by swapping simpler gestures (e.g., `fireblaze`)
  for advanced ones (e.g., `fireflourish`, `firedance`) at milestone levels.
- **Codebase Mapping:** This is a new gameplay progression system that is **not
  yet implemented**. The gesture system is well-suited for this.
- **Implementation Path:**
    1.  The distinction between a "simple" and "advanced" gesture is its
        configuration object. Advanced gestures like `fireflourish` have
        multiple `spawnMode` layers and more complex procedural animations.
    2.  Create a player progression system (e.g., an XP and leveling system).
    3.  This system would manage a list of gestures available to the player.
    4.  At certain level milestones, you would replace a simple gesture name in
        the player's available list with its more advanced counterpart (e.g.,
        replace `'fireblaze'` with `'fireflourish'`). The
        `getAvailableGestures()` method provides the master list of all gestures
        defined in the engine.

## II. The Stance System (Geometry Morphing)

This section covers the player's ability to change forms and how those forms
relate to elemental affinities.

### Crystal Stance & Geometry Morphing

- **Concept:** The foundational state is a Crystal, which can morph its geometry
  to change its elemental nature.
- **Codebase Mapping:** This is directly implemented by the `ShapeMorpher`
  system. The `morphTo()` function transitions the mascot's geometry between
  different predefined shapes.
- **Key Files & Functions:**
    - `src/core/ShapeMorpher.js`: The core class that manages the logic for
      transitioning between shapes. It handles the interpolation, timing
      (including musical quantization), and audio-reactivity of the morph.
    - `EmotiveMascotPublic.morphTo(shape, config)`: The public API method used
      to initiate a shape morph.
    - `src/core/shapes/shapeDefinitions.js`: Contains the vertex data for the
      base shapes.

### Moon Phases & Solar Stances

- **Concept:** Eight distinct morph modes (Moon Phases) and high-risk Solar
  Stances that govern elemental affinities and grant multipliers.
- **Codebase Mapping:** These are implemented as the available shapes in the
  `ShapeMorpher`. The `prewarmCache` function in `ShapeMorpher.js` lists the
  primary available shapes: `'circle'`, `'heart'`, `'star'`, `'sun'`, `'moon'`,
  `'lunar'`, `'square'`, and `'triangle'`.
- **Key Files & Functions:**
    - `src/core/ShapeMorpher.js`: The `getTransitionConfig()` function contains
      special logic for transitions to and from `'moon'`, `'lunar'`, and
      `'sun'`, giving them unique visual flair (e.g., "dreamy quality", "eclipse
      transition", "sun_bloom"). This confirms they are intended as special
      stances.
    - `EmotiveMascotPublic.getAvailableShapes()`: Returns the list of available
      shape names.

### Stance Logic

- **Concept:** Morphs shift the player's elemental nature, affecting damage and
  other character stats.
- **Codebase Mapping:** This is a new gameplay mechanic that is **not yet
  implemented**. The `ShapeMorpher` provides the current state, but the game
  logic must act on it.
- **Implementation Path:**
    1.  Develop a system to manage the player's stats (e.g., elemental
        resistances, damage multipliers).
    2.  This system will query the `ShapeMorpher` for its current state using
        the `getState()` method, which returns the `currentShape`.
    3.  Based on the `currentShape` (e.g., if it's `'sun'`), the system will
        apply the appropriate stat modifiers (e.g., increase fire damage, grant
        critical multipliers). When the shape changes, the modifiers are removed
        or updated.

## III. Visual & Shader Pipeline

This section covers the engine's rendering architecture and the implementation
of advanced visual effects.

### Hybrid Layering

- **Concept:** Seamless compositing across CSS (UI/Menus), Canvas2D
  (loading/transitions), and Three.js (3D entities/world).
- **Codebase Mapping:** The engine is architected around this principle.
- **Key Files:**
    - `src/3d/ThreeRenderer.js`: The core rendering class that manages the
      Three.js scene, camera, and post-processing. This is the 3D layer.
    - `src/core/EmotiveRenderer.js`: A higher-level renderer that appears to
      handle the 2D canvas drawing and compositing of different visual layers,
      including the output from `ThreeRenderer.js`.
    - The HTML/CSS/JS of the host application would constitute the UI layer,
      overlaid on top of the canvas element managed by the engine.

### Advanced Passes

- **Concept:** High-end effects like Refraction, Bloom, Volumetrics, Distortion,
  and Frame Breaking.
- **Codebase Mapping:** These are all implemented as part of the
  `ThreeRenderer`'s post-processing pipeline.
- **Key Files & Effects:**
    - **Refraction & Bloom:**
        - `src/3d/ThreeRenderer.js`: The `_setupPostprocessing` method
          initializes the `EffectComposer`. It contains a complex, multi-step
          rendering process to achieve screen-space refraction for ice and water
          effects. It renders the scene to a texture, which is then sampled in
          materials like `InstancedIceMaterial.js`.
        - `src/3d/UnrealBloomPassAlpha.js`: A custom Three.js bloom pass that
          preserves transparency, crucial for layering glow effects. This is
          used for "ice crown blowouts" and other intense emissive effects.
    - **Volumetrics:**
        - `src/3d/materials/SmokeMaterial.js`: Creates a volumetric appearance
          for smoke by blending particles.
        - `src/3d/materials/ProceduralFireMaterial.js`: Uses vertex displacement
          to create a sense of volume and motion in fire.
        - `src/3d/materials/InstancedIceMaterial.js`: Contains code for "3D
          volumetric bubbles" trapped within the ice.
    - **Distortion & Frame Breaking:**
        - `src/3d/DistortionPass.js`: A post-processing pass that warps the
          entire rendered scene based on a UV map. This is the perfect tool for
          elemental effects that "bleed out" and distort the UI.
        - `src/3d/effects/CrackLayer.js`: A post-processing effect that renders
          cracks across the entire screen, independent of the 3D geometry. This
          is another form of "frame breaking."
    - **O3 / Electrical Effects:**
        - The gesture list contains a huge number of `electric*` gestures
          (`electriccrackle`, `electricvortex`, etc.) that are used to create
          electrical arcing effects.
        - `src/core/gestures/destruction/elemental/electricEffectFactory.js`:
          This factory likely defines the specific shaders and particle systems
          used for the electrical effects.

## IV. Technical "Hit List" for CLI Investigation

This section provides direct answers and implementation paths for the specific
technical questions from the master plan.

### Gesture Lock Method

- **Goal:** Develop a `persist()` or `loop()` logic to keep an element "out and
  dancing" across multiple bars.
- **Solution:** The `TimelineRecorder` is the ideal tool for this. You can
  programmatically create a timeline that loops a specific gesture or sequence
  of gestures.
- **Key Files & Functions:**
    - `src/public/TimelineRecorder.js`: Provides the `startRecording()`,
      `stopRecording()`, and `playTimeline()` methods.
    - `EmotiveMascotPublic.playTimeline(timeline)`: The public API to start
      playing a recorded or programmatically created animation sequence.
- **Implementation Path:**
    1.  To make a gesture "persist," create a timeline array:
        `const loop = [{ type: 'gesture', name: 'myGesture', time: 0 }];`
    2.  Use `mascot.playTimeline(loop)` to play it. The timeline player will
        need to be modified or configured to support looping, or you can manage
        re-triggering the timeline playback yourself.
    3.  The `chain(chainName)` method in `GestureController.js` is also a good
        option for pre-defined, multi-bar sequences.

### Energy vs. XP Tracking

- **Goal:** Audit data structures to ensure "Absorbed Energy" is handled
  separately from character leveling.
- **Solution:** This is a gameplay-level concern. The Emotive Engine does not
  have a built-in concept of XP or Energy. You will need to implement this as
  part of your application's state management.
- **Implementation Path:**
    1.  Create a `PlayerStats` or similar class in your application's logic
        layer.
    2.  This class will have properties like `xp`, `level`, `absorbedEnergy`,
        etc.
    3.  Your combat logic will update these properties. The engine itself is
        only responsible for the visual representation.

### Targeting Integration

- **Goal:** Sync the procedural `iceencase` logic with the engine's 15 emotional
  states and the existing targeting system.
- **Solution:** The engine provides all the necessary hooks for this.
- **Key Files & Functions:**
    - `src/core/gestures/destruction/elemental/iceencase.js`: The gesture for
      the effect already exists.
    - `EmotiveMascotPublic.setEmotion(emotion)`: Sets the mascot's emotional
      state.
    - `EmotiveMascotPublic.attachToElement(element)`: Attaches the mascot to a
      DOM element, making it follow the target.
    - `EmotiveMascotPublic.setGazeTarget(x, y)`: Directs the mascot's gaze.
- **Implementation Path:**
    1.  Identify the target (e.g., an enemy represented by a DOM element).
    2.  Use `mascot.attachToElement(enemyElement)` to move the mascot to the
        target.
    3.  Set the desired emotion before the attack: `mascot.setEmotion('anger');`
    4.  Trigger the gesture: `mascot.express('iceencase');`

### BPM-Detector Hook

- **Goal:** Map the `feel()` API and valence-arousal coordinates to rhythmic
  difficulty and capture success rates.
- **Solution:** The `feel()` API is a high-level natural language interface. The
  raw audio data for game mechanics is available through other methods.
- **Key Files & Functions:**
    - `EmotiveMascotPublic.feel(intent)`: The high-level API for expressing
      emotion and actions via text. It uses `src/core/intent/IntentParser.js` to
      translate text to commands.
    - `EmotiveMascotPublic.getAudioAnalysis()`: This is the hook you need for
      gameplay mechanics. It returns an object with `bpm`, `beats`, `energy`,
      and `frequencies`.
    - `src/public/AudioManager.js`: The implementation for `getAudioAnalysis`.
- **Implementation Path:**
    1.  For your "Absorption" or other rhythmic minigames, continuously call
        `getAudioAnalysis()`.
    2.  Use the `beats` array (which contains timestamps and intensities of
        detected beats) to determine the timing windows for player input.
    3.  The `energy` and `bpm` can be used to calculate the difficulty of the
        minigame. A higher energy or faster BPM could require more precise
        timing for a successful "capture".
