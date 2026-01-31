/**
 * SIMPLE TEST VERSION - No noise, just basic instanced rendering
 */

import * as THREE from 'three';
import { INSTANCED_ATTRIBUTES_VERTEX, INSTANCED_ATTRIBUTES_FRAGMENT } from './InstancedShaderUtils.js';

const VERTEX_SHADER = /* glsl */`
uniform float uGlobalTime;
uniform float uFadeInDuration;
uniform float uFadeOutDuration;

${INSTANCED_ATTRIBUTES_VERTEX}

varying vec3 vNormal;
varying float vHeight;

void main() {
    // Time-offset animation
    vLocalTime = uGlobalTime - aSpawnTime;

    // Simple fade
    float fadeIn = clamp(vLocalTime / uFadeInDuration, 0.0, 1.0);
    float fadeOut = 1.0;
    if (aExitTime > 0.0) {
        float exitElapsed = uGlobalTime - aExitTime;
        fadeOut = 1.0 - clamp(exitElapsed / uFadeOutDuration, 0.0, 1.0);
    }

    vTrailFade = aTrailIndex < 0.0 ? 1.0 : (1.0 - (aTrailIndex + 1.0) * 0.25);
    vInstanceAlpha = fadeIn * fadeOut * aInstanceOpacity * vTrailFade;
    vVelocity = aVelocity;

    // CRITICAL: Apply instance matrix for per-instance transforms!
    // instanceMatrix contains position/rotation/scale set in ElementInstancePool
    vec4 instancePosition = instanceMatrix * vec4(position, 1.0);

    vNormal = normalMatrix * mat3(instanceMatrix) * normal;
    vHeight = instancePosition.y;

    gl_Position = projectionMatrix * modelViewMatrix * instancePosition;
}
`;

const FRAGMENT_SHADER = /* glsl */`
${INSTANCED_ATTRIBUTES_FRAGMENT}

varying vec3 vNormal;
varying float vHeight;

void main() {
    if (vInstanceAlpha < 0.01) discard;

    // Simple fire color gradient based on height
    vec3 color = mix(
        vec3(1.0, 0.3, 0.0),  // Orange at bottom
        vec3(1.0, 1.0, 0.5),  // Yellow at top
        clamp(vHeight + 0.5, 0.0, 1.0)
    );

    float alpha = vInstanceAlpha * 0.8;

    gl_FragColor = vec4(color, alpha);
}
`;

export function createInstancedFireMaterial(options = {}) {
    const {
        fadeInDuration = 0.3,
        fadeOutDuration = 0.5
    } = options;

    const material = new THREE.ShaderMaterial({
        uniforms: {
            uGlobalTime: { value: 0 },
            uFadeInDuration: { value: fadeInDuration },
            uFadeOutDuration: { value: fadeOutDuration }
        },
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
    });

    material.userData.elementalType = 'fire';
    material.userData.isInstanced = true;

    return material;
}

export function updateInstancedFireMaterial(material, time) {
    if (material?.uniforms?.uGlobalTime) {
        material.uniforms.uGlobalTime.value = time;
    }
}

export function setInstancedFireTemperature(material, temperature) {
    // No-op in simple version
}

export default {
    createInstancedFireMaterial,
    updateInstancedFireMaterial,
    setInstancedFireTemperature
};
