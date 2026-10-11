import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { LandingPage } from "@/features/landing/ui/landing-page/landing-page";

import { HOME_PAGE_COPY_NAMESPACE } from "./page.copy";

// The brand name is not translated (copy-deck.md §19).
const SITE_NAME = "Shutrly";
// The production domain (Owner 2026-10-08, Netlify DNS); share previews resolve the image here.
const SITE_URL = new URL("https://shutrly.space");
// Pencil frame nSYag, 1200 × 630; in public/ so the production gate never touches it.
const SHARE_IMAGE = { url: "/landing/share.jpg", width: 1200, height: 630 };

/**
 * The home page metadata in the request locale (copy-deck.md §19): title, description and the
 * share-image alt text. Reads the locale only, so it works on the landing-only production.
 * @returns the page metadata
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations(HOME_PAGE_COPY_NAMESPACE);
  const title = t("title");
  const description = t("description");
  const image = { ...SHARE_IMAGE, alt: t("shareImageAlt") };
  return {
    metadataBase: SITE_URL,
    title,
    description,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      url: "/",
      siteName: SITE_NAME,
      title,
      description,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default function HomePage() {
  return <LandingPage />;
}
