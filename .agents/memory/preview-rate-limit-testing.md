---
name: Preview rate-limit testing
description: The preview proxy can aggregate forwarded test addresses into one per-IP auth rate window.
---

Do not assume that different synthetic `X-Forwarded-For` values create independent rate-limit windows through the development preview proxy.

**Why:** Real authentication verification encountered shared rate-limit counts even when the probes supplied different forwarded addresses. This is proxy behavior that cannot be inferred from the application's limiter implementation alone.

**How to apply:** Budget real-request tests against a shared window and honor `Retry-After` before the next group. Do not weaken rate limits or restart the service merely to bypass them for a test.
