export interface SessionRowActionsProps {
  readonly name: string;
  readonly onEdit: () => void;
  readonly onDelete: () => void;
  /** When set, Hapus sesi is disabled and shows this hint (the last session of a booked project). */
  readonly deleteHint?: string;
  /** The detail page names the actions *Ubah sesi* / *Hapus sesi*; the create form says *Ubah* / *Hapus*. */
  readonly isDetail?: boolean;
}
