/* eslint-disable @typescript-eslint/require-await -- the fakes mirror the asynchronous repository ports */

import type { TeamRoleRepositoryPort } from "@/features/booking/application/ports/team-role-repository/team-role-repository.port";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

interface StoredRole {
  readonly id: string;
  readonly workspaceId: string;
  readonly name: string;
}

export class FakeTeamRoleRepository implements TeamRoleRepositoryPort {
  readonly rows: StoredRole[] = [];

  async seedDefaults(context: WorkspaceContext, names: readonly string[]) {
    for (const name of names) {
      const taken = this.rows.some(
        (row) =>
          row.workspaceId === context.workspaceId && row.name.toLowerCase() === name.toLowerCase(),
      );
      if (!taken)
        this.rows.push({ id: crypto.randomUUID(), workspaceId: context.workspaceId, name });
    }
  }
}

/* eslint-enable @typescript-eslint/require-await -- restore lint coverage after async fake methods */
