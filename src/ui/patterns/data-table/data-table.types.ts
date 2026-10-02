import type { ReactNode } from "react";

import type { FieldNameProps } from "@/ui/primitives/text-field/text-field.types";

/** A column is named by its header text or, for empty visual headers, its accessible label. */
export type DataTableColumn = FieldNameProps & {
  readonly id: string;
  /** Fixed width in pixels from an approved frame; omit for the column that fills the row. */
  readonly width?: number;
};

export interface DataTableProps<Row extends { readonly id: string }> {
  readonly label: string;
  readonly columns: readonly DataTableColumn[];
  readonly rows: readonly Row[];
  readonly renderCell: (row: Row, columnId: string) => ReactNode;
  readonly onRowAction?: (row: Row) => void;
}

export interface DataTableSkeletonProps {
  readonly label: string;
  readonly columns: readonly DataTableColumn[];
  readonly rowCount: number;
}

export interface SkeletonRow {
  readonly id: string;
}
