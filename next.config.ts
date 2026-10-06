import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import type { NextConfig } from "next";

// F-10 D-8: client gallery pages and actions are private and never indexed or edge-cached.
const CLIENT_GALLERY_HEADERS = [
  { key: "Cache-Control", value: "private, no-store" },
  { key: "X-Robots-Tag", value: "noindex" },
];

const nextConfig: NextConfig = {
  devIndicators: false,
  headers: () => Promise.resolve([{ source: "/g/:path*", headers: CLIENT_GALLERY_HEADERS }]),
};

export default nextConfig;

// Exposes .dev.vars bindings to getCloudflareContext() under `next dev`; not needed on Netlify.
if (!process.env.NETLIFY) void initOpenNextCloudflareForDev();
