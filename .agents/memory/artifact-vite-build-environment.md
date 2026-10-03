---
name: Artifact Vite build environment
description: Runtime variables needed when manually building the Alabnq artifact outside its managed workflow.
---

When running a production Vite build manually for this artifact, provide both the port and the artifact base path environment values expected by its Vite configuration.

**Why:** The managed artifact workflow supplies these routing values automatically, while a direct shell build does not. Without them, Vite stops before compiling even when the application source is valid.

**How to apply:** For a direct validation build, set `PORT` and `BASE_PATH` to match the artifact preview environment. Let the managed workflow provide them during normal preview and deployment operation.

Artifact preview prefixes may arrive without a trailing slash. Normalize the prefix when joining it to public asset paths rather than assuming Vite supplies a final slash.

**Why:** A managed sandbox preview supplied a slashless prefix; otherwise valid logo and photograph paths concatenated into an invalid URL while the page and remote property images still loaded.

**How to apply:** Check all locally served assets when creating isolated previews, not just external photographs or the React page itself.