# Shader Calibration 3D Models

Professional 3D models for testing and calibrating shader effects, materials, and rendering quality.

## Models Included

### Stanford Bunny (`stanford-bunny.obj`)
- **Vertices:** 35,947
- **Complexity:** High
- **Best for:** Subsurface scattering (SSS), organic surface materials
- **Features:** Complex organic geometry with ears perfect for thin-surface SSS testing
- **Source:** [Stanford 3D Scanning Repository](https://github.com/alecjacobson/common-3d-test-models)
- **License:** Free for research and non-commercial use

### Stanford Dragon (`stanford-dragon.obj`)
- **Vertices:** 437,645
- **Complexity:** Very High
- **Best for:** Performance testing, detailed normal mapping, high-poly rendering
- **Features:** Extremely detailed dragon scan with intricate surface detail
- **Source:** [Stanford 3D Scanning Repository](https://github.com/alecjacobson/common-3d-test-models)
- **License:** Free for research and non-commercial use

### Utah Teapot (`utah-teapot.obj`)
- **Vertices:** 3,241
- **Complexity:** Medium
- **Best for:** Classic shader calibration, reflection testing, material presets
- **Features:** The legendary computer graphics standard model with smooth curved surfaces
- **Source:** [GitHub: jaz303/utah-teapot](https://github.com/jaz303/utah-teapot)
- **License:** Public domain

### Torus Knot (`torus-knot.obj`)
- **Vertices:** 4,257
- **Complexity:** Medium
- **Best for:** Ambient occlusion (AO), iridescence, anisotropic reflection
- **Features:** Complex knotted topology with self-shadowing crevices ideal for AO testing
- **Parameters:** (3,2)-torus knot with 128 path segments, 32 tube segments
- **Source:** Generated using correct parametric equations
- **License:** Public domain (generated)

### Suzanne (`suzanne.obj`)
- **Vertices:** 507
- **Complexity:** Low-Medium
- **Best for:** Quick shader testing, Blender compatibility verification
- **Features:** Blender's iconic monkey head with expressive facial features
- **Source:** [common-3d-test-models](https://github.com/alecjacobson/common-3d-test-models)
- **License:** Free for all use

### Spot the Cow (`spot-cow.obj`)
- **Vertices:** 2,903
- **Complexity:** Medium
- **Best for:** Organic surface testing, normal map validation
- **Features:** Classic test model with varied surface detail
- **Source:** [common-3d-test-models](https://github.com/alecjacobson/common-3d-test-models)
- **License:** Free for research and non-commercial use

## Usage

Load any model using the EmotiveMascot3D `loadGeometry()` API:

```javascript
const mascot = new EmotiveMascot3D();
await mascot.init(container);

// Load a calibration model
await mascot.loadGeometry('examples/models/utah-teapot.obj');

// Apply material presets
mascot.setMaterial({ roughness: 0.1, metallic: 1.0 }); // Chrome
```

## Shader Testing Guide

### Subsurface Scattering (SSS)
**Best models:** Stanford Bunny (ears), Spot the Cow
- Test thin geometry translucency
- Verify light penetration depth
- Check color bleeding

### Ambient Occlusion (AO)
**Best models:** Torus Knot, Stanford Dragon
- Test crevice darkening
- Verify self-shadowing in complex topology
- Check AO radius and intensity

### Metallic/Roughness PBR
**Best models:** Utah Teapot, Suzanne
- Test reflection quality across roughness values
- Verify Fresnel effect on curved surfaces
- Check metallic vs dielectric materials

### Anisotropic Reflection
**Best models:** Torus Knot, Utah Teapot
- Test directional highlights
- Verify tangent-space calculations
- Check brushed metal effects

### Iridescence
**Best models:** Torus Knot, Stanford Bunny
- Test thin-film interference
- Verify color shifting with viewing angle
- Check iridescence intensity

## File Format

All models are in Wavefront OBJ format with:
- Vertex positions (`v x y z`)
- Vertex normals (`vn nx ny nz`)
- Face indices (`f v1//vn1 v2//vn2 v3//vn3`)

## Recommended Test Suite Order

1. **Quick Test:** Suzanne (low poly, fast render)
2. **Classic Test:** Utah Teapot (standard calibration)
3. **Organic Test:** Stanford Bunny (SSS, organic materials)
4. **Complex Test:** Torus Knot (AO, iridescence, complex topology)
5. **Performance Test:** Stanford Dragon (high poly count, detail)

## Attribution

- Stanford models from the [Stanford 3D Scanning Repository](http://graphics.stanford.edu/data/3Dscanrep/)
- Common test models from [alecjacobson/common-3d-test-models](https://github.com/alecjacobson/common-3d-test-models)
- Utah Teapot from [jaz303/utah-teapot](https://github.com/jaz303/utah-teapot)
- Torus Knot generated using standard parametric equations

These models are used for development, testing, and non-commercial research purposes only.
