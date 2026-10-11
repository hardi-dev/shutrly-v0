/* eslint-disable no-restricted-syntax -- table cells capture their row record */
import { useTranslations } from "next-intl";

import { isSocialUrl, socialLinkLabel } from "@/features/booking/domain/social-link/social-link";
import { formatWhatsappNumber } from "@/features/booking/domain/whatsapp-number/whatsapp-number";
import { DataTable } from "@/ui/patterns/data-table/data-table";
import { SectionCard } from "@/ui/patterns/section-card/section-card";
import { Avatar } from "@/ui/primitives/avatar/avatar";
import { CountBadge } from "@/ui/primitives/count-badge/count-badge";

import { CLIENT_COUNT_MESSAGE_KEY, PLATFORM_MESSAGE_KEY } from "../client-copy/client-copy.copy";
import type { ClientTranslate } from "../client-copy/client-copy.types";
import { clientInitials } from "../client-initials/client-initials";
import { ClientRowActions } from "../client-row-actions/client-row-actions";
import { CLIENTS_TABLE_COPY_NAMESPACE } from "./clients-table.copy";
import type { ClientsTableProps } from "./clients-table.types";

function clientColumns(t: ClientTranslate) {
  return [
    { id: "name", label: t("columnClient") },
    { id: "whatsapp", label: t("columnWhatsapp"), width: 184 },
    { id: "social", label: t("columnSocial"), width: 240 },
    { id: "actions", "aria-label": t("columnActions"), width: 32 },
  ] as const;
}

/** Renders the desktop client table inside its owning Section Card. */
export function ClientsTable({
  status,
  count,
  rows,
  emptyState,
  search,
  onRowAction,
  onArchive,
  onRestore,
  onDelete,
}: Readonly<ClientsTableProps>) {
  const t = useTranslations(CLIENTS_TABLE_COPY_NAMESPACE);
  const description = t(CLIENT_COUNT_MESSAGE_KEY[status], { count });
  return (
    <SectionCard title={t("listTitle")} description={description} actions={search} content="bleed">
      {rows.length === 0 ? (
        <div className="p-(--space-4)">{emptyState}</div>
      ) : (
        <DataTable
          label={t("listTitle")}
          columns={clientColumns(t)}
          rows={rows}
          renderCell={(row, columnId) =>
            renderCell(t, row, columnId, { status, onRowAction, onArchive, onRestore, onDelete })
          }
          onRowAction={onRowAction}
        />
      )}
    </SectionCard>
  );
}

function renderCell(
  t: ClientTranslate,
  row: ClientsTableProps["rows"][number],
  columnId: string,
  actions: Pick<
    ClientsTableProps,
    "status" | "onRowAction" | "onArchive" | "onRestore" | "onDelete"
  >,
): ReactNode {
  if (columnId === "name") return <ClientNameCell name={row.name} />;
  if (columnId === "whatsapp") return <span>{whatsappLabel(t, row.whatsappNumber)}</span>;
  if (columnId === "social") return <SocialLinksCell t={t} links={row.socialLinks} />;
  if (actions.onRowAction && actions.onArchive && actions.onRestore && actions.onDelete)
    return (
      <ClientRowActions
        client={row}
        status={actions.status}
        onEdit={() => actions.onRowAction?.(row)}
        onArchive={() => actions.onArchive?.(row)}
        onRestore={() => actions.onRestore?.(row)}
        onDelete={() => actions.onDelete?.(row)}
      />
    );
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
  t,
  links,
}: Readonly<{ t: ClientTranslate; links: ClientsTableProps["rows"][number]["socialLinks"] }>) {
  const first = links.at(0);
  if (!first)
    return <span className="text-(--color-semantic-text-muted)">{t("noSocialLinks")}</span>;
  const label = `${t(PLATFORM_MESSAGE_KEY[first.platform])} · ${socialLinkLabel(first)}`;
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

function whatsappLabel(t: ClientTranslate, number: string | null): string {
  return number ? formatWhatsappNumber(number) : t("noWhatsapp");
}
/* eslint-enable no-restricted-syntax -- end row cell callbacks */
import type { ReactNode } from "react";
