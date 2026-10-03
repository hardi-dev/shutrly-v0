import "server-only";

import { createDrizzleClientRepository } from "@/adapters/db/client-repository/drizzle-client-repository";

import { withRequestDb } from "../../request-db/request-db";
import type { ClientScope } from "./client-scope.types";

export function withClientScope<T>(work: (scope: ClientScope) => Promise<T>): Promise<T> {
  return withRequestDb((db) => work({ clients: createDrizzleClientRepository(db) }));
}
