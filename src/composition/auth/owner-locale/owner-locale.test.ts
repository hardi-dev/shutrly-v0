import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  landingOnly: false,
  cookieNames: [] as string[],
  decision: "OWNER",
}));
const resolveOwnerAccess = vi.hoisted(() => vi.fn());

vi.mock("@/composition/app-stage/app-stage", () => ({
  isLandingOnly: vi.fn(() => Promise.resolve(state.landingOnly)),
}));
vi.mock("next/headers", () => ({
  cookies: vi.fn(() =>
    Promise.resolve({ getAll: () => state.cookieNames.map((name) => ({ name, value: "v" })) }),
  ),
  headers: vi.fn(() => Promise.resolve(new Headers())),
}));
vi.mock("../auth-scope/auth-scope", () => ({
  withAuthScope: (work: (scope: unknown) => unknown) =>
    Promise.resolve(work({ meta: { headers: new Headers() } })),
}));
vi.mock("@/features/auth/application/policy/owner-access/owner-access", () => ({
  resolveOwnerAccess,
}));

import { loadSignedInOwnerLocale } from "./owner-locale";

beforeEach(() => {
  state.landingOnly = false;
  state.cookieNames = [];
  state.decision = "OWNER";
  resolveOwnerAccess.mockReset();
  resolveOwnerAccess.mockImplementation(() =>
    Promise.resolve({ decision: state.decision, account: { locale: "id" } }),
  );
});

describe("loadSignedInOwnerLocale", () => {
  it("BR-L10N-001 a signed-in owner gets user.locale on auth and landing screens", async () => {
    state.cookieNames = ["better-auth.session_token"];
    expect(await loadSignedInOwnerLocale()).toBe("id");
  });

  it("BR-L10N-001 a signed-out or restricted session gets no owner locale", async () => {
    state.cookieNames = ["better-auth.session_token"];
    state.decision = "ANONYMOUS";
    expect(await loadSignedInOwnerLocale()).toBeNull();
  });

  it("R-2 no session cookie means no session lookup", async () => {
    expect(await loadSignedInOwnerLocale()).toBeNull();
    expect(resolveOwnerAccess).not.toHaveBeenCalled();
  });

  it("R-2 a landing-only production never touches the session or database", async () => {
    state.landingOnly = true;
    state.cookieNames = ["better-auth.session_token"];
    expect(await loadSignedInOwnerLocale()).toBeNull();
    expect(resolveOwnerAccess).not.toHaveBeenCalled();
  });
});
