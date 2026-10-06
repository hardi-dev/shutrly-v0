import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import type { NextConfig } from "next";

// F-10 D-8: client gallery pages and actions are private and never indexed or edge-cached.
const CLIENT_GALLERY_HEADERS = [
  { key: "Cache-Control", value: "private, no-store" },
  { key: "X-Robots-Tag", value: "noindex" },
];

// The image fallback route may sit in the browser's private cache like F-09's (D-8, D-10).
const CLIENT_MEDIA_HEADERS = [
  { key: "Cache-Control", value: "private, max-age=600" },
  { key: "X-Robots-Tag", value: "noindex" },
];

const nextConfig: NextConfig = {
  devIndicators: false,
  // Later rules win for the same header, so the media rule comes last.
  headers: () =>
    Promise.resolve([
      { source: "/g/:path*", headers: CLIENT_GALLERY_HEADERS },
      { source: "/g/:token/media/:path*", headers: CLIENT_MEDIA_HEADERS },
    ]),
};

export default nextConfig;

// Exposes .dev.vars bindings to getCloudflareContext() under `next dev`; not needed on Netlify.
if (!process.env.NETLIFY) void initOpenNextCloudflareForDev();
