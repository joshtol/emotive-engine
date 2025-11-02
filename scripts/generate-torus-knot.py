#!/usr/bin/env python3
"""
Generate a torus knot OBJ file with correct parametric equations
"""
import math

def generate_torus_knot_obj(p=3, q=2, path_segments=128, tube_segments=32,
                            torus_radius=1.0, tube_radius=0.3, output_file='torus-knot.obj'):
    """
    Generate a (p,q)-torus knot OBJ file

    Standard parametric equations:
    x = cos(p*t) * (R + r*cos(q*t))
    y = sin(p*t) * (R + r*cos(q*t))
    z = r * sin(q*t)
    """
    vertices = []
    normals = []
    faces = []

    def calculate_position(t):
        """Calculate position on the path curve"""
        pt = p * t
        qt = q * t

        cos_pt = math.cos(pt)
        sin_pt = math.sin(pt)
        cos_qt = math.cos(qt)
        sin_qt = math.sin(qt)

        R = torus_radius
        r = tube_radius * 2

        x = cos_pt * (R + r * cos_qt)
        y = sin_pt * (R + r * cos_qt)
        z = r * sin_qt

        return (x, y, z)

    def calculate_tangent(t):
        """Calculate tangent vector"""
        pt = p * t
        qt = q * t

        # Derivatives
        dx_dt = -p * math.sin(pt) * (torus_radius + tube_radius * 2 * math.cos(qt)) - \
                q * tube_radius * 2 * math.cos(pt) * math.sin(qt)
        dy_dt = p * math.cos(pt) * (torus_radius + tube_radius * 2 * math.cos(qt)) - \
                q * tube_radius * 2 * math.sin(pt) * math.sin(qt)
        dz_dt = q * tube_radius * 2 * math.cos(qt)

        length = math.sqrt(dx_dt**2 + dy_dt**2 + dz_dt**2)
        if length > 0:
            return (dx_dt/length, dy_dt/length, dz_dt/length)
        return (1, 0, 0)

    def cross_product(a, b):
        """Calculate cross product"""
        return (
            a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0]
        )

    def normalize(v):
        """Normalize a vector"""
        length = math.sqrt(v[0]**2 + v[1]**2 + v[2]**2)
        if length > 0:
            return (v[0]/length, v[1]/length, v[2]/length)
        return (0, 0, 1)

    # Generate vertices and normals
    for i in range(path_segments + 1):
        u = (i / path_segments) * 2 * math.pi

        pos = calculate_position(u)
        tangent = calculate_tangent(u)

        # Create perpendicular vectors for the tube
        if abs(tangent[2]) < 0.9:
            up = (0, 0, 1)
        else:
            up = (0, 1, 0)

        normal1 = normalize(cross_product(tangent, up))
        normal2 = normalize(cross_product(tangent, normal1))

        for j in range(tube_segments + 1):
            v = (j / tube_segments) * 2 * math.pi

            cos_v = math.cos(v)
            sin_v = math.sin(v)

            # Normal direction for tube
            nx = normal1[0] * cos_v + normal2[0] * sin_v
            ny = normal1[1] * cos_v + normal2[1] * sin_v
            nz = normal1[2] * cos_v + normal2[2] * sin_v

            # Vertex position
            vx = pos[0] + tube_radius * nx
            vy = pos[1] + tube_radius * ny
            vz = pos[2] + tube_radius * nz

            vertices.append((vx, vy, vz))
            normals.append((nx, ny, nz))

    # Generate faces
    for i in range(path_segments):
        for j in range(tube_segments):
            v1 = i * (tube_segments + 1) + j
            v2 = v1 + 1
            v3 = v1 + (tube_segments + 1)
            v4 = v3 + 1

            # OBJ indices are 1-based
            faces.append((v1+1, v2+1, v4+1, v3+1))

    # Write OBJ file
    with open(output_file, 'w') as f:
        f.write(f"# Torus Knot ({p},{q})\n")
        f.write(f"# Generated with correct parametric equations\n")
        f.write(f"# Vertices: {len(vertices)}, Faces: {len(faces)}\n\n")

        # Write vertices
        for v in vertices:
            f.write(f"v {v[0]:.6f} {v[1]:.6f} {v[2]:.6f}\n")

        f.write("\n")

        # Write normals
        for n in normals:
            f.write(f"vn {n[0]:.6f} {n[1]:.6f} {n[2]:.6f}\n")

        f.write("\n")

        # Write faces (quads)
        for face in faces:
            f.write(f"f {face[0]}//{face[0]} {face[1]}//{face[1]} {face[2]}//{face[2]} {face[3]}//{face[3]}\n")

    print(f"Generated {output_file}")
    print(f"  Vertices: {len(vertices)}")
    print(f"  Normals: {len(normals)}")
    print(f"  Faces: {len(faces)}")

if __name__ == '__main__':
    generate_torus_knot_obj(
        p=3,
        q=2,
        path_segments=128,
        tube_segments=32,
        torus_radius=1.0,
        tube_radius=0.3,
        output_file='examples/models/torus-knot.obj'
    )
