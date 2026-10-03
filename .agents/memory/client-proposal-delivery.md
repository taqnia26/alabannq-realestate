---
name: Client proposal delivery
description: Reliable handoff of visual proposals when asset cards open files in the text editor.
---

Provide a browser-based image preview and explicit download buttons in the isolated mockup environment, alongside the downloadable image assets. Do not change the production-facing site to deliver design proposals.

**Why:** Reattaching PNGs and supplying smaller JPGs did not resolve a client's access problem: they were opening binary images in the code editor. The underlying files were valid. An explicit browser preview and native download path avoids confusing that view with a corrupted image.

**How to apply:** Preserve originals, label lighter alternatives clearly, and test actual download events against the source bytes. Explain that downloaded files should be opened in an image viewer, not the code editor.