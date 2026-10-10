import { render, screen } from "@testing-library/react";
import { renderInLocale } from "@tests/support/copy/render-in-locale";
import { describe, expect, it } from "vitest";

import { SplitLayout } from "./split-layout";
import { SPLIT_LAYOUT_COPY } from "./split-layout.copy";

describe("SplitLayout", () => {
  it("AC-AUTH-023 puts the screen in a main landmark with the brand and footer", () => {
    render(
      <SplitLayout>
        <h1>Heading</h1>
      </SplitLayout>,
    );
    expect(screen.getByRole("main")).toHaveTextContent("Heading");
    expect(screen.getByText(SPLIT_LAYOUT_COPY.messages.id.brand)).toBeInTheDocument();
    expect(screen.getByText(SPLIT_LAYOUT_COPY.messages.id.footer)).toBeInTheDocument();
  });

  it("AC-AUTH-023 hides the editorial panel below the desktop breakpoint", () => {
    const { container } = render(<SplitLayout>x</SplitLayout>);
    expect(container.querySelector('[data-slot="editorial"]')).toHaveClass("hidden", "lg:block");
  });

  it("keeps the editorial headline valid inside the panel typography wrapper", () => {
    const { container } = render(<SplitLayout>Headline</SplitLayout>);
    expect(container.querySelector("p p")).toBeNull();
  });

  it("renders the header action next to the brand", () => {
    render(
      <SplitLayout headerAction={<button type="button">Language</button>}>
        <h1>Heading</h1>
      </SplitLayout>,
    );
    const header = document.querySelector('[data-slot="header"]');
    expect(header).toHaveClass("flex", "items-center", "justify-between");
    expect(header).toContainElement(screen.getByText(SPLIT_LAYOUT_COPY.messages.id.brand));
    expect(header).toContainElement(screen.getByRole("button", { name: "Language" }));
  });

  it("renders no header action by default", () => {
    render(<SplitLayout>Heading</SplitLayout>);
    const header = document.querySelector('[data-slot="header"]');
    expect(header).toContainElement(screen.getByText(SPLIT_LAYOUT_COPY.messages.id.brand));
    expect(header?.children).toHaveLength(1);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("accepts a feature-specific editorial panel without changing the shell", () => {
    render(
      <SplitLayout editorial={<div data-testid="feature-editorial">Workspace preview</div>}>
        <h1>Workspace</h1>
      </SplitLayout>,
    );

    expect(screen.getByTestId("feature-editorial")).toHaveTextContent("Workspace preview");
  });
});

describe("SplitLayout copy", () => {
  it("AC-L10N-002 renders the editorial headline in English", () => {
    renderInLocale(<SplitLayout>x</SplitLayout>, "en");
    expect(screen.getByText(SPLIT_LAYOUT_COPY.messages.en.headline)).toBeInTheDocument();
  });

  it("AC-L10N-002 renders the editorial headline in Indonesian", () => {
    renderInLocale(<SplitLayout>x</SplitLayout>, "id");
    expect(screen.getByText("Catat detail tiap pemotretan di satu tempat.")).toBeInTheDocument();
  });
});
