import type { Metadata } from "next";

import { LandingPage } from "@/features/landing/ui/landing-page/landing-page";

import { HOME_PAGE_COPY as COPY } from "./page.copy";

// The production main URL (ADR-021); share previews resolve opengraph-image.jpg against it.
const SITE_URL = new URL("https://shutrly.netlify.app");

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
  },
  twitter: { card: "summary_large_image", title: COPY.title, description: COPY.description },
};

export default function HomePage() {
  return <LandingPage />;
}
