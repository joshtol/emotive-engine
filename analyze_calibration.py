#!/usr/bin/env python3
"""
Analyze all 63 calibration screenshots and generate a comprehensive report.
"""

import os
import glob

# Define all screenshot categories and expected files
calibration_dir = r"C:\zzz\emotive\emotive-engine\examples\calibration-screenshots"

categories = {
    "01-ROUGHNESS": [
        ("mirror", "0% - Perfect mirror reflection"),
        ("glossy", "15% - Glossy reflection"),
        ("satin", "35% - Satin finish"),
        ("balanced", "50% - Balanced"),
        ("matte", "75% - Matte"),
        ("pure-matte", "100% - Pure diffuse"),
    ],
    "02-FRESNEL": [
        ("front", "Front view - minimal Fresnel"),
        ("rim", "Rim view - strong Fresnel edges"),
        ("grazing", "Grazing angle - maximum Fresnel"),
    ],
    "03-AMBIENT-OCCLUSION": [
        ("none", "100% - No darkening"),
        ("light", "75% - Light shadows"),
        ("medium", "50% - Medium shadows"),
        ("heavy", "25% - Heavy shadows"),
        ("maximum", "0% - Black crevices"),
    ],
    "04-SUBSURFACE-SCATTERING": [
        ("none", "0% - Opaque surface"),
        ("light", "30% - Light translucency"),
        ("moderate", "60% - Moderate penetration"),
        ("strong", "100% - Strong glow"),
    ],
    "05-METALLIC": [
        ("dielectric", "0% - Pure dielectric"),
        ("semi-metal-25", "25% - Slightly metallic"),
        ("semi-metal-50", "50% - Half metal"),
        ("semi-metal-75", "75% - Mostly metal"),
        ("pure-metal", "100% - Pure metal"),
        ("metal-rough", "100% metal + 60% roughness"),
        ("metal-mirror-front", "Metal mirror - FRONT"),
        ("metal-mirror-rim", "Metal mirror - RIM"),
        ("metal-mirror-grazing", "Metal mirror - GRAZING"),
    ],
    "06-ANISOTROPY": [
        ("isotropic", "0 - Isotropic"),
        ("light-horizontal", "30% - Light horizontal"),
        ("moderate-horizontal", "60% - Moderate horizontal"),
        ("strong-horizontal", "100% - Dramatic horizontal"),
        ("light-vertical", "-30% - Light vertical"),
        ("strong-vertical", "-100% - Dramatic vertical"),
        ("aniso-front", "100% horizontal - FRONT"),
        ("aniso-rim", "100% horizontal - RIM"),
        ("aniso-grazing", "100% horizontal - GRAZING"),
        ("aniso-topdown", "100% horizontal - TOP-DOWN"),
    ],
    "07-IRIDESCENCE": [
        ("none", "0% - Standard surface"),
        ("subtle", "30% - Subtle color shift"),
        ("moderate", "60% - Visible rainbow"),
        ("strong", "100% - Dramatic iridescence"),
        ("irid-front", "100% - FRONT view"),
        ("irid-rim", "100% - RIM view"),
        ("irid-grazing", "100% - GRAZING view"),
        ("irid-closeup", "100% - CLOSEUP view"),
        ("smooth-irid-mirror", "100% irid + 0% rough"),
    ],
    "08-COMBINED-MATERIALS": [
        ("jade", "Jade - SSS + AO + Fresnel"),
        ("brushed-copper", "Brushed Copper - Aniso + Metal + AO"),
        ("soap-bubble", "Soap Bubble - Irid + SSS + mirror"),
        ("polished-marble", "Polished Marble - SSS + AO + Fresnel"),
        ("opal", "Opal - SSS + Irid + AO"),
        ("brushed-titanium", "Brushed Titanium - Aniso + Metal + irid"),
    ],
    "09-EDGE-CASES": [
        ("all-zero", "All effects disabled"),
        ("all-maximum", "All effects maxed"),
        ("metal-sss-conflict", "Metal + SSS conflict"),
        ("mirror-ao-conflict", "Mirror metal + maximum AO"),
        ("extreme-aniso-irid", "Extreme aniso + iridescence"),
    ],
    "10-GEOMETRY-TESTS": [
        ("teapot", "Utah Teapot (3K verts)"),
        ("bunny", "Stanford Bunny (35K verts)"),
        ("suzanne", "Suzanne (507 verts)"),
        ("torus-knot", "Torus Knot (4K verts)"),
        ("cow", "Spot Cow (2.9K verts)"),
        ("dragon", "Stanford Dragon (437K verts)"),
    ],
}

print("=" * 80)
print("CALIBRATION SCREENSHOT ANALYSIS")
print("=" * 80)
print()

total_files = 0
missing_files = []

for category, tests in categories.items():
    category_path = os.path.join(calibration_dir, category.lower())
    print(f"\n{category}")
    print("-" * 80)

    for filename, description in tests:
        filepath = os.path.join(category_path, f"{filename}.png")
        if os.path.exists(filepath):
            total_files += 1
            size_kb = os.path.getsize(filepath) / 1024
            print(f"  ✓ {filename:30s} {description:50s} ({size_kb:.1f} KB)")
        else:
            missing_files.append(filepath)
            print(f"  ✗ {filename:30s} {description:50s} MISSING!")

print()
print("=" * 80)
print(f"SUMMARY: {total_files}/63 files found")
if missing_files:
    print(f"Missing: {len(missing_files)} files")
    for f in missing_files:
        print(f"  - {f}")
print("=" * 80)
