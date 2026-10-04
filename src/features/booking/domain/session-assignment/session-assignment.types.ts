/** Identifies one assignment by its session and member, for the Penugasan form's choices. */
export interface AssignmentRef {
  readonly sessionId: string;
  readonly memberId: string;
}

/** The avatars shown on a session row and how many more there are (design.md decision 3). */
export interface AvatarGroup<T> {
  readonly shown: readonly T[];
  readonly overflow: number;
}

/** A member and the role they take on a session, before it is saved (AC-TEAM-028). */
export interface TeamPick {
  readonly memberId: string;
  readonly roleId: string;
}
