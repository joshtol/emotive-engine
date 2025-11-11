# NASA Sun Textures

This directory contains high-resolution sun textures from official NASA sources.

## Required Textures

### 1. Photosphere Texture (Base Color)

**File:** `sun_photosphere_4k.jpg` **Source:**
[Solar System Scope Textures](https://www.solarsystemscope.com/textures/)

- Click "Download" under "Sun"
- License: Attribution 4.0 International (free for any use, even commercial)
- Resolution: 4096x2048 or higher
- Shows: Solar granulation, sunspots, photosphere surface detail

**Alternative Source:**
[NASA Scientific Visualization Studio](https://svs.gsfc.nasa.gov/gallery/sdo/)

- Search for "SDO sun" images
- Download 4K resolution JPG
- Public domain

### 2. Normal Map (Optional - Surface Depth)

**File:** `sun_photosphere_normal.jpg` **Generation:** Can be generated from
photosphere texture using:

- Photoshop: Filter > 3D > Generate Normal Map
- GIMP: Filters > Generic > Normal Map
- Online: normalmap-online.com

### 3. Emissive/Glow Map (Optional - Corona Intensity)

**File:** `sun_corona_mask.jpg` **Purpose:** Controls corona glow intensity
across surface **Generation:** Create radial gradient or use processed SDO
imagery

## Texture Specifications

### Photosphere Texture Details:

- **Resolution:** 4096x2048 (2:1 ratio for sphere mapping)
- **Format:** JPG or PNG
- **Color Space:** sRGB
- **Features:**
    - Solar granulation (convection cells ~1,000 km diameter)
    - Sunspots (darker, cooler regions)
    - Faculae (bright active regions)
    - Photosphere temperature gradient

### NASA Data Sources:

1. **Solar Dynamics Observatory (SDO)**
    - Images every 12 seconds at 4096x4096 resolution
    - Multiple wavelengths (171Å, 193Å, 211Å, etc.)
    - URL: https://sdo.gsfc.nasa.gov/data/

2. **Solar System Scope**
    - Pre-processed 4K textures ready for 3D use
    - Based on NASA SDO data
    - URL: https://www.solarsystemscope.com/textures/

3. **NASA Scientific Visualization Studio**
    - High-res stills and videos
    - URL: https://svs.gsfc.nasa.gov/gallery/sdo/

## Usage in Code

```javascript
// Load textures
const textureLoader = new THREE.TextureLoader();
const photosphereTexture = textureLoader.load(
    '/path/to/sun_photosphere_4k.jpg'
);
const normalMap = textureLoader.load('/path/to/sun_photosphere_normal.jpg');

// Apply to material
material.map = photosphereTexture;
material.normalMap = normalMap;
```

## License & Attribution

All NASA imagery is in the public domain unless otherwise noted. When using
Solar System Scope textures, attribution is required:

```
Textures from Solar System Scope (solarsystemscope.com)
Based on NASA Solar Dynamics Observatory data
```

## File Size Optimization

For web delivery:

- Use JPG format (smaller than PNG)
- Quality: 85-90% (good balance)
- Consider progressive JPG for faster loading
- Optionally provide multiple resolutions (1K, 2K, 4K)
