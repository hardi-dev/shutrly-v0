import { act, render } from "@testing-library/react";
import { createPortal } from "react-dom";
import { describe, expect, it } from "vitest";

import { useSlotTarget } from "./use-slot-target";

function Probe() {
  const target = useSlotTarget("test-slot", "testOwner");
  return target ? createPortal(<span>in slot</span>, target) : null;
}

function addSlot(owned = false): HTMLDivElement {
  const slot = document.createElement("div");
  slot.id = "test-slot";
  if (owned) slot.dataset.testOwner = "true";
  document.body.appendChild(slot);
  return slot;
}

describe("useSlotTarget", () => {
  it("claims a slot that already exists", () => {
    const slot = addSlot();
    render(<Probe />);
    expect(slot.textContent).toBe("in slot");
    expect(slot.dataset.testOwner).toBe("true");
    slot.remove();
  });

  it("waits for a slot the shell renders later", async () => {
    render(<Probe />);
    let slot = document.createElement("div");
    await act(async () => {
      slot = addSlot();
      await Promise.resolve();
    });
    expect(slot.textContent).toBe("in slot");
    slot.remove();
  });

  it("leaves a slot that another page owns", () => {
    const slot = addSlot(true);
    render(<Probe />);
    expect(slot.textContent).toBe("");
    slot.remove();
  });
});
