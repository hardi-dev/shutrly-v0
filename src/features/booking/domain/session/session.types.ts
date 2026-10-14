export interface SessionRecordShape {
  readonly id: string;
  readonly name: string;
  readonly date: string;
  readonly startTime: string | null;
  readonly endTime: string | null;
  readonly location: string | null;
  readonly createdAt: string;
}
export interface ShownSession {
  readonly session: SessionRecordShape;
  readonly extraCount: number;
  readonly isPast: boolean;
}
export type NextSessionLabel =
  | { readonly kind: "NONE" }
  | { readonly kind: "TODAY" }
  | { readonly kind: "TODAY_AT"; readonly time: string }
  | { readonly kind: "DATE"; readonly date: string; readonly time: string | null };

export interface SessionInput {
  readonly name: string;
  readonly date: string;
  readonly startTime: string | null;
  readonly endTime: string | null;
  readonly location: string | null;
}
