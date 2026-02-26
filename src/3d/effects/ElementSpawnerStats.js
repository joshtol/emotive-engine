/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Element Spawner Stats
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Shared debug stats for ElementSpawner and related modules
 * @module effects/ElementSpawnerStats
 *
 * Extracted to avoid circular dependencies between ElementSpawner and Trail.
 */
/* eslint-disable no-console */

// Maximum active materials before forcing cleanup (GPU memory protection)
// Reduced from 150 to 80 for more aggressive GPU protection
export const MAX_ACTIVE_MATERIALS = 80;

// Maximum total elements across ALL types at once
// Prevents GPU overload from multiple simultaneous gestures
export const MAX_TOTAL_ELEMENTS = 40;

export const elementSpawnerStats = {
    meshesCreated: 0,
    meshesDisposed: 0,
    materialsCloned: 0,
    materialsDisposed: 0,
    trailsCreated: 0,
    trailsDisposed: 0,
    animationStatesCreated: 0,
    spawnCalls: 0,
    despawnCalls: 0,
    get activeMaterials() {
        return this.materialsCloned - this.materialsDisposed;
    },
    report() {
        const leaks = {
            meshes: this.meshesCreated - this.meshesDisposed,
            materials: this.materialsCloned - this.materialsDisposed,
            trails: this.trailsCreated - this.trailsDisposed,
        };
        console.table({
            'Meshes': { created: this.meshesCreated, disposed: this.meshesDisposed, LEAK: leaks.meshes },
            'Materials': { created: this.materialsCloned, disposed: this.materialsDisposed, LEAK: leaks.materials },
            'Trails': { created: this.trailsCreated, disposed: this.trailsDisposed, LEAK: leaks.trails },
            'AnimStates': { created: this.animationStatesCreated, disposed: '-', LEAK: '-' },
            'Spawn/Despawn': { spawn: this.spawnCalls, despawn: this.despawnCalls, LEAK: '-' },
        });
        if (leaks.meshes > 0 || leaks.materials > 0 || leaks.trails > 0) {
            console.warn('⚠️ LEAK:', leaks);
        }
        return leaks;
    },
    reset() {
        this.meshesCreated = this.meshesDisposed = 0;
        this.materialsCloned = this.materialsDisposed = 0;
        this.trailsCreated = this.trailsDisposed = 0;
        this.animationStatesCreated = this.spawnCalls = this.despawnCalls = 0;
    }
};

// Expose stats globally
if (typeof window !== 'undefined') {
    window.ELEMENT_SPAWNER_STATS = elementSpawnerStats;

    // Emergency cleanup - call if GPU issues occur
    window.ELEMENT_SPAWNER_EMERGENCY = () => {
        console.warn('[ElementSpawner] EMERGENCY CLEANUP TRIGGERED');
        // This will be set by ElementSpawner instance
        if (window._elementSpawnerInstance) {
            window._elementSpawnerInstance.despawnAll();
            console.log('[ElementSpawner] despawnAll() called');
        }
        elementSpawnerStats.reset();
        console.log('[ElementSpawner] Stats reset');
        return 'Emergency cleanup complete';
    };

    // Diagnostic function for debugging GPU issues
    window.ELEMENT_SPAWNER_DUMP = renderer => {
        console.log('═══════════════════════════════════════════════════');
        console.log('ELEMENT SPAWNER RESOURCE DUMP');
        console.log('═══════════════════════════════════════════════════');
        console.log('Materials:', {
            cloned: elementSpawnerStats.materialsCloned,
            disposed: elementSpawnerStats.materialsDisposed,
            ACTIVE: elementSpawnerStats.activeMaterials,
            LIMIT: MAX_ACTIVE_MATERIALS
        });
        console.log('Meshes:', {
            created: elementSpawnerStats.meshesCreated,
            disposed: elementSpawnerStats.meshesDisposed,
            ACTIVE: elementSpawnerStats.meshesCreated - elementSpawnerStats.meshesDisposed
        });
        console.log('Trails:', {
            created: elementSpawnerStats.trailsCreated,
            disposed: elementSpawnerStats.trailsDisposed,
            ACTIVE: elementSpawnerStats.trailsCreated - elementSpawnerStats.trailsDisposed
        });
        console.log('Spawn/Despawn calls:', {
            spawn: elementSpawnerStats.spawnCalls,
            despawn: elementSpawnerStats.despawnCalls
        });

        // WebGL info if renderer provided
        if (renderer?.info) {
            const { info } = renderer;
            console.log('WebGL Memory:', {
                geometries: info.memory.geometries,
                textures: info.memory.textures
            });
            console.log('WebGL Programs:', info.programs?.length || 'N/A');
            console.log('WebGL Render:', {
                calls: info.render.calls,
                triangles: info.render.triangles,
                points: info.render.points,
                lines: info.render.lines
            });
        }

        console.log('═══════════════════════════════════════════════════');
        return elementSpawnerStats;
    };
}
