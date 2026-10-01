import Link from "next/link";

import { templateGroupOf } from "@/features/communications/domain/template-type/template-type";
import { cn } from "@/ui/cn/cn";
import { SectionCard } from "@/ui/patterns/section-card/section-card";
import { Icon } from "@/ui/primitives/icon/icon";

import { TEMPLATE_COPY, TEMPLATE_GROUP_COPY } from "../template-copy/template-copy.copy";
import { messageTemplateHref } from "../template-sub-pages/template-sub-pages";
import type {
  TemplateGroupCardProps,
  TemplateListRowProps,
  TemplateListScreenProps,
} from "./template-list-screen.types";

const TEMPLATE_ICONS = {
  GALLERY_SHARE: "image",
  SELECTION_REMINDER: "hourglass",
  FINAL_DELIVERY: "package-check",
  INVOICE_SHARE: "receipt",
  PAYMENT_REMINDER: "wallet",
} as const;

// Two-line row on list-card tokens (design.md › Rule notes: a candidate library variant).
const ROW = [
  "flex items-center gap-(--component-list-card-item-gap) px-(--component-list-card-item-padding-x) py-(--space-3)",
  "outline-none hover:bg-(--color-semantic-surface-subtle)",
  "focus-visible:shadow-[inset_0_0_0_2px_var(--color-semantic-focus-ring)]",
];

/**
 * Template pesan list (design v3 L9tLQ / m3crcH): Gallery and Invoice Section Cards with one
 * row per template, linking to its editor (AC-MSG-004).
 * @param props - the route workspace and the template types it has
 * @returns the list
 */
export function TemplateListScreen({ workspaceId, types }: Readonly<TemplateListScreenProps>) {
  return (
    <div className="mx-auto flex w-full max-w-(--size-content-narrow) flex-col gap-(--space-6) md:gap-(--component-panel-app-content-gap)">
      <TemplateGroupCard group="GALLERY" workspaceId={workspaceId} types={types} />
      <TemplateGroupCard group="INVOICE" workspaceId={workspaceId} types={types} />
    </div>
  );
}

function TemplateGroupCard({ group, workspaceId, types }: Readonly<TemplateGroupCardProps>) {
  const rows = types.filter((type) => templateGroupOf(type) === group);
  const copy = TEMPLATE_GROUP_COPY[group];
  return (
    <SectionCard title={copy.title} description={copy.description} content="flush">
      <ul className="flex flex-col">
        {rows.map((type, index) => (
          <TemplateListRow
            key={type}
            type={type}
            href={messageTemplateHref(workspaceId, type)}
            isLast={index === rows.length - 1}
          />
        ))}
      </ul>
    </SectionCard>
  );
}

function TemplateListRow({ type, href, isLast }: Readonly<TemplateListRowProps>) {
  const copy = TEMPLATE_COPY[type];
  return (
    <li>
      <Link
        href={href}
        className={cn(ROW, !isLast && "border-b border-(--component-list-card-item-border)")}
      >
        <span className="flex size-(--space-9) shrink-0 items-center justify-center rounded-(--radius-md) bg-(--component-list-card-item-icon-background) text-(--component-list-card-item-icon)">
          <Icon name={TEMPLATE_ICONS[type]} />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-(--space-0-5)">
          <span className="text-(length:--font-size-body) font-semibold text-(--component-list-card-item-title)">
            {copy.label}
          </span>
          <span className="text-(length:--font-size-body-sm) text-(--component-list-card-item-meta)">
            {copy.purpose}
          </span>
        </span>
        <Icon name="chevron-right" size="sm" className="text-(--component-list-card-item-meta)" />
      </Link>
    </li>
  );
}
