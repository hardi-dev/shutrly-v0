import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CATALOG_COPY } from "../catalog-copy/catalog-copy.copy";
import { CatalogFieldError } from "./catalog-field-error";

describe("CatalogFieldError", () => {
  it("AC-CAT-008 renders every server field-error key used by the catalog", () => {
    for (const [key, message] of Object.entries(CATALOG_COPY.errors)) {
      const { unmount } = render(<CatalogFieldError errorKey={key} />);
      expect(screen.getByRole("alert")).toHaveTextContent(message);
      unmount();
    }
  });
});
