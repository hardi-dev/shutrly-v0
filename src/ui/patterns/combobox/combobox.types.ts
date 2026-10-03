export interface ComboboxItemText {
  readonly label: string;
  readonly description?: string;
}

export interface ComboboxProps<T extends { readonly id: string }> {
  readonly label: string;
  readonly placeholder: string;
  readonly items: readonly T[];
  readonly selectedId: string | null;
  readonly inputValue: string;
  readonly onInputChange: (text: string) => void;
  readonly onSelect: (id: string) => void;
  readonly renderItem: (item: T) => ComboboxItemText;
  /** The overline above the matches, e.g. *KLIEN · 3 COCOK*. */
  readonly groupLabel: string;
  /** The last row, e.g. *Tambah klien baru “Rin”*; it needs `onCreate`. */
  readonly createLabel?: string;
  readonly onCreate?: (query: string) => void;
  readonly description?: string;
  readonly errorMessage?: string;
  readonly isLoading?: boolean;
  readonly isDisabled?: boolean;
}
