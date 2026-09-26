import type { AnyPgColumn } from "drizzle-orm/pg-core";

export interface TenantKeyColumns {
  workspaceId: AnyPgColumn;
  id: AnyPgColumn;
}

export interface TenantRefColumns {
  workspaceId: AnyPgColumn;
  column: AnyPgColumn;
}
