# Emotive Engine documentation

Start with the repository [README](../README.md): install, quick start, bundle table,
live demos. Everything below goes deeper.

## Using the engine

| Doc | What it covers |
| --- | --- |
| [API.md](./API.md) | Every method and option, emotions, gestures, geometries, 3D options, the single-element imports |
| [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) | One-page cheat sheet |
| [GESTURES.md](./GESTURES.md) | The gesture catalogue |
| [EVENTS.md](./EVENTS.md) | Events the mascot emits |
| [LLM_INTEGRATION.md](./LLM_INTEGRATION.md) | Driving the mascot from an LLM with `feel()`; system-prompt templates |
| [PLUGINS.md](./PLUGINS.md) | Writing plugins |
| [ACCESSIBILITY.md](./ACCESSIBILITY.md) | Reduced motion, screen readers, fallbacks |
| [PERFORMANCE.md](./PERFORMANCE.md) | Budgets, profiling, what costs what |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Symptoms and fixes |
| [MIGRATION.md](./MIGRATION.md) | Upgrading between major versions |

## How it works

| Doc | What it covers |
| --- | --- |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Module map and data flow |
| [TECHNICAL_ARCHITECTURE.md](./TECHNICAL_ARCHITECTURE.md) | Rendering pipeline detail |
| [CUTOUT-SYSTEM.md](./CUTOUT-SYSTEM.md) | The cutout shader mechanic |
| [GRAIN-SYSTEM.md](./GRAIN-SYSTEM.md) | Procedural grain in the instanced materials |
| [INNOVATIONS.md](./INNOVATIONS.md) | The techniques this engine introduced, with dates |

## Project

| Doc | What it covers |
| --- | --- |
| [RELEASING.md](./RELEASING.md) | Release checklist; what each push, tag and `npm publish` triggers |
| [CONTRIBUTORS.md](./CONTRIBUTORS.md) | People |
| [THIRD-PARTY-LICENSES.md](./THIRD-PARTY-LICENSES.md) | Texture and model attributions |
| [../CONTRIBUTING.md](../CONTRIBUTING.md) | How to contribute |
| [../SECURITY.md](../SECURITY.md) | Reporting a vulnerability |
| [../CHANGELOG.md](../CHANGELOG.md) | Release history |

Generated API reference: `npm run docs` (JSDoc) or `npm run docs:api` (TypeDoc).

The demos live in [site/public/examples](../site/public/examples/) and are deployed to
https://joshtol.github.io/emotive-engine on every push to `main`.
