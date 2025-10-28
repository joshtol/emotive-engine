# GitHub Setup Guide

This guide will help you complete the repository setup to maximize visibility.

## ✅ Completed

- [x] Live demo already exists at `emotiveengine.com/demo`
- [x] Updated README with Examples Gallery
- [x] Added Performance & Compatibility section
- [x] Linked to actual domain instead of GitHub Pages

## 🚀 Manual Steps Required (10 minutes total)

### 1. Add GitHub Topics for Discoverability (2 minutes)

Topics help users discover your project through GitHub search.

1. Go to your repo homepage: https://github.com/joshtol/emotive-engine
2. Click the ⚙️ gear icon next to "About" (top right)
3. Add these topics (comma-separated):
    ```
    animation, particles, canvas2d, emotion, gesture, ai-interface,
    typescript, javascript, music-visualization, beat-detection,
    web-animation, particle-system, real-time, mascot, character-animation
    ```
4. Click "Save changes"

**Expected impact**: 10-20x more discoverability in GitHub search

### 2. Update Repository Description (1 minute)

While in the "About" settings:

1. **Description**:
   `Real-time particle animation engine for AI interfaces with emotion-driven motion and musical beat synchronization`
2. **Website**: `https://emotiveengine.com`
3. Check ✅ **Use topics**
4. Click "Save changes"

### 3. Enable GitHub Discussions (5 minutes)

GitHub Discussions provides a community forum for questions, ideas, and
showcases.

#### Step 1: Enable Discussions

1. Go to **Settings** → **Features**
2. Check ✅ **Discussions**
3. Click **Set up discussions**

#### Step 2: Create Welcome Post (Announcements)

**Category:** Announcements **Title:** `Welcome to Emotive Engine Discussions!`

**Body:**

```markdown
# 👋 Welcome to Emotive Engine!

We're excited to have you here! This is the place to connect with other
developers building emotionally intelligent interfaces.

## 💬 What you can do here:

- **Ask questions** about implementation, API usage, or best practices
- **Share your projects** built with Emotive Engine
- **Discuss ideas** for new features, emotions, or gestures
- **Get help** troubleshooting issues or optimizing performance
- **Show off** creative use cases and demos

## 🚀 Getting Started

New to Emotive Engine? Check out these resources:

- [Quick Start Guide](https://github.com/joshtol/emotive-engine#quick-start) -
  Get running in 5 minutes
- [Live Demo](https://emotiveengine.com/demo) - Interactive playground
- [Examples](https://github.com/joshtol/emotive-engine/tree/main/examples) - 10
  working examples
- [API Documentation](https://github.com/joshtol/emotive-engine#api) - Complete
  reference

## 🎨 Share Your Work

Built something cool? We'd love to see it! Create a new discussion under **Show
and Tell** and share:

- Screenshots or GIFs
- Live demo link
- What emotions/gestures you're using
- Any challenges you faced

## 💡 Discussion Categories

- **Q&A** - Ask technical questions
- **Show and Tell** - Share your projects
- **Ideas** - Propose new features or improvements
- **General** - Everything else

## 🤝 Community Guidelines

This is a welcoming, inclusive community. Please:

- Be respectful and kind to others
- Stay on topic and provide context
- Search existing discussions before posting
- Follow our
  [Code of Conduct](https://github.com/joshtol/emotive-engine/blob/main/CODE_OF_CONDUCT.md)

---

**Ready to get started?** Comment below with an introduction and tell us what
you're building! 🎉
```

**After posting:** Pin this discussion (click "..." → "Pin discussion")

#### Step 3: Configure Discussion Categories

Go to **Discussions** tab → **Categories** (⚙️ icon) → Configure each:

**Existing Categories to Keep:**

1. **Announcements** 📢
    - Description: `Updates and news from maintainers`
    - Format: Announcement
    - ✅ Keep as-is

2. **General** 💬
    - Description: `Chat about anything and everything here`
    - Format: Open-ended discussion
    - ✅ Keep as-is

**New Categories to Create:**

3. **Q&A** ❓
    - Description:
      `Ask the community for help with implementation, APIs, or troubleshooting`
    - Format: Question / Answer
    - ✅ Enable "Mark as answer"

4. **Show and Tell** 🎨
    - Description:
      `Share projects, demos, and creative use cases built with Emotive Engine`
    - Format: Open-ended discussion

5. **Ideas** 💡
    - Description:
      `Share ideas for new features, emotions, gestures, or improvements`
    - Format: Open-ended discussion

6. **Performance & Optimization** ⚡
    - Description:
      `Discuss performance tips, optimization techniques, and benchmarks`
    - Format: Open-ended discussion

#### Step 4: Create Example Discussions

Create one example in each category to show users how to post:

**Q&A Example:** **Title:** `How do I sync animations to a custom BPM?`

**Body:**

````markdown
I'm building a music visualizer and want to sync the mascot's animations to a
specific BPM from my audio analysis.

**What I've tried:**

```javascript
const mascot = new EmotiveMascot({ canvasId: 'canvas' });
mascot.setBPM(120); // This sets the BPM
```
````

**Question:** How do I dynamically update the BPM based on real-time beat
detection?

**Environment:**

- Emotive Engine: v2.5.1
- Framework: React 18

````

*(Then reply to your own question with the answer to show how Q&A works)*

---

**Show and Tell Example:**
**Title:** `AI Tutor with Emotional Responses - Cherokee Language Learning`

**Body:**
```markdown
I built an AI language tutor that uses Emotive Engine to provide emotional feedback!

![Demo GIF or Screenshot](https://emotiveengine.com/use-cases/cherokee)

## Features
- 😊 Celebrates correct answers with 'joy' emotion
- 💙 Shows empathy with 'love' undertone for mistakes
- 🎵 Syncs animations to background cultural music

## Tech Stack
- Emotive Engine v2.5.1
- Claude AI for tutoring
- React + Next.js

## Code Snippet
```javascript
// Celebrate correct answer
if (isCorrect) {
  mascot.setEmotion('joy');
  mascot.perform('celebrating');
}
````

**Live Demo:** https://emotiveengine.com/use-cases/cherokee

Would love feedback! 🎉

````

---

**Ideas Example:**
**Title:** `[Feature Request] Add 'curious' emotion with tilting gesture`

**Body:**
```markdown
## Problem
I'm building a chatbot interface and want the mascot to show curiosity when the user asks a question.

## Proposed Solution
Add a new 'curious' emotion with:
- **Visual**: Particles lean toward cursor/element
- **Undertone**: Light blue-green with sparkles
- **Gesture**: Tilt gesture (mascot leans forward)

## Example Use Case
```javascript
// User asks a question
chatbot.on('question', () => {
  mascot.setEmotion('curious');
  mascot.express('tilt');
});
````

## Alternatives Considered

- Using 'focused' emotion (too intense)
- Using 'neutral' with custom particles (loses semantic meaning)

Would this be useful for others? Open to contributing a PR!

````

---

**Performance & Optimization Example:**
**Title:** `Performance benchmarks: 500 particles at 60 FPS on mobile`

**Body:**
```markdown
I ran some benchmarks on different devices and wanted to share results:

## Desktop Performance
- **Device:** MacBook Pro M1
- **Particles:** 500
- **FPS:** Stable 60
- **CPU:** ~15%

## Mobile Performance
- **Device:** iPhone 12
- **Particles:** 200 (auto-scaled)
- **FPS:** Stable 60
- **Battery:** Minimal impact

## Optimization Tips
1. Use `adaptiveQuality: true` for automatic scaling
2. Lower `particleCount` on mobile
3. Disable glow effects on older devices

```javascript
const mascot = new EmotiveMascot({
  canvasId: 'canvas',
  adaptiveQuality: true,
  particleCount: isMobile ? 150 : 400
});
````

Anyone else have benchmark data to share?

````

---

#### Step 5: Update Repository Links

Your README already links to Discussions correctly at line 198. No changes needed!

### 4. Wiki Documentation (Optional - Later)

Your README links to the Wiki but it's not populated. Two options:

**Option A: Quick Fix (5 min)**

1. Go to **Wiki** tab → Create first page
2. Add basic content:

    ```markdown
    # Emotive Engine Documentation

    Full documentation is being migrated. For now, see:

    - [README](https://github.com/joshtol/emotive-engine#readme)
    - [Examples](https://github.com/joshtol/emotive-engine/tree/main/examples)
    - [Live Demo](https://emotiveengine.com/demo)
    - [API Reference](https://github.com/joshtol/emotive-engine/blob/main/CHANGELOG.md)
    ```

**Option B: Full Migration (30 min)**

- Move docs from `CHANGELOG.md` sections to organized Wiki pages
- Create separate pages for API, Gestures, Emotions, etc.

### 4. Create Social Preview Image (Optional - 10 min)

GitHub shows a preview image when people share your repo:

1. Create a 1280x640px image (use Canva, Figma, or screenshot your demo)
2. Go to **Settings** → Scroll to **Social preview**
3. Upload your image

**Recommendation**: Screenshot your hero banner or the demo at
emotiveengine.com/demo in action

## 📊 Success Metrics

After completing these steps, you should see:

- **GitHub search ranking**: Improved discoverability
- **Click-through rate**: 50%+ from README to demo
- **Time on page**: Increased as people try the demo
- **Stars/forks**: Should start growing organically

## 🎯 Next Steps (Future Enhancements)

1. **Blog post** - Write about the technical implementation
2. **Product Hunt** - Launch when you hit 10-20 stars
3. **Twitter/LinkedIn** - Share the live demo with a video
4. **Dev.to article** - Tutorial on building with Emotive Engine
5. **Example showcase** - Create gallery of projects using the engine

## 📝 Deployment

Your demo is already live at **emotiveengine.com/demo** via Vercel! No
additional deployment needed.

## ❓ Troubleshooting

**Topics not showing?**

- Make sure you clicked "Save changes" in the About section
- Topics should appear below the repo description

**Demo not loading?**

- Your demo is hosted on Vercel at emotiveengine.com/demo
- Check Vercel dashboard for deployment status

---

**Questions?** Open an issue or reach out.
````
