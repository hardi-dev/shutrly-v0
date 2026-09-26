import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../request-context/request-context", () => ({ getRequestContext: vi.fn() }));
vi.mock("@/adapters/db/client/client", () => ({ createDb: vi.fn() }));

import { createDb } from "@/adapters/db/client/client";

import { getRequestContext } from "../request-context/request-context";
import { withRequestDb } from "./request-db";

const events: string[] = [];
const endPromise = Promise.resolve();
const end = vi.fn(() => {
  events.push("end");
  return endPromise;
});
const waitUntil = vi.fn();
const fakeDb = { fake: true };
const rc = {
  env: { DATABASE_URL: "postgresql://user:pw@db.example/app", APP_STAGE: "test" as const },
  waitUntil,
  ip: "203.0.113.7",
  requestId: "r1",
  headers: new Headers(),
};

beforeEach(() => {
  vi.clearAllMocks();
  events.length = 0;
  vi.mocked(getRequestContext).mockResolvedValue(rc);
  vi.mocked(createDb).mockReturnValue({ db: fakeDb, pool: { end } } as never);
});

describe("withRequestDb", () => {
  it("AC-FND-005 opens a db from the request env and returns the result", async () => {
    const result = await withRequestDb((db, context) => {
      expect(db).toBe(fakeDb);
      expect(context).toBe(rc);
      return Promise.resolve(42);
    });
    expect(result).toBe(42);
    expect(createDb).toHaveBeenCalledWith(rc.env.DATABASE_URL);
  });

  it("AC-FND-005 ends the pool after the work and hands it to waitUntil", async () => {
    await withRequestDb(() => {
      events.push("work");
      return Promise.resolve();
    });
    expect(events).toEqual(["work", "end"]);
    expect(waitUntil).toHaveBeenCalledWith(endPromise);
  });

  it("AC-FND-005 still ends the pool when the work throws", async () => {
    await expect(withRequestDb(() => Promise.reject(new Error("query failed")))).rejects.toThrow(
      "query failed",
    );
    expect(end).toHaveBeenCalledTimes(1);
    expect(waitUntil).toHaveBeenCalledTimes(1);
  });
});
