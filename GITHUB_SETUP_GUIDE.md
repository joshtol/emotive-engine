# GitHub Setup Guide

This guide will help you complete the repository setup to maximize visibility
and enable the live demo.

## ✅ Completed

- [x] Created live demo at `docs/demo/index.html`
- [x] Added GitHub Actions workflow for auto-deployment
- [x] Updated README with Examples Gallery
- [x] Added Performance & Compatibility section

## 🚀 Manual Steps Required

### 1. Enable GitHub Pages (5 minutes)

The live demo is ready but needs GitHub Pages enabled:

1. Go to **Settings** → **Pages** in your GitHub repo
2. Under **Source**, select: **GitHub Actions**
3. The workflow will automatically deploy on the next push to `main`
4. Your demo will be live at: `https://joshtol.github.io/emotive-engine/demo/`

### 2. Add GitHub Topics for Discoverability (2 minutes)

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

### 3. Update Repository Description (1 minute)

While in the "About" settings:

1. **Description**:
   `Real-time particle animation engine for AI interfaces with emotion-driven motion and musical beat synchronization`
2. **Website**: `https://joshtol.github.io/emotive-engine/demo/`
3. Check ✅ **Use topics**
4. Click "Save changes"

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
    - [Live Demo](https://joshtol.github.io/emotive-engine/demo/)
    - [API Reference](https://github.com/joshtol/emotive-engine/blob/main/CHANGELOG.md)
    ```

**Option B: Full Migration (30 min)**

- Move docs from `CHANGELOG.md` sections to organized Wiki pages
- Create separate pages for API, Gestures, Emotions, etc.

### 5. Create Social Preview Image (Optional - 10 min)

GitHub shows a preview image when people share your repo:

1. Create a 1280x640px image (use Canva, Figma, or screenshot your demo)
2. Go to **Settings** → Scroll to **Social preview**
3. Upload your image

**Recommendation**: Screenshot your hero banner or the rhythm demo in action

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

## 📝 Deployment Commands

To deploy the demo immediately:

```bash
# Commit the new changes
git add .
git commit -m "feat: add live demo and enhanced README"
git push origin main
```

The GitHub Actions workflow will automatically deploy to Pages!

## ❓ Troubleshooting

**Demo not loading?**

- Check GitHub Actions tab for deployment status
- Ensure Pages is set to "GitHub Actions" not "Deploy from branch"
- Wait 2-3 minutes after first deployment

**Topics not showing?**

- Make sure you clicked "Save changes" in the About section
- Topics should appear below the repo description

**Demo 404 error?**

- Verify the workflow completed successfully
- Check that `docs/demo/index.html` exists in the main branch
- Try accessing: `https://joshtol.github.io/emotive-engine/demo/index.html`

---

**Questions?** Open an issue or check GitHub Pages documentation.
