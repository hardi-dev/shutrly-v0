// @vitest-environment jsdom

import { act, render, screen } from "@testing-library/react";
import { NextIntlClientProvider, useLocale } from "next-intl";
import type { ReactNode } from "react";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useLocaleReformat } from "./use-locale-reformat";
import type { ReformatKind } from "./use-locale-reformat.types";

interface HarnessProps {
  readonly initial: string;
  readonly kind: ReformatKind | null;
  readonly onSet?: (next: string) => void;
}

function Harness({ initial, kind, onSet }: Readonly<HarnessProps>) {
  const [value, setRaw] = useState(initial);
  const setValue = (next: string) => {
    onSet?.(next);
    setRaw(next);
  };
  useLocaleReformat({ value, setValue, kind });
  return <output aria-label="field">{value}</output>;
}

function wrap(locale: "en" | "id", props: HarnessProps): ReactNode {
  return (
    <NextIntlClientProvider locale={locale} messages={{}}>
      <Harness {...props} />
    </NextIntlClientProvider>
  );
}

describe("useLocaleReformat", () => {
  beforeEach(async () => {
    const actual = await vi.importActual<typeof import("next-intl")>("next-intl");
    vi.mocked(useLocale).mockImplementation(actual.useLocale);
  });

  it("AC-L10N-004 a typed amount is rewritten when the language changes", () => {
    const onSet = vi.fn();
    const { rerender } = render(wrap("id", { initial: "750.000", kind: "amount", onSet }));
    expect(screen.getByLabelText("field").textContent).toBe("750.000");
    act(() => {
      rerender(wrap("en", { initial: "750.000", kind: "amount", onSet }));
    });
    expect(screen.getByLabelText("field").textContent).toBe("750,000");
    expect(onSet).toHaveBeenCalledTimes(1);
    expect(onSet).toHaveBeenCalledWith("750,000");
  });

  it("AC-L10N-004 a typed quantity is rewritten when the language changes", () => {
    const { rerender } = render(wrap("id", { initial: "1,5", kind: "quantity" }));
    act(() => {
      rerender(wrap("en", { initial: "1,5", kind: "quantity" }));
    });
    expect(screen.getByLabelText("field").textContent).toBe("1.5");
  });

  it("AC-L10N-004 unparseable text is kept", () => {
    const onSet = vi.fn();
    const { rerender } = render(wrap("id", { initial: "7,5", kind: "amount", onSet }));
    act(() => {
      rerender(wrap("en", { initial: "7,5", kind: "amount", onSet }));
    });
    expect(screen.getByLabelText("field").textContent).toBe("7,5");
    expect(onSet).not.toHaveBeenCalled();
  });

  it("AC-L10N-004 a null kind never rewrites the text", () => {
    const { rerender } = render(wrap("id", { initial: "750.000", kind: null }));
    act(() => {
      rerender(wrap("en", { initial: "750.000", kind: null }));
    });
    expect(screen.getByLabelText("field").textContent).toBe("750.000");
  });
});
