import type { ReactNode } from "react";

import type { AssignableMember } from "@/features/booking/application/ports/team-member-repository/team-member-repository.port";
import type { SessionRecordShape } from "@/features/booking/domain/session/session.types";

import type { SessionWithTeam } from "../session-dialog/session-dialog.types";

export interface SessionsCardProps {
  readonly sessions: readonly SessionWithTeam[];
  readonly isMobile: boolean;
  readonly errorMessage?: string;
  /** Active members for each session's team; without it the card has no team field. */
  readonly members?: readonly AssignableMember[];
  readonly onAdd: (session: SessionWithTeam) => void;
  readonly onUpdate: (index: number, session: SessionWithTeam) => void;
  readonly onRemove: (index: number) => void;
}

export interface SessionRowProps {
  readonly row: SessionRecordShape;
  readonly isLast: boolean;
  readonly team: ReactNode;
  readonly onEdit: (index: number) => void;
  readonly onRemove: (index: number) => void;
}
