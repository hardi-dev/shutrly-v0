import type {
  SessionInput,
  SessionRecordShape,
} from "@/features/booking/domain/session/session.types";

export interface SessionsCardProps {
  readonly sessions: readonly SessionInput[];
  readonly isMobile: boolean;
  readonly errorMessage?: string;
  readonly onAdd: (session: SessionInput) => void;
  readonly onUpdate: (index: number, session: SessionInput) => void;
  readonly onRemove: (index: number) => void;
}

export interface SessionRowProps {
  readonly row: SessionRecordShape;
  readonly isLast: boolean;
  readonly onEdit: (index: number) => void;
  readonly onRemove: (index: number) => void;
}
