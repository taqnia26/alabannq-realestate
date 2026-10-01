---
name: Editor draft recovery
description: Browser navigation dialogs are best-effort and cannot be the only protection for unsaved slider edits.
---

Keep a recoverable tab-local draft independently of leave-confirmation dialogs, and compare its saved baseline before restoring it.

**Why:** Browser tests repeatedly navigated away from the admin editor despite attempting to dismiss Back-navigation dialogs. Nested router lifetimes and native browser prompt handling make interception insufficient as the sole protection against draft loss.

**How to apply:** Preserve unsaved work across editor unmounts, avoid automatically applying it over a newer saved configuration, and clear recovery data on save or explicit discard/logout. Treat browser-close warnings as additional protection, not a persistence guarantee.