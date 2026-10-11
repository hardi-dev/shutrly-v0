import { useTranslations } from "next-intl";

import { ListCardItem } from "@/ui/patterns/list-card-item/list-card-item";
import { IconButton } from "@/ui/primitives/icon-button/icon-button";
import { StatusChip } from "@/ui/primitives/status-chip/status-chip";

import { PROVIDER_TITLE_MESSAGE_KEY } from "../source-copy/source-copy.copy";
import { SourceRowActions } from "../source-row-actions/source-row-actions";
import { SOURCE_ROW_COPY_NAMESPACE } from "./source-row.copy";
import type { PhotoSourceRowProps } from "./source-row.types";

export function PhotoSourceRow({
  source,
  isLast,
  workspaceId,
  actions,
  onRename,
  onDelete,
}: Readonly<PhotoSourceRowProps>) {
  const t = useTranslations(SOURCE_ROW_COPY_NAMESPACE);
  function handleRename(): void {
    onRename?.(source);
  }

  function handleDelete(): void {
    onDelete?.(source);
  }

  const trailingActions =
    actions && workspaceId && onRename && onDelete ? (
      <SourceRowActions
        workspaceId={workspaceId}
        source={source}
        onRename={handleRename}
        onDelete={handleDelete}
        setActiveAction={actions.setActive}
      />
    ) : (
      <IconButton
        icon="more-horizontal"
        size="sm"
        aria-label={t("rowActions", { name: source.displayName })}
      />
    );

  return (
    <ListCardItem
      icon="hard-drive"
      title={source.displayName}
      meta={t(PROVIDER_TITLE_MESSAGE_KEY[source.provider])}
      isLast={isLast}
      trailing={
        <>
          <StatusChip
            tone={source.isActive ? "success" : "neutral"}
            label={source.isActive ? t("active") : t("inactive")}
          />
          {trailingActions}
        </>
      }
    />
  );
}
