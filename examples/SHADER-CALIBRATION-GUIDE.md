# Shader Calibration Guide

Systematic testing guide for validating shader effects using professional calibration models.

## Quick Reference

| Effect | Best Model | Render Mode | Material Preset | Camera Angle |
|--------|-----------|-------------|-----------------|--------------|
| **PBR Roughness** | Utah Teapot | Standard | Mirror → Matte | Front |
| **PBR Metallic** | Suzanne | Standard | Plastic → Chrome | Rim |
| **Ambient Occlusion** | Torus Knot | Standard | Matte | Grazing |
| **Subsurface Scattering** | Stanford Bunny | Standard | Skin | Close-Up |
| **Anisotropy** | Utah Teapot | Standard | Brushed | Rim |
| **Iridescence** | Torus Knot | Standard | Soap Bubble | Grazing |
| **Normal Visualization** | Stanford Dragon | Normals | - | Front |
| **Edge Detection** | Suzanne | Edge | - | Front |
| **Toon Shading** | Spot Cow | Toon | - | Front |
| **Rim Lighting** | Stanford Bunny | Rim Only | - | Rim |
| **Wireframe** | Torus Knot | Standard + Wire | - | Grazing |

---

## Detailed Calibration Tests

### 1. PBR Material Validation

#### Test 1.1: Roughness Range
**Model:** Utah Teapot (smooth curved surfaces, classic standard)
**Render Mode:** Standard (PBR 100%)
**Camera:** Front view
**Procedure:**
1. Set: Metallic = 30%, all effects = 0
2. Slide Roughness: 0% → 100%
3. **Verify:**
   - 0% = Perfect mirror reflection
   - 25% = Glossy highlights, visible reflections
   - 50% = Balanced diffuse/specular
   - 75% = Mostly diffuse, soft highlights
   - 100% = Pure matte, no specular

**Expected Result:** Smooth transition from mirror to matte, no sudden jumps

---

#### Test 1.2: Metallic vs Dielectric
**Model:** Suzanne (varied surface angles)
**Render Mode:** Standard
**Camera:** Rim (75° angle for Fresnel testing)
**Procedure:**
1. Set: Roughness = 20%, all effects = 0
2. Slide Metallic: 0% → 100%
3. **Verify:**
   - 0% = Dielectric (plastic), strong Fresnel at edges
   - 50% = Hybrid material
   - 100% = Metal, colored reflections, weak Fresnel

**Expected Result:** Clear visual difference between dielectric edge glow and metallic reflections

---

### 2. Ambient Occlusion (AO)

#### Test 2.1: Crevice Darkening
**Model:** Torus Knot (complex self-shadowing topology)
**Render Mode:** Standard
**Material:** Matte (Roughness 90%, Metallic 0%)
**Camera:** Grazing (to see into crevices)
**Procedure:**
1. Set: AO = 100% (no darkening)
2. Slide AO: 100% → 0%
3. **Verify:**
   - 100% = All crevices fully lit
   - 50% = Moderate darkening in tight spaces
   - 0% = Maximum shadow in overlapping areas

**Expected Result:** Darkening should be strongest where geometry is closest (knot crossings)

---

#### Test 2.2: AO on Organic Geometry
**Model:** Stanford Bunny
**Render Mode:** Standard
**Material:** Matte
**Camera:** Close-Up
**Procedure:**
1. Focus on ear details
2. Slide AO: 100% → 0%
3. **Verify:** Creases around ears darken, base of ears shadow against head

**Expected Result:** Natural contact shadows enhance depth perception

---

### 3. Subsurface Scattering (SSS)

#### Test 3.1: Thin Geometry Translucency
**Model:** Stanford Bunny (thin ears)
**Render Mode:** Standard
**Material:** Skin preset (Roughness 45%, SSS 60%)
**Camera:** Close-Up on ears
**Lighting:** Ensure light can backlight ears
**Procedure:**
1. Set: SSS Strength = 0%
2. Slide SSS: 0% → 100%
3. **Verify:**
   - 0% = Ears appear solid/opaque
   - 50% = Light penetrates thin areas (ear edges glow)
   - 100% = Strong translucent effect

**Expected Result:** Ears should appear to glow/transmit light when backlit

---

#### Test 3.2: SSS Depth Falloff
**Model:** Stanford Bunny
**Camera:** Rotate to see ears from different angles
**Procedure:**
1. Set SSS = 60%
2. Rotate view to see:
   - Front-lit ears (no SSS effect)
   - Side-lit ears (rim glow)
   - Back-lit ears (full translucency)

**Expected Result:** SSS effect strongest when light opposes view direction

---

### 4. Anisotropic Reflection

#### Test 4.1: Directional Highlights
**Model:** Utah Teapot
**Render Mode:** Standard
**Material:** Brushed preset (Metallic 100%, Anisotropy 70%)
**Camera:** Rim (to catch highlight stretching)
**Procedure:**
1. Set: Anisotropy = 0%
2. Slide Anisotropy: -100% → +100%
3. **Verify:**
   - -100% = Vertical highlight stretching
   - 0% = Round specular highlights (isotropic)
   - +100% = Horizontal highlight stretching

**Expected Result:** Highlights elongate perpendicular to tangent direction

---

#### Test 4.2: Brushed Metal Effect
**Model:** Torus Knot
**Material:** Roughness 20%, Metallic 100%, Anisotropy 70%
**Camera:** Grazing
**Procedure:**
1. Slowly rotate view
2. **Verify:** Highlights streak along surface curvature like brushed aluminum

**Expected Result:** Anisotropic streaks follow geometry tangent flow

---

### 5. Iridescence (Thin-Film Interference)

#### Test 5.1: Soap Bubble Effect
**Model:** Torus Knot
**Render Mode:** Standard
**Material:** Soap Bubble preset (Roughness 0%, Iridescence 90%)
**Camera:** Grazing
**Procedure:**
1. Set: Iridescence = 0%
2. Slide Iridescence: 0% → 100%
3. **Verify:**
   - 0% = No color shifting
   - 50% = Subtle rainbow hues at grazing angles
   - 100% = Strong oil-slick colors

**Expected Result:** Color shifts from blue → green → red as angle changes

---

#### Test 5.2: Pearl Luster
**Model:** Utah Teapot
**Material:** Pearl preset (Iridescence 50%, SSS 20%)
**Camera:** Rim
**Procedure:**
1. Slowly rotate view
2. **Verify:** Subtle color shifts around edges, combined with slight translucency

**Expected Result:** Natural pearl appearance with gentle iridescent shimmer

---

### 6. Render Mode Testing

#### Test 6.1: Normal Visualization
**Model:** Stanford Dragon (high detail normals)
**Render Mode:** Normals (100%)
**Camera:** Front
**Procedure:**
1. View normal-mapped colors
2. **Verify:**
   - Red = +X normals (right-facing)
   - Green = +Y normals (up-facing)
   - Blue = +Z normals (forward-facing)

**Expected Result:** Smooth color gradients across curved surfaces

---

#### Test 6.2: Edge Detection
**Model:** Suzanne
**Render Mode:** Edge (100%)
**Camera:** Front
**Procedure:**
1. **Verify:** Clean edge outlines on all geometry transitions
2. Edges should be consistent width
3. No broken/missing edge segments

**Expected Result:** Clean comic-book style outlines

---

#### Test 6.3: Toon Shading
**Model:** Spot Cow
**Render Mode:** Toon (100%)
**Camera:** Front
**Procedure:**
1. **Verify:**
   - Hard lighting transitions (2-3 distinct bands)
   - No gradient falloff
   - Clean separation between lit/shadow

**Expected Result:** Cel-shaded anime/cartoon appearance

---

### 7. Blended Render Modes

#### Test 7.1: PBR + Rim Combo
**Model:** Stanford Bunny
**Settings:**
- PBR: 70%
- Rim: 30%
**Camera:** Rim angle
**Procedure:**
1. **Verify:** Realistic base with enhanced edge glow
2. Rim should brighten edges without washing out form

**Expected Result:** Stylized but physically-plausible look

---

#### Test 7.2: PBR + Toon + Edge
**Model:** Suzanne
**Settings:**
- PBR: 40%
- Toon: 40%
- Edges: 20%
**Procedure:**
1. **Verify:** Hybrid NPR/PBR style
2. Toon banding + realistic materials + outlines

**Expected Result:** Modern game art style (Borderlands-like)

---

### 8. Performance Testing

#### Test 8.1: High Poly Count
**Model:** Stanford Dragon (437K vertices)
**Render Mode:** Standard with all effects enabled
**Procedure:**
1. Enable: AO, SSS, Anisotropy, Iridescence
2. Monitor frame rate
3. **Verify:** Smooth 60fps animation

**Expected Result:** No stuttering even with maximum complexity

---

#### Test 8.2: Wireframe Overlay
**Model:** Torus Knot
**Render Mode:** Standard + Wireframe enabled
**Camera:** Grazing
**Procedure:**
1. Toggle wireframe on/off
2. **Verify:**
   - Clean white wireframe overlay
   - No z-fighting with surface
   - Even line thickness

**Expected Result:** Wireframe renders on top without depth conflicts

---

## Calibration Checklist

Use this checklist to validate a complete shader implementation:

### Basic PBR
- [ ] Roughness 0% = perfect mirror
- [ ] Roughness 100% = pure matte
- [ ] Metallic 0% = strong Fresnel (dielectric)
- [ ] Metallic 100% = colored reflections (metal)
- [ ] Smooth transitions between all values

### Advanced Effects
- [ ] AO darkens crevices (torus knot crossings)
- [ ] SSS glows on thin backlit geometry (bunny ears)
- [ ] Anisotropy stretches highlights directionally
- [ ] Iridescence shifts colors at grazing angles
- [ ] All effects combine without artifacts

### Render Modes
- [ ] Normals display RGB correctly
- [ ] Toon has hard lighting bands
- [ ] Edges have consistent width
- [ ] Rim highlights grazing angles
- [ ] Flat removes all lighting
- [ ] Wireframe overlays cleanly

### Blending
- [ ] All render mode sliders work 0-100%
- [ ] Multiple modes blend smoothly
- [ ] Total can exceed 100% (additive)
- [ ] No sudden pops or jumps

### Performance
- [ ] 60fps with all effects on Utah Teapot
- [ ] 60fps with Stanford Dragon (437K verts)
- [ ] No stuttering during rotation
- [ ] Smooth geometry morphing transitions

---

## Recommended Test Sequence

**For quick validation (5 minutes):**
1. Roughness test on Teapot
2. AO test on Torus Knot
3. SSS test on Bunny
4. Dragon performance test

**For comprehensive calibration (15 minutes):**
1. All PBR tests (Teapot + Suzanne)
2. All advanced effects (Knot + Bunny)
3. All render modes (Dragon + Suzanne + Cow)
4. Blending tests
5. Performance tests

**For shader development (ongoing):**
- Run quick validation after each shader modification
- Run comprehensive calibration before commits
- Keep shader test suite open during development
- Use 📸 Capture to document before/after changes

---

## Troubleshooting

### Issue: Roughness doesn't affect appearance
- **Check:** u_roughness uniform is connected
- **Test Model:** Utah Teapot at 0% vs 100% should be obvious

### Issue: AO has no effect
- **Check:** Geometry has normals
- **Test Model:** Torus Knot - should see dark crossings

### Issue: SSS doesn't glow
- **Check:** Light position relative to camera
- **Test Model:** Bunny ears - backlight them

### Issue: Anisotropy looks same as isotropic
- **Check:** Tangent calculation in shader
- **Test Model:** Teapot with Brushed preset

### Issue: Iridescence not visible
- **Check:** View angle - needs grazing angle
- **Test Model:** Torus Knot at grazing camera

### Issue: Dragon renders corrupted
- **Check:** Uint32Array support enabled
- **Check:** OES_element_index_uint extension loaded

---

## Model-Specific Notes

**Utah Teapot:**
- Best for: Smooth gradient testing (roughness, metallic)
- Vertices: 3,241 (fast)
- Classic graphics test standard since 1975

**Stanford Bunny:**
- Best for: SSS on thin geometry (ears)
- Vertices: 35,947 (medium)
- Organic surface ideal for skin materials

**Torus Knot:**
- Best for: AO in tight crevices, iridescence
- Vertices: 4,257 (fast)
- Complex topology tests self-shadowing

**Suzanne:**
- Best for: Quick iteration, edge detection
- Vertices: 507 (very fast)
- Varied angles test all shader paths

**Spot the Cow:**
- Best for: Toon shading, organic forms
- Vertices: 2,903 (fast)
- Good surface detail variation

**Stanford Dragon:**
- Best for: Performance testing, normal detail
- Vertices: 437,645 (heavy)
- Ultimate stress test for renderer

---

## Integration with Test Suite

The shader test suite UI maps to these tests:

**Geometry Buttons:**
- Procedural: Quick iteration (Icosphere, Torus, etc.)
- Calibration: Professional validation (Teapot, Bunny, etc.)

**Material Sliders:**
- Roughness/Metallic: Tests 1.1, 1.2
- AO: Tests 2.1, 2.2
- SSS Strength: Tests 3.1, 3.2
- Anisotropy: Tests 4.1, 4.2
- Iridescence: Tests 5.1, 5.2

**Render Blend Sliders:**
- PBR/Toon/Flat/Normals/Edges/Rim: Tests 6.x, 7.x

**Camera Presets:**
- Front: General viewing
- Rim: Fresnel/anisotropy testing
- Grazing: AO/iridescence testing
- Close-Up: Detail inspection (SSS)
- Top-Down: Symmetry verification

**Test Presets:**
- PBR Only: Pure physically-based rendering
- Rim Only: Edge highlight isolation
- Normals: Geometry verification

---

## Creating New Calibration Tests

When adding new shader effects:

1. **Choose Test Model:**
   - Simple geometry for basic effects
   - Complex geometry for advanced effects
   - Match model features to effect (thin for SSS, crevices for AO)

2. **Define Success Criteria:**
   - What should I see at min/max values?
   - What artifacts indicate bugs?
   - What performance target?

3. **Document Test:**
   - Add to this guide
   - Include screenshots if complex
   - Note any platform-specific quirks

4. **Add to Quick Validation:**
   - If effect is fundamental, add to 5-minute test
   - Keep quick test under 10 steps total

---

**Last Updated:** 2025-11-02
**Shader Version:** Emotive Engine 3D v3.0.0
**Models Version:** Professional Calibration Set v1.0
