#!/usr/bin/env python3
"""
Script to split emotion files into base + rhythm modules
Properly handles JavaScript object syntax
"""

import os
import re
from pathlib import Path

emotions = [
    'neutral', 'joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust',
    'love', 'suspicion', 'excited', 'resting', 'euphoria', 'focused', 'glitch', 'calm'
]

states_dir = Path('src/core/emotions/states')
base_dir = Path('src/core/emotions/base')
rhythm_dir = Path('src/core/emotions/rhythm')

base_dir.mkdir(parents=True, exist_ok=True)
rhythm_dir.mkdir(parents=True, exist_ok=True)

for emotion in emotions:
    source_file = states_dir / f'{emotion}.js'

    print(f'\nProcessing: {emotion}')

    if not source_file.exists():
        print(f'  Warning:  Skipping - file not found')
        continue

    content = source_file.read_text(encoding='utf-8')

    # Find rhythm section - it starts with "// Rhythm" comment and "rhythm: {"
    # and ends with the matching closing brace
    rhythm_pattern = r'(\n    // Rhythm.*?\n    rhythm: \{(?:[^{}]|{[^{}]*})*\},?)'
    match = re.search(rhythm_pattern, content, re.DOTALL)

    if not match:
        print(f'  Warning:  No rhythm section found')
        continue

    rhythm_section = match.group(1)

    # Remove rhythm section from content
    base_content = content.replace(rhythm_section, '')

    # Update header
    base_content = base_content.replace(
        f'{emotion.capitalize()} Emotion',
        f'{emotion.capitalize()} Emotion (Base)'
    )
    base_content = re.sub(
        r'(@fileoverview .+?)(\n)',
        r'\1 (visual/behavioral only)\2',
        base_content
    )
    base_content = re.sub(
        r'(@module emotions/states/)',
        r'@module emotions/base/',
        base_content
    )

    # Write base file
    base_file = base_dir / f'{emotion}.js'
    base_file.write_text(base_content, encoding='utf-8')
    print(f'  OK: Created base/{emotion}.js')

    # Extract rhythm object
    rhythm_obj_match = re.search(r'rhythm: (\{(?:[^{}]|{[^{}]*})*\})', rhythm_section, re.DOTALL)
    if not rhythm_obj_match:
        print(f'  Warning:  Could not extract rhythm object')
        continue

    rhythm_object = rhythm_obj_match.group(1)

    # Create rhythm file
    rhythm_content = f"""/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - {emotion.capitalize()} Emotion (Rhythm Sync)
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview {emotion.capitalize()} emotional state - rhythm sync configuration
 * @author Emotive Engine Team
 * @module emotions/rhythm/{emotion}
 */

/**
 * {emotion.capitalize()} emotion rhythm configuration
 * Contains only rhythm sync properties for audio-reactive builds
 * Base properties are in base/{emotion}.js
 */
export default {{
    // Rhythm configuration
    rhythm: {rhythm_object}
}};
"""

    rhythm_file = rhythm_dir / f'{emotion}.js'
    rhythm_file.write_text(rhythm_content, encoding='utf-8')
    print(f'  OK: Created rhythm/{emotion}.js')

print('\nDone: Emotion split complete!')
