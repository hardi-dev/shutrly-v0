"use client";

import type { Key } from "react-aria-components";
import { Cell, Column, Row, Table, TableBody, TableHeader } from "react-aria-components";

import { cn } from "@/ui/cn/cn";

import type { DataTableColumn, DataTableProps, DataTableToolbar } from "./data-table.types";

export const DATA_TABLE_CARD_CLASS =
  "overflow-hidden rounded-(--component-table-radius) border border-(--component-table-border) bg-(--component-table-background)";
export const DATA_TABLE_HEADER_CLASS =
  "bg-(--component-table-header-background) text-(--component-table-header-text)";

/** Renders the token-backed C27 table card with accessible React Aria table semantics. */
export function DataTable<RowData extends { readonly id: string }>({
  label,
  toolbar,
  columns,
  rows,
  renderCell,
  onRowAction,
  emptyState,
  footer,
}: Readonly<DataTableProps<RowData>>) {
  function handleRowAction(key: Key): void {
    const row = rows.find((item) => item.id === String(key));
    if (row) onRowAction?.(row);
  }

  function renderColumn(column: DataTableColumn) {
    return (
      <Column
        key={column.id}
        id={column.id}
        aria-label={column["aria-label"]}
        textValue={column.label ?? column["aria-label"]}
        isRowHeader={column.id === columns[0]?.id}
        style={column.width === undefined ? undefined : { width: column.width }}
        className={getColumnClassName(column)}
      >
        {column.label ?? <span className="sr-only" role="img" aria-label={column["aria-label"]} />}
      </Column>
    );
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
    <section className={DATA_TABLE_CARD_CLASS}>
      <DataTableToolbar toolbar={toolbar} />
      {rows.length === 0 && emptyState ? (
        <div className="space-y-(--space-4) p-(--space-5)">{emptyState}</div>
      ) : (
        <Table aria-label={label} onRowAction={handleRowAction} className="w-full">
          <TableHeader columns={columns} className={DATA_TABLE_HEADER_CLASS}>
            {renderColumn}
          </TableHeader>
          <TableBody items={rows}>{renderRow}</TableBody>
        </Table>
      )}
      {rows.length > 0 && footer ? (
        <footer className="border-t border-(--component-table-border) px-(--component-table-row-padding-x) py-(--space-3)">
          {footer}
        </footer>
      ) : null}
    </section>
  );
}

/** Renders the shared title group for the table toolbar. */
export function DataTableToolbar({ toolbar }: Readonly<{ toolbar: DataTableToolbar }>) {
  return (
    <header className="flex items-center justify-between gap-(--space-4) px-(--component-table-toolbar-padding-x) py-(--component-table-toolbar-padding-y)">
      <div className="min-w-0">
        <h2 className="text-(length:--font-size-subtitle) font-bold text-(--component-table-cell-text-strong)">
          {toolbar.title}
        </h2>
        {toolbar.subtitle ? (
          <p className="text-(length:--font-size-label) text-(--color-semantic-text-muted)">
            {toolbar.subtitle}
          </p>
        ) : null}
      </div>
      {toolbar.actions ? <div className="shrink-0">{toolbar.actions}</div> : null}
    </header>
  );
}

function getColumnClassName(column: DataTableColumn): string {
  return cn(
    "px-(--component-table-row-padding-x) py-(--component-table-header-padding-y) text-left text-(length:--font-size-overline) font-bold tracking-(--letter-spacing-overline)",
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
