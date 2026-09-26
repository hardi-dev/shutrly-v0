import { fakeAuthDeps } from "@tests/support/auth/fake-auth-deps";
import { uniqueEmail } from "@tests/support/auth/unique";
import { describe, expect, it } from "vitest";

import { normaliseEmail } from "@/features/auth/domain/credentials/credentials";

import { logoutOwner } from "./logout-owner";

describe("logoutOwner", () => {
  it("AC-AUTH-012 ends only the current session", async () => {
    const { deps, backend } = fakeAuthDeps();
    const email = normaliseEmail(uniqueEmail());
    const seed = { name: "Alya", email, password: "p", status: "ACTIVE", emailVerified: true };
    const userId = backend.seedUser({ ...seed, status: "ACTIVE" });
    const deviceA = backend.signIn(userId);
    const deviceB = backend.signIn(userId);
    await logoutOwner(deps, deviceA);
    expect(await deps.identity.getSessionUserId(deviceA)).toBeNull();
    expect(await deps.identity.getSessionUserId(deviceB)).toBe(userId);
  });
});
