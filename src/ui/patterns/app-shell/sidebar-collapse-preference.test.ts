// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";

import { readCollapsed, writeCollapsed } from "./sidebar-collapse-preference";

describe("sidebar collapse preference", () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it("round trips the browser preference", () => {
    writeCollapsed(true);
    expect(readCollapsed()).toBe(true);
  });

  it("falls back to expanded when storage is unavailable", () => {
    const original = window.localStorage;
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get: () => {
        throw new Error("blocked");
      },
    });
    expect(readCollapsed()).toBe(false);
    Object.defineProperty(window, "localStorage", { configurable: true, value: original });
  });
});
