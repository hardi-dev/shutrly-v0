export interface MultiSelectOption {
  readonly id: string;
  readonly label: string;
}

export interface MultiSelectCreateAction {
  readonly label: string;
  readonly onPress: () => void;
}

export interface MultiSelectProps {
  readonly label: string;
  readonly placeholder: string;
  readonly options: readonly MultiSelectOption[];
  readonly selectedIds: readonly string[];
  readonly onChange: (ids: string[]) => void;
  readonly isDisabled?: boolean;
  /** Helper text under the trigger; replaced by `errorMessage` while there is one. */
  readonly description?: string;
  readonly errorMessage?: string;
  /** Overline label above the options inside the open menu (`tim-form-anggota-peran-baru`). */
  readonly groupLabel?: string;
  /** A row under the options that starts creating a new option (`Tambah peran baru`). */
  readonly createAction?: MultiSelectCreateAction;
}

export interface MobileSheetState {
  readonly isOpen: boolean;
  readonly onOpenChange: (isOpen: boolean) => void;
  readonly onCreate: () => void;
}
