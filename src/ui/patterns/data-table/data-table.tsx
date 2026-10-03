"use client";

import type { Key } from "react-aria-components";
import { Cell, Column, Row, Table, TableBody, TableHeader } from "react-aria-components";

import { cn } from "@/ui/cn/cn";

import type { DataTableColumn, DataTableProps } from "./data-table.types";

export const DATA_TABLE_HEADER_CLASS =
  "bg-(--component-table-header-background) text-(--component-table-header-text)";

/** Renders C27 table content with accessible React Aria table semantics. */
export function DataTable<RowData extends { readonly id: string }>({
  label,
  columns,
  rows,
  renderCell,
  onRowAction,
}: Readonly<DataTableProps<RowData>>) {
  function handleRowAction(key: Key): void {
    const row = rows.find((item) => item.id === String(key));
    if (row) onRowAction?.(row);
  }

  function renderRow(row: RowData) {
    function renderRowCell(column: DataTableColumn) {
      return (
        <Cell
          key={column.id}
          style={column.width === undefined ? undefined : { width: column.width }}
          className={getCellClassName(column)}
        >
          {renderCell(row, column.id)}
        </Cell>
      );
    }

    return (
      <Row
        id={row.id}
        columns={columns}
        className={getRowClassName(row.id, rows.at(-1)?.id, Boolean(onRowAction))}
      >
        {renderRowCell}
      </Row>
    );
  }

  return (
    <Table aria-label={label} onRowAction={handleRowAction} className="w-full">
      <TableHeader columns={columns} className={DATA_TABLE_HEADER_CLASS}>
        {createColumnRenderer(columns[0]?.id)}
      </TableHeader>
      <TableBody items={rows}>{renderRow}</TableBody>
    </Table>
  );
}

function createColumnRenderer(firstColumnId: string | undefined) {
  return function renderColumn(column: DataTableColumn) {
    return (
      <Column
        key={column.id}
        id={column.id}
        aria-label={column["aria-label"]}
        textValue={column.label ?? column["aria-label"]}
        isRowHeader={column.id === firstColumnId}
        style={column.width === undefined ? undefined : { width: column.width }}
        className={getColumnClassName(column)}
      >
        {column.label ?? <span className="sr-only">{column["aria-label"]}</span>}
      </Column>
    );
  };
}

function getColumnClassName(column: DataTableColumn): string {
  return cn(
    "px-(--component-table-row-padding-x) py-(--component-table-header-padding-y) text-left text-(length:--font-size-overline) font-bold tracking-(--font-letter-spacing-overline)",
    column.width === undefined ? "flex-1" : "shrink-0",
  );
}

function getCellClassName(column: DataTableColumn): string {
  return cn(
    "px-(--component-table-row-padding-x) py-(--component-table-row-padding-y) text-(length:--font-size-body-sm) text-(--component-table-cell-text)",
    column.width === undefined ? "flex-1" : "shrink-0",
  );
}

function getRowClassName(id: string, lastId: string | undefined, isActionable: boolean): string {
  return cn(
    id !== lastId && "border-b border-(--component-table-row-border)",
    isActionable && "cursor-pointer data-hovered:bg-(--component-table-row-background-hover)",
  );
}
