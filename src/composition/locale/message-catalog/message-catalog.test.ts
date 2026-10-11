import { describe, expect, it } from "vitest";

import { buildCatalog, messagesFor } from "./message-catalog";
import type { CopyModule } from "./message-catalog.types";

const landing: CopyModule = {
  namespace: "landing.hero",
  surface: "landing",
  messages: { en: { title: "Hello" }, id: { title: "Halo" } },
};

const owner: CopyModule = {
  namespace: "owner.projects",
  surface: "owner",
  messages: { en: { title: "Projects" }, id: { title: "Proyek" } },
};

const registry = [landing, owner];

describe("message catalog", () => {
  it("AC-L10N-002 builds the catalog for the requested locale", () => {
    expect(buildCatalog(registry, "id")).toEqual({
      "landing.hero": { title: "Halo" },
      "owner.projects": { title: "Proyek" },
    });
  });

  it("BR-L10N-002 messagesFor(en, [landing]) contains no owner namespace", () => {
    const catalog = messagesFor("en", ["landing"], registry);
    expect(Object.keys(catalog)).toEqual(["landing.hero"]);
    expect(catalog).not.toHaveProperty("owner.projects");
  });

  it("AC-L10N-001 messagesFor returns only the requested locale's strings", () => {
    expect(messagesFor("en", ["landing", "owner"], registry)["owner.projects"]).toEqual({
      title: "Projects",
    });
  });

  it("AC-L10N-001 the catalog is frozen and cannot be changed at runtime", () => {
    const catalog = buildCatalog(registry, "en");
    expect(Object.isFrozen(catalog)).toBe(true);
    expect(Object.isFrozen(catalog["landing.hero"])).toBe(true);
  });
});
