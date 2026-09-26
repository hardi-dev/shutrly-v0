import { readdirSync, readFileSync } from "node:fs";
import { join, sep } from "node:path";

import { Pool } from "@neondatabase/serverless";
import { describe, expect, it } from "vitest";

import { createDb } from "./client";

const URL = "postgresql://user:pw@localhost:5432/app";

describe("createDb", () => {
  it("AC-FND-005 returns a Drizzle db over a new Pool on every call", async () => {
    const first = createDb(URL);
    const second = createDb(URL);
    expect(first.pool).toBeInstanceOf(Pool);
    expect(first.pool).not.toBe(second.pool);
    expect(typeof first.db.select).toBe("function");
    await Promise.all([first.pool.end(), second.pool.end()]);
  });

  it("AC-FND-005 constructs a Pool only in adapters/db/client/client.ts", () => {
    const offenders = readdirSync("src", { recursive: true, encoding: "utf8" })
      .filter((file) => /\.tsx?$/.test(file) && !/\.test\.tsx?$/.test(file))
      .filter((file) => readFileSync(join("src", file), "utf8").includes("new Pool("))
      .map((file) => file.split(sep).join("/"));
    expect(offenders).toEqual(["adapters/db/client/client.ts"]);
  });
});
