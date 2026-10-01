import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PageActions } from "./page-actions";

describe("PageActions", () => {
  it("renders actions into the desktop owner shell slot after mount", async () => {
    render(
      <>
        <div id="owner-page-actions" />
        <PageActions>
          <button type="button">Tambah sumber</button>
        </PageActions>
      </>,
    );

    await waitFor(() => {
      expect(document.querySelector("#owner-page-actions")).toContainElement(
        screen.getByRole("button", { name: "Tambah sumber" }),
      );
    });
  });
});
