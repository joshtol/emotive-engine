# `feel()` API Implementation Plan for Emotive Engine

This document outlines a phased implementation plan for improving the `feel()` API, focusing on performance, code reuse, and advanced natural language processing capabilities.

## Phase 1: Low Hanging Fruit (Performance & Quick Wins)

**Objective:** Fix memory allocation issues, improve initialization speed, and reduce duplicate code without changing the public API surface.

### 1.1 Static Lookup Maps in `IntentParser`
**File:** `src/core/intent/IntentParser.js`
*   **Problem:** The reverse lookup maps (`emotionLookup`, `undertoneLookup`, etc.) are built inside the constructor, causing unnecessary recalculations if multiple mascot instances exist.
*   **Action:**
    *   Move `buildReverseLookup` and `buildModifierLookup` outside the class.
    *   Initialize the maps as module-level constants (e.g., `const emotionLookup = buildReverseLookup(emotions);`).
    *   Remove these from the `constructor()`.
    *   Update `parse()` methods to use the static module-level maps instead of `this.XLookup`.

### 1.2 Fix Tokenizer Regex State
**File:** `src/core/intent/tokenizer.js`
*   **Problem:** `PHRASE_REGEXPS` uses the `g` (global) flag. `extractPhrases` sets `regex.lastIndex = 0` before replacing. While `String.replace` handles this safely for now, it's an unnecessary global state that could cause issues if concurrent parsing is introduced.
*   **Action:**
    *   Remove the `g` flag from the pre-compiled regexes in `PHRASE_REGEXPS` if only one replacement per phrase is expected, OR keep it but ensure `String.prototype.replace(regex, string)` is the only usage (which is state-safe).
    *   A safer, cleaner approach is to use `String.prototype.replaceAll(string, string)` if the target environment supports ES2021, avoiding RegExp entirely for simple phrase replacements.

### 1.3 Unify Rate Limiter Implementation (Zero-Allocation)
**Files:** `src/EmotiveMascotPublic.js`, `src/3d/index.js`
*   **Problem:** The 2D wrapper (`EmotiveMascotPublic.js`) uses an array `.filter()` for rate limiting, allocating memory on every call. The 3D wrapper (`3d/index.js`) uses a more efficient circular buffer, but the logic is still duplicated.
*   **Action:**
    *   Create a new shared utility `src/core/intent/RateLimiter.js` implementing a circular buffer.
    *   Replace the inline rate limiting code in *both* `EmotiveMascotPublic.js` and `3d/index.js` with the new shared `RateLimiter` class.

## Phase 2: Medium Complexity (Logic Enhancements)

**Objective:** Improve the parser's logic, handle negations properly, and centralize the `feel()` execution logic.

### 2.1 Deduplicate `feel()` Execution Logic
**Files:** `src/EmotiveMascotPublic.js`, `src/3d/index.js`, new `src/core/intent/IntentExecutor.js`
*   **Problem:** The code that maps a parsed intent (`{ emotion, gestures, shape }`) to engine calls (`setEmotion`, `express`, `morphTo`) is duplicated identically in the 2D and 3D wrappers.
*   **Action:**
    *   Create `src/core/intent/IntentExecutor.js` with a static method `execute(mascot, parsedIntent)`.
    *   Update both `EmotiveMascotPublic.js` and `3d/index.js` to call `IntentExecutor.execute(this, parsed)` after parsing and validating.

### 2.2 Basic Negation Handling (Antonyms)
**Files:** `src/core/intent/IntentParser.js`, `src/core/intent/synonyms/emotions.js`
*   **Problem:** "Not happy" skips the word "happy" entirely, defaulting to neutral, instead of correctly mapping to a logical opposite like "sad".
*   **Action:**
    *   Create an antonym mapping dictionary (e.g., `happy -> sad`, `angry -> calm`).
    *   In `IntentParser.parse()`, when `negateNext` is true and an emotion token is matched, use the antonym dictionary to swap the emotion before applying it to the result.
    *   If no antonym exists, fallback to 'neutral'.

### 2.3 Streaming Intent Aggregation Support
**File:** `src/EmotiveMascotPublic.js`, `src/3d/index.js`
*   **Problem:** Developers must buffer LLM text streams manually until a full `FEEL: ...` directive is formed.
*   **Action:**
    *   Implement a `feelStream(chunk)` method.
    *   This method buffers incoming text chunks internally.
    *   When a newline or the end of a `FEEL: [...]` block is detected, it automatically calls `feel()` and flushes the buffer.

## Phase 3: Complex Architectural Changes (Deep Integrations)

**Objective:** Add state awareness, asynchronous queuing, and context to the NLP parser to allow for highly expressive, multi-step LLM commands.

### 3.1 Sequential Action Queuing (The "Then" keyword)
**Files:** `src/core/intent/tokenizer.js`, `src/core/intent/IntentParser.js`, `src/core/intent/IntentExecutor.js`
*   **Problem:** `feel('look surprised then smile')` fires both `surprise` and `joy` simultaneously because the parser just aggregates tokens.
*   **Action:**
    *   Update `tokenizer.js` to split tokens not just on commas, but on sequence markers ("then", "and then", "followed by").
    *   Update `IntentParser.parse()` to return an *array* of sequential intent objects instead of a single object.
    *   Update `IntentExecutor.execute()` to iterate over the array, using `setTimeout` or the engine's timeline/chaining features to delay the execution of step `N+1` until step `N` is complete.

### 3.2 Context-Aware Parsing
**File:** `src/core/intent/IntentParser.js`
*   **Problem:** The parser is stateless. "Calm down" or "Louder" cannot be interpreted relative to the current state.
*   **Action:**
    *   Update the `parse(intent, currentState)` signature to accept the mascot's current `emotion` and `intensity`.
    *   Add relative modifier logic (e.g., "more intense" -> `newIntensity = Math.min(1.0, currentState.intensity + 0.2)`).
    *   Add emotion transitions based on current state (e.g., if current is "angry" and intent is "calm down", transition to "focused" or "neutral").

### 3.3 Intent Confidence Scoring & Undertone Fallback
**File:** `src/core/intent/IntentParser.js`
*   **Problem:** Binary matching. A weak synonym match forces a primary emotion change.
*   **Action:**
    *   Assign confidence weights to synonyms in the dictionaries (e.g., "ecstatic" = 1.0 Joy, "content" = 0.4 Joy).
    *   During parsing, calculate a total confidence score for the detected emotion.
    *   If the primary emotion confidence is low (e.g., < 0.5), apply it as an *undertone* instead of overwriting the primary emotion. This allows for nuanced expressions like a "sad but slightly content" smile.