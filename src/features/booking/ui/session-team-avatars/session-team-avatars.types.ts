import type { SessionAssignmentRecord } from "@/features/booking/application/ports/project-repository/project-repository.port";

export interface SessionTeamAvatarsProps {
  readonly sessionName: string;
  /** The session's assignments in their stored order. */
  readonly assignments: readonly SessionAssignmentRecord[];
  /** The group is one button that opens *Atur tim*. */
  readonly onOpen: () => void;
}
