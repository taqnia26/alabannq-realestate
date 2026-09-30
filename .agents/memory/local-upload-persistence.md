---
name: Local upload persistence
description: Publication risk from intentionally using local disk for editorial images.
---

The user explicitly requested replacing cloud image storage with local disk for admin uploads. Keep that choice unless they ask otherwise.

**Why:** Replit documentation says the filesystem of a published app is ephemeral and uploaded files can be lost on restart or republish. Development verification of local uploads does not establish production durability.

**How to apply:** Before suggesting publication or claiming uploaded images will persist in production, explain the loss risk and ask whether they want a persistent storage approach or a persistent mounted volume, if one is available.