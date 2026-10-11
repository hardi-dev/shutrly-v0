import { screen } from "@testing-library/react";
import { copyMessages } from "@tests/support/copy/copy-messages";
import { renderInLocale } from "@tests/support/copy/render-in-locale";
import { describe, expect, it } from "vitest";

import {
  CATALOG_COPY_NAMESPACE,
  CATALOG_ERROR_MESSAGE_KEY,
} from "../catalog-copy/catalog-copy.copy";
import { CatalogFieldError } from "./catalog-field-error";

describe("CatalogFieldError", () => {
  it("AC-CAT-008 renders every server field-error key used by the catalog", () => {
    const messages = copyMessages("id")[CATALOG_COPY_NAMESPACE] ?? {};
    for (const [code, messageKey] of Object.entries(CATALOG_ERROR_MESSAGE_KEY)) {
      const { unmount } = renderInLocale(<CatalogFieldError errorKey={code} />, "id");
      expect(screen.getByRole("alert")).toHaveTextContent(messages[messageKey] ?? "");
      unmount();
    }
  });
});
