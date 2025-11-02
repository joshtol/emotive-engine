# 🌅 HDRI Manual Testing Guide

**Ready for Manual Testing!** ✅

---

## 📍 Test Suite URL

Open this file in your browser (with Live Server running on port 5500):

```
http://localhost:5500/examples/3d-shader-test-suite.html
```

**Or directly open**:
```
C:\zzz\emotive\emotive-engine\examples\3d-shader-test-suite.html
```

---

## 🎮 HDRI Testing Steps

### Step 1: Open the Test Suite
1. Start your local server (Live Server on port 5500)
2. Open `http://localhost:5500/examples/3d-shader-test-suite.html`
3. Wait for the 3D model to load (cyan icosphere)

### Step 2: Verify HDRI File Exists
Check that the HDRI file is in place:
```
C:\zzz\emotive\emotive-engine\assets\3d\lonely_road_afternoon_puresky_4k.exr
```

**If missing**: The loader will display an error. You can use any `.hdr` or `.exr` file for testing.

### Step 3: Load HDRI
1. Look at the **right panel** (Controls)
2. Find the new **"Environment"** section
3. Click the **"📦 Load HDRI"** button
4. Watch the status message below the button

**Expected**:
- Status changes to "Loading HDRI..."
- Console shows loading progress
- After ~2-5 seconds: "✅ HDRI loaded successfully! (512px cubemap, 8 mip levels)"

**If error**:
- Check console for details
- Verify file path in browser DevTools Network tab
- Error will show: "❌ Failed: [error message]"

### Step 4: Adjust HDRI Intensity
1. Move the **"HDRI Intensity"** slider (0-100%)
2. Observe reflections on the model
3. Try different values:
   - **0%**: No environment reflections (original look)
   - **50%**: Subtle environment lighting
   - **100%**: Full environment reflections

### Step 5: Test With Different Materials

**Test A: Mirror Metal** (Best for seeing environment reflections)
1. Click "MIRROR" preset button
2. Load HDRI (if not already loaded)
3. Set HDRI Intensity to 100%
4. Set Metallic to 100%
5. Set Roughness to 0%

**Expected**: Model acts like a perfect mirror, reflecting the HDRI environment map

**Test B: Brushed Metal**
1. Click "BRUSHED" preset button
2. Load HDRI
3. Set HDRI Intensity to 100%
4. Set Anisotropy to 100%

**Expected**: Horizontal brushed metal with environment reflections blurred by roughness

**Test C: Glossy Plastic**
1. Set Roughness to 20%
2. Set Metallic to 30%
3. HDRI Intensity to 80%

**Expected**: Subtle glossy reflections of environment

### Step 6: Test Camera Angles
Try different camera angles to see reflections from various viewpoints:
- **Front**: Direct view
- **Rim**: Edge lighting (Fresnel effect with HDRI)
- **Grazing**: Maximum Fresnel (environment should be very visible at edges)

---

## 🔍 What to Look For

### ✅ Success Indicators:

1. **Environment Reflections Visible**
   - Model shows colored reflections from HDRI (not just cyan base color)
   - Reflections change as you rotate the camera
   - Mirror surfaces reflect the sky/ground from the HDRI

2. **Roughness-Based Blur**
   - **0% roughness** (mirror): Sharp, clear reflections
   - **50% roughness**: Blurred reflections (using mipmaps)
   - **100% roughness**: Very blurred, almost diffuse

3. **Metallic Scaling**
   - **100% metallic**: Strong environment reflections
   - **0% metallic**: Weak environment reflections (dielectric)

4. **Fresnel Effect**
   - At grazing angles: Environment reflections much stronger
   - Front view: Less environment, more base color
   - Rim view: Environment visible at edges only

### ❌ Common Issues:

**Issue**: "Failed to load resource: 404"
- **Fix**: HDRI file not found. Check path or use a different HDR/EXR file

**Issue**: Status shows error about "Renderer not initialized"
- **Fix**: Wait for page to fully load, then click Load HDRI button again

**Issue**: No visible change when loading HDRI
- **Fix**:
  1. Increase HDRI Intensity slider to 100%
  2. Set Metallic to 100% (metals reflect more environment)
  3. Set Roughness to 0% (mirror finish for clearest reflections)

**Issue**: Console shows "EXR loading via browser Image API (limited support)"
- **Expected**: Browser doesn't natively support EXR well
- **Workaround**: Convert your `.exr` file to `.hdr` format using:
  ```bash
  # Using ImageMagick (if installed)
  magick lonely_road_afternoon_puresky_4k.exr lonely_road_afternoon_puresky_4k.hdr
  ```
  Or use an online EXR → HDR converter

---

## 🎨 Visual Test Checklist

- [ ] **Status message shows "✅ HDRI loaded successfully!"**
- [ ] **Console logs show**: "HDRI loaded and applied to scene"
- [ ] **Console logs show**: "Loading HDRI from: ../assets/3d/..."
- [ ] **Console logs show**: "Loaded [width]x[height] equirectangular map"
- [ ] **Console logs show**: "Converted to 512x512 cubemap"
- [ ] **Console logs show**: "Created WebGL cubemap with 8 mip levels"
- [ ] **Model shows colored reflections** (not just cyan)
- [ ] **Reflections change when rotating camera**
- [ ] **Roughness slider affects blur** (0% = sharp, 100% = blurred)
- [ ] **Metallic slider affects intensity** (100% = strong reflections)
- [ ] **Intensity slider controls visibility** (0% = none, 100% = full)
- [ ] **Grazing angle shows stronger reflections** (Fresnel effect)

---

## 🐛 Debugging Console Commands

Open browser DevTools console and try these commands:

```javascript
// Check if HDRI loaded
mascot.core3D.scene.envMap !== null  // Should be true after loading

// Check intensity value
mascot.core3D.scene.envIntensity     // Should match slider value (0-1)

// Manually set intensity
mascot.core3D.scene.envIntensity = 1.0  // Full intensity

// Check GL texture
envMapTexture  // Should show WebGLTexture object

// Force render update
mascot.core3D.render(16)  // Manually render one frame
```

---

## 📊 Performance Check

After loading HDRI, check performance:

1. **Open DevTools → Performance tab**
2. **Start recording**
3. **Rotate camera for 3 seconds**
4. **Stop recording**

**Expected**:
- Frame rate: 60 FPS (or close)
- Frame time: ~16ms or less
- Performance impact: ~5-10% slower than without HDRI

**If slower**:
- Reduce cubemap size in code: `size: 256` instead of `size: 512`
- Reduce mip levels: `mipLevels: 6` instead of `mipLevels: 8`

---

## 📝 Test Results Template

Copy this and fill it out after testing:

```
## HDRI Test Results

**Date**: [DATE]
**Browser**: [Chrome/Firefox/Edge]
**GPU**: [Your GPU]

### Loading
- [ ] HDRI loaded successfully
- [ ] Load time: ___ seconds
- [ ] Status message correct
- [ ] Console logs correct

### Visual Quality
- [ ] Environment reflections visible
- [ ] Reflections accurate to camera angle
- [ ] Roughness blur working (mipmap LOD)
- [ ] Metallic scaling working
- [ ] Fresnel effect working
- [ ] Intensity slider working

### Performance
- [ ] Frame rate: ___ FPS
- [ ] Frame time: ___ ms
- [ ] Performance impact: ___% slower

### Issues Found
[List any issues]

### Screenshots
[Attach screenshots if possible]
```

---

## 🎯 Expected Output (Console)

When you click "Load HDRI", you should see console output like this:

```
Loading HDRI from: ../assets/3d/lonely_road_afternoon_puresky_4k.exr
[HDRILoader] Loading HDRI: ../assets/3d/lonely_road_afternoon_puresky_4k.exr
[HDRILoader] Cubemap size: 512x512, Mip levels: 8
[HDRILoader] EXR loading via browser Image API (limited support)
[HDRILoader] For full EXR support, consider using openexr.js or three.js EXRLoader
[HDRILoader] Loaded 4096x2048 equirectangular map
[HDRILoader] Converted to 512x512 cubemap
[HDRILoader] Created WebGL cubemap with 8 mip levels
[HDRILoader] Generated 8 mipmap levels
HDRI loaded and applied to scene
```

---

## 💡 Pro Tips

1. **Best test material**: Mirror + 100% Metallic + 0% Roughness
2. **Best camera angle**: Rim or Grazing (shows Fresnel + environment)
3. **Toggle intensity**: Quickly switch between 0% and 100% to see difference
4. **Compare with baseline**: Take screenshots before/after loading HDRI
5. **Try different models**: Load Teapot, Bunny, or Dragon models

---

## 📚 Technical Reference

**Files Modified**:
- [examples/3d-shader-test-suite.html](examples/3d-shader-test-suite.html) - Added HDRI UI controls
- [src/3d/loaders/HDRILoader.js](src/3d/loaders/HDRILoader.js) - HDRI/EXR loader
- [src/3d/loaders/index.js](src/3d/loaders/index.js) - Export HDRILoader
- [src/3d/shaders/core.frag](src/3d/shaders/core.frag) - Environment reflection shader
- [src/3d/passes/GeometryPass.js](src/3d/passes/GeometryPass.js) - Uniform bindings

**HDRI File Path**:
```
C:\zzz\emotive\emotive-engine\assets\3d\lonely_road_afternoon_puresky_4k.exr
```

**Loader Options**:
```javascript
HDRILoader.load(gl, hdriPath, {
    size: 512,           // Cubemap face size (256, 512, 1024, 2048)
    mipLevels: 8,        // Number of LOD levels (6-10)
    generateMipmaps: true // Auto-generate mipmaps
});
```

---

**Ready to test!** Open the test suite and click "📦 Load HDRI" 🚀
