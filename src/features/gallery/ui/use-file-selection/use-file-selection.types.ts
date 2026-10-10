export interface FileSelection {
  readonly isSelecting: boolean;
  readonly selectedIds: ReadonlySet<string>;
  readonly toggle: (id: string, isSelected: boolean) => void;
  readonly startSelecting: () => void;
  readonly stopSelecting: () => void;
}
