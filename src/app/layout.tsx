import "./globals.css";

import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { getLocale, getMessages } from "next-intl/server";
import type { PropsWithChildren } from "react";

import { isLandingOnly } from "@/composition/app-stage/app-stage";
import { AppProviders } from "@/ui/providers/app-providers";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans-loaded",
});

export const metadata: Metadata = { title: "Shutrly" };

// Light theme by default; dark is opt-in with data-theme="dark" (no feature specifies a switch yet).
// The locale is resolved once per request (request-config) and shared by <html lang>, next-intl
// and React Aria (AC-L10N-005).
export default async function RootLayout({ children }: Readonly<PropsWithChildren>) {
  const locale = await getLocale();
  const messages = await getMessages();
  const strictMessages = !(await isLandingOnly());
  return (
    <html lang={locale} className={sans.variable}>
      <body>
        <AppProviders locale={locale} messages={messages} strictMessages={strictMessages}>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
