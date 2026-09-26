import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AuthIntro } from "../auth-intro/auth-intro";
import { AuthPrompt } from "./auth-prompt";

describe("AuthIntro and AuthPrompt", () => {
  it("AC-AUTH-023 renders one level-1 heading and a named link", () => {
    render(
      <>
        <AuthIntro title="Title" lead="Lead" />
        <AuthPrompt prompt="Prompt" href="/login" link="Link" />
      </>,
    );
    expect(screen.getByRole("heading", { level: 1, name: "Title" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Link" })).toHaveAttribute("href", "/login");
  });
});
