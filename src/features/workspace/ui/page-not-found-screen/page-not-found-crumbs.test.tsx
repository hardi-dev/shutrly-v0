import { screen, within } from "@testing-library/react";
import { copyTranslator } from "@tests/support/copy/copy-messages";
import { renderInLocale } from "@tests/support/copy/render-in-locale";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PAGE_HEADER_COPY_NAMESPACE } from "@/ui/patterns/page-header/page-header.copy";

import { OWNER_NAV_COPY_NAMESPACE } from "../owner-nav/owner-nav.copy";
import { OwnerWorkspaceProvider } from "../owner-workspace-context/owner-workspace-context";
import { PageNotFoundCrumbs } from "./page-not-found-crumbs";

const nav = vi.hoisted(() => ({ pathname: "/w/W/projects/x" }));

vi.mock("next/navigation", () => ({ usePathname: () => nav.pathname }));

const MISSING_ID = "7c1e2b9a-0d4f-4e6a-9b8c-1f2e3d4c5b6a";

/** Renders the crumb slot the way the Owner shell hosts it: inside the workspace provider. */
function renderCrumbs(locale: "en" | "id") {
  return renderInLocale(
    <OwnerWorkspaceProvider workspaceId="W" workspaceName="Studio Rina">
      <PageNotFoundCrumbs />
    </OwnerWorkspaceProvider>,
    locale,
  );
}

/** The breadcrumb navigation in the given locale. @param locale - the UI locale @returns the trail element */
function trailIn(locale: "en" | "id") {
  const crumbLabel = copyTranslator(PAGE_HEADER_COPY_NAMESPACE, locale)("breadcrumb");
  return screen.getByRole("navigation", { name: crumbLabel });
}

describe("PageNotFoundCrumbs (AC-SFX-014)", () => {
  beforeEach(() => {
    nav.pathname = `/w/W/projects/${MISSING_ID}`;
  });

  it("links the workspace and shows the section in English", () => {
    renderCrumbs("en");
    const trail = trailIn("en");
    const projects = copyTranslator(OWNER_NAV_COPY_NAMESPACE, "en")("projects");
    expect(within(trail).getByRole("link", { name: "Studio Rina" })).toHaveAttribute(
      "href",
      "/w/W",
    );
    expect(within(trail).getByText(projects)).toBeInTheDocument();
  });

  it("shows the section label in Indonesian", () => {
    renderCrumbs("id");
    expect(within(trailIn("id")).getByText("Proyek")).toBeInTheDocument();
  });

  it("does not show the requested id", () => {
    renderCrumbs("en");
    expect(trailIn("en").textContent).not.toContain(MISSING_ID);
  });
});
