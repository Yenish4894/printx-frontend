import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Minimal Cloudflare Workers config for OpenNext.
//
// No incremental cache override is set: this app is almost entirely dynamic
// (authenticated dashboards, live pricing quotes), so there is little ISR to
// persist. To enable R2-backed ISR/`use cache` later, add an R2 bucket binding
// in wrangler.jsonc and:
//   import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
//   export default defineCloudflareConfig({ incrementalCache: r2IncrementalCache });
export default defineCloudflareConfig();
