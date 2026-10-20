import type { Metadata } from "next";
import { getLocale } from "next-intl/server";

import { PrivacyPolicy } from "@/features/legal/ui/privacy-policy/privacy-policy";
import type { AppLocale } from "@/shared/locale/locale.types";

export const metadata: Metadata = {
  title: "Privacy Policy · Shutrly",
  alternates: { canonical: "/privacy" },
};

/**
 * The public privacy policy, in the request locale. Served on the landing-only production too.
 * @returns the policy page
 */
export default async function PrivacyPage() {
  const locale: AppLocale = (await getLocale()) === "id" ? "id" : "en";
  return <PrivacyPolicy locale={locale} />;
}
