/* eslint-disable no-restricted-syntax, @typescript-eslint/no-confusing-void-expression -- row action callbacks are parameterized by each record */
import { useTranslations } from "next-intl";

import { formatWhatsappNumber } from "@/features/booking/domain/whatsapp-number/whatsapp-number";
import { ListCardItem } from "@/ui/patterns/list-card-item/list-card-item";
import { SectionCard } from "@/ui/patterns/section-card/section-card";

import { CLIENT_COUNT_MESSAGE_KEY } from "../client-copy/client-copy.copy";
import { clientInitials } from "../client-initials/client-initials";
import { ClientRowActions } from "../client-row-actions/client-row-actions";
import { CLIENT_LIST_COPY_NAMESPACE } from "./client-list.copy";
import type { ClientListProps } from "./client-list.types";

/** Renders the compact phone-only client list. */
export function ClientList({
  status,
  count,
  rows,
  action,
  emptyState,
  onEdit,
  onArchive,
  onRestore,
  onDelete,
}: Readonly<ClientListProps>) {
  const t = useTranslations(CLIENT_LIST_COPY_NAMESPACE);
  return (
    <SectionCard
      title={t("listTitle")}
      description={t(CLIENT_COUNT_MESSAGE_KEY[status], { count })}
      actions={action}
      content="flush"
    >
      {rows.length === 0 ? (
        <div className="px-(--space-4)">{emptyState}</div>
      ) : (
        <ClientRows
          rows={rows}
          status={status}
          onEdit={onEdit}
          onArchive={onArchive}
          onRestore={onRestore}
          onDelete={onDelete}
        />
      )}
    </SectionCard>
  );
}

function ClientRows({
  rows,
  status,
  onEdit,
  onArchive,
  onRestore,
  onDelete,
}: Readonly<
  Pick<ClientListProps, "rows" | "status" | "onEdit" | "onArchive" | "onRestore" | "onDelete">
>) {
  const t = useTranslations(CLIENT_LIST_COPY_NAMESPACE);
  return (
    <ul aria-label={t("listTitle")}>
      {rows.map((row, index) => (
        <ListCardItem
          key={row.id}
          avatarInitials={clientInitials(row.name)}
          title={row.name}
          meta={row.whatsappNumber ? formatWhatsappNumber(row.whatsappNumber) : t("noWhatsapp")}
          isLast={index === rows.length - 1}
          trailing={
            onEdit && onArchive && onRestore && onDelete ? (
              <ClientRowActions
                client={row}
                status={status}
                onEdit={() => onEdit(row)}
                onArchive={() => onArchive(row)}
                onRestore={() => onRestore(row)}
                onDelete={() => onDelete(row)}
              />
            ) : undefined
          }
        />
      ))}
    </ul>
  );
}
/* eslint-enable no-restricted-syntax, @typescript-eslint/no-confusing-void-expression -- end row action callbacks */
