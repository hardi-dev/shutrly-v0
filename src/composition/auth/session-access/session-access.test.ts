import { beforeEach, describe, expect, it, vi } from "vitest";

const resolveOwnerAccess = vi.hoisted(() => vi.fn());
const withAuthScope = vi.hoisted(() =>
  vi.fn((work: (scope: unknown) => unknown) =>
    Promise.resolve(work({ meta: { headers: new Headers() } })),
  ),
);

vi.mock("server-only", () => ({}));
vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  // One request in this test: cache once per module load, like React does per request.
  return {
    ...actual,
    cache: <T extends (...args: never[]) => unknown>(fn: T) => {
      let value: ReturnType<T> | undefined;
      return ((...args: Parameters<T>) => (value ??= fn(...args) as ReturnType<T>)) as T;
    },
  };
});
vi.mock("../auth-scope/auth-scope", () => ({ withAuthScope }));
vi.mock("@/features/auth/application/policy/owner-access/owner-access", () => ({
  resolveOwnerAccess,
}));

import { loadSessionAccess } from "./session-access";

beforeEach(() => {
  resolveOwnerAccess.mockResolvedValue({ decision: "OWNER", account: { id: "u1", locale: "id" } });
});

describe("loadSessionAccess", () => {
  it("R-2 reads the session once per request for the owner gate and the locale", async () => {
    const first = await loadSessionAccess();
    const second = await loadSessionAccess();
    expect(second).toBe(first);
    expect(withAuthScope).toHaveBeenCalledTimes(1);
    expect(resolveOwnerAccess).toHaveBeenCalledTimes(1);
  });
});
