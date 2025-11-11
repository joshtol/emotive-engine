/**
 * Solar Corona - Volumetric Fire Effect (THREE.Fire inspired)
 *
 * Based on mattatz's THREE.Fire volumetric fire approach:
 * - Ray marching through volumetric density field
 * - Procedural noise for organic fire movement
 * - Fire texture for color gradient
 * - Additive blending for glow
 *
 * References:
 * - github.com/mattatz/THREE.Fire (volumetric ray marching fire)
 * - Real-Time Procedural Volumetric Fire paper
 */

import * as THREE from 'three';

/**
 * Create volumetric solar corona fire effect
 *
 * @param {Object} options - Configuration
 * @param {Array<number>} options.glowColor - RGB color [r,g,b]
 * @returns {THREE.Mesh} Corona fire mesh
 */
export function createSolarCorona(options = {}) {
    const baseColor = options.glowColor || [1, 1, 0.9];

    const sunRadius = 0.5;
    const coronaThickness = 0.35;

    // Use box geometry like THREE.Fire, but scaled to sphere
    // We'll use a custom geometry that wraps around the sun
    const geometry = new THREE.SphereGeometry(
        sunRadius + coronaThickness / 2,
        32,
        32
    );

    // Volumetric fire shader (THREE.Fire inspired)
    const material = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            baseColor: { value: new THREE.Color(baseColor[0], baseColor[1], baseColor[2]) },
            glowIntensity: { value: 1.0 },
            sunRadius: { value: sunRadius },
            coronaThickness: { value: coronaThickness }
        },
        vertexShader: `
            varying vec3 vWorldPosition;
            varying vec3 vNormal;
            varying vec3 vViewPosition;

            void main() {
                vNormal = normalize(normalMatrix * normal);
                vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                vWorldPosition = worldPosition.xyz;

                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                vViewPosition = -mvPosition.xyz;

                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform float time;
            uniform vec3 baseColor;
            uniform float glowIntensity;
            uniform float sunRadius;
            uniform float coronaThickness;

            varying vec3 vWorldPosition;
            varying vec3 vNormal;
            varying vec3 vViewPosition;

            // Simplex noise function (Ashima Arts style)
            vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
            vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

            float snoise(vec3 v) {
                const vec2 C = vec2(1.0/6.0, 1.0/3.0);
                const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

                vec3 i  = floor(v + dot(v, C.yyy));
                vec3 x0 = v - i + dot(i, C.xxx);

                vec3 g = step(x0.yzx, x0.xyz);
                vec3 l = 1.0 - g;
                vec3 i1 = min(g.xyz, l.zxy);
                vec3 i2 = max(g.xyz, l.zxy);

                vec3 x1 = x0 - i1 + C.xxx;
                vec3 x2 = x0 - i2 + C.yyy;
                vec3 x3 = x0 - D.yyy;

                i = mod289(i);
                vec4 p = permute(permute(permute(
                    i.z + vec4(0.0, i1.z, i2.z, 1.0))
                    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                    + i.x + vec4(0.0, i1.x, i2.x, 1.0));

                float n_ = 0.142857142857;
                vec3 ns = n_ * D.wyz - D.xzx;

                vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

                vec4 x_ = floor(j * ns.z);
                vec4 y_ = floor(j - 7.0 * x_);

                vec4 x = x_ *ns.x + ns.yyyy;
                vec4 y = y_ *ns.x + ns.yyyy;
                vec4 h = 1.0 - abs(x) - abs(y);

                vec4 b0 = vec4(x.xy, y.xy);
                vec4 b1 = vec4(x.zw, y.zw);

                vec4 s0 = floor(b0)*2.0 + 1.0;
                vec4 s1 = floor(b1)*2.0 + 1.0;
                vec4 sh = -step(h, vec4(0.0));

                vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
                vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

                vec3 p0 = vec3(a0.xy, h.x);
                vec3 p1 = vec3(a0.zw, h.y);
                vec3 p2 = vec3(a1.xy, h.z);
                vec3 p3 = vec3(a1.zw, h.w);

                vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
                p0 *= norm.x;
                p1 *= norm.y;
                p2 *= norm.z;
                p3 *= norm.w;

                vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
                m = m * m;
                return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
            }

            // Fractal Brownian Motion for turbulence
            float fbm(vec3 p) {
                float value = 0.0;
                float amplitude = 0.5;
                float frequency = 1.0;

                for(int i = 0; i < 4; i++) {
                    value += amplitude * snoise(p * frequency);
                    frequency *= 2.0;
                    amplitude *= 0.5;
                }
                return value;
            }

            // Ray marching through volumetric fire
            vec4 raymarch(vec3 rayOrigin, vec3 rayDir) {
                const int steps = 32;
                const float stepSize = 0.05;

                vec4 color = vec4(0.0);
                float totalDensity = 0.0;

                for(int i = 0; i < steps; i++) {
                    vec3 pos = rayOrigin + rayDir * float(i) * stepSize;
                    float dist = length(pos);

                    // Only sample within corona shell
                    float distFromSurface = dist - sunRadius;
                    if(distFromSurface < 0.0 || distFromSurface > coronaThickness) continue;

                    // Animated noise for fire turbulence
                    vec3 noiseCoord = pos * 2.0 + vec3(0.0, time * 0.5, 0.0);
                    float noise = fbm(noiseCoord);

                    // Fire density: strong near surface, fades outward
                    float edgeFade = 1.0 - (distFromSurface / coronaThickness);
                    float density = edgeFade * edgeFade * (0.5 + noise * 0.5);

                    if(density > 0.01) {
                        // Fire color gradient: white/yellow -> orange -> red
                        float t = distFromSurface / coronaThickness;
                        vec3 hotColor = vec3(1.0, 1.0, 0.95) * baseColor;
                        vec3 warmColor = vec3(1.0, 0.6, 0.1) * baseColor;
                        vec3 coolColor = vec3(1.0, 0.2, 0.0) * baseColor;

                        vec3 fireColor;
                        if(t < 0.4) {
                            fireColor = mix(hotColor, warmColor, t / 0.4);
                        } else {
                            fireColor = mix(warmColor, coolColor, (t - 0.4) / 0.6);
                        }

                        // Accumulate color
                        float alpha = density * 0.15;
                        color.rgb += fireColor * alpha * (1.0 - totalDensity);
                        totalDensity += alpha;

                        if(totalDensity >= 1.0) break;
                    }
                }

                color.a = totalDensity;
                color.rgb *= glowIntensity * 3.0;

                return color;
            }

            void main() {
                // Ray origin and direction for volumetric rendering
                vec3 rayDir = normalize(vWorldPosition - cameraPosition);
                vec3 rayOrigin = cameraPosition;

                // Ray march through fire volume
                vec4 fireColor = raymarch(rayOrigin, rayDir);

                // Fade based on viewing angle (rim lighting effect)
                float fresnel = pow(1.0 - abs(dot(normalize(vViewPosition), vNormal)), 2.0);
                fireColor.rgb *= (0.5 + fresnel * 0.5);

                gl_FragColor = fireColor;
            }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
        side: THREE.FrontSide
    });

    const fire = new THREE.Mesh(geometry, material);
    fire.userData.material = material;

    console.log('🔥 Created THREE.Fire-style volumetric corona');

    return fire;
}

/**
 * Update corona animation
 *
 * @param {THREE.Mesh} corona - Corona fire mesh
 * @param {number} deltaTime - Time since last frame (seconds)
 * @param {Object} options - Update options
 * @param {Array<number>} options.glowColor - RGB color
 * @param {number} options.glowIntensity - Intensity multiplier
 */
export function updateSolarCorona(corona, deltaTime, options = {}) {
    if (!corona || !corona.userData.material) return;

    const {material} = corona.userData;

    // Update time for animation
    material.uniforms.time.value += deltaTime;

    // Update color if provided
    if (options.glowColor) {
        material.uniforms.baseColor.value.setRGB(
            options.glowColor[0],
            options.glowColor[1],
            options.glowColor[2]
        );
    }

    // Update intensity if provided
    if (options.glowIntensity !== undefined) {
        material.uniforms.glowIntensity.value = options.glowIntensity;
    }
}
