import { describe, expect, it } from "vitest";

import { SOURCE_COPY } from "../source-copy/source-copy.copy";
import { SOURCE_NAME_ERROR_KEYS, sourceNameErrorText } from "./source-name-error";

describe("sourceNameErrorText", () => {
  it.each(SOURCE_NAME_ERROR_KEYS)("maps %s to the approved copy", (key) => {
    expect(sourceNameErrorText(key)).toBe(SOURCE_COPY.nameErrors[key]);
  });
});
