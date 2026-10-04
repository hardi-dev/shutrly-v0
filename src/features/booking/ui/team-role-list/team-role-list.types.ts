import type { ReactNode } from "react";

import type { TeamRolesTableProps } from "../team-roles-table/team-roles-table.types";

export interface TeamRoleListProps extends TeamRolesTableProps {
  /** The card's *Tambah* button. */
  readonly action: ReactNode;
}
