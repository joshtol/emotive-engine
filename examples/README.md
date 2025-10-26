# Emotive Engine Examples

This directory contains HTML files used to generate the assets in the main
README.

## Asset Generators

### [hero-banner-capture.html](hero-banner-capture.html)

Generates the animated hero banner at the top of the README.

**Features demonstrated:**

- Large-scale mascot rendering (2.5x scale)
- Full-banner particle system (1280x400px)
- Backdrop glow effects
- Emotion cycling with gestures
- Shape morphing synchronized with emotions

**How to use:**

1. Open the file in a browser
2. Use ScreenToGif to capture the animation
3. Optimize and save as `assets/hero-banner.gif`

---

### [emotion-demo-capture.html](emotion-demo-capture.html)

Generates the side-by-side usage demo GIF in the Quick Start section.

**Features demonstrated:**

- Clean emotion transitions
- Shape morphing (`morphTo('moon')`)
- Gesture expressions (`express('breathe')`)
- Centered composition with backdrop

**How to use:**

1. Open the file in a browser
2. Use ScreenToGif to capture exactly 600x600px
3. Record for ~8 seconds (2 full loops)
4. Optimize to ~500KB-1MB
5. Save as `assets/emotion-demo.gif`

---

## Why Include These?

These files serve multiple purposes:

1. **Transparency** - Shows exactly how README assets were created
2. **Examples** - Demonstrates advanced usage patterns and API calls
3. **Reproducibility** - Anyone can regenerate assets if needed
4. **Education** - Real-world code showing particle systems, sequencing, and
   timing

Feel free to modify these files to experiment with the engine's capabilities!
