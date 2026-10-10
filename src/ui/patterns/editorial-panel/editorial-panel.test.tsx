import { render } from "@testing-library/react";
import { renderInLocale } from "@tests/support/copy/render-in-locale";
import { describe, expect, it } from "vitest";

import { EditorialPanel } from "./editorial-panel";
import { EDITORIAL_PANEL_COPY } from "./editorial-panel.copy";

describe("EditorialPanel (Z5xhk)", () => {
  it("AC-AUTH-023 is decorative: hidden from assistive technology, with no controls", () => {
    const { container } = render(<EditorialPanel />);
    const panel = container.querySelector("aside");
    expect(panel).toHaveAttribute("aria-hidden", "true");
    expect(panel?.querySelectorAll("a, button, input")).toHaveLength(0);
    expect(panel?.querySelector("img")).toHaveAttribute("alt", "");
  });

  it("AC-AUTH-023 renders the supplied headline and panel copy as text", () => {
    const { container } = render(<EditorialPanel>Headline</EditorialPanel>);
    expect(container.textContent).toContain("Headline");
    expect(container.textContent).toContain(EDITORIAL_PANEL_COPY.messages.id.body);
  });
});

describe("EditorialPanel copy", () => {
  it("AC-L10N-002 renders the panel description in English", () => {
    const { container } = renderInLocale(<EditorialPanel />, "en");
    expect(container.textContent).toContain(EDITORIAL_PANEL_COPY.messages.en.body);
  });

  it("AC-L10N-002 renders the panel description in Indonesian", () => {
    const { container } = renderInLocale(<EditorialPanel />, "id");
    expect(container.textContent).toContain(
      "Catat paket klien, harga sepakat, dan jadwal pemotretan dalam satu proyek.",
    );
  });
});
