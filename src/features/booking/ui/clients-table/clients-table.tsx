/* eslint-disable max-len, no-restricted-syntax -- table cells capture their row record */
import { isSocialUrl, socialLinkLabel } from "@/features/booking/domain/social-link/social-link";
import { formatWhatsappNumber } from "@/features/booking/domain/whatsapp-number/whatsapp-number";
import { DataTable } from "@/ui/patterns/data-table/data-table";
import { SectionCard } from "@/ui/patterns/section-card/section-card";
import { Avatar } from "@/ui/primitives/avatar/avatar";
import { CountBadge } from "@/ui/primitives/count-badge/count-badge";

import { CLIENT_COPY, PLATFORM_COPY } from "../client-copy/client-copy.copy";
import { clientInitials } from "../client-initials/client-initials";
import { ClientRowActions } from "../client-row-actions/client-row-actions";
import type { ClientsTableProps } from "./clients-table.types";

const COLUMNS = [
  { id: "name", label: "KLIEN" },
  { id: "whatsapp", label: "WHATSAPP", width: 184 },
  { id: "social", label: "MEDIA SOSIAL", width: 240 },
  { id: "actions", "aria-label": "Aksi", width: 32 },
] as const;

/** Renders the desktop client table inside its owning Section Card. */
export function ClientsTable({
  status,
  count,
  rows,
  emptyState,
  onRowAction,
  onArchive,
  onRestore,
  onDelete,
}: Readonly<ClientsTableProps>) {
  const description = CLIENT_COPY.count(status, count);
  return (
    <SectionCard title={CLIENT_COPY.listTitle} description={description} content="bleed">
      {rows.length === 0 ? (
        <div className="p-(--space-4)">{emptyState}</div>
      ) : (
        <DataTable
          label={CLIENT_COPY.listTitle}
          columns={COLUMNS}
          rows={rows}
          renderCell={(row, columnId) => renderCell(row, columnId, { status, onRowAction, onArchive, onRestore, onDelete })}
          onRowAction={onRowAction}
        />
      )}
    </SectionCard>
  );
}

function renderCell(row: ClientsTableProps["rows"][number], columnId: string, actions: Pick<ClientsTableProps, "status" | "onRowAction" | "onArchive" | "onRestore" | "onDelete">): ReactNode {
  if (columnId === "name") return <ClientNameCell name={row.name} />;
  if (columnId === "whatsapp") return <span>{whatsappLabel(row.whatsappNumber)}</span>;
  if (columnId === "social") return <SocialLinksCell links={row.socialLinks} />;
  if (actions.onRowAction && actions.onArchive && actions.onRestore && actions.onDelete)
    return <ClientRowActions client={row} status={actions.status} onEdit={() => actions.onRowAction?.(row)} onArchive={() => actions.onArchive?.(row)} onRestore={() => actions.onRestore?.(row)} onDelete={() => actions.onDelete?.(row)} />;
  return <span className="sr-only" />;
}

function ClientNameCell({ name }: Readonly<{ name: string }>) {
  return (
    <span className="flex min-w-0 items-center gap-(--space-3)">
      <Avatar initials={clientInitials(name)} size="md" aria-hidden />
      <span className="truncate font-semibold">{name}</span>
    </span>
  );
}

function SocialLinksCell({
  links,
}: Readonly<{ links: ClientsTableProps["rows"][number]["socialLinks"] }>) {
  const first = links.at(0);
  if (!first)
    return <span className="text-(--color-semantic-text-muted)">{CLIENT_COPY.noSocialLinks}</span>;
  const label = `${PLATFORM_COPY[first.platform]} · ${socialLinkLabel(first)}`;
  return (
    <span className="flex min-w-0 items-center gap-(--space-1-5)">
      {isSocialUrl(first.value) ? (
        <a
          href={first.value}
          target="_blank"
          rel="noopener noreferrer"
          className="truncate hover:underline"
        >
          {label}
        </a>
      ) : (
        <span className="truncate">{label}</span>
      )}
      <CountBadge count={links.length - 1} />
    </span>
  );
}

function whatsappLabel(number: string | null): string {
  return number ? formatWhatsappNumber(number) : CLIENT_COPY.noWhatsapp;
}
/* eslint-enable max-len, no-restricted-syntax -- end row cell callbacks */
import type { ReactNode } from "react";
