#!/bin/bash

echo "📚 Starting documentation reorganization..."

# Create directory structure
echo "📁 Creating directory structure..."
mkdir -p docs/{guides,deployment,performance,architecture,legal,planning,internal,archive/2025-10}

# Phase 1: Move current documentation
echo "📄 Moving current documentation..."
mv INTEGRATION_GUIDE.md docs/guides/recording-integration.md 2>/dev/null && echo "  ✓ INTEGRATION_GUIDE.md → docs/guides/recording-integration.md"
mv TESTING-GUIDE.md docs/guides/testing.md 2>/dev/null && echo "  ✓ TESTING-GUIDE.md → docs/guides/testing.md"
mv QUICK-REFERENCE.md docs/guides/quick-reference.md 2>/dev/null && echo "  ✓ QUICK-REFERENCE.md → docs/guides/quick-reference.md"
mv CDN.md docs/deployment/cdn-setup.md 2>/dev/null && echo "  ✓ CDN.md → docs/deployment/cdn-setup.md"
mv NPM_PUBLISHING.md docs/deployment/npm-publishing.md 2>/dev/null && echo "  ✓ NPM_PUBLISHING.md → docs/deployment/npm-publishing.md"
mv PERFORMANCE.md docs/performance/benchmarks.md 2>/dev/null && echo "  ✓ PERFORMANCE.md → docs/performance/benchmarks.md"
mv API_BOUNDARIES.md docs/architecture/api-boundaries.md 2>/dev/null && echo "  ✓ API_BOUNDARIES.md → docs/architecture/api-boundaries.md"

# Phase 2: Move legal & planning
echo "⚖️  Moving legal and planning docs..."
mv LICENSE-COMMERCIAL-ENTERPRISE.md docs/legal/enterprise-license.md 2>/dev/null && echo "  ✓ LICENSE-COMMERCIAL-ENTERPRISE.md → docs/legal/enterprise-license.md"
mv LICENSE-UPDATES-SUMMARY.md docs/legal/license-update-notes.md 2>/dev/null && echo "  ✓ LICENSE-UPDATES-SUMMARY.md → docs/legal/license-update-notes.md"
mv DEFENSIVE_PUBLICATION.md docs/legal/defensive-publication.md 2>/dev/null && echo "  ✓ DEFENSIVE_PUBLICATION.md → docs/legal/defensive-publication.md"
mv READY.md docs/planning/launch-readiness.md 2>/dev/null && echo "  ✓ READY.md → docs/planning/launch-readiness.md"
mv RHYTHM_GAME_IMPLEMENTATION.md docs/planning/rhythm-game-future.md 2>/dev/null && echo "  ✓ RHYTHM_GAME_IMPLEMENTATION.md → docs/planning/rhythm-game-future.md"

# Phase 3: Move internal docs
echo "🔒 Moving internal docs..."
mv AGENTS.md docs/internal/ai-agent-guide.md 2>/dev/null && echo "  ✓ AGENTS.md → docs/internal/ai-agent-guide.md"
mv STRAT.md docs/internal/business-strategy.md 2>/dev/null && echo "  ✓ STRAT.md → docs/internal/business-strategy.md"

# Phase 4: Archive historical docs
echo "📦 Archiving historical docs..."
mv PHASE1-COMPLETE.md docs/archive/2025-10/phase1-complete.md 2>/dev/null && echo "  ✓ PHASE1-COMPLETE.md → docs/archive/2025-10/"
mv PHASE_2_3_4_SUMMARY.md docs/archive/2025-10/phase2-3-4-summary.md 2>/dev/null && echo "  ✓ PHASE_2_3_4_SUMMARY.md → docs/archive/2025-10/"
mv EMOTION-AUDIT.md docs/archive/2025-10/emotion-audit.md 2>/dev/null && echo "  ✓ EMOTION-AUDIT.md → docs/archive/2025-10/"
mv REFACTORING-ANALYSIS.md docs/archive/2025-10/refactoring-analysis.md 2>/dev/null && echo "  ✓ REFACTORING-ANALYSIS.md → docs/archive/2025-10/"
mv ENGINE_PERFORMANCE_FRAMEWORK.md docs/archive/2025-10/performance-framework.md 2>/dev/null && echo "  ✓ ENGINE_PERFORMANCE_FRAMEWORK.md → docs/archive/2025-10/"
mv QUICK-WINS-COMPLETE.md docs/archive/quick-wins-complete.md 2>/dev/null && echo "  ✓ QUICK-WINS-COMPLETE.md → docs/archive/"
mv site-reimagine.md docs/archive/site-specification.md 2>/dev/null && echo "  ✓ site-reimagine.md → docs/archive/"

# Phase 5: Archive files for consolidation
echo "📋 Moving files to be consolidated..."
mkdir -p docs/archive/to-consolidate/{optimization,features,retail}

mv ADVANCED_OPTIMIZATIONS.md docs/archive/to-consolidate/optimization/ 2>/dev/null && echo "  ✓ ADVANCED_OPTIMIZATIONS.md"
mv CODE_SPLITTING_STRATEGY.md docs/archive/to-consolidate/optimization/ 2>/dev/null && echo "  ✓ CODE_SPLITTING_STRATEGY.md"
mv PERFORMANCE_OPTIMIZATION_SUMMARY.md docs/archive/to-consolidate/optimization/ 2>/dev/null && echo "  ✓ PERFORMANCE_OPTIMIZATION_SUMMARY.md"
mv MEMORY_LEAK_PREVENTION.md docs/archive/to-consolidate/optimization/ 2>/dev/null && echo "  ✓ MEMORY_LEAK_PREVENTION.md"
mv FINAL_SCROLL_FIX.md docs/archive/to-consolidate/optimization/ 2>/dev/null && echo "  ✓ FINAL_SCROLL_FIX.md"
mv SCROLL_PERFORMANCE_FIX.md docs/archive/to-consolidate/optimization/ 2>/dev/null && echo "  ✓ SCROLL_PERFORMANCE_FIX.md"
mv MASCOT_VISIBILITY_CONTROL.md docs/archive/to-consolidate/optimization/ 2>/dev/null && echo "  ✓ MASCOT_VISIBILITY_CONTROL.md"

mv FEATURES_QUICK_START.md docs/archive/to-consolidate/features/ 2>/dev/null && echo "  ✓ FEATURES_QUICK_START.md"
mv FEATURES_SHOWCASE_INTEGRATION.md docs/archive/to-consolidate/features/ 2>/dev/null && echo "  ✓ FEATURES_SHOWCASE_INTEGRATION.md"
mv FEATURES_SHOWCASE_SUMMARY.md docs/archive/to-consolidate/features/ 2>/dev/null && echo "  ✓ FEATURES_SHOWCASE_SUMMARY.md"

mv RETAIL_REDESIGN.md docs/archive/to-consolidate/retail/ 2>/dev/null && echo "  ✓ RETAIL_REDESIGN.md"
mv RETAIL_SETUP.md docs/archive/to-consolidate/retail/ 2>/dev/null && echo "  ✓ RETAIL_SETUP.md"

# Phase 6: Delete obsolete files
echo "🗑️  Deleting obsolete files..."
rm -f COMMERCIAL-LICENSE.md && echo "  ✓ Deleted COMMERCIAL-LICENSE.md"
rm -f SEMANTIC_PERFORMANCE_IMPLEMENTATION_PLAN.md && echo "  ✓ Deleted SEMANTIC_PERFORMANCE_IMPLEMENTATION_PLAN.md"
rm -f NEWNEW.md && echo "  ✓ Deleted NEWNEW.md"
rm -f OPTI.md && echo "  ✓ Deleted OPTI.md"
rm -f CLEANME.md && echo "  ✓ Deleted CLEANME.md"

echo ""
echo "✅ Migration script complete!"
echo ""
echo "📊 Summary:"
echo "  Root directory: Now contains only essential files"
echo "  docs/guides: 3 files"
echo "  docs/deployment: 2 files"
echo "  docs/performance: 1 file"
echo "  docs/architecture: 1 file"
echo "  docs/legal: 3 files"
echo "  docs/planning: 2 files"
echo "  docs/internal: 2 files"
echo "  docs/archive: 7 files + to-consolidate folders"
echo ""
echo "📌 Next steps (will be handled by subagents):"
echo "  1. Consolidate optimization files"
echo "  2. Consolidate features files"
echo "  3. Consolidate retail files"
echo "  4. Update links in README.md"
echo "  5. Create docs/README.md index"
