# Documentation Reorganization Plan

**Date**: October 24, 2025 **Current State**: 46 markdown files in root
directory **Target State**: 8 files in root, 23 in organized docs/, 15
deleted/consolidated

---

## Executive Summary

The Emotive Engine codebase has **46 markdown files cluttering the root
directory**, making it difficult to find current documentation and creating
confusion between active docs and historical implementation notes.

**Problems**:

- Mix of current docs, historical notes, and obsolete task lists
- Redundant information across 8+ performance files
- Difficult onboarding for new developers
- Unprofessional appearance for enterprise evaluation

**Solution**: Reorganize into clear structure with only 8 essential files in
root.

---

## Analysis Results

### Files by Category

| Category                           | Count  | Action         |
| ---------------------------------- | ------ | -------------- |
| Essential (keep in root)           | 8      | None           |
| Current/Active (move to docs/)     | 6      | Organize       |
| Historical/Completed (archive)     | 17     | Archive        |
| Redundant (consolidate/delete)     | 8      | Delete/Merge   |
| Outdated (update or delete)        | 4      | Update/Move    |
| Internal Notes (move to internal/) | 3      | Move           |
| **TOTAL**                          | **46** | **Reorganize** |

---

## Keep in Root (8 Files) ✅

These are essential project files that should remain in the root directory:

1. **README.md** - Primary project documentation
2. **LICENSE.md** - Dual licensing (MIT/Commercial)
3. **CONTRIBUTING.md** - Contributor guidelines
4. **CHANGELOG.md** - Version history (730 lines)
5. **SECURITY.md** - Vulnerability disclosure policy
6. **DEVELOPMENT.md** - Developer onboarding
7. **API.md** - Complete API reference (1056 lines)
8. **VERSIONING-POLICY.md** - SemVer policy & LTS

---

## New Directory Structure

```
emotive-mascot/
├── README.md
├── LICENSE.md
├── CONTRIBUTING.md
├── CHANGELOG.md
├── SECURITY.md
├── DEVELOPMENT.md
├── API.md
├── VERSIONING-POLICY.md
│
└── docs/
    ├── guides/                    # User-facing guides
    │   ├── recording-integration.md
    │   ├── testing.md
    │   └── quick-reference.md
    │
    ├── deployment/                # Deployment documentation
    │   ├── cdn-setup.md
    │   └── npm-publishing.md
    │
    ├── performance/               # Performance docs
    │   └── benchmarks.md
    │
    ├── architecture/              # System architecture
    │   └── api-boundaries.md
    │
    ├── legal/                     # Legal documents
    │   ├── enterprise-license.md
    │   ├── license-update-notes.md
    │   └── defensive-publication.md
    │
    ├── planning/                  # Future planning
    │   ├── launch-readiness.md
    │   └── rhythm-game-future.md
    │
    ├── internal/                  # Internal use only
    │   ├── business-strategy.md
    │   └── ai-agent-guide.md
    │
    └── archive/                   # Historical records
        ├── 2025-10/
        │   ├── phase1-complete.md
        │   ├── phase2-3-4-summary.md
        │   └── emotion-audit.md
        ├── optimization-history.md     # Consolidated from 8 files
        ├── features-showcase.md        # Consolidated from 3 files
        ├── retail-implementation.md    # Consolidated from 2 files
        └── scroll-fixes.md             # Consolidated from 3 files
```

---

## Detailed Migration Plan

### Phase 1: Move Current Documentation (6 files)

```bash
mkdir -p docs/{guides,deployment,performance,architecture}

# Guides
mv INTEGRATION_GUIDE.md docs/guides/recording-integration.md
mv TESTING-GUIDE.md docs/guides/testing.md
mv QUICK-REFERENCE.md docs/guides/quick-reference.md

# Deployment
mv CDN.md docs/deployment/cdn-setup.md
mv NPM_PUBLISHING.md docs/deployment/npm-publishing.md

# Performance
mv PERFORMANCE.md docs/performance/benchmarks.md

# Architecture
mv API_BOUNDARIES.md docs/architecture/api-boundaries.md
```

---

### Phase 2: Move Legal & Planning (5 files)

```bash
mkdir -p docs/{legal,planning}

# Legal
mv LICENSE-COMMERCIAL-ENTERPRISE.md docs/legal/enterprise-license.md
mv LICENSE-UPDATES-SUMMARY.md docs/legal/license-update-notes.md
mv DEFENSIVE_PUBLICATION.md docs/legal/defensive-publication.md

# Planning
mv READY.md docs/planning/launch-readiness.md
mv RHYTHM_GAME_IMPLEMENTATION.md docs/planning/rhythm-game-future.md
```

**Note**: Add disclaimer to `launch-readiness.md`:

```markdown
> **Status**: DRAFT - This is a planning document. Many features are not yet
> implemented.
```

---

### Phase 3: Move Internal Docs (2 files)

```bash
mkdir -p docs/internal

# Internal strategy
mv AGENTS.md docs/internal/ai-agent-guide.md

# STRAT.md is 411KB - handle manually
# Consider splitting into smaller files or archiving
```

**Action Required**: Review STRAT.md and decide:

- Option A: Archive as single file
- Option B: Extract current strategy sections, archive rest
- Option C: Delete if superseded by other docs

---

### Phase 4: Archive Historical Docs (17 files)

```bash
mkdir -p docs/archive/2025-10

# Phase completion docs
mv PHASE1-COMPLETE.md docs/archive/2025-10/phase1-complete.md
mv PHASE_2_3_4_SUMMARY.md docs/archive/2025-10/phase2-3-4-summary.md
mv EMOTION-AUDIT.md docs/archive/2025-10/emotion-audit.md
mv REFACTORING-ANALYSIS.md docs/archive/2025-10/refactoring-analysis.md
mv ENGINE_PERFORMANCE_FRAMEWORK.md docs/archive/2025-10/performance-framework.md

# Recent completions
mv QUICK-WINS-COMPLETE.md docs/archive/quick-wins-complete.md

# Massive specification
mv site-reimagine.md docs/archive/site-specification.md  # 2516 lines!
```

---

### Phase 5: Consolidate Redundant Files

#### A. Performance Optimization (8 files → 1 file)

Create `docs/archive/optimization-history.md` from:

- ADVANCED_OPTIMIZATIONS.md
- CODE_SPLITTING_STRATEGY.md
- PERFORMANCE_OPTIMIZATION_SUMMARY.md
- MEMORY_LEAK_PREVENTION.md
- FINAL_SCROLL_FIX.md
- SCROLL_PERFORMANCE_FIX.md
- MASCOT_VISIBILITY_CONTROL.md

**Template**:

```markdown
# Optimization History

## 2025 October - Advanced Optimizations

[Content from ADVANCED_OPTIMIZATIONS.md]

## 2025 - Code Splitting Strategy

[Content from CODE_SPLITTING_STRATEGY.md]

## 2025 - Memory Leak Prevention

[Content from MEMORY_LEAK_PREVENTION.md]

## 2025 - Scroll Performance Fixes

### Final Scroll Fix

[Content from FINAL_SCROLL_FIX.md]

### Scroll Performance

[Content from SCROLL_PERFORMANCE_FIX.md]

### Mascot Visibility Control

[Content from MASCOT_VISIBILITY_CONTROL.md]
```

#### B. Features Showcase (3 files → 1 file)

Create `docs/archive/features-showcase.md` from:

- FEATURES_QUICK_START.md
- FEATURES_SHOWCASE_INTEGRATION.md
- FEATURES_SHOWCASE_SUMMARY.md

#### C. Retail Implementation (2 files → 1 file)

Create `docs/archive/retail-implementation.md` from:

- RETAIL_REDESIGN.md
- RETAIL_SETUP.md

---

### Phase 6: Delete Obsolete Files (5 files)

```bash
# Superseded by LICENSE-COMMERCIAL-ENTERPRISE.md
rm COMMERCIAL-LICENSE.md

# Feature complete, documented in CHANGELOG.md
rm SEMANTIC_PERFORMANCE_IMPLEMENTATION_PLAN.md

# Task lists - completed, info captured elsewhere
rm NEWNEW.md          # Phase 1 complete
rm OPTI.md            # Optimization tasks done
rm CLEANME.md         # Performance checklist done
```

---

## Complete Migration Script

Save as `scripts/reorganize-docs.sh`:

```bash
#!/bin/bash

echo "📚 Starting documentation reorganization..."

# Create directory structure
echo "📁 Creating directory structure..."
mkdir -p docs/{guides,deployment,performance,architecture,legal,planning,internal,archive/2025-10}

# Phase 1: Move current documentation
echo "📄 Moving current documentation..."
mv INTEGRATION_GUIDE.md docs/guides/recording-integration.md 2>/dev/null
mv TESTING-GUIDE.md docs/guides/testing.md 2>/dev/null
mv QUICK-REFERENCE.md docs/guides/quick-reference.md 2>/dev/null
mv CDN.md docs/deployment/cdn-setup.md 2>/dev/null
mv NPM_PUBLISHING.md docs/deployment/npm-publishing.md 2>/dev/null
mv PERFORMANCE.md docs/performance/benchmarks.md 2>/dev/null
mv API_BOUNDARIES.md docs/architecture/api-boundaries.md 2>/dev/null

# Phase 2: Move legal & planning
echo "⚖️  Moving legal and planning docs..."
mv LICENSE-COMMERCIAL-ENTERPRISE.md docs/legal/enterprise-license.md 2>/dev/null
mv LICENSE-UPDATES-SUMMARY.md docs/legal/license-update-notes.md 2>/dev/null
mv DEFENSIVE_PUBLICATION.md docs/legal/defensive-publication.md 2>/dev/null
mv READY.md docs/planning/launch-readiness.md 2>/dev/null
mv RHYTHM_GAME_IMPLEMENTATION.md docs/planning/rhythm-game-future.md 2>/dev/null

# Phase 3: Move internal docs
echo "🔒 Moving internal docs..."
mv AGENTS.md docs/internal/ai-agent-guide.md 2>/dev/null
# STRAT.md is too large - handle manually

# Phase 4: Archive historical docs
echo "📦 Archiving historical docs..."
mv PHASE1-COMPLETE.md docs/archive/2025-10/phase1-complete.md 2>/dev/null
mv PHASE_2_3_4_SUMMARY.md docs/archive/2025-10/phase2-3-4-summary.md 2>/dev/null
mv EMOTION-AUDIT.md docs/archive/2025-10/emotion-audit.md 2>/dev/null
mv REFACTORING-ANALYSIS.md docs/archive/2025-10/refactoring-analysis.md 2>/dev/null
mv ENGINE_PERFORMANCE_FRAMEWORK.md docs/archive/2025-10/performance-framework.md 2>/dev/null
mv QUICK-WINS-COMPLETE.md docs/archive/quick-wins-complete.md 2>/dev/null
mv site-reimagine.md docs/archive/site-specification.md 2>/dev/null

# Phase 5: Archive files for consolidation
echo "📋 Moving files to be consolidated..."
mkdir -p docs/archive/to-consolidate/{optimization,features,retail}

mv ADVANCED_OPTIMIZATIONS.md docs/archive/to-consolidate/optimization/ 2>/dev/null
mv CODE_SPLITTING_STRATEGY.md docs/archive/to-consolidate/optimization/ 2>/dev/null
mv PERFORMANCE_OPTIMIZATION_SUMMARY.md docs/archive/to-consolidate/optimization/ 2>/dev/null
mv MEMORY_LEAK_PREVENTION.md docs/archive/to-consolidate/optimization/ 2>/dev/null
mv FINAL_SCROLL_FIX.md docs/archive/to-consolidate/optimization/ 2>/dev/null
mv SCROLL_PERFORMANCE_FIX.md docs/archive/to-consolidate/optimization/ 2>/dev/null
mv MASCOT_VISIBILITY_CONTROL.md docs/archive/to-consolidate/optimization/ 2>/dev/null

mv FEATURES_QUICK_START.md docs/archive/to-consolidate/features/ 2>/dev/null
mv FEATURES_SHOWCASE_INTEGRATION.md docs/archive/to-consolidate/features/ 2>/dev/null
mv FEATURES_SHOWCASE_SUMMARY.md docs/archive/to-consolidate/features/ 2>/dev/null

mv RETAIL_REDESIGN.md docs/archive/to-consolidate/retail/ 2>/dev/null
mv RETAIL_SETUP.md docs/archive/to-consolidate/retail/ 2>/dev/null

# Phase 6: Delete obsolete files
echo "🗑️  Deleting obsolete files..."
rm -f COMMERCIAL-LICENSE.md
rm -f SEMANTIC_PERFORMANCE_IMPLEMENTATION_PLAN.md
rm -f NEWNEW.md
rm -f OPTI.md
rm -f CLEANME.md

echo "✅ Reorganization complete!"
echo ""
echo "📌 Manual steps remaining:"
echo "  1. Review and move STRAT.md (411KB) to docs/internal/ or archive"
echo "  2. Consolidate optimization files into docs/archive/optimization-history.md"
echo "  3. Consolidate features files into docs/archive/features-showcase.md"
echo "  4. Consolidate retail files into docs/archive/retail-implementation.md"
echo "  5. Add DRAFT disclaimer to docs/planning/launch-readiness.md"
echo "  6. Update any broken links in README.md or other docs"
echo ""
echo "📊 Final structure:"
echo "  Root: 8 essential files"
echo "  docs/guides: 3 files"
echo "  docs/deployment: 2 files"
echo "  docs/performance: 1 file"
echo "  docs/architecture: 1 file"
echo "  docs/legal: 3 files"
echo "  docs/planning: 2 files"
echo "  docs/internal: 1 file"
echo "  docs/archive: 7+ files"
```

---

## Manual Consolidation Tasks

### Task 1: Create optimization-history.md

```bash
cat docs/archive/to-consolidate/optimization/*.md > docs/archive/optimization-history.md
```

Then manually add section headers and cleanup.

### Task 2: Create features-showcase.md

```bash
cat docs/archive/to-consolidate/features/*.md > docs/archive/features-showcase.md
```

### Task 3: Create retail-implementation.md

```bash
cat docs/archive/to-consolidate/retail/*.md > docs/archive/retail-implementation.md
```

### Task 4: Handle STRAT.md

**Option A** (Recommended): Archive entire file

```bash
mv STRAT.md docs/internal/business-strategy-2025.md
```

**Option B**: Extract current sections, delete rest

- Read through 411KB file
- Extract still-relevant strategy sections
- Create new concise strategy doc
- Archive original

---

## Post-Reorganization Checklist

### 1. Update Links in README.md

Search for references to moved files:

```bash
grep -n "\.md" README.md
```

Update links from:

```markdown
See [Integration Guide](INTEGRATION_GUIDE.md)
```

To:

```markdown
See [Integration Guide](docs/guides/recording-integration.md)
```

### 2. Update .github Workflows

Check if any CI/CD scripts reference moved files:

```bash
grep -r "\.md" .github/workflows/
```

### 3. Update package.json "files"

If any markdown files were included in npm package:

```json
{
    "files": [
        "dist",
        "src",
        "docs", // Add this if needed
        "README.md",
        "LICENSE.md",
        "CHANGELOG.md"
    ]
}
```

### 4. Create docs/README.md Index

```markdown
# Emotive Engine Documentation

## User Guides

- [Recording Integration](guides/recording-integration.md)
- [Testing Guide](guides/testing.md)
- [Quick Reference](guides/quick-reference.md)

## Deployment

- [CDN Setup](deployment/cdn-setup.md)
- [NPM Publishing](deployment/npm-publishing.md)

## Performance

- [Benchmarks](performance/benchmarks.md)

## Architecture

- [API Boundaries](architecture/api-boundaries.md)

## Legal

- [Enterprise License](legal/enterprise-license.md)
- [License Updates](legal/license-update-notes.md)
- [Defensive Publication](legal/defensive-publication.md)

## Planning

- [Launch Readiness](planning/launch-readiness.md) (Draft)
- [Rhythm Game Future](planning/rhythm-game-future.md)

## Archive

Historical implementation notes and completed projects.
```

### 5. Add .gitignore for docs/

```bash
echo "# Exclude drafts and local notes" >> docs/.gitignore
echo "drafts/" >> docs/.gitignore
echo "notes/" >> docs/.gitignore
echo "*.tmp.md" >> docs/.gitignore
```

---

## Rollback Plan

If something goes wrong:

```bash
# Restore from git
git checkout -- *.md

# Or restore from backup
cp backup/*.md .
```

**Before running script**: Create backup

```bash
mkdir -p ../emotive-mascot-docs-backup
cp *.md ../emotive-mascot-docs-backup/
```

---

## Timeline

### Estimated Time: 3 hours

- **Phase 1-4** (Moves): 30 minutes
- **Phase 5** (Consolidation): 90 minutes
- **Phase 6** (Cleanup): 15 minutes
- **Testing & Updates**: 45 minutes

### Execution Plan

**Day 1 - Morning**:

1. Create backup of all markdown files
2. Run migration script
3. Handle STRAT.md manually

**Day 1 - Afternoon**: 4. Consolidate optimization files 5. Consolidate features
files 6. Consolidate retail files

**Day 2 - Morning**: 7. Update links in README.md 8. Create docs/README.md
index 9. Test all documentation links 10. Commit and push changes

---

## Success Criteria

### Before

- ❌ 46 files in root directory
- ❌ Difficult to find current docs
- ❌ Mix of current and historical
- ❌ Unprofessional appearance

### After

- ✅ 8 files in root (essentials only)
- ✅ Clear directory structure
- ✅ Historical docs archived
- ✅ Professional organization
- ✅ Easy onboarding for new developers
- ✅ Enterprise-ready documentation

---

## Risk Assessment

### Low Risk

- Moving files preserves git history
- Old links can be updated with search/replace
- Easy to rollback with git

### Medium Risk

- Broken links in external references (READMEs, blogs)
- CI/CD scripts may reference old paths

### Mitigation

- Create redirects or symlinks if needed
- Test thoroughly before pushing
- Update external references (website, GitHub pages)

---

## Next Steps

1. **Review this plan** - Confirm approach with team
2. **Create backup** - Save all markdown files
3. **Run migration script** - Execute reorganization
4. **Manual consolidation** - Merge redundant files
5. **Update links** - Fix broken references
6. **Test** - Verify all documentation accessible
7. **Commit** - Git commit with clear message
8. **Update external refs** - Website, blog posts, etc.

---

**Status**: Ready for execution **Last Updated**: October 24, 2025 **Next
Review**: After reorganization complete
