import { formatWhatsappNumber } from "@/features/booking/domain/whatsapp-number/whatsapp-number";
import { ListCardItem } from "@/ui/patterns/list-card-item/list-card-item";
import { SectionCard } from "@/ui/patterns/section-card/section-card";

import { CLIENT_COPY } from "../client-copy/client-copy.copy";
import { clientInitials } from "../client-initials/client-initials";
import type { ClientListProps } from "./client-list.types";

/** Renders the compact phone-only client list. */
export function ClientList({ status, count, rows, action, emptyState }: Readonly<ClientListProps>) {
  return (
    <SectionCard
      title={CLIENT_COPY.listTitle}
      description={CLIENT_COPY.count(status, count)}
      actions={action}
      content="flush"
    >
      {rows.length === 0 ? (
        <div className="px-(--space-4)">{emptyState}</div>
      ) : (
        <ClientRows rows={rows} />
      )}
    </SectionCard>
  );
}

function ClientRows({ rows }: Readonly<Pick<ClientListProps, "rows">>) {
  return (
    <ul aria-label={CLIENT_COPY.listTitle}>
      {rows.map((row, index) => (
        <ListCardItem
          key={row.id}
          avatarInitials={clientInitials(row.name)}
          title={row.name}
          meta={
            row.whatsappNumber ? formatWhatsappNumber(row.whatsappNumber) : CLIENT_COPY.noWhatsapp
          }
          isLast={index === rows.length - 1}
        />
      ))}
    </ul>
  );
}
