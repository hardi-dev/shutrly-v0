import { vi } from "vitest";

/** Stubs `matchMedia` so `useMobileViewport` reports a phone (`true`) or a desktop (`false`). */
export function stubViewport(isMobile: boolean): void {
  vi.stubGlobal("matchMedia", (media: string) => ({
    matches: isMobile,
    media,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}
