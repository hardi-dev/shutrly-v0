import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import type { NextConfig } from "next";

const nextConfig: NextConfig = { devIndicators: false };

export default nextConfig;

// Exposes .dev.vars bindings to getCloudflareContext() under `next dev`; not needed on Netlify.
if (!process.env.NETLIFY) void initOpenNextCloudflareForDev();
