# LinkedIn Post 1: Technical Story (For Developers)

**Goal:** Get developers to try it, star the repo, engage with the technical
challenge

**Tone:** Honest, technical, humble

**Length:** ~1,500 characters (LinkedIn sweet spot)

---

## Draft Version 1: Problem-First Approach

```
I spent 4 months solving a problem that probably doesn't affect most developers: how do you make particles move to a musical beat in real-time?

Sounds niche. It is. But here's why it got interesting:

Most animation libraries work in milliseconds. If you hardcode "bounce for 500ms," it works great... until the music tempo changes. At 120 BPM, that's perfect. At 90 BPM? Everything feels off-rhythm.

So I built animations that operate in musical time instead of clock time.

Instead of:
setTimeout(() => bounce(), 500)

You write:
scheduleOnBeat(() => bounce(), '1/4 note')

Change the BPM? Everything adjusts automatically. No math, no conversions.

The result is Emotive Engine - a Canvas 2D particle system for AI interfaces that can express emotions and sync to music.

Built with:
- Pure TypeScript (zero dependencies)
- 60 FPS on mobile devices
- 234KB bundle size
- 44 pre-built emotional "performances"

Open source (MIT): github.com/joshtol/emotive-engine
Live demo: emotiveengine.com/demo

The most satisfying part? Watching particles breathe in perfect sync with a slow song, then switching to a fast track and seeing them adapt instantly.

Is this useful for everyone? No.
Is it useful for AI chatbots, voice assistants, or interactive experiences? Maybe.

If you're building something that needs personality, take a look. And if you see ways to improve it, PRs welcome.

#OpenSource #JavaScript #TypeScript #Animation #WebDev
```

---

## Draft Version 2: Technical Challenge Approach (POLISHED v2)

**Attachment:** `assets/bpm-comparison.gif` (600x300, 955KB)

- Shows side-by-side comparison: hardcoded 500ms vs musical time at 45 BPM
- Left mascot drifts ahead, right mascot stays in sync
- Visually demonstrates the exact problem described in the post

```
Here's a weird technical problem:

You hardcode an animation to bounce for 500ms. Works perfectly at 120 BPM.

Switch to a 90 BPM song and everything feels wrong. Why? Because 500ms is no longer "one beat" — it's 0.75 beats. Your particles drift off-rhythm.

Most animation libraries work in milliseconds. Music works in beats. There's no translation layer.

So I built one.

The solution:
• Convert BPM to a universal time base (60,000ms / BPM)
• Treat beats as the atomic unit, not milliseconds
• Let emotions modify rhythm (nervous = faster, tired = slower)

Specify a bounce as "1 beat" and it becomes:
• 500ms at 120 BPM
• 667ms at 90 BPM
• 353ms at 170 BPM

Change the tempo, everything adjusts. No recalculation needed.

I built this into Emotive Engine — an open-source particle system for AI interfaces.

Tech details:
• TypeScript, zero dependencies
• 324 automated tests
• Canvas 2D (60 FPS on mobile)
• 72 emotional states (joy, calm, nervous, etc.)

Try it: emotiveengine.com/demo
Code: github.com/joshtol/emotive-engine

MIT licensed. I've used it for shopping assistants and language learning demos. Use it however you want.

If you try it, let me know what breaks.

#WebDevelopment #OpenSource #Canvas #Animation #TypeScript
```

---

## Draft Version 3: Developer Journey Approach

```
I just shipped something I've been building nights/weekends for the past 4 months.

It's a particle animation engine for AI interfaces. Think: chatbot avatars that actually express emotions.

Why I built it:
I was working on a voice assistant project and realized there's no good way to show emotional feedback in real-time. Lottie files are pre-rendered. Three.js is too heavy for simple use cases. CSS animations can't handle thousands of particles.

So I built what I needed.

What it does:
- Particle-based emotional expressions (joy, calm, anger, fear, etc.)
- Syncs to music beats automatically
- 60 FPS on mobile devices
- Zero dependencies, pure TypeScript
- MIT licensed

Technical stuff I'm proud of:
- Musical time system (animations specified in beats, not milliseconds)
- Adaptive quality (200-500 particles on desktop, 100-200 on mobile)
- Semantic performances (one line of code triggers multi-step choreography)
- 234KB gzipped (including all 44 emotional states)

Try it: emotiveengine.com/demo
Code: github.com/joshtol/emotive-engine

It's getting ~80 downloads/week on npm. Small, but enough to know it's useful to someone.

If you're building conversational AI, voice assistants, or just want particles that dance to music, give it a shot.

Feedback welcome. So are GitHub stars if you find it interesting.

#OpenSource #AI #JavaScript #WebDev #Animation
```

---

## Recommended: Version 2 (Technical Challenge)

**Why:**

- ✅ Leads with a specific problem
- ✅ Shows technical depth (BPM calculations)
- ✅ Concrete examples with code
- ✅ Honest about scope ("use it however you want")
- ✅ Invites engagement ("spot bugs in BPM detection")
- ✅ No fluff, no hype

**Metrics mentioned:**

- ✅ 324 tests (verifiable)
- ✅ 72 emotional states (specific, not "dozens")
- ✅ 60 FPS mobile (testable claim)

**Call to action:**

- ✅ "Try the live demo" (low barrier)
- ✅ "Stars and PRs appreciated" (specific ask)
- ✅ "Spot bugs" (invites technical discussion)

---

## Your Call

Which version resonates with you? Or want me to blend elements from multiple
drafts?

Key questions:

1. **Tone:** Version 1 (humble), Version 2 (technical), or Version 3 (personal
   journey)?
2. **Opening:** Problem statement or weird challenge?
3. **Details:** More code snippets or more use cases?
4. **CTA:** "Stars welcome" or "Feedback appreciated" or "PRs wanted"?

Let me know what feels most authentic to you and I'll refine it.
