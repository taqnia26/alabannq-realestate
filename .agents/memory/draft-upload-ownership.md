---
name: Draft upload ownership
description: Why removing one image field must not delete a file used by another unsaved slide.
---

Treat uploaded-file deletion as a content-level operation, not an image-picker removal or unmount operation.

**Why:** Server reference checks see saved records, not unsaved drafts. A newly uploaded image can be reused by duplicated slides before any record is saved; removing it from one field can otherwise destroy another slide's image.

**How to apply:** Defer physical cleanup until saved-content replacement or abandonment of the whole editing session. Protect all references in the parent draft, including disabled slides, and prevent pending upload callbacks from modifying a discarded or different draft.