---
name: Artifact Vite build environment
description: Runtime variables needed when manually building the Alabnq artifact outside its managed workflow.
---

When running a production Vite build manually for this artifact, provide both the port and the artifact base path environment values expected by its Vite configuration.

**Why:** The managed artifact workflow supplies these routing values automatically, while a direct shell build does not. Without them, Vite stops before compiling even when the application source is valid.

**How to apply:** For a direct validation build, set `PORT` and `BASE_PATH` to match the artifact preview environment. Let the managed workflow provide them during normal preview and deployment operation.