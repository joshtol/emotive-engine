/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Shape Definitions
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Static shape definitions for immediate loading
 * @author Emotive Engine Team
 * @module shapes/shapeDefinitions
 */

/**
 * Generate circle points
 */
function generateCircle(numPoints) {
    const points = [];
    for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        points.push({
            x: 0.5 + Math.cos(angle) * 0.5,
            y: 0.5 + Math.sin(angle) * 0.5
        });
    }
    return points;
}

/**
 * Generate heart shape
 */
function generateHeart(numPoints) {
    const points = [];
    for (let i = 0; i < numPoints; i++) {
        const t = (i / numPoints) * Math.PI * 2;

        // Heart parametric equations
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) -
                  2 * Math.cos(3 * t) - Math.cos(4 * t));

        // Normalize and scale
        points.push({
            x: 0.5 + x / 32,
            y: 0.5 + y / 32
        });
    }
    return points;
}

/**
 * Generate moon shape - keep it as a circle
 * The crescent effect should be done with visual shadows, not shape morphing
 */
function generateMoon(numPoints) {
    // Moon should stay as a circle - the crescent is a visual effect
    return generateCircle(numPoints);
}

/**
 * Generate star shape - matching star.svg geometry
 */
function generateStar(numPoints, starPoints = 5) {
    const points = [];
    
    // Star.svg path coordinates (normalized to 0-1 range)
    // Original: M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z
    const starVertices = [
        { x: 0.5, y: 0.72 },      // 12, 17.27 -> center bottom
        { x: 0.76, y: 0.875 },    // 18.18, 21 -> top right
        { x: 0.68, y: 0.21 },     // 16.36, 5.03 -> right middle
        { x: 0.92, y: 0.385 },    // 22, 9.24 -> top right
        { x: 0.2, y: 0.36 },      // 4.81, 8.63 -> left middle
        { x: 0.5, y: 0.083 },     // 12, 2 -> top center
        { x: 0.38, y: 0.36 },     // 9.19, 8.63 -> left middle
        { x: 0.083, y: 0.385 },   // 2, 9.24 -> top left
        { x: 0.23, y: 0.21 },     // 5.46, 5.03 -> left middle
        { x: 0.24, y: 0.875 }     // 5.82, 21 -> top left
    ];
    
    // Interpolate points along the star perimeter
    for (let i = 0; i < numPoints; i++) {
        const t = i / numPoints;
        const vertexCount = starVertices.length;
        
        // Which edge are we on?
        const edgeFloat = t * vertexCount;
        const edgeIndex = Math.floor(edgeFloat) % vertexCount;
        const nextIndex = (edgeIndex + 1) % vertexCount;
        const edgeProgress = edgeFloat - Math.floor(edgeFloat);
        
        // Linear interpolation between vertices
        const v1 = starVertices[edgeIndex];
        const v2 = starVertices[nextIndex];
        
        points.push({
            x: v1.x + (v2.x - v1.x) * edgeProgress,
            y: v1.y + (v2.y - v1.y) * edgeProgress
        });
    }
    
    return points;
}

/**
 * Generate sun shape - just a circle, rays are visual effects only
 */
function generateSun(numPoints, numRays = 12) {
    // Sun is just a circle - the rays are rendered as effects, not part of the shape
    return generateCircle(numPoints);
}


/**
 * Generate suspicion shape (sly grin)
 */
function generateSuspicion(numPoints) {
    const points = [];
    for (let i = 0; i < numPoints; i++) {
        const t = (i / numPoints) * Math.PI * 2;
        
        let x, y;
        if (t < Math.PI) {
            // Right side - outer arc of the grin
            x = Math.cos(t) * 0.45;
            y = Math.sin(t) * 0.45;
        } else {
            // Left side - inner arc for the mischievous smile
            const innerT = Math.PI * 2 - t;
            x = Math.cos(innerT) * 0.25 - 0.1;
            y = Math.sin(innerT) * 0.35;
        }
        
        points.push({
            x: 0.5 + x,
            y: 0.5 + y
        });
    }
    return points;
}

/**
 * Generate square shape
 */
function generateSquare(numPoints) {
    const points = [];
    const pointsPerSide = Math.floor(numPoints / 4);
    
    for (let side = 0; side < 4; side++) {
        for (let i = 0; i < pointsPerSide; i++) {
            const t = i / pointsPerSide;
            let x, y;
            
            switch (side) {
                case 0: // Top
                    x = -0.5 + t;
                    y = -0.5;
                    break;
                case 1: // Right
                    x = 0.5;
                    y = -0.5 + t;
                    break;
                case 2: // Bottom
                    x = 0.5 - t;
                    y = 0.5;
                    break;
                case 3: // Left
                    x = -0.5;
                    y = 0.5 - t;
                    break;
            }
            
            points.push({
                x: 0.5 + x * 0.8,
                y: 0.5 + y * 0.8
            });
        }
    }
    return points;
}

/**
 * Generate triangle shape
 */
function generateTriangle(numPoints) {
    const points = [];
    
    const vertices = [
        { x: 0, y: -0.5 },           // Top
        { x: -0.433, y: 0.25 },      // Bottom left
        { x: 0.433, y: 0.25 }        // Bottom right
    ];
    
    // Calculate perimeter of triangle
    const sides = [
        Math.sqrt(Math.pow(vertices[1].x - vertices[0].x, 2) + Math.pow(vertices[1].y - vertices[0].y, 2)),
        Math.sqrt(Math.pow(vertices[2].x - vertices[1].x, 2) + Math.pow(vertices[2].y - vertices[1].y, 2)),
        Math.sqrt(Math.pow(vertices[0].x - vertices[2].x, 2) + Math.pow(vertices[0].y - vertices[2].y, 2))
    ];
    const perimeter = sides[0] + sides[1] + sides[2];
    
    // Distribute points based on side length
    const pointsPerSide = sides.map(s => Math.round(numPoints * s / perimeter));
    
    // Adjust for rounding errors
    const totalPoints = pointsPerSide.reduce((a, b) => a + b, 0);
    if (totalPoints < numPoints) {
        pointsPerSide[0] += numPoints - totalPoints;
    }
    
    // Generate points along each edge
    for (let side = 0; side < 3; side++) {
        const v1 = vertices[side];
        const v2 = vertices[(side + 1) % 3];
        const sidePoints = pointsPerSide[side];
        
        for (let i = 0; i < sidePoints; i++) {
            // Don't duplicate the corner point
            if (i === sidePoints - 1 && side < 2) continue;
            
            const t = i / sidePoints;
            const x = v1.x + (v2.x - v1.x) * t;
            const y = v1.y + (v2.y - v1.y) * t;
            
            points.push({
                x: 0.5 + x * 0.9,
                y: 0.5 + y * 0.9
            });
        }
    }
    
    // Ensure we have exactly numPoints
    while (points.length < numPoints) {
        points.push(points[points.length - 1]);
    }
    while (points.length > numPoints) {
        points.pop();
    }
    
    return points;
}

/**
 * Shape definitions with their properties
 */
export const SHAPE_DEFINITIONS = {
    circle: {
        points: generateCircle(64),
        shadow: { type: 'none' }
    },
    heart: {
        points: generateHeart(64),
        shadow: { type: 'none' }
    },
    star: {
        points: generateStar(64, 5),
        shadow: { type: 'none' }
    },
    sun: {
        points: generateSun(64, 12),
        shadow: {
            type: 'sun',
            corona: true,
            intensity: 1.5,
            flares: true,
            texture: true,
            turbulence: 0.3
        }
    },
    moon: {
        points: generateMoon(64),
        shadow: {
            type: 'crescent',
            coverage: 0.85,
            angle: -30,
            softness: 0.05,
            offset: 0.7
        }
    },
    lunar: {
        points: generateCircle(64),
        shadow: {
            type: 'lunar',
            coverage: 0.7,
            color: 'rgba(80, 20, 0, 0.8)',
            progression: 'center'
        }
    },
    suspicion: {
        points: generateSuspicion(64),
        shadow: { type: 'none' }
    },
    eclipse: {
        points: generateCircle(64),
        shadow: {
            type: 'lunar',
            coverage: 0.7,
            color: 'rgba(80, 20, 0, 0.8)'
        }
    },
    square: {
        points: generateSquare(64),
        shadow: { type: 'none' }
    },
    triangle: {
        points: generateTriangle(64),
        shadow: { type: 'none' }
    },
    solar: {
        points: generateSun(64, 12),
        shadow: {
            type: 'solar-hybrid',
            // Sun properties (rendered first)
            corona: true,
            intensity: 1.5,
            flares: true,
            texture: true,
            turbulence: 0.3,
            // Lunar shadow overlay (rendered on top) - BLACK for solar eclipse
            lunarOverlay: {
                type: 'lunar',
                coverage: 1.0,  // Full coverage for total eclipse
                color: 'rgba(0, 0, 0, 1.0)',  // Pure black shadow
                progression: 'center'
            }
        }
    }
};

export default SHAPE_DEFINITIONS;