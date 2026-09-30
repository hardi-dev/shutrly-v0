import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { cn } from "@/ui/cn/cn";
import { Button } from "@/ui/primitives/button/button";
import { TextField } from "@/ui/primitives/text-field/text-field";

import { SectionCard } from "./section-card";
import { SECTION_CARD_STORY_COPY as COPY } from "./section-card.stories.copy";

function ignoreEdit(): void {
  // Story fields are static examples.
}

function Fields() {
  return (
    <>
      <TextField
        label={COPY.nameLabel}
        name="name"
        value={COPY.nameValue}
        onChange={ignoreEdit}
        onBlur={ignoreEdit}
      />
      <TextField
        label={COPY.brandLabel}
        name="brandName"
        value={COPY.brandValue}
        description={COPY.brandHelper}
        isOptional
        onChange={ignoreEdit}
        onBlur={ignoreEdit}
      />
    </>
  );
}

function ListRow({
  title,
  meta,
  isLast,
}: Readonly<{ title: string; meta: string; isLast: boolean }>) {
  return (
    <div
      className={cn(
        "flex h-(--component-list-card-item-height) items-center gap-(--component-list-card-item-gap) px-(--component-list-card-item-padding-x)",
        !isLast && "border-b border-(--component-list-card-item-border)",
      )}
    >
      <span className="flex-1 text-(length:--font-size-body-sm) font-semibold text-(--component-list-card-item-title)">
        {title}
      </span>
      <span className="text-(length:--font-size-caption) text-(--component-list-card-item-meta)">
        {meta}
      </span>
    </div>
  );
}

function TableRow({ cells, isLast }: Readonly<{ cells: readonly string[]; isLast: boolean }>) {
  return (
    <div
      className={cn(
        "grid grid-cols-3 gap-(--component-table-cell-gap) px-(--component-table-row-padding-x) py-(--component-table-row-padding-y) text-(length:--font-size-body-sm) text-(--component-table-cell-text)",
        !isLast && "border-b border-(--component-table-row-border)",
      )}
    >
      {cells.map((cell) => (
        <span key={cell}>{cell}</span>
      ))}
    </div>
  );
}

function TableRows() {
  return (
    <>
      {COPY.tableRows.map((cells, index) => (
        <TableRow key={cells[0]} cells={cells} isLast={index === COPY.tableRows.length - 1} />
      ))}
    </>
  );
}

const meta = {
  title: "Patterns/Section Card",
  component: SectionCard,
  tags: ["autodocs"],
  args: { title: COPY.title, description: COPY.description, children: <Fields /> },
  argTypes: { content: { control: "select", options: ["padded", "flush", "bleed"] } },
  decorators: [
    (Story) => (
      <div className="max-w-(--size-content-narrow) bg-(--color-semantic-surface-canvas) p-(--space-6)">
        <Story />
      </div>
    ),
  ],
  parameters: { designSystemSpec: "docs/design-system/components/section-card.md" },
} satisfies Meta<typeof SectionCard>;

export default meta;

export const Default: StoryObj<typeof meta> = {};

export const HeaderActions: StoryObj<typeof meta> = {
  args: {
    title: COPY.tableTitle,
    description: COPY.tableDescription,
    content: "bleed",
    actions: <Button variant="secondary">{COPY.action}</Button>,
    children: <TableRows />,
  },
};

export const Flush: StoryObj<typeof meta> = {
  args: {
    title: COPY.listTitle,
    description: COPY.listDescription,
    content: "flush",
    children: (
      <>
        {COPY.listRows.map(([title, rowMeta], index) => (
          <ListRow
            key={title}
            title={title}
            meta={rowMeta}
            isLast={index === COPY.listRows.length - 1}
          />
        ))}
      </>
    ),
  },
};

export const NoHeader: StoryObj<typeof meta> = {
  args: {
    title: undefined,
    description: undefined,
    "aria-label": COPY.noHeaderLabel,
    content: "bleed",
    children: <TableRows />,
  },
};
