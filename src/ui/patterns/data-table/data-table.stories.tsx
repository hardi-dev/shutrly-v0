import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { EmptyState } from "@/ui/patterns/empty-state/empty-state";
import { SectionCard } from "@/ui/patterns/section-card/section-card";
import { Input } from "@/ui/primitives/input/input";

import { DataTable } from "./data-table";
import { DATA_TABLE_STORY_COPY as COPY } from "./data-table.stories.copy";
import type { DataTableProps } from "./data-table.types";
import { DataTableSkeleton } from "./data-table-skeleton";

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
    <SectionCard
      title={COPY.title}
      description={COPY.subtitle}
      actions={<Search />}
      content="bleed"
    >
      <DataTable label={COPY.label} columns={columns} rows={COPY.rows} renderCell={renderCell} />
    </SectionCard>
  ),
};

export const Empty: StoryObj<typeof meta> = {
  render: () => (
    <SectionCard title={COPY.title} description={COPY.zeroActive}>
      <EmptyState
        placement="in-card"
        icon="users"
        title={COPY.empty}
        body={COPY.emptyDescription}
      />
    </SectionCard>
  ),
};

export const Loading: StoryObj<typeof meta> = {
  render: () => (
    <SectionCard title={COPY.title} content="bleed">
      <DataTableSkeleton label={COPY.label} columns={columns} rowCount={5} />
    </SectionCard>
  ),
};
