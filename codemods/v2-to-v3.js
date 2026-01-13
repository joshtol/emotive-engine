/**
 * Codemod: Migrate Emotive Engine v2 to v3
 *
 * Automates the following breaking changes:
 * 1. Import style: `import EmotiveMascot from '...'` → `import { EmotiveMascot } from '...'`
 * 2. Config property: `emotion` → `defaultEmotion`
 * 3. Event names: `emotionChange` → `emotion:change`, etc.
 *
 * Usage:
 *   npx jscodeshift -t codemods/v2-to-v3.js src/**\/*.js
 *
 * @see docs/MIGRATION.md for full migration guide
 */

const EVENT_RENAMES = {
    emotionChange: 'emotion:change',
    gestureStart: 'gesture:trigger',
    shapeChange: 'shape:morph'
};

const EMOTIVE_PACKAGES = [
    '@joshtol/emotive-engine',
    '@joshtol/emotive-engine/3d',
    'emotive-engine',
    'emotive-engine/3d'
];

export default function transformer(file, api) {
    const j = api.jscodeshift;
    const source = j(file.source);
    let hasChanges = false;

    // Transform 1: Default imports → Named imports
    // `import EmotiveMascot from '@joshtol/emotive-engine'`
    // → `import { EmotiveMascot } from '@joshtol/emotive-engine'`
    source
        .find(j.ImportDeclaration)
        .filter(path => {
            const importSource = path.node.source.value;
            return EMOTIVE_PACKAGES.some(pkg => importSource === pkg || importSource.startsWith(`${pkg}/`));
        })
        .forEach(path => {
            const defaultSpecifier = path.node.specifiers.find(
                s => s.type === 'ImportDefaultSpecifier'
            );

            if (defaultSpecifier) {
                const localName = defaultSpecifier.local.name;

                // Replace default import with named import
                const namedSpecifier = j.importSpecifier(
                    j.identifier(localName),
                    j.identifier(localName)
                );

                // Keep any existing named imports
                const existingNamed = path.node.specifiers.filter(
                    s => s.type === 'ImportSpecifier'
                );

                path.node.specifiers = [namedSpecifier, ...existingNamed];
                hasChanges = true;
            }
        });

    // Transform 2: Config property rename
    // `new EmotiveMascot({ emotion: 'joy' })`
    // → `new EmotiveMascot({ defaultEmotion: 'joy' })`
    source
        .find(j.NewExpression)
        .filter(path => {
            const calleeName = path.node.callee.name;
            return calleeName === 'EmotiveMascot' || calleeName === 'EmotiveMascot3D';
        })
        .forEach(path => {
            const args = path.node.arguments;
            if (args.length > 0 && args[0].type === 'ObjectExpression') {
                args[0].properties.forEach(prop => {
                    if (prop.key && prop.key.name === 'emotion') {
                        prop.key.name = 'defaultEmotion';
                        hasChanges = true;
                    }
                });
            }
        });

    // Transform 3: Event name renames
    // `.on('emotionChange', ...)` → `.on('emotion:change', ...)`
    source
        .find(j.CallExpression, {
            callee: {
                type: 'MemberExpression',
                property: { name: 'on' }
            }
        })
        .forEach(path => {
            const args = path.node.arguments;
            if (args.length > 0 && args[0].type === 'Literal') {
                const eventName = args[0].value;
                if (EVENT_RENAMES[eventName]) {
                    args[0].value = EVENT_RENAMES[eventName];
                    hasChanges = true;
                }
            }
        });

    // Also check eventManager.on() pattern
    source
        .find(j.CallExpression)
        .filter(path => {
            const {callee} = path.node;
            return (
                callee.type === 'MemberExpression' &&
                callee.property.name === 'on' &&
                callee.object.type === 'MemberExpression' &&
                callee.object.property.name === 'eventManager'
            );
        })
        .forEach(path => {
            const args = path.node.arguments;
            if (args.length > 0 && args[0].type === 'Literal') {
                const eventName = args[0].value;
                if (EVENT_RENAMES[eventName]) {
                    args[0].value = EVENT_RENAMES[eventName];
                    hasChanges = true;
                }
            }
        });

    return hasChanges ? source.toSource({ quote: 'single' }) : null;
}
