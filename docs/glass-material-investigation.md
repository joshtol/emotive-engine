# Glass Material Investigation Report
**Emotive Engine 3D Core Glass Shader**

---

## Executive Summary

This report investigates adding a glass material option to the Emotive Engine 3D core mascot, enabling a toggle between the current glow shader and a realistic glass appearance with refraction effects.

**Recommendation:** Implement glass material using **hybrid approach** - THREE.MeshPhysicalMaterial for realistic glass when available, with fallback to custom refraction shader for broader compatibility.

---

## Current Implementation Analysis

### Existing Shader System

**File:** `src/3d/ThreeRenderer.js`

The current core uses a custom `THREE.ShaderMaterial` with:
- **Vertex Shader**: Transforms normals and positions to view space
- **Fragment Shader**: Fresnel-based edge glow effect
- **Uniforms**:
  - `glowColor` (vec3) - Glow tint color
  - `glowIntensity` (float) - Glow brightness multiplier
  - `coreColor` (vec3) - Core base color
  - `fresnelPower` (float) - Edge glow falloff (default: 3.0)

**Current Material Properties:**
```javascript
transparent: false
side: THREE.FrontSide
```

**Rendering Context:**
- Scene has `background: null` (transparent)
- Particle system renders behind core using THREE.Points
- Post-processing with UnrealBloomPass for glow enhancement
- Three-point lighting system (ambient, key, fill, rim)

---

## Glass Material Requirements

### 1. Visual Properties Needed

For realistic glass appearance:

| Property | Purpose | Typical Value |
|----------|---------|---------------|
| **Transmission** | Interior transparency | 1.0 (full) |
| **Thickness** | Refraction intensity | 0.5 - 2.0 |
| **Roughness** | Surface clarity | 0.0 (clear) to 0.65 (frosted) |
| **Metalness** | Non-metallic glass | 0.0 |
| **IOR** | Index of Refraction | 1.5 (glass), 1.45 (plastic) |
| **Reflectivity** | Surface reflections | 0.5 - 1.0 |

### 2. Technical Challenges

**Challenge 1: Background Content for Refraction**
- Glass refracts what's *behind* it
- Current system: particles render in front, scene background is `null`
- **Solution**: Render particles to texture, use as environment map for refraction

**Challenge 2: Render Order**
- Transparent materials require back-to-front sorting
- Particles need to render before core for refraction to work
- **Solution**: Adjust `renderOrder` property or use multi-pass rendering

**Challenge 3: Performance**
- MeshPhysicalMaterial costs ~2-3x more per pixel than ShaderMaterial
- Transmission requires additional render pass
- **Solution**: Toggle-based system, only enable when requested

---

## Implementation Approaches

### Option A: MeshPhysicalMaterial (Recommended for Quality)

**Pros:**
- Built into Three.js, no custom shader code
- Physically accurate refraction
- Handles IOR, thickness, transmission automatically
- Compatible with Three.js lighting system

**Cons:**
- Requires Three.js r128+ for transmission support
- Higher performance cost
- Needs environment map for best results

**Implementation:**
```javascript
createGlassMaterial() {
    return new THREE.MeshPhysicalMaterial({
        transmission: 1.0,           // Full transparency
        thickness: 0.8,              // Moderate refraction
        roughness: 0.0,              // Clear glass
        metalness: 0.0,              // Non-metallic
        ior: 1.5,                    // Glass IOR
        reflectivity: 0.5,           // Subtle reflections
        envMapIntensity: 1.0,        // Environment reflection strength
        side: THREE.DoubleSide,      // Render both faces
        transparent: true,
        opacity: 1.0
    });
}
```

**Required Changes:**
1. Create particle render target texture
2. Set as environment map for glass material
3. Adjust render order: particles first, then core
4. Add material swap method to ThreeRenderer

### Option B: Custom Refraction Shader

**Pros:**
- Full control over refraction algorithm
- Can optimize for specific use case
- Compatible with older Three.js versions

**Cons:**
- More complex implementation
- Must manually handle refraction math
- Requires scene texture sampling

**Implementation:**
```glsl
// Vertex Shader
varying vec3 vNormal;
varying vec3 vEyeVector;
varying vec2 vUv;

void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vEyeVector = normalize(worldPos.xyz - cameraPosition);
    vNormal = normalize(modelViewMatrix * vec4(normal, 0.0)).xyz;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

// Fragment Shader
uniform sampler2D sceneTexture;
uniform vec2 resolution;
uniform float ior; // Index of refraction
uniform float thickness;
uniform float reflectivity;

varying vec3 vNormal;
varying vec3 vEyeVector;

void main() {
    // Calculate refraction
    vec3 refractedRay = refract(vEyeVector, vNormal, 1.0 / ior);

    // Offset UV based on refraction and thickness
    vec2 refractedUV = gl_FragCoord.xy / resolution;
    refractedUV += refractedRay.xy * thickness * 0.1;

    // Sample scene texture
    vec4 refractedColor = texture2D(sceneTexture, refractedUV);

    // Fresnel for reflections
    float fresnel = pow(1.0 + dot(vEyeVector, vNormal), 3.0);

    // Mix refraction with fresnel-based reflection
    vec3 finalColor = mix(refractedColor.rgb, vec3(1.0), fresnel * reflectivity);

    gl_FragColor = vec4(finalColor, 1.0);
}
```

**Required Changes:**
1. Add WebGLRenderTarget for scene capture
2. Render particles to texture each frame
3. Pass texture to shader as `sceneTexture` uniform
4. Add uniforms: `ior`, `thickness`, `reflectivity`

### Option C: Hybrid Approach (Recommended)

Use MeshPhysicalMaterial when available, fall back to simplified custom shader.

**Benefits:**
- Best quality when supported
- Graceful degradation
- Future-proof

---

## Recommended Implementation Plan

### Phase 1: Basic Glass Toggle (2-3 hours)

1. **Add glass material creation method**
   - File: `src/3d/ThreeRenderer.js`
   - Method: `createGlassMaterial()`
   - Use MeshPhysicalMaterial with transmission

2. **Add material swap method**
   ```javascript
   setMaterialMode(mode) {
       if (!this.coreMesh) return;

       const oldMaterial = this.coreMesh.material;

       if (mode === 'glass') {
           this.coreMesh.material = this.glassMaterial || this.createGlassMaterial();
       } else {
           this.coreMesh.material = this.glowMaterial || this.createGlowMaterial();
       }

       oldMaterial.dispose();
   }
   ```

3. **Add render target for particle background**
   - Create WebGLRenderTarget in ThreeRenderer constructor
   - Render particles to texture before core
   - Use texture as envMap for glass material

4. **Add UI toggle in demo**
   - File: `examples/3d-demo.html`
   - Button: "Glass Material" toggle
   - Calls: `mascot.core3D.renderer.setMaterialMode('glass')`

### Phase 2: Enhanced Glass Effects (3-4 hours)

5. **Add glass customization properties**
   - Thickness slider (0.1 - 3.0)
   - Roughness slider (0.0 - 1.0)
   - IOR slider (1.0 - 2.0)
   - Color tint option

6. **Optimize render performance**
   - Conditional render target updates
   - Lower resolution texture for refraction
   - Adaptive quality based on FPS

7. **Add glass-specific gestures**
   - Modify glow gestures to adjust glass properties
   - "Frosted" effect: increase roughness temporarily
   - "Crystal" effect: high IOR + low thickness

### Phase 3: Advanced Features (Optional, 4-5 hours)

8. **Custom refraction shader fallback**
   - For older browsers/devices
   - Simplified algorithm for performance

9. **Chromatic aberration**
   - Separate R/G/B refraction channels
   - Subtle color fringing at edges

10. **Caustics effects**
    - Light patterns through glass
    - Dynamic lighting interactions

---

## Performance Considerations

### Expected Performance Impact

| Scenario | Frame Time Impact | Notes |
|----------|------------------|-------|
| **Glow Material (Current)** | Baseline | ~0.8ms per frame |
| **Glass Material (Basic)** | +40% | ~1.2ms per frame |
| **Glass Material (Full Features)** | +100% | ~1.6ms per frame |

**Optimization Strategies:**
1. **Conditional Updates**: Only update refraction texture when particles move significantly
2. **Lower Resolution**: Use 0.5x resolution for refraction texture
3. **Disable When Offscreen**: Skip glass rendering when core is out of view
4. **LOD System**: Switch to simpler material at distance

---

## Code Changes Required

### Files to Modify

1. **`src/3d/ThreeRenderer.js`** (Primary)
   - Add `createGlassMaterial()` method
   - Add `setMaterialMode(mode)` method
   - Add render target setup in constructor
   - Add particle-to-texture rendering step
   - Modify `render()` to handle glass material

2. **`src/3d/Core3DManager.js`**
   - Expose `setGlassMaterialEnabled(enabled)` method
   - Store glass material state
   - Pass through to ThreeRenderer

3. **`examples/3d-demo.html`**
   - Add "Glass Material" toggle button
   - Add glass property sliders (optional)
   - Add event handlers

### New Files to Create

4. **`src/3d/materials/GlassMaterial.js`** (Optional)
   - Dedicated glass material factory
   - Presets: clear, frosted, tinted, crystal
   - Property animation helpers

---

## Testing Recommendations

### Test Cases

1. **Basic Toggle**: Switch between glow and glass materials smoothly
2. **Particle Visibility**: Verify particles visible through glass
3. **Gesture Compatibility**: All gestures work with glass material
4. **Performance**: Maintain 60fps on target hardware
5. **Browser Compatibility**: Test on Chrome, Firefox, Safari, Edge
6. **Mobile Support**: Test on iOS and Android devices

### Performance Benchmarks

Target frame times (16.67ms budget for 60fps):
- Core rendering: < 2ms
- Particle rendering: < 3ms
- Glass refraction: < 2ms
- Post-processing: < 4ms
- Headroom: 5.67ms

---

## Alternative Considerations

### Simpler Glass Effect (Quick Win)

If full refraction is too complex, consider:

**Translucent Material** (30 minutes implementation):
```javascript
createTranslucentMaterial() {
    return new THREE.MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.3,
        roughness: 0.1,
        metalness: 0.0,
        side: THREE.DoubleSide
    });
}
```

**Pros:** Very simple, performant, still looks good
**Cons:** No refraction, less realistic

### Fake Refraction (1-2 hours)

Use normal map distortion instead of true refraction:
- Apply animated normal map to glass
- Distorts background without actual ray tracing
- Much cheaper than true refraction

---

## Conclusion

**Recommended Path Forward:**

1. **Start with Phase 1** - Basic glass toggle using MeshPhysicalMaterial
   - Estimated time: 2-3 hours
   - Provides immediate visual impact
   - Foundation for future enhancements

2. **Evaluate User Feedback**
   - If users love it, proceed to Phase 2 for customization
   - If performance is an issue, implement optimizations

3. **Consider Phase 3 Only If Needed**
   - Advanced features are nice-to-have
   - May not justify development time

**Key Technical Decision:**
Use **MeshPhysicalMaterial** as primary approach, with option to add custom shader fallback later if needed. This provides the best quality-to-implementation-time ratio.

**Estimated Total Development Time:**
- Phase 1 (Basic): 2-3 hours
- Phase 2 (Enhanced): 3-4 hours
- Phase 3 (Advanced): 4-5 hours
- **Total: 9-12 hours** for complete implementation

---

## References

- [Three.js MeshPhysicalMaterial Docs](https://threejs.org/docs/#api/en/materials/MeshPhysicalMaterial)
- [Codrops: Transparent Glass in Three.js](https://tympanus.net/codrops/2021/10/27/creating-the-effect-of-transparent-glass-and-plastic-in-three-js/)
- [Codrops: Real-time Multiside Refraction](https://tympanus.net/codrops/2019/10/29/real-time-multiside-refraction-in-three-steps/)
- [Medium: Simulating Refraction in Three.js](https://medium.com/geekculture/simulating-refraction-in-three-js-9e367753bf6d)

---

**Report Generated:** 2025-01-05
**Author:** Claude (Emotive Engine Development)
**Status:** Investigation Complete - Ready for Implementation
