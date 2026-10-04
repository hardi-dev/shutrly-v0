import type { AssignableMember } from "@/features/booking/application/ports/team-member-repository/team-member-repository.port";
import type { SessionInput } from "@/features/booking/domain/session/session.types";
import type { TeamPick } from "@/features/booking/domain/session-assignment/session-assignment.types";

/** A session as the create form keeps it: its fields and the members picked for it. */
export type SessionWithTeam = SessionInput & { readonly team?: readonly TeamPick[] };

export interface SessionDialogProps {
  readonly isOpen: boolean;
  readonly onOpenChange: (isOpen: boolean) => void;
  /** The session being edited, or null when adding. */
  readonly session: SessionWithTeam | null;
  readonly onSave: (session: SessionWithTeam) => void;
  /** Overrides the create-form description, e.g. on the detail page. */
  readonly description?: string;
  /** Active members the Owner can pick for the session; without it the dialog has no team field. */
  readonly members?: readonly AssignableMember[];
}

export interface SessionDraft {
  readonly name: string;
  readonly date: string;
  readonly startTime: string | null;
  readonly endTime: string | null;
  readonly location: string;
  readonly team: readonly TeamPick[];
}

export type SessionDraftErrors = Readonly<
  Partial<Record<Exclude<keyof SessionDraft, "team">, string>>
>;
