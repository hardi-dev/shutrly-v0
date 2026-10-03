export interface SessionTeamAction {
  readonly label: string;
  readonly icon: "user-plus" | "users";
  readonly onSelect: () => void;
}

export interface SessionRowActionsProps {
  readonly name: string;
  readonly onEdit: () => void;
  readonly onDelete: () => void;
  /** When set, Hapus sesi is disabled and shows this hint (the last session of a booked project). */
  readonly deleteHint?: string;
  /** The detail page names the actions *Ubah sesi* / *Hapus sesi*; the create form says *Ubah* / *Hapus*. */
  readonly isDetail?: boolean;
  /** *Tambah tim* or *Atur tim*, the first item; a divider then precedes *Hapus sesi* (F-08). */
  readonly teamAction?: SessionTeamAction;
}
