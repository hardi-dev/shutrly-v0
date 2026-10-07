import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import type { NextConfig } from "next";

// Server Function calls aren't logged in dev: their arguments carry emails and passwords (C-103,
// AC-LND-012).
const nextConfig: NextConfig = { devIndicators: false, logging: { serverFunctions: false } };

export default nextConfig;

// Exposes .dev.vars bindings to getCloudflareContext() under `next dev`; not needed on Netlify.
if (!process.env.NETLIFY) void initOpenNextCloudflareForDev();
