"use client";

import { Cell, Column, Row, Table, TableBody, TableHeader } from "react-aria-components";

import { cn } from "@/ui/cn/cn";

import { DATA_TABLE_CARD_CLASS, DATA_TABLE_HEADER_CLASS, DataTableToolbar } from "./data-table";
import type { DataTableColumn, DataTableSkeletonProps } from "./data-table.types";

interface SkeletonRow {
  readonly id: string;
}

/** Renders C27's token-backed table loading state with its column header intact. */
export function DataTableSkeleton({
  toolbar,
  columns,
  rowCount,
}: Readonly<DataTableSkeletonProps>) {
  const rows = Array.from({ length: rowCount }, createSkeletonRow);

  function renderColumn(column: DataTableColumn) {
    return (
      <Column
        key={column.id}
        id={column.id}
        aria-label={column["aria-label"]}
        textValue={column.label ?? column["aria-label"]}
        style={column.width === undefined ? undefined : { width: column.width }}
        className={cn(
          "px-(--component-table-row-padding-x) py-(--component-table-header-padding-y) text-left text-(length:--font-size-overline) font-bold tracking-(--letter-spacing-overline)",
          column.width === undefined ? "flex-1" : "shrink-0",
        )}
      >
        {column.label ?? <span className="sr-only" role="img" aria-label={column["aria-label"]} />}
      </Column>
    );
  }

  function renderRow(row: SkeletonRow) {
    function renderCell(column: DataTableColumn) {
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

    return (
      <Row
        id={row.id}
        columns={columns}
        data-testid="data-table-skeleton-row"
        className="border-b border-(--component-table-row-border) last:border-b-0"
      >
        {renderCell}
      </Row>
    );
  }

  return (
    <section className={DATA_TABLE_CARD_CLASS}>
      <DataTableToolbar toolbar={{ title: toolbar.title }} />
      <Table aria-label={toolbar.title} aria-busy className="w-full">
        <TableHeader columns={columns} className={DATA_TABLE_HEADER_CLASS}>
          {renderColumn}
        </TableHeader>
        <TableBody items={rows}>{renderRow}</TableBody>
      </Table>
    </section>
  );
}

function createSkeletonRow(_: unknown, index: number): SkeletonRow {
  return { id: `skeleton-${index}` };
}
