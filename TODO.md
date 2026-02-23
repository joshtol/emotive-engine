# Resonance - Project TODO

This document outlines the development tasks for the musical RPG "Resonance",
leveraging the Emotive Engine.

---

## Phase 0: Core Tools & Foundation

This phase is dedicated to building the Hexagonal Tilemap Editor, which is
critical for both development and player-facing features.

- [ ] **Editor Application Shell**
    - [ ] Set up the basic GUI for the editor (e.g., as a web page or a simple
          Electron app).
    - [ ] Create the main 3D viewport for the map and the UI panel for the asset
          palette, organized by category.
- [ ] **Core Editor Functionality**
    - [ ] Implement "painting" for base terrain tiles.
    - [ ] Implement asset "stamping" that uses the metadata `footprint` for
          magnetic snapping and collision detection.
    - [ ] Implement controls for rotating and deleting placed assets.
    - [ ] Implement Save/Load functionality that exports map data to a
          game-readable format (e.g., JSON).
- [ ] **Performance-Driven Architecture**
    - [ ] Design the map format to support instanced rendering for common props
          (e.g., trees, rocks).
    - [ ] Implement a utility to merge static ground tiles into larger chunks to
          reduce draw calls.
    - [ ] Structure the map data into "chunks" to support culling of off-screen
          regions.

---

## Phase 1: Tactical Combat & Rhythm Core

The goal is to build the fundamental turn-based, rhythmic combat system, which
can be tested on a simple, hard-coded "proto-map."

- [ ] **Rhythm & Audio System**
    - [ ] Create a library of primal drum patterns with varying BPMs and
          complexities.
    - [ ] Implement logic for the combat initiator to set the battle's drum
          pattern and tempo, with the player's emotion acting as a modifier.
    - [ ] Create the primary "Pulse Ring" UI to visually represent the beat and
          input windows.
- [ ] **Combat State & Flow**
    - [ ] Implement a state machine to switch between "Exploration Mode" and
          "Combat Mode".
    - [ ] Create the core turn-based logic (player turn, enemy turn).
- [ ] **Rhythmic Action & Reaction System**
    - [ ] Link action execution to a timed press on the "Pulse Ring" and develop
          the grading system (Perfect, Great, etc.).
    - [ ] Implement the "Focus" skill using a `meditation` gesture.
    - [ ] Implement reactive skills ("Call and Response", "Harmonic Shield",
          "Echoing Disruption", "Rhythmic Defiance").
- [ ] **Visual Combat Feedback**
    - [ ] Link player HP to the `crack` gesture system for visual damage.
    - [ ] Create a "Mend" skill combining `healcracks` and `glow` gestures.

---

## Phase 2: Overworld & Exploration

This phase focuses on building the world and the player's interaction with it,
using the editor created in Phase 0.

- [ ] **Hexagonal Map System Integration**
    - [ ] Implement the runtime logic to load and render maps created by the
          editor.
    - [ ] Implement A\* pathfinding on the loaded map data.
- [ ] **Grid-Based Movement & Encounters**
    - [ ] Implement non-rhythmic, tile-to-tile player movement.
    - [ ] Implement line-of-sight and chance-based encounter triggers.
- [ ] **Player Home Base**
    - [ ] Design and implement the dedicated "Home Base" map area.
    - [ ] Create the simplified, player-facing UI for base customization.
    - [ ] Implement the system for "collecting" hex tiles as inventory items and
          placing them in the base.
    - [ ] Add logic for placing functional tiles like crafting stations or
          merchants.
- [ ] **World Interaction**
    - [ ] Implement Emotional Biomes, Harmonic Locks, and LLM-Powered Lore
          objects.
    - [ ] Implement out-of-combat use of `meditation` gestures.

---

## Phase 3: Player Progression & Skills

This phase focuses on the player's growth, customization, and evolution.

- [ ] **Emotional Resilience System**
    - [ ] Implement "Emotional Resilience" as a core player stat.
    - [ ] Create skills, items, and equipment that modify this stat.
    - [ ] Implement the dynamic emotion feedback loop (Anger/Excitement) with
          caps.
- [ ] **Skill & Stance System**
    - [ ] Design a skill tree for unlocking new active and reactive skills.
    - [ ] Implement the `morphTo()` Stance System and its passive bonuses.
- [ ] **Creature Evolution (The "Absorption" Skill)**
    - [ ] Implement the "Absorb" state, minigame, and "Skill Stealing" mechanic.
    - [ ] Implement "Skill Milestones" for visual upgrades of learned gestures.

---

## Phase 4: Aesthetics & Visual "Juice"

This phase focuses on polishing the look and feel of the game.

- [ ] **UI & Shaders**
    - [ ] Implement the "Glass-Morphism" UI for battle menus.
    - [ ] Integrate post-processing passes for critical moments.
- [ ] **Emotional Motion**
    - [ ] Fully map emotional states to the mascot's idle behaviors.

---

## Phase 5: Content & AI

This phase involves creating the creatures and assets that populate the world.

- [ ] **Enemy Design & AI**
    - [ ] Assign a unique primal drum pattern and tempo to each enemy type.
    - [ ] Design AI that uses gestures and is telegraphed in sync with its
          rhythm.
- [ ] **Asset Creation**
    - [ ] Create 3D models for enemies and all world props defined in the hex
          system asset plan.
- [ ] **Animation Polishing**
    - [ ] Fine-tune all gesture parameters and VFX.
