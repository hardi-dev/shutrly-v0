import { describe, expect, it } from "vitest";

import { setupStepHref } from "./setup-step-href";

describe("setupStepHref", () => {
  it("AC-SETUP-005 opens Services with Add service for step 1", () => {
    expect(setupStepHref("ws-1", { kind: "addService" })).toBe("/w/ws-1/services?add=service");
  });

  it("AC-SETUP-010 opens the only active service's page", () => {
    expect(setupStepHref("ws-1", { kind: "service", serviceId: "svc-1" })).toBe(
      "/w/ws-1/services/svc-1",
    );
  });

  it("AC-SETUP-011 opens the services list with several active services", () => {
    expect(setupStepHref("ws-1", { kind: "services" })).toBe("/w/ws-1/services");
  });

  it("AC-SETUP-012 opens New project", () => {
    expect(setupStepHref("ws-1", { kind: "newProject" })).toBe("/w/ws-1/projects/new");
  });

  it("AC-SETUP-014 opens Settings", () => {
    expect(setupStepHref("ws-1", { kind: "settings" })).toBe("/w/ws-1/settings");
  });
});
