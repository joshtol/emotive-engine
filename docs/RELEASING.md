# Releasing Emotive Engine

What each action triggers, and the checklist to run before it. Nothing here publishes
on its own: the npm publish is a manual command.

## What the automation does

| Action                      | Workflow                 | Effect                                                                 |
| --------------------------- | ------------------------ | ---------------------------------------------------------------------- |
| Push / PR to `main`         | `ci.yml`                 | lint, tests (Node 20 + 22), production build, bundle-size check        |
| Push to `main`              | `pages.yml`              | **Deploys the demo gallery** to https://joshtol.github.io/emotive-engine |
| Push a tag `vX.Y.Z`         | `release.yml`            | tests + build, creates the **GitHub Release** with the dist bundles and the CHANGELOG section for `X.Y.Z` as notes |
| `npm publish` (local, manual) | `prepublishOnly` script | `npm run clean && npm run build`, then uploads the `files` list to npm |

There is no npm publish step in CI, so the tag alone never changes what `npm install`
gives people.

## Checklist

1. **Changelog.** `CHANGELOG.md` has a `## [X.Y.Z] - YYYY-MM-DD` section. `release.yml`
   extracts exactly that heading for the release notes; a missing section means an
   empty release body.
2. **Version.** `npm version X.Y.Z --no-git-tag-version` (bumps `package.json` and
   `package-lock.json`; the tag is created by hand in step 7 so it can be reviewed).
   Update the `vX.Y.Z` headers in `types/*.d.ts`.
3. **Green locally.**
   ```bash
   npm run lint && npm test && npm run build && npm run size
   npm run size:report      # brotli table for README / release notes
   npm run links            # README, docs/ and templates
   ```
4. **Tarball.** `npm pack --dry-run` and read the file list: JS bundles, `types/`,
   README, LICENSE, THIRD-PARTY-LICENSES, two SVG logos. No `.map`, no `assets/`,
   no textures or models. Compare `unpacked size` with the previous release
   (`npm view @joshtol/emotive-engine@<prev> dist.unpackedSize dist.fileCount`).
5. **Demos.** Every page under `site/public/examples/{2d,3d}` loads with no 404 and no
   console error from the Pages layout (`pages.yml` copies `dist/` fresh, so the demos
   use the new build). Reproduce locally by running the "Prepare Pages directory"
   step into a scratch folder and serving it under `/emotive-engine/`.
6. **Commit** the release commit on a branch, open a PR, let `ci.yml` pass, merge.
   Merging to `main` deploys the demo site.
7. **Tag and push the tag** from the merged commit:
   ```bash
   git tag -a vX.Y.Z -m "vX.Y.Z"
   git push origin vX.Y.Z
   ```
   Watch `release.yml`; check the GitHub Release page shows the right notes and files.
8. **Publish to npm** from a clean checkout of the tagged commit, logged in as the
   package owner:
   ```bash
   git status --porcelain        # must be empty
   npm publish --access public   # add --dry-run first to see the file list
   npm view @joshtol/emotive-engine version
   ```
9. **After.** Check `https://unpkg.com/@joshtol/emotive-engine/dist/emotive-mascot.umd.js`
   resolves to the new version, the Pages gallery shows the new build, and the
   GitHub Release and the CHANGELOG agree.

## Undo

- Wrong tag before publish: `git tag -d vX.Y.Z && git push origin :refs/tags/vX.Y.Z`,
  delete the GitHub Release.
- Published a bad version: `npm deprecate @joshtol/emotive-engine@X.Y.Z "reason"` and
  publish a patch. `npm unpublish` only works within 72 hours and breaks installs.
