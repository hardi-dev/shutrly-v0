import type { SessionInput } from "@/features/booking/domain/session/session.types";

export interface SessionDialogProps {
  readonly isOpen: boolean;
  readonly onOpenChange: (isOpen: boolean) => void;
  /** The session being edited, or null when adding. */
  readonly session: SessionInput | null;
  readonly onSave: (session: SessionInput) => void;
  /** Overrides the create-form description, e.g. on the detail page. */
  readonly description?: string;
}

export interface SessionDraft {
  readonly name: string;
  readonly date: string;
  readonly startTime: string | null;
  readonly endTime: string | null;
  readonly location: string;
}

export type SessionDraftErrors = Readonly<Partial<Record<keyof SessionDraft, string>>>;
