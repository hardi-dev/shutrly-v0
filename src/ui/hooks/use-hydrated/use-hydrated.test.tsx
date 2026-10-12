import { render, screen, waitFor } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useHydrated } from "./use-hydrated";

function HydratedProbe() {
  const hydrated = useHydrated();
  return <output>{String(hydrated)}</output>;
}

describe("useHydrated", () => {
  it("is false in the server render", () => {
    const html = renderToString(<HydratedProbe />);

    expect(html).toContain(">false<");
  });

  it("is true once the component is mounted on the client", async () => {
    render(<HydratedProbe />);

    await waitFor(() => {
      expect(screen.getByText("true")).toBeInTheDocument();
    });
  });
});
