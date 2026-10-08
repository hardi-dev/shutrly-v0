import type { Metadata } from "next";

import { LandingPage } from "@/features/landing/ui/landing-page/landing-page";

import { HOME_PAGE_COPY as COPY } from "./page.copy";

// The production domain (Owner 2026-10-08, Netlify DNS); share previews resolve the image here.
const SITE_URL = new URL("https://shutrly.space");
// Pencil frame nSYag, 1200 × 630; in public/ so the production gate never touches it.
const SHARE_IMAGE = {
  url: "/landing/share.jpg",
  width: 1200,
  height: 630,
  alt: COPY.shareImageAlt,
};

export const metadata: Metadata = {
  metadataBase: SITE_URL,
  title: COPY.title,
  description: COPY.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: COPY.siteName,
    title: COPY.title,
    description: COPY.description,
    images: [SHARE_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: COPY.title,
    description: COPY.description,
    images: [SHARE_IMAGE],
  },
};

export default function HomePage() {
  return <LandingPage />;
}
