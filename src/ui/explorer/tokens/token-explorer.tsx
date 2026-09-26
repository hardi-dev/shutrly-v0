"use client";

import { type ChangeEvent, useMemo, useState } from "react";

import { TOKEN_EXPLORER_COPY } from "./token-explorer.copy";
import type {
  TokenExplorerControlsProps,
  TokenExplorerProps,
  TokenRecord,
  TokenTableProps,
} from "./token-explorer.types";

export function TokenExplorer({ records }: Readonly<TokenExplorerProps>) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const categories = useMemo(() => getCategories(records), [records]);
  const filteredRecords = useMemo(
    () => filterRecords(records, search, category),
    [category, records, search],
  );

  function handleSearchChange(event: ChangeEvent<HTMLInputElement>) {
    setSearch(event.target.value);
  }

  function handleCategoryChange(event: ChangeEvent<HTMLSelectElement>) {
    setCategory(event.target.value);
  }

  return (
    <section className="flex min-h-screen flex-col gap-(--space-6) bg-(--color-semantic-surface-canvas) p-(--space-6) text-(--color-semantic-text-primary)">
      <TokenExplorerControls
        categories={categories}
        category={category}
        onCategoryChange={handleCategoryChange}
        onSearchChange={handleSearchChange}
        search={search}
      />
      <TokenTable records={filteredRecords} />
    </section>
  );
}

function TokenExplorerControls({
  categories,
  category,
  onCategoryChange,
  onSearchChange,
  search,
}: Readonly<TokenExplorerControlsProps>) {
  return (
    <div className="flex flex-wrap items-end gap-(--space-4)">
      <label className="flex min-w-64 flex-1 flex-col gap-(--space-1-5) text-(length:--font-size-label) font-semibold">
        {TOKEN_EXPLORER_COPY.searchLabel}
        <input
          type="search"
          value={search}
          onChange={onSearchChange}
          aria-label={TOKEN_EXPLORER_COPY.searchLabel}
          className="h-(--component-input-height) rounded-(--component-input-radius) border border-(--component-input-border) bg-(--component-input-background) px-(--component-input-padding-x) text-(length:--font-size-body) font-normal outline-none focus:border-(--component-input-border-focus)"
        />
      </label>
      <label className="flex min-w-48 flex-col gap-(--space-1-5) text-(length:--font-size-label) font-semibold">
        {TOKEN_EXPLORER_COPY.category}
        <select
          value={category}
          onChange={onCategoryChange}
          aria-label={TOKEN_EXPLORER_COPY.category}
          className="h-(--component-input-height) rounded-(--component-input-radius) border border-(--component-input-border) bg-(--component-input-background) px-(--component-input-padding-x) text-(length:--font-size-body) font-normal outline-none focus:border-(--component-input-border-focus)"
        >
          <option value="">{TOKEN_EXPLORER_COPY.allCategories}</option>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

function TokenTable({ records }: Readonly<TokenTableProps>) {
  return (
    <div className="overflow-x-auto rounded-(--radius-md) border border-(--color-semantic-border-default) bg-(--color-semantic-surface-panel)">
      {records.length > 0 ? <TokenTableRows records={records} /> : <EmptyState />}
    </div>
  );
}

function TokenTableRows({ records }: Readonly<TokenTableProps>) {
  return (
    <table className="w-full border-collapse text-left text-(length:--font-size-body-sm)">
      <thead className="bg-(--color-semantic-surface-subtle) text-(--color-semantic-text-secondary)">
        <tr>
          <th className="p-(--space-3) font-semibold">{TOKEN_EXPLORER_COPY.token}</th>
          <th className="p-(--space-3) font-semibold">{TOKEN_EXPLORER_COPY.type}</th>
          <th className="p-(--space-3) font-semibold">{TOKEN_EXPLORER_COPY.light}</th>
          <th className="p-(--space-3) font-semibold">{TOKEN_EXPLORER_COPY.dark}</th>
          <th className="p-(--space-3) font-semibold">{TOKEN_EXPLORER_COPY.cssVariable}</th>
          <th className="p-(--space-3) font-semibold">{TOKEN_EXPLORER_COPY.alias}</th>
        </tr>
      </thead>
      <tbody>
        {records.map((record) => (
          <TokenRow key={record.path} record={record} />
        ))}
      </tbody>
    </table>
  );
}

function EmptyState() {
  return (
    <p className="p-(--space-6) text-(--color-semantic-text-secondary)">
      {TOKEN_EXPLORER_COPY.empty}
    </p>
  );
}

function TokenRow({ record }: Readonly<{ record: TokenRecord }>) {
  return (
    <tr className="border-t border-(--color-semantic-border-subtle)">
      <td className="p-(--space-3) font-medium">
        <div className="flex items-center gap-(--space-2)">
          {record.type === "color" && typeof record.light === "string" ? (
            <span
              aria-hidden="true"
              className="size-4 rounded-(--radius-xs) border border-(--color-semantic-border-default)"
              style={{ backgroundColor: record.light }}
            />
          ) : null}
          {record.path}
        </div>
      </td>
      <td className="p-(--space-3) text-(--color-semantic-text-secondary)">
        {record.type ?? TOKEN_EXPLORER_COPY.notAvailable}
      </td>
      <td className="p-(--space-3) font-mono">{formatValue(record.light)}</td>
      <td className="p-(--space-3) font-mono">{formatValue(record.dark)}</td>
      <td className="p-(--space-3) font-mono text-(--color-semantic-text-secondary)">
        {record.cssName}
      </td>
      <td className="p-(--space-3) font-mono text-(--color-semantic-text-secondary)">
        {record.alias ?? TOKEN_EXPLORER_COPY.notAvailable}
      </td>
    </tr>
  );
}

function getCategories(records: readonly TokenRecord[]) {
  return records
    .map((record) => record.path.split(".")[0])
    .filter((category, index, values) => values.indexOf(category) === index)
    .sort((left, right) => left.localeCompare(right));
}

function filterRecords(records: readonly TokenRecord[], search: string, category: string) {
  const normalizedSearch = search.trim().toLowerCase();
  return records.filter((record) => {
    const matchesCategory = category === "" || record.path.startsWith(`${category}.`);
    const searchable = [record.path, record.cssName, record.alias, record.description]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return matchesCategory && (normalizedSearch === "" || searchable.includes(normalizedSearch));
  });
}

function formatValue(value: number | string | undefined) {
  return value ?? TOKEN_EXPLORER_COPY.notAvailable;
}
