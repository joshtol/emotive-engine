/**
 * HDRI Environment Map Loader
 * Loads and processes HDRI environment maps for PBR rendering
 *
 * Supports:
 * - .hdr (Radiance RGBE format)
 * - .exr (OpenEXR format) - via conversion or browser support
 * - Equirectangular to cubemap conversion
 * - Mipmap generation for roughness-based sampling
 *
 * @class HDRILoader
 */
export class HDRILoader {
    /**
     * Load HDRI from URL and create WebGL cubemap texture
     * @param {WebGL2RenderingContext} gl - WebGL2 context
     * @param {string} url - URL to HDRI file (.hdr or .exr)
     * @param {Object} options - Loading options
     * @param {number} options.size - Cubemap face size (default: 512)
     * @param {number} options.mipLevels - Number of mipmap levels (default: 8)
     * @param {boolean} options.generateMipmaps - Auto-generate mipmaps (default: true)
     * @returns {Promise<WebGLTexture>} Cubemap texture with mipmaps
     */
    static async load(gl, url, options = {}) {
        const {
            size = 512,
            mipLevels = 8,
            generateMipmaps = true
        } = options;

        console.log(`[HDRILoader] Loading HDRI: ${url}`);
        console.log(`[HDRILoader] Cubemap size: ${size}x${size}, Mip levels: ${mipLevels}`);

        // Determine file type
        const extension = url.split('.').pop().toLowerCase();

        let hdrData;
        if (extension === 'hdr') {
            hdrData = await this.loadHDR(url);
        } else if (extension === 'exr') {
            hdrData = await this.loadEXR(url);
        } else {
            throw new Error(`Unsupported HDRI format: ${extension}. Use .hdr or .exr`);
        }

        console.log(`[HDRILoader] Loaded ${hdrData.width}x${hdrData.height} equirectangular map`);

        // DEBUG: Check if source data has values
        let maxVal = 0;
        for (let i = 0; i < Math.min(1000, hdrData.data.length); i++) {
            maxVal = Math.max(maxVal, hdrData.data[i]);
        }
        console.log(`[HDRILoader] Source data sample max value: ${maxVal}`);

        // Convert equirectangular to cubemap
        const cubemapFaces = this.equirectToCubemap(hdrData, size);
        console.log(`[HDRILoader] Converted to ${size}x${size} cubemap`);

        // DEBUG: Check if cubemap has values
        maxVal = 0;
        for (let i = 0; i < Math.min(1000, cubemapFaces.px.length); i++) {
            maxVal = Math.max(maxVal, cubemapFaces.px[i]);
        }
        console.log(`[HDRILoader] Cubemap px face sample max value: ${maxVal}`);

        // Create WebGL cubemap texture
        const texture = this.createCubemapTexture(gl, cubemapFaces, generateMipmaps, mipLevels);
        console.log(`[HDRILoader] Created WebGL cubemap with ${mipLevels} mip levels`);

        return texture;
    }

    /**
     * Load HDR file (Radiance RGBE format)
     * @param {string} url - URL to .hdr file
     * @returns {Promise<Object>} HDR data {width, height, data (Float32Array RGB)}
     */
    static async loadHDR(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to load HDR: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        return this.parseRGBE(arrayBuffer);
    }

    /**
     * Load EXR file (OpenEXR format)
     * Currently converts through an intermediate format
     * @param {string} url - URL to .exr file
     * @returns {Promise<Object>} HDR data {width, height, data (Float32Array RGB)}
     */
    static async loadEXR(url) {
        // For now, we'll load the EXR as an image element and extract pixel data
        // This works if the browser supports EXR (Chrome/Edge with experimental features)
        // For production, you'd want a proper EXR decoder library

        console.warn('[HDRILoader] EXR loading via browser Image API (limited support)');
        console.warn('[HDRILoader] For full EXR support, consider using openexr.js or three.js EXRLoader');

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';

            img.onload = () => {
                try {
                    // Create canvas to extract pixel data
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);

                    // Get pixel data (will be LDR, not true HDR)
                    const imageData = ctx.getImageData(0, 0, img.width, img.height);
                    const pixels = imageData.data; // Uint8ClampedArray RGBA

                    // Convert to Float32 RGB (normalize 0-255 to 0-1)
                    const floatData = new Float32Array(img.width * img.height * 3);
                    for (let i = 0, j = 0; i < pixels.length; i += 4, j += 3) {
                        floatData[j] = pixels[i] / 255.0;       // R
                        floatData[j + 1] = pixels[i + 1] / 255.0; // G
                        floatData[j + 2] = pixels[i + 2] / 255.0; // B
                    }

                    resolve({
                        width: img.width,
                        height: img.height,
                        data: floatData
                    });
                } catch (error) {
                    reject(new Error(`EXR parsing failed: ${error.message}`));
                }
            };

            img.onerror = () => {
                reject(new Error(`Failed to load EXR image from: ${url}`));
            };

            img.src = url;
        });
    }

    /**
     * Parse Radiance RGBE format (.hdr)
     * @param {ArrayBuffer} buffer - HDR file data
     * @returns {Object} {width, height, data (Float32Array RGB)}
     */
    static parseRGBE(buffer) {
        const bytes = new Uint8Array(buffer);
        let offset = 0;

        // Read header (ASCII text until we find the resolution line)
        let header = '';
        let foundResolution = false;
        while (offset < bytes.length && !foundResolution) {
            const char = String.fromCharCode(bytes[offset++]);
            header += char;

            // Check if we've found the resolution line
            if (header.match(/-Y \d+ \+X \d+\n/)) {
                foundResolution = true;
                break;
            }

            // Safety: don't read more than 1024 bytes of header
            if (header.length > 1024) {
                throw new Error('Invalid HDR header: too long');
            }
        }

        // Parse resolution from header: "-Y height +X width"
        const match = header.match(/-Y (\d+) \+X (\d+)/);
        if (!match) {
            console.error('HDR header content:', header);
            throw new Error('Invalid HDR header: missing resolution');
        }

        const height = parseInt(match[1], 10);
        const width = parseInt(match[2], 10);

        // Decode RGBE scanlines
        const data = new Float32Array(width * height * 3);
        let dataOffset = 0;

        for (let y = 0; y < height; y++) {
            // Check for RLE encoding marker
            if (bytes[offset] === 2 && bytes[offset + 1] === 2) {
                // RLE compressed scanline
                const scanlineWidth = (bytes[offset + 2] << 8) | bytes[offset + 3];
                if (scanlineWidth !== width) {
                    throw new Error('HDR scanline width mismatch');
                }
                offset += 4;

                // Decompress RGBE channels
                const scanline = new Uint8Array(width * 4);
                for (let channel = 0; channel < 4; channel++) {
                    let x = 0;
                    while (x < width) {
                        let count = bytes[offset++];
                        if (count > 128) {
                            // Run of same value
                            count -= 128;
                            const value = bytes[offset++];
                            for (let i = 0; i < count; i++) {
                                scanline[x * 4 + channel] = value;
                                x++;
                            }
                        } else {
                            // Literal values
                            for (let i = 0; i < count; i++) {
                                scanline[x * 4 + channel] = bytes[offset++];
                                x++;
                            }
                        }
                    }
                }

                // Convert RGBE to float RGB
                for (let x = 0; x < width; x++) {
                    const r = scanline[x * 4];
                    const g = scanline[x * 4 + 1];
                    const b = scanline[x * 4 + 2];
                    const e = scanline[x * 4 + 3];

                    // RGBE decode: RGB * 2^(E-128)
                    const scale = e > 0 ? Math.pow(2, e - 128) / 255.0 : 0;

                    data[dataOffset++] = r * scale;
                    data[dataOffset++] = g * scale;
                    data[dataOffset++] = b * scale;
                }
            } else {
                // Uncompressed scanline (legacy format)
                for (let x = 0; x < width; x++) {
                    const r = bytes[offset++];
                    const g = bytes[offset++];
                    const b = bytes[offset++];
                    const e = bytes[offset++];

                    const scale = e > 0 ? Math.pow(2, e - 128) / 255.0 : 0;

                    data[dataOffset++] = r * scale;
                    data[dataOffset++] = g * scale;
                    data[dataOffset++] = b * scale;
                }
            }
        }

        return { width, height, data };
    }

    /**
     * Convert equirectangular panorama to 6 cubemap faces
     * @param {Object} hdrData - {width, height, data (Float32Array RGB)}
     * @param {number} faceSize - Size of each cubemap face
     * @returns {Object} {px, nx, py, ny, pz, nz} faces (Float32Array RGB each)
     */
    static equirectToCubemap(hdrData, faceSize) {
        const { width, height, data } = hdrData;

        // Cubemap face directions
        const faces = {
            px: this.createCubeFace(data, width, height, faceSize, 0), // +X
            nx: this.createCubeFace(data, width, height, faceSize, 1), // -X
            py: this.createCubeFace(data, width, height, faceSize, 2), // +Y
            ny: this.createCubeFace(data, width, height, faceSize, 3), // -Y
            pz: this.createCubeFace(data, width, height, faceSize, 4), // +Z
            nz: this.createCubeFace(data, width, height, faceSize, 5)  // -Z
        };

        return faces;
    }

    /**
     * Create a single cubemap face from equirectangular data
     * @param {Float32Array} eqData - Equirectangular RGB data
     * @param {number} eqWidth - Equirect width
     * @param {number} eqHeight - Equirect height
     * @param {number} faceSize - Output face size
     * @param {number} face - Face index (0=+X, 1=-X, 2=+Y, 3=-Y, 4=+Z, 5=-Z)
     * @returns {Float32Array} Face RGB data
     */
    static createCubeFace(eqData, eqWidth, eqHeight, faceSize, face) {
        const faceData = new Float32Array(faceSize * faceSize * 3);

        for (let y = 0; y < faceSize; y++) {
            for (let x = 0; x < faceSize; x++) {
                // Map pixel to [-1, 1] coordinates
                const u = (2.0 * x / faceSize) - 1.0;
                const v = (2.0 * y / faceSize) - 1.0;

                // Get 3D direction vector for this pixel
                const dir = this.getCubeDirection(face, u, v);

                // Convert direction to equirect UV
                const theta = Math.atan2(dir.z, dir.x);
                const phi = Math.asin(dir.y);

                const eqU = (theta / Math.PI + 1.0) / 2.0; // [0, 1]
                const eqV = (phi / Math.PI + 0.5);          // [0, 1]

                // Sample equirect map (bilinear interpolation)
                const eqX = eqU * (eqWidth - 1);
                const eqY = (1.0 - eqV) * (eqHeight - 1); // Flip V

                const x0 = Math.floor(eqX);
                const y0 = Math.floor(eqY);
                const x1 = Math.min(x0 + 1, eqWidth - 1);
                const y1 = Math.min(y0 + 1, eqHeight - 1);

                const fx = eqX - x0;
                const fy = eqY - y0;

                // Bilinear interpolation
                const idx00 = (y0 * eqWidth + x0) * 3;
                const idx10 = (y0 * eqWidth + x1) * 3;
                const idx01 = (y1 * eqWidth + x0) * 3;
                const idx11 = (y1 * eqWidth + x1) * 3;

                for (let c = 0; c < 3; c++) {
                    const c00 = eqData[idx00 + c];
                    const c10 = eqData[idx10 + c];
                    const c01 = eqData[idx01 + c];
                    const c11 = eqData[idx11 + c];

                    const c0 = c00 * (1 - fx) + c10 * fx;
                    const c1 = c01 * (1 - fx) + c11 * fx;
                    const color = c0 * (1 - fy) + c1 * fy;

                    faceData[(y * faceSize + x) * 3 + c] = color;
                }
            }
        }

        return faceData;
    }

    /**
     * Get 3D direction vector for cubemap pixel
     * @param {number} face - Face index (0-5)
     * @param {number} u - U coordinate [-1, 1]
     * @param {number} v - V coordinate [-1, 1]
     * @returns {Object} Normalized direction {x, y, z}
     */
    static getCubeDirection(face, u, v) {
        let x, y, z;

        switch (face) {
            case 0: // +X
                x = 1.0;
                y = -v;
                z = -u;
                break;
            case 1: // -X
                x = -1.0;
                y = -v;
                z = u;
                break;
            case 2: // +Y
                x = u;
                y = 1.0;
                z = v;
                break;
            case 3: // -Y
                x = u;
                y = -1.0;
                z = -v;
                break;
            case 4: // +Z
                x = u;
                y = -v;
                z = 1.0;
                break;
            case 5: // -Z
                x = -u;
                y = -v;
                z = -1.0;
                break;
        }

        // Normalize
        const len = Math.sqrt(x * x + y * y + z * z);
        return { x: x / len, y: y / len, z: z / len };
    }

    /**
     * Create WebGL cubemap texture from face data
     * @param {WebGL2RenderingContext} gl - WebGL2 context
     * @param {Object} faces - {px, nx, py, ny, pz, nz} Float32Array faces
     * @param {boolean} generateMipmaps - Auto-generate mipmaps
     * @param {number} mipLevels - Number of mip levels
     * @returns {WebGLTexture} Cubemap texture
     */
    static createCubemapTexture(gl, faces, generateMipmaps, mipLevels) {
        // CRITICAL: Enable float texture extensions
        // OES_texture_float_linear: Required for LINEAR filtering on float textures
        const floatLinearExt = gl.getExtension('OES_texture_float_linear');
        if (!floatLinearExt) {
            console.warn('[HDRILoader] OES_texture_float_linear not available - using NEAREST filtering');
        }

        // EXT_color_buffer_float: Required for rendering to/from float textures
        const colorBufferFloatExt = gl.getExtension('EXT_color_buffer_float');
        if (!colorBufferFloatExt) {
            console.warn('[HDRILoader] EXT_color_buffer_float not available - may affect float texture functionality');
        }

        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

        // Upload all 6 faces
        const faceOrder = [
            { data: faces.px, target: gl.TEXTURE_CUBE_MAP_POSITIVE_X },
            { data: faces.nx, target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X },
            { data: faces.py, target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y },
            { data: faces.ny, target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y },
            { data: faces.pz, target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z },
            { data: faces.nz, target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z }
        ];

        const faceSize = Math.sqrt(faces.px.length / 3);

        for (const { data, target } of faceOrder) {
            gl.texImage2D(
                target,
                0,                  // Mip level 0 (base)
                gl.RGB16F,          // Internal format (HDR with better compatibility than RGB32F)
                faceSize,
                faceSize,
                0,                  // Border
                gl.RGB,             // Format
                gl.FLOAT,           // Type
                data
            );
        }

        // Generate mipmaps manually FIRST (gl.generateMipmap doesn't work with float textures)
        if (generateMipmaps) {
            this.generateManualMipmaps(gl, faces, faceSize, mipLevels);
            console.log(`[HDRILoader] Generated ${mipLevels} mipmap levels (manual)`);
        }

        // CRITICAL: Set texture parameters AFTER uploading all mip levels
        // Setting LINEAR_MIPMAP_LINEAR before mipmaps exist makes texture incomplete!
        const filterMode = floatLinearExt ? gl.LINEAR : gl.NEAREST;
        const mipFilter = floatLinearExt && generateMipmaps ? gl.LINEAR_MIPMAP_LINEAR : gl.NEAREST;
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, generateMipmaps ? mipFilter : filterMode);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, filterMode);

        console.log(`[HDRILoader] Using ${floatLinearExt ? 'LINEAR' : 'NEAREST'} filtering for float textures`);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);

        // CRITICAL: Set base and max mip levels (required for WebGL2 manual mipmaps!)
        if (generateMipmaps) {
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_BASE_LEVEL, 0);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAX_LEVEL, mipLevels - 1);
            console.log(`[HDRILoader] Set mip range: BASE_LEVEL=0, MAX_LEVEL=${mipLevels - 1}`);
        }

        // EXTENSIVE DEBUG: Check texture completeness and parameters
        console.log('[HDRILoader] ========== TEXTURE DEBUG ==========');

        // Check if texture is complete
        const minFilter = gl.getTexParameter(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER);
        const magFilter = gl.getTexParameter(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER);
        console.log('[HDRILoader] Min filter:', minFilter, '(LINEAR_MIPMAP_LINEAR=', gl.LINEAR_MIPMAP_LINEAR, ')');
        console.log('[HDRILoader] Mag filter:', magFilter, '(LINEAR=', gl.LINEAR, ')');

        // Try to read back a pixel from mip level 0
        const testFB = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, testFB);

        // Attach positive X face, mip level 0
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_CUBE_MAP_POSITIVE_X,
            texture,
            0
        );

        const fbStatus = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        console.log('[HDRILoader] Framebuffer status:', fbStatus === gl.FRAMEBUFFER_COMPLETE ? 'COMPLETE' : 'INCOMPLETE (' + fbStatus + ')');

        if (fbStatus === gl.FRAMEBUFFER_COMPLETE) {
            // Read center pixel
            const centerX = Math.floor(faceSize / 2);
            const centerY = Math.floor(faceSize / 2);
            const pixel = new Float32Array(3);
            gl.readPixels(centerX, centerY, 1, 1, gl.RGB, gl.FLOAT, pixel);
            console.log('[HDRILoader] Center pixel readback:', pixel[0], pixel[1], pixel[2]);
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.deleteFramebuffer(testFB);

        // Check for any WebGL errors
        const error = gl.getError();
        if (error !== gl.NO_ERROR) {
            console.error('[HDRILoader] WebGL error:', error);
        }

        console.log('[HDRILoader] ====================================');

        gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);

        return texture;
    }

    /**
     * Manually generate mipmaps for float cubemap textures
     * (gl.generateMipmap() doesn't support float formats)
     * @param {WebGL2RenderingContext} gl - WebGL context
     * @param {Object} faces - Cubemap faces data
     * @param {number} baseSize - Base mip level size
     * @param {number} mipLevels - Number of mip levels to generate
     */
    static generateManualMipmaps(gl, faces, baseSize, mipLevels) {
        const faceNames = ['px', 'nx', 'py', 'ny', 'pz', 'nz'];
        const faceTargets = [
            gl.TEXTURE_CUBE_MAP_POSITIVE_X,
            gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
            gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
            gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
            gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
            gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
        ];

        // Store mip chain for each face
        const mipChains = {};
        faceNames.forEach(name => {
            mipChains[name] = [faces[name]]; // Start with base mip (level 0)
        });

        // For each mip level after base (level 0)
        for (let mipLevel = 1; mipLevel < mipLevels; mipLevel++) {
            const mipSize = Math.max(1, baseSize >> mipLevel);
            const prevSize = baseSize >> (mipLevel - 1);

            console.log(`[HDRILoader] Generating mip level ${mipLevel}: ${prevSize}x${prevSize} -> ${mipSize}x${mipSize}`);

            // Downsample each face from previous mip level
            faceNames.forEach((faceName, faceIdx) => {
                const prevMip = mipChains[faceName][mipLevel - 1];
                const downsampled = this.downsampleFace(prevMip, prevSize, mipSize);

                // Check data validity
                let maxVal = 0;
                for (let i = 0; i < Math.min(100, downsampled.length); i++) {
                    maxVal = Math.max(maxVal, downsampled[i]);
                }
                if (faceIdx === 0) { // Log only for first face to avoid spam
                    console.log(`[HDRILoader]   Level ${mipLevel} sample max: ${maxVal}`);
                }

                // Store in mip chain
                mipChains[faceName].push(downsampled);

                // Upload to GPU
                gl.texImage2D(
                    faceTargets[faceIdx],
                    mipLevel,
                    gl.RGB16F,          // Same format as base mip level
                    mipSize,
                    mipSize,
                    0,
                    gl.RGB,
                    gl.FLOAT,
                    downsampled
                );
            });
        }
    }

    /**
     * Downsample a cubemap face using box filter (2x2 average)
     * @param {Float32Array} data - Source face data
     * @param {number} srcSize - Source size
     * @param {number} dstSize - Destination size
     * @returns {Float32Array} Downsampled face data
     */
    static downsampleFace(data, srcSize, dstSize) {
        const result = new Float32Array(dstSize * dstSize * 3);
        const scale = srcSize / dstSize;

        for (let y = 0; y < dstSize; y++) {
            for (let x = 0; x < dstSize; x++) {
                // Sample 2x2 box from source
                const srcX = Math.floor(x * scale);
                const srcY = Math.floor(y * scale);

                let r = 0, g = 0, b = 0;
                let count = 0;

                // Average 2x2 box
                for (let dy = 0; dy < 2 && (srcY + dy) < srcSize; dy++) {
                    for (let dx = 0; dx < 2 && (srcX + dx) < srcSize; dx++) {
                        const srcIdx = ((srcY + dy) * srcSize + (srcX + dx)) * 3;
                        r += data[srcIdx];
                        g += data[srcIdx + 1];
                        b += data[srcIdx + 2];
                        count++;
                    }
                }

                const dstIdx = (y * dstSize + x) * 3;
                result[dstIdx] = r / count;
                result[dstIdx + 1] = g / count;
                result[dstIdx + 2] = b / count;
            }
        }

        return result;
    }
}
