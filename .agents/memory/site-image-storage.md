---
name: Site image storage
description: Why uploaded editorial images are public through the app despite living in the private object directory
---

Uploaded property, article, and page images are public website content, not user-private attachments. Keep uploads restricted to the existing verified site administrator, but serve accepted images publicly through the app's narrow image endpoint.

**Why:** The object directory is private for direct bucket access, while visitors must be able to view published listings without signing in. A generic public object endpoint would make the upload directory too broad.

**How to apply:** For future upload surfaces, distinguish publicly displayed editorial media from private documents; do not expose the entire private object directory or reuse this public path for sensitive files.