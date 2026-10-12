import { readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import type { OwnerNavTranslator } from "../owner-nav/owner-nav.types";
import { staticOwnerTrail } from "./owner-trail";

// Only the route's existence matters here, so the translator returns the key itself.
const keyT = ((key: string) => key) as OwnerNavTranslator;

const WORKSPACE_ROOT = fileURLToPath(
  new URL("../../../../app/(owner)/w/[workspaceId]", import.meta.url),
);

// `[section]` renders the *Segera hadir* screens; the catch-all slot names those sections (ADR-026).
const CATCH_ALL_PAGES = new Set(["[section]"]);

/** Lists the route of every `page.tsx` below a folder, without route groups such as `(list)` (ADR-026). @param root - the folder to walk @param prefix - the folders walked so far, relative to root @param skip - folder names to ignore at the top level only @returns the routes, e.g. `projects/[projectId]`; the root is `""` */
function listPageRoutes(
  root: string,
  prefix: readonly string[] = [],
  skip: string[] = [],
): string[] {
  const entries = readdirSync(join(root, ...prefix), { withFileTypes: true });
  const isPage = entries.some((entry) => entry.isFile() && entry.name === "page.tsx");
  const here = isPage ? [prefix.filter((name) => !name.startsWith("(")).join("/")] : [];
  const nested = entries
    .filter((entry) => entry.isDirectory() && !skip.includes(entry.name))
    .flatMap((entry) => listPageRoutes(root, [...prefix, entry.name]));
  return [...here, ...nested];
}

const SLOT_ROOT = join(WORKSPACE_ROOT, "@crumbs");
const pageRoutes = listPageRoutes(WORKSPACE_ROOT, [], ["@crumbs"]);
const slotRoutes = listPageRoutes(SLOT_ROOT).filter((route) => !route.includes("[..."));

const isDynamic = (segment: string) => segment.startsWith("[");
const segmentsOf = (route: string) => (route === "" ? [] : route.split("/"));
const parentOf = (route: string) => segmentsOf(route).slice(0, -1).join("/");

/** The routes whose segment list has a dynamic segment, keyed by the folder that holds it: `projects` for `projects/[projectId]`. @returns the parent routes that hold a dynamic slot segment */
function dynamicParents(routes: readonly string[]): Set<string> {
  const parents = new Set<string>();
  for (const route of routes) {
    const segments = segmentsOf(route);
    segments.forEach((segment, index) => {
      if (isDynamic(segment)) parents.add(segments.slice(0, index).join("/"));
    });
  }
  return parents;
}

describe("owner route coverage for the breadcrumb slot (F-23, ADR-026)", () => {
  it("AC-CRUMB-004…006 every Owner page has a slot page or a trail the catch-all names", () => {
    const slotExact = new Set(slotRoutes);
    const parentsWithDynamicSlot = dynamicParents(slotRoutes);
    const failures: string[] = [];
    for (const route of pageRoutes) {
      if (slotExact.has(route) || CATCH_ALL_PAGES.has(route)) continue;
      const segments = segmentsOf(route);
      if (segments.some(isDynamic)) {
        failures.push(`${route}: dynamic page without a slot page at the same path`);
      } else if (parentsWithDynamicSlot.has(parentOf(route))) {
        failures.push(`${route}: static sibling of a dynamic slot segment, needs a mirror`);
      } else if (staticOwnerTrail(segments, "workspace", "Workspace", keyT) === null) {
        failures.push(`${route}: the catch-all cannot name this page`);
      }
    }
    expect(failures).toEqual([]);
  });

  it("every slot page belongs to a real Owner page, so no mirror is stale", () => {
    const pages = new Set(pageRoutes);
    const stale = slotRoutes.filter((route) => !pages.has(route));
    expect(stale).toEqual([]);
  });
});
