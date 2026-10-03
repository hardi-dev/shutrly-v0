import { sql } from "drizzle-orm";
import {
  check,
  foreignKey,
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import {
  auditColumns,
  idColumn,
  tenantKey,
  tenantRef,
  workspaceIdColumn,
} from "../_conventions/tenant";
import { user } from "../auth/auth";
import { workspace } from "../workspace/workspace";
import { projectSession } from "./project";

// F-08 team (BR-TEAM-004…006, ADR-003; technical-design D-2, D-3).
export const teamRole = pgTable(
  "team_role",
  {
    id: idColumn(),
    workspaceId: workspaceIdColumn().references(() => workspace.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    updatedBy: text("updated_by").references(() => user.id, { onDelete: "set null" }),
    ...auditColumns(),
  },
  (t) => [
    tenantKey(t),
    uniqueIndex("team_role_workspace_name_uq").on(t.workspaceId, sql`lower(${t.name})`),
    check(
      "team_role_name_ck",
      sql`char_length(${t.name}) between 1 and 50 and ${t.name} = btrim(${t.name})`,
    ),
  ],
);

export const teamMember = pgTable(
  "team_member",
  {
    id: idColumn(),
    workspaceId: workspaceIdColumn().references(() => workspace.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    whatsappNumber: text("whatsapp_number").notNull(),
    email: text("email"),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    updatedBy: text("updated_by").references(() => user.id, { onDelete: "set null" }),
    ...auditColumns(),
  },
  (t) => [
    tenantKey(t),
    uniqueIndex("team_member_workspace_whatsapp_uq").on(t.workspaceId, t.whatsappNumber),
    index("team_member_workspace_list_idx").on(
      t.workspaceId,
      sql`lower(${t.name})`,
      t.createdAt,
      t.id,
    ),
    check(
      "team_member_name_ck",
      sql`char_length(${t.name}) between 1 and 100 and ${t.name} = btrim(${t.name})`,
    ),
    check(
      "team_member_whatsapp_number_ck",
      sql`${t.whatsappNumber} ~ '^[1-9][0-9]{9,14}$' and ${t.whatsappNumber} !~ '^620'`,
    ),
    check(
      "team_member_email_ck",
      sql`${t.email} is null or (char_length(${t.email}) <= 254 and ${t.email} = lower(${t.email}))`,
    ),
  ],
);

export const teamMemberRole = pgTable(
  "team_member_role",
  {
    workspaceId: workspaceIdColumn(),
    memberId: uuid("member_id").notNull(),
    roleId: uuid("role_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.memberId, t.roleId] }),
    tenantRef(
      { workspaceId: t.workspaceId, column: t.memberId },
      { workspaceId: teamMember.workspaceId, id: teamMember.id },
    ).onDelete("cascade"),
    tenantRef(
      { workspaceId: t.workspaceId, column: t.roleId },
      { workspaceId: teamRole.workspaceId, id: teamRole.id },
    ).onDelete("restrict"),
    index("team_member_role_role_ix").on(t.workspaceId, t.roleId),
  ],
);

export const sessionAssignment = pgTable(
  "session_assignment",
  {
    id: idColumn(),
    workspaceId: workspaceIdColumn(),
    projectId: uuid("project_id").notNull(),
    sessionId: uuid("session_id").notNull(),
    memberId: uuid("member_id").notNull(),
    roleId: uuid("role_id").notNull(),
    updatedBy: text("updated_by").references(() => user.id, { onDelete: "set null" }),
    ...auditColumns(),
  },
  (t) => [
    // D-3: the session must belong to this project and workspace; deleting it deletes the assignment.
    foreignKey({
      columns: [t.workspaceId, t.projectId, t.sessionId],
      foreignColumns: [projectSession.workspaceId, projectSession.projectId, projectSession.id],
    }).onDelete("cascade"),
    tenantRef(
      { workspaceId: t.workspaceId, column: t.memberId },
      { workspaceId: teamMember.workspaceId, id: teamMember.id },
    ).onDelete("restrict"),
    tenantRef(
      { workspaceId: t.workspaceId, column: t.roleId },
      { workspaceId: teamRole.workspaceId, id: teamRole.id },
    ).onDelete("restrict"),
    unique("session_assignment_member_uq").on(t.sessionId, t.memberId),
    index("session_assignment_session_ix").on(t.sessionId, t.createdAt, t.id),
    index("session_assignment_project_ix").on(t.workspaceId, t.projectId),
    index("session_assignment_member_ix").on(t.workspaceId, t.memberId),
    index("session_assignment_role_ix").on(t.workspaceId, t.roleId),
  ],
);
