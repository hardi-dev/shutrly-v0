import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;

// Exposes .dev.vars bindings to getCloudflareContext() under `next dev`.
void initOpenNextCloudflareForDev();
