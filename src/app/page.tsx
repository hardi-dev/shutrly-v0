import type { Metadata } from "next";

import { LandingPage } from "@/features/landing/ui/landing-page/landing-page";

import { HOME_PAGE_COPY } from "./page.copy";

export const metadata: Metadata = {
  title: HOME_PAGE_COPY.title,
  description: HOME_PAGE_COPY.description,
};

export default function HomePage() {
  return <LandingPage />;
}
