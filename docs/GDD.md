# Game Design Document (GDD) - Resonance

This document is the internal, living blueprint for the design of "Resonance." It contains detailed breakdowns of mechanics, user experience flows, and core design principles.

---

## 1. Vision & Narrative

### High Concept
The player is an ancient primordial 'Resonator' crystal, recently awoken in a world whose musical harmony has been shattered. Their primary motivation is to restore balance by absorbing the discordant essence of creatures, evolving their own abilities, and shaping a personal haven.

### Core Experience Pillars
1.  **Primal Connection:** Feeling a raw, elemental connection to the world, its rhythms, and its creatures.
2.  **Improving Rhythm:** A sense of true skill progression and mastery over the core rhythmic input mechanic.
3.  **Strategic Enjoyment:** Ensuring that tactical choices in combat, progression, and base management are meaningful and fun.

### Narrative Premise
*   **The Antagonist:** The primary opposing force is **"The Dissonance"** (or "The Cacophony"), a primordial entity of pure, chaotic noise. It is not traditionally "evil" but seeks to unravel the world's musical structure. The creatures of the world are manifestations of its influence.
*   **The Goal:** The player's goal is not to "kill" The Dissonance but to continuously **"re-tune"** the parts of the world it infects. The game is open-ended, with the objective of restoring harmony to an ever-expanding set of islands.
*   **Characters:**
    *   **Player:** An ancient 'Resonator' awoken to restore Harmony.
    *   **Friendly NPCs:** A fixed roster of 4-6 rare, ancient, sentient constructs found as solitary, dormant individuals in the wild. Upon being "rescued" by the player, they relocate to the Home Base, each unlocking one major function. See [NPC Roster](#npc-roster).
    *   **Enemy Creatures:** Manifestations of "The Dissonance." Each is defined by a **Hybrid AI Profile**:
        *   **Behavioral Role:** (e.g., Aggressor, Defender, Opportunist).
        *   **Rhythmic Style:** (e.g., Steady, Erratic, Builder). See [Enemy Rhythmic Styles](#enemy-rhythmic-styles).
        *   They also have a unique primal drum pattern, elemental affinity, and skills to be absorbed.

---

## 2. Elemental System

### The Eight Elements
All eight elements are available at launch: **Fire, Water, Earth, Electric, Ice, Nature, Light, Void**.

Elements are divided into two categories:
*   **Physical Elements (6):** Fire, Water, Earth, Electric, Ice, Nature — interact via a type-effectiveness web.
*   **Ethereal Elements (2):** Light, Void — mutual opponents with unique combat mechanics instead of broad type interactions.

### Elemental Effectiveness Chart

Rows = attacker, columns = defender. **2x** = strong (double damage), **0.5x** = resisted (half damage), **1x** = neutral.

|  | Fire | Water | Earth | Elec | Ice | Nature | Light | Void |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Fire** | -- | 0.5x | 0.5x | 1x | **2x** | **2x** | 1x | 1x |
| **Water** | **2x** | -- | **2x** | 0.5x | 1x | 0.5x | 1x | 1x |
| **Earth** | **2x** | 0.5x | -- | **2x** | 0.5x | 1x | 1x | 1x |
| **Elec** | 1x | **2x** | 0.5x | -- | **2x** | 0.5x | 1x | 1x |
| **Ice** | 0.5x | 1x | **2x** | 0.5x | -- | **2x** | 1x | 1x |
| **Nature** | 0.5x | **2x** | 1x | **2x** | 0.5x | -- | 1x | 1x |
| **Light** | 1x | 1x | 1x | 1x | 1x | 1x | -- | **2x** |
| **Void** | 1x | 1x | 1x | 1x | 1x | 1x | **2x** | -- |

Every physical element has exactly **2 strengths** and **2 weaknesses**:

| Element | Strong vs | Weak vs | Thematic Logic |
|---------|-----------|---------|----------------|
| Fire | Ice, Nature | Water, Earth | Melts ice, burns plants; extinguished by water, smothered by earth |
| Water | Fire, Earth | Electric, Nature | Extinguishes flame, erodes stone; conducts electricity, absorbed by roots |
| Earth | Electric, Fire | Water, Ice | Grounds current, smothers flame; eroded by water, cracked by frost heave |
| Electric | Water, Ice | Earth, Nature | Conducts through water, shatters brittle ice; grounded by earth, insulated by organic matter |
| Ice | Earth, Nature | Fire, Electric | Frost heave cracks stone, winter kills growth; melted by heat, shattered by energy |
| Nature | Water, Electric | Fire, Ice | Roots absorb water, vines tangle circuits; burned by fire, killed by frost |

### Ethereal Element Mechanics

Light and Void are neutral to all physical elements. Instead of type-chart multipliers, they have **unique combat properties**:

*   **Light** — Skills partially **bypass a portion of enemy Defense** (the "illumination" effect — revealing true weakness). A Light-affinity player's strategic identity is punching through tanks.
*   **Void** — Skills have a chance to **strip enemy buffs and negate status effects** (the "entropy" effect — unraveling enhancements). A Void-affinity player's strategic identity is control and denial.
*   **Mutual Destruction:** Light deals 2x to Void. Void deals 2x to Light.

### Elemental Oppositions

The effectiveness chart creates a web of overlapping oppositions, not simple pairs:
*   Fire vs Water (extinguish/evaporate)
*   Fire vs Ice (melt/freeze)
*   Earth vs Water (erode/dam)
*   Earth vs Electric (ground/energize)
*   Nature vs Water (absorb/flood)
*   Nature vs Ice (grow/wither)
*   Nature vs Electric (insulate/shock)
*   Light vs Void (illuminate/consume)

### Morph Stances

Four dual-element **Morph Stances** pair complementary (non-opposing) elements. Each stance provides a **stat shift** and a **passive aura**. The player can only morph into stances that align with their **Primary Affinity** (see [Progression System](#progression-system)).

| Stance | Elements | Stat Shift | Passive Aura | Morph Theme |
|--------|----------|------------|--------------|-------------|
| **Sun** | Fire + Light | +20% Fire DMG, +10% Crit, -10% DEF | Minor Burn tick on enemies each turn | Radiant crystalline form, warm glow, solar corona edges |
| **Tide** | Ice + Water | +20% Ice DMG, +15% Resilience, -10% Speed | Slow effect on enemies (reduced Speed) | Fluid translucent form, rippling surface, frost-to-water gradient |
| **Bastion** | Earth + Nature | +20% Earth DMG, +15% DEF, -10% Crit | Thorns — attackers take reflected damage | Dense armored form with living root veins and stone plates |
| **Storm** | Electric + Void | +20% Electric DMG, +10% Speed, -10% Resilience | Chance to strip one enemy buff per turn | Crackling dark energy form, lightning arcing through void-space |

#### Stance Activation
*   **In Combat:** Activating a stance costs **one combat turn** (like Focus) AND consumes **Elemental Essences** of the stance's governing elements. The stance remains active until dismissed or combat ends.
*   **Outside Combat:** Stances can be activated during exploration for **functional environmental interaction** (Sun melts ice barriers, Bastion breaks rock walls, Tide crosses water gaps, Storm disrupts void barriers). Maintaining a stance outside combat costs a **per-second Elemental Essence drain** that scales inversely with Affinity Level:
    *   Low affinity (e.g., Fire Level 5): 6-9 Fire Essences/sec — expensive, used sparingly.
    *   High affinity (e.g., Fire Level 50): 2-6 Fire Essences/sec — cheap, can sustain comfortably.
*   This creates natural progression feel: morphing that was once a costly tactical decision becomes effortless as affinity grows.

---

## 3. Core Gameplay & Mechanics

### Core Loop
**Explore -> Encounter -> Combat -> Reward -> Progress/Customize**

### The Emotional State System

The player's emotional state is a core combat mechanic that dynamically modifies rhythm performance, damage output, and strategic options.

#### The Emotional Triad
The player carries **three emotion slots** simultaneously, each holding one emotion at an **intensity level** (0-100). The emotion with the highest intensity is the **Dominant** emotion and drives the primary gameplay effect. The other two are **undercurrent** emotions that bleed into the dominant effect at reduced strength.

**The six emotions:**

| Emotion | Category | Dominant Effect | As Undercurrent |
|---------|----------|-----------------|-----------------|
| **Anger** | Negative (high arousal) | Timing window **narrows** | Slightly reduces timing window |
| **Fear** | Negative (high arousal) | Notes **visually jitter/shake** | Mild visual instability |
| **Sadness** | Negative (low arousal) | **Input lag** (30-60ms delay) | Slight input sluggishness |
| **Joy** | Positive (high arousal) | Timing window **widens** | Slightly widens timing window |
| **Calm** | Positive (low arousal) | Timing window widens + **pulse guide** visual | Faint pulse guide appears |
| **Surprise** | Event-triggered | Next 2-3 notes have **massive timing windows** | Brief window boost |

Each negative emotion degrades a *different sense* (precision, perception, responsiveness), making emotional management genuinely tactical.

**Example hybrid state:** Dominant Joy (wide timing windows) + undercurrent Anger (narrows them slightly back) + undercurrent Calm (adds a faint pulse guide). The net effect is moderately wide windows with visual assistance — better than neutral, but not as strong as pure Calm.

#### Emotion Accumulation
Emotions shift through two channels:
*   **Per-Turn Results:** At the end of each turn, the player's overall rhythm performance shifts emotions. A turn of mostly Perfects nudges toward Joy. A turn of mostly Misses nudges toward Anger or Sadness (depending on context — offensive failure = Anger, defensive failure = Sadness).
*   **Combat Events:** Specific events trigger larger emotional swings:
    *   Taking a critical hit → Fear spike
    *   Landing a critical hit → Joy spike
    *   Enemy applies a status effect → Anger spike
    *   Successful Absorb → Calm spike
    *   Ally (in multi-enemy) defeated → Sadness spike
    *   Surprise attack / ambush → Surprise (event-triggered, temporary)

#### Emotion Slot Rules
*   New emotion triggers: if an empty slot exists, fills it. If all three slots are full, replaces the **weakest intensity** emotion.
*   Matching emotion: if the triggered emotion already occupies a slot, its intensity **stacks** (up to 100).
*   **Natural decay:** All emotions lose intensity each turn (e.g., -5/turn), creating a natural drift toward neutral. Sustained performance is needed to maintain a strong emotional state.
*   **Enemies have emotions too.** The same triad system governs enemy rhythm accuracy, which directly affects the [Absorb tug-of-war](#the-absorb-minigame-rhythmic-tug-of-war).

#### Influencing Enemy Emotions
The player manipulates enemy emotions through a **hybrid** system — passive accumulation from combat state plus active skill-based targeting:

*   **Passive (combat-driven):** Enemies gain emotions naturally from combat events:
    *   Taking heavy damage → Fear accumulation
    *   Missing attacks or being dodged → Anger accumulation
    *   Being debuffed or having buffs stripped → Sadness accumulation
    *   Landing critical hits → Joy (enemy becomes overconfident, takes more risks)
*   **Active (skill-based):** Some skills have **emotional impact tags** in addition to their normal effects. A Fire skill tagged "Anger" inflicts Anger on the target. An Ice skill tagged "Fear" inflicts Fear. Players choose skills not just for damage/element, but to target specific enemy emotions.
*   **Gear-Induced:** The [Induced Emotion gear perks](#induced-emotion-gear-perks) system allows pre-loading enemy emotions at combat start. An "Aura of Intimidation" perk starts every fight with the enemy already at elevated Fear — the rhythmic jitter is immediate.
*   **Strategic Depth:** Emotionally breaking an enemy before Absorb makes the tug-of-war trivial (the enemy performs terribly). Players who invest in emotional manipulation builds can Absorb with near-100% success rates, even on tough enemies.

#### Emotion Management Tools
*   **Focus Skill:** Hard reset — clears all three emotion slots immediately (costs one turn).
*   **Consumables:** Crafted emotion-shifting items usable mid-combat (e.g., "Calm Draught" injects Calm at intensity 60, "Fury Tonic" injects Anger for a high-risk offensive play).
*   **Reactive Skills:** Some reactive skills have emotional side-effects (e.g., a successful "Call and Response" shifts the dominant emotion toward Calm).
*   **Home Base:** Returning to base fully resets emotional state to neutral.

### The Battle Rhythm Ring

The **Battle Rhythm Ring** is the central combat UI — a circular track around the combat arena where markers travel toward target zones. It is the primary skill expression mechanic in the game.

#### Input Types
The rhythm system uses **hybrid inputs** that vary by skill:
*   **Tap** — Press when a moving marker aligns with a target zone (the most common input).
*   **Hold + Release** — Hold a button as the marker enters a zone, release when it exits (for charged/sustained skills).
*   **Directional** — Markers arrive from different angles; player taps the correct direction on beat (for complex/high-level skills).

Skills combine these input types. A basic Fire Bolt might be 3 taps. A high-level Inferno might be tap-tap-hold-directional-tap.

#### Performance Grading
Each input is graded based on timing accuracy:
*   **Miss (0x):** No damage. Negative emotional shift.
*   **Good (1.0x):** Base damage. Neutral emotional shift.
*   **Great (1.5x):** Bonus damage. Mild positive emotional shift.
*   **Perfect (2.0x):** Double damage. Strong positive emotional shift.

#### Tempo

Combat tempo is a **hybrid system** driven by multiple factors:

*   **Enemy-Driven Base Tempo:** Each enemy has a signature BPM tied to their primal drum pattern. A lumbering Earth Golem might fight at 80 BPM; a crackling Electric Sprite at 140 BPM. Enemy tempos are mathematical divisions of their biome's base arrangement BPM (see [Music & Audio](#music--audio-direction)), ensuring rhythmic cohesion.
*   **Emotional Modifiers:** The player's **dominant emotion** alters the timing window as described in the [Emotional Triad](#the-emotional-triad) table. Undercurrent emotions modify at reduced strength.

### Skill System

#### Skill Categories
Skills are divided into four categories. All categories require rhythm input — there are no "auto" skills.

*   **Damage** — Direct offensive skills. The bread and butter. Each has an element, a rhythm pattern, and may apply status effects at higher levels.
*   **Support** — Healing, stat buffs, and emotion management. Rhythm accuracy determines effectiveness (a Perfect heal restores more HP than a Good heal).
*   **Utility** — Non-damage tactical tools:
    *   *Scan:* Reveals an enemy's full stats, skills, Absorb threshold, and emotional state.
    *   *Escape:* Flee combat with reduced defeat penalties (still loses some essences, but no gear durability loss).
    *   *Taunt:* In multi-enemy fights, forces a target to attack you next turn (useful for controlling turn order).
*   **Combo** — Skills that chain with the **previous turn's skill** for bonus effects. Chaining uses a two-tier matching system:
    *   **Family Match (partial bonus, +25%):** The previous turn's skill belongs to the same **Pattern Family** as the Combo skill. Since pattern families are shared across skills of the same element, this is the easier condition to meet.
    *   **Family + Element Match (full bonus, +50%):** The previous skill is from the same Pattern Family AND the same element. This is the tighter condition — rewarding players who sequence skills within a single element's family tree.
    *   **No match (base effectiveness):** The Combo skill still fires but at reduced effectiveness — no chain bonus, slightly lower damage. Never useless, but clearly suboptimal.

#### Pattern Families
Each element has **3-4 base rhythm patterns** that define its feel. Individual skills within a family share the core rhythm but add complexity layers at higher tiers:

*   **Base pattern (Tier 1):** Core rhythm only. Example: `tapLeft → tapRight → holdLeft(2beats)` — a clean alternating pattern with a sustain.
*   **Embellished (Tier 2):** Base pattern + flourish fills (extra taps between core beats, grace notes).
*   **Advanced (Tier 3):** Base pattern + fills + directional inputs and syncopation.

This creates **muscle memory rewards** — mastering Fire Bolt's timing gives a head start on Fire Blast, because Blast is a remix of Bolt's core pattern. Reduces authoring cost and makes progression feel earned rather than arbitrary.

**Example (Fire family):**
*   *Fire Bolt (Tier 1):* `tapL → tapR → holdL` — 3 inputs, simple.
*   *Fire Blast (Tier 2):* `tapL → tapR → tapL(grace) → holdL → tapR(accent)` — 5 inputs, same core with fills.
*   *Inferno (Tier 3):* `tapL → tapR → tapL(grace) → holdL → directionalUp → tapR(accent) → holdR` — 7 inputs, full complexity.

#### Skill Count
**10-15 unique absorbable skills per element** at launch (~80-120 total across 8 elements). Skills within each element are distributed across the four categories (mostly Damage, with 2-3 Support/Utility/Combo each). Not all 80-120 skills need unique patterns from scratch — pattern families mean many share a rhythmic core.

### Enemy Rhythmic Styles

An enemy's **Rhythmic Style** is a holistic modifier that defines their combat personality across three dimensions:

*   **Steady:** Predictable, consistent patterns. Holds tempo throughout combat. Reactive challenges are simple "mirror" patterns. Easy to read, reliable to fight. *(e.g., Earth Golem, Ice Sentinel)*
*   **Erratic:** Random timing shifts, unexpected pattern breaks. Tempo shifts mid-combat. Reactive challenges have surprise elements (sudden speed changes, fakeout notes). Keeps the player on edge. *(e.g., Electric Sprite, Void Wraith)*
*   **Builder:** Patterns start simple and accelerate. BPM increases gradually as combat progresses. Reactive challenges grow in complexity each turn. Rewards aggressive play — end the fight fast or get overwhelmed. *(e.g., Fire Elemental, Nature Hydra)*

### Combat System

#### Turn Structure
Each combat turn, the player may:
1.  **(Optional) Use one consumable item** — before or after the rhythm input. Does not cost the turn.
2.  **Execute one skill** — select a skill, perform its rhythm pattern on the Battle Rhythm Ring.

Using the **Focus** skill consumes the entire turn (no skill execution, but consumable use is still allowed).

#### Multi-Enemy Encounters
*   Some encounters pit the player against **2-3 enemies simultaneously**.
*   **Target Switching:** The player **taps/clicks an enemy** to select it as the active target for single-target skills. **AoE skills automatically hit all enemies** — no targeting needed, but they have **harder/longer rhythm patterns** as a tradeoff (more inputs, tighter timing).
*   Untargeted enemies still attack on their turns.
*   Turn order is determined by Speed across all combatants (player + all enemies).
*   Each enemy has independent emotional state, HP, and Absorb threshold.
*   **Mid-Fight Absorb:** When an enemy enters the Absorb range during a multi-enemy fight, the player **can Absorb it immediately** — but doing so **costs the player's turn**. The tug-of-war minigame plays out while other enemies wait (they do NOT get free attacks during the minigame). However, using your turn on Absorb means you're not dealing damage or healing, so timing matters. Enemies that reach Absorb range but aren't immediately absorbed remain eligible — they don't heal out of it.

#### Core Stats
Player and enemies share five core stats: **Attack, Defense, Speed, Resilience, Critical**.

*   `Attack` determines base outgoing damage.
*   `Defense` reduces incoming damage (subtracted from Attack in the damage formula).
*   `Speed` determines initiative at the start of combat and contributes to dodge chance.
*   `Critical` is a linear conversion; 10 points in the stat equals a 10% chance for a critical hit that deals 2x damage.
*   `Resilience` is the game's most multi-faceted stat, governing four systems:
    *   **HP Pool:** Max HP = Resilience × 10. This is the *only* source of HP — there is no flat base HP or level-based HP scaling. A player with 50 Resilience has 500 HP.
    *   **Status Resistance:** Each point of Resilience reduces the chance of status effects being applied by ~1% (soft cap at ~60%). High Resilience characters shrug off Burn, Freeze, etc.
    *   **Flat Damage Reduction:** After the Attack-Defense calculation, Resilience provides an additional flat reduction of Resilience / 5. This is a safety net against chip damage.
    *   **Emotional Stability:** Reduces the intensity of negative emotion spikes by Resilience / 2 %. A player with 40 Resilience has their Fear/Anger/Sadness spikes reduced by 20%. High Resilience means emotional composure under fire.

Resilience is boosted by gear, Affinity Level, and passive effects. It is the stat that separates a glass cannon from a resilient warrior — and because it governs HP, status resistance, flat reduction, *and* emotional stability, it's always worth investing in.

#### Damage Calculation
`Damage = (My Attack - Enemy Defense) * Rhythm Multiplier * Elemental Effectiveness`

*   **Rhythm Multiplier:** Miss: 0x, Good: 1.0x, Great: 1.5x, Perfect: 2.0x.
*   **Elemental Effectiveness:** From the [Elemental Effectiveness Chart](#elemental-effectiveness-chart) (2x, 1x, or 0.5x).
*   **Light special:** Light skills ignore a portion of enemy Defense before the formula is applied.
*   **Void special:** Void skills have a chance to strip one enemy buff on hit, regardless of damage.

#### Focus Skill
Costs one turn to activate. Resets all emotion slots (hard reset), grants a massive ATK/Crit buff for the next turn (with diminishing returns), but also applies a massive DEF debuff and disables reactive skills for the buffed turn.

#### Status Effects
Applied on a per-turn basis. Each status effect has up to **three components**:
*   *Damage Over Time:* Deals damage at the start of the creature's turn.
*   *Stat Debuff:* Reduces one or more core stats.
*   *Rhythmic Penalty:* Adds a "corrupted" note to the rhythm track that must be hit to avoid a penalty.

The game uses a **Universal + Elemental** status catalog:

**Elemental Signature Statuses** (one per element, applied by skills of that element):

| Status | Element | DoT | Stat Debuff | Rhythmic Penalty | Thematic |
|--------|---------|-----|-------------|------------------|----------|
| **Burn** | Fire | Yes (fire tick) | -Attack | Flickering notes | Ongoing combustion |
| **Drench** | Water | No | -Speed | Waterlogged notes (heavy) | Soaked and sluggish |
| **Quake** | Earth | No | -Defense | Screen shake on notes | Shattered footing |
| **Shock** | Electric | Yes (small zap) | -Speed | Random note jitter | Muscle spasms |
| **Freeze** | Ice | No | -Speed, -Attack | Delayed note appearance | Crystallized limbs |
| **Entangle** | Nature | Yes (constriction) | -Defense | Notes partially hidden | Vine-wrapped |
| **Expose** | Light | No | -Defense (stacks with Light bypass) | Notes glow too bright (contrast loss) | Revealed weakness |
| **Decay** | Void | Yes (entropy tick) | -Resilience | Notes fade/ghost | Unraveling essence |

**Universal Statuses** (applied by any element, via specific skills or mechanics):

| Status | Trigger | Effect |
|--------|---------|--------|
| **Stun** | Critical hits, specific skills | Target skips next turn entirely. Cannot be applied to bosses more than once per phase. |
| **Weaken** | Debuff skills, emotional manipulation | -25% outgoing damage for 2 turns. |
| **Haste** | Buff skills, consumables | +25% Speed for 3 turns. Affects turn order. |
| **Regen** | Healing skills, consumables | Restores HP at the start of each turn for 3 turns. |

Resilience reduces the *chance* of status application (~1% per point). Once applied, duration is fixed.

#### Biome Interaction
*   **Passive Buffs:** Creatures gain passive stat buffs when fighting in their native biome (e.g., Fire creatures get +10% Attack in a Fire biome).
*   **Hazard Turns:** If the player's Affinity Level for the biome's element is lower than the island's "Difficulty Level," a damaging "Biome Hazard" may occur at the start of a round.

### The Absorb System

When an enemy's HP drops into the **"Absorb" range**, the player can attempt to absorb one of its skills.

#### Absorb Threshold
The Absorb range is **variable, hidden, and dynamic**:
*   **Variable per creature:** Each creature type has a base Absorb threshold (10-40% HP). Tougher creatures resist longer (lower threshold), weaker creatures are easier to absorb (higher threshold).
*   **Hidden until encountered:** The Absorb threshold is **invisible** the first time the player fights a creature type. On subsequent encounters, a visible indicator appears on the health bar.
*   **Dynamic (emotion-based):** An enemy's emotional state widens the Absorb range. An enemy in deep Fear or Sadness has its threshold increased by up to +10%, making absorption easier. This rewards emotional warfare over raw HP damage.
*   **Affinity Override:** If the player's Elemental Affinity Level is **>= 3x the enemy's level**, Absorb is available **immediately** at full HP — no need to damage the enemy first. The tug-of-war still plays briefly (for the satisfying animation) but the enemy performs so poorly it's trivial. Rewards are reduced (fewer essences, no skill XP bonus) to prevent farming exploits.

#### Skill Selection
*   The game offers a **weighted random** selection of 2-3 skills from the enemy's pool.
*   Skills the player **does not already know** are heavily weighted — the system prioritizes new skills.
*   Rarer skills have lower weight but are always possible.
*   Already-known skills are **filtered out** of the selection pool entirely.

#### The Absorb Minigame: Rhythmic Tug-of-War
*   Upon selecting a skill, a **tug-of-war** begins on the Battle Rhythm Ring.
*   The **enemy performs its own signature pattern** — but at degraded accuracy, because its emotional state is deeply negative from being beaten into Absorb range (Fear, Sadness — the same timing penalties that affect the player also affect enemies).
*   The **player simultaneously mirrors the enemy's pattern** — learning its song.
*   A **capture gauge** fills based on the player's accuracy relative to the enemy's. The more accurately the player performs and the worse the enemy performs, the faster the gauge fills.
*   **Tactical implication:** Players are incentivized to *emotionally break* an enemy before absorbing, not just HP-race it. An enemy in deep Fear (jittering notes) or Sadness (input lag) will perform terribly, making the Absorb nearly free.

#### When All Skills Are Known
When no new skills remain in the enemy's pool, Absorb still triggers but awards:
*   **Elemental Essences** scaled to enemy level.
*   **Skill XP** to a random equipped skill of the enemy's element.
*   A small **Gear Durability restore** (harmonizing with the enemy's essence mends resonance — ties into the [Defeat Consequences](#defeat-consequences)).

### Boss Encounters

Boss encounters are the game's **marquee moments**, mechanically distinct from regular enemies across three dimensions:

*   **Multi-Phase:** Bosses have **2-3 phases** with different patterns, tempos, and abilities. Phase transitions trigger unique animations and can shift the boss's Rhythmic Style (e.g., a boss might start Steady, then shift to Builder in phase 2, then Erratic in a desperate phase 3).
*   **Unique Mechanics:** Each boss has a **signature gimmick** that forces the player to adapt:
    *   *Example:* A boss that reverses the rhythm ring direction mid-fight.
    *   *Example:* A boss with "shield phases" requiring a specific element to break through.
    *   *Example:* A boss that spawns minions on a timer, creating multi-enemy pressure.
*   **Exclusive Rewards:** Bosses have **guaranteed rare/reactive skills** in their Absorb pool AND a unique **"Boss Skill"** that can only be obtained from that specific boss. Boss Skills are among the most powerful in the game.

### Progression System
*   **Skill & Affinity XP:** Using an elemental skill grants XP to both the individual skill and its corresponding **Elemental Affinity Level**.
*   **Skill Leveling:** Higher skill levels result in lower resource cost, higher damage, and unlock **predetermined augmentations** at major thresholds. Augmentations are automatic — no player choice involved:
    *   *Example:* Level 5 Ice Shard → +15% base damage. Level 10 Ice Shard → gains "Slow" chance. Level 15 → Slow duration extended. Level 20 → "Freeze" upgrade (Slow becomes Freeze on Perfect).
    *   Every skill has a fixed augmentation path visible in the skill info screen. Players know exactly what they're working toward.
*   **Elemental Affinity Levels:** This stat serves multiple crucial roles, both offensive and defensive.
    *   **Affinity Gatekeeping:** Your Affinity Level for an element determines the max level of a skill you can Absorb.
    *   **Elemental Defense:** Your Affinity Level provides passive damage reduction against attacks of the same element.
    *   **Hazard Prevention:** Your Affinity Level for a biome's element is checked against that island's "Difficulty Level." If your level is sufficient, you are protected from "Biome Hazard" turns during combat.
    *   **Stance Cost Reduction:** Higher Affinity reduces the Elemental Essence cost of morph stance activation (both in combat and exploration).
    *   **Absorb Override:** Affinity >= 3x enemy level allows immediate Absorb (see [Absorb Threshold](#absorb-threshold)).
*   **Primary Affinity:** The element with the highest cumulative skill levels becomes your Primary Affinity.
    *   Grants a passive **+25% damage bonus** to all skills of that element.
    *   **Stance Synergy:** Reduces the cost or animation time of its corresponding `morphTo()` Stance (e.g., Fire Affinity benefits the Sun Stance).
    *   **Morph Lock:** The player can **only** morph into Stances that align with their current Primary Affinity. Fire or Light Affinity unlocks Sun. Ice or Water unlocks Tide. Earth or Nature unlocks Bastion. Electric or Void unlocks Storm.
*   **Player Level:** The player's "Total Level" is the sum of all their individual skill levels.
*   **Skill Slots:** Players learn unlimited skills but have a limited number of "active" slots for combat (starting at 8). This limit increases with Total Level and via gear perks.

#### Reactive Skills
Reactive skills are rare, passive abilities that trigger during the **enemy's turn** (e.g., "Call and Response" — mirror an incoming attack pattern to reduce damage).

*   **Slotted System:** Players start with **1-2 reactive skill slots**. Reactive skills must be equipped like active skills, creating meaningful build choices.
*   **Slot Expansion:** Reactive skill slots can be increased via **Resonance Gems**. For example, a "+1 Reactive Skill Slot" gem socketed into a Core gear piece grants an additional slot — but at the cost of a potential other gem perk.
*   **Acquisition:** Absorbed from enemies like regular skills, but significantly rarer. Boss enemies are guaranteed to have at least one reactive skill in their pool.
*   **Emotional Side-Effects:** Some reactive skills shift emotions on success (e.g., a successful Call and Response nudges toward Calm).

### Gear & Equipment
*   **Philosophy:** Gear is **Perk-Focused**, prioritizing unique, gameplay-altering abilities over simple stat increases.
*   **Slots:** `Core`, `Shard`, `Aura`, `Focus (amplifier)`.

#### Gear Acquisition
Gear comes from **three sources**, each filling a distinct niche:

*   **Enemy Drops:** Random gear drops from defeated enemies, rarity scaled to enemy level/type. Bosses guarantee Rare+ drops. Dropped gear can roll the **best random perks** — this is the source for lucky god-rolls.
*   **Crafting (The Smith):** Gear is crafted at the Smith's workbench using **Elemental Essences** and **recipes** found as loot. Crafted gear is **targeted and reliable** — the player chooses the gear slot, element affinity, and base type. Perk rolls are more constrained but predictable.
*   **The Merchant:** Sells a rotating stock of base-quality gear (Common/Uncommon). Merchant gear provides a **reliable baseline** — always available, never exceptional. Stock rotates daily and improves as the player's Total Level increases.

#### Gear Rarity Tiers
Higher rarity grants **more perks** AND access to **better perk pools**:

| Rarity | Perks | Sockets | Perk Pool | Source |
|--------|-------|---------|-----------|--------|
| **Common** | 0 | 0 | — | Drops, Merchant |
| **Uncommon** | 1 | 0 | Basic (stat boosts, minor bonuses) | Drops, Merchant, Crafting |
| **Rare** | 1 | 1 | Expanded (elemental bonuses, combo bonuses, status chance) | Drops, Crafting |
| **Legendary** | 2 | 2 | Premium (Absorb speed, reactive slot, emotional manipulation) | Boss drops, rare crafting recipes |
| **Unique** | 1-3 (hand-designed) | 0-2 | Exclusive (perks that can't appear elsewhere) | Specific bosses, quest rewards |

Unique items have **hand-designed perks** with lore-driven effects (e.g., "The Dissonance Fragment: +30% Void damage, but emotional decay rate is doubled"). They cannot be salvaged or crafted.

#### Gear Systems
*   **Upgrades:** Gear is upgraded at the Home Base workbench using Elemental Essences. Costs increase exponentially.
*   **Durability:** Gear has a durability stat that degrades on [defeat](#defeat-consequences). Gear must be repaired at the workbench using Elemental Essences. Durability does not degrade during normal use — only on death. If durability reaches zero, the gear's perks are disabled (but the gear is not destroyed).
*   **Sockets & Gems:** Sockets hold "Resonance Gems" which provide powerful perks.
    *   **Gem Source:** Resonance Gems are not crafted; they are acquired as rare drops, boss drops, and quest rewards.
    *   **Gem Examples:** "+1 Reactive Skill Slot", "+10% Elemental Affinity XP", "Thorns: Reflect 5% damage", "Absorb gauge fills 15% faster".
*   **Salvaging:** Old gear can be salvaged at the workbench.
    *   **Formula:** Returns ~50% of invested essences + a flat bonus based on rarity (Common: 1, Uncommon: 10, Rare: 100, Legendary: 1000).
    *   `Unique` items cannot be salvaged.

#### Induced Emotion Gear Perks
A special class of gear perks that **pre-load emotions** on targets at the start of an interaction:

*   **Combat:** An "Aura of Intimidation" perk with "+27 Induced Fear" means every combat starts with the enemy at 27 Fear intensity. This gives the player a head start on emotional warfare — the enemy's rhythm is already jittering before the first note plays. Stacks with combat-event Fear spikes.
*   **NPC Interaction:** An "Aura of Joy" perk could grant "+20 Induced Joy" when interacting with Merchants, improving prices. Induced emotions on NPCs create a social gameplay dimension — equip charisma gear before shopping.
*   **Balance:** Induced emotion values are capped per perk tier. Common perks: +10-15. Rare: +20-30. Legendary: +35-50. Multiple Induced Emotion perks from different gear slots DO stack, but with diminishing returns (second perk applies at 50% effectiveness).

#### Focus (Amplifier) Perks
This slot modifies the "Focus" skill. Examples:
*   *Resonant Clarity:* "The Defense debuff from 'Focus' is reduced by 50%."
*   *Echoing Will:* "The buffs from 'Focus' now also apply to your first action of your second turn, at 33% effectiveness."
*   *Emotional Prism:* "When 'Focus' ends, you gain a small amount of the 'Calm' emotion instead of returning to neutral."
*   *Shattered Focus:* "'Focus' buffs are 25% stronger, but the Defense debuff is also 25% more severe."

### Consumables

Four categories of craftable consumables, all made at the Home Base workbench from Elemental Essences and found recipes:

*   **Healing:** HP potions in tiered strengths. Rhythm accuracy during use determines bonus healing (a Perfect use of a potion heals extra).
*   **Emotion:** Shift emotional state mid-combat.
    *   *Calm Draught:* Injects Calm at intensity 60.
    *   *Fury Tonic:* Injects Anger at intensity 80 (high-risk offensive play — narrows timing but pairs with crit builds).
    *   *Clarity Elixir:* Reduces the intensity of all negative emotions by 30.
*   **Rhythm:** Temporarily modify the rhythm challenge.
    *   *Tempo Tincture:* Reduces combat BPM by 15% for 3 turns.
    *   *Clarity Drop:* Widens timing window by 20% for 2 turns (stacks with emotional bonuses).
*   **Buff:** Temporary stat boosts lasting the rest of the combat.
    *   *Attack Elixir:* +15% Attack.
    *   *Defense Salve:* +15% Defense.
    *   *Haste Draught:* +15% Speed.

One consumable may be used per turn as a **free action** (does not consume the turn's skill use).

---

## 4. World & Exploration

### World Structure
*   **Island Types:** The world consists of floating hex-islands in two categories:
    *   **Story Islands (10-12 at launch):** Hand-crafted, fixed-layout islands with scripted encounters, boss guardians, NPCs, and narrative beats. These form the game's critical path. Includes **8 elemental islands** (one per element, each the native biome of its element with an elemental guardian boss) + **2-4 special islands** (Home Base origin island, The Dissonance's domain, mixed-element crossroads, etc.).
    *   **Exploration Islands:** Procedurally generated using the hex map editor's rule system. The editor's placement rules (biome adjacency, tile constraints, encounter density) feed directly into the generator, ensuring procedural islands are structurally valid.
*   **Travel:** The player travels between islands via a **teleportation** ability using elemental rings. New locations are discovered on the world map as the player's power grows, allowing them to "tune into" distant Dissonance.
*   **Encounter Triggers:** Line-of-sight and chance-based ("tall grass") encounters transition the game from exploration to combat mode.

### Procedural Island Generation

The world of Resonance is built from **hexagonal prism columns** — each hex is a vertical column with a flat top, tessellating into floating island dioramas. Story Islands are hand-crafted. Exploration Islands are procedurally assembled from a library of hex tiles governed by biome-specific placement rules.

#### Hex Grid Foundation

**Elevation** is standardized: **1 height unit = 1 hex tile width**. A hex column 3 units tall is exactly as tall as 3 hex tiles laid side by side. This makes elevation readable at a glance and simplifies both the generation rules and the player's spatial reasoning.

Each hex tile carries metadata:

```
HexTile {
    position: { q, r }          // axial hex coordinates
    elevation: int               // standardized units (0-8 typical)
    terrain: string              // e.g., "lava_flow", "ice_shelf", "root_bridge"
    category: enum               // ELEMENT_FEATURE | BASE_TERRAIN | INTEREST | PATHWAY
    biome: element               // governing element
    traversable: bool            // can the player walk on this hex?
    entryPoint: string | null    // scene ID if this hex leads to an interior
    spawnRules: object           // creature/resource spawn configuration
}
```

#### Island Sizes

| Size | Hex Count | Use Case |
|------|-----------|----------|
| **Small** | 60–90 | Quick encounters, resource outposts, procedural filler |
| **Medium** | 120–180 | Standard exploration islands, most procedural generation |
| **Large** | 200–300 | Story Islands, boss arenas, major narrative setpieces |

The rendering budget targets **~150 active hexes** at any time. Small and Medium islands fit entirely. Large islands may use proximity-based hex activation (distant hexes simplified or hidden by fog/void).

#### Composition Targets

Island terrain follows **target ratios with variance**, not rigid thirds:

| Category | Target | Description |
|----------|--------|-------------|
| **Element Features** | 30–40% | Biome-defining terrain (lava flows, ice shelves, crystal formations, root networks) |
| **Base Terrain** | 30–40% | Neutral ground (stone, dirt, grass, sand) appropriate to the biome's mood |
| **Interest Influence** | 20–30% | Area around interest points that contextualizes them (scorched earth near a dragon den, frost rings around a frozen shrine) |
| **Interest Placement** | 5–8% | The interest points themselves (creature dens, treasure, resource nodes, entry points) |
| **Pathways** | 5–10% | Navigable routes connecting regions (bridges, cleared paths, stepping stones) |

Variance prevents formulaic islands. A Fire island might roll 42% element features (dominated by lava) with only 25% base terrain, while another rolls 31% features with 38% base terrain — both feel like Fire, but with distinct character.

#### Generation Passes

Islands are generated in **six ordered passes**. Each pass depends on the output of previous passes.

**Pass 1 — Silhouette & Elevation:**
Generate the island's outline (organic blobby shape, not a perfect hex grid) and elevation map. Elevation profiles are biome-dependent:

| Biome | Elevation Profile |
|-------|-------------------|
| **Fire** | Volcanic peaks (5–8) with caldera depressions (1–2). Sharp elevation changes. |
| **Water** | Low and flat (0–2) with gentle terraced pools. Occasional waterfall drops (3–4). |
| **Earth** | Rolling hills (2–5) with plateau mesas. Most varied, most "natural" topography. |
| **Electric** | Jagged spires (4–7) with deep canyons (0–1). Extreme contrast. |
| **Ice** | Glacial shelves (2–4) with crevasse drops (0). Smooth surfaces, sharp edges. |
| **Nature** | Canopy layers at multiple elevations (1–6). Vertical diversity with organic shapes. |
| **Light** | Ascending terraces (1–7). Organized, symmetrical, cathedral-like. |
| **Void** | Fragmented — floating sub-platforms with gaps between them. Elevation is unreliable. |

**Pass 2 — Interest Seeds:**
Place interest points at locations the terrain naturally creates. Each seed gets an **influence radius** (in hexes) that reserves surrounding hexes for contextual terrain in Pass 3/4.

| Interest Type | Typical Count (Medium Island) | Influence Radius | Placement Heuristic |
|---------------|-------------------------------|------------------|---------------------|
| **Creature Den** | 3–5 | 2–3 hexes | Base of cliffs (elevation drop 2+), inside Boulder Fields, at Cave Mouths. Spawns 1–3 Defender or Aggressor creatures. Influence area becomes patrol zone. |
| **Resource Node** | 4–7 | 1 hex | Exposed ridges (elevation 3+ with open neighbors), Crystal Veins, Coral Shelves. Yields biome-element essences. Respawns on cooldown tick. |
| **Treasure Cache** | 1–3 | 1 hex | Dead-end alcoves (hex with 4+ non-traversable neighbors), elevation peaks, hidden behind features. One-time loot: gear, recipes, gems. Rarity scales with island difficulty. |
| **Entry Point** | 1–4 | 2 hexes | Where terrain suggests depth: cliff faces, large tree bases, ruin interiors, elevation transitions of 3+. Loads an interior scene. |
| **Ambush Zone** | 2–4 | 2–3 hexes | Low-visibility terrain: Ash Drifts, Sea-Spray Mist, Undergrowth, Dust Basins. Hidden Opportunist creatures. No visual indicator until triggered. |
| **Landmark** | 1–2 | 2 hexes | Elevation peaks or island center. Non-interactable environmental storytelling (ruins, statues, natural formations). Provides visual orientation — the player can navigate by landmarks. |

**Biome-specific interest containers** (cosmetic per biome, same mechanics):
Fire: magma nest, obsidian chest. Water: tide cave, pearl shell. Earth: stone burrow, geode. Electric: charged hollow, capacitor crate. Ice: frost warren, ice chest. Nature: bramble den, seed pod. Light: crystal alcove, prism box. Void: rift pocket, void orb.

**Pass 3 — Element Features:**
Fill 30–40% of hexes with biome-defining terrain, respecting elevation. Lava flows downhill. Ice shelves form on flat elevated areas. Crystal formations cluster on ridgelines. Root networks sprawl across mid-elevation terrain. Features avoid overwriting interest seeds.

**Pass 4 — Base Terrain:**
Fill remaining non-interest, non-feature hexes with neutral terrain. Base terrain is the "rest" between dramatic features — visually cohesive but not attention-grabbing. Selection is elevation-driven:

| Biome | Low (0–2) | Mid (2–4) | High (4+) | Palette |
|-------|-----------|-----------|-----------|---------|
| **Fire** | Volcanic gravel | Scorched basalt | Obsidian stone | Dark grays, charcoal, glassy black |
| **Water** | Wet sand | Smooth stone | Dry coral rock | Tan, blue-gray, off-white |
| **Earth** | Packed dirt | Weathered stone | Exposed bedrock | Warm browns, tans, muted orange |
| **Electric** | Fractured glass | Scorched metal | Magnetized rock | Cool metallic, dark teal, gunmetal |
| **Ice** | Packed snow | Frosted stone | Blue ice | White, pale blue, deep glacial blue |
| **Nature** | Leaf litter | Mossy earth | Soft loam | Green-brown, forest floor tones |
| **Light** | Gilded tile | Warm sandstone | Polished marble | Bright warm golds, whites, cream |
| **Void** | Static ground | Null-stone | Cracked obsidian | Desaturated, dark. Textures may glitch. |

All base terrain is traversable. Base terrain hexes have no special gameplay properties — they exist to fill space and establish the biome's visual floor.

**Pass 5 — Pathways:**
Connect interest points and island edges with navigable routes. Every interest point must be reachable. Dead ends are intentional only at treasure/secret locations. Pathways solve three problems: **horizontal gaps** (non-traversable features between areas), **vertical climbs** (elevation changes of 2+), and **hazard crossings** (traversing dangerous terrain safely).

| Biome | Gap Bridge | Vertical Climb | Hazard Crossing |
|-------|-----------|----------------|-----------------|
| **Fire** | Chain bridge over Magma Cracks (1 hex wide, max span 3) | Carved obsidian stairway (1 elevation per hex) | Cooled lava walkway through Lava Flows (hardened crust path) |
| **Water** | Stepping stones across Tidal Pools (max 3 hops, 1 hex each) | Sand-packed ramp (gentle, 1 per 2 hexes) | Coral bridge over deep water (follows Reef Barrier line) |
| **Earth** | Rope bridge between Stone Pillars (max span 4, sways visually) | Carved stairway into cliff face (1 elevation per hex) | Natural ramp around Boulder Fields (follows contour lines) |
| **Electric** | Arc Bridge between Charged Spires (energy beam, max span 3) | Cable lift along spire face (vertical, 2+ elevation) | Insulated walkway through Static Fields (negates hazard tick) |
| **Ice** | Snow bridge across Crevasses (max span 2, fragile visual) | Carved ice stairway (1 elevation per hex, slick visual) | Frozen span between Glacial Shelves (thick ice over void) |
| **Nature** | Root Bridge across gaps (organic, max span 3) | Vine ladder up cliff faces (1–3 elevation) | Mushroom stepping-stones through Undergrowth (elevated above ambush zone) |
| **Light** | Radiant Arch of solidified light (max span 3) | Luminous Terrace (built-in — terraces ARE the vertical pathway) | Light stair through shadow zones (illuminated path) |
| **Void** | Phase bridge (flickers — timing-based traversal) | Gravity thread (thin single-hex path, visually unstable) | Echo path (duplicates another biome's pathway type, corrupted) |

**Pathway rules:**
- Pathways are always 1 hex wide unless the biome's bridge type specifies otherwise.
- A pathway hex replaces whatever terrain was generated in Pass 3/4 at that location.
- Pathways never overwrite interest seeds or biome features that are load-bearing (e.g., a pathway routes around a Lava Pool, never through it).

**Pass 6 — Populate Interest:**
Finalize interest points with specific content: assign creature types and patrol routes to dens, populate resource nodes with element-appropriate essences, configure entry points with their interior scene IDs, place environmental storytelling props within influence radii.

#### Biome Feature Rules

Each biome defines **feature tiles** with placement constraints. Features are the hexes that make a Fire island look like a Fire island.

**Fire Biome Features:**

| Feature | Placement Rules |
|---------|----------------|
| **Lava Flow** | Flows downhill (elevation N → N-1). Minimum 3 connected hexes. Cannot dead-end (must reach island edge or pool). |
| **Lava Pool** | Forms at local elevation minima. 2–5 hex clusters. Must be fed by at least one Lava Flow. |
| **Geyser Vent** | Elevation 3+. Not adjacent to Lava Pool (pressure needs solid ground). Interest seed magnet. |
| **Obsidian Shelf** | Flat surface adjacent to cooled lava. Elevation 2–4. Traversable platform. |
| **Ash Drift** | Low elevation (0–2). Fills depressions not claimed by lava. Soft terrain, may hide Opportunist enemies. |
| **Magma Crack** | Hairline hex on steep elevation transitions (N to N-2+). Non-traversable hazard. Pathway must bridge. |

**Water Biome Features:**

| Feature | Placement Rules |
|---------|----------------|
| **Tidal Pool** | Elevation 0–1. 2–4 hex clusters at island edges. Always traversable (shallow water). May contain Opportunist creatures. |
| **Cascade** | Connects two elevations with 2+ height difference. Minimum 2 hexes tall. Must flow toward a Tidal Pool or island edge. Non-traversable water hazard. |
| **Coral Shelf** | Elevation 1–2. Flat clusters of 3–6 hexes. Must be adjacent to at least one Tidal Pool or island edge. Traversable. Resource node magnet. |
| **Sea-Spray Mist** | Elevation 0–1, adjacent to Cascade or island edge. Visual overlay (traversable). Hides hex contents until player is adjacent — Opportunist ambush zone. |
| **Sunken Ruin** | Elevation 0. 2–3 hex clusters surrounded by Tidal Pool or island edge. Interest seed magnet. Entry point candidate. |
| **Reef Barrier** | Elevation 1. Linear chain of 3–5 hexes along island perimeter. Non-traversable border that channels pathing inward. |

**Earth Biome Features:**

| Feature | Placement Rules |
|---------|----------------|
| **Stone Pillar** | Elevation 4+. Single hex or 2-hex cluster. Must be 2+ elevation above all neighbors. Non-traversable landmark (pathways route around). |
| **Cave Mouth** | Elevation 2–3 at base of Stone Pillar or cliff face (adjacent hex with elevation 2+ higher). Entry point. Always an interest seed. |
| **Boulder Field** | Elevation 2–4. 3–8 hex irregular clusters on slopes. Traversable but slow (movement cost +1). Defender creature territory. |
| **Crystal Vein** | Elevation 3+. Linear chain of 2–4 hexes along cliff faces or ridge tops. Resource node. Must be adjacent to elevation change of 2+. |
| **Plateau Mesa** | Elevation 3–5. Flat cluster of 4–8 hexes, all same elevation. Often contains interest seeds on surface. Traversable. |
| **Dust Basin** | Elevation 0–1. Depression surrounded by higher terrain on 3+ sides. 3–6 hex clusters. Opportunist ambush zone. |

**Electric Biome Features:**

| Feature | Placement Rules |
|---------|----------------|
| **Charged Spire** | Elevation 5+. Single hex peaks. Must be 3+ above nearest neighbor. Non-traversable. Arc Bridges originate from spires. |
| **Arc Bridge** | Connects two Charged Spires or spire-to-ground (elevation 3+). Energy bridge — traversable. Max span 3 hexes. Must have clear line between endpoints. |
| **Static Field** | Elevation 1–3. 3–5 hex flat clusters. Traversable with hazard — periodic damage tick while standing. Visual: crackling surface energy. |
| **Shattered Pylon** | Elevation 2–4. Single hex ruin. Interest seed magnet (loot/lore). Must be adjacent to at least one Static Field. |
| **Canyon Floor** | Elevation 0. Linear chains of 2–6 hexes between spires. Primary pathway substrate. Defender creature patrol routes. |
| **Conductor Node** | Elevation 3–4. Single hex on ridgelines. Resource node. Must be within 2 hexes of a Charged Spire (draws energy from spire). |

**Ice Biome Features:**

| Feature | Placement Rules |
|---------|----------------|
| **Glacial Shelf** | Elevation 2–4. Flat clusters of 4–8 hexes, all same elevation. Traversable. Primary movement surface. |
| **Crevasse** | Elevation 0. Linear chains of 2–5 hexes. Must border a Glacial Shelf (shelf cracked apart). Non-traversable gap. Pathway must bridge. |
| **Frost Spire** | Elevation 4–6. Single hex or 2-hex cluster. Sharp vertical ice formation. Non-traversable landmark. |
| **Frozen Lake** | Elevation 1. 3–6 hex flat cluster. Traversable but fragile — may crack under combat (environmental hazard). Always at local elevation minimum. |
| **Ice Cave** | Elevation 2–3 at edge of Glacial Shelf or base of Frost Spire. Entry point. Always an interest seed. |
| **Wind-Scoured Flat** | Elevation 3–4. 2–4 hex exposed area with no adjacent vertical cover (no neighbors 2+ higher). Resource node location. Open terrain. |

**Nature Biome Features:**

| Feature | Placement Rules |
|---------|----------------|
| **Root Bridge** | Connects hexes across elevation gaps of 1–3. Organic pathway. Traversable. Minimum 2 hexes long. Must connect to Canopy Platform or ground (elevation 0–2). |
| **Canopy Platform** | Elevation 4–6. 3–6 hex clusters of living-wood surfaces. Must be connected to ground by at least one Root Bridge or Vine Wall. |
| **Mushroom Cluster** | Elevation 1–3. 2–4 hex clusters in shaded areas (adjacent to Canopy Platform above or neighbor with elevation 3+). Resource node. Bioluminescent at night. |
| **Vine Wall** | Elevation 2–5. Vertical hex face connecting two elevations (1–3 height difference). Climbable pathway alternative to Root Bridge. Must have high terrain or Canopy Platform at top. |
| **Hollow Trunk** | Elevation 2–4. Single hex. Entry point (interior is inside a massive tree). Interest seed. Must be adjacent to Canopy Platform. |
| **Undergrowth** | Elevation 0–2. Fills low areas between root systems. Traversable. Opportunist ambush zone (dense foliage hides creatures). |
| **Bloom Patch** | Elevation 1–3. 1–2 hex clusters. Must be adjacent to moisture source (Mushroom Cluster or elevation 0 hex). Healing node — restores small HP when traversed. |

**Light Biome Features:**

| Feature | Placement Rules |
|---------|----------------|
| **Luminous Terrace** | Elevation increases by exactly 1 per hex in a direction. 3–8 hex stepped formations. Traversable staircase terrain. Core structural element. |
| **Prism Column** | Elevation 5–7. Single hex. Non-traversable. Adjacent hexes gain "illuminated" property (reveals hidden content, disables Opportunist ambush in radius of 2). |
| **Reflection Pool** | Elevation 0–1. 2–3 hex flat clusters at terrace bases. Traversable. Resource node. Must be adjacent to at least one Luminous Terrace. |
| **Radiant Arch** | Connects two Luminous Terraces across a gap. 2–3 hex bridge of solidified light. Traversable. Must span elevation drop of 2+. |
| **Sanctum Alcove** | Elevation 3–5. 1–2 hex recessed area flanked by Luminous Terraces on 3+ sides. Interest seed magnet. Entry point candidate. |
| **Dawn Spire** | Elevation 7+. Single hex pinnacle — highest point on island. Non-traversable landmark. Boss arena proximity marker on Story Islands. |

**Void Biome Features:**

All Void constraints are soft and may be violated — see [The Void Exception](#the-void-exception).

| Feature | Placement Rules |
|---------|----------------|
| **Fragmented Platform** | Any elevation. 2–6 hex clusters isolated by Null-Space Gaps. Core traversable surface. Each platform functions as a mini-island. |
| **Null-Space Gap** | No elevation (bottomless). 1–3 hex voids between platforms. Non-traversable without Storm stance or Void ability. |
| **Gravity Inversion** | Any elevation. Single hex. Flips movement cost — entering costs double, but grants a speed buff for 3 turns. Visual: hovering debris. |
| **Echo Tile** | Any elevation. Single hex that duplicates an adjacent hex's terrain type with corrupted properties. Traversable. 50% chance useful interest, 50% hazard. |
| **Rift Tear** | Any elevation. Single hex. Entry point — but interior element is randomized (a Void cave might generate as a corrupted Fire interior). Always an interest seed. |
| **Phase Hex** | Elevation alternates between 2 values on a tick. 1–2 hexes. Traversable only when "phased in." Creates timing-based navigation puzzles. |

#### Scene-Based Architecture

Each explorable space — island surface, cave interior, building, shrine — is a **separate scene** with its own full rendering budget.

```
Story Island "Emberfall"
├── Surface (150 hex) ← rendered scene
│   ├── Cave Mouth (hex 47) → loads "Emberfall Depths" scene
│   ├── Forge Tower (hex 112) → loads "Molten Forge" scene
│   ├── Obsidian Shrine (hex 83) → loads "Shrine of Ash" scene
│   └── Fire Temple (hex 156) → loads "Temple Interior" scene
├── Emberfall Depths (120 hex) ← separate scene, full budget
│   └── Deep Cavern (hex 64) → loads "Deep Cavern" scene
├── Molten Forge (80 hex) ← separate scene
├── Shrine of Ash (40 hex) ← separate scene
├── Temple Interior (150 hex) ← separate scene
│   └── Inner Sanctum (hex 98) → loads "Sanctum" scene
└── ...
```

**Scene transitions** are clean cuts: screen fades to black behind the mascot, current scene is disposed (GPU resources freed), new scene loads, fade in. No attempt to render two scenes simultaneously.

A single island with 10 entry points could contain **650–1,650 explorable hexes** across all its interiors — but only ~150 are rendered at any moment. This keeps the GPU budget fixed while allowing arbitrarily deep content.

#### Interior Scenes

Cave and building interiors are procedurally generated with the same 6-pass system, but with **modified parameters** and **element-specific interior palettes**.

**Interior generation constraints (overrides to surface rules):**
- **Single entry/exit** by default (the way you came in). Interiors with 80+ hexes may have one secondary exit.
- **Elevation inverts** — cave interiors generate downward (start at elevation 4, descend to 0). Building interiors generate upward (start at 0, ascend). Shrine interiors are flat (elevation 1–2 throughout).
- **Tighter composition** — Interest Placement target increases to 8–15% (vs 5–8% surface). Base Terrain decreases to 20–30%. Interiors are destinations, not traversal spaces.
- **Higher creature density** — Creature Dens per hex ratio is ~2x surface. Rarer creature variants spawn only in interiors. Loot rarity floor is one tier higher than surface (Uncommon minimum).
- **Linear layout bias** — surface islands are open/radial. Interiors favor **branching corridors** (main path with 1–3 side branches). This creates exploration tension: do you push deeper or explore the branch?

| Biome | Interior Type | Elevation | Key Features | Unique Mechanic |
|-------|--------------|-----------|--------------|-----------------|
| **Fire** | Magma tube network | Descends 4→0 | Lava vein walls (glow light source), obsidian chambers (flat rest areas), heat-shimmer air (visual distortion near lava) | **Heat buildup** — deeper hexes have ambient damage tick. Cooling stations (obsidian chambers) reset the timer. Pushes player to plan descent carefully. |
| **Water** | Flooded grotto | Descends 3→0 | Bioluminescent pools (light source + resource nodes), dripping stalactites (visual), tide-surge rooms (periodic flood hazard) | **Tide cycle** — some corridors flood on a timer (3–5 turns), becoming non-traversable. Player must time movement between surges or find alternate routes. |
| **Earth** | Crystal cavern | Descends 4→0 | Layered sediment walls (visual), crystal formations (light source + resource nodes), fossil alcoves (treasure/lore), echoing stone halls (large chambers) | **Echo mapping** — unvisited branches are faintly visible on the map (sound bouncing). Gives partial intel without full exploration. Unique to Earth interiors. |
| **Electric** | Conduit tunnel | Mixed (up/down) | Charged conduit walls (periodic arc hazard), plasma chambers (open rooms with arc bridges), magnetic suspension bridges (cross gaps) | **Power grid** — some sections are dark (no conduit power). Player can reroute power at junction hexes to illuminate new paths, but this de-powers and darkens other sections. Spatial puzzle. |
| **Ice** | Glacial tunnel | Descends 3→0 | Refraction chambers (prism light puzzles — visual only), frozen waterfall walls (visual), sub-ice lake (large flat chamber at bottom) | **Ice integrity** — some floor hexes crack after being walked on (one-way traversal). Creates commitment to a path. Cracked hexes are visible but not re-traversable. |
| **Nature** | Root warren / hollow tree | Ascends 0→5 | Fungal forests (bioluminescent, resource nodes), root tunnels (narrow corridors), underground gardens (open chambers with Bloom Patches) | **Growth cycle** — some paths are blocked by vines that grow back on a timer. Cut through once, but if you backtrack after 5+ turns, the path has regrown. Encourages forward momentum. |
| **Light** | Luminous crystal cave | Ascends 0→6 | Prism galleries (light refracts through crystals, illuminating distant areas), light-shaft cathedrals (tall open chambers with vertical light beams) | **Illumination radius** — player emits light. Hexes outside radius are obscured (fog of war). Prism Columns in the interior extend the player's light reach in specific directions. Strategic positioning. |
| **Void** | Impossible geometry | Chaotic (any) | Gravity-shifted corridors (walk on walls/ceiling), echo chambers (rooms that mirror/duplicate), null-space pockets (rooms with no floor — traversal via Phase Hexes) | **Spatial corruption** — the interior layout may silently rearrange after the player passes through certain hexes. A branch that was empty may now contain creatures. The map is unreliable. |

#### The Void Exception

Void is the **rule-breaker biome**. Where other elements follow consistent physical logic, Void islands subvert expectations:

- **Fragmented silhouettes** — islands aren't contiguous. Sub-platforms float with gaps that may or may not be crossable.
- **Unreliable elevation** — hexes may shift elevation contextually. What was a walkable surface might become a pit.
- **Glitched features** — Void features borrow visuals from other elements but corrupted: a lava flow that flows uphill, a frozen waterfall that drips shadow, crystal formations that phase in and out.
- **Generation pass order can shuffle** — Void islands may place interest before terrain, or pathways before features, creating structurally surprising layouts.
- **Unique traversal** — some gaps require Void-specific traversal (Storm stance, Void abilities) to cross, gating content behind elemental progression.

#### Story Island Curation

Story Islands use procedural generation as a **starting point**, then receive hand-editing:

1. **Generate** a large island (200–300 hex) using the biome's rules.
2. **Lock** the interesting formations the generator created.
3. **Hand-place** narrative elements: NPC locations, boss arena, scripted encounter triggers, environmental puzzle locations, story-critical entry points.
4. **Adjust** terrain to support narrative flow — ensure the player's natural path through the island hits story beats in order.
5. **Polish** — add one-off decorative hexes, unique props, and bespoke lighting.

This workflow means Story Islands feel hand-crafted (because they are, in the final pass) while leveraging procedural generation to avoid starting from a blank canvas.

#### World Connectivity & Transportation

Islands exist as nodes in a **constellation network** (see [World Map](#world-map)). Transportation between islands extends the explorable world indefinitely:

- **Elemental Rings** teleport between discovered islands (existing mechanic).
- **Procedural island chains** — discovering one exploration island may reveal connections to adjacent procedural islands, creating archipelago clusters the player can traverse.
- **Story progression** unlocks new constellation branches, each containing a mix of story and procedural islands.
- **No backtracking penalty** — teleportation is instant between any two discovered nodes. The world grows outward, never forcing tedious return trips.

#### Persistence Model

The world uses **three persistence tiers** based on island type:

**Tier 1 — Story Islands (Permanent):**
- Full state saved to server: terrain modifications, defeated bosses, rescued NPCs, opened chests, completed puzzles.
- **Boss guardians do not respawn** once defeated.
- **Regular creatures respawn on a MUD-style tick** — a timer runs against the island's cached state. After a cooldown (e.g., 5–15 minutes per creature type), enemies repopulate in their dens. The player returns to a living island, not a cleared one.
- Interior scenes share parent's persistence tier. A chest opened in "Emberfall Depths" stays opened permanently.

**Tier 2 — Procedural Islands (Session-Lived):**
- State persists **while the player is "on" the island** (including inside its interiors).
- If the player leaves the island (teleports away, returns to Home Base), a **warning prompt** appears: "This island will be lost if you leave. Are you sure?"
- Upon confirmation, the island and all its interiors are discarded. Loot already collected is kept. Progress toward encounters in-progress is lost.
- **Creature respawn ticks still run** on procedural islands while the player is present — long exploration sessions see enemies return.

**Tier 3 — Interior Scenes (Parent-Lived):**
- Interior scene state is **cached in memory** when the player exits to the parent surface.
- Re-entering the same interior restores the cached state exactly (enemies in the same positions, loot untouched, progress preserved).
- Interior cache lifetime is **tied to the parent island's tier**:
    - Story Island interiors → permanent (cached, then serialized to save).
    - Procedural Island interiors → lost when parent island is discarded.
- **Respawn ticks run against cached state** — if the player spends 10 minutes on the surface, then re-enters a cave, creatures that were on respawn timers may have returned.

**Scene caching flow:**
1. Player enters cave → surface state serialized to memory cache, surface GPU resources disposed, cave scene loads.
2. Player explores cave → cave state is live.
3. Player exits cave → cave state cached, cave GPU resources disposed, surface restored from cache.
4. Surface respawn timers have been ticking during the cave visit — the surface may have new creatures.

### World Map
The world map is presented as an **abstract constellation** — islands appear as glowing nodes on a dark sky, connected by lines of elemental energy. The aesthetic is stylized and non-geographic: the player isn't looking "down" at a world but "up" at a cosmic web of resonance points.

*   **Discovered nodes** glow in their elemental color (Fire = red-orange, Ice = blue-white, etc.).
*   **Undiscovered nodes** appear as faint, flickering lights — the player can see that *something* is there, building anticipation.
*   **Connection lines** pulse with energy when the player has cleared a path (defeated the guardian) between two islands.
*   **Active node** (player's current island) radiates a brighter aura.
*   The constellation grows as the player progresses — each new island discovered adds a new star to the sky, creating a visual record of the player's journey.

### Day/Night Cycle
The game features a **day/night cycle** that affects exploration islands:

*   **Lighting & Mood:** Each biome has distinct day and night palettes. Night brings darker, more atmospheric lighting with bioluminescent elements and ambient glow.
*   **Creature Spawns:** Some creatures are **nocturnal** — they only appear at night, offering exclusive skills and essence types. Daytime-only creatures exist too, encouraging varied play sessions.
*   **Gameplay Impact:** Minor — the cycle is primarily cosmetic and atmospheric, with creature spawn variety as the main mechanical difference. No combat stat changes based on time of day. Story Islands may have fixed time-of-day for narrative purposes.

### Exploration Movement & Camera

*   **Movement:** Path-based navigation on a hex grid. The player taps/clicks a destination hex and the mascot auto-paths there. Encounters and events can **interrupt the path**, transitioning to combat or dialogue. Movement feels fluid and purposeful, not turn-by-turn plodding.
*   **Camera:** Perspective camera at **~55-60° tilt** with a narrow FOV (30-40), creating an "isometric premium" look. Technically a 3-point perspective projection on a 3D field, but it *reads* as isometric — giving tactical overhead readability with depth, parallax, and dimensionality. The mascot retains its full 3D presence (an orthographic camera would flatten it). Depth-of-field can blur distant hexes to focus attention.

### Enemy Creatures

Enemies are a mix of **hand-crafted** and **procedurally generated** variants:
*   **Hand-Crafted:** A handful of signature creatures per element with unique models, animations, and skill pools. These define each element's personality (e.g., Earth Golem, Electric Sprite, Ice Sentinel).
*   **Procedural Variants:** Randomized **Hybrid AI Profiles** (Behavioral Role + Rhythmic Style), randomized skill pools drawn from the element's skill list, and stat scaling based on island difficulty. Ensures exploration islands always have fresh encounters.
*   Boss enemies are always hand-crafted.

#### Creature Exploration Behavior
How creatures behave on the hex map before combat is determined by their **Behavioral Role**:

*   **Aggressors:** Patrol along routes and **chase** the player on sight. Enter combat by intercepting the player's path. Visible and aggressive — the player must plan around them or fight.
*   **Defenders:** Guard a fixed hex or small cluster. They **do not pursue** — combat only triggers when the player enters their territory. Often guard resource nodes or treasure hexes.
*   **Opportunists:** **Hidden** in "tall grass" or environmental cover. Combat triggers by chance when the player walks through their hex. Cannot be seen or avoided — the player only knows certain hexes *might* contain Opportunists. Higher-level Opportunists have lower detection chance (harder to stumble into, but nastier when found).

Some creatures **flee** if the player's Total Level significantly exceeds theirs (cosmetic — the player sees them scurry away, reinforcing power growth).

### Environmental Puzzles
Morph stances have exploration abilities (Sun melts ice barriers, Bastion breaks rock walls, Tide crosses water gaps, Storm disrupts void barriers). These are implemented as **environmental puzzles**:

*   **Frequency:** Rare and **always optional**. A few per Story Island, never required for main progression. Rewards behind barriers are bonus loot, rare essences, or hidden paths to optional encounters.
*   **Story Islands Only:** Environmental puzzles appear exclusively on **hand-crafted Story Islands**. Procedural Exploration Islands do not generate them (too complex to procedurally design well, and they'd feel arbitrary).
*   **Design:** Simple one-step puzzles (see a frozen barrier → activate Sun stance → melt it). No multi-stance sequences or complex chains. The puzzle is "do you have the right stance unlocked?" not "can you solve the riddle?"

### NPC Roster

A fixed roster of **4-6 rescuable NPCs**, each unlocking one major Home Base function:

| NPC | Function | Found |
|-----|----------|-------|
| **The Smith** | Gear upgrades and repair (Blacksmith) | Story Island 1 |
| **The Alchemist** | Consumable crafting (Workbench) | Story Island 2 |
| **The Archivist** | Skill/enemy database, Scan upgrades (Researcher) | Story Island 3 |
| **The Gatherer** | NPC tasking for resource nodes | Story Island 4 |
| **The Merchant** | Buy/sell gear and rare materials | Story Island 5 |
| **The Trainer** | Practice arena, skill slot management | Optional/hidden |

*(NPC names and island assignments are placeholder — final assignments TBD during world design.)*

#### The Trainer — Practice Arena & Skill Respec

The Trainer is a hidden/optional NPC who unlocks the most comprehensive training facility in the game:

**Practice Arena (three modes):**
1.  **Free Practice:** Play any learned skill's rhythm pattern with no stakes. Pure muscle memory training. Useful for learning new skills' patterns before taking them into combat.
2.  **Sparring:** Fight a simulated enemy (no rewards, no penalties, no essence loss). The player chooses the enemy's element, Rhythmic Style, and difficulty. Full combat with all mechanics active. Test builds, practice emotional management, learn boss patterns.
3.  **Rhythm Challenges:** Standalone rhythm mini-games outside the combat context:
    *   *Speed Runs:* Hit X perfect notes in a row as fast as possible.
    *   *Accuracy Challenges:* Play a long pattern sequence with no misses.
    *   *Pattern Memorization:* See a pattern once, then reproduce it from memory.
    *   Challenges have leaderboard integration (filtered by assist status).

**Skill Respec:**
The Trainer's respec is **slot reassignment only** — swap which skills occupy the player's 8 active combat slots and 1-2 reactive slots. The player **never loses learned skills** and there is no Affinity XP redistribution. Respec is free and instant. This keeps build experimentation frictionless while preserving the investment of skill leveling.

### Progression Gates
Access to new islands uses a **hybrid system**:
*   **Boss Defeat:** Each Story Island has a **guardian boss**. Defeating it unlocks the next Story Island on the world map.
*   **Affinity Gating:** Story quests reveal islands on the map, but the player's **Elemental Affinity Level** determines survivability. Islands with a "Difficulty Level" higher than the player's relevant Affinity will trigger punishing Biome Hazard turns in combat.
*   **Exploration Islands** unlock progressively as the player's Total Level increases, providing infinite replayable content between story beats.

### Defeat Consequences
Upon defeat in combat, the player respawns at Home Base with:
*   **Negative Emotional State:** The player returns with dominant Fear or Sadness at high intensity, which will affect rhythm performance in subsequent combats until managed.
*   **Refocus Cooldown:** A cooldown period before the Focus skill can be used again.
*   **Essence Loss:** The player loses a percentage of **carried (unbanked) essences**. Essences stored at the Home Base workbench are safe. This incentivizes regular bank trips.
*   **Gear Durability Loss:** All equipped gear loses durability. Gear must be repaired at the workbench. If durability reaches zero, the gear's perk is disabled (but the gear is not destroyed).

No loss of XP, skills, or items.

### Resources & Crafting

#### Elemental Essences (Typed Currency)
Essences are the game's primary resource and come in **8 types — one per element**: Fire Essence, Water Essence, Earth Essence, Electric Essence, Ice Essence, Nature Essence, Light Essence, Void Essence.

*   **Acquisition:** Defeating an enemy drops essences matching its element. A Fire creature drops Fire Essences. Salvaging gear returns essences matching the gear's elemental affinity. Harvesting resource nodes yields the node's elemental type.
*   **Usage:** Gear crafting/upgrading costs specific essence types. Morph stance activation consumes the stance's governing element essences. Consumable crafting may require mixed essence types (e.g., a Clarity Elixir needs Light + Water Essences).
*   **Banked vs Carried:** Essences are split between **carried** (in the player's inventory, at risk on defeat) and **banked** (deposited at the Home Base Essence Bank, safe from loss). Players must physically return to base to bank essences. This creates a risk/reward loop: stay out longer for more farming, or bank frequently to protect gains.
*   **Resource Node Cooldowns:** Nodes use a **Hybrid Tick System**. They have a long real-time cooldown (e.g., 12-24 hours), but this cooldown is actively reduced by:
    *   **Home Base Upgrades:** Functional tiles (e.g., "Resonance Accelerator") that passively reduce cooldown timers for all nodes of a specific element.
    *   **NPC Tasking:** The Gatherer NPC can be assigned to harvest from discovered nodes over time, effectively bypassing cooldowns for nodes the player has already found.

#### Crafting System
Primarily for making **Consumables** at the Alchemist's workbench and **Gear** at the Smith's forge. Recipes/patterns are found as loot or purchased from the Merchant.

### Inventory & Carrying Capacity

The game uses a **hybrid inventory system** with three separate pools:

*   **Gear Inventory:** Slot-limited — the player can carry up to **20 gear items** total (equipped + unequipped). Encourages regular salvaging and prevents hoarding. Gear beyond the cap must be salvaged or banked at base.
*   **Consumables (Combat):** Limited to **3-5 consumables per combat** (chosen pre-fight or from a quick-swap menu). The player's full consumable stockpile is unlimited, but only a subset is usable in any given fight. This forces strategic pre-fight preparation.
*   **Essences:** Unlimited quantity, but split between **carried** (at risk) and **banked** (safe). See [Elemental Essences](#elemental-essences-typed-currency).

### The Home Base
*   **Primary Function:** A **Safe Haven** to fully restore HP and reset emotional state. It can never be attacked.
*   **Secondary Function:** A **Crafting Hub** containing the workbench for all crafting, gear upgrade, and gear repair activities (unlocked progressively via NPC rescues).
*   **Tertiary Function:** An **Essence Bank** where players deposit essences for safekeeping (protected from defeat loss).
*   **Customization:** A core feature where players use rare, collectible hex tiles to build and design their base. It can also be expanded with **functional tiles** (e.g., a "Resonance Accelerator", "Practice Arena", "Legendary Forge") that unlock new abilities.

---

## 5. Social Features

### Async Base Visits
*   Players can **visit friends' Home Bases** asynchronously — no real-time multiplayer required.
*   Visitors can leave **gifts** (essences, common crafting materials) and **messages** (short text or preset emotes).
*   Visiting a friend's base grants a small, daily "Harmony Bonus" (e.g., a minor XP or essence boost).

### Leaderboards
*   **Rhythm Accuracy:** Global and friend-list leaderboards for rhythm performance (average Perfect rate, longest Perfect streak).
*   **Combat Streaks:** Consecutive victories without defeat.
*   **Base Ratings:** Community ratings for Home Base designs (cosmetic showcase).
*   **Boss Speed:** Fastest boss clear times per guardian.

No real-time PvP or co-op multiplayer.

---

## 6. User Experience (UX) & Player Journey

### The First 15 Minutes: Player Tutorial
This section outlines the step-by-step player journey for the game's opening sequence. The goal is to introduce core mechanics in an interactive, safe, and engaging way.

#### 1. Starting the Game: Affinity Choice
- The game opens not on a menu, but in an abstract scene centered on a "Combat Ring."
- Eight icons representing the core elements are arranged around the ring: Fire, Water, Earth, Electric, Nature, Ice, Light, and Void.
- A prompt in the center reads, "Choose Your Starting Affinity."
- **Mechanic Introduced:** Elemental Affinities.

#### 2. Welcome to the Island: Morph Mode Introduction
- Upon selecting an affinity (e.g., Fire), the player is transported to a small, floating hex-map island. The island's element is the one weakest to the player's choice (e.g., Fire affinity starts in the Ice area).
- The player's crystal mascot appears, encased in an element corresponding to the island (e.g., a block of ice).
- A scripted sequence begins: The mascot automatically `morphTo('sun')`, visibly melting the ice with a `firemeditation` gesture, then morphs back to its default crystal form.
- An info card appears, briefly explaining Morph Modes. The card's icon then animates, flying to its permanent spot in the main UI, teaching the player where the Morph button lives.
- **Reward:** The player immediately and permanently unlocks their first affinity-appropriate Morph Mode.
- **Mechanics Introduced:** Elemental Weaknesses, Morph Modes, Gestures (as visual flair), UI Navigation.

#### 3. First Encounter
- The commotion of the mascot breaking free attracts a nearby low-level monster of the island's element (e.g., an Ice Monster).
- An exclamation mark appears above the monster's head, and it moves to intercept the player on the hex grid.
- **Mechanic Introduced:** Line-of-sight encounter triggers.

#### 4. Trial by Fire: First Combat
- A seamless transition occurs: the background hex-map fades away, replaced by the battle screen. The mascot and enemy resize and move into their combat positions. The "Battle Rhythm Ring" UI appears. The goal is an "unbroken animation" with no visible loading.
- The enemy attacks first. The game introduces the "Call and Response" mechanic. Time dramatically slows down as the enemy's attack gesture animates, and the Battle Ring provides a simple, pulsing visual pattern.
- The UI provides clear feedback on tap accuracy and the resulting emotional state change.
- **Mechanics Introduced:** Seamless state transitions, Reactive Skills, Time Dilation (for tutorials), Rhythm Input, Performance Grading, the Emotional State system.

#### 5. Learning to Absorb
- The successful "Call and Response" is scripted to do enough damage to put the monster into the "Absorb" HP range.
- An "Absorb" indicator appears. When the player taps it, a card UI pops up presenting a weighted selection of skills to absorb from the monster (prioritizing skills the player doesn't know).
- The player selects a skill, and the Absorb tug-of-war minigame begins (scripted to be un-failable for the tutorial).
- The enemy performs its pattern at degraded accuracy (it's emotionally broken from combat), while the player mirrors the pattern. The capture gauge fills quickly.
- Upon success, an info card for the newly acquired skill appears, and its icon flies to the skill bar in the UI.
- **Mechanics Introduced:** The "Absorb" state, Skill Stealing (with player choice), the Absorb Minigame.

#### 6. Seamless Return to Exploration
- A battle summary card shows XP gained and skills acquired.
- The battle screen fades out as the hex-map fades back in, completing the seamless loop.
- **Mechanic Introduced:** The full reward loop.

### Starting Equipment
After the tutorial, the player begins the game with exactly **two skills**:
1.  **One Absorbed Skill** — The skill stolen from the tutorial monster. This is a Damage skill matching the tutorial island's element (e.g., Ice Shard from the Ice Monster). The player's first offensive tool.
2.  **One Gifted Reactive Skill — "Call and Response"** — Given to the player during the tutorial combat as a scripted event. This is a Reactive skill that mirrors incoming attack patterns to reduce damage. It teaches the player both offense and defense from the very start.

Everything else must be earned. The player is functional (one attack, one defense) but hungry for more — the Absorb mechanic becomes immediately compelling because the player has only one offensive skill.

---

## 7. Music & Audio Direction

### Biome-Driven Adaptive Music
Each biome has a **base musical composition** arranged in **three intensity layers**:

1.  **Ambient (Exploration):** Sparse, atmospheric version. Melodic fragments, ambient pads, environmental sounds. Plays during hex-map traversal.
2.  **Combat (Full Arrangement):** The complete song — full instrumentation, driving rhythm section. Triggers seamlessly when combat begins.
3.  **Boss (Climax):** A unique, heightened arrangement for the biome's guardian boss. Higher energy, more complex layers, climactic structure.

### Enemy Primal Drums
Each enemy type has a **primal drum pattern** — a rhythmic layer that sits on top of the biome's arrangement:
*   Enemy tempos are **mathematical divisions of the biome's base BPM** (e.g., biome at 120 BPM; enemies at 120, 60, or 240 BPM subdivisions). This ensures the drums always sync with the underlying music — no crossfade artifacts, always cohesive.
*   The primal drums **enhance** the biome arrangement rather than fighting it. The combat music feels like a natural escalation of the exploration music, with the enemy's rhythmic personality layered on top.
*   Players who internalize a biome's music gain an intuitive advantage — the rhythm "makes sense" within the harmonic context they've been hearing during exploration.

### Elemental Sound Palettes
Each element has a distinct **timbral identity** used in both enemy drums and skill sound effects:
*   **Fire:** Aggressive percussion, crackling tones, staccato hits.
*   **Water:** Fluid melodic runs, resonant bells, wave-like swells.
*   **Earth:** Deep bass drums, stone impacts, heavy sustained tones.
*   **Electric:** Glitchy synths, sharp transients, syncopated buzzes.
*   **Ice:** Crystalline chimes, brittle cracks, high-frequency shimmer.
*   **Nature:** Organic rhythms, wooden percussion, breath-like textures.
*   **Light:** Pure sine tones, harmonic overtones, choir-like pads.
*   **Void:** Reversed sounds, sub-bass drones, spectral whispers.

---

## 8. Art Direction & Production

### Visual Style
**Stylized low-mid poly with painterly attention.** Clean geometric shapes and bold silhouettes (keeping asset demands manageable for a WebGL target), but with hand-painted texture work, careful lighting, and polished material quality that elevates every surface. The world should feel crafted, not procedurally bland.

*   **Environment:** Hex tiles with painterly ground textures, stylized foliage, and atmospheric lighting. Each biome has a distinct color palette and mood.
*   **Creatures:** Low-mid poly models with strong silhouettes and expressive animation. Elemental effects (engine gestures) provide visual richness.
*   **Mascot:** Already defined by the Emotive Engine — crystal form with elemental morph capabilities.

### Platform
**Web-first, mobile later.** The game ships as a browser experience (JS/WebGL via the Emotive Engine), then wraps for mobile post-launch.

### Target Session Length
**Flexible.** Designed for micro-sessions (a single combat encounter in 2-5 minutes) but supports longer play without penalty. The Explore-Encounter-Reward loop naturally creates satisfying stopping points.

### Save System
**Continuous persistence.** Every action is persisted immediately to a server-backed store. No concept of "saving" — the game state is always current. Supports seamless cross-device play (web to mobile and back) without manual sync. If the player closes the browser mid-exploration, they resume exactly where they left off.

---

## 9. Accessibility

### Difficulty Tiers
Three selectable difficulty tiers affecting timing window width, pattern complexity, and enemy stat scaling:
*   **Harmonic (Easy):** Wide timing windows, simplified patterns (fewer inputs per skill), reduced enemy stats. For players who want the story and vibes.
*   **Resonant (Normal):** Standard tuning. The intended experience.
*   **Dissonant (Hard):** Narrow timing windows, full-complexity patterns, enhanced enemy AI and stats. For rhythm game veterans.

Difficulty can be changed at any time from the settings menu without penalty.

### Assist Toggles
Individual accessibility options that can be enabled at any time, independently of difficulty tier:
*   **Auto-Rhythm:** All rhythm inputs auto-succeed at **Good** level (1.0x multiplier). The player still sees the patterns and can manually input for better grades. Ensures no player is locked out of content.
*   **Visual Metronome:** An always-on pulse guide on the Battle Rhythm Ring (the same guide that Calm emotion provides). Helps players who struggle with internal beat-keeping.
*   **Slow Mode:** Global BPM reduction (-25%). All combat tempos are slowed uniformly.
*   **High Contrast Notes:** Enlarged, high-contrast markers on the rhythm ring for visibility.
*   **One-Handed Mode:** All directional inputs are remapped to simple taps. Reduces input complexity at the cost of losing directional pattern variety.

Assist toggles do not affect leaderboard eligibility (leaderboards filter by assist status).

---

## 10. Endgame & Live Content

### Procedural Exploration
Infinite procedurally generated Exploration Islands with **scaling difficulty** tied to Total Level. Provides a daily play loop for essence farming, skill discovery, and creature encounters.

### Challenge Modes
Special challenges for skill expression and leaderboard competition:
*   **Speed Runs:** Beat a boss under a time limit.
*   **Tempo Challenges:** Fight at extreme BPMs (200+ BPM).
*   **No-Miss Runs:** Complete an island without a single Miss grade.
*   **Element Restriction:** Complete an island using only skills of a single element.
*   **Emotional Endurance:** Complete an island while maintaining a specific dominant emotion throughout.

### Seasonal Content
New content added each season (ties into the optional Battle Pass):
*   New Story Islands with narrative continuation.
*   New creatures, skills, and Boss encounters.
*   New cosmetics (base tiles, mascot skins, gesture effects).
*   Limited-time challenge events with exclusive cosmetic rewards.

---

## 11. Monetization

### Model: Cosmetic Microtransactions
The game is **free-to-play** with **cosmetic-only** purchases. No gameplay-affecting purchases.

*   **Home Base Tiles:** Seasonal and themed decorative hex tiles, animated tiles with particle effects, rare tile sets.
*   **Mascot Skins:** Elemental variants, seasonal skins, achievement-unlocked skins. Visual only — no stat changes.
*   **Visual Effects:** Custom gesture effects, trail effects, Absorb animations.
*   **Seasonal Track (optional):** A "Battle Pass" style seasonal track with free and premium tiers for cosmetic rewards. No XP boosts, essence multipliers, or cooldown skips.

**Hard rule:** Nothing that touches gameplay. The rhythm skill ceiling is the game's identity — pay-to-win would undermine it.
