# Sun Textures

This directory contains texture maps for the Sun geometry, following NASA Solar
Dynamics Observatory data.

## Required Textures

### Photosphere Color Map

- **Filename**: `sun-photosphere-4k.jpg`
- **Resolution**: 4096x4096 (4K recommended)
- **Source**:
  [Solar System Scope Textures](https://www.solarsystemscope.com/textures/)
- **Direct Download**:
  https://www.solarsystemscope.com/textures/download/2k_sun.jpg (2K)
- **Description**: NASA-based photosphere surface texture showing granulation
  and convection cells
- **Temperature**: Based on 5,772K black-body radiation (NASA official)

### Normal Map (Recommended for Granulation Detail)

- **Filename**: `sun-photosphere-normal-4k.jpg`
- **Resolution**: 4096x4096 (4K recommended)
- **Description**: Normal map showing photosphere granulation (convection cells)
- **Purpose**: Adds surface depth to show the sun's convection cell patterns
- **Status**: Recommended - generates subtle 3D detail for realism
- **How to create**: Can be generated from color map using image processing
  tools (Photoshop, GIMP, online normal map generators)

## NASA Official Sources

### Primary Reference

- **NASA Sun Fact Sheet**:
  https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html
- **Photosphere Temperature**: 5,772 K (official effective temperature)

### High-Quality Textures

1. **Solar System Scope** (Recommended for ease of use)
    - Website: https://www.solarsystemscope.com/textures/
    - License: Free for personal and commercial use with attribution
    - Quality: 2K and 4K available
    - Format: JPG

2. **NASA Scientific Visualization Studio (SVS)**
    - Website: https://svs.gsfc.nasa.gov/
    - Search: "Sun texture" or "Solar photosphere"
    - Resolution: Up to 4096x4096
    - Format: PNG, JPG
    - License: Public domain (NASA imagery)

3. **NASA Solar Dynamics Observatory (SDO)**
    - Website: https://sdo.gsfc.nasa.gov/
    - Real-time solar imagery in multiple wavelengths
    - Can be processed into texture maps

## Installation

1. **Download the color texture** from Solar System Scope:

    ```bash
    # 2K version (smaller download)
    curl -o assets/textures/Sun/sun-photosphere-4k.jpg https://www.solarsystemscope.com/textures/download/2k_sun.jpg
    ```

2. **Generate normal map** (recommended for granulation detail):
    - Option A: Use online normal map generator (e.g.,
      https://cpetry.github.io/NormalMap-Online/)
    - Option B: Use Photoshop: Filter > 3D > Generate Normal Map
    - Option C: Use GIMP with normalmap plugin
    - Save as: `sun-photosphere-normal-4k.jpg`

3. Or download 8K version and resize to 4K for optimal quality/performance

4. Place both texture files in this directory

5. Textures will be automatically loaded by `Sun.js` geometry

## Directory Structure

```
assets/textures/Sun/
├── README.md (this file)
├── sun-photosphere-4k.jpg (downloaded ✓)
└── sun-photosphere-normal-4k.jpg (to generate - recommended)
```

## Technical Details

### Material Properties

- **Material**: MeshStandardMaterial with emissive properties
- **Emissive**: Self-luminous (full brightness without external lights)
- **Normal Map**: Photosphere granulation detail (subtle, 0.3 scale)
- **Roughness**: 1.0 (maximum - gaseous plasma surface)
- **Metalness**: 0.0 (non-metallic)
- **Tone Mapping**: Disabled (toneMapped: false) for HDR brightness
- **Base Color**: Brilliant white (5,772K black-body spectrum)
- **Emotion Tinting**: Applied over NASA-accurate base color
- **Bloom**: UnrealBloomPass creates radiant glow effect

### Photosphere Characteristics (NASA)

- **Temperature**: 5,772 K (5,500°C / 10,000°F)
- **Color**: Brilliant white (black-body radiation)
- **Thickness**: 100-400 km
- **Composition**: 74.9% Hydrogen, 23.8% Helium
- **Surface Features**: Granules (convection cells ~1,000 km diameter)

## Attribution

When using Solar System Scope textures, include:

```
Sun texture from Solar System Scope (https://www.solarsystemscope.com/)
Based on NASA Solar Dynamics Observatory data
```

## References

- NASA Sun Facts: https://science.nasa.gov/sun/facts/
- NASA SDO: https://sdo.gsfc.nasa.gov/
- Three.js Emissive Materials:
  https://threejs.org/docs/#api/en/materials/MeshBasicMaterial
- Solar System Scope: https://www.solarsystemscope.com/textures/
