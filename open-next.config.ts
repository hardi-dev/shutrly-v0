import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// No incremental cache: F-00 has no ISR. Revisit when a feature needs cached pages.
export default defineCloudflareConfig({});
