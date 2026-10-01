import { describe, expect, it } from "vitest";

import { internalHrefOf } from "./internal-href";

function clickOn(href: string, init: MouseEventInit = {}, target?: string): MouseEvent {
  const anchor = document.createElement("a");
  anchor.href = href;
  if (target) anchor.target = target;
  const child = document.createElement("span");
  anchor.append(child);
  document.body.append(anchor);
  const event = new MouseEvent("click", { bubbles: true, button: 0, ...init });
  Object.defineProperty(event, "target", { value: child });
  return event;
}

const ORIGIN = window.location.origin;

describe("internalHrefOf", () => {
  it("AC-MSG-014 A-7 returns the in-app destination of a plain link click", () => {
    expect(internalHrefOf(clickOn("/w/A/settings?tab=1"), ORIGIN, "/w/A/message-templates/x")).toBe(
      "/w/A/settings?tab=1",
    );
  });

  it("ignores new-tab clicks, external links and the current page", () => {
    expect(internalHrefOf(clickOn("/w/A", { metaKey: true }), ORIGIN, "/x")).toBeNull();
    expect(internalHrefOf(clickOn("/w/A", {}, "_blank"), ORIGIN, "/x")).toBeNull();
    expect(internalHrefOf(clickOn("https://example.com/"), ORIGIN, "/x")).toBeNull();
    expect(internalHrefOf(clickOn("/x"), ORIGIN, "/x")).toBeNull();
  });
});
