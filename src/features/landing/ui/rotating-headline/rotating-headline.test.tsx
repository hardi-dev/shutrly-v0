import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RotatingHeadline } from "./rotating-headline";
import { ROTATING_HEADLINE_COPY as COPY } from "./rotating-headline.copy";

describe("RotatingHeadline", () => {
  it("AC-LND-001 names the page with one stable heading, whatever word is showing", () => {
    render(<RotatingHeadline />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveAccessibleName(COPY.accessible);
  });

  it("starts on the first word of the rotation and keeps the others out of sight", () => {
    render(<RotatingHeadline />);
    const shown = (word: string) =>
      screen.getAllByText(word).some((element) => element.classList.contains("opacity-100"));
    expect(shown(COPY.words[0])).toBe(true);
    expect(shown(COPY.words[1])).toBe(false);
    expect(shown(COPY.words[2])).toBe(false);
    expect(screen.getByText(COPY.stable)).toBeInTheDocument();
  });
});
