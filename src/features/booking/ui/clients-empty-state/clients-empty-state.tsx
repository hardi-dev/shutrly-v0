import { useTranslations } from "next-intl";

import { EmptyState } from "@/ui/patterns/empty-state/empty-state";

import { CLIENTS_EMPTY_STATE_COPY_NAMESPACE } from "./clients-empty-state.copy";
import type { ClientsEmptyStateProps } from "./clients-empty-state.types";

/** Renders the external empty state for the selected client status. */
export function ClientsEmptyState({ status, action }: Readonly<ClientsEmptyStateProps>) {
  const t = useTranslations(CLIENTS_EMPTY_STATE_COPY_NAMESPACE);
  const isActive = status === "ACTIVE";
  return (
    <EmptyState
      placement="in-card"
      icon={isActive ? "users" : "archive"}
      title={isActive ? t("emptyActiveTitle") : t("emptyArchivedTitle")}
      body={isActive ? t("emptyActiveBody") : t("emptyArchivedBody")}
      action={action}
    />
  );
}
