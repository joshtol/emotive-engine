# 🎨 Comprehensive Shader Calibration - Expansion Plan

## 📊 OVERVIEW

### Current Status: 18 tests → **Expanded to 60 tests**

This expansion provides **complete coverage** of all shader effects, edge cases, real-world materials, and geometry validation.

---

## 🎯 TEST CATEGORIES

### **Currently Validated (18 tests)**
1. ✅ **Roughness** (6 tests) - Mirror → Matte progression
2. ✅ **Fresnel** (3 tests) - Edge brightening at angles
3. ✅ **Ambient Occlusion** (5 tests) - Crevice darkening
4. ✅ **Subsurface Scattering** (4 tests) - Light penetration

### **NEW - Complete Coverage (42 additional tests)**

#### 5. **METALLIC** (6 tests) - NEW
- Dielectric → Metal transition (0%, 25%, 50%, 75%, 100%)
- Colored Fresnel validation
- Rough metal test
- **Why**: Validates metal vs dielectric behavior, colored edge glow

#### 6. **ANISOTROPY** (7 tests) - NEW
- Isotropic baseline
- Horizontal brushing (30%, 60%, 100%)
- Vertical brushing (-30%, -100%)
- Grazing angle test
- **Why**: Brushed metal directional highlights, validates 8x boost

#### 7. **IRIDESCENCE** (7 tests) - NEW
- None → Strong (0%, 30%, 60%, 100%)
- Angle-dependent tests (front, grazing)
- Mirror + iridescence combo
- **Why**: Thin-film rainbow effect, angle-dependent intensity

#### 8. **COMBINED MATERIALS** (6 tests) - NEW
- **Real-world materials**:
  - Jade (SSS + AO + Fresnel)
  - Brushed Copper (Anisotropy + Metal + AO)
  - Soap Bubble (Iridescence + SSS + Mirror)
  - Polished Marble (SSS + AO + Fresnel)
  - Opal (SSS + Iridescence + AO)
  - Brushed Titanium (Anisotropy + Metal + Iridescence)
- **Why**: Validates multi-effect interactions, realistic scenarios

#### 9. **EDGE CASES** (5 tests) - NEW
- All effects disabled (baseline)
- All effects maxed (chaos test)
- Metal + SSS conflict (should suppress SSS)
- Mirror + Maximum AO conflict
- Extreme anisotropy + iridescence
- **Why**: Stress testing, conflict resolution, extreme values

#### 10. **GEOMETRY VALIDATION** (6 tests) - NEW
- Same shader on 6 different models:
  - Utah Teapot (3K verts, smooth)
  - Stanford Bunny (35K verts, organic)
  - Suzanne (507 verts, low-poly)
  - Torus Knot (4K verts, complex topology)
  - Spot Cow (2.9K verts, quad mesh)
  - Stanford Dragon (437K verts, HIGH-POLY STRESS TEST)
- **Why**: Ensures shaders work across all geometry types

---

## ⏱️ TIME ESTIMATES

| Category | Tests | Est. Time |
|----------|-------|-----------|
| 01-04: Current | 18 | ~2 min |
| 05: Metallic | 6 | ~40s |
| 06: Anisotropy | 7 | ~45s |
| 07: Iridescence | 7 | ~45s |
| 08: Combined | 6 | ~40s |
| 09: Edge Cases | 5 | ~30s |
| 10: Geometry | 6 | ~80s (dragon=12s) |
| **TOTAL** | **60** | **~6 minutes** |

---

## 🎯 WHAT WE'LL DISCOVER

### **Expected Findings:**

1. **Metallic Tests** → Validate colored Fresnel on metals, proper kD suppression
2. **Anisotropy Tests** → Confirm 8x boost visibility, directional highlights
3. **Iridescence Tests** → Angle-dependent rainbow, HDR color shifts
4. **Combined Tests** → Multi-effect interactions (any conflicts?)
5. **Edge Cases** → Shader robustness under extreme conditions
6. **Geometry Tests** → Performance with 437K verts, shader consistency

### **Potential Issues to Find:**

- ⚠️ Metal + SSS conflict (should SSS be suppressed?)
- ⚠️ Anisotropy visibility at different roughness values
- ⚠️ Iridescence + high roughness interaction
- ⚠️ Performance degradation on Stanford Dragon (437K verts)
- ⚠️ Environment reflection blur accuracy
- ⚠️ Color shifts in extreme scenarios

---

## 🚀 OUTPUT STRUCTURE

```
calibration-screenshots/
├── 01-roughness/          (6 images) ✅ Current
├── 02-fresnel/            (3 images) ✅ Current
├── 03-ambient-occlusion/  (5 images) ✅ Current
├── 04-subsurface-scattering/ (4 images) ✅ Current
├── 05-metallic/           (6 images) 🆕 NEW
├── 06-anisotropy/         (7 images) 🆕 NEW
├── 07-iridescence/        (7 images) 🆕 NEW
├── 08-combined-materials/ (6 images) 🆕 NEW
├── 09-edge-cases/         (5 images) 🆕 NEW
└── 10-geometry-tests/     (6 images) 🆕 NEW
```

---

## 📝 RUNNING THE FULL CALIBRATION

```bash
# Ensure Live Server is running on port 5500
npm run calibrate
```

**Expected Output:**
```
  ███████╗███╗   ███╗ ██████╗ ████████╗██╗██╗   ██╗███████╗
  ...

🎯 Test Configuration:
   Total Categories: 10
   Total Tests: 60
   Estimated Time: ~6 minutes

════════════════════════════════════════
  05-METALLIC
  Metallic - Dielectric to Metal Transition
════════════════════════════════════════

[19/60] dielectric
  ⏳ Rendering... (0% - Pure dielectric)
  ✅ Captured successfully!

...

╔══════════════════════════════════════╗
║      CALIBRATION COMPLETE            ║
╚══════════════════════════════════════╝

📊 Results: 60/60 ✅
⏱️  Duration: ~360s
🎉 All tests passed!
```

---

## 🔍 ANALYSIS PRIORITIES

After running full calibration, analyze in this order:

1. **Metallic** - Confirm colored Fresnel appears on metals
2. **Anisotropy** - Verify directional highlights visible
3. **Iridescence** - Check rainbow colors at different angles
4. **Combined Materials** - Look for unexpected interactions
5. **Edge Cases** - Identify any shader conflicts or artifacts
6. **Geometry Tests** - Dragon performance (should render in <12s)

---

## 🎯 SUCCESS CRITERIA

### **All 60 tests pass if:**
- ✅ All screenshots captured without errors
- ✅ No visual artifacts or corruption
- ✅ Stanford Dragon renders successfully (437K verts)
- ✅ Metal shows colored Fresnel
- ✅ Anisotropy shows directional highlights
- ✅ Iridescence shows rainbow at grazing angles
- ✅ Combined materials look realistic
- ✅ Edge cases handle gracefully (no crashes)

---

## 💡 POTENTIAL IMPROVEMENTS TO FIND

Based on comprehensive testing, we may discover:

1. **Performance optimizations** needed for high-poly models
2. **Shader interactions** that need adjustment
3. **Edge case handling** improvements
4. **Visual quality tweaks** for specific material combos
5. **Documentation needs** for optimal parameter ranges

---

**Ready to discover everything about your shaders!** 🚀

Run `npm run calibrate` and we'll have a complete picture of shader quality across all scenarios.
