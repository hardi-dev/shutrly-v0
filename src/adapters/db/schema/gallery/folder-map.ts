import { pgTable, text, unique, uuid } from "drizzle-orm/pg-core";

import {
  auditColumns,
  idColumn,
  tenantKey,
  tenantRef,
  workspaceIdColumn,
} from "../_conventions/tenant";
import { projectItem } from "../booking/project";
import { gallerySource } from "./gallery";

// F-20 delivery folder mapping (Owner 2026-10-07): one subfolder of a linked Drive folder → one
// selection item of the project's package; an item may have several subfolders. A subfolder's
// photos are finished files for that item; unmapped folders stay proofs.
export const galleryFolderMap = pgTable(
  "gallery_folder_map",
  {
    id: idColumn(),
    workspaceId: workspaceIdColumn(),
    gallerySourceId: uuid("gallery_source_id").notNull(),
    folderPath: text("folder_path").notNull(),
    projectItemId: uuid("project_item_id").notNull(),
    ...auditColumns(),
  },
  (t) => [
    tenantKey(t),
    tenantRef(
      { workspaceId: t.workspaceId, column: t.gallerySourceId },
      { workspaceId: gallerySource.workspaceId, id: gallerySource.id },
    ).onDelete("cascade"),
    tenantRef(
      { workspaceId: t.workspaceId, column: t.projectItemId },
      { workspaceId: projectItem.workspaceId, id: projectItem.id },
    ).onDelete("cascade"),
    unique("gallery_folder_map_path_uq").on(t.gallerySourceId, t.folderPath),
  ],
);
