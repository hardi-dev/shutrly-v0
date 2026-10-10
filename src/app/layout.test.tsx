import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const providerProps = vi.hoisted(() => ({
  last: null as null | { locale: string; strictMessages: boolean },
}));

vi.mock("./globals.css", () => ({}));
vi.mock("next/font/google", () => ({ Plus_Jakarta_Sans: () => ({ variable: "font-sans" }) }));
vi.mock("@/composition/app-stage/app-stage", () => ({
  isLandingOnly: vi.fn(() => Promise.resolve(false)),
}));
vi.mock("next-intl/server", () => ({
  getLocale: vi.fn(() => Promise.resolve(currentLocale.value)),
  getMessages: vi.fn(() => Promise.resolve({ probe: { ok: "Okay" } })),
}));
vi.mock("@/ui/providers/app-providers", () => ({
  AppProviders: (props: { children: unknown; locale: string; strictMessages: boolean }) => {
    providerProps.last = { locale: props.locale, strictMessages: props.strictMessages };
    return props.children;
  },
}));

const currentLocale = vi.hoisted(() => ({ value: "en" }));

import RootLayout from "./layout";

async function renderRoot() {
  const element = await RootLayout({ children: "page" });
  return renderToStaticMarkup(element);
}

describe("RootLayout", () => {
  beforeEach(() => {
    providerProps.last = null;
  });

  it("AC-L10N-005 renders lang, next-intl and React Aria in en", async () => {
    currentLocale.value = "en";
    const markup = await renderRoot();
    expect(markup).toContain('<html lang="en"');
    expect(providerProps.last).toEqual({ locale: "en", strictMessages: true });
  });

  it("AC-L10N-005 renders lang, next-intl and React Aria in id", async () => {
    currentLocale.value = "id";
    const markup = await renderRoot();
    expect(markup).toContain('<html lang="id"');
    expect(providerProps.last).toEqual({ locale: "id", strictMessages: true });
  });
});
