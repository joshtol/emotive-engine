# Shader Calibration Screenshots

Automated screenshot capture for systematic shader validation and analysis.

## Quick Start

```bash
# 1. Start the local dev server (Live Server on port 5500)
# Open examples/3d-shader-test-suite.html in Live Server

# 2. Run the calibration capture
npm run calibrate

# 3. View results
# Open examples/calibration-screenshots/index.html in browser
```

## What This Does

The calibration script automatically:

1. **Launches headless browser** (Playwright)
2. **Loads shader test suite** at http://localhost:5500/examples/3d-shader-test-suite.html
3. **Runs 27 calibration tests** covering all shader effects
4. **Captures screenshots** of each configuration
5. **Generates HTML gallery** for easy viewing
6. **Creates JSON manifest** with test metadata

## Output Files

```
examples/calibration-screenshots/
├── index.html              # Gallery view of all screenshots
├── manifest.json           # Test metadata and configurations
├── 01-pbr-roughness-mirror.png
├── 02-pbr-roughness-glossy.png
├── 03-pbr-roughness-balanced.png
├── ...
└── 27-performance-dragon.png
```

## Calibration Tests Included

### PBR Material (6 tests)
- Roughness range: mirror → glossy → balanced → matte
- Metallic: dielectric vs metal (Fresnel testing)

### Ambient Occlusion (4 tests)
- Crevice darkening on torus knot
- Organic geometry (bunny ears)

### Subsurface Scattering (3 tests)
- Thin geometry translucency progression
- Light penetration on bunny ears

### Anisotropic Reflection (3 tests)
- Isotropic vs directional highlights
- Brushed metal effect

### Iridescence (4 tests)
- Thin-film interference progression
- Soap bubble and pearl effects

### Render Modes (3 tests)
- Normal visualization (dragon)
- Edge detection (suzanne)
- Toon/cel shading (cow)

### Combined Effects (3 tests)
- Skin (AO + SSS)
- Brushed metal (metallic + anisotropy)
- Pearl (SSS + iridescence)

### Performance (1 test)
- High-poly dragon with all effects enabled

## Viewing Results

### Browser Gallery
Open `index.html` in any browser to see:
- Organized by category
- Screenshot with description
- Model and camera info
- Interactive cards

### JSON Manifest
```json
{
  "timestamp": "2025-11-02T...",
  "totalTests": 27,
  "categories": { ... },
  "tests": [
    {
      "id": "01-pbr-roughness-mirror",
      "category": "PBR",
      "description": "Roughness 0% - Perfect mirror",
      "model": "utah-teapot",
      "camera": "front",
      "material": {
        "roughness": 0,
        "metallic": 30,
        "ao": 100,
        "sss": 0,
        "anisotropy": 0,
        "iridescence": 0
      },
      "renderMode": "standard",
      "filename": "01-pbr-roughness-mirror.png"
    }
  ]
}
```

## Analysis Workflow

1. **Run calibration** after shader changes
2. **Review screenshots** in gallery
3. **Compare with previous run** (git diff screenshots)
4. **Upload to Claude** for AI analysis
5. **Implement suggested adjustments**
6. **Re-run calibration** to verify fixes

## Customizing Tests

Edit `scripts/capture-shader-calibration.js`:

```javascript
const CALIBRATION_TESTS = [
    {
        name: 'custom-test-name',
        category: 'Custom',
        model: 'utah-teapot',
        camera: 'front',
        material: {
            roughness: 50,
            metallic: 0,
            // ... other properties
        },
        renderMode: 'standard',
        description: 'Your test description'
    }
];
```

## Requirements

- **Node.js** 16+
- **Playwright** (installed via npm)
- **Live Server** or dev server on port 5500
- Test suite must be running at configured URL

## Troubleshooting

### "Failed to load test suite"
- Ensure Live Server is running
- Check URL in script matches your server port
- Default: http://localhost:5500/examples/3d-shader-test-suite.html

### "Model failed to load"
- Check that OBJ models are in `examples/models/`
- Verify loadGeometry() function is working
- Look for console errors in browser

### "Screenshot is black"
- Increase wait times in script (model loading)
- Check WebGL initialization
- Verify canvas is rendering

### "Missing screenshots"
- Script may have crashed partway
- Check console for error messages
- Re-run calibration

## Integration with CI/CD

Add to your workflow:

```yaml
- name: Capture shader calibration
  run: |
    npm run local &  # Start server
    sleep 5
    npm run calibrate

- name: Upload screenshots
  uses: actions/upload-artifact@v3
  with:
    name: calibration-screenshots
    path: examples/calibration-screenshots/
```

## Performance

- **Total runtime**: ~2-3 minutes for 27 tests
- **Headless mode**: Fast, no window opens
- **Parallel**: Could be parallelized for faster runs
- **Screenshot size**: ~100-300KB each (PNG)

## Future Enhancements

- [ ] Video capture for animation testing
- [ ] Diff tool comparing runs
- [ ] Automated pass/fail validation
- [ ] Performance metrics (FPS, render time)
- [ ] Multi-angle captures per test
- [ ] Thumbnail generation
- [ ] Comparison slider (before/after)

---

**Last Updated**: 2025-11-02
**Script**: scripts/capture-shader-calibration.js
**Tests**: 27 calibration scenarios
