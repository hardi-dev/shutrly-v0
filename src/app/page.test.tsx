import { copyTranslator } from "@tests/support/copy/copy-messages";
import { describe, expect, it, vi } from "vitest";

import type { AppLocale } from "@/shared/locale/locale.types";

import { generateMetadata } from "./page";

let locale: AppLocale = "en";

vi.mock("next-intl/server", () => ({
  getTranslations: (namespace: string) => Promise.resolve(copyTranslator(namespace, locale)),
}));

describe("home page metadata", () => {
  it("AC-L10N-002 sets the English title, description and share text", async () => {
    locale = "en";
    const metadata = await generateMetadata();
    expect(metadata.title).toBe("Shutrly — Less busywork. More photography.");
    expect(metadata.description).toBe(
      "A workspace for photographers to manage projects, client photo selections and invoices in one workspace. Join the waitlist.",
    );
    expect(metadata.openGraph?.siteName).toBe("Shutrly");
  });

  it("AC-L10N-002 sets the Indonesian title and description", async () => {
    locale = "id";
    const metadata = await generateMetadata();
    expect(metadata.title).toBe(
      "Shutrly — Lebih sedikit kerja admin. Lebih banyak waktu untuk fotografi.",
    );
    expect(metadata.description).toBe(
      "Ruang kerja untuk fotografer mengelola proyek, pilihan foto klien, dan tagihan dalam satu ruang kerja. Gabung daftar tunggu.",
    );
  });
});
