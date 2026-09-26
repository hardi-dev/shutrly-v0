import "./globals.css";

import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import type { PropsWithChildren } from "react";

import { AppProviders } from "@/ui/providers/app-providers";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans-loaded",
});

export const metadata: Metadata = { title: "Shutrly" };

// Light theme by default; dark is opt-in with data-theme="dark" (no feature specifies a switch yet).
export default function RootLayout({ children }: Readonly<PropsWithChildren>) {
  return (
    <html lang="id" className={sans.variable}>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
