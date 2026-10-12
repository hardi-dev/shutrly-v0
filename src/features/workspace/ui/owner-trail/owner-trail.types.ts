import type { BreadcrumbItem } from "@/ui/patterns/page-header/page-header.types";

export type OwnerSection =
  | "projects"
  | "clients"
  | "team"
  | "services"
  | "message-templates"
  | "photo-sources"
  | "settings"
  | "invoices"
  | "search"
  | "notifications";

export interface OwnerTrailInput {
  readonly workspaceId: string;
  readonly workspaceName: string;
  readonly ancestors: readonly BreadcrumbItem[];
  readonly current: string;
}
