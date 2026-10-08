// @vitest-environment jsdom

import { describe, expect, it, vi } from "vitest";

import { copyText, selectContents } from "./copy-text";

function stubClipboard(writeText: () => Promise<void>) {
  const fn = vi.fn(writeText);
  Object.defineProperty(navigator, "clipboard", { value: { writeText: fn }, configurable: true });
  return fn;
}

describe("copyText", () => {
  it("copies through the Clipboard API when the browser allows it", async () => {
    const writeText = stubClipboard(() => Promise.resolve());
    await expect(copyText("mawar-4821")).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith("mawar-4821");
  });

  it("reports a refusal instead of throwing (in-app browsers)", async () => {
    stubClipboard(() => Promise.reject(new DOMException("denied", "NotAllowedError")));
    await expect(copyText("mawar-4821")).resolves.toBe(false);
  });
});

describe("selectContents", () => {
  it("selects the element's whole text", () => {
    const element = document.createElement("span");
    element.textContent = "https://shutrly.app/g/abc";
    document.body.append(element);
    selectContents(element);
    expect(window.getSelection()?.toString()).toBe("https://shutrly.app/g/abc");
    element.remove();
  });
});
