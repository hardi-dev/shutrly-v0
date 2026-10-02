import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Input } from "@/ui/primitives/input/input";

import { DataTable } from "./data-table";
import { DataTableSkeleton } from "./data-table-skeleton";
import { DATA_TABLE_STORY_COPY as COPY } from "./data-table.stories.copy";
import type { DataTableProps } from "./data-table.types";

const columns = [
  { id: "name", label: COPY.columns.name },
  { id: "whatsapp", label: COPY.columns.whatsapp, width: 184 },
  { id: "actions", "aria-label": COPY.columns.actions, width: 32 },
] as const;

function renderCell(row: (typeof COPY.rows)[number], columnId: string) {
  if (columnId === "actions") return null;
  return row[columnId === "name" ? "name" : "whatsapp"];
}

function Search() {
  return <Input variant="search" aria-label={COPY.searchLabel} iconLeading="search" />;
}

const meta = {
  title: "Patterns/DataTable",
  component: DataTable,
  tags: ["autodocs"],
  args: {
    label: COPY.label,
    toolbar: { title: COPY.title, subtitle: COPY.subtitle, actions: <Search /> },
    columns,
    rows: COPY.rows,
    renderCell,
  },
  parameters: { designSystemSpec: "docs/design-system/components/table.md" },
  decorators: [
    (Story) => (
      <div className="max-w-(--size-content-narrow) bg-(--color-semantic-surface-canvas) p-(--space-6)">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<DataTableProps<(typeof COPY.rows)[number]>>;

export default meta;

export const Populated: StoryObj<typeof meta> = {
  render: () => (
    <DataTable
      label={COPY.label}
      toolbar={{ title: COPY.title, subtitle: COPY.subtitle, actions: <Search /> }}
      columns={columns}
      rows={COPY.rows}
      renderCell={renderCell}
    />
  ),
};

export const Empty: StoryObj<typeof meta> = {
  render: () => (
    <DataTable
      label={COPY.label}
      toolbar={{ title: COPY.title, subtitle: "0 klien aktif" }}
      columns={columns}
      rows={[]}
      renderCell={renderCell}
      emptyState={<p>{COPY.empty}</p>}
    />
  ),
};

export const Loading: StoryObj<typeof meta> = {
  render: () => (
    <DataTableSkeleton toolbar={{ title: COPY.title }} columns={columns} rowCount={5} />
  ),
};
