import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { copyTranslator } from "@tests/support/copy/copy-messages";
import { afterEach, vi } from "vitest";

afterEach(cleanup);

// Components read the locale through next-intl. Without a provider the screens' copy and amount
// formats default to the Indonesian (id) locale that their tests assert. Tests that need the real
// provider restore `useLocale` explicitly.
// Copy hooks follow the same default: outside a NextIntlClientProvider, useTranslations reads the
// registered Indonesian copy. Inside a provider (AC-L10N tests) the real hook is used.
vi.mock("next-intl", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next-intl")>();
  return {
    ...actual,
    useLocale: vi.fn(() => "id"),
    useTranslations: (namespace?: string) => {
      try {
        return actual.useTranslations(namespace);
      } catch {
        return copyTranslator(namespace ?? "", "id");
      }
    },
  };
});
