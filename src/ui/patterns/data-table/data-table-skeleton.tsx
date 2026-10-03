"use client";

import { Cell, Column, Row, Table, TableBody, TableHeader } from "react-aria-components";

import { cn } from "@/ui/cn/cn";

import { DATA_TABLE_HEADER_CLASS } from "./data-table";
import type { DataTableColumn, DataTableSkeletonProps, SkeletonRow } from "./data-table.types";

/** Renders C27's loading rows with its column header intact. */
export function DataTableSkeleton({ label, columns, rowCount }: Readonly<DataTableSkeletonProps>) {
  const rows = Array.from({ length: rowCount }, createSkeletonRow);

  return (
    <Table aria-label={label} aria-busy className="w-full">
      <TableHeader columns={columns} className={DATA_TABLE_HEADER_CLASS}>
        {renderSkeletonColumn}
      </TableHeader>
      <TableBody items={rows}>{createSkeletonRowRenderer(columns)}</TableBody>
    </Table>
  );
}

function renderSkeletonColumn(column: DataTableColumn) {
  return (
    <Column
      key={column.id}
      id={column.id}
      aria-label={column["aria-label"]}
      textValue={column.label ?? column["aria-label"]}
      style={column.width === undefined ? undefined : { width: column.width }}
      className={cn(
        "px-(--component-table-row-padding-x) py-(--component-table-header-padding-y) text-left text-(length:--font-size-overline) font-bold tracking-(--font-letter-spacing-overline)",
        column.width === undefined ? "flex-1" : "shrink-0",
      )}
    >
      {column.label ?? <span className="sr-only">{column["aria-label"]}</span>}
    </Column>
  );
}

function createSkeletonRowRenderer(columns: readonly DataTableColumn[]) {
  return function renderSkeletonRow(row: SkeletonRow) {
    return (
      <Row
        id={row.id}
        columns={columns}
        data-testid="data-table-skeleton-row"
        className="border-b border-(--component-table-row-border) last:border-b-0"
      >
        {renderSkeletonCell}
      </Row>
    );
  };
}

function renderSkeletonCell(column: DataTableColumn) {
  return (
    <Cell
      key={column.id}
      style={column.width === undefined ? undefined : { width: column.width }}
      className="px-(--component-table-row-padding-x) py-(--component-table-row-padding-y)"
    >
      <span className="block h-(--space-3) rounded-(--radius-sm) bg-(--component-table-skeleton)" />
    </Cell>
  );
}

function createSkeletonRow(_: unknown, index: number): SkeletonRow {
  return { id: `skeleton-${String(index)}` };
}
