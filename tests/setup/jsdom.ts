import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(cleanup);

// Components read the locale through next-intl. Without a provider the screens' copy and amount
// formats default to the Indonesian (id) locale that their tests assert. Tests that need the real
// provider restore `useLocale` explicitly.
vi.mock("next-intl", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next-intl")>();
  return { ...actual, useLocale: vi.fn(() => "id") };
});
