# Scroll Experience QA Checklist

This checklist captures scenarios we need to validate once the end-to-end scroll/lock/avatar loop is wired. Use it as the baseline for manual sweeps and for future automation.

## Desktop Interactions

- [ ] Slow scroll (mouse wheel) through every section; verify the lock engages within buffer thresholds and releases gracefully.
- [ ] Rapid skimming (aggressive wheel) triggers Quick Nav auto-open once per session and respects intent reset after closing.
- [ ] Keyboard navigation (PgUp/PgDn, Arrow keys, Space) updates the ScrollIntent hook and respects lock release rules.
- [ ] Alt/Shift+Tab focus trap inside Quick Nav overlay loops across buttons without spilling to the page.
- [ ] Quick Nav button click locks the chosen section, fires analytics (`emotive:quicknav`), and animates the mascot without duplicate gestures.

## Touch / Trackpad

- [ ] Trackpad inertial scroll updates intent confidence and will not leave the mascot stranded between sections.
- [ ] Touch emulation (Chrome dev tools) ensures locks break at the configured buffer, and Quick Nav auto-open does not repeatedly fire.

## Resilience

- [ ] Resize the viewport (desktop -> tablet) and confirm `visitedSections` persists without stale offsets; mascot re-syncs via `updateSections`.
- [ ] Reload during a lock state; ensure body dataset resets and the first scroll rehydrates state correctly.
- [ ] Navigate away and back (Next.js routing) without memory leaks; AvatarController `destroy` should run without throwing.

## Accessibility & Messaging

- [ ] Screen reader announces Quick Nav dialog title and hint summary via `aria-live`.
- [ ] Quick Nav analytics events include `source` and `reason` so downstream dashboards stay consistent.
- [ ] MessageHUD updates triggered by intent or Quick Nav navigation do not overlap locked sections.

Document findings in this file by checking items off and linking to bug tickets where necessary.
